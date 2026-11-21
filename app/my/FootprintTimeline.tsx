"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import BottomSheet from "../_components/BottomSheet";
import LineBadges from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { CameraIcon, MoreIcon, NotebookIcon, PlusIcon } from "../_components/icons";
import { useLocale } from "../_lib/locale";
import {
  deleteStationLog,
  filterLogs,
  formatLogDate,
  LOG_TAGS,
  resizeImageFile,
  saveStationLog,
  useStationLogs,
  type StationLog,
  type StationLogTag,
} from "../_lib/myStationLogs";
import type { MyPlace } from "../_lib/myStations";
import { ALL_STATIONS, t, type Locale, type Localized, type StationOption } from "../_lib/stations";

const COPY = {
  title: {
    ko: "내 역별 발자국 & 프라이빗 노트",
    en: "My station footprints & private notes",
    zh: "我的车站足迹与私密笔记",
    ja: "駅ごとの足跡 & プライベートノート",
  },
  add: { ko: "기록 남기기", en: "Add a note", zh: "写下记录", ja: "記録する" },
  all: { ko: "전체", en: "All", zh: "全部", ja: "すべて" },
  emptyHint: {
    ko: "첫 번째 역 발자국이나 나만의 탑승 꿀팁을 남겨보세요!",
    en: "Leave your first station footprint or boarding tip!",
    zh: "留下第一个车站足迹或乘车小窍门吧！",
    ja: "最初の駅の足跡や乗車のコツを残してみましょう！",
  },
  sampleBadge: { ko: "예시", en: "Sample", zh: "示例", ja: "例" },
  sampleContent: {
    ko: "3번 출구 소금빵집, 웨이팅 15분 컷 · 출근 전에 들르면 딱이에요",
    en: "Salt-bread shop at Exit 3 — about 15 min wait. Perfect before work.",
    zh: "3号出口盐面包店，排队约15分钟，上班前刚好。",
    ja: "3番出口の塩パン屋は待ち15分くらい。出勤前にちょうどいい。",
  },
  edit: { ko: "수정", en: "Edit", zh: "编辑", ja: "編集" },
  delete: { ko: "삭제", en: "Delete", zh: "删除", ja: "削除" },
  sheetAdd: { ko: "기록 남기기", en: "New footprint", zh: "写下足迹", ja: "記録を残す" },
  sheetEdit: { ko: "기록 수정", en: "Edit footprint", zh: "编辑足迹", ja: "記録を編集" },
  pickStation: { ko: "어느 역인가요?", en: "Which station?", zh: "哪个车站？", ja: "どの駅ですか？" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  favorites: { ko: "My 역에서 고르기", en: "From My Stations", zh: "从 My 车站选择", ja: "My 駅から選ぶ" },
  mood: { ko: "기분 / 카테고리", en: "Mood / category", zh: "心情/分类", ja: "気分/カテゴリ" },
  memo: { ko: "한 줄 메모", en: "One-line note", zh: "一句话备注", ja: "ひとことメモ" },
  memoPh: {
    ko: "예) 4-2칸 타면 에스컬레이터 바로 앞",
    en: "e.g. Car 4-2 is right by the escalator",
    zh: "例：坐4-2车厢就在扶梯前",
    ja: "例）4-2号車だとエスカレーターすぐ前",
  },
  photo: { ko: "사진 첨부 (선택)", en: "Photo (optional)", zh: "添加照片（可选）", ja: "写真（任意）" },
  photoAdd: { ko: "사진 고르기", en: "Choose photo", zh: "选择照片", ja: "写真を選ぶ" },
  photoRemove: { ko: "사진 제거", en: "Remove photo", zh: "移除照片", ja: "写真を削除" },
  dateAuto: { ko: "날짜", en: "Date", zh: "日期", ja: "日付" },
  save: { ko: "저장하기", en: "Save", zh: "保存", ja: "保存する" },
  searchPh: { ko: "역 이름 검색", en: "Search station", zh: "搜索车站", ja: "駅名で検索" },
  menu: { ko: "더보기", en: "More", zh: "更多", ja: "その他" },
} satisfies Record<string, Localized>;

export type StationFilter = { key: string | null; nameKo: string | null };

function lineFromStation(station: StationOption): string {
  return station.lines.ko.split(/[·,|/]/)[0]?.trim() ?? "";
}

/** Fixed sample timestamp (2026-11-21 UTC) — avoid live `Date.now()` during prerender. */
const SAMPLE_CREATED_AT = 1_795_212_800_000;

function SampleCard({ locale }: { locale: Locale }) {
  const meta = LOG_TAGS.cafe;
  return (
    <article className="relative overflow-hidden rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_1px_4px_rgba(120,53,15,0.06)] ring-1 ring-[#F5E6C8]">
      <span className="absolute right-3 top-3 rounded-full bg-[#FEF3C7] px-2 py-[2px] text-[10px] font-extrabold text-[#92400E]">
        {t(COPY.sampleBadge, locale)}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[16px]"
          style={{ background: meta.tint, color: meta.accent }}
          aria-hidden
        >
          {meta.emoji}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold text-[#1F2937]">장한평역 · 5호선</p>
          <p className="text-[11px] font-semibold text-[#A16207]">{t(meta.label, locale)}</p>
        </div>
      </div>
      <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[#374151]">{t(COPY.sampleContent, locale)}</p>
      <p className="mt-2 text-[11px] font-medium text-[#9CA3AF]">{formatLogDate(SAMPLE_CREATED_AT, locale)}</p>
    </article>
  );
}

function LogCard({
  log,
  locale,
  onEdit,
  onDelete,
}: {
  log: StationLog;
  locale: Locale;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = LOG_TAGS[log.tag];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <article className="relative overflow-hidden rounded-3xl bg-[#FFFDF8] p-4 shadow-[0_1px_4px_rgba(120,53,15,0.06)] ring-1 ring-[#F5E6C8]">
      <div className="flex items-start gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-[16px]"
          style={{ background: meta.tint, color: meta.accent }}
          aria-hidden
        >
          {meta.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold text-[#1F2937]">
            {log.stationName}
            {log.lineNumber ? ` · ${log.lineNumber}` : ""}
          </p>
          <p className="text-[11px] font-semibold" style={{ color: meta.accent }}>
            {t(meta.label, locale)}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label={t(COPY.menu, locale)}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9CA3AF] active:bg-[#F3F4F6]"
          >
            <MoreIcon size={16} />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-9 z-10 min-w-[108px] overflow-hidden rounded-2xl bg-white py-1 shadow-lg ring-1 ring-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="block w-full px-3 py-2 text-left text-[13px] font-bold text-neutral-800 active:bg-neutral-50"
              >
                {t(COPY.edit, locale)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="block w-full px-3 py-2 text-left text-[13px] font-bold text-red-600 active:bg-red-50"
              >
                {t(COPY.delete, locale)}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-[14px] font-semibold leading-relaxed text-[#374151]">{log.content}</p>
      {log.imageDataUrl ? (
        <img
          src={log.imageDataUrl}
          alt=""
          className="mt-3 h-36 w-full rounded-2xl object-cover ring-1 ring-[#F5E6C8]"
        />
      ) : null}
      <p className="mt-2 text-[11px] font-medium text-[#9CA3AF]">{formatLogDate(log.createdAt, locale)}</p>
    </article>
  );
}

function LogSheet({
  places,
  suggested,
  initial,
  presetStation,
  onClose,
  onSaved,
}: {
  places: MyPlace[];
  suggested: StationOption | null;
  initial: StationLog | null;
  presetStation: StationOption | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const locale = useLocale();
  const [station, setStation] = useState<StationOption | null>(() => {
    if (initial) {
      const match =
        places.find(
          (place) => place.station.key === initial.stationKey || place.station.name.ko === initial.stationName,
        )?.station ??
        ALL_STATIONS.find((row) => row.name.ko === initial.stationName || row.key === initial.stationKey) ??
        null;
      return match ?? suggested ?? places[0]?.station ?? null;
    }
    return presetStation ?? suggested ?? places[0]?.station ?? null;
  });
  const [picking, setPicking] = useState(!station);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<StationLogTag>(initial?.tag ?? "tip");
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial?.imageDataUrl ?? null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dateLabel = formatLogDate(initial?.createdAt ?? Date.now(), locale);

  async function onPickFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      if (dataUrl) setImageDataUrl(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!station || !content.trim()) return;
    saveStationLog({
      id: initial?.id,
      stationName: station.name.ko,
      lineNumber: lineFromStation(station),
      stationKey: station.key,
      tag,
      content,
      imageDataUrl,
      createdAt: initial?.createdAt,
    });
    onSaved();
  }

  return (
    <BottomSheet title={t(initial ? COPY.sheetEdit : COPY.sheetAdd, locale)} onClose={onClose}>
      <div className="no-scrollbar mt-3 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
        <div>
          <p className="text-[12px] font-bold text-ink-muted">{t(COPY.pickStation, locale)}</p>
          {station && !picking ? (
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-[#FFF8E7] px-3 py-2.5 ring-1 ring-[#F5E6C8]">
              <LineBadges station={station} locale={locale} size="md" />
              <span className="min-w-0 flex-1 text-[15px] font-extrabold text-ink">{t(station.name, locale)}</span>
              <button
                type="button"
                onClick={() => setPicking(true)}
                className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-neutral-600 ring-1 ring-neutral-200"
              >
                {t(COPY.change, locale)}
              </button>
            </div>
          ) : (
            <div className="mt-2">
              {places.length > 0 ? (
                <div className="mb-2">
                  <p className="mb-1.5 text-[11px] font-bold text-neutral-400">{t(COPY.favorites, locale)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {places.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          setStation(place.station);
                          setPicking(false);
                        }}
                        className="rounded-full bg-white px-2.5 py-1.5 text-[12px] font-bold text-neutral-700 ring-1 ring-neutral-200 active:scale-95"
                      >
                        {t(place.station.name, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <StationSearch
                locale={locale}
                query={query}
                onQueryChange={setQuery}
                placeholder={t(COPY.searchPh, locale)}
                inputClassName="rounded-2xl border border-neutral-200 bg-[#f7f8fa] px-3.5 py-3"
                onSelect={(next) => {
                  setStation(next);
                  setQuery("");
                  setPicking(false);
                }}
              />
            </div>
          )}
        </div>

        <div>
          <p className="text-[12px] font-bold text-ink-muted">{t(COPY.mood, locale)}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(LOG_TAGS) as StationLogTag[]).map((id) => {
              const meta = LOG_TAGS[id];
              const active = tag === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTag(id)}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-[13px] font-bold transition active:scale-[0.98] ${
                    active ? "ring-2" : "ring-1 ring-neutral-200 bg-white"
                  }`}
                  style={
                    active
                      ? { background: meta.tint, color: meta.accent, boxShadow: `inset 0 0 0 1px ${meta.accent}33` }
                      : undefined
                  }
                >
                  <span aria-hidden>{meta.emoji}</span>
                  <span className="min-w-0 leading-snug">{t(meta.label, locale)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-bold text-ink-muted">{t(COPY.memo, locale)}</p>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 120))}
            placeholder={t(COPY.memoPh, locale)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl bg-[#F7F8FA] px-3.5 py-3 text-[14px] font-semibold text-ink outline-none ring-1 ring-transparent placeholder:text-neutral-400 focus:ring-[#F5B800]/50"
          />
          <p className="mt-1 text-right text-[11px] text-neutral-400">{content.length}/120</p>
        </div>

        <div>
          <p className="text-[12px] font-bold text-ink-muted">{t(COPY.photo, locale)}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void onPickFile(event.target.files?.[0] ?? null)}
          />
          {imageDataUrl ? (
            <div className="relative mt-2">
              <img src={imageDataUrl} alt="" className="h-36 w-full rounded-2xl object-cover" />
              <button
                type="button"
                onClick={() => setImageDataUrl(null)}
                className="absolute right-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white"
              >
                {t(COPY.photoRemove, locale)}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-white py-3.5 text-[13px] font-bold text-neutral-500 active:bg-neutral-50"
            >
              <CameraIcon size={16} />
              {t(COPY.photoAdd, locale)}
            </button>
          )}
        </div>

        <p className="text-[12px] font-semibold text-neutral-500">
          {t(COPY.dateAuto, locale)} · {dateLabel}
        </p>

        <button
          type="button"
          disabled={!station || !content.trim() || busy}
          onClick={save}
          className="w-full rounded-2xl bg-[#1e3a8a] py-3.5 text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(30,58,138,0.25)] transition active:scale-[0.98] disabled:bg-neutral-300"
        >
          {t(COPY.save, locale)}
        </button>
      </div>
    </BottomSheet>
  );
}

export default function FootprintTimeline({
  places,
  filter,
  onFilterChange,
  suggested,
  sectionRef,
}: {
  places: MyPlace[];
  filter: StationFilter;
  onFilterChange: (next: StationFilter) => void;
  suggested: StationOption | null;
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  const locale = useLocale();
  const logs = useStationLogs();
  const [sheet, setSheet] = useState<{ log: StationLog | null; preset: StationOption | null } | null>(null);
  const titleId = useId();

  const filtered = useMemo(
    () =>
      filterLogs(logs, {
        stationKey: filter.key,
        stationNameKo: filter.nameKo,
      }).sort((a, b) => b.createdAt - a.createdAt),
    [logs, filter.key, filter.nameKo],
  );

  const presetFromFilter = useMemo(() => {
    if (!filter.key && !filter.nameKo) return null;
    return places.find((place) => place.station.key === filter.key || place.station.name.ko === filter.nameKo)?.station ?? null;
  }, [places, filter.key, filter.nameKo]);

  return (
    <section ref={sectionRef as never} className="mt-5" aria-labelledby={titleId}>
      <div className="flex items-start gap-2 px-1">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="flex items-center gap-1.5 text-[16px] font-extrabold tracking-tight text-neutral-900">
            <span className="text-[#B45309]">
              <NotebookIcon size={17} />
            </span>
            {t(COPY.title, locale)}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setSheet({ log: null, preset: presetFromFilter })}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1e3a8a] px-3 py-2 text-[12px] font-extrabold text-white shadow-[0_4px_12px_rgba(30,58,138,0.28)] active:scale-95"
        >
          <PlusIcon size={12} />
          {t(COPY.add, locale)}
        </button>
      </div>

      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <FilterChip
          active={!filter.key && !filter.nameKo}
          onClick={() => onFilterChange({ key: null, nameKo: null })}
        >
          {t(COPY.all, locale)}
        </FilterChip>
        {places.map((place) => (
          <FilterChip
            key={place.id}
            active={filter.key === place.station.key}
            onClick={() => onFilterChange({ key: place.station.key, nameKo: place.station.name.ko })}
          >
            {t(place.station.name, locale)}
          </FilterChip>
        ))}
      </div>

      <div className="relative mt-3 pl-3">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[#F5D0A0] via-[#FDE68A] to-transparent" aria-hidden />
        <ul className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <>
              <li className="relative">
                <span className="absolute -left-[9px] top-5 h-2.5 w-2.5 rounded-full bg-[#F59E0B] ring-4 ring-[#FFF7ED]" aria-hidden />
                <SampleCard locale={locale} />
              </li>
              <li className="rounded-2xl bg-[#FFF8E7] px-4 py-3 text-center text-[12px] font-semibold leading-relaxed text-[#92400E]">
                {t(COPY.emptyHint, locale)}
              </li>
            </>
          ) : (
            filtered.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[9px] top-5 h-2.5 w-2.5 rounded-full bg-[#F59E0B] ring-4 ring-[#FFF7ED]" aria-hidden />
                <LogCard
                  log={log}
                  locale={locale}
                  onEdit={() => setSheet({ log, preset: null })}
                  onDelete={() => deleteStationLog(log.id)}
                />
              </li>
            ))
          )}
        </ul>
      </div>

      {sheet ? (
        <LogSheet
          places={places}
          suggested={suggested}
          initial={sheet.log}
          presetStation={sheet.preset}
          onClose={() => setSheet(null)}
          onSaved={() => setSheet(null)}
        />
      ) : null}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold transition active:scale-95 ${
        active ? "bg-[#1e3a8a] text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
