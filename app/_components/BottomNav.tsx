"use client";

import Link from "next/link";
import { useMessages } from "../_lib/locale";

export type NavTab = "home" | "spot" | "station" | "me";

const NAV_TABS: { tab: NavTab; href: "/" | "/spot" | "/my" | "/me" }[] = [
  { tab: "home", href: "/" },
  { tab: "spot", href: "/spot" },
  { tab: "station", href: "/my" },
  { tab: "me", href: "/me" },
];

export function HoneyPotIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M7.2 3.5h9.6a1.2 1.2 0 0 1 0 2.4H7.2a1.2 1.2 0 0 1 0-2.4z" fill="#d18a00" />
      <path
        d="M7 6.6h10c2.6 1.5 4 4.1 4 7.1 0 4.2-3.6 6.8-9 6.8s-9-2.6-9-6.8c0-3 1.4-5.6 4-7.1z"
        fill="#f5b51f"
      />
      <path
        d="M4.2 11.4c1.4-.9 2.9.8 4.4.3 1.2-.4 1-1.9 2.4-2 1.3-.1 1.4 3.6 2.6 3.6s1-2.8 2.4-2.8c1.5 0 2.4 1.7 3.8 1"
        stroke="#fff6dc"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="8.6" cy="15.6" rx="1.6" ry="2.3" fill="#ffd66b" opacity="0.7" />
    </svg>
  );
}

function NavIcon({ name, active }: { name: NavTab; active: boolean }) {
  const common = {
    stroke: "currentColor",
    strokeWidth: active ? 2.2 : 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  if (name === "spot") return <HoneyPotIcon />;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      {name === "home" ? <path {...common} d="M4 10.8l8-6.8 8 6.8v8.7a1 1 0 0 1-1 1h-4.6v-5.8H9.6v5.8H5a1 1 0 0 1-1-1z" /> : null}
      {name === "station" ? (
        <path
          {...common}
          d="M12 3.2l2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9z"
          fill={active ? "currentColor" : "none"}
        />
      ) : null}
      {name === "me" ? (
        <>
          <circle {...common} cx="12" cy="8" r="4" />
          <path {...common} d="M4.5 20.5c.9-3.9 3.9-6 7.5-6s6.6 2.1 7.5 6" />
        </>
      ) : null}
    </svg>
  );
}

/** Each tab is a real link; `onReselect` lets the current screen react to a tap on its own tab (e.g. scroll to top). */
export default function BottomNav({ active, onReselect }: { active?: NavTab; onReselect?: () => void }) {
  const m = useMessages();
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-surface pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
      {NAV_TABS.map(({ tab, href }) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={href}
            onClick={(event) => {
              if (!isActive || !onReselect) return;
              event.preventDefault();
              onReselect();
            }}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] transition-colors ${
              isActive ? "font-extrabold text-ink" : "font-semibold text-neutral-400"
            }`}
          >
            <NavIcon name={tab} active={isActive} />
            <span className="max-w-full break-words px-1 text-center leading-tight">{m.nav[tab]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
