import type { MetadataRoute } from "next";
import { ALL_LINES, GUIDE_STATIONS, lineSlug } from "./_lib/guide";
import { GUIDE_ARTICLES } from "./_lib/guideArticles";
import { GUIDE_LOCALES } from "./_lib/guideLocale";
import { LEGAL_UPDATED } from "./_lib/legal";
import { plannerPairs } from "./_lib/planner";
import { GUIDE_UPDATED, guideLanguages, SITE_URL } from "./_lib/site";

function absolute(languages: Record<string, string>) {
  return Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));
}

/** Every guide page in every language, each listing its translations (hreflang). */
function guideEntries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = absolute(guideLanguages(path));
  return GUIDE_LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: GUIDE_UPDATED,
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  }));
}

/** Next writes sitemap URLs into the XML as-is, so the query's & must be escaped here. */
const escapeXml = (url: string) => url.replace(/&/g, "&amp;");

function plannerRouteEntries(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(Object.entries(absolute(guideLanguages(path))).map(([lang, url]) => [lang, escapeXml(url)]));
  return GUIDE_LOCALES.map((locale) => ({
    url: escapeXml(`${SITE_URL}/${locale}${path}`),
    lastModified: GUIDE_UPDATED,
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...GUIDE_STATIONS.flatMap((station) => guideEntries(`/stations/${station.slug}`, 0.7)),
    ...guideEntries("/planner", 0.8),
    ...plannerPairs("en").flatMap((pair) => plannerRouteEntries(`/planner/route?from=${pair.from}&to=${pair.to}`)),
    ...["/privacy", "/terms", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
