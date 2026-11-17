import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { DOT_R, HUB_R, labelBox, labelLines, LABEL_POSITIONS, type LabelBox } from "./mapLabel";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type MapBox = { x: number; y: number; w: number; h: number };
export type MapNode = { station: GuideStation; x: number; y: number; lines: string[]; hub: boolean };
export type MapLine = { line: string; color: string; d: string };
export type MapTerrain = { river: string; sea: string };

/** Screen px per map unit at which each label level switches on; a label with level k shows from MAP_LEVELS[k]. */
export const MAP_LEVELS = [0.4, 0.6, 0.9, 1.3, 1.85, 2.6, 3.7, 5.2, 7.2] as const;
export const MAP_MAX_ZOOM = 12;

/** Spacing target between neighbouring stations once the layout is scaled. */
const EDGE = 10;
const PADDING = 32;
/** Geographic centre (City Hall) for bearing only — never used as a compressing fisheye. */
const GEO_CENTER = { lat: 37.5657, lng: 126.9769 };
const ITERATIONS = 480;
/** Radius of the Line 2 circle in pre-scale layout units. */
const LOOP2_R = 48;
/** Extra radius per hop away from Line 2 for suburban rays. */
const RING = 3.35;
const STEP = Math.PI / 4;

const round = (value: number) => Math.round(value * 10) / 10;

type Edge = { a: number; b: number; lines: Set<string>; target: number };

/** Undirected Line 2 graph over network station indexes. */
function line2Graph() {
  const service = NETWORK_SERVICES.findIndex((entry) => entry.line === "2호선" && !entry.express);
  const und = new Map<number, Set<number>>();
  for (const edge of NETWORK_EDGES) {
    if (edge[0] !== service) continue;
    const a = edge[1];
    const b = edge[2];
    if (!und.has(a)) und.set(a, new Set());
    if (!und.has(b)) und.set(b, new Set());
    und.get(a)!.add(b);
    und.get(b)!.add(a);
  }
  return und;
}

/** The 43-station Line 2 main loop, clockwise from City Hall through Gangnam. */
function line2LoopOrder(): number[] {
  const und = line2Graph();
  const byName = (name: string) => [...und.keys()].find((index) => NETWORK_STATIONS[index]?.[0] === name);
  const start = byName("시청역");
  if (start === undefined) return [];
  const first =
    [...und.get(start)!].find((index) => NETWORK_STATIONS[index]?.[0] === "을지로입구역") ?? [...und.get(start)!][0];
  const path = [start];
  let prev = start;
  let cur = first;
  while (cur !== start) {
    path.push(cur);
    const nbr = [...und.get(cur)!].filter((node) => node !== prev);
    let next = nbr[0];
    if (nbr.length > 1) {
      next = nbr
        .map((candidate) => {
          let p = cur;
          let c = candidate;
          let steps = 0;
          const seen = new Set([cur]);
          while (c !== start && !seen.has(c) && steps < 80) {
            seen.add(c);
            const nn = [...und.get(c)!].filter((node) => node !== p);
            if (!nn.length) break;
            p = c;
            c = nn.sort((a, b) => und.get(b)!.size - und.get(a)!.size)[0];
            steps += 1;
          }
          return { candidate, steps, back: c === start };
        })
        .sort((a, b) => Number(b.back) - Number(a.back) || b.steps - a.steps)[0].candidate;
    }
    prev = cur;
    cur = next!;
    if (path.length > 60) break;
  }
  return path;
}

const lerpAngle = (a: number, b: number, t: number) => {
  let delta = b - a;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return a + delta * t;
};

const snapAngle = (angle: number, strength: number) => {
  const snapped = Math.round(angle / STEP) * STEP;
  return lerpAngle(angle, snapped, strength);
};

/**
 * Official-style schematic layout:
 * - Line 2 main loop is a fixed circle (Gangnam at bottom).
 * - Other stations sit on radial rings by graph hops from Line 2 (no GPS fisheye),
 *   so suburbs like Paju / Soyosan stay outside the core.
 * - Edges relax onto octilinear (0° / 45° / 90°) segments with rounded corners.
 */
