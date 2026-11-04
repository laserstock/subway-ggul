import type { ReactNode } from "react";

const PATHS = {
  map: (
    <>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  book: (
    <>
      <path d="M12 7v14" />
      <path d="M3.5 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1H8a4 4 0 0 1 4 4 4 4 0 0 1 4-4h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H15a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </>
  ),
  exit: (
    <>
      <path d="M13 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H13" />
      <path d="M11 12h9M16.5 8.5 20 12l-3.5 3.5" />
    </>
  ),
  restroom: (
    <>
      <circle cx="7" cy="4.75" r="1.75" />
      <path d="M5 8.75h4l.5 6h-1V20h-3v-5.25h-1z" />
      <circle cx="17" cy="4.75" r="1.75" />
      <path d="M16 8.75h2l2.5 6.25h-2V20h-3v-5h-2z" />
      <path d="M12 3.5v17" opacity=".35" />
    </>
  ),
  luggage: (
    <>
      <rect x="6" y="7" width="12" height="12" rx="2.5" />
      <path d="M9.5 7V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M10 10.5v5M14 10.5v5M8.5 19v1.5M15.5 19v1.5" />
    </>
  ),
  transfer: (
    <>
      <path d="m17 3 3 3-3 3M4 11V9.5A3.5 3.5 0 0 1 7.5 6H20" />
      <path d="m7 21-3-3 3-3M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  plane: (
    <path d="M20.5 12c0-.9-.8-1.5-1.7-1.5h-4.3l-4-7h-2l2 7H6L4.5 8H3l1 4-1 4h1.5L6 13.5h4.5l-2 7h2l4-7h4.3c.9 0 1.7-.6 1.7-1.5z" />
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.5h3" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="3" width="14" height="14" rx="3.5" />
      <path d="M5 10.5h14M10 6h4M8.5 21l1.5-4M15.5 21 14 17" />
      <path d="M9 13.75h.01M15 13.75h.01" strokeWidth="2.5" />
    </>
  ),
  elevator: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="3" />
      <path d="M9 15.5v-7M7 10.5l2-2 2 2M15 8.5v7M13 13.5l2 2 2-2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  car: (
    <>
      <path d="M4.5 17v-4.5l1.9-4.6A1.5 1.5 0 0 1 7.8 7h8.4a1.5 1.5 0 0 1 1.4.9l1.9 4.6V17zM4.5 12.5h15M10 7V5h4v2" />
      <path d="M7.5 17v2M16.5 17v2" />
      <path d="M8 14.75h.01M16 14.75h.01" strokeWidth="2.5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

const TILE_SIZES = { sm: "h-9 w-9 rounded-[10px]", md: "h-10 w-10 rounded-xl", lg: "h-12 w-12 rounded-2xl" } as const;

/** An icon on a soft brand-tinted square, the guide pages' card marker. */
export function IconTile({
  name,
  size = "md",
  onSurface = false,
}: {
  name: IconName;
  size?: keyof typeof TILE_SIZES;
  /** White tile, for tinted backgrounds. */
  onSurface?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center text-honey-strong ring-1 ring-inset ring-honey/15 ${
        onSurface ? "bg-surface" : "bg-honey-soft"
      } ${TILE_SIZES[size]}`}
    >
      <Icon name={name} size={size === "lg" ? 24 : 20} />
    </span>
  );
}
