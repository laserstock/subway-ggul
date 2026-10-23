"use client";

import { loadKakaoMaps } from "../kakao-sdk";
import { searchNearby, type NearbyPlace } from "../kakao-places";
import { stationKey, stepFreeMaps } from "./stepFree";
import { STATION_ADDRESSES, STATION_TOILETS, type StationToilet } from "./stationToilets";
import { formatDistance, stationKeys, type Localized, type StationOption } from "./stations";
import { lineLabel, sameLine } from "./subwayLine";

export type UrgentKind = "restroom" | "pharmacy" | "clinic";
/** `station`: inside the station building but outside the fare gates (e.g. concourse shops). */
export type UrgentZone = "inside" | "station" | "exit" | "outside" | "unknown";

export type UrgentSpot = {
  id: string;
  kind: UrgentKind;
  zone: UrgentZone;
  detail: Localized;
  walkMinutes: number | null;
  url?: string;
  exitLinked?: boolean;
  hours?: Localized;
  secondary?: boolean;
  /** Line whose platform the walk is measured from. */
  line?: string;
};

export type StationUrgent = Record<UrgentKind, UrgentSpot[]>;

export type Recommendation = {
  target: "current" | "next";
  kind: UrgentKind;
  spot: UrgentSpot;
};

const ZONE_RANK: Record<UrgentZone, number> = { inside: 0, station: 1, exit: 2, outside: 3, unknown: 4 };
const PHARMACY_RADIUS = 500;
const CLINIC_RADIUS = 500;
const EXIT_LINKED_METERS = 150;
const IN_STATION_NAME_METERS = 200;
/** Extra minutes when the spot is on another line of a transfer station. */
const OTHER_LINE_MINUTES = 3;

/** Matched against the Kakao category path plus the place name. */
const CLINIC_EXCLUDE =
  /치과|한의원|한방|한의|동물|피부|성형|안과|정신|요양|비뇨|탈모|모발|미용|에스테틱|재활|정형|통증|척추|관절|신경외과|마취|영상의학|검진|산후|난임/;
const CLINIC_PRIMARY = /내과|가정의학|이비인후과|소아청소년과|소아과|응급|종합병원|대학병원/;
const CLINIC_OTHER = /의원|병원|외과|산부인과|여성/;

const TAP_IN: Localized = { ko: "카드 안 찍고 바로 이용", en: "No need to tap out" };
const TAP_OUT: Localized = { ko: "카드 찍고 나가야 해요", en: "Tap out at the gate first" };

function spot(
  id: string,
  kind: UrgentKind,
  zone: UrgentZone,
  detail: Localized,
  walkMinutes: number | null,
  extra: Partial<UrgentSpot> = {},
): UrgentSpot {
  return { id, kind, zone, detail, walkMinutes, ...extra };
}

function joinParts(parts: (Localized | null)[]): Localized {
  const present = parts.filter((part): part is Localized => part !== null);
  return {
    ko: present.map((part) => part.ko).join(" · "),
    en: present.map((part) => part.en).join(" · "),
  };
}

/** "B3" → -3, "2F" → 2. */
function floorNumber(floor: string) {
  const below = floor.match(/^B(\d+)$/);
  if (below) return -Number(below[1]);
  const above = floor.match(/^(\d+)F$/);
  return above ? Number(above[1]) : null;
}

/** Storeys climbed between two floors (there is no floor 0 between B1 and 1F). */
function storeysBetween(a: string, b: string) {
  const from = floorNumber(a);
  const to = floorNumber(b);
  if (from === null || to === null) return 0;
  return Math.abs(from - to) - (from * to < 0 ? 1 : 0);
}

function toiletPath(toilet: StationToilet, platform: string, gate: string): Localized {
  if (toilet.gate === "inside") {
    return toilet.floor === platform
      ? { ko: "승강장과 같은 층", en: "Same floor as the platform" }
      : { ko: `승강장 ${platform} → ${toilet.floor}`, en: `Platform ${platform} → ${toilet.floor}` };
  }
  const gateStep = gate === platform ? "" : ` → ${gate}`;
  const after = toilet.floor === gate ? "" : ` → ${toilet.floor}`;
  return {
    ko: `승강장 ${platform}${gateStep} 개찰구 밖${after}`,
    en: `Platform ${platform}${gateStep} gate, tap out${after}`,
  };
}

