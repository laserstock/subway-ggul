"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { type Locale } from "./i18n";
import { recordReport } from "./profile";
import { stationFeedKey, type Localized, type StationOption } from "./stations";
import {
  currentUserId,
  ensureUser,
  getSupabase,
  isDuplicate,
  notifyServerError,
  onUserChange,
  TEMP_PREFIX,
  tempId,
  useUserId,
} from "./supabase";

export type ReportType = "toilet_paper" | "escalator" | "crowd" | "general";

export type Report = {
  id: string;
  type: ReportType;
  text: Localized;
  likes: number;
  liked: boolean;
  createdAt: number;
  /** Last time anyone tapped "still true"; restarts the report's TTL. */
  confirmedAt: number | null;
};

export type MyReport = {
  id: string;
  stationName: Localized;
  text: Localized;
  createdAt: number;
};

type ReportRow = {
  id: string;
  station_key: string;
  station_name: Localized;
  type: ReportType;
  text: Localized;
  author_id: string;
  created_at: string;
  confirm_count: number;
  last_confirmed_at: string | null;
  resolved_at: string | null;
};

type State = {
  byStation: Readonly<Record<string, ReportRow[]>>;
  mine: ReportRow[];
  confirmed: ReadonlySet<string>;
  resolved: ReadonlySet<string>;
};

const COLUMNS =
  "id, station_key, station_name, type, text, author_id, created_at, confirm_count, last_confirmed_at, resolved_at";
/** Longest TTL is 2 h; a day back is plenty for the "expired" drawer. */
const FEED_WINDOW_MS = 24 * 60 * 60_000;
const FEED_LIMIT = 50;
const MY_LIMIT = 100;
const REFRESH_MS = 60_000;
const CLOCK_TICK = 30_000;

let state: State = { byStation: {}, mine: [], confirmed: new Set(), resolved: new Set() };
const listeners = new Set<() => void>();
const fetchedAt = new Map<string, number>();
let ownFor: string | null = null;
let realtimeStarted = false;
let clockNow = 0;

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

const TYPE_KEYWORDS: [ReportType, RegExp][] = [
  ["toilet_paper", /휴지|화장실|위생|tissue|toilet|restroom|卫生间|纸巾|トイレ|ティッシュ/i],
  ["escalator", /에스컬|엘리베이터|승강기|고장|escalator|elevator|lift|扶梯|电梯|エスカレーター|エレベーター/i],
  ["crowd", /붐|혼잡|사람\s*많|crowd|busy|拥挤|混雑/i],
];

export function inferReportType(text: string): ReportType {
  return TYPE_KEYWORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
}

function subscribeClock(listener: () => void) {
  const timer = window.setInterval(() => {
    clockNow = Date.now();
    listener();
  }, CLOCK_TICK);
  return () => window.clearInterval(timer);
}

function readClock() {
  if (!clockNow) clockNow = Date.now();
  return clockNow;
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, readClock, () => null);
}

function upsertRow(row: ReportRow) {
  const replace = (list: ReportRow[]) =>
    list.some((item) => item.id === row.id)
      ? list.map((item) => (item.id === row.id ? row : item))
      : [row, ...list];
  const feed = state.byStation[row.station_key];
  const uid = currentUserId();
  setState({
    byStation:
      feed !== undefined
        ? {
            ...state.byStation,
            [row.station_key]: row.resolved_at ? feed.filter((item) => item.id !== row.id) : replace(feed),
          }
        : state.byStation,
    mine:
      row.author_id === uid || state.mine.some((item) => item.id === row.id) ? replace(state.mine) : state.mine,
  });
}

function removeRow(id: string) {
  setState({
    byStation: Object.fromEntries(
      Object.entries(state.byStation).map(([key, list]) => [key, list.filter((item) => item.id !== id)]),
    ),
    mine: state.mine.filter((item) => item.id !== id),
  });
}

function patchRow(id: string, patch: (row: ReportRow) => ReportRow) {
  const apply = (list: ReportRow[]) => list.map((item) => (item.id === id ? patch(item) : item));
  setState({
    byStation: Object.fromEntries(Object.entries(state.byStation).map(([key, list]) => [key, apply(list)])),
    mine: apply(state.mine),
  });
}

