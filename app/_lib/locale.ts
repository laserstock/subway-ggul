"use client";

import { useSyncExternalStore } from "react";
import { LOCALE_STORAGE_KEY as STORAGE_KEY } from "./bootScript";
import { DEFAULT_LOCALE, LANGUAGES, LOCALES, isLocale, type Locale } from "./i18n";
import { getMessages, type Messages } from "./messages";
import { guideLocale } from "./site";

const BOT_AGENT = /bot|crawl|spider|slurp|lighthouse|headless/i;
const listeners = new Set<() => void>();

/** First supported language in the browser's list; other languages get English rather than Korean. */
function browserLocale(): Locale {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const base = tag?.toLowerCase().split("-")[0];
    if ((LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return "en";
}

/**
 * ?lang= (links from the /en, /zh, /ja guides) is remembered; otherwise first-time visitors get their
 * browser's language. Crawlers keep Korean so the server-rendered home page stays the Korean one.
 */
function initialLocale(): Locale {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLocale(fromUrl)) {
      window.localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    if (BOT_AGENT.test(navigator.userAgent)) return DEFAULT_LOCALE;
    return browserLocale();
  } catch {
    return DEFAULT_LOCALE;
  }
}

let fallback: Locale = typeof window === "undefined" ? DEFAULT_LOCALE : initialLocale();

function readLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

if (typeof window !== "undefined" && !guideLocale(window.location.pathname)) {
  document.documentElement.lang = LANGUAGES[readLocale()].htmlLang;
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
