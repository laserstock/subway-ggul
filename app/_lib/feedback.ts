"use client";

const STORAGE_KEY = "subway-ggul:feedback";
const MAX_STORED = 50;

type StoredFeedback = { id: string; text: string; createdAt: number; page: string };

export function saveFeedback(text: string) {
  const entry: StoredFeedback = {
    id: `fb:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdAt: Date.now(),
    page: window.location.pathname,
  };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? (parsed as StoredFeedback[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...list].slice(0, MAX_STORED)));
  } catch {}
}
