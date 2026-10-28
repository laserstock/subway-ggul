"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import DragScroll from "../_components/DragScroll";
import LineBadges from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { useLocale } from "../_lib/locale";
import {
  addRoute,
  PLACE_PRESET_IDS,
  PLACE_PRESETS,
  placeEmoji,
  removePlace,
  savePlace,
  type MyPlace,
  type PlacePreset,
  type RouteEndpoint,
} from "../_lib/myStations";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { useDragToClose } from "../_lib/useSheetDrag";

const COPY = {
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  addPlaceTitle: { ko: "새 My 역 추가", en: "Add a My Station", zh: "添加 My 车站", ja: "My 駅を追加" },
  editPlaceTitle: { ko: "My 역 편집", en: "Edit My Station", zh: "编辑 My 车站", ja: "My 駅を編集" },
  stepStation: { ko: "1. 어느 역인가요?", en: "1. Which station?", zh: "1. 哪个车站？", ja: "1. どの駅ですか？" },
  stepLabel: { ko: "2. 별명을 붙여 주세요", en: "2. Give it a nickname", zh: "2. 起个昵称", ja: "2. ニックネームを付けましょう" },
  nowAt: { ko: "📍 지금", en: "📍 Now:", zh: "📍 当前", ja: "📍 現在" },
  searchPlaceholder: { ko: "역 이름 검색 (예: 장한평역)", en: "Search a station", zh: "搜索车站", ja: "駅名で検索" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  customLabel: {
    ko: "직접 입력 (선택, 최대 12자)",
    en: "Custom nickname (optional, max 12)",
    zh: "自定义昵称（可选，最多12字）",
    ja: "自由入力（任意、最大12文字）",
  },
  preview: { ko: "미리보기", en: "Preview", zh: "预览", ja: "プレビュー" },
  save: { ko: "저장하기", en: "Save", zh: "保存", ja: "保存する" },
  delete: { ko: "삭제", en: "Delete", zh: "删除", ja: "削除" },
  addRouteTitle: { ko: "자주 가는 동선 추가", en: "Add a frequent route", zh: "添加常用路线", ja: "よく使うルートを追加" },
  from: { ko: "출발역", en: "From", zh: "出发站", ja: "出発駅" },
  to: { ko: "도착역", en: "To", zh: "到达站", ja: "到着駅" },
  swap: { ko: "출발·도착 바꾸기", en: "Swap", zh: "交换出发与到达", ja: "出発・到着を入れ替え" },
  sameStation: {
    ko: "출발역과 도착역이 같아요",
    en: "From and To are the same station",
    zh: "出发站与到达站相同",
    ja: "出発駅と到着駅が同じです",
  },
  saveRoute: { ko: "동선 저장하기", en: "Save route", zh: "保存路线", ja: "ルートを保存" },
} satisfies Record<string, Localized>;

const OTHER_STATION_EMOJI = "🚉";

export function placeLabel(place: Pick<MyPlace, "preset" | "label">, locale: Locale) {
  return place.label || t(PLACE_PRESETS[place.preset].label, locale);
}

function StationWithLines({ station, locale }: { station: StationOption; locale: Locale }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 align-middle">
      <LineBadges station={station} locale={locale} size="sm" />
      <span className="min-w-0 break-words">{t(station.name, locale)}</span>
    </span>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const locale = useLocale();
  const titleId = useId();
  const { sheetRef, sheetStyle, handleProps } = useDragToClose(onClose);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[85]">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t(COPY.close, locale)}
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-black/40 backdrop-blur-[2px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={sheetRef}
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 animate-[sheet-up_300ms_cubic-bezier(0.22,1,0.36,1)] rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out"
      >
        <div {...handleProps} className="-mx-5 flex cursor-grab justify-center pb-3 pt-2.5 active:cursor-grabbing" aria-hidden>
          <span className="h-[5px] w-11 rounded-full bg-neutral-300" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-[19px] font-extrabold tracking-tight text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold text-neutral-500 active:bg-neutral-100"
          >
            {t(COPY.close, locale)}
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function SelectedStation({
  station,
  locale,
  onChange,
}: {
  station: StationOption;
  locale: Locale;
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl border-2 px-3.5 py-3"
      style={{ backgroundColor: `${station.color}14`, borderColor: `${station.color}55` }}
    >
      <LineBadges station={station} locale={locale} size="md" />
      <span className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-snug text-neutral-900">
        {t(station.name, locale)}
      </span>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-neutral-600 shadow-sm active:scale-95"
      >
        {t(COPY.change, locale)}
      </button>
    </div>
  );
}

export function PlaceSheet({
  place,
  suggested,
  onClose,
  onDone,
}: {
  /** null = adding a new place. */
  place: MyPlace | null;
  suggested: StationOption | null;
  onClose: () => void;
  onDone: (result: "saved" | "removed") => void;
}) {
  const locale = useLocale();
  const [preset, setPreset] = useState<PlacePreset>(place?.preset ?? "home");
  const [label, setLabel] = useState(place?.label ?? "");
  const [station, setStation] = useState<StationOption | null>(place?.station ?? null);
  const [query, setQuery] = useState("");
  const meta = PLACE_PRESETS[preset];

  function save() {
    if (!station) return;
    savePlace({ id: place?.id, preset, label, station });
    onDone("saved");
  }

  function remove() {
    if (!place) return;
    removePlace(place.id);
    onDone("removed");
  }

  return (
    <Sheet title={t(place ? COPY.editPlaceTitle : COPY.addPlaceTitle, locale)} onClose={onClose}>
      <h3 className="mb-2 mt-4 text-[13px] font-extrabold text-neutral-700">{t(COPY.stepStation, locale)}</h3>
      {station ? (
        <SelectedStation station={station} locale={locale} onChange={() => setStation(null)} />
      ) : (
        <>
          {suggested ? (
            <button
              type="button"
              onClick={() => setStation(suggested)}
              className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#eef4ff] py-1 pl-2.5 pr-3 text-[12px] font-bold text-[#1d4ed8] active:scale-95"
            >
              {t(COPY.nowAt, locale)} <StationWithLines station={suggested} locale={locale} />
            </button>
          ) : null}
          <StationSearch
            locale={locale}
            query={query}
            onQueryChange={setQuery}
            onSelect={(next) => {
              setStation(next);
              setQuery("");
            }}
            placeholder={t(COPY.searchPlaceholder, locale)}
            inputClassName="rounded-2xl border border-neutral-200 bg-[#f7f8fa] px-3.5 py-3"
          />
        </>
      )}

      <h3 className="mb-2 mt-5 text-[13px] font-extrabold text-neutral-700">{t(COPY.stepLabel, locale)}</h3>
      <div className="grid grid-cols-3 gap-2">
        {PLACE_PRESET_IDS.map((id) => {
          const item = PLACE_PRESETS[id];
          const active = id === preset;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPreset(id)}
              aria-pressed={active}
              className={`flex items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2.5 text-[13px] font-bold transition active:scale-95 ${
                active ? "text-neutral-900 shadow-sm" : "border-transparent text-neutral-600"
              }`}
              style={{ backgroundColor: item.bg, borderColor: active ? item.ring : "transparent" }}
            >
              <span aria-hidden>{item.emoji}</span>
              <span className="min-w-0 break-words text-center leading-tight">{t(item.label, locale)}</span>
            </button>
          );
        })}
      </div>
      <input
        value={label}
        onChange={(event) => setLabel(event.target.value.slice(0, 12))}
        placeholder={t(COPY.customLabel, locale)}
        className="mt-2 w-full rounded-2xl border border-neutral-200 bg-[#f7f8fa] px-3.5 py-3 text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#93c5fd]"
      />

      {station ? (
        <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-neutral-400">
          {t(COPY.preview, locale)}
          <span
            className="inline-flex items-center gap-1 rounded-2xl bg-surface px-3 py-1.5 text-[13px] font-bold text-neutral-800"
            style={{ boxShadow: `inset 0 0 0 1px ${station.color}40` }}
          >
            <LineBadges station={station} locale={locale} size="sm" />
            <span className="text-neutral-500">{label.trim() || t(meta.label, locale)}:</span>
            {t(station.name, locale)}
          </span>
        </p>
      ) : null}

      <div className="mt-5 flex gap-2">
        {place ? (
          <button
            type="button"
            onClick={remove}
            className="rounded-2xl bg-[#fdecec] px-5 py-3.5 text-[15px] font-bold text-[#dc2626] active:scale-[0.98]"
          >
            {t(COPY.delete, locale)}
          </button>
        ) : null}
        <button
          type="button"
          onClick={save}
          disabled={!station}
          className="flex-1 rounded-2xl bg-[#2563eb] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:bg-neutral-300"
        >
          {t(COPY.save, locale)}
        </button>
      </div>
    </Sheet>
  );
}

function EndpointPicker({
  title,
  value,
  places,
  placement,
  locale,
  onChange,
}: {
  title: string;
  value: RouteEndpoint | null;
  places: MyPlace[];
  placement: "below" | "above";
  locale: Locale;
  onChange: (next: RouteEndpoint | null) => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-extrabold text-neutral-700">{title}</h3>
      {value ? (
        <SelectedStation station={value.station} locale={locale} onChange={() => onChange(null)} />
      ) : (
        <>
          {places.length > 0 ? (
            <DragScroll className="-mx-5 mb-2 flex gap-1.5 px-5">
              {places.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => onChange({ emoji: placeEmoji(place), station: place.station })}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-surface py-1 pl-1.5 pr-3 text-[12px] font-bold text-neutral-800 ring-1 ring-line active:scale-95"
                >
                  <LineBadges station={place.station} locale={locale} size="sm" />
                  {placeLabel(place, locale)} · {t(place.station.name, locale)}
                </button>
              ))}
            </DragScroll>
          ) : null}
          <StationSearch
            locale={locale}
            query={query}
            onQueryChange={setQuery}
            onSelect={(station) => {
              onChange({ emoji: OTHER_STATION_EMOJI, station });
              setQuery("");
            }}
            placeholder={t(COPY.searchPlaceholder, locale)}
            placement={placement}
            inputClassName="rounded-2xl border border-neutral-200 bg-[#f7f8fa] px-3.5 py-3"
          />
        </>
      )}
    </div>
  );
}

