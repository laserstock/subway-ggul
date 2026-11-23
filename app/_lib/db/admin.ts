/**
 * Server-only Supabase client using the service_role key.
 * Never import this from a `"use client"` module or ship the key to the browser.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

let admin: SupabaseClient | null = null;

export function isAdminConfigured() {
  return Boolean(URL && SERVICE_ROLE);
}

/**
 * Returns a privileged client, or null when env is missing.
 * Throws if called in the browser so the secret cannot leak via a mistaken import.
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getAdminSupabase() must only run on the server");
  }
  if (!URL || !SERVICE_ROLE) return null;
  admin ??= createClient(URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return admin;
}

/** Same as getAdminSupabase but throws when the service role is not configured. */
export function requireAdminSupabase(): SupabaseClient {
  const client = getAdminSupabase();
  if (!client) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY (and URL) required for catalog upserts");
  }
  return client;
}
