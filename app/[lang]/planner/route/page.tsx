import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BRAND, gt } from "../../../_lib/guideCopy";
import { buildPlanner, plannerStations, routeSummary, type Plan, type PlanSpot } from "../../../_lib/planner";
import { clockLabel, parsePlannerQuery, plannerHref, type PlannerQuery } from "../../../_lib/plannerParams";
import { CATEGORY_META } from "../../../_lib/plannerTypes";
import { SITE_URL } from "../../../_lib/site";
import { AppPromo, JsonLd } from "../../_guide/parts";
import { CATEGORY_ICONS } from "../plannerIcons";
import PlannerFormModal, { PlannerForm } from "../PlannerFormModal";
import PlannerResultView from "../PlannerResultView";
import { StepHeader, StepTracker } from "../PlannerSteps";

const FALLBACK_TITLE = "Seoul Subway Travel Planner | K-SUB";

function canonicalPath(query: PlannerQuery) {
  return `/en/planner/route?from=${encodeURIComponent(query.from)}&to=${encodeURIComponent(query.to)}`;
}

function describe(summary: NonNullable<ReturnType<typeof routeSummary>>) {
  const via = summary.via.length ? `, changing at ${summary.via.join(" and ")}` : "";
  return (
    `${summary.from} to ${summary.to} on the Seoul subway: about ${summary.minutes} min on ${summary.lines.join(" + ")}${via}. ` +
    "A timed day plan with lockers, restrooms, exits, cafés, Olive Young and shopping by exit number."
  );
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/planner/route">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return {};
  const query = parsePlannerQuery(await searchParams);
  const summary = routeSummary(query.from, query.to);
  if (!summary) return { title: FALLBACK_TITLE, robots: { index: false, follow: true } };
  const title = `${summary.from} to ${summary.to} Seoul Subway Travel Itinerary | K-SUB`;
  const description = describe(summary);
  const url = canonicalPath(query);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", siteName: gt(BRAND, "en"), title, description, locale: "en_US", url },
    twitter: { card: "summary_large_image", title, description },
  };
}

function planPlaces(plan: Plan) {
  const places: { name: string; spots: PlanSpot[] }[] = [];
  for (const step of plan.steps) {
    if (step.kind === "depart") places.push({ name: step.station.title, spots: step.meal.spots });
    if (step.kind === "stop" || step.kind === "arrive") places.push({ name: step.station.title, spots: step.spots });
  }
  return places.flatMap((place) => [
    { "@type": "TrainStation", name: place.name },
    ...place.spots.map((spot) => ({ "@type": "TouristAttraction", name: spot.name, description: spot.blurb })),
  ]);
}

function Loading() {
  return (
    <div className="mt-6 space-y-3" aria-busy="true">
      <p className="text-[15px] font-semibold text-ink-muted">Building your tour route…</p>
      <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-32 animate-pulse rounded-3xl bg-surface-muted" />
      <div className="h-48 animate-pulse rounded-3xl bg-surface-muted" />
    </div>
  );
}

async function Itinerary({ params, searchParams }: PageProps<"/[lang]/planner/route">) {
  const { lang } = await params;
  if (lang !== "en") redirect("/en/planner");
  const query = parsePlannerQuery(await searchParams);
  const result = buildPlanner(query);
  const stations = plannerStations();

  if (!result.ok) {
    const message = {
      station: "We couldn't find one of those stations. Pick them again below.",
      same: "Departure and arrival are the same station. Pick a different arrival.",
      route: "We couldn't find a subway route between those stations. Try a nearby station instead.",
    }[result.reason];
    return (
      <>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">Plan your Seoul subway tour</h1>
        <p role="alert" className="mt-3 rounded-2xl bg-[#fff1f0] px-4 py-3 text-[14px] font-semibold text-[#b42318]">
          {message}
        </p>
        <section aria-label="Set up your tour" className="mt-5 rounded-3xl border border-line bg-surface p-4 sm:p-5">
          <PlannerForm stations={stations} initial={query} />
        </section>
      </>
    );
  }

  const { from, to, plans } = result;
  const url = `${SITE_URL}${canonicalPath(query)}`;
  const summary = routeSummary(from.slug, to.slug);
  const description = summary ? describe(summary) : "";

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: `${from.name} to ${to.name} Seoul subway itinerary`,
            description,
            url,
            touristType: query.categories.map((category) => CATEGORY_META[category].label),
            ...(query.tags.length ? { keywords: query.tags.map((tag) => tag.slice(1)).join(", ") } : {}),
            itinerary: {
              "@type": "ItemList",
              itemListElement: planPlaces(plans.fastest).map((item, index) => ({ "@type": "ListItem", position: index + 1, item })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Travel Planner", item: `${SITE_URL}/en/planner` },
              { "@type": "ListItem", position: 3, name: `${from.name} to ${to.name}`, item: url },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/en">{gt(BRAND, "en")}</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/en/planner">Travel Planner</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-ink">
            {from.name} to {to.name}
          </li>
        </ol>
      </nav>

      <header className="mt-3">
        <h1 className="break-words text-[27px] font-extrabold leading-tight tracking-tight text-ink">
          {from.name} to {to.name}: Seoul Subway Day Itinerary
        </h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{description}</p> : null}
      </header>

      <div className="mt-5">
        <StepTracker done={[1]} current={[2, 3]} links />
      </div>

      <section id="step-1" aria-labelledby="step-1-title" className="mt-8 scroll-mt-20">
        <StepHeader step={1} id="step-1-title" title="Setup" action={<PlannerFormModal stations={stations} initial={query} />} />
        <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-ink">
            {from.name}
            <ArrowRight size={16} aria-hidden className="text-ink-muted" />
            {to.name}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-[12.5px] font-bold text-ink">
              <Clock size={14} aria-hidden className="text-honey-strong" />
              {clockLabel(query.start)} – {clockLabel(query.end)}
            </span>
            {query.categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category];
              return (
                <span key={category} className="inline-flex items-center gap-1 rounded-full bg-honey-soft px-3 py-1.5 text-[12.5px] font-bold text-honey-strong">
                  <CategoryIcon size={13} aria-hidden />
                  {CATEGORY_META[category].short}
                </span>
              );
            })}
            {query.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-[12.5px] font-bold text-ink-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PlannerResultView plans={plans} from={from} to={to} tour={{ href: plannerHref(query), title: `${from.name} → ${to.name}` }} />

      <section aria-labelledby="planner-guides" className="mt-4">
        <h2 id="planner-guides" className="text-[17px] font-extrabold text-ink">
          Station guides for this trip
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[from, to].map((station) => (
            <Link
              key={station.slug}
              href={`/en/stations/${station.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink transition hover:border-honey/50 hover:text-honey-strong"
            >
              {station.title}: exits, restrooms & lockers
              <ArrowRight size={14} aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <AppPromo locale="en" />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
        Ride times are typical daytime estimates and leave out the wait for your first train. Exit numbers point to the nearest
        exit; spots are hand-picked and quick-tag results open live Google Maps searches, so check opening hours before you go.
      </p>
    </>
  );
}

export default function PlannerRoute({ params, searchParams }: PageProps<"/[lang]/planner/route">) {
  return (
    <Suspense fallback={<Loading />}>
      <Itinerary params={params} searchParams={searchParams} />
    </Suspense>
  );
}
