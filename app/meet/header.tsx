import type { Localized } from "../_lib/stations";

export const MEET_TITLE: Localized = {
  ko: "약속역 · 코스",
  en: "Meet · Course",
  zh: "约会站 · 行程",
  ja: "約束駅 · コース",
};

export function MeetHeaderIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="9" r="2.4" stroke="#B45309" strokeWidth="2" />
      <circle cx="16" cy="9" r="2.4" stroke="#B45309" strokeWidth="2" />
      <path
        d="M4.2 18.2c.7-2.8 2.8-4.4 5.8-4.4M19.8 18.2c-.7-2.8-2.8-4.4-5.8-4.4"
        stroke="#B45309"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M10.2 13.2c1.1.7 2.5.7 3.6 0" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
