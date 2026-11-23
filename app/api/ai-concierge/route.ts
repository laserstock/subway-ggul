import { cookies } from "next/headers";
import {
  buildStationContext,
  conciergeCacheKey,
  normalizeConciergeQuery,
  type ConciergeLocale,
} from "../../_lib/aiConciergeContext";
import { getAdminSupabase } from "../../_lib/db/admin";

const DAILY_LIMIT = 5;
const CACHE_HOURS = 24;
const QUOTA_COOKIE = "ksub-ai-quota";
/** Prefer lite for latency; fall back if a model is retired or overloaded. */
const MODELS = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-3.8-flash"] as const;
const MODEL = MODELS[0];

type Card = {
  station: string;
  toilet?: string;
  elevator?: string;
  transferCar?: string;
  tip?: string;
};

type ConciergePayload = {
  answer: string;
  cards: Card[];
  stations: string[];
  cached: boolean;
  remaining: number;
};

type Body = {
  query?: string;
  locale?: string;
};

function isLocale(value: unknown): value is ConciergeLocale {
  return value === "ko" || value === "en" || value === "zh" || value === "ja";
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", dateStyle: "short" }).format(new Date());
}

function readQuota(raw: string | undefined): { day: string; count: number } {
  const day = todayKey();
  if (!raw) return { day, count: 0 };
  const [savedDay, countRaw] = raw.split(":");
  if (savedDay !== day) return { day, count: 0 };
  const count = Number(countRaw);
  return { day, count: Number.isFinite(count) ? count : 0 };
}

function localeLabel(locale: ConciergeLocale) {
  return locale === "zh" ? "Traditional Chinese (Taiwan)" : locale === "ja" ? "Japanese" : locale === "en" ? "English" : "Korean";
}

async function readCache(cacheKey: string, locale: ConciergeLocale) {
  const db = getAdminSupabase();
  if (!db) return null;
  try {
    const { data } = await db
      .from("ai_response_cache")
      .select("response, expires_at")
      .eq("cache_key", cacheKey)
      .eq("locale", locale === "zh" ? "zh-tw" : locale)
      .maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
    const response = data.response as ConciergePayload | { answer?: string; cards?: Card[] };
    if (!response || typeof response !== "object" || !("answer" in response)) return null;
    void db.rpc("touch_ai_cache_hit", { p_cache_key: cacheKey, p_locale: locale === "zh" ? "zh-tw" : locale });
    return response as Pick<ConciergePayload, "answer" | "cards" | "stations">;
  } catch {
    return null;
  }
}

async function writeCache(
  cacheKey: string,
  locale: ConciergeLocale,
  payload: Pick<ConciergePayload, "answer" | "cards" | "stations">,
  model: string,
) {
  const db = getAdminSupabase();
  if (!db) return;
  const expires = new Date(Date.now() + CACHE_HOURS * 60 * 60_000).toISOString();
  try {
    await db.from("ai_response_cache").upsert(
      {
        cache_key: cacheKey,
        locale: locale === "zh" ? "zh-tw" : locale,
        response: payload,
        expires_at: expires,
        data_source: "gemini",
        metadata: { model },
      },
      { onConflict: "cache_key,locale" },
    );
  } catch {
    // cache is best-effort
  }
}

async function callGeminiOnce(
  model: (typeof MODELS)[number],
  query: string,
  locale: ConciergeLocale,
  context: string,
) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("gemini_unconfigured");

  const system = `You are K-SUB (지하철꿀정보) AI concierge for Seoul Metro travelers.
Answer ONLY in ${localeLabel(locale)}.
Use the VERIFIED FACTS below. Never invent toilet gate sides, exit numbers, elevator exits, or transfer car-doors that are not in the facts.
If facts are missing, say what is unknown and give cautious general advice.
Keep answers short and actionable. Prefer bullet steps.
Also return a JSON object (and nothing else outside the JSON) with shape:
{"answer":"markdown-ish short reply","cards":[{"station":"…","toilet":"…","elevator":"…","transferCar":"…","tip":"…"}],"stations":["…"]}
Cards should be one per mentioned station when possible.

VERIFIED FACTS:
${context}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.3,
    maxOutputTokens: 1024,
    responseMimeType: "application/json",
  };
  // Only the heavy 3.8 model needs an explicit low thinking level.
  if (model === "gemini-3.8-flash") {
    generationConfig.thinkingConfig = { thinkingLevel: "low" };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: query }] }],
      generationConfig,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`gemini_${response.status}:${body.slice(0, 200)}`);
  }
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("gemini_empty");
  const parsed = JSON.parse(text) as { answer?: string; cards?: Card[]; stations?: string[] };
  return {
    answer: parsed.answer?.trim() || text.trim(),
    cards: Array.isArray(parsed.cards) ? parsed.cards.slice(0, 6) : [],
    stations: Array.isArray(parsed.stations) ? parsed.stations.slice(0, 6) : [],
    model,
  };
}

async function callGemini(query: string, locale: ConciergeLocale, context: string) {
  let lastError: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callGeminiOnce(model, query, locale, context);
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        const retryable = /gemini_503|gemini_429|gemini_empty/.test(message);
        if (!retryable) break;
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("gemini_failed");
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || query.length > 400) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const locale: ConciergeLocale = isLocale(body.locale) ? body.locale : "ko";

  const jar = await cookies();
  const quota = readQuota(jar.get(QUOTA_COOKIE)?.value);
  if (quota.count >= DAILY_LIMIT) {
    return Response.json(
      {
        error: "rate_limited",
        remaining: 0,
        message:
          locale === "en"
            ? "Daily AI limit reached (5/day). Try again tomorrow."
            : locale === "ja"
              ? "本日のAI利用上限（5回）に達しました。明日またお試しください。"
              : locale === "zh"
                ? "今日 AI 次數已用完（每天 5 次）。請明天再試。"
                : "오늘 AI 이용 횟수(5회)를 모두 썼어요. 내일 다시 시도해 주세요.",
      },
      { status: 429 },
    );
  }

  const cacheKey = conciergeCacheKey(query, locale);
  const cached = await readCache(cacheKey, locale);
  if (cached?.answer) {
    const remaining = Math.max(0, DAILY_LIMIT - quota.count);
    return Response.json({
      answer: cached.answer,
      cards: cached.cards ?? [],
      stations: cached.stations ?? [],
      cached: true,
      remaining,
    } satisfies ConciergePayload);
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "gemini_unconfigured" }, { status: 503 });
  }

  try {
    const { stations, context } = await buildStationContext(query);
    const result = await callGemini(query, locale, context);
    const payload = {
      answer: result.answer,
      cards: result.cards,
      stations: result.stations.length ? result.stations : stations,
    };
    await writeCache(cacheKey, locale, payload, result.model);

    const nextCount = quota.count + 1;
    jar.set(QUOTA_COOKIE, `${quota.day}:${nextCount}`, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 36,
    });

    return Response.json({
      ...payload,
      cached: false,
      remaining: Math.max(0, DAILY_LIMIT - nextCount),
      model: result.model,
    });
  } catch (err) {
    console.error("[ai-concierge]", err);
    return Response.json({ error: "upstream_failed" }, { status: 502 });
  }
}

export async function GET() {
  return Response.json({
    model: MODEL,
    dailyLimit: DAILY_LIMIT,
    cacheHours: CACHE_HOURS,
    normalize: normalizeConciergeQuery("demo"),
  });
}
