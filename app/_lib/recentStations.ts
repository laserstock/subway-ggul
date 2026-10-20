"use client";

import { useSyncExternalStore } from "react";
import { restoreStation, serializeStation, type SavedStation, type StationOption } from "./stations";

const STORAGE_KEY = "subway-ggul:recent-stations";
const MAX_RECENT = 10;
const EMPTY: StationOption[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: StationOption[] = EMPTY;

function readSaved(): SavedStation[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as SavedStation[]).filter((item) => item?.key && item.center) : [];
  } catch {
    return [];
  }
}

function write(list: SavedStation[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
  listeners.forEach((listener) => listener());
}

function readSnapshot(): StationOption[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {}
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = readSaved().map(restoreStation);
  }
  return cachedValue;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function addRecentStation(station: StationOption) {
  const rest = readSaved().filter((item) => item.key !== station.key);
  write([serializeStation(station), ...rest].slice(0, MAX_RECENT));
}

export function removeRecentStation(key: string) {
  write(readSaved().filter((item) => item.key !== key));
}

export function clearRecentStations() {
  write([]);
}

/** Most recent first; persisted in localStorage. */
export function useRecentStations(): StationOption[] {
  return useSyncExternalStore(subscribe, readSnapshot, () => EMPTY);
}
