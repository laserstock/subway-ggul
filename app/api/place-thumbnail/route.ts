/**
 * Resolves a real store hero image from a Kakao Place detail page (`place_url`).
 * Default Kakao logos / placeholders are filtered to null so the client can show a typography card.
 */

export const runtime = "nodejs";

type CacheEntry = { image: string | null; at: number };

const MEMORY = new Map<string, CacheEntry>();
const MEMO_LIMIT = 800;
const TTL_MS = 86_400_000;
const CACHE_HEADER = "public, s-maxage=86400, stale-while-revalidate=604800";

const DEFAULT_IMAGE =
  /default|no[_-]?img|noimage|placeholder|empty[_-]?img|img[_-]?none|favicon|logo[_-]?default|place[_-]?thumb|thumb[_-]?default|kakaomap[_-]?logo|staticmap|common\/.+icon|localimages\/mobile\/(?:common|2x\/common)|t1\.daumcdn\.net\/local\/.+\/ico_/i;

function remember(key: string, image: string | null) {
  if (MEMORY.size >= MEMO_LIMIT) MEMORY.delete(MEMORY.keys().next().value as string);
  MEMORY.set(key, { image, at: Date.now() });
}

function cached(key: string): string | null | undefined {
  const hit = MEMORY.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL_MS) {
    MEMORY.delete(key);
    return undefined;
  }
  return hit.image;
}

function isUsableImage(url: string | null | undefined): url is string {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  if (DEFAULT_IMAGE.test(url)) return false;
  return true;
}

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image:secure_url["']/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /"imageUrl"\s*:\s*"([^"]+)"/i,
    /"reprImageUrl"\s*:\s*"([^"]+)"/i,
    /"mainPhotourl"\s*:\s*"([^"]+)"/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const url = decodeEntities(match[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"));
      if (isUsableImage(url)) return url;
    }
  }
  return null;
}

function normalizePlaceUrl(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!/kakao\.com$/i.test(url.hostname) && !/\.kakao\.com$/i.test(url.hostname)) return null;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchHtml(target: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(target, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveImage(placeUrl: string | null, placeName: string | null): Promise<string | null> {
  const key = placeUrl || placeName || "";
  if (!key) return null;
  const hit = cached(key);
  if (hit !== undefined) return hit;

  let image: string | null = null;
  if (placeUrl) {
    const html = await fetchHtml(placeUrl);
    if (html) image = extractOgImage(html);
  }

  // Name-only fallback: Kakao search landing rarely has a store photo — leave null for typography UI.
  remember(key, image);
  if (placeUrl && placeName && placeUrl !== placeName) remember(placeName, image);
  return image;
}

function json(image: string | null, status = 200) {
  return Response.json(
    { image },
    {
      status,
      headers: {
        "Cache-Control": CACHE_HEADER,
        "CDN-Cache-Control": CACHE_HEADER,
      },
    },
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const placeUrl = normalizePlaceUrl(params.get("place_url"));
  const placeName = params.get("place_name")?.trim() || null;

  if (!placeUrl && !placeName) return json(null, 400);

  const image = await resolveImage(placeUrl, placeName);
  return json(image);
}
