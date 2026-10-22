import type { StationOption } from "./stations";
import type { StepFreeMap } from "./stepFreeKit";
import { LINE1_MAPS } from "./stepFreeLine1";
import { LINE2_MAPS } from "./stepFreeLine2";
import { LINE3_MAPS } from "./stepFreeLine3";
import { LINE4_MAPS } from "./stepFreeLine4";
import { LINE5_MAPS } from "./stepFreeLine5";

export type { LevelKind, StepFreeMap } from "./stepFreeKit";

export const DOORS_PER_CAR = 4;

const BY_LINE = [LINE1_MAPS, LINE2_MAPS, LINE3_MAPS, LINE4_MAPS, LINE5_MAPS];

/** Every line with a step-free guide at this station, in line order. */
export function stepFreeMaps(station: StationOption): StepFreeMap[] {
  const name = station.name.ko.replace(/\(.*?\)/g, "").trim();
  const key = name.endsWith("역") ? name : `${name}역`;
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
