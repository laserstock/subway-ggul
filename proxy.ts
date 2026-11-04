import { NextResponse, type NextRequest } from "next/server";
import { contentLocale, type GuideLocale } from "./app/_lib/guideLocale";
import { isLocale, LOCALE_COOKIE } from "./app/_lib/i18n";
import { localePath } from "./app/_lib/site";

const BOT_AGENT = /bot|crawl|spider|slurp|lighthouse|headless/i;
/** Android WebViews: the Play app loads the site and must stay on the app home. */
const WEBVIEW_AGENT = /; wv\)/;
/** Taiwan, Hong Kong, Macau or an explicit Traditional script. */
const TRADITIONAL_CHINESE = /^zh-(tw|hk|mo|hant)\b/;
/** Only the public domain sends visitors to the guide; the app's own host always serves the app home. */
const GUIDE_HOST = /(^|\.)k-sub\.com$/;
/** Set for the browser session once a visitor opens the web app (`/?lang=…`), so `/` stays the app for them. */
const WEB_APP_COOKIE = "ksub-webapp";

/** The visitor's top Accept-Language entry; anything other than Korean, Japanese or Chinese gets English. */
function preferredLocale(acceptLanguage: string): GuideLocale {
  const [top] = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().toLowerCase().split(";");
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      return { tag, base: tag.split("-")[0], q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.base && entry.base !== "*" && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  const base = top?.base;
  if (base === "zh") return TRADITIONAL_CHINESE.test(top.tag) ? "zh-tw" : "zh";
  return base === "ko" || base === "ja" ? base : "en";
}

function sameSite(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Arriving at www.k-sub.com from outside (search result, typed address, bookmark): visitors whose browser
 * isn't Korean go to the guide home in their saved language, else their browser's. Korean browsers, anyone
 * who chose Korean, the app's own host, crawlers, client navigations, links from inside the site and anyone
 * who has opened the web app this session keep `/` as the app home.
 */
export function proxy(request: NextRequest) {
  const agent = request.headers.get("user-agent") ?? "";
  const { searchParams } = request.nextUrl;

  if (searchParams.has("lang")) {
    const response = NextResponse.next();
    response.cookies.set(WEB_APP_COOKIE, "1", { path: "/", sameSite: "lax" });
    return response;
  }
  if (
    request.method !== "GET" ||
    !GUIDE_HOST.test((request.headers.get("host") ?? "").split(":")[0]) ||
    request.headers.get("sec-fetch-mode") !== "navigate" ||
    request.cookies.has(WEB_APP_COOKIE) ||
    sameSite(request) ||
    BOT_AGENT.test(agent) ||
    WEBVIEW_AGENT.test(agent)
  ) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return NextResponse.next();
  const detected = preferredLocale(acceptLanguage);
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (detected === "ko" || saved === "ko") return NextResponse.next();
  const locale: GuideLocale = isLocale(saved) ? (saved === "zh" && detected === "zh-tw" ? "zh-tw" : saved) : detected;

  const url = request.nextUrl.clone();
  url.pathname = localePath(locale, "");
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language, Cookie");
  if (!saved) response.cookies.set(LOCALE_COOKIE, contentLocale(locale), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: "/",
};
