import { lineColor } from "../kakao-places";
import { t, type Locale, type Localized } from "./i18n";
import { lineName } from "./lineNames";
import { STATION_EXITS } from "./stationExits";
import { STATION_INDEX, type IndexedStation } from "./stationIndex";
import { STATION_LOCKERS, type StationLocker } from "./stationLockers";
import { STATION_ADDRESSES, STATION_TOILETS, type StationToilet } from "./stationToilets";
import { STATION_TRANSFERS } from "./stationTransfers";
import { NETWORK_EDGES, NETWORK_SERVICES, NETWORK_STATIONS } from "./subwayNetwork";

export type GuideStation = {
  slug: string;
  /** Korean name with 역, the key every data table uses. */
  ko: string;
  name: Localized;
  lines: readonly string[];
  lat: number;
  lng: number;
};

export type GuideExit = { label: string; lat: number; lng: number };

export type GuideTransfer = {
  fromLine: string;
  fromToward: GuideStation | null;
  fromTowardKo: string;
  /** "5-2": car 5, door 2. */
  alight: string;
  toLine: string;
  toToward: GuideStation | null;
  toTowardKo: string;
  seconds: number | null;
};

export type GuideNeighbors = { line: string; stations: GuideStation[] }[];

export type GuideDetail = {
  exits: GuideExit[];
  toilets: StationToilet[];
  lockers: StationLocker[];
  transfers: GuideTransfer[];
  neighbors: GuideNeighbors;
  address: string | null;
};

/** Exits further than this from the station point belong to a same-named station elsewhere. */
const EXIT_RADIUS_METERS = 1500;

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toGuide(entry: IndexedStation, slug: string): GuideStation {
  return {
    slug,
    ko: entry.n,
    name: { ko: entry.n, en: entry.e, zh: entry.z, ja: entry.j },
    lines: entry.l,
    lat: entry.c[0],
    lng: entry.c[1],
  };
}

const onNumberedLine = (entry: IndexedStation) => entry.l.some((line) => /^\d+호선$/.test(line));

/**
 * One guide per station-master entry. Stations sharing an English name keep the plain slug for the
 * one travellers mean (most lines, then a numbered Seoul line); the others get their first line appended.
 */
export const GUIDE_STATIONS: readonly GuideStation[] = (() => {
  const groups = new Map<string, IndexedStation[]>();
  for (const entry of STATION_INDEX) {
    const base = slugify(entry.e) || slugify(entry.n);
    groups.set(base, [...(groups.get(base) ?? []), entry]);
  }
  const slugs = new Map<IndexedStation, string>();
  for (const [base, entries] of groups) {
    [...entries]
      .sort((a, b) => b.l.length - a.l.length || Number(onNumberedLine(b)) - Number(onNumberedLine(a)))
      .forEach((entry, index) => {
        slugs.set(entry, index === 0 ? base : `${base}-${slugify(t(lineName(entry.l[0]), "en"))}`);
      });
  }
  return STATION_INDEX.map((entry) => toGuide(entry, slugs.get(entry)!));
})();

const BY_SLUG = new Map(GUIDE_STATIONS.map((station) => [station.slug, station]));

export function guideStation(slug: string) {
  return BY_SLUG.get(slug) ?? null;
}

function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = Math.PI / 180;
  const x = (bLng - aLng) * rad * Math.cos(((aLat + bLat) / 2) * rad);
  const y = (bLat - aLat) * rad;
  return Math.sqrt(x * x + y * y) * 6_371_000;
}

/** The guide for a Korean station name, nearest to `near` when the name is shared. */
export function guideByKo(ko: string, near?: { lat: number; lng: number }) {
  const name = ko.endsWith("역") ? ko : `${ko}역`;
  const matches = GUIDE_STATIONS.filter((station) => station.ko === name);
  if (matches.length < 2 || !near) return matches[0] ?? null;
  return matches.reduce((best, station) =>
    distanceMeters(near.lat, near.lng, station.lat, station.lng) <
    distanceMeters(near.lat, near.lng, best.lat, best.lng)
      ? station
      : best,
  );
}

