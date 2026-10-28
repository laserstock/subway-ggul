"use client";

import { useEffect, useId, useState, type KeyboardEvent, type RefObject } from "react";
import type { LatLng } from "../KakaoMap";
import { useLocale } from "../_lib/locale";
import {
  addRecentStation,
  clearRecentStations,
  removeRecentStation,
  useRecentStations,
} from "../_lib/recentStations";
import { useStationSuggestions } from "../_lib/stationSearch";
import {
  POPULAR_STATIONS,
  distanceMeters,
  formatDistance,
  t,
  type Localized,
  type StationOption,
} from "../_lib/stations";
import { SearchIcon } from "./icons";
import LineBadges from "./LineBadges";

const COPY = {
  back: { ko: "뒤로", en: "Back", zh: "返回", ja: "戻る" },
  placeholder: {
    ko: "역 이름을 입력하세요 (예: 광화문)",
    en: "Enter a station (e.g. Gwanghwamun)",
    zh: "输入车站名（例：光化门）",
    ja: "駅名を入力（例：光化門）",
  },
  clear: { ko: "지우기", en: "Clear", zh: "清除", ja: "クリア" },
  submit: { ko: "검색", en: "Search", zh: "搜索", ja: "検索" },
  recent: { ko: "최근 검색", en: "Recent", zh: "最近搜索", ja: "最近の検索" },
  clearAll: { ko: "전체 삭제", en: "Clear all", zh: "全部删除", ja: "すべて削除" },
  recentEmpty: {
    ko: "최근 검색한 역이 여기에 표시돼요",
    en: "Stations you search will appear here",
    zh: "搜索过的车站会显示在这里",
    ja: "検索した駅がここに表示されます",
  },
  remove: { ko: "삭제", en: "Remove", zh: "删除", ja: "削除" },
  popular: { ko: "🔥 인기 역", en: "🔥 Popular stations", zh: "🔥 热门车站", ja: "🔥 人気の駅" },
  noResult: {
    ko: "'{q}'에 해당하는 역이 없어요",
    en: "No stations match '{q}'",
    zh: "没有与“{q}”匹配的车站",
    ja: "「{q}」に一致する駅がありません",
  },
  searching: { ko: "검색 중…", en: "Searching…", zh: "搜索中…", ja: "検索中…" },
} satisfies Record<string, Localized>;

