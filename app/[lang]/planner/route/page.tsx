import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition, type ReactNode } from "react";
import { BRAND, gt, tc } from "../../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale, type GuideLocale } from "../../../_lib/guideLocale";
import { buildPlanner, plannerStations, routeSummary, type Plan, type PlanSpot, type PlanStation } from "../../../_lib/planner";
import { clockLabel, parsePlannerQuery, plannerHref, type PlannerQuery } from "../../../_lib/plannerParams";
import { categoryText, plannerCopy, pt, type PlannerCopy } from "../../../_lib/plannerText";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { AppPromo, JsonLd } from "../../_guide/parts";
import { CATEGORY_ICONS, LineBadge, PIN_COLORS } from "../plannerIcons";
import PlannerFormModal, { PlannerForm } from "../PlannerFormModal";
import PlannerResultView from "../PlannerResultView";
import { StepTracker } from "../PlannerSteps";

/** The route part of the URL, without the language: only the stations make a distinct page. */
function routePath(query: PlannerQuery) {
  return `/planner/route?from=${encodeURIComponent(query.from)}&to=${encodeURIComponent(query.to)}`;
}

const brand = (lang: GuideLocale) => (lang === "en" ? "K-SUB" : gt(BRAND, lang));

const SLIDE = { "planner-forward": "planner-forward", "planner-back": "planner-back", default: "none" };

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
    <div
      aria-busy="true"
      className="relative ml-[calc(50%-min(640px,calc(50vw-16px)))] w-[min(1280px,calc(100vw-32px))]"
    >
      <div className="h-4 w-40 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-4 h-9 w-2/3 max-w-[520px] animate-pulse rounded-xl bg-surface-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="h-56 animate-pulse rounded-[26px] bg-[#111827]/90 lg:order-2 lg:h-[420px]" />
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-2xl bg-surface-muted" />
          <div className="h-36 animate-pulse rounded-3xl bg-surface-muted" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StationLine({ station, color, label }: { station: PlanStation; color: string; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white/10" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-white/50">{label}</p>
        <p className="flex flex-wrap items-center gap-1.5 break-words text-[17px] font-extrabold leading-tight">
          {station.name}
          <span className="flex gap-0.5">
            {station.lines.map((line) => (
              <LineBadge key={line.name} short={line.short} color={line.color} />
            ))}
          </span>
        </p>
        {station.ko !== station.name ? (
          <p lang="ko" className="text-[12px] font-semibold text-white/50">
            {station.ko}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TripSummary({ query, from, to, copy, lang, edit }: { query: PlannerQuery; from: PlanStation; to: PlanStation; copy: PlannerCopy; lang: GuideLocale; edit: ReactNode }) {
  return (
    <>
      <div className="mt-3 space-y-1">
        <StationLine station={from} color={PIN_COLORS.from} label={copy.departure} />
        <span aria-hidden className="ml-[6px] block h-4 border-l-2 border-dashed border-white/20" />
        <StationLine station={to} color={PIN_COLORS.to} label={copy.arrival} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-bold">
          <Clock size={14} aria-hidden className="text-[#f5b800]" />
          {clockLabel(query.start, lang)} – {clockLabel(query.end, lang)}
        </span>
        {query.categories.map((category) => {
          const CategoryIcon = CATEGORY_ICONS[category];
          return (
            <span key={category} className="inline-flex items-center gap-1 rounded-full bg-[#f5b800]/15 px-3 py-1.5 text-[12.5px] font-bold text-[#f5b800]">
              <CategoryIcon size={13} aria-hidden />
              {copy.categories[category].short}
            </span>
          );
        })}
        {query.tags.map((tag) => (
          <span key={tag} className="rounded-lg bg-white/[0.07] px-2.5 py-1.5 text-[12.5px] font-bold text-white/70">
            {copy.tags[tag]}
          </span>
        ))}
      </div>
      <div className="mt-4">{edit}</div>
    </>
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
      <div>
        <Link
          href={`/${lang}/planner`}
          transitionTypes={["planner-back"]}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-ink-muted transition hover:text-honey-strong"
        >
          <ArrowLeft size={15} aria-hidden />
          {copy.backToPlanner}
        </Link>
        <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-ink">{copy.planYourTour}</h1>
        <p role="alert" className="mt-3 rounded-2xl bg-[#fff1f0] px-4 py-3 text-[14px] font-semibold text-[#b42318]">
          {message}
        </p>
        <section aria-label={copy.setupDialog} className="mt-5 rounded-3xl bg-[#111827] p-5 sm:p-6">
          <PlannerForm stations={stations} initial={query} copy={copy} lang={lang} tone="dark" />
        </section>
      </div>
    );
  }

  const { from, to, plans } = result;
  const url = `${SITE_URL}/${lang}${routePath(query)}`;
  const summary = routeSummary(from.slug, to.slug, lang);
  const description = summary ? describe(summary, lang) : "";
  const names = { from: from.name, to: to.name };

  return (
    <div>
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
      <PlannerResultView
        plans={plans}
        from={from}
        to={to}
        tour={{ href: plannerHref(query, lang), title: `${from.name} → ${to.name}` }}
        copy={copy}
        lang={lang}
        intro={
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
                <ol className="flex flex-wrap items-center gap-1">
                  <li>
                    <Link href={`/${lang}`}>{gt(BRAND, lang)}</Link>
                  </li>
                  <li aria-hidden>›</li>
                  <li>
                    <Link href={`/${lang}/planner`} transitionTypes={["planner-back"]}>
                      {copy.travelPlanner}
                    </Link>
                  </li>
                  <li aria-hidden>›</li>
                  <li aria-current="page" className="text-ink">
                    {pt("routeBreadcrumb", lang, names)}
                  </li>
                </ol>
              </nav>
              <Link
                href={`/${lang}/planner`}
                transitionTypes={["planner-back"]}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink transition hover:border-honey/50 hover:text-honey-strong active:scale-95"
              >
                <ArrowLeft size={14} aria-hidden />
                {copy.backToPlanner}
              </Link>
            </div>
            <header className="mt-3 max-w-[820px]">
              <h1 className="break-words text-[27px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">{pt("routeHeading", lang, names)}</h1>
              {description ? <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{description}</p> : null}
            </header>
            <div className="mt-5 max-w-[820px]">
              <StepTracker copy={copy} done={[1]} current={[2, 3]} links />
            </div>
          </>
        }
        summary={
          <TripSummary
            query={query}
            from={from}
            to={to}
            copy={copy}
            lang={lang}
            edit={
              <PlannerFormModal
                stations={stations}
                initial={query}
                copy={copy}
                lang={lang}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-[13px] font-bold text-white transition hover:border-[#f5b800]/60 hover:text-[#f5b800] active:scale-95"
              />
            }
          />
        }
        aside={
          <section aria-labelledby="planner-guides" className="mt-8 lg:mt-0">
            <h2 id="planner-guides" className="text-[15px] font-extrabold text-ink">
              {copy.stationGuides}
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
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
        }
        footer={
          <>
            <div className="mt-8">
              <AppPromo locale={lang} />
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
              {copy.routeNote} {copy.photoNote}
            </p>
          </>
        }
      />
    </div>
  );
}

export default function PlannerRoute({ params, searchParams }: PageProps<"/[lang]/planner/route">) {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <div>
        <Suspense
          fallback={
            <ViewTransition exit="planner-skeleton">
              <Loading />
            </ViewTransition>
          }
        >
          <ViewTransition enter="planner-reveal" default="none">
            <Itinerary params={params} searchParams={searchParams} />
          </ViewTransition>
        </Suspense>
      </div>
    </ViewTransition>
  );
}
