"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { DOT_R, HUB_R, labelLines, labelText } from "../../_lib/mapLabel";
import { Icon, type IconName } from "../_guide/icons";
import { normalizeQuery } from "../_guide/searchKeys";

export type MapStationData = {
  slug: string;
  name: string;
  /** Korean name with 역. */
  ko: string;
  /** English name, shown next to the Korean one on non-English pages. */
  alt: string | null;
  x: number;
  y: number;
  /** Indexes into the map's lines. */
  lines: number[];
  hub: boolean;
  /** Index into `levels`: the zoom from which the name is drawn. */
  level: number;
  position: number;
  lat: number;
  lng: number;
  exits: number;
  restroomsIn: number;
  restroomsOut: number;
  lockers: number;
  desk: boolean;
  elevator: string | null;
};

export type MapLineData = { ko: string; name: string; color: string; d: string };

/** Buttons that replace the station panel's links when the map is used to pick a station. */
export type MapPickAction = { label: string; icon: IconName; onPick: (slug: string) => void };

/** A pin drawn over a station, e.g. the planner's departure and arrival. */
export type MapMark = { slug: string; color: string; label: string };

export type MapCopy = Record<
  | "label"
  | "search"
  | "empty"
  | "allLines"
  | "close"
  | "expand"
  | "collapse"
  | "zoomIn"
  | "zoomOut"
  | "reset"
  | "exits"
  | "restrooms"
  | "lockers"
  | "elevator"
  | "exitsCount"
  | "restroomCount"
  | "lockersCount"
  | "desk"
  | "elevatorVia"
  | "noData"
  | "guide"
  | "live",
  string
>;

type Box = { x: number; y: number; w: number; h: number };
type View = { x: number; y: number; w: number };
type Size = { cw: number; ch: number };

/** A press that moves further than this (px) pans the map instead of opening a station. */
const DRAG_THRESHOLD = 6;
/** Assumed box size before the browser measures it, so the server HTML is drawn at a typical scale. */
const SERVER_SIZE: Size = { cw: 720, ch: 620 };
/** Width of the station panel beside the map from Tailwind's `sm` breakpoint up; below it the panel is a bottom sheet. */
const PANEL_WIDTH = 340;
const WIDE = 640;

const STYLE = `
.ksub-map .sc{transform:scale(calc(1 / var(--z)))}
.ksub-map .ln{fill:none;stroke-width:calc(4.2px / var(--z));stroke-linecap:round;stroke-linejoin:round}
.ksub-map .cs{fill:none;stroke:#fff;stroke-width:calc(7.4px / var(--z));stroke-linecap:round;stroke-linejoin:round}
.ksub-map .dot{fill:#fff;stroke-width:2.2px}
.ksub-map .hub{fill:#fff;stroke:#1f2937;stroke-width:2.4px}
.ksub-map .hit{fill:transparent}
.ksub-map .nm{fill:#273041;font-weight:600;paint-order:stroke;stroke:#fbfbf9;stroke-width:3.4px;stroke-linejoin:round;pointer-events:none}
.ksub-map .nm.hb{font-weight:800;fill:#0f172a}
.ksub-map .st{cursor:pointer;outline:none}
.ksub-map .st:hover .nm,.ksub-map .st:focus-visible .nm,.ksub-map .st.on .nm{fill:#b45309}
.ksub-map .st:hover .dot,.ksub-map .st:hover .hub,.ksub-map .st:focus-visible .dot,.ksub-map .st:focus-visible .hub{stroke-width:3.4px}
.ksub-map .dim{opacity:.18;pointer-events:none}
.ksub-map .ring{fill:rgba(245,167,0,.2);stroke:#f5a700;stroke-width:2.5px}
.ksub-map .pin{pointer-events:none;animation:ksub-pin .45s cubic-bezier(.2,.9,.3,1.3) both}
.ksub-map .pulse{animation:ksub-pulse 1.8s ease-out infinite}
@keyframes ksub-pin{from{opacity:0;transform:translateY(-10px) scale(.6)}to{opacity:1;transform:none}}
@keyframes ksub-pulse{from{opacity:.55;transform:scale(.6)}to{opacity:0;transform:scale(2.2)}}
@media (prefers-reduced-motion:reduce){.ksub-map .pin,.ksub-map .pulse{animation:none}}
`;

