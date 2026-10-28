"use client";

import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import FlagSheet, { FlagButton, type FlagRequest } from "../_components/FlagSheet";
import LineBadges from "../_components/LineBadges";
import ReportSheet from "../_components/ReportSheet";
import SearchOverlay from "../_components/SearchOverlay";
import { Toast, useToast } from "../_components/Toast";
import UtilityTiles from "../_components/UtilityTiles";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import { useStationReports } from "../_lib/reports";
import { setDestinationStation } from "../_lib/selectedStation";
import { stationParams, t, type Localized, type StationOption } from "../_lib/stations";
import { loadUrgent, type StationUrgent } from "../_lib/urgent";
import AlarmBanner from "./AlarmBanner";
import ArrivalBoard from "./ArrivalBoard";
import ExitGuide from "./ExitGuide";
import FacilitySearch from "./FacilitySearch";
import { DASHBOARD_TITLE } from "./header";

const COPY = {
  searchOther: { ko: "다른 역 검색", en: "Search another", zh: "搜索其他车站", ja: "他の駅を検索" },
  notFound: {
    ko: "역 정보를 찾지 못했어요. 다시 검색해 주세요",
    en: "Couldn't find that station. Please search again",
    zh: "未找到车站信息，请重新搜索",
    ja: "駅情報が見つかりません。もう一度検索してください",
  },
  tipTitle: { ko: "1초 꿀팁", en: "1-second tip", zh: "1秒小贴士", ja: "1秒お役立ち情報" },
  tipLive: { ko: "실시간 제보", en: "Live report", zh: "实时上报", ja: "リアルタイム投稿" },
  tipEmpty: {
    ko: "아직 꿀팁이 없어요. 이 역의 첫 꿀팁을 남겨 주세요!",
    en: "No tips yet. Be the first to share one!",
    zh: "还没有小贴士，来分享第一条吧！",
    ja: "まだ情報がありません。最初の情報を投稿しましょう！",
  },
  tipCta: { ko: "나도 꿀팁 제보하기", en: "Share a tip", zh: "我也来分享", ja: "情報を投稿する" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
} satisfies Record<string, Localized>;

export default function StationDashboard({ station }: { station: StationOption | null }) {
  const locale = useLocale();
  const router = useRouter();
  const lastStation = useLastStation();
  const reports = useStationReports(station);
  const { toast, showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flagging, setFlagging] = useState<FlagRequest | null>(null);
  const [urgent, setUrgent] = useState<StationUrgent | null>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (station) setDestinationStation(station);
  }, [station]);

  useEffect(() => {
    if (!station) return;
    let alive = true;
    loadUrgent(station).then((data) => {
      if (alive) setUrgent(data);
    });
    return () => {
      alive = false;
    };
  }, [station]);

  function openSearch() {
    flushSync(() => setSearchOpen(true));
    searchInputRef.current?.focus();
  }

  function selectStation(next: StationOption) {
    setSearchOpen(false);
    router.push(`/station?${stationParams(next)}`);
  }

  const liveTip = reports[0];

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader
          backHref="/"
          title={station ? station.name : DASHBOARD_TITLE}
          titlePrefix={station ? <LineBadges station={station} locale={locale} size="md" /> : null}
          action={
            station ? (
              <button
                type="button"
                onClick={openSearch}
                aria-label={t(COPY.searchOther, locale)}
                title={t(COPY.searchOther, locale)}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition active:scale-95"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </button>
            ) : null
          }
        />

        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          {station ? (
            <>
              <FacilitySearch station={station} urgent={urgent} locale={locale} />

              <ArrivalBoard station={station} locale={locale} />

              <AlarmBanner station={station} locale={locale} />

              <UtilityTiles
                station={station}
                locale={locale}
                hrefFor={(href) => `${href}?${stationParams(station)}`}
                className="mt-4"
              />

              <ExitGuide station={station} locale={locale} />

              <section className="mt-4 rounded-2xl bg-gradient-to-br from-[#fff7e6] to-[#fffdf8] px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-extrabold text-neutral-900">🍯 {t(COPY.tipTitle, locale)}</h2>
                  {liveTip ? (
                    <span className="rounded-full bg-white px-2 py-[2px] text-[10px] font-bold text-[#b45309]">
                      {t(COPY.tipLive, locale)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[14px] font-semibold leading-relaxed text-neutral-800">
                  {liveTip ? `💬 ${t(liveTip.text, locale)}` : t(COPY.tipEmpty, locale)}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <button type="button" onClick={() => setSheetOpen(true)} className="text-[12px] font-bold text-[#b45309]">
                    ✏️ {t(COPY.tipCta, locale)} →
                  </button>
                  {liveTip && !liveTip.mine ? (
                    <FlagButton
                      onClick={() => setFlagging({ target: "report", id: liveTip.id, authorId: liveTip.authorId })}
                    />
                  ) : null}
                </div>
              </section>
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="text-[14px] text-neutral-500">{t(COPY.notFound, locale)}</p>
              <button
                type="button"
                onClick={openSearch}
                className="rounded-2xl bg-[#2563eb] px-5 py-3 text-[14px] font-bold text-white"
              >
                🔍 {t(COPY.searchOther, locale)}
              </button>
            </div>
          )}
        </main>

        <BottomNav active="home" />

        <Toast message={toast} />

        {flagging ? <FlagSheet request={flagging} onClose={() => setFlagging(null)} onToast={showToast} /> : null}

        {sheetOpen ? (
          <ReportSheet
            station={station}
            onClose={() => setSheetOpen(false)}
            onPosted={() => {
              setSheetOpen(false);
              showToast(t(COPY.reportDone, locale));
            }}
          />
        ) : null}

        <SearchOverlay
          isOpen={searchOpen}
          onClose={closeSearch}
          onSelect={selectStation}
          inputRef={searchInputRef}
          near={lastStation?.center ?? null}
        />
      </div>
    </div>
  );
}
