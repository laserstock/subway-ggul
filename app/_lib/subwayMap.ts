import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { DOT_R, HUB_R, labelBox, labelLines, LABEL_POSITIONS, type LabelBox } from "./mapLabel";
import { CANVAS, LINE2_ANCHORS, TRANSFER_HUBS } from "./schematicHubs";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type MapBox = { x: number; y: number; w: number; h: number };
export type MapNode = { station: GuideStation; x: number; y: number; lines: string[]; hub: boolean };
export type MapLine = { line: string; color: string; d: string };
/** River is a stroke path (Kakao-style band); sea optional fill. */
export type MapTerrain = { river: string; sea: string };

/** Level thresholds; regular station labels unlock at index of 1.4. */
export const MAP_LEVELS = [0.5, 0.85, 1.1, 1.4, 1.8, 2.5, 3.5, 5, 7] as const;
export const MAP_MAX_ZOOM = 12;
export const REGULAR_LABEL_LEVEL = MAP_LEVELS.indexOf(1.4);

const PADDING = 24;
const CORNER_R = 8;
const round = (value: number) => Math.round(value * 10) / 10;

type Pt = { x: number; y: number };

/** Only H / V / 45° segments between two points. */
function octilinearWaypoints(a: Pt, b: Pt): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 0.01 && ay < 0.01) return [a, b];
  if (Math.min(ax, ay) < 0.01 || Math.abs(ax - ay) < 0.01) return [a, b];
  const diagonal = Math.min(ax, ay);
  const rest = Math.max(ax, ay) - diagonal;
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  if (ax >= ay) {
    const mid1 = { x: a.x + sx * (rest / 2), y: a.y };
    const mid2 = { x: mid1.x + sx * diagonal, y: mid1.y + sy * diagonal };
    return [a, mid1, mid2, b];
  }
  const mid1 = { x: a.x, y: a.y + sy * (rest / 2) };
  const mid2 = { x: mid1.x + sx * diagonal, y: mid1.y + sy * diagonal };
  return [a, mid1, mid2, b];
}

/**
 * Build an SVG path that only uses horizontal, vertical, and 45° segments,
 * with Quadratic Bezier fillets (radius ≈ 8px) at corners.
 */
export function createOctilinearPath(points: Pt[]): string {
  if (points.length < 2) return "";
  const raw: Pt[] = [{ x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i += 1) {
    const way = octilinearWaypoints(raw[raw.length - 1], points[i]);
    for (let j = 1; j < way.length; j += 1) raw.push(way[j]);
  }
  const simplified: Pt[] = [raw[0]];
  for (let i = 1; i < raw.length - 1; i += 1) {
    const prev = simplified[simplified.length - 1];
    const cur = raw[i];
    const next = raw[i + 1];
    const ax = cur.x - prev.x;
    const ay = cur.y - prev.y;
    const bx = next.x - cur.x;
    const by = next.y - cur.y;
    if (Math.abs(ax * by - ay * bx) < 0.05 && ax * bx + ay * by > 0) continue;
    simplified.push(cur);
  }
  simplified.push(raw[raw.length - 1]);

  if (simplified.length === 2) {
    return `M${round(simplified[0].x)} ${round(simplified[0].y)}L${round(simplified[1].x)} ${round(simplified[1].y)}`;
  }

  let d = `M${round(simplified[0].x)} ${round(simplified[0].y)}`;
  for (let i = 1; i < simplified.length - 1; i += 1) {
    const p0 = simplified[i - 1];
    const p1 = simplified[i];
    const p2 = simplified[i + 1];
    const inDx = p1.x - p0.x;
    const inDy = p1.y - p0.y;
    const outDx = p2.x - p1.x;
    const outDy = p2.y - p1.y;
    const inLen = Math.hypot(inDx, inDy) || 1;
    const outLen = Math.hypot(outDx, outDy) || 1;
    const cut = Math.min(CORNER_R, inLen * 0.45, outLen * 0.45);
    d += `L${round(p1.x - (inDx / inLen) * cut)} ${round(p1.y - (inDy / inLen) * cut)}`;
    d += `Q${round(p1.x)} ${round(p1.y)} ${round(p1.x + (outDx / outLen) * cut)} ${round(p1.y + (outDy / outLen) * cut)}`;
  }
  const last = simplified[simplified.length - 1];
  d += `L${round(last.x)} ${round(last.y)}`;
  return d;
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pathLength(pts: Pt[]) {
  let total = 0;
  for (let i = 1; i < pts.length; i += 1) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return total;
}

/** Equal spacing along an octilinear corridor (stations sit on the stroke). */
function pointAlong(pts: Pt[], t: number): Pt {
  if (pts.length === 1) return pts[0];
  const total = pathLength(pts) || 1;
  let remain = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i += 1) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) || 1e-6;
    if (remain <= seg) {
      const u = remain / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
      };
    }
    remain -= seg;
  }
  return pts[pts.length - 1];
}

