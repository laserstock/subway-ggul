import { GUIDE_STATIONS, guideByKo, guideDetail, guideStation, stationLineColor, type GuideDetail, type GuideStation } from "./guide";
import { floorLabel, gt, lineLabel, stationTitle } from "./guideCopy";
import type { GuideLocale } from "./guideLocale";
import type { Localized } from "./i18n";
import { spotImage, type PlannerImage } from "./plannerImages";
import { DEFAULT_END, DEFAULT_START, plannerHref, type PlannerQuery } from "./plannerParams";
import { PLANNER_PAIRS, PLANNER_SPOTS, type PlannerSpot } from "./plannerSpots";
import { pt } from "./plannerText";
import type { PlannerCategory, QuickTag } from "./plannerTypes";
import { findRoute, networkStationId, networkStationName, networkStationPoint, type Route, type RouteLeg, type RouteMode, type RouteTransfer } from "./routeFinder";

export type PlanLine = { name: string; short: string; color: string };

export type PlanStation = {
  slug: string;
  /** "Myeongdong" in English, the full station name elsewhere; for headings and titles. */
  name: string;
  /** "Myeongdong Station". */
  title: string;
  /** Korean name with 역. */
  ko: string;
  lines: PlanLine[];
  exits: string[];
  /** Korean road address, for taxi drivers. */
  address: string | null;
};

export type PlanSpot = {
  name: string;
  blurb: string;
  categories: PlannerCategory[];
  tags: QuickTag[];
  exit: string | null;
  walk: number;
  maps: string;
  image: PlannerImage;
};

/** A Google Maps search standing in for spots we haven't hand-picked. */
export type PlanLink = { label: string; maps: string; category: PlannerCategory | null; tag: QuickTag | null };

/** A locker bank or a restroom inside the station. */
export type PlanFacility = { line: PlanLine; floor: string | null; inside: boolean; exit: string | null; note: string | null };

export type PlanStep =
  | {
      kind: "depart";
      time: number;
      station: PlanStation;
      lockers: PlanFacility[];
      luggageDesk: string | null;
      restrooms: PlanFacility[];
      elevator: string | null;
      links: PlanLink[];
      meal: { lunch: boolean; spots: PlanSpot[]; links: PlanLink[] };
    }
  | { kind: "ride"; time: number; line: PlanLine; from: string; to: string; next: string | null; stops: number; minutes: number }
  | { kind: "transfer"; time: number; station: string; toStation: string | null; line: PlanLine; walk: number }
  | {
      kind: "stop";
      time: number;
      until: number;
      station: PlanStation;
      /** The stop is where the route changes lines anyway. */
      transfer: boolean;
      spots: PlanSpot[];
      links: PlanLink[];
      lockers: PlanFacility[];
    }
  | {
      kind: "arrive";
      time: number;
      station: PlanStation;
      /** In suggested walking order, nearest first. */
      spots: PlanSpot[];
      links: PlanLink[];
      lockers: PlanFacility[];
      restrooms: PlanFacility[];
      leaveBy: number;
      back: number;
    };

/** The one-way ride at a glance: boarding, each change of line, arrival. */
export type PlanFlow = {
  stations: { name: string; kind: "start" | "transfer" | "end" }[];
  legs: { line: PlanLine; minutes: number; stops: number }[];
};

export type Plan = {
  mode: RouteMode;
  /** One-way riding time from departure to destination, without the stop on the way. */
  minutes: number;
  transfers: number;
  lines: PlanLine[];
  flow: PlanFlow;
  steps: PlanStep[];
  /** Same value for two plans that ride the same lines through the same transfers. */
  signature: string;
};

export type PlannerResult =
  | { ok: true; from: PlanStation; to: PlanStation; plans: Record<RouteMode, Plan> }
  | { ok: false; reason: "station" | "same" | "route"; from: PlanStation | null; to: PlanStation | null };

/** Minutes at the departure station for lockers and finding the gate. */
const PREP_MINUTES = 10;
const LUNCH_MINUTES = 60;
const STOP_MINUTES = 60;
/** Leave room for the stop on the way only when this much time is left at the destination. */
const MIN_DESTINATION_MINUTES = 90;
/** Average wait for the next train after the stop on the way. */
const REBOARD_MINUTES = 4;
const LUNCH_FROM = 10 * 60 + 30;
const LUNCH_TO = 13 * 60 + 30;
/** Spots further than this from the station belong to a same-named station elsewhere. */
const SPOT_RADIUS_METERS = 2000;
const WALK_METERS_PER_MINUTE = 75;
/** Streets are longer than the straight line. */
const DETOUR = 1.3;

