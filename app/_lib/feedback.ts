"use client";

import type { Locale } from "./i18n";
import { ensureUser, getSupabase, notifyServerError } from "./supabase";

const STORAGE_KEY = "subway-ggul:feedback";
const MAX_STORED = 50;

type StoredFeedback = { id: string; text: string; createdAt: number; page: string };

function keepLocally(entry: StoredFeedback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? (parsed as StoredFeedback[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...list].slice(0, MAX_STORED)));
  } catch {}
}

/** Sends feedback to the operator; kept on the device too when the server can't take it. */
export async function saveFeedback(text: string, locale: Locale): Promise<boolean> {
  const page = window.location.pathname.slice(0, 100);
  const supabase = getSupabase();
  if (supabase && (await ensureUser())) {
    const { error } = await supabase.from("feedback").insert({ text, page, locale });
    if (!error) return true;
    notifyServerError(error);
  }
  keepLocally({
    id: `fb:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdAt: Date.now(),
    page,
  });
  return false;
}
