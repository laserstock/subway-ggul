"use client";

import { useMemo, useSyncExternalStore } from "react";
import { t, type Locale } from "./i18n";
import { STATIONS, type Localized, type StationOption } from "./stations";

export type ReportType = "toilet_paper" | "escalator" | "crowd" | "general";

export type Report = {
  id: string;
  type: ReportType;
  text: Localized;
  likes: number;
  liked: boolean;
  createdAt: number;
  /** Last time this user tapped "still true"; restarts the report's TTL. */
  confirmedAt: number | null;
};

export type MyReport = {
  id: string;
  stationName: Localized;
  text: Localized;
  createdAt: number;
};

type StoredReport = {
  id: string;
  stationKey: string;
  stationName?: Localized;
  type?: ReportType;
  text: Localized;
  createdAt: number;
};
type Stored = {
  reports: StoredReport[];
  liked: string[];
  confirmed: Record<string, number>;
  resolved: string[];
};

const STORAGE_KEY = "subway-ggul:reports";
const MAX_STORED = 100;
const CLOCK_TICK = 30_000;
let seedBase: number | null = null;
let clockNow = 0;
const listeners = new Set<() => void>();
let fallbackRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? fallbackRaw;
  } catch {
    return fallbackRaw;
  }
}

function emptyStored(): Stored {
  return { reports: [], liked: [], confirmed: {}, resolved: [] };
}

function parse(raw: string | null): Stored {
  if (!raw) return emptyStored();
  try {
    const value = JSON.parse(raw) as Partial<Stored>;
    return {
      reports: Array.isArray(value.reports) ? value.reports : [],
      liked: Array.isArray(value.liked) ? value.liked : [],
      confirmed:
        value.confirmed && typeof value.confirmed === "object" && !Array.isArray(value.confirmed)
          ? value.confirmed
          : {},
      resolved: Array.isArray(value.resolved) ? value.resolved : [],
    };
  } catch {
    return emptyStored();
  }
}

const TYPE_KEYWORDS: [ReportType, RegExp][] = [
  ["toilet_paper", /휴지|화장실|위생|tissue|toilet|restroom|卫生间|纸巾|トイレ|ティッシュ/i],
  ["escalator", /에스컬|엘리베이터|승강기|고장|escalator|elevator|lift|扶梯|电梯|エスカレーター|エレベーター/i],
  ["crowd", /붐|혼잡|사람\s*많|crowd|busy|拥挤|混雑/i],
];

export function inferReportType(text: string): ReportType {
  return TYPE_KEYWORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
}

function write(next: Stored) {
  const raw = JSON.stringify(next);
  fallbackRaw = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function subscribeClock(listener: () => void) {
  const timer = window.setInterval(() => {
    clockNow = Date.now();
    listener();
  }, CLOCK_TICK);
  return () => window.clearInterval(timer);
}

function readClock() {
  if (!clockNow) clockNow = Date.now();
  return clockNow;
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, readClock, () => null);
}

function seedsFor(station: StationOption): StoredReport[] {
  seedBase ??= readClock();
  const prefix = (locale: Locale) =>
    `${t(station.name, locale)} ${t(station.lines, locale).split(" · ")[0] ?? ""}`;
  const exit = ([...station.name.ko].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 9) + 1;
  return [
    {
      id: `seed:${station.key}:restroom`,
      stationKey: station.key,
      type: "toilet_paper",
      text: {
        ko: `${prefix("ko")} 승강장 화장실 휴지 있어요!`.replace(/\s+/g, " "),
        en: `${prefix("en")} platform restroom has tissue!`.replace(/\s+/g, " "),
        zh: `${prefix("zh")} 站台卫生间有纸巾！`.replace(/\s+/g, " "),
        ja: `${prefix("ja")} ホームのトイレにティッシュあり！`.replace(/\s+/g, " "),
      },
      createdAt: seedBase - 3 * 60_000,
    },
    {
      id: `seed:${station.key}:escalator`,
      stationKey: station.key,
      type: "escalator",
      text: {
        ko: `${exit}번 출구 에스컬레이터 정상 가동`,
        en: `Exit ${exit} escalator is running normally`,
        zh: `${exit}号出口扶梯运行正常`,
        ja: `${exit}番出口のエスカレーター正常稼働`,
      },
      createdAt: seedBase - 10 * 60_000,
    },
    {
      id: `seed:${station.key}:crowd`,
      stationKey: station.key,
      type: "crowd",
      text: {
        ko: `${prefix("ko")} 승강장 지금 많이 붐벼요`.replace(/\s+/g, " "),
        en: `${prefix("en")} platform is very crowded now`.replace(/\s+/g, " "),
        zh: `${prefix("zh")} 站台现在非常拥挤`.replace(/\s+/g, " "),
        ja: `${prefix("ja")} ホームが今とても混雑`.replace(/\s+/g, " "),
      },
      createdAt: seedBase - 24 * 60_000,
    },
  ];
}

