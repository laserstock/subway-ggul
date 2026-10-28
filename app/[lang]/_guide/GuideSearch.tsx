"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { normalizeQuery } from "./searchKeys";

export type GuideSearchItem = {
  slug: string;
  label: string;
  sub: string;
  color: string;
  /** Every language's name, normalized and joined with "|", for matching. */
  keys: string;
};

export default function GuideSearch({
  locale,
  items,
  label,
  placeholder,
  empty,
}: {
  locale: string;
  items: GuideSearchItem[];
  label: string;
  placeholder: string;
  empty: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const q = normalizeQuery(query);
  const prefixMatch = (item: GuideSearchItem) => item.keys.split("|").some((key) => key.startsWith(q));
  const results = q
    ? items
        .filter((item) => item.keys.includes(q))
        .sort((a, b) => Number(prefixMatch(b)) - Number(prefixMatch(a)))
        .slice(0, 12)
    : [];

  return (
    <div role="search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)] focus-within:border-honey">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-muted">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2.2" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      {q ? (
        results.length ? (
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface">
            {results.map((item) => (
              <li key={item.slug} className="border-b border-line last:border-b-0">
                <Link
                  href={`/${locale}/stations/${item.slug}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-surface-muted"
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[15px] font-bold text-ink">{item.label}</span>
                    <span className="block break-words text-[12px] text-ink-muted">{item.sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-2xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">{empty}</p>
        )
      ) : null}
    </div>
  );
}
