import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, type Locale } from "./app/_lib/i18n";
import { localePath } from "./app/_lib/site";

const BOT_AGENT = /bot|crawl|spider|slurp|lighthouse|headless/i;
/** Android WebViews: the Play app loads the site and must stay on the app home. */
const WEBVIEW_AGENT = /; wv\)/;

/** The visitor's top Accept-Language entry; anything other than Korean, Japanese or Chinese gets English. */
function preferredLocale(acceptLanguage: string): Locale {
  const [top] = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().toLowerCase().split(";");
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      return { base: tag.split("-")[0], q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.base && entry.base !== "*" && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  const base = top?.base;
  return base === "ko" || base === "ja" || base === "zh" ? base : "en";
}

/**
 * First visit to `/`: send the visitor to the home page in their browser's language. Only full page
 * loads are redirected (client navigations and old browsers without Sec-Fetch-Mode are left alone),
 * once; afterwards the cookie (or ?lang=) keeps `/` as the app home.
 */
export function proxy(request: NextRequest) {
  const agent = request.headers.get("user-agent") ?? "";
  const acceptLanguage = request.headers.get("accept-language");
  if (
    request.method !== "GET" ||
    request.cookies.has(LOCALE_COOKIE) ||
    request.nextUrl.searchParams.has("lang") ||
    request.headers.get("sec-fetch-mode") !== "navigate" ||
    !acceptLanguage ||
    BOT_AGENT.test(agent) ||
    WEBVIEW_AGENT.test(agent)
  ) {
    return NextResponse.next();
  }

  const locale = preferredLocale(acceptLanguage);
  const target = localePath(locale, "");
  let response: NextResponse;
  if (target === "/") {
    response = NextResponse.next();
  } else {
    const url = request.nextUrl.clone();
    url.pathname = target;
    response = NextResponse.redirect(url);
  }
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return response;
}

export const config = {
  matcher: "/",
};
