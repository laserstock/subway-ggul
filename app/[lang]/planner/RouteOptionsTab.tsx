"use client";

import { ArrowRight, Footprints, MapPin, Repeat, Zap, type LucideIcon } from "lucide-react";
import type { Plan, PlanSpot } from "../../_lib/planner";
import { exitWalkText, fillCopy, stopsText, transfersText } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import type { RouteMode } from "../../_lib/routeFinder";
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
            <div className="flex w-[92px] flex-col items-center text-center">
              {station.kind === "end" ? (
                <MapPin size={20} aria-hidden className="text-honey-strong" fill="currentColor" stroke="white" />
              ) : (
                <span
                  aria-hidden
                  className={`mt-0.5 block h-4 w-4 rounded-full border-[3px] bg-surface ${station.kind === "start" ? "border-honey" : "border-ink"}`}
                />
              )}
              <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                {station.kind === "start" ? copy.flowStart : station.kind === "end" ? copy.flowArrive : copy.flowTransfer}
              </span>
              <span className="mt-0.5 line-clamp-2 break-words px-1 text-[12.5px] font-extrabold leading-tight text-ink">{station.name}</span>
            </div>
            {legs[index] ? (
              <div className="flex w-[104px] flex-col items-center pt-[7px] sm:w-[128px]">
                <span aria-hidden className="block h-1.5 w-full rounded-full" style={{ backgroundColor: legs[index].line.color }} />
                <span className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-ink">
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
      <div role="tablist" aria-label={copy.routeOptions} className="grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-muted p-1.5">
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
              className={`rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.08)]" : "hover:bg-surface/60"}`}
            >
              <span className={`flex items-center gap-1.5 text-[14px] font-extrabold ${on ? "text-ink" : "text-ink-muted"}`}>
                <TabIcon size={16} aria-hidden className={on ? "text-honey-strong" : ""} />
                {copy[tab.mode]}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold text-ink-muted">
                {fillCopy(copy.minutes, { n: option.minutes })} · {transfersText(copy, option.transfers)}
              </span>
            </button>
          );
        })}
      </div>
      {same ? <p className="mt-2 text-[12px] text-ink-muted">{copy.sameRoute}</p> : null}

      <div id="route-option-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} className="mt-4 space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-extrabold text-ink">
            {fillCopy(copy.rideMinutes, { n: plan.minutes })}
            <span className="text-ink-muted">·</span>
            {transfersText(copy, plan.transfers)}
          </p>
          <RouteFlow plan={plan} copy={copy} />
        </div>

        {spots.length ? (
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-ink-muted">{copy.spotsOnRoute}</p>
            <ul className="-mx-1 mt-2 grid auto-cols-[78%] grid-flow-col gap-2.5 overflow-x-auto px-1 pb-1 sm:auto-cols-[calc(50%-5px)]">
              {spots.map(({ station, spot }) => (
                <li key={`${station}-${spot.name}`}>
                  <a
                    href="#step-3"
                    className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-3.5 transition hover:border-honey/50"
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-honey-strong">{station}</span>
                    <span className="mt-0.5 line-clamp-2 text-[14px] font-extrabold leading-snug text-ink">{spot.name}</span>
                    <span className="mt-auto flex items-center gap-1 pt-2 text-[12px] font-bold text-ink-muted">
                      <Footprints size={13} aria-hidden />
                      {exitWalkText(copy, spot.exit, spot.walk)}
                      <ArrowRight size={13} aria-hidden className="ml-auto transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
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
