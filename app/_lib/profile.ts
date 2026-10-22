"use client";

import { useSyncExternalStore } from "react";
import { restoreStation, serializeStation, type SavedStation, type StationOption } from "./stations";

export const DEFAULT_NICKNAME = "꿀벌";
export const NICKNAME_MAX = 10;

export type Profile = {
  nickname: string;
  /** The user's "home" station (거주 역), shown next to their nickname like Blind's company tag. */
  homeStation: StationOption | null;
};

type Stored = { nickname?: string; homeStation?: SavedStation | null };

const STORAGE_KEY = "subway-ggul:profile";
const DEFAULT_PROFILE: Profile = { nickname: DEFAULT_NICKNAME, homeStation: null };
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Profile = DEFAULT_PROFILE;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Stored {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Stored;
  } catch {
    return {};
  }
}

function readSnapshot(): Profile {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    const stored = parse(raw);
    cachedValue = {
      nickname: stored.nickname?.trim() || DEFAULT_NICKNAME,
      homeStation: stored.homeStation?.key ? restoreStation(stored.homeStation) : null,
    };
  }
  return cachedValue;
}

function write(next: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, readSnapshot, () => DEFAULT_PROFILE);
}

export function normalizeNickname(value: string) {
  return [...value.replace(/\s+/g, " ").trim()].slice(0, NICKNAME_MAX).join("");
}

export function setNickname(value: string) {
  write({ ...parse(readRaw()), nickname: normalizeNickname(value) || DEFAULT_NICKNAME });
}

export function setHomeStation(station: StationOption | null) {
  write({ ...parse(readRaw()), homeStation: station ? serializeStation(station) : null });
}

export function authorLabel(station: string | null, nickname: string) {
  return station ? `${station} · ${nickname}` : nickname;
}

/** "장한평역 · 꿀벌" — falls back to the station the user is at when no home station is set. */
export function authorTag(profile: Profile, fallbackStation: StationOption | null) {
  const station = profile.homeStation ?? fallbackStation;
  return { station: station?.name.ko ?? null, nickname: profile.nickname };
}
