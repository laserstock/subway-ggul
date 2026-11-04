import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

/** Width of the map's coordinate space; the height follows the network's shape. */
export const MAP_WIDTH = 1000;
const PADDING = 12;

/** Label tier: 1 = hubs and visitor favourites (named first), 2 = other transfer stations, 3 = the rest. */
export type MapStation = { x: number; y: number; station: GuideStation; tier: 1 | 2 | 3 };
export type MapLine = { line: string; color: string; d: string };
export type MapBox = { x: number; y: number; w: number; h: number };

const round = (value: number) => Math.round(value * 10) / 10;

/** Geographic (not schematic) map of every line, projected from station coordinates. */
export const SUBWAY_MAP = (() => {
  const edges = NETWORK_EDGES.filter(([service]) => NETWORK_SERVICES[service] && !NETWORK_SERVICES[service].express);
  const used = new Set(edges.flatMap(([, from, to]) => [from, to]));
  const points = [...used].map((index) => NETWORK_STATIONS[index]).filter((entry) => entry !== null);
  const lats = points.map((entry) => entry[1]);
  const lngs = points.map((entry) => entry[2]);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const xScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const scale = (MAP_WIDTH - PADDING * 2) / ((maxLng - minLng) * xScale);
  const project = (lat: number, lng: number) => ({
    x: round(PADDING + (lng - minLng) * xScale * scale),
    y: round(PADDING + (maxLat - lat) * scale),
  });
  const height = Math.ceil(PADDING * 2 + (maxLat - minLat) * scale);

  const segments = new Map<string, Set<string>>();
  for (const [service, from, to] of edges) {
    const a = NETWORK_STATIONS[from];
    const b = NETWORK_STATIONS[to];
    if (!a || !b) continue;
    const p = project(a[1], a[2]);
    const q = project(b[1], b[2]);
    const key = from < to ? `M${p.x} ${p.y}L${q.x} ${q.y}` : `M${q.x} ${q.y}L${p.x} ${p.y}`;
    const line = NETWORK_SERVICES[service].line;
    segments.set(line, (segments.get(line) ?? new Set()).add(key));
  }
  const lines: MapLine[] = [...segments]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: [...parts].join("") }));

  const popular = new Set(POPULAR_GUIDES.map((station) => station.slug));
  const stations = new Map<string, MapStation>();
  for (const index of used) {
    const entry = NETWORK_STATIONS[index];
    const station = entry ? guideByKo(entry[0], { lat: entry[1], lng: entry[2] }) : null;
    if (!entry || !station || stations.has(station.slug)) continue;
    const tier = popular.has(station.slug) || station.lines.length >= 3 ? 1 : station.lines.length > 1 ? 2 : 3;
    stations.set(station.slug, { ...project(entry[1], entry[2]), station, tier });
  }

  const topLeft = project(37.69, 126.8);
  const bottomRight = project(37.44, 127.19);
  const focus: MapBox = { x: topLeft.x, y: topLeft.y, w: bottomRight.x - topLeft.x, h: bottomRight.y - topLeft.y };

  return {
    width: MAP_WIDTH,
    height,
    lines,
    stations: [...stations.values()].sort((a, b) => b.tier - a.tier),
    /** Central Seoul, the view the map opens on. */
    focus,
  };
})();
