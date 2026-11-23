/**
 * Chunked UPSERT for catalog / cache tables.
 * Re-running the same batch never doubles rows when `onConflict` matches a UNIQUE index.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminSupabase } from "./admin";
import { CATALOG_CONFLICT, type CatalogTable } from "./types";

export type UpsertChunkFailure = {
  chunkIndex: number;
  from: number;
  to: number;
  message: string;
  code?: string;
};

export type SafeUpsertResult = {
  table: string;
  attempted: number;
  succeeded: number;
  failedChunks: UpsertChunkFailure[];
};

export type SafeUpsertOptions = {
  /** Rows per request. Keep 100–200 to avoid PostgREST timeouts. */
  chunkSize?: number;
  /** Columns matching a UNIQUE constraint / index (comma-separated for composites). */
  onConflict: string;
  /** When true (default), update all columns except those ignored by PostgREST defaults. */
  ignoreDuplicates?: boolean;
  client?: SupabaseClient;
  onChunkError?: (failure: UpsertChunkFailure) => void;
};

const DEFAULT_CHUNK = 150;

function chunkRows<T>(rows: readonly T[], size: number): T[][] {
  if (rows.length === 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    out.push(rows.slice(i, i + size) as T[]);
  }
  return out;
}

/**
 * Upsert any table with an explicit conflict target. Prefer {@link upsertCatalog} for known tables.
 */
export async function safeUpsert<T extends Record<string, unknown>>(
  table: string,
  rows: readonly T[],
  options: SafeUpsertOptions,
): Promise<SafeUpsertResult> {
  const chunkSize = Math.min(Math.max(options.chunkSize ?? DEFAULT_CHUNK, 50), 200);
  const client = options.client ?? requireAdminSupabase();
  const failedChunks: UpsertChunkFailure[] = [];
  let succeeded = 0;

  if (rows.length === 0) {
    return { table, attempted: 0, succeeded: 0, failedChunks };
  }

  const chunks = chunkRows(rows, chunkSize);
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex]!;
    const from = chunkIndex * chunkSize;
    const to = from + chunk.length;
    const { error, count } = await client.from(table).upsert(chunk as Record<string, unknown>[], {
      onConflict: options.onConflict,
      ignoreDuplicates: options.ignoreDuplicates ?? false,
      count: "exact",
    });

    if (error) {
      const failure: UpsertChunkFailure = {
        chunkIndex,
        from,
        to,
        message: error.message,
        code: error.code,
      };
      failedChunks.push(failure);
      console.error(`[safeUpsert] ${table} chunk ${chunkIndex} (${from}-${to}) failed:`, error.message);
      options.onChunkError?.(failure);
      continue;
    }
    succeeded += count ?? chunk.length;
  }

  return { table, attempted: rows.length, succeeded, failedChunks };
}

/** Typed helper for catalog tables with pre-wired conflict columns. */
export async function upsertCatalog<T extends Record<string, unknown>>(
  table: CatalogTable,
  rows: readonly T[],
  options?: Omit<SafeUpsertOptions, "onConflict">,
): Promise<SafeUpsertResult> {
  return safeUpsert(table, rows, {
    ...options,
    onConflict: CATALOG_CONFLICT[table],
  });
}
