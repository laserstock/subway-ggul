import { Converter } from "opencc-js/cn2t";
import { contentLocale, type GuideLocale } from "./guideLocale";
import { t, type Localized } from "./i18n";

/** Taiwan wording, not just characters: 出租车 → 計程車, 信息 → 資訊. Server-only: the dictionaries are large. */
const toTraditional = Converter({ from: "cn", to: "twp" });

/** Text written in the guide language's content locale, converted to Traditional characters on /zh-tw. */
export function inScript(locale: GuideLocale, text: string) {
  return locale === "zh-tw" ? toTraditional(text) : text;
}

export function gt(value: Localized, locale: GuideLocale) {
  return inScript(locale, t(value, contentLocale(locale)));
}
