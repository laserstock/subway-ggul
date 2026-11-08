"use client";

import { ArrowRight, BookmarkCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { GUIDE_LANGUAGES, type GuideLocale } from "../../_lib/guideLocale";
import { fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";

type SavedTour = { href: string; title: string; savedAt: number };

const KEY = "ksub:planner-tours";
const CHANGE = "ksub:planner-tours-change";
const LIMIT = 12;
const EMPTY: SavedTour[] = [];

let cache: { raw: string | null; tours: SavedTour[] } = { raw: null, tours: EMPTY };

function parse(raw: string | null): SavedTour[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value)
      ? value.filter(
          (item): item is SavedTour =>
            typeof item?.href === "string" &&
            /^\/[a-z-]+\/planner\/route\?/.test(item.href) &&
            typeof item.title === "string" &&
            typeof item.savedAt === "number",
        )
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function snapshot() {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cache.raw) cache = { raw, tours: parse(raw) };
  return cache.tours;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function write(tours: SavedTour[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tours.slice(0, LIMIT)));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE));
}

function useSavedTours() {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** "Save Tour" (kept in this browser, with the share link copied) and "Share itinerary" (share sheet, else copy the link). */
export function useTourActions(href: string, title: string, copy: PlannerCopy) {
  const tours = useSavedTours();
  const saved = tours.some((tour) => tour.href === href);
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(message: string) {
    setStatus(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), 2400);
  }

  async function toggleSave() {
    if (saved) {
      write(tours.filter((tour) => tour.href !== href));
      flash(copy.removedSaved);
      return;
    }
    write([{ href, title, savedAt: Date.now() }, ...tours.filter((tour) => tour.href !== href)]);
    flash((await copyText(`${location.origin}${href}`)) ? copy.savedCopied : copy.savedLocal);
  }

  async function share() {
    const url = `${location.origin}${href}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    flash((await copyText(url)) ? copy.linkCopied : copy.copyFailed);
  }

  return { saved, status, toggleSave, share };
}

/** Tours saved in this browser, for the planner home. */
export function SavedTourList({ copy, lang }: { copy: PlannerCopy; lang: GuideLocale }) {
  const tours = useSavedTours();
  if (!tours.length) return null;
  const date = new Intl.DateTimeFormat(GUIDE_LANGUAGES[lang].htmlLang, { month: "short", day: "numeric" });
  return (
    <section aria-labelledby="planner-saved" className="mt-8">
      <h2 id="planner-saved" className="flex items-center gap-2 text-[18px] font-extrabold tracking-tight text-ink">
        <BookmarkCheck size={19} aria-hidden className="text-honey-strong" />
        {copy.savedTours}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {tours.map((tour) => (
          <li key={tour.href} className="flex items-center gap-2 rounded-2xl border border-line bg-surface py-1 pl-4 pr-1.5">
            <Link href={tour.href} transitionTypes={["planner-forward"]} className="group flex min-w-0 flex-1 items-center gap-2 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-extrabold text-ink">{tour.title}</span>
                <span className="block text-[12px] text-ink-muted">
                  {fillCopy(copy.savedOn, { date: date.format(tour.savedAt) })}
                </span>
              </span>
              <ArrowRight size={15} aria-hidden className="shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-honey-strong" />
            </Link>
            <button
              type="button"
              aria-label={fillCopy(copy.remove, { title: tour.title })}
              onClick={() => write(tours.filter((item) => item.href !== tour.href))}
              className="rounded-full p-2 text-ink-muted transition hover:bg-surface-muted hover:text-[#b42318]"
            >
              <Trash2 size={15} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
