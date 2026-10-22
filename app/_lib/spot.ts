"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  currentUserId,
  deviceId,
  ensureUser,
  getSupabase,
  isDuplicate,
  notifyServerError,
  onUserChange,
  TEMP_PREFIX,
  tempId,
  useUserId,
} from "./supabase";

export const SPOT_CATEGORIES = ["commute", "food", "lost", "free"] as const;
export type SpotCategory = (typeof SPOT_CATEGORIES)[number];

export const SPOT_TABS = ["all", "popular", "commute", "food", "lost"] as const;
export type SpotTab = (typeof SPOT_TABS)[number];

export const PLAZA_LINES = ["1호선", "2호선", "3호선", "4호선", "5호선", "6호선", "7호선", "8호선", "9호선"];
export const DEFAULT_PLAZA_LINE = "2호선";

export const SPOT_TITLE_MAX = 40;
export const SPOT_BODY_MAX = 300;
export const SPOT_COMMENT_MAX = 150;
/** Comments loaded per post (newest first on the server, shown oldest first). */
export const SPOT_COMMENTS_SHOWN = 50;
/** Likes needed before a post shows up in the "popular" tab. */
const POPULAR_MIN_LIKES = 5;

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

type PostRow = {
  id: string;
  line: string;
  station: string | null;
  author: string;
  category: SpotCategory;
  title: string;
  body: string;
  author_id: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  view_count: number;
};

type CommentRow = {
  id: string;
  post_id: string;
  station: string | null;
  author: string;
  text: string;
  author_id: string;
  created_at: string;
};

type PostWithComments = PostRow & { spot_comments?: CommentRow[] };

type State = {
  posts: Readonly<Record<string, PostRow>>;
  comments: Readonly<Record<string, CommentRow[]>>;
  lineIds: Readonly<Record<string, string[]>>;
  myIds: string[];
  scrapIds: string[];
  liked: ReadonlySet<string>;
  myCommentCount: number;
};

const POST_COLUMNS =
  "id, line, station, author, category, title, body, author_id, created_at, like_count, comment_count, view_count";
const COMMENT_COLUMNS = "id, post_id, station, author, text, author_id, created_at";
const WITH_COMMENTS = `${POST_COLUMNS}, spot_comments(${COMMENT_COLUMNS})`;
const LINE_LIMIT = 100;
const MY_LIMIT = 100;
const REFRESH_MS = 60_000;

let state: State = {
  posts: {},
  comments: {},
  lineIds: {},
  myIds: [],
  scrapIds: [],
  liked: new Set(),
  myCommentCount: 0,
};
const listeners = new Set<() => void>();
const fetchedAt = new Map<string, number>();
const viewed = new Set<string>();
let ownFor: string | null = null;
let realtimeStarted = false;

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const readState = () => state;

function byNewest(ids: Iterable<string>, posts: Readonly<Record<string, PostRow>>) {
  return [...new Set(ids)]
    .filter((id) => posts[id])
    .sort((a, b) => Date.parse(posts[b].created_at) - Date.parse(posts[a].created_at));
}

/** Folds fetched posts (and their embedded comments) into the normalized cache. */
function mergePosts(rows: PostWithComments[]) {
  const posts = { ...state.posts };
  const comments = { ...state.comments };
  for (const { spot_comments, ...post } of rows) {
    posts[post.id] = post;
    if (spot_comments) {
      comments[post.id] = [...spot_comments].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    }
  }
  return { posts, comments };
}

function putPost(row: PostRow) {
  const posts = { ...state.posts, [row.id]: row };
  const known = state.lineIds[row.line];
  const uid = currentUserId();
  setState({
    posts,
    lineIds: known ? { ...state.lineIds, [row.line]: byNewest([row.id, ...known], posts) } : state.lineIds,
    myIds: row.author_id === uid ? byNewest([row.id, ...state.myIds], posts) : state.myIds,
  });
}

function dropPost(id: string) {
  const posts = { ...state.posts };
  delete posts[id];
  const comments = { ...state.comments };
  delete comments[id];
  const without = (ids: string[]) => ids.filter((item) => item !== id);
  setState({
    posts,
    comments,
    lineIds: Object.fromEntries(Object.entries(state.lineIds).map(([line, ids]) => [line, without(ids)])),
    myIds: without(state.myIds),
    scrapIds: without(state.scrapIds),
  });
}

