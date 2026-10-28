"use client";

import { useEffect, useSyncExternalStore } from "react";
import { THEME_COLORS, THEME_STORAGE_KEY } from "./themeInit";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/** Light unless the user picks dark in the app, even when the phone is in dark mode. */
export const DEFAULT_THEME: Theme = "light";

const listeners = new Set<() => void>();

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
  } catch {}
  return DEFAULT_THEME;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  listeners.forEach((listener) => listener());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
}

/** Mirrors the chosen theme onto <html data-theme>, which drives the CSS color tokens. */
export function useApplyTheme() {
  const theme = useTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => (meta.content = THEME_COLORS[theme]));
  }, [theme]);
}
