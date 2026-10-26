// Builds app/_lib/subwayNetwork.ts, the graph the route finder searches:
//   stations   – names from the station index (app/_lib/stationIndex.ts), so results link to the rest of the app
//   edges      – station order from OpenStreetMap routes (data/osm-subway-routes.json); running times from
//                Seoul Metro's official table (data/seoulmetro-segment-times.csv, lines 1–8) and otherwise
//                estimated from distance with a model calibrated on that table
//   through    – at branch junctions, which station triples a single train runs through (else a transfer)
// Usage: npm run routes:build   (npm run routes:fetch first to refresh the OpenStreetMap data)
import { readFileSync, writeFileSync } from "node:fs";

const OUTPUT = "app/_lib/subwayNetwork.ts";
/** Seconds a train stands at each intermediate stop. */
const DWELL = 30;

// ---------- station index ----------
const indexSource = readFileSync("app/_lib/stationIndex.ts", "utf8");
const literal = indexSource.slice(indexSource.indexOf("= [", indexSource.indexOf("STATION_INDEX")) + 2).trim();
const INDEX = new Function(`return ${literal.replace(/;\s*$/, "")}`)();

const normalize = (name) =>
  name
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, "")
    .replace(/·/g, ".")
    .replace(/역$/, "");

/** Renamed stations whose sources still use the old name. */
const RENAMED = { 당고개: "불암산", 미아삼거리: "미아사거리" };

function haversine([lat1, lng1], [lat2, lng2]) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

