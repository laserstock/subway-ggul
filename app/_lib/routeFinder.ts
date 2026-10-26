import { NETWORK_EDGES, NETWORK_LINKS, NETWORK_SERVICES, NETWORK_STATIONS, NETWORK_THROUGH } from "./subwayNetwork";

export type RouteMode = "fastest" | "fewest";

export type RouteLeg = {
  line: string;
  express: boolean;
  /** Korean station names from boarding to alighting, both included. */
  stations: string[];
  seconds: number;
};

export type RouteTransfer = {
  station: string;
  /** Set when the transfer walks to a differently named station (이수 → 총신대입구). */
  toStation: string | null;
  walkSeconds: number;
  /** Average wait for the next train, included in the total but not shown as a walk. */
  waitSeconds: number;
};

export type Route = {
  legs: RouteLeg[];
  /** transfers[i] sits between legs[i] and legs[i + 1]. */
  transfers: RouteTransfer[];
  /** Riding plus transfers; the wait for the first train is left out, as in timetable apps. */
  seconds: number;
};

/** Typical daytime minutes between trains, for the average wait (half of it) at a transfer. */
const HEADWAY_MINUTES: Record<string, number> = {
  "1호선": 8,
  "2호선": 5,
  "3호선": 6,
  "4호선": 6,
  "5호선": 6,
  "6호선": 7,
  "7호선": 6,
  "8호선": 7,
  "9호선": 7,
  경의중앙선: 15,
  경춘선: 20,
  수인분당선: 10,
  신분당선: 6,
  공항철도: 10,
  우이신설선: 6,
  신림선: 6,
  서해선: 20,
  경강선: 15,
  김포골드라인: 5,
  의정부경전철: 7,
  용인에버라인: 8,
  인천1호선: 8,
  인천2호선: 7,
  "GTX-A": 15,
};
const EXPRESS_HEADWAY_MINUTES = 10;
/** Branch trains run less often than the trunk they leave. */
const BRANCH_WAIT_FACTOR = 1.5;
const DEFAULT_WALK_MINUTES = 3;
const BRANCH_WALK_SECONDS = 60;
/** Ranking-only nudge so a route with one more change has to save real time to win. */
const TRANSFER_PENALTY_SECONDS = 90;

/**
 * Walking minutes between platforms at stations where it's notably shorter or longer than the
 * default. A number applies to every pair at that station; otherwise keys are "lineA|lineB" sorted.
 */
const TRANSFER_WALK_MINUTES: Record<string, number | Record<string, number>> = {
  교대역: 2,
  금정역: 1,
  오이도역: 1,
  충무로역: 2,
  사당역: 3,
  신길역: 7,
  노원역: 6,
  노량진역: 6,
  김포공항역: { "5호선|9호선": 4, "공항철도|5호선": 5, "공항철도|9호선": 5, "김포골드라인|5호선": 6, "김포골드라인|9호선": 6, "김포골드라인|공항철도": 5, "서해선|5호선": 6, "서해선|9호선": 6, "서해선|공항철도": 5, "김포골드라인|서해선": 6 },
  고속터미널역: { "3호선|7호선": 4, "3호선|9호선": 5, "7호선|9호선": 6 },
  종로3가역: { "1호선|3호선": 4, "1호선|5호선": 6, "3호선|5호선": 4 },
  서울역: { "1호선|4호선": 3, "1호선|공항철도": 8, "4호선|공항철도": 8, "1호선|경의중앙선": 5, "4호선|경의중앙선": 6, "경의중앙선|공항철도": 7, "1호선|GTX-A": 7, "4호선|GTX-A": 7, "GTX-A|공항철도": 6, "GTX-A|경의중앙선": 7 },
  홍대입구역: { "2호선|공항철도": 5, "2호선|경의중앙선": 5, "경의중앙선|공항철도": 3 },
  디지털미디어시티역: { "6호선|공항철도": 6, "6호선|경의중앙선": 5, "경의중앙선|공항철도": 3 },
  공덕역: { "5호선|6호선": 3, "5호선|공항철도": 5, "6호선|공항철도": 5, "5호선|경의중앙선": 6, "6호선|경의중앙선": 6, "경의중앙선|공항철도": 3 },
  왕십리역: { "2호선|5호선": 3, "2호선|수인분당선": 4, "5호선|수인분당선": 4, "2호선|경의중앙선": 4, "5호선|경의중앙선": 4, "경의중앙선|수인분당선": 3 },
  청량리역: 3,
  동대문역사문화공원역: { "2호선|4호선": 3, "2호선|5호선": 4, "4호선|5호선": 3 },
  건대입구역: 4,
  잠실역: 4,
  석촌역: 4,
  여의도역: 4,
  당산역: 4,
  동작역: 4,
  총신대입구역: 4,
  대림역: 4,
  온수역: 4,
  가산디지털단지역: 4,
  석계역: 4,
  신설동역: { "1호선|2호선": 3, "1호선|우이신설선": 4, "2호선|우이신설선": 4 },
  강남역: 3,
  양재역: 3,
  판교역: 3,
  정자역: 3,
  수서역: { "3호선|수인분당선": 3, "3호선|GTX-A": 7, "GTX-A|수인분당선": 7 },
  대곡역: { "3호선|경의중앙선": 3, "3호선|서해선": 4, "경의중앙선|서해선": 3, "3호선|GTX-A": 6, "GTX-A|경의중앙선": 6, "GTX-A|서해선": 6 },
  주안역: 4,
  원인재역: 4,
  보라매역: 3,
  샛강역: 4,
};

