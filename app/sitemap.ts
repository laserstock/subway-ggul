import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { ALL_LINES, lineSlug } from "./_lib/guide";
import { GUIDE_ARTICLES } from "./_lib/guideArticles";
import { GUIDE_HREFLANGS } from "./_lib/guideLocale";
import { LEGAL_UPDATED } from "./_lib/legal";
import { stationSitemapPriority } from "./_lib/seoHubs";
import { GUIDE_UPDATED, SITE_URL } from "./_lib/site";
import { SITEMAP_LOCALES, sitemapCoreStations } from "./_lib/sitemapStations";
import { TRUST_UPDATED } from "./_lib/trustPages";

function absolute(languages: Record<string, string>) {
  return Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));
}

/** Hreflang set limited to the four sitemap locales (ko/en/ja/zh). */
function sitemapLanguagePaths(path: string) {
  return {
    ...Object.fromEntries(
      SITEMAP_LOCALES.flatMap((code) => GUIDE_HREFLANGS[code].map((hreflang) => [hreflang, `/${code}${path}`])),
    ),
    "x-default": `/en${path}`,
  };
}

/** One sitemap row per sitemap locale for a guide path — no legacy `/station/…` URLs. */
function guideEntries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = absolute(sitemapLanguagePaths(path));
  return SITEMAP_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: GUIDE_UPDATED,
    changeFrequency: "monthly" as const,
    priority,
    alternates: { languages },
  }));
}

/**
 * Built once and kept for 30 days.
 * Station URLs: ~580 core stations × 4 locales ≈ 2,320 — excludes thin outer stops,
 * `/zh-tw` sitemap rows, and legacy singular `/station/[slug]` paths.
 * Planner `/route?from=&to=` URLs stay omitted (ISR cost).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
  const coreStations = sitemapCoreStations();
  return [
    {
      url: SITE_URL,
      lastModified: GUIDE_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...guideEntries("", 0.9),
    ...guideEntries("/map", 0.9),
    ...guideEntries("/guides", 0.8),
    ...GUIDE_ARTICLES.flatMap((article) => guideEntries(`/guides/${article.slug}`, 0.8)),
    ...guideEntries("/stations", 0.8),
    ...ALL_LINES.flatMap((line) => guideEntries(`/lines/${lineSlug(line)}`, 0.8)),
    ...coreStations.flatMap((station) =>
      guideEntries(`/stations/${station.slug}`, stationSitemapPriority(station.slug)),
    ),
    ...guideEntries("/planner", 0.8),
    ...["/about", "/editorial-policy"].flatMap((path) =>
      guideEntries(path, 0.5).map((entry) => ({ ...entry, lastModified: TRUST_UPDATED, changeFrequency: "yearly" as const })),
    ),
    ...["/privacy", "/terms", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    // Feature landings for internal-link discovery (may remain noindex on the page itself).
    ...["/urgent", "/luggage", "/transfer", "/meet"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: GUIDE_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
