"use client";

import { useEffect } from "react";
import { contentLocale, GUIDE_LANGUAGES, type GuideLocale } from "../../_lib/guideLocale";
import { setLocale } from "../../_lib/locale";

/** Makes the guide's language the site language, so the app and legal pages linked from here match it. */
export default function LocaleSync({ locale }: { locale: GuideLocale }) {
  useEffect(() => {
    setLocale(contentLocale(locale));
    document.documentElement.lang = GUIDE_LANGUAGES[locale].htmlLang;
  }, [locale]);
  return null;
}
