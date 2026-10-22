import { HoneyPotIcon } from "../_components/BottomNav";
import type { Localized } from "../_lib/stations";

export const SPOT_TITLE: Localized = {
  ko: "🍯 꿀스팟",
  en: "🍯 Honey Spot",
  zh: "🍯 蜜点",
  ja: "🍯 ハニースポット",
};

export function SpotIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-honey-soft" aria-hidden>
      <HoneyPotIcon size={22} />
    </span>
  );
}
