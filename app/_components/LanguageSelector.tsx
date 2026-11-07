"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { contentLocale, GUIDE_LANGUAGES, type GuideLocale } from "../_lib/guideLocale";
import type { Locale } from "../_lib/i18n";
import { setLocale } from "../_lib/locale";
import { localePath } from "../_lib/site";
import { GlobeIcon } from "./icons";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "繁體/簡體中文" },
];

/** Guide pages have separate Simplified and Traditional Chinese pages. */
const GUIDE_OPTIONS: { code: GuideLocale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-tw", label: "繁體中文" },
  { code: "zh", label: "简体中文" },
];

const ITEM_CLASS =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition-colors";

/**
 * Globe button with a language dropdown. With `onSelect` the current page switches language in place
 * (app screens); otherwise each option links to the same guide page under that language's prefix.
 */
export default function LanguageSelector({
  current,
  label,
  onSelect,
}: {
  current: GuideLocale;
  label: string;
  onSelect?: (code: Locale) => void;
}) {
  const options = onSelect ? OPTIONS : GUIDE_OPTIONS;
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const rest = pathname.split("/").slice(2).join("/");

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  function choose(code: GuideLocale) {
    setIsOpen(false);
    if (code === current) return;
    if (onSelect) onSelect(contentLocale(code));
    else setLocale(contentLocale(code));
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`${label} (${GUIDE_LANGUAGES[current].native})`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white py-1.5 pl-2.5 pr-2 text-[13px] font-bold text-[#2563eb] transition-transform active:scale-95"
      >
        <GlobeIcon />
        <span className="min-w-[20px] text-center">{GUIDE_LANGUAGES[current].short}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul
        id={menuId}
        aria-label={label}
        hidden={!isOpen}
        className="absolute right-0 top-[calc(100%+6px)] z-50 w-max min-w-[176px] rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
      >
        {options.map(({ code, label: name }) => {
          const selected = code === current;
          const content = (
            <>
              <span className="text-[18px] leading-none" aria-hidden>
                {GUIDE_LANGUAGES[code].flag}
              </span>
              <span lang={GUIDE_LANGUAGES[code].htmlLang} className="flex-1">
                {name}
              </span>
              <span className="text-[11px] font-bold text-neutral-400">{GUIDE_LANGUAGES[code].short}</span>
            </>
          );
          const stateClass = selected ? "bg-[#eff5ff] text-[#1d4ed8]" : "text-neutral-900 active:bg-neutral-100";
          return (
            <li key={code}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => choose(code)}
                  aria-current={selected ? "true" : undefined}
                  className={`${ITEM_CLASS} ${stateClass}`}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={localePath(code, rest ? `/${rest}` : "")}
                  hrefLang={GUIDE_LANGUAGES[code].htmlLang}
                  onClick={(event) => {
                    choose(code);
                    // A planner itinerary lives in its query; keep it in the other language.
                    if (rest.startsWith("planner/") && location.search) {
                      event.preventDefault();
                      router.push(`${localePath(code, `/${rest}`)}${location.search}`);
                    }
                  }}
                  aria-current={selected ? "true" : undefined}
                  className={`${ITEM_CLASS} ${stateClass}`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
