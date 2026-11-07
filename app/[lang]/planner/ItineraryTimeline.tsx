"use client";

import {
  Accessibility,
  ArrowLeftRight,
  Car,
  Clock,
  ExternalLink,
  Footprints,
  Luggage,
  MapPin,
  Route as RouteIcon,
  ShoppingBag,
  Toilet,
  TrainFront,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { GuideLocale } from "../../_lib/guideLocale";
import type { Plan, PlanFacility, PlanLine, PlanLink, PlanSpot, PlanStation, PlanStep } from "../../_lib/planner";
import { clockLabel, durationText, exitWalkText, fillCopy, stopsText } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import type { RouteMode } from "../../_lib/routeFinder";
import styles from "./planner.module.css";
import { CATEGORY_ICONS, LineBadge, TAG_ICONS } from "./plannerIcons";

/** Fills `{key}` slots with nodes, so parts of a translated sentence can be bold. */
function rich(template: string, values: Record<string, ReactNode>) {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={index}>{key && key in values ? values[key] : part}</Fragment>;
  });
}

function LinePill({ line }: { line: PlanLine }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2.5 text-[12px] font-bold text-white" style={{ backgroundColor: line.color }}>
      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/25 px-[3px] text-[9.5px] font-black">{line.short}</span>
      {line.name}
    </span>
  );
}

function MapsButton({ href, label, copy }: { href: string; label: string; copy: PlannerCopy }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1.5 text-[12px] font-bold text-ink transition hover:text-honey-strong active:scale-95"
    >
      <MapPin size={13} aria-hidden />
      {copy.googleMaps}
    </a>
  );
}

