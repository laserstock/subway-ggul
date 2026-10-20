"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AppHeader from "./AppHeader";
import StationSearch from "./StationSearch";
import { useLocale } from "../_lib/locale";
import { addReport, formatAgo, toggleLike, useNow, useStationReports } from "../_lib/reports";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import {
  distanceMeters,
  formatDistance,
  stationParams,
  t,
  type CategoryId,
  type Locale,
  type Localized,
  type StationOption,
} from "../_lib/stations";

const COPY = {
  now: { ko: "지금", en: "Now at" },
  destination: { ko: "목적지", en: "Heading to" },
  backToMine: { ko: "내 위치로", en: "My station" },
  locating: { ko: "현재 위치를 찾는 중…", en: "Finding your location…" },
  locatingHint: {
    ko: "가장 가까운 역을 자동으로 찾아드려요",
    en: "We'll find the nearest station for you",
  },
  noLocation: { ko: "위치를 확인할 수 없어요", en: "Can't find your location" },
  retry: { ko: "다시 시도", en: "Retry" },
  restroomInside: { ko: "개찰구 안 화장실", en: "Restroom inside gate" },
  normal: { ko: "정상", en: "OK" },
  lockerFree: { ko: "T-Locker 빈자리 있음", en: "T-Locker available" },
  facilityPending: {
    ko: "실시간 시설 정보 준비 중 · 첫 제보를 남겨 주세요",
    en: "Live facility info coming soon · Be the first to report",
  },
  search: {
    ko: "어느 역으로 가시나요? (예: 광화문역, 서울역)",
    en: "Where are you heading? (e.g. Gwanghwamun, Seoul Stn.)",
  },
  mainTitle: { ko: "유저 목적별 4대 대형 해결 버튼", en: "4 quick fixes for your trip" },
  feedTitle: { ko: "실시간 현장 소식 & 제보", en: "live updates & reports" },
  feedEmpty: {
    ko: "역을 찾으면 실시간 소식이 보여요",
    en: "Live updates appear once a station is found",
  },
  reportCta: { ko: "나도 1초 제보하기", en: "Report in 1 second" },
  like: { ko: "추천", en: "Like" },
  comingSoon: { ko: "곧 열려요! 조금만 기다려 주세요", en: "Coming soon!" },
  reportTitle: { ko: "에서 지금 무슨 일이 있나요?", en: ": what's happening now?" },
  reportHint: { ko: "누르면 바로 등록돼요", en: "Tap to post instantly" },
  reportPlaceholder: { ko: "직접 입력 (최대 60자)", en: "Write your own (max 60 chars)" },
  reportSubmit: { ko: "등록", en: "Post" },
  reportNeedStation: {
    ko: "위치를 허용하거나 역을 검색하면 제보할 수 있어요",
    en: "Allow location or search a station to report",
  },
  reportLocalNote: {
    ko: "베타: 제보는 이 기기에만 저장돼요",
    en: "Beta: reports are saved on this device only",
  },
  reportDone: { ko: "제보가 등록됐어요. 고마워요!", en: "Report posted. Thank you!" },
  close: { ko: "닫기", en: "Close" },
  tabHome: { ko: "홈", en: "Home" },
  tabSearch: { ko: "검색", en: "Search" },
  tabMine: { ko: "내 역", en: "My Stn" },
  tabReport: { ko: "제보", en: "Report" },
};

type MainAction = {
  id: string;
  emoji: string;
  title: Localized;
  detail?: Localized;
  sub: Localized;
  bg: string;
  accent: string;
  category?: CategoryId;
};

const MAIN_ACTIONS: MainAction[] = [
  {
    id: "urgent",
    emoji: "🚽💊",
    title: { ko: "긴급", en: "Urgent" },
    detail: { ko: "(화장실·약국·병원)", en: "(Restroom·Pharmacy·Clinic)" },
    sub: { ko: "개찰구 안! 3초 비교 →", en: "Inside the gate! 3-sec compare →" },
    bg: "#fde9ec",
    accent: "#e5484d",
    category: "pharmacy",
  },
  {
    id: "shops",
    emoji: "🛍️☕",
    title: { ko: "출구 매장 & 픽업", en: "Exit Shops & Pickup" },
    sub: { ko: "올영 · 다이소 · 카페 · 편의점", en: "Olive Young · Daiso · Cafe · Store" },
    bg: "#fdf1df",
    accent: "#b45309",
    category: "oliveyoung",
  },
  {
    id: "transfer",
    emoji: "🛗♿",
    title: { ko: "빠른환승 & 편안길", en: "Fast Transfer & Easy Route" },
    sub: { ko: "에스컬레이터 · 무장애 →", en: "Escalator · Barrier-free →" },
    bg: "#e5efff",
    accent: "#2563eb",
  },
  {
    id: "luggage",
    emoji: "🧳🌏",
    title: { ko: "짐보관 & 외국인", en: "Lockers & Travelers" },
    sub: { ko: "T-Locker · 환전 · KTX →", en: "T-Locker · Exchange · KTX →" },
    bg: "#e6f5e9",
    accent: "#15803d",
  },
];