/** `query` is the English Google Maps search, `ko` the Korean one used on the Korean pages. */
type Search = { label: Localized; query: string; ko: string };

const CATEGORY_SEARCH: Record<PlannerCategory, Search> = {
  food: { label: { ko: "맛집", en: "Restaurants", zh: "餐厅", ja: "レストラン" }, query: "restaurants", ko: "맛집" },
  cafe: { label: { ko: "카페·베이커리", en: "Cafés & bakeries", zh: "咖啡馆和面包店", ja: "カフェ・ベーカリー" }, query: "cafe", ko: "카페" },
  shopping: { label: { ko: "쇼핑", en: "Shops", zh: "商店", ja: "ショップ" }, query: "shopping", ko: "쇼핑" },
  beauty: { label: { ko: "화장품 매장", en: "K-beauty stores", zh: "韩妆店", ja: "コスメショップ" }, query: "cosmetics store", ko: "화장품" },
  culture: { label: { ko: "관광 명소", en: "Sights", zh: "景点", ja: "観光スポット" }, query: "tourist attractions", ko: "관광명소" },
  essentials: { label: { ko: "환전소", en: "Currency exchange", zh: "换钱所", ja: "両替所" }, query: "currency exchange", ko: "환전소" },
};

const TAG_SEARCH: Partial<Record<QuickTag, Search>> = {
  "#OliveYoung": {
    label: { ko: "올리브영 매장", en: "Olive Young stores", zh: "Olive Young门店", ja: "オリーブヤング店舗" },
    query: "Olive Young",
    ko: "올리브영",
  },
  "#Daiso": { label: { ko: "다이소 매장", en: "Daiso stores", zh: "大创门店", ja: "ダイソー店舗" }, query: "Daiso", ko: "다이소" },
  "#WOWPASS": {
    label: { ko: "와우패스 기기", en: "WOWPASS machines", zh: "WOWPASS机器", ja: "WOWPASS機" },
    query: "WOWPASS machine",
    ko: "와우패스",
  },
  "#K-BBQ": { label: { ko: "고깃집", en: "Korean BBQ", zh: "韩国烤肉", ja: "韓国焼肉" }, query: "Korean BBQ", ko: "고깃집" },
  "#Pop-up": { label: { ko: "팝업스토어", en: "Pop-up stores", zh: "快闪店", ja: "ポップアップストア" }, query: "pop-up store", ko: "팝업스토어" },
  "#Life4Cut": {
    label: { ko: "인생네컷 사진관", en: "Life4Cut photo booths", zh: "人生四格照相馆", ja: "人生4カット" },
    query: "Life4cut photo booth",
    ko: "인생네컷",
  },
  "#LuggageLocker": { label: { ko: "짐 보관", en: "Luggage storage", zh: "行李寄存", ja: "荷物預かり" }, query: "luggage storage", ko: "짐보관" },
};

/** Where on the day each searchable tag fits best. */
const DEPART_TAGS: QuickTag[] = ["#WOWPASS"];
const STOP_TAGS: QuickTag[] = ["#OliveYoung", "#Daiso", "#Life4Cut"];
const ARRIVE_TAGS: QuickTag[] = ["#Pop-up", "#K-BBQ"];

const SHORT_LINES: Record<string, string> = {
  경의중앙선: "GJ",
  수인분당선: "SU",
  신분당선: "SB",
  공항철도: "A",
  경춘선: "GC",
  경강선: "GG",
  서해선: "SH",
  우이신설선: "UI",
  신림선: "SL",
  인천1호선: "I1",
  인천2호선: "I2",
  김포골드라인: "GP",
  용인에버라인: "EV",
  의정부경전철: "U",
};

/** "2호선" → "2", other lines get the letters on their official badges. */
function shortLine(line: string) {
  return /^(\d+)호선$/.exec(line)?.[1] ?? SHORT_LINES[line] ?? (line.startsWith("GTX") ? "GTX" : line.slice(0, 2));
}

function meters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.sqrt(x * x + y * y) * 6_371_000;
}

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const CITY_NAMES = new Set(["Seoul", "Incheon", "Suwon", "Bucheon", "Anyang", "Cheonan"]);