type Edge = { to: number; seconds: number };

let graph: {
  out: Map<number, Edge[]>;
  servicesAt: Map<number, number[]>;
  through: Set<string>;
  junctions: Set<string>;
  links: Map<number, { station: number; seconds: number }[]>;
} | null = null;

const key = (service: number, station: number) => service * 10000 + station;

function load() {
  if (graph) return graph;
  const out = new Map<number, Edge[]>();
  const servicesAt = new Map<number, number[]>();
  for (const [service, from, to, seconds] of NETWORK_EDGES) {
    const k = key(service, from);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push({ to, seconds });
    for (const station of [from, to]) {
      const list = servicesAt.get(station) ?? [];
      if (!list.includes(service)) list.push(service);
      servicesAt.set(station, list);
    }
  }
  const through = new Set<string>();
  const junctions = new Set<string>();
  for (const [service, previous, junction, next] of NETWORK_THROUGH) {
    through.add(`${service}|${previous}|${junction}|${next}`);
    junctions.add(`${service}|${junction}`);
  }
  const links = new Map<number, { station: number; seconds: number }[]>();
  for (const [a, b, minutes] of NETWORK_LINKS) {
    links.set(a, [...(links.get(a) ?? []), { station: b, seconds: minutes * 60 }]);
    links.set(b, [...(links.get(b) ?? []), { station: a, seconds: minutes * 60 }]);
  }
  graph = { out, servicesAt, through, junctions, links };
  return graph;
}

function stationName(id: number) {
  return NETWORK_STATIONS[id]?.[0] ?? "";
}

function headwaySeconds(service: number) {
  const { line, express } = NETWORK_SERVICES[service];
  return (express ? EXPRESS_HEADWAY_MINUTES : (HEADWAY_MINUTES[line] ?? 8)) * 60;
}

function walkSeconds(station: number, from: number, to: number) {
  const a = NETWORK_SERVICES[from];
  const b = NETWORK_SERVICES[to];
  if (a.line === b.line) return 0;
  const entry = TRANSFER_WALK_MINUTES[stationName(station)];
  if (typeof entry === "number") return entry * 60;
  const pair = [a.line, b.line].sort().join("|");
  const reversed = [b.line, a.line].join("|");
  return (entry?.[pair] ?? entry?.[reversed] ?? DEFAULT_WALK_MINUTES) * 60;
}

function normalizeName(name: string) {
  return name.replace(/\(.*?\)/g, "").replace(/\s+/g, "").replace(/역$/, "");
}

function distance(a: { lat: number; lng: number }, b: readonly [string, number, number]) {
  const rad = Math.PI / 180;
  const x = (b[2] - a.lng) * rad * Math.cos(((a.lat + b[1]) / 2) * rad);
  const y = (b[1] - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * 6371000;
}

/** The network station for an app station: same name nearby, else the nearest within walking distance. */
export function networkStationId(name: string, center: { lat: number; lng: number }): number | null {
  const target = normalizeName(name);
  let best: { id: number; meters: number } | null = null;
  let nearest: { id: number; meters: number } | null = null;
  NETWORK_STATIONS.forEach((station, id) => {
    if (!station) return;
    const meters = distance(center, station);
    if (normalizeName(station[0]) === target && meters < 3000 && (!best || meters < best.meters)) best = { id, meters };
    if (!nearest || meters < nearest.meters) nearest = { id, meters };
  });
  const found = (best ?? nearest) as { id: number; meters: number } | null;
  if (!found) return null;
  return found === best || found.meters < 700 ? found.id : null;
}

export function networkStationName(id: number) {
  return stationName(id);
}

type Label = {
  state: string;
  service: number;
  previous: number;
  station: number;
  time: number;
  initialWait: number;
  transfers: number;
  /** Walking part of a change, in seconds. */
  walk: number;
  parent: Label | null;
  action: "board" | "ride" | "change";
};

function rank(label: Label, mode: RouteMode): [number, number] {
  const time = label.time + label.initialWait + label.transfers * TRANSFER_PENALTY_SECONDS;
  return mode === "fastest" ? [time, label.transfers] : [label.transfers, time];
}

function better(a: [number, number], b: [number, number]) {
  return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
}

/** Minimal binary heap keyed by the rank tuple. */
class Heap {
  private items: { rank: [number, number]; label: Label }[] = [];
  get size() {
    return this.items.length;
  }
  push(rank: [number, number], label: Label) {
    const items = this.items;
    items.push({ rank, label });
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!better(items[i].rank, items[parent].rank)) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }
  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const left = i * 2 + 1;
        const right = left + 1;
        let smallest = i;
        if (left < items.length && better(items[left].rank, items[smallest].rank)) smallest = left;
        if (right < items.length && better(items[right].rank, items[smallest].rank)) smallest = right;
        if (smallest === i) break;
        [items[i], items[smallest]] = [items[smallest], items[i]];
        i = smallest;
      }
    }
    return top.label;
  }
}

