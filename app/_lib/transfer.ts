import { stationLines } from "./subwayLine";
import type { Localized, StationOption } from "./stations";
import { stationDoorOptions, type DoorOption } from "./transferDoors";

export type TransferRoute = {
  id: string;
  from: string;
  to: string;
  /** Official car/door rows for each direction pair; empty when the station has none. */
  options: DoorOption[];
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
  courses: AccessCourse[];
  facilities: Omit<Facility, "id">[];
};

/** Beta sample data keyed by Korean station name; live data will come from public APIs and user votes. */
const SAMPLES: Record<string, SampleTransfer> = {
  강남역: {
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

/** Line pairs without car-level detail, for transfer stations the official data doesn't cover. */
function generatedRoutes(station: StationOption): TransferRoute[] {
  const lines = stationLines(station);
  return lines
    .flatMap((from) => lines.filter((to) => to !== from).map((to) => ({ from, to })))
    .slice(0, MAX_GENERATED_ROUTES)
    .map(({ from, to }) => ({ id: `${from}>${to}`, from, to, options: [] }));
}

/** One route per line pair in the official data, ordered by the station's own line order. */
function officialRoutes(station: StationOption): TransferRoute[] {
  const lines = stationLines(station);
  const rank = (line: string) => {
    const index = lines.indexOf(line);
    return index < 0 ? lines.length : index;
  };
  const routes = new Map<string, TransferRoute>();
  for (const option of stationDoorOptions(station.name.ko)) {
    const id = `${option.fromLine}>${option.toLine}`;
    const route = routes.get(id) ?? { id, from: option.fromLine, to: option.toLine, options: [] };
    route.options.push(option);
    routes.set(id, route);
  }
  return [...routes.values()].sort((a, b) => rank(a.from) - rank(b.from) || rank(a.to) - rank(b.to));
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
  const official = officialRoutes(station);
  return {
    routes: official.length > 0 ? official : generatedRoutes(station),
    courses: sample?.courses ?? [],
    facilities,
  };
}