const QUICK_REPORTS: { emoji: string; text: Localized }[] = [
  { emoji: "🧻", text: { ko: "화장실 휴지 있어요", en: "Restroom has tissue" } },
  { emoji: "🚧", text: { ko: "화장실 청소·고장 중", en: "Restroom closed for cleaning/repair" } },
  { emoji: "🛗", text: { ko: "엘리베이터 정상 운행", en: "Elevator is working" } },
  { emoji: "⚠️", text: { ko: "에스컬레이터 고장", en: "Escalator out of order" } },
  { emoji: "👥", text: { ko: "지금 많이 붐벼요", en: "Very crowded right now" } },
  { emoji: "🧳", text: { ko: "T-Locker 빈자리 있어요", en: "T-Locker has free space" } },
];

type NavTab = "home" | "search" | "station" | "report";

const NAV_TABS: { id: NavTab; label: Localized }[] = [
  { id: "home", label: COPY.tabHome },
  { id: "search", label: COPY.tabSearch },
  { id: "station", label: COPY.tabMine },
  { id: "report", label: COPY.tabReport },
];

function stationLabel(station: StationOption, locale: Locale) {
  const lines = t(station.lines, locale);
  return lines ? `${t(station.name, locale)} (${lines})` : t(station.name, locale);
}

