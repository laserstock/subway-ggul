"use client";

import type { LatLng } from "../KakaoMap";
import { loadKakaoMaps } from "../kakao-sdk";
import {
  findLineStations,
  normalizeLine,
  searchNearby,
  type KakaoStation,
  type NearbyPlace,
} from "../kakao-places";
import { distanceMeters, formatDistance, type Localized, type StationOption } from "./stations";

export type UrgentKind = "restroom" | "pharmacy" | "clinic";
export type UrgentZone = "inside" | "exit" | "outside" | "unknown";

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
};

export type StationUrgent = Record<UrgentKind, UrgentSpot[]>;

export type Recommendation = {
  target: "current" | "next";
  kind: UrgentKind;
  spot: UrgentSpot;
};

const ZONE_RANK: Record<UrgentZone, number> = { inside: 0, exit: 1, outside: 2, unknown: 3 };
const PHARMACY_RADIUS = 500;
const CLINIC_RADIUS = 400;
const EXIT_LINKED_METERS = 150;
const CLINIC_INCLUDE = /의원|내과|이비인후과|가정의학|산부인과|여성|소아|치과|응급/;
const CLINIC_PRIMARY = /내과|가정의학|이비인후과|산부인과|여성|소아|응급|치과/;
const CLINIC_EXCLUDE =
  /한의원|한방|한의|동물|피부|성형|안과|정신|요양|비뇨|탈모|모발|미용|에스테틱|재활|정형|통증|척|관절|신경외과|마취/;

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

function joined(head: Localized, tail: Localized): Localized {
  return { ko: `${head.ko} · ${tail.ko}`, en: `${head.en} · ${tail.en}` };
}

const CURATED_URGENT: Record<string, Partial<StationUrgent>> = {
  군자역: {
    restroom: [
      spot(
        "gunja-wc",
        "restroom",
        "inside",
        joined({ ko: "5호선 승강장 중앙 지하 1층", en: "Line 5 platform center, B1" }, TAP_IN),
        1,
      ),
    ],
    pharmacy: [
      spot(
        "gunja-ph",
        "pharmacy",
        "outside",
        joined({ ko: "3번 출구 나가서 바로 앞", en: "Right outside Exit 3" }, TAP_OUT),
        3,
      ),
    ],
  },
  장한평역: {
    restroom: [
      spot(
        "jhp-wc",
        "restroom",
        "inside",
        joined({ ko: "승강장 중앙 지하 1층", en: "Platform center, B1" }, TAP_IN),
        1,
      ),
    ],
    pharmacy: [
      spot(
        "jhp-ph",
        "pharmacy",
        "inside",
        joined({ ko: "지하 1층 개찰구 내부 통로", en: "B1 corridor inside the gate" }, TAP_IN),
        1,
      ),
    ],
    clinic: [
      spot("jhp-cl", "clinic", "exit", { ko: "3번 출구 연세의원", en: "Yonsei Clinic at Exit 3" }, 2, {
        exitLinked: true,
        hours: { ko: "야간진료 ~20:00", en: "Night clinic ~20:00" },
      }),
    ],
  },
};

function curatedUrgent(station: StationOption): Partial<StationUrgent> {
  const listed = CURATED_URGENT[station.name.ko];
  if (listed) return listed;
  const curated = station.curated;
  if (!curated) return {};
  return {
    restroom: [
      spot(
        `${curated.id}-wc`,
        "restroom",
        "inside",
        joined({ ko: "개찰구 안 승강장 연결 통로", en: "Platform corridor inside the gate" }, TAP_IN),
        1,
      ),
    ],
    pharmacy: curated.places
      .filter((place) => place.category === "pharmacy")
      .map((place) =>
        spot(
          place.id,
          "pharmacy",
          place.zone === "inside" ? "inside" : "outside",
          joined(place.name, place.zone === "inside" ? TAP_IN : TAP_OUT),
          place.walkMinutes,
        ),
      ),
  };
}

function walkFromStation(distance: number) {
  return Math.max(1, Math.round(distance / 70)) + 1;
}

function pharmacySpot(place: NearbyPlace): UrgentSpot {
  return spot(
    `kakao-${place.id}`,
    "pharmacy",
    "outside",
    joined({ ko: place.name, en: place.name }, TAP_OUT),
    walkFromStation(place.distance),
    { url: place.url },
  );
}

function clinicSpot(place: NearbyPlace): UrgentSpot {
  const exitLinked = place.distance <= EXIT_LINKED_METERS;
  return spot(
    `kakao-${place.id}`,
    "clinic",
    exitLinked ? "exit" : "outside",
    {
      ko: `${place.name} · 역에서 ${formatDistance(place.distance)}`,
      en: `${place.name} · ${formatDistance(place.distance)} from station`,
    },
    walkFromStation(place.distance),
    { url: place.url, exitLinked, secondary: !CLINIC_PRIMARY.test(place.name) },
  );
}

