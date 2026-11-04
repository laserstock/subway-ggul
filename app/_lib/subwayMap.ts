import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { DOT_R, HUB_R, labelBox, labelLines, LABEL_POSITIONS, type LabelBox } from "./mapLabel";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type MapBox = { x: number; y: number; w: number; h: number };
export type MapNode = { station: GuideStation; x: number; y: number; lines: string[]; hub: boolean };
export type MapLine = { line: string; color: string; d: string };

/** Screen px per map unit at which each label level switches on; a label with level k shows from MAP_LEVELS[k]. */
export const MAP_LEVELS = [0.45, 0.65, 0.95, 1.35, 1.9, 2.7, 3.8, 5.3, 7.4] as const;
export const MAP_MAX_ZOOM = 12;

/** Median edge length in map units once laid out. */
const EDGE = 10;
const PADDING = 24;
/** City Hall: the centre of the fisheye that gives central Seoul more room than the suburbs. */
const CENTER = { lat: 37.5657, lng: 126.9769 };
const FISHEYE_KM = 7;
const ITERATIONS = 420;

const round = (value: number) => Math.round(value * 10) / 10;
const STEP = Math.PI / 4;

type Edge = { a: number; b: number; lines: Set<string>; target: number };

/**
 * A schematic map in the style of the official diagram: positions start from a fisheye projection of
 * the real coordinates, then relax so every segment runs at a multiple of 45°, segments are roughly
 * equal in length and stations keep their distance. Segments are then drawn as octilinear elbows.
 */
