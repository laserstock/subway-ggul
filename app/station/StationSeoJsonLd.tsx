import type { GuideDetail, GuideStation } from "../_lib/guide";
import { exitName, listJoin, lockerSpot, minutes, quickestTransfer } from "../_lib/guideCopy";
import { t } from "../_lib/i18n";
import { stationSpotsFor } from "../_lib/planner";
import { SITE_BRAND_DISPLAY, SITE_URL } from "../_lib/site";

/**
 * Structured data only for `/station/[slug]` — no visible HTML chrome.
 * Facility facts that used to live in the English SEO panel now ship as JSON-LD
 * so Google can index them without pushing the app dashboard down.
 */
export default function StationSeoJsonLd({
  station,
  detail,
}: {
  station: GuideStation;
  detail: GuideDetail;
}) {
  const enName = station.name.en.replace(/\s+station$/i, "");
  const title = `${enName} Station`;
  const url = `${SITE_URL}/station/${station.slug}`;
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const elevators = [
    ...new Set(detail.elevators.map((row) => exitName(t(row.exit, "en"), "en"))),
  ];
  const lockerBanks = detail.lockers.length;
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const lockerPlaces = [...new Set(detail.lockers.map((row) => lockerSpot(row, "en")))].slice(0, 3);
  const spots = stationSpotsFor(station, detail, "en").slice(0, 4);
  const quickest = quickestTransfer(detail);

  const toiletSummary =
    detail.toilets.length === 0
      ? "Restroom locations not verified yet — check signs at the ticket gates."
      : inside && outside
        ? `${detail.toilets.length} restrooms listed (${inside} inside ticket gates, ${outside} outside).`
        : inside
          ? `${detail.toilets.length} restrooms listed inside the ticket gates.`
          : `${detail.toilets.length} restrooms listed outside the ticket gates.`;
  const elevatorSummary = elevators.length
    ? `Elevator exits: ${listJoin(elevators, "en")}.`
    : "Elevator exits not verified yet — follow elevator pictograms on exit boards.";
  const lockerSummary = lockerBanks
    ? `${lockerBanks} T-Locker bank${lockerBanks === 1 ? "" : "s"}${lockerSlots ? ` (~${lockerSlots} lockers)` : ""}${
        lockerPlaces.length ? ` at ${listJoin(lockerPlaces, "en")}` : ""
      }.`
    : detail.luggageDesk
      ? `Staffed luggage desk: ${t(detail.luggageDesk, "en")}.`
      : "No T-Locker banks listed yet.";
  const nearby = spots.length
    ? spots.map((spot) => `${spot.name}${spot.exit ? ` (Exit ${spot.exit})` : ""}`).join("; ")
    : "";
  const transferNote = quickest
    ? `Fastest verified transfer walk: about ${minutes(quickest.seconds!)} min (${quickest.alight.replace("-", " car · door ")}).`
    : "";

  const description = [
    `Seoul Subway facility guide for ${title} (${station.lines.join(" · ")}).`,
    toiletSummary,
    elevatorSummary,
    lockerSummary,
    nearby ? `Nearby: ${nearby}.` : "",
    transferNote,
    `Official site: ${SITE_URL.replace(/^https?:\/\//, "")}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const faq = [
    {
      "@type": "Question",
      name: `Where are the restrooms at ${title}?`,
      acceptedAnswer: { "@type": "Answer", text: toiletSummary },
    },
    {
      "@type": "Question",
      name: `Which exits have elevators at ${title}?`,
      acceptedAnswer: { "@type": "Answer", text: elevatorSummary },
    },
    {
      "@type": "Question",
      name: `Are there luggage lockers at ${title}?`,
      acceptedAnswer: { "@type": "Answer", text: lockerSummary },
    },
  ];

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "TrainStation",
      name: title,
      alternateName: [station.name.ko, station.name.en, station.name.zh, station.name.ja].filter(
        (name) => name && name !== title,
      ),
      description,
      url,
      geo: { "@type": "GeoCoordinates", latitude: station.lat, longitude: station.lng },
      ...(detail.address
        ? { address: { "@type": "PostalAddress", streetAddress: detail.address, addressCountry: "KR" } }
        : {}),
      isAccessibleForFree: true,
      publicAccess: true,
      provider: { "@type": "Organization", name: SITE_BRAND_DISPLAY, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${title}: Exit, Restroom & Elevator Guide`,
      description,
      url,
      isPartOf: { "@type": "WebSite", name: SITE_BRAND_DISPLAY, url: SITE_URL },
      about: { "@type": "TrainStation", name: title, url },
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq,
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
