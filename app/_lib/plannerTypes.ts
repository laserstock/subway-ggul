/** Planner categories and quick tags, shared by the server pages and the client components. */

export const PlannerCategory = {
  FOOD: "food",
  CAFE: "cafe",
  SHOPPING: "shopping",
  BEAUTY: "beauty",
  CULTURE: "culture",
  ESSENTIALS: "essentials",
} as const;
export type PlannerCategory = (typeof PlannerCategory)[keyof typeof PlannerCategory];

export const PLANNER_CATEGORIES: readonly PlannerCategory[] = Object.values(PlannerCategory);

export const CATEGORY_META: Record<PlannerCategory, { label: string; short: string }> = {
  food: { label: "Food & Eats", short: "Food" },
  cafe: { label: "Cafes & Bakery", short: "Cafe" },
  shopping: { label: "Shopping & Pop-ups", short: "Shopping" },
  beauty: { label: "K-Beauty & Clinics", short: "K-Beauty" },
  culture: { label: "Sights & Culture", short: "Culture" },
  essentials: { label: "Essentials & Services", short: "Essentials" },
};

export const QUICK_TAGS = ["#OliveYoung", "#Daiso", "#WOWPASS", "#K-BBQ", "#Pop-up", "#Life4Cut", "#LuggageLocker", "#HanokVillage"] as const;
export type QuickTag = (typeof QUICK_TAGS)[number];

/** "#K-BBQ" → "k-bbq", the form used in URLs. */
export function tagSlug(tag: QuickTag) {
  return tag.slice(1).toLowerCase();
}

export function tagFromSlug(slug: string): QuickTag | null {
  return QUICK_TAGS.find((tag) => tagSlug(tag) === slug.trim().toLowerCase()) ?? null;
}
