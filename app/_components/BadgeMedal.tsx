import type { Badge, BadgeTier } from "../_lib/profile";

const RING: Record<BadgeTier, string> = {
  bronze: "linear-gradient(135deg, #f6cfa8 0%, #c27a43 55%, #8f4f22 100%)",
  silver: "linear-gradient(135deg, #f8fafc 0%, #b8c2d1 55%, #7b8597 100%)",
  gold: "linear-gradient(135deg, #fff1a8 0%, #ffc531 50%, #e08a00 100%)",
  diamond: "linear-gradient(135deg, #a5f3fc 0%, #818cf8 50%, #e879f9 100%)",
};

const GLOW: Record<BadgeTier, string> = {
  bronze: "0 3px 10px rgba(194,122,67,0.35)",
  silver: "0 3px 10px rgba(123,133,151,0.35)",
  gold: "0 3px 12px rgba(245,167,0,0.45)",
  diamond: "0 4px 16px rgba(129,140,248,0.55)",
};

/** Small tier-colored chip, e.g. next to an author name. Alpha backgrounds keep it readable in dark mode. */
export const TIER_PILL: Record<BadgeTier, string> = {
  bronze: "bg-[#c27a43]/15 text-[#b0662f]",
  silver: "bg-[#8b95a7]/20 text-[#6b7588]",
  gold: "bg-[#f5a700]/18 text-honey-strong",
  diamond: "bg-gradient-to-r from-[#22d3ee]/20 to-[#a855f7]/20 text-[#6d5df5]",
};

/** Round medal with a metallic ring in the badge's tier color. */
export default function BadgeMedal({
  badge,
  size = 40,
  locked = false,
}: {
  badge: Badge;
  size?: number;
  locked?: boolean;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full ${locked ? "opacity-45 grayscale" : ""}`}
      style={{
        width: size,
        height: size,
        padding: Math.max(2, Math.round(size / 14)),
        background: RING[badge.tier],
        boxShadow: locked ? undefined : GLOW[badge.tier],
      }}
      aria-hidden
    >
      <span
        className="flex h-full w-full items-center justify-center rounded-full bg-surface"
        style={{ fontSize: Math.round(size * 0.46), lineHeight: 1 }}
      >
        {badge.emoji}
      </span>
      {badge.tier === "diamond" && !locked ? (
        <span
          className="absolute -right-0.5 -top-0.5 text-white drop-shadow-[0_0_3px_rgba(129,140,248,0.9)]"
          style={{ fontSize: Math.max(9, Math.round(size * 0.24)) }}
        >
          ✦
        </span>
      ) : null}
    </span>
  );
}
