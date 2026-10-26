"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { findNearbyStations } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { ALL_STATIONS, distanceMeters, kakaoOption, type StationOption } from "./stations";

const pending = new Map<string, Promise<StationOption[]>>();
const resolved = new Map<string, StationOption[]>();

function cacheKey(center: LatLng) {
  return `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`;
}

/**
 * Stations within 5 km, nearest first. Cached per ~10 m grid cell.
 * Falls back to the bundled index when Kakao is unreachable or rejects the key (e.g. on a domain not
 * registered in the Kakao console); that result isn't cached so Kakao is retried next time.
 */
export function loadNearbyStations(center: LatLng): Promise<StationOption[]> {
  const key = cacheKey(center);
  const cached = pending.get(key);
  if (cached) return cached;
  const request = loadKakaoMaps()
    .then(() => findNearbyStations(center))
    .then((found) => {
      const stations = found.map(kakaoOption);
      resolved.set(key, stations);
      return stations;
    })
    .catch((error: unknown) => {
      pending.delete(key);
      const offline = nearbyStationsOffline(center);
      if (offline.length) return offline;
      throw error;
    });
  pending.set(key, request);
  return request;
}

const OFFLINE_RADIUS_METERS = 5000;

/**
 * Same as `loadNearbyStations` but from the bundled station index, with no network request.
 * Used while the native app runs in the background, where Android throttles WebView requests.
 */
export function nearbyStationsOffline(center: LatLng): StationOption[] {
  return ALL_STATIONS.map((station) => ({ station, distance: distanceMeters(center, station.center) }))
    .filter(({ distance }) => distance <= OFFLINE_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance)
    .map(({ station }) => station);
}

export function useNearbyStations(center: LatLng | null): StationOption[] | null {
  const key = center ? cacheKey(center) : null;
  const [loaded, setLoaded] = useState<{ key: string; stations: StationOption[] } | null>(null);

  useEffect(() => {
    if (!center || !key || resolved.has(key)) return;
    let alive = true;
    loadNearbyStations(center)
      .then((stations) => {
        if (alive) setLoaded({ key, stations });
      })
      .catch(() => {
        if (alive) setLoaded({ key, stations: [] });
      });
    return () => {
      alive = false;
    };
  }, [center, key]);

  if (!key) return null;
  return resolved.get(key) ?? (loaded?.key === key ? loaded.stations : null);
}
