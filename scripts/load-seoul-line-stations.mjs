/**
 * Load 서울교통공사 노선별 지하철역 정보 CSV → public.stations (idempotent UPSERT).
 *
 * Prerequisite: run supabase/migrations/20261123_catalog_hub.sql
 *               and 20261123_service_role_grants.sql in the SQL Editor.
 *
 *   node scripts/load-seoul-line-stations.mjs
 */

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const CSV = "data/raw/seoul-metro-stations-by-line.utf8.csv";
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
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
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
    if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
      if (ch === "\r") i++;
      row.push(field);
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (ch === "\r") {
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

/** "01호선" → "01", "공항철도" → "AREX", "GTX-A" → "GTX-A" */
function lineCode(lineName) {
  const m = lineName.match(/^(\d{2})호선$/);
  if (m) return m[1];
  const map = {
    공항철도: "AREX",
    경의선: "GYEONGUI",
    경춘선: "GYEONGCHUN",
    경강선: "GYEONGGANG",
    수인분당선: "SUINBUNDANG",
    신분당선: "SHINBUNDANG",
    서해선: "SEOHAE",
    신림선: "SILLIM",
    인천선: "INCHEON1",
    인천2호선: "INCHEON2",
    김포도시철도: "GIMPO",
    용인경전철: "YONGIN",
    우이신설경전철: "UI",
    의정부경전철: "UJEONGBU",
    "GTX-A": "GTX-A",
  };
  return map[lineName] ?? lineName.replace(/\s+/g, "").slice(0, 16);
}

function placeKey(en, ko) {
  const base = (en || ko || "station")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "station";
}

function cleanZh(value) {
  if (!value || value.includes("?")) return undefined;
  return value;
}

function toStationRow(cols) {
  const [code, ko, en, line, external, zh, ja] = cols;
  const lc = lineCode(line);
  const ext = (external || code || "").trim();
  const station_uid = `${lc}_${ext}`.slice(0, 40);
  const name_i18n = { ko: ko.endsWith("역") ? ko : `${ko}역`, en: en || ko };
  const zhClean = cleanZh(zh);
  if (zhClean) name_i18n.zh = zhClean;
  if (ja) name_i18n.ja = ja;

  return {
    station_uid,
    place_key: placeKey(en, ko),
    line_code: lc,
    line_name_ko: line,
    name_i18n,
    slug: placeKey(en, ko),
    highlights: [],
    external_ids: {
      seoul_station_code: code,
      seoul_external_code: external,
      source_file: "서울교통공사_노선별 지하철역 정보.csv",
    },
    data_source: "public_csv",
    metadata: {
      source: "seoul_metro_line_stations_csv",
      raw: {
        전철역코드: code,
        전철역명: ko,
        전철역명_영문: en,
        호선: line,
        외부코드: external,
        전철역명_중문: zh,
        전철역명_일문: ja,
      },
    },
  };
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const text = fs.readFileSync(CSV, "utf8");
const table = parseCsv(text);
const header = table[0];
console.log("header:", header.join(" | "));
const dataRows = table.slice(1).filter((r) => r.length >= 5);
const stations = dataRows.map(toStationRow);

// Dedupe by station_uid (last wins) — CSV should already be unique per line+code.
const byUid = new Map();
for (const row of stations) byUid.set(row.station_uid, row);
const unique = [...byUid.values()];
console.log(`parsed ${dataRows.length} rows → ${unique.length} unique station_uid`);

const db = createClient(url, key, { auth: { persistSession: false } });

// Smoke check
{
  const probe = await db.from("stations").select("station_uid", { count: "exact", head: true });
  if (probe.error) {
    console.error("stations table not writable:", probe.error.message || probe.status);
    console.error("→ Run in SQL Editor:");
    console.error("  1) supabase/migrations/20261123_catalog_hub.sql");
    console.error("  2) supabase/migrations/20261123_service_role_grants.sql");
    process.exit(1);
  }
  console.log("stations existing count:", probe.count);
}

let succeeded = 0;
const failed = [];
for (let i = 0; i < unique.length; i += CHUNK) {
  const chunk = unique.slice(i, i + CHUNK);
  const { error, count } = await db.from("stations").upsert(chunk, {
    onConflict: "station_uid",
    count: "exact",
  });
  if (error) {
    console.error(`chunk ${i}-${i + chunk.length} failed:`, error.message);
    failed.push({ from: i, to: i + chunk.length, message: error.message });
  } else {
    succeeded += count ?? chunk.length;
    console.log(`upserted ${i + chunk.length}/${unique.length}`);
  }
}

const verify = await db.from("stations").select("station_uid", { count: "exact", head: true });
console.log({
  attempted: unique.length,
  succeeded,
  failedChunks: failed.length,
  tableCount: verify.count,
  sample: unique.find((s) => s.name_i18n.ko.includes("홍대")) ?? unique[0],
});

if (failed.length) process.exitCode = 1;