const byName = new Map();
INDEX.forEach((entry, id) => {
  for (const name of [entry.n, ...(entry.a ?? [])]) {
    const key = normalize(name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(id);
  }
});

const stations = INDEX.map((entry) => ({ n: entry.n, c: entry.c }));
const extraStations = new Map();
const unmatched = new Set();

function resolveStation(rawName, coord) {
  let key = normalize(rawName);
  key = RENAMED[key] ?? key;
  const candidates = (byName.get(key) ?? [])
    .map((id) => ({ id, distance: haversine(coord, INDEX[id].c) }))
    .filter(({ distance }) => distance < 2500)
    .sort((a, b) => a.distance - b.distance);
  if (candidates[0]) return candidates[0].id;
  const near = INDEX.map((entry, id) => ({ id, distance: haversine(coord, entry.c) })).sort(
    (a, b) => a.distance - b.distance,
  )[0];
  if (near && near.distance < 300) return near.id;
  const extraKey = `${key}@${coord[0].toFixed(2)},${coord[1].toFixed(2)}`;
  if (!extraStations.has(extraKey)) {
    extraStations.set(extraKey, stations.length);
    stations.push({ n: `${key}역`, c: coord });
    unmatched.add(`${rawName} (${coord.join(", ")})`);
  }
  return extraStations.get(extraKey);
}

// ---------- services ----------
/** OpenStreetMap route name → app line name; null skips the route. */
function serviceFor(name) {
  if (/9호선 급행/.test(name)) return { line: "9호선", express: true };
  if (/광역급행철도 A/.test(name)) return { line: "GTX-A", express: false };
  if (/급행|특급|셔틀|직통|차량기지/.test(name)) return null;
  const rules = [
    [/인천 도시철도 1호선/, "인천1호선"],
    [/인천 도시철도 2호선/, "인천2호선"],
    [/경의·중앙/, "경의중앙선"],
    [/수인·분당/, "수인분당선"],
    [/신분당/, "신분당선"],
    [/인천국제공항철도 일반/, "공항철도"],
    [/경춘선/, "경춘선"],
    [/경강선/, "경강선"],
    [/서해선/, "서해선"],
    [/김포 골드/, "김포골드라인"],
    [/신림선/, "신림선"],
    [/용인 경전철/, "용인에버라인"],
    [/우이신설/, "우이신설선"],
    [/의정부경전철/, "의정부경전철"],
  ];
  for (const [pattern, line] of rules) if (pattern.test(name)) return { line, express: false };
  const number = name.match(/(\d)호선/)?.[1];
  return number ? { line: `${number}호선`, express: false } : null;
}

const services = [];
function serviceId({ line, express }) {
  let id = services.findIndex((service) => service.line === line && service.express === express);
  if (id < 0) {
    id = services.length;
    services.push({ line, express });
  }
  return id;
}

// ---------- edges and through-running ----------
const osm = JSON.parse(readFileSync("data/osm-subway-routes.json", "utf8"));
const edges = new Map();
const triples = new Set();
const skipped = new Set();

/** Lines whose OpenStreetMap routes skip stations; these sequences replace them (both directions). */
const OVERRIDE_ROUTES = {
  공항철도: [
    ["서울역", "공덕역", "홍대입구역", "디지털미디어시티역", "마곡나루역", "김포공항역", "계양역", "검암역", "청라국제도시역", "영종역", "운서역", "공항화물청사역", "인천공항1터미널역", "인천공항2터미널역"],
  ],
  "GTX-A": [
    ["운정역", "킨텍스역", "대곡역", "연신내역", "서울역"],
    ["수서역", "성남역", "구성역", "동탄역"],
  ],
};
const indexId = (name, line) => {
  const ids = INDEX.flatMap((entry, id) => (entry.n === name ? [id] : []));
  const id = ids.find((candidate) => INDEX[candidate].l.includes(line)) ?? ids[0];
  if (id === undefined) throw new Error(`Override station not in the index: ${name}`);
  return id;
};
const routePaths = [];
for (const route of osm.routes) {
  const service = serviceFor(route.name);
  if (!service) {
    skipped.add(route.name);
    continue;
  }
  if (!service.express && OVERRIDE_ROUTES[service.line]) continue;
  const path = [];
  for (const stopId of route.stops) {
    const [name, lat, lng] = osm.stops[stopId];
    const id = resolveStation(name, [lat, lng]);
    if (path.at(-1) !== id) path.push(id);
  }
  routePaths.push({ sid: serviceId(service), path });
}
for (const [line, sequences] of Object.entries(OVERRIDE_ROUTES)) {
  const sid = serviceId({ line, express: false });
  for (const sequence of sequences) {
    const path = sequence.map((name) => indexId(name, line));
    routePaths.push({ sid, path }, { sid, path: [...path].reverse() });
  }
}

for (const { sid, path } of routePaths) {
  for (let i = 0; i + 1 < path.length; i++) {
    const key = `${sid}|${path[i]}|${path[i + 1]}`;
    if (!edges.has(key)) edges.set(key, { sid, from: path[i], to: path[i + 1] });
    if (i + 2 < path.length) triples.add(`${sid}|${path[i]}|${path[i + 1]}|${path[i + 2]}`);
  }
}

/** The 6호선 Eungam loop runs one way only. */
const ONE_WAY = { "6호선": ["응암역", "역촌역", "불광역", "독바위역", "연신내역", "구산역"] };
for (const edge of [...edges.values()]) {
  const reverse = `${edge.sid}|${edge.to}|${edge.from}`;
  if (edges.has(reverse)) continue;
  const loop = ONE_WAY[services[edge.sid].line];
  if (loop && loop.includes(stations[edge.from].n) && loop.includes(stations[edge.to].n)) continue;
  edges.set(reverse, { sid: edge.sid, from: edge.to, to: edge.from });
}

/** Through-running the OpenStreetMap routes miss (a loop train continuing back down the line). */
const EXTRA_THROUGH = [["6호선", "구산역", "응암역", "새절역"]];
const stationId = (name) => stations.findIndex((station) => station.n === name);
for (const [line, a, b, c] of EXTRA_THROUGH) {
  const sid = services.findIndex((service) => service.line === line && !service.express);
  triples.add(`${sid}|${stationId(a)}|${stationId(b)}|${stationId(c)}`);
}

// ---------- official running times ----------
const csvBytes = readFileSync("data/seoulmetro-segment-times.csv");
let csvText = new TextDecoder("utf-8").decode(csvBytes);
if (csvText.includes("\ufffd")) csvText = new TextDecoder("euc-kr").decode(csvBytes);
const csv = csvText.replace(/^\ufeff/, "").trim().split(/\r?\n/).slice(1);
/** Rows that start a branch rather than continuing from the row above. */
const BRANCH_FROM = { "2|용답": "성수", "2|도림천": "신도림", "5|둔촌동": "강동" };
const official = new Map();
let previous = null;
for (const row of csv) {
  const [, line, rawName, time, km] = row.split(",");
  const name = RENAMED[normalize(rawName)] ?? normalize(rawName);
  const [minutes, seconds] = time.split(":").map(Number);
  const runtime = minutes * 60 + seconds;
  const from = BRANCH_FROM[`${line}|${name}`] ?? previous?.name;
  if (runtime > 0 && previous?.line === line && from) {
    const value = { runtime, km: Number(km) };
    official.set(`${line}호선|${from}|${name}`, value);
    official.set(`${line}호선|${name}|${from}`, value);
  }
  previous = { line, name };
}

// ---------- running time model ----------
/** Top running speed (km/h) by line; the estimate accelerates to it and brakes back down. */
const TOP_SPEED = {
  "1호선": 95,
  "3호선": 85,
  "4호선": 85,
  "9호선": 80,
  신분당선: 80,
  공항철도: 105,
  경의중앙선: 95,
  경춘선: 100,
  경강선: 100,
  서해선: 100,
  수인분당선: 85,
  "GTX-A": 130,
  인천1호선: 75,
  인천2호선: 70,
  우이신설선: 65,
  신림선: 65,
  김포골드라인: 70,
  의정부경전철: 65,
  용인에버라인: 65,
};
const DEFAULT_SPEED = 80;

/** Track length over straight-line distance and acceleration, fitted to the official table below. */
let TRACK_FACTOR = 1.1;
let ACCEL = 0.75;
let OVERHEAD = 10;

function modelRuntime(meters, line) {
  const v = (TOP_SPEED[line] ?? DEFAULT_SPEED) / 3.6;
  const d = meters * TRACK_FACTOR;
  const ramp = (v * v) / ACCEL;
  const run = d >= ramp ? d / v + v / ACCEL : 2 * Math.sqrt(d / ACCEL);
  return run + OVERHEAD;
}

// Fit the model to every official segment that is also an edge.
const samples = [];
for (const edge of edges.values()) {
  const { line, express } = services[edge.sid];
  if (express) continue;
  const value = official.get(`${line}|${normalize(stations[edge.from].n)}|${normalize(stations[edge.to].n)}`);
  if (value) samples.push({ meters: haversine(stations[edge.from].c, stations[edge.to].c), ...value, line });
}
const ratios = samples.map((sample) => (sample.km * 1000) / sample.meters).filter((ratio) => ratio > 0.8 && ratio < 2);
ratios.sort((a, b) => a - b);
TRACK_FACTOR = ratios[Math.floor(ratios.length / 2)];
let best = { error: Infinity };
for (let accel = 0.4; accel <= 1.3; accel += 0.05) {
  for (let overhead = 0; overhead <= 40; overhead += 2) {
    ACCEL = accel;
    OVERHEAD = overhead;
    const error =
      samples.reduce((sum, sample) => sum + Math.abs(modelRuntime(sample.meters, sample.line) - sample.runtime), 0) /
      samples.length;
    if (error < best.error) best = { error, accel, overhead };
  }
}
ACCEL = best.accel;
OVERHEAD = best.overhead;

// ---------- assemble ----------
let officialCount = 0;
const timed = [];
for (const edge of edges.values()) {
  const { line, express } = services[edge.sid];
  const value = express
    ? null
    : official.get(`${line}|${normalize(stations[edge.from].n)}|${normalize(stations[edge.to].n)}`);
  if (value) officialCount++;
  const runtime = value?.runtime ?? modelRuntime(haversine(stations[edge.from].c, stations[edge.to].c), line);
  timed.push({ ...edge, line, runtime, modelled: !value });
}

/**
 * Timetabled all-stop trips (minutes) for lines the model runs too fast on; their modelled
 * segments are scaled so the trip matches.
 */
const CALIBRATE = [
  ["공항철도", "서울역", "인천공항2터미널역", 66],
  ["경춘선", "상봉역", "춘천역", 80],
];
const calibration = [];
for (const [line, fromName, toName, minutes] of CALIBRATE) {
  const sid = services.findIndex((service) => service.line === line && !service.express);
  const route = routePaths.find(({ sid: s, path }) => {
    const names = path.map((id) => stations[id].n);
    return s === sid && names.indexOf(fromName) >= 0 && names.indexOf(fromName) < names.indexOf(toName);
  });
  if (!route) throw new Error(`Calibration path missing: ${line} ${fromName}→${toName}`);
  const names = route.path.map((id) => stations[id].n);
  const path = route.path.slice(names.indexOf(fromName), names.indexOf(toName) + 1);
  let fixed = (path.length - 2) * DWELL;
  let modelled = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    const edge = timed.find((e) => e.sid === sid && e.from === path[i] && e.to === path[i + 1]);
    if (edge.modelled) modelled += edge.runtime;
    else fixed += edge.runtime;
  }
  const factor = (minutes * 60 - fixed) / modelled;
  for (const edge of timed) if (edge.line === line && edge.modelled) edge.runtime *= factor;
  calibration.push(`${line} ×${factor.toFixed(2)}`);
}