function findRow(id: string) {
  return (
    Object.values(state.byStation)
      .flat()
      .find((item) => item.id === id) ?? state.mine.find((item) => item.id === id)
  );
}

function onRealtime(payload: RealtimePostgresChangesPayload<ReportRow>) {
  if (payload.eventType === "DELETE") {
    if (payload.old.id) removeRow(payload.old.id);
    return;
  }
  upsertRow(payload.new);
}

function startRealtime() {
  if (realtimeStarted) return;
  const supabase = getSupabase();
  if (!supabase) return;
  realtimeStarted = true;
  supabase
    .channel("reports")
    .on<ReportRow>("postgres_changes", { event: "*", schema: "public", table: "reports" }, onRealtime)
    .subscribe();
}

async function fetchStation(key: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  fetchedAt.set(key, Date.now());
  const { data, error } = await supabase
    .from("reports")
    .select(COLUMNS)
    .eq("station_key", key)
    .is("resolved_at", null)
    .gte("created_at", new Date(Date.now() - FEED_WINDOW_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (error) {
    fetchedAt.delete(key);
    return;
  }
  const pending = (state.byStation[key] ?? []).filter((row) => row.id.startsWith(TEMP_PREFIX));
  setState({ byStation: { ...state.byStation, [key]: [...pending, ...(data as ReportRow[])] } });
}

function ensureStation(key: string) {
  startRealtime();
  const last = fetchedAt.get(key);
  if (last === undefined || Date.now() - last > REFRESH_MS) void fetchStation(key);
}

/** The user's own reports, confirmations and resolutions — reloaded whenever the device account changes. */
async function fetchOwn() {
  const supabase = getSupabase();
  const uid = currentUserId();
  if (!supabase || !uid || ownFor === uid) return;
  ownFor = uid;
  const [mine, confirmed, resolved] = await Promise.all([
    supabase
      .from("reports")
      .select(COLUMNS)
      .eq("author_id", uid)
      .order("created_at", { ascending: false })
      .limit(MY_LIMIT),
    supabase.from("report_confirmations").select("report_id").order("created_at", { ascending: false }).limit(300),
    supabase.from("report_resolutions").select("report_id").order("created_at", { ascending: false }).limit(300),
  ]);
  if (mine.error || confirmed.error || resolved.error) {
    ownFor = null;
    return;
  }
  // Merge rather than replace: taps made while the first sign-in was in flight are already in state.
  const ids = (rows: { report_id: string }[]) => rows.map((row) => row.report_id);
  setState({
    mine: [...state.mine.filter((row) => row.id.startsWith(TEMP_PREFIX)), ...(mine.data as ReportRow[])],
    confirmed: new Set([...state.confirmed, ...ids(confirmed.data as { report_id: string }[])]),
    resolved: new Set([...state.resolved, ...ids(resolved.data as { report_id: string }[])]),
  });
}

function useOwnData() {
  useEffect(() => {
    void fetchOwn();
    return onUserChange(() => void fetchOwn());
  }, []);
}

const EMPTY: ReportRow[] = [];

export function useStationReports(station: StationOption | null): Report[] {
  const snapshot = useSyncExternalStore(subscribe, readState, readState);
  const uid = useUserId();
  const key = station ? stationFeedKey(station) : null;
  useOwnData();

  useEffect(() => {
    if (key) ensureStation(key);
  }, [key]);

  return useMemo(() => {
    const rows = key ? (snapshot.byStation[key] ?? EMPTY) : EMPTY;
    return rows
      .filter((row) => !row.resolved_at && !snapshot.resolved.has(row.id))
      .map((row) => ({
        id: row.id,
        type: row.type,
        text: row.text,
        likes: row.confirm_count,
        liked: uid !== null && snapshot.confirmed.has(row.id),
        createdAt: Date.parse(row.created_at),
        confirmedAt: row.last_confirmed_at ? Date.parse(row.last_confirmed_at) : null,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [snapshot, key, uid]);
}

export function useMyReports(): MyReport[] {
  const snapshot = useSyncExternalStore(subscribe, readState, readState);
  useOwnData();
  return useMemo(
    () =>
      snapshot.mine
        .map((row) => ({
          id: row.id,
          stationName: row.station_name,
          text: row.text,
          createdAt: Date.parse(row.created_at),
        }))
        .sort((a, b) => b.createdAt - a.createdAt),
    [snapshot],
  );
}

export async function deleteReport(id: string) {
  const supabase = getSupabase();
  const row = findRow(id);
  if (!supabase || !row) return false;
  removeRow(id);
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) {
    upsertRow(row);
    notifyServerError(error);
    return false;
  }
  return true;
}

export async function addReport(
  station: StationOption,
  text: Localized,
  type: ReportType = inferReportType(text.ko),
) {
  const supabase = getSupabase();
  const uid = await ensureUser();
  if (!supabase || !uid) {
    notifyServerError();
    return false;
  }
  const key = stationFeedKey(station);
  const temp: ReportRow = {
    id: tempId(),
    station_key: key,
    station_name: station.name,
    type,
    text,
    author_id: uid,
    created_at: new Date().toISOString(),
    confirm_count: 0,
    last_confirmed_at: null,
    resolved_at: null,
  };
  upsertRow(temp);
  const { data, error } = await supabase
    .from("reports")
    .insert({ station_key: key, station_name: station.name, type, text })
    .select(COLUMNS)
    .single();
  removeRow(temp.id);
  if (error || !data) {
    notifyServerError(error);
    return false;
  }
  upsertRow(data as ReportRow);
  recordReport();
  return true;
}

/** "Still true": +1 upvote and restarts the TTL for everyone. Tapping again withdraws it. Returns the new state. */
export function confirmReport(id: string) {
  if (id.startsWith(TEMP_PREFIX)) return false;
  const adding = !state.confirmed.has(id);
  const nextSet = (add: boolean) => {
    const next = new Set(state.confirmed);
    if (add) next.add(id);
    else next.delete(id);
    return next;
  };
  setState({ confirmed: nextSet(adding) });
  patchRow(id, (row) => ({
    ...row,
    confirm_count: Math.max(0, row.confirm_count + (adding ? 1 : -1)),
    last_confirmed_at: adding ? new Date().toISOString() : row.last_confirmed_at,
  }));

  void (async () => {
    const supabase = getSupabase();
    const uid = await ensureUser();
    const { error } =
      !supabase || !uid
        ? { error: { code: "offline" } }
        : adding
          ? await supabase.from("report_confirmations").insert({ report_id: id })
          : await supabase.from("report_confirmations").delete().eq("report_id", id).eq("user_id", uid);
    if (error && !isDuplicate(error)) {
      setState({ confirmed: nextSet(!adding) });
      patchRow(id, (row) => ({ ...row, confirm_count: Math.max(0, row.confirm_count + (adding ? -1 : 1)) }));
      notifyServerError(error);
    }
  })();
  return adding;
}

/** "Resolved": hides the report for this user right away, and for everyone once the author or two people agree. */
export function resolveReport(id: string) {
  if (id.startsWith(TEMP_PREFIX)) return;
  if (state.confirmed.has(id)) confirmReport(id);
  setState({ resolved: new Set(state.resolved).add(id) });

  void (async () => {
    const supabase = getSupabase();
    const uid = await ensureUser();
    const { error } = !supabase || !uid
      ? { error: { code: "offline" } }
      : await supabase.from("report_resolutions").insert({ report_id: id });
    if (error && !isDuplicate(error)) {
      const next = new Set(state.resolved);
      next.delete(id);
      setState({ resolved: next });
      notifyServerError(error);
    }
  })();
}

const AGO: Record<Locale, { now: string; minutes: string; hours: string; days: string }> = {
  ko: { now: "방금 전", minutes: "{n}분 전", hours: "{n}시간 전", days: "{n}일 전" },
  en: { now: "just now", minutes: "{n} min ago", hours: "{n} h ago", days: "{n} d ago" },
  zh: { now: "刚刚", minutes: "{n}分钟前", hours: "{n}小时前", days: "{n}天前" },
  ja: { now: "たった今", minutes: "{n}分前", hours: "{n}時間前", days: "{n}日前" },
};

export function formatRelativeTime(createdAt: number, now: number, locale: Locale) {
  const copy = AGO[locale];
  const minutes = Math.max(0, Math.floor((now - createdAt) / 60_000));
  if (minutes < 1) return copy.now;
  if (minutes < 60) return copy.minutes.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return copy.hours.replace("{n}", String(hours));
  return copy.days.replace("{n}", String(Math.floor(hours / 24)));
}
