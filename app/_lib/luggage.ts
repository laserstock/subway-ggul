import { STATION_LOCKERS, type StationLocker } from "./stationLockers";
import { stationKeys, type Localized, type StationOption } from "./stations";

/** Fees and hours as published on each service's official site; shown with a "may change" note. */
export const LUGGAGE_LINKS = {
  tLockerWeb: "https://tlocker.otpin.co/",
  tLuggage: "https://www.tluggage.co.kr/kor",
  appGooglePlay: "https://play.google.com/store/search?q=%EB%98%90%ED%83%80%EB%9D%BC%EC%BB%A4&c=apps",
  appAppStore: "https://apps.apple.com/kr/search?term=%EB%98%90%ED%83%80%EB%9D%BC%EC%BB%A4",
  callCenter: "tel:1877-1265",
} as const;

export const LOCKER_HOURS = { open: 5, close: 24 } as const;
export const LUGGAGE_HOURS = { open: 9, close: 22 } as const;
export const LOCKER_MAX_DAYS = 5;
const BASE_HOURS = 4;

export type LockerSize = "S" | "M" | "L";
export type LuggageSize = "S" | "M" | "L" | "XL";
/** Weekday / weekend-and-holiday price pair. */
type Fee = readonly [weekday: number, weekend: number];

export const LOCKER_SIZES: Record<LockerSize, { label: Localized; dims: string; base: Fee; extra: number }> = {
  S: { label: { ko: "소형", en: "Small" }, dims: "50×30×60cm", base: [2200, 3100], extra: 500 },
  M: { label: { ko: "중형", en: "Medium" }, dims: "50×45×60cm", base: [3300, 4600], extra: 800 },
  L: { label: { ko: "대형", en: "Large" }, dims: "50×90×60cm", base: [4400, 6100], extra: 1000 },
};

export const LUGGAGE_SIZES: Record<
  LuggageSize,
  { label: Localized; fits: Localized; base: Fee; city: Fee; airport: Fee }
> = {
  S: {
    label: { ko: "S", en: "S" },
    fits: { ko: "20인치 이하", en: "up to 20\"" },
    base: [3000, 4000],
    city: [17000, 25000],
    airport: [20000, 29000],
  },
  M: {
    label: { ko: "M", en: "M" },
    fits: { ko: "20~23인치", en: "20–23\"" },
    base: [4000, 6000],
    city: [17000, 25000],
    airport: [20000, 29000],
  },
  L: {
    label: { ko: "L", en: "L" },
    fits: { ko: "23~27인치", en: "23–27\"" },
    base: [6000, 9000],
    city: [26000, 38000],
    airport: [26000, 38000],
  },
  XL: {
    label: { ko: "XL", en: "XL" },
    fits: { ko: "27인치 이상", en: "27\"+" },
    base: [9000, 13000],
    city: [31000, 45000],
    airport: [31000, 45000],
  },
};
const LUGGAGE_EXTRA = 1000;

export function lockerFee(size: LockerSize, hours: number, weekend: boolean) {
  const { base, extra } = LOCKER_SIZES[size];
  return base[weekend ? 1 : 0] + Math.max(0, Math.ceil(hours - BASE_HOURS)) * extra;
}

export function luggageFee(size: LuggageSize, hours: number, weekend: boolean) {
  return LUGGAGE_SIZES[size].base[weekend ? 1 : 0] + Math.max(0, Math.ceil(hours - BASE_HOURS)) * LUGGAGE_EXTRA;
}

export function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export type LuggageDesk = { station: string; line: string; where: Localized };

/** 또타러기지 staffed desks (storage + same-day delivery). */
export const LUGGAGE_DESKS: LuggageDesk[] = [
  { station: "서울역", line: "1호선", where: { ko: "B1 1번 출구 방면", en: "B1, toward Exit 1" } },
  { station: "홍대입구역", line: "2호선", where: { ko: "B1 3·4번 출구 방면", en: "B1, toward Exits 3–4" } },
  { station: "잠실역", line: "2호선", where: { ko: "B1 3·4번 출구 방면", en: "B1, toward Exits 3–4" } },
  { station: "명동역", line: "4호선", where: { ko: "B1 9·10번 출구 방면", en: "B1, toward Exits 9–10" } },
  { station: "김포공항역", line: "5호선", where: { ko: "B1 i-센터 방면", en: "B1, by the i-Center" } },
  { station: "종로3가역", line: "5호선", where: { ko: "B1 6번 출구 방면", en: "B1, toward Exit 6" } },
];

export type StorageRoom = "small" | "medium" | "large";

