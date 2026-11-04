"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { MapBox } from "../../_lib/subwayMap";

type View = { x: number; y: number; w: number };
type Size = { cw: number; ch: number };

/** A press that moves further than this (px) pans the map instead of opening a station. */
const DRAG_THRESHOLD = 6;
/** Screen pixels per map unit at which tier 1, tier 2, then all station names appear. */
const LABEL_LEVELS = [2, 5, 9];
/** Assumed box size before the browser measures it, so the server HTML is drawn at a typical scale. */
const SERVER_SIZE: Size = { cw: 720, ch: 560 };

const STYLE = `
.ksub-map .ln{fill:none;stroke-width:calc(3.4px / var(--z));stroke-linecap:round;stroke-linejoin:round}
.ksub-map .dot{fill:#fff;stroke:#374151;r:calc(2.6px / var(--z));stroke-width:calc(1.3px / var(--z))}
.ksub-map .dot.t1,.ksub-map .dot.t2{r:calc(4px / var(--z));stroke:#111827;stroke-width:calc(1.8px / var(--z))}
.ksub-map .name{display:none;font-size:calc(11px / var(--z));font-weight:700;fill:#111827;paint-order:stroke;stroke:#fff;stroke-width:calc(3px / var(--z));transform:translate(calc(5px / var(--z)),calc(-5px / var(--z)))}
.ksub-map .name.t1{font-size:calc(12px / var(--z))}
.ksub-map[data-level="1"] .name.t1,.ksub-map[data-level="2"] .name.t1,.ksub-map[data-level="2"] .name.t2,.ksub-map[data-level="3"] .name{display:block}
.ksub-map a:hover .dot,.ksub-map a:focus .dot{stroke:#f5a700}
`;

function fit(box: MapBox, size: Size): View {
  const aspect = size.ch / size.cw;
  const w = Math.max(box.w, box.h / aspect);
  return { x: box.x + box.w / 2 - w / 2, y: box.y + box.h / 2 - (w * aspect) / 2, w };
}

/**
 * Pan (drag), zoom (wheel, pinch, buttons) over a server-rendered SVG map by moving its viewBox, which
 * keeps the container's aspect ratio. `--z` (screen px per map unit) keeps strokes and labels a constant size.
 */
export default function MapViewport({
  width,
  height,
  focus,
  label,
  controls,
  children,
}: {
  width: number;
  height: number;
  focus: MapBox;
  label: string;
  controls: { zoomIn: string; zoomOut: string; reset: string };
  children: ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<Size>(SERVER_SIZE);
  const [view, setView] = useState<View>(() => fit(focus, SERVER_SIZE));
  const viewRef = useRef(view);
  const sizeRef = useRef(size);
  const measured = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; x: number; y: number; dist: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const minW = 12;
  const maxW = width * 1.2;

  function apply(next: View) {
    const w = Math.min(maxW, Math.max(minW, next.w));
    const h = (w * sizeRef.current.ch) / sizeRef.current.cw;
    const clamped = {
      w,
      x: Math.min(width - w * 0.2, Math.max(-w * 0.8, next.x)),
      y: Math.min(height - h * 0.2, Math.max(-h * 0.8, next.y)),
    };
    viewRef.current = clamped;
    setView(clamped);
  }

  /** Zoom by `factor` (<1 zooms in) keeping the point at client offset (ox, oy) still. */
  function zoomAt(factor: number, ox: number, oy: number) {
    const from = viewRef.current;
    const unit = from.w / sizeRef.current.cw;
    const w = Math.min(maxW, Math.max(minW, from.w * factor));
    const px = from.x + ox * unit;
    const py = from.y + oy * unit;
    const ratio = w / from.w;
    apply({ w, x: px - (px - from.x) * ratio, y: py - (py - from.y) * ratio });
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(() => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      sizeRef.current = { cw: rect.width, ch: rect.height };
      setSize(sizeRef.current);
      apply(measured.current ? viewRef.current : fit(focus, sizeRef.current));
      measured.current = true;
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function local(event: React.PointerEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function startGesture() {
    const points = [...pointers.current.values()];
    const [a, b] = points;
    gesture.current = {
      view: viewRef.current,
      x: b ? (a.x + b.x) / 2 : a.x,
      y: b ? (a.y + b.y) / 2 : a.y,
      dist: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
      moved: gesture.current?.moved ?? false,
    };
  }

  function onPointerDown(event: React.PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, local(event));
    if (pointers.current.size === 1) suppressClick.current = false;
    startGesture();
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, local(event));
    const points = [...pointers.current.values()];
    const [a, b] = points;
    const g = gesture.current;
    const x = b ? (a.x + b.x) / 2 : a.x;
    const y = b ? (a.y + b.y) / 2 : a.y;
    if (!g.moved && Math.hypot(x - g.x, y - g.y) < DRAG_THRESHOLD && !b) return;
    if (!g.moved) {
      g.moved = true;
      suppressClick.current = true;
      svgRef.current?.setPointerCapture(event.pointerId);
    }
    const { cw } = sizeRef.current;
    const w = b && g.dist ? Math.min(maxW, Math.max(minW, (g.view.w * g.dist) / Math.hypot(a.x - b.x, a.y - b.y))) : g.view.w;
    const px = g.view.x + (g.x / cw) * g.view.w;
    const py = g.view.y + (g.y / cw) * g.view.w;
    apply({ w, x: px - (x / cw) * w, y: py - (y / cw) * w });
  }

  function onPointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size) startGesture();
    else gesture.current = null;
  }

  function zoomButton(factor: number) {
    zoomAt(factor, sizeRef.current.cw / 2, sizeRef.current.ch / 2);
  }

  const h = (view.w * size.ch) / size.cw;
  const z = size.cw / view.w;
  const level = LABEL_LEVELS.filter((threshold) => z >= threshold).length;
  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-[20px] font-bold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.12)] active:scale-95";

  return (
    <div className="relative h-[min(72vh,640px)] overflow-hidden rounded-3xl border border-line bg-[#fbfaf7]">
      <style>{STYLE}</style>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={label}
        data-level={level}
        className="ksub-map h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ "--z": z } as CSSProperties}
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
        {children}
      </svg>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button type="button" aria-label={controls.zoomIn} className={buttonClass} onClick={() => zoomButton(0.6)}>
          +
        </button>
        <button type="button" aria-label={controls.zoomOut} className={buttonClass} onClick={() => zoomButton(1 / 0.6)}>
          −
        </button>
        <button
          type="button"
          aria-label={controls.reset}
          className={`${buttonClass} text-[16px]`}
          onClick={() => apply(fit(focus, sizeRef.current))}
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
