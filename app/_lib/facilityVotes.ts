"use client";

import { useMemo, useSyncExternalStore } from "react";

export type FacilityVote = "ok" | "broken";

const STORAGE_KEY = "subway-ggul:facility-votes";
const listeners = new Set<() => void>();
let fallbackRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? fallbackRaw;
  } catch {
    return fallbackRaw;
  }
}

function parse(raw: string | null): Record<string, FacilityVote> {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, FacilityVote] => entry[1] === "ok" || entry[1] === "broken",
      ),
    );
  } catch {
    return {};
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useFacilityVotes(): Record<string, FacilityVote> {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}

/** One vote per facility; voting the same way again cancels it. */
export function voteFacility(id: string, vote: FacilityVote) {
  const votes = parse(readRaw());
  if (votes[id] === vote) delete votes[id];
  else votes[id] = vote;
  const raw = JSON.stringify(votes);
  fallbackRaw = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {}
  listeners.forEach((listener) => listener());
}