function patchPost(id: string, patch: (row: PostRow) => PostRow) {
  const row = state.posts[id];
  if (row) setState({ posts: { ...state.posts, [id]: patch(row) } });
}

function putComment(row: CommentRow) {
  const list = state.comments[row.post_id] ?? [];
  const next = list.some((item) => item.id === row.id)
    ? list.map((item) => (item.id === row.id ? row : item))
    : [...list, row];
  setState({ comments: { ...state.comments, [row.post_id]: next } });
}

function dropComment(id: string) {
  setState({
    comments: Object.fromEntries(
      Object.entries(state.comments).map(([postId, list]) => [postId, list.filter((item) => item.id !== id)]),
    ),
  });
}

function onPostChange(payload: RealtimePostgresChangesPayload<PostRow>) {
  if (payload.eventType === "DELETE") {
    if (payload.old.id) dropPost(payload.old.id);
  } else if (payload.eventType === "UPDATE" || state.lineIds[payload.new.line]) {
    putPost(payload.new);
  }
}

function onCommentChange(payload: RealtimePostgresChangesPayload<CommentRow>) {
  if (payload.eventType === "DELETE") {
    if (payload.old.id) dropComment(payload.old.id);
  } else if (state.posts[payload.new.post_id]) {
    putComment(payload.new);
  }
}

function startRealtime() {
  if (realtimeStarted) return;
  const supabase = getSupabase();
  if (!supabase) return;
  realtimeStarted = true;
  supabase
    .channel("spot")
    .on<PostRow>("postgres_changes", { event: "*", schema: "public", table: "spot_posts" }, onPostChange)
    .on<CommentRow>("postgres_changes", { event: "*", schema: "public", table: "spot_comments" }, onCommentChange)
    .subscribe();
}

async function fetchLine(line: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  fetchedAt.set(line, Date.now());
  const { data, error } = await supabase
    .from("spot_posts")
    .select(WITH_COMMENTS)
    .eq("line", line)
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: false, referencedTable: "spot_comments" })
    .limit(SPOT_COMMENTS_SHOWN, { referencedTable: "spot_comments" })
    .limit(LINE_LIMIT);
  if (error) {
    fetchedAt.delete(line);
    return;
  }
  const rows = data as PostWithComments[];
  const { posts, comments } = mergePosts(rows);
  const pending = (state.lineIds[line] ?? []).filter((id) => id.startsWith(TEMP_PREFIX));
  setState({ posts, comments, lineIds: { ...state.lineIds, [line]: byNewest([...pending, ...rows.map((row) => row.id)], posts) } });
}

function ensureLine(line: string) {
  startRealtime();
  const last = fetchedAt.get(line);
  if (last === undefined || Date.now() - last > REFRESH_MS) void fetchLine(line);
}

/** Own posts, scraps, likes and comment count — reloaded whenever the device account changes. */
async function fetchOwn() {
  const supabase = getSupabase();
  const uid = currentUserId();
  if (!supabase || !uid || ownFor === uid) return;
  ownFor = uid;
  const [mine, scraps, likes, commentCount] = await Promise.all([
    supabase
      .from("spot_posts")
      .select(WITH_COMMENTS)
      .eq("author_id", uid)
      .order("created_at", { ascending: false })
      .order("created_at", { ascending: false, referencedTable: "spot_comments" })
      .limit(SPOT_COMMENTS_SHOWN, { referencedTable: "spot_comments" })
      .limit(MY_LIMIT),
    supabase
      .from("spot_scraps")
      .select(`post_id, spot_posts(${WITH_COMMENTS})`)
      .order("created_at", { ascending: false })
      .limit(MY_LIMIT),
    supabase.from("spot_likes").select("post_id").order("created_at", { ascending: false }).limit(500),
    supabase.from("spot_comments").select("id", { count: "exact", head: true }).eq("author_id", uid),
  ]);
  if (mine.error || scraps.error || likes.error || commentCount.error) {
    ownFor = null;
    return;
  }
  const scrapRows = (scraps.data as unknown as { post_id: string; spot_posts: PostWithComments | null }[]).flatMap(
    (row) => (row.spot_posts ? [row.spot_posts] : []),
  );
  const myRows = mine.data as PostWithComments[];
  const { posts, comments } = mergePosts([...myRows, ...scrapRows]);
  // Merge rather than replace: taps made while the first sign-in was in flight are already in state.
  setState({
    posts,
    comments,
    myIds: byNewest([...state.myIds, ...myRows.map((row) => row.id)], posts),
    scrapIds: [...new Set([...state.scrapIds, ...scrapRows.map((row) => row.id)])],
    liked: new Set([...state.liked, ...(likes.data as { post_id: string }[]).map((row) => row.post_id)]),
    myCommentCount: Math.max(state.myCommentCount, commentCount.count ?? 0),
  });
}

