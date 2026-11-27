"use client";

import { useEffect, useState } from "react";
import { TrainMark } from "./icons";
import { trackPlayClick } from "./PlayStoreButton";
import { tc } from "../_lib/guideCopy";
import type { GuideLocale } from "../_lib/guideLocale";
import { APP_RELEASED, PLAY_STORE_URL } from "../_lib/site";
import { useIsAppWebView } from "../_lib/useIsAppWebView";

const DISMISS_KEY = "ksub_smart_banner_dismiss_until";
const DAY_MS = 24 * 60 * 60 * 1000;

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (!Number.isFinite(until)) return false;
    if (until > Date.now()) return true;
    localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

function dismissForOneDay() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DAY_MS));
  } catch {
    /* private mode */
  }
}

/**
 * Mobile-web-only floating install bar. Hidden in the native WebView/TWA, on desktop,
 * when the Play Store URL env is empty, and for 24h after the user dismisses it.
 */
export default function SmartAppBanner({ locale }: { locale: GuideLocale }) {
  const isApp = useIsAppWebView();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!APP_RELEASED || !PLAY_STORE_URL || isApp || !isMobileBrowser() || isDismissed()) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [isApp]);

  if (!visible || !PLAY_STORE_URL) return null;

  return (
    <>
      {/* Reserve space so the fixed bar does not cover the footer on mobile web. */}
      <div className="h-[3.75rem] shrink-0 md:hidden" aria-hidden data-web-only />
      <div
        role="region"
        aria-label={tc("smartBannerLead", locale)}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#f6e3a8] bg-[#fffdf6]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.1)] backdrop-blur-md md:hidden"
        data-web-only
      >
        <div className="mx-auto flex max-w-[760px] items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-honey text-white">
            <TrainMark size={22} />
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] font-bold leading-snug text-ink">
            {tc("smartBannerLead", locale)}
            <span aria-hidden> →</span>
          </p>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackPlayClick(locale)}
            className="inline-flex shrink-0 items-center rounded-full bg-[#111827] px-3.5 py-2 text-[12px] font-extrabold text-white active:scale-[0.98]"
          >
            {tc("smartBannerInstall", locale)}
          </a>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              dismissForOneDay();
              setVisible(false);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[18px] font-bold leading-none text-ink-muted hover:bg-black/5"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}
