import { compareLines, guideByKo, POPULAR_GUIDES, stationLineColor, type GuideStation } from "./guide";
import { DOT_R, HUB_R, labelBox, labelLines, LABEL_POSITIONS, type LabelBox } from "./mapLabel";
import { LOOP2_CORNER, LOOP2_H, LOOP2_W, RIVER_Y, SCHEMATIC_HUBS } from "./schematicHubs";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type MapBox = { x: number; y: number; w: number; h: number };
export type MapNode = { station: GuideStation; x: number; y: number; lines: string[]; hub: boolean };
export type MapLine = { line: string; color: string; d: string };
export type MapTerrain = { river: string; sea: string };

export const MAP_LEVELS = [0.35, 0.55, 0.85, 1.2, 1.7, 2.4, 3.4, 4.8, 6.8] as const;
export const MAP_MAX_ZOOM = 12;

const EDGE = 9.2;
const PADDING = 40;
const STEP = Math.PI / 4;
const round = (value: number) => Math.round(value * 10) / 10;

type Pt = { x: number; y: number };

function roundedRectPerimeter(w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  return 2 * (w - 2 * rr) + 2 * (h - 2 * rr) + 2 * Math.PI * rr;
}

function roundedRectFrame(s: number, w: number, h: number, r: number): Pt {
  const rr = Math.min(r, w / 2, h / 2);
  const perim = roundedRectPerimeter(w, h, rr);
  let d = ((s % perim) + perim) % perim;
  const top = w - 2 * rr;
  const side = h - 2 * rr;
  const arc = (Math.PI / 2) * rr;
  d = (d + top / 2) % perim;
  if (d <= top) return { x: -w / 2 + rr + d, y: -h / 2 };
  d -= top;
  if (d <= arc) {
    const a = -Math.PI / 2 + d / rr;
    return { x: w / 2 - rr + Math.cos(a) * rr, y: -h / 2 + rr + Math.sin(a) * rr };
  }
  d -= arc;
  if (d <= side) return { x: w / 2, y: -h / 2 + rr + d };
  d -= side;
  if (d <= arc) {
    const a = d / rr;
    return { x: w / 2 - rr + Math.cos(a) * rr, y: h / 2 - rr + Math.sin(a) * rr };
  }
  d -= arc;
  if (d <= top) return { x: w / 2 - rr - d, y: h / 2 };
  d -= top;
  if (d <= arc) {
    const a = Math.PI / 2 + d / rr;
    return { x: -w / 2 + rr + Math.cos(a) * rr, y: h / 2 - rr + Math.sin(a) * rr };
  }
  d -= arc;
  if (d <= side) return { x: -w / 2, y: h / 2 - rr - d };
  d -= side;
  const a = Math.PI + d / rr;
  return { x: -w / 2 + rr + Math.cos(a) * rr, y: -h / 2 + rr + Math.sin(a) * rr };
}

function roundedRectPath(cx: number, cy: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  const x0 = round(cx - w / 2);
  const y0 = round(cy - h / 2);
  const x1 = round(cx + w / 2);
  const y1 = round(cy + h / 2);
  const rad = round(rr);
  return `M${x0 + rad} ${y0}L${x1 - rad} ${y0}A${rad} ${rad} 0 0 1 ${x1} ${y0 + rad}L${x1} ${y1 - rad}A${rad} ${rad} 0 0 1 ${x1 - rad} ${y1}L${x0 + rad} ${y1}A${rad} ${rad} 0 0 1 ${x0} ${y1 - rad}L${x0} ${y0 + rad}A${rad} ${rad} 0 0 1 ${x0 + rad} ${y0}Z`;
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

/** Kakao-style octilinear elbow: only H / V / 45°. */
function octilinearCorridor(a: Pt, b: Pt): Pt[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < 0.15 && ay < 0.15) return [a, b];
  if (Math.min(ax, ay) < 0.25 || Math.abs(ax - ay) < 0.25) return [a, b];
  const diagonal = Math.min(ax, ay);
  const rest = Math.max(ax, ay) - diagonal;
  if (ax >= ay) {
    const mid1 = { x: a.x + Math.sign(dx) * (rest / 2), y: a.y };
    const mid2 = { x: mid1.x + Math.sign(dx) * diagonal, y: mid1.y + Math.sign(dy) * diagonal };
    return [a, mid1, mid2, b];
  }
  const mid1 = { x: a.x, y: a.y + Math.sign(dy) * (rest / 2) };
  const mid2 = { x: mid1.x + Math.sign(dx) * diagonal, y: mid1.y + Math.sign(dy) * diagonal };
  return [a, mid1, mid2, b];
}

