"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import AppHeader from "./AppHeader";
import BottomNav, { type NavTab } from "./BottomNav";
import { SearchIcon } from "./icons";
import LiveFeed from "./LiveFeed";
import LocationSheet from "./LocationSheet";
import ReportSheet from "./ReportSheet";
import SearchOverlay from "./SearchOverlay";
import { Toast, useToast } from "./Toast";
import { useHomeResetToken } from "../_lib/homeReset";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import {
  clearSelectedStation,
  selectStation,
  setDestinationStation,
  syncSelectedStation,
  useDestinationStation,
  useSelectedStation,
} from "../_lib/selectedStation";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import {
  compactLines,
  distanceMeters,
  formatDistance,
  stationParams,
  t,
  type Locale,
  type Localized,
  type StationOption,
} from "../_lib/stations";

const COPY = {
  now: { ko: "지금", en: "Now at", zh: "当前", ja: "現在" },
  destination: { ko: "목적지", en: "Heading to", zh: "目的地", ja: "目的地" },
  backToMine: { ko: "내 위치로", en: "My station", zh: "我的位置", ja: "現在地へ" },
  locating: {
    ko: "현재 위치를 찾는 중…",
    en: "Finding your location…",
    zh: "正在查找当前位置…",
    ja: "現在地を検索中…",
  },
  locatingHint: {
    ko: "가장 가까운 역을 자동으로 찾아드려요",
    en: "We'll find the nearest station for you",
    zh: "自动为您查找最近的车站",
    ja: "最寄り駅を自動で探します",
  },
  noLocation: {
    ko: "위치를 확인할 수 없어요",
    en: "Can't find your location",
    zh: "无法确认您的位置",
    ja: "現在地を確認できません",
  },
  retry: { ko: "다시 시도", en: "Retry", zh: "重试", ja: "再試行" },
  restroomInside: { ko: "개찰구 안 화장실", en: "Restroom inside gate", zh: "闸机内卫生间", ja: "改札内トイレ" },
  normal: { ko: "정상", en: "OK", zh: "正常", ja: "正常" },
  lockerFree: {
    ko: "T-Locker 빈자리 있음",
    en: "T-Locker available",
    zh: "T-Locker 有空位",
    ja: "T-Locker 空きあり",
  },
  facilityPending: {
    ko: "실시간 시설 정보 준비 중 · 첫 제보를 남겨 주세요",
    en: "Live facility info coming soon · Be the first to report",
    zh: "实时设施信息准备中 · 欢迎第一个上报",
    ja: "リアルタイム施設情報は準備中 · 最初の投稿をお願いします",
  },
  search: {
    ko: "어느 역으로 가시나요? (예: 광화문역, 서울역)",
    en: "Where are you heading? (e.g. Gwanghwamun, Seoul Stn.)",
    zh: "您要去哪个站？（例：光化门站、首尔站）",
    ja: "どの駅へ行きますか？（例：光化門駅、ソウル駅）",
  },
  mainTitle: {
    ko: "지하철 내리기 전 필수 체크",
    en: "Check before you get off",
    zh: "下车前必看",
    ja: "降りる前に必ずチェック",
  },
  mainSubtitle: {
    ko: "지하철 내리기 전 꼭 필요한 긴급 동선 해결사",
    en: "Your quick route fixer for the moment before your stop",
    zh: "下车前必备的紧急动线助手",
    ja: "降車前に役立つ緊急ルートお助け",
  },
  reportCta: { ko: "나도 1초 제보하기", en: "Report in 1 second", zh: "1秒快速上报", ja: "1秒で投稿する" },
  comingSoon: {
    ko: "곧 열려요! 조금만 기다려 주세요",
    en: "Coming soon!",
    zh: "即将开放！敬请期待",
    ja: "まもなく公開！少々お待ちください",
  },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
  manualBadge: { ko: "직접 선택", en: "Picked", zh: "手动选择", ja: "手動選択" },
  confirming: { ko: "위치 확인 중", en: "Checking", zh: "确认中", ja: "確認中" },
  correctLocation: {
    ko: "위치 교정하기",
    en: "Correct my station",
    zh: "校正我的车站",
    ja: "現在の駅を修正",
  },
  switched: {
    ko: "📍 지금 역 변경 완료: {station}",
    en: "📍 Now at {station}",
    zh: "📍 已切换到{station}",
    ja: "📍 {station}に切り替えました",
  },
};

