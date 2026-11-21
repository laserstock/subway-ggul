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
import { plannerImageSrc, type PlannerImage } from "./plannerImages";
import type { Localized } from "./stations";

const RADIUS_M = 800;
const PER_STEP = 6;

const ALL_IMAGES: PlannerImage[] = [
  "food-korean",
  "food-street",
  "kbbq",
  "market",
  "cafe",
  "bakery",
  "shopping-street",
  "mall",
  "popup",
  "variety",
  "beauty",
  "palace",
  "hanok",
  "park",
  "skyline",
  "photobooth",
  "exchange",
  "locker",
  "station",
];

const FOOD_POOLS: Record<FoodChip, PlannerImage[]> = {
  korean: ["food-korean", "kbbq", "market"],
  japanese: ["food-street", "market", "hanok"],
  chinese: ["food-street", "kbbq", "variety"],
  western: ["food-street", "mall", "skyline"],
  other: ["market", "variety", "station"],
};

const CAFE_POOLS: Record<CafeChip, PlannerImage[]> = {
  mood: ["cafe", "hanok", "park"],
  dessert: ["bakery", "cafe", "popup"],
  roastery: ["cafe", "market", "station"],
  rooftop: ["skyline", "park", "mall"],
};

const FUN_POOLS: Record<string, PlannerImage[]> = {
  walk: ["park", "shopping-street", "hanok"],
  gallery: ["popup", "palace", "skyline"],
  shop: ["mall", "shopping-street", "variety"],
  photo: ["photobooth", "popup", "beauty"],
  tourist: ["palace", "skyline", "hanok"],
  other: ["station", "locker", "exchange"],
};

function L(ko: string, en: string, zh = en, ja = en): Localized {
  return { ko, en, zh, ja };
}

function hashSeed(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** Pick from a category pool by index, skipping images already used on this screen. */
export function assignUniqueImage(pool: PlannerImage[], index: number, used: Set<string>): string {
  const ordered = [...pool, ...ALL_IMAGES.filter((key) => !pool.includes(key))];
  for (let offset = 0; offset < ordered.length; offset++) {
    const key = ordered[(index + offset) % ordered.length];
    const src = plannerImageSrc(key);
    if (!used.has(src)) {
      used.add(src);
      return src;
    }
  }
  const fallback = plannerImageSrc(ordered[index % ordered.length] ?? ALL_IMAGES[0]);
  used.add(fallback);
  return fallback;
}

export function poolForStep(stepId: CourseStepId, filter: PlaceChip, categoryKo: string): PlannerImage[] {
  if (stepId === "food") {
    if (filter === "korean" || filter === "japanese" || filter === "chinese" || filter === "western" || filter === "other") {
      return FOOD_POOLS[filter];
    }
    return FOOD_POOLS.other;
  }
  if (stepId === "cafe") {
    if (filter === "mood" || filter === "dessert" || filter === "roastery" || filter === "rooftop") {
      return CAFE_POOLS[filter];
    }
    return CAFE_POOLS.mood;
  }
  if (/산책|공원|하천|숲/.test(categoryKo)) return FUN_POOLS.walk;
  if (/전시|문화|갤러리|미술관|박물관|공연/.test(categoryKo)) return FUN_POOLS.gallery;
  if (/쇼핑|백화점|몰|시장|상점/.test(categoryKo)) return FUN_POOLS.shop;
  if (/포토|인생네컷|스튜디오/.test(categoryKo)) return FUN_POOLS.photo;
  if (/관광|명소|궁|타워|전망/.test(categoryKo)) return FUN_POOLS.tourist;
  return FUN_POOLS.other;
}

function foodFilter(category: string, name: string): FoodChip {
  const blob = `${category} ${name}`;
  if (/일식|일본|라멘|스시|우동|돈카츠|이자카야|사시미/.test(blob)) return "japanese";
  if (/중식|중국|짜장|짬뽕|마라|딤섬|양꼬치/.test(blob)) return "chinese";
  if (/양식|이탈|프렌|미식|파스타|피자|스테이크|버거|브런치|샐러드|멕시|타코/.test(blob)) return "western";
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

function categoryTrail(category: string) {
  return category
    .split(">")
    .map((level) => level.trim())
    .filter(Boolean)
    .slice(-2)
    .join(" · ");
}

function softRating(id: string) {
  return 4.4 + ((hashSeed(id) % 6) + 1) / 10;
}

function toCoursePlace(
  place: NearbyPlace,
  stepId: CourseStepId,
  meetExit: number,
  index: number,
  usedImages: Set<string>,
): CoursePlace {
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
  const trail = categoryTrail(place.category);
  const meters = Math.max(1, Math.round(place.distance || 0));
  return {
    id: `kakao-${place.id}`,
    category,
    name: L(place.name, place.name, place.name, place.name),
    feature: L(trail || place.address, trail || place.address),
    rating: softRating(place.id),
    exit: meetExit,
    walkMin: walkMinutes(meters),
    filter,
    image: assignUniqueImage(poolForStep(stepId, filter, category.ko), index, usedImages),
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
  return { food, cafe, culture, tourism };
}

function dedupeById(places: NearbyPlace[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

/** Replace step options with Kakao results; keep preset tips. Images stay unique across the course. */
export function applyLivePlaces(course: StationCourse, pack: MeetPlacePack): StationCourse {
  const used = new Set<string>();
  const food = dedupeById(pack.food)
    .slice(0, PER_STEP)
    .map((place, index) => toCoursePlace(place, "food", course.meetExit, index, used));
  const cafe = dedupeById(pack.cafe)
    .slice(0, PER_STEP)
    .map((place, index) => toCoursePlace(place, "cafe", course.meetExit, index, used));
  const fun = dedupeById([...pack.culture, ...pack.tourism])
    .slice(0, PER_STEP)
    .map((place, index) => toCoursePlace(place, "fun", course.meetExit, index, used));

  return {
    ...course,
    steps: course.steps.map((step) => {
      if (step.id === "food" && food.length) return { ...step, options: food };
      if (step.id === "cafe" && cafe.length) return { ...step, options: cafe };
      if (step.id === "fun" && fun.length) return { ...step, options: fun };
      return {
        ...step,
        options: step.options.map((option, index) => ({
          ...option,
          image: assignUniqueImage(poolForStep(step.id, option.filter, option.category.ko), index, used),
        })),
      };
    }),
  };
}

/** Fallback when Kakao is unavailable — still force unique thumbnails on screen. */
export function uniquifyCourseImages(course: StationCourse): StationCourse {
  const used = new Set<string>();
  return {
    ...course,
    steps: course.steps.map((step) => ({
      ...step,
      options: step.options.map((option, index) => ({
        ...option,
        image: assignUniqueImage(poolForStep(step.id, option.filter, option.category.ko), index, used),
      })),
    })),
  };
}

export function naverMapSearchUrl(placeName: string) {
  return `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(placeName)}`;
}
