import type { Localized } from "./stations";
import {
  exitNo,
  LINE8,
  note,
  stationMap,
  STREET,
  STREET_LIFT_EXIT,
  toilet,
  underground,
  type StepFreeLayout,
  type StepFreeMap,
  type StepFreeRoute,
} from "./stepFreeKit";

const N = {
  amsaPark: { ko: "암사역사공원", en: "Amsa History Park", zh: "岩寺历史公园", ja: "岩寺歴史公園" },
  amsa: { ko: "암사", en: "Amsa", zh: "岩寺", ja: "岩寺" },
  cheonho: { ko: "천호", en: "Cheonho", zh: "千户", ja: "千戸" },
  gangdongGu: { ko: "강동구청", en: "Gangdong-gu Office", zh: "江东区厅", ja: "江東区庁" },
  mongchon: { ko: "몽촌토성", en: "Mongchontoseong", zh: "梦村土城", ja: "夢村土城" },
  jamsil: { ko: "잠실", en: "Jamsil", zh: "蚕室", ja: "蚕室" },
  seokchon: { ko: "석촌", en: "Seokchon", zh: "石村", ja: "石村" },
  songpa: { ko: "송파", en: "Songpa", zh: "松坡", ja: "松坡" },
  garak: { ko: "가락시장", en: "Garak Market", zh: "可乐市场", ja: "可楽市場" },
  munjeong: { ko: "문정", en: "Munjeong", zh: "文井", ja: "文井" },
  jangji: { ko: "장지", en: "Jangji", zh: "长旨", ja: "長旨" },
  bokjeong: { ko: "복정", en: "Bokjeong", zh: "福井", ja: "福井" },
  namwirye: { ko: "남위례", en: "Namwirye", zh: "南慰礼", ja: "南慰礼" },
  sanseong: { ko: "산성", en: "Sanseong", zh: "山城", ja: "山城" },
  namhansanseong: { ko: "남한산성입구", en: "Namhansanseong", zh: "南汉山城入口", ja: "南漢山城入口" },
  dandae: { ko: "단대오거리", en: "Dandae-ogeori", zh: "丹垈五岔路", ja: "丹垈五叉路" },
  sinheung: { ko: "신흥", en: "Sinheung", zh: "新兴", ja: "新興" },
  sujin: { ko: "수진", en: "Sujin", zh: "寿进", ja: "寿進" },
  moran: { ko: "모란", en: "Moran", zh: "牡丹", ja: "牡丹" },
  moranEnd: { ko: "모란(종착)", en: "Moran (terminal)", zh: "牡丹（终点）", ja: "牡丹（終点）" },
} satisfies Record<string, Localized>;

const UNDER = underground();

