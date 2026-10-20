"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LatLng } from "../KakaoMap";
import { useLocale } from "../_lib/locale";
import { useNearbyStations } from "../_lib/nearbyStations";
import type { StationSource } from "../_lib/selectedStation";
import {
  compactLines,
  distanceMeters,
  formatDistance,
  t,
  type Localized,
  type StationOption,
} from "../_lib/stations";
import { LOCATION_ISSUE_COPY, type LocationIssue } from "../_lib/useStationTracker";
import StationSearch from "./StationSearch";

const MAX_CHIPS = 4;

const COPY = {
  title: { ko: "위치가 맞지 않나요?", en: "Wrong station?", zh: "位置不对吗？", ja: "位置が違いますか？" },
  subtitle: {
    ko: "지하에서는 GPS가 자주 어긋나요. 지금 있는 역을 1초 만에 골라 주세요",
    en: "GPS often drifts underground. Pick your station in a second",
    zh: "地下GPS经常不准，请1秒选择您所在的车站",
    ja: "地下ではGPSがずれやすいです。今いる駅を1秒で選んでください",
  },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  relocate: { ko: "GPS로 다시 찾기", en: "Find again with GPS", zh: "用GPS重新定位", ja: "GPSで再検索" },
  relocating: {
    ko: "위치를 다시 찾는 중…",
    en: "Finding your location…",
    zh: "正在重新定位…",
    ja: "現在地を再検索中…",
  },
  relocated: {
    ko: "다시 찾았어요: {station}",
    en: "Found again: {station}",
    zh: "已重新定位：{station}",
    ja: "再検索しました：{station}",
  },
  relocateFailed: {
    ko: "위치를 다시 찾지 못했어요. 아래에서 역을 골라 주세요",
    en: "Couldn't get your location. Pick a station below",
    zh: "无法重新定位，请在下方选择车站",
    ja: "現在地を取得できませんでした。下から駅を選んでください",
  },
  nearbyTitle: {
    ko: "주변 역 1초 선택",
    en: "Tap your station",
    zh: "附近车站 一键选择",
    ja: "周辺の駅をワンタップ選択",
  },
  nearbyEmpty: {
    ko: "주변 역을 찾지 못했어요. 아래에서 직접 검색해 주세요",
    en: "No nearby stations found. Search below",
    zh: "未找到附近车站，请在下方搜索",
    ja: "周辺の駅が見つかりません。下から検索してください",
  },
  current: { ko: "현재", en: "Now", zh: "当前", ja: "現在" },
  searchTitle: {
    ko: "다른 역 직접 입력",
    en: "Search another station",
    zh: "手动输入其他车站",
    ja: "他の駅を直接入力",
  },
  searchPlaceholder: {
    ko: "다른 역 직접 입력하기...",
    en: "Type another station...",
    zh: "输入其他车站…",
    ja: "他の駅を入力...",
  },
  sourceGps: { ko: "GPS 자동", en: "Auto (GPS)", zh: "GPS自动", ja: "GPS自動" },
  sourceManual: { ko: "직접 선택", en: "Picked by you", zh: "手动选择", ja: "手動選択" },
} satisfies Record<string, Localized>;

type RelocateResult = { status: "found"; station: StationOption } | { status: "failed" } | null;

