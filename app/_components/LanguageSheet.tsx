"use client";

import { useEffect, useId, useRef } from "react";
import { LANGUAGES, LOCALES, type Locale } from "../_lib/i18n";
import { MESSAGES } from "../_lib/messages";
import { useLocale, useMessages } from "../_lib/locale";

function languageDescription(code: Locale, uiLocale: Locale) {
  const native = LANGUAGES[code].native;
  const local = MESSAGES[uiLocale].language.names[code];
  if (local !== native) return local;
  const english = MESSAGES.en.language.names[code];
  return english !== native ? english : null;
}

export default function LanguageSheet({
  id,
  isOpen,
  onClose,
  onSelect,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (locale: Locale) => void;
}) {
  const locale = useLocale();
  const m = useMessages();
  const titleId = useId();
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    selectedRef.current?.focus({ preventScroll: true });
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function select(next: Locale) {
    if (next !== locale) onSelect(next);
    onClose();
  }

  return (
    <div
      id={id}
      className={`absolute inset-0 z-[90] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={m.language.close}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[3px] transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pb-3" aria-hidden>
          <span className="h-[5px] w-11 rounded-full bg-neutral-300" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[18px] font-extrabold tracking-tight text-neutral-900">
              {m.language.title}
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-500">{m.language.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold text-neutral-500 transition-colors active:bg-neutral-100"
          >
            {m.language.close}
          </button>
        </div>

        <ul role="radiogroup" aria-labelledby={titleId} className="mt-4 flex flex-col gap-2">
          {LOCALES.map((code) => {
            const language = LANGUAGES[code];
            const selected = code === locale;
            const description = languageDescription(code, locale);
            return (
              <li key={code}>
                <button
                  ref={selected ? selectedRef : undefined}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => select(code)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors active:scale-[0.99] ${
                    selected
                      ? "border-[#2563eb] bg-[#eff5ff]"
                      : "border-neutral-200 bg-white active:bg-neutral-50"
                  }`}
                >
                  <span className="text-[24px] leading-none" aria-hidden>
                    {language.flag}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      lang={language.htmlLang}
                      className={`text-[15px] font-bold ${selected ? "text-[#1d4ed8]" : "text-neutral-900"}`}
                    >
                      {language.native}
                    </span>
                    {description ? (
                      <span className="ml-1.5 text-[13px] text-neutral-500">({description})</span>
                    ) : null}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      selected ? "bg-[#2563eb] text-white" : "border border-neutral-300 text-transparent"
                    }`}
                    aria-hidden
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
