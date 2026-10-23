// Builds app/_lib/stationExits.ts from OpenStreetMap subway entrances (railway=subway_entrance, © OpenStreetMap
// contributors, ODbL). The raw Overpass response is cached in data/ so rebuilding works offline.
// Usage: npm run exits:build (reuses the cache) or npm run exits:build -- --fetch (downloads fresh data).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CACHE = "data/osm-subway-entrances.json";
const INDEX = "app/_lib/stationIndex.ts";
const OUTPUT = "app/_lib/stationExits.ts";
/** South, west, north, east: the Seoul capital area covered by the station index. */
const BBOX = [36.7, 126.3, 38.1, 127.9];
/** An exit further than this from its station centre is ignored. */
const MAX_METERS = 700;
/** Without a station name on the exit itself, only attach it to a station this close. */
const NEAREST_METERS = 350;
const KEPT_TAGS = ["ref", "name", "name:ko", "description"];
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

async function download() {
  const query = `[out:json][timeout:180];
nwr["railway"="subway_entrance"](${BBOX.join(",")});
out center tags;`;
  let json = null;
  for (const endpoint of OVERPASS) {
    const response = await fetch(endpoint, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "subway-ggul exits build" },
    });
    if (response.ok) {
      json = await response.json();
      break;
    }
    console.warn(`${endpoint}: ${response.status}`);
  }
  if (!json) throw new Error("Every Overpass endpoint failed; try again later.");
  const elements = json.elements.map((el) => ({
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
    tags: Object.fromEntries(Object.entries(el.tags ?? {}).filter(([key]) => KEPT_TAGS.includes(key))),
  }));
  const data = { fetched: new Date().toISOString().slice(0, 10), elements };
  writeFileSync(CACHE, `${JSON.stringify(data)}\n`);
  return data;
}

function loadStations() {
  const text = readFileSync(INDEX, "utf8");
  const stations = [];
  const pattern = /\{ n: "([^"]+)", l: \[[^\]]*\], c: \[([\d.-]+), ([\d.-]+)\](?:, a: \[([^\]]*)\])? \}/g;
  for (const match of text.matchAll(pattern)) {
    const aliases = match[4] ? [...match[4].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
    stations.push({ name: match[1], lat: Number(match[2]), lng: Number(match[3]), aliases });
  }
  if (stations.length < 100) throw new Error(`Only ${stations.length} stations parsed from ${INDEX}`);
  return stations;
}

function meters(lat1, lng1, lat2, lng2) {
  const rad = Math.PI / 180;
  const x = (lng2 - lng1) * rad * Math.cos(((lat1 + lat2) / 2) * rad);
  const y = (lat2 - lat1) * rad;
  return Math.round(Math.sqrt(x * x + y * y) * 6371000);
}

const EXIT_IN_TEXT = /(\d+(?:-\d+)?)\s*번\s*(?:출구|출입구)/;
const STATION_IN_TEXT = /([가-힣A-Za-z0-9.·]+?)역\s*\(?[^)]*\)?\s*\d+(?:-\d+)?\s*번/;

function exitNumber(tags) {
  const ref = (tags.ref ?? "").replace(/\s+/g, "").replace(/번(출구)?$/, "");
  if (/^\d+(-\d+)?$/.test(ref)) return ref;
  for (const text of [tags.name, tags.description, tags["name:ko"]]) {
    const match = text?.match(EXIT_IN_TEXT);
    if (match) return match[1];
  }
  return null;
}

function namedStation(tags) {
  for (const text of [tags.description, tags.name, tags["name:ko"]]) {
    const match = text?.match(STATION_IN_TEXT);
    if (match) return `${match[1]}역`;
  }
  return null;
}

const args = process.argv.slice(2);
const data = args.includes("--fetch") || !existsSync(CACHE) ? await download() : JSON.parse(readFileSync(CACHE, "utf8"));
const stations = loadStations();
const byName = new Map();
for (const station of stations) {
  byName.set(station.name, station);
  for (const alias of station.aliases) byName.set(alias.endsWith("역") ? alias : `${alias}역`, station);
}

const exits = {};
let used = 0;
for (const { lat, lon, tags } of data.elements) {
  if (typeof lat !== "number" || typeof lon !== "number") continue;
  const number = exitNumber(tags);
  if (!number) continue;

  let station = null;
  const named = namedStation(tags);
  const candidate = named ? byName.get(named) : null;
  if (candidate && meters(lat, lon, candidate.lat, candidate.lng) <= MAX_METERS) {
    station = candidate;
  } else {
    let best = null;
    let bestDistance = Infinity;
    for (const item of stations) {
      const distance = meters(lat, lon, item.lat, item.lng);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    }
    if (best && bestDistance <= NEAREST_METERS) station = best;
  }
  if (!station) continue;

  const list = (exits[station.name] ??= new Map());
  const point = [Number(lat.toFixed(6)), Number(lon.toFixed(6))];
  const previous = list.get(number);
  // Keep the entrance closest to the station when one number is mapped twice (e.g. stairs + elevator).
  if (!previous || meters(...point, station.lat, station.lng) < meters(...previous, station.lat, station.lng)) {
    list.set(number, point);
  }
  used++;
}

function compareExit(a, b) {
  const [a1, a2 = 0] = a.split("-").map(Number);
  const [b1, b2 = 0] = b.split("-").map(Number);
  return a1 - b1 || a2 - b2;
}

const sortedKeys = Object.keys(exits).sort((a, b) => a.localeCompare(b, "ko"));
const exitLines = sortedKeys.map((key) => {
  const entries = [...exits[key].entries()].sort(([a], [b]) => compareExit(a, b));
  return `  ${JSON.stringify(key)}: ${JSON.stringify(entries.map(([number, [lat, lng]]) => [number, lat, lng]))},`;
});

writeFileSync(
  OUTPUT,
  `// Generated by scripts/build-station-exits.mjs — rerun \`npm run exits:build -- --fetch\` to refresh.
// Exit positions © OpenStreetMap contributors (ODbL).

/** [exit number, lat, lng] */
export type StationExitPoint = readonly [string, number, number];

export const EXITS_DATA_DATE = ${JSON.stringify(data.fetched)};

/** Numbered exits, keyed by Korean station name with 역 (as in the station index). */
export const STATION_EXITS: Record<string, readonly StationExitPoint[]> = {
${exitLines.join("\n")}
};
`,
);

console.log(`Wrote ${OUTPUT}: ${sortedKeys.length} stations, ${used} entrances (OSM data ${data.fetched}).`);
