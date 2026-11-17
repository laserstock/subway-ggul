import { distanceMeters, GUIDE_STATIONS, guideByKo, POPULAR_GUIDES, type GuideDetail, type GuideStation } from "./guide";
import { linesPhrase, stationTitle } from "./guideCopy";
import { contentLocale, type GuideLocale } from "./guideLocale";
import { t } from "./i18n";
import { STATION_LOCAL_GUIDES } from "./stationLocalGuides";

const MAX_RELATED = 4;

/**
 * Curated “visit next” hubs for the stations travelers search most. Korean keys match GUIDE_STATIONS.
 * Order is the display order on the station page.
 */
const RELATED_BY_KO: Record<string, string[]> = {
  경복궁역: ["안국역", "광화문역", "명동역", "시청역"],
  안국역: ["경복궁역", "광화문역", "혜화역", "종로3가역"],
  광화문역: ["경복궁역", "시청역", "종각역", "명동역"],
  명동역: ["서울역", "충무로역", "회현역", "을지로입구역"],
  서울역: ["명동역", "시청역", "회현역", "홍대입구역"],
  홍대입구역: ["합정역", "신촌역", "공덕역", "서울역"],
  강남역: ["신논현역", "역삼역", "선릉역", "압구정로데오역"],
  신논현역: ["강남역", "논현역", "신사역", "교대역"],
  압구정로데오역: ["성수역", "신논현역", "강남역", "압구정역"],
  성수역: ["서울숲역", "건대입구역", "왕십리역", "압구정로데오역"],
  잠실역: ["잠실나루역", "종합운동장역", "석촌역", "강남역"],
  이태원역: ["한강진역", "녹사평역", "남영역", "명동역"],
  동대문역: ["동대문역사문화공원역", "혜화역", "종로5가역", "을지로3가역"],
  동대문역사문화공원역: ["동대문역", "을지로3가역", "충무로역", "명동역"],
  을지로3가역: ["을지로입구역", "충무로역", "종로3가역", "동대문역사문화공원역"],
  을지로입구역: ["시청역", "명동역", "을지로3가역", "종각역"],
  시청역: ["광화문역", "을지로입구역", "서울역", "종각역"],
  종로3가역: ["종각역", "을지로3가역", "안국역", "종로5가역"],
  혜화역: ["안국역", "동대문역", "한성대입구역", "경복궁역"],
  신사역: ["압구정역", "논현역", "한강진역", "강남역"],
  여의도역: ["여의나루역", "국회의사당역", "당산역", "공덕역"],
  김포공항역: ["디지털미디어시티역", "홍대입구역", "서울역", "공덕역"],
  고속터미널역: ["교대역", "신사역", "사당역", "강남역"],
  삼성역: ["선릉역", "종합운동장역", "잠실역", "강남역"],
};

export type RelatedStation = {
  station: GuideStation;
  /** One-line reason to click through. */
  blurb: string;
};

function blurbFor(station: GuideStation, locale: GuideLocale): string {
  const base = contentLocale(locale);
  const guide = STATION_LOCAL_GUIDES[station.ko];
  if (guide?.intro) {
    const intro = t(guide.intro, base);
    const cut = intro.indexOf(locale === "en" ? ". " : locale === "zh" || locale === "ja" ? "。" : ". ");
    if (cut > 40 && cut < 140) return intro.slice(0, cut + (locale === "zh" || locale === "ja" ? 1 : 1));
    if (intro.length <= 120) return intro;
    return `${intro.slice(0, 110).trim()}…`;
  }
  const title = stationTitle(station, locale);
  const lines = linesPhrase(station.lines, base);
  if (base === "en") return `${title} on ${lines} — exits, lockers and traveler tips.`;
  if (base === "zh") return `${title}（${lines}）出口、储物柜与旅行提示。`;
  if (base === "ja") return `${title}（${lines}）の出口・ロッカー・旅行Tips。`;
  return `${title}(${lines}) 출구·보관함·여행 팁.`;
}

function fromKoList(names: string[]): GuideStation[] {
  return names.map((ko) => guideByKo(ko)).filter((station): station is GuideStation => station !== null);
}

/**
 * Three to four stations worth opening next: curated tourist hubs first, then line neighbours,
 * then nearby popular / local-guide stations by distance.
 */
export function relatedStations(station: GuideStation, detail: GuideDetail, locale: GuideLocale): RelatedStation[] {
  const seen = new Set<string>([station.slug]);
  const picked: GuideStation[] = [];

  const push = (next: GuideStation | null | undefined) => {
    if (!next || seen.has(next.slug) || picked.length >= MAX_RELATED) return;
    seen.add(next.slug);
    picked.push(next);
  };

  for (const next of fromKoList(RELATED_BY_KO[station.ko] ?? [])) push(next);

  for (const group of detail.neighbors) {
    for (const next of group.stations) push(next);
  }

  const popularNearby = [...POPULAR_GUIDES, ...GUIDE_STATIONS.filter((row) => STATION_LOCAL_GUIDES[row.ko])]
    .filter((row) => row.slug !== station.slug)
    .map((row) => ({ row, d: distanceMeters(station.lat, station.lng, row.lat, row.lng) }))
    .filter((row) => row.d > 0 && row.d < 6000)
    .sort((a, b) => a.d - b.d);

  for (const { row } of popularNearby) push(row);

  if (picked.length < 3) {
    for (const row of GUIDE_STATIONS) {
      if (picked.length >= MAX_RELATED) break;
      if (row.lines.some((line) => station.lines.includes(line))) push(row);
    }
  }

  return picked.slice(0, MAX_RELATED).map((next) => ({ station: next, blurb: blurbFor(next, locale) }));
}
