"use client";

import { ArrowRight, MousePointerClick } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { contentLocale, type GuideLocale } from "../../_lib/guideLocale";
import type { PlannerStationOption } from "../../_lib/planner";
import { DEFAULT_CATEGORIES, DEFAULT_END, DEFAULT_START, fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import SubwayMap, { type MapCopy, type MapLineData, type MapMark, type MapStationData } from "../map/SubwayMap";
import { PlannerForm } from "./PlannerFormModal";
import { PIN_COLORS } from "./plannerIcons";

export type StudioMap = {
  width: number;
  height: number;
  focus: { x: number; y: number; w: number; h: number };
  levels: readonly number[];
  maxZoom: number;
  lines: MapLineData[];
  stations: MapStationData[];
  copy: MapCopy;
};

/** Step 1 of the planner home: the subway map beside a navy setup panel; tapping a station fills the form. */
export default function PlannerStudio({
  lang,
  copy,
  stations,
  map,
}: {
  lang: GuideLocale;
  copy: PlannerCopy;
  stations: PlannerStationOption[];
  map: StudioMap;
}) {
  const [pair, setPair] = useState({ from: "", to: "" });
  const known = (slug: string) => stations.some((station) => station.slug === slug);
  const name = (slug: string) => stations.find((station) => station.slug === slug)?.name;
  const marks: MapMark[] = [];
  if (pair.from) marks.push({ slug: pair.from, color: PIN_COLORS.from, label: copy.departure });
  if (pair.to) marks.push({ slug: pair.to, color: PIN_COLORS.to, label: copy.arrival });

  return (
    <section
      aria-labelledby="step-1-title"
      className="relative ml-[calc(50%-min(640px,calc(50vw-16px)))] mt-6 w-[min(1280px,calc(100vw-32px))]"
    >
      <div className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-line bg-[#111827] shadow-[0_18px_50px_rgba(15,23,42,0.16)] lg:h-[min(calc(100dvh-120px),800px)] lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="relative h-[56dvh] min-h-[360px] lg:h-auto lg:min-h-0">
          <SubwayMap
            lang={lang}
            appLang={contentLocale(lang)}
            width={map.width}
            height={map.height}
            focus={map.focus}
            levels={map.levels}
            maxZoom={map.maxZoom}
            lines={map.lines}
            stations={map.stations}
            copy={map.copy}
            marks={marks}
            actions={[
              { label: copy.departure, icon: "train", onPick: (slug) => known(slug) && setPair((current) => ({ ...current, from: slug })) },
              { label: copy.arrival, icon: "pin", onPick: (slug) => known(slug) && setPair((current) => ({ ...current, to: slug })) },
            ]}
          />
          {marks.length ? (
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex max-w-[calc(100%-72px)] flex-col gap-1.5">
              {marks.map((mark) => (
                <span
                  key={mark.label}
                  className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-surface/95 px-3 py-1.5 text-[12px] font-bold text-ink shadow-[0_2px_10px_rgba(15,23,42,0.12)] backdrop-blur"
                >
                  <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: mark.color }} />
                  <span className="text-ink-muted">{mark.label}</span>
                  <span className="truncate">{name(mark.slug)}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative overflow-y-auto bg-[radial-gradient(120%_80%_at_100%_0%,rgba(245,184,0,0.14),transparent_55%),linear-gradient(180deg,#111827,#0b1220)] p-5 text-white sm:p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f5b800]">{fillCopy(copy.step, { n: 1 })}</p>
          <h2 id="step-1-title" className="mt-1 text-[23px] font-extrabold leading-tight tracking-tight">
            {copy.setupTitle}
          </h2>
          <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-white/60">
            <MousePointerClick size={15} aria-hidden className="mt-0.5 shrink-0 text-[#f5b800]" />
            {copy.studioHint}
          </p>
          <div className="mt-5">
            <PlannerForm
              stations={stations}
              initial={{ from: "", to: "", categories: DEFAULT_CATEGORIES, tags: [], start: DEFAULT_START, end: DEFAULT_END }}
              copy={copy}
              lang={lang}
              tone="dark"
              pair={{ ...pair, onChange: setPair }}
              mapButton={false}
            />
          </div>
          <Link
            href={`/${lang}/map`}
            className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold text-white/55 transition hover:text-[#f5b800]"
          >
            {copy.mapGuideTitle}
            <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
