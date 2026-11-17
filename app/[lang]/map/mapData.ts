import { guideDetail } from "../../_lib/guide";
import { gt, lineLabel, tc } from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import { OFFICIAL_MAP, OFFICIAL_MAP_LEVELS, OFFICIAL_MAP_MAX_ZOOM } from "../../_lib/officialMap";
import { SUBWAY_MAP } from "../../_lib/subwayMap";
import type { MapCopy, MapLineData, MapStationData } from "./SubwayMap";

export { OFFICIAL_MAP_LEVELS as MAP_LEVELS, OFFICIAL_MAP_MAX_ZOOM as MAP_MAX_ZOOM };

/** Lines and stations for `SubwayMap`, pinned to the official Seoul Metro diagram. */
export function mapData(lang: GuideLocale) {
  const { nodes, lines } = SUBWAY_MAP;
  const names = nodes.map((node) => gt(node.station.name, lang));
  const lineIndex = new Map(lines.map((line, index) => [line.line, index]));
  const mapLines: MapLineData[] = lines.map((line) => ({
    ko: line.line,
    name: lineLabel(line.line, lang),
    color: line.color,
    d: line.d,
  }));
  const stations: MapStationData[] = nodes.map((node, index) => {
    const detail = guideDetail(node.station);
    const inside = detail.toilets.filter((row) => row.gate === "inside").length;
    const pin = OFFICIAL_MAP.stations[node.station.slug];
    return {
      slug: node.station.slug,
      name: names[index],
      ko: node.station.ko,
      alt: lang === "en" ? null : gt(node.station.name, "en"),
      x: pin?.x ?? node.x,
      y: pin?.y ?? node.y,
      lines: node.lines.map((line) => lineIndex.get(line)).filter((line): line is number => line !== undefined),
      hub: node.hub,
      // Official diagram already labels stations; keep hits easy to find when zoomed out.
      level: pin && !pin.fallback ? 0 : 2,
      position: 0,
      lat: node.station.lat,
      lng: node.station.lng,
      exits: detail.exits.length,
      restroomsIn: inside,
      restroomsOut: detail.toilets.length - inside,
      lockers: detail.lockers.length,
      desk: Boolean(detail.luggageDesk),
      elevator: detail.elevators[0] ? gt(detail.elevators[0].exit, lang) : null,
    };
  });
  return {
    width: OFFICIAL_MAP.width,
    height: OFFICIAL_MAP.height,
    focus: OFFICIAL_MAP.focus,
    image: OFFICIAL_MAP.image,
    levels: OFFICIAL_MAP_LEVELS,
    maxZoom: OFFICIAL_MAP_MAX_ZOOM,
    lines: mapLines,
    stations,
  };
}

export function mapCopy(lang: GuideLocale): MapCopy {
  return {
    label: tc("mapLabel", lang),
    search: tc("mapSearch", lang),
    empty: tc("searchEmpty", lang),
    allLines: tc("mapAllLines", lang),
    close: tc("mapClose", lang),
    expand: tc("mapExpand", lang),
    collapse: tc("mapCollapse", lang),
    zoomIn: tc("mapZoomIn", lang),
    zoomOut: tc("mapZoomOut", lang),
    reset: tc("mapReset", lang),
    exits: tc("mapFactExits", lang),
    restrooms: tc("mapFactRestrooms", lang),
    lockers: tc("mapFactLockers", lang),
    elevator: tc("mapFactElevator", lang),
    exitsCount: tc("mapExitsCount", lang),
    restroomCount: tc("utilRestroomCount", lang),
    lockersCount: tc("utilLockersCount", lang),
    desk: tc("utilLuggageDesk", lang),
    elevatorVia: tc("utilElevatorVia", lang),
    noData: tc("utilNoData", lang),
    guide: tc("mapGuide", lang),
    live: tc("mapLive", lang),
  };
}