function restroomSpot(station: StationOption, toilet: StationToilet, index: number, showLine: boolean): UrgentSpot {
  const map = stepFreeMaps(station).find((candidate) => sameLine(candidate.line, toilet.line));
  const platform = map?.levels[map.platformLevel]?.floor;
  const gate = map?.levels[map.gateLevel]?.floor;
  const path = platform && gate ? toiletPath(toilet, platform, gate) : null;
  const outside = toilet.gate === "outside";
  const walkMinutes = platform
    ? 1 + storeysBetween(platform, toilet.floor) + (outside ? 1 : 0)
    : outside
      ? 3
      : 2;
  const lineTag = showLine ? lineLabel(toilet.line) : null;
  const exitHint =
    toilet.exit && !/출구|출입구/.test(toilet.detail)
      ? { ko: ` (${toilet.exit}번 출구 쪽)`, en: `, near Exit ${toilet.exit}` }
      : { ko: "", en: toilet.exit ? `, near Exit ${toilet.exit}` : "" };
  const where: Localized = {
    ko: `${lineTag ? `${lineTag.ko} ` : ""}${toilet.floor} ${toilet.detail}${exitHint.ko}`,
    en: `${lineTag ? `${lineTag.en} ` : ""}${toilet.floor}${exitHint.en}`,
  };
  return spot(
    `${stationKey(station)}-wc-${index}`,
    "restroom",
    outside ? "outside" : "inside",
    joinParts([where, path, outside ? TAP_OUT : TAP_IN]),
    walkMinutes,
    { line: toilet.line },
  );
}

/** Stations outside Seoul Metro's dataset fall back to the toilet note read off the station map. */
function mapRestroom(station: StationOption): UrgentSpot {
  const mapNote = stepFreeMaps(station)
    .flatMap((map) => map.notes)
    .find((note) => note.icon === "🚻");
  return spot(
    `${stationKey(station)}-wc`,
    "restroom",
    "unknown",
    mapNote
      ? joinParts([mapNote.text, { ko: "개찰구 안/밖은 현장에서 확인해 주세요", en: "Check which side of the gate on site" }])
      : {
          ko: "공식 화장실 정보가 없는 역이에요 (코레일·9호선 등) · 역 안내도를 확인해 주세요",
          en: "No official restroom data for this station · Check the station map",
        },
    null,
  );
}

function restroomSpots(station: StationOption): UrgentSpot[] {
  const toilets = stationKeys(station).flatMap((key) => STATION_TOILETS[key] ?? []);
  if (toilets.length === 0) return [mapRestroom(station)];
  const showLine = new Set(toilets.map((toilet) => toilet.line)).size > 1;
  return toilets.map((toilet, index) => restroomSpot(station, toilet, index, showLine));
}

function roadKey(address: string) {
  const match = address.match(/(?:^|\s)([가-힣A-Za-z0-9.]+(?:로|길))\s*(지하)?\s*(\d+(?:-\d+)?)/);
  return match ? `${match[1]}${match[2] ?? ""}${match[3]}` : null;
}

function lotKey(address: string) {
  const match = address.match(/(?:^|\s)([가-힣0-9]+(?:동|가|리))\s+(산\s*)?(\d+(?:-\d+)?)/);
  return match ? `${match[1]}${match[2] ? "산" : ""}${match[3]}` : null;
}

function isInStation(place: NearbyPlace, station: StationOption) {
  const keys = stationKeys(station);
  const known = keys.map((key) => STATION_ADDRESSES[key]).filter((entry) => entry !== undefined);
  const road = place.roadAddress ? roadKey(place.roadAddress) : null;
  if (road && known.some((entry) => entry.road.some((address) => roadKey(address) === road))) return true;
  const lot = place.lotAddress ? lotKey(place.lotAddress) : null;
  if (lot && known.some((entry) => entry.lot.some((address) => lotKey(address) === lot))) return true;
  return (
    place.distance <= IN_STATION_NAME_METERS &&
    place.roadAddress.includes("지하") &&
    keys.some((key) => place.name.includes(key))
  );
}

function walkFromStation(distance: number) {
  return Math.max(1, Math.round(distance / 70)) + 1;
}