type MainAction = {
  id: string;
  emoji: string;
  title: Localized;
  detail?: Localized;
  sub: Localized;
  bg: string;
  accent: string;
  href?: "/urgent" | "/shops" | "/transfer";
};

const MAIN_ACTIONS: MainAction[] = [
  {
    id: "urgent",
    emoji: "🚽💊",
    title: { ko: "긴급", en: "Urgent", zh: "紧急", ja: "緊急" },
    detail: {
      ko: "(화장실·약국·병원)",
      en: "(Restroom·Pharmacy·Clinic)",
      zh: "(卫生间·药店·医院)",
      ja: "(トイレ·薬局·病院)",
    },
    sub: {
      ko: "개찰구 안! 3초 비교 →",
      en: "Inside the gate! 3-sec compare →",
      zh: "闸机内！3秒比较 →",
      ja: "改札内！3秒比較 →",
    },
    bg: "#fde9ec",
    accent: "#e5484d",
    href: "/urgent",
  },
  {
    id: "shops",
    emoji: "🛍️☕",
    title: { ko: "출구 매장 & 픽업", en: "Exit Shops & Pickup", zh: "出口商店 & 自提", ja: "出口ショップ & 受け取り" },
    sub: {
      ko: "올영 · 다이소 · 카페 · 편의점",
      en: "Olive Young · Daiso · Cafe · Store",
      zh: "Olive Young · 大创 · 咖啡 · 便利店",
      ja: "オリーブヤング · ダイソー · カフェ · コンビニ",
    },
    bg: "#fdf1df",
    accent: "#b45309",
    href: "/shops",
  },
  {
    id: "transfer",
    emoji: "🛗♿",
    title: {
      ko: "빠른환승 & 편한길",
      en: "Fast Transfer & Easy Route",
      zh: "快速换乘 & 舒适路线",
      ja: "スムーズ乗換 & らくらくルート",
    },
    sub: {
      ko: "에스컬레이터 · 무장애 →",
      en: "Escalator · Barrier-free →",
      zh: "扶梯 · 无障碍 →",
      ja: "エスカレーター · バリアフリー →",
    },
    bg: "#e5efff",
    accent: "#2563eb",
    href: "/transfer",
  },
  {
    id: "luggage",
    emoji: "🧳🌏",
    title: { ko: "짐보관 & 외국인", en: "Lockers & Travelers", zh: "行李寄存 & 外国游客", ja: "荷物預け & 旅行者" },
    sub: {
      ko: "T-Locker · 환전 · KTX →",
      en: "T-Locker · Exchange · KTX →",
      zh: "T-Locker · 换汇 · KTX →",
      ja: "T-Locker · 両替 · KTX →",
    },
    bg: "#e6f5e9",
    accent: "#15803d",
  },
];

