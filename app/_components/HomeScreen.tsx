"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import DestinationAlarm from "./DestinationAlarm";
import { SearchIcon, StarIcon } from "./icons";
import LineBadges from "./LineBadges";
import LiveFeed from "./LiveFeed";
import LocationSheet from "./LocationSheet";
import ReportSheet from "./ReportSheet";
import SearchOverlay from "./SearchOverlay";
import { Toast, useToast } from "./Toast";
import UtilityTiles from "./UtilityTiles";
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
import { useStationTracker } from "../_lib/useStationTracker";
import { distanceMeters, stationParams, t, type StationOption } from "../_lib/stations";

const COPY = {
  search: {
    ko: "어느 역으로 가시나요? (예: 광화문역, 서울역)",
    en: "Where are you heading? (e.g. Gwanghwamun, Seoul Stn.)",
    zh: "您要去哪个站？（例：光化门站、首尔站）",
    ja: "どの駅へ行きますか？（例：光化門駅、ソウル駅）",
  },
  reportCta: { ko: "나도 1초 제보하기", en: "Report in 1 second", zh: "1秒快速上报", ja: "1秒で投稿する" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
  editMy: { ko: "편집", en: "Edit", zh: "编辑", ja: "編集" },
  switched: {
    ko: "📍 지금 역 변경 완료: {station}",
    en: "📍 Now at {station}",
    zh: "📍 已切换到{station}",
    ja: "📍 {station}に切り替えました",
  },
};

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

  const alarmTarget =
    (destination && destination.key !== current?.key ? destination : null) ??
    myPlaces.find((place) => place.station.key !== current?.key)?.station ??
    destination;

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

          <DestinationAlarm
            target={alarmTarget}
            current={current}
            currentDistance={current && tracker.position ? distanceMeters(tracker.position, current.center) : null}
            locating={!tracker.issue}
            locale={locale}
            onOrigin={() => setLocationOpen(true)}
            onChange={() => openSearch("destination")}
          />

          <UtilityTiles station={station} locale={locale} hrefFor={actionHref} className="mt-4" />

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