/** English drops "Station" unless the name is also a city's; the other languages keep 역/站/駅. */
function baseName(station: GuideStation, locale: GuideLocale) {
  if (locale !== "en") return stationTitle(station, locale);
  const name = station.name.en.replace(/\s+station$/i, "");
  return CITY_NAMES.has(name) ? `${name} Station` : name;
}

function planLine(line: string, locale: GuideLocale, express = false): PlanLine {
  return { name: `${lineLabel(line, locale)}${express ? pt("express", locale) : ""}`, short: shortLine(line), color: stationLineColor(line) };
}

export function planStation(station: GuideStation, locale: GuideLocale, detail = guideDetail(station)): PlanStation {
  return {
    slug: station.slug,
    name: baseName(station, locale),
    title: stationTitle(station, locale),
    ko: station.ko,
    lines: station.lines.map((line) => planLine(line, locale)),
    exits: detail.exits.map((exit) => exit.label),
    address: detail.address,
  };
}

const NETWORK_IDS = new Map<string, number | null>();

function networkId(station: GuideStation) {
  if (!NETWORK_IDS.has(station.slug)) NETWORK_IDS.set(station.slug, networkStationId(station.ko, station));
  return NETWORK_IDS.get(station.slug)!;
}

function guideAt(id: number) {
  const point = networkStationPoint(id);
  return guideByKo(networkStationName(id), point ?? undefined);
}

function titleAt(id: number, locale: GuideLocale) {
  const station = guideAt(id);
  return station ? stationTitle(station, locale) : networkStationName(id);
}

function nameAt(id: number, locale: GuideLocale) {
  const station = guideAt(id);
  return station ? baseName(station, locale) : networkStationName(id);
}

function stationSpots(station: GuideStation) {
  return (PLANNER_SPOTS[station.ko] ?? []).filter((spot) => meters(station, spot) <= SPOT_RADIUS_METERS);
}

function planSpot(spot: PlannerSpot, station: GuideStation, detail: GuideDetail, locale: GuideLocale): PlanSpot {
  const named = spot.exit ? detail.exits.find((exit) => exit.label === spot.exit) : undefined;
  const nearest =
    named ??
    (spot.exit
      ? undefined
      : detail.exits.reduce<GuideDetail["exits"][number] | undefined>(
          (best, exit) => (!best || meters(exit, spot) < meters(best, spot) ? exit : best),
          undefined,
        ));
  const from = nearest ?? station;
  return {
    name: gt(spot.name, locale),
    blurb: gt(spot.blurb, locale),
    categories: spot.categories,
    tags: spot.tags ?? [],
    exit: spot.exit ?? nearest?.label ?? null,
    walk: spot.walk ?? Math.max(1, Math.round((meters(from, spot) * DETOUR) / WALK_METERS_PER_MINUTE)),
    maps: mapsSearch(locale === "ko" ? spot.name.ko : `${spot.name.en}, Seoul`),
    image: spotImage(spot),
  };
}

/** The hand-picked spots around a station, each with the exit to use and the walk from it. */
export function stationSpotsFor(station: GuideStation, detail: GuideDetail, locale: GuideLocale): PlanSpot[] {
  return stationSpots(station).map((spot) => planSpot(spot, station, detail, locale));
}

/** How well a spot fits: each wanted category counts, the visitor's own picks double and each picked tag counts twice. */
function spotScore(spot: PlannerSpot, wanted: PlannerCategory[], preferred: PlannerCategory[], tags: QuickTag[]) {
  const byCategory = spot.categories.reduce(
    (score, category) => score + (wanted.includes(category) ? 1 : 0) + (preferred.includes(category) ? 1 : 0),
    0,
  );
  return byCategory + (spot.tags ?? []).filter((tag) => tags.includes(tag)).length * 2;
}

function pickSpots(
  station: GuideStation,
  detail: GuideDetail,
  locale: GuideLocale,
  wanted: PlannerCategory[],
  limit: number,
  preferred: PlannerCategory[] = [],
  tags: QuickTag[] = [],
) {
  return stationSpots(station)
    .map((spot, index) => ({ spot, index, score: spotScore(spot, wanted, preferred, tags) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ spot }) => planSpot(spot, station, detail, locale));
}

