import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { SITE_URL } from "./_lib/site";

/**
 * Public HTML (including `/[lang]/stations/*` and `/[lang]/lines/*`) is crawlable.
 * `/api/` is blocked on purpose — GSC “Blocked by robots.txt” rows for `/api/og/station/…`
 * are OG image endpoints, not station guides. `/admin/` stays private.
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
          "/ko/",
          "/en/",
          "/ja/",
          "/zh/",
          "/zh-tw/",
          "/*/stations/",
          "/*/stations/*",
          "/*/lines/",
          "/*/lines/*",
        ],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