export function findRoute(from: number, to: number, mode: RouteMode): Route | null {
  if (from === to) return null;
  const { out, servicesAt, through, junctions, links } = load();
  const heap = new Heap();
  const settled = new Set<string>();
  const best = new Map<string, [number, number]>();

  function push(label: Label) {
    const r = rank(label, mode);
    const known = best.get(label.state);
    if (known && !better(r, known)) return;
    best.set(label.state, r);
    heap.push(r, label);
  }

  for (const service of servicesAt.get(from) ?? []) {
    push({
      state: `${service}|-1|${from}`,
      service,
      previous: -1,
      station: from,
      time: 0,
      initialWait: headwaySeconds(service) / 2,
      transfers: 0,
      walk: 0,
      parent: null,
      action: "board",
    });
  }

  while (heap.size > 0) {
    const label = heap.pop();
    if (settled.has(label.state)) continue;
    settled.add(label.state);
    if (label.station === to) return buildRoute(label);

    const { service, station, previous } = label;
    const junction = previous >= 0 && junctions.has(`${service}|${station}`);
    for (const edge of out.get(key(service, station)) ?? []) {
      if (edge.to === previous) continue;
      const runsThrough = !junction || through.has(`${service}|${previous}|${station}|${edge.to}`);
      if (runsThrough) {
        push({
          ...label,
          state: `${service}|${station}|${edge.to}`,
          previous: station,
          station: edge.to,
          time: label.time + edge.seconds,
          parent: label,
          action: "ride",
        });
      } else {
        const change: Label = {
          ...label,
          state: `${service}|-1|${station}|branch`,
          previous: -1,
          time: label.time + BRANCH_WALK_SECONDS + (headwaySeconds(service) / 2) * BRANCH_WAIT_FACTOR,
          transfers: label.transfers + 1,
          walk: BRANCH_WALK_SECONDS,
          parent: label,
          action: "change",
        };
        push({
          ...change,
          state: `${service}|${station}|${edge.to}|b`,
          previous: station,
          station: edge.to,
          time: change.time + edge.seconds,
          parent: change,
          action: "ride",
        });
      }
    }
    if (label.action === "change" || label.action === "board") continue;
    const targets = [{ station, seconds: -1 }, ...(links.get(station) ?? [])];
    for (const target of targets) {
      for (const next of servicesAt.get(target.station) ?? []) {
        if (next === service && target.station === station) continue;
        const walk = target.seconds >= 0 ? target.seconds : walkSeconds(station, service, next);
        push({
          ...label,
          state: `${next}|-1|${target.station}`,
          service: next,
          previous: -1,
          station: target.station,
          time: label.time + walk + headwaySeconds(next) / 2,
          transfers: label.transfers + 1,
          walk,
          parent: label,
          action: "change",
        });
      }
    }
  }
  return null;
}

/** Edge times include one dwell; a leg has one fewer stop than edges. */
const DWELL_SECONDS = 30;

function buildRoute(end: Label): Route {
  const chain: Label[] = [];
  for (let label: Label | null = end; label; label = label.parent) chain.unshift(label);
  const legs: RouteLeg[] = [];
  const transfers: RouteTransfer[] = [];
  let leg: RouteLeg | null = null;
  let legStart = 0;
  for (let i = 0; i < chain.length; i++) {
    const label = chain[i];
    if (label.action === "board" || label.action === "change") {
      if (leg) {
        leg.seconds -= DWELL_SECONDS;
        legs.push(leg);
        const previous = chain[i - 1];
        transfers.push({
          station: stationName(previous.station),
          toStation: previous.station === label.station ? null : stationName(label.station),
          walkSeconds: label.walk,
          waitSeconds: label.time - previous.time - label.walk,
        });
      }
      const { line, express } = NETWORK_SERVICES[label.service];
      leg = { line, express, stations: [stationName(label.station)], seconds: 0 };
      legStart = label.time;
      continue;
    }
    if (leg) {
      leg.stations.push(stationName(label.station));
      leg.seconds = label.time - legStart;
    }
  }
  if (leg) {
    leg.seconds -= DWELL_SECONDS;
    legs.push(leg);
  }
  const seconds =
    legs.reduce((sum, item) => sum + item.seconds, 0) +
    transfers.reduce((sum, item) => sum + item.walkSeconds + item.waitSeconds, 0);
  return { legs, transfers, seconds };
}