function searchLink(search: Search, station: GuideStation, locale: GuideLocale) {
  const label = pt("linkNear", locale, { label: gt(search.label, locale), station: stationTitle(station, locale) });
  const query = locale === "ko" ? `${station.ko} ${search.ko}` : `${search.query} near ${stationTitle(station, "en")}, Seoul`;
  return { label, maps: mapsSearch(query) };
}

function categoryLink(category: PlannerCategory, station: GuideStation, locale: GuideLocale): PlanLink {
  return { ...searchLink(CATEGORY_SEARCH[category], station, locale), category, tag: null };
}

function tagLink(tag: QuickTag, station: GuideStation, locale: GuideLocale): PlanLink | null {
  const search = TAG_SEARCH[tag];
  return search ? { ...searchLink(search, station, locale), category: null, tag } : null;
}

/** Google Maps searches for the wanted categories the picked spots don't cover. */
function missingLinks(station: GuideStation, locale: GuideLocale, wanted: PlannerCategory[], spots: PlanSpot[], limit: number) {
  return wanted
    .filter((category) => !spots.some((spot) => spot.categories.includes(category)))
    .slice(0, limit)
    .map((category) => categoryLink(category, station, locale));
}

/** Searches for the picked tags that belong at this point of the day and aren't covered by a spot. */
function tagLinks(station: GuideStation, locale: GuideLocale, picked: QuickTag[], place: QuickTag[], spots: PlanSpot[]) {
  return picked
    .filter((tag) => place.includes(tag) && !spots.some((spot) => spot.tags.includes(tag)))
    .map((tag) => tagLink(tag, station, locale))
    .filter((link): link is PlanLink => link !== null);
}

/** Locker notes name the exit in Korean ("7번 출입구", "1번 출구"). */
function exitIn(text: string) {
  return /(\d+(?:-\d+)?)\s*번\s*출(?:입)?구/.exec(text)?.[1] ?? null;
}

function lockers(detail: GuideDetail, locale: GuideLocale): PlanFacility[] {
  return detail.lockers.slice(0, 4).map((row) => ({
    line: planLine(row.line, locale),
    floor: row.floor ? floorLabel(row.floor, locale) : null,
    inside: row.insideGate,
    exit: exitIn(row.detail),
    note: row.slots ? pt("lockerCount", locale, { n: row.slots }) : null,
  }));
}

