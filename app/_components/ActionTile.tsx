import Link from "next/link";
import type { ReactNode } from "react";

export type ActionKind = "urgent" | "shops" | "transfer" | "luggage";

type TileTheme = { accent: string; bg: string; emoji: string; badge: ReactNode; art: ReactNode };

const STROKE = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

function UrgentArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden>
      <rect x="4" y="12" width="20" height="7" rx="1.6" fill={color} />
      <rect x="10.5" y="5.5" width="7" height="20" rx="1.6" fill={color} />
      <path d="M33 4v36" stroke={color} strokeWidth="2.4" {...STROKE} />
      <circle cx="48" cy="7.5" r="3.8" fill={color} />
      <path d="M44.3 13.5h7.4l4.3 15.5H40z" fill={color} />
      <rect x="44.2" y="28" width="2.8" height="12" rx="1.4" fill={color} />
      <rect x="49" y="28" width="2.8" height="12" rx="1.4" fill={color} />
    </svg>
  );
}

function ShopsArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden>
      <path d="M5 16h26l-2.5 25h-21z" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.2" {...STROKE} />
      <path d="M12 16v-4a6 6 0 0 1 12 0v4" fill="none" stroke={color} strokeWidth="2.2" {...STROKE} />
      <rect x="39" y="11" width="20" height="4.5" rx="1.6" fill={color} />
      <path d="M40.5 15.5h17l-2.2 25.5H42.7z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2.2" {...STROKE} />
      <path d="M41.8 24.5h14.4" stroke={color} strokeWidth="2.2" {...STROKE} />
    </svg>
  );
}

function TransferArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden>
      <path d="M3 40h9l20-22h8" fill="none" stroke={color} strokeWidth="3" {...STROKE} />
      <path d="M3 33h7l20-22h8" fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="2" {...STROKE} />
      <circle cx="23" cy="8" r="3.2" fill={color} />
      <path d="M23 12.5v9M23 15.5l-4 3.5M23 21.5l-3 5" fill="none" stroke={color} strokeWidth="2.6" {...STROKE} />
      <circle cx="51" cy="13" r="2.6" fill={color} />
      <path d="M50 17v9h8l2.5 6.5" fill="none" stroke={color} strokeWidth="2.4" {...STROKE} />
      <path d="M45.5 26.5a7 7 0 1 0 11 6.5" fill="none" stroke={color} strokeWidth="2.4" {...STROKE} />
    </svg>
  );
}

function LuggageArt({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden>
      <rect x="4" y="12" width="22" height="27" rx="4" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2.2" />
      <path d="M10.5 12V7.5h9V12M11 18v15M19 18v15" fill="none" stroke={color} strokeWidth="2.2" {...STROKE} />
      <circle cx="9.5" cy="41.5" r="1.7" fill={color} />
      <circle cx="20.5" cy="41.5" r="1.7" fill={color} />
      <circle cx="47" cy="23" r="14" fill="none" stroke={color} strokeWidth="2.2" />
      <path
        d="M47 9c-4.6 4-6.8 8.7-6.8 14s2.2 10 6.8 14c4.6-4 6.8-8.7 6.8-14S51.6 13 47 9zM33 23h28M35 16h24M35 30h24"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        {...STROKE}
      />
    </svg>
  );
}

