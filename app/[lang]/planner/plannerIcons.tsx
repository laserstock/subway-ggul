import {
  Camera,
  Coffee,
  Coins,
  CreditCard,
  Flame,
  House,
  Images,
  Luggage,
  PackageOpen,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { PlannerCategory, QuickTag } from "../../_lib/plannerTypes";

export const CATEGORY_ICONS: Record<PlannerCategory, LucideIcon> = {
  food: Utensils,
  cafe: Coffee,
  shopping: ShoppingBag,
  beauty: Sparkles,
  culture: Camera,
  essentials: Coins,
};

export const TAG_ICONS: Record<QuickTag, LucideIcon> = {
  "#OliveYoung": Store,
  "#Daiso": PackageOpen,
  "#WOWPASS": CreditCard,
  "#K-BBQ": Flame,
  "#Pop-up": Tag,
  "#Life4Cut": Images,
  "#LuggageLocker": Luggage,
  "#HanokVillage": House,
};

/** Map pin and field dot colors for the departure and arrival stations. */
export const PIN_COLORS = { from: "#f5a700", to: "#e11d48" } as const;

/** Round line badge with the number or letters from the official signs. */
export function LineBadge({ short, color, size = "sm" }: { short: string; color: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-black leading-none text-white ${
        size === "md" ? "h-6 min-w-6 px-1 text-[11px]" : "h-[18px] min-w-[18px] px-[3px] text-[9.5px]"
      }`}
      style={{ backgroundColor: color }}
    >
      {short}
    </span>
  );
}
