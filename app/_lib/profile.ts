"use client";

import { useSyncExternalStore } from "react";
import type { Localized } from "./i18n";
import { restoreStation, serializeStation, type SavedStation, type StationOption } from "./stations";

export const DEFAULT_NICKNAME = "꿀벌";
export const NICKNAME_MAX = 10;

export const AVATARS = [
  { id: "bee", emoji: "🐝", label: { ko: "꿀벌", en: "Bee", zh: "蜜蜂", ja: "ミツバチ" } },
  { id: "subway", emoji: "🚇", label: { ko: "지하철", en: "Subway", zh: "地铁", ja: "地下鉄" } },
  { id: "frog", emoji: "🐸", label: { ko: "개구리", en: "Frog", zh: "青蛙", ja: "カエル" } },
  { id: "bear", emoji: "🐻", label: { ko: "곰돌이", en: "Bear", zh: "小熊", ja: "クマ" } },
  { id: "cat", emoji: "🐱", label: { ko: "고양이", en: "Cat", zh: "小猫", ja: "ネコ" } },
  { id: "rabbit", emoji: "🐰", label: { ko: "토끼", en: "Rabbit", zh: "兔子", ja: "ウサギ" } },
] as const satisfies readonly { id: string; emoji: string; label: Localized }[];

export type AvatarId = (typeof AVATARS)[number]["id"];
export const DEFAULT_AVATAR: AvatarId = "bee";

export const BADGES = [
  {
    id: "first-report",
    emoji: "🏅",
    short: { ko: "첫제보", en: "1st report", zh: "首报", ja: "初報告" },
    title: { ko: "첫 제보 달성 배지", en: "First report badge", zh: "首次上报徽章", ja: "初報告バッジ" },
    goal: 1,
  },
  {
    id: "honey-keeper",
    emoji: "🐝",
    short: { ko: "꿀정보 지킴이", en: "Honey Keeper", zh: "蜜信息守护者", ja: "ハチミツ番人" },
    title: { ko: "꿀정보 지킴이 배지", en: "Honey Keeper badge", zh: "蜜信息守护者徽章", ja: "ハチミツ情報キーパーバッジ" },
    goal: 10,
  },
] as const satisfies readonly { id: string; emoji: string; short: Localized; title: Localized; goal: number }[];

export type BadgeId = (typeof BADGES)[number]["id"];
export type Badge = (typeof BADGES)[number];

export type Profile = {
  nickname: string;
  /** The user's home station (주 사용 역), shown before their nickname like Blind's company tag. */
  primaryStation: StationOption | null;
  selectedAvatar: AvatarId;
  unlockedBadges: BadgeId[];
  /** Badge shown on the profile and on new posts; null when none is equipped. */
  activeBadge: BadgeId | null;
  /** 1-second reports made on this device; only ever goes up, so deleting a report keeps its badge. */
  reportCount: number;
};

type Stored = {
  nickname?: string;
  primaryStation?: SavedStation | null;
  /** Older builds stored the primary station under this name. */
  homeStation?: SavedStation | null;
  selectedAvatar?: string;
  unlockedBadges?: string[];
  activeBadge?: string | null;
  reportCount?: number;
};

const STORAGE_KEY = "subway-ggul:profile";
const DEFAULT_PROFILE: Profile = {
  nickname: DEFAULT_NICKNAME,
  primaryStation: null,
  selectedAvatar: DEFAULT_AVATAR,
  unlockedBadges: [],
  activeBadge: null,
  reportCount: 0,
};
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: Profile = DEFAULT_PROFILE;

export function isAvatarId(value: unknown): value is AvatarId {
  return AVATARS.some((avatar) => avatar.id === value);
}

export function isBadgeId(value: unknown): value is BadgeId {
  return BADGES.some((badge) => badge.id === value);
}

export function avatarEmoji(id: AvatarId | null | undefined) {
  return (AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0]).emoji;
}