function Badge({ color, small = false, children }: { color: string; small?: boolean; children: ReactNode }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-white ${
        small ? "h-6 w-6 shadow-[0_2px_5px_rgba(15,23,42,0.15)]" : "h-9 w-9 shadow-[0_3px_8px_rgba(15,23,42,0.15)]"
      }`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <svg width={small ? 14 : 20} height={small ? 14 : 20} viewBox="0 0 24 24" fill="none">
        {children}
      </svg>
    </span>
  );
}

const TILE_THEMES: Record<ActionKind, TileTheme> = {
  urgent: {
    accent: "#e5484d",
    bg: "#fff3f3",
    emoji: "🚨",
    badge: (
      <>
        <path d="M12 6.5v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="17.6" r="1.7" fill="currentColor" />
      </>
    ),
    art: <UrgentArt color="#e5484d" />,
  },
  shops: {
    accent: "#f08c00",
    bg: "#fff7e8",
    emoji: "🛍️",
    badge: (
      <path d="M8 18v-5.5a3 3 0 0 1 3-3h6.5M14.5 6.5l3 3-3 3" stroke="currentColor" strokeWidth="2.4" {...STROKE} />
    ),
    art: <ShopsArt color="#f08c00" />,
  },
  transfer: {
    accent: "#3b7cf6",
    bg: "#f0f5ff",
    emoji: "⚡",
    badge: <path d="M16.5 7.5l-9 9M7.5 10v6.5H14" stroke="currentColor" strokeWidth="2.4" {...STROKE} />,
    art: <TransferArt color="#3b7cf6" />,
  },
  luggage: {
    accent: "#22a559",
    bg: "#eefaf2",
    emoji: "🧳",
    badge: (
      <>
        <rect x="5.5" y="8.5" width="13" height="10.5" rx="2.2" stroke="currentColor" strokeWidth="2.2" />
        <path d="M9.5 8.5V6.5h5v2M12 11.5v4.5M9.8 13.75h4.4" stroke="currentColor" strokeWidth="2" {...STROKE} />
      </>
    ),
    art: <LuggageArt color="#22a559" />,
  },
};

/** Slim pill version of the tile for the home utility row: same badge, emoji, colors and link. */
export function ActionChip({
  kind,
  title,
  detail,
  href,
}: {
  kind: ActionKind;
  title: string;
  detail?: string;
  href: string;
}) {
  const theme = TILE_THEMES[kind];
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-left shadow-[0_1px_4px_rgba(15,23,42,0.05)] transition active:scale-95"
      style={{ backgroundColor: theme.bg, borderColor: `${theme.accent}40` }}
    >
      <Badge color={theme.accent} small>
        {theme.badge}
      </Badge>
      <span className="whitespace-nowrap text-[13px] font-extrabold tracking-tight text-ink">
        <span className="mr-0.5 text-[12px]" aria-hidden>
          {theme.emoji}
        </span>
        {title}
        {detail ? <span className="ml-0.5 text-[10.5px] font-bold text-ink-muted">{detail}</span> : null}
      </span>
    </Link>
  );
}

/** Big 2x2 home/dashboard tile: colored badge + line illustration on top, title and accent subtitle below. */
export default function ActionTile({
  kind,
  title,
  detail,
  sub,
  href,
  onClick,
  children,
}: {
  kind: ActionKind;
  title: string;
  detail?: string;
  sub: string;
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const theme = TILE_THEMES[kind];
  const body = (
    <>
      <span className="flex items-start justify-between">
        <Badge color={theme.accent}>{theme.badge}</Badge>
        {theme.art}
      </span>
      <span className="mt-3 block">
        <span className="block text-[15px] font-extrabold leading-tight tracking-tight text-ink">
          <span className="mr-1 text-[14px]" aria-hidden>
            {theme.emoji}
          </span>
          {title}
          {detail ? <span className="ml-0.5 text-[11px] font-bold text-ink-muted">{detail}</span> : null}
        </span>
        <span className="mt-1 block text-[11.5px] font-bold" style={{ color: theme.accent }}>
          {sub}
        </span>
        {children}
      </span>
    </>
  );
  const className =
    "flex min-h-[140px] flex-col justify-between rounded-[22px] border p-3.5 text-left shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition active:scale-[0.98]";
  const style = { backgroundColor: theme.bg, borderColor: `${theme.accent}40` };
  return href ? (
    <Link href={href} className={className} style={style}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} style={style}>
      {body}
    </button>
  );
}
