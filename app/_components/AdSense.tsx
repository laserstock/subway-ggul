"use client";

import { Capacitor } from "@capacitor/core";
import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";

/** Publisher id from AdSense, e.g. "ca-pub-1234567890123456". Unset = no ads anywhere. */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const noop = () => () => {};
/** Web only: the Play Store app shell loads this same site, and AdSense isn't allowed inside apps. */
const canShowAds = () => !Capacitor.isNativePlatform();

type Props = {
  /** Ad unit id from the AdSense dashboard (the numeric data-ad-slot). Unset = renders nothing. */
  slot: string | undefined;
  /** "display": responsive banner. "in-article": native-style unit that blends into the content. */
  layout?: "display" | "in-article";
  /** Small label above the unit, e.g. "Advertisement". */
  label?: string;
  className?: string;
};

export default function AdSense({ slot, layout = "display", label, className = "" }: Props) {
  const enabled = useSyncExternalStore(noop, canShowAds, () => false) && Boolean(ADSENSE_CLIENT_ID && slot);
  const unit = useRef<HTMLModElement>(null);

  useEffect(() => {
    // The queue fills each <ins> once; status is set by AdSense after it has (Strict Mode runs effects twice).
    if (!enabled || !unit.current || unit.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle ??= []).push({});
    } catch {
      // Blocked by an ad blocker or not approved yet: leave the slot empty.
    }
  }, [enabled]);

  if (!enabled) return null;
  return (
    <aside className={className} aria-label={label}>
      <Script
        id="adsbygoogle"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      {label ? (
        <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      ) : null}
      {layout === "in-article" ? (
        <ins
          ref={unit}
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-layout="in-article"
          data-ad-format="fluid"
        />
      ) : (
        <ins
          ref={unit}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </aside>
  );
}
