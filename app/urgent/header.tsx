import type { Localized } from "../_lib/stations";

export const URGENT_TITLE: Localized = {
  ko: "긴급 화장실 · 약국 · 병원",
  en: "Urgent: Restroom · Pharmacy · Clinic",
};

export function UrgentIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#fde9ec] text-[18px]" aria-hidden>
      🚨
    </span>
  );
}
