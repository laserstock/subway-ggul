/** Planner URL parameters and text helpers, shared by the server pages and the client components (no server-only imports). */

import type { GuideLocale } from "./guideLocale";
import type { PlannerCopy } from "./plannerText";
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

/** 660 → "11:00 AM" in English, "11:00" elsewhere; times past midnight wrap. */
export function clockLabel(minutes: number, locale: GuideLocale = "en") {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const mins = String(total % 60).padStart(2, "0");
  if (locale !== "en") return `${String(hours).padStart(2, "0")}:${mins}`;
  return `${hours % 12 || 12}:${mins} ${hours < 12 ? "AM" : "PM"}`;
}

export function fillCopy(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function durationText(copy: PlannerCopy, minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return fillCopy(copy.minutes, { n: rest });
  return rest ? fillCopy(copy.hoursMinutes, { h: hours, m: rest }) : fillCopy(copy.hours, { n: hours });
}

export function stopsText(copy: PlannerCopy, stops: number) {
  return fillCopy(stops === 1 ? copy.stopsOne : copy.stopsMany, { n: stops });
}

export function transfersText(copy: PlannerCopy, transfers: number) {
  return transfers === 0 ? copy.transfersNone : transfers === 1 ? copy.transfersOne : fillCopy(copy.transfersMany, { n: transfers });
}

export function exitWalkText(copy: PlannerCopy, exit: string | null, walk: number) {
  return exit ? fillCopy(copy.exitWalk, { exit, n: walk }) : fillCopy(copy.walk, { n: walk });
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

/** `/{locale}/planner/route?from=…&to=…&category=…`, with tags and times only when set. */
export function plannerHref(query: PlannerQuery, locale: GuideLocale) {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.categories.length) params.set("category", query.categories.join(","));
  if (query.tags.length) params.set("tags", query.tags.map(tagSlug).join(","));
  if (query.start !== DEFAULT_START) params.set("start", clockValue(query.start));
  if (query.end !== DEFAULT_END) params.set("end", clockValue(query.end));
  return `/${locale}/planner/route?${params.toString().replace(/%2C/g, ",")}`;
}
