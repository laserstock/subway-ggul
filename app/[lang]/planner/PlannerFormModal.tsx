"use client";

import { ArrowDownUp, ArrowLeftRight, Clock, Hash, LoaderCircle, Map as MapIcon, Pencil, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { contentLocale, type GuideLocale } from "../../_lib/guideLocale";
import type { PlannerStationOption } from "../../_lib/planner";
import { clockLabel, EARLIEST, LATEST, MIN_WINDOW, plannerHref, type PlannerQuery } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import { PLANNER_CATEGORIES, QUICK_TAGS, type PlannerCategory, type QuickTag } from "../../_lib/plannerTypes";
import { normalizeQuery } from "../_guide/searchKeys";
import SubwayMap, { type MapCopy, type MapLineData, type MapStationData } from "../map/SubwayMap";
import { CATEGORY_ICONS, LineBadge, PIN_COLORS } from "./plannerIcons";

const TIMES = Array.from({ length: (LATEST - EARLIEST) / 30 + 1 }, (_, index) => EARLIEST + index * 30);

type MapPayload = {
  width: number;
  height: number;
  focus: { x: number; y: number; w: number; h: number };
  levels: number[];
  maxZoom: number;
  lines: MapLineData[];
  stations: MapStationData[];
  copy: MapCopy;
};

const mapRequests = new Map<GuideLocale, Promise<MapPayload>>();

function loadMap(lang: GuideLocale) {
  let request = mapRequests.get(lang);
  if (!request) {
    request = fetch(`/${lang}/planner/map-data`).then((response) => {
      if (!response.ok) throw new Error(`map data ${response.status}`);
      return response.json() as Promise<MapPayload>;
    });
    request.catch(() => mapRequests.delete(lang));
    mapRequests.set(lang, request);
  }
  return request;
}

/** "light" sits on the page or in the dialog; "dark" sits on the navy side panel beside the map. */
export type FormTone = "light" | "dark";

const TONES = {
  light: {
    label: "text-ink-muted",
    field: "border-line bg-surface focus-within:border-honey focus-within:ring-honey/20",
    input: "text-ink",
    placeholder: "placeholder:text-ink-muted",
    chosen: "placeholder:text-ink",
    muted: "text-ink-muted",
    swap: "border-line bg-surface text-ink-muted hover:border-honey/50 hover:text-honey-strong",
    select: "border-line bg-surface text-ink focus:border-honey",
    chipOff: "border-line bg-surface text-ink hover:border-honey/50",
    chipOn: "border-ink bg-ink text-white",
    chipIconOn: "text-[#f5b800]",
    tagOff: "bg-surface-muted text-ink-muted hover:text-ink",
    secondary: "border-line bg-surface text-ink hover:border-honey/50 hover:text-honey-strong",
  },
  dark: {
    label: "text-white/55",
    field: "border-white/10 bg-white/[0.06] focus-within:border-[#f5b800] focus-within:ring-[#f5b800]/25",
    input: "text-white",
    placeholder: "placeholder:text-white/45",
    chosen: "placeholder:text-white",
    muted: "text-white/50",
    swap: "border-white/15 bg-[#1f2937] text-white/80 hover:border-[#f5b800]/60 hover:text-[#f5b800]",
    select: "border-white/10 bg-white/[0.06] text-white [color-scheme:dark] focus:border-[#f5b800]",
    chipOff: "border-white/10 bg-white/[0.05] text-white/85 hover:border-[#f5b800]/50 hover:bg-white/[0.08]",
    chipOn: "border-[#f5b800] bg-[#f5b800] text-neutral-900 shadow-[0_6px_16px_rgba(245,184,0,0.25)]",
    chipIconOn: "text-neutral-900",
    tagOff: "bg-white/[0.07] text-white/65 hover:text-white",
    secondary: "border-white/15 bg-white/[0.06] text-white hover:border-[#f5b800]/60 hover:text-[#f5b800]",
  },
} satisfies Record<FormTone, Record<string, string>>;

type Tone = (typeof TONES)[FormTone];

const fieldLabel = "text-[12px] font-bold uppercase tracking-wide";

function StationField({
  label,
  placeholder,
  empty,
  stations,
  value,
  pin,
  tone,
  onChange,
}: {
  label: string;
  placeholder: string;
  empty: string;
  stations: PlannerStationOption[];
  value: string;
  pin: string;
  tone: Tone;
  onChange: (slug: string) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = stations.find((station) => station.slug === value) ?? null;
  const keys = useMemo(
    () =>
      stations.map((station) => [...new Set([station.name, station.ko, station.en].map(normalizeQuery))].filter(Boolean)),
    [stations],
  );
  const results = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return [];
    return stations
      .map((station, index) => ({ station, index, rank: keys[index].some((key) => key.startsWith(q)) ? 0 : 1 }))
      .filter(({ index }) => keys[index].some((key) => key.includes(q)))
      .sort((a, b) => a.rank - b.rank || b.station.badges.length - a.station.badges.length)
      .slice(0, 8)
      .map(({ station }) => station);
  }, [keys, query, stations]);

  function choose(station: PlannerStationOption) {
    onChange(station.slug);
    setQuery("");
    setOpen(false);
  }

  const showList = open && query.length > 0;
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className={`flex items-center gap-1.5 ${fieldLabel} ${tone.label}`}>
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: pin }} />
        {label}
      </label>
      <div className={`mt-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 transition focus-within:ring-2 ${tone.field}`}>
        {selected && !query ? (
          <span className="flex shrink-0 gap-0.5">
            {selected.badges.map((badge, index) => (
              <LineBadge key={index} short={badge.short} color={badge.color} />
            ))}
          </span>
        ) : (
          <Search size={17} className={`shrink-0 ${tone.muted}`} aria-hidden />
        )}
        <input
          id={id}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={selected ? selected.name : placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (!results.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(results.length - 1, index + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(0, index - 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(results[active] ?? results[0]);
            }
          }}
          className={`min-w-0 flex-1 bg-transparent text-[15px] font-bold outline-none ${tone.input} ${
            selected ? tone.chosen : `placeholder:font-semibold ${tone.placeholder}`
          }`}
        />
        {selected && !query && selected.ko !== selected.name ? (
          <span lang="ko" className={`shrink-0 text-[12px] font-semibold ${tone.muted}`}>
            {selected.ko}
          </span>
        ) : null}
      </div>
      {showList ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
        >
          {results.length ? (
            results.map((station, index) => (
              <li key={station.slug} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(station)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left ${index === active ? "bg-surface-muted" : "hover:bg-surface-muted"}`}
                >
                  <span className="flex w-[58px] shrink-0 flex-wrap gap-0.5">
                    {station.badges.map((badge, dot) => (
                      <LineBadge key={dot} short={badge.short} color={badge.color} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink">{station.name}</span>
                    <span className="block truncate text-[12px] text-ink-muted">
                      {station.ko !== station.name ? (
                        <>
                          <span lang="ko">{station.ko}</span> ·{" "}
                        </>
                      ) : null}
                      {station.lines}
                    </span>
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2.5 text-[13px] text-ink-muted">{empty}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function MapPicker({
  copy,
  lang,
  onPick,
  onClose,
}: {
  copy: PlannerCopy;
  lang: GuideLocale;
  onPick: (field: "from" | "to", slug: string) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<MapPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadMap(lang).then(
      (payload) => live && setData(payload),
      () => live && setFailed(true),
    );
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      live = false;
      document.body.style.overflow = previous;
    };
  }, [lang]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.mapPickerLabel}
      className="fixed inset-0 z-[90] flex flex-col bg-app pt-[env(safe-area-inset-top)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="text-[16px] font-extrabold text-ink">{copy.mapPickerTitle}</p>
          <p className="text-[12px] text-ink-muted">{copy.mapPickerHint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full bg-surface-muted px-4 py-2 text-[14px] font-bold text-ink active:scale-95"
        >
          {copy.close}
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {data ? (
          <SubwayMap
            lang={lang}
            appLang={contentLocale(lang)}
            width={data.width}
            height={data.height}
            focus={data.focus}
            levels={data.levels}
            maxZoom={data.maxZoom}
            lines={data.lines}
            stations={data.stations}
            copy={data.copy}
            actions={[
              { label: copy.departure, icon: "train", onPick: (slug) => onPick("from", slug) },
              { label: copy.arrival, icon: "pin", onPick: (slug) => onPick("to", slug) },
            ]}
          />
        ) : (
          <p className="p-6 text-center text-[14px] text-ink-muted">{failed ? copy.mapFailed : copy.mapLoading}</p>
        )}
      </div>
    </div>
  );
}

function TimeSelect({
  label,
  lang,
  value,
  options,
  tone,
  onChange,
}: {
  label: string;
  lang: GuideLocale;
  value: number;
  options: number[];
  tone: Tone;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className={`${fieldLabel} ${tone.label}`}>{label}</span>
      <span className="relative mt-1 block">
        <Clock size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-honey-strong" />
        <select
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={`w-full appearance-none rounded-xl border py-2.5 pl-9 pr-3 text-[15px] font-bold outline-none focus:ring-2 focus:ring-honey/20 ${tone.select}`}
        >
          {options.map((time) => (
            <option key={time} value={time}>
              {clockLabel(time, lang)}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

const toggleIn = <T,>(order: readonly T[], current: T[], item: T) =>
  current.includes(item) ? current.filter((value) => value !== item) : order.filter((value) => value === item || current.includes(value));

/** Departure and arrival owned by a parent, e.g. the planner home where the map can set them. */
export type StationPair = { from: string; to: string; onChange: (pair: { from: string; to: string }) => void };

/** Step 1: stations, day window, categories and quick tags; submitting slides in the itinerary page. */
export function PlannerForm({
  stations,
  initial,
  copy,
  lang,
  tone: toneName = "light",
  pair,
  mapButton = true,
  onSubmitted,
}: {
  stations: PlannerStationOption[];
  initial: PlannerQuery;
  copy: PlannerCopy;
  lang: GuideLocale;
  tone?: FormTone;
  pair?: StationPair;
  /** Offer the full-screen map picker; off where the map is already on screen. */
  mapButton?: boolean;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const tone = TONES[toneName];
  const [own, setOwn] = useState({ from: initial.from, to: initial.to });
  const { from, to } = pair ?? own;
  const setPair = (next: { from: string; to: string }) => (pair ? pair.onChange(next) : setOwn(next));
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [categories, setCategories] = useState<PlannerCategory[]>(initial.categories);
  const [tags, setTags] = useState<QuickTag[]>(initial.tags);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const known = (slug: string) => stations.some((station) => station.slug === slug);

  function submit() {
    if (!known(from) || !known(to)) return setError(copy.errorStations);
    if (from === to) return setError(copy.errorSame);
    if (end - start < MIN_WINDOW) return setError(copy.errorWindow);
    setError(null);
    startTransition(() => {
      router.push(plannerHref({ from, to, categories, tags, start, end }, lang), { transitionTypes: ["planner-forward"] });
      onSubmitted?.();
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-5"
    >
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">{copy.stationsLegend}</legend>
        <div className="grid gap-2 sm:grid-cols-[1fr_40px_1fr] sm:items-end">
          <StationField
            label={copy.departureStation}
            placeholder={copy.departurePlaceholder}
            empty={copy.searchEmpty}
            stations={stations}
            value={from}
            pin={PIN_COLORS.from}
            tone={tone}
            onChange={(slug) => setPair({ from: slug, to })}
          />
          <button
            type="button"
            aria-label={copy.swap}
            onClick={() => setPair({ from: to, to: from })}
            className={`flex h-9 w-9 items-center justify-center justify-self-center rounded-full border shadow-sm transition hover:rotate-180 active:scale-95 sm:mb-1 ${tone.swap}`}
          >
            <ArrowDownUp size={16} aria-hidden className="sm:hidden" />
            <ArrowLeftRight size={16} aria-hidden className="hidden sm:block" />
          </button>
          <StationField
            label={copy.arrivalStation}
            placeholder={copy.arrivalPlaceholder}
            empty={copy.searchEmpty}
            stations={stations}
            value={to}
            pin={PIN_COLORS.to}
            tone={tone}
            onChange={(slug) => setPair({ from, to: slug })}
          />
        </div>
        {mapButton ? (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[13px] font-bold transition active:scale-95 ${tone.secondary}`}
          >
            <MapIcon size={15} aria-hidden />
            {copy.pickOnMap}
          </button>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className={`${fieldLabel} ${tone.label}`}>{copy.schedule}</legend>
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <TimeSelect
            label={copy.start}
            lang={lang}
            value={start}
            tone={tone}
            options={TIMES.filter((time) => time <= LATEST - MIN_WINDOW)}
            onChange={setStart}
          />
          <span aria-hidden className={`pb-3 text-[15px] font-bold ${tone.muted}`}>
            ~
          </span>
          <TimeSelect
            label={copy.return}
            lang={lang}
            value={end}
            tone={tone}
            options={TIMES.filter((time) => time >= EARLIEST + MIN_WINDOW)}
            onChange={setEnd}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${fieldLabel} ${tone.label}`}>{copy.interests}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLANNER_CATEGORIES.map((category) => {
            const on = categories.includes(category);
            const CategoryIcon = CATEGORY_ICONS[category];
            return (
              <button
                key={category}
                type="button"
                aria-pressed={on}
                onClick={() => setCategories((current) => toggleIn(PLANNER_CATEGORIES, current, category))}
                className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  on ? tone.chipOn : tone.chipOff
                }`}
              >
                <CategoryIcon size={16} aria-hidden className={`shrink-0 ${on ? tone.chipIconOn : "text-honey-strong"}`} />
                <span className="min-w-0 truncate">{copy.categories[category].short}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`${fieldLabel} ${tone.label}`}>{copy.quickTags}</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((current) => toggleIn(QUICK_TAGS, current, tag))}
                className={`inline-flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold transition duration-200 active:scale-95 ${
                  on ? "bg-honey text-white shadow-[0_4px_12px_rgba(245,167,0,0.28)]" : tone.tagOff
                }`}
              >
                <Hash size={12} aria-hidden strokeWidth={2.5} />
                {copy.tags[tag].slice(1)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="rounded-xl bg-[#fff1f0] px-3 py-2 text-[13px] font-semibold text-[#b42318]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-honey px-5 py-4 text-[16px] font-extrabold text-white shadow-[0_10px_24px_rgba(245,167,0,0.32)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(245,167,0,0.4)] active:translate-y-0 active:scale-[0.98] disabled:opacity-80"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
        />
        {pending ? <LoaderCircle size={19} aria-hidden className="animate-spin" /> : <Sparkles size={19} aria-hidden />}
        {pending ? copy.submitting : copy.submit}
      </button>

      {picking ? (
        <MapPicker
          copy={copy}
          lang={lang}
          onClose={() => setPicking(false)}
          onPick={(field, slug) => {
            if (!known(slug)) return;
            setPair(field === "from" ? { from: slug, to } : { from, to: slug });
            setPicking(false);
          }}
        />
      ) : null}
    </form>
  );
}

/** "Edit trip" button that opens the planner form in a dialog. */
export default function PlannerFormModal({
  stations,
  initial,
  copy,
  lang,
  label = copy.editTrip,
  className = "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition hover:border-honey/50 hover:text-honey-strong active:scale-95",
}: {
  stations: PlannerStationOption[];
  initial: PlannerQuery;
  copy: PlannerCopy;
  lang: GuideLocale;
  label?: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
        className={className}
      >
        <Pencil size={14} aria-hidden />
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label={copy.setupDialog}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="planner-dialog m-auto max-h-[92dvh] w-[min(640px,calc(100%-24px))] overflow-visible rounded-3xl bg-transparent p-0 backdrop:bg-black/50"
      >
        <div className="max-h-[92dvh] overflow-y-auto rounded-3xl bg-app p-5 text-ink">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[18px] font-extrabold tracking-tight">{copy.setupDialog}</p>
            <button
              type="button"
              onClick={close}
              aria-label={copy.close}
              className="rounded-full p-1.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          {open ? <PlannerForm stations={stations} initial={initial} copy={copy} lang={lang} onSubmitted={close} /> : null}
        </div>
      </dialog>
    </>
  );
}