export default function LocationSheet({
  isOpen,
  onClose,
  current,
  source,
  position,
  searchCenter,
  issue,
  onRelocate,
  onPick,
}: {
  isOpen: boolean;
  onClose: () => void;
  current: StationOption | null;
  source: StationSource | null;
  /** Live GPS fix used for distance labels. */
  position: LatLng | null;
  /** Where to look for nearby stations (the last GPS lookup point, so results are already cached). */
  searchCenter: LatLng | null;
  issue: LocationIssue | null;
  onRelocate: () => Promise<StationOption | null>;
  onPick: (station: StationOption, source: "chip" | "search") => void;
}) {
  const locale = useLocale();
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [relocating, setRelocating] = useState(false);
  const [result, setResult] = useState<RelocateResult>(null);

  const center = searchCenter ?? current?.center ?? null;
  const nearby = useNearbyStations(isOpen ? center : null);
  const origin = position ?? current?.center ?? null;

  const chipStations: StationOption[] = current ? [current] : [];
  for (const station of nearby ?? []) {
    if (chipStations.length >= MAX_CHIPS) break;
    if (!chipStations.some((item) => item.key === station.key)) chipStations.push(station);
  }

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus({ preventScroll: true });
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  async function relocate() {
    setRelocating(true);
    setResult(null);
    const station = await onRelocate();
    setRelocating(false);
    setResult(station ? { status: "found", station } : { status: "failed" });
  }

  function pick(station: StationOption, from: "chip" | "search") {
    setQuery("");
    onPick(station, from);
  }

  const failureText = issue ? t(LOCATION_ISSUE_COPY[issue], locale) : t(COPY.relocateFailed, locale);

  return (
    <div
      className={`absolute inset-0 z-[80] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t(COPY.close, locale)}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || isOpen) return;
          setQuery("");
          setResult(null);
        }}
        className={`absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pb-3" aria-hidden>
          <span className="h-[5px] w-11 rounded-full bg-neutral-300" />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[19px] font-extrabold tracking-tight text-neutral-900">
              {t(COPY.title, locale)}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{t(COPY.subtitle, locale)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="-mr-1 shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold text-neutral-500 transition-colors active:bg-neutral-100"
          >
            {t(COPY.close, locale)}
          </button>
        </div>

        <button
          type="button"
          onClick={relocate}
          disabled={relocating}
          aria-busy={relocating}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#eef4ff] py-3.5 text-[15px] font-bold text-[#1d4ed8] transition active:scale-[0.98] disabled:opacity-80"
        >
          <span className={`inline-block text-[17px] ${relocating ? "animate-spin" : ""}`} aria-hidden>
            🔄
          </span>
          {t(relocating ? COPY.relocating : COPY.relocate, locale)}
        </button>
        {result ? (
          <p
            role="status"
            className={`mt-2 text-center text-[12px] font-semibold ${
              result.status === "found" ? "text-[#16a34a]" : "text-amber-700"
            }`}
          >
            {result.status === "found"
              ? `✅ ${t(COPY.relocated, locale).replace("{station}", t(result.station.name, locale))}`
              : failureText}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <h3 className="text-[14px] font-extrabold text-neutral-900">{t(COPY.nearbyTitle, locale)}</h3>
          {source ? (
            <span className="rounded-full bg-neutral-100 px-2 py-[3px] text-[11px] font-semibold text-neutral-500">
              {t(source === "gps" ? COPY.sourceGps : COPY.sourceManual, locale)}
            </span>
          ) : null}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {chipStations.map((station) => {
            const isCurrent = station.key === current?.key;
            const distance = origin ? distanceMeters(origin, station.center) : null;
            return (
              <button
                key={station.key}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => (isCurrent ? onClose() : pick(station, "chip"))}
                className={`flex min-h-[52px] items-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 text-left transition active:scale-[0.96] ${
                  isCurrent ? "shadow-[0_2px_8px_rgba(15,23,42,0.08)]" : ""
                }`}
                style={{
                  backgroundColor: `${station.color}1c`,
                  borderColor: isCurrent ? station.color : `${station.color}33`,
                }}
              >
                {isCurrent ? <span aria-hidden>📍</span> : null}
                <span className="text-[15px] font-extrabold text-neutral-900">{t(station.name, locale)}</span>
                <span className="text-[12px] font-medium text-neutral-500">({compactLines(station, locale)})</span>
                <span className="text-[12px] font-bold" style={{ color: station.color }}>
                  ·{" "}
                  {isCurrent
                    ? t(COPY.current, locale)
                    : distance !== null
                      ? formatDistance(distance)
                      : ""}
                </span>
              </button>
            );
          })}
          {nearby === null && center
            ? Array.from({ length: MAX_CHIPS - chipStations.length }, (_, index) => (
                <span
                  key={index}
                  className="h-[52px] w-[140px] animate-pulse rounded-2xl bg-neutral-100"
                  aria-hidden
                />
              ))
            : null}
        </div>
        {(nearby !== null || !center) && chipStations.length === 0 ? (
          <p className="mt-1 text-[12px] text-neutral-400">{t(COPY.nearbyEmpty, locale)}</p>
        ) : null}

        <h3 className="mb-2 mt-5 text-[14px] font-extrabold text-neutral-900">{t(COPY.searchTitle, locale)}</h3>
        <StationSearch
          locale={locale}
          query={query}
          onQueryChange={setQuery}
          onSelect={(station) => pick(station, "search")}
          currentKey={current?.key}
          placeholder={t(COPY.searchPlaceholder, locale)}
          placement="above"
          inputClassName="rounded-2xl border border-neutral-200 bg-[#f7f8fa] px-3.5 py-3"
        />
      </section>
    </div>
  );
}
