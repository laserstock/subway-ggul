import type { Metadata } from "next";
import { contentLocale, GUIDE_HREFLANGS, GUIDE_LOCALES, isGuideLocale, type GuideLocale } from "./guideLocale";
import type { Locale } from "./i18n";

export const SITE_URL = "https://www.k-sub.com";

/** Display name Google should show for brand / navigational queries (k-sub com vs ksub.com). */
export const SITE_BRAND_NAME = "K-SUB";
export const SITE_BRAND_DISPLAY = "K-SUB (k-sub.com)";
export const SITE_BRAND_TITLE =
  "K-SUB (k-sub.com) | Seoul Subway Guide, Restrooms, Elevators & Trip Planner";
export const SITE_BRAND_DESCRIPTION =
  "k-sub com (www.k-sub.com) is the official K-SUB Seoul Subway Guide — restrooms, elevators, luggage lockers and a trip planner for every station at www.k-sub.com.";
/** WebSite JSON-LD alternate names so “k-sub com” maps to this domain, not ksub.com. */
export const SITE_BRAND_ALTERNATE_NAMES = [
  "K-SUB",
  "k-sub.com",
  "k-sub com",
  "k-sub",
  "ksub",
  "지하철꿀정보",
  "케이서브",
] as const;

/** Stable node ids so the site-wide WebSite/Organization graph is one entity, referenced by every page. */
export const SITE_WEBSITE_ID = `${SITE_URL}/#website`;
export const SITE_ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const SITE_LOGO_URL = `${SITE_URL}/icon.png`;

/** AdSense publisher id (public: it appears in every page and in ads.txt). */
export const ADSENSE_CLIENT_ID = "ca-pub-5995977562355838";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.ksub.app";
/** Flip to true once the Play Store listing is live; until then download buttons say "coming soon". */
export const APP_RELEASED = false;

/**
 * App screens (/station, /route, …) take their station from the query string, so every guide link spawns another
 * URL with the same title. Keep them out of the index but let crawlers follow their links; don't block them in
 * robots.txt, or Google can't read this tag.
 */
export const APP_SCREEN_ROBOTS: Metadata["robots"] = { index: false, follow: true };

/** Bump when the guide pages' data or copy change, for the sitemap's lastmod. */
export const GUIDE_UPDATED = "2026-11-26";

/** Server-rendered, crawlable station guides live under /ko, /en, /zh, /zh-tw and /ja; returns the app locale. */
export function guideLocale(pathname: string | null): Locale | null {
  const first = pathname?.split("/")[1];
  return isGuideLocale(first) ? contentLocale(first) : null;
}

/** Same page in another language; the Korean home is the site root rather than the /ko guide. */
export function localePath(code: GuideLocale, path: string) {
  return code === "ko" && !path ? "/" : `/${code}${path}`;
}

/** Relative hreflang paths (sitemap absolutizes these; metadata uses guideLanguages). */
export function guideLanguagePaths(path: string) {
  return {
    ...Object.fromEntries(
      GUIDE_LOCALES.flatMap((code) => GUIDE_HREFLANGS[code].map((hreflang) => [hreflang, `/${code}${path}`])),
    ),
    "x-default": `/en${path}`,
  };
}

/**
 * Absolute hreflang links between the same guide page in every language; English is the fallback.
 * Korean points at /ko, not the `/` app home: every page in the set must list itself, or Google drops the set.
 */
export function guideLanguages(path: string) {
  return Object.fromEntries(
    Object.entries(guideLanguagePaths(path)).map(([hreflang, href]) => [hreflang, `${SITE_URL}${href}`]),
  );
}

export function guideAlternates(path: string, locale: GuideLocale): Metadata["alternates"] {
  return { canonical: `${SITE_URL}/${locale}${path}`, languages: guideLanguages(path) };
}

export const OG_LOCALES: Record<GuideLocale, string> = {
  ko: "ko_KR",
  en: "en_US",
  zh: "zh_CN",
  "zh-tw": "zh_TW",
  ja: "ja_JP",
};
