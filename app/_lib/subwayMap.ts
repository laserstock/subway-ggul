import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { DOT_R, HUB_R, labelBox, labelLines, LABEL_POSITIONS, type LabelBox } from "./mapLabel";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type MapBox = { x: number; y: number; w: number; h: number };
export type MapNode = { station: GuideStation; x: number; y: number; lines: string[]; hub: boolean };
export type MapLine = { line: string; color: string; d: string };
export type MapTerrain = { river: string; sea: string };

/** Screen px per map unit at which each label level switches on; a label with level k shows from MAP_LEVELS[k]. */
export const MAP_LEVELS = [0.35, 0.55, 0.85, 1.2, 1.7, 2.4, 3.4, 4.8, 6.8] as const;
export const MAP_MAX_ZOOM = 12;

const EDGE = 9.5;
const PADDING = 34;
const GEO_CENTER = { lat: 37.5657, lng: 126.9769 };
/** Han River latitude by longitude (the river bends; a single cut misplaces Yeouido/Apgujeong/Ichon). */
function riverLatAt(lng: number) {
  if (lng < 126.95) return 37.528; // Yeouido south, Mapo north
  if (lng < 127.02) return 37.518; // Ichon north, Dongjak south
  return 37.533; // Oksu north, Apgujeong/Cheongdam south
}
const ITERATIONS = 460;
/** Line 2 KakaoMetro-style rounded rectangle (pre-scale units). */
const LOOP2_W = 100;
const LOOP2_H = 92;
const LOOP2_CORNER = 24;
const RING = 3.2;
const STEP = Math.PI / 4;

const round = (value: number) => Math.round(value * 10) / 10;

type Edge = { a: number; b: number; lines: Set<string>; target: number };
type Pt = { x: number; y: number };

/** Perimeter length of a rounded rectangle. */
function roundedRectPerimeter(w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  return 2 * (w - 2 * rr) + 2 * (h - 2 * rr) + 2 * Math.PI * rr;
}

/**
 * Point and outward normal on a rounded rectangle centered at origin.
 * `s` is arc length from the middle of the top edge, clockwise (y grows downward).
 */
function roundedRectFrame(s: number, w: number, h: number, r: number): { point: Pt; normal: Pt } {
  const rr = Math.min(r, w / 2, h / 2);
  const perim = roundedRectPerimeter(w, h, rr);
  let d = ((s % perim) + perim) % perim;
  const top = w - 2 * rr;
  const right = h - 2 * rr;
  const bottom = top;
  const left = right;
  const arc = (Math.PI / 2) * rr;

  // Start at top-edge midpoint going right, so Gangnam can sit on the bottom midpoint.
  const start = top / 2;
  d = (d + start) % perim;

  if (d <= top) {
    return { point: { x: -w / 2 + rr + d, y: -h / 2 }, normal: { x: 0, y: -1 } };
  }
  d -= top;
  if (d <= arc) {
    const a = -Math.PI / 2 + d / rr;
    return {
      point: { x: w / 2 - rr + Math.cos(a) * rr, y: -h / 2 + rr + Math.sin(a) * rr },
      normal: { x: Math.cos(a), y: Math.sin(a) },
    };
  }
  d -= arc;
  if (d <= right) {
    return { point: { x: w / 2, y: -h / 2 + rr + d }, normal: { x: 1, y: 0 } };
  }
  d -= right;
  if (d <= arc) {
    const a = 0 + d / rr;
    return {
      point: { x: w / 2 - rr + Math.cos(a) * rr, y: h / 2 - rr + Math.sin(a) * rr },
      normal: { x: Math.cos(a), y: Math.sin(a) },
    };
  }
  d -= arc;
  if (d <= bottom) {
    return { point: { x: w / 2 - rr - d, y: h / 2 }, normal: { x: 0, y: 1 } };
  }
  d -= bottom;
  if (d <= arc) {
    const a = Math.PI / 2 + d / rr;
    return {
      point: { x: -w / 2 + rr + Math.cos(a) * rr, y: h / 2 - rr + Math.sin(a) * rr },
      normal: { x: Math.cos(a), y: Math.sin(a) },
    };
  }
  d -= arc;
  if (d <= left) {
    return { point: { x: -w / 2, y: h / 2 - rr - d }, normal: { x: -1, y: 0 } };
  }
  d -= left;
  const a = Math.PI + d / rr;
  return {
    point: { x: -w / 2 + rr + Math.cos(a) * rr, y: -h / 2 + rr + Math.sin(a) * rr },
    normal: { x: Math.cos(a), y: Math.sin(a) },
  };
}

