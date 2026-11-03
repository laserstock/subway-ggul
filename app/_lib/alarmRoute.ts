import { findRoute, networkStationId, networkStationPoint } from "./routeFinder";
import type { StationOption } from "./stations";

/** A stop on the way, with the riding time from there until the train reaches the stop before the destination. */
export type AlarmRoutePoint = { lat: number; lng: number; seconds: number };

/**
 * The stops from `origin` to `destination`, in riding order. The native alarm counts down from the
 * last of these it located, so it still alerts when tunnels keep GPS from seeing the stop before.
 */
export function alarmRoute(origin: StationOption, destination: StationOption): AlarmRoutePoint[] {
  const from = networkStationId(origin.name.ko, origin.center);
  const to = networkStationId(destination.name.ko, destination.center);
  if (from === null || to === null) return [];
  const route = findRoute(from, to, "fastest");
  if (!route) return [];

  const { legs, transfers } = route;
  const hop = (index: number) => legs[index].seconds / Math.max(1, legs[index].stationIds.length - 1);
  const legEnd: number[] = [];
  let after = 0;
  for (let index = legs.length - 1; index >= 0; index--) {
    legEnd[index] = after;
    const change = transfers[index - 1];
    after += legs[index].seconds + (change ? change.walkSeconds + change.waitSeconds : 0);
  }

  // A transfer station appears in two legs; the smaller time errs toward alerting early.
  const remaining = new Map<number, number>();
  legs.forEach((leg, index) => {
    const last = leg.stationIds.length - 1;
    leg.stationIds.forEach((id, stop) => {
      const seconds = legEnd[index] + (last - stop) * hop(index);
      remaining.set(id, Math.min(remaining.get(id) ?? Infinity, seconds));
    });
  });

  const lastHop = hop(legs.length - 1);
  const points: AlarmRoutePoint[] = [];
  for (const [id, seconds] of remaining) {
    const point = networkStationPoint(id);
    if (!point || id === to) continue;
    points.push({ ...point, seconds: Math.max(0, Math.round(seconds - lastHop)) });
  }
  return points;
}
