"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "./stations";

const STORAGE_KEY = "subway-ggul:locale";
const listeners = new Set<() => void>();
let fallback: Locale = "ko";

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "ko" ? stored : fallback;
  } catch {
    return fallback;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function setLocale(next: Locale) {
  fallback = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, readLocale, () => "ko");
}
