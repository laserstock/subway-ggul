import type { LatLng } from "../KakaoMap";
import { distanceMeters, stationKeys, type StationOption } from "./stations";

export type StationExit = { label: string; position: LatLng };
export type MapPoint = { name: string; position: LatLng };

/** Walking speed used for the "N min" estimates. */
const METERS_PER_MINUTE = 67;
/** Kakao distances are straight lines; streets, crossings and building entrances add roughly this much. */
const DETOUR_FACTOR = 1.3;

export function walkMinutes(meters: number) {
  return Math.max(1, Math.ceil((meters * DETOUR_FACTOR) / METERS_PER_MINUTE));
}

export function mapPoint({ name, position }: MapPoint) {
  return `${encodeURIComponent(name.replace(/[,/]/g, " "))},${position.lat},${position.lng}`;
}

/** Kakao Map walking directions between two points. */
export function walkUrl(from: MapPoint, to: MapPoint) {
  return `https://map.kakao.com/link/by/walk/${mapPoint(from)}/${mapPoint(to)}`;
}

/** Numbered exits from OpenStreetMap; empty for stations without exit data. */
export async function loadExits(station: StationOption): Promise<StationExit[]> {
  const { STATION_EXITS } = await import("./stationExits");
  for (const key of stationKeys(station)) {
    const list = STATION_EXITS[key];
    if (list?.length) return list.map(([label, lat, lng]) => ({ label, position: { lat, lng } }));
  }
  return [];
}

export function nearestExit(exits: StationExit[], position: LatLng) {
  let best: { exit: StationExit; meters: number } | null = null;
  for (const exit of exits) {
    const meters = distanceMeters(exit.position, position);
    if (!best || meters < best.meters) best = { exit, meters };
  }
  return best;
}