function linePaths(neighbors: Map<number, number[]>, skipAllIn?: Set<number>): number[][] {
  const paths: number[][] = [];
  const used = new Set<string>();
  const edgeKey = (a: number, b: number) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const degree = (node: number) => neighbors.get(node)?.length ?? 0;
  const starts = [...neighbors.keys()].filter((node) => degree(node) !== 2).sort((a, b) => a - b);
  const seeds = starts.length ? starts : [...neighbors.keys()].sort((a, b) => a - b);
  for (const start of seeds) {
    for (const first of neighbors.get(start) ?? []) {
      if (used.has(edgeKey(start, first))) continue;
      const path = [start];
      let prev = start;
      let cur = first;
      used.add(edgeKey(start, first));
      while (true) {
        path.push(cur);
        if (degree(cur) !== 2) break;
        const next = (neighbors.get(cur) ?? []).find((node) => node !== prev);
        if (next === undefined || used.has(edgeKey(cur, next))) break;
        used.add(edgeKey(cur, next));
        prev = cur;
        cur = next;
        if (path.length > 220) break;
      }
      if (skipAllIn && path.length >= 2 && path.every((node) => skipAllIn.has(node))) continue;
      if (path.length >= 2) paths.push(path);
    }
  }
  return paths;
}

function line2Graph() {
  const service = NETWORK_SERVICES.findIndex((entry) => entry.line === "2호선" && !entry.express);
  const und = new Map<number, Set<number>>();
  for (const edge of NETWORK_EDGES) {
    if (edge[0] !== service) continue;
    if (!und.has(edge[1])) und.set(edge[1], new Set());
    if (!und.has(edge[2])) und.set(edge[2], new Set());
    und.get(edge[1])!.add(edge[2]);
    und.get(edge[2])!.add(edge[1]);
  }
  return und;
}

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

