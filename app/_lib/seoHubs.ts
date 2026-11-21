import { guideByKo, type GuideStation } from "./guide";

/**
 * Priority hubs for sitemap (0.9) and crawl depth — tourist / transfer / airport gateways.
 * Korean keys match GUIDE_STATIONS (`…역`).
 */
export const SEO_PRIORITY_HUB_KOS = [
  "강남역",
  "홍대입구역",
  "명동역",
  "서울역",
  "성수역",
  "잠실역",
  "신논현역",
  "압구정로데오역",
  "경복궁역",
  "을지로3가역",
  "여의도역",
  "이태원역",
  "안국역",
  "신촌역",
  "인천공항1터미널역",
  "인천공항2터미널역",
  "시청역",
  "광화문역",
  "동대문역사문화공원역",
  "동대문역",
  "김포공항역",
  "고속터미널역",
  "삼성역",
  "잠실새내역",
  "종합운동장역",
  "선릉역",
  "역삼역",
  "교대역",
  "사당역",
  "신도림역",
  "합정역",
  "공덕역",
  "왕십리역",
  "건대입구역",
  "성신여대입구역",
  "혜화역",
  "종로3가역",
  "종각역",
  "을지로입구역",
  "충무로역",
  "회현역",
  "남영역",
  "숙대입구역",
  "삼각지역",
  "녹사평역",
  "한강진역",
  "신사역",
  "압구정역",
  "논현역",
  "학동역",
  "강남구청역",
  "청담역",
  "뚝섬역",
  "서울숲역",
  "구의역",
  "강변역",
  "잠실나루역",
  "석촌역",
  "송파역",
  "문정역",
  "가락시장역",
  "수서역",
  "대치역",
  "도곡역",
  "매봉역",
  "양재역",
  "남부터미널역",
  "교대역",
  "서초역",
  "방배역",
  "낙성대역",
  "서울대입구역",
  "봉천역",
  "신림역",
  "신대방역",
  "구로디지털단지역",
  "대림역",
  "문래역",
  "영등포구청역",
  "당산역",
  "영등포역",
  "신길역",
  "여의나루역",
  "국회의사당역",
  "디지털미디어시티역",
  "가좌역",
  "홍제역",
  "불광역",
  "연신내역",
  "구파발역",
  "지축역",
  "노원역",
  "창동역",
  "수유역",
  "미아사거리역",
  "길음역",
  "한성대입구역",
  "동묘앞역",
  "신설동역",
  "제기동역",
  "청량리역",
  "왕십리역",
  "상왕십리역",
  "신당역",
  "동대문역사문화공원역",
  "을지로4가역",
  "약수역",
  "금호역",
  "옥수역",
  "이촌역",
  "동작역",
  "총신대입구역",
  "남태령역",
] as const;

/** Foreigner + local favorites shown as TOP 15 internal links on every station page. */
export const SEO_TOP15_KOS = [
  "강남역",
  "홍대입구역",
  "명동역",
  "서울역",
  "성수역",
  "잠실역",
  "신논현역",
  "경복궁역",
  "이태원역",
  "안국역",
  "여의도역",
  "을지로3가역",
  "인천공항1터미널역",
  "신촌역",
  "압구정로데오역",
] as const;

function resolveUnique(names: readonly string[]): GuideStation[] {
  const seen = new Set<string>();
  const out: GuideStation[] = [];
  for (const ko of names) {
    const station = guideByKo(ko);
    if (!station || seen.has(station.slug)) continue;
    seen.add(station.slug);
    out.push(station);
  }
  return out;
}

export const SEO_PRIORITY_HUBS: readonly GuideStation[] = resolveUnique(SEO_PRIORITY_HUB_KOS);
export const SEO_PRIORITY_SLUGS = new Set(SEO_PRIORITY_HUBS.map((station) => station.slug));

export function top15Stations(exclude?: GuideStation): GuideStation[] {
  return resolveUnique(SEO_TOP15_KOS).filter((station) => station.slug !== exclude?.slug).slice(0, 15);
}

export function stationSitemapPriority(slug: string) {
  return SEO_PRIORITY_SLUGS.has(slug) ? 0.9 : 0.6;
}
