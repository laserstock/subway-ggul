// Translates Honey Spot posts and comments for foreign visitors.
// Provider keys are server-only env vars (never NEXT_PUBLIC_): DEEPL_API_KEY, else GOOGLE_TRANSLATE_API_KEY,
// else the free MyMemory API (set MYMEMORY_EMAIL to raise its daily quota).

const TARGETS = {
  en: { deepl: "EN-US", google: "en", mymemory: "en-US" },
  zh: { deepl: "ZH-HANS", google: "zh-CN", mymemory: "zh-CN" },
  ja: { deepl: "JA", google: "ja", mymemory: "ja-JP" },
} as const;
type Target = keyof typeof TARGETS;

const MAX_TEXTS = 60;
const MAX_TEXT_CHARS = 400;
const MAX_TOTAL_CHARS = 9000;
const HANGUL = /[\uac00-\ud7a3\u3131-\u318e]/;

/** Per-instance memo so the same post isn't sent to the provider again by every reader. */
const memo = new Map<string, string>();
const MEMO_LIMIT = 3000;

function remember(key: string, value: string) {
  if (memo.size >= MEMO_LIMIT) memo.delete(memo.keys().next().value as string);
  memo.set(key, value);
}

function isTarget(value: unknown): value is Target {
  return typeof value === "string" && value in TARGETS;
}

async function deepl(texts: string[], target: Target, key: string) {
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const out: string[] = [];
  for (let start = 0; start < texts.length; start += 50) {
    const response = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texts.slice(start, start + 50), target_lang: TARGETS[target].deepl }),
    });
    if (!response.ok) throw new Error(`deepl ${response.status}`);
    const data = (await response.json()) as { translations: { text: string }[] };
    out.push(...data.translations.map((item) => item.text));
  }
  return out;
}

async function google(texts: string[], target: Target, key: string) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, target: TARGETS[target].google, format: "text" }),
  });
  if (!response.ok) throw new Error(`google ${response.status}`);
  const data = (await response.json()) as { data: { translations: { translatedText: string }[] } };
  return data.data.translations.map((item) => item.translatedText);
}

function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function mymemoryOne(text: string, target: Target) {
  // The free API needs an explicit source language; posts here are written in Korean.
  if (!HANGUL.test(text)) return text;
  const params = new URLSearchParams({ q: text, langpair: `ko|${TARGETS[target].mymemory}` });
  const email = process.env.MYMEMORY_EMAIL;
  if (email) params.set("de", email);
  const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  if (!response.ok) throw new Error(`mymemory ${response.status}`);
  const data = (await response.json()) as { responseStatus: number | string; responseData?: { translatedText?: string } };
  const translated = data.responseData?.translatedText;
  if (Number(data.responseStatus) !== 200 || !translated || translated.startsWith("MYMEMORY WARNING")) {
    throw new Error(`mymemory ${data.responseStatus}`);
  }
  return decodeEntities(translated);
}

async function mymemory(texts: string[], target: Target) {
  const out = new Array<string>(texts.length);
  let next = 0;
  async function worker() {
    while (next < texts.length) {
      const index = next++;
      out[index] = await mymemoryOne(texts[index], target);
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, texts.length) }, worker));
  return out;
}

function provide(texts: string[], target: Target) {
  const deeplKey = process.env.DEEPL_API_KEY;
  if (deeplKey) return deepl(texts, target, deeplKey);
  const googleKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (googleKey) return google(texts, target, googleKey);
  return mymemory(texts, target);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { texts?: unknown; target?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { texts, target } = body;
  if (
    !isTarget(target) ||
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.length > MAX_TEXTS ||
    !texts.every((text) => typeof text === "string" && text.length <= MAX_TEXT_CHARS) ||
    (texts as string[]).reduce((sum, text) => sum + text.length, 0) > MAX_TOTAL_CHARS
  ) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const list = texts as string[];
  const missing = [...new Set(list.filter((text) => text.trim() && !memo.has(`${target}\u0001${text}`)))];
  try {
    if (missing.length > 0) {
      const translated = await provide(missing, target);
      missing.forEach((text, index) => remember(`${target}\u0001${text}`, translated[index] ?? text));
    }
  } catch {
    return Response.json({ error: "translate_failed" }, { status: 502 });
  }
  return Response.json(
    { translations: list.map((text) => memo.get(`${target}\u0001${text}`) ?? text) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
