"use client";

import { useMemo, useSyncExternalStore } from "react";

export const SPOT_CATEGORIES = ["commute", "food", "lost", "free"] as const;
export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

export const SPOT_TABS = ["all", "popular", "commute", "food", "lost"] as const;
export type SpotTab = (typeof SPOT_TABS)[number];

export const PLAZA_LINES = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선"];
export const DEFAULT_PLAZA_LINE = "2호선";

export const SPOT_TITLE_MAX = 40;
export const SPOT_BODY_MAX = 300;
export const SPOT_COMMENT_MAX = 150;
/** Likes needed before a post shows up in the "popular" tab. */
const POPULAR_MIN_LIKES = 15;

export type SpotComment = {
  id: string;
  station: string | null;
  author: string;
  text: string;
  createdAt: number;
  mine: boolean;
};

export type SpotPost = {
  id: string;
  line: string;
  station: string | null;
  author: string;
  category: SpotCategory;
  title: string;
  body: string;
  createdAt: number;
  views: number;
  likes: number;
  liked: boolean;
  scrapped: boolean;
  commentCount: number;
  /** Highlighted reply shown under the post body. */
  bestReply: SpotComment | null;
  comments: SpotComment[];
  mine: boolean;
};

type SeedReply = { station: string; author: string; text: string };
type SeedPost = {
  id: string;
  station: string;
  author: string;
  category: SpotCategory;
  title: string;
  body: string;
  minutesAgo: number;
  views: number;
  likes: number;
  comments: number;
  reply?: SeedReply;
};

type StoredPost = {
  id: string;
  line: string;
  station: string | null;
  author: string;
  category: SpotCategory;
  title: string;
  body: string;
  createdAt: number;
};
type StoredComment = Omit<SpotComment, "mine">;
type Stored = {
  posts: StoredPost[];
  liked: string[];
  scrapped: string[];
  viewed: string[];
  comments: Record<string, StoredComment[]>;
};

const LINE_SEEDS: Partial<Record<string, SeedPost[]>> = {
  "5호선": [
    {
      id: "takoyaki",
      station: "장한평역",
      author: "꿀벌",
      category: "food",
      title: "오늘 퇴근길 장한평역 3번 출구 앞 타코야끼 사장님 나오셨나요??",
      body: "저 지금 퇴근길에 냄새 맡으면 기절할 거 같은데 혹시 보신 분! 🐙",
      minutesAgo: 5,
      views: 124,
      likes: 34,
      comments: 12,
      reply: { station: "광화문역", author: "퇴근요정", text: "네 지금 굽고 계십니다! 대기줄 3명 정도 있네요ㅎㅎ" },
    },
    {
      id: "tissue",
      station: "광화문역",
      author: "5호선지기",
      category: "free",
      title: "광화문역 B구역 승강장 안쪽 화장실 휴지 넉넉하게 채워져 있습니다",
      body: "카드 안 찍고 가도 되는 승강장 환승 통로 옆 거기 맞아요.\n혹시 급하신 분들은 참고하세요! 👍",
      minutesAgo: 12,
      views: 98,
      likes: 18,
      comments: 3,
    },
    {
      id: "yeouido-crowd",
      station: "여의도역",
      author: "여의도프로",
      category: "commute",
      title: "여의도역 환승통로 오늘 사람 역대급으로 많네요",
      body: "캐리어 들고 계신 분들 엘리베이터 대기줄 장난 아닙니다.\n시간 조금 넉넉히 잡고 환승하시는 게 좋을 것 같아요 ⏳",
      minutesAgo: 25,
      views: 210,
      likes: 29,
      comments: 8,
    },
    {
      id: "umbrella",
      station: "군자역",
      author: "우산요정",
      category: "lost",
      title: "군자역 7호선 환승 계단에서 남색 장우산 보신 분?",
      body: "오늘 아침 8시 10분쯤 놓고 내렸어요 ㅠㅠ 역무실에 맡겨 주셨다면 정말 감사하겠습니다",
      minutesAgo: 48,
      views: 76,
      likes: 6,
      comments: 2,
      reply: { station: "군자역", author: "아침형인간", text: "역무실에 우산 몇 개 들어와 있던데 한번 가 보세요!" },
    },
    {
      id: "wangsimni-car",
      station: "왕십리역",
      author: "칸고수",
      category: "commute",
      title: "왕십리역 환승은 5-3번 칸이 제일 빨라요",
      body: "내리자마자 에스컬레이터라 2호선까지 1분 컷입니다. 출근길 꿀팁 공유해요 🍯",
      minutesAgo: 95,
      views: 342,
      likes: 57,
      comments: 15,
    },
  ],
  "2호선": [
    {
      id: "seongsu-popup",
      station: "성수역",
      author: "팝업헌터",
      category: "food",
      title: "성수역 3번 출구 팝업 오늘 대기 40분이에요",
      body: "오픈런 실패했습니다... 근처 소금빵집은 웨이팅 없어요 🥐",
      minutesAgo: 7,
      views: 188,
      likes: 41,
      comments: 9,
      reply: { station: "건대입구역", author: "빵순이", text: "소금빵 정보 감사합니다 지금 출발해요!" },
    },
    {
      id: "gangnam-crowd",
      station: "강남역",
      author: "출근전사",
      category: "commute",
      title: "강남역 외선순환 지금 한 대 보내야 탈 수 있어요",
      body: "10-4번 칸 쪽이 그나마 여유 있습니다. 다들 힘내세요 💪",
      minutesAgo: 16,
      views: 256,
      likes: 33,
      comments: 11,
    },
    {
      id: "hongdae-card",
      station: "홍대입구역",
      author: "홍대주민",
      category: "lost",
      title: "홍대입구역 9번 출구 쪽에서 교통카드 주웠어요",
      body: "캐릭터 케이스에 들어 있는 카드예요. 역무실에 맡겨 두었습니다!",
      minutesAgo: 41,
      views: 64,
      likes: 12,
      comments: 1,
    },
  ],
};

