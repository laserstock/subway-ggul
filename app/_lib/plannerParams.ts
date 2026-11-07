/** Planner URL parameters, shared by the server pages and the client form (no server-only imports). */

export const PLANNER_CATEGORIES = ["shopping", "cafe", "food", "attraction", "k-beauty"] as const;
export type PlannerCategory = (typeof PLANNER_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PlannerCategory, string> = {
  shopping: "Shopping",
  cafe: "Cafe",
  food: "Food",
  attraction: "Attraction",
  "k-beauty": "K-Beauty",
};

export const DEFAULT_CATEGORIES: PlannerCategory[] = ["shopping", "cafe"];
/** Minutes after midnight. */
export const DEFAULT_START = 11 * 60;
export const DEFAULT_END = 19 * 60;
export const EARLIEST = 6 * 60;
export const LATEST = 23 * 60 + 30;
/** The shortest day the form accepts. */
export const MIN_WINDOW = 2 * 60;

export type PlannerQuery = {
  from: string;
  to: string;
  categories: PlannerCategory[];
  start: number;
  end: number;
};

export function isCategory(value: string): value is PlannerCategory {
  return (PLANNER_CATEGORIES as readonly string[]).includes(value);
}

/** "11:00" → 660; anything malformed or outside the planner's day gives null. */
export function parseClock(value: string | undefined | null): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return Number(match[2]) < 60 && minutes >= EARLIEST && minutes <= LATEST ? minutes : null;
}

export function clockValue(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** 660 → "11:00 AM"; times past midnight wrap. */
export function clockLabel(minutes: number) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${String(total % 60).padStart(2, "0")} ${suffix}`;
}

export function parseCategories(value: string | undefined | null): PlannerCategory[] {
  const picked = (value ?? "").split(",").map((part) => part.trim().toLowerCase()).filter(isCategory);
  return PLANNER_CATEGORIES.filter((category) => picked.includes(category));
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export function parsePlannerQuery(params: RawParams): PlannerQuery {
  const start = parseClock(first(params.start)) ?? DEFAULT_START;
  const end = parseClock(first(params.end)) ?? DEFAULT_END;
  const categories = parseCategories(first(params.category));
  return {
    from: first(params.from).toLowerCase(),
    to: first(params.to).toLowerCase(),
    categories: categories.length ? categories : DEFAULT_CATEGORIES,
    start,
    end: end - start >= MIN_WINDOW ? end : Math.min(LATEST, start + MIN_WINDOW),
  };
}

/** `/en/planner/route?from=…&to=…&category=…`, with times only when they differ from the defaults. */
export function plannerHref(query: PlannerQuery) {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.categories.length) params.set("category", query.categories.join(","));
  if (query.start !== DEFAULT_START) params.set("start", clockValue(query.start));
  if (query.end !== DEFAULT_END) params.set("end", clockValue(query.end));
  return `/en/planner/route?${params.toString().replace(/%2C/g, ",")}`;
}
