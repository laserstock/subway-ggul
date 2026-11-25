import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { ALL_LINES, GUIDE_STATIONS, lineSlug } from "./_lib/guide";
import { GUIDE_ARTICLES } from "./_lib/guideArticles";
import { GUIDE_LOCALES } from "./_lib/guideLocale";
import { LEGAL_UPDATED } from "./_lib/legal";
import { stationSitemapPriority } from "./_lib/seoHubs";
import { GUIDE_UPDATED, guideLanguagePaths, SITE_URL } from "./_lib/site";
import { TRUST_UPDATED } from "./_lib/trustPages";

function absolute(languages: Record<string, string>) {
  return Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));
}

/** Every guide page in every language, each listing its translations (hreflang). */
function guideEntries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = absolute(guideLanguagePaths(path));
  return GUIDE_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: GUIDE_UPDATED,
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  }));
}

/**
 * Built once and kept for 30 days. Planner `/route?from=&to=` URLs are omitted on purpose: those pages
 * take searchParams and materialize ISR entries on first crawl, which burned Hobby-plan ISR Reads.
 * Every guide URL is listed with its full hreflang set, so `/ko`, `/en`, `/ja`, `/zh` and `/zh-tw` are
 * separate documents rather than translations Google has to guess at.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");
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
    ...GUIDE_STATIONS.flatMap((station) =>
      guideEntries(`/stations/${station.slug}`, stationSitemapPriority(station.slug)),
    ),
    // NOTE: the language-neutral app screens (`/station/myeongdong`, …) are intentionally left out.
    // Each one canonicalizes to `/en/stations/{slug}`, and a sitemap must list canonical URLs only;
    // listing both is what made Google treat them as competing duplicates of the English guide.
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
    // Feature landing screens (still may carry noindex; listed for discovery of deep links)
    ...["/urgent", "/luggage", "/transfer", "/meet"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: GUIDE_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
