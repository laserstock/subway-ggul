"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { searchStations } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { ALL_STATIONS, distanceMeters, kakaoOption, normalize, type StationOption } from "./stations";

const DEBOUNCE_MS = 90;
const MAX_RESULTS = 10;
/** Single-syllable queries ("광") match too much nationwide; keep them to the Seoul area. */
const SHORT_QUERY_RADIUS = 20000;
const SEOUL_CITY_HALL: LatLng = { lat: 37.5663, lng: 126.9779 };

const results = new Map<string, StationOption[]>();
const inflight = new Map<string, Promise<StationOption[]>>();

function searchKey(query: string) {
  return normalize(query).replace(/역$/, "");
}

function haystack(station: StationOption) {
  return [...Object.values(station.name), ...Object.values(station.lines), ...(station.aliases ?? [])].map(normalize);
}

function rank(station: StationOption, q: string) {
  const name = normalize(station.name.ko).replace(/역$/, "");
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (haystack(station).some((value) => value.startsWith(q))) return 2;
  if (haystack(station).some((value) => value.includes(q))) return 3;
  return 4;
}

function matches(station: StationOption, q: string) {
  return haystack(station).some((value) => value.includes(q));
}

function fetchRemote(key: string, near: LatLng | null): Promise<StationOption[]> {
  const cached = inflight.get(key);
  if (cached) return cached;
  const bias = [...key].length <= 1 ? { center: near ?? SEOUL_CITY_HALL, radius: SHORT_QUERY_RADIUS } : undefined;
  const request = loadKakaoMaps()
    .then(() => searchStations(key, bias))
    .then((found) => {
      const stations = found.map(kakaoOption);
      results.set(key, stations);
      return stations;
    });
  request.catch(() => inflight.delete(key));
  inflight.set(key, request);
  return request;
}

/** Best results available right now: exact cache hit, else a narrowed shorter query's results. */
function instantResults(key: string): { stations: StationOption[]; exact: boolean } {
  const exact = results.get(key);
  if (exact) return { stations: exact, exact: true };
  const chars = [...key];
  for (let length = chars.length - 1; length > 0; length -= 1) {
    const prefix = results.get(chars.slice(0, length).join(""));
    if (prefix) return { stations: prefix.filter((station) => matches(station, key)), exact: false };
  }
  return { stations: [], exact: false };
}

export function rankStations(stations: StationOption[], query: string, near: LatLng | null) {
  const q = searchKey(query);
  return [...stations].sort(
    (a, b) =>
      rank(a, q) - rank(b, q) ||
      (near ? distanceMeters(near, a.center) - distanceMeters(near, b.center) : 0),
  );
}

/**
 * Instant local + cached matches on every keystroke, refined by a debounced Kakao search.
 * Previous results stay on screen while a request is in flight, so the list never blanks out.
 */
export function useStationSuggestions(query: string, near: LatLng | null) {
  const key = searchKey(query);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [, setVersion] = useState(0);
  const search = useEffectEvent((target: string) => fetchRemote(target, near));

  useEffect(() => {
    if (!key || results.has(key)) return;
    let alive = true;
    const timer = window.setTimeout(() => {
      search(key).then(
        () => setVersion((version) => version + 1),
        () => {
          if (alive) setFailedKey(key);
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [key]);

  if (!key) return { stations: [] as StationOption[], pending: false };

  const local = ALL_STATIONS.filter((station) => matches(station, key));
  const { stations: remote, exact } = instantResults(key);
  const seen = new Set<string>();
  const merged = [...local, ...remote].filter((station) => {
    if (seen.has(station.key)) return false;
    seen.add(station.key);
    return true;
  });
  return {
    stations: rankStations(merged, query, near).slice(0, MAX_RESULTS),
    pending: !exact && failedKey !== key,
  };
}