function Highlighted({ text, query }: { text: string; query: string }) {
  const needle = query.trim().replace(/역$/, "");
  const index = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent text-[#2563eb]">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export default function SearchOverlay({
  isOpen,
  onClose,
  onSelect,
  inputRef,
  near,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (station: StationOption) => void;
  /** Owned by the opener so it can focus synchronously inside the tap (keeps the iOS keyboard). */
  inputRef: RefObject<HTMLInputElement | null>;
  near: LatLng | null;
}) {
  const locale = useLocale();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const recent = useRecentStations();
  const { stations, pending } = useStationSuggestions(query, near);
  const hasQuery = query.trim() !== "";
  const activeIndex = Math.min(highlight, Math.max(stations.length - 1, 0));

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function select(station: StationOption) {
    addRecentStation(station);
    inputRef.current?.blur();
    onSelect(station);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!hasQuery || stations.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((activeIndex + 1) % stations.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((activeIndex - 1 + stations.length) % stations.length);
    }
  }

  function chip(station: StationOption, onRemove?: () => void) {
    return (
      <span
        key={station.key}
        className="inline-flex items-center rounded-full border text-[14px] font-semibold text-neutral-800 transition active:scale-[0.97]"
        style={{ backgroundColor: `${station.color}14`, borderColor: `${station.color}38` }}
      >
        <button
          type="button"
          onClick={() => select(station)}
          className={`flex items-center gap-1.5 py-1.5 pl-2 ${onRemove ? "pr-1" : "pr-3.5"}`}
        >
          <LineBadges station={station} locale={locale} size="sm" />
          {t(station.name, locale)}
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`${t(station.name, locale)} ${t(COPY.remove, locale)}`}
            className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 active:bg-black/5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(COPY.submit, locale)}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || isOpen) return;
        setQuery("");
        setHighlight(0);
      }}
      className={`absolute inset-0 z-[75] flex flex-col bg-white transition-[opacity,transform] duration-200 ease-out ${
        isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const picked = stations[activeIndex];
          if (hasQuery && picked) select(picked);
        }}
        className="flex shrink-0 items-center gap-1.5 px-2 pb-2 pt-3"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t(COPY.back, locale)}
          className="flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 active:bg-neutral-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-[#f2f4f6] px-3.5 py-2.5 ring-[#2563eb]/40 transition focus-within:bg-white focus-within:ring-2">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlight(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={t(COPY.placeholder, locale)}
            role="combobox"
            aria-expanded={hasQuery}
            aria-controls={listId}
            aria-activedescendant={hasQuery && stations[activeIndex] ? `${listId}-${activeIndex}` : undefined}
            className="w-full min-w-0 bg-transparent text-[16px] text-neutral-900 outline-none placeholder:text-neutral-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t(COPY.clear, locale)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-white"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-xl px-2.5 py-2 text-[15px] font-bold text-[#2563eb] active:bg-[#eff5ff]"
        >
          {t(COPY.submit, locale)}
        </button>
      </form>

      <div className="relative h-[2px] shrink-0 overflow-hidden bg-neutral-100" aria-hidden>
        {hasQuery && pending ? (
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[search-progress_0.9s_ease-in-out_infinite] bg-[#2563eb]" />
        ) : null}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {hasQuery ? (
          <>
            <ul id={listId} role="listbox" aria-busy={pending}>
              {stations.map((station, index) => (
                <li key={station.key} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onClick={() => select(station)}
                    onMouseEnter={() => setHighlight(index)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                      index === activeIndex ? "bg-[#f5f8ff]" : "bg-white"
                    } active:bg-[#eef3ff]`}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${station.color}1f` }}
                      aria-hidden
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: station.color }}>
                        <rect x="6" y="3.5" width="12" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
                        <path d="M6 11h12M9.5 20.5l1.5-4M14.5 20.5l-1.5-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[16px] font-bold leading-snug text-neutral-900">
                        <Highlighted text={t(station.name, locale)} query={query} />
                      </span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <LineBadges station={station} locale={locale} />
                      </span>
                    </span>
                    {near ? (
                      <span className="shrink-0 text-[12px] font-medium text-neutral-400">
                        {formatDistance(distanceMeters(near, station.center))}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            {stations.length === 0 ? (
              <p className="px-5 py-10 text-center text-[14px] text-neutral-400" role="status">
                {pending ? t(COPY.searching, locale) : t(COPY.noResult, locale).replace("{q}", query.trim())}
              </p>
            ) : null}
          </>
        ) : (
          <div className="px-5 pb-8 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-neutral-900">{t(COPY.recent, locale)}</h2>
              {recent.length > 0 ? (
                <button
                  type="button"
                  onClick={clearRecentStations}
                  className="rounded-lg px-1.5 py-1 text-[12px] font-medium text-neutral-400 active:bg-neutral-100"
                >
                  {t(COPY.clearAll, locale)}
                </button>
              ) : null}
            </div>
            {recent.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((station) => chip(station, () => removeRecentStation(station.key)))}
              </div>
            ) : (
              <p className="mt-2.5 text-[13px] text-neutral-400">{t(COPY.recentEmpty, locale)}</p>
            )}

            <h2 className="mt-7 text-[15px] font-extrabold text-neutral-900">{t(COPY.popular, locale)}</h2>
            <ol className="mt-3 flex flex-wrap gap-2">
              {POPULAR_STATIONS.map((station, index) => (
                <li key={station.key} className="flex items-center gap-1">
                  <span className="w-3 text-center text-[12px] font-extrabold text-[#2563eb]" aria-hidden>
                    {index + 1}
                  </span>
                  {chip(station)}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
