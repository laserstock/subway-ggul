import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_URL } from "./_lib/site";

/**
 * Allow all crawlers on public HTML. Block only API/admin.
 * Clean `/station/[slug]` paths and multilingual `/…/stations/` guides stay crawlable.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  "use cache";
  cacheLife("max");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
