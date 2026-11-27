import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_URL } from "./_lib/site";

/** Answer engines and AI assistants; most of K-SUB's non-Google arrivals come from these. */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

/**
 * Allow all crawlers on public HTML. Block only API/admin.
 * Clean `/station/[slug]` paths and multilingual `/…/stations/` guides stay crawlable, and the AI answer
 * engines are listed explicitly so a future wildcard change cannot quietly shut them out — ChatGPT and Bing
 * already bring most of the site's non-Google arrivals, according to its own GA4 reports.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  "use cache";
  cacheLife("max");
  const block = ["/api/", "/admin/"];
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: block,
      },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: block })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
