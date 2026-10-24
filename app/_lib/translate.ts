"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "./i18n";

export type TranslateTarget = Exclude<Locale, "ko">;
export type TranslationStatus = "loading" | "done" | "error";

const BATCH_TEXTS = 60;
const BATCH_CHARS = 8000;

/** `${locale}\u0001${text}` → translated text. */
const cache = new Map<string, string>();
/** Posts the reader switched to translated view, and the language they asked for. */
const active = new Map<string, TranslateTarget>();
const status = new Map<string, TranslationStatus>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const keyOf = (target: TranslateTarget, text: string) => `${target}\u0001${text}`;

function batches(texts: string[]) {
  const out: string[][] = [];
  let current: string[] = [];
  let chars = 0;
  for (const text of texts) {
    if (current.length >= BATCH_TEXTS || chars + text.length > BATCH_CHARS) {
      out.push(current);
      current = [];
      chars = 0;
    }
    current.push(text);
    chars += text.length;
  }
  if (current.length > 0) out.push(current);
  return out;
}

async function request(texts: string[], target: TranslateTarget) {
  for (const batch of batches(texts)) {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch, target }),
    });
    if (!response.ok) throw new Error(`translate ${response.status}`);
    const data = (await response.json()) as { translations: string[] };
    batch.forEach((text, index) => cache.set(keyOf(target, text), data.translations[index] ?? text));
  }
}

async function fill(id: string, texts: string[], target: TranslateTarget) {
  const missing = [...new Set(texts.filter((text) => text.trim() && !cache.has(keyOf(target, text))))];
  if (missing.length === 0) {
    status.set(id, "done");
    emit();
    return;
  }
  status.set(id, "loading");
  emit();
  try {
    await request(missing, target);
    status.set(id, "done");
  } catch {
    status.set(id, "error");
  }
  emit();
}

/**
 * Translated view of one post (title, body and comments). The state is shared by id, so the feed card and the
 * comment sheet flip together; comments that arrive while translated are translated too.
 */
export function usePostTranslation(id: string, texts: string[], locale: Locale) {
  useSyncExternalStore(subscribe, () => version, () => 0);
  const target = locale === "ko" ? null : locale;
  const on = target !== null && active.get(id) === target;
  const current = on ? (status.get(id) ?? null) : null;
  const pending = on && current === "done" && texts.some((text) => text.trim() && !cache.has(keyOf(target, text)));

  useEffect(() => {
    if (pending && target) void fill(id, texts, target);
  }, [pending, id, texts, target]);

  return {
    available: target !== null,
    on,
    status: current,
    /** The translation when this post is in translated view, otherwise the original. */
    show(text: string) {
      return on && target ? (cache.get(keyOf(target, text)) ?? text) : text;
    },
    toggle() {
      if (!target) return;
      if (on && current !== "error") {
        active.delete(id);
        emit();
        return;
      }
      active.set(id, target);
      void fill(id, texts, target);
    },
  };
}
