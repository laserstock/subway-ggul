import type { Localized } from "./i18n";

/** Lines without a number, as named on their operators' English, Chinese and Japanese signage. */
const NAMED_LINES: Record<string, Omit<Localized, "ko">> = {
  경의중앙선: { en: "Gyeongui–Jungang Line", zh: "京义中央线", ja: "京義中央線" },
  수인분당선: { en: "Suin–Bundang Line", zh: "水仁盆唐线", ja: "水仁盆唐線" },
  신분당선: { en: "Shinbundang Line", zh: "新盆唐线", ja: "新盆唐線" },
  공항철도: { en: "AREX", zh: "机场铁路", ja: "空港鉄道" },
  경춘선: { en: "Gyeongchun Line", zh: "京春线", ja: "京春線" },
  경강선: { en: "Gyeonggang Line", zh: "京江线", ja: "京江線" },
  서해선: { en: "Seohae Line", zh: "西海线", ja: "西海線" },
  우이신설선: { en: "Ui–Sinseol Line", zh: "牛耳新设线", ja: "牛耳新設線" },
  신림선: { en: "Sillim Line", zh: "新林线", ja: "新林線" },
  인천1호선: { en: "Incheon Line 1", zh: "仁川1号线", ja: "仁川1号線" },
  인천2호선: { en: "Incheon Line 2", zh: "仁川2号线", ja: "仁川2号線" },
  김포골드라인: { en: "Gimpo Goldline", zh: "金浦黄金线", ja: "金浦ゴールドライン" },
  용인에버라인: { en: "Yongin EverLine", zh: "龙仁轻轨", ja: "龍仁エバーライン" },
  의정부경전철: { en: "U Line", zh: "议政府轻轨", ja: "議政府軽電鉄" },
};

/** "2호선" → Line 2 / 2号线 / 2号線; named lines from the table above; anything else as-is. */
export function lineName(line: string): Localized {
  const named = NAMED_LINES[line];
  if (named) return { ko: line, ...named };
  return {
    ko: line,
    en: line.replace(/^(\d+)호선$/, "Line $1"),
    zh: line.replace(/^(\d+)호선$/, "$1号线"),
    ja: line.replace(/^(\d+)호선$/, "$1号線"),
  };
}