/**
 * Integer-grid schematic map (1000×1000):
 * - Line 2 = fixed rounded-rectangle anchors
 * - Other transfers = TRANSFER_HUBS
 * - Intermediates = equal linear interpolation between hubs (never GPS curves)
 * - Strokes = createOctilinearPath (H/V/45° + Q r=8)
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

  type Edge = { a: number; b: number; lines: Set<string> };
  const edgeMap = new Map<string, Edge>();
  const lineNeighbors = new Map<string, Map<number, number[]>>();
  for (const [service, from, to] of services) {
    const a = nodeOf(from);
    const b = nodeOf(to);
    if (a === null || b === null || a === b) continue;
    const line = NETWORK_SERVICES[service].line;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    const edge = edgeMap.get(key) ?? { a: Math.min(a, b), b: Math.max(a, b), lines: new Set<string>() };
    edge.lines.add(line);
    edgeMap.set(key, edge);
    if (!lineNeighbors.has(line)) lineNeighbors.set(line, new Map());
    const graph = lineNeighbors.get(line)!;
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    if (!graph.get(a)!.includes(b)) graph.get(a)!.push(b);
    if (!graph.get(b)!.includes(a)) graph.get(b)!.push(a);
  }
  const edges = [...edgeMap.values()];
  const count = stations.length;

  const xs = new Array(count).fill(0);
  const ys = new Array(count).fill(0);
  const fixed = new Array(count).fill(false);

  const pin = (node: number, x: number, y: number) => {
    xs[node] = x;
    ys[node] = y;
    fixed[node] = true;
  };

  // 1) Pin Line 2 loop from integer anchors.
  const loopNetwork = line2LoopOrder();
  const loopNodes = loopNetwork
    .map((networkIndex) => networkIndexOf.get(networkIndex))
    .filter((index): index is number => index !== undefined);
  const onLoop = new Set(loopNodes);
  const line2ByKo = new Map(LINE2_ANCHORS.map((entry) => [entry.ko, entry]));

  loopNodes.forEach((node) => {
    const hit = line2ByKo.get(stations[node].ko);
    if (hit) pin(node, hit.x, hit.y);
  });

  // Interpolate any Line 2 loop station missing from the anchor list.
  {
    const marks = loopNodes.map((node, index) => ({ node, index })).filter(({ node }) => fixed[node]);
    for (let m = 0; m < marks.length; m += 1) {
      const from = marks[m];
      const to = marks[(m + 1) % marks.length];
      const span =
        to.index > from.index ? to.index - from.index : to.index + loopNodes.length - from.index;
      if (span <= 1) continue;
      for (let step = 1; step < span; step += 1) {
        const node = loopNodes[(from.index + step) % loopNodes.length];
        if (fixed[node]) continue;
        const point = lerp({ x: xs[from.node], y: ys[from.node] }, { x: xs[to.node], y: ys[to.node] }, step / span);
        pin(node, round(point.x), round(point.y));
      }
    }
  }

  // 2) Pin transfer hubs from the integer grid table.
  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node)) continue;
    const hub = TRANSFER_HUBS[stations[node].ko];
    if (hub) pin(node, hub.x, hub.y);
  }

  /** Place stations on a line path by linear interpolation between fixed hubs. */
  const placeLinePath = (path: number[]) => {
    if (path.length < 2) return;
    let marks = path.map((node, index) => ({ node, index })).filter(({ node }) => fixed[node]);
    if (marks.length < 2) return;

    // Prefix before first hub: equal spacing extending backward along first corridor direction.
    if (marks[0].index > 0) {
      const a = marks[0];
      const b = marks[1] ?? a;
      const dx = xs[a.node] - xs[b.node];
      const dy = ys[a.node] - ys[b.node];
      const len = Math.hypot(dx, dy) || 1;
      const stepLen = len / Math.max(b.index - a.index, 1);
      for (let i = a.index - 1; i >= 0; i -= 1) {
        const dist = (a.index - i) * stepLen;
        pin(path[i], round(xs[a.node] + (dx / len) * dist), round(ys[a.node] + (dy / len) * dist));
      }
      marks = path.map((node, index) => ({ node, index })).filter(({ node }) => fixed[node]);
    }

    // Suffix after last hub.
    const last = marks[marks.length - 1];
    if (last.index < path.length - 1) {
      const prev = marks[marks.length - 2] ?? last;
      const dx = xs[last.node] - xs[prev.node];
      const dy = ys[last.node] - ys[prev.node];
      const len = Math.hypot(dx, dy) || 1;
      const stepLen = len / Math.max(last.index - prev.index, 1);
      for (let i = last.index + 1; i < path.length; i += 1) {
        const dist = (i - last.index) * stepLen;
        pin(path[i], round(xs[last.node] + (dx / len) * dist), round(ys[last.node] + (dy / len) * dist));
      }
      marks = path.map((node, index) => ({ node, index })).filter(({ node }) => fixed[node]);
    }

    for (let m = 0; m < marks.length - 1; m += 1) {
      const from = marks[m];
      const to = marks[m + 1];
      const span = to.index - from.index;
      if (span <= 1) continue;
      const corridor = octilinearWaypoints(
        { x: xs[from.node], y: ys[from.node] },
        { x: xs[to.node], y: ys[to.node] },
      );
      for (let step = 1; step < span; step += 1) {
        const node = path[from.index + step];
        if (onLoop.has(node)) continue;
        if (fixed[node] && (TRANSFER_HUBS[stations[node].ko] || stations[node].lines.length > 1)) continue;
        const point = pointAlong(corridor, step / span);
        pin(node, round(point.x), round(point.y));
      }
    }
  };

  const lineOrder = [...lineNeighbors.keys()].sort((a, b) => {
    if (a === "2호선") return -1;
    if (b === "2호선") return 1;
    return compareLines(a, b);
  });

  // Multiple passes so lines that share later hubs still fill cleanly.
  for (let pass = 0; pass < 3; pass += 1) {
    for (const line of lineOrder) {
      for (const path of linePaths(lineNeighbors.get(line)!, line === "2호선" ? onLoop : undefined)) {
        placeLinePath(path);
      }
    }
  }

  // Any leftover (isolated) stations: park near nearest fixed neighbor on the network.
  const allNeighbors: number[][] = stations.map(() => []);
  for (const { a, b } of edges) {
    allNeighbors[a].push(b);
    allNeighbors[b].push(a);
  }
  for (let roundPass = 0; roundPass < 8; roundPass += 1) {
    let moved = false;
    for (let node = 0; node < count; node += 1) {
      if (fixed[node]) continue;
      const nbr = allNeighbors[node].filter((n) => fixed[n]);
      if (!nbr.length) continue;
      const sx = nbr.reduce((s, n) => s + xs[n], 0) / nbr.length;
      const sy = nbr.reduce((s, n) => s + ys[n], 0) / nbr.length;
      pin(node, round(sx + 12), round(sy + 12));
      moved = true;
    }
    if (!moved) break;
  }
  for (let node = 0; node < count; node += 1) {
    if (!fixed[node]) pin(node, CANVAS / 2, CANVAS / 2);
  }

  // Re-assert Line 2 anchors (never overwritten).
  loopNodes.forEach((node) => {
    const hit = line2ByKo.get(stations[node].ko);
    if (hit) pin(node, hit.x, hit.y);
  });

  const toScreen = (x: number, y: number) => ({
    x: round(PADDING + x),
    y: round(PADDING + y),
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

  const width = CANVAS + PADDING * 2;
  const height = CANVAS + PADDING * 2;

  const strokeForPath = (path: number[]) => {
    if (path.length < 2) return "";
    return createOctilinearPath(path.map((node) => ({ x: nodes[node].x, y: nodes[node].y })));
  };

  const byLine = new Map<string, string[]>();
  for (const line of lineOrder) {
    if (line === "2호선" && loopNodes.length >= 3) {
      const loopPts = loopNodes.map((node) => ({ x: nodes[node].x, y: nodes[node].y }));
      loopPts.push(loopPts[0]);
      byLine.set(line, [createOctilinearPath(loopPts)]);
    }
    for (const path of linePaths(lineNeighbors.get(line)!, line === "2호선" ? onLoop : undefined)) {
      const d = strokeForPath(path);
      if (d) byLine.set(line, [...(byLine.get(line) ?? []), d]);
    }
  }

  const lines: MapLine[] = [...byLine]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: parts.join("") }));

  const riverScreen = createOctilinearPath(
    [
      { x: 30, y: 440 },
      { x: 280, y: 440 },
      { x: 340, y: 490 },
      { x: 420, y: 540 },
      { x: 500, y: 510 },
      { x: 580, y: 510 },
      { x: 620, y: 500 },
      { x: 650, y: 560 },
      { x: 920, y: 560 },
    ].map((p) => toScreen(p.x, p.y)),
  );

  const linePoints: [number, number][] = nodes.map((node) => [node.x, node.y]);
  for (const { a, b } of edges) {
    const corridor = octilinearWaypoints({ x: nodes[a].x, y: nodes[a].y }, { x: nodes[b].x, y: nodes[b].y });
    for (const point of corridor) linePoints.push([point.x, point.y]);
  }

  const central = loopNodes.map((index) => nodes[index]);
  const fx = Math.min(...central.map((node) => node.x));
  const fy = Math.min(...central.map((node) => node.y));
  const focus: MapBox = {
    x: fx - 16,
    y: fy - 16,
    w: Math.max(...central.map((node) => node.x)) - fx + 32,
    h: Math.max(...central.map((node) => node.y)) - fy + 32,
  };

  return {
    width,
    height,
    nodes,
    lines,
    linePoints,
    focus,
    terrain: { river: riverScreen, sea: "" } satisfies MapTerrain,
  };
})();

