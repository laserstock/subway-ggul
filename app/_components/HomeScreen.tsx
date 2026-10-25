"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import AppHeader from "./AppHeader";
import BottomNav, { HoneyPotIcon } from "./BottomNav";
import ActionTile, { type ActionKind } from "./ActionTile";
import DestinationAlarm from "./DestinationAlarm";
import { PinIcon, SearchIcon, StarIcon } from "./icons";
import LineBadges from "./LineBadges";
import LiveFeed from "./LiveFeed";
import LocationSheet from "./LocationSheet";
import ReportSheet from "./ReportSheet";
import SearchOverlay from "./SearchOverlay";
import { Toast, useToast } from "./Toast";
import { armArrivalAlarm, useArrivalAlarm } from "../_lib/arrivalAlarm";
import { useHomeResetToken } from "../_lib/homeReset";
import { useLastStation } from "../_lib/lastStation";
import { useLocale, useMessages } from "../_lib/locale";
import { useMyStations } from "../_lib/myStations";
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
  distanceMeters,
  formatDistance,
  stationParams,
  t,
  type Localized,
  type StationOption,
} from "../_lib/stations";

const COPY = {
  now: { ko: "지금", en: "Now at", zh: "当前", ja: "現在" },
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
  search: {
    ko: "어느 역으로 가시나요? (예: 광화문역, 서울역)",
    en: "Where are you heading? (e.g. Gwanghwamun, Seoul Stn.)",
    zh: "您要去哪个站？（例：光化门站、首尔站）",
    ja: "どの駅へ行きますか？（例：光化門駅、ソウル駅）",
  },
  checkTitle: { ko: "내리기 전 필수 체크!", en: "Before you get off!", zh: "下车前必看！", ja: "降りる前にチェック！" },
  honeyTitle: { ko: "꿀정보", en: "tips", zh: "攻略", ja: "お役立ち情報" },
  reportCta: { ko: "나도 1초 제보하기", en: "Report in 1 second", zh: "1秒快速上报", ja: "1秒で投稿する" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
  manualBadge: { ko: "직접 선택", en: "Picked", zh: "手动选择", ja: "手動選択" },
  editMy: { ko: "편집", en: "Edit", zh: "编辑", ja: "編集" },
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
  kind: ActionKind;
  title: Localized;
  sub: Localized;
  href: "/urgent" | "/shops" | "/transfer" | "/luggage";
};

const MAIN_ACTIONS: MainAction[] = [
  {
    kind: "urgent",
    title: { ko: "화장실 · 약국", en: "Restroom · Pharmacy", zh: "卫生间 · 药店", ja: "トイレ · 薬局" },
    sub: { ko: "개찰구 안/밖 3초 비교", en: "In/out of gate", zh: "闸机内/外比较", ja: "改札内/外を比較" },
    href: "/urgent",
  },
  {
    kind: "shops",
    title: { ko: "출구 주변 가게", en: "Shops by exits", zh: "出口周边商店", ja: "出口近くの店" },
    sub: { ko: "올영 · 카페 · 편의점", en: "Olive Young · Cafe · Store", zh: "Olive Young · 咖啡 · 便利店", ja: "オリヤン · カフェ · コンビニ" },
    href: "/shops",
  },
  {
    kind: "transfer",
    title: { ko: "빠른 환승", en: "Fast transfer", zh: "快速换乘", ja: "スムーズ乗換" },
    sub: { ko: "에스컬레이터 · 엘리베이터", en: "Escalator · Elevator", zh: "扶梯 · 电梯", ja: "エスカレーター · エレベーター" },
    href: "/transfer",
  },
  {
    kind: "luggage",
    title: { ko: "짐 보관", en: "Luggage", zh: "行李寄存", ja: "荷物預け" },
    sub: { ko: "또타라커 · 러기지", en: "T-Locker · T-Luggage", zh: "T-Locker · T-Luggage", ja: "T-Locker · T-Luggage" },
    href: "/luggage",
  },
];

type SearchMode = "dashboard" | "destination";

export default function HomeScreen() {
  const locale = useLocale();
  const m = useMessages();
  const { places: myPlaces } = useMyStations();
  const tracker = useStationTracker({ autoStart: true, quickStart: true });
  const lastStation = useLastStation();
  const router = useRouter();
  const destination = useDestinationStation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("dashboard");
  const alarm = useArrivalAlarm();
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
    syncSelectedStation({ position: tracker.position, accuracy: tracker.accuracy });
  }, [tracker.position, tracker.accuracy]);

  useEffect(() => {
    if (window.location.hash !== "#search") return;
    window.history.replaceState(null, "", window.location.pathname);
    const frame = requestAnimationFrame(() => {
      setSearchMode("dashboard");
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

  function openSearch(mode: SearchMode) {
    flushSync(() => {
      setSearchMode(mode);
      setSearchOpen(true);
    });
    searchInputRef.current?.focus();
  }

  function openDashboard(next: StationOption) {
    setDestinationStation(next);
    setSearchOpen(false);
    router.push(`/station?${stationParams(next)}`);
  }

  function pickDestination(next: StationOption) {
    setDestinationStation(next);
    setSearchOpen(false);
    if (alarm) void armArrivalAlarm(next);
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
    else selectStation(next, source, { position: tracker.position, accuracy: tracker.accuracy });
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

  const distance =
    !destination && !isManual && tracker.position && tracker.nearest
      ? distanceMeters(tracker.position, tracker.nearest.center)
      : null;

  const alarmTarget =
    (destination && destination.key !== current?.key ? destination : null) ??
    myPlaces.find((place) => place.station.key !== current?.key)?.station ??
    destination;

  let headline: ReactNode;
  let detail: ReactNode = null;
  if (current) {
    headline = (
      <>
        <PinIcon size={18} className="mr-1 shrink-0 text-honey" />
        <span className="min-w-0 truncate">
          {t(COPY.now, locale)} {t(current.name, locale)}
        </span>
        <LineBadges station={current} locale={locale} size="sm" className="ml-1.5" />
      </>
    );
  } else if (tracker.issue) {
    headline = (
      <>
        <PinIcon size={18} className="mr-1 shrink-0 text-neutral-400" />
        <span className="min-w-0 truncate">{t(COPY.noLocation, locale)}</span>
      </>
    );
    detail = t(LOCATION_ISSUE_COPY[tracker.issue], locale);
  } else {
    headline = (
      <>
        <PinIcon size={18} className="mr-1 shrink-0 animate-pulse text-honey" />
        <span className="min-w-0 truncate">{t(COPY.locating, locale)}</span>
      </>
    );
    detail = t(COPY.locatingHint, locale);
  }

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader />

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
          <button
            type="button"
            onClick={() => openSearch("dashboard")}
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="flex w-full items-center gap-2 rounded-2xl border border-line bg-surface-muted px-3.5 py-3 text-left transition active:scale-[0.99]"
          >
            <SearchIcon />
            <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-400">{t(COPY.search, locale)}</span>
          </button>

          {myPlaces.length > 0 ? (
            <div className="no-scrollbar -mx-4 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-4">
              <span className="flex shrink-0 items-center gap-1 text-[12px] font-extrabold text-ink">
                <StarIcon className="text-honey" />
                {m.nav.station}:
              </span>
              {myPlaces.map((place) => {
                const active = place.station.key === station?.key;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => openDashboard(place.station)}
                    aria-pressed={active}
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface py-1 pl-1.5 pr-3 text-[12px] font-bold text-ink transition active:scale-95"
                    style={{
                      boxShadow: `inset 0 0 0 ${active ? 2 : 1}px ${active ? place.station.color : "var(--line)"}`,
                    }}
                  >
                    <LineBadges station={place.station} locale={locale} size="sm" />
                    {t(place.station.name, locale)}
                  </button>
                );
              })}
              <Link
                href="/my"
                className="ml-auto shrink-0 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[12px] font-bold text-ink-muted"
              >
                ⚙️ {t(COPY.editMy, locale)}
              </Link>
            </div>
          ) : null}

          <section className="mt-4 rounded-[20px] border border-[#f5d76e] bg-gradient-to-br from-[#fff8db] to-[#fffdf3] px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={locationOpen}
                title={t(COPY.correctLocation, locale)}
                className="min-w-0 flex-1 rounded-xl text-left transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-1 text-[14px] font-extrabold tracking-tight text-ink">
                  <span className="flex min-w-0 items-center">{headline}</span>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-honey-soft text-honey-strong"
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
                {detail ? (
                  <span className="mt-1 block pl-[22px] text-[12px] font-normal text-ink-muted">{detail}</span>
                ) : null}
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

            <DestinationAlarm
              target={alarmTarget}
              current={current}
              locale={locale}
              onChange={() => openSearch("destination")}
            />
          </section>

          <h2 className="mb-2 mt-4 flex items-center gap-1 text-[15px] font-extrabold tracking-tight text-neutral-900">
            <span className="mr-0.5 shrink-0 text-[#b45309]">{t(COPY.checkTitle, locale)}</span>
            {station ? (
              <>
                <span className="min-w-0 truncate">{t(station.name, locale)}</span>
                <LineBadges station={station} locale={locale} size="sm" className="shrink-0" />
              </>
            ) : null}
            <span className="shrink-0">{t(COPY.honeyTitle, locale)}</span>
            <HoneyPotIcon size={20} />
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {MAIN_ACTIONS.map((action) => (
              <ActionTile
                key={action.kind}
                kind={action.kind}
                title={t(action.title, locale)}
                sub={t(action.sub, locale)}
                href={actionHref(action.href)}
                compact
              />
            ))}
          </div>

          <LiveFeed station={station} onToast={showToast} />

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-2.5 flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
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

        <BottomNav active="home" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />

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
          onSelect={searchMode === "destination" ? pickDestination : openDashboard}
          inputRef={searchInputRef}
          near={tracker.position ?? current?.center ?? null}
        />
      </div>
    </div>
  );
}
