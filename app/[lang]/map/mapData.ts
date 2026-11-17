import { guideDetail } from "../../_lib/guide";
import { gt, lineLabel, tc } from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import { MAP_LEVELS, MAP_MAX_ZOOM, placeLabels, SUBWAY_MAP } from "../../_lib/subwayMap";
import type { MapCopy, MapLineData, MapStationData } from "./SubwayMap";

export { MAP_LEVELS, MAP_MAX_ZOOM };

/** Lines and stations for `SubwayMap`, with locale-only names and collision-aware label levels. */
export function mapData(lang: GuideLocale) {
  const { width, height, focus, nodes, lines, terrain } = SUBWAY_MAP;
  const names = nodes.map((node) => gt(node.station.name, lang));
  const labels = placeLabels(names);
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
    return {
      slug: node.station.slug,
      name: names[index],
      ko: node.station.ko,
      // SVG labels use `name` only (locale). `alt` is English for the panel/search, not drawn on the map.
      alt: lang === "en" ? null : gt(node.station.name, "en"),
      x: node.x,
      y: node.y,
      lines: node.lines.map((line) => lineIndex.get(line)).filter((line): line is number => line !== undefined),
      hub: node.hub,
      level: Math.min(labels[index].level, MAP_LEVELS.length - 1),
      position: labels[index].position,
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
    width,
    height,
    focus,
    levels: MAP_LEVELS,
    maxZoom: MAP_MAX_ZOOM,
    terrain,
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
