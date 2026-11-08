import { ArrowRight, Car, Luggage, MapPin, Repeat, Sparkles, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { BRAND, gt, tc } from "../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale } from "../../_lib/guideLocale";
import { plannerPairs, plannerStations } from "../../_lib/planner";
import { plannerImageSrc } from "../../_lib/plannerImages";
import { plannerCopy, pt, type PlannerTextKey } from "../../_lib/plannerText";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../_lib/site";
import { MAP_LEVELS, MAP_MAX_ZOOM, SUBWAY_MAP } from "../../_lib/subwayMap";
import { AppPromo, JsonLd } from "../_guide/parts";
import { mapCopy, mapData } from "../map/mapData";
import { StepTracker } from "./PlannerSteps";
import PlannerStudio from "./PlannerStudio";
import { SavedTourList } from "./SavedTours";

export async function generateMetadata({ params }: PageProps<"/[lang]/planner">): Promise<Metadata> {
  const { lang } = await params;
  if (!isGuideLocale(lang)) return {};
  const title = `${pt("homeTitle", lang)} | ${lang === "en" ? "K-SUB" : gt(BRAND, lang)}`;
  const description = pt("homeDescription", lang);
  return {
    title,
    description,
    alternates: guideAlternates("/planner", lang),
    openGraph: { type: "website", siteName: gt(BRAND, lang), title, description, locale: OG_LOCALES[lang], url: `/${lang}/planner` },
    twitter: { card: "summary_large_image", title, description },
  };
}

const FEATURES: [LucideIcon, PlannerTextKey, PlannerTextKey][] = [
  [Repeat, "featureRoutes", "featureRoutesBody"],
  [Luggage, "featureBags", "featureBagsBody"],
  [MapPin, "featureExits", "featureExitsBody"],
  [Car, "featureLocal", "featureLocalBody"],
];

const SLIDE = { "planner-forward": "planner-forward", "planner-back": "planner-back", default: "none" };

export default async function PlannerHome({ params }: PageProps<"/[lang]/planner">) {
  const { lang } = await params;
  if (!isGuideLocale(lang)) notFound();
  const copy = plannerCopy(lang);
  const pairs = plannerPairs(lang);
  const { width, height, focus } = SUBWAY_MAP;

  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <div>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: `K-SUB ${copy.plannerName}`,
              url: `${SITE_URL}/${lang}/planner`,
              inLanguage: GUIDE_LANGUAGES[lang].htmlLang,
              applicationCategory: "TravelApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              description: copy.homeDescription,
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
                { "@type": "ListItem", position: 2, name: copy.travelPlanner, item: `${SITE_URL}/${lang}/planner` },
              ],
            },
          ]}
        />
        <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
          <Link href={`/${lang}`}>{gt(BRAND, lang)}</Link> <span aria-hidden>›</span> <span className="text-ink">{copy.travelPlanner}</span>
        </nav>

        <header className="mt-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-honey-soft px-3 py-1 text-[12px] font-extrabold text-honey-strong">
            <Sparkles size={13} aria-hidden />
            {copy.freeNoSignup}
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">{copy.plannerName}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{copy.homeLead}</p>
        </header>

        <div className="mt-5">
          <StepTracker copy={copy} done={[]} current={[1]} />
        </div>

        <PlannerStudio
          lang={lang}
          copy={copy}
          stations={plannerStations(lang)}
          map={{ width, height, focus, levels: MAP_LEVELS, maxZoom: MAP_MAX_ZOOM, ...mapData(lang), copy: mapCopy(lang) }}
        />

        <SavedTourList copy={copy} lang={lang} />

        <section aria-labelledby="planner-popular" className="relative ml-[calc(50%-min(640px,calc(50vw-16px)))] mt-10 w-[min(1280px,calc(100vw-32px))]">
          <h2 id="planner-popular" className="text-[20px] font-extrabold tracking-tight text-ink">
            {copy.popularTours}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pairs.map(({ href, summary, tags, image, highlight }) => (
              <li key={href}>
                <Link
                  href={href}
                  transitionTypes={["planner-forward"]}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_4px_18px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.14)] active:scale-[0.98]"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden bg-surface-muted">
                    <Image
                      src={plannerImageSrc(image)}
                      alt={`${highlight ?? summary.to} (${copy.examplePhoto})`}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute inset-x-3 bottom-3 text-white">
                      <span className="block break-words text-[17px] font-extrabold leading-tight drop-shadow">
                        {summary.from} → {summary.to}
                      </span>
                      {highlight ? <span className="mt-0.5 block truncate text-[12px] font-semibold text-white/80">{highlight}</span> : null}
                    </span>
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/85 backdrop-blur">
                      {copy.examplePhoto}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-3.5">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className="flex h-1.5 w-12 overflow-hidden rounded-full">
                        {summary.colors.map((color) => (
                          <span key={color} className="block flex-1" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                      <span className="text-[12px] font-bold text-ink-muted">
                        {pt("minutes", lang, { n: summary.minutes })} · {summary.lines.join(" + ")}
                      </span>
                    </span>
                    {summary.via.length ? (
                      <span className="flex items-center gap-1 text-[12px] text-ink-muted">
                        <Repeat size={13} aria-hidden className="shrink-0" />
                        <span className="truncate">{pt("changeAt", lang, { stations: summary.via.join(copy.viaJoin) }).replace(/^[\s·,，、]+/, "")}</span>
                      </span>
                    ) : null}
                    <span className="mt-auto flex items-center justify-between gap-2">
                      <span className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-honey-soft px-1.5 py-0.5 text-[11px] font-bold text-honey-strong">
                            {copy.tags[tag]}
                          </span>
                        ))}
                      </span>
                      <ArrowRight size={16} aria-hidden className="shrink-0 text-ink-muted transition group-hover:translate-x-1 group-hover:text-honey-strong" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="planner-how" className="mt-10">
          <h2 id="planner-how" className="text-[18px] font-extrabold tracking-tight text-ink">
            {copy.whatYouGet}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {FEATURES.map(([FeatureIcon, title, body]) => (
              <li key={title} className="flex items-start gap-3 rounded-2xl bg-surface-muted px-4 py-3">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface text-honey-strong ring-1 ring-inset ring-honey/15">
                  <FeatureIcon size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-extrabold text-ink">{copy[title]}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">{copy[body]}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8">
          <AppPromo locale={lang} />
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
          {copy.homeNote} {copy.photoNote}
        </p>
      </div>
    </ViewTransition>
  );
}