function useOwnData() {
  useEffect(() => {
    void fetchOwn();
    return onUserChange(() => void fetchOwn());
  }, []);
}

function toComment(row: CommentRow, uid: string | null): SpotComment {
  return {
    id: row.id,
    station: row.station,
    author: row.author,
    text: row.text,
    createdAt: Date.parse(row.created_at),
    mine: uid !== null && row.author_id === uid,
  };
}

function buildPost(snapshot: State, row: PostRow, uid: string | null): SpotPost {
  const comments = (snapshot.comments[row.id] ?? []).map((comment) => toComment(comment, uid));
  return {
    id: row.id,
    line: row.line,
    station: row.station,
    author: row.author,
    category: row.category,
    title: row.title,
    body: row.body,
    createdAt: Date.parse(row.created_at),
    views: row.view_count,
    likes: row.like_count,
    liked: snapshot.liked.has(row.id),
    scrapped: snapshot.scrapIds.includes(row.id),
    commentCount: Math.max(row.comment_count, comments.length),
    bestReply: comments[0] ?? null,
    comments,
    mine: uid !== null && row.author_id === uid,
  };
}

function buildPosts(snapshot: State, ids: string[], uid: string | null) {
  return ids.flatMap((id) => (snapshot.posts[id] ? [buildPost(snapshot, snapshot.posts[id], uid)] : []));
}

const NO_IDS: string[] = [];

export function useSpotPosts(line: string): SpotPost[] {
  const snapshot = useSyncExternalStore(subscribe, readState, readState);
  const uid = useUserId();
  useOwnData();

  useEffect(() => {
    ensureLine(line);
  }, [line]);

  return useMemo(() => buildPosts(snapshot, snapshot.lineIds[line] ?? NO_IDS, uid), [snapshot, line, uid]);
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
  const snapshot = useSyncExternalStore(subscribe, readState, readState);
  const uid = useUserId();
  useOwnData();
  return useMemo(
    () => ({
      posts: buildPosts(snapshot, snapshot.myIds, uid),
      scrapped: buildPosts(snapshot, snapshot.scrapIds, uid),
      commentCount: snapshot.myCommentCount,
    }),
    [snapshot, uid],
  );
}

export async function addSpotPost(post: {
  line: string;
  station: string | null;
  author: string;
  category: SpotCategory;
  title: string;
  body: string;
}) {
  const supabase = getSupabase();
  const uid = await ensureUser();
  if (!supabase || !uid) {
    notifyServerError();
    return false;
  }
  const temp: PostRow = {
    ...post,
    id: tempId(),
    author_id: uid,
    created_at: new Date().toISOString(),
    like_count: 0,
    comment_count: 0,
    view_count: 0,
  };
  const known = state.lineIds[post.line] ?? [];
  setState({ lineIds: { ...state.lineIds, [post.line]: [temp.id, ...known] } });
  putPost(temp);
  const { data, error } = await supabase.from("spot_posts").insert(post).select(POST_COLUMNS).single();
  dropPost(temp.id);
  if (error || !data) {
    notifyServerError(error);
    return false;
  }
  putPost(data as PostRow);
  return true;
}

