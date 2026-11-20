"use client";

import { useSyncExternalStore } from "react";
import type { Localized } from "./stations";

/** Categories for Between-style private station notes. */
export type StationLogTag = "date" | "tip" | "cafe" | "commute";

/**
 * Local-first footprint note. Fields stay Supabase-friendly for a future user-id sync.
 * Storage key: `ksub_my_station_logs_v1`
 */
export type StationLog = {
  id: string;
  stationName: string;
  lineNumber: string;
  /** Stable station key when known (favorite chip / StationOption.key). */
  stationKey?: string;
  tag: StationLogTag;
  content: string;
  imageDataUrl: string | null;
  createdAt: number;
};

export const LOG_TAGS: Record<
  StationLogTag,
  { emoji: string; label: Localized; tint: string; accent: string }
> = {
  date: {
    emoji: "🥰",
    label: { ko: "데이트/추억", en: "Date / memory", zh: "约会/回忆", ja: "デート/思い出" },
    tint: "#ffe8ef",
    accent: "#e11d48",
  },
  tip: {
    emoji: "🚪",
    label: { ko: "나만의 꿀팁", en: "My tip", zh: "我的小窍门", ja: "自分のコツ" },
    tint: "#e8f0ff",
    accent: "#2563eb",
  },
  cafe: {
    emoji: "☕",
    label: { ko: "맛집/카페", en: "Food / cafe", zh: "美食/咖啡", ja: "グルメ/カフェ" },
    tint: "#fff3e0",
    accent: "#c2410c",
  },
  commute: {
    emoji: "💼",
    label: { ko: "출퇴근 기록", en: "Commute log", zh: "通勤记录", ja: "通勤記録" },
    tint: "#eef2ff",
    accent: "#4f46e5",
  },
};

const STORAGE_KEY = "ksub_my_station_logs_v1";
const MAX_LOGS = 200;
const MAX_CONTENT = 120;

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: StationLog[] = [];

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isLog(value: unknown): value is StationLog {
  const row = value as StationLog | null;
  return Boolean(
    row &&
      typeof row.id === "string" &&
      typeof row.stationName === "string" &&
      typeof row.lineNumber === "string" &&
      row.tag in LOG_TAGS &&
      typeof row.content === "string" &&
      typeof row.createdAt === "number",
  );
}

function parse(raw: string | null): StationLog[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.filter(isLog).slice(0, MAX_LOGS);
  } catch {
    return [];
  }
}

function readSnapshot(): StationLog[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function write(next: StationLog[]) {
  const trimmed = next.slice(0, MAX_LOGS);
  cachedValue = trimmed;
  try {
    const raw = JSON.stringify(trimmed);
    cachedRaw = raw;
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    cachedRaw = undefined;
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useStationLogs(): StationLog[] {
  return useSyncExternalStore(subscribe, readSnapshot, () => []);
}

export function countLogsForStation(logs: StationLog[], stationKey: string, stationNameKo: string): number {
  const bare = stationNameKo.replace(/역$/, "");
  return logs.filter(
    (log) =>
      log.stationKey === stationKey ||
      log.stationName === stationNameKo ||
      log.stationName.replace(/역$/, "") === bare,
  ).length;
}

export function filterLogs(
  logs: StationLog[],
  filter: { stationKey?: string | null; stationNameKo?: string | null },
): StationLog[] {
  if (!filter.stationKey && !filter.stationNameKo) return logs;
  const bare = filter.stationNameKo?.replace(/역$/, "") ?? "";
  return logs.filter(
    (log) =>
      (filter.stationKey && log.stationKey === filter.stationKey) ||
      (filter.stationNameKo &&
        (log.stationName === filter.stationNameKo || log.stationName.replace(/역$/, "") === bare)),
  );
}

function newId() {
  return `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function saveStationLog(input: {
  id?: string;
  stationName: string;
  lineNumber: string;
  stationKey?: string;
  tag: StationLogTag;
  content: string;
  imageDataUrl?: string | null;
  createdAt?: number;
}): StationLog | null {
  const content = input.content.trim().slice(0, MAX_CONTENT);
  if (!content || !input.stationName.trim()) return null;
  const current = readSnapshot();
  const next: StationLog = {
    id: input.id ?? newId(),
    stationName: input.stationName.trim(),
    lineNumber: input.lineNumber.trim() || "",
    stationKey: input.stationKey,
    tag: input.tag,
    content,
    imageDataUrl: input.imageDataUrl ?? null,
    createdAt: input.createdAt ?? Date.now(),
  };
  if (input.id) {
    const index = current.findIndex((row) => row.id === input.id);
    if (index >= 0) {
      const copy = [...current];
      copy[index] = next;
      write(copy);
      return next;
    }
  }
  write([next, ...current.filter((row) => row.id !== next.id)]);
  return next;
}

export function deleteStationLog(id: string) {
  write(readSnapshot().filter((row) => row.id !== id));
}

/** Client-side resize for optional photo attachments (JPEG data URL). */
export async function resizeImageFile(file: File, maxEdge = 960, quality = 0.72): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

export function formatLogDate(createdAt: number, locale: string): string {
  const date = new Date(createdAt);
  const weekdays: Record<string, string[]> = {
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    zh: ["日", "一", "二", "三", "四", "五", "六"],
    ja: ["日", "月", "火", "水", "木", "金", "土"],
  };
  const days = weekdays[locale] ?? weekdays.en;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d} (${days[date.getDay()]})`;
}
