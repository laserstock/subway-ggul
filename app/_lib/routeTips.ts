import { STATION_TIPS } from "./stationTips";
import { sameLine, stationLines } from "./subwayLine";
import type { Localized, StationOption } from "./stations";

export type Boarding = { line: string; car: string; note: Localized };

export type RouteSummary = {
  /** Line shared by both stations (ride without transferring), if any. */
  directLine: string | null;
  fromLine: string | null;
  toLine: string | null;
  boarding: Boarding | null;
  tips: Localized[];
};

/** Beta sample tips keyed "출발역>도착역" by Korean station name. */
const ROUTE_SAMPLES: Record<string, { boarding: Boarding; tips: Localized[] }> = {
  "장한평역>광화문역": {
    boarding: {
      line: "5호선",
      car: "3-2",
      note: {
        ko: "군자역 환승 시 에스컬레이터 바로 앞",
        en: "Right by the escalator if you transfer at Gunja",
        zh: "在君子站换乘时扶梯就在眼前",
        ja: "君子駅で乗り換えるならエスカレーターのすぐ前",
      },
    },
    tips: [
      {
        ko: "장한평역 개찰구 안 화장실",
        en: "Restroom inside the gate at Janghanpyeong",
        zh: "长汉坪站闸机内有卫生间",
        ja: "長漢坪駅の改札内にトイレあり",
      },
      {
        ko: "광화문역 5번 출구 지하 연결통로 스벅",
        en: "Starbucks via the Exit 5 underground passage at Gwanghwamun",
        zh: "光化门站5号出口地下通道直达星巴克",
        ja: "光化門駅5番出口の地下連絡通路にスタバ",
      },
    ],
  },
};

export function routeSummary(from: StationOption, to: StationOption): RouteSummary {
  const fromLines = stationLines(from);
  const toLines = stationLines(to);
  const directLine = fromLines.find((line) => toLines.some((other) => sameLine(line, other))) ?? null;
  const sample = ROUTE_SAMPLES[`${from.name.ko}>${to.name.ko}`];
  const stationTips = [STATION_TIPS[from.name.ko], STATION_TIPS[to.name.ko]].filter(
    (tip): tip is Localized => Boolean(tip),
  );
  return {
    directLine,
    fromLine: fromLines[0] ?? null,
    toLine: toLines[0] ?? null,
    boarding: sample?.boarding ?? null,
    tips: sample?.tips ?? stationTips,
  };
}
