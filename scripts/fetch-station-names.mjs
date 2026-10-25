// Saves English/Japanese/Chinese labels of Korean railway stations from Wikidata to
// data/station-names-wikidata.json, the fallback for lines outside Seoul Metro's official list.
// Usage: npm run stations:names && npm run stations:build
import { writeFileSync } from "node:fs";

const OUTPUT = "data/station-names-wikidata.json";
const QUERY = `SELECT ?ko ?en ?ja ?zhhans ?zhcn ?zh ?coord WHERE {
  ?item wdt:P17 wd:Q884 ; wdt:P31/wdt:P279* wd:Q55488 ; wdt:P625 ?coord ; rdfs:label ?ko .
  FILTER(LANG(?ko) = "ko")
  OPTIONAL { ?item rdfs:label ?en . FILTER(LANG(?en) = "en") }
  OPTIONAL { ?item rdfs:label ?ja . FILTER(LANG(?ja) = "ja") }
  OPTIONAL { ?item rdfs:label ?zhhans . FILTER(LANG(?zhhans) = "zh-hans") }
  OPTIONAL { ?item rdfs:label ?zhcn . FILTER(LANG(?zhcn) = "zh-cn") }
  OPTIONAL { ?item rdfs:label ?zh . FILTER(LANG(?zh) = "zh") }
}`;
/** Capital-area bounding box; the app only lists Seoul-area stations. */
const BOUNDS = { south: 36.6, north: 38.3, west: 126.3, east: 127.9 };

const response = await fetch("https://query.wikidata.org/sparql", {
  method: "POST",
  headers: {
    Accept: "application/sparql-results+json",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "subway-ggul-build/1.0 (station name translations)",
  },
  body: new URLSearchParams({ query: QUERY }),
});
if (!response.ok) throw new Error(`Wikidata ${response.status}: ${await response.text()}`);
const { results } = await response.json();

const seen = new Set();
const stations = [];
for (const row of results.bindings) {
  const [lng, lat] = row.coord.value.replace(/Point\(|\)/g, "").split(" ").map(Number);
  if (lat < BOUNDS.south || lat > BOUNDS.north || lng < BOUNDS.west || lng > BOUNDS.east) continue;
  const station = {
    ko: row.ko.value,
    en: row.en?.value,
    ja: row.ja?.value,
    zh: row.zhhans?.value ?? row.zhcn?.value,
    zhHant: row.zhhans || row.zhcn ? undefined : row.zh?.value,
    c: [Number(lat.toFixed(5)), Number(lng.toFixed(5))],
  };
  const id = JSON.stringify(station);
  if (seen.has(id)) continue;
  seen.add(id);
  stations.push(station);
}
stations.sort((a, b) => a.ko.localeCompare(b.ko, "ko"));

writeFileSync(OUTPUT, `${JSON.stringify(stations, null, 0).replace(/\},\{/g, "},\n{")}\n`);
console.log(`Wrote ${OUTPUT}: ${stations.length} stations.`);
