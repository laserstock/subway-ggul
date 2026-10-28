import type { RouteLeg, RouteTransfer } from "./routeFinder";
import { STATION_TRANSFERS } from "./stationTransfers";
import { sameLine } from "./subwayLine";

export { TRANSFER_DATA_DATE } from "./stationTransfers";

/** One official quickest-transfer row: where to get off one line and where you reach the next one's platform. */
export type DoorOption = {
  fromLine: string;
  /** Station the arriving train heads to next, with 역. */
  fromToward: string;
  /** Stations the arriving train comes from. */
  fromPrev: readonly string[];
  /** "10-4": car 10, door 4. */
  alight: string;
  toLine: string;
  toToward: string;
  /** Door nearest to where the transfer passage reaches the next platform. */
  board: string;
  seconds: number | null;
};

export function stationDoorOptions(stationKo: string): DoorOption[] {
  return (STATION_TRANSFERS[stationKo] ?? []).map(
    ([fromLine, fromToward, fromPrev, alight, toLine, toToward, board, seconds]) => ({
      fromLine,
      fromToward,
      fromPrev,
      alight,
      toLine,
      toToward,
      board,
      seconds,
    }),
  );
}

export function splitDoor(position: string) {
  const [car, door = ""] = position.split("-");
  return { car, door };
}

/** The official door for the transfer between `leg` and `next`, matched by the stations either side. */
export function routeTransferDoors(leg: RouteLeg, next: RouteLeg, transfer: RouteTransfer): DoorOption | null {
  const previous = leg.stations.at(-2);
  const onward = next.stations[1];
  if (!previous || !onward) return null;
  const options = stationDoorOptions(transfer.station).filter(
    (option) =>
      sameLine(option.fromLine, leg.line) && sameLine(option.toLine, next.line) && option.fromPrev.includes(previous),
  );
  return options.find((option) => option.toToward === onward) ?? null;
}
