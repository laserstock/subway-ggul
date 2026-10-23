"use client";

import { useSyncExternalStore } from "react";
import type { Localized } from "./i18n";
import { restoreStation, serializeStation, type SavedStation, type StationOption } from "./stations";

export const DEFAULT_NICKNAME = "꿀벌";
export const NICKNAME_MAX = 10;

export type BadgeTier = "bronze" | "silver" | "gold" | "diamond";
export type ActivityMetric = "likes" | "posts" | "comments" | "reports";
export type ActivityStats = Record<ActivityMetric, number>;

/** The bee family. `requires` locks a character until a badge of that tier is earned. */
export const AVATARS = [
  { id: "bee", label: { ko: "아기 꿀벌", en: "Baby Bee", zh: "宝宝蜜蜂", ja: "あかちゃんバチ" } },
  { id: "queen", label: { ko: "여왕벌", en: "Queen Bee", zh: "蜂后", ja: "女王バチ" } },
  { id: "worker", label: { ko: "일하는 꿀벌", en: "Worker Bee", zh: "工蜂", ja: "はたらきバチ" } },
  { id: "detective", label: { ko: "탐정 꿀벌", en: "Detective Bee", zh: "侦探蜜蜂", ja: "探偵バチ" } },
  { id: "scholar", label: { ko: "학자 꿀벌", en: "Scholar Bee", zh: "学者蜜蜂", ja: "学者バチ" } },
  { id: "hipster", label: { ko: "힙스터 꿀벌", en: "Hipster Bee", zh: "潮人蜜蜂", ja: "ヒップスターバチ" } },
  { id: "racer", label: { ko: "스피드 꿀벌", en: "Speedy Bee", zh: "极速蜜蜂", ja: "スピードバチ" } },
  { id: "sleepy", label: { ko: "잠꾸러기 꿀벌", en: "Sleepy Bee", zh: "瞌睡蜜蜂", ja: "ねぼすけバチ" } },
  { id: "barista", label: { ko: "카페인 꿀벌", en: "Caffeine Bee", zh: "咖啡因蜜蜂", ja: "カフェインバチ" } },
  { id: "traveler", label: { ko: "여행가 꿀벌", en: "Traveler Bee", zh: "旅行家蜜蜂", ja: "旅人バチ" } },
  { id: "boxer", label: { ko: "정열의 꿀벌", en: "Fiery Bee", zh: "热血蜜蜂", ja: "情熱バチ" } },
  {
    id: "diamond",
    label: { ko: "다이아몬드 꿀벌", en: "Diamond Bee", zh: "钻石蜜蜂", ja: "ダイヤモンドバチ" },
    requires: "diamond",
  },
] as const satisfies readonly { id: string; label: Localized; requires?: BadgeTier }[];

export type AvatarId = (typeof AVATARS)[number]["id"];
export type Avatar = (typeof AVATARS)[number];
export const DEFAULT_AVATAR: AvatarId = "bee";

export const BADGE_TRACKS = [
  {
    metric: "likes",
    emoji: "💛",
    title: { ko: "공감 수확", en: "Likes received", zh: "收获点赞", ja: "いいね獲得" },
    goal: { ko: "공감 {n}개 받기", en: "Get {n} likes", zh: "获得{n}个赞", ja: "いいねを{n}個もらう" },
    unit: { ko: "개", en: "", zh: "个", ja: "個" },
  },
  {
    metric: "posts",
    emoji: "📝",
    title: { ko: "꿀스팟 글 작성", en: "Honey Spot posts", zh: "蜜点发帖", ja: "ハニースポット投稿" },
    goal: { ko: "글 {n}회 작성", en: "Write {n} posts", zh: "发帖{n}次", ja: "{n}回投稿する" },
    unit: { ko: "회", en: "", zh: "次", ja: "回" },
  },
  {
    metric: "comments",
    emoji: "💬",
    title: { ko: "댓글 활동", en: "Comments", zh: "评论活动", ja: "コメント活動" },
    goal: { ko: "댓글 {n}회 작성", en: "Write {n} comments", zh: "评论{n}次", ja: "{n}回コメントする" },
    unit: { ko: "회", en: "", zh: "次", ja: "回" },
  },
  {
    metric: "reports",
    emoji: "📣",
    title: { ko: "1초 제보 지킴이", en: "Quick reports", zh: "1秒上报守护者", ja: "1秒報告キーパー" },
    goal: { ko: "제보 {n}회", en: "Make {n} reports", zh: "上报{n}次", ja: "{n}回報告する" },
    unit: { ko: "회", en: "", zh: "次", ja: "回" },
  },
] as const satisfies readonly {
  metric: ActivityMetric;
  emoji: string;
  title: Localized;
  goal: Localized;
  unit: Localized;
}[];

