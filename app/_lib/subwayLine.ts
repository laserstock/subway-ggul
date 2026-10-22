"use client";

import type { LatLng } from "../KakaoMap";
import { loadKakaoMaps } from "../kakao-sdk";
import { findLineStations, normalizeLine, type KakaoStation } from "../kakao-places";
import { STATION_INDEX } from "./stationIndex";
import { distanceMeters, type Localized, type StationOption } from "./stations";

const MAX_STOP_GAP_METERS = 4000;
const lineCache = new Map<string, Promise<KakaoStation[]>>();

export function lineCacheKey(station: StationOption, line: string) {
  return `${station.key}|${normalizeLine(line)}`;
}

function indexedLineStations(line: string): KakaoStation[] {
  const target = normalizeLine(line);
  return STATION_INDEX.filter((entry) => entry.l.some((candidate) => normalizeLine(candidate) === target)).map(
    (entry) => ({ name: entry.n, lines: [...entry.l], center: { lat: entry.c[0], lng: entry.c[1] } }),
  );
}

/** Stations on `line`, from the station master when it knows the line, else from Kakao. */
export function loadLineStations(station: StationOption, line: string): Promise<KakaoStation[]> {
  const key = lineCacheKey(station, line);
  const cached = lineCache.get(key);
  if (cached) return cached;
  const indexed = indexedLineStations(line);
  if (indexed.length > 1) {
    const request = Promise.resolve(indexed);
    lineCache.set(key, request);
    return request;
  }
  const request = loadKakaoMaps()
    .then(() => findLineStations(line, station.center))
    .catch(() => {
      lineCache.delete(key);
      return [];
    });
  lineCache.set(key, request);
  return request;
}

export function bearingDegrees(from: LatLng, to: LatLng) {
  const rad = Math.PI / 180;
  const y = Math.sin((to.lng - from.lng) * rad) * Math.cos(to.lat * rad);
  const x =
    Math.cos(from.lat * rad) * Math.sin(to.lat * rad) -
    Math.sin(from.lat * rad) * Math.cos(to.lat * rad) * Math.cos((to.lng - from.lng) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
}

export function angleBetween(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function lineNeighbors(station: StationOption, stations: KakaoStation[]): KakaoStation[] {
  const others = stations
    .filter((candidate) => candidate.name !== station.name.ko)
    .map((candidate) => ({
      candidate,
      distance: distanceMeters(station.center, candidate.center),
      bearing: bearingDegrees(station.center, candidate.center),
    }))
    .sort((a, b) => a.distance - b.distance);
  const [first, ...rest] = others;
  if (!first) return [];
  const opposite = rest.find((other) => angleBetween(other.bearing, first.bearing) > 100);
  return opposite ? [first.candidate, opposite.candidate] : [first.candidate];
}

export function stopsAlongLine(
  start: StationOption,
  stations: KakaoStation[],
  maxStops: number,
): KakaoStation[][] {
  return lineNeighbors(start, stations).map((first) => {
    const path = [first];
    let previous = start.center;
    while (path.length < maxStops) {
      const current = path[path.length - 1];
      const heading = bearingDegrees(previous, current.center);
      const visited = new Set([start.name.ko, ...path.map((stop) => stop.name)]);
      const next = stations
        .filter((candidate) => !visited.has(candidate.name))
        .map((candidate) => ({
          candidate,
          distance: distanceMeters(current.center, candidate.center),
          bearing: bearingDegrees(current.center, candidate.center),
        }))
        .filter((option) => option.distance < MAX_STOP_GAP_METERS && angleBetween(option.bearing, heading) < 90)
        .sort((a, b) => a.distance - b.distance)[0];
      if (!next) break;
      previous = current.center;
      path.push(next.candidate);
    }
    return path;
  });
}

export function stationLines(station: StationOption) {
  return station.lines.ko.split(" · ").filter(Boolean);
}

export function sameLine(a: string, b: string) {
  return normalizeLine(a) === normalizeLine(b);
}

export function lineLabel(line: string): Localized {
  return {
    ko: line,
    en: line.replace(/^(\d+)호선$/, "Line $1"),
    zh: line.replace(/^(\d+)호선$/, "$1号线"),
    ja: line.replace(/^(\d+)호선$/, "$1号線"),
  };
}