const edgeRows = timed.map((edge) => [edge.sid, edge.from, edge.to, Math.round(edge.runtime + DWELL)]);
edgeRows.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

// Keep through-running only where a line branches (a station with 3+ neighbours on that service).
const neighbours = new Map();
for (const [sid, from, to] of edgeRows) {
  const key = `${sid}|${from}`;
  if (!neighbours.has(key)) neighbours.set(key, new Set());
  neighbours.get(key).add(to);
}
const junctionThrough = [...triples]
  .map((key) => key.split("|").map(Number))
  .filter(([sid, , b]) => (neighbours.get(`${sid}|${b}`)?.size ?? 0) > 2)
  .sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1] || a[3] - b[3]);

const used = new Set(edgeRows.flatMap(([, from, to]) => [from, to]));

/** Differently named stations that form one transfer, with walking minutes between them. */
const LINKS = [
  ["이수역", "총신대입구역", 4],
  ["의정부역", "경전철의정부역", 6],
];
const linkRows = LINKS.map(([a, b, minutes]) => {
  const ids = [a, b].map((name) => [...used].find((id) => stations[id].n === name));
  if (ids.includes(undefined)) throw new Error(`Link station missing: ${a} / ${b}`);
  return [...ids, minutes];
});
const out = `// Generated by scripts/build-subway-network.mjs — run \`npm run routes:build\` to regenerate.
// Station order: © OpenStreetMap contributors (ODbL). Running times: 서울교통공사 역간거리 및 소요시간 (공공누리 1유형).

/** Rail services; express runs share the line name. */
export const NETWORK_SERVICES: readonly { line: string; express: boolean }[] = ${JSON.stringify(services)};

/** [name with 역, lat, lng]; names match the station index. Unused index stations are left empty. */
export const NETWORK_STATIONS: readonly (readonly [string, number, number] | null)[] = [
${stations.map((station, id) => (used.has(id) ? JSON.stringify([station.n, station.c[0], station.c[1]]) : "null")).join(",\n")},
];

/** [service, from station, to station, seconds including one stop's dwell]. */
export const NETWORK_EDGES: readonly (readonly [number, number, number, number])[] = ${JSON.stringify(edgeRows)};

/** At branch junctions, [service, previous, junction, next] a single train runs through; other turns need a change. */
export const NETWORK_THROUGH: readonly (readonly [number, number, number, number])[] = ${JSON.stringify(junctionThrough)};

/** [station, station, walking minutes] for transfers between differently named stations. */
export const NETWORK_LINKS: readonly (readonly [number, number, number])[] = ${JSON.stringify(linkRows)};
`;
writeFileSync(OUTPUT, out);

