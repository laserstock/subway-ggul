import { LANGUAGES } from "./i18n";

export const THEME_STORAGE_KEY = "subway-ggul:theme";
export const LOCALE_STORAGE_KEY = "subway-ggul:locale";

export const THEME_COLORS = { light: "#ffffff", dark: "#14161c" } as const;

const HTML_LANGS = Object.fromEntries(Object.entries(LANGUAGES).map(([code, info]) => [code, info.htmlLang]));

/**
 * Runs before first paint: applies a saved dark choice (the phone's own dark mode is ignored) and
 * sets <html lang> from ?lang= or the saved language. Guide pages under /en etc. override the lang.
 */
export const BOOT_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")d.dataset.theme="dark";var m=${JSON.stringify(HTML_LANGS)},q=new URLSearchParams(location.search).get("lang"),l=m[q]?q:localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)});if(m[l])d.lang=m[l]}catch(e){}`;
