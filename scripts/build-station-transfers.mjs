// Builds app/_lib/stationTransfers.ts: which car and door to ride for the quickest transfer at every Seoul-area
// transfer station, from 서울교통공사_서울 도시철도 환승정보 (data.go.kr 15098252, saved as UTF-8 in
// data/seoul-metro-transfers.csv). The file names the target line only by a station code, so each row is matched
// to the route network (app/_lib/subwayNetwork.ts) by the stations either side of the transfer.
// Usage: npm run transfers:build
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "data/seoul-metro-transfers.csv";
const OUTPUT = "app/_lib/stationTransfers.ts";

function parseCsv(text) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.match(/("([^"]*)"|[^,]*)(,|$)/g).map((cell) => cell.replace(/,$/, "").replace(/^"|"$/g, "").trim()));
}

function readConst(file, name) {
  const source = readFileSync(file, "utf8");
  const match = source.match(new RegExp(`export const ${name}[^=]*= ([\\s\\S]*?);\\n`));
  if (!match) throw new Error(`${name} not found in ${file}`);
  return new Function(`return ${match[1]}`)();
}

const normalize = (name) =>
  name
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, "")
    .replace(/·/g, ".")
    .replace(/역$/, "");

const CSV_LINES = {
  경의선: "경의중앙선",
  경춘선: "경춘선",
  경강선: "경강선",
  공항철도: "공항철도",
  서해선: "서해선",
  수인분당선: "수인분당선",
  신림선: "신림선",
  신분당선: "신분당선",
  우이신설경전철: "우이신설선",
  의정부경전철: "의정부경전철",
  인천2: "인천2호선",
  인천선: "인천1호선",
};
const csvLine = (label) => (/^\d$/.test(label) ? `${label}호선` : CSV_LINES[label]);

/**
 * Station-code prefixes, only used to break ties between lines sharing track (청량리, 왕십리, 초지). Codes the file
 * also lists as a transfer station's own code are looked up exactly first.
 */
const CODE_PREFIX_LINES = {
  "01": "1호선", "02": "2호선", "03": "3호선", "04": "4호선", 12: "경의중앙선", 13: "경춘선", 15: "경강선",
  18: "수인분당선", 25: "5호선", 26: "6호선", 27: "7호선", 28: "8호선", 31: "인천1호선", 32: "인천2호선",
  41: "9호선", 42: "공항철도", 43: "신분당선", 44: "신림선", 45: "용인에버라인", 46: "의정부경전철",
  47: "우이신설선", 48: "서해선", 49: "김포골드라인",
};
/** 청량리's 수인분당선 platform toward 왕십리, which the 경의중앙선 rows list as a separate line. */
const CODE_OVERRIDES = { "102C": "수인분당선" };
/** Direction names missing from the route network, mapped to a station further along that it does have. */
const TOWARD_ALIASES = { 시우: "원시" };
/** How far along a line to look for a direction station that is no longer adjacent (new stations in between). */
const MAX_TOWARD_HOPS = 4;

const services = readConst("app/_lib/subwayNetwork.ts", "NETWORK_SERVICES");
const stations = readConst("app/_lib/subwayNetwork.ts", "NETWORK_STATIONS");
const edges = readConst("app/_lib/subwayNetwork.ts", "NETWORK_EDGES");
const links = readConst("app/_lib/subwayNetwork.ts", "NETWORK_LINKS");

/** station id → line → neighbour ids */
const neighbors = new Map();
function addNeighbor(line, a, b) {
  if (!neighbors.has(a)) neighbors.set(a, new Map());
  const byLine = neighbors.get(a);
  if (!byLine.has(line)) byLine.set(line, new Set());
  byLine.get(line).add(b);
}
for (const [service, a, b] of edges) {
  const { line } = services[service];
  addNeighbor(line, a, b);
  addNeighbor(line, b, a);
}

const idsByName = new Map();
stations.forEach((station, id) => {
  if (!station) return;
  const key = normalize(station[0]);
  if (!idsByName.has(key)) idsByName.set(key, []);
  idsByName.get(key).push(id);
});

const linked = new Map();
for (const [a, b] of links) {
  linked.set(a, [...(linked.get(a) ?? []), b]);
  linked.set(b, [...(linked.get(b) ?? []), a]);
}

const nameOf = (id) => stations[id][0];
const lineNeighbors = (id, line) => [...(neighbors.get(id)?.get(line) ?? [])];

/** The station on `line` called `name`, or null. */
function stationOnLine(name, line) {
  return (idsByName.get(normalize(name)) ?? []).find((id) => lineNeighbors(id, line).length > 0) ?? null;
}

function towardName(text) {
  const name = normalize(text.replace(/\s*방면$/, ""));
  return TOWARD_ALIASES[name] ?? name;
}

