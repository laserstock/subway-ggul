import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_URL } from "./_lib/site";

/**
 * Guide station URLs under /{lang}/stations/* must stay crawlable.
 * Only block machine/API surfaces — account screens use noindex instead of Disallow
 * so Google can still read their robots meta.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  "use cache";
  cacheLife("max");
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/ko/stations/",
          "/en/stations/",
          "/ja/stations/",
          "/zh/stations/",
          "/zh-tw/stations/",
        ],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
