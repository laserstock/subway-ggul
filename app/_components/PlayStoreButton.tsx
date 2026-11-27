"use client";

import { tc } from "../_lib/guideCopy";
import type { GuideLocale } from "../_lib/guideLocale";
import { APP_RELEASED, PLAY_STORE_URL } from "../_lib/site";

function PlayLogo() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden>
      <path d="M1 1.2 12.6 12 1 22.8c-.4-.3-.6-.8-.6-1.4V2.6c0-.6.2-1.1.6-1.4z" fill="#00d7fe" />
      <path d="m16.4 8.4-3.8 3.6L1 1.2c.4-.4 1.1-.5 1.7-.1z" fill="#00f076" />
      <path d="M16.4 15.6 2.7 22.9c-.6.4-1.3.3-1.7-.1L12.6 12z" fill="#ff3a44" />
      <path d="m16.4 8.4 3.9 2.2c1 .6 1 2.2 0 2.8l-3.9 2.2-3.8-3.6z" fill="#ffd500" />
    </svg>
  );
}

export function trackPlayClick(lang: string) {
  try {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", "click_google_play", {
      page_location: window.location.pathname,
      lang,
    });
  } catch {
    /* gtag unavailable */
  }
}

const BUTTON_CLASS =
  "inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-[#111827] px-4 py-2.5 text-white transition hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_8px_18px_rgba(15,23,42,0.25)] active:scale-[0.98] lg:duration-200";

/**
 * Google Play CTA: "coming soon" until `NEXT_PUBLIC_PLAY_STORE_URL` is set, then a live
 * store link that fires GA4 `click_google_play`.
 */
export default function PlayStoreButton({
  locale,
  className = "",
}: {
  locale: GuideLocale;
  className?: string;
}) {
  const label = (
    <>
      <PlayLogo />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/80">
          {APP_RELEASED ? tc("getOnPlay", locale) : tc("comingSoon", locale)}
        </span>
        <span className="block text-[16px] font-bold">Google Play</span>
      </span>
    </>
  );

  if (!APP_RELEASED || !PLAY_STORE_URL) {
    return (
      <span
        role="link"
        aria-disabled="true"
        className={`${BUTTON_CLASS} cursor-default opacity-90 ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackPlayClick(locale)}
      className={`${BUTTON_CLASS} ${className}`}
    >
      {label}
    </a>
  );
}