/** Ids are stored on posts and comments, so never rename one. */
export const BADGES = [
  {
    id: "like-bronze",
    metric: "likes",
    tier: "bronze",
    goal: 10,
    emoji: "🥉",
    short: { ko: "동메달 꿀벌", en: "Bronze Bee", zh: "铜牌蜜蜂", ja: "銅メダルバチ" },
  },
  {
    id: "like-silver",
    metric: "likes",
    tier: "silver",
    goal: 20,
    emoji: "🥈",
    short: { ko: "은메달 꿀벌", en: "Silver Bee", zh: "银牌蜜蜂", ja: "銀メダルバチ" },
  },
  {
    id: "like-gold",
    metric: "likes",
    tier: "gold",
    goal: 50,
    emoji: "🥇",
    short: { ko: "금메달 꿀벌", en: "Gold Bee", zh: "金牌蜜蜂", ja: "金メダルバチ" },
  },
  {
    id: "like-diamond",
    metric: "likes",
    tier: "diamond",
    goal: 100,
    emoji: "💎",
    short: { ko: "다이아몬드 꿀벌", en: "Diamond Bee", zh: "钻石蜜蜂", ja: "ダイヤモンドバチ" },
  },
  {
    id: "post-first",
    metric: "posts",
    tier: "bronze",
    goal: 1,
    emoji: "📝",
    short: { ko: "첫 수다", en: "First Chat", zh: "初次聊天", ja: "初おしゃべり" },
  },
  {
    id: "post-local",
    metric: "posts",
    tier: "silver",
    goal: 10,
    emoji: "✍️",
    short: { ko: "동네 소식통", en: "Local Insider", zh: "街坊消息通", ja: "地元の情報通" },
  },
  {
    id: "post-influencer",
    metric: "posts",
    tier: "gold",
    goal: 50,
    emoji: "📢",
    short: { ko: "꿀스팟 인플루언서", en: "Spot Influencer", zh: "蜜点网红", ja: "スポットインフルエンサー" },
  },
  {
    id: "post-legend",
    metric: "posts",
    tier: "diamond",
    goal: 200,
    emoji: "👑",
    short: { ko: "꿀스팟 레전드", en: "Spot Legend", zh: "蜜点传奇", ja: "スポットレジェンド" },
  },
  {
    id: "comment-fairy",
    metric: "comments",
    tier: "bronze",
    goal: 5,
    emoji: "💬",
    short: { ko: "칭찬 요정", en: "Kindness Fairy", zh: "夸夸精灵", ja: "ほめ上手の妖精" },
  },
  {
    id: "comment-pro",
    metric: "comments",
    tier: "silver",
    goal: 30,
    emoji: "🗣️",
    short: { ko: "프로 소통러", en: "Pro Talker", zh: "沟通达人", ja: "プロ交流家" },
  },
  {
    id: "comment-master",
    metric: "comments",
    tier: "gold",
    goal: 100,
    emoji: "🏛️",
    short: { ko: "호선 장인", en: "Line Master", zh: "线路匠人", ja: "路線の匠" },
  },
  {
    id: "first-report",
    metric: "reports",
    tier: "bronze",
    goal: 1,
    emoji: "🔰",
    short: { ko: "초보 지킴이", en: "Rookie Keeper", zh: "新手守护者", ja: "新米キーパー" },
  },
  {
    id: "honey-keeper",
    metric: "reports",
    tier: "silver",
    goal: 10,
    emoji: "🛡️",
    short: { ko: "꿀정보 지킴이", en: "Honey Keeper", zh: "蜜信息守护者", ja: "ハチミツ番人" },
  },
  {
    id: "report-guardian",
    metric: "reports",
    tier: "gold",
    goal: 50,
    emoji: "🎖️",
    short: { ko: "명예 지하철 파수꾼", en: "Subway Sentinel", zh: "荣誉地铁哨兵", ja: "名誉地下鉄ガード" },
  },
  {
    id: "report-legend",
    metric: "reports",
    tier: "diamond",
    goal: 200,
    emoji: "🔱",
    short: { ko: "전설의 수호신", en: "Legendary Guardian", zh: "传说守护神", ja: "伝説の守護神" },
  },
] as const satisfies readonly {
  id: string;
  metric: ActivityMetric;
  tier: BadgeTier;
  goal: number;
  emoji: string;
  short: Localized;
}[];

