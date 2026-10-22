"use client";

import { useSyncExternalStore } from "react";
import {
  POPULAR_STATIONS,
  restoreStation,
  serializeStation,
  type Localized,
  type SavedStation,
  type StationOption,
} from "./stations";

export type PlacePreset = "home" | "work" | "school" | "date" | "gym" | "other";

export const PLACE_PRESETS: Record<PlacePreset, { emoji: string; label: Localized; bg: string; ring: string }> = {
  home: { emoji: "🏠", label: { ko: "집", en: "Home", zh: "家", ja: "自宅" }, bg: "#fff1e0", ring: "#fcd9ad" },
  work: { emoji: "🏢", label: { ko: "회사", en: "Work", zh: "公司", ja: "会社" }, bg: "#e8f0ff", ring: "#c4d6fb" },
  school: { emoji: "🏫", label: { ko: "학교", en: "School", zh: "学校", ja: "学校" }, bg: "#e7f6ec", ring: "#bfe6cb" },
  date: { emoji: "❤️", label: { ko: "데이트", en: "Date", zh: "约会", ja: "デート" }, bg: "#ffe9ef", ring: "#fbc6d4" },
  gym: { emoji: "🏋️", label: { ko: "운동", en: "Gym", zh: "健身", ja: "ジム" }, bg: "#f1ebff", ring: "#d8cbfb" },
  other: { emoji: "⭐", label: { ko: "자주 가는 곳", en: "Favorite", zh: "常去", ja: "よく行く" }, bg: "#fff8d6", ring: "#f6e39a" },
};

export const PLACE_PRESET_IDS = Object.keys(PLACE_PRESETS) as PlacePreset[];

export type MyPlace = {
  id: string;
  preset: PlacePreset;
  /** Custom nickname; falls back to the preset label when empty. */
  label: string;
  station: StationOption;
};

export type RouteEndpoint = { emoji: string; station: StationOption };
export type MyRoute = { id: string; from: RouteEndpoint; to: RouteEndpoint };

export type MyStationsState = { places: MyPlace[]; routes: MyRoute[] };

type StoredPlace = Omit<MyPlace, "station"> & { station: SavedStation };
type StoredEndpoint = { emoji: string; station: SavedStation };
type StoredRoute = { id: string; from: StoredEndpoint; to: StoredEndpoint };
type Stored = { places: StoredPlace[]; routes: StoredRoute[] };

const STORAGE_KEY = "subway-ggul:my-stations";
const MAX_PLACES = 12;
const MAX_ROUTES = 8;
const EMPTY: MyStationsState = { places: [], routes: [] };

const JANGHANPYEONG: SavedStation = {
  key: "kakao:장한평역",
  name: { ko: "장한평역", en: "Janghanpyeong", zh: "长汉坪站", ja: "長漢坪駅" },
  lines: { ko: "5호선", en: "Line 5", zh: "5号线", ja: "5号線" },
  center: { lat: 37.561432, lng: 127.064623 },
  color: "#a05eb5",
};
const SEONGSU: SavedStation = {
  key: "kakao:성수역",
  name: { ko: "성수역", en: "Seongsu", zh: "圣水站", ja: "聖水駅" },
  lines: { ko: "2호선", en: "Line 2", zh: "2号线", ja: "2号線" },
  center: { lat: 37.544581, lng: 127.055961 },
  color: "#00b140",
};
const GWANGHWAMUN = serializeStation(POPULAR_STATIONS.find((station) => station.key === "kakao:광화문역")!);

/** Shown until the user saves their own list for the first time. */
const DEFAULTS: Stored = {
  places: [
    { id: "default-home", preset: "home", label: "", station: JANGHANPYEONG },
    { id: "default-work", preset: "work", label: "", station: GWANGHWAMUN },
    { id: "default-date", preset: "date", label: "", station: SEONGSU },
  ],
  routes: [
    {
      id: "default-commute",
      from: { emoji: "🏠", station: JANGHANPYEONG },
      to: { emoji: "🏢", station: GWANGHWAMUN },
    },
  ],
};

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: MyStationsState = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isSaved(value: unknown): value is SavedStation {
  const station = value as SavedStation | null;
  return Boolean(station?.key && station.name?.ko && station.center);
}

function readStored(raw: string | null): Stored {
  if (raw === null) return DEFAULTS;
  try {
    const value = JSON.parse(raw) as Partial<Stored>;
    return {
      places: Array.isArray(value.places)
        ? value.places.filter((place) => place?.id && place.preset in PLACE_PRESETS && isSaved(place.station))
        : [],
      routes: Array.isArray(value.routes)
        ? value.routes.filter((route) => route?.id && isSaved(route.from?.station) && isSaved(route.to?.station))
        : [],
    };
  } catch {
    return DEFAULTS;
  }
}

function hydrate(stored: Stored): MyStationsState {
  return {
    places: stored.places.map((place) => ({ ...place, station: restoreStation(place.station) })),
    routes: stored.routes.map((route) => ({
      id: route.id,
      from: { emoji: route.from.emoji, station: restoreStation(route.from.station) },
      to: { emoji: route.to.emoji, station: restoreStation(route.to.station) },
    })),
  };
}

function readSnapshot(): MyStationsState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = hydrate(readStored(raw));
  }
  return cachedValue;
}

function write(next: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

function update(change: (stored: Stored) => Stored) {
  write(change(readStored(readRaw())));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useMyStations(): MyStationsState {
  return useSyncExternalStore(subscribe, readSnapshot, () => EMPTY);
}

export function placeEmoji(place: Pick<MyPlace, "preset">) {
  return PLACE_PRESETS[place.preset].emoji;
}

export function savePlace(place: { id?: string; preset: PlacePreset; label: string; station: StationOption }) {
  const stored: StoredPlace = {
    id: place.id ?? newId("place"),
    preset: place.preset,
    label: place.label.trim().slice(0, 12),
    station: serializeStation(place.station),
  };
  update((current) => {
    const exists = current.places.some((item) => item.id === stored.id);
    return {
      ...current,
      places: exists
        ? current.places.map((item) => (item.id === stored.id ? stored : item))
        : [...current.places, stored].slice(-MAX_PLACES),
    };
  });
}

export function removePlace(id: string) {
  update((current) => ({ ...current, places: current.places.filter((place) => place.id !== id) }));
}

export function addRoute(from: RouteEndpoint, to: RouteEndpoint) {
  const route: StoredRoute = {
    id: newId("route"),
    from: { emoji: from.emoji, station: serializeStation(from.station) },
    to: { emoji: to.emoji, station: serializeStation(to.station) },
  };
  update((current) => ({ ...current, routes: [...current.routes, route].slice(-MAX_ROUTES) }));
}

export function reverseRoute(id: string) {
  update((current) => ({
    ...current,
    routes: current.routes.map((route) => (route.id === id ? { ...route, from: route.to, to: route.from } : route)),
  }));
}

export function removeRoute(id: string) {
  update((current) => ({ ...current, routes: current.routes.filter((route) => route.id !== id) }));
}
