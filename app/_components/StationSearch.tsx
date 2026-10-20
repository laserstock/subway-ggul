"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import type { LatLng } from "../KakaoMap";
import { useRecentStations } from "../_lib/recentStations";
import { useStationSuggestions } from "../_lib/stationSearch";
import { POPULAR_STATIONS, t, type Locale, type StationOption } from "../_lib/stations";
import { SearchIcon } from "./icons";

const MAX_SHORTCUTS = 8;

const COPY = {
  noStation: {
    ko: "일치하는 역이 없어요",
    en: "No matching stations",
    zh: "没有匹配的车站",
    ja: "一致する駅がありません",
  },
  searching: { ko: "역을 찾는 중…", en: "Searching stations…", zh: "正在搜索车站…", ja: "駅を検索中…" },
};

export default function StationSearch({
  locale,
  query,
  onQueryChange,
  onSelect,
  currentKey,
  placeholder,
  inputRef,
  className = "",
  inputClassName = "rounded-full bg-[#f3f4f6] px-3.5 py-[11px]",
  placement = "below",
  near = null,
}: {
  locale: Locale;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (station: StationOption) => void;
  currentKey?: string | null;
  placeholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
  inputClassName?: string;
  placement?: "below" | "above";
  /** Biases short queries and ranks equally good matches by distance. */
  near?: LatLng | null;
}) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const recent = useRecentStations();
  const { stations: matched, pending: searchPending } = useStationSuggestions(open ? query : "", near);

  const suggestions = query.trim()
    ? matched
    : [...recent, ...POPULAR_STATIONS.filter((item) => !recent.some((r) => r.key === item.key))].slice(
        0,
        MAX_SHORTCUTS,
      );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function pick(station: StationOption) {
    setOpen(false);
    onSelect(station);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && ["ArrowDown", "Enter"].includes(event.key)) {
      setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        suggestions.length === 0 ? 0 : (index + 1) % suggestions.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) =>
        suggestions.length === 0 ? 0 : (index - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = suggestions[highlightIndex];
      if (picked) pick(picked);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`relative z-50 ${className}`} ref={containerRef}>
      <label className={`flex items-center gap-2 ${inputClassName}`}>
        <SearchIcon />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => {
            setOpen(true);
            setHighlightIndex(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
          role="combobox"
          aria-controls={listId}
          aria-expanded={open}
          aria-autocomplete="list"
        />
      </label>

      {open ? (
        <div
          className={`absolute inset-x-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)] ${
            placement === "above"
              ? "no-scrollbar bottom-[calc(100%+8px)] max-h-[280px] overflow-y-auto"
              : "top-[calc(100%+8px)]"
          }`}
          id={listId}
          role="listbox"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-neutral-400">
              {t(searchPending ? COPY.searching : COPY.noStation, locale)}
            </p>
          ) : (
            suggestions.map((item, index) => (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={item.key === currentKey}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => pick(item)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                  index === highlightIndex ? "bg-sky-50" : "bg-white"
                }`}
              >
                <span>
                  <span className="block text-[14px] font-semibold text-neutral-900">
                    {t(item.name, locale)}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-neutral-400">
                    {t(item.lines, locale)}
                  </span>
                </span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