/** SVG path for the Line 2 rounded rectangle (screen coords). */
function roundedRectPath(cx: number, cy: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  const x0 = round(cx - w / 2);
  const y0 = round(cy - h / 2);
  const x1 = round(cx + w / 2);
  const y1 = round(cy + h / 2);
  const rad = round(rr);
  return [
    `M${x0 + rad} ${y0}`,
    `L${x1 - rad} ${y0}`,
    `A${rad} ${rad} 0 0 1 ${x1} ${y0 + rad}`,
    `L${x1} ${y1 - rad}`,
    `A${rad} ${rad} 0 0 1 ${x1 - rad} ${y1}`,
    `L${x0 + rad} ${y1}`,
    `A${rad} ${rad} 0 0 1 ${x0} ${y1 - rad}`,
    `L${x0} ${y0 + rad}`,
    `A${rad} ${rad} 0 0 1 ${x0 + rad} ${y0}`,
    "Z",
  ].join("");
}

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
 * KakaoMetro-style schematic:
 * - Line 2 is a rounded rectangle (not GPS).
 * - Other stations sit on outward rings by hops from Line 2; suburbs never enter the core.
 * - Han River splits north/south banks; edges snap to octilinear rounded paths.
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
  const loopPerim = roundedRectPerimeter(LOOP2_W, LOOP2_H, LOOP2_CORNER);

  const kmX = 111.32 * Math.cos((GEO_CENTER.lat * Math.PI) / 180);
  const geo = stations.map((station) => ({
    x: (station.lng - GEO_CENTER.lng) * kmX,
    y: (GEO_CENTER.lat - station.lat) * 110.57,
  }));
  const northOfRiver = stations.map((station) => station.lat >= riverLatAt(station.lng));

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
    return Math.hypot(geo[index].x, geo[index].y) < loopGeoR * 0.88 && hops[index] <= 5;
  });

  // Gangnam at bottom midpoint; other loop stations evenly along the rounded rectangle.
  const gangnamIndex = Math.max(
    0,
    loopNodes.findIndex((node) => stations[node].ko === "강남역"),
  );
  const bottomMidS = loopPerim / 2;
  const loopS = new Map<number, number>();
  loopNodes.forEach((node, index) => {
    const s = bottomMidS + ((index - gangnamIndex) / loopNodes.length) * loopPerim;
    loopS.set(node, ((s % loopPerim) + loopPerim) % loopPerim);
  });

  const riverY = LOOP2_H * 0.12;
  const xs = new Array(count).fill(0);
  const ys = new Array(count).fill(0);
  const anchor = stations.map(() => ({ x: 0, y: 0 }));

  const placeLoop = (node: number) => {
    const frame = roundedRectFrame(loopS.get(node) ?? 0, LOOP2_W, LOOP2_H, LOOP2_CORNER);
    xs[node] = frame.point.x;
    ys[node] = frame.point.y;
    anchor[node] = { x: xs[node], y: ys[node] };
  };
  for (const node of loopNodes) placeLoop(node);

  const gateS = (node: number) => {
    const gate = attach[node];
    if (gate >= 0 && loopS.has(gate)) return loopS.get(gate)!;
    // Approximate s from geographic angle around the rectangle.
    const angle = Math.atan2(geo[node].y, geo[node].x);
    return ((angle / (Math.PI * 2) + 0.25) * loopPerim + loopPerim) % loopPerim;
  };

  const minOutset = (index: number) => Math.max(1, hops[index]) * RING + Math.max(0, hops[index] - 6) * 1.1;

  const applyRiverBank = (node: number) => {
    if (onLoop.has(node)) return;
    const margin = 3.5;
    if (northOfRiver[node] && ys[node] > riverY - margin) ys[node] = riverY - margin;
    if (!northOfRiver[node] && ys[node] < riverY + margin) ys[node] = riverY + margin;
  };

  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node)) continue;
    if (isInner[node]) {
      const scale = 0.62;
      xs[node] = Math.max(-LOOP2_W * 0.38, Math.min(LOOP2_W * 0.38, (geo[node].x / loopGeoR) * (LOOP2_W / 2) * scale));
      ys[node] = Math.max(-LOOP2_H * 0.38, Math.min(LOOP2_H * 0.38, (geo[node].y / loopGeoR) * (LOOP2_H / 2) * scale));
      applyRiverBank(node);
    } else {
      const hop = Number.isFinite(hops[node]) ? hops[node] : 14;
      const s = gateS(node);
      const geoAngle = Math.atan2(geo[node].y, geo[node].x);
      const gateFrame = roundedRectFrame(s, LOOP2_W, LOOP2_H, LOOP2_CORNER);
      const gateAngle = Math.atan2(gateFrame.normal.y, gateFrame.normal.x);
      const blend = Math.min(1, 0.2 + hop / 11);
      const angle = snapAngle(lerpAngle(gateAngle, geoAngle, blend), Math.min(0.9, 0.3 + hop / 12));
      const outset = minOutset(node);
      const base = roundedRectFrame(s, LOOP2_W, LOOP2_H, LOOP2_CORNER);
      // Mix spoke normal with snapped geographic direction so lines stay octilinear-ish.
      const nx = (1 - blend * 0.45) * base.normal.x + blend * 0.45 * Math.cos(angle);
      const ny = (1 - blend * 0.45) * base.normal.y + blend * 0.45 * Math.sin(angle);
      const nLen = Math.hypot(nx, ny) || 1;
      xs[node] = base.point.x + (nx / nLen) * outset;
      ys[node] = base.point.y + (ny / nLen) * outset;
      applyRiverBank(node);
    }
    anchor[node] = { x: xs[node], y: ys[node] };
  }

  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node) || Number.isFinite(hops[node])) continue;
    const frame = roundedRectFrame(gateS(node), LOOP2_W, LOOP2_H, LOOP2_CORNER);
    xs[node] = frame.point.x + frame.normal.x * 22;
    ys[node] = frame.point.y + frame.normal.y * 22;
    applyRiverBank(node);
    anchor[node] = { x: xs[node], y: ys[node] };
    hops[node] = 12;
  }

  for (const edge of edges) {
    if (onLoop.has(edge.a) && onLoop.has(edge.b)) {
      edge.target = loopPerim / Math.max(loopNodes.length, 1);
      continue;
    }
    const ha = Number.isFinite(hops[edge.a]) ? hops[edge.a] : 8;
    const hb = Number.isFinite(hops[edge.b]) ? hops[edge.b] : 8;
    edge.target = RING * (1 + Math.min(ha, hb) * 0.035);
  }

  const gapBase = RING * 0.9;
  const gapOf = stations.map((_, index) => gapBase * (onLoop.has(index) ? 0.7 : isInner[index] ? 0.88 : 1 + Math.min(hops[index], 12) * 0.02));
  const reach = Math.max(...gapOf, RING);

  const insideLoop = (x: number, y: number) => {
    const ax = Math.abs(x);
    const ay = Math.abs(y);
    const hw = LOOP2_W / 2 - 4;
    const hh = LOOP2_H / 2 - 4;
    const rr = LOOP2_CORNER - 2;
    if (ax <= hw - rr && ay <= hh) return true;
    if (ay <= hh - rr && ax <= hw) return true;
    const cx = hw - rr;
    const cy = hh - rr;
    if (ax > cx && ay > cy) return Math.hypot(ax - cx, ay - cy) <= rr;
    return ax <= hw && ay <= hh;
  };

  const pinNode = (node: number) => {
    if (onLoop.has(node)) {
      placeLoop(node);
      return;
    }
    if (isInner[node]) {
      if (!insideLoop(xs[node], ys[node])) {
        const scale = 0.9;
        xs[node] *= scale;
        ys[node] *= scale;
      }
      applyRiverBank(node);
      return;
    }
    // Keep suburbs outside the rounded rectangle.
    if (insideLoop(xs[node], ys[node])) {
      const s = gateS(node);
      const frame = roundedRectFrame(s, LOOP2_W, LOOP2_H, LOOP2_CORNER);
      const outset = minOutset(node);
      xs[node] = frame.point.x + frame.normal.x * outset;
      ys[node] = frame.point.y + frame.normal.y * outset;
    }
    applyRiverBank(node);
  };

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    const progress = iteration / ITERATIONS;
    const snap = Math.min(1, 0.2 + progress * 1.15);

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
      xs[node] += ((xs[p] + xs[q]) / 2 - xs[node]) * 0.055;
      ys[node] += ((ys[p] + ys[q]) / 2 - ys[node]) * 0.055;
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
            const push = ((gap - distance) / distance) * 0.25;
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

    const pull = 0.018 * (1 - progress);
    for (let node = 0; node < count; node += 1) {
      if (onLoop.has(node)) continue;
      xs[node] += (anchor[node].x - xs[node]) * pull;
      ys[node] += (anchor[node].y - ys[node]) * pull;
      pinNode(node);
    }
    for (const node of loopNodes) pinNode(node);
  }

  for (const node of loopNodes) pinNode(node);
  for (let node = 0; node < count; node += 1) {
    if (!onLoop.has(node)) pinNode(node);
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

  const origin = toScreen(0, 0);
  const cx = origin.x;
  const cy = origin.y;
  const loopW = round(LOOP2_W * scale);
  const loopH = round(LOOP2_H * scale);
  const loopR = round(LOOP2_CORNER * scale);
  const riverScreenY = toScreen(0, riverY).y;

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
    const corner = 3.6;
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
    const rect = roundedRectPath(cx, cy, loopW, loopH, loopR);
    byLine.set("2호선", [rect, ...(byLine.get("2호선") ?? [])]);
  }

  const lines: MapLine[] = [...byLine]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: parts.join("") }));

  const riverHalf = Math.max(16, loopH * 0.2);
  const river: string = [
    `M${round(cx - loopW * 1.55)} ${round(riverScreenY - riverHalf * 0.2)}`,
    `C${round(cx - loopW * 0.85)} ${round(riverScreenY - riverHalf * 0.85)}`,
    `${round(cx - loopW * 0.25)} ${round(riverScreenY - riverHalf * 0.95)}`,
    `${round(cx + loopW * 0.05)} ${round(riverScreenY - riverHalf * 0.35)}`,
    `S${round(cx + loopW * 0.55)} ${round(riverScreenY + riverHalf * 0.15)}`,
    `${round(cx + loopW * 0.95)} ${round(riverScreenY - riverHalf * 0.05)}`,
    `S${round(cx + loopW * 1.45)} ${round(riverScreenY - riverHalf * 0.4)}`,
    `${round(cx + loopW * 1.65)} ${round(riverScreenY - riverHalf * 0.55)}`,
    `L${round(cx + loopW * 1.65)} ${round(riverScreenY + riverHalf * 0.95)}`,
    `C${round(cx + loopW * 1.15)} ${round(riverScreenY + riverHalf * 1.15)}`,
    `${round(cx + loopW * 0.45)} ${round(riverScreenY + riverHalf * 1.2)}`,
    `${round(cx - loopW * 0.05)} ${round(riverScreenY + riverHalf * 0.95)}`,
    `S${round(cx - loopW * 0.95)} ${round(riverScreenY + riverHalf * 0.7)}`,
    `${round(cx - loopW * 1.55)} ${round(riverScreenY + riverHalf * 0.55)}`,
    "Z",
  ].join(" ");

  const seaLeft = Math.min(...nodes.map((node) => node.x)) - 2;
  const sea: string = [
    `M${round(seaLeft)} ${round(cy - loopH * 0.55)}`,
    `C${round(seaLeft + loopW * 0.12)} ${round(cy - loopH * 1.05)}`,
    `${round(cx - loopW * 1.15)} ${round(cy - loopH * 0.15)}`,
    `${round(cx - loopW * 0.95)} ${round(cy + loopH * 0.25)}`,
    `C${round(cx - loopW * 1.05)} ${round(cy + loopH * 0.85)}`,
    `${round(seaLeft + loopW * 0.2)} ${round(cy + loopH * 1.25)}`,
    `${round(seaLeft)} ${round(cy + loopH * 0.95)}`,
    "Z",
  ].join(" ");

  const terrain: MapTerrain = { river, sea };

  const linePoints: [number, number][] = [];
  for (const node of nodes) linePoints.push([node.x, node.y]);
  for (let step = 0; step < 96; step += 1) {
    const frame = roundedRectFrame((step / 96) * loopPerim, LOOP2_W, LOOP2_H, LOOP2_CORNER);
    const point = toScreen(frame.point.x, frame.point.y);
    linePoints.push([point.x, point.y]);
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
    x: fx - 12,
    y: fy - 12,
    w: Math.max(...central.map((node) => node.x)) - fx + 24,
    h: Math.max(...central.map((node) => node.y)) - fy + 24,
  };

  return {
    width,
    height,
    nodes,
    lines,
    linePoints,
    focus,
    terrain,
    loop: { cx, cy, w: loopW, h: loopH, r: loopR },
  };
})();

