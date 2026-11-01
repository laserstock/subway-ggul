import { ImageResponse } from "next/og";
import { guideDetail, guideStation, localLine, stationLineColor } from "../../../../_lib/guide";
import { stationTitle } from "../../../../_lib/guideCopy";

/** 1200×630 share card for a station guide. English only: the default OG font has no Hangul or CJK glyphs. */
export async function GET(_request: Request, ctx: RouteContext<"/api/og/station/[slug]">) {
  const { slug } = await ctx.params;
  const station = guideStation(slug);
  if (!station) return new Response("Not found", { status: 404 });
  const detail = guideDetail(station);
  const count = (n: number, noun: string) => (n ? `${n} ${noun}${n === 1 ? "" : "s"}` : null);
  const facts = [
    count(detail.exits.length, "exit"),
    count(detail.toilets.length, "restroom"),
    count(detail.lockers.length, "locker spot"),
    detail.elevators.length ? "Elevator route" : null,
  ].filter((fact): fact is string => fact !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #fff8e1 0%, #ffe39a 100%)",
          color: "#2b1d05",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 800, color: "#b77900" }}>
          K-SUB · Seoul Subway Guide
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>
            {stationTitle(station, "en")}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            {station.lines.slice(0, 5).map((line) => (
              <div
                key={line}
                style={{
                  display: "flex",
                  padding: "8px 22px",
                  borderRadius: 999,
                  background: stationLineColor(line),
                  color: "white",
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {localLine(line, "en")}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 32, fontWeight: 700 }}>
          {(facts.length ? facts : ["Exits", "Restrooms", "Lockers", "Transfers"]).map((fact) => (
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
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000" },
    },
  );
}
