import { STATION_TOILETS, type StationToilet } from "./stationToilets";
import { stationKeys, stationName, t, type Locale, type Localized, type StationOption } from "./stations";
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

export function floorLabel(floor: string, locale: Locale) {
  if (locale !== "ko") return floor;
  return /^\d+F$/.test(floor) ? `${floor.slice(0, -1)}층` : `${floor}층`;
}

const COPY = {
  oneCar: {
    ko: "엘리베이터와 가까운 칸은 {car}번이에요.",
    en: "Car door {car} is closest to the elevator.",
    zh: "离电梯最近的车门是{car}号。",
    ja: "エレベーターに近いのは{car}号車のドアです。",
  },
  toward: { ko: "{station} 방면 {car}", en: "toward {station} {car}", zh: "往{station}方向 {car}", ja: "{station}方面 {car}" },
  cars: {
    ko: "엘리베이터 가까운 칸: {parts}",
    en: "Elevator car: {parts}",
    zh: "离电梯近的车厢：{parts}",
    ja: "エレベーターに近い車両：{parts}",
  },
  restroom: {
    ko: "{station} 화장실은 개찰구 {side} {floor}{exit}에 있어요. {advice}",
    en: "{side} the gates, {floor}{exit}. {advice}",
    zh: "{station}的洗手间在检票口{side} {floor}{exit}。{advice}",
    ja: "{station}のトイレは改札{side} {floor}{exit}にあります。{advice}",
  },
  inside: { ko: "안", en: "Inside", zh: "内", ja: "内" },
  outside: { ko: "밖", en: "Outside", zh: "外", ja: "外" },
  exit: { ko: "({n}번 출구 방향)", en: " (toward Exit {n})", zh: " ({n}号出口方向)", ja: " ({n}番出口方面)" },
  goBefore: { ko: "카드 찍기 전에 들르세요!", en: "Go before you tap out!", zh: "刷卡出站前去吧！", ja: "改札を出る前に寄りましょう！" },
  tapOut: { ko: "카드 찍고 나가세요!", en: "Tap out first!", zh: "请先刷卡出站！", ja: "先に改札を出てください！" },
  approachTitle: {
    ko: "🔔 잠시 후 {station} 도착!",
    en: "🔔 Arriving at {station} soon!",
    zh: "🔔 即将到达{station}！",
    ja: "🔔 まもなく{station}に到着！",
  },
  quickTip: { ko: "3초 꿀팁", en: "Quick tip", zh: "3秒小贴士", ja: "3秒ヒント" },
  getReady: {
    ko: "💡 내릴 준비하세요! 두고 내리는 물건이 없는지 확인해요.",
    en: "💡 Get ready to get off and check you have everything.",
    zh: "💡 准备下车吧！请确认没有遗忘物品。",
    ja: "💡 降りる準備をしましょう！忘れ物がないか確認してください。",
  },
  arrivedTitle: { ko: "🚉 {station} 도착!", en: "🚉 Arrived at {station}!", zh: "🚉 已到达{station}！", ja: "🚉 {station}に到着！" },
  restroomTip: { ko: "화장실 팁", en: "Restroom", zh: "洗手间提示", ja: "トイレ情報" },
  goodDay: {
    ko: "두고 내리는 물건이 없는지 확인하세요. 좋은 하루 보내요!",
    en: "Check you have everything. Have a great day!",
    zh: "请确认没有遗忘物品。祝您愉快！",
    ja: "忘れ物がないか確認してください。良い一日を！",
  },
} satisfies Record<string, Localized>;

function fill(template: Localized, locale: Locale, values: Record<string, string>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), t(template, locale));
}

/** Line-end labels in the step-free maps are often Korean-only; the station index has every language. */
function endName(end: Localized, locale: Locale) {
  if (end[locale]) return end[locale];
  const indexed = stationName(bareStationName(end.ko));
  return indexed.zh ? t(indexed, locale) : t(end, locale);
}

export function elevatorText(tip: ElevatorTip, locale: Locale) {
  if (tip.cars.length === 1) return fill(COPY.oneCar, locale, { car: tip.cars[0].car });
  const parts = tip.cars.map(({ toward, car }) => fill(COPY.toward, locale, { station: endName(toward, locale), car }));
  return fill(COPY.cars, locale, { parts: parts.join(" · ") });
}

export function restroomText(station: StationOption, toilet: StationToilet, locale: Locale) {
  const inside = toilet.gate === "inside";
  return fill(COPY.restroom, locale, {
    station: t(station.name, locale),
    side: t(inside ? COPY.inside : COPY.outside, locale),
    floor: floorLabel(toilet.floor, locale),
    exit: toilet.exit ? fill(COPY.exit, locale, { n: toilet.exit }) : "",
    advice: t(inside ? COPY.goBefore : COPY.tapOut, locale),
  });
}

export type AlarmMessage = { title: string; body: string };

/** Sent one stop before the destination. */
export function approachMessage(station: StationOption, from: string | null, locale: Locale): AlarmMessage {
  const tip = elevatorTip(station, from);
  return {
    title: fill(COPY.approachTitle, locale, { station: t(station.name, locale) }),
    body: tip ? `💡 ${t(COPY.quickTip, locale)}: ${elevatorText(tip, locale)}` : t(COPY.getReady, locale),
  };
}

/** Sent on arrival, with the restroom location from Seoul Metro's toilet data. */
export function arrivalMessage(station: StationOption, line: string | null, locale: Locale): AlarmMessage {
  const toilet = restroomTip(station, line);
  return {
    title: fill(COPY.arrivedTitle, locale, { station: t(station.name, locale) }),
    body: toilet ? `🚽 ${t(COPY.restroomTip, locale)}: ${restroomText(station, toilet, locale)}` : t(COPY.goodDay, locale),
  };
}