function fitBox(box: Box, size: Size, pad = 0.06): View {
  const aspect = size.ch / size.cw;
  const bw = box.w * (1 + pad * 2);
  const bh = box.h * (1 + pad * 2);
  const w = Math.max(bw, bh / aspect, 1);
  return { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - (w * aspect) / 2, w };
}

function levelOf(levels: readonly number[], z: number) {
  let level = -1;
  levels.forEach((threshold, index) => {
    if (z >= threshold) level = index;
  });
  return level;
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

type LayerProps = {
  lang: string;
  lines: MapLineData[];
  stations: MapStationData[];
  level: number;
  selected: number | null;
  activeLine: number | null;
  onPick: (index: number) => void;
};

/** Lines and stations; re-rendered only when the label level, the selection or the line filter changes. */
const MapLayer = memo(function MapLayer({ lang, lines, stations, level, selected, activeLine, onPick }: LayerProps) {
  const labels = useMemo(
    () =>
      stations.map((station) => {
        const text = labelLines(station.name);
        return { text, layout: labelText(station.position, station.hub, text) };
      }),
    [stations],
  );
  const order = useMemo(() => {
    const indexes = stations.map((_, index) => index);
    return [...indexes.filter((index) => !stations[index].hub), ...indexes.filter((index) => stations[index].hub)];
  }, [stations]);
  const drawOrder = selected === null ? order : [...order.filter((index) => index !== selected), selected];
  const lineOrder =
    activeLine === null ? lines.map((_, index) => index) : [...lines.keys()].filter((index) => index !== activeLine).concat(activeLine);

  return (
    <>
      <g>
        {lineOrder.map((index) => (
          <g key={lines[index].ko} opacity={activeLine === null || activeLine === index ? 1 : 0.12}>
            <path className="cs" d={lines[index].d} />
            <path className="ln" d={lines[index].d} stroke={lines[index].color} />
          </g>
        ))}
      </g>
      <g>
        {drawOrder.map((index) => {
          const station = stations[index];
          const dim = activeLine !== null && !station.lines.includes(activeLine);
          const on = selected === index;
          const label = labels[index];
          const r = station.hub ? HUB_R : DOT_R;
          return (
            <a
              key={station.slug}
              href={`/${lang}/stations/${station.slug}`}
              className={`st${dim ? " dim" : ""}${on ? " on" : ""}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onPick(index);
              }}
            >
              <title>{station.alt ? `${station.name} (${station.alt})` : station.name}</title>
              <g transform={`translate(${station.x} ${station.y})`}>
                <g className="sc">
                  <circle className="hit" r={13} />
                  {on ? <circle className="ring" r={r + 5} /> : null}
                  <circle
                    className={station.hub ? "hub" : "dot"}
                    r={r}
                    stroke={station.hub ? undefined : lines[station.lines[0]]?.color}
                  />
                  {!dim && (on || station.level <= level + (activeLine === null ? 0 : 2)) ? (
                    <text className={station.hub ? "nm hb" : "nm"} fontSize={label.layout.size} textAnchor={label.layout.anchor} aria-hidden>
                      {label.text.map((part, line) => (
                        <tspan key={line} x={label.layout.x} y={label.layout.baselines[line]}>
                          {part}
                        </tspan>
                      ))}
                    </text>
                  ) : null}
                </g>
              </g>
            </a>
          );
        })}
      </g>
    </>
  );
});

function Fact({ icon, label, value, muted }: { icon: IconName; label: string; value: string; muted: boolean }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold text-ink-muted">
        <Icon name={icon} size={14} />
        {label}
      </dt>
      <dd className={`mt-1 break-words text-[13px] font-bold leading-snug ${muted ? "text-ink-muted" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function StationPanel({
  station,
  lines,
  lang,
  appLang,
  copy,
  actions,
  onClose,
}: {
  station: MapStationData;
  lines: MapLineData[];
  lang: string;
  appLang: string;
  copy: MapCopy;
  actions?: MapPickAction[];
  onClose: () => void;
}) {
  const live = `/station?${new URLSearchParams({
    station: station.ko,
    lat: String(station.lat),
    lng: String(station.lng),
    lines: station.lines.map((index) => lines[index].ko).join(" · "),
    lang: appLang,
  })}`;
  const lockers = [station.lockers ? fill(copy.lockersCount, { n: station.lockers }) : null, station.desk ? copy.desk : null].filter(
    (part): part is string => part !== null,
  );
  const restrooms = station.restroomsIn + station.restroomsOut;
  return (
    <section
      aria-label={station.name}
      className="absolute inset-x-2 bottom-2 z-30 max-h-[62%] overflow-y-auto rounded-2xl border border-line bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.2)] sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:max-h-[calc(100%-24px)] sm:w-[324px]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {station.lines.map((index) => (
            <span
              key={index}
              className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: lines[index].color }}
            >
              {lines[index].name}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="-mr-1.5 -mt-1.5 rounded-full p-1.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <h2 className="mt-2 break-words text-[22px] font-extrabold leading-tight tracking-tight text-ink">{station.name}</h2>
      <p className="mt-0.5 text-[14px] font-semibold text-ink-muted">
        <span lang="ko">{station.ko}</span>
        {station.alt ? <span> · {station.alt}</span> : null}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <Fact
          icon="exit"
          label={copy.exits}
          value={station.exits ? fill(copy.exitsCount, { n: station.exits }) : copy.noData}
          muted={!station.exits}
        />
        <Fact
          icon="restroom"
          label={copy.restrooms}
          value={restrooms ? fill(copy.restroomCount, { inside: station.restroomsIn, outside: station.restroomsOut }) : copy.noData}
          muted={!restrooms}
        />
        <Fact icon="luggage" label={copy.lockers} value={lockers.length ? lockers.join(" · ") : copy.noData} muted={!lockers.length} />
        <Fact
          icon="elevator"
          label={copy.elevator}
          value={station.elevator ? fill(copy.elevatorVia, { exit: station.elevator }) : copy.noData}
          muted={!station.elevator}
        />
      </dl>
      {actions ? (
        <div className="sticky -bottom-4 -mx-4 -mb-4 mt-3 grid grid-cols-2 gap-2 border-t border-line bg-surface px-4 py-3">
          {actions.map((action, index) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                action.onPick(station.slug);
                onClose();
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[14px] font-bold transition active:scale-[0.98] ${
                index === 0 ? "bg-honey text-white" : "border border-line text-ink hover:bg-surface-muted"
              }`}
            >
              <Icon name={action.icon} size={16} />
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <>
          <Link
            href={`/${lang}/stations/${station.slug}`}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-honey px-4 py-3 text-[14px] font-bold text-white transition active:scale-[0.98]"
          >
            {copy.guide}
            <Icon name="arrow" size={16} />
          </Link>
          <a
            href={live}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-surface-muted active:scale-[0.98]"
          >
            <Icon name="clock" size={15} className="text-honey-strong" />
            {copy.live}
          </a>
        </>
      )}
    </section>
  );
}

/**
 * The interactive subway map: pan (drag), zoom (wheel, pinch, buttons) by moving the SVG viewBox,
 * search, a line filter, and a station panel. `--z` (screen px per map unit) keeps strokes, dots and
 * labels a constant size; the viewBox is written to the DOM directly so panning doesn't re-render React.
 */
export default function SubwayMap({
  lang,
  appLang,
  width,
  height,
  focus,
  levels,
  maxZoom,
  lines,
  stations,
  copy,
  actions,
  marks,
}: {
  lang: string;
  appLang: string;
  width: number;
  height: number;
  focus: Box;
  levels: readonly number[];
  maxZoom: number;
  lines: MapLineData[];
  stations: MapStationData[];
  copy: MapCopy;
  /** Picker mode: the map fills its container, has no full-screen toggle, and the panel offers these buttons. */
  actions?: MapPickAction[];
  marks?: MapMark[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sizeRef = useRef<Size>(SERVER_SIZE);
  const [initial] = useState(() => {
    const view = fitBox(focus, SERVER_SIZE);
    return { view, viewBox: `${view.x} ${view.y} ${view.w} ${(view.w * SERVER_SIZE.ch) / SERVER_SIZE.cw}`, z: SERVER_SIZE.cw / view.w };
  });
  const viewRef = useRef<View>(initial.view);
  const [level, setLevel] = useState(() => levelOf(levels, initial.z));
  const [selected, setSelected] = useState<number | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const measured = useRef(false);
  const animation = useRef<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; x: number; y: number; dist: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const view = viewRef.current;
    const { cw, ch } = sizeRef.current;
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${(view.w * ch) / cw}`);
    const z = cw / view.w;
    svg.style.setProperty("--z", String(z));
    setLevel(levelOf(levels, z));
  }, [levels]);

  const clamp = useCallback(
    (next: View): View => {
      const { cw, ch } = sizeRef.current;
      const w = Math.min(Math.max(width, (height * cw) / ch) * 1.1, Math.max(cw / maxZoom, next.w));
      const h = (w * ch) / cw;
      return {
        w,
        x: Math.min(width - w * 0.25, Math.max(-w * 0.75, next.x)),
        y: Math.min(height - h * 0.25, Math.max(-h * 0.75, next.y)),
      };
    },
    [width, height, maxZoom],
  );

  const set = useCallback(
    (next: View) => {
      viewRef.current = clamp(next);
      draw();
    },
    [clamp, draw],
  );

  const stop = useCallback(() => {
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    animation.current = null;
  }, []);

  const apply = useCallback(
    (next: View) => {
      stop();
      set(next);
    },
    [set, stop],
  );

  const flyTo = useCallback(
    (target: View) => {
      stop();
      const from = viewRef.current;
      const to = clamp(target);
      const { cw, ch } = sizeRef.current;
      const aspect = ch / cw;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 450);
        const e = 1 - Math.pow(1 - t, 3);
        const w = Math.exp(Math.log(from.w) + (Math.log(to.w) - Math.log(from.w)) * e);
        const cx = from.x + from.w / 2 + (to.x + to.w / 2 - (from.x + from.w / 2)) * e;
        const cy = from.y + (from.w * aspect) / 2 + (to.y + (to.w * aspect) / 2 - (from.y + (from.w * aspect) / 2)) * e;
        set({ w, x: cx - w / 2, y: cy - (w * aspect) / 2 });
        animation.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      animation.current = requestAnimationFrame(step);
    },
    [clamp, set, stop],
  );

  /** Zoom by `factor` (<1 zooms in) keeping the point at offset (ox, oy) still. */
  const zoomAt = useCallback(
    (factor: number, ox: number, oy: number) => {
      const from = viewRef.current;
      const unit = from.w / sizeRef.current.cw;
      const w = clamp({ ...from, w: from.w * factor }).w;
      const px = from.x + ox * unit;
      const py = from.y + oy * unit;
      const ratio = w / from.w;
      apply({ w, x: px - (px - from.x) * ratio, y: py - (py - from.y) * ratio });
    },
    [apply, clamp],
  );

  /** Bring a station into the part of the map the panel doesn't cover, zooming in far enough to name it. */
  const reveal = useCallback(
    (index: number, zoomIn: boolean) => {
      const station = stations[index];
      const { cw, ch } = sizeRef.current;
      const view = viewRef.current;
      let w = view.w;
      if (zoomIn) {
        const need = Math.max(levels[Math.min(station.level, levels.length - 1)] * 1.05, levels[5] ?? 2.5);
        if (cw / w < need) w = cw / need;
      }
      const wide = window.matchMedia(`(min-width: ${WIDE}px)`).matches;
      const unit = w / cw;
      const px = (station.x - view.x) / unit;
      const py = (station.y - view.y) / unit;
      const free = wide
        ? px > 40 && px < cw - PANEL_WIDTH - 20 && py > 70 && py < ch - 40
        : px > 30 && px < cw - 30 && py > 70 && py < ch * 0.36;
      if (!zoomIn && free) return;
      const sx = wide ? (cw - PANEL_WIDTH) / 2 : cw / 2;
      const sy = wide ? ch / 2 : ch * 0.24;
      flyTo({ w, x: station.x - sx * unit, y: station.y - sy * unit });
    },
    [flyTo, levels, stations],
  );

  const pick = useCallback(
    (index: number) => {
      setSelected(index);
      reveal(index, false);
    },
    [reveal],
  );

  function chooseLine(index: number | null) {
    setActiveLine(index);
    setSelected(null);
    if (index === null) {
      flyTo(fitBox(focus, sizeRef.current));
      return;
    }
    const on = stations.filter((station) => station.lines.includes(index));
    const xs = on.map((station) => station.x);
    const ys = on.map((station) => station.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    flyTo(fitBox({ x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }, sizeRef.current, 0.1));
  }

  const markKey = marks?.map((mark) => mark.slug).join(",") ?? "";
  useEffect(() => {
    const marked = markKey ? stations.filter((station) => markKey.split(",").includes(station.slug)) : [];
    if (!marked.length) return;
    const xs = marked.map((station) => station.x);
    const ys = marked.map((station) => station.y);
    const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const size = sizeRef.current;
    const view = fitBox(box, size, 0.3);
    const w = Math.max(view.w, size.cw / (levels[6] ?? 3.8));
    const aspect = size.ch / size.cw;
    flyTo({ w, x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - (w * aspect) / 2 });
  }, [markKey, stations, levels, flyTo]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(() => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const before = sizeRef.current;
      const view = viewRef.current;
      sizeRef.current = { cw: rect.width, ch: rect.height };
      if (!measured.current) {
        measured.current = true;
        set(fitBox(focus, sizeRef.current));
        return;
      }
      const z = before.cw / view.w;
      const cx = view.x + view.w / 2;
      const cy = view.y + (view.w * before.ch) / before.cw / 2;
      const w = rect.width / z;
      set({ w, x: cx - w / 2, y: cy - (w * rect.height) / rect.width / 2 });
    });
    observer.observe(svg);
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const rect = svg!.getBoundingClientRect();
      zoomAt(Math.exp(event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0015)), event.clientX - rect.left, event.clientY - rect.top);
    }
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      svg.removeEventListener("wheel", onWheel);
      stop();
    };
  }, [focus, set, stop, zoomAt]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (selected !== null) setSelected(null);
      else if (expanded) setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  function local(event: PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function startGesture() {
    const [a, b] = [...pointers.current.values()];
    gesture.current = {
      view: viewRef.current,
      x: b ? (a.x + b.x) / 2 : a.x,
      y: b ? (a.y + b.y) / 2 : a.y,
      dist: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      moved: gesture.current?.moved ?? false,
    };
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stop();
    setSearching(false);
    pointers.current.set(event.pointerId, local(event));
    if (pointers.current.size === 1) suppressClick.current = false;
    startGesture();
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, local(event));
    const [a, b] = [...pointers.current.values()];
    const g = gesture.current;
    const x = b ? (a.x + b.x) / 2 : a.x;
    const y = b ? (a.y + b.y) / 2 : a.y;
    if (!g.moved && !b && Math.hypot(x - g.x, y - g.y) < DRAG_THRESHOLD) return;
    if (!g.moved) {
      g.moved = true;
      suppressClick.current = true;
      svgRef.current?.setPointerCapture(event.pointerId);
    }
    const { cw } = sizeRef.current;
    const w = b && g.dist ? clamp({ ...g.view, w: (g.view.w * g.dist) / Math.hypot(a.x - b.x, a.y - b.y) }).w : g.view.w;
    const px = g.view.x + (g.x / cw) * g.view.w;
    const py = g.view.y + (g.y / cw) * g.view.w;
    set({ w, x: px - (x / cw) * w, y: py - (y / cw) * w });
  }

  function onPointerUp(event: PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size) startGesture();
    else gesture.current = null;
  }

  const keys = useMemo(
    () => stations.map((station) => [station.name, station.ko, station.alt ?? ""].map(normalizeQuery).filter(Boolean)),
    [stations],
  );
  const results = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return [];
    return stations
      .map((station, index) => ({ index, rank: keys[index].some((key) => key.startsWith(q)) ? 0 : 1, hub: station.hub }))
      .filter(({ index }) => keys[index].some((key) => key.includes(q)))
      .sort((a, b) => a.rank - b.rank || Number(b.hub) - Number(a.hub))
      .slice(0, 8)
      .map(({ index }) => index);
  }, [keys, query, stations]);

  function choose(index: number) {
    setQuery("");
    setSearching(false);
    if (activeLine !== null && !stations[index].lines.includes(activeLine)) setActiveLine(null);
    setSelected(index);
    reveal(index, true);
  }

  /** `lines` comes in drawing order (Line 1 drawn last, on top); the filter lists Line 1 first. */
  const chipOrder = useMemo(() => lines.map((_, index) => index).reverse(), [lines]);

  const control =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface/95 text-ink shadow-[0_2px_10px_rgba(15,23,42,0.12)] backdrop-blur transition hover:text-honey-strong active:scale-95";

  return (
    <div
      className={
        actions
          ? "flex h-full min-h-0 flex-col overflow-hidden bg-[#fbfbf9]"
          : expanded
            ? "fixed inset-0 z-[70] flex flex-col bg-[#fbfbf9] pt-[env(safe-area-inset-top)]"
            : "flex h-[min(80dvh,760px)] min-h-[480px] flex-col overflow-hidden rounded-3xl border border-line bg-[#fbfbf9]"
      }
    >
      <style>{STYLE}</style>
      <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line bg-surface px-2.5 py-2 [scrollbar-width:none]">
        <button
          type="button"
          aria-pressed={activeLine === null}
          onClick={() => chooseLine(null)}
          className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-bold transition ${
            activeLine === null ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink hover:bg-surface-muted"
          }`}
        >
          {copy.allLines}
        </button>
        {chipOrder.map((index) => {
          const line = lines[index];
          const active = activeLine === index;
          return (
            <button
              key={line.ko}
              type="button"
              aria-pressed={active}
              onClick={() => chooseLine(active ? null : index)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-bold transition ${
                active ? "border-transparent text-white" : "border-line bg-surface text-ink hover:bg-surface-muted"
              }`}
              style={active ? { backgroundColor: line.color } : undefined}
            >
              {active ? null : <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} aria-hidden />}
              {line.name}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-0 flex-1">
        <svg
          ref={svgRef}
          viewBox={initial.viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label={copy.label}
          className="ksub-map absolute inset-0 h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ "--z": initial.z } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(event) => {
            if (!suppressClick.current) return;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <MapLayer
            lang={lang}
            lines={lines}
            stations={stations}
            level={level}
            selected={selected}
            activeLine={activeLine}
            onPick={pick}
          />
          {marks?.map((mark) => {
            const station = stations.find((item) => item.slug === mark.slug);
            if (!station) return null;
            return (
              <g key={`${mark.label}-${mark.slug}`} transform={`translate(${station.x} ${station.y})`} aria-hidden>
                <g className="sc">
                  <g className="pin">
                    <circle className="pulse" r={10} fill={mark.color} />
                    <path
                      d="M0 -2 C -2 -8 -12 -12 -12 -22 A 12 12 0 1 1 12 -22 C 12 -12 2 -8 0 -2 Z"
                      fill={mark.color}
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                    <circle cy={-22} r={4.5} fill="#fff" />
                  </g>
                </g>
              </g>
            );
          })}
        </svg>

        <div className="absolute left-2 right-2 top-2 z-20 sm:right-auto sm:w-[300px]">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/95 px-3 py-2.5 shadow-[0_2px_10px_rgba(15,23,42,0.1)] backdrop-blur">
            <Icon name="search" size={17} className="text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearching(true);
              }}
              onFocus={() => setSearching(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results.length) choose(results[0]);
              }}
              placeholder={copy.search}
              aria-label={copy.search}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button type="button" aria-label={copy.close} onClick={() => setQuery("")} className="text-ink-muted hover:text-ink">
                <Icon name="close" size={16} />
              </button>
            ) : null}
          </div>
          {searching && query ? (
            <ul className="mt-1 max-h-[46vh] overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
              {results.length ? (
                results.map((index) => {
                  const station = stations[index];
                  return (
                    <li key={station.slug}>
                      <button
                        type="button"
                        onClick={() => choose(index)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-muted"
                      >
                        <span className="flex shrink-0 gap-0.5" aria-hidden>
                          {station.lines.slice(0, 4).map((line) => (
                            <span key={line} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lines[line].color }} />
                          ))}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold text-ink">{station.name}</span>
                          <span className="block truncate text-[12px] text-ink-muted">
                            <span lang="ko">{station.ko}</span>
                            {station.alt ? ` · ${station.alt}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2.5 text-[13px] text-ink-muted">{copy.empty}</li>
              )}
            </ul>
          ) : null}
        </div>

        <div className={`absolute bottom-3 right-3 z-10 flex flex-col gap-2 ${selected !== null ? "max-sm:hidden" : ""}`}>
          <button type="button" aria-label={copy.zoomIn} className={control} onClick={() => zoomAt(0.6, sizeRef.current.cw / 2, sizeRef.current.ch / 2)}>
            <Icon name="plus" size={18} />
          </button>
          <button type="button" aria-label={copy.zoomOut} className={control} onClick={() => zoomAt(1 / 0.6, sizeRef.current.cw / 2, sizeRef.current.ch / 2)}>
            <Icon name="minus" size={18} />
          </button>
          <button type="button" aria-label={copy.reset} className={control} onClick={() => flyTo(fitBox(focus, sizeRef.current))}>
            <Icon name="target" size={18} />
          </button>
          {actions ? null : (
            <button
              type="button"
              aria-label={expanded ? copy.collapse : copy.expand}
              aria-pressed={expanded}
              className={control}
              onClick={() => setExpanded((value) => !value)}
            >
              <Icon name={expanded ? "collapse" : "expand"} size={18} />
            </button>
          )}
        </div>

        {selected !== null ? (
          <StationPanel
            station={stations[selected]}
            lines={lines}
            lang={lang}
            appLang={appLang}
            copy={copy}
            actions={actions}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
