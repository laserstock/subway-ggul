import { GUIDE_STATIONS, guideDetail, type GuideStation } from "./guide";
import { SEO_PRIORITY_SLUGS } from "./seoHubs";
import { STATION_LOCAL_GUIDES } from "./stationLocalGuides";

/**
 * Locales listed in sitemap for station/line guide URLs.
 * Keeps the indexable set near ~2,000–2,400 station URLs (core × 4).
 * `/zh-tw` pages still exist and stay in on-page hreflang.
 */
export const SITEMAP_LOCALES = ["ko", "en", "ja", "zh"] as const;
export type SitemapLocale = (typeof SITEMAP_LOCALES)[number];

/** Target ~580 core stations → ~2,320 multilingual station URLs. */
export const SITEMAP_STATION_CAP = 580;

function stationScore(station: GuideStation) {
  const detail = guideDetail(station);
  let score = 0;
  if (SEO_PRIORITY_SLUGS.has(station.slug)) score += 100;
  if (STATION_LOCAL_GUIDES[station.ko]) score += 40;
  if (station.lines.length > 1) score += 30;
  score += Math.min(detail.toilets.length, 3) * 8;
  score += Math.min(detail.lockers.length, 3) * 8;
  score += Math.min(detail.elevators.length, 3) * 8;
  score += Math.min(detail.exits.length, 8) * 2;
  score += Math.min(detail.transfers.length, 4) * 5;
  // Prefer Seoul-core geography over far outer terminals.
  const dist = Math.hypot(station.lat - 37.55, station.lng - 126.99);
  score += Math.max(0, 20 - dist * 40);
  return score;
}

let cached: GuideStation[] | null = null;

/**
 * Capitals of the crawlable station set: priority hubs + facility-rich / transfer /
 * locally-guided stops, ranked and capped so the sitemap stays in the 2k–2.4k band.
 */
export function sitemapCoreStations(): GuideStation[] {
  if (cached) return cached;
  const ranked = [...GUIDE_STATIONS].sort((a, b) => {
    const diff = stationScore(b) - stationScore(a);
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  });
  cached = ranked.slice(0, SITEMAP_STATION_CAP);
  return cached;
}

export function isSitemapCoreStation(slug: string) {
  return sitemapCoreStations().some((station) => station.slug === slug);
}
