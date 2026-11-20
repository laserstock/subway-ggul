import { bareStationName, restroomTip } from "./arrivalTips";
import type { Route, RouteLeg } from "./routeFinder";
import { ALL_STATIONS, serializeStation, type SavedStation, type StationOption } from "./stations";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";
import { routeTransferDoors, splitDoor } from "./transferDoors";

export type AlarmLegKind = "transfer" | "arrival";

/** One target in the multi-leg alarm queue (transfer alight or final destination). */
export type AlarmLeg = {
  station: SavedStation;
  kind: AlarmLegKind;
  line: string;
  /** Korean names from board → target on this leg (inclusive). */
  stations: string[];
  stationIds: number[];
  /** Seconds between consecutive stations[i] → stations[i+1]. */
  hopSeconds: number[];
  /** Correct-direction stations after boarding (bare names). */
  expectedNextStations: string[];
  /** Opposite-direction stations from the boarding stop (bare names). */
  oppositeStations: string[];
  /** Fast-transfer car/door tip for TTS, if known. */
  transferTip: string | null;
  /** "inside" | "outside" for final restroom TTS, else null. */
  restroomGate: "inside" | "outside" | null;
};

function stationOptionByKo(ko: string): StationOption | null {
  const bare = bareStationName(ko);
  return (
    ALL_STATIONS.find((station) => bareStationName(station.name.ko) === bare) ??
    ALL_STATIONS.find((station) => bareStationName(station.name.ko) === bareStationName(ko.replace(/역$/, "") + "역")) ??
    null
  );
}

function hopSecondsForLeg(leg: RouteLeg): number[] {
  const hops = Math.max(1, leg.stations.length - 1);
  const each = leg.seconds / hops;
  return Array.from({ length: hops }, () => Math.max(30, Math.round(each)));
}

/** Stations reachable the wrong way from the leg's boarding stop on the same line. */
function oppositeStationsForLeg(leg: RouteLeg): string[] {
  const start = leg.stationIds[0];
  const next = leg.stationIds[1];
  if (start === undefined || next === undefined) return [];
  const neighbors = new Set<number>();
  for (const [service, a, b] of NETWORK_EDGES) {
    const svc = NETWORK_SERVICES[service];
    if (!svc || svc.express || svc.line !== leg.line) continue;
    if (a === start) neighbors.add(b);
    if (b === start) neighbors.add(a);
  }
  neighbors.delete(next);
  const names: string[] = [];
  const queue: { id: number; depth: number }[] = [...neighbors].map((id) => ({ id, depth: 0 }));
  const seen = new Set<number>([start, next]);
  while (queue.length) {
    const { id, depth } = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const name = NETWORK_STATIONS[id]?.[0];
    if (name) names.push(bareStationName(name));
    if (depth >= 5) continue;
    for (const [service, a, b] of NETWORK_EDGES) {
      const svc = NETWORK_SERVICES[service];
      if (!svc || svc.express || svc.line !== leg.line) continue;
      const other = a === id ? b : b === id ? a : null;
      if (other === null || seen.has(other)) continue;
      queue.push({ id: other, depth: depth + 1 });
    }
  }
  return names;
}

function transferTipText(leg: RouteLeg, next: RouteLeg, transferStation: string): string | null {
  const doors = routeTransferDoors(leg, next, {
    station: transferStation,
    toStation: null,
    walkSeconds: 0,
    waitSeconds: 0,
  });
  if (!doors) return null;
  const alight = splitDoor(doors.alight);
  return `${alight.car}번 칸 ${alight.door}번 문`;
}

/** Build the sequential alarm queue from a `findRoute` result. */
export function buildAlarmLegs(route: Route): AlarmLeg[] {
  const legs: AlarmLeg[] = [];
  route.legs.forEach((leg, index) => {
    const targetKo = leg.stations.at(-1);
    if (!targetKo) return;
    const option = stationOptionByKo(targetKo);
    if (!option) return;
    const isLast = index === route.legs.length - 1;
    const next = route.legs[index + 1];
    const transfer = route.transfers[index];
    const toilet = isLast ? restroomTip(option, leg.line) : null;
    const expected = leg.stations.slice(1).map(bareStationName);
    legs.push({
      station: serializeStation(option),
      kind: isLast ? "arrival" : "transfer",
      line: leg.line,
      stations: [...leg.stations],
      stationIds: [...leg.stationIds],
      hopSeconds: hopSecondsForLeg(leg),
      expectedNextStations: expected,
      oppositeStations: oppositeStationsForLeg(leg),
      transferTip: !isLast && next && transfer ? transferTipText(leg, next, transfer.station) : null,
      restroomGate: toilet?.gate ?? null,
    });
  });
  return legs;
}

export function currentAlarmLeg(legs: AlarmLeg[], legIndex: number): AlarmLeg | null {
  return legs[legIndex] ?? null;
}

/** Final destination of the armed trip (last leg target). */
export function finalAlarmStation(legs: AlarmLeg[]): SavedStation | null {
  return legs.at(-1)?.station ?? legs[0]?.station ?? null;
}

export function remainingStopsOnLeg(leg: AlarmLeg, atBareName: string | null): number {
  if (!atBareName) return Math.max(0, leg.stations.length - 1);
  const index = leg.stations.findIndex((name) => bareStationName(name) === atBareName);
  if (index < 0) return Math.max(0, leg.stations.length - 1);
  return Math.max(0, leg.stations.length - 1 - index);
}

export function etaSecondsOnLeg(leg: AlarmLeg, atBareName: string | null): number {
  if (!atBareName) return leg.hopSeconds.reduce((sum, hop) => sum + hop, 0);
  const index = leg.stations.findIndex((name) => bareStationName(name) === atBareName);
  if (index < 0) return leg.hopSeconds.reduce((sum, hop) => sum + hop, 0);
  return leg.hopSeconds.slice(index).reduce((sum, hop) => sum + hop, 0);
}

/** Remaining stops/seconds from the current leg onward (full trip ETA for the ticker). */
export function remainingRouteProgress(legs: AlarmLeg[], legIndex: number, atBareName: string | null) {
  let remainingStops = 0;
  let etaSeconds = 0;
  for (let index = legIndex; index < legs.length; index += 1) {
    const leg = legs[index];
    if (index === legIndex) {
      remainingStops += remainingStopsOnLeg(leg, atBareName);
      etaSeconds += etaSecondsOnLeg(leg, atBareName);
    } else {
      remainingStops += Math.max(0, leg.stations.length - 1);
      etaSeconds += leg.hopSeconds.reduce((sum, hop) => sum + hop, 0);
    }
  }
  return { remainingStops, etaSeconds };
}