export type MapLabel = { level: number; position: number };

const POPULAR = new Set(POPULAR_GUIDES.map((station) => station.slug));
/** Extra hubs that should show names early (KakaoMetro-style LOD). */
const PRIORITY_KO = new Set([
  "서울역",
  "명동역",
  "홍대입구역",
  "강남역",
  "시청역",
  "성수역",
  "잠실역",
  "신도림역",
  "사당역",
  "교대역",
  "동대문역사문화공원역",
  "왕십리역",
  "합정역",
  "여의도역",
  "고속터미널역",
  "건대입구역",
  "이태원역",
  "광화문역",
  "종로3가역",
  "을지로3가역",
]);

/**
 * Greedy label placement for one language: priority hubs first at low zoom,
 * then remaining stations as the user zooms in.
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
  const priority = (node: MapNode) => POPULAR.has(node.station.slug) || PRIORITY_KO.has(node.station.ko);
  const order = nodes
    .map((entry, i) => ({
      node: i,
      score:
        (POPULAR.has(entry.station.slug) ? 14 : 0) +
        (PRIORITY_KO.has(entry.station.ko) ? 8 : 0) +
        entry.station.lines.length * 2 +
        (entry.hub ? 2 : 0),
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

  // Pass 1: priority hubs — collide only with other labels (not every line sample), so defaults stay readable.
  for (let level = 0; level < 2; level += 1) {
    for (const node of order) {
      if (result[node] || !priority(nodes[node])) continue;
      tryPlace(node, level, loose);
    }
  }
  // Pass 2: remaining stations, avoiding lines when possible.
  MAP_LEVELS.forEach((_, level) => {
    for (const node of order) {
      if (result[node]) continue;
      tryPlace(node, level, strict);
      if (!result[node] && (priority(nodes[node]) || nodes[node].hub)) tryPlace(node, level, loose);
    }
  });
  // Guarantee top tourist/transfer names appear by the second zoom step.
  for (const node of order) {
    if (!priority(nodes[node])) continue;
    if (!result[node]) result[node] = { level: 1, position: 0 };
    else result[node] = { level: Math.min(result[node].level, 1), position: result[node].position };
  }
  return result.map((label) => label ?? { level: MAP_LEVELS.length, position: 0 });
}