function servesLine(station: GuideStation, line: string) {
  return station.lines.some((own) => own === line || own.startsWith(line) || line.startsWith(own));
}

function networkIndex(station: GuideStation) {
  let best = -1;
  let bestDistance = Infinity;
  NETWORK_STATIONS.forEach((entry, index) => {
    if (!entry || entry[0] !== station.ko) return;
    const distance = distanceMeters(station.lat, station.lng, entry[1], entry[2]);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

function neighbors(station: GuideStation): GuideNeighbors {
  const own = networkIndex(station);
  if (own < 0) return [];
  const byLine = new Map<string, Set<number>>();
  for (const [service, from, to] of NETWORK_EDGES) {
    const info = NETWORK_SERVICES[service];
    if (!info || info.express) continue;
    const other = from === own ? to : to === own ? from : -1;
    if (other < 0) continue;
    byLine.set(info.line, (byLine.get(info.line) ?? new Set()).add(other));
  }
  return [...byLine].map(([line, indexes]) => ({
    line,
    stations: [...indexes]
      .map((index) => {
        const entry = NETWORK_STATIONS[index];
        return entry ? guideByKo(entry[0], { lat: entry[1], lng: entry[2] }) : null;
      })
      .filter((found): found is GuideStation => found !== null && found.slug !== station.slug),
  }));
}

export function guideDetail(station: GuideStation): GuideDetail {
  const exits = (STATION_EXITS[station.ko] ?? [])
    .filter(([, lat, lng]) => distanceMeters(station.lat, station.lng, lat, lng) <= EXIT_RADIUS_METERS)
    .map(([label, lat, lng]) => ({ label, lat, lng }));
  const toilets = (STATION_TOILETS[station.ko] ?? []).filter((row) => servesLine(station, row.line));
  const lockers = (STATION_LOCKERS[station.ko] ?? []).filter((row) => servesLine(station, row.line));
  const transfers = (STATION_TRANSFERS[station.ko] ?? [])
    .filter(([fromLine, , , , toLine]) => servesLine(station, fromLine) && servesLine(station, toLine))
    .map(([fromLine, fromToward, , alight, toLine, toToward, , seconds]) => ({
      fromLine,
      fromToward: guideByKo(fromToward, station),
      fromTowardKo: fromToward,
      alight,
      toLine,
      toToward: guideByKo(toToward, station),
      toTowardKo: toToward,
      seconds,
    }));
  return {
    exits,
    toilets,
    lockers,
    transfers,
    neighbors: neighbors(station),
    address: STATION_ADDRESSES[station.ko]?.road[0] ?? null,
  };
}

export function stationLineColor(line: string) {
  return lineColor([line]);
}

export function localLine(line: string, locale: Locale) {
  return t(lineName(line), locale);
}

/** Display order for line groups: numbered Seoul lines first, then the rest by name. */
export function compareLines(a: string, b: string) {
  const numberOf = (line: string) => Number(/^(\d+)호선$/.exec(line)?.[1] ?? Infinity);
  return numberOf(a) - numberOf(b) || a.localeCompare(b, "ko");
}

export const ALL_LINES: readonly string[] = [...new Set(GUIDE_STATIONS.flatMap((station) => station.lines))].sort(
  compareLines,
);

/** Popular with visitors, in the order shown on the guide home. */
const POPULAR_KO = [
  "서울역",
  "명동역",
  "홍대입구역",
  "강남역",
  "시청역",
  "동대문역사문화공원역",
  "이태원역",
  "잠실역",
  "성수역",
  "광화문역",
  "인천공항1터미널역",
  "김포공항역",
];

export const POPULAR_GUIDES: readonly GuideStation[] = POPULAR_KO.map((ko) => guideByKo(ko)).filter(
  (station): station is GuideStation => station !== null,
);

/** The interactive app page for a station, opened in the guide's language. */
export function appStationHref(station: GuideStation, locale: Locale) {
  const params = new URLSearchParams({
    station: station.ko,
    lat: String(station.lat),
    lng: String(station.lng),
    lines: station.lines.join(" · "),
    lang: locale,
  });
  return `/station?${params}`;
}

export function googleMapsHref(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
