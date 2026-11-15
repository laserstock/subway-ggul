"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { t, type Localized } from "../_lib/i18n";
import { useLocale } from "../_lib/locale";
import { isNativeApp } from "../_lib/native";
import { TrainMark } from "./icons";

const noopSubscribe = () => () => {};
const readWeb = () => !isNativeApp();

const COPY = {
  title: {
    ko: "웹 역 가이드 보기",
    en: "Open the web station guide",
    zh: "打开网页版车站指南",
    ja: "ウェブの駅ガイドを見る",
  },
  body: {
    ko: "출구·보관함·환승·엘리베이터 정보를 656개 역에서 검색하세요",
    en: "Search exits, lockers, transfers and elevators for 656 stations",
    zh: "搜索全部656个车站的出口、储物柜、换乘和电梯信息",
    ja: "全656駅の出口・ロッカー・乗り換え・エレベーターを検索",
  },
  cta: {
    ko: "가이드 열기",
    en: "Open guide",
    zh: "打开指南",
    ja: "ガイドを開く",
  },
  menu: {
    ko: "웹 가이드",
    en: "Web guide",
    zh: "网页指南",
    ja: "ウェブガイド",
  },
} as const satisfies Record<string, Localized>;

/** True only in a regular browser — never inside the Capacitor / WebView app shell. */
function useWebOnly() {
  return useSyncExternalStore(noopSubscribe, readWeb, () => false);
}

function guideHref(locale: string) {
  return `/${locale}`;
}

/** Compact banner on the app home (web browsers only). */
export function WebGuideBanner({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const web = useWebOnly();
  if (!web) return null;
  return (
    <Link
      href={guideHref(locale)}
      className={`mt-3 flex items-start gap-3 rounded-2xl border border-honey/35 bg-honey-soft px-3.5 py-3 text-left transition hover:border-honey/60 active:scale-[0.99] ${className}`}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-honey-strong ring-1 ring-inset ring-honey/20"
      >
        <TrainMark size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-extrabold leading-snug text-ink">{t(COPY.title, locale)}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">{t(COPY.body, locale)}</span>
      </span>
      <span className="shrink-0 self-center text-[12px] font-bold text-honey-strong">{t(COPY.cta, locale)} →</span>
    </Link>
  );
}

/** Menu-row link for the side drawer (web browsers only). */
export function WebGuideMenuLink({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const web = useWebOnly();
  if (!web) return null;
  return (
    <Link
      href={guideHref(locale)}
      onClick={onNavigate}
      className="mx-2 mt-3 flex items-center gap-3 rounded-2xl border border-honey/30 bg-honey-soft px-4 py-3.5 transition active:scale-[0.99]"
    >
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-surface text-honey-strong ring-1 ring-inset ring-honey/20"
      >
        <TrainMark size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold text-ink">{t(COPY.menu, locale)}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted">{t(COPY.body, locale)}</span>
      </span>
      <span className="text-honey-strong" aria-hidden>
        →
      </span>
    </Link>
  );
}
