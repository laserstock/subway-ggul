"use client";

import { useMemo, useSyncExternalStore } from "react";
import { t, type Locale } from "./i18n";
import { STATIONS, type Localized, type StationOption } from "./stations";

export type Report = {
  id: string;
  text: Localized;
  likes: number;
  liked: boolean;
  createdAt: number;
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
  text: Localized;
  createdAt: number;
};
type Stored = { reports: StoredReport[]; liked: string[] };

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

function parse(raw: string | null): Stored {
  if (!raw) return { reports: [], liked: [] };
  try {
    const value = JSON.parse(raw) as Partial<Stored>;
    return {
      reports: Array.isArray(value.reports) ? value.reports : [],
      liked: Array.isArray(value.liked) ? value.liked : [],
    };
  } catch {
    return { reports: [], liked: [] };
  }
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
      text: {
        ko: `${exit}번 출구 에스컬레이터 정상 가동`,
        en: `Exit ${exit} escalator is running normally`,
        zh: `${exit}号出口扶梯运行正常`,
        ja: `${exit}番出口のエスカレーター正常稼働`,
      },
      createdAt: seedBase - 10 * 60_000,
    },
  ];
}

const SEED_LIKES = [24, 12];

export function useStationReports(station: StationOption | null): Report[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!station) return [];
    const stored = parse(raw);
    const liked = new Set(stored.liked);
    const seeds = seedsFor(station).map((report, index) => ({
      ...report,
      baseLikes: SEED_LIKES[index] ?? 0,
    }));
    const mine = stored.reports
      .filter((report) => report.stationKey === station.key)
      .map((report) => ({ ...report, baseLikes: 0 }));
    return [...mine, ...seeds]
      .map(({ id, text, createdAt, baseLikes }) => ({
        id,
        text,
        createdAt,
        liked: liked.has(id),
        likes: baseLikes + (liked.has(id) ? 1 : 0),
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

export function addReport(station: StationOption, text: Localized) {
  const stored = parse(readRaw());
  const report: StoredReport = {
    id: `user:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    stationKey: station.key,
    stationName: station.name,
    text,
    createdAt: Date.now(),
  };
  write({ ...stored, reports: [report, ...stored.reports].slice(0, MAX_STORED) });
}

export function toggleLike(id: string) {
  const stored = parse(readRaw());
  const liked = stored.liked.includes(id)
    ? stored.liked.filter((item) => item !== id)
    : [...stored.liked, id];
  write({ ...stored, liked });
}

const AGO: Record<Locale, { now: string; minutes: string; hours: string; days: string }> = {
  ko: { now: "방금 전", minutes: "{n}분 전", hours: "{n}시간 전", days: "{n}일 전" },
  en: { now: "just now", minutes: "{n} min ago", hours: "{n} h ago", days: "{n} d ago" },
  zh: { now: "刚刚", minutes: "{n}分钟前", hours: "{n}小时前", days: "{n}天前" },
  ja: { now: "たった今", minutes: "{n}分前", hours: "{n}時間前", days: "{n}日前" },
};

export function formatAgo(createdAt: number, now: number, locale: Locale) {
  const copy = AGO[locale];
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000));
  if (minutes < 1) return copy.now;
  if (minutes < 60) return copy.minutes.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return copy.hours.replace("{n}", String(hours));
  return copy.days.replace("{n}", String(Math.floor(hours / 24)));
}
