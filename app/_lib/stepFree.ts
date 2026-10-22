import type { StationOption } from "./stations";
import type { StepFreeMap } from "./stepFreeKit";
import { LINE1_MAPS } from "./stepFreeLine1";
import { LINE2_MAPS } from "./stepFreeLine2";
import { LINE3_MAPS } from "./stepFreeLine3";
import { LINE4_MAPS } from "./stepFreeLine4";
import { LINE5_MAPS } from "./stepFreeLine5";
import { LINE6_MAPS } from "./stepFreeLine6";
import { LINE7_MAPS } from "./stepFreeLine7";
import { LINE8_MAPS } from "./stepFreeLine8";

export type { LevelKind, StepFreeMap } from "./stepFreeKit";

export const DOORS_PER_CAR = 4;

const BY_LINE = [LINE1_MAPS, LINE2_MAPS, LINE3_MAPS, LINE4_MAPS, LINE5_MAPS, LINE6_MAPS, LINE7_MAPS, LINE8_MAPS];

/** Korean station name without parentheses, always ending in 역 (e.g. "군자(능동)" → "군자역"). */
export function stationKey(station: StationOption) {
  const name = station.name.ko.replace(/\(.*?\)/g, "").trim();
  return name.endsWith("역") ? name : `${name}역`;
}

/** Every line with a step-free guide at this station, in line order. */
export function stepFreeMaps(station: StationOption): StepFreeMap[] {
  const key = stationKey(station);
  return BY_LINE.flatMap((maps) => maps[key] ?? []);
}

/**
 * Car-door position nearest to a point on the platform.
 * Car 1 is the front of the train, so trains heading toward `ends[0]` count from that side.
 */
export function carDoorAt(fraction: number, towardFirstEnd: boolean, cars: number) {
  const fromFront = towardFirstEnd ? fraction : 1 - fraction;
  const position = Math.min(Math.max(fromFront, 0), 0.9999) * cars;
  const car = Math.floor(position) + 1;
  const door = Math.floor((position - (car - 1)) * DOORS_PER_CAR) + 1;
  return { car, door };
}
