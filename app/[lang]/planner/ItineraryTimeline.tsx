"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Plan, PlanLine, PlanLink, PlanSpot, PlanStation, PlanStep } from "../../_lib/planner";
import { CATEGORY_LABELS, clockLabel } from "../../_lib/plannerParams";
import type { RouteMode } from "../../_lib/routeFinder";
import { Icon, IconTile, type IconName } from "../_guide/icons";
import ShowKorean from "../_guide/ShowKorean";
import { CATEGORY_ICONS } from "./PlannerFormModal";

type ShowKoreanText = {
  copy: { button: string; hint: string; pickExit: string; close: string };
  /** `{station}` is replaced with the destination's English name. */
  station: string;
  exit: string;
};

const TABS: { mode: RouteMode; label: string; icon: IconName }[] = [
  { mode: "fastest", label: "Shortest Time", icon: "bolt" },
  { mode: "fewest", label: "Minimum Transfer", icon: "transfer" },
];

const transfersLabel = (n: number) => (n === 0 ? "No transfers" : n === 1 ? "1 transfer" : `${n} transfers`);

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return [hours ? `${hours} h` : "", rest || !hours ? `${rest} min` : ""].filter(Boolean).join(" ");
}

function LinePill({ line }: { line: PlanLine }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold text-white" style={{ backgroundColor: line.color }}>
      {line.name}
    </span>
  );
}

function MapsButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1.5 text-[12px] font-bold text-ink transition hover:text-honey-strong active:scale-95"
    >
      <Icon name="pin" size={14} />
      Google Maps
    </a>
  );
}

