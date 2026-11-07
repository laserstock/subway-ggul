/** Planner URL parameters, shared by the server pages and the client form (no server-only imports). */

import { PLANNER_CATEGORIES, QUICK_TAGS, tagFromSlug, tagSlug, type PlannerCategory, type QuickTag } from "./plannerTypes";

export const DEFAULT_CATEGORIES: PlannerCategory[] = ["food", "cafe", "shopping"];
/** Minutes after midnight. */
export const DEFAULT_START = 12 * 60;
export const DEFAULT_END = 18 * 60;
export const EARLIEST = 6 * 60;
export const LATEST = 23 * 60 + 30;
/** The shortest day the form accepts. */
export const MIN_WINDOW = 2 * 60;

export type PlannerQuery = {
  from: string;
  to: string;
  categories: PlannerCategory[];
  tags: QuickTag[];
  start: number;
  end: number;
};

/** Category values from the first version of the planner, still found in shared links. */
const LEGACY_CATEGORIES: Record<string, PlannerCategory> = { attraction: "culture", "k-beauty": "beauty" };

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

const parts = (value: string | undefined | null) =>
  (value ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

export function parseCategories(value: string | undefined | null): PlannerCategory[] {
  const picked = parts(value).map((part) => LEGACY_CATEGORIES[part] ?? part);
  return PLANNER_CATEGORIES.filter((category) => picked.includes(category));
}

export function parseTags(value: string | undefined | null): QuickTag[] {
  const picked = parts(value).map(tagFromSlug);
  return QUICK_TAGS.filter((tag) => picked.includes(tag));
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
    tags: parseTags(first(params.tags)),
    start,
    end: end - start >= MIN_WINDOW ? end : Math.min(LATEST, start + MIN_WINDOW),
  };
}

/** `/en/planner/route?from=…&to=…&category=…`, with tags and times only when set. */
export function plannerHref(query: PlannerQuery) {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.categories.length) params.set("category", query.categories.join(","));
  if (query.tags.length) params.set("tags", query.tags.map(tagSlug).join(","));
  if (query.start !== DEFAULT_START) params.set("start", clockValue(query.start));
  if (query.end !== DEFAULT_END) params.set("end", clockValue(query.end));
  return `/en/planner/route?${params.toString().replace(/%2C/g, ",")}`;
}
