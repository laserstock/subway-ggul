import type { Localized, StationOption } from "./stations";

export type LevelKind = "street" | "concourse" | "platform" | "passage";

export type StepFreeLevel = {
  floor: string;
  kind: LevelKind;
  label?: Localized;
};

export type StepFreeNote = { icon: string; text: Localized };

/**
 * Schematic step-free route summarised from Seoul Metro station maps.
 * Horizontal positions are fractions of the platform length measured from the `ends[0]` side.
 */
export type StepFreeMap = {
  code: number;
  line: string;
  cars: number;
  image: string;
  ends: readonly [Localized, Localized];
  /** Top to bottom. */
  levels: StepFreeLevel[];
  exitLevel: number;
  gateLevel: number;
  platformLevel: number;
  platformEv: number;
  gate: number;
  exitEv: number;
  exit: Localized;
  notes: StepFreeNote[];
};

export const DOORS_PER_CAR = 4;

const STATION_NAMES = {
  cheongnyangni: { ko: "청량리", en: "Cheongnyangni", zh: "清凉里", ja: "清凉里" },
  hoegi: { ko: "회기", en: "Hoegi", zh: "回基", ja: "回基" },
  jegidong: { ko: "제기동", en: "Jegi-dong", zh: "祭基洞", ja: "祭基洞" },
  sinseoldong: { ko: "신설동", en: "Sinseol-dong", zh: "新设洞", ja: "新設洞" },
  dongmyo: { ko: "동묘앞", en: "Dongmyo", zh: "东庙前", ja: "東廟前" },
  dongdaemun: { ko: "동대문", en: "Dongdaemun", zh: "东大门", ja: "東大門" },
  jongno5ga: { ko: "종로5가", en: "Jongno 5-ga", zh: "钟路5街", ja: "鍾路5街" },
  jongno3ga: { ko: "종로3가", en: "Jongno 3-ga", zh: "钟路3街", ja: "鍾路3街" },
  jonggak: { ko: "종각", en: "Jonggak", zh: "钟阁", ja: "鐘閣" },
  cityHall: { ko: "시청", en: "City Hall", zh: "市厅", ja: "市庁" },
  seoul: { ko: "서울역", en: "Seoul Station", zh: "首尔站", ja: "ソウル駅" },
  namyeong: { ko: "남영", en: "Namyeong", zh: "南营", ja: "南営" },
} satisfies Record<string, Localized>;

function exitNo(n: string): Localized {
  return { ko: `${n}번 출구`, en: `Exit ${n}`, zh: `${n}号出口`, ja: `${n}番出口` };
}

const STREET: StepFreeLevel = { floor: "1F", kind: "street" };
const STANDARD_LEVELS: StepFreeLevel[] = [
  STREET,
  { floor: "B1", kind: "concourse" },
  { floor: "B2", kind: "platform" },
];
const STANDARD = { levels: STANDARD_LEVELS, exitLevel: 0, gateLevel: 1, platformLevel: 2 } as const;

const LINE1 = { line: "1호선", cars: 10 } as const;

