export const LOCALES = ["ko", "en", "zh", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

/**
 * ko/en are required; other locales are optional and fall back to en, so a new
 * language can be added before every string in the app is translated.
 */
export type Localized = { ko: string; en: string } & Partial<Record<Exclude<Locale, "ko" | "en">, string>>;

export type LanguageInfo = {
  code: Locale;
  short: string;
  flag: string;
  native: string;
  htmlLang: string;
};

export const LANGUAGES: Record<Locale, LanguageInfo> = {
  ko: { code: "ko", short: "KO", flag: "🇰🇷", native: "한국어", htmlLang: "ko" },
  en: { code: "en", short: "EN", flag: "🇺🇸", native: "English", htmlLang: "en" },
  zh: { code: "zh", short: "ZH", flag: "🇨🇳", native: "中文", htmlLang: "zh-CN" },
  ja: { code: "ja", short: "JA", flag: "🇯🇵", native: "日本語", htmlLang: "ja" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function t(value: Localized, locale: Locale) {
  return value[locale] ?? value.en;
}
