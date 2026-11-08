"use client";

import { ArrowDown, Footprints, MapPin, Repeat, Zap, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { Plan, PlanSpot } from "../../_lib/planner";
import { plannerImageSrc } from "../../_lib/plannerImages";
import { exitWalkText, fillCopy, stopsText, transfersText } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import type { RouteMode } from "../../_lib/routeFinder";
import styles from "./planner.module.css";
import { LineBadge } from "./plannerIcons";

const TABS: { mode: RouteMode; icon: LucideIcon }[] = [
  { mode: "fastest", icon: Zap },
  { mode: "fewest", icon: Repeat },
];

function previews(plan: Plan) {
  const out: { station: string; spot: PlanSpot }[] = [];
  for (const step of plan.steps) {
    if (step.kind === "stop" || step.kind === "arrive") {
      for (const spot of step.spots) out.push({ station: step.station.name, spot });
    }
  }
  return out.slice(0, 4);
}

function RouteFlow({ plan, copy }: { plan: Plan; copy: PlannerCopy }) {
  const { stations, legs } = plan.flow;
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <ol className="flex min-w-max items-start" aria-label={copy.routeGlance}>
        {stations.map((station, index) => (
          <li key={`${station.name}-${index}`} className="flex items-start">
            <div className="flex w-[100px] flex-col items-center text-center">
              {station.kind === "end" ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e11d48] text-white shadow-[0_4px_10px_rgba(225,29,72,0.35)]">
                  <MapPin size={15} aria-hidden />
                </span>
              ) : (
                <span
                  aria-hidden
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-[3px] bg-surface ${station.kind === "start" ? "border-honey" : "border-ink"}`}
                >
                  {station.kind === "transfer" ? <Repeat size={12} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-honey" />}
                </span>
              )}
              <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                {station.kind === "start" ? copy.flowStart : station.kind === "end" ? copy.flowArrive : copy.flowTransfer}
              </span>
              <span className="mt-0.5 line-clamp-2 break-words px-1 text-[13px] font-extrabold leading-tight text-ink">{station.name}</span>
            </div>
            {legs[index] ? (
              <div className="flex w-[110px] flex-col items-center pt-[11px] sm:w-[150px]">
                <span aria-hidden className="block h-2 w-full rounded-full" style={{ backgroundColor: legs[index].line.color }} />
                <span className="mt-1.5 flex items-center gap-1 text-[11.5px] font-bold text-ink">
                  <LineBadge short={legs[index].line.short} color={legs[index].line.color} />
                  {fillCopy(copy.minutes, { n: legs[index].minutes })}
                </span>
                <span className="text-[10.5px] text-ink-muted">{stopsText(copy, legs[index].stops)}</span>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Step 2: pick the shortest or the fewest-transfer ride, see its lines and the spots it reaches. */
export default function RouteOptionsTab({
  plans,
  mode,
  copy,
  onChange,
}: {
  plans: Record<RouteMode, Plan>;
  mode: RouteMode;
  copy: PlannerCopy;
  onChange: (mode: RouteMode) => void;
}) {
  const plan = plans[mode];
  const same = plans.fastest.signature === plans.fewest.signature;
  const spots = previews(plan);

  return (
    <div>
      <div role="tablist" aria-label={copy.routeOptions} className="relative grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-muted p-1.5">
        <span
          aria-hidden
          className="absolute bottom-1.5 top-1.5 w-[calc(50%-9px)] rounded-xl bg-[#111827] shadow-[0_6px_16px_rgba(17,24,39,0.25)] transition-[left] duration-300 ease-out"
          style={{ left: mode === "fastest" ? 6 : "calc(50% + 3px)" }}
        />
        {TABS.map((tab) => {
          const on = tab.mode === mode;
          const option = plans[tab.mode];
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.mode}
              id={`tab-${tab.mode}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="route-option-panel"
              onClick={() => onChange(tab.mode)}
              className="relative z-10 rounded-xl px-3 py-2.5 text-left transition-colors duration-300"
            >
              <span className={`flex items-center gap-1.5 text-[14px] font-extrabold ${on ? "text-white" : "text-ink-muted"}`}>
                <TabIcon size={16} aria-hidden className={on ? "text-[#f5b800]" : ""} />
                {copy[tab.mode]}
              </span>
              <span className={`mt-0.5 block text-[12px] font-semibold ${on ? "text-white/70" : "text-ink-muted"}`}>
                {fillCopy(copy.minutes, { n: option.minutes })} · {transfersText(copy, option.transfers)}
              </span>
            </button>
          );
        })}
      </div>
      {same ? <p className="mt-2 text-[12px] text-ink-muted">{copy.sameRoute}</p> : null}

      <div id="route-option-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} className="mt-4 space-y-4">
        <div key={mode} className={`rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] sm:p-5 ${styles.rise}`}>
          <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-extrabold text-ink">
            {fillCopy(copy.rideMinutes, { n: plan.minutes })}
            <span className="text-ink-muted">·</span>
            {transfersText(copy, plan.transfers)}
          </p>
          <RouteFlow plan={plan} copy={copy} />
        </div>

        {spots.length ? (
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-ink-muted">{copy.spotsOnRoute}</p>
            <ul className="-mx-1 mt-2 grid auto-cols-[62%] grid-flow-col gap-3 overflow-x-auto px-1 pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-4 sm:overflow-visible">
              {spots.map(({ station, spot }, index) => (
                <li key={`${mode}-${station}-${spot.name}`} className={styles.rise} style={{ animationDelay: `${index * 70}ms` }}>
                  <a
                    href="#step-3"
                    className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.2)]"
                  >
                    <Image
                      src={plannerImageSrc(spot.image)}
                      alt={`${spot.name} (${copy.examplePhoto})`}
                      fill
                      sizes="(min-width: 640px) 200px, 60vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/85 backdrop-blur-sm">
                      {copy.examplePhoto}
                    </span>
                    <span className="relative block p-3">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#f5b800]">{station}</span>
                      <span className="mt-0.5 line-clamp-2 block text-[14px] font-extrabold leading-snug">{spot.name}</span>
                      <span className="mt-1.5 flex items-center gap-1 text-[11.5px] font-bold text-white/80">
                        <Footprints size={12} aria-hidden />
                        {exitWalkText(copy, spot.exit, spot.walk)}
                        <ArrowDown size={12} aria-hidden className="ml-auto transition group-hover:translate-y-0.5 group-hover:text-[#f5b800]" />
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
