import type { Localized } from "../_lib/stations";

export const ROUTE_TITLE: Localized = {
  ko: "최적경로 찾기",
  en: "Best Route",
  zh: "最佳路线",
  ja: "最適ルート検索",
};

export const ROUTE_MODES = ["fastest", "fewest"] as const;

export function isRouteMode(value: unknown): value is (typeof ROUTE_MODES)[number] {
  return ROUTE_MODES.includes(value as (typeof ROUTE_MODES)[number]);
}

export function RouteIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#fff1c2] text-[18px]" aria-hidden>
      🧭
    </span>
  );
}