function map(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE8, "line8", code, slug, ends, layout, route);
}

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE8_MAPS: Record<string, StepFreeMap> = {
  암사역사공원역: map("809", "amsa-park", [N.cheonho, N.amsa], UNDER, {
    platformEv: 0.48,
    gate: 0.6,
    exitEv: 0.58,
    exit: exitNo("3"),
    notes: [
      note("ℹ️", "별내선 연장 구간 역이에요. 왼쪽이 모란 방면, 오른쪽이 별내 방면이에요.", "A station on the Byeollae extension: left is toward Moran, right toward Byeollae."),
      toilet("B1 별내 방면", "B1, Byeollae side"),
    ],
  }),
  암사역: map("810", "amsa", [N.amsaPark, N.cheonho], UNDER, {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.21,
    exit: exitNo("1·4"),
    notes: [
      note("ℹ️", "안내도는 연장 전(암사 종착) 기준이라, 별내 방면 열차는 왼쪽(암사역사공원 쪽)으로 가요.", "The map predates the extension; Byeollae-bound trains now continue left toward Amsa History Park."),
      note("🛗", "승강장(B2) 가운데 엘리베이터로 B1에 올라간 뒤, 1·4번 출구 쪽 지상 엘리베이터를 이용하세요.", "Take the mid-platform lift to B1, then the street lift by Exits 1·4."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  천호역: map("811", "cheonho", [N.amsa, N.gangdongGu], UNDER, {
    platformEv: 0.35,
    gate: 0.5,
    exitEv: 0.35,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "8호선 단면도에는 지상 엘리베이터가 없어요. B1 대합실에서 5호선 대합실(5·6번 출구 쪽) 엘리베이터를 이용하세요.",
        "The Line 8 section shows no street lift. From the B1 concourse use the lifts in the Line 5 concourse (Exits 5·6 side).",
      ),
      note("🔁", "5호선: B2 승강장 가운데 '광나루 방면' / '강동 방면' 계단 → 5호선 승강장(B3)", "Line 5: mid-platform stairs 'to Gwangnaru' / 'to Gangdong' on B2 → Line 5 platform (B3)"),
      toilet("B1 5호선 대합실 쪽", "B1, Line 5 concourse side"),
    ],
  }),
  강동구청역: map("812", "gangdong-gu", [N.cheonho, N.mongchon], underground("B2", "B3"), {
    platformEv: 0.58,
    gate: 0.5,
    exitEv: 0.53,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터로 바로 올라가요.", "Lift from the B3 platform to B2, then straight from B2 up to the street."),
      toilet("B2 천호 방면", "B2, Cheonho side"),
    ],
  }),
  몽촌토성역: map("813", "mongchontoseong", [N.gangdongGu, N.jamsil], underground("B2", "B3"), {
    platformEv: 0.51,
    gate: 0.45,
    exitEv: 0.31,
    exit: exitNo("4"),
    notes: [
      note("⚠️", "엘리베이터를 갈아타요: B3 → B2 → B1 → 지상(4번 출구 쪽).", "Change lifts: B3 → B2 → B1 → street (Exit 4 side)."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  잠실역: map("814", "jamsil", [N.mongchon, N.seokchon], underground("B2", "B3"), {
    platformEv: 0.3,
    gate: 0.5,
    exitEv: 0.2,
    exit: exitNo("9"),
    notes: [
      note("🛗", "몽촌토성 방면 엘리베이터로 승강장(B3)에서 B1까지 올라간 뒤, 9번 출구 쪽 지상 엘리베이터를 이용하세요.", "The lift at the Mongchontoseong end goes from B3 to B1; then use the street lift by Exit 9."),
      note(
        "🔁",
        "2호선: B3 승강장 석촌 방면 '갈아타는 곳' → 2호선 대합실 (1~8번 출구는 2호선 대합실)",
        "Line 2: transfer point at the Seokchon end of B3 → Line 2 concourse (Exits 1–8 via Line 2)",
      ),
      toilet("B1 몽촌토성 방면", "B1, Mongchontoseong side"),
    ],
  }),
  석촌역: map("815", "seokchon", [N.jamsil, N.songpa], UNDER, {
    platformEv: 0.52,
    gate: 0.45,
    exitEv: 0.74,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 송파 방면 1·2·7·8번 출구 쪽에 있어요.", "The street lift is toward Songpa, by Exits 1, 2, 7, 8."),
      note("🔁", "9호선: B2 승강장 송파 방면 '갈아타는 곳' → 9호선 (3~6번 출구는 9호선 대합실)", "Line 9: transfer point at the Songpa end of B2 → Line 9 (Exits 3–6 via Line 9)"),
      toilet("B1 송파 방면", "B1, Songpa side"),
    ],
  }),
  송파역: map("816", "songpa", [N.seokchon, N.garak], UNDER, {
    platformEv: 0.56,
    gate: 0.55,
    exitEv: 0.29,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 석촌 방면 1·2번 출구 사이와 3·4번 출구 사이에 있어요.", "Street lifts are toward Seokchon, between Exits 1·2 and between Exits 3·4."),
      toilet("B1 석촌 방면", "B1, Seokchon side"),
    ],
  }),
  가락시장역: map("817", "garak", [N.songpa, N.munjeong], UNDER, {
    platformEv: 0.47,
    gate: 0.55,
    exitEv: 0.79,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 문정 방면 4번 출구 쪽에 있어요.", "The street lift is by Exit 4 (Munjeong side)."),
      note(
        "🔁",
        "3호선: B2 승강장 문정 방면 '갈아타는 곳' → 3호선 (B3·B4) (7·8번 출구는 3호선 대합실)",
        "Line 3: transfer point at the Munjeong end of B2 → Line 3 (B3/B4) (Exits 7·8 via Line 3)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  문정역: map("818", "munjeong", [N.garak, N.jangji], UNDER, {
    platformEv: 0.47,
    gate: 0.4,
    exitEv: 0.28,
    exit: exitNo("2"),
    notes: [
      note("🛗", "지상 엘리베이터는 2번 출구 쪽과 가락시장 방면 4번 출구 쪽에 있어요.", "Street lifts are by Exit 2 and by Exit 4 (Garak Market side)."),
      toilet("B1 가락시장 방면", "B1, Garak Market side"),
    ],
  }),
  장지역: map("819", "jangji", [N.munjeong, N.bokjeong], UNDER, {
    platformEv: 0.47,
    gate: 0.45,
    exitEv: 0.63,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터 2대가 복정 방면 3·4번 출구 쪽에 있어요.", "Two street lifts are by Exits 3·4 (Bokjeong side)."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  복정역: map("820", "bokjeong", [N.jangji, N.namwirye], UNDER, {
    platformEv: 0.51,
    gate: 0.5,
    exitEv: 0.5,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "안내도에는 대합실(B1)에서 지상으로 가는 엘리베이터가 보이지 않아요. 고객안전실(B1)에 문의하세요.",
        "The map shows no lift from the B1 concourse to the street. Ask the B1 customer safety office.",
      ),
      note(
        "🔁",
        "수인분당선: B2 승강장 장지 방면 '갈아타는 곳' → 수인분당선 승강장(B3). 가운데 엘리베이터도 B3까지 이어져요.",
        "Suin–Bundang: transfer point at the Jangji end of B2 → Suin–Bundang platform (B3); the mid-platform lift also reaches B3.",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  남위례역: map(
    "821",
    "namwirye",
    [N.bokjeong, N.sanseong],
    {
      levels: [
        { floor: "3F", kind: "concourse" },
        { floor: "2F", kind: "platform" },
        STREET,
      ],
      exitLevel: 2,
      gateLevel: 0,
      platformLevel: 1,
    },
    {
      platformEv: 0.53,
      gate: 0.3,
      exitEv: 0.05,
      exit: exitNo("5"),
      notes: [
        note("ℹ️", "지상 2층 승강장 위(3F)에 대합실이 있는 고가역이에요.", "An elevated station: the platform is on 2F with the concourse above it on 3F."),
        note("🛗", "승강장(2F) → 3F 대합실 → 복정 방면 엘리베이터로 1층(5번 출구 쪽)까지 내려가요.", "Lift from the 2F platform up to the 3F concourse, then the Bokjeong-end lift down to 1F (Exit 5 side)."),
        toilet("2F 대합실 복정 방면", "2F concourse, Bokjeong side"),
      ],
    },
  ),
  산성역: map("822", "sanseong", [N.namhansanseong, N.namwirye], underground("B1", "B3"), {
    platformEv: 0.33,
    gate: 0.6,
    exitEv: 0.67,
    exit: exitNo("3"),
    notes: [
      note(
        "⚠️",
        "엘리베이터를 갈아타요: B3 → (경사형 엘리베이터) B2 → B1 → 지상(3번 출구 쪽).",
        "Change lifts: B3 → (inclined lift) B2 → B1 → street (Exit 3 side).",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  남한산성입구역: map("823", "namhansanseong", [N.sanseong, N.dandae], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.52,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터로 바로 올라가요.", "Lift from the B3 platform to B2, then straight from B2 up to the street."),
      toilet("B2 산성 방면", "B2, Sanseong side"),
    ],
  }),
  단대오거리역: map("824", "dandae", [N.namhansanseong, N.sinheung], underground("B2", "B3"), {
    platformEv: 0.32,
    gate: 0.5,
    exitEv: 0.71,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장 엘리베이터는 남한산성입구 방면에 있고, 지상 엘리베이터는 신흥 방면 3번 출구 쪽이에요.", "The platform lift is toward Namhansanseong; the street lift is toward Sinheung, by Exit 3."),
      toilet("B1 남한산성입구 방면", "B1, Namhansanseong side"),
    ],
  }),
  신흥역: map("825", "sinheung", [N.dandae, N.sujin], UNDER, {
    platformEv: 0.48,
    gate: 0.5,
    exitEv: 0.82,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 수진 방면 4번 출구 쪽에 있고, 2번 출구에는 경사형 엘리베이터가 있어요.", "The street lift is by Exit 4 (Sujin side), and Exit 2 has an inclined lift."),
      toilet("B1 수진 방면", "B1, Sujin side"),
    ],
  }),
  수진역: map("826", "sujin", [N.sinheung, N.moran], UNDER, {
    platformEv: 0.55,
    gate: 0.55,
    exitEv: 0.23,
    exit: exitNo("3"),
    notes: [
      note("🛗", "승강장(B2) 가운데 엘리베이터로 B1에 올라간 뒤, 신흥 방면 3번 출구 쪽 지상 엘리베이터를 이용하세요.", "Take the mid-platform lift to B1, then the street lift by Exit 3 (Sinheung side)."),
      toilet("B1 신흥 방면", "B1, Sinheung side"),
    ],
  }),
  모란역: map("827", "moran", [N.sujin, N.moranEnd], underground("B2", "B3"), {
    platformEv: 0.57,
    gate: 0.5,
    exitEv: 0.54,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) 가운데 엘리베이터로 대합실과 지상까지 이어져요.", "A mid-platform lift links the B3 platform, the concourse and the street."),
      note(
        "🔁",
        "수인분당선: B3 승강장 종착 방면 '갈아타는 곳' → B1 수인분당선 대합실 (1~8·12번 출구는 수인분당선 대합실)",
        "Suin–Bundang: transfer point at the terminal end of B3 → B1 Suin–Bundang concourse (Exits 1–8, 12 via Suin–Bundang)",
      ),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
};