/** Stops from `at` to a station called `name` when leaving via `first` on `line`, or Infinity. */
function hopsVia(at, first, line, name) {
  let frontier = [first];
  const seen = new Set([at, first]);
  for (let hops = 1; hops <= MAX_TOWARD_HOPS; hops += 1) {
    if (frontier.some((id) => normalize(nameOf(id)) === name)) return hops;
    frontier = frontier.flatMap((id) => lineNeighbors(id, line).filter((next) => !seen.has(next)));
    frontier.forEach((id) => seen.add(id));
  }
  return Infinity;
}

/** The neighbour of `at` on `line` that trains heading toward `name` leave by, with its distance in stops. */
function towardNeighbor(at, line, name) {
  return lineNeighbors(at, line)
    .map((id) => ({ id, hops: hopsVia(at, id, line, name) }))
    .filter(({ hops }) => hops < Infinity)
    .sort((a, b) => a.hops - b.hops)[0];
}

function seconds(text) {
  const match = text.match(/^(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

const [, ...rows] = parseCsv(readFileSync(SOURCE, "utf8"));
const exactCodeLines = new Map(rows.map((row) => [row[2], csvLine(row[3])]));
const codeLine = (code) => CODE_OVERRIDES[code] ?? exactCodeLines.get(code) ?? CODE_PREFIX_LINES[code.slice(0, 2)];
/** station name → rows */
const output = new Map();
const problems = [];

for (const row of rows) {
  const [, startName, , startLabel, startToward, alightCar, alightDoor, endCode, endToward, boardCar, boardDoor, time] = row;
  const fromLine = csvLine(startLabel);
  const at = fromLine ? stationOnLine(startName, fromLine) : null;
  if (at === null) {
    problems.push(`no station ${startName} on ${startLabel}`);
    continue;
  }
  const fromNeighbors = lineNeighbors(at, fromLine);
  const fromToward = towardNeighbor(at, fromLine, towardName(startToward))?.id;
  if (fromToward === undefined) {
    problems.push(`${startName} ${fromLine}: ${startToward} is not along the line`);
    continue;
  }

  const candidates = [];
  for (const id of [at, ...(linked.get(at) ?? [])]) {
    for (const line of neighbors.get(id)?.keys() ?? []) {
      if (line === fromLine || candidates.some((candidate) => candidate.line === line)) continue;
      const toward = towardNeighbor(id, line, towardName(endToward));
      if (toward) candidates.push({ id, line, toward: toward.id, hops: toward.hops });
    }
  }
  const nearest = Math.min(...candidates.map((candidate) => candidate.hops));
  const closest = candidates.filter((candidate) => candidate.hops === nearest);
  const target =
    closest.length === 1 ? closest[0] : (closest.find((candidate) => candidate.line === codeLine(endCode)) ?? null);
  if (!target) {
    problems.push(
      `${startName} ${fromLine} → ${endToward} (${endCode}): ${candidates.length ? candidates.map((c) => c.line).join("/") : "no line"}`,
    );
    continue;
  }

  const entry = [
    fromLine,
    nameOf(fromToward),
    fromNeighbors.filter((id) => id !== fromToward).map(nameOf),
    `${alightCar}-${alightDoor}`,
    target.line,
    nameOf(target.toward),
    `${boardCar}-${boardDoor}`,
    seconds(time),
  ];
  for (const id of new Set([at, target.id])) {
    const key = nameOf(id);
    if (!output.has(key)) output.set(key, []);
    const list = output.get(key);
    if (!list.some((existing) => JSON.stringify(existing) === JSON.stringify(entry))) list.push(entry);
  }
}

const sorted = [...output].sort(([a], [b]) => a.localeCompare(b, "ko"));
const body = sorted.map(([name, list]) => `  ${JSON.stringify(name)}: ${JSON.stringify(list)},`).join("\n");
writeFileSync(
  OUTPUT,
  `// Generated by scripts/build-station-transfers.mjs — run \`npm run transfers:build\` to regenerate.
// Source: 서울교통공사_서울 도시철도 환승정보 (data.go.kr 15098252, 2026-09-01), 이용허락범위 제한 없음.

/**
 * [from line, train heading toward, stations it arrives from, car-door to get off, to line, train heading toward,
 * car-door to board, transfer seconds or null]
 */
export type TransferDoors = readonly [
  string,
  string,
  readonly string[],
  string,
  string,
  string,
  string,
  number | null,
];

export const TRANSFER_DATA_DATE = "2026-09-01";

/** Keyed by station name with 역, as in the station index. */
export const STATION_TRANSFERS: Readonly<Record<string, readonly TransferDoors[]>> = {
${body}
};
`,
);

console.log(`${rows.length} rows → ${sorted.length} stations, ${sorted.reduce((sum, [, list]) => sum + list.length, 0)} entries`);
console.log(`${problems.length} skipped`);
for (const problem of problems) console.log(`  ${problem}`);
