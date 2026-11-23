/**
 * Server-only: pull verified station facts for the AI concierge system prompt.
 * Prefers Supabase catalog; falls back to static TS tables when DB rows are empty.
 */

import { createHash } from "node:crypto";
import { getAdminSupabase } from "./db/admin";
import { STATION_INDEX } from "./stationIndex";
import { STATION_TOILETS } from "./stationToilets";
import { STATION_TRANSFERS } from "./stationTransfers";
import { stepFreeMapsFor } from "./stepFree";

export type ConciergeLocale = "ko" | "en" | "zh" | "ja";

export function normalizeConciergeQuery(query: string) {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.,。！？、]/g, "");
}

export function conciergeCacheKey(query: string, locale: ConciergeLocale) {
  return createHash("sha256").update(`${locale}|${normalizeConciergeQuery(query)}`).digest("hex").slice(0, 40);
}

/** Longest Korean station names first so "강남구청" wins over "강남". */
const STATION_NAMES = [...new Set(STATION_INDEX.map((row) => row.n.replace(/역$/, "")))]
  .filter((name) => name.length >= 2)
  .sort((a, b) => b.length - a.length);

export function extractStationNames(query: string, limit = 4): string[] {
  const hay = query.replace(/\s+/g, "");
  const found: string[] = [];
  for (const name of STATION_NAMES) {
    if (hay.includes(name) || hay.includes(`${name}역`)) {
      const withYeok = name.endsWith("역") ? name : `${name}역`;
      if (!found.includes(withYeok)) found.push(withYeok);
      if (found.length >= limit) break;
    }
  }
  return found;
}

function staticFacts(stationKo: string): string[] {
  const lines: string[] = [];
  const toilets = STATION_TOILETS[stationKo] ?? [];
  for (const row of toilets.slice(0, 6)) {
    lines.push(
      `- toilet: line=${row.line} floor=${row.floor} gate=${row.gate === "inside" ? "inside" : "outside"} exit=${row.exit ?? "-"} detail=${row.detail ?? ""}`,
    );
  }
  const transfers = STATION_TRANSFERS[stationKo] ?? [];
  for (const row of transfers.slice(0, 8)) {
    const [fromLine, fromToward, , alight, toLine, toToward, board, seconds] = row;
    lines.push(
      `- transfer: ${fromLine}→${toLine} alight=${alight} board=${board} toward=${fromToward}/${toToward} walkSec=${seconds ?? "?"}`,
    );
  }
  for (const map of stepFreeMapsFor(stationKo).slice(0, 2)) {
    lines.push(`- elevator exit: ${map.exit.ko}`);
    for (const note of map.notes.slice(0, 4)) {
      lines.push(`- step-free note: ${note.text.ko}`);
    }
  }
  return lines;
}

async function supabaseFacts(stationKo: string): Promise<string[]> {
  const db = getAdminSupabase();
  if (!db) return [];
  const lines: string[] = [];
  try {
    const { data: stations } = await db
      .from("stations")
      .select("station_uid, place_key, line_name_ko, name_i18n, highlights")
      .ilike("name_i18n->>ko", `%${stationKo.replace(/역$/, "")}%`)
      .limit(6);
    if (!stations?.length) return [];

    for (const station of stations) {
      lines.push(
        `- station_uid=${station.station_uid} line=${station.line_name_ko} name=${(station.name_i18n as { ko?: string })?.ko ?? stationKo}`,
      );
      if (Array.isArray(station.highlights) && station.highlights.length) {
        lines.push(`- highlights: ${station.highlights.slice(0, 4).join(" · ")}`);
      }
      const { data: facilities } = await db
        .from("station_facilities")
        .select("facility_type, is_inside_gate, is_onestop_ground, exit_no, floor, detail_i18n")
        .eq("station_uid", station.station_uid)
        .limit(12);
      for (const row of facilities ?? []) {
        const detail = (row.detail_i18n as { ko?: string } | null)?.ko ?? "";
        lines.push(
          `- facility ${row.facility_type}: gate=${row.is_inside_gate == null ? "?" : row.is_inside_gate ? "inside" : "outside"} onestop=${row.is_onestop_ground ?? false} exit=${row.exit_no ?? "-"} floor=${row.floor ?? "-"} ${detail}`,
        );
      }
      const { data: transfers } = await db
        .from("station_transfers")
        .select("from_line, to_line, fast_car_door, board_car_door, walk_seconds, difficulty")
        .eq("station_uid", station.station_uid)
        .limit(10);
      for (const row of transfers ?? []) {
        lines.push(
          `- transfer ${row.from_line}→${row.to_line} fast=${row.fast_car_door ?? "-"} board=${row.board_car_door ?? "-"} walkSec=${row.walk_seconds ?? "?"} difficulty=${row.difficulty ?? "?"}`,
        );
      }
    }
  } catch {
    return [];
  }
  return lines;
}

export async function buildStationContext(query: string): Promise<{ stations: string[]; context: string }> {
  const stations = extractStationNames(query);
  if (!stations.length) {
    return {
      stations: [],
      context: "No station name detected in the question. Ask which station they mean, or give general Seoul Metro tips without inventing specific exit/toilet facts.",
    };
  }

  const blocks: string[] = [];
  for (const stationKo of stations) {
    const fromDb = await supabaseFacts(stationKo);
    const facts = fromDb.length ? fromDb : staticFacts(stationKo);
    blocks.push(`## ${stationKo}\n${facts.length ? facts.join("\n") : "- No verified facility rows; say so and avoid inventing exit numbers."}`);
  }

  // underground_mall_summary is not deployed yet — do not fabricate mall routes.
  blocks.push("## underground_mall_summary\n- Table not available. Do not invent underground mall walkthroughs.");

  return { stations, context: blocks.join("\n\n") };
}