const LINE_HUBS: Partial<Record<string, [string, string, string]>> = {
  "1호선": ["서울역", "종각역", "신도림역"],
  "2호선": ["잠실역", "신촌역", "사당역"],
  "3호선": ["교대역", "일원역", "경복궁역"],
  "4호선": ["명동역", "혜화역", "사당역"],
  "5호선": ["장한평역", "광화문역", "여의도역"],
  "6호선": ["이태원역", "합정역", "망원역"],
  "7호선": ["건대입구역", "고속터미널역", "가산디지털단지역"],
  "8호선": ["잠실역", "천호역", "모란역"],
  "9호선": ["여의도역", "신논현역", "노량진역"],
};

function genericSeeds(line: string): SeedPost[] {
  const [a, b, c] = LINE_HUBS[line] ?? [line, line, line];
  return [
    {
      id: "crowd",
      station: a,
      author: "출근요정",
      category: "commute",
      title: `${a} 출근길 지금 승강장 얼마나 붐비나요?`,
      body: "방금 도착했는데 한 대 보내야 할 것 같아요. 다들 몇 번 칸 타세요?",
      minutesAgo: 14,
      views: 97,
      likes: 16,
      comments: 6,
      reply: { station: b, author: "끝칸러버", text: "맨 끝 칸 쪽이 그나마 여유 있어요!" },
    },
    {
      id: "lunch",
      station: b,
      author: "혼밥장인",
      category: "food",
      title: `${b} 근처 혼밥하기 좋은 곳 추천해 주세요`,
      body: "출구에서 가까우면 더 좋아요 🍚",
      minutesAgo: 38,
      views: 71,
      likes: 9,
      comments: 4,
    },
    {
      id: "airpods",
      station: c,
      author: "꿀벌",
      category: "lost",
      title: `${c} 화장실 앞에서 에어팟 케이스 보신 분 ㅠㅠ`,
      body: "흰색 케이스에 꿀벌 스티커 붙어 있어요 🐝 보시면 댓글 부탁드려요!",
      minutesAgo: 70,
      views: 58,
      likes: 5,
      comments: 2,
    },
    {
      id: "cool-car",
      station: a,
      author: `${line.replace("호선", "")}호선지기`,
      category: "free",
      title: `${line} 약냉방칸 위치 공유해요`,
      body: "보통 4번째, 7번째 칸이 약냉방이에요. 추위 타시는 분들 참고하세요!",
      minutesAgo: 120,
      views: 233,
      likes: 27,
      comments: 5,
    },
  ];
}

const STORAGE_KEY = "subway-ggul:spot";
const MAX_POSTS = 100;
const MAX_COMMENTS = 50;
const listeners = new Set<() => void>();
let seedBase: number | null = null;