function pathLength(pts: Pt[]) {
  let total = 0;
  for (let index = 1; index < pts.length; index += 1) {
    total += Math.hypot(pts[index].x - pts[index - 1].x, pts[index].y - pts[index - 1].y);
  }
  return total;
}

function pointAlong(pts: Pt[], t: number): Pt {
  if (pts.length === 1) return pts[0];
  const total = pathLength(pts) || 1;
  let remain = Math.max(0, Math.min(1, t)) * total;
  for (let index = 1; index < pts.length; index += 1) {
    const seg = Math.hypot(pts[index].x - pts[index - 1].x, pts[index].y - pts[index - 1].y) || 1e-6;
    if (remain <= seg) {
      const u = remain / seg;
      return {
        x: pts[index - 1].x + (pts[index].x - pts[index - 1].x) * u,
        y: pts[index - 1].y + (pts[index].y - pts[index - 1].y) * u,
      };
    }
    remain -= seg;
  }
  return pts[pts.length - 1];
}

function strokePath(pts: Pt[]) {
  if (pts.length < 2) return "";
  const simplified: Pt[] = [pts[0]];
  for (let index = 1; index < pts.length - 1; index += 1) {
    const prev = simplified[simplified.length - 1];
    const cur = pts[index];
    const next = pts[index + 1];
    const ax = cur.x - prev.x;
    const ay = cur.y - prev.y;
    const bx = next.x - cur.x;
    const by = next.y - cur.y;
    if (Math.abs(ax * by - ay * bx) < 0.2 && ax * bx + ay * by > 0) continue;
    simplified.push(cur);
  }
  simplified.push(pts[pts.length - 1]);
  if (simplified.length === 2) {
    return `M${round(simplified[0].x)} ${round(simplified[0].y)}L${round(simplified[1].x)} ${round(simplified[1].y)}`;
  }
  const corner = 5;
  let d = `M${round(simplified[0].x)} ${round(simplified[0].y)}`;
  for (let index = 1; index < simplified.length - 1; index += 1) {
    const p0 = simplified[index - 1];
    const p1 = simplified[index];
    const p2 = simplified[index + 1];
    const inDx = p1.x - p0.x;
    const inDy = p1.y - p0.y;
    const outDx = p2.x - p1.x;
    const outDy = p2.y - p1.y;
    const inLen = Math.hypot(inDx, inDy) || 1;
    const outLen = Math.hypot(outDx, outDy) || 1;
    const cut = Math.min(corner, inLen * 0.45, outLen * 0.45);
    d += `L${round(p1.x - (inDx / inLen) * cut)} ${round(p1.y - (inDy / inLen) * cut)}`;
    d += `Q${round(p1.x)} ${round(p1.y)} ${round(p1.x + (outDx / outLen) * cut)} ${round(p1.y + (outDy / outLen) * cut)}`;
  }
  const last = simplified[simplified.length - 1];
  d += `L${round(last.x)} ${round(last.y)}`;
  return d;
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

/**
 * KakaoMetro-style schematic map:
 * - Line 2 = rounded rectangle (like Kakao)
 * - Known hubs = hand-tuned Kakao-like anchors
 * - All other stations = beads on octilinear corridors between anchors
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
  const allNeighbors: number[][] = stations.map(() => []);
  for (const { a, b } of edges) {
    allNeighbors[a].push(b);
    allNeighbors[b].push(a);
  }

  const loopNetwork = line2LoopOrder();
  const loopNodes = loopNetwork
    .map((networkIndex) => networkIndexOf.get(networkIndex))
    .filter((index): index is number => index !== undefined);
  const onLoop = new Set(loopNodes);
  const loopPerim = roundedRectPerimeter(LOOP2_W, LOOP2_H, LOOP2_CORNER);

  const xs = new Array(count).fill(0);
  const ys = new Array(count).fill(0);
  const fixed = new Array(count).fill(false);

  // 1) Line 2 rounded rectangle — Gangnam at bottom centre (Kakao).
  const gangnamIndex = Math.max(
    0,
    loopNodes.findIndex((node) => stations[node].ko === "강남역"),
  );
  const bottomMidS = loopPerim / 2;
  loopNodes.forEach((node, index) => {
    const s = bottomMidS + ((index - gangnamIndex) / Math.max(loopNodes.length, 1)) * loopPerim;
    const point = roundedRectFrame(((s % loopPerim) + loopPerim) % loopPerim, LOOP2_W, LOOP2_H, LOOP2_CORNER);
    xs[node] = point.x;
    ys[node] = point.y;
    fixed[node] = true;
  });

  // 2) Pin Kakao-tuned hubs.
  for (let node = 0; node < count; node += 1) {
    if (onLoop.has(node)) continue;
    const hub = SCHEMATIC_HUBS[stations[node].ko];
    if (!hub) continue;
    xs[node] = hub.x;
    ys[node] = hub.y;
    fixed[node] = true;
  }

  // Geographic fallback seed for terminals still unfixed.
  const kmX = 111.32 * Math.cos((37.5657 * Math.PI) / 180);
  const seedFallback = (node: number) => {
    if (fixed[node]) return;
    const station = stations[node];
    const gx = (station.lng - 126.9769) * kmX;
    const gy = (37.5657 - station.lat) * 110.57;
    const angle = Math.round(Math.atan2(gy, gx) / STEP) * STEP;
    const hopsGuess = 8 + Math.hypot(gx, gy);
    xs[node] = Math.cos(angle) * (LOOP2_W / 2 + hopsGuess * 0.9);
    ys[node] = Math.sin(angle) * (LOOP2_H / 2 + hopsGuess * 0.9);
    fixed[node] = true;
  };

  /**
   * Place every station on a line path as a bead on long octilinear corridors
   * between already-fixed anchors (Line 2 / Kakao hubs). This is what makes
   * KakaoMetro look "straight" instead of GPS-wavy.
   */
  const placeLinePath = (path: number[]) => {
    if (path.length < 2) return;
    if (!fixed[path[0]]) seedFallback(path[0]);
    if (!fixed[path[path.length - 1]]) seedFallback(path[path.length - 1]);

    // Anchors: fixed stations. Thin to endpoints + hubs on Line 2 + at most one bend.
    let marks = path.map((node, index) => ({ node, index })).filter(({ node }) => fixed[node]);
    if (marks.length < 2) {
      marks = [
        { node: path[0], index: 0 },
        { node: path[path.length - 1], index: path.length - 1 },
      ];
    }
    if (marks.length > 5) {
      const keep = new Set<number>([marks[0].index, marks[marks.length - 1].index]);
      for (const mark of marks) {
        if (onLoop.has(mark.node) || SCHEMATIC_HUBS[stations[mark.node].ko]) keep.add(mark.index);
      }
      // One geographic bend if the run bows far from the chord.
      const a = { x: xs[path[marks[0].index]], y: ys[path[marks[0].index]] };
      const b = { x: xs[path[marks[marks.length - 1].index]], y: ys[path[marks[marks.length - 1].index]] };
      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const abLen = Math.hypot(abx, aby) || 1;
      let bend = -1;
      let maxDev = 0;
      for (const mark of marks) {
        if (keep.has(mark.index)) continue;
        const cross = Math.abs(abx * (ys[mark.node] - a.y) - aby * (xs[mark.node] - a.x)) / abLen;
        if (cross > maxDev) {
          maxDev = cross;
          bend = mark.index;
        }
      }
      if (bend >= 0 && maxDev > 8) keep.add(bend);
      marks = marks.filter((mark) => keep.has(mark.index));
    }

    for (let m = 0; m < marks.length - 1; m += 1) {
      const from = marks[m];
      const to = marks[m + 1];
      if (to.index <= from.index) continue;
      const corridor = octilinearCorridor({ x: xs[from.node], y: ys[from.node] }, { x: xs[to.node], y: ys[to.node] });
      const span = to.index - from.index;
      for (let step = 0; step <= span; step += 1) {
        const node = path[from.index + step];
        if (onLoop.has(node)) continue;
        // Keep Kakao hubs / earlier claims; fill everything else onto the corridor.
        if (fixed[node] && SCHEMATIC_HUBS[stations[node].ko] && step !== 0 && step !== span) continue;
        if (fixed[node] && step !== 0 && step !== span && stations[node].lines.length > 1) {
          // Shared transfer already placed — leave it; stroke elbows through it.
          continue;
        }
        const point = pointAlong(corridor, span ? step / span : 0);
        xs[node] = point.x;
        ys[node] = point.y;
        fixed[node] = true;
      }
    }
  };

  const lineOrder = [...lineNeighbors.keys()].sort((a, b) => {
    if (a === "2호선") return -1;
    if (b === "2호선") return 1;
    return compareLines(a, b);
  });

  for (const line of lineOrder) {
    for (const path of linePaths(lineNeighbors.get(line)!, line === "2호선" ? onLoop : undefined)) {
      placeLinePath(path);
    }
  }
  for (let node = 0; node < count; node += 1) {
    if (!fixed[node]) seedFallback(node);
  }

  // Re-pin Line 2 after fills.
  loopNodes.forEach((node, index) => {
    const s = bottomMidS + ((index - gangnamIndex) / Math.max(loopNodes.length, 1)) * loopPerim;
    const point = roundedRectFrame(((s % loopPerim) + loopPerim) % loopPerim, LOOP2_W, LOOP2_H, LOOP2_CORNER);
    xs[node] = point.x;
    ys[node] = point.y;
  });

  const laid = edges.map(({ a, b }) => Math.hypot(xs[a] - xs[b], ys[a] - ys[b])).sort((p, q) => p - q);
  const scale = EDGE / (laid[Math.floor(laid.length * 0.55)] || 1);
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
  const riverScreenY = toScreen(0, RIVER_Y).y;

  const octilinearStroke = (path: number[]) => {
    if (path.length < 2) return "";
    const pts: Pt[] = [{ x: nodes[path[0]].x, y: nodes[path[0]].y }];
    for (let index = 1; index < path.length; index += 1) {
      const corridor = octilinearCorridor(pts[pts.length - 1], { x: nodes[path[index]].x, y: nodes[path[index]].y });
      for (let step = 1; step < corridor.length; step += 1) pts.push(corridor[step]);
    }
    return strokePath(pts);
  };

  const byLine = new Map<string, string[]>();
  for (const line of lineOrder) {
    if (line === "2호선") byLine.set(line, [roundedRectPath(cx, cy, loopW, loopH, loopR)]);
    for (const path of linePaths(lineNeighbors.get(line)!, line === "2호선" ? onLoop : undefined)) {
      const d = octilinearStroke(path);
      if (d) byLine.set(line, [...(byLine.get(line) ?? []), d]);
    }
  }

  const lines: MapLine[] = [...byLine]
    .sort(([a], [b]) => compareLines(b, a))
    .map(([line, parts]) => ({ line, color: stationLineColor(line), d: parts.join("") }));

  const riverHalf = Math.max(18, loopH * 0.22);
  const river = [
    `M${round(cx - loopW * 1.7)} ${round(riverScreenY - riverHalf * 0.15)}`,
    `C${round(cx - loopW * 0.9)} ${round(riverScreenY - riverHalf * 0.9)}`,
    `${round(cx - loopW * 0.15)} ${round(riverScreenY - riverHalf * 0.85)}`,
    `${round(cx + loopW * 0.2)} ${round(riverScreenY - riverHalf * 0.25)}`,
    `S${round(cx + loopW * 0.85)} ${round(riverScreenY + riverHalf * 0.1)}`,
    `${round(cx + loopW * 1.35)} ${round(riverScreenY - riverHalf * 0.05)}`,
    `S${round(cx + loopW * 1.75)} ${round(riverScreenY - riverHalf * 0.4)}`,
    `${round(cx + loopW * 1.9)} ${round(riverScreenY - riverHalf * 0.5)}`,
    `L${round(cx + loopW * 1.9)} ${round(riverScreenY + riverHalf)}`,
    `C${round(cx + loopW * 1.3)} ${round(riverScreenY + riverHalf * 1.15)}`,
    `${round(cx + loopW * 0.35)} ${round(riverScreenY + riverHalf * 1.1)}`,
    `${round(cx - loopW * 0.2)} ${round(riverScreenY + riverHalf * 0.85)}`,
    `S${round(cx - loopW * 1.1)} ${round(riverScreenY + riverHalf * 0.65)}`,
    `${round(cx - loopW * 1.7)} ${round(riverScreenY + riverHalf * 0.5)}Z`,
  ].join(" ");
  const seaLeft = Math.min(...nodes.map((node) => node.x)) - 2;
  const sea = [
    `M${round(seaLeft)} ${round(cy - loopH * 0.4)}`,
    `C${round(seaLeft + loopW * 0.15)} ${round(cy - loopH)}`,
    `${round(cx - loopW * 1.2)} ${round(cy - loopH * 0.05)}`,
    `${round(cx - loopW)} ${round(cy + loopH * 0.3)}`,
    `C${round(cx - loopW * 1.05)} ${round(cy + loopH * 0.95)}`,
    `${round(seaLeft + loopW * 0.25)} ${round(cy + loopH * 1.2)}`,
    `${round(seaLeft)} ${round(cy + loopH * 0.85)}Z`,
  ].join(" ");

  const linePoints: [number, number][] = nodes.map((node) => [node.x, node.y]);
  for (let step = 0; step < 64; step += 1) {
    const point = toScreen(
      roundedRectFrame((step / 64) * loopPerim, LOOP2_W, LOOP2_H, LOOP2_CORNER).x,
      roundedRectFrame((step / 64) * loopPerim, LOOP2_W, LOOP2_H, LOOP2_CORNER).y,
    );
    linePoints.push([point.x, point.y]);
  }
  for (const { a, b } of edges) {
    const corridor = octilinearCorridor({ x: nodes[a].x, y: nodes[a].y }, { x: nodes[b].x, y: nodes[b].y });
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
    terrain: { river, sea } satisfies MapTerrain,
    loop: { cx, cy, w: loopW, h: loopH, r: loopR },
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
  for (let level = 0; level < 2; level += 1) {
    for (const node of order) {
      if (result[node] || !priority(nodes[node])) continue;
      tryPlace(node, level, loose);
    }
  }
  MAP_LEVELS.forEach((_, level) => {
    for (const node of order) {
      if (result[node]) continue;
      tryPlace(node, level, strict);
      if (!result[node] && (priority(nodes[node]) || nodes[node].hub)) tryPlace(node, level, loose);
    }
  });
  for (const node of order) {
    if (!priority(nodes[node])) continue;
    if (!result[node]) result[node] = { level: 1, position: 0 };
    else result[node] = { level: Math.min(result[node].level, 1), position: result[node].position };
  }
  return result.map((label) => label ?? { level: MAP_LEVELS.length, position: 0 });
}