export async function deleteSpotPost(id: string) {
  const supabase = getSupabase();
  const row = state.posts[id];
  if (!supabase || !row || id.startsWith(TEMP_PREFIX)) return false;
  const comments = state.comments[id];
  dropPost(id);
  const { error } = await supabase.from("spot_posts").delete().eq("id", id);
  if (error) {
    putPost(row);
    if (comments) setState({ comments: { ...state.comments, [id]: comments } });
    notifyServerError(error);
    return false;
  }
  return true;
}

function toggled(set: ReadonlySet<string>, id: string, on: boolean) {
  const next = new Set(set);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

/** Returns true when the post is now liked. */
export function toggleSpotLike(id: string) {
  if (id.startsWith(TEMP_PREFIX)) return false;
  const liking = !state.liked.has(id);
  const apply = (on: boolean) => {
    setState({ liked: toggled(state.liked, id, on) });
    patchPost(id, (row) => ({ ...row, like_count: Math.max(0, row.like_count + (on ? 1 : -1)) }));
  };
  apply(liking);

  void (async () => {
    const supabase = getSupabase();
    const uid = await ensureUser();
    const { error } =
      !supabase || !uid
        ? { error: { code: "offline" } }
        : liking
          ? await supabase.from("spot_likes").insert({ post_id: id })
          : await supabase.from("spot_likes").delete().eq("post_id", id).eq("user_id", uid);
    if (error && !isDuplicate(error)) {
      apply(!liking);
      notifyServerError(error);
    }
  })();
  return liking;
}

/** Returns true when the post is now scrapped. */
export function toggleSpotScrap(id: string) {
  if (id.startsWith(TEMP_PREFIX)) return false;
  const scrapping = !state.scrapIds.includes(id);
  const apply = (on: boolean) =>
    setState({ scrapIds: on ? [id, ...state.scrapIds.filter((item) => item !== id)] : state.scrapIds.filter((item) => item !== id) });
  apply(scrapping);

  void (async () => {
    const supabase = getSupabase();
    const uid = await ensureUser();
    const { error } =
      !supabase || !uid
        ? { error: { code: "offline" } }
        : scrapping
          ? await supabase.from("spot_scraps").insert({ post_id: id })
          : await supabase.from("spot_scraps").delete().eq("post_id", id).eq("user_id", uid);
    if (error && !isDuplicate(error)) {
      apply(!scrapping);
      notifyServerError(error);
    }
  })();
  return scrapping;
}

/** One view per device per post; the server counter ignores repeats. */
export function markSpotViewed(id: string) {
  const supabase = getSupabase();
  if (!supabase || id.startsWith(TEMP_PREFIX) || viewed.has(id)) return;
  viewed.add(id);
  void supabase
    .from("spot_views")
    .insert({ post_id: id, viewer: deviceId() })
    .then(({ error }) => {
      if (!error) patchPost(id, (row) => ({ ...row, view_count: row.view_count + 1 }));
    });
}

export async function addSpotComment(postId: string, comment: { station: string | null; author: string; text: string }) {
  const supabase = getSupabase();
  if (postId.startsWith(TEMP_PREFIX)) return false;
  const uid = await ensureUser();
  if (!supabase || !uid) {
    notifyServerError();
    return false;
  }
  const temp: CommentRow = { ...comment, id: tempId(), post_id: postId, author_id: uid, created_at: new Date().toISOString() };
  putComment(temp);
  const { data, error } = await supabase
    .from("spot_comments")
    .insert({ post_id: postId, ...comment })
    .select(COMMENT_COLUMNS)
    .single();
  dropComment(temp.id);
  if (error || !data) {
    notifyServerError(error);
    return false;
  }
  putComment(data as CommentRow);
  setState({ myCommentCount: state.myCommentCount + 1 });
  return true;
}

/** Live headcount in a line plaza via Supabase Realtime presence; null until connected. */
export function usePlazaOnline(line: string): number | null {
  const [presence, setPresence] = useState<{ line: string; count: number } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase.channel(`plaza:${line}`, { config: { presence: { key: deviceId() } } });
    channel
      .on("presence", { event: "sync" }, () => setPresence({ line, count: Object.keys(channel.presenceState()).length }))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track({ joinedAt: Date.now() });
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [line]);

  return presence?.line === line ? presence.count : null;
}