const UNKNOWN_RESTROOM = (station: StationOption): UrgentSpot =>
  spot(`${station.key}-wc`, "restroom", "unknown", {
    ko: "개찰구 안/밖 위치 정보 준비 중 · 역 안내도를 확인해 주세요",
    en: "Gate-side info coming soon · Check the station map",
  }, null);

const urgentCache = new Map<string, Promise<StationUrgent>>();

export function loadUrgent(station: StationOption): Promise<StationUrgent> {
  const cached = urgentCache.get(station.key);
  if (cached) return cached;
  const curated = curatedUrgent(station);
  const request = loadKakaoMaps()
    .then(() =>
      Promise.all([
        curated.pharmacy
          ? Promise.resolve(curated.pharmacy)
          : searchNearby({ kind: "category", code: "PM9", radius: PHARMACY_RADIUS }, station.center).then(
              (found) => found.map(pharmacySpot),
            ),
        curated.clinic
          ? Promise.resolve(curated.clinic)
          : searchNearby({ kind: "category", code: "HP8", radius: CLINIC_RADIUS }, station.center).then(
              (found) =>
                found
                  .filter((place) => CLINIC_INCLUDE.test(place.name) && !CLINIC_EXCLUDE.test(place.name))
                  .map(clinicSpot),
            ),
      ]),
    )
    .then(([pharmacy, clinic]) => ({
      restroom: curated.restroom ?? [UNKNOWN_RESTROOM(station)],
      pharmacy,
      clinic,
    }))
    .catch(() => {
      urgentCache.delete(station.key);
      return {
        restroom: curated.restroom ?? [UNKNOWN_RESTROOM(station)],
        pharmacy: curated.pharmacy ?? [],
        clinic: curated.clinic ?? [],
      };
    });
  urgentCache.set(station.key, request);
  return request;
}

const lineCache = new Map<string, Promise<KakaoStation[]>>();

export function lineCacheKey(station: StationOption, line: string) {
  return `${station.key}|${normalizeLine(line)}`;
}

export function loadLineStations(station: StationOption, line: string): Promise<KakaoStation[]> {
  const key = lineCacheKey(station, line);
  const cached = lineCache.get(key);
  if (cached) return cached;
  const request = loadKakaoMaps()
    .then(() => findLineStations(line, station.center))
    .catch(() => {
      lineCache.delete(key);
      return [];
    });
  lineCache.set(key, request);
  return request;
}

export function bearingDegrees(from: LatLng, to: LatLng) {
  const rad = Math.PI / 180;
  const y = Math.sin((to.lng - from.lng) * rad) * Math.cos(to.lat * rad);
  const x =
    Math.cos(from.lat * rad) * Math.sin(to.lat * rad) -
    Math.sin(from.lat * rad) * Math.cos(to.lat * rad) * Math.cos((to.lng - from.lng) * rad);
  return (Math.atan2(y, x) / rad + 360) % 360;
}

export function angleBetween(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function lineNeighbors(station: StationOption, stations: KakaoStation[]): KakaoStation[] {
  const others = stations
    .filter((candidate) => candidate.name !== station.name.ko)
    .map((candidate) => ({
      candidate,
      distance: distanceMeters(station.center, candidate.center),
      bearing: bearingDegrees(station.center, candidate.center),
    }))
    .sort((a, b) => a.distance - b.distance);
  const [first, ...rest] = others;
  if (!first) return [];
  const opposite = rest.find((other) => angleBetween(other.bearing, first.bearing) > 100);
  return opposite ? [first.candidate, opposite.candidate] : [first.candidate];
}

export function stationLines(station: StationOption) {
  return station.lines.ko.split(" · ").filter(Boolean);
}

export function sameLine(a: string, b: string) {
  return normalizeLine(a) === normalizeLine(b);
}

export function lineLabel(line: string): Localized {
  return { ko: line, en: line.replace(/^(\d+)호선$/, "Line $1") };
}

export function sortSpots(spots: UrgentSpot[]) {
  return [...spots].sort(
    (a, b) =>
      Number(Boolean(a.secondary)) - Number(Boolean(b.secondary)) ||
      ZONE_RANK[a.zone] - ZONE_RANK[b.zone] ||
      (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99),
  );
}

export function bestSpot(spots: UrgentSpot[]): UrgentSpot | null {
  return sortSpots(spots)[0] ?? null;
}

export function pickRecommendation(
  current: StationUrgent,
  next: StationUrgent | null,
  kinds: UrgentKind[],
): Recommendation | null {
  if (next) {
    for (const kind of kinds) {
      const here = bestSpot(current[kind]);
      const there = bestSpot(next[kind]);
      if (there && there.zone !== "unknown" && ZONE_RANK[there.zone] < (here ? ZONE_RANK[here.zone] : 9)) {
        return { target: "next", kind, spot: there };
      }
    }
  }
  for (const kind of kinds) {
    const here = bestSpot(current[kind]);
    if (here && here.zone !== "unknown") return { target: "current", kind, spot: here };
  }
  return null;
}