function map(code: number, slug: string) {
  return `/station-maps/line1/${code}-${slug}.jpg`;
}

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
const STEP_FREE_MAPS: Record<string, StepFreeMap> = {
  청량리역: {
    ...LINE1,
    code: 124,
    image: map(124, "cheongnyangni"),
    ends: [STATION_NAMES.jegidong, STATION_NAMES.hoegi],
    levels: [STREET, { floor: "B1", kind: "platform" }, { floor: "B2", kind: "concourse" }],
    exitLevel: 0,
    gateLevel: 2,
    platformLevel: 1,
    platformEv: 0.59,
    gate: 0.64,
    exitEv: 0.68,
    exit: exitNo("2"),
    notes: [
      {
        icon: "↕️",
        text: {
          ko: "청량리는 승강장(B1)이 대합실(B2)보다 위에 있어요. 엘리베이터로 B2까지 내려간 뒤 다시 지상으로 올라가요.",
          en: "Here the platform (B1) sits above the concourse (B2): ride down to B2, then up to the street.",
        },
      },
      {
        icon: "🔁",
        text: {
          ko: "경의중앙·경춘·수인분당선은 B2 대합실 회기 방면 끝 '갈아타는 곳'으로 이어져요.",
          en: "Gyeongui–Jungang, Gyeongchun and Suin–Bundang lines: transfer point at the Hoegi end of the B2 concourse.",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "1·6번 출구 쪽에도 지상 ↔ B2 엘리베이터가 있어요.",
          en: "There is also a street ↔ B2 lift near Exits 1 and 6.",
        },
      },
    ],
  },
  제기동역: {
    ...LINE1,
    ...STANDARD,
    code: 125,
    image: map(125, "jegidong"),
    ends: [STATION_NAMES.sinseoldong, STATION_NAMES.cheongnyangni],
    platformEv: 0.33,
    gate: 0.23,
    exitEv: 0.18,
    exit: exitNo("1"),
    notes: [
      {
        icon: "🛗",
        text: {
          ko: "지상 엘리베이터는 1·6번 출구와 5번 출구 사이에 있어요.",
          en: "The street lift is between Exits 1·6 and Exit 5.",
        },
      },
      {
        icon: "🚻",
        text: { ko: "화장실: B1 대합실 3번 출구 쪽", en: "Toilets: B1 concourse, Exit 3 side" },
      },
    ],
  },
  신설동역: {
    ...LINE1,
    ...STANDARD,
    code: 126,
    image: map(126, "sinseoldong"),
    ends: [STATION_NAMES.dongmyo, STATION_NAMES.jegidong],
    platformEv: 0.68,
    gate: 0.7,
    exitEv: 0.74,
    exit: exitNo("3"),
    notes: [
      {
        icon: "🔁",
        text: {
          ko: "2호선: B1 대합실 7~10번 출구 방면 '갈아타는 곳'으로 가요.",
          en: "Line 2: follow the transfer signs toward Exits 7–10 on the B1 concourse.",
        },
      },
      {
        icon: "🔁",
        text: {
          ko: "우이신설선: 11·12번 출구 방면 '갈아타는 곳'",
          en: "Ui–Sinseol line: transfer point toward Exits 11·12",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "11·12번 출구 쪽에도 지상 엘리베이터가 있어요.",
          en: "There is also a street lift near Exits 11·12.",
        },
      },
    ],
  },
  동묘앞역: {
    ...LINE1,
    code: 127,
    image: map(127, "dongmyo"),
    ends: [STATION_NAMES.dongdaemun, STATION_NAMES.sinseoldong],
    levels: [
      {
        floor: "1F",
        kind: "concourse",
        label: { ko: "대합실 · 출구", en: "Concourse · Exits", zh: "大厅 · 出口", ja: "コンコース · 出口" },
      },
      { floor: "B1", kind: "platform" },
      {
        floor: "B2",
        kind: "passage",
        label: { ko: "6호선 환승통로", en: "Line 6 passage", zh: "6号线换乘通道", ja: "6号線乗換通路" },
      },
    ],
    exitLevel: 0,
    gateLevel: 0,
    platformLevel: 1,
    platformEv: 0.54,
    gate: 0.58,
    exitEv: 0.62,
    exit: exitNo("2"),
    notes: [
      {
        icon: "⬆️",
        text: {
          ko: "동묘앞 1호선은 대합실이 지상(1F)에 있어서 엘리베이터 한 번이면 밖이에요.",
          en: "The Line 1 concourse is at street level (1F), so one lift ride takes you outside.",
        },
      },
      {
        icon: "🔁",
        text: {
          ko: "6호선: 승강장(B1)에서 엘리베이터로 B2 환승통로 → 6호선 대합실",
          en: "Line 6: lift from the B1 platform down to the B2 passage, then to the Line 6 concourse.",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "8·9번 출구 쪽에도 1F ↔ 승강장 엘리베이터가 있어요.",
          en: "There is also a 1F ↔ platform lift near Exits 8·9.",
        },
      },
    ],
  },
  동대문역: {
    ...LINE1,
    ...STANDARD,
    code: 128,
    image: map(128, "dongdaemun"),
    ends: [STATION_NAMES.jongno5ga, STATION_NAMES.dongmyo],
    platformEv: 0.37,
    gate: 0.42,
    exitEv: 0.46,
    exit: exitNo("1"),
    notes: [
      {
        icon: "🔁",
        text: {
          ko: "4호선: B1 대합실 종로5가 방면 '갈아타는 곳' (7~10번 출구 방면)",
          en: "Line 4: transfer point at the Jongno 5-ga end of B1 (toward Exits 7–10)",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "지상 엘리베이터는 1번과 6번 출구 사이에 있어요.",
          en: "The street lift is between Exits 1 and 6.",
        },
      },
      { icon: "🚻", text: { ko: "화장실: B1 대합실 3·4번 출구 쪽", en: "Toilets: B1 concourse, Exits 3·4 side" } },
    ],
  },
  종로5가역: {
    ...LINE1,
    ...STANDARD,
    code: 129,
    image: map(129, "jongno5ga"),
    ends: [STATION_NAMES.jongno3ga, STATION_NAMES.dongdaemun],
    platformEv: 0.28,
    gate: 0.23,
    exitEv: 0.17,
    exit: {
      ko: "지상 E/V (1·2번 방면)",
      en: "Street lift (Exits 1·2 side)",
      zh: "地面电梯（1·2号出口方向）",
      ja: "地上EV（1·2番出口側）",
    },
    notes: [
      {
        icon: "🛗",
        text: {
          ko: "지상 엘리베이터는 대합실 종로3가 방면 끝에 따로 있어요. 출구 번호 대신 'E/V' 표지판을 따라가세요.",
          en: "The street lift is at the Jongno 3-ga end of the concourse. Follow the 'E/V' signs rather than exit numbers.",
        },
      },
      { icon: "🚻", text: { ko: "화장실: B1 대합실 종로3가 방면 끝", en: "Toilets: Jongno 3-ga end of the B1 concourse" } },
      { icon: "🛍️", text: { ko: "지하상가 연결통로와 이어져 있어요.", en: "Connected to the underground shopping passage." } },
    ],
  },
  종로3가역: {
    ...LINE1,
    ...STANDARD,
    code: 130,
    image: map(130, "jongno3ga"),
    ends: [STATION_NAMES.jonggak, STATION_NAMES.jongno5ga],
    platformEv: 0.62,
    gate: 0.67,
    exitEv: 0.72,
    exit: exitNo("11"),
    notes: [
      {
        icon: "🔁",
        text: {
          ko: "3·5호선: B1 대합실 가운데 '갈아타는 곳'으로 가요.",
          en: "Lines 3·5: transfer point in the middle of the B1 concourse.",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "대합실 가운데에도 지상 ↔ 승강장 엘리베이터가 있어요.",
          en: "There is also a street ↔ platform lift in the middle of the concourse.",
        },
      },
      { icon: "🚻", text: { ko: "화장실: B1 대합실 양쪽 끝", en: "Toilets: both ends of the B1 concourse" } },
    ],
  },
  종각역: {
    ...LINE1,
    ...STANDARD,
    code: 131,
    image: map(131, "jonggak"),
    ends: [STATION_NAMES.cityHall, STATION_NAMES.jongno3ga],
    platformEv: 0.41,
    gate: 0.52,
    exitEv: 0.67,
    exit: exitNo("3"),
    notes: [
      {
        icon: "🛗",
        text: {
          ko: "1번 출구 쪽에도 지상 엘리베이터가 있어요 (시청 방면 끝).",
          en: "There is also a street lift near Exit 1 (City Hall end).",
        },
      },
      { icon: "🚻", text: { ko: "화장실: B1 1번 출구 쪽 · 4번 출구 쪽", en: "Toilets: B1, near Exit 1 and Exit 4" } },
      {
        icon: "🛍️",
        text: {
          ko: "7~12번 출구는 지하상가 연결통로를 이용해요.",
          en: "Exits 7–12 are reached through the underground shopping passage.",
        },
      },
    ],
  },
  시청역: {
    ...LINE1,
    ...STANDARD,
    code: 132,
    image: map(132, "cityhall"),
    ends: [STATION_NAMES.jonggak, STATION_NAMES.seoul],
    platformEv: 0.28,
    gate: 0.45,
    exitEv: 0.66,
    exit: exitNo("6"),
    notes: [
      {
        icon: "🔁",
        text: {
          ko: "2호선: B1 대합실 서울역 방면 끝 (8~12번 출구 방면) '갈아타는 곳'",
          en: "Line 2: transfer point at the Seoul Station end of B1 (toward Exits 8–12)",
        },
      },
      { icon: "🚻", text: { ko: "화장실: B1 대합실 4번 출구 쪽", en: "Toilets: B1 concourse, Exit 4 side" } },
    ],
  },
  서울역: {
    ...LINE1,
    ...STANDARD,
    code: 133,
    image: map(133, "seoul"),
    ends: [STATION_NAMES.namyeong, STATION_NAMES.cityHall],
    platformEv: 0.57,
    gate: 0.42,
    exitEv: 0.57,
    exit: exitNo("2"),
    notes: [
      {
        icon: "🛗",
        text: {
          ko: "승강장 가운데 엘리베이터 하나로 B1 대합실과 지상(2번 출구 쪽)까지 이어져요.",
          en: "One lift in the middle of the platform runs to the B1 concourse and up to the street (Exit 2 side).",
        },
      },
      {
        icon: "🔁",
        text: {
          ko: "4호선: B1 대합실 남영 방면 (10~14번 출구 방면) / 공항철도: 15번 출구 방면",
          en: "Line 4: Namyeong end of B1 (toward Exits 10–14) · Airport Railroad: toward Exit 15",
        },
      },
      {
        icon: "🛗",
        text: {
          ko: "1번 출구, 3·4번 출구 쪽에도 지상 엘리베이터가 있어요.",
          en: "There are also street lifts near Exit 1 and Exits 3·4.",
        },
      },
    ],
  },
};

export function stepFreeMap(station: StationOption): StepFreeMap | null {
  const name = station.name.ko.replace(/\(.*?\)/g, "").trim();
  return STEP_FREE_MAPS[name] ?? STEP_FREE_MAPS[`${name}역`] ?? null;
}

/**
 * Car-door position nearest to a point on the platform.
 * Car 1 is the front of the train, so trains heading toward `ends[0]` count from that side.
 */
export function carDoorAt(fraction: number, towardFirstEnd: boolean, cars: number) {
  const fromFront = towardFirstEnd ? fraction : 1 - fraction;
  const position = Math.min(Math.max(fromFront, 0), 0.9999) * cars;
  const car = Math.floor(position) + 1;
  const door = Math.floor((position - (car - 1)) * DOORS_PER_CAR) + 1;
  return { car, door };
}