function stationLabel(station: StationOption, locale: Locale) {
  const lines = compactLines(station, locale);
  return lines ? `${t(station.name, locale)} (${lines})` : t(station.name, locale);
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[#efe9dd] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

export default function HomeScreen() {
  const locale = useLocale();
  const tracker = useStationTracker({ autoStart: true, quickStart: true });
  const lastStation = useLastStation();
  const router = useRouter();
  const destination = useDestinationStation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeLocation = useCallback(() => setLocationOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const { toast, showToast } = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resetToken = useHomeResetToken();
  const [handledReset, setHandledReset] = useState(resetToken);

  if (handledReset !== resetToken) {
    setHandledReset(resetToken);
    setSheetOpen(false);
    setLocationOpen(false);
    setSearchOpen(false);
  }

  const confirming =
    tracker.nearest === null &&
    lastStation !== null &&
    tracker.issue !== "denied" &&
    tracker.issue !== "unsupported";
  const selected = useSelectedStation(tracker.nearest ?? (confirming ? lastStation : null));
  const current = selected?.station ?? null;
  const isManual = selected !== null && selected.source !== "gps";
  const station = destination ?? current;

  useEffect(() => {
    syncSelectedStation(tracker.position);
  }, [tracker.position]);

  useEffect(() => {
    if (window.location.hash !== "#search") return;
    window.history.replaceState(null, "", window.location.pathname);
    const frame = requestAnimationFrame(() => {
      setSearchOpen(true);
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const onHomeReset = useEffectEvent(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    searchInputRef.current?.blur();
    if (!tracker.tracking) tracker.start();
  });

  useEffect(() => {
    if (resetToken > 0) onHomeReset();
  }, [resetToken]);

  useEffect(() => {
    router.prefetch("/station");
  }, [router]);

  function openSearch() {
    flushSync(() => setSearchOpen(true));
    searchInputRef.current?.focus();
  }

  function openDashboard(next: StationOption) {
    setDestinationStation(next);
    setSearchOpen(false);
    router.push(`/station?${stationParams(next)}`);
  }

  function backToMyStation() {
    setDestinationStation(null);
    if (!tracker.tracking) tracker.start();
  }

  function actionHref(href: string) {
    const params = station ? stationParams(station) : new URLSearchParams();
    if (!destination && !isManual) params.set("near", "1");
    return `${href}?${params.toString()}`;
  }

  function pickCurrentStation(next: StationOption, source: "chip" | "search") {
    if (next.key === tracker.nearest?.key) clearSelectedStation();
    else selectStation(next, source, tracker.position);
    setDestinationStation(null);
    setLocationOpen(false);
    showToast(t(COPY.switched, locale).replace("{station}", t(next.name, locale)));
  }

  async function relocate() {
    const found = await tracker.relocate();
    if (found) {
      clearSelectedStation();
      setDestinationStation(null);
    }
    return found;
  }

  function onReportPosted() {
    setSheetOpen(false);
    showToast(t(COPY.reportDone, locale));
  }

  function onTab(tab: NavTab) {
    if (tab === "home") mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (tab === "search") openSearch();
    if (tab === "station") backToMyStation();
    if (tab === "report") setSheetOpen(true);
  }

  const distance =
    !destination && !isManual && tracker.position && tracker.nearest
      ? distanceMeters(tracker.position, tracker.nearest.center)
      : null;

  let headline: ReactNode;
  let detail: ReactNode;
  if (station) {
    headline = (
      <>
        <span aria-hidden>{destination ? "🎯" : "📍"}</span>
        {t(destination ? COPY.destination : COPY.now, locale)} {stationLabel(station, locale)}
      </>
    );
    detail = station.curated ? (
      <>
        {t(COPY.restroomInside, locale)}{" "}
        <span className="rounded-full bg-[#22c55e] px-1.5 py-[1px] text-[10px] font-bold text-white">
          {t(COPY.normal, locale)}
        </span>
        <span className="mx-1 text-neutral-300">·</span>
        {t(COPY.lockerFree, locale)}
      </>
    ) : (
      t(COPY.facilityPending, locale)
    );
  } else if (tracker.issue) {
    headline = (
      <>
        <span aria-hidden>📍</span>
        {t(COPY.noLocation, locale)}
      </>
    );
    detail = t(LOCATION_ISSUE_COPY[tracker.issue], locale);
  } else {
    headline = (
      <>
        <span aria-hidden>📍</span>
        {t(COPY.locating, locale)}
      </>
    );
    detail = t(COPY.locatingHint, locale);
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-[#fbf8f2] shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader />

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
          <Card className="bg-gradient-to-br from-[#fff7e6] to-[#fffdf8] px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={locationOpen}
                title={t(COPY.correctLocation, locale)}
                className="min-w-0 flex-1 rounded-xl text-left transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-1 text-[18px] font-extrabold tracking-tight text-neutral-900">
                  <span className="min-w-0 truncate">{headline}</span>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#b45309]/10 text-[#b45309]"
                    aria-hidden
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="sr-only">{t(COPY.correctLocation, locale)}</span>
                </span>
                <span className="mt-1.5 block text-[12px] font-normal text-neutral-600">{detail}</span>
              </button>
              {destination ? (
                <button
                  type="button"
                  onClick={backToMyStation}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600"
                >
                  {t(COPY.backToMine, locale)}
                </button>
              ) : isManual ? (
                <span className="shrink-0 rounded-full bg-[#eff5ff] px-2 py-1 text-[11px] font-semibold text-[#2563eb]">
                  ✋ {t(COPY.manualBadge, locale)}
                </span>
              ) : confirming ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-neutral-500 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                  {t(COPY.confirming, locale)}
                </span>
              ) : distance !== null ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#16a34a] shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e]/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
                  </span>
                  {formatDistance(distance)}
                </span>
              ) : tracker.issue ? (
                <button
                  type="button"
                  onClick={tracker.start}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600"
                >
                  {t(COPY.retry, locale)}
                </button>
              ) : null}
            </div>
          </Card>

          <button
            type="button"
            onClick={openSearch}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-[#ece6da] bg-white px-3.5 py-3 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition active:scale-[0.99]"
          >
            <SearchIcon />
            <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-400">{t(COPY.search, locale)}</span>
          </button>

          <header className="mb-3 mt-6 flex items-start gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffe7c2] to-[#ffd6a0] text-[18px] shadow-[0_2px_6px_rgba(245,158,11,0.25)]"
              aria-hidden
            >
              ✨
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-neutral-900">
                {t(COPY.mainTitle, locale)}
              </h2>
              <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{t(COPY.mainSubtitle, locale)}</p>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-2.5">
            {MAIN_ACTIONS.map((action) => {
              const body = (
                <>
                  <span className="block text-[34px] leading-none" aria-hidden>
                    {action.emoji}
                  </span>
                  <span className="mt-3 block text-[15px] font-extrabold leading-tight text-neutral-900">
                    {t(action.title, locale)}
                    {action.detail ? (
                      <span className="ml-0.5 text-[11px] font-semibold text-neutral-600">
                        {t(action.detail, locale)}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="mt-1.5 block text-[11px] font-bold"
                    style={{ color: action.accent }}
                  >
                    {t(action.sub, locale)}
                  </span>
                </>
              );
              const className =
                "block min-h-[132px] rounded-2xl p-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition active:scale-[0.98]";
              return action.href ? (
                <Link
                  key={action.id}
                  href={actionHref(action.href)}
                  className={className}
                  style={{ backgroundColor: action.bg }}
                >
                  {body}
                </Link>
              ) : (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => showToast(t(COPY.comingSoon, locale))}
                  className={className}
                  style={{ backgroundColor: action.bg }}
                >
                  {body}
                </button>
              );
            })}
          </div>

          <LiveFeed station={station} onToast={showToast} />

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-2.5 flex w-full items-center justify-between rounded-2xl border border-[#efe9dd] bg-white px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
          >
            <span className="text-[14px] font-extrabold text-neutral-900">
              <span aria-hidden>✏️ </span>
              {t(COPY.reportCta, locale)}
            </span>
            <span className="text-[16px] text-neutral-400" aria-hidden>
              →
            </span>
          </button>
        </main>

        <BottomNav active="home" onTab={onTab} />

        <Toast message={toast} />

        {sheetOpen ? (
          <ReportSheet station={station} onClose={() => setSheetOpen(false)} onPosted={onReportPosted} />
        ) : null}

        <LocationSheet
          isOpen={locationOpen}
          onClose={closeLocation}
          current={current}
          source={selected?.source ?? null}
          position={tracker.position}
          searchCenter={tracker.lookupPosition}
          issue={tracker.issue}
          onRelocate={relocate}
          onPick={pickCurrentStation}
        />

        <SearchOverlay
          isOpen={searchOpen}
          onClose={closeSearch}
          onSelect={openDashboard}
          inputRef={searchInputRef}
          near={tracker.position ?? current?.center ?? null}
        />
      </div>
    </div>
  );
}