function pharmacySpot(place: NearbyPlace, station: StationOption): UrgentSpot {
  if (isInStation(place, station)) {
    return spot(
      `kakao-${place.id}`,
      "pharmacy",
      "station",
      joinParts([{ ko: place.name, en: place.name }, { ko: "역사 안 매장", en: "Shop inside the station" }, TAP_OUT]),
      2,
      { url: place.url },
    );
  }
  return spot(
    `kakao-${place.id}`,
    "pharmacy",
    "outside",
    joinParts([
      { ko: place.name, en: place.name },
      { ko: `역에서 ${formatDistance(place.distance)}`, en: `${formatDistance(place.distance)} from station` },
      TAP_OUT,
    ]),
    walkFromStation(place.distance),
    { url: place.url },
  );
}

function clinicKind(place: NearbyPlace) {
  const text = `${place.category} ${place.name}`;
  if (CLINIC_EXCLUDE.test(text)) return null;
  if (CLINIC_PRIMARY.test(text)) return "primary";
  return CLINIC_OTHER.test(text) ? "other" : null;
}

function clinicSpot(place: NearbyPlace, kind: "primary" | "other"): UrgentSpot {
  const exitLinked = place.distance <= EXIT_LINKED_METERS;
  const specialty = place.category.split(">").pop()?.trim();
  const label = specialty && specialty !== "병원" && !place.name.includes(specialty) ? ` (${specialty})` : "";
  return spot(
    `kakao-${place.id}`,
    "clinic",
    exitLinked ? "exit" : "outside",
    {
      ko: `${place.name}${label} · 역에서 ${formatDistance(place.distance)}`,
      en: `${place.name}${label} · ${formatDistance(place.distance)} from station`,
    },
    walkFromStation(place.distance),
    { url: place.url, exitLinked, secondary: kind === "other" },
  );
}

const urgentCache = new Map<string, Promise<StationUrgent>>();

export function loadUrgent(station: StationOption): Promise<StationUrgent> {
  const cached = urgentCache.get(station.key);
  if (cached) return cached;
  const restroom = restroomSpots(station);
  const request = loadKakaoMaps()
    .then(() =>
      Promise.all([
        searchNearby({ kind: "category", code: "PM9", radius: PHARMACY_RADIUS }, station.center).then((found) =>
          found.map((place) => pharmacySpot(place, station)),
        ),
        searchNearby({ kind: "category", code: "HP8", radius: CLINIC_RADIUS }, station.center).then((found) =>
          found.flatMap((place) => {
            const kind = clinicKind(place);
            return kind ? [clinicSpot(place, kind)] : [];
          }),
        ),
      ]),
    )
    .then(([pharmacy, clinic]) => ({ restroom, pharmacy, clinic }))
    .catch(() => {
      urgentCache.delete(station.key);
      return { restroom, pharmacy: [], clinic: [] };
    });
  urgentCache.set(station.key, request);
  return request;
}

function effectiveWalk(spot: UrgentSpot, line?: string | null) {
  const walk = spot.walkMinutes ?? 99;
  return line && spot.line && !sameLine(spot.line, line) ? walk + OTHER_LINE_MINUTES : walk;
}

/** `line` is the line being ridden; spots on other lines of a transfer station rank a little lower. */
export function sortSpots(spots: UrgentSpot[], line?: string | null) {
  return [...spots].sort(
    (a, b) =>
      Number(Boolean(a.secondary)) - Number(Boolean(b.secondary)) ||
      ZONE_RANK[a.zone] - ZONE_RANK[b.zone] ||
      effectiveWalk(a, line) - effectiveWalk(b, line),
  );
}

export function bestSpot(spots: UrgentSpot[], line?: string | null): UrgentSpot | null {
  return sortSpots(spots, line)[0] ?? null;
}

export function pickRecommendation(
  current: StationUrgent,
  next: StationUrgent | null,
  kinds: UrgentKind[],
  line?: string | null,
): Recommendation | null {
  if (next) {
    for (const kind of kinds) {
      const here = bestSpot(current[kind], line);
      const there = bestSpot(next[kind], line);
      if (there && there.zone !== "unknown" && ZONE_RANK[there.zone] < (here ? ZONE_RANK[here.zone] : 9)) {
        return { target: "next", kind, spot: there };
      }
    }
  }
  for (const kind of kinds) {
    const here = bestSpot(current[kind], line);
    if (here && here.zone !== "unknown") return { target: "current", kind, spot: here };
  }
  return null;
}
