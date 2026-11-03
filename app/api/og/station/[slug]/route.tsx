import { ImageResponse } from "next/og";
import { guideDetail, guideStation, localLine, stationLineColor } from "../../../../_lib/guide";
import { stationTitle, tc } from "../../../../_lib/guideCopy";
import { isLocale, type Locale } from "../../../../_lib/i18n";

/** The default OG font has no Hangul or CJK glyphs, so those cards load a Noto subset with just their text. */
const FONT_FAMILY: Record<Exclude<Locale, "en">, string> = {
  ko: "Noto Sans KR",
  zh: "Noto Sans SC",
  ja: "Noto Sans JP",
};

const FACTS: Record<Locale, (exits: number, toilets: number, lockers: number, elevator: boolean) => string[]> = {
  en: (exits, toilets, lockers, elevator) => {
    const count = (n: number, noun: string) => (n ? [`${n} ${noun}${n === 1 ? "" : "s"}`] : []);
    const facts = [
      ...count(exits, "exit"),
      ...count(toilets, "restroom"),
      ...count(lockers, "locker spot"),
      ...(elevator ? ["Elevator route"] : []),
    ];
    return facts.length ? facts : ["Exits", "Restrooms", "Lockers", "Transfers"];
  },
  ko: (exits, toilets, lockers, elevator) => {
    const facts = [
      ...(exits ? [`출구 ${exits}개`] : []),
      ...(toilets ? [`화장실 ${toilets}곳`] : []),
      ...(lockers ? [`물품보관함 ${lockers}곳`] : []),
      ...(elevator ? ["엘리베이터 동선"] : []),
    ];
    return facts.length ? facts : ["출구", "화장실", "물품보관함", "환승"];
  },
  zh: (exits, toilets, lockers, elevator) => {
    const facts = [
      ...(exits ? [`${exits}个出口`] : []),
      ...(toilets ? [`${toilets}处洗手间`] : []),
      ...(lockers ? [`${lockers}处储物柜`] : []),
      ...(elevator ? ["电梯路线"] : []),
    ];
    return facts.length ? facts : ["出口", "洗手间", "储物柜", "换乘"];
  },
  ja: (exits, toilets, lockers, elevator) => {
    const facts = [
      ...(exits ? [`出口${exits}か所`] : []),
      ...(toilets ? [`トイレ${toilets}か所`] : []),
      ...(lockers ? [`ロッカー${lockers}か所`] : []),
      ...(elevator ? ["エレベーター動線"] : []),
    ];
    return facts.length ? facts : ["出口", "トイレ", "ロッカー", "乗り換え"];
  },
};

async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const query = `family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`).then((res) => (res.ok ? res.text() : ""));
    const src = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!src) return null;
    const font = await fetch(src);
    return font.ok ? font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** 1200×630 share card for a station guide: "<Station> Exit & Locker Guide | K-SUB" in the page's language (?lang=). */
export async function GET(request: Request, ctx: RouteContext<"/api/og/station/[slug]">) {
  const { slug } = await ctx.params;
  const station = guideStation(slug);
  if (!station) return new Response("Not found", { status: 404 });
  const requested = new URL(request.url).searchParams.get("lang");
  const detail = guideDetail(station);

  const card = (locale: Locale) => {
    const title = stationTitle(station, locale);
    const lines = station.lines.slice(0, 5).map((line) => ({ line, name: localLine(line, locale) }));
    const facts = FACTS[locale](
      detail.exits.length,
      detail.toilets.length,
      detail.lockers.length,
      detail.elevators.length > 0,
    );
    return { title, lines, facts, guide: `${tc("ogGuide", locale)} | K-SUB` };
  };

  let locale: Locale = isLocale(requested) ? requested : "en";
  let content = card(locale);
  let fonts: { name: string; data: ArrayBuffer; weight: 700 | 900; style: "normal" }[] | undefined;
  if (locale !== "en") {
    const family = FONT_FAMILY[locale];
    const text = ["K-SUB · Seoul Subway Guide", content.title, content.guide, ...content.facts, ...content.lines.map((l) => l.name)].join("");
    const [bold, black] = await Promise.all([googleFont(family, 700, text), googleFont(family, 900, text)]);
    if (bold && black) {
      fonts = [
        { name: family, data: bold, weight: 700, style: "normal" },
        { name: family, data: black, weight: 900, style: "normal" },
      ];
    } else {
      locale = "en";
      content = card(locale);
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: "linear-gradient(135deg, #fff8e1 0%, #ffe39a 100%)",
          color: "#2b1d05",
          ...(fonts ? { fontFamily: fonts[0].name } : {}),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700, color: "#b77900" }}>
          K-SUB · Seoul Subway Guide
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>{content.title}</div>
          <div style={{ marginTop: 14, fontSize: 50, fontWeight: 900, color: "#8a5a00", letterSpacing: -1 }}>
            {content.guide}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            {content.lines.map(({ line, name }) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  padding: "8px 22px",
                  borderRadius: 999,
                  background: stationLineColor(line),
                  color: "white",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 30, fontWeight: 700 }}>
          {content.facts.map((fact) => (
            <div
              key={fact}
              style={{ display: "flex", padding: "10px 24px", borderRadius: 18, background: "rgba(255,255,255,0.8)" }}
            >
              {fact}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" },
    },
  );
}
