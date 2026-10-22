"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ensureUser, getSupabase, isDuplicate, notifyServerError, onUserChange, currentUserId } from "./supabase";

export type FacilityVote = "ok" | "broken";
export type FacilityTally = { ok: number; broken: number };

type State = {
  mine: Readonly<Record<string, FacilityVote>>;
  tallies: Readonly<Record<string, FacilityTally>>;
};

const REFRESH_MS = 60_000;

let state: State = { mine: {}, tallies: {} };
const listeners = new Set<() => void>();
const fetchedAt = new Map<string, number>();
let ownFor: string | null = null;

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

async function fetchTallies(ids: string[]) {
  const supabase = getSupabase();
  const stale = ids.filter((id) => Date.now() - (fetchedAt.get(id) ?? 0) > REFRESH_MS);
  if (!supabase || stale.length === 0) return;
  stale.forEach((id) => fetchedAt.set(id, Date.now()));
  const { data, error } = await supabase.rpc("facility_vote_counts", { ids: stale });
  if (error) {
    stale.forEach((id) => fetchedAt.delete(id));
    return;
  }
  const tallies: Record<string, FacilityTally> = { ...state.tallies };
  for (const id of stale) tallies[id] = { ok: 0, broken: 0 };
  for (const row of data as { facility_id: string; ok: number; broken: number }[]) {
    tallies[row.facility_id] = { ok: row.ok, broken: row.broken };
  }
  setState({ tallies });
}

async function fetchOwn() {
  const supabase = getSupabase();
  const uid = currentUserId();
  if (!supabase || !uid || ownFor === uid) return;
  ownFor = uid;
  const { data, error } = await supabase
    .from("facility_votes")
    .select("facility_id, vote")
    .gte("updated_at", new Date(Date.now() - 24 * 60 * 60_000).toISOString());
  if (error) {
    ownFor = null;
    return;
  }
  const mine: Record<string, FacilityVote> = {};
  for (const row of data as { facility_id: string; vote: FacilityVote }[]) mine[row.facility_id] = row.vote;
  setState({ mine: { ...mine, ...state.mine } });
}

/** The user's own votes plus everyone's tallies from the last 24 h, for the given facilities. */
export function useFacilityVotes(ids: string[]): { mine: Record<string, FacilityVote>; tallies: Record<string, FacilityTally> } {
  const snapshot = useSyncExternalStore(subscribe, readState, readState);
  const idsKey = ids.join("|");

  useEffect(() => {
    void fetchOwn();
    return onUserChange(() => void fetchOwn());
  }, []);

  useEffect(() => {
    if (idsKey) void fetchTallies(idsKey.split("|"));
  }, [idsKey]);

  return useMemo(() => ({ mine: { ...snapshot.mine }, tallies: { ...snapshot.tallies } }), [snapshot]);
}

/** One vote per facility; voting the same way again cancels it. */
export function voteFacility(id: string, vote: FacilityVote) {
  const previous = state.mine[id];
  const next = previous === vote ? undefined : vote;

  const apply = (from: FacilityVote | undefined, to: FacilityVote | undefined) => {
    const mine = { ...state.mine };
    if (to) mine[id] = to;
    else delete mine[id];
    const tally = { ...(state.tallies[id] ?? { ok: 0, broken: 0 }) };
    if (from) tally[from] = Math.max(0, tally[from] - 1);
    if (to) tally[to] += 1;
    setState({ mine, tallies: { ...state.tallies, [id]: tally } });
  };
  apply(previous, next);

  void (async () => {
    const supabase = getSupabase();
    const uid = await ensureUser();
    let error: { code?: string } | null = null;
    if (!supabase || !uid) error = { code: "offline" };
    else if (!next) {
      ({ error } = await supabase.from("facility_votes").delete().eq("facility_id", id).eq("user_id", uid));
    } else if (previous) {
      ({ error } = await supabase.from("facility_votes").update({ vote: next }).eq("facility_id", id).eq("user_id", uid));
    } else {
      ({ error } = await supabase.from("facility_votes").insert({ facility_id: id, vote: next }));
      if (isDuplicate(error)) {
        ({ error } = await supabase.from("facility_votes").update({ vote: next }).eq("facility_id", id).eq("user_id", uid));
      }
    }
    if (error) {
      apply(next, previous);
      notifyServerError(error);
    }
  })();
}
