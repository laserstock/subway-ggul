"use client";

import { Car } from "lucide-react";
import { useState } from "react";
import type { Plan, PlanStation } from "../../_lib/planner";
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
}: {
  plans: Record<RouteMode, Plan>;
  from: PlanStation;
  to: PlanStation;
  tour: { href: string; title: string };
}) {
  const [mode, setMode] = useState<RouteMode>("fastest");
  const [local, setLocal] = useState<PlanStation | null>(null);

  return (
    <>
      <section id="step-2" aria-labelledby="step-2-title" className="mt-8 scroll-mt-20">
        <StepHeader step={2} id="step-2-title" title="Route Options">
          Compare the quickest ride with the one that changes trains the least. The itinerary below follows your pick.
        </StepHeader>
        <div className="mt-4">
          <RouteOptionsTab plans={plans} mode={mode} onChange={setMode} />
        </div>
      </section>

      <section id="step-3" aria-labelledby="step-3-title" className="mt-10 scroll-mt-20">
        <StepHeader
          step={3}
          id="step-3-title"
          title="Interactive Itinerary"
          action={<SaveTourActions href={tour.href} title={tour.title} />}
        >
          Timed cards from {from.name} to {to.name}, with exits, walking times and Google Maps links.
        </StepHeader>
        <button
          type="button"
          onClick={() => setLocal(to)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-[13px] font-extrabold text-white ring-2 ring-[#f5b800] transition active:scale-95"
        >
          <Car size={16} aria-hidden className="text-[#f5b800]" />
          Show to Local
          <span lang="ko" className="rounded-md bg-[#f5b800] px-1.5 text-[12px] font-black text-neutral-900">
            {to.ko}
          </span>
        </button>
        <div className="mt-5">
          <ItineraryTimeline plan={plans[mode]} mode={mode} from={from} onShowLocal={setLocal} />
        </div>
      </section>

      <ShowToLocalModal station={local} onClose={() => setLocal(null)} />
    </>
  );
}
