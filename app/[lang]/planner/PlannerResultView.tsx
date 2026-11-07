"use client";

import { Car } from "lucide-react";
import { useState } from "react";
import type { GuideLocale } from "../../_lib/guideLocale";
import type { Plan, PlanStation } from "../../_lib/planner";
import { fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import type { RouteMode } from "../../_lib/routeFinder";
import ItineraryTimeline from "./ItineraryTimeline";
import { StepHeader } from "./PlannerSteps";
import RouteOptionsTab from "./RouteOptionsTab";
import { SaveTourActions } from "./SavedTours";
import ShowToLocalModal from "./ShowToLocalModal";

/** Steps 2 and 3 of the result page, sharing the chosen route and the Show to Local card. */
export default function PlannerResultView({
  plans,
  from,
  to,
  tour,
  copy,
  lang,
}: {
  plans: Record<RouteMode, Plan>;
  from: PlanStation;
  to: PlanStation;
  tour: { href: string; title: string };
  copy: PlannerCopy;
  lang: GuideLocale;
}) {
  const [mode, setMode] = useState<RouteMode>("fastest");
  const [local, setLocal] = useState<PlanStation | null>(null);

  return (
    <>
      <section id="step-2" aria-labelledby="step-2-title" className="mt-8 scroll-mt-20">
        <StepHeader copy={copy} step={2} id="step-2-title" title={copy.stepRoutes}>
          {copy.routesLead}
        </StepHeader>
        <div className="mt-4">
          <RouteOptionsTab plans={plans} mode={mode} copy={copy} onChange={setMode} />
        </div>
      </section>

      <section id="step-3" aria-labelledby="step-3-title" className="mt-10 scroll-mt-20">
        <StepHeader
          copy={copy}
          step={3}
          id="step-3-title"
          title={copy.stepItinerary}
          action={<SaveTourActions href={tour.href} title={tour.title} copy={copy} />}
        >
          {fillCopy(copy.itineraryLead, { from: from.name, to: to.name })}
        </StepHeader>
        <button
          type="button"
          onClick={() => setLocal(to)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-[13px] font-extrabold text-white ring-2 ring-[#f5b800] transition active:scale-95"
        >
          <Car size={16} aria-hidden className="text-[#f5b800]" />
          {copy.showToLocal}
          <span lang="ko" className="rounded-md bg-[#f5b800] px-1.5 text-[12px] font-black text-neutral-900">
            {to.ko}
          </span>
        </button>
        <div className="mt-5">
          <ItineraryTimeline plan={plans[mode]} mode={mode} from={from} copy={copy} lang={lang} onShowLocal={setLocal} />
        </div>
      </section>

      <ShowToLocalModal station={local} copy={copy} lang={lang} onClose={() => setLocal(null)} />
    </>
  );
}
