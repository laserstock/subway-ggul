"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { loadKakaoMaps } from "../kakao-sdk";
import { searchNearby } from "../kakao-places";
import { elevatorTip, restroomTip, type ElevatorTip } from "./arrivalTips";
import { loadExits, nearestExit, walkMinutes, walkUrl } from "./exits";
import { findRoute, networkStationId, type Route } from "./routeFinder";
import type { StationOption } from "./stations";
import type { StationToilet } from "./stationToilets";
import { sameLine } from "./subwayLine";

export type RouteSummary = {
  /** Fastest route from the bundled network (official Seoul Metro times); null outside its coverage. */
  route: Route | null;
  /** Car nearest the platform elevator at the destination, for the direction the route arrives from. */
  elevator: ElevatorTip | null;
  /** Seoul Metro restroom data for the boarding and alighting lines. */
  fromToilet: StationToilet | null;
  toToilet: StationToilet | null;
};

export function routeSummary(from: StationOption, to: StationOption): RouteSummary {
  const a = networkStationId(from.name.ko, from.center);
  const b = networkStationId(to.name.ko, to.center);
  const route = a !== null && b !== null && a !== b ? findRoute(a, b, "fastest") : null;
  const first = route?.legs[0] ?? null;
  const last = route?.legs[route.legs.length - 1] ?? null;
  const previous = last && last.stations.length >= 2 ? last.stations[last.stations.length - 2] : null;
  const tip = previous ? elevatorTip(to, previous) : null;
  return {
    route,
    elevator: tip && last && sameLine(tip.line, last.line) ? tip : null,
    fromToilet: restroomTip(from, first?.line ?? null),
    toToilet: restroomTip(to, last?.line ?? null),
  };
}

export type NearbyStore = { name: string; exit: string | null; minutes: number; url: string };

/** Starbucks this close to the station counts as "at the station"; farther ones aren't a route tip. */
const STORE_RADIUS = 500;
const storeCache = new Map<string, Promise<NearbyStore | null>>();

function findStarbucks(station: StationOption): Promise<NearbyStore | null> {
  const cached = storeCache.get(station.key);
  if (cached) return cached;
  const request = loadKakaoMaps()
    .then(() =>
      Promise.all([
        searchNearby(
          { kind: "keyword", keyword: "스타벅스", radius: STORE_RADIUS, category: "CE7", brand: true },
          station.center,
        ),
        loadExits(station),
      ]),
    )
    .then(([places, exits]) => {
      const place = [...places].sort((x, y) => x.distance - y.distance)[0];
      if (!place) return null;
      const near = nearestExit(exits, place.position);
      const start: { name: string; position: LatLng } = near
        ? { name: `${station.name.ko} ${near.exit.label}번 출구`, position: near.exit.position }
        : { name: station.name.ko, position: station.center };
      return {
        name: place.name,
        exit: near?.exit.label ?? null,
        minutes: walkMinutes(near ? near.meters : place.distance),
        url: walkUrl(start, { name: place.name, position: place.position }),
      };
    })
    .catch((error: unknown) => {
      storeCache.delete(station.key);
      throw error;
    });
  storeCache.set(station.key, request);
  return request;
}

export type StoreLookup = { status: "loading" } | { status: "done"; store: NearbyStore | null } | { status: "failed" };

/** Nearest Starbucks around a station from Kakao Places, with the closest numbered exit. */
export function useNearestStarbucks(station: StationOption): StoreLookup {
  const [result, setResult] = useState<{ key: string; lookup: StoreLookup } | null>(null);
  useEffect(() => {
    let alive = true;
    findStarbucks(station).then(
      (store) => alive && setResult({ key: station.key, lookup: { status: "done", store } }),
      () => alive && setResult({ key: station.key, lookup: { status: "failed" } }),
    );
    return () => {
      alive = false;
    };
  }, [station]);
  return result?.key === station.key ? result.lookup : { status: "loading" };
}