function SpotCard({ spot }: { spot: PlanSpot }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[15px] font-extrabold leading-snug text-ink">{spot.name}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{spot.blurb}</p>
        </div>
        <MapsButton href={spot.maps} label={`${spot.name} on Google Maps`} />
      </div>
      <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
        {spot.exit ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[#f5b800] px-2 py-0.5 text-neutral-900">
            <Icon name="exit" size={13} />
            Exit {spot.exit}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-lg bg-honey-soft px-2 py-0.5 text-honey-strong">
          <Icon name="clock" size={13} />
          {spot.walk} min walk
        </span>
        {spot.categories.map((category) => (
          <span key={category} className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-ink-muted">
            <Icon name={CATEGORY_ICONS[category]} size={12} />
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </p>
    </li>
  );
}

function SearchLinks({ links }: { links: PlanLink[] }) {
  if (!links.length) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {links.map((link) => (
        <li key={link.maps}>
          <a
            href={link.maps}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] font-bold text-ink transition hover:border-honey/50 hover:text-honey-strong"
          >
            <Icon name={CATEGORY_ICONS[link.category]} size={16} className="text-honey-strong" />
            <span className="min-w-0 flex-1">{link.label}</span>
            <span className="text-[12px] text-ink-muted">Browse on Google Maps ›</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function SubHeading({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <h4 className="mt-4 flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-ink-muted">
      <Icon name={icon} size={15} className="text-honey-strong" />
      {children}
    </h4>
  );
}

function StationHeader({ label, station }: { label: string; station: PlanStation }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-honey-strong">{label}</p>
      <h3 className="mt-0.5 break-words text-[20px] font-extrabold leading-tight tracking-tight text-ink">
        <Link href={`/en/stations/${station.slug}`} className="hover:text-honey-strong">
          {station.title}
        </Link>
      </h3>
      <p className="mt-1 flex flex-wrap items-center gap-1.5">
        <span lang="ko" className="text-[13px] font-semibold text-ink-muted">
          {station.ko}
        </span>
        {station.lines.map((line) => (
          <LinePill key={line.name} line={line} />
        ))}
      </p>
    </div>
  );
}

/** A row on the timeline: the time in the left column, a dot on the rail, the content on the right. */
function Row({ time, dot, children, compact }: { time: string; dot: ReactNode; children: ReactNode; compact?: boolean }) {
  return (
    <li className="relative grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[76px_1fr]">
      <span className={`text-right text-[12px] font-extrabold tabular-nums text-ink ${compact ? "pt-1" : "pt-3"}`}>{time}</span>
      <div className="relative pb-5 pl-6">
        <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-[2px] bg-line" />
        <span aria-hidden className={`absolute left-0 ${compact ? "top-1.5" : "top-3.5"}`}>
          {dot}
        </span>
        {children}
      </div>
    </li>
  );
}

const bigDot = <span className="block h-4 w-4 rounded-full border-[3px] border-honey bg-surface" />;

function StepView({ step, from, showKorean }: { step: PlanStep; from: PlanStation; showKorean: ShowKoreanText }) {
  switch (step.kind) {
    case "depart":
      return (
        <Row time={clockLabel(step.time)} dot={bigDot}>
          <section className="rounded-3xl border border-line bg-surface p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
            <StationHeader label="Start" station={step.station} />
            <SubHeading icon="luggage">Lockers near the gates</SubHeading>
            {step.lockers.length ? (
              <ul className="mt-1.5 space-y-1 text-[13px] leading-relaxed text-ink">
                {step.lockers.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[13px] text-ink-muted">No lockers listed at this station; travel light or use a luggage service.</p>
            )}
            <SubHeading icon="elevator">Elevator route</SubHeading>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              {step.elevator ?? "No street-to-platform elevator route is listed; check the station guide for escalators."}
            </p>
            <SubHeading icon="food">{step.meal.lunch ? "Lunch before you ride" : "Grab a bite nearby"}</SubHeading>
            {step.meal.spots.length ? (
              <ul className="mt-2 flex flex-col gap-2">
                {step.meal.spots.map((spot) => (
                  <SpotCard key={spot.name} spot={spot} />
                ))}
              </ul>
            ) : null}
            {step.meal.link ? <SearchLinks links={[step.meal.link]} /> : null}
            {step.meal.lunch ? <p className="mt-2 text-[12px] text-ink-muted">About an hour is set aside for lunch.</p> : null}
          </section>
        </Row>
      );
    case "ride":
      return (
        <Row
          compact
          time={clockLabel(step.time)}
          dot={<span className="block h-4 w-4 rounded-full border-[3px] bg-surface" style={{ borderColor: step.line.color }} />}
        >
          <div className="rounded-2xl border-l-4 bg-surface-muted px-3.5 py-2.5" style={{ borderLeftColor: step.line.color }}>
            <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-ink">
              <Icon name="train" size={16} />
              <LinePill line={step.line} />
              <span>
                {step.stops} {step.stops === 1 ? "stop" : "stops"} · {step.minutes} min
              </span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Board at {step.from}
              {step.stops <= 1 ? (
                <>
                  {" "}
                  and ride one stop to <b className="text-ink">{step.to}</b>.
                </>
              ) : (
                <>
                  {step.next ? (
                    <>
                      {" "}
                      on the platform toward <b className="text-ink">{step.next}</b>
                    </>
                  ) : null}
                  , get off at <b className="text-ink">{step.to}</b>.
                </>
              )}
            </p>
          </div>
        </Row>
      );
    case "transfer":
      return (
        <Row compact time={clockLabel(step.time)} dot={<span className="ml-[3px] block h-2.5 w-2.5 rounded-full bg-ink-muted" />}>
          <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-ink">
            <Icon name="transfer" size={15} className="text-honey-strong" />
            Transfer at {step.station}
            {step.toStation ? ` (walk to ${step.toStation})` : ""} to <LinePill line={step.line} />
            <span className="text-ink-muted">· about {step.walk} min walk</span>
          </p>
        </Row>
      );
    case "stop":
      return (
        <Row time={clockLabel(step.time)} dot={bigDot}>
          <section className="rounded-3xl border border-line bg-surface p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
            <StationHeader label={`Stop on the way · until ${clockLabel(step.until)}`} station={step.station} />
            {step.spots.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {step.spots.map((spot) => (
                  <SpotCard key={spot.name} spot={spot} />
                ))}
              </ul>
            ) : null}
            <SearchLinks links={step.links} />
          </section>
        </Row>
      );
    case "arrive": {
      const free = Math.round(step.leaveBy - step.time);
      return (
        <Row time={clockLabel(step.time)} dot={bigDot}>
          <section className="rounded-3xl border border-line bg-surface p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
            <StationHeader label="Destination" station={step.station} />
            {step.spots.length ? (
              <>
                <SubHeading icon="bag">Top picks near the exits</SubHeading>
                <ul className="mt-2 flex flex-col gap-2">
                  {step.spots.map((spot) => (
                    <SpotCard key={spot.name} spot={spot} />
                  ))}
                </ul>
              </>
            ) : null}
            <SearchLinks links={step.links} />
            <div className="mt-4">
              <ShowKorean
                name={step.station.ko}
                exits={step.station.exits}
                copy={showKorean.copy}
                meaning={{
                  lang: "en",
                  station: showKorean.station.replace("{station}", step.station.title),
                  exit: showKorean.exit.replace("{station}", step.station.title),
                }}
              />
            </div>
            <p
              className={`mt-4 flex items-start gap-2 rounded-2xl px-3.5 py-3 text-[13px] font-semibold leading-relaxed ${
                free < 45 ? "bg-[#fff1f0] text-[#b42318]" : "bg-honey-soft text-ink"
              }`}
            >
              <Icon name="clock" size={17} className="mt-0.5" />
              <span>
                {free > 0 ? `About ${durationLabel(free)} here. ` : ""}
                Head back by <b>{clockLabel(step.leaveBy)}</b>: the ride back to {from.title} takes about {step.back} min.
                {free < 45 ? " That's tight, so try an earlier start or a later return time." : ""}
              </span>
            </p>
          </section>
        </Row>
      );
    }
  }
}

/** Shortest-time and minimum-transfer versions of the day, as a timeline of timed cards. */
export default function ItineraryTimeline({
  plans,
  from,
  showKorean,
}: {
  plans: Record<RouteMode, Plan>;
  from: PlanStation;
  showKorean: ShowKoreanText;
}) {
  const [mode, setMode] = useState<RouteMode>("fastest");
  const plan = plans[mode];
  const same = plans.fastest.signature === plans.fewest.signature;

  return (
    <div>
      <div role="tablist" aria-label="Route options" className="grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-muted p-1.5">
        {TABS.map((tab) => {
          const on = tab.mode === mode;
          const option = plans[tab.mode];
          return (
            <button
              key={tab.mode}
              id={`tab-${tab.mode}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="itinerary-panel"
              onClick={() => setMode(tab.mode)}
              className={`rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.08)]" : "hover:bg-surface/60"}`}
            >
              <span className={`flex items-center gap-1.5 text-[14px] font-extrabold ${on ? "text-ink" : "text-ink-muted"}`}>
                <Icon name={tab.icon} size={16} className={on ? "text-honey-strong" : ""} />
                {tab.label}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold text-ink-muted">
                {option.minutes} min · {transfersLabel(option.transfers)}
              </span>
            </button>
          );
        })}
      </div>
      {same ? <p className="mt-2 text-[12px] text-ink-muted">Both options take the same route for this trip.</p> : null}

      <div id="itinerary-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3">
          <IconTile name="route" size="sm" />
          <span className="text-[14px] font-extrabold text-ink">
            {plan.minutes} min ride · {transfersLabel(plan.transfers)}
          </span>
          <span className="flex flex-wrap gap-1">
            {plan.lines.map((line) => (
              <LinePill key={line.name} line={line} />
            ))}
          </span>
        </div>
        <ol>
          {plan.steps.map((step, index) => (
            <StepView key={`${mode}-${index}`} step={step} from={from} showKorean={showKorean} />
          ))}
        </ol>
      </div>
    </div>
  );
}