export function RouteSheet({
  places,
  onClose,
  onSaved,
}: {
  places: MyPlace[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const locale = useLocale();
  const [from, setFrom] = useState<RouteEndpoint | null>(null);
  const [to, setTo] = useState<RouteEndpoint | null>(null);
  const same = from !== null && to !== null && from.station.key === to.station.key;

  function save() {
    if (!from || !to || same) return;
    addRoute(from, to);
    onSaved();
  }

  return (
    <Sheet title={t(COPY.addRouteTitle, locale)} onClose={onClose}>
      <div className="mt-4">
        <EndpointPicker
          title={`🟢 ${t(COPY.from, locale)}`}
          value={from}
          places={places}
          placement="below"
          locale={locale}
          onChange={setFrom}
        />
      </div>
      <div className="my-2 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label={t(COPY.swap, locale)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[16px] text-[#1d4ed8] active:scale-90"
        >
          ⇅
        </button>
      </div>
      <EndpointPicker
        title={`🏁 ${t(COPY.to, locale)}`}
        value={to}
        places={places}
        placement="above"
        locale={locale}
        onChange={setTo}
      />
      {same ? (
        <p className="mt-2 text-[12px] font-semibold text-amber-700">⚠️ {t(COPY.sameStation, locale)}</p>
      ) : null}
      <button
        type="button"
        onClick={save}
        disabled={!from || !to || same}
        className="mt-5 w-full rounded-2xl bg-[#2563eb] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:bg-neutral-300"
      >
        {t(COPY.saveRoute, locale)}
      </button>
    </Sheet>
  );
}
