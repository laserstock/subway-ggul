import type { PlannerCategory, QuickTag } from "./plannerTypes";

/**
 * Representative example photos for planner cards (`public/planner/*.webp`, 800×600).
 * They illustrate the kind of place, not the exact spot, and are labelled as examples on screen.
 */
export type PlannerImage =
  | "food-korean"
  | "food-street"
  | "kbbq"
  | "market"
  | "cafe"
  | "bakery"
  | "shopping-street"
  | "mall"
  | "popup"
  | "variety"
  | "beauty"
  | "palace"
  | "hanok"
  | "park"
  | "skyline"
  | "photobooth"
  | "exchange"
  | "locker"
  | "station";

export const plannerImageSrc = (image: PlannerImage) => `/planner/${image}.webp`;

/** Checked in order against the English spot name; the first match wins. */
const BY_NAME: [RegExp, PlannerImage][] = [
  [/pop-up/i, "popup"],
  [/market(?! ?street)/i, "market"],
  [/money|exchange/i, "exchange"],
  [/hanok|bukchon|seochon|insadong/i, "hanok"],
  [/palace|gwanghwamun|temple/i, "palace"],
  [/tower|seoul sky|cable car|seoullo|cathedral|ddp|design plaza|adventure/i, "skyline"],
  [/park|forest|stream|lake/i, "park"],
  [/museum/i, "popup"],
  [/lotte mart|daiso/i, "variety"],
  [/department|mall|hyundai|galleria|shinsegae|bookstore/i, "mall"],
  [/caf[eé]/i, "cafe"],
  [/kyoja|restaurant/i, "food-korean"],
  [/street|-gil|rodeo|daero|itaewon/i, "shopping-street"],
];

const BY_TAG: Record<QuickTag, PlannerImage> = {
  "#OliveYoung": "beauty",
  "#Daiso": "variety",
  "#WOWPASS": "exchange",
  "#K-BBQ": "kbbq",
  "#Pop-up": "popup",
  "#Life4Cut": "photobooth",
  "#LuggageLocker": "locker",
  "#HanokVillage": "hanok",
};

const BY_CATEGORY: Record<PlannerCategory, PlannerImage[]> = {
  food: ["food-korean", "food-street", "market"],
  cafe: ["cafe", "bakery"],
  shopping: ["shopping-street", "mall"],
  beauty: ["beauty"],
  culture: ["palace", "park", "skyline"],
  essentials: ["exchange", "variety"],
};

function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** Photo for a hand-picked spot, from its English name, then its tags, then its main category. */
export function spotImage(spot: { name: { en: string }; categories: PlannerCategory[]; tags?: QuickTag[] }): PlannerImage {
  const named = BY_NAME.find(([pattern]) => pattern.test(spot.name.en));
  if (named) return named[1];
  if (spot.tags?.length) return BY_TAG[spot.tags[0]];
  const options = BY_CATEGORY[spot.categories[0] ?? "culture"];
  return options[hash(spot.name.en) % options.length];
}

/** Photo for a Google Maps search card; `seed` (the station) varies the pick between stations. */
export function searchImage(link: { category: PlannerCategory | null; tag: QuickTag | null }, seed: string): PlannerImage {
  if (link.tag) return BY_TAG[link.tag];
  const options = BY_CATEGORY[link.category ?? "culture"];
  return options[hash(seed) % options.length];
}
