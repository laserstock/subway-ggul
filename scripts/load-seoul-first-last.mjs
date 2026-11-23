/**
 * Load first/last train CSV → public.station_first_last (idempotent UPSERT).
 *
 * Prerequisite: run supabase/migrations/20261123_station_first_last.sql
 *
 *   node scripts/load-seoul-first-last.mjs
 */

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const CSV = "data/raw/seoul-metro-first-last.utf8.csv";
const CHUNK = 150;

function loadEnv() {
  const text = fs.readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1].trim()] ??= m[2].trim();
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.length)) rows.push(row);
  }
  return rows;
}

function lineCode(lineName) {
  const m = lineName.match(/^(\d{2})호선$/);
  return m ? m[1] : lineName.slice(0, 16);
}

/**
 * CSV uses 24:xx–25:xx for past-midnight trains. Postgres `time` only accepts 00–24:00:00,
 * so we store a clock time (hour % 24) and keep the display/raw form in metadata.
 */
function parseHms(raw) {
  if (!raw || raw.length < 6) return { pg: null, display: null, raw: raw || null, pastMidnight: false };
  let hh = Number(raw.slice(0, 2));
  const mm = raw.slice(2, 4);
  const ss = raw.slice(4, 6);
  if (!Number.isFinite(hh)) return { pg: null, display: null, raw, pastMidnight: false };
  const pastMidnight = hh >= 24;
  const display = `${String(hh).padStart(2, "0")}:${mm}:${ss}`;
  if (pastMidnight) hh -= 24;
  const pg = `${String(hh).padStart(2, "0")}:${mm}:${ss}`;
  return { pg, display, raw, pastMidnight };
}

const DIR_LABEL = { 1: "상행", 2: "하행" };
const DAY_LABEL = { 1: "평일", 2: "토요일", 3: "공휴일" };

loadEnv();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const probe = await db.from("station_first_last").select("id", { count: "exact", head: true });
if (probe.error) {
  console.error("table missing or not writable:", probe.error.message || probe.status);
  console.error("→ Run supabase/migrations/20261123_station_first_last.sql in SQL Editor, then retry.");
  process.exit(1);
}
console.log("existing rows:", probe.count);

// Build station_uid lookup from stations hub
const stationMap = new Map(); // `${line_code}|${external}` → station_uid
{
  let from = 0;
  const page = 1000;
  for (;;) {
    const { data, error } = await db
      .from("stations")
      .select("station_uid, line_code, external_ids")
      .range(from, from + page - 1);
    if (error) throw error;
    if (!data?.length) break;
    for (const s of data) {
      const ext = s.external_ids?.seoul_external_code;
      const code = s.external_ids?.seoul_station_code;
      if (ext) stationMap.set(`${s.line_code}|${ext}`, s.station_uid);
      if (code) stationMap.set(`${s.line_code}|code:${code}`, s.station_uid);
      stationMap.set(s.station_uid, s.station_uid);
    }
    if (data.length < page) break;
    from += page;
  }
  console.log("station lookup keys:", stationMap.size);
}

const table = parseCsv(fs.readFileSync(CSV, "utf8"));
const dataRows = table.slice(1).filter((r) => r.length >= 16);
const byKey = new Map();

for (const cols of dataRows) {
  const [
    line,
    direction,
    dayType,
    stationCode,
    external,
    stationName,
    firstTime,
    firstFromCode,
    firstToCode,
    firstFromName,
    firstToName,
    lastTime,
    lastFromCode,
    lastToCode,
    lastFromName,
    lastToName,
  ] = cols;

  const lc = lineCode(line);
  const natural_key = `${lc}|${external}|${direction}|${dayType}`;
  const station_uid =
    stationMap.get(`${lc}|${external}`) ?? stationMap.get(`${lc}|code:${stationCode}`) ?? null;
  const first = parseHms(firstTime);
  const last = parseHms(lastTime);

  byKey.set(natural_key, {
    station_uid,
    line_code: lc,
    line_name_ko: line,
    direction,
    direction_label: DIR_LABEL[direction] ?? direction,
    day_type: dayType,
    day_label: DAY_LABEL[dayType] ?? dayType,
    station_code: stationCode,
    external_code: external,
    station_name_ko: stationName,
    first_time: first.pg,
    first_from_code: firstFromCode || null,
    first_to_code: firstToCode || null,
    first_from_name: firstFromName || null,
    first_to_name: firstToName || null,
    last_time: last.pg,
    last_from_code: lastFromCode || null,
    last_to_code: lastToCode || null,
    last_from_name: lastFromName || null,
    last_to_name: lastToName || null,
    natural_key,
    data_source: "public_csv",
    metadata: {
      source: "seoul_metro_first_last_csv",
      source_file: "서울교통공사_지하철 호선별 첫차와 막차 정보(전철역코드,외부코드).csv",
      first_time_display: first.display,
      last_time_display: last.display,
      first_time_raw: first.raw,
      last_time_raw: last.raw,
      first_past_midnight: first.pastMidnight,
      last_past_midnight: last.pastMidnight,
    },
  });
}

const rows = [...byKey.values()];
const linked = rows.filter((r) => r.station_uid).length;
console.log(`parsed ${dataRows.length} → ${rows.length} unique; linked to stations: ${linked}`);

let succeeded = 0;
const failed = [];
for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK);
  const { error, count } = await db.from("station_first_last").upsert(chunk, {
    onConflict: "natural_key",
    count: "exact",
  });
  if (error) {
    console.error(`chunk ${i}-${i + chunk.length}:`, error.message);
    failed.push({ from: i, message: error.message });
  } else {
    succeeded += count ?? chunk.length;
    console.log(`upserted ${Math.min(i + chunk.length, rows.length)}/${rows.length}`);
  }
}

const verify = await db.from("station_first_last").select("id", { count: "exact", head: true });
const sample = await db
  .from("station_first_last")
  .select("station_uid, station_name_ko, direction_label, day_label, first_time, last_time")
  .eq("station_name_ko", "홍대입구")
  .limit(6);

console.log({
  attempted: rows.length,
  succeeded,
  failedChunks: failed.length,
  tableCount: verify.count,
  hongik: sample.data,
});

if (failed.length) process.exitCode = 1;
