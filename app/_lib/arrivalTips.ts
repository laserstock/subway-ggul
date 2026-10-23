import { STATION_TOILETS, type StationToilet } from "./stationToilets";
import { stationKeys, t, type Locale, type Localized, type StationOption } from "./stations";
import { carDoorAt, stepFreeMaps, type StepFreeMap } from "./stepFree";
import { sameLine } from "./subwayLine";

/** "장한평역", "장한평", "방화(종착)" → "장한평" / "방화", so Kakao, index and map labels compare equal. */
export function bareStationName(name: string) {
  return name.replace(/\(.*?\)/g, "").replace(/역$/, "").trim();
}

export type ElevatorCar = { toward: Localized; car: string };
export type ElevatorTip = { line: string; cars: ElevatorCar[] };

function carDoor(map: StepFreeMap, towardFirst: boolean) {
  const { car, door } = carDoorAt(map.platformEv, towardFirst, map.cars);
  return `${car}-${door}`;
}

/**
 * Car-door nearest the platform elevator. When the previous stop is known the train's direction
 * is too, so there is one answer; otherwise both directions of the first mapped line.
 */
export function elevatorTip(station: StationOption, from: string | null): ElevatorTip | null {
  const maps = stepFreeMaps(station);
  const origin = from ? bareStationName(from) : null;
  if (origin) {
    for (const map of maps) {
      const side = map.ends.findIndex((end) => bareStationName(end.ko) === origin);
      if (side < 0) continue;
      const towardFirst = side === 1;
      return { line: map.line, cars: [{ toward: map.ends[towardFirst ? 0 : 1], car: carDoor(map, towardFirst) }] };
    }
  }
  const map = maps[0];
  if (!map) return null;
  return {
    line: map.line,
    cars: [
      { toward: map.ends[0], car: carDoor(map, true) },
      { toward: map.ends[1], car: carDoor(map, false) },
    ],
  };
}

/** Prefers the line the rider arrives on, then a toilet inside the fare gates. */
export function restroomTip(station: StationOption, line: string | null): StationToilet | null {
  const toilets = stationKeys(station)
    .map((key) => STATION_TOILETS[key])
    .find((found) => found && found.length > 0);
  if (!toilets) return null;
  const onLine = line ? toilets.filter((toilet) => sameLine(toilet.line, line)) : [];
  const pool = onLine.length > 0 ? onLine : toilets;
  return pool.find((toilet) => toilet.gate === "inside") ?? pool[0] ?? null;
}

function floorLabel(floor: string, locale: Locale) {
  if (locale !== "ko") return floor;
  return /^\d+F$/.test(floor) ? `${floor.slice(0, -1)}층` : `${floor}층`;
}

export function elevatorText(tip: ElevatorTip, locale: Locale) {
  const ko = locale === "ko";
  if (tip.cars.length === 1) {
    const car = tip.cars[0].car;
    return ko ? `엘리베이터와 가까운 칸은 ${car}번이에요.` : `Car door ${car} is closest to the elevator.`;
  }
  const parts = tip.cars.map(({ toward, car }) =>
    ko ? `${t(toward, locale)} 방면 ${car}` : `toward ${t(toward, locale)} ${car}`,
  );
  return ko ? `엘리베이터 가까운 칸: ${parts.join(" · ")}` : `Elevator car: ${parts.join(" · ")}`;
}

export function restroomText(station: StationOption, toilet: StationToilet, locale: Locale) {
  const inside = toilet.gate === "inside";
  const floor = floorLabel(toilet.floor, locale);
  if (locale === "ko") {
    const name = t(station.name, locale);
    const exit = toilet.exit ? `(${toilet.exit}번 출구 방향)` : "";
    return `${name} 화장실은 개찰구 ${inside ? "안" : "밖"} ${floor}${exit}에 있어요. ${
      inside ? "카드 찍기 전에 들르세요!" : "카드 찍고 나가세요!"
    }`;
  }
  const exit = toilet.exit ? ` (toward Exit ${toilet.exit})` : "";
  return `${inside ? "Inside" : "Outside"} the gates, ${floor}${exit}. ${
    inside ? "Go before you tap out!" : "Tap out first!"
  }`;
}

export type AlarmMessage = { title: string; body: string };

/** Sent one stop before the destination. */
export function approachMessage(station: StationOption, from: string | null, locale: Locale): AlarmMessage {
  const ko = locale === "ko";
  const name = t(station.name, locale);
  const tip = elevatorTip(station, from);
  return {
    title: ko ? `🔔 잠시 후 ${name} 도착!` : `🔔 Arriving at ${name} soon!`,
    body: tip
      ? `💡 ${ko ? "3초 꿀팁" : "Quick tip"}: ${elevatorText(tip, locale)}`
      : ko
        ? "💡 내릴 준비하세요! 두고 내리는 물건이 없는지 확인해요."
        : "💡 Get ready to get off and check you have everything.",
  };
}

/** Sent on arrival, with the restroom location from Seoul Metro's toilet data. */
export function arrivalMessage(station: StationOption, line: string | null, locale: Locale): AlarmMessage {
  const ko = locale === "ko";
  const name = t(station.name, locale);
  const toilet = restroomTip(station, line);
  return {
    title: ko ? `🚉 ${name} 도착!` : `🚉 Arrived at ${name}!`,
    body: toilet
      ? `🚽 ${ko ? "화장실 팁" : "Restroom"}: ${restroomText(station, toilet, locale)}`
      : ko
        ? "두고 내리는 물건이 없는지 확인하세요. 좋은 하루 보내요!"
        : "Check you have everything. Have a great day!",
  };
}
