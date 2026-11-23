/**
 * Read helpers that never throw into the UI layer.
 * Empty tables, missing env, or transient API errors return `fallback` instead.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let readClient: SupabaseClient | null = null;

function getReadClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    // Prefer API routes / existing browser client for client components.
    return null;
  }
  if (!URL || !ANON) return null;
  readClient ??= createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return readClient;
}

export type SafeFetchResult<T> = {
  data: T;
  /** True when `fallback` was used (missing client, error, or empty+preferFallbackIfEmpty). */
  usedFallback: boolean;
  error?: string;
};

export type SafeFetchOptions<T> = {
  client?: SupabaseClient | null;
  fallback: T;
  /** Treat empty arrays / null as failure and return fallback (default true for arrays). */
  preferFallbackIfEmpty?: boolean;
  timeoutMs?: number;
};

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Run a PostgREST query and fall back on any failure.
 *
 * @example
 * ```ts
 * const { data } = await safeSelect(
 *   (db) => db.from("station_facilities").select("*").eq("station_uid", uid),
 *   { fallback: STATIC_FACILITIES },
 * );
 * ```
 */
export async function safeSelect<T>(
  build: (client: SupabaseClient) => PromiseLike<QueryResult<T>>,
  options: SafeFetchOptions<T>,
): Promise<SafeFetchResult<T>> {
  const client = options.client === undefined ? getReadClient() : options.client;
  if (!client) {
    return { data: options.fallback, usedFallback: true, error: "supabase_unconfigured" };
  }

  const preferEmpty = options.preferFallbackIfEmpty ?? Array.isArray(options.fallback);
  const timeoutMs = options.timeoutMs ?? 4_000;

  try {
    const { data, error } = await withTimeout(Promise.resolve(build(client)), timeoutMs);
    if (error) {
      console.warn("[safeFetch]", error.message);
      return { data: options.fallback, usedFallback: true, error: error.message };
    }
    if (preferEmpty && isEmpty(data)) {
      return { data: options.fallback, usedFallback: true, error: "empty" };
    }
    return { data: (data ?? options.fallback) as T, usedFallback: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_failed";
    console.warn("[safeFetch]", message);
    return { data: options.fallback, usedFallback: true, error: message };
  }
}

/** Fetch facilities for one station_uid with static fallback. */
export async function fetchFacilitiesOrFallback<T>(
  stationUid: string,
  fallback: T,
  options?: Partial<SafeFetchOptions<T>>,
) {
  return safeSelect<T>(
    (db) =>
      db.from("station_facilities").select("*").eq("station_uid", stationUid).order("facility_type") as PromiseLike<
        QueryResult<T>
      >,
    { fallback, ...options },
  );
}

/** Fetch POIs for a place_key (RLS hides expired rows). */
export async function fetchPoisOrFallback<T>(
  placeKey: string,
  fallback: T,
  options?: Partial<SafeFetchOptions<T>> & { category?: string },
) {
  return safeSelect<T>(
    (db) => {
      let q = db.from("station_pois").select("*").eq("place_key", placeKey).order("distance_m", { ascending: true });
      if (options?.category) q = q.eq("category", options.category);
      return q as PromiseLike<QueryResult<T>>;
    },
    { fallback, ...options },
  );
}

/** Fetch transfers for one station_uid. */
export async function fetchTransfersOrFallback<T>(
  stationUid: string,
  fallback: T,
  options?: Partial<SafeFetchOptions<T>>,
) {
  return safeSelect<T>(
    (db) => db.from("station_transfers").select("*").eq("station_uid", stationUid) as PromiseLike<QueryResult<T>>,
    { fallback, ...options },
  );
}
