"use client";

import { useSyncExternalStore } from "react";
import { restoreStation, serializeStation, type SavedStation, type StationOption } from "./stations";

const STORAGE_KEY = "subway-ggul:last-station";
/** Older than this, the user has probably moved on; don't show it as "now". */
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type Saved = SavedStation & { savedAt: number };

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

function readSnapshot(): StationOption | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = null;
    try {
      const saved = raw ? (JSON.parse(raw) as Saved) : null;
      if (saved?.key && Date.now() - saved.savedAt < MAX_AGE_MS) cachedValue = restoreStation(saved);
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
  const saved: Saved = { ...serializeStation(station), savedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {}
  listeners.forEach((listener) => listener());
}

/** The station found on the previous visit, shown instantly while GPS confirms. */
export function useLastStation(): StationOption | null {
  return useSyncExternalStore(subscribe, readSnapshot, () => null);
}
