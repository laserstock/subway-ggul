import type { LatLng } from "../KakaoMap";
import { searchNearby, type NearbyPlace } from "../kakao-places";
import { loadKakaoMaps } from "../kakao-sdk";
import { walkMinutes } from "./exits";
import {
  type CafeChip,
  type CoursePlace,
  type CourseStepId,
  type FoodChip,
  type PlaceChip,
  type StationCourse,
} from "./meetCourses";
import type { Localized } from "./stations";

const RADIUS_M = 800;
const PER_STEP = 6;

function L(ko: string, en: string, zh = en, ja = en): Localized {
  return { ko, en, zh, ja };
}

function hashSeed(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function foodFilter(category: string, name: string): FoodChip {
  const blob = `${category} ${name}`;
  if (/일식|일본|라멘|스시|우동|돈카츠|이자카야|사시미/.test(blob)) return "japanese";
  if (/중식|중국|짜장|짬뽕|마라|딤섬|양꼬치/.test(blob)) return "chinese";
  if (/양식|이탈|프렌|미식|파스타|피자|스테이크|버거|브런치|샐러드|샐러디|멕시|타코/.test(blob)) return "western";
  if (/한식|한정식|국밥|고기|갈비|삼겹|곱창|분식|떡볶|닭|비빔|설렁|백반|육류/.test(blob)) return "korean";
  return "other";
}

function cafeFilter(category: string, name: string): CafeChip {
  const blob = `${category} ${name}`;
  if (/루프탑|전망|테라스|뷰|한강|창가/.test(blob)) return "rooftop";
  if (/로스터|스페셜티|핸드드립|브루잉|싱글오리진|커피전문/.test(blob)) return "roastery";
  if (/디저트|베이커|제과|빵|케이크|마카롱|크로아상|도넛|아이스크림|빙수|휘낭/.test(blob)) return "dessert";
  return "mood";
}

/** Kakao CE7 paths only — blocks pubs / restaurants leaking into the cafe step. */
export function isStrictCafePlace(place: NearbyPlace) {
  const blob = `${place.category} ${place.name}`;
  if (!/카페|커피|디저트|베이커|제과|도넛|아이스크림|빙수|찻집|다방|테라스카페|브런치카페/.test(blob)) {
    return false;
  }
  if (/주점|술집|호프|요리주점|맥주|와인바|이자카야|포차|횟집|고깃집|한식|중식|일식|분식|치킨|피자|패스트푸드|육류|해물|국밥/.test(blob)) {
    if (!/카페|커피|디저트|베이커|제과/.test(place.category)) return false;
  }
  return true;
}

function foodCategoryLabel(filter: FoodChip): Localized {
  if (filter === "korean") return L("한식", "Korean", "韩餐", "韓国料理");
  if (filter === "japanese") return L("일식", "Japanese", "日料", "和食");
  if (filter === "chinese") return L("중식", "Chinese", "中餐", "中華");
  if (filter === "western") return L("양식", "Western", "西餐", "洋食");
  return L("기타", "Other", "其他", "その他");
}

function cafeCategoryLabel(filter: CafeChip): Localized {
  if (filter === "dessert") return L("디저트", "Dessert", "甜品", "デザート");
  if (filter === "roastery") return L("로스터리", "Roastery", "烘焙咖啡", "ロースタリー");
  if (filter === "rooftop") return L("루프탑/뷰", "Rooftop", "屋顶/景观", "ルーフトップ");
  return L("카페", "Cafe", "咖啡", "カフェ");
}

function funCategoryLabel(category: string): Localized {
  if (/공원|산책|하천|숲/.test(category)) return L("산책", "Walk", "散步", "散歩");
  if (/갤러리|전시|미술관|박물관|공연|문화/.test(category)) return L("전시/문화", "Gallery", "展览/文化", "展示/文化");
  if (/쇼핑|백화점|몰|시장|상점/.test(category)) return L("쇼핑", "Shopping", "购物", "買い物");
  if (/관광|명소|궁|타워|전망/.test(category)) return L("관광명소", "Sight", "景点", "観光");
  return L("놀거리", "Fun", "玩乐", "遊び");
}

/** Kakao category path segments → localized labels (instant, no API). */
const CATEGORY_SEGMENT: Record<string, Localized> = {
  음식점: L("음식점", "Restaurant", "餐厅", "飲食店"),
  카페: L("카페", "Cafe", "咖啡", "カフェ"),
  커피전문점: L("커피전문점", "Coffee shop", "咖啡店", "コーヒー専門店"),
  테마카페: L("테마카페", "Theme cafe", "主题咖啡", "テーマカフェ"),
  베이커리: L("베이커리", "Bakery", "烘焙", "ベーカリー"),
  제과: L("제과", "Pastry", "糕点", "菓子"),
  디저트카페: L("디저트카페", "Dessert cafe", "甜品咖啡", "デザートカフェ"),
  한식: L("한식", "Korean", "韩餐", "韓国料理"),
  일식: L("일식", "Japanese", "日料", "和食"),
  중식: L("중식", "Chinese", "中餐", "中華"),
  양식: L("양식", "Western", "西餐", "洋食"),
  샐러드: L("샐러드", "Salad", "沙拉", "サラダ"),
  패스트푸드: L("패스트푸드", "Fast food", "快餐", "ファストフード"),
  분식: L("분식", "Snack bar", "小吃", "粉食"),
  육류: L("육류", "Meat", "肉类", "肉料理"),
  "육류,고기": L("고기", "Meat BBQ", "烤肉", "肉・焼肉"),
  술집: L("술집", "Pub", "酒吧", "居酒屋"),
  호프: L("호프", "Beer hall", "啤酒屋", "ビアホール"),
  요리주점: L("요리주점", "Gastropub", "餐酒吧", "料理居酒屋"),
  문화시설: L("문화시설", "Culture", "文化设施", "文化施設"),
  관광명소: L("관광명소", "Attraction", "景点", "観光名所"),
  미술관: L("미술관", "Art museum", "美术馆", "美術館"),
  박물관: L("박물관", "Museum", "博物馆", "博物館"),
  전시관: L("전시관", "Exhibition", "展览馆", "展示館"),
  공원: L("공원", "Park", "公园", "公園"),
  쇼핑: L("쇼핑", "Shopping", "购物", "ショッピング"),
  백화점: L("백화점", "Department store", "百货店", "デパート"),
};

function localizeCategoryPath(category: string): Localized {
  const parts = category
    .split(">")
    .map((level) => level.trim())
    .filter(Boolean)
    .slice(-2);
  if (!parts.length) return L(category, category);
  const ko = parts.join(" · ");
  const en = parts.map((part) => CATEGORY_SEGMENT[part]?.en ?? part).join(" · ");
  const zh = parts.map((part) => CATEGORY_SEGMENT[part]?.zh ?? CATEGORY_SEGMENT[part]?.en ?? part).join(" · ");
  const ja = parts.map((part) => CATEGORY_SEGMENT[part]?.ja ?? CATEGORY_SEGMENT[part]?.en ?? part).join(" · ");
  return L(ko, en, zh, ja);
}

function softRating(id: string) {
  return 4.4 + ((hashSeed(id) % 6) + 1) / 10;
}

function toCoursePlace(place: NearbyPlace, stepId: CourseStepId, meetExit: number): CoursePlace {
  const filter: PlaceChip =
    stepId === "food"
      ? foodFilter(place.category, place.name)
      : stepId === "cafe"
        ? cafeFilter(place.category, place.name)
        : "all";
  const category =
    stepId === "food"
      ? foodCategoryLabel(filter as FoodChip)
      : stepId === "cafe"
        ? cafeCategoryLabel(filter as CafeChip)
        : funCategoryLabel(place.category);
  const trail = localizeCategoryPath(place.category);
  const meters = Math.max(1, Math.round(place.distance || 0));
  return {
    id: `kakao-${place.id}`,
    category,
    // Official Kakao names are Korean; MeetScreen translates them for en/zh/ja via /api/translate.
    name: L(place.name, place.name, place.name, place.name),
    feature: trail,
    rating: softRating(place.id),
    exit: meetExit,
    walkMin: walkMinutes(meters),
    filter,
    image: null,
    distanceM: meters,
    address: place.roadAddress || place.address,
    phone: place.phone || undefined,
    placeUrl: place.url || undefined,
    kakaoCategory: place.category,
    position: place.position,
  };
}

export type MeetPlacePack = {
  food: NearbyPlace[];
  cafe: NearbyPlace[];
  culture: NearbyPlace[];
  tourism: NearbyPlace[];
};

/** Live Kakao Places within 800m of the hub station. */
export async function fetchMeetPlacePack(center: LatLng): Promise<MeetPlacePack> {
  await loadKakaoMaps();
  const [food, cafe, culture, tourism] = await Promise.all([
    searchNearby({ kind: "category", code: "FD6", radius: RADIUS_M }, center),
    searchNearby({ kind: "category", code: "CE7", radius: RADIUS_M }, center),
    searchNearby({ kind: "category", code: "CT1", radius: RADIUS_M }, center),
    searchNearby({ kind: "category", code: "AT4", radius: RADIUS_M }, center),
  ]);
  return {
    food,
    cafe: cafe.filter(isStrictCafePlace),
    culture,
    tourism,
  };
}

function dedupeById(places: NearbyPlace[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

/** Clear any leftover stock preview paths so cards never show unrelated food photos. */
export function clearStockImages(course: StationCourse): StationCourse {
  return {
    ...course,
    steps: course.steps.map((step) => ({
      ...step,
      options: step.options.map((option) => ({ ...option, image: null })),
    })),
  };
}

/** @deprecated use clearStockImages — kept as alias for MeetScreen imports. */
export const uniquifyCourseImages = clearStockImages;

/** Replace step options with Kakao results; keep preset tips. No stock thumbnails. */
export function applyLivePlaces(course: StationCourse, pack: MeetPlacePack): StationCourse {
  const food = dedupeById(pack.food)
    .slice(0, PER_STEP)
    .map((place) => toCoursePlace(place, "food", course.meetExit));
  const cafe = dedupeById(pack.cafe.filter(isStrictCafePlace))
    .slice(0, PER_STEP)
    .map((place) => toCoursePlace(place, "cafe", course.meetExit));
  const fun = dedupeById([...pack.culture, ...pack.tourism])
    .slice(0, PER_STEP)
    .map((place) => toCoursePlace(place, "fun", course.meetExit));

  return {
    ...course,
    steps: course.steps.map((step) => {
      if (step.id === "food" && food.length) return { ...step, options: food };
      if (step.id === "cafe" && cafe.length) return { ...step, options: cafe };
      if (step.id === "fun" && fun.length) return { ...step, options: fun };
      return {
        ...step,
        options: step.options.map((option) => ({ ...option, image: null })),
      };
    }),
  };
}

export function naverMapSearchUrl(placeName: string) {
  return `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(placeName)}`;
}

export function placeThumbnailQuery(place: CoursePlace) {
  const params = new URLSearchParams();
  if (place.placeUrl) params.set("place_url", place.placeUrl);
  params.set("place_name", place.name.ko);
  return `/api/place-thumbnail?${params.toString()}`;
}

/** Visual kind for refined category glyphs on typography cards. */
export type PlaceVisualKind =
  | "salad"
  | "korean"
  | "japanese"
  | "chinese"
  | "western"
  | "cafe"
  | "dessert"
  | "roastery"
  | "bar"
  | "walk"
  | "gallery"
  | "shop"
  | "fun";

export function placeVisualKind(place: CoursePlace): PlaceVisualKind {
  const blob = `${place.category.ko} ${place.name.ko} ${place.kakaoCategory ?? ""} ${place.filter}`;
  if (/샐러드|샐러디|salad/i.test(blob)) return "salad";
  if (/주점|술집|호프|바|맥주|draft|드래프트/i.test(blob)) return "bar";
  if (place.filter === "dessert" || /디저트|베이커|제과/.test(blob)) return "dessert";
  if (place.filter === "roastery" || /로스터|커피전문/.test(blob)) return "roastery";
  if (place.filter === "korean" || /한식/.test(blob)) return "korean";
  if (place.filter === "japanese" || /일식/.test(blob)) return "japanese";
  if (place.filter === "chinese" || /중식/.test(blob)) return "chinese";
  if (place.filter === "western" || /양식|파스타|브런치/.test(blob)) return "western";
  if (/카페|커피|루프탑|감성/.test(blob) || place.filter === "mood" || place.filter === "rooftop") return "cafe";
  if (/산책|공원/.test(blob)) return "walk";
  if (/전시|갤러리|문화|박물관/.test(blob)) return "gallery";
  if (/쇼핑|몰|시장/.test(blob)) return "shop";
  return "fun";
}
