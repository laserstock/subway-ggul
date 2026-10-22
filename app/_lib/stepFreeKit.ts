import type { Localized } from "./stations";

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
  code: string;
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

export type StepFreeLayout = Pick<StepFreeMap, "levels" | "exitLevel" | "gateLevel" | "platformLevel">;

export type StepFreeRoute = Pick<StepFreeMap, "platformEv" | "gate" | "exitEv" | "exit" | "notes">;

export function exitNo(n: string): Localized {
  return { ko: `${n}번 출구`, en: `Exit ${n}`, zh: `${n}号出口`, ja: `${n}番出口` };
}

export const STREET_LIFT_EXIT: Localized = {
  ko: "지상 E/V 출구",
  en: "Street lift exit",
  zh: "地面电梯出口",
  ja: "地上EV出口",
};

export function note(icon: string, ko: string, en: string): StepFreeNote {
  return { icon, text: { ko, en } };
}

export function toilet(ko: string, en: string): StepFreeNote {
  return note("🚻", `화장실: ${ko}`, `Toilets: ${en}`);
}

export const STREET: StepFreeLevel = { floor: "1F", kind: "street" };

export const CONCOURSE_EXITS_LABEL: Localized = {
  ko: "대합실 · 출구",
  en: "Concourse · Exits",
  zh: "大厅 · 出口",
  ja: "コンコース · 出口",
};

export const PASSAGE_LABEL: Localized = { ko: "연결통로", en: "Passage", zh: "连接通道", ja: "連絡通路" };

export const SAME_FLOOR_LABEL: Localized = {
  ko: "대합실 · 승강장",
  en: "Concourse · Platform",
  zh: "大厅 · 站台",
  ja: "コンコース · ホーム",
};

/** Street on top, gates on the concourse, platform below. */
export function underground(concourse = "B1", platform = "B2"): StepFreeLayout {
  return {
    levels: [STREET, { floor: concourse, kind: "concourse" }, { floor: platform, kind: "platform" }],
    exitLevel: 0,
    gateLevel: 1,
    platformLevel: 2,
  };
}

/** Elevated platform on 3F, concourse on 2F, exits down to the street. */
export const ELEVATED_3F: StepFreeLayout = {
  levels: [{ floor: "3F", kind: "platform" }, { floor: "2F", kind: "concourse" }, STREET],
  exitLevel: 2,
  gateLevel: 1,
  platformLevel: 0,
};

/** Elevated platform on 2F above a street-level concourse. */
export const ELEVATED_2F: StepFreeLayout = {
  levels: [{ floor: "2F", kind: "platform" }, { floor: "1F", kind: "concourse", label: CONCOURSE_EXITS_LABEL }],
  exitLevel: 1,
  gateLevel: 1,
  platformLevel: 0,
};

export const LINE1 = { line: "1호선", cars: 10 } as const;
export const LINE2 = { line: "2호선", cars: 10 } as const;
/** Seongsu and Sinjeong branches run 4-car trains. */
export const LINE2_BRANCH = { line: "2호선", cars: 4 } as const;

export function stationMap(
  line: { line: string; cars: number },
  folder: string,
  code: string,
  slug: string,
  ends: readonly [Localized, Localized],
  layout: StepFreeLayout,
  route: StepFreeRoute,
): StepFreeMap {
  return {
    ...line,
    code,
    image: `/station-maps/${folder}/${code}-${slug}.jpg`,
    ends,
    ...layout,
    ...route,
  };
}
