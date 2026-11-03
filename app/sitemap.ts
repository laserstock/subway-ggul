import type { MetadataRoute } from "next";
import { ALL_LINES, GUIDE_STATIONS, lineSlug } from "./_lib/guide";
import { LOCALES } from "./_lib/i18n";
import { LEGAL_UPDATED } from "./_lib/legal";
import { GUIDE_UPDATED, guideLanguages, SITE_URL } from "./_lib/site";

function absolute(languages: Record<string, string>) {
  return Object.fromEntries(Object.entries(languages).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));
}

/** Every guide page in every language, each listing its translations (hreflang). */
function guideEntries(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = absolute(guideLanguages(path));
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: GUIDE_UPDATED,
    changeFrequency: "monthly",
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: GUIDE_UPDATED, changeFrequency: "weekly", priority: 1 },
    ...guideEntries("", 0.9),
    ...guideEntries("/stations", 0.8),
    ...ALL_LINES.flatMap((line) => guideEntries(`/lines/${lineSlug(line)}`, 0.8)),
    ...GUIDE_STATIONS.flatMap((station) => guideEntries(`/stations/${station.slug}`, 0.7)),
    ...["/privacy", "/terms", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