export type MapLabel = { level: number; position: number };

const POPULAR = new Set(POPULAR_GUIDES.map((station) => station.slug));
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
  "김포공항역",
  "인천공항1터미널역",
  "당산역",
  "선릉역",
  "대림역",
]);

export function placeLabels(names: string[]): MapLabel[] {
  const { nodes, linePoints } = SUBWAY_MAP;
  const CELL = 4;
  const indexPoints = (points: [number, number][]) => {
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
  const strict = indexPoints([...linePoints, ...dots]);
  const loose = indexPoints(dots);
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

  // Hubs / priority always at level 0; regular stations unlock at zoom ≥ 1.4.
  for (const node of order) {
    if (!(nodes[node].hub || priority(nodes[node]))) continue;
    tryPlace(node, 0, loose);
    if (!result[node]) result[node] = { level: 0, position: 0 };
  }
  for (const node of order) {
    if (result[node]) continue;
    tryPlace(node, REGULAR_LABEL_LEVEL, strict);
    if (!result[node]) tryPlace(node, REGULAR_LABEL_LEVEL, loose);
    if (!result[node]) result[node] = { level: REGULAR_LABEL_LEVEL, position: 0 };
  }
  return result.map((label) => label ?? { level: REGULAR_LABEL_LEVEL, position: 0 });
}
