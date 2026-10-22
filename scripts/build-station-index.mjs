// Builds app/_lib/stationIndex.ts from Seoul's station master "지하철역_GEOM (역사마스터)"
// (t-data.seoul.go.kr, data_id=36), saved as data/seoul-stations.csv.
// Usage: npm run stations:build
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "data/seoul-stations.csv";
const OUTPUT = "app/_lib/stationIndex.ts";
/** Same-name rows further apart than this are different stations (e.g. 양평 on Line 5 vs 경의중앙선). */
const SAME_STATION_METERS = 600;

/** Railway section names in the source → the service line riders see on signage. */
const LINE_NAMES = {
  "9호선(연장)": "9호선",
  "7호선(인천)": "7호선",
  "신분당선(연장)": "신분당선",
  "신분당선(연장2)": "신분당선",
  경원선: "1호선",
  경부선: "1호선",
  경인선: "1호선",
  장항선: "1호선",
  안산선: "4호선",
  과천선: "4호선",
  진접선: "4호선",
  일산선: "3호선",
  별내선: "8호선",
  중앙선: "경의중앙선",
  분당선: "수인분당선",
  수인선: "수인분당선",
  공항철도1호선: "공항철도",
  "수도권 광역급행철도": "GTX-A",
  의정부선: "의정부경전철",
  에버라인선: "용인에버라인",
};

/** 경원선 between 용산 and 청량리 is ridden as 경의중앙선, not 1호선. */
const GYEONGWON_JUNGANG = new Set(["청량리", "왕십리", "응봉", "옥수", "한남", "서빙고", "이촌"]);

/** Lines sharing track the source lists under another section only. */
const EXTRA_LINES = {
  청량리역: ["1호선", "경의중앙선", "수인분당선", "경춘선"],
  회기역: ["1호선"],
  왕십리역: ["수인분당선"],
  용산역: ["경의중앙선"],
  상봉역: ["경춘선"],
  망우역: ["경춘선"],
  광운대역: ["경춘선"],
  대곡역: ["경의중앙선", "서해선"],
  능곡역: ["서해선"],
  한대앞역: ["수인분당선"],
  중앙역: ["수인분당선"],
  고잔역: ["수인분당선"],
  초지역: ["수인분당선"],
  안산역: ["수인분당선"],
  신길온천역: ["수인분당선"],
  정왕역: ["수인분당선"],
  오이도역: ["수인분당선"],
};

/** Renamed stations the source still lists under the old name; the old name stays searchable. */
const RENAMED = { 뚝섬유원지: "자양" };
/** Former names of stations the source already lists under the new name. */
const FORMER_NAMES = { 불암산역: ["당고개"] };

function serviceLine(section, base) {
  if (section === "경원선" && GYEONGWON_JUNGANG.has(base)) return "경의중앙선";
  return LINE_NAMES[section] ?? section;
}

function lineOrder(line) {
  const number = line.match(/^(\d+)호선$/);
  return number ? Number(number[1]) : 100;
}

function distanceMeters(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

const text = readFileSync(SOURCE, "utf8").replace(/^\uFEFF/, "");
const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
const columns = header.split(",");
const NAME = columns.indexOf("역한글명칭");
const LINE = columns.indexOf("호선명칭");
const LNG = columns.indexOf("환승역X좌표");
const LAT = columns.indexOf("환승역Y좌표");
if ([NAME, LINE, LNG, LAT].includes(-1)) throw new Error(`Unexpected columns: ${header}`);

const stations = [];
for (const row of lines) {
  const cells = row.split(",");
  const raw = cells[NAME].trim();
  const lat = Number(cells[LAT]);
  const lng = Number(cells[LNG]);
  if (!raw || !lat || !lng) continue;
  const original = raw.replace(/\(.*?\)/g, "").trim().replace(/역$/, "");
  const base = RENAMED[original] ?? original;
  const line = serviceLine(cells[LINE].trim(), base);
  const name = `${base}역`;
  const aliases = [...raw.matchAll(/\((.*?)\)/g)].map((match) => match[1].trim()).filter(Boolean);
  if (base !== original) aliases.push(original);
  const center = { lat, lng };
  const existing = stations.find(
    (station) => station.name === name && distanceMeters(station.center, center) <= SAME_STATION_METERS,
  );
  if (existing) {
    if (!existing.lines.includes(line)) existing.lines.push(line);
    for (const alias of aliases) if (!existing.aliases.includes(alias)) existing.aliases.push(alias);
    if (lineOrder(line) < lineOrder(existing.lines[0])) existing.center = center;
  } else {
    stations.push({ name, aliases, lines: [line], center });
  }
}

for (const [name, extra] of Object.entries(EXTRA_LINES)) {
  const station = stations.find((candidate) => candidate.name === name);
  if (!station) throw new Error(`EXTRA_LINES station not found: ${name}`);
  for (const line of extra) if (!station.lines.includes(line)) station.lines.push(line);
}

for (const [name, former] of Object.entries(FORMER_NAMES)) {
  const station = stations.find((candidate) => candidate.name === name);
  if (!station) throw new Error(`FORMER_NAMES station not found: ${name}`);
  for (const alias of former) if (!station.aliases.includes(alias)) station.aliases.push(alias);
}

for (const station of stations) {
  station.lines.sort((a, b) => lineOrder(a) - lineOrder(b));
}
stations.sort((a, b) => a.name.localeCompare(b.name, "ko") || lineOrder(a.lines[0]) - lineOrder(b.lines[0]));

const split = stations.filter((station, index) => stations.findIndex((other) => other.name === station.name) !== index);

const entries = stations.map(({ name, aliases, lines: stationLines, center }) => {
  const parts = [`n: ${JSON.stringify(name)}`, `l: ${JSON.stringify(stationLines)}`, `c: [${center.lat}, ${center.lng}]`];
  if (aliases.length) parts.push(`a: ${JSON.stringify(aliases)}`);
  return `  { ${parts.join(", ")} },`;
});

writeFileSync(
  OUTPUT,
  `// Generated by scripts/build-station-index.mjs — edit data/seoul-stations.csv and rerun \`npm run stations:build\`.

/** n: name with 역, l: lines, c: [lat, lng], a: alternative names. */
export type IndexedStation = {
  n: string;
  l: readonly string[];
  c: readonly [number, number];
  a?: readonly string[];
};

/** Every Seoul-area metro station (Seoul Metro, Korail, light rail, GTX-A). */
export const STATION_INDEX: readonly IndexedStation[] = [
${entries.join("\n")}
];
`,
);

console.log(`Wrote ${OUTPUT}: ${stations.length} stations from ${lines.length} rows.`);
if (split.length) console.log(`Same name, separate stations: ${split.map((station) => `${station.name}(${station.lines.join("/")})`).join(", ")}`);
