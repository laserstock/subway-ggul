import { stationLines } from "./subwayLine";
import type { Localized, StationOption } from "./stations";

export type Difficulty = "easy" | "normal" | "hard";
export type Landmark = "escalator" | "elevator" | "stairs" | "corridor";

export type TransferRoute = {
  id: string;
  from: string;
  to: string;
  car: string | null;
  landmark: Landmark;
  path: Localized | null;
  walkMinutes: number | null;
  difficulty: Difficulty | null;
};

export type AccessStep = { icon: string; text: Localized };
export type AccessCourse = { id: string; title: Localized; steps: AccessStep[] };

export type FacilityKind = "escalator" | "elevator";
export type FacilityStatus = "ok" | "maintenance" | "unknown";
export type Facility = {
  id: string;
  kind: FacilityKind;
  /** null = inside the station (platform ↔ concourse). */
  exit: number | null;
  levels: string;
  status: FacilityStatus;
};

export type StationTransfer = {
  routes: TransferRoute[];
  courses: AccessCourse[];
  facilities: Facility[];
};

type SampleTransfer = {
  routes: Omit<TransferRoute, "id">[];
  courses: AccessCourse[];
  facilities: Omit<Facility, "id">[];
};

/** Beta sample data keyed by Korean station name; live data will come from public APIs and user votes. */
const SAMPLES: Record<string, SampleTransfer> = {
  강남역: {
    routes: [
      {
        from: "2호선",
        to: "신분당선",
        car: "3-1",
        landmark: "escalator",
        path: {
          ko: "B1 환승통로 따라 직진",
          en: "Go straight along the B1 transfer passage",
          zh: "沿B1换乘通道直行",
          ja: "B1乗換通路をまっすぐ",
        },
        walkMinutes: 3,
        difficulty: "easy",
      },
      {
        from: "신분당선",
        to: "2호선",
        car: "5-3",
        landmark: "escalator",
        path: {
          ko: "환승 개찰구 지나 2호선 대합실로",
          en: "Through the transfer gate to the Line 2 concourse",
          zh: "经换乘闸机前往2号线大厅",
          ja: "乗換改札を通って2号線コンコースへ",
        },
        walkMinutes: 4,
        difficulty: "normal",
      },
    ],
    courses: [
      {
        id: "exit1-line2",
        title: {
          ko: "1번 출구 → 2호선 승강장",
          en: "Exit 1 → Line 2 platform",
          zh: "1号出口 → 2号线站台",
          ja: "1番出口 → 2号線ホーム",
        },
        steps: [
          {
            icon: "🛗",
            text: {
              ko: "1번 출구 엘리베이터 탑승 (지상 → B1)",
              en: "Take the Exit 1 elevator (street → B1)",
              zh: "乘坐1号出口电梯（地面 → B1）",
              ja: "1番出口のエレベーターに乗る（地上 → B1）",
            },
          },
          {
            icon: "🎫",
            text: {
              ko: "B1 대합실 교통약자 전용 넓은 개찰구 통과",
              en: "Use the wide accessible fare gate on B1",
              zh: "通过B1大厅无障碍宽闸机",
              ja: "B1コンコースの幅広いバリアフリー改札を通過",
            },
          },
          {
            icon: "🛗",
            text: {
              ko: "승강장 엘리베이터로 B2 2호선 승강장 도착",
              en: "Platform elevator down to the B2 Line 2 platform",
              zh: "乘站台电梯到达B2的2号线站台",
              ja: "ホーム用エレベーターでB2の2号線ホームへ",
            },
          },
        ],
      },
    ],
    facilities: [
      { kind: "elevator", exit: 1, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: 11, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: 10, levels: "1F ↔ B1", status: "maintenance" },
      { kind: "elevator", exit: null, levels: "B1 ↔ B2", status: "ok" },
    ],
  },
  홍대입구역: {
    routes: [
      {
        from: "2호선",
        to: "경의·중앙선",
        car: "7-1",
        landmark: "corridor",
        path: {
          ko: "긴 환승통로 + 에스컬레이터 2번",
          en: "Long transfer passage + 2 escalators",
          zh: "较长换乘通道 + 2段扶梯",
          ja: "長い乗換通路 + エスカレーター2回",
        },
        walkMinutes: 6,
        difficulty: "hard",
      },
      {
        from: "경의·중앙선",
        to: "2호선",
        car: "4-1",
        landmark: "escalator",
        path: {
          ko: "B3 → B1 환승통로 표지판 따라",
          en: "Follow the B3 → B1 transfer signs",
          zh: "按B3 → B1换乘指示牌前行",
          ja: "B3 → B1の乗換案内に沿って",
        },
        walkMinutes: 6,
        difficulty: "hard",
      },
    ],
    courses: [
      {
        id: "exit9-line2",
        title: {
          ko: "9번 출구 → 2호선 승강장",
          en: "Exit 9 → Line 2 platform",
          zh: "9号出口 → 2号线站台",
          ja: "9番出口 → 2号線ホーム",
        },
        steps: [
          {
            icon: "🛗",
            text: {
              ko: "9번 출구 옆 엘리베이터 탑승 (지상 → B1)",
              en: "Elevator next to Exit 9 (street → B1)",
              zh: "乘坐9号出口旁电梯（地面 → B1）",
              ja: "9番出口横のエレベーター（地上 → B1）",
            },
          },
          {
            icon: "➡️",
            text: {
              ko: "B1 연결통로 따라 2호선 개찰구로 이동",
              en: "Follow the B1 passage to the Line 2 gates",
              zh: "沿B1通道前往2号线闸机",
              ja: "B1通路を進み2号線改札へ",
            },
          },
          {
            icon: "🛗",
            text: {
              ko: "개찰구 안 엘리베이터로 B2 승강장 도착",
              en: "Elevator inside the gate down to the B2 platform",
              zh: "乘闸机内电梯到达B2站台",
              ja: "改札内エレベーターでB2ホームへ",
            },
          },
        ],
      },
    ],
    facilities: [
      { kind: "escalator", exit: 9, levels: "1F ↔ B1", status: "ok" },
      { kind: "elevator", exit: 3, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: 8, levels: "1F ↔ B1", status: "maintenance" },
      { kind: "elevator", exit: null, levels: "B1 ↔ B3", status: "ok" },
    ],
  },
  서울역: {
    routes: [
      {
        from: "1호선",
        to: "4호선",
        car: "2-3",
        landmark: "escalator",
        path: {
          ko: "B1 환승통로 표지판 따라 직진",
          en: "Straight along the B1 transfer signs",
          zh: "沿B1换乘指示牌直行",
          ja: "B1の乗換案内に沿って直進",
        },
        walkMinutes: 4,
        difficulty: "normal",
      },
      {
        from: "4호선",
        to: "1호선",
        car: "8-1",
        landmark: "stairs",
        path: {
          ko: "계단 1번 + 짧은 연결통로",
          en: "One flight of stairs + short passage",
          zh: "1段楼梯 + 短通道",
          ja: "階段1回 + 短い連絡通路",
        },
        walkMinutes: 3,
        difficulty: "normal",
      },
      {
        from: "1호선",
        to: "경의·중앙선",
        car: "1-1",
        landmark: "corridor",
        path: {
          ko: "지상 역사 경유 · 이동 거리 길어요",
          en: "Via the main station building · long walk",
          zh: "经地面站厅 · 步行距离较长",
          ja: "地上駅舎経由 · 移動距離が長め",
        },
        walkMinutes: 8,
        difficulty: "hard",
      },
    ],
    courses: [
      {
        id: "ktx-line1",
        title: {
          ko: "KTX 대합실 → 1호선 승강장 (캐리어 추천)",
          en: "KTX hall → Line 1 platform (good for luggage)",
          zh: "KTX候车厅 → 1号线站台（推荐带行李）",
          ja: "KTX待合室 → 1号線ホーム（荷物の多い方に）",
        },
        steps: [
          {
            icon: "🛗",
            text: {
              ko: "KTX 대합실 엘리베이터 탑승 (2F → 1F)",
              en: "KTX hall elevator (2F → 1F)",
              zh: "乘坐KTX候车厅电梯（2F → 1F）",
              ja: "KTX待合室のエレベーター（2F → 1F）",
            },
          },
          {
            icon: "➡️",
            text: {
              ko: "1호선 방면 지하 연결통로로 이동",
              en: "Take the underground passage toward Line 1",
              zh: "经地下通道前往1号线方向",
              ja: "1号線方面の地下連絡通路へ",
            },
          },
          {
            icon: "🛗",
            text: {
              ko: "1호선 엘리베이터로 B1 승강장 도착",
              en: "Line 1 elevator down to the B1 platform",
              zh: "乘1号线电梯到达B1站台",
              ja: "1号線エレベーターでB1ホームへ",
            },
          },
        ],
      },
    ],
    facilities: [
      { kind: "elevator", exit: 1, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: 15, levels: "1F ↔ B1", status: "ok" },
      { kind: "elevator", exit: 9, levels: "1F ↔ B1", status: "maintenance" },
      { kind: "escalator", exit: null, levels: "B1 ↔ B2", status: "ok" },
    ],
  },
  잠실역: {
    routes: [
      {
        from: "2호선",
        to: "8호선",
        car: "9-4",
        landmark: "escalator",
        path: {
          ko: "B1 환승통로 → 8호선 대합실",
          en: "B1 transfer passage → Line 8 concourse",
          zh: "B1换乘通道 → 8号线大厅",
          ja: "B1乗換通路 → 8号線コンコース",
        },
        walkMinutes: 3,
        difficulty: "normal",
      },
      {
        from: "8호선",
        to: "2호선",
        car: "1-1",
        landmark: "escalator",
        path: {
          ko: "에스컬레이터 한 번이면 2호선 대합실",
          en: "One escalator up to the Line 2 concourse",
          zh: "乘一段扶梯即到2号线大厅",
          ja: "エスカレーター1回で2号線コンコースへ",
        },
        walkMinutes: 2,
        difficulty: "easy",
      },
    ],
    courses: [
      {
        id: "mall-line2",
        title: {
          ko: "롯데월드몰 → 2호선 승강장 (비 안 맞는 길)",
          en: "Lotte World Mall → Line 2 platform (rain-free)",
          zh: "乐天世界购物中心 → 2号线站台（不淋雨）",
          ja: "ロッテワールドモール → 2号線ホーム（雨に濡れない）",
        },
        steps: [
          {
            icon: "🛗",
            text: {
              ko: "롯데월드몰 B1 엘리베이터 하차",
              en: "Take the Lotte World Mall elevator to B1",
              zh: "乘乐天世界购物中心电梯到B1",
              ja: "ロッテワールドモールのエレベーターでB1へ",
            },
          },
          {
            icon: "➡️",
            text: {
              ko: "지하 연결통로 따라 역 대합실로 이동",
              en: "Follow the underground passage to the concourse",
              zh: "沿地下通道前往车站大厅",
              ja: "地下連絡通路を進みコンコースへ",
            },
          },
          {
            icon: "🛗",
            text: {
              ko: "개찰구 안 엘리베이터로 2호선 승강장 도착",
              en: "Elevator inside the gate to the Line 2 platform",
              zh: "乘闸机内电梯到达2号线站台",
              ja: "改札内エレベーターで2号線ホームへ",
            },
          },
        ],
      },
    ],
    facilities: [
      { kind: "escalator", exit: 2, levels: "1F ↔ B1", status: "ok" },
      { kind: "elevator", exit: 4, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: 8, levels: "1F ↔ B1", status: "maintenance" },
    ],
  },
  광화문역: {
    routes: [],
    courses: [
      {
        id: "exit1-platform",
        title: {
          ko: "1번 출구 → 5호선 승강장",
          en: "Exit 1 → Line 5 platform",
          zh: "1号出口 → 5号线站台",
          ja: "1番出口 → 5号線ホーム",
        },
        steps: [
          {
            icon: "🛗",
            text: {
              ko: "1번 출구 엘리베이터 탑승",
              en: "Take the Exit 1 elevator",
              zh: "乘坐1号出口电梯",
              ja: "1番出口のエレベーターに乗る",
            },
          },
          {
            icon: "➡️",
            text: {
              ko: "지하 1층 연결통로 따라 대합실로 이동",
              en: "Follow the B1 passage to the concourse",
              zh: "沿地下1层通道前往大厅",
              ja: "地下1階の連絡通路を進みコンコースへ",
            },
          },
          {
            icon: "🚇",
            text: {
              ko: "승강장 엘리베이터로 B승강장 이동",
              en: "Platform elevator down to Platform B",
              zh: "乘站台电梯前往B站台",
              ja: "ホーム用エレベーターでBホームへ",
            },
          },
        ],
      },
    ],
    facilities: [
      { kind: "escalator", exit: 3, levels: "1F ↔ B1", status: "ok" },
      { kind: "elevator", exit: 7, levels: "1F ↔ B1", status: "maintenance" },
      { kind: "elevator", exit: 1, levels: "1F ↔ B1", status: "ok" },
      { kind: "escalator", exit: null, levels: "B2 ↔ B5", status: "ok" },
    ],
  },
};

