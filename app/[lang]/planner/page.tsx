import { ArrowRight, Car, Luggage, Map as MapIcon, MapPin, Repeat, Sparkles, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BRAND, gt } from "../../_lib/guideCopy";
import { plannerPairs, plannerStations } from "../../_lib/planner";
import { DEFAULT_CATEGORIES, DEFAULT_END, DEFAULT_START } from "../../_lib/plannerParams";
import { SITE_URL } from "../../_lib/site";
import { AppPromo, JsonLd } from "../_guide/parts";
import { PlannerForm } from "./PlannerFormModal";
import { StepHeader, StepTracker } from "./PlannerSteps";
import { SavedTourList } from "./SavedTours";

const TITLE = "Seoul Subway Travel Planner & Itinerary Generator | K-SUB";
const DESCRIPTION =
  "Plan your custom Seoul subway travel itinerary from station to station. Find lockers, exit maps, Olive Young, Daiso, and top cafes.";

export async function generateMetadata({ params }: PageProps<"/[lang]/planner">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return {};
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/en/planner" },
    openGraph: { type: "website", siteName: gt(BRAND, "en"), title: TITLE, description: DESCRIPTION, locale: "en_US", url: "/en/planner" },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

const FEATURES: [LucideIcon, string, string][] = [
  [Repeat, "Two routes", "Compare the shortest ride with the one that has the fewest transfers."],
  [Luggage, "Bags and restrooms sorted", "T-Locker banks and restrooms inside or outside the gates, by exit."],
  [MapPin, "Exit by exit", "Every spot comes with its exit number, walking time and a Google Maps link."],
  [Car, "Show to a local", "One tap puts your destination and its address in big Korean text for a taxi driver."],
];

/** Decorative strip of line colors for the map guide card. */
const STRIP = ["#0052a4", "#00a84d", "#ef7c1c", "#00a5de", "#996cac"];

export default async function PlannerHome({ params }: PageProps<"/[lang]/planner">) {
  const { lang } = await params;
  if (lang !== "en") redirect("/en/planner");
  const pairs = plannerPairs();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "K-SUB Seoul Subway Travel Planner",
            url: `${SITE_URL}/en/planner`,
            applicationCategory: "TravelApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: DESCRIPTION,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/en` },
              { "@type": "ListItem", position: 2, name: "Travel Planner", item: `${SITE_URL}/en/planner` },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <Link href="/en">{gt(BRAND, "en")}</Link> <span aria-hidden>›</span> <span className="text-ink">Travel Planner</span>
      </nav>

      <header className="mt-3">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-honey-soft px-3 py-1 text-[12px] font-extrabold text-honey-strong">
          <Sparkles size={13} aria-hidden />
          Free · No sign-up
        </p>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">Seoul Subway Travel Planner</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Pick your stations, your hours and what you&apos;re into. Get a timed subway tour with lockers, restrooms, exits, Olive
          Young, Daiso, cafés and pop-ups along the way.
        </p>
      </header>

      <Link
        href="/en/map"
        className="group mt-5 flex items-center gap-4 overflow-hidden rounded-3xl border border-line bg-surface p-4 transition hover:border-honey/50"
      >
        <span aria-hidden className="relative flex h-14 w-20 shrink-0 flex-col justify-center gap-[5px] overflow-hidden rounded-2xl bg-surface-muted px-2">
          {STRIP.map((color, index) => (
            <span key={color} className="block h-[4px] rounded-full" style={{ backgroundColor: color, marginLeft: index * 5, marginRight: (4 - index) * 4 }} />
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[15px] font-extrabold text-ink">
            <MapIcon size={16} aria-hidden className="text-honey-strong" />
            Subway map guide
          </span>
          <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">
            Not sure which stations? Browse the full Seoul subway map, or tap “Pick on the subway map” in Step 1.
          </span>
        </span>
        <ArrowRight size={18} aria-hidden className="shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
      </Link>

      <div className="mt-6">
        <StepTracker done={[]} current={[1]} />
      </div>

      <section aria-labelledby="step-1-title" className="mt-6 rounded-3xl border border-line bg-surface p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)] sm:p-6">
        <StepHeader step={1} id="step-1-title" title="Setup">
          Stations, travel hours, categories and quick tags. Route options and your itinerary come next.
        </StepHeader>
        <div className="mt-5">
          <PlannerForm
            stations={plannerStations()}
            initial={{ from: "", to: "", categories: DEFAULT_CATEGORIES, tags: [], start: DEFAULT_START, end: DEFAULT_END }}
          />
        </div>
      </section>

      <SavedTourList />

      <section aria-labelledby="planner-popular" className="mt-8">
        <h2 id="planner-popular" className="text-[18px] font-extrabold tracking-tight text-ink">
          Popular subway tours
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {pairs.map(({ href, summary, tags }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition hover:border-honey/40 active:scale-[0.98]"
              >
                <span aria-hidden className="flex w-1.5 shrink-0 flex-col self-stretch overflow-hidden rounded-full">
                  {summary.colors.map((color) => (
                    <span key={color} className="block flex-1" style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-[15px] font-extrabold text-ink">
                    {summary.from} → {summary.to}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {summary.minutes} min · {summary.lines.join(" + ")}
                    {summary.via.length ? ` · change at ${summary.via.join(", ")}` : ""}
                  </span>
                  {tags.length ? (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-honey-soft px-1.5 py-0.5 text-[11px] font-bold text-honey-strong">
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <ArrowRight size={16} aria-hidden className="shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="planner-how" className="mt-8">
        <h2 id="planner-how" className="text-[18px] font-extrabold tracking-tight text-ink">
          What you get
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FEATURES.map(([FeatureIcon, title, body]) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface text-honey-strong ring-1 ring-inset ring-honey/15">
                <FeatureIcon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-extrabold text-ink">{title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <AppPromo locale="en" />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">
        Ride times are typical daytime estimates and leave out the wait for your first train. Spots are hand-picked and quick tags
        open live Google Maps searches; check opening hours before you go.
      </p>
    </>
  );
}