export const SUBWAY_MAP = (() => {
  const services = NETWORK_EDGES.filter(([service]) => NETWORK_SERVICES[service] && !NETWORK_SERVICES[service].express);
  const indexOf = new Map<string, number>();
  const stations: GuideStation[] = [];
  const networkIndexOf = new Map<number, number>();
  const nodeOf = (networkIndex: number) => {
    const entry = NETWORK_STATIONS[networkIndex];
    const station = entry ? guideByKo(entry[0], { lat: entry[1], lng: entry[2] }) : null;
    if (!station) return null;
    if (!indexOf.has(station.slug)) {
      indexOf.set(station.slug, stations.length);
      networkIndexOf.set(networkIndex, stations.length);
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

  const loopNetwork = line2LoopOrder();
  const loopNodes = loopNetwork
    .map((networkIndex) => networkIndexOf.get(networkIndex))
    .filter((index): index is number => index !== undefined);
  const onLoop = new Set(loopNodes);

  const kmX = 111.32 * Math.cos((GEO_CENTER.lat * Math.PI) / 180);
  const geo = stations.map((station) => ({
    x: (station.lng - GEO_CENTER.lng) * kmX,
    y: (GEO_CENTER.lat - station.lat) * 110.57,
  }));

  // Hop distance + Line 2 attachment (BFS). Suburbs grow outward from their gateway.
  const hops = new Array(count).fill(Infinity);
  const attach = new Array(count).fill(-1);
  const queue: number[] = [];
  for (const node of loopNodes) {
    hops[node] = 0;
    attach[node] = node;
    queue.push(node);
  }
  for (let head = 0; head < queue.length; head += 1) {
    const cur = queue[head];
    for (const next of neighbors[cur]) {
      if (hops[next] <= hops[cur] + 1) continue;
      hops[next] = hops[cur] + 1;
      attach[next] = attach[cur];
      queue.push(next);
    }
  }

  const loopGeoRadii = loopNodes.map((node) => Math.hypot(geo[node].x, geo[node].y)).sort((a, b) => a - b);
  const loopGeoR = loopGeoRadii[Math.floor(loopGeoRadii.length / 2)] || 8;
  const isInner = stations.map((_, index) => {
    if (onLoop.has(index)) return false;
    if (!Number.isFinite(hops[index])) return false;
    const geoR = Math.hypot(geo[index].x, geo[index].y);
    return geoR < loopGeoR * 0.9 && hops[index] <= 5;
  });

  const loopCenter = { x: 0, y: 0 };
  const loopAngle = (index: number) => {
    const gangnam = loopNodes.findIndex((node) => stations[node].ko === "강남역");
    const target = gangnam >= 0 ? gangnam : 0;
    return Math.PI / 2 + ((index - target) / Math.max(loopNodes.length, 1)) * Math.PI * 2;
  };
  const loopAngleOf = new Map<number, number>();
  loopNodes.forEach((node, index) => loopAngleOf.set(node, loopAngle(index)));

  const minOuterR = (index: number) => LOOP2_R + Math.max(1, hops[index]) * RING + Math.max(0, hops[index] - 6) * 1.15;

  const xs = new Array(count).fill(0);
  const ys = new Array(count).fill(0);
  const anchor = stations.map(() => ({ x: 0, y: 0 }));

  loopNodes.forEach((node, index) => {
    const angle = loopAngle(index);
    xs[node] = loopCenter.x + Math.cos(angle) * LOOP2_R;
    ys[node] = loopCenter.y + Math.sin(angle) * LOOP2_R;
    anchor[node] = { x: xs[node], y: ys[node] };
  });

  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node)) continue;
    const geoAngle = Math.atan2(geo[node].y, geo[node].x);
    const gate = attach[node];
    const gateAngle = gate >= 0 && loopAngleOf.has(gate) ? loopAngleOf.get(gate)! : geoAngle;

    if (isInner[node]) {
      const geoR = Math.hypot(geo[node].x, geo[node].y) || 1e-6;
      const r = Math.min(LOOP2_R - 6, Math.max(5, (geoR / loopGeoR) * LOOP2_R * 0.72));
      const angle = snapAngle(geoAngle, 0.35);
      xs[node] = Math.cos(angle) * r;
      ys[node] = Math.sin(angle) * r;
    } else {
      const hop = Number.isFinite(hops[node]) ? hops[node] : 18;
      // Near the gateway, follow its spoke; farther out, follow geographic bearing (still outside).
      const blend = Math.min(1, 0.25 + hop / 10);
      const angle = snapAngle(lerpAngle(gateAngle, geoAngle, blend), Math.min(0.85, 0.25 + hop / 14));
      const r = minOuterR(node);
      xs[node] = Math.cos(angle) * r;
      ys[node] = Math.sin(angle) * r;
    }
    anchor[node] = { x: xs[node], y: ys[node] };
  }

  // Orphans (no network path to Line 2): park on the geographic ray outside the circle.
  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node) || Number.isFinite(hops[node])) continue;
    const angle = snapAngle(Math.atan2(geo[node].y, geo[node].x), 0.7);
    const r = LOOP2_R + 20;
    xs[node] = Math.cos(angle) * r;
    ys[node] = Math.sin(angle) * r;
    anchor[node] = { x: xs[node], y: ys[node] };
    hops[node] = 12;
  }

  for (const edge of edges) {
    const bothLoop = onLoop.has(edge.a) && onLoop.has(edge.b);
    if (bothLoop) {
      edge.target = 2 * LOOP2_R * Math.sin(Math.PI / Math.max(loopNodes.length, 1));
      continue;
    }
    const ha = Number.isFinite(hops[edge.a]) ? hops[edge.a] : 8;
    const hb = Number.isFinite(hops[edge.b]) ? hops[edge.b] : 8;
    const ring = 1 + Math.min(ha, hb) * 0.04;
    edge.target = RING * ring;
  }

  const gapBase = RING * 0.92;
  const gapOf = stations.map((_, index) => gapBase * (onLoop.has(index) ? 0.75 : isInner[index] ? 0.9 : 1 + Math.min(hops[index], 12) * 0.02));
  const reach = Math.max(...gapOf, RING);

  const pinRadial = (node: number) => {
    if (onLoop.has(node)) {
      const angle = Math.atan2(ys[node] - loopCenter.y, xs[node] - loopCenter.x);
      xs[node] = loopCenter.x + Math.cos(angle) * LOOP2_R;
      ys[node] = loopCenter.y + Math.sin(angle) * LOOP2_R;
      return;
    }
    if (isInner[node]) {
      const r = Math.hypot(xs[node], ys[node]) || 1e-6;
      const maxR = LOOP2_R - 5;
      if (r > maxR) {
        xs[node] = (xs[node] / r) * maxR;
        ys[node] = (ys[node] / r) * maxR;
      }
      return;
    }
    const r = Math.hypot(xs[node], ys[node]) || 1e-6;
    const minR = minOuterR(node);
    if (r < minR) {
      xs[node] = (xs[node] / r) * minR;
      ys[node] = (ys[node] / r) * minR;
    }
  };

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    const progress = iteration / ITERATIONS;
    const snap = Math.min(1, 0.18 + progress * 1.2);

    for (const edge of edges) {
      if (onLoop.has(edge.a) && onLoop.has(edge.b)) continue;
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
      const cx = (ux * edge.target - dx) * 0.2;
      const cy = (uy * edge.target - dy) * 0.2;
      if (!onLoop.has(edge.a)) {
        xs[edge.a] -= cx;
        ys[edge.a] -= cy;
      }
      if (!onLoop.has(edge.b)) {
        xs[edge.b] += cx;
        ys[edge.b] += cy;
      }
    }

    for (let node = 0; node < count; node += 1) {
      if (onLoop.has(node)) continue;
      const around = neighbors[node];
      if (around.length !== 2) continue;
      const [p, q] = around;
      xs[node] += ((xs[p] + xs[q]) / 2 - xs[node]) * 0.06;
      ys[node] += ((ys[p] + ys[q]) / 2 - ys[node]) * 0.06;
    }

    const grid = new Map<string, number[]>();
    for (let node = 0; node < count; node += 1) {
      const key = `${Math.floor(xs[node] / reach)},${Math.floor(ys[node] / reach)}`;
      const cell = grid.get(key);
      if (cell) cell.push(node);
      else grid.set(key, [node]);
    }
    for (let node = 0; node < count; node += 1) {
      if (onLoop.has(node)) continue;
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
            const push = ((gap - distance) / distance) * 0.26;
            xs[node] -= dx * push;
            ys[node] -= dy * push;
            if (!onLoop.has(other)) {
              xs[other] += dx * push;
              ys[other] += dy * push;
            }
          }
        }
      }
    }

    const pull = 0.02 * (1 - progress);
    for (let node = 0; node < count; node += 1) {
      if (onLoop.has(node)) continue;
      xs[node] += (anchor[node].x - xs[node]) * pull;
      ys[node] += (anchor[node].y - ys[node]) * pull;
      pinRadial(node);
    }
    for (const node of loopNodes) pinRadial(node);
  }

  // Final even spacing on the Line 2 circle.
  loopNodes.forEach((node, index) => {
    const angle = loopAngle(index);
    xs[node] = loopCenter.x + Math.cos(angle) * LOOP2_R;
    ys[node] = loopCenter.y + Math.sin(angle) * LOOP2_R;
  });
  for (let node = 0; node < count; node += 1) {
    if (!onLoop.has(node)) pinRadial(node);
  }

  const laid = edges.map(({ a, b }) => Math.hypot(xs[a] - xs[b], ys[a] - ys[b])).sort((p, q) => p - q);
  const scale = EDGE / (laid[Math.floor(laid.length / 2)] || 1);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const toScreen = (x: number, y: number) => ({
    x: round(PADDING + (x - minX) * scale),
    y: round(PADDING + (y - minY) * scale),
  });

  const nodes: MapNode[] = stations.map((station, index) => {
    const lines = [...new Set(edges.filter(({ a, b }) => a === index || b === index).flatMap(({ lines }) => [...lines]))];
    const point = toScreen(xs[index], ys[index]);
    return {
      station,
      x: point.x,
      y: point.y,
      lines: lines.sort(compareLines),
      hub: station.lines.length > 1,
    };
  });
  const width = Math.ceil(Math.max(...nodes.map((node) => node.x)) + PADDING);
  const height = Math.ceil(Math.max(...nodes.map((node) => node.y)) + PADDING);

  const loopScreen = toScreen(loopCenter.x, loopCenter.y);
  const cx = loopScreen.x;
  const cy = loopScreen.y;
  const loopR = round(LOOP2_R * scale);

  /** Octilinear elbow with soft quadratic corners (official diagram feel). */
  const elbow = (p: MapNode, q: MapNode): [number, number][] => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.min(ax, ay) < 0.6 || Math.abs(ax - ay) < 0.6) return [
      [p.x, p.y],
      [q.x, q.y],
    ];
    const diagonal = Math.min(ax, ay);
    const half = (Math.max(ax, ay) - diagonal) / 2;
    const [hx, hy] = ax > ay ? [Math.sign(dx) * half, 0] : [0, Math.sign(dy) * half];
    const p1: [number, number] = [round(p.x + hx), round(p.y + hy)];
    const p2: [number, number] = [round(p1[0] + Math.sign(dx) * diagonal), round(p1[1] + Math.sign(dy) * diagonal)];
    return [
      [p.x, p.y],
      p1,
      p2,
      [q.x, q.y],
    ];
  };

  const roundedPath = (pts: [number, number][]) => {
    if (pts.length < 2) return "";
    if (pts.length === 2) return `M${pts[0][0]} ${pts[0][1]}L${pts[1][0]} ${pts[1][1]}`;
    const corner = 3.2;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let index = 1; index < pts.length - 1; index += 1) {
      const [x0, y0] = pts[index - 1];
      const [x1, y1] = pts[index];
      const [x2, y2] = pts[index + 1];
      const inDx = x1 - x0;
      const inDy = y1 - y0;
      const outDx = x2 - x1;
      const outDy = y2 - y1;
      const inLen = Math.hypot(inDx, inDy) || 1;
      const outLen = Math.hypot(outDx, outDy) || 1;
      const cut = Math.min(corner, inLen * 0.45, outLen * 0.45);
      const ax = round(x1 - (inDx / inLen) * cut);
      const ay = round(y1 - (inDy / inLen) * cut);
      const bx = round(x1 + (outDx / outLen) * cut);
      const by = round(y1 + (outDy / outLen) * cut);
      d += `L${ax} ${ay}Q${x1} ${y1} ${bx} ${by}`;
    }
    const last = pts[pts.length - 1];
    d += `L${last[0]} ${last[1]}`;
    return d;
  };

  const loopSet = new Set(loopNodes);
  const byLine = new Map<string, string[]>();
  edges.forEach((edge) => {
    const loopEdge = loopSet.has(edge.a) && loopSet.has(edge.b) && edge.lines.has("2호선");
    const d = roundedPath(elbow(nodes[edge.a], nodes[edge.b]));
    for (const line of edge.lines) {
      if (line === "2호선" && loopEdge) continue;
      byLine.set(line, [...(byLine.get(line) ?? []), d]);
    }
  });

  if (loopNodes.length >= 3) {
    const first = nodes[loopNodes[0]];
    const circle = `M${first.x} ${first.y}A${loopR} ${loopR} 0 1 1 ${first.x - 0.01} ${first.y}A${loopR} ${loopR} 0 1 1 ${first.x} ${first.y}`;
    byLine.set("2호선", [circle, ...(byLine.get("2호선") ?? [])]);
  }

  const lines: MapLine[] = [...byLine]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: parts.join("") }));

  // Schematic Han River (through the lower half of Line 2) + West Sea near Incheon.
  const riverW = loopR * 3.4;
  const riverY = cy + loopR * 0.28;
  const riverH = Math.max(14, loopR * 0.22);
  const river: string = [
    `M${round(cx - riverW * 0.55)} ${round(riverY - riverH * 0.15)}`,
    `C${round(cx - loopR * 0.9)} ${round(riverY - riverH * 0.55)}`,
    `${round(cx - loopR * 0.2)} ${round(riverY - riverH * 0.7)}`,
    `${round(cx + loopR * 0.15)} ${round(riverY - riverH * 0.35)}`,
    `S${round(cx + loopR * 0.85)} ${round(riverY + riverH * 0.15)}`,
    `${round(cx + loopR * 1.35)} ${round(riverY + riverH * 0.05)}`,
    `S${round(cx + riverW * 0.42)} ${round(riverY - riverH * 0.2)}`,
    `${round(cx + riverW * 0.55)} ${round(riverY - riverH * 0.35)}`,
    `L${round(cx + riverW * 0.55)} ${round(riverY + riverH * 0.85)}`,
    `C${round(cx + loopR * 1.2)} ${round(riverY + riverH * 1.05)}`,
    `${round(cx + loopR * 0.4)} ${round(riverY + riverH * 1.15)}`,
    `${round(cx - loopR * 0.1)} ${round(riverY + riverH * 0.95)}`,
    `S${round(cx - loopR * 1.05)} ${round(riverY + riverH * 0.75)}`,
    `${round(cx - riverW * 0.55)} ${round(riverY + riverH * 0.55)}`,
    "Z",
  ].join(" ");

  const seaLeft = Math.min(...nodes.map((node) => node.x)) - 4;
  const sea: string = [
    `M${round(seaLeft)} ${round(cy - loopR * 0.4)}`,
    `C${round(seaLeft + loopR * 0.15)} ${round(cy - loopR * 1.1)}`,
    `${round(cx - loopR * 2.1)} ${round(cy - loopR * 0.2)}`,
    `${round(cx - loopR * 1.75)} ${round(cy + loopR * 0.35)}`,
    `C${round(cx - loopR * 1.9)} ${round(cy + loopR * 0.9)}`,
    `${round(seaLeft + loopR * 0.35)} ${round(cy + loopR * 1.35)}`,
    `${round(seaLeft)} ${round(cy + loopR * 1.1)}`,
    "Z",
  ].join(" ");

  const terrain: MapTerrain = { river, sea };

  const linePoints: [number, number][] = [];
  for (const node of nodes) linePoints.push([node.x, node.y]);
  for (let step = 0; step < 72; step += 1) {
    const angle = (step / 72) * Math.PI * 2;
    linePoints.push([cx + Math.cos(angle) * loopR, cy + Math.sin(angle) * loopR]);
  }
  for (const edge of edges) {
    if (loopSet.has(edge.a) && loopSet.has(edge.b) && edge.lines.has("2호선")) continue;
    const route = elbow(nodes[edge.a], nodes[edge.b]);
    for (let index = 1; index < route.length; index += 1) {
      const [x0, y0] = route[index - 1];
      const [x1, y1] = route[index];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 1.2));
      for (let step = 0; step <= steps; step += 1) {
        linePoints.push([x0 + ((x1 - x0) * step) / steps, y0 + ((y1 - y0) * step) / steps]);
      }
    }
  }

  const central = loopNodes.length
    ? loopNodes.map((index) => nodes[index])
    : nodes.filter(({ station }) => station.lat < 37.585 && station.lat > 37.495 && station.lng > 126.915 && station.lng < 127.06);
  const fx = Math.min(...central.map((node) => node.x));
  const fy = Math.min(...central.map((node) => node.y));
  const focus: MapBox = {
    x: fx - 10,
    y: fy - 10,
    w: Math.max(...central.map((node) => node.x)) - fx + 20,
    h: Math.max(...central.map((node) => node.y)) - fy + 20,
  };

  return { width, height, nodes, lines, linePoints, focus, terrain, loop: { cx, cy, r: loopR } };
})();

export type MapLabel = { level: number; position: number };

const POPULAR = new Set(POPULAR_GUIDES.map((station) => station.slug));

/**
 * Greedy label placement for one language: at each zoom level, from the most important station down,
 * take the first position whose box clears the lines, the stations and the labels already placed.
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
  const strict = index([...linePoints, ...dots]);
  const loose = index(dots);

  const lines = names.map(labelLines);
  const boxes = nodes.map((node, index) => LABEL_POSITIONS.map((_, position) => labelBox(position, node.hub, lines[index])));
  const key = (node: MapNode) => POPULAR.has(node.station.slug) || node.station.lines.length >= 3;
  const order = nodes
    .map((entry, i) => ({
      node: i,
      score: (POPULAR.has(entry.station.slug) ? 10 : 0) + entry.station.lines.length * 2 + (entry.hub ? 1 : 0),
    }))
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
