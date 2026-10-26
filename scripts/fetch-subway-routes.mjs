// Saves every capital-area metro route from OpenStreetMap (ordered stops per service pattern) to
// data/osm-subway-routes.json, the station order source for the route finder.
// Usage: npm run routes:fetch && npm run routes:build
import { writeFileSync } from "node:fs";

const OUTPUT = "data/osm-subway-routes.json";
const BBOX = "36.6,126.3,38.3,127.9";
const QUERY = `[out:json][timeout:300];
(
  rel["type"="route"]["route"~"^(subway|light_rail|train)$"]["network"~"수도권 전철|인천도시철도"](${BBOX});
  rel["type"="route"]["route"="light_rail"]["name"~"우이신설선"](${BBOX});
)->.routes;
.routes out body;
node(r.routes);
out;`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function query() {
  let wait = 5000;
  for (let attempt = 0; attempt < 6; attempt++) {
    const endpoint = ENDPOINTS[attempt % ENDPOINTS.length];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "subway-ggul-build/1.0 (route finder)",
        },
        body: new URLSearchParams({ data: QUERY }),
      });
      if (response.ok) return response.json();
      console.warn(`${endpoint}: ${response.status}, retrying in ${wait / 1000}s`);
    } catch (error) {
      console.warn(`${endpoint}: ${error.message}, retrying in ${wait / 1000}s`);
    }
    await new Promise((resolve) => setTimeout(resolve, wait));
    wait *= 2;
  }
  throw new Error("Overpass is unavailable; try again later.");
}

const { elements } = await query();

const nodes = new Map();
for (const element of elements) if (element.type === "node") nodes.set(element.id, element);

const stops = {};
const routes = [];
for (const element of elements) {
  if (element.type !== "relation") continue;
  const members = element.members.filter((member) => member.type === "node" && nodes.has(member.ref));
  const stopMembers = members.filter((member) => member.role.startsWith("stop"));
  const chosen = stopMembers.length >= 2 ? stopMembers : members.filter((member) => member.role.startsWith("platform"));
  const ids = [];
  for (const member of chosen) {
    const node = nodes.get(member.ref);
    const name = node.tags?.["name:ko"] ?? node.tags?.name;
    if (!name) continue;
    stops[node.id] ??= [name, Number(node.lat.toFixed(6)), Number(node.lon.toFixed(6))];
    if (ids.at(-1) !== node.id) ids.push(node.id);
  }
  if (ids.length < 2) continue;
  routes.push({ id: element.id, name: element.tags.name ?? "", ref: element.tags.ref ?? "", stops: ids });
}
routes.sort((a, b) => a.name.localeCompare(b.name, "ko") || a.id - b.id);

writeFileSync(OUTPUT, `${JSON.stringify({ stops, routes })}\n`);
console.log(`Wrote ${OUTPUT}: ${routes.length} routes, ${Object.keys(stops).length} stops.`);
