"use client";

import { useEffect, useSyncExternalStore } from "react";

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "light";
/** Dark styles are only partly converted to tokens, so it can't be picked yet. */
export const THEME_READY: Record<Theme, boolean> = { light: true, dark: false };

const STORAGE_KEY = "subway-ggul:theme";
const listeners = new Set<() => void>();

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTheme(stored) && THEME_READY[stored]) return stored;
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
  if (!THEME_READY[theme]) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
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
  }, [theme]);
}
