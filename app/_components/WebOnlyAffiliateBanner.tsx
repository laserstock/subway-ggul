"use client";

import { AFFILIATE_BANNER, AFFILIATE_OFFERS } from "../../constants/affiliate";
import { contentLocale, type GuideLocale } from "../_lib/guideLocale";
import { useIsAppWebView } from "../_lib/useIsAppWebView";

function pick<T extends Record<"ko" | "en" | "zh" | "ja", string>>(copy: T, locale: GuideLocale) {
  return copy[contentLocale(locale)];
}

/**
 * Explicit Travelpayouts / Klook CTAs for regular browsers only.
 * Never mounts in the Capacitor / WebView app shell (no global LinkSwitcher).
 */
export default function WebOnlyAffiliateBanner({
  locale,
  className = "",
}: {
  locale: GuideLocale;
  className?: string;
}) {
  const isApp = useIsAppWebView();
  if (isApp) return null;

  const offers = AFFILIATE_OFFERS.filter((offer) => offer.href.trim().length > 0);
  if (!offers.length) return null;

  return (
    <aside
      className={`rounded-3xl border border-[#f6e3a8] bg-gradient-to-br from-[#fff8e1] to-[#fffdf6] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] lg:p-6 ${className}`}
      data-affiliate="web-only"
      data-nosnippet
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-honey-strong">
        {pick(AFFILIATE_BANNER.eyebrow, locale)}
      </p>
      <h2 className="mt-1.5 text-[17px] font-extrabold tracking-tight text-ink lg:text-[19px]">
        {pick(AFFILIATE_BANNER.title, locale)}
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted lg:text-[14px]">
        {pick(AFFILIATE_BANNER.lead, locale)}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {offers.map((offer) => (
          <li key={offer.id}>
            <a
              href={offer.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:border-honey/45 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)] active:scale-[0.99]"
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-extrabold text-ink lg:text-[15px]">
                  {pick(offer.label, locale)}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted lg:text-[13px]">
                  {pick(offer.blurb, locale)}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[#111827] px-3 py-1.5 text-[12px] font-bold text-white">
                {pick(AFFILIATE_BANNER.cta, locale)} →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
