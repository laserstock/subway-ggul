"use client";

import { useSyncExternalStore } from "react";
import { ensureUser, getSupabase, isDuplicate, notifyServerError } from "./supabase";

export type FlagTarget = "report" | "post" | "comment";
export const FLAG_REASONS = ["spam", "abuse", "privacy", "other"] as const;
export type FlagReason = (typeof FLAG_REASONS)[number];

export type SafetyState = {
  /** Author ids this device chose to block. */
  blocked: ReadonlySet<string>;
  /** `${target}:${id}` of content this device flagged; hidden right away for the flagger. */
  flagged: ReadonlySet<string>;
};

const STORAGE_KEY = "subway-ggul:safety";
const EMPTY: SafetyState = { blocked: new Set(), flagged: new Set() };
const MAX_FLAGGED = 500;

let state: SafetyState | null = null;
const listeners = new Set<() => void>();

function load(): SafetyState {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as {
      blocked?: unknown;
      flagged?: unknown;
    };
    const strings = (value: unknown) =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    return { blocked: new Set(strings(parsed.blocked)), flagged: new Set(strings(parsed.flagged)) };
  } catch {
    return EMPTY;
  }
}

function read(): SafetyState {
  state ??= load();
  return state;
}

function write(next: SafetyState) {
  state = next;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ blocked: [...next.blocked], flagged: [...next.flagged].slice(-MAX_FLAGGED) }),
    );
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSafety(): SafetyState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function isHiddenContent(safety: SafetyState, target: FlagTarget, id: string, authorId: string) {
  return safety.blocked.has(authorId) || safety.flagged.has(`${target}:${id}`);
}

/** Hides the item for this device at once and records the flag; several flags hide it for everyone. */
export async function flagContent(target: FlagTarget, id: string, reason: FlagReason): Promise<boolean> {
  const current = read();
  write({ ...current, flagged: new Set([...current.flagged, `${target}:${id}`]) });
  const supabase = getSupabase();
  if (!supabase || !(await ensureUser())) return false;
  const { error } = await supabase.from("content_flags").insert({ target_type: target, target_id: id, reason });
  if (error && !isDuplicate(error)) {
    notifyServerError(error);
    return false;
  }
  return true;
}

export function blockAuthor(authorId: string) {
  const current = read();
  write({ ...current, blocked: new Set([...current.blocked, authorId]) });
}

export function unblockAll() {
  write({ ...read(), blocked: new Set() });
}
