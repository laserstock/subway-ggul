import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_URL } from "./_lib/site";

/**
 * Guide pages under /ko, /en, /ja, /zh and /zh-tw stay crawlable. App screens (/station, /route, …)
 * are not Disallow'd so Google can still read their noindex tags; /me and /my are account-only.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  "use cache";
  cacheLife("max");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/me", "/my"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
