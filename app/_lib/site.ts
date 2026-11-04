import type { Metadata } from "next";
import { LANGUAGES, LOCALES, type Locale } from "./i18n";

export const SITE_URL = "https://www.k-sub.com";

/** AdSense publisher id (public: it appears in every page and in ads.txt). */
export const ADSENSE_CLIENT_ID = "ca-pub-5995977562355838";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.subwayggul.app";
/** Flip to true once the Play Store listing is live; until then download buttons say "coming soon". */
export const APP_RELEASED = false;

/** Bump when the guide pages' data or copy change, for the sitemap's lastmod. */
export const GUIDE_UPDATED = "2026-11-01";

/** Server-rendered, crawlable station guides live under /ko, /en, /zh and /ja. */
export function guideLocale(pathname: string | null): Locale | null {
  const first = pathname?.split("/")[1];
  return (LOCALES as readonly string[]).includes(first ?? "") ? (first as Locale) : null;
}

/** Same page in another language; the Korean home is the site root rather than the /ko guide. */
export function localePath(code: Locale, path: string) {
  return code === "ko" && !path ? "/" : `/${code}${path}`;
}

/** hreflang links between the same guide page in every language; English is the fallback. */
export function guideLanguages(path: string) {
  return {
    ...Object.fromEntries(LOCALES.map((code) => [LANGUAGES[code].htmlLang, localePath(code, path)])),
    "x-default": `/en${path}`,
  };
}

export function guideAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return { canonical: `/${locale}${path}`, languages: guideLanguages(path) };
}

export const OG_LOCALES: Record<Locale, string> = { ko: "ko_KR", en: "en_US", zh: "zh_CN", ja: "ja_JP" };