function emptyStored(): Stored {
  return { posts: [], liked: [], scrapped: [], viewed: [], comments: {} };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Stored {
  if (!raw) return emptyStored();
  try {
    const value = JSON.parse(raw) as Partial<Stored>;
    return {
      posts: Array.isArray(value.posts) ? value.posts : [],
      liked: Array.isArray(value.liked) ? value.liked : [],
      scrapped: Array.isArray(value.scrapped) ? value.scrapped : [],
      viewed: Array.isArray(value.viewed) ? value.viewed : [],
      comments: value.comments && typeof value.comments === "object" ? value.comments : {},
    };
  } catch {
    return emptyStored();
  }
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

function useStored(): Stored {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}

function newId(prefix: string) {
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function seedPosts(line: string) {
  seedBase ??= Date.now();
  const base = seedBase;
  return (LINE_SEEDS[line] ?? genericSeeds(line)).map((seed) => ({
    seed,
    post: {
      id: `seed:${line}:${seed.id}`,
      line,
      station: seed.station,
      author: seed.author,
      category: seed.category,
      title: seed.title,
      body: seed.body,
      createdAt: base - seed.minutesAgo * 60_000,
    } satisfies StoredPost,
  }));
}

function toComment(comment: StoredComment, mine: boolean): SpotComment {
  return { ...comment, mine };
}

function buildPost(stored: Stored, post: StoredPost, seed: SeedPost | null): SpotPost {
  const liked = stored.liked.includes(post.id);
  const viewed = stored.viewed.includes(post.id);
  const myComments = (stored.comments[post.id] ?? []).map((comment) => toComment(comment, true));
  const bestReply = seed?.reply
    ? { id: `${post.id}:reply`, ...seed.reply, createdAt: post.createdAt + 60_000, mine: false }
    : null;
  return {
    ...post,
    views: (seed?.views ?? 0) + (viewed ? 1 : 0),
    likes: (seed?.likes ?? 0) + (liked ? 1 : 0),
    liked,
    scrapped: stored.scrapped.includes(post.id),
    commentCount: (seed?.comments ?? 0) + myComments.length,
    bestReply: bestReply ?? myComments[0] ?? null,
    comments: [...(bestReply ? [bestReply] : []), ...myComments],
    mine: seed === null,
  };
}

function postsForLine(stored: Stored, line: string): SpotPost[] {
  const seeds = seedPosts(line).map(({ seed, post }) => buildPost(stored, post, seed));
  const mine = stored.posts.filter((post) => post.line === line).map((post) => buildPost(stored, post, null));
  return [...mine, ...seeds].sort((a, b) => b.createdAt - a.createdAt);
}

export function useSpotPosts(line: string): SpotPost[] {
  const stored = useStored();
  return useMemo(() => postsForLine(stored, line), [stored, line]);
}

export function filterSpotPosts(posts: SpotPost[], tab: SpotTab, query: string) {
  const q = query.trim().toLowerCase();
  const matched = q
    ? posts.filter((post) => `${post.title} ${post.body} ${post.station ?? ""}`.toLowerCase().includes(q))
    : posts;
  if (tab === "all") return matched;
  if (tab === "popular") {
    return matched
      .filter((post) => post.likes >= POPULAR_MIN_LIKES)
      .sort((a, b) => b.likes + b.commentCount * 2 - (a.likes + a.commentCount * 2));
  }
  return matched.filter((post) => post.category === tab);
}

export type SpotActivity = { posts: SpotPost[]; scrapped: SpotPost[]; commentCount: number };

/** Everything the user did in Honey Spot, across all line plazas. */
export function useSpotActivity(): SpotActivity {
  const stored = useStored();
  return useMemo(() => {
    const lines = new Set([...PLAZA_LINES, ...stored.posts.map((post) => post.line)]);
    const all = [...lines].flatMap((line) => postsForLine(stored, line));
    return {
      posts: all.filter((post) => post.mine).sort((a, b) => b.createdAt - a.createdAt),
      scrapped: all.filter((post) => post.scrapped),
      commentCount: Object.values(stored.comments).reduce((sum, list) => sum + list.length, 0),
    };
  }, [stored]);
}

export function addSpotPost(post: Omit<StoredPost, "id" | "createdAt">) {
  const stored = parse(readRaw());
  const next: StoredPost = { ...post, id: newId("user"), createdAt: Date.now() };
  write({ ...stored, posts: [next, ...stored.posts].slice(0, MAX_POSTS) });
  return next.id;
}

export function deleteSpotPost(id: string) {
  const stored = parse(readRaw());
  const comments = { ...stored.comments };
  delete comments[id];
  write({
    ...stored,
    posts: stored.posts.filter((post) => post.id !== id),
    liked: stored.liked.filter((item) => item !== id),
    scrapped: stored.scrapped.filter((item) => item !== id),
    comments,
  });
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id].slice(-MAX_POSTS * 3);
}

/** Returns true when the post is now liked. */
export function toggleSpotLike(id: string) {
  const stored = parse(readRaw());
  write({ ...stored, liked: toggle(stored.liked, id) });
  return !stored.liked.includes(id);
}

/** Returns true when the post is now scrapped. */
export function toggleSpotScrap(id: string) {
  const stored = parse(readRaw());
  write({ ...stored, scrapped: toggle(stored.scrapped, id) });
  return !stored.scrapped.includes(id);
}

export function markSpotViewed(id: string) {
  const stored = parse(readRaw());
  if (stored.viewed.includes(id)) return;
  write({ ...stored, viewed: [...stored.viewed, id].slice(-MAX_POSTS * 3) });
}

export function addSpotComment(postId: string, comment: Omit<StoredComment, "id" | "createdAt">) {
  const stored = parse(readRaw());
  const next: StoredComment = { ...comment, id: newId("comment"), createdAt: Date.now() };
  const list = [...(stored.comments[postId] ?? []), next].slice(-MAX_COMMENTS);
  write({ ...stored, comments: { ...stored.comments, [postId]: list } });
}

function hash(value: string) {
  return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 100_000, 7);
}

/** Simulated "people chatting now" count until there is a real presence server. */
export function plazaOnlineCount(line: string, now: number) {
  const seed = hash(line);
  return 140 + (seed % 260) + Math.round(Math.sin(now / 90_000 + seed) * 18);
}
