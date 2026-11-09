"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string; depth?: 2 | 3 };

/** Table-of-contents links that highlight the section currently in view. */
export default function TocNav({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <ol className="flex flex-col gap-0.5 border-l border-line">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                onClick={() => setActive(item.id)}
                className={`-ml-px block border-l-2 py-1.5 pr-2 text-[14px] leading-snug transition-colors duration-200 ${
                  item.depth === 3 ? "pl-7" : "pl-4"
                } ${
                  current
                    ? "border-honey font-bold text-ink"
                    : "border-transparent font-medium text-ink-muted hover:border-line hover:text-ink"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
