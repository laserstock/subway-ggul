"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { LANGUAGES, t, type Locale, type Localized } from "../_lib/i18n";
import { setLocale, useLocale, useMessages } from "../_lib/locale";
import { useApplyTheme } from "../_lib/theme";
import { GlobeIcon, TrainLogo } from "./icons";
import LanguageSheet from "./LanguageSheet";
import SideDrawer from "./SideDrawer";

export default function AppHeader({
  backHref,
  title,
  titlePrefix,
  titleSuffix,
  subtitle,
  icon = <TrainLogo />,
  action,
  onLocaleChange,
}: {
  backHref?: string;
  title?: Localized;
  /** Shown before the title text, e.g. line badges. */
  titlePrefix?: ReactNode;
  /** Kept whole after the title, which truncates first. */
  titleSuffix?: Localized;
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Extra button shown left of the language switch. */
  action?: ReactNode;
  onLocaleChange?: (next: Locale, previous: Locale) => void;
}) {
  const locale = useLocale();
  const m = useMessages();
  const drawerId = useId();
  const languageSheetId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const closeLanguageSheet = useCallback(() => setIsLanguageSheetOpen(false), []);

  useApplyTheme();

  useEffect(() => {
    document.documentElement.lang = LANGUAGES[locale].htmlLang;
  }, [locale]);

  function changeLocale(next: Locale) {
    onLocaleChange?.(next, locale);
    setLocale(next);
  }

  return (
    <header className="flex items-center justify-between gap-2 bg-app px-4 pb-2 pt-3">
      <div className="flex min-w-0 items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={m.header.home}
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
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label={m.header.openMenu}
          aria-haspopup="dialog"
          aria-expanded={isDrawerOpen}
          aria-controls={drawerId}
          className="shrink-0 rounded-[10px] transition-transform active:scale-95"
        >
          {icon}
        </button>
        <div className="min-w-0">
          <h1
            className={`truncate tracking-tight ${
              title ? "font-bold text-ink" : "font-extrabold text-honey-strong"
            } ${subtitle ? "text-[16px] leading-tight" : title ? "text-[18px]" : "text-[21px]"} ${
              titlePrefix || titleSuffix ? "flex items-center gap-1.5" : ""
            }`}
          >
            {titlePrefix}
            {titlePrefix || titleSuffix ? (
              <span className="flex min-w-0 items-baseline">
                <span className="truncate">{title ? t(title, locale) : m.app.name}</span>
                {titleSuffix ? <span className="ml-[0.3em] shrink-0">{t(titleSuffix, locale)}</span> : null}
              </span>
            ) : title ? (
              t(title, locale)
            ) : (
              m.app.name
            )}
          </h1>
          {subtitle ? (
            <div className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[12px] font-semibold leading-tight text-neutral-500">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {action}
        <button
          type="button"
          onClick={() => setIsLanguageSheetOpen(true)}
          aria-label={`${m.header.changeLanguage} (${LANGUAGES[locale].native})`}
          aria-haspopup="dialog"
          aria-expanded={isLanguageSheetOpen}
          aria-controls={languageSheetId}
          className="flex shrink-0 items-center gap-1 rounded-full border border-neutral-200 bg-white py-1.5 pl-2.5 pr-2 text-[13px] font-bold text-[#2563eb] transition-transform active:scale-95"
        >
          <GlobeIcon />
          <span className="min-w-[20px] text-center">{LANGUAGES[locale].short}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-neutral-400" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <SideDrawer id={drawerId} isOpen={isDrawerOpen} onClose={closeDrawer} />
      <LanguageSheet
        id={languageSheetId}
        isOpen={isLanguageSheetOpen}
        onClose={closeLanguageSheet}
        onSelect={changeLocale}
      />
    </header>
  );
}
