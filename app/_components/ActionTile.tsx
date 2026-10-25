import Link from "next/link";
import type { ReactNode } from "react";

export type ActionKind = "urgent" | "shops" | "transfer" | "luggage";

type TileTheme = { accent: string; bg: string; art: ReactNode };

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

const TILE_THEMES: Record<ActionKind, TileTheme> = {
  urgent: { accent: "#e5484d", bg: "#fff3f3", art: <UrgentArt color="#e5484d" /> },
  shops: { accent: "#f08c00", bg: "#fff7e8", art: <ShopsArt color="#f08c00" /> },
  transfer: { accent: "#3b7cf6", bg: "#f0f5ff", art: <TransferArt color="#3b7cf6" /> },
  luggage: { accent: "#22a559", bg: "#eefaf2", art: <LuggageArt color="#22a559" /> },
};

/** "올영 · 카페 · 편의점" wraps only between items, never inside one. */
function SubParts({ text }: { text: string }) {
  return text.split(" · ").map((part, index) => (
    <span key={part}>
      {index > 0 ? " · " : null}
      <span className="whitespace-nowrap">{part}</span>
    </span>
  ));
}

/** One-row utility tile: the line illustration leads, then title and accent subtitle. */
export default function ActionTile({
  kind,
  title,
  sub,
  href,
}: {
  kind: ActionKind;
  title: string;
  sub: string;
  href: string;
}) {
  const theme = TILE_THEMES[kind];
  return (
    <Link
      href={href}
      className="flex min-h-[54px] items-center gap-2 rounded-[22px] border py-2 pl-3 pr-1.5 text-left shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition active:scale-[0.98]"
      style={{ backgroundColor: theme.bg, borderColor: `${theme.accent}40` }}
    >
      <span className="h-[28px] w-[41px] shrink-0 [&_svg]:h-full [&_svg]:w-full">{theme.art}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-extrabold leading-tight tracking-tight text-ink">{title}</span>
        <span
          className="mt-0.5 line-clamp-2 text-[11.5px] font-bold leading-snug tracking-tight"
          style={{ color: theme.accent }}
        >
          <SubParts text={sub} />
        </span>
      </span>
    </Link>
  );
}