export type BadgeId = (typeof BADGES)[number]["id"];
export type Badge = (typeof BADGES)[number];

const TIER_RANK: Record<BadgeTier, number> = { bronze: 0, silver: 1, gold: 2, diamond: 3 };

export type Profile = {
  nickname: string;
  /** The user's home station (주 사용 역), shown before their nickname like Blind's company tag. */
  primaryStation: StationOption | null;
  selectedAvatar: AvatarId;
  unlockedBadges: BadgeId[];
  /** Badge shown on the profile and on new posts; null when none is equipped. */
  activeBadge: BadgeId | null;
  /** Lifetime activity; counters only go up, so deleting a post or report keeps its badge. */
  stats: ActivityStats;
};

type Stored = {
  nickname?: string;
  primaryStation?: SavedStation | null;
  /** Older builds stored the primary station under this name. */
  homeStation?: SavedStation | null;
  selectedAvatar?: string;
  unlockedBadges?: string[];
  activeBadge?: string | null;
  stats?: Partial<ActivityStats>;
  /** Older builds only counted reports. */
  reportCount?: number;
};

const STORAGE_KEY = "subway-ggul:profile";
const NO_STATS: ActivityStats = { likes: 0, posts: 0, comments: 0, reports: 0 };
const DEFAULT_PROFILE: Profile = {
  nickname: DEFAULT_NICKNAME,
  primaryStation: null,
  selectedAvatar: DEFAULT_AVATAR,
  unlockedBadges: [],
  activeBadge: null,
  stats: NO_STATS,
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

export function avatarById(id: AvatarId | null | undefined): Avatar {
  return AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0];
}

export function badgeById(id: BadgeId | null | undefined): Badge | null {
  return BADGES.find((badge) => badge.id === id) ?? null;
}

/** Highest tier first, then the hardest goal. */
export function byPrestige(a: Badge, b: Badge) {
  return TIER_RANK[b.tier] - TIER_RANK[a.tier] || b.goal - a.goal;
}

export function isAvatarUnlocked(avatar: Avatar, unlockedBadges: readonly BadgeId[]) {
  if (!("requires" in avatar)) return true;
  return unlockedBadges.some((id) => badgeById(id)?.tier === avatar.requires);
}

function earnedBadges(stats: ActivityStats): BadgeId[] {
  return BADGES.filter((badge) => stats[badge.metric] >= badge.goal).map((badge) => badge.id);
}