function SpotCard({ spot, number, copy }: { spot: PlanSpot; number?: number; copy: PlannerCopy }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {number ? (
            <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-black text-white">
              {number}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="break-words text-[15px] font-extrabold leading-snug text-ink">{spot.name}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{spot.blurb}</p>
          </div>
        </div>
        <MapsButton href={spot.maps} label={fillCopy(copy.onGoogleMaps, { name: spot.name })} copy={copy} />
      </div>
      <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold">
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#f5b800] px-2 py-0.5 text-neutral-900">
          <Footprints size={12} aria-hidden />
          {exitWalkText(copy, spot.exit, spot.walk)}
        </span>
        {spot.categories.map((category) => {
          const CategoryIcon = CATEGORY_ICONS[category];
          return (
            <span key={category} className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-0.5 text-ink-muted">
              <CategoryIcon size={12} aria-hidden />
              {copy.categories[category].short}
            </span>
          );
        })}
        {spot.tags.map((tag) => (
          <span key={tag} className="rounded-lg bg-honey-soft px-2 py-0.5 text-honey-strong">
            {copy.tags[tag]}
          </span>
        ))}
      </p>
    </div>
  );
}

function SpotList({ spots, copy, numbered = false }: { spots: PlanSpot[]; copy: PlannerCopy; numbered?: boolean }) {
  if (!spots.length) return null;
  return (
    <ol className={`mt-2 grid gap-2 ${numbered ? "" : "sm:grid-cols-2"}`}>
      {spots.map((spot, index) => (
        <li key={spot.name}>
          <SpotCard spot={spot} copy={copy} number={numbered ? index + 1 : undefined} />
        </li>
      ))}
    </ol>
  );
}

function SearchLinks({ links, copy }: { links: PlanLink[]; copy: PlannerCopy }) {
  if (!links.length) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {links.map((link) => {
        const LinkIcon: LucideIcon = link.tag ? TAG_ICONS[link.tag] : link.category ? CATEGORY_ICONS[link.category] : MapPin;
        return (
          <li key={link.maps}>
            <a
              href={link.maps}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2.5 rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] font-bold text-ink transition hover:border-honey/50 hover:text-honey-strong"
            >
              <LinkIcon size={16} aria-hidden className="shrink-0 text-honey-strong" />
              <span className="min-w-0 flex-1">
                {link.tag ? <span className="mr-1.5 text-honey-strong">{copy.tags[link.tag]}</span> : null}
                {link.label}
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-[12px] text-ink-muted sm:inline-flex">
                {copy.googleMaps}
                <ExternalLink size={12} aria-hidden />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function SubHeading({ icon: HeadingIcon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h4 className="mt-4 flex items-center gap-1.5 text-[12.5px] font-extrabold uppercase tracking-wide text-ink-muted">
      <HeadingIcon size={15} aria-hidden className="text-honey-strong" />
      {children}
    </h4>
  );
}

function FacilityList({ items, empty, extra, copy }: { items: PlanFacility[]; empty: string; extra?: string | null; copy: PlannerCopy }) {
  if (!items.length && !extra) return <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{empty}</p>;
  return (
    <ul className="mt-1.5 space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-ink">
          <LineBadge short={item.line.short} color={item.line.color} />
          {item.exit ? (
            <span className="rounded-md bg-[#f5b800] px-1.5 py-0.5 text-[11.5px] font-extrabold text-neutral-900">
              {fillCopy(copy.exit, { exit: item.exit })}
            </span>
          ) : null}
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11.5px] font-bold ${
              item.inside ? "bg-[#e8f5ee] text-[#1b7a4b]" : "bg-surface-muted text-ink-muted"
            }`}
          >
            {item.inside ? copy.insideGates : copy.outsideGates}
          </span>
          {[item.floor, item.note].filter(Boolean).map((text) => (
            <span key={text} className="text-ink-muted">
              {text}
            </span>
          ))}
        </li>
      ))}
      {extra ? <li className="text-[12.5px] font-semibold leading-relaxed text-ink">{extra}</li> : null}
    </ul>
  );
}

function StationHeader({
  label,
  station,
  copy,
  lang,
  onShowLocal,
}: {
  label: string;
  station: PlanStation;
  copy: PlannerCopy;
  lang: GuideLocale;
  onShowLocal?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-honey-strong">{label}</p>
        <h3 className="mt-0.5 break-words text-[20px] font-extrabold leading-tight tracking-tight text-ink">
          <Link href={`/${lang}/stations/${station.slug}`} className="hover:text-honey-strong">
            {station.title}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-1">
          {station.ko !== station.title ? (
            <span lang="ko" className="mr-0.5 text-[13px] font-semibold text-ink-muted">
              {station.ko}
            </span>
          ) : null}
          {station.lines.map((line) => (
            <LineBadge key={line.name} short={line.short} color={line.color} size="md" />
          ))}
        </p>
      </div>
      {onShowLocal ? (
        <button
          type="button"
          onClick={onShowLocal}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1.5 text-[12px] font-bold text-ink transition hover:text-honey-strong active:scale-95"
        >
          <span lang="ko" className="font-black">
            한글
          </span>
          {copy.showKorean}
        </button>
      ) : null}
    </div>
  );
}

/** A row on the timeline: a time badge, a rail colored by the line being ridden, the content on the right. */
function Row({
  time,
  strong,
  dot,
  rail,
  last,
  index,
  children,
}: {
  time: string;
  strong?: boolean;
  dot: ReactNode;
  /** Line color while riding; walking parts get a dashed rail. */
  rail: string | null;
  last?: boolean;
  index: number;
  children: ReactNode;
}) {
  return (
    <li className={`relative grid grid-cols-[62px_1fr] gap-2 sm:grid-cols-[84px_1fr] sm:gap-3 ${styles.rise}`} style={{ animationDelay: `${Math.min(index, 8) * 55}ms` } as CSSProperties}>
      <span className={`pt-2.5 text-right ${strong ? "" : "pt-2"}`}>
        <span
          className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-[10.5px] font-extrabold tabular-nums sm:text-[11.5px] ${
            strong ? "bg-ink text-white" : "text-ink-muted"
          }`}
        >
          {time}
        </span>
      </span>
      <div className="relative pb-5 pl-7">
        {last ? null : rail ? (
          <span aria-hidden className="absolute bottom-0 left-[6px] top-3 w-[4px] rounded-full" style={{ backgroundColor: rail }} />
        ) : (
          <span aria-hidden className="absolute bottom-0 left-[7px] top-3 border-l-2 border-dashed border-line" />
        )}
        <span aria-hidden className="absolute left-0 top-3">
          {dot}
        </span>
        {children}
      </div>
    </li>
  );
}

const stationDot = (color = "border-honey") => <span className={`block h-4 w-4 rounded-full border-[3px] bg-surface ${color}`} />;
const card = "rounded-3xl border border-line bg-surface p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)]";

function StepView({
  step,
  index,
  last,
  from,
  copy,
  lang,
  onShowLocal,
}: {
  step: PlanStep;
  index: number;
  last: boolean;
  from: PlanStation;
  copy: PlannerCopy;
  lang: GuideLocale;
  onShowLocal: (station: PlanStation) => void;
}) {
  const clock = (minutes: number) => clockLabel(minutes, lang);
  switch (step.kind) {
    case "depart":
      return (
        <Row index={index} last={last} time={clock(step.time)} strong dot={stationDot()} rail={null}>
          <section className={card}>
            <StationHeader label={copy.depart} station={step.station} copy={copy} lang={lang} />
            <div className="grid gap-x-5 sm:grid-cols-2">
              <div>
                <SubHeading icon={Luggage}>{copy.lockersTitle}</SubHeading>
                <FacilityList
                  items={step.lockers}
                  extra={step.luggageDesk ? fillCopy(copy.luggageDesk, { where: step.luggageDesk }) : null}
                  empty={copy.noLockers}
                  copy={copy}
                />
              </div>
              <div>
                <SubHeading icon={Toilet}>{copy.restrooms}</SubHeading>
                <FacilityList items={step.restrooms} empty={copy.noRestrooms} copy={copy} />
              </div>
            </div>
            <SubHeading icon={Accessibility}>{copy.elevatorTitle}</SubHeading>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">{step.elevator ?? copy.noElevator}</p>
            <SearchLinks links={step.links} copy={copy} />
            <SubHeading icon={Utensils}>{step.meal.lunch ? copy.lunch : copy.bite}</SubHeading>
            <SpotList spots={step.meal.spots} copy={copy} />
            <SearchLinks links={step.meal.links} copy={copy} />
            {step.meal.lunch ? <p className="mt-2 text-[12px] text-ink-muted">{copy.lunchNote}</p> : null}
          </section>
        </Row>
      );
    case "ride": {
      const to = <b className="text-ink">{step.to}</b>;
      return (
        <Row
          index={index}
          last={last}
          time={clock(step.time)}
          rail={step.line.color}
          dot={
            <span className="-ml-[3px] block">
              <LineBadge short={step.line.short} color={step.line.color} size="md" />
            </span>
          }
        >
          <div className="rounded-2xl px-3.5 py-2.5" style={{ backgroundColor: `color-mix(in srgb, ${step.line.color} 9%, transparent)` }}>
            <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-ink">
              <TrainFront size={16} aria-hidden />
              <LinePill line={step.line} />
              <span>
                {stopsText(copy, step.stops)} · {fillCopy(copy.minutes, { n: step.minutes })}
              </span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              {step.stops <= 1
                ? rich(copy.rideOne, { from: step.from, to })
                : step.next
                  ? rich(copy.rideToward, { from: step.from, next: <b className="text-ink">{step.next}</b>, to })
                  : rich(copy.rideTo, { from: step.from, to })}
            </p>
          </div>
        </Row>
      );
    }
    case "transfer":
      return (
        <Row
          index={index}
          last={last}
          time={clock(step.time)}
          rail={null}
          dot={
            <span className="-ml-[2px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-surface">
              <ArrowLeftRight size={11} strokeWidth={3} aria-hidden />
            </span>
          }
        >
          <p className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[13px] font-semibold text-ink">
            {rich(copy.transferAt, {
              station: (
                <>
                  {step.station}
                  {step.toStation ? ` ${fillCopy(copy.transferWalkTo, { station: step.toStation })}` : ""}
                </>
              ),
              line: <LinePill line={step.line} />,
            })}
            <span className="text-ink-muted">· {fillCopy(copy.transferWalk, { n: step.walk })}</span>
          </p>
        </Row>
      );
    case "stop":
      return (
        <Row index={index} last={last} time={clock(step.time)} strong dot={stationDot("border-ink")} rail={null}>
          <section className={card}>
            <StationHeader
              label={`${step.transfer ? copy.stopTransit : copy.stopOnWay} · ${fillCopy(copy.until, { time: clock(step.until) })}`}
              station={step.station}
              copy={copy}
              lang={lang}
              onShowLocal={() => onShowLocal(step.station)}
            />
            {step.spots.length ? (
              <>
                <SubHeading icon={ShoppingBag}>{copy.hotSpots}</SubHeading>
                <SpotList spots={step.spots} copy={copy} />
              </>
            ) : null}
            <SearchLinks links={step.links} copy={copy} />
            {step.lockers.length ? (
              <>
                <SubHeading icon={Luggage}>{copy.lockersHere}</SubHeading>
                <FacilityList items={step.lockers} empty="" copy={copy} />
              </>
            ) : null}
          </section>
        </Row>
      );
    case "arrive": {
      const free = Math.round(step.leaveBy - step.time);
      return (
        <Row index={index} last time={clock(step.time)} strong dot={stationDot()} rail={null}>
          <section className={card}>
            <StationHeader label={copy.destination} station={step.station} copy={copy} lang={lang} />
            {step.spots.length ? (
              <>
                <SubHeading icon={RouteIcon}>{copy.suggestedWalk}</SubHeading>
                <SpotList spots={step.spots} copy={copy} numbered />
              </>
            ) : null}
            <SearchLinks links={step.links} copy={copy} />
            {step.lockers.length ? (
              <>
                <SubHeading icon={Luggage}>{copy.lockersHere}</SubHeading>
                <FacilityList items={step.lockers} empty="" copy={copy} />
              </>
            ) : null}
            {step.restrooms.length ? (
              <>
                <SubHeading icon={Toilet}>{copy.restrooms}</SubHeading>
                <FacilityList items={step.restrooms} empty="" copy={copy} />
              </>
            ) : null}
            <button
              type="button"
              onClick={() => onShowLocal(step.station)}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#111827] px-4 py-4 text-[15.5px] font-extrabold text-white shadow-[0_8px_20px_rgba(17,24,39,0.22)] ring-2 ring-[#f5b800] transition active:scale-[0.98]"
            >
              <Car size={21} aria-hidden className="text-[#f5b800]" />
              <span className="min-w-0 break-words">{copy.showToLocalTaxi}</span>
              <span lang="ko" className="shrink-0 rounded-lg bg-[#f5b800] px-2 py-0.5 text-[14px] font-black text-neutral-900">
                {step.station.ko}
              </span>
            </button>
            <p
              className={`mt-4 flex items-start gap-2 rounded-2xl px-3.5 py-3 text-[13px] font-semibold leading-relaxed ${
                free < 45 ? "bg-[#fff1f0] text-[#b42318]" : "bg-honey-soft text-ink"
              }`}
            >
              <Clock size={17} aria-hidden className="mt-0.5 shrink-0" />
              <span>
                {free > 0 ? fillCopy(copy.timeHere, { duration: durationText(copy, free) }) : ""}
                {rich(copy.headBack, { time: <b>{clock(step.leaveBy)}</b>, station: from.title, n: step.back })}
                {free < 45 ? copy.tight : ""}
              </span>
            </p>
          </section>
        </Row>
      );
    }
  }
}

/** Step 3: the day as timed cards on a rail colored by the lines ridden. */
export default function ItineraryTimeline({
  plan,
  mode,
  from,
  copy,
  lang,
  onShowLocal,
}: {
  plan: Plan;
  mode: RouteMode;
  from: PlanStation;
  copy: PlannerCopy;
  lang: GuideLocale;
  onShowLocal: (station: PlanStation) => void;
}) {
  return (
    <ol aria-label={copy.itinerary}>
      {plan.steps.map((step, index) => (
        <StepView
          key={`${mode}-${index}`}
          step={step}
          index={index}
          last={index === plan.steps.length - 1}
          from={from}
          copy={copy}
          lang={lang}
          onShowLocal={onShowLocal}
        />
      ))}
    </ol>
  );
}
