"use client";

import { useLocale } from "../_lib/locale";
import { t, type Localized } from "../_lib/stations";

export type NavTab = "home" | "search" | "station" | "report";

const NAV_TABS: { id: NavTab; label: Localized }[] = [
  { id: "home", label: { ko: "홈", en: "Home" } },
  { id: "search", label: { ko: "검색", en: "Search" } },
  { id: "station", label: { ko: "내 역", en: "My Stn" } },
  { id: "report", label: { ko: "제보", en: "Report" } },
];

function NavIcon({ name }: { name: NavTab }) {
  const common = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      {name === "home" ? <path {...common} d="M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /> : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="11" cy="11" r="6.5" />
          <path {...common} d="M20 20l-4-4" />
        </>
      ) : null}
      {name === "station" ? (
        <>
          <rect {...common} x="6" y="3.5" width="12" height="13" rx="3" />
          <path {...common} d="M6 11h12M9.5 20.5l1.5-4M14.5 20.5l-1.5-4" />
          <circle cx="9.5" cy="13.8" r="1" fill="currentColor" />
          <circle cx="14.5" cy="13.8" r="1" fill="currentColor" />
        </>
      ) : null}
      {name === "report" ? (
        <>
          <path {...common} d="M4 10.5v3a1 1 0 0 0 1 1h2l6 4V5.5l-6 4H5a1 1 0 0 0-1 1z" />
          <path {...common} d="M17 9a4 4 0 0 1 0 6" />
        </>
      ) : null}
    </svg>
  );
}

export default function BottomNav({
  active,
  onTab,
}: {
  active?: NavTab;
  onTab: (tab: NavTab) => void;
}) {
  const locale = useLocale();
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
      {NAV_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTab(tab.id)}
          aria-current={tab.id === active ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
            tab.id === active ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          <NavIcon name={tab.id} />
          {t(tab.label, locale)}
        </button>
      ))}
    </nav>
  );
}
