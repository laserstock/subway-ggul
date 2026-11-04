import { LANGUAGES, LOCALES, type LanguageInfo, type Locale } from "./i18n";

/**
 * Guide pages add Traditional Chinese (/zh-tw for Taiwan and Hong Kong), rendered from the Simplified copy.
 * The app and its saved language setting keep the four app locales.
 */
export const GUIDE_LOCALES = [...LOCALES, "zh-tw"] as const;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export function isGuideLocale(value: unknown): value is GuideLocale {
  return typeof value === "string" && (GUIDE_LOCALES as readonly string[]).includes(value);
}

/** The app locale whose copy and data a guide language is written in. */
export function contentLocale(locale: GuideLocale): Locale {
  return locale === "zh-tw" ? "zh" : locale;
}

export type GuideLanguageInfo = Omit<LanguageInfo, "code"> & { code: GuideLocale };

export const GUIDE_LANGUAGES: Record<GuideLocale, GuideLanguageInfo> = {
  ...LANGUAGES,
  "zh-tw": { code: "zh-tw", short: "TW", flag: "🇹🇼", native: "繁體中文", htmlLang: "zh-TW" },
};

/** hreflang codes per guide language; Traditional Chinese serves both Taiwan and Hong Kong. */
export const GUIDE_HREFLANGS: Record<GuideLocale, readonly string[]> = {
  ko: ["ko"],
  en: ["en"],
  zh: ["zh-CN"],
  ja: ["ja"],
  "zh-tw": ["zh-TW", "zh-HK"],
};