function NavIcon({ name }: { name: NavTab }) {
  const common = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      {name === "home" ? <path {...common} d="M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /> : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="11" cy="11" r="6.5" />
          <path {...common} d="M20 20l-4-4" />
        </>
      ) : null}
      {name === "station" ? (
        <>
          <rect {...common} x="6" y="3.5" width="12" height="13" rx="3" />
          <path {...common} d="M6 11h12M9.5 20.5l1.5-4M14.5 20.5l-1.5-4" />
          <circle cx="9.5" cy="13.8" r="1" fill="currentColor" />
          <circle cx="14.5" cy="13.8" r="1" fill="currentColor" />
        </>
      ) : null}
      {name === "report" ? (
        <>
          <path {...common} d="M4 10.5v3a1 1 0 0 0 1 1h2l6 4V5.5l-6 4H5a1 1 0 0 0-1 1z" />
          <path {...common} d="M17 9a4 4 0 0 1 0 6" />
        </>
      ) : null}
    </svg>
  );
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
  const tracker = useStationTracker({ autoStart: true });
  const [destination, setDestination] = useState<StationOption | null>(null);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const now = useNow();
  const mainRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const station = destination ?? tracker.nearest;
  const reports = useStationReports(station);

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }

  function selectDestination(next: StationOption) {
    setDestination(next);
    setQuery(t(next.name, locale));
  }

  function backToMyStation() {
    setDestination(null);
    setQuery("");
    if (!tracker.tracking) tracker.start();
  }

  function onLocaleChange(next: Locale, previous: Locale) {
    if (destination && query === t(destination.name, previous)) {
      setQuery(t(destination.name, next));
    }
  }

  function actionHref(action: MainAction) {
    const params = station ? stationParams(station) : new URLSearchParams();
    if (!destination) params.set("near", "1");
    if (action.category) params.set("category", action.category);
    return `/shops?${params.toString()}`;
  }

  function postReport(text: Localized) {
    if (!station) return;
    addReport(station, text);
    setSheetOpen(false);
    setDraft("");
    showToast(t(COPY.reportDone, locale));
  }

  function onTab(tab: NavTab) {
    if (tab === "home" || tab === "search") {
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (tab === "search") searchInputRef.current?.focus();
    if (tab === "station") backToMyStation();
    if (tab === "report") setSheetOpen(true);
  }

  const distance =
    !destination && tracker.position && tracker.nearest
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
        <AppHeader onLocaleChange={onLocaleChange} />

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
          <Card className="bg-gradient-to-br from-[#fff7e6] to-[#fffdf8] px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-[18px] font-extrabold tracking-tight text-neutral-900">
                {headline}
              </p>
              {destination ? (
                <button
                  type="button"
                  onClick={backToMyStation}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-600"
                >
                  {t(COPY.backToMine, locale)}
                </button>
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
            <p className="mt-1.5 text-[12px] text-neutral-600">{detail}</p>
          </Card>

          <StationSearch
            className="mt-3"
            inputClassName="rounded-2xl border border-[#ece6da] bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
            locale={locale}
            query={query}
            onQueryChange={setQuery}
            onSelect={selectDestination}
            currentKey={destination?.key}
            placeholder={t(COPY.search, locale)}
            inputRef={searchInputRef}
          />

          <h2 className="mb-2.5 mt-5 text-[16px] font-extrabold tracking-tight text-neutral-900">
            {t(COPY.mainTitle, locale)}
          </h2>
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
              return action.category ? (
                <Link
                  key={action.id}
                  href={actionHref(action)}
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

          <Card className="mt-4 px-4 py-3.5">
            <h2 className="text-[14px] font-extrabold text-neutral-900">
              <span aria-hidden>💬 </span>
              {station ? `${t(station.name, locale)} ` : ""}
              {t(COPY.feedTitle, locale)}
            </h2>
            {reports.length === 0 ? (
              <p className="mt-2 text-[12px] text-neutral-400">{t(COPY.feedEmpty, locale)}</p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-100">
                {reports.slice(0, 5).map((report) => (
                  <li key={report.id} className="flex items-center gap-2 py-2">
                    <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-800">
                      {t(report.text, locale)}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleLike(report.id)}
                      aria-pressed={report.liked}
                      aria-label={t(COPY.like, locale)}
                      className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-semibold ${
                        report.liked ? "bg-[#fff1d6] text-[#b45309]" : "text-neutral-500"
                      }`}
                    >
                      <span aria-hidden>👍</span>
                      {report.likes}
                    </button>
                    {now !== null && (
                      <span className="shrink-0 text-[11px] text-neutral-400">
                        ({formatAgo(report.createdAt, now, locale)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

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

        <nav className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              aria-current={tab.id === "home" ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
                tab.id === "home" ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              <NavIcon name={tab.id} />
              {t(tab.label, locale)}
            </button>
          ))}
        </nav>

        {toast ? (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-6 bottom-20 z-[70] rounded-xl bg-neutral-900/90 px-4 py-2.5 text-center text-[13px] font-medium text-white"
          >
            {toast}
          </div>
        ) : null}

        {sheetOpen ? (
          <div className="absolute inset-0 z-[60] flex items-end bg-black/35" role="dialog" aria-modal>
            <button
              type="button"
              aria-label={t(COPY.close, locale)}
              className="absolute inset-0"
              onClick={() => setSheetOpen(false)}
            />
            <div className="relative w-full rounded-t-3xl bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
              <div className="mb-3 flex justify-center">
                <span className="h-[4px] w-10 rounded-full bg-neutral-300" />
              </div>
              {station ? (
                <>
                  <h2 className="text-[17px] font-extrabold text-neutral-900">
                    {t(station.name, locale)}
                    {t(COPY.reportTitle, locale)}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-neutral-500">{t(COPY.reportHint, locale)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {QUICK_REPORTS.map((item) => (
                      <button
                        key={item.text.ko}
                        type="button"
                        onClick={() => postReport(item.text)}
                        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-[13px] font-medium text-neutral-800 active:bg-neutral-50"
                      >
                        <span aria-hidden>{item.emoji}</span>
                        {t(item.text, locale)}
                      </button>
                    ))}
                  </div>
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const text = draft.trim();
                      if (text) postReport({ ko: text, en: text });
                    }}
                  >
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value.slice(0, 60))}
                      placeholder={t(COPY.reportPlaceholder, locale)}
                      className="min-w-0 flex-1 rounded-xl bg-[#f3f4f6] px-3 py-2.5 text-[13px] outline-none placeholder:text-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="shrink-0 rounded-xl bg-[#1e3a8a] px-4 text-[13px] font-bold text-white disabled:bg-neutral-300"
                    >
                      {t(COPY.reportSubmit, locale)}
                    </button>
                  </form>
                  <p className="mt-2 text-[11px] text-neutral-400">{t(COPY.reportLocalNote, locale)}</p>
                </>
              ) : (
                <p className="py-6 text-center text-[13px] text-neutral-500">
                  {t(COPY.reportNeedStation, locale)}
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
