import type { Locale } from "../i18n";
import en from "./en";
import ja from "./ja";
import ko, { type Messages } from "./ko";
import zh from "./zh";

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { ko, en, zh, ja };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
