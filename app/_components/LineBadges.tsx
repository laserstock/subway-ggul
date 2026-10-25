import { lineColor } from "../kakao-places";
import { t, type Locale, type StationOption } from "../_lib/stations";

export type LineIconSize = "xs" | "chip" | "sm" | "md" | "lg";

/** Short Korean names as printed on signage, and the official letter symbols used elsewhere. */
const NAMED_LINES: [RegExp, { ko: string; symbol: string }][] = [
  [/신분당/, { ko: "신분당", symbol: "D" }],
  [/수인분당|분당/, { ko: "수인분당", symbol: "K" }],
  [/경의|중앙/, { ko: "경의중앙", symbol: "K" }],
  [/공항/, { ko: "공항", symbol: "A" }],
  [/경춘/, { ko: "경춘", symbol: "G" }],
  [/우이신설/, { ko: "우이신설", symbol: "UI" }],
  [/신림/, { ko: "신림", symbol: "S" }],
  [/서해/, { ko: "서해", symbol: "WS" }],
  [/김포/, { ko: "김포", symbol: "G" }],
  [/인천\s*2/, { ko: "인천2", symbol: "I2" }],
  [/인천/, { ko: "인천1", symbol: "I1" }],
  [/경강/, { ko: "경강", symbol: "KK" }],
  [/GTX/i, { ko: "GTX-A", symbol: "A" }],
  [/의정부/, { ko: "의정부", symbol: "U" }],
  [/에버라인/, { ko: "에버라인", symbol: "E" }],
];

const CIRCLE: Record<LineIconSize, string> = {
  xs: "h-4 min-w-4 text-[10px]",
  chip: "h-[18px] min-w-[18px] text-[11px]",
  sm: "h-5 min-w-5 text-[12px]",
  md: "h-6 min-w-6 text-[13px]",
  lg: "h-12 min-w-12 text-[22px]",
};

const PILL: Record<LineIconSize, string> = {
  xs: "h-4 px-1 text-[8.5px]",
  chip: "h-[18px] px-1.5 py-0.5 text-[10px]",
  sm: "h-5 px-1.5 text-[9.5px]",
  md: "h-6 px-2 text-[10.5px]",
  lg: "h-12 w-12 px-1 text-[12px] leading-[1.15] whitespace-pre-line text-center",
};

function lineMark(line: string, locale: Locale) {
  const number = line.match(/^(\d+)호선/)?.[1];
  if (number) return number;
  const named = NAMED_LINES.find(([pattern]) => pattern.test(line))?.[1];
  if (!named) return [...line][0] ?? "?";
  return locale === "ko" ? named.ko : named.symbol;
}

/** Round line badge in the official line color, e.g. a purple "5" for 5호선. */
export function LineIcon({
  line,
  locale,
  label,
  size = "sm",
  className = "",
}: {
  /** Korean line name, e.g. "5호선" or "경의·중앙선". */
  line: string;
  locale: Locale;
  /** Accessible name; the badge is decorative when omitted. */
  label?: string;
  size?: LineIconSize;
  className?: string;
}) {
  const mark = lineMark(line, locale);
  const round = /^\w{1,2}$/.test(mark);
  const text = size === "lg" && !round && mark.length > 3 ? `${mark.slice(0, 2)}\n${mark.slice(2)}` : mark;
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold leading-none tracking-tight text-white ${
        round ? `${CIRCLE[size]} ${mark.length > 1 ? "px-[3px]" : ""}` : PILL[size]
      } ${className}`}
      style={{ backgroundColor: lineColor([line]) }}
    >
      {text}
    </span>
  );
}

/** All lines of a station as round badges. */
export default function LineBadges({
  station,
  locale,
  size = "sm",
  className = "",
}: {
  station: StationOption;
  locale: Locale;
  size?: LineIconSize;
  className?: string;
}) {
  const lines = station.lines.ko.split(" · ").filter(Boolean);
  if (lines.length === 0) return null;
  const labels = t(station.lines, locale).split(" · ");
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 ${className}`}>
      {lines.map((line, index) => (
        <LineIcon key={line} line={line} locale={locale} label={labels[index] ?? line} size={size} />
      ))}
    </span>
  );
}