const MAX_GENERATED_ROUTES = 6;

function facilityId(station: StationOption, facility: Omit<Facility, "id">, index: number) {
  return `${station.key}:${facility.kind}:${facility.exit ?? "in"}:${index}`;
}

function nameSeed(station: StationOption) {
  return [...station.name.ko].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/** Line pairs without car-level detail, shown until real data exists for the station. */
function generatedRoutes(station: StationOption): TransferRoute[] {
  const lines = stationLines(station);
  return lines
    .flatMap((from) => lines.filter((to) => to !== from).map((to) => ({ from, to })))
    .slice(0, MAX_GENERATED_ROUTES)
    .map(({ from, to }) => ({
      id: `${from}>${to}`,
      from,
      to,
      car: null,
      landmark: "escalator",
      path: null,
      walkMinutes: null,
      difficulty: null,
    }));
}

function generatedFacilities(station: StationOption): Omit<Facility, "id">[] {
  const seed = nameSeed(station);
  const escalatorExit = (seed % 9) + 1;
  let elevatorExit = ((seed * 7) % 9) + 1;
  if (elevatorExit === escalatorExit) elevatorExit = (escalatorExit % 9) + 1;
  return [
    { kind: "escalator", exit: escalatorExit, levels: "1F ↔ B1", status: "ok" },
    { kind: "elevator", exit: elevatorExit, levels: "1F ↔ B1", status: "unknown" },
  ];
}

export function transferInfo(station: StationOption): StationTransfer {
  const sample = SAMPLES[station.name.ko];
  const facilities = (sample?.facilities ?? generatedFacilities(station)).map((facility, index) => ({
    ...facility,
    id: facilityId(station, facility, index),
  }));
  return {
    routes: sample
      ? sample.routes.map((route) => ({ ...route, id: `${route.from}>${route.to}` }))
      : generatedRoutes(station),
    courses: sample?.courses ?? [],
    facilities,
  };
}