export const SUBWAY_MAP = (() => {
  const services = NETWORK_EDGES.filter(([service]) => NETWORK_SERVICES[service] && !NETWORK_SERVICES[service].express);
  const indexOf = new Map<string, number>();
  const stations: GuideStation[] = [];
  const nodeOf = (networkIndex: number) => {
    const entry = NETWORK_STATIONS[networkIndex];
    const station = entry ? guideByKo(entry[0], { lat: entry[1], lng: entry[2] }) : null;
    if (!station) return null;
    if (!indexOf.has(station.slug)) {
      indexOf.set(station.slug, stations.length);
      stations.push(station);
    }
    return indexOf.get(station.slug)!;
  };

  const edgeMap = new Map<string, Edge>();
  for (const [service, from, to] of services) {
    const a = nodeOf(from);
    const b = nodeOf(to);
    if (a === null || b === null || a === b) continue;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const edge = edgeMap.get(key) ?? { a: Math.min(a, b), b: Math.max(a, b), lines: new Set<string>(), target: 0 };
    edge.lines.add(NETWORK_SERVICES[service].line);
    edgeMap.set(key, edge);
  }
  const edges = [...edgeMap.values()];
  const count = stations.length;
  const neighbors: number[][] = stations.map(() => []);
  for (const { a, b } of edges) {
    neighbors[a].push(b);
    neighbors[b].push(a);
  }

  const kmX = 111.32 * Math.cos((CENTER.lat * Math.PI) / 180);
  const anchor = stations.map((station) => {
    const x = (station.lng - CENTER.lng) * kmX;
    const y = (CENTER.lat - station.lat) * 110.57;
    const r = Math.hypot(x, y);
    const k = r ? (FISHEYE_KM * Math.log1p(r / FISHEYE_KM)) / r : 1;
    return { x: x * k, y: y * k };
  });
  const xs = anchor.map((p) => p.x);
  const ys = anchor.map((p) => p.y);

  const lengths = edges.map(({ a, b }) => Math.hypot(xs[a] - xs[b], ys[a] - ys[b])).sort((p, q) => p - q);
  const median = lengths[Math.floor(lengths.length / 2)];
  for (const edge of edges) {
    const length = Math.hypot(xs[edge.a] - xs[edge.b], ys[edge.a] - ys[edge.b]);
    const fromCenter = Math.hypot(anchor[edge.a].x + anchor[edge.b].x, anchor[edge.a].y + anchor[edge.b].y) / 2;
    const roomy = 1 + 0.8 * Math.exp(-fromCenter / 4);
    edge.target = median * 1.1 * roomy * Math.pow(Math.max(length, 0.05) / median, 0.3);
  }
  const minGap = median * 0.85;
  const gapOf = anchor.map(({ x, y }) => minGap * (1 + 0.5 * Math.exp(-Math.hypot(x, y) / 4)));
  const reach = Math.max(...gapOf);

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    const progress = iteration / ITERATIONS;
    const snap = Math.min(1, 0.15 + progress * 1.4);

    for (const edge of edges) {
      const dx = xs[edge.b] - xs[edge.a];
      const dy = ys[edge.b] - ys[edge.a];
      const length = Math.hypot(dx, dy) || 1e-6;
      const angle = Math.atan2(dy, dx);
      const snapped = Math.round(angle / STEP) * STEP;
      let ux = (1 - snap) * (dx / length) + snap * Math.cos(snapped);
      let uy = (1 - snap) * (dy / length) + snap * Math.sin(snapped);
      const norm = Math.hypot(ux, uy) || 1;
      ux /= norm;
      uy /= norm;
      const cx = (ux * edge.target - dx) * 0.25;
      const cy = (uy * edge.target - dy) * 0.25;
      xs[edge.a] -= cx;
      ys[edge.a] -= cy;
      xs[edge.b] += cx;
      ys[edge.b] += cy;
    }

    for (let node = 0; node < count; node += 1) {
      const around = neighbors[node];
      if (around.length !== 2) continue;
      const [p, q] = around;
      xs[node] += ((xs[p] + xs[q]) / 2 - xs[node]) * 0.08;
      ys[node] += ((ys[p] + ys[q]) / 2 - ys[node]) * 0.08;
    }

    const grid = new Map<string, number[]>();
    for (let node = 0; node < count; node += 1) {
      const key = `${Math.floor(xs[node] / reach)},${Math.floor(ys[node] / reach)}`;
      const cell = grid.get(key);
      if (cell) cell.push(node);
      else grid.set(key, [node]);
    }
    for (let node = 0; node < count; node += 1) {
      const gx = Math.floor(xs[node] / reach);
      const gy = Math.floor(ys[node] / reach);
      for (let ox = -1; ox <= 1; ox += 1) {
        for (let oy = -1; oy <= 1; oy += 1) {
          for (const other of grid.get(`${gx + ox},${gy + oy}`) ?? []) {
            if (other <= node) continue;
            const dx = xs[other] - xs[node];
            const dy = ys[other] - ys[node];
            const distance = Math.hypot(dx, dy) || 1e-6;
            const gap = Math.max(gapOf[node], gapOf[other]);
            if (distance >= gap) continue;
            const push = ((gap - distance) / distance) * 0.3;
            xs[node] -= dx * push;
            ys[node] -= dy * push;
            xs[other] += dx * push;
            ys[other] += dy * push;
          }
        }
      }
    }

    const pull = 0.012 * (1 - progress);
    for (let node = 0; node < count; node += 1) {
      xs[node] += (anchor[node].x - xs[node]) * pull;
      ys[node] += (anchor[node].y - ys[node]) * pull;
    }
  }

  const laid = edges.map(({ a, b }) => Math.hypot(xs[a] - xs[b], ys[a] - ys[b])).sort((p, q) => p - q);
  const scale = EDGE / laid[Math.floor(laid.length / 2)];
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const nodes: MapNode[] = stations.map((station, index) => {
    const lines = [...new Set(edges.filter(({ a, b }) => a === index || b === index).flatMap(({ lines }) => [...lines]))];
    return {
      station,
      x: round(PADDING + (xs[index] - minX) * scale),
      y: round(PADDING + (ys[index] - minY) * scale),
      lines: lines.sort(compareLines),
      hub: station.lines.length > 1,
    };
  });
  const width = Math.ceil(Math.max(...nodes.map((node) => node.x)) + PADDING);
  const height = Math.ceil(Math.max(...nodes.map((node) => node.y)) + PADDING);

  /** Each segment as straight run, 45° diagonal, straight run, so every line reads like the official diagram. */
  const elbow = (p: MapNode, q: MapNode): [number, number][] => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.min(ax, ay) < 0.6 || Math.abs(ax - ay) < 0.6) return [[p.x, p.y], [q.x, q.y]];
    const diagonal = Math.min(ax, ay);
    const half = (Math.max(ax, ay) - diagonal) / 2;
    const [hx, hy] = ax > ay ? [Math.sign(dx) * half, 0] : [0, Math.sign(dy) * half];
    const p1: [number, number] = [round(p.x + hx), round(p.y + hy)];
    const p2: [number, number] = [round(p1[0] + Math.sign(dx) * diagonal), round(p1[1] + Math.sign(dy) * diagonal)];
    return [[p.x, p.y], p1, p2, [q.x, q.y]];
  };
  const routes = edges.map(({ a, b }) => elbow(nodes[a], nodes[b]));

  const byLine = new Map<string, string[]>();
  edges.forEach((edge, index) => {
    const d = `M${routes[index].map(([x, y]) => `${x} ${y}`).join("L")}`;
    for (const line of edge.lines) byLine.set(line, [...(byLine.get(line) ?? []), d]);
  });
  const lines: MapLine[] = [...byLine]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: parts.join("") }));

  /** Points along every drawn segment, for keeping labels off the lines. */
  const linePoints: [number, number][] = [];
  for (const route of routes) {
    for (let index = 1; index < route.length; index += 1) {
      const [x0, y0] = route[index - 1];
      const [x1, y1] = route[index];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.2));
      for (let step = 0; step <= steps; step += 1) {
        linePoints.push([x0 + ((x1 - x0) * step) / steps, y0 + ((y1 - y0) * step) / steps]);
      }
    }
  }

  const central = nodes.filter(({ station }) => station.lat < 37.585 && station.lat > 37.495 && station.lng > 126.915 && station.lng < 127.06);
  const fx = Math.min(...central.map((node) => node.x));
  const fy = Math.min(...central.map((node) => node.y));
  const focus: MapBox = {
    x: fx,
    y: fy,
    w: Math.max(...central.map((node) => node.x)) - fx,
    h: Math.max(...central.map((node) => node.y)) - fy,
  };

  return { width, height, nodes, lines, linePoints, focus };
})();