function count(value: unknown) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function readStats(stored: Stored): ActivityStats {
  const saved = stored.stats ?? {};
  return {
    likes: count(saved.likes),
    posts: count(saved.posts),
    comments: count(saved.comments),
    reports: Math.max(count(saved.reports), count(stored.reportCount)),
  };
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
  const stats = readStats(stored);
  const unlocked = new Set([...(stored.unlockedBadges ?? []).filter(isBadgeId), ...earnedBadges(stats)]);
  const unlockedBadges = BADGES.map((badge) => badge.id).filter((id) => unlocked.has(id));
  const active = isBadgeId(stored.activeBadge) && unlocked.has(stored.activeBadge) ? stored.activeBadge : null;
  const avatar = isAvatarId(stored.selectedAvatar) ? avatarById(stored.selectedAvatar) : null;
  return {
    nickname: stored.nickname?.trim() || DEFAULT_NICKNAME,
    primaryStation: saved?.key ? restoreStation(saved) : null,
    selectedAvatar: avatar && isAvatarUnlocked(avatar, unlockedBadges) ? avatar.id : DEFAULT_AVATAR,
    unlockedBadges,
    activeBadge: active,
    stats,
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

/** Returns false for a character that is still locked. */
export function setAvatar(id: AvatarId) {
  if (!isAvatarUnlocked(avatarById(id), readSnapshot().unlockedBadges)) return false;
  update((current) => ({ ...current, selectedAvatar: id }));
  return true;
}

/** Equips an unlocked badge, or unequips with null. Returns false for a badge that isn't unlocked yet. */
export function setActiveBadge(id: BadgeId | null) {
  if (id !== null && !readSnapshot().unlockedBadges.includes(id)) return false;
  update((current) => ({ ...current, activeBadge: id }));
  return true;
}

// ── Badge unlock celebrations (in memory: shown once, on the device that earned them) ──

const NO_CELEBRATION: BadgeId[] = [];
let celebration: BadgeId[] = NO_CELEBRATION;
const celebrationListeners = new Set<() => void>();

function celebrate(ids: BadgeId[]) {
  celebration = [...celebration, ...ids.filter((id) => !celebration.includes(id))];
  celebrationListeners.forEach((listener) => listener());
}

/** Badges unlocked since the celebration popup was last dismissed. */
export function useBadgeCelebration(): BadgeId[] {
  return useSyncExternalStore(
    (listener) => {
      celebrationListeners.add(listener);
      return () => {
        celebrationListeners.delete(listener);
      };
    },
    () => celebration,
    () => NO_CELEBRATION,
  );
}

export function dismissBadgeCelebration() {
  celebration = NO_CELEBRATION;
  celebrationListeners.forEach((listener) => listener());
}

function raiseStats(next: (stats: ActivityStats) => ActivityStats) {
  const before = readSnapshot();
  const stats = next(before.stats);
  if ((Object.keys(stats) as ActivityMetric[]).every((metric) => stats[metric] <= before.stats[metric])) return;
  const fresh = earnedBadges(stats).filter((id) => !before.unlockedBadges.includes(id));
  update((current) => {
    const rest = { ...current };
    delete rest.reportCount;
    return {
      ...rest,
      stats,
      unlockedBadges: [...before.unlockedBadges, ...fresh],
      // Until the user picks (or explicitly removes) a badge, the best new one is equipped so it shows up right away.
      activeBadge:
        current.activeBadge === undefined && fresh.length > 0
          ? fresh.flatMap((id) => badgeById(id) ?? []).sort(byPrestige)[0].id
          : current.activeBadge,
    };
  });
  if (fresh.length > 0) celebrate(fresh);
}

/** Call after the user's own post, comment or report is saved. */
export function recordActivity(metric: ActivityMetric) {
  raiseStats((stats) => ({ ...stats, [metric]: stats[metric] + 1 }));
}

/** Catches up with server totals (e.g. likes from others, activity from before the counters existed). Never lowers. */
export function syncActivity(totals: Partial<ActivityStats>) {
  raiseStats((stats) => ({
    likes: Math.max(stats.likes, count(totals.likes)),
    posts: Math.max(stats.posts, count(totals.posts)),
    comments: Math.max(stats.comments, count(totals.comments)),
    reports: Math.max(stats.reports, count(totals.reports)),
  }));
}

export function authorLabel(station: string | null, nickname: string) {
  return station ? `${station} · ${nickname}` : nickname;
}

/** "장한평역 · 꿀벌" — falls back to the station the user is at when no primary station is set. */
export function authorTag(profile: Profile, fallbackStation: StationOption | null) {
  const station = profile.primaryStation ?? fallbackStation;
  return { station: station?.name.ko ?? null, nickname: profile.nickname };
}
