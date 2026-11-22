import { guideByKo, type GuideStation } from "./guide";
import { lineColor } from "../kakao-places";
import { t, type Locale } from "./i18n";
import { lineName } from "./lineNames";
import { ALL_STATIONS, distanceMeters, stationParams, type StationOption } from "./stations";

function localizedLines(lines: readonly string[]) {
  const names = lines.map(lineName);
  const join = (locale: Locale) => names.map((name) => t(name, locale)).join(" · ");
  return { ko: join("ko"), en: join("en"), zh: join("zh"), ja: join("ja") };
}

/** Prefer the curated / indexed StationOption so app tiles keep their place data. */
export function stationOptionFromGuide(guide: GuideStation): StationOption {
  const near = { lat: guide.lat, lng: guide.lng };
  const matches = ALL_STATIONS.filter((station) => station.name.ko === guide.ko);
  if (matches.length) {
    return matches.reduce((best, station) =>
      distanceMeters(near, station.center) < distanceMeters(near, best.center) ? station : best,
    );
  }
  return {
    key: `guide:${guide.slug}`,
    name: guide.name,
    lines: localizedLines(guide.lines),
    center: near,
    color: lineColor([...guide.lines]),
  };
}

/** Resolve a clean `/station/[slug]` path when the station is in the guide index. */
export function stationAppPath(station: StationOption): string {
  const guide = guideByKo(station.name.ko, station.center);
  return guide ? `/station/${guide.slug}` : `/station?${stationParams(station)}`;
}

/** Guide → interactive app URL (clean slug path). */
export function guideStationAppPath(station: GuideStation, locale?: Locale) {
  return locale && locale !== "en" ? `/station/${station.slug}?lang=${locale}` : `/station/${station.slug}`;
}
