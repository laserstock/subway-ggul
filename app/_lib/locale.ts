"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, LANGUAGES, isLocale, type Locale } from "./i18n";
import { getMessages, type Messages } from "./messages";

const STORAGE_KEY = "subway-ggul:locale";
const listeners = new Set<() => void>();
let fallback: Locale = DEFAULT_LOCALE;

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : fallback;
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
  document.documentElement.lang = LANGUAGES[next].htmlLang;
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);
}

export function useMessages(): Messages {
  return getMessages(useLocale());
}
