"use client";

import { loadKakaoMaps } from "../kakao-sdk";
import { searchNearby, type KakaoStation, type NearbyPlace, type NearbyQuery } from "../kakao-places";
import { loadLineStations, stationLines, stopsAlongLine } from "./subwayLine";
import type { StationOption } from "./stations";

export const AT_STATION_METERS = 300;
const MAX_STOPS = 3;

export type JumpCandidate = {
  line: string;
  stops: number;
  toward: KakaoStation;
  stop: KakaoStation;
  place: NearbyPlace;
};

const jumpCache = new Map<string, Promise<JumpCandidate[]>>();

function storeAt(stop: KakaoStation, query: NearbyQuery) {
  return searchNearby({ ...query, radius: AT_STATION_METERS }, stop.center)
    .then((found) => found[0] ?? null)
    .catch(() => null);
}

export function findStoreJumps(
  station: StationOption,
  cacheKey: string,
  query: NearbyQuery,
): Promise<JumpCandidate[]> {
  const cached = jumpCache.get(cacheKey);
  if (cached) return cached;
  const request = loadKakaoMaps()
    .then(() =>
      Promise.all(
        stationLines(station).map((line) =>
          loadLineStations(station, line).then((stations) =>
            stopsAlongLine(station, stations, MAX_STOPS).map((path) => ({ line, path })),
          ),
        ),
      ),
    )
    .then(async (routes) => {
      const paths = routes.flat();
      for (let index = 0; index < MAX_STOPS; index += 1) {
        const level = paths.filter(({ path }) => path[index]);
        const found = await Promise.all(
          level.map(async ({ line, path }) => {
            const place = await storeAt(path[index], query);
            return place
              ? { line, stops: index + 1, toward: path[0], stop: path[index], place }
              : null;
          }),
        );
        const candidates = found.filter((candidate) => candidate !== null);
        if (candidates.length > 0) return candidates;
      }
      return [];
    })
    .catch(() => {
      jumpCache.delete(cacheKey);
      return [];
    });
  jumpCache.set(cacheKey, request);
  return request;
}
