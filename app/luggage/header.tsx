import type { Localized } from "../_lib/stations";

export const LUGGAGE_TITLE: Localized = {
  ko: "짐보관 · 또타라커 · 러기지 · 스토리지",
  en: "Luggage: T-Locker · T-Luggage · Storage",
  zh: "行李寄存 · T-Locker · T-Luggage · 仓储",
  ja: "荷物預け · T-Locker · T-Luggage · ストレージ",
};

export function LuggageIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#e3f6ea] text-[18px]" aria-hidden>
      🧳
    </span>
  );
}