function restrooms(detail: GuideDetail, locale: GuideLocale): PlanFacility[] {
  const seen = new Set<string>();
  return detail.toilets
    .filter((row) => {
      const key = `${row.line}|${row.floor}|${row.gate}|${row.exit}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4)
    .map((row) => ({
      line: planLine(row.line, locale),
      floor: row.floor ? floorLabel(row.floor, locale) : null,
      inside: row.gate === "inside",
      exit: row.exit,
      note: null,
    }));
}

function elevatorLine(detail: GuideDetail, locale: GuideLocale) {
  if (!detail.elevators.length) return null;
  const exits = detail.elevators.map((row) =>
    detail.elevators.length > 1 ? `${gt(row.exit, locale)} (${lineLabel(row.line, locale)})` : gt(row.exit, locale),
  );
  return pt("elevator", locale, { exits: exits.join(", ") });
}

const ceilMinutes = (seconds: number) => Math.max(1, Math.ceil(seconds / 60));

function rideSteps(route: Route, start: number, locale: GuideLocale) {
  const steps: PlanStep[] = [];
  let time = start;
  route.legs.forEach((leg, index) => {
    if (index > 0) {
      const transfer = route.transfers[index - 1];
      steps.push({
        kind: "transfer",
        time,
        station: titleAt(route.legs[index - 1].stationIds.at(-1)!, locale),
        toStation: transfer.toStation ? titleAt(leg.stationIds[0], locale) : null,
        line: planLine(leg.line, locale, leg.express),
        walk: ceilMinutes(transfer.walkSeconds),
      });
      time += (transfer.walkSeconds + transfer.waitSeconds) / 60;
    }
    steps.push({
      kind: "ride",
      time,
      line: planLine(leg.line, locale, leg.express),
      from: titleAt(leg.stationIds[0], locale),
      to: titleAt(leg.stationIds.at(-1)!, locale),
      next: leg.stationIds[1] !== undefined ? titleAt(leg.stationIds[1], locale) : null,
      stops: leg.stationIds.length - 1,
      minutes: ceilMinutes(leg.seconds),
    });
    time += leg.seconds / 60;
  });
  return { steps, end: time };
}

function signature(route: Route) {
  return route.legs.map((leg) => `${leg.line}${leg.express ? "+" : ""}:${leg.stationIds[0]}`).join("|");
}

function flowOf(route: Route, locale: GuideLocale): PlanFlow {
  return {
    stations: [
      { name: nameAt(route.legs[0].stationIds[0], locale), kind: "start" },
      ...route.legs.map((leg, index) => ({
        name: nameAt(leg.stationIds.at(-1)!, locale),
        kind: index === route.legs.length - 1 ? ("end" as const) : ("transfer" as const),
      })),
    ],
    legs: route.legs.map((leg) => ({
      line: planLine(leg.line, locale, leg.express),
      minutes: ceilMinutes(leg.seconds),
      stops: leg.stationIds.length - 1,
    })),
  };
}

/** The station on the way with the best-fitting spots (nearest the middle on ties), else the first transfer station. */
function stopOnTheWay(
  route: Route,
  wanted: PlannerCategory[],
  preferred: PlannerCategory[],
  tags: QuickTag[],
  from: GuideStation,
  to: GuideStation,
) {
  const seen = new Set([from.slug, to.slug]);
  const candidates: { station: GuideStation; leg: number; index: number; position: number; score: number }[] = [];
  let position = 0;
  route.legs.forEach((leg, legIndex) => {
    leg.stationIds.forEach((id, index) => {
      position++;
      const station = guideAt(id);
      if (!station || seen.has(station.slug)) return;
      seen.add(station.slug);
      const score = stationSpots(station).reduce((sum, spot) => sum + spotScore(spot, wanted, preferred, tags), 0);
      candidates.push({ station, leg: legIndex, index, position, score });
    });
  });
  const middle = position / 2;
  const best = candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(a.position - middle) - Math.abs(b.position - middle))[0];
  if (best) return best;
  if (!route.transfers.length) return null;
  const index = route.legs[0].stationIds.length - 1;
  const station = guideAt(route.legs[0].stationIds[index]);
  return station && station.slug !== from.slug && station.slug !== to.slug
    ? { station, leg: 0, index, position: 0, score: 0 }
    : null;
}

function routeOf(legs: RouteLeg[], transfers: RouteTransfer[]): Route {
  const seconds =
    legs.reduce((sum, leg) => sum + leg.seconds, 0) +
    transfers.reduce((sum, transfer) => sum + transfer.walkSeconds + transfer.waitSeconds, 0);
  return { legs, transfers, seconds };
}

/** Cuts the route at a station on it, so the stop never changes which trains the plan takes. */
function splitRoute(route: Route, legIndex: number, index: number): [Route, Route] | null {
  const leg = route.legs[legIndex];
  const last = leg.stationIds.length - 1;
  if (index === last) {
    if (legIndex === route.legs.length - 1) return null;
    return [
      routeOf(route.legs.slice(0, legIndex + 1), route.transfers.slice(0, legIndex)),
      routeOf(route.legs.slice(legIndex + 1), route.transfers.slice(legIndex + 1)),
    ];
  }
  if (index === 0) {
    if (legIndex === 0) return null;
    return [
      routeOf(route.legs.slice(0, legIndex), route.transfers.slice(0, legIndex - 1)),
      routeOf(route.legs.slice(legIndex), route.transfers.slice(legIndex)),
    ];
  }
  const share = index / last;
  const head: RouteLeg = {
    ...leg,
    stations: leg.stations.slice(0, index + 1),
    stationIds: leg.stationIds.slice(0, index + 1),
    seconds: leg.seconds * share,
  };
  const tail: RouteLeg = {
    ...leg,
    stations: leg.stations.slice(index),
    stationIds: leg.stationIds.slice(index),
    seconds: leg.seconds * (1 - share),
  };
  return [
    routeOf([...route.legs.slice(0, legIndex), head], route.transfers.slice(0, legIndex)),
    routeOf([tail, ...route.legs.slice(legIndex + 1)], route.transfers.slice(legIndex)),
  ];
}

function buildPlan(
  mode: RouteMode,
  route: Route,
  from: GuideStation,
  to: GuideStation,
  query: PlannerQuery,
  ids: { from: number; to: number },
  locale: GuideLocale,
): Plan {
  const { categories, tags } = query;
  const wantsLockers = tags.includes("#LuggageLocker");
  const fromDetail = guideDetail(from);
  const toDetail = guideDetail(to);
  const lunch = query.start >= LUNCH_FROM && query.start <= LUNCH_TO;
  const mealSpots = pickSpots(from, fromDetail, locale, ["food"], 2, [], tags);
  const steps: PlanStep[] = [
    {
      kind: "depart",
      time: query.start,
      station: planStation(from, locale, fromDetail),
      lockers: lockers(fromDetail, locale),
      luggageDesk: fromDetail.luggageDesk ? gt(fromDetail.luggageDesk, locale) : null,
      restrooms: restrooms(fromDetail, locale),
      elevator: elevatorLine(fromDetail, locale),
      links: tagLinks(from, locale, tags, DEPART_TAGS, []),
      meal: { lunch, spots: mealSpots, links: mealSpots.length ? [] : [categoryLink("food", from, locale)] },
    },
  ];
  const board = query.start + PREP_MINUTES + (lunch ? LUNCH_MINUTES : 0);
  const back = ceilMinutes(findRoute(ids.to, ids.from, mode)?.seconds ?? route.seconds);
  const leaveBy = query.end - back;
  const rideMinutes = route.seconds / 60;

  const midWanted = [...new Set<PlannerCategory>([...categories.filter((category) => category !== "essentials"), "cafe", "culture"])];
  const roomForStop = leaveBy - (board + rideMinutes + STOP_MINUTES + REBOARD_MINUTES) >= MIN_DESTINATION_MINUTES;
  const stop = roomForStop ? stopOnTheWay(route, midWanted, categories, tags, from, to) : null;
  const parts = stop ? splitRoute(route, stop.leg, stop.index) : null;

  let arrive: number;
  let stopped = false;
  if (stop && parts) {
    const [toStop, fromStop] = parts;
    const first = rideSteps(toStop, board, locale);
    steps.push(...first.steps);
    const detail = guideDetail(stop.station);
    const spots = pickSpots(stop.station, detail, locale, midWanted, 3, categories, tags);
    const stopLockers = wantsLockers ? lockers(detail, locale) : [];
    const until = first.end + STOP_MINUTES;
    const preferred = categories.filter((category) => midWanted.includes(category));
    steps.push({
      kind: "stop",
      time: first.end,
      until,
      station: planStation(stop.station, locale, detail),
      transfer: fromStop.legs[0].line !== toStop.legs.at(-1)!.line,
      spots,
      links: [
        ...missingLinks(stop.station, locale, preferred.length ? preferred : midWanted, spots, spots.length ? 1 : 2),
        ...tagLinks(stop.station, locale, tags, STOP_TAGS, spots),
        ...(wantsLockers && !stopLockers.length ? [tagLink("#LuggageLocker", stop.station, locale)!] : []),
      ],
      lockers: stopLockers,
    });
    const second = rideSteps(fromStop, until + REBOARD_MINUTES, locale);
    steps.push(...second.steps);
    arrive = second.end;
    stopped = true;
  } else {
    const ride = rideSteps(route, board, locale);
    steps.push(...ride.steps);
    arrive = ride.end;
  }

  const destinationWanted: PlannerCategory[] = categories.length ? categories : ["shopping"];
  const spots = pickSpots(to, toDetail, locale, destinationWanted, 3, [], tags).sort((a, b) => a.walk - b.walk);
  const arriveLockers = wantsLockers ? lockers(toDetail, locale) : [];
  steps.push({
    kind: "arrive",
    time: arrive,
    station: planStation(to, locale, toDetail),
    spots,
    links: [
      ...missingLinks(to, locale, destinationWanted, spots, 3),
      ...tagLinks(to, locale, tags, stopped ? ARRIVE_TAGS : [...STOP_TAGS, ...ARRIVE_TAGS], spots),
      ...(wantsLockers && !arriveLockers.length ? [tagLink("#LuggageLocker", to, locale)!] : []),
    ],
    lockers: arriveLockers,
    restrooms: categories.includes("essentials") ? restrooms(toDetail, locale) : [],
    leaveBy,
    back,
  });

  const lines: PlanLine[] = [];
  for (const leg of route.legs) {
    const line = planLine(leg.line, locale, leg.express);
    if (!lines.some((known) => known.name === line.name)) lines.push(line);
  }
  return {
    mode,
    minutes: ceilMinutes(route.seconds),
    transfers: route.transfers.length,
    lines,
    flow: flowOf(route, locale),
    steps,
    signature: signature(route),
  };
}

export function buildPlanner(query: PlannerQuery, locale: GuideLocale): PlannerResult {
  const from = guideStation(query.from);
  const to = guideStation(query.to);
  const fromPlan = from ? planStation(from, locale) : null;
  const toPlan = to ? planStation(to, locale) : null;
  if (!from || !to) return { ok: false, reason: "station", from: fromPlan, to: toPlan };
  if (from.slug === to.slug) return { ok: false, reason: "same", from: fromPlan, to: toPlan };
  const ids = { from: networkId(from), to: networkId(to) };
  if (ids.from === null || ids.to === null) return { ok: false, reason: "route", from: fromPlan, to: toPlan };
  const fastest = findRoute(ids.from, ids.to, "fastest");
  const fewest = findRoute(ids.from, ids.to, "fewest");
  if (!fastest || !fewest) return { ok: false, reason: "route", from: fromPlan, to: toPlan };
  const known = { from: ids.from, to: ids.to };
  return {
    ok: true,
    from: fromPlan!,
    to: toPlan!,
    plans: {
      fastest: buildPlan("fastest", fastest, from, to, query, known, locale),
      fewest: buildPlan("fewest", fewest, from, to, query, known, locale),
    },
  };
}

/** One-way summary for titles, descriptions and the suggested trips. */
export function routeSummary(fromSlug: string, toSlug: string, locale: GuideLocale) {
  const from = guideStation(fromSlug);
  const to = guideStation(toSlug);
  if (!from || !to || from.slug === to.slug) return null;
  const a = networkId(from);
  const b = networkId(to);
  const route = a !== null && b !== null ? findRoute(a, b, "fastest") : null;
  if (!route) return null;
  return {
    from: baseName(from, locale),
    to: baseName(to, locale),
    minutes: ceilMinutes(route.seconds),
    transfers: route.transfers.length,
    lines: [...new Set(route.legs.map((leg) => lineLabel(leg.line, locale)))],
    colors: [...new Set(route.legs.map((leg) => stationLineColor(leg.line)))],
    via: route.transfers.map((transfer, index) => titleAt(route.legs[index].stationIds.at(-1)!, locale) || transfer.station),
  };
}

/** Suggested trips with their one-way ride, for the planner home and the sitemap. */
export function plannerPairs(locale: GuideLocale) {
  return PLANNER_PAIRS.flatMap(([fromKo, toKo, categories, tags]) => {
    const from = guideByKo(fromKo);
    const to = guideByKo(toKo);
    const summary = from && to ? routeSummary(from.slug, to.slug, locale) : null;
    if (!from || !to || !summary) return [];
    const highlight = stationSpots(to)
      .map((spot, index) => ({ spot, index, score: spotScore(spot, categories, [], tags) }))
      .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.spot;
    return [
      {
        from: from.slug,
        to: to.slug,
        tags,
        image: highlight ? spotImage(highlight) : ("station" as PlannerImage),
        highlight: highlight ? gt(highlight.name, locale) : null,
        href: plannerHref({ from: from.slug, to: to.slug, categories, tags, start: DEFAULT_START, end: DEFAULT_END }, locale),
        summary,
      },
    ];
  });
}

export type PlannerStationOption = {
  slug: string;
  name: string;
  ko: string;
  /** English name, so a station can be searched in English on any language's page. */
  en: string;
  lines: string;
  badges: { short: string; color: string }[];
};

const options = new Map<GuideLocale, PlannerStationOption[]>();

/** Every guide station the route finder can reach, for the form's search. */
export function plannerStations(locale: GuideLocale) {
  let list = options.get(locale);
  if (!list) {
    list = GUIDE_STATIONS.filter((station) => networkId(station) !== null).map((station) => ({
      slug: station.slug,
      name: baseName(station, locale),
      ko: station.ko,
      en: station.name.en,
      lines: station.lines.map((line) => lineLabel(line, locale)).join(" · "),
      badges: station.lines.slice(0, 4).map((line) => ({ short: shortLine(line), color: stationLineColor(line) })),
    }));
    options.set(locale, list);
  }
  return list;
}
