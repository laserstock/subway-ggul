"use client";

import { useSyncExternalStore } from "react";
import type { LatLng } from "../KakaoMap";
import { STATIONS, curatedOption, type Localized, type StationOption } from "./stations";

const STORAGE_KEY = "subway-ggul:last-station";
/** Older than this, the user has probably moved on; don't show it as "now". */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type Saved = {
  key: string;
  name: Localized;
  lines: Localized;
  center: LatLng;
  color: string;
  savedAt: number;
};

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: StationOption | null = null;

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function toStation(saved: Saved): StationOption {
  const curated = STATIONS.find((station) => station.id === saved.key);
  if (curated) return curatedOption(curated);
  const { key, name, lines, center, color } = saved;
  return { key, name, lines, center, color };
}

function readSnapshot(): StationOption | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = null;
    try {
      const saved = raw ? (JSON.parse(raw) as Saved) : null;
      if (saved?.key && Date.now() - saved.savedAt < MAX_AGE_MS) cachedValue = toStation(saved);
    } catch {}
  }
  return cachedValue;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function saveLastStation(station: StationOption) {
  const saved: Saved = {
    key: station.key,
    name: station.name,
    lines: station.lines,
    center: station.center,
    color: station.color,
    savedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {}
  listeners.forEach((listener) => listener());
}

/** The station found on the previous visit, shown instantly while GPS confirms. */
export function useLastStation(): StationOption | null {
  return useSyncExternalStore(subscribe, readSnapshot, () => null);
}