export type MapLabel = { level: number; position: number };

const POPULAR = new Set(POPULAR_GUIDES.map((station) => station.slug));

/**
 * Greedy label placement for one language: at each zoom level, from the most important station down,
 * take the first position whose box clears the lines, the stations and the labels already placed.
 * A label placed at one level keeps its spot when zooming in, where everything only gets roomier.
 */
export function placeLabels(names: string[]): MapLabel[] {
  const { nodes, linePoints } = SUBWAY_MAP;
  const CELL = 4;
  const index = (points: [number, number][]) => {
    const grid = new Map<string, [number, number][]>();
    for (const [x, y] of points) {
      const key = `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
      const cell = grid.get(key);
      if (cell) cell.push([x, y]);
      else grid.set(key, [[x, y]]);
    }
    return grid;
  };
  const dots: [number, number][] = nodes.map((node) => [node.x, node.y]);
  /** Everything a label should stay off, and the looser rule for key stations: only the station dots. */
  const strict = index([...linePoints, ...dots]);
  const loose = index(dots);

  const lines = names.map(labelLines);
  const boxes = nodes.map((node, index) => LABEL_POSITIONS.map((_, position) => labelBox(position, node.hub, lines[index])));
  const key = (node: MapNode) => POPULAR.has(node.station.slug) || node.station.lines.length >= 3;
  const order = nodes
    .map((entry, i) => ({ node: i, score: (POPULAR.has(entry.station.slug) ? 10 : 0) + entry.station.lines.length * 2 + (entry.hub ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || nodes[a.node].x - nodes[b.node].x)
    .map(({ node }) => node);

  const result: (MapLabel | null)[] = nodes.map(() => null);
  const placed: number[] = [];
  const at = (index: number, box: LabelBox, z: number) => ({
    x0: nodes[index].x + box.x0 / z,
    y0: nodes[index].y + box.y0 / z,
    x1: nodes[index].x + box.x1 / z,
    y1: nodes[index].y + box.y1 / z,
  });
  const clearOfPoints = (grid: Map<string, [number, number][]>, box: LabelBox, own: MapNode, z: number) => {
    const pad = (own.hub ? HUB_R : DOT_R) / z;
    for (let gx = Math.floor((box.x0 - pad) / CELL); gx <= Math.floor((box.x1 + pad) / CELL); gx += 1) {
      for (let gy = Math.floor((box.y0 - pad) / CELL); gy <= Math.floor((box.y1 + pad) / CELL); gy += 1) {
        for (const [x, y] of grid.get(`${gx},${gy}`) ?? []) {
          if (x > box.x0 - pad && x < box.x1 + pad && y > box.y0 - pad && y < box.y1 + pad) return false;
        }
      }
    }
    return true;
  };

  const tryPlace = (node: number, level: number, grid: Map<string, [number, number][]>) => {
    const z = MAP_LEVELS[level];
    for (let position = 0; position < LABEL_POSITIONS.length; position += 1) {
      const box = at(node, boxes[node][position], z);
      if (!clearOfPoints(grid, box, nodes[node], z)) continue;
      const hit = placed.some((other) => {
        const o = at(other, boxes[other][result[other]!.position], z);
        return box.x0 < o.x1 && box.x1 > o.x0 && box.y0 < o.y1 && box.y1 > o.y0;
      });
      if (hit) continue;
      result[node] = { level, position };
      placed.push(node);
      return;
    }
  };

  MAP_LEVELS.forEach((_, level) => {
    for (const node of order) {
      if (result[node]) continue;
      tryPlace(node, level, strict);
      if (!result[node] && key(nodes[node])) tryPlace(node, level, loose);
    }
  });
  return result.map((label) => label ?? { level: MAP_LEVELS.length, position: 0 });
}
