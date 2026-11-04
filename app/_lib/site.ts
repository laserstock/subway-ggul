import type { Metadata } from "next";
import { contentLocale, GUIDE_HREFLANGS, GUIDE_LOCALES, isGuideLocale, type GuideLocale } from "./guideLocale";
import type { Locale } from "./i18n";

export const SITE_URL = "https://www.k-sub.com";

/** AdSense publisher id (public: it appears in every page and in ads.txt). */
export const ADSENSE_CLIENT_ID = "ca-pub-5995977562355838";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.subwayggul.app";
/** Flip to true once the Play Store listing is live; until then download buttons say "coming soon". */
export const APP_RELEASED = false;

/** Bump when the guide pages' data or copy change, for the sitemap's lastmod. */
export const GUIDE_UPDATED = "2026-11-01";

/** Server-rendered, crawlable station guides live under /ko, /en, /zh, /zh-tw and /ja; returns the app locale. */
export function guideLocale(pathname: string | null): Locale | null {
  const first = pathname?.split("/")[1];
  return isGuideLocale(first) ? contentLocale(first) : null;
}

/** Same page in another language; the Korean home is the site root rather than the /ko guide. */
export function localePath(code: GuideLocale, path: string) {
  return code === "ko" && !path ? "/" : `/${code}${path}`;
}

/** hreflang links between the same guide page in every language; English is the fallback. */
export function guideLanguages(path: string) {
  return {
    ...Object.fromEntries(
      GUIDE_LOCALES.flatMap((code) => GUIDE_HREFLANGS[code].map((hreflang) => [hreflang, localePath(code, path)])),
    ),
    "x-default": `/en${path}`,
  };
}

export function guideAlternates(path: string, locale: GuideLocale): Metadata["alternates"] {
  return { canonical: `/${locale}${path}`, languages: guideLanguages(path) };
}

export const OG_LOCALES: Record<GuideLocale, string> = {
  ko: "ko_KR",
  en: "en_US",
  zh: "zh_CN",
  "zh-tw": "zh_TW",
  ja: "ja_JP",
};