// ---------- report ----------
function pathSeconds(line, names, express = false) {
  const sid = services.findIndex((service) => service.line === line && service.express === express);
  let total = -DWELL;
  for (let i = 0; i + 1 < names.length; i++) {
    const row = edgeRows.find(([s, from, to]) => s === sid && stations[from].n === names[i] && stations[to].n === names[i + 1]);
    if (!row) return `missing ${names[i]}→${names[i + 1]}`;
    total += row[3];
  }
  return `${(total / 60).toFixed(1)}분`;
}
console.log(`Wrote ${OUTPUT}: ${services.length} services, ${used.size} stations, ${edgeRows.length} edges (${officialCount} official), ${junctionThrough.length} junction runs.`);
console.log(`Model fit: track ×${TRACK_FACTOR.toFixed(3)}, accel ${ACCEL.toFixed(2)} m/s², overhead ${OVERHEAD}s, mean error ${best.error.toFixed(1)}s over ${samples.length} segments.`);
console.log(`Calibrated: ${calibration.join(", ")}`);
console.log(`Skipped routes: ${[...skipped].join(" / ")}`);
if (unmatched.size) console.log(`Stations not in the index (${unmatched.size}): ${[...unmatched].join(", ")}`);
const served = new Set(edgeRows.map(([sid, from]) => `${services[sid].line}|${from}`));
const missing = INDEX.flatMap((entry, id) =>
  entry.l.filter((line) => !served.has(`${line}|${id}`)).map((line) => `${entry.n} ${line}`),
);
if (missing.length) console.log(`Index stations missing from their line (${missing.length}): ${missing.join(", ")}`);
const usedIds = [...used];
const close = [];
for (let i = 0; i < usedIds.length; i++) {
  for (let j = i + 1; j < usedIds.length; j++) {
    const meters = haversine(stations[usedIds[i]].c, stations[usedIds[j]].c);
    if (meters < 300) close.push(`${stations[usedIds[i]].n}~${stations[usedIds[j]].n} ${Math.round(meters)}m`);
  }
}
if (close.length) console.log(`Separate stations within 300 m: ${close.join(", ")}`);
export { pathSeconds, stations, edgeRows, services };
