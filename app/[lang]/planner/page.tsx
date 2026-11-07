import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BRAND, gt } from "../../_lib/guideCopy";
import { plannerPairs, plannerStations } from "../../_lib/planner";
import { DEFAULT_CATEGORIES, DEFAULT_END, DEFAULT_START } from "../../_lib/plannerParams";
import { SITE_URL } from "../../_lib/site";
import { Icon, IconTile, type IconName } from "../_guide/icons";
import { AppPromo, JsonLd } from "../_guide/parts";
import { PlannerForm } from "./PlannerFormModal";

const TITLE = "Seoul Subway Itinerary Planner: Day Plans by Station | K-SUB";
const DESCRIPTION =
  "Pick a departure and arrival station, your hours and what you love. Get the fastest or fewest-transfer subway route with lockers, elevator exits, lunch, cafés and shopping near each exit.";

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

const STEPS: [IconName, string, string][] = [
  ["route", "Two routes", "Compare the shortest ride with the one that has the fewest transfers."],
  ["luggage", "Bags sorted", "Lockers and the street-to-platform elevator at your starting station."],
  ["pin", "Exit by exit", "Every spot comes with its exit number, walking time and a Google Maps link."],
  ["car", "Show to a local", "One tap puts your destination in big Korean text for a taxi driver or passer-by."],
];

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
            name: "K-SUB Seoul Subway Itinerary Planner",
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
              { "@type": "ListItem", position: 2, name: "Itinerary Planner", item: `${SITE_URL}/en/planner` },
            ],
          },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <Link href="/en">{gt(BRAND, "en")}</Link> <span aria-hidden>›</span> <span className="text-ink">Itinerary Planner</span>
      </nav>

      <header className="mt-3">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-honey-soft px-3 py-1 text-[12px] font-extrabold text-honey-strong">
          <Icon name="route" size={14} />
          Free · No sign-up
        </p>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink">Seoul Subway Itinerary Planner</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Tell us where you start, where you want to go and how long you have. You get a timed day plan on the Seoul subway with
          lockers, elevator exits, lunch, cafés and shopping, exit by exit.
        </p>
      </header>

      <section aria-label="Plan your day" className="mt-5 rounded-3xl border border-line bg-surface p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)] sm:p-5">
        <PlannerForm
          stations={plannerStations()}
          initial={{ from: "", to: "", categories: DEFAULT_CATEGORIES, start: DEFAULT_START, end: DEFAULT_END }}
        />
      </section>

      <section aria-labelledby="planner-popular" className="mt-8">
        <h2 id="planner-popular" className="text-[18px] font-extrabold tracking-tight text-ink">
          Popular subway day plans
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {pairs.map(({ href, summary }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition hover:border-honey/40 active:scale-[0.98]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-[15px] font-extrabold text-ink">
                    {summary.from} → {summary.to}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {summary.minutes} min · {summary.lines.join(" + ")}
                    {summary.via.length ? ` · change at ${summary.via.join(", ")}` : ""}
                  </span>
                </span>
                <Icon name="arrow" size={16} className="text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
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
          {STEPS.map(([icon, title, body]) => (
            <li key={title} className="flex items-start gap-3 rounded-2xl bg-surface-muted px-4 py-3">
              <IconTile name={icon} size="sm" onSurface />
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
        Ride times are typical daytime estimates and leave out the wait for your first train. Spots are hand-picked; check opening
        hours on Google Maps before you go.
      </p>
    </>
  );
}
