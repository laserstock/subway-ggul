import { bareStationName, elevatorTip, restroomTip } from "./arrivalTips";
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
  /** Riding time for this leg only (same as `RouteLeg.seconds`). */
  rideSeconds: number;
  /** Seconds between consecutive stations[i] → stations[i+1] (sums to `rideSeconds`). */
  hopSeconds: number[];
  /**
   * Walk + average wait after alighting this leg before the next leg starts.
   * 0 on the final leg. Matches `RouteTransfer.walkSeconds + waitSeconds`.
   */
  afterTransferSeconds: number;
  /** Correct-direction stations after boarding (bare names). */
  expectedNextStations: string[];
  /** Opposite-direction stations from the boarding stop (bare names). */
  oppositeStations: string[];
  /** Stations past this leg's target on the same line (missed-transfer detection). */
  beyondStations: string[];
  /** Fast-transfer car/door tip for TTS / marquee, if known. */
  transferTip: string | null;
  /** Next line after this transfer (null on final leg). */
  nextLine: string | null;
  /** Next-leg toward station name (Korean, with 역) for direction copy. */
  nextToward: string | null;
  /** Short elevator / exit tip at final destination. */
  elevatorTip: string | null;
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
  const base = Math.floor(leg.seconds / hops);
  const rem = leg.seconds - base * hops;
  return Array.from({ length: hops }, (_, index) => Math.max(1, base + (index < rem ? 1 : 0)));
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

/** Stations past the alighting stop continuing on the same line (rider missed the transfer). */
function beyondStationsForLeg(leg: RouteLeg): string[] {
  const target = leg.stationIds.at(-1);
  const prev = leg.stationIds.at(-2);
  if (target === undefined || prev === undefined) return [];
  const names: string[] = [];
  const queue: { id: number; depth: number }[] = [];
  const seen = new Set<number>([target, prev]);
  for (const [service, a, b] of NETWORK_EDGES) {
    const svc = NETWORK_SERVICES[service];
    if (!svc || svc.express || svc.line !== leg.line) continue;
    const other = a === target ? b : b === target ? a : null;
    if (other === null || seen.has(other)) continue;
    queue.push({ id: other, depth: 0 });
  }
  while (queue.length) {
    const { id, depth } = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const name = NETWORK_STATIONS[id]?.[0];
    if (name) names.push(bareStationName(name));
    if (depth >= 4) continue;
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

function transferTipText(leg: RouteLeg, next: RouteLeg, transferStation: string): {
  tip: string;
  nextToward: string;
} | null {
  const doors = routeTransferDoors(leg, next, {
    station: transferStation,
    toStation: null,
    walkSeconds: 0,
    waitSeconds: 0,
  });
  const toward = next.stations[1] ?? next.stations[0] ?? "";
  if (!doors) {
    if (!toward) return null;
    return { tip: `${next.line} ${bareStationName(toward)} 방향`, nextToward: toward };
  }
  const alight = splitDoor(doors.alight);
  const towardLabel = bareStationName(doors.toToward || toward);
  return {
    tip: `${alight.car}번 칸 ${alight.door}번 문 · ${next.line} ${towardLabel} 방향`,
    nextToward: doors.toToward || toward,
  };
}

function elevatorTipText(option: StationOption, fromKo: string | null): string | null {
  const tip = elevatorTip(option, fromKo);
  if (!tip?.cars[0]) return null;
  return `${tip.cars[0].car} (엘리베이터)`;
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
    const fromKo = leg.stations.at(-2) ?? null;
    const transferMeta = !isLast && next && transfer ? transferTipText(leg, next, transfer.station) : null;
    legs.push({
      station: serializeStation(option),
      kind: isLast ? "arrival" : "transfer",
      line: leg.line,
      stations: [...leg.stations],
      stationIds: [...leg.stationIds],
      rideSeconds: leg.seconds,
      hopSeconds: hopSecondsForLeg(leg),
      afterTransferSeconds: transfer ? transfer.walkSeconds + transfer.waitSeconds : 0,
      expectedNextStations: expected,
      oppositeStations: oppositeStationsForLeg(leg),
      beyondStations: isLast ? [] : beyondStationsForLeg(leg),
      transferTip: transferMeta?.tip ?? null,
      nextLine: next?.line ?? null,
      nextToward: transferMeta?.nextToward ?? next?.stations[1] ?? null,
      elevatorTip: isLast ? elevatorTipText(option, fromKo) : null,
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

export function transferLegCount(legs: AlarmLeg[]): number {
  return legs.filter((leg) => leg.kind === "transfer").length;
}

/** 1-based transfer index for the current transfer leg (0 when on final/arrival). */
export function currentTransferOrdinal(legs: AlarmLeg[], legIndex: number): number {
  let ordinal = 0;
  for (let index = 0; index <= legIndex && index < legs.length; index += 1) {
    if (legs[index].kind === "transfer") ordinal += 1;
  }
  return ordinal;
}

export function totalRouteStops(legs: AlarmLeg[]): number {
  return legs.reduce((sum, leg) => sum + Math.max(0, leg.stations.length - 1), 0);
}

export function remainingStopsOnLeg(leg: AlarmLeg, atBareName: string | null): number {
  if (!atBareName) return Math.max(0, leg.stations.length - 1);
  const index = leg.stations.findIndex((name) => bareStationName(name) === atBareName);
  if (index < 0) return Math.max(0, leg.stations.length - 1);
  return Math.max(0, leg.stations.length - 1 - index);
}

export function etaSecondsOnLeg(leg: AlarmLeg, atBareName: string | null): number {
  const hops = Math.max(0, leg.stations.length - 1);
  if (!hops) return 0;
  const remaining = remainingStopsOnLeg(leg, atBareName);
  const ride = leg.rideSeconds || leg.hopSeconds.reduce((sum, hop) => sum + hop, 0);
  return Math.round((ride * remaining) / hops);
}

/**
 * Remaining stops and ETA from the current position onward.
 * ETA matches the route finder: riding + transfer walk + average wait (`Route.seconds`).
 */
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
      etaSeconds += leg.rideSeconds || leg.hopSeconds.reduce((sum, hop) => sum + hop, 0);
    }
    if (index < legs.length - 1) etaSeconds += leg.afterTransferSeconds ?? 0;
  }
  return { remainingStops, etaSeconds };
}

/** 0–1 fraction of hop stops completed for the progress gauge. */
export function routeProgressRatio(legs: AlarmLeg[], legIndex: number, atBareName: string | null): number {
  const total = totalRouteStops(legs);
  if (!total) return 0;
  const remaining = remainingRouteProgress(legs, legIndex, atBareName).remainingStops;
  return Math.min(1, Math.max(0, (total - remaining) / total));
}
