"use client";

import { useEffect } from "react";
import type { Locale } from "../../_lib/i18n";
import { setLocale } from "../../_lib/locale";

/** Makes the guide's language the site language, so the app and legal pages linked from here match it. */
export default function LocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    setLocale(locale);
  }, [locale]);
  return null;
}
