"use client";

import { useSyncExternalStore } from "react";

/** Per-route monthly seating wins. Storage: `ksub_seat_success_v1`. */
export type SeatSuccessEntry = {
  month: string;
  count: number;
  /** carKey → hits, e.g. "5-3" */
  cars: Record<string, number>;
  lastCar: string | null;
};

type Store = Record<string, SeatSuccessEntry>;

const STORAGE_KEY = "ksub_seat_success_v1";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Store = {};

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Store {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as Store;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function readSnapshot(): Store {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

function write(next: Store) {
  cachedValue = next;
  try {
    const raw = JSON.stringify(next);
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

export function useSeatSuccessStore(): Store {
  return useSyncExternalStore(subscribe, readSnapshot, () => ({}));
}

export function seatSuccessForRoute(store: Store, routeId: string): SeatSuccessEntry {
  const month = monthKey();
  const entry = store[routeId];
  if (!entry || entry.month !== month) {
    return { month, count: 0, cars: {}, lastCar: entry?.lastCar ?? null };
  }
  return entry;
}

export function topSeatCar(entry: SeatSuccessEntry): string | null {
  let best: string | null = entry.lastCar;
  let hits = -1;
  for (const [car, count] of Object.entries(entry.cars)) {
    if (count > hits) {
      hits = count;
      best = car;
    }
  }
  return best;
}

/** Record a seating win for this route; `car` like `5-3`. Defaults to last car or `5-3`. */
export function recordSeatSuccess(routeId: string, car?: string | null) {
  const store = readSnapshot();
  const month = monthKey();
  const prev = seatSuccessForRoute(store, routeId);
  const chosen = (car || prev.lastCar || "5-3").trim();
  const cars = { ...prev.cars, [chosen]: (prev.cars[chosen] ?? 0) + 1 };
  write({
    ...store,
    [routeId]: {
      month,
      count: prev.count + 1,
      cars,
      lastCar: chosen,
    },
  });
  return chosen;
}
