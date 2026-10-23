import { useId, type ReactNode } from "react";
import type { AvatarId } from "../_lib/profile";

const INK = "#2b2418";

type Look = {
  body: string;
  stripe: string;
  /** Replaces the default dot eyes. */
  eyes?: ReactNode;
  mouth?: ReactNode;
  /** Drawn behind the body (backpacks, speed lines). */
  back?: ReactNode;
  /** Drawn over the face (hats, glasses, props). */
  front?: ReactNode;
};

const smile = <path d="M29.5 40.5q2.5 2.6 5 0" stroke={INK} strokeWidth="1.7" fill="none" strokeLinecap="round" />;
const grin = <path d="M28.6 40q3.4 4.4 6.8 0z" fill={INK} />;

function sparkle(x: number, y: number, r: number, fill: string) {
  return (
    <path
      d={`M${x} ${y - r}q${r * 0.25} ${r * 0.75} ${r} ${r}q-${r * 0.75} ${r * 0.25}-${r} ${r}q-${r * 0.25}-${r * 0.75}-${r}-${r}q${r * 0.75}-${r * 0.25} ${r}-${r}z`}
      fill={fill}
    />
  );
}

function looks(gradientId: string): Record<AvatarId, Look> {
  return {
    bee: { body: "#ffc93c", stripe: INK },
    queen: {
      body: "#ffbf1f",
      stripe: "#4a2c12",
      front: (
        <>
          <path d="M21.5 22.5 23.5 10l6 6.5L32 7l2.5 9.5 6-6.5 2 12.5z" fill="#ffd84d" stroke="#e09b00" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="32" cy="17.5" r="1.9" fill="#ef4444" />
          <circle cx="26" cy="19" r="1.3" fill="#3b82f6" />
          <circle cx="38" cy="19" r="1.3" fill="#22c55e" />
        </>
      ),
    },
    worker: {
      body: "#ffc93c",
      stripe: INK,
      front: (
        <>
          <path d="M17 27.5a15 13.5 0 0 1 30 0z" fill="#ffa31a" />
          <rect x="30" y="14" width="4" height="13" rx="2" fill="#ffc266" />
          <rect x="13" y="25.8" width="38" height="4.2" rx="2.1" fill="#f08c00" />
        </>
      ),
    },
    detective: {
      body: "#ffc93c",
      stripe: INK,
      front: (
        <>
          <path d="M16.5 27q1-14 15.5-14.5Q46.5 13 47.5 27z" fill="#8b5e3c" />
          <path d="M20 21h24" stroke="#6f4a2e" strokeWidth="2.4" />
          <path d="M12 27q20 5 40 0q-20-4-40 0z" fill="#6f4a2e" />
          <path d="M53 51.5l5.5 6" stroke="#5b4636" strokeWidth="3.6" strokeLinecap="round" />
          <circle cx="49.5" cy="47.5" r="6" fill="#dff3ff" fillOpacity="0.8" stroke="#5b4636" strokeWidth="2.6" />
          <path d="M46.8 45.5a3.4 3.4 0 0 1 2.6-1.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </>
      ),
    },
    scholar: {
      body: "#ffc93c",
      stripe: INK,
      front: (
        <>
          <path d="M22.5 22.5v5.5q9.5 4.2 19 0v-5.5" fill="#3d3326" />
          <path d="M13 20.5 32 12.5l19 8-19 8z" fill={INK} />
          <path d="M32 20.5l14.5 2v8" stroke="#ffc93c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="46.5" cy="31.5" r="1.8" fill="#ffc93c" />
          <circle cx="25.5" cy="35" r="5.2" fill="#fff" fillOpacity="0.3" stroke={INK} strokeWidth="1.8" />
          <circle cx="38.5" cy="35" r="5.2" fill="#fff" fillOpacity="0.3" stroke={INK} strokeWidth="1.8" />
          <path d="M30.7 35h2.6" stroke={INK} strokeWidth="1.8" />
        </>
      ),
    },
    hipster: {
      body: "#ffc93c",
      stripe: INK,
      mouth: <path d="M29 40.8q3 1.8 6-.6" stroke={INK} strokeWidth="1.7" fill="none" strokeLinecap="round" />,
      front: (
        <>
          <path d="M14.5 36Q13.5 13.5 32 13.5T49.5 36" stroke={INK} strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <rect x="9" y="30.5" width="9.5" height="13.5" rx="4.5" fill="#ff5d8f" />
          <rect x="45.5" y="30.5" width="9.5" height="13.5" rx="4.5" fill="#ff5d8f" />
          <rect x="11" y="33" width="3" height="8.5" rx="1.5" fill="#fff" fillOpacity="0.45" />
        </>
      ),
    },
    racer: {
      body: "#ffb21f",
      stripe: INK,
      mouth: grin,
      eyes: <></>,
      back: (
        <g stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round">
          <path d="M2 33h8" />
          <path d="M1 40h9" />
          <path d="M3 47h7" />
        </g>
      ),
      front: (
        <>
          <rect x="12.5" y="30.5" width="39" height="4" rx="2" fill="#334155" />
          <rect x="18.5" y="28" width="12.5" height="10.5" rx="5.2" fill="#67e8f9" stroke="#334155" strokeWidth="2.2" />
          <rect x="33" y="28" width="12.5" height="10.5" rx="5.2" fill="#67e8f9" stroke="#334155" strokeWidth="2.2" />
          <path d="M21.5 31.5l3-2M36 31.5l3-2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ),
    },
    sleepy: {
      body: "#ffd45c",
      stripe: INK,
      eyes: (
        <g stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M22.8 35.5q2.7 2.4 5.4 0" />
          <path d="M35.8 35.5q2.7 2.4 5.4 0" />
        </g>
      ),
      mouth: <ellipse cx="32" cy="41.5" rx="1.6" ry="1.9" fill={INK} />,
      front: (
        <>
          <path d="M17 26Q27 5 46 13.5q-4.5 4-1 11.5Q31 20.5 17 26z" fill="#7c9cff" />
          <circle cx="47" cy="13.5" r="3.6" fill="#fff" />
          <path d="M16.5 26Q31 20.5 46 25" stroke="#fff" strokeWidth="3.8" fill="none" strokeLinecap="round" />
          <text x="50" y="35" fontSize="9" fontWeight="800" fill="#7c9cff" fontFamily="sans-serif">
            z
          </text>
          <text x="55" y="28" fontSize="6.5" fontWeight="800" fill="#a5b8ff" fontFamily="sans-serif">
            z
          </text>
        </>
      ),
    },
    barista: {
      body: "#ffc93c",
      stripe: "#5b3a1e",
      mouth: grin,
      front: (
        <>
          <path d="M44.5 45h11.5l-1.6 10.6a2 2 0 0 1-2 1.7h-4.3a2 2 0 0 1-2-1.7z" fill="#fff" stroke="#8b5e3c" strokeWidth="1.4" />
          <rect x="45.4" y="48.3" width="9.7" height="3.6" fill="#8b5e3c" />
          <rect x="43.3" y="42.5" width="14" height="3.2" rx="1.6" fill="#5b3a1e" />
          <path d="M48 40q-1.6-2 0-4t0-4M53 40q-1.6-2 0-4" stroke="#c9b8a6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      ),
    },
    traveler: {
      body: "#ffc93c",
      stripe: INK,
      back: <rect x="40" y="31" width="17" height="20" rx="5" fill="#2f9e6e" />,
      front: (
        <>
          <path d="M22.5 26q-2.5 14 2 28M41.5 26q2.5 14-2 28" stroke="#a0522d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M18.5 24q1-12 13.5-12t13.5 12z" fill="#d6b77a" />
          <rect x="18.8" y="20" width="26.4" height="3.2" fill="#6f4a2e" />
          <ellipse cx="32" cy="24.2" rx="19" ry="3.4" fill="#c09a5b" />
        </>
      ),
    },
    boxer: {
      body: "#ffad1f",
      stripe: INK,
      mouth: grin,
      front: (
        <>
          <path d="M21.5 30.2l5.6 1.8M42.5 30.2l-5.6 1.8" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <rect x="13" y="23.5" width="38" height="5" rx="2.5" fill="#ef4444" />
          <path d="M49.5 25l8-3.5-1.8 6.5zM49.5 26.5l7 3.5-5.6 2.5z" fill="#ef4444" />
          <circle cx="50.5" cy="47" r="7" fill="#ef4444" />
          <path d="M46.5 44.5a4.5 4.5 0 0 1 4-2.6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity="0.7" />
          <rect x="45" y="52" width="9" height="5" rx="1.6" fill="#fff" />
        </>
      ),
    },
    diamond: {
      body: `url(#${gradientId})`,
      stripe: "#4338ca",
      back: (
        <>
          {sparkle(9, 44, 4, "#a78bfa")}
          {sparkle(55, 46, 3, "#67e8f9")}
        </>
      ),
      front: (
        <>
          <path d="M22.5 15.5 26 9.5h12l3.5 6-9.5 10z" fill="#cffafe" stroke="#6366f1" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M22.5 15.5h19M29 9.5l-1.5 6 4.5 10M35 9.5l1.5 6-4.5 10" stroke="#818cf8" strokeWidth="0.9" fill="none" />
          {sparkle(48, 25, 2.6, "#fff")}
        </>
      ),
    },
  };
}

/** One of the twelve bee-family characters. Unknown ids (old posts) fall back to the baby bee. */
export default function BeeAvatar({
  id,
  size = 40,
  className = "",
}: {
  id: AvatarId | null | undefined;
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `bee-clip-${uid}`;
  const gradientId = `bee-gem-${uid}`;
  const all = looks(gradientId);
  const look = all[id ?? "bee"] ?? all.bee;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="38" r="19" />
        </clipPath>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c7f9ff" />
          <stop offset="0.55" stopColor="#93a8ff" />
          <stop offset="1" stopColor="#d8b4fe" />
        </linearGradient>
      </defs>

      {look.back}
      <ellipse cx="16.5" cy="25" rx="11" ry="7.5" transform="rotate(-32 16.5 25)" fill="#fff" fillOpacity="0.9" stroke="#bfd9f2" strokeWidth="1.5" />
      <ellipse cx="47.5" cy="25" rx="11" ry="7.5" transform="rotate(32 47.5 25)" fill="#fff" fillOpacity="0.9" stroke="#bfd9f2" strokeWidth="1.5" />
      <path d="M26.5 21Q24 13 19.5 10.5M37.5 21Q40 13 44.5 10.5" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="19.5" cy="10.5" r="2.6" fill={INK} />
      <circle cx="44.5" cy="10.5" r="2.6" fill={INK} />

      <circle cx="32" cy="38" r="19" fill={look.body} />
      <g clipPath={`url(#${clipId})`}>
        <rect x="10" y="46" width="44" height="4.4" fill={look.stripe} />
        <rect x="10" y="53.2" width="44" height="4.4" fill={look.stripe} />
      </g>
      <ellipse cx="25" cy="26.5" rx="6" ry="3.4" fill="#fff" fillOpacity="0.38" transform="rotate(-20 25 26.5)" />

      {look.eyes ?? (
        <>
          <circle cx="25.5" cy="35" r="2.8" fill={INK} />
          <circle cx="38.5" cy="35" r="2.8" fill={INK} />
          <circle cx="26.5" cy="34" r="0.95" fill="#fff" />
          <circle cx="39.5" cy="34" r="0.95" fill="#fff" />
        </>
      )}
      <ellipse cx="21" cy="40.5" rx="3" ry="1.8" fill="#ff8fa3" fillOpacity="0.6" />
      <ellipse cx="43" cy="40.5" rx="3" ry="1.8" fill="#ff8fa3" fillOpacity="0.6" />
      {look.mouth ?? smile}
      {look.front}
    </svg>
  );
}