const SEED_LIKES = [24, 12, 5];

export function useStationReports(station: StationOption | null): Report[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!station) return [];
    const stored = parse(raw);
    const liked = new Set(stored.liked);
    const resolved = new Set(stored.resolved);
    const seeds = seedsFor(station).map((report, index) => ({
      ...report,
      baseLikes: SEED_LIKES[index] ?? 0,
    }));
    const mine = stored.reports
      .filter((report) => report.stationKey === station.key)
      .map((report) => ({ ...report, baseLikes: 0 }));
    return [...mine, ...seeds]
      .filter((report) => !resolved.has(report.id))
      .map(({ id, type, text, createdAt, baseLikes }) => ({
        id,
        type: type ?? inferReportType(text.ko),
        text,
        createdAt,
        liked: liked.has(id),
        likes: baseLikes + (liked.has(id) ? 1 : 0),
        confirmedAt: liked.has(id) ? (stored.confirmed[id] ?? null) : null,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [raw, station]);
}

function stationNameFromKey(key: string): Localized {
  const curated = STATIONS.find((station) => station.id === key);
  if (curated) return curated.name;
  const name = key.replace(/^kakao:/, "");
  return { ko: name, en: name };
}

export function useMyReports(): MyReport[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    return parse(raw)
      .reports.map((report) => ({
        id: report.id,
        stationName: report.stationName ?? stationNameFromKey(report.stationKey),
        text: report.text,
        createdAt: report.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [raw]);
}

export function deleteReport(id: string) {
  const stored = parse(readRaw());
  write({ ...stored, reports: stored.reports.filter((report) => report.id !== id) });
}

export function addReport(
  station: StationOption,
  text: Localized,
  type: ReportType = inferReportType(text.ko),
) {
  const stored = parse(readRaw());
  const report: StoredReport = {
    id: `user:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    stationKey: station.key,
    stationName: station.name,
    type,
    text,
    createdAt: Date.now(),
  };
  write({ ...stored, reports: [report, ...stored.reports].slice(0, MAX_STORED) });
}

function withoutConfirmation(stored: Stored, id: string): Stored {
  const confirmed = { ...stored.confirmed };
  delete confirmed[id];
  return { ...stored, liked: stored.liked.filter((item) => item !== id), confirmed };
}

/** "Still true": +1 upvote and restarts the TTL. Tapping again withdraws both. */
export function confirmReport(id: string) {
  const stored = parse(readRaw());
  if (stored.liked.includes(id)) {
    write(withoutConfirmation(stored, id));
    return false;
  }
  write({ ...stored, liked: [...stored.liked, id], confirmed: { ...stored.confirmed, [id]: Date.now() } });
  return true;
}

/** "Resolved": hides the report from every feed on this device. */
export function resolveReport(id: string) {
  const stored = withoutConfirmation(parse(readRaw()), id);
  write({ ...stored, resolved: [...stored.resolved.filter((item) => item !== id), id].slice(-MAX_STORED) });
}

const AGO: Record<Locale, { now: string; minutes: string; hours: string; days: string }> = {
  ko: { now: "방금 전", minutes: "{n}분 전", hours: "{n}시간 전", days: "{n}일 전" },
  en: { now: "just now", minutes: "{n} min ago", hours: "{n} h ago", days: "{n} d ago" },
  zh: { now: "刚刚", minutes: "{n}分钟前", hours: "{n}小时前", days: "{n}天前" },
  ja: { now: "たった今", minutes: "{n}分前", hours: "{n}時間前", days: "{n}日前" },
};

export function formatRelativeTime(createdAt: number, now: number, locale: Locale) {
  const copy = AGO[locale];
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000));
  if (minutes < 1) return copy.now;
  if (minutes < 60) return copy.minutes.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return copy.hours.replace("{n}", String(hours));
  return copy.days.replace("{n}", String(Math.floor(hours / 24)));
}