export const STORAGE_ROOMS: Record<StorageRoom, { label: Localized; size: Localized; monthly: number }> = {
  small: { label: { ko: "0.15평", en: "0.15 pyeong" }, size: { ko: "1×1×1.05m", en: "1×1×1.05 m" }, monthly: 49000 },
  medium: { label: { ko: "0.3평", en: "0.3 pyeong" }, size: { ko: "1×1×2.1m", en: "1×1×2.1 m" }, monthly: 79000 },
  large: { label: { ko: "0.5평", en: "0.5 pyeong" }, size: { ko: "1×1.5×2.1m", en: "1×1.5×2.1 m" }, monthly: 131000 },
};

/** Discount for paying 3, 6 or 12 months up front. */
export const STORAGE_DISCOUNTS = [
  { months: 3, rate: 0.1 },
  { months: 6, rate: 0.15 },
  { months: 12, rate: 0.2 },
] as const;

export type StorageSite = { station: string; line: string; where: string; rooms: StorageRoom[] };

/** 또타스토리지 long-term storage rooms; booked in the 또타라커 app. */
export const STORAGE_SITES: StorageSite[] = [
  { station: "신정역", line: "5호선", where: "B2 2번 출구", rooms: ["medium"] },
  { station: "답십리역", line: "5호선", where: "B2 2번 출구", rooms: ["medium"] },
  { station: "군자역", line: "5호선", where: "B1 5번 출구", rooms: ["small", "medium"] },
  { station: "월드컵경기장역", line: "6호선", where: "B2 2번 출구", rooms: ["medium"] },
  { station: "광흥창역", line: "6호선", where: "B2 2번 출구", rooms: ["medium"] },
  { station: "창신역", line: "6호선", where: "B1 4번 출구", rooms: ["medium", "large"] },
  { station: "안암역", line: "6호선", where: "B2 1번 출구", rooms: ["small", "medium"] },
  { station: "봉화산역", line: "6호선", where: "B1 2번 출구", rooms: ["medium"] },
  { station: "중계역", line: "7호선", where: "B2 1번 출구", rooms: ["medium", "large"] },
  { station: "태릉입구역", line: "7호선", where: "B1 3·4번 출구", rooms: ["medium", "large"] },
  { station: "상봉역", line: "7호선", where: "B1 3번 출구", rooms: ["medium", "large"] },
  { station: "반포역", line: "7호선", where: "B1 4번 출구", rooms: ["medium", "large"] },
  { station: "이수역", line: "7호선", where: "B3 10번 출구", rooms: ["medium", "large"] },
  { station: "신풍역", line: "7호선", where: "B1 1번 출구", rooms: ["medium", "large"] },
  { station: "마들역", line: "7호선", where: "B1 3번 출구", rooms: ["small", "medium"] },
  { station: "하계역", line: "7호선", where: "B1 6번 출구", rooms: ["medium"] },
  { station: "어린이대공원역", line: "7호선", where: "B1 5번 출구", rooms: ["small", "medium", "large"] },
  { station: "논현역", line: "7호선", where: "B2 3번 출구", rooms: ["medium", "large"] },
  { station: "남성역", line: "7호선", where: "B2 1번 출구", rooms: ["medium", "large"] },
  { station: "가락시장역", line: "8호선", where: "B1 2·3번 출구", rooms: ["medium", "large"] },
];

export function stationLockers(station: StationOption): readonly StationLocker[] {
  for (const key of stationKeys(station)) {
    const found = STATION_LOCKERS[key];
    if (found) return found;
  }
  return [];
}

export function stationDesk(station: StationOption) {
  const keys = stationKeys(station);
  return LUGGAGE_DESKS.find((desk) => keys.includes(desk.station)) ?? null;
}

export function stationStorage(station: StationOption) {
  const keys = stationKeys(station);
  return STORAGE_SITES.find((site) => keys.includes(site.station)) ?? null;
}

export type LuggagePlan = "hours" | "send" | "months";
export type BagSize = "bag" | "carryOn" | "large";
export type LuggageService = "tLocker" | "tLuggage" | "storage";

export type LuggagePick = { service: LuggageService; lockerSize?: LockerSize; luggageSize?: LuggageSize };

export function recommendLuggage(plan: LuggagePlan, bag: BagSize, station: StationOption | null): LuggagePick {
  if (plan === "months") return { service: "storage" };
  const luggageSize: LuggageSize = bag === "large" ? "L" : "S";
  if (plan === "send") return { service: "tLuggage", luggageSize };
  if (bag === "large" && station && stationDesk(station)) return { service: "tLuggage", luggageSize };
  const lockerSize: LockerSize = bag === "bag" ? "S" : bag === "carryOn" ? "M" : "L";
  return { service: "tLocker", lockerSize };
}

export function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
