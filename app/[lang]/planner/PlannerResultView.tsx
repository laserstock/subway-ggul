"use client";

import { Bookmark, BookmarkCheck, Car, Check, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { GuideLocale } from "../../_lib/guideLocale";
import type { Plan, PlanStation } from "../../_lib/planner";
import { fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import type { RouteMode } from "../../_lib/routeFinder";
import ItineraryTimeline from "./ItineraryTimeline";
import styles from "./planner.module.css";
import { StepHeader } from "./PlannerSteps";
import RouteOptionsTab from "./RouteOptionsTab";
import { useTourActions } from "./SavedTours";
import ShowToLocalModal from "./ShowToLocalModal";

function Status({ text, dark = false }: { text: string | null; dark?: boolean }) {
  return (
    <p role="status" aria-live="polite" className="min-h-[18px] text-[12px] font-semibold">
      {text ? (
        <span key={text} className={`inline-flex items-center gap-1 ${styles.rise} ${dark ? "text-white/80" : "text-ink"}`}>
          <Check size={13} aria-hidden className="text-[#f5b800]" />
          {text}
        </span>
      ) : null}
    </p>
  );
}

/** Steps 2 and 3 beside the navy trip panel (a bottom action bar on phones), sharing the route and the Show to Local card. */
export default function PlannerResultView({
  plans,
  from,
  to,
  tour,
  copy,
  lang,
  intro,
  summary,
  aside,
  footer,
}: {
  plans: Record<RouteMode, Plan>;
  from: PlanStation;
  to: PlanStation;
  tour: { href: string; title: string };
  copy: PlannerCopy;
  lang: GuideLocale;
  /** Breadcrumb, heading and step tracker. */
  intro: ReactNode;
  /** Trip details for the panel: stations, hours, interests and the edit button. */
  summary: ReactNode;
  /** Below the panel, e.g. station guide links. */
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  const [mode, setMode] = useState<RouteMode>("fastest");
  const [local, setLocal] = useState<PlanStation | null>(null);
  const { saved, status, toggleSave, share } = useTourActions(tour.href, tour.title, copy);

  return (
    <div className="relative ml-[calc(50%-min(640px,calc(50vw-16px)))] w-[min(1280px,calc(100vw-32px))] pb-24 lg:pb-0">
      {intro}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <aside className="lg:order-2">
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-[26px] bg-[radial-gradient(120%_70%_at_100%_0%,rgba(245,184,0,0.16),transparent_55%),linear-gradient(180deg,#111827,#0b1220)] p-5 text-white shadow-[0_18px_44px_rgba(15,23,42,0.22)]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f5b800]">{copy.yourTrip}</p>
              {summary}
              <div className="mt-5 hidden gap-2 lg:grid">
                <button
                  type="button"
                  onClick={() => setLocal(to)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#f5b800] px-4 py-3.5 text-[15px] font-extrabold text-neutral-900 shadow-[0_10px_24px_rgba(245,184,0,0.3)] transition duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Car size={18} aria-hidden />
                  {copy.showToLocal}
                  <span lang="ko" className="rounded-md bg-neutral-900/10 px-1.5 text-[13px] font-black">
                    {to.ko}
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={saved}
                    onClick={toggleSave}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-bold transition active:scale-95 ${
                      saved ? "border-[#f5b800] bg-[#f5b800]/15 text-[#f5b800]" : "border-white/15 bg-white/[0.06] text-white hover:border-[#f5b800]/60"
                    }`}
                  >
                    {saved ? <BookmarkCheck size={15} aria-hidden /> : <Bookmark size={15} aria-hidden />}
                    {saved ? copy.saved : copy.saveTour}
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-[13px] font-bold text-white transition hover:border-[#f5b800]/60 active:scale-95"
                  >
                    <Share2 size={15} aria-hidden />
                    {copy.shareItinerary}
                  </button>
                </div>
                <Status text={status} dark />
              </div>
            </div>
            <div className="hidden lg:block">{aside}</div>
          </div>
        </aside>

        <div className="min-w-0">
          <section id="step-2" aria-labelledby="step-2-title" className="scroll-mt-20">
            <StepHeader copy={copy} step={2} id="step-2-title" title={copy.stepRoutes}>
              {copy.routesLead}
            </StepHeader>
            <div className="mt-4">
              <RouteOptionsTab plans={plans} mode={mode} copy={copy} onChange={setMode} />
            </div>
          </section>

          <section id="step-3" aria-labelledby="step-3-title" className="mt-10 scroll-mt-20">
            <StepHeader copy={copy} step={3} id="step-3-title" title={copy.stepItinerary}>
              {fillCopy(copy.itineraryLead, { from: from.name, to: to.name })}
            </StepHeader>
            <div className="mt-5">
              <ItineraryTimeline plan={plans[mode]} mode={mode} from={from} copy={copy} lang={lang} onShowLocal={setLocal} />
            </div>
          </section>

          <div className="lg:hidden">{aside}</div>
          {footer}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-[760px]">
          <Status text={status} />
          <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
            <button
              type="button"
              aria-pressed={saved}
              onClick={toggleSave}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11.5px] font-bold transition active:scale-95 ${
                saved ? "bg-honey-soft text-honey-strong" : "bg-surface-muted text-ink"
              }`}
            >
              {saved ? <BookmarkCheck size={18} aria-hidden /> : <Bookmark size={18} aria-hidden />}
              <span className="max-w-full truncate">{saved ? copy.saved : copy.saveTour}</span>
            </button>
            <button
              type="button"
              onClick={share}
              className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-surface-muted px-2 py-2 text-[11.5px] font-bold text-ink transition active:scale-95"
            >
              <Share2 size={18} aria-hidden />
              <span className="max-w-full truncate">{copy.shareItinerary}</span>
            </button>
            <button
              type="button"
              onClick={() => setLocal(to)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-2 py-2 text-[13px] font-extrabold text-white ring-2 ring-[#f5b800] transition active:scale-95"
            >
              <Car size={18} aria-hidden className="shrink-0 text-[#f5b800]" />
              <span className="min-w-0 truncate">{copy.showToLocal}</span>
            </button>
          </div>
        </div>
      </div>

      <ShowToLocalModal station={local} copy={copy} lang={lang} onClose={() => setLocal(null)} />
    </div>
  );
}
