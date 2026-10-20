"use client";

import { useMessages } from "../_lib/locale";

export type NavTab = "home" | "search" | "station" | "report";

const NAV_TABS: NavTab[] = ["home", "search", "station", "report"];

function NavIcon({ name, active }: { name: NavTab; active: boolean }) {
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
          <rect {...common} x="3.5" y="4.5" width="10.5" height="12" rx="2.5" />
          <path {...common} d="M3.5 10.5h10.5M6.5 20.5l1.3-4M11 20.5l-1.3-4" />
          <circle cx="6.6" cy="13.6" r="0.9" fill="currentColor" />
          <circle cx="10.9" cy="13.6" r="0.9" fill="currentColor" />
          <path
            d="M18.6 2.2l.88 2.19 2.35.16-1.8 1.51.57 2.29-2-1.25-2 1.25.57-2.29-1.8-1.51 2.35-.16z"
            fill={active ? "#f59e0b" : "currentColor"}
            stroke={active ? "#f59e0b" : "currentColor"}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
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
  const m = useMessages();
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-neutral-200 bg-white pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
      {NAV_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTab(tab)}
          aria-current={tab === active ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
            tab === active ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          <NavIcon name={tab} active={tab === active} />
          {m.nav[tab]}
        </button>
      ))}
    </nav>
  );
}
