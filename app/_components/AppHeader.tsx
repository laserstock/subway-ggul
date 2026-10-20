"use client";

import Link from "next/link";
import { setLocale, useLocale } from "../_lib/locale";
import { t, type Locale } from "../_lib/stations";
import { GlobeIcon, TrainLogo } from "./icons";

const TITLE = { ko: "지하철꿀정보", en: "Subway Tips" };
const BACK = { ko: "홈으로", en: "Home" };

export default function AppHeader({
  backHref,
  onLocaleChange,
}: {
  backHref?: string;
  onLocaleChange?: (next: Locale, previous: Locale) => void;
}) {
  const locale = useLocale();

  function toggleLocale() {
    const next: Locale = locale === "ko" ? "en" : "ko";
    onLocaleChange?.(next, locale);
    setLocale(next);
  }

  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-3">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={t(BACK, locale)}
            className="-ml-1 flex h-9 w-7 items-center justify-center text-neutral-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : null}
        <TrainLogo />
        <h1 className="text-[18px] font-bold tracking-tight text-neutral-900">{t(TITLE, locale)}</h1>
      </div>
      <button
        type="button"
        onClick={toggleLocale}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium"
        aria-label="Change language"
      >
        <GlobeIcon />
        <span className={locale === "ko" ? "font-bold text-[#2563eb]" : "text-neutral-400"}>KO</span>
        <span className="text-neutral-300">/</span>
        <span className={locale === "en" ? "font-bold text-[#2563eb]" : "text-neutral-400"}>EN</span>
      </button>
    </header>
  );
}
