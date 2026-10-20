import { lineColor } from "../kakao-places";
import { t, type Locale, type StationOption } from "../_lib/stations";

/** Round numbered badges for "N호선", colored pills for named lines. */
export default function LineBadges({
  station,
  locale,
  size = "sm",
}: {
  station: StationOption;
  locale: Locale;
  size?: "sm" | "md";
}) {
  const lines = station.lines.ko.split(" · ").filter(Boolean);
  const labels = t(station.lines, locale).split(" · ");
  const dimension = size === "md" ? "h-6 min-w-6 text-[12px]" : "h-[18px] min-w-[18px] text-[10px]";
  return (
    <span className="flex shrink-0 flex-wrap items-center gap-1">
      {lines.map((line, index) => {
        const number = line.match(/^(\d+)호선$/)?.[1];
        const color = lineColor([line]);
        return number ? (
          <span
            key={line}
            className={`flex items-center justify-center rounded-full px-1 font-bold text-white ${dimension}`}
            style={{ backgroundColor: color }}
          >
            {number}
          </span>
        ) : (
          <span
            key={line}
            className={`rounded-full px-1.5 font-bold leading-[18px] text-white ${
              size === "md" ? "text-[11px] leading-6" : "text-[10px]"
            }`}
            style={{ backgroundColor: color }}
          >
            {labels[index] ?? line}
          </span>
        );
      })}
    </span>
  );
}
