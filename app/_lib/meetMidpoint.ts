import { findRoute, networkStationId, type Route } from "./routeFinder";
import { ALL_STATIONS, type StationOption } from "./stations";

/** Major Seoul hubs used as meeting-midpoint candidates. */
export const MEET_HUBS_KO = [
  "홍대입구역",
  "성수역",
  "을지로3가역",
  "강남역",
  "잠실역",
  "사당역",
  "건대입구역",
  "여의도역",
  "합정역",
  "왕십리역",
  "신논현역",
  "용산역",
  "서울역",
  "교대역",
  "신촌역",
  "이태원역",
  "명동역",
  "충무로역",
  "선릉역",
  "고속터미널역",
  "신림역",
  "노원역",
  "영등포역",
  "신도림역",
  "동대문역사문화공원역",
  "시청역",
  "종로3가역",
  "약수역",
  "이수역",
  "잠실새내역",
] as const;

export type MidpointCandidate = {
  station: StationOption;
  minutesA: number;
  minutesB: number;
  totalMinutes: number;
  gapMinutes: number;
  routeA: Route;
  routeB: Route;
  score: number;
};

export function stationByKoName(ko: string): StationOption | null {
  const bare = ko.replace(/역$/, "").trim();
  const withYeok = `${bare}역`;
  return (
    ALL_STATIONS.find((station) => station.name.ko === withYeok || station.name.ko === ko) ??
    ALL_STATIONS.find((station) => station.name.ko.replace(/역$/, "") === bare) ??
    null
  );
}

function netId(station: StationOption): number | null {
  return networkStationId(station.name.ko, station.center);
}

/**
 * Rank hub stations by fair travel time from A and B.
 * Prefer low total time, then low |timeA − timeB|.
 */
export function findOptimalMidpoints(
  startA: StationOption,
  startB: StationOption,
  limit = 3,
): MidpointCandidate[] {
  const idA = netId(startA);
  const idB = netId(startB);
  if (idA === null || idB === null) return [];
  if (idA === idB) return [];

  const exclude = new Set([startA.name.ko.replace(/역$/, ""), startB.name.ko.replace(/역$/, "")]);
  const scored: MidpointCandidate[] = [];

  for (const hubKo of MEET_HUBS_KO) {
    const bare = hubKo.replace(/역$/, "");
    if (exclude.has(bare)) continue;
    const hub = stationByKoName(hubKo);
    if (!hub) continue;
    const hubId = netId(hub);
    if (hubId === null || hubId === idA || hubId === idB) continue;

    const routeA = findRoute(idA, hubId, "fastest");
    const routeB = findRoute(idB, hubId, "fastest");
    if (!routeA || !routeB) continue;

    const minutesA = Math.max(1, Math.round(routeA.seconds / 60));
    const minutesB = Math.max(1, Math.round(routeB.seconds / 60));
    const totalMinutes = minutesA + minutesB;
    const gapMinutes = Math.abs(minutesA - minutesB);
    // Balance fairness vs total trip length.
    const score = totalMinutes + gapMinutes * 1.35;

    scored.push({
      station: hub,
      minutesA,
      minutesB,
      totalMinutes,
      gapMinutes,
      routeA,
      routeB,
      score,
    });
  }

  scored.sort((a, b) => a.score - b.score || a.gapMinutes - b.gapMinutes || a.totalMinutes - b.totalMinutes);
  return scored.slice(0, limit);
}
