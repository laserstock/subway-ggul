import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BRAND, gt, tc } from "../../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale, type GuideLocale } from "../../../_lib/guideLocale";
import { buildPlanner, plannerStations, routeSummary, type Plan, type PlanSpot } from "../../../_lib/planner";
import { clockLabel, parsePlannerQuery, plannerHref, type PlannerQuery } from "../../../_lib/plannerParams";
import { categoryText, plannerCopy, pt } from "../../../_lib/plannerText";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { AppPromo, JsonLd } from "../../_guide/parts";
import { CATEGORY_ICONS } from "../plannerIcons";
import PlannerFormModal, { PlannerForm } from "../PlannerFormModal";
import PlannerResultView from "../PlannerResultView";
import { StepHeader, StepTracker } from "../PlannerSteps";

/** The route part of the URL, without the language: only the stations make a distinct page. */
function routePath(query: PlannerQuery) {
  return `/planner/route?from=${encodeURIComponent(query.from)}&to=${encodeURIComponent(query.to)}`;
}

const brand = (lang: GuideLocale) => (lang === "en" ? "K-SUB" : gt(BRAND, lang));

function describe(summary: NonNullable<ReturnType<typeof routeSummary>>, lang: GuideLocale) {
  return pt("routeDescription", lang, {
    from: summary.from,
    to: summary.to,
    n: summary.minutes,
    lines: summary.lines.join(" + "),
    via: summary.via.length ? pt("routeVia", lang, { stations: summary.via.join(pt("viaJoin", lang)) }) : "",
  });
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/planner/route">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const query = parsePlannerQuery(await searchParams);
  const summary = routeSummary(query.from, query.to, lang);
  if (!summary) return { title: `${pt("plannerName", lang)} | ${brand(lang)}`, robots: { index: false, follow: true } };
  const title = `${pt("routeMetaTitle", lang, { from: summary.from, to: summary.to })} | ${brand(lang)}`;
  const description = describe(summary, lang);
  const path = routePath(query);
  return {
    title,
    description,
    alternates: guideAlternates(path, lang),
    openGraph: { type: "article", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}${path}` },
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
      <div className="h-8 w-2/3 animate-pulse rounded-xl bg-surface-muted" />
      <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="h-32 animate-pulse rounded-3xl bg-surface-muted" />
      <div className="h-48 animate-pulse rounded-3xl bg-surface-muted" />
    </div>
  );
}

async function Itinerary({ params, searchParams }: PageProps<"/[lang]/planner/route">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const query = parsePlannerQuery(await searchParams);
  const copy = plannerCopy(lang);
  const result = buildPlanner(query, lang);
  const stations = plannerStations(lang);

  if (!result.ok) {
    const message = { station: copy.errorStation, same: copy.errorSameStation, route: copy.errorRoute }[result.reason];
    return (
      <>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{copy.planYourTour}</h1>
        <p role="alert" className="mt-3 rounded-2xl bg-[#fff1f0] px-4 py-3 text-[14px] font-semibold text-[#b42318]">
          {message}
        </p>
        <section aria-label={copy.setupDialog} className="mt-5 rounded-3xl border border-line bg-surface p-4 sm:p-5">
          <PlannerForm stations={stations} initial={query} copy={copy} lang={lang} />
        </section>
      </>
    );
  }

  const { from, to, plans } = result;
  const url = `${SITE_URL}/${lang}${routePath(query)}`;
  const summary = routeSummary(from.slug, to.slug, lang);
  const description = summary ? describe(summary, lang) : "";
  const names = { from: from.name, to: to.name };

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: pt("routeTripName", lang, names),
            description,
            url,
            inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
            touristType: query.categories.map((category) => categoryText(category, lang).label),
            ...(query.tags.length ? { keywords: query.tags.map((tag) => copy.tags[tag].slice(1)).join(", ") } : {}),
            itinerary: {
              "@type": "ItemList",
              itemListElement: planPlaces(plans.fastest).map((item, index) => ({ "@type": "ListItem", position: index + 1, item })),
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
              { "@type": "ListItem", position: 2, name: copy.travelPlanner, item: `${SITE_URL}/${lang}/planner` },
              { "@type": "ListItem", position: 3, name: pt("routeBreadcrumb", lang, names), item: url },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${lang}`}>{gt(BRAND, lang)}</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={`/${lang}/planner`}>{copy.travelPlanner}</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-ink">
            {pt("routeBreadcrumb", lang, names)}
          </li>
        </ol>
      </nav>

      <header className="mt-3">
        <h1 className="break-words text-[27px] font-extrabold leading-tight tracking-tight text-ink">{pt("routeHeading", lang, names)}</h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{description}</p> : null}
      </header>

      <div className="mt-5">
        <StepTracker copy={copy} done={[1]} current={[2, 3]} links />
      </div>

      <section id="step-1" aria-labelledby="step-1-title" className="mt-8 scroll-mt-20">
        <StepHeader
          copy={copy}
          step={1}
          id="step-1-title"
          title={copy.stepSetup}
          action={<PlannerFormModal stations={stations} initial={query} copy={copy} lang={lang} />}
        />
        <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-ink">
            {from.name}
            <ArrowRight size={16} aria-hidden className="text-ink-muted" />
            {to.name}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-[12.5px] font-bold text-ink">
              <Clock size={14} aria-hidden className="text-honey-strong" />
              {clockLabel(query.start, lang)} – {clockLabel(query.end, lang)}
            </span>
            {query.categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category];
              return (
                <span key={category} className="inline-flex items-center gap-1 rounded-full bg-honey-soft px-3 py-1.5 text-[12.5px] font-bold text-honey-strong">
                  <CategoryIcon size={13} aria-hidden />
                  {copy.categories[category].short}
                </span>
              );
            })}
            {query.tags.map((tag) => (
              <span key={tag} className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-[12.5px] font-bold text-ink-muted">
                {copy.tags[tag]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PlannerResultView
        plans={plans}
        from={from}
        to={to}
        tour={{ href: plannerHref(query, lang), title: `${from.name} → ${to.name}` }}
        copy={copy}
        lang={lang}
      />

      <section aria-labelledby="planner-guides" className="mt-4">
        <h2 id="planner-guides" className="text-[17px] font-extrabold text-ink">
          {copy.stationGuides}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[from, to].map((station) => (
            <Link
              key={station.slug}
              href={`/${lang}/stations/${station.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink transition hover:border-honey/50 hover:text-honey-strong"
            >
              {pt("stationGuideLink", lang, { station: station.title })}
              <ArrowRight size={14} aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <AppPromo locale={lang} />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">{copy.routeNote}</p>
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
