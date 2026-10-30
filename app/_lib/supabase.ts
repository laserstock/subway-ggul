"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
/** Browser-safe publishable (anon) key — row level security guards the data. Never the service_role/secret key. */
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const SERVER_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { storageKey: "subway-ggul:auth", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}

let userId: string | null = null;
let authWatched = false;
let signingIn: Promise<string | null> | null = null;
const userListeners = new Set<() => void>();

function setUserId(next: string | null) {
  if (next === userId) return;
  userId = next;
  userListeners.forEach((listener) => listener());
}

function watchAuth() {
  if (authWatched) return;
  const supabase = getSupabase();
  if (!supabase) return;
  authWatched = true;
  supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
}

export function onUserChange(listener: () => void) {
  watchAuth();
  userListeners.add(listener);
  return () => {
    userListeners.delete(listener);
  };
}

/** The signed-in device account, or null for visitors who haven't written anything yet. */
export function currentUserId() {
  watchAuth();
  return userId;
}

export function useUserId(): string | null {
  return useSyncExternalStore(onUserChange, currentUserId, () => null);
}

/** Creates the per-device anonymous account on the first write, so read-only visitors don't mint users. */
export function ensureUser(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return Promise.resolve(null);
  watchAuth();
  if (userId) return Promise.resolve(userId);
  signingIn ??= (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: created, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return created.user?.id ?? null;
  })()
    .then(
      (id) => {
        setUserId(id);
        return id;
      },
      () => null,
    )
    .finally(() => {
      signingIn = null;
    });
  return signingIn;
}

export type ServerErrorKind = "offline" | "limit" | "failed";
const errorListeners = new Set<(kind: ServerErrorKind) => void>();

/**
 * Postgres 42501 = row level security refused the insert, which here means the per-user rate limit.
 * No code = the request never got an answer (network down, sign-in failed).
 */
export function notifyServerError(error?: { code?: string; message?: string } | null) {
  const code = error?.code;
  const kind: ServerErrorKind = code === "42501" ? "limit" : !code || code === "offline" ? "offline" : "failed";
  if (kind === "failed") console.error("[supabase]", code, error?.message);
  errorListeners.forEach((listener) => listener(kind));
}

export function onServerError(listener: (kind: ServerErrorKind) => void) {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

export type TopicListener = (event: string, payload: Record<string, unknown>) => void;
const topics = new Map<string, { channel: RealtimeChannel; listeners: Set<TopicListener> }>();

/**
 * Listens on a private broadcast topic fed by database triggers (see supabase/schema.sql), e.g. "spot:2호선".
 * One channel per topic however many components listen; it leaves when the last one does.
 */
export function listenTopic(topic: string, listener: TopicListener) {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  let entry = topics.get(topic);
  if (!entry) {
    const listeners = new Set<TopicListener>();
    const channel = supabase
      .channel(topic, { config: { private: true } })
      .on("broadcast", { event: "*" }, (message) => {
        const payload = (message.payload ?? {}) as Record<string, unknown>;
        listeners.forEach((each) => each(message.event, payload));
      })
      .subscribe();
    entry = { channel, listeners };
    topics.set(topic, entry);
  }
  const current = entry;
  current.listeners.add(listener);
  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size > 0 || topics.get(topic) !== current) return;
    topics.delete(topic);
    void supabase.removeChannel(current.channel);
  };
}

/** Unique-violation means the row already exists (double tap, second device tab) — treat as success. */
export function isDuplicate(error: { code?: string } | null) {
  return error?.code === "23505";
}

const DEVICE_KEY = "subway-ggul:device";
let deviceIdCache: string | null = null;

/** crypto.randomUUID only exists in secure contexts (not on http://192.168.x.x during phone testing). */
function randomUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Random id for this browser, used for view counts and presence (not an account). */
export function deviceId() {
  if (deviceIdCache) return deviceIdCache;
  try {
    deviceIdCache = window.localStorage.getItem(DEVICE_KEY);
    if (!deviceIdCache) {
      deviceIdCache = randomUuid();
      window.localStorage.setItem(DEVICE_KEY, deviceIdCache);
    }
  } catch {
    deviceIdCache ??= randomUuid();
  }
  return deviceIdCache;
}

export const TEMP_PREFIX = "temp:";

export function tempId() {
  return `${TEMP_PREFIX}${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}