export function badgeById(id: BadgeId | null | undefined): Badge | null {
  return BADGES.find((badge) => badge.id === id) ?? null;
}

/** Badges earned by this many reports. */
function earnedBadges(reportCount: number): BadgeId[] {
  return BADGES.filter((badge) => reportCount >= badge.goal).map((badge) => badge.id);
}

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

function toProfile(stored: Stored): Profile {
  const saved = stored.primaryStation !== undefined ? stored.primaryStation : stored.homeStation;
  const reportCount = Math.max(0, Math.floor(Number(stored.reportCount) || 0));
  const unlocked = [...new Set([...(stored.unlockedBadges ?? []).filter(isBadgeId), ...earnedBadges(reportCount)])];
  const active = isBadgeId(stored.activeBadge) && unlocked.includes(stored.activeBadge) ? stored.activeBadge : null;
  return {
    nickname: stored.nickname?.trim() || DEFAULT_NICKNAME,
    primaryStation: saved?.key ? restoreStation(saved) : null,
    selectedAvatar: isAvatarId(stored.selectedAvatar) ? stored.selectedAvatar : DEFAULT_AVATAR,
    unlockedBadges: BADGES.map((badge) => badge.id).filter((id) => unlocked.includes(id)),
    activeBadge: active,
    reportCount,
  };
}

function readSnapshot(): Profile {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = toProfile(parse(raw));
  }
  return cachedValue;
}

function update(patch: (current: Stored) => Stored) {
  const current = parse(readRaw());
  const next = patch(current);
  if (next.primaryStation !== undefined) delete next.homeStation;
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
  update((current) => ({ ...current, nickname: normalizeNickname(value) || DEFAULT_NICKNAME }));
}

export function setPrimaryStation(station: StationOption | null) {
  update((current) => ({ ...current, primaryStation: station ? serializeStation(station) : null }));
}

export function setAvatar(id: AvatarId) {
  update((current) => ({ ...current, selectedAvatar: id }));
}

/** Equips an unlocked badge, or unequips with null. Returns false for a badge that isn't unlocked yet. */
export function setActiveBadge(id: BadgeId | null) {
  if (id !== null && !readSnapshot().unlockedBadges.includes(id)) return false;
  update((current) => ({ ...current, activeBadge: id }));
  return true;
}

function withReportCount(current: Stored, reportCount: number): Stored {
  const profile = toProfile({ ...current, reportCount });
  const newlyUnlocked = profile.unlockedBadges.filter((id) => !(current.unlockedBadges ?? []).includes(id));
  return {
    ...current,
    reportCount,
    unlockedBadges: profile.unlockedBadges,
    // Until the user picks (or explicitly removes) a badge, a newly earned one is equipped so it shows up right away.
    activeBadge: current.activeBadge === undefined ? newlyUnlocked[0] : current.activeBadge,
  };
}

/** Call after a 1-second report is saved. Returns badges unlocked by this report. */
export function recordReport(): Badge[] {
  const before = readSnapshot().unlockedBadges;
  update((current) => withReportCount(current, Math.max(0, Number(current.reportCount) || 0) + 1));
  return readSnapshot()
    .unlockedBadges.filter((id) => !before.includes(id))
    .flatMap((id) => badgeById(id) ?? []);
}

/** Catches up with reports made before the counter existed (it never goes down). */
export function syncReportCount(serverCount: number) {
  if (serverCount <= readSnapshot().reportCount) return;
  update((current) => withReportCount(current, serverCount));
}

export function authorLabel(station: string | null, nickname: string) {
  return station ? `${station} · ${nickname}` : nickname;
}

/** "장한평역 · 꿀벌" — falls back to the station the user is at when no primary station is set. */
export function authorTag(profile: Profile, fallbackStation: StationOption | null) {
  const station = profile.primaryStation ?? fallbackStation;
  return { station: station?.name.ko ?? null, nickname: profile.nickname };
}
