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
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  target: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8h13l-1 12h-11z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  cup: (
    <>
      <path d="M4.5 9.5h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M15.5 11H17a2.5 2.5 0 0 1 0 5h-1.5M8 3.5V6M11.5 3.5V6M4 21h13" />
    </>
  ),
  food: (
    <>
      <path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3" />
      <path d="M17.5 21V3c-2.2 1.4-3.5 4-3.5 7.5V14h3.5" />
    </>
  ),
  landmark: (
    <>
      <path d="M2.5 9 12 3.5 21.5 9" />
      <path d="M5 11v7M9.5 11v7M14.5 11v7M19 11v7M3 20.5h18" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 4.5 12.7 10.3 18.5 12l-5.8 1.7L11 19.5l-1.7-5.8L3.5 12l5.8-1.7z" />
      <path d="M18.5 3v3.5M16.75 4.75h3.5" />
    </>
  ),
  bolt: <path d="M13.5 2.5 5 13.5h6.5l-1 8 8.5-11h-6.5z" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2.25" />
      <circle cx="18" cy="6" r="2.25" />
      <path d="M8.25 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.75" />
    </>
  ),
  swap: <path d="M7 20V4M3.5 7.5 7 4l3.5 3.5M17 4v16M13.5 16.5 17 20l3.5-3.5" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  collapse: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
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
