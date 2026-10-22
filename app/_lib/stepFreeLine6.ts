import type { Localized } from "./stations";
import {
  CONCOURSE_EXITS_LABEL,
  exitNo,
  LINE6,
  note,
  stationMap,
  STREET_LIFT_EXIT,
  toilet,
  underground,
  type StepFreeLayout,
  type StepFreeMap,
  type StepFreeRoute,
} from "./stepFreeKit";

const N = {
  eungam: { ko: "응암", en: "Eungam", zh: "鹰岩", ja: "鷹岩" },
  yeokchon: { ko: "역촌", en: "Yeokchon", zh: "驿村", ja: "駅村" },
  bulgwang: { ko: "불광", en: "Bulgwang", zh: "佛光", ja: "仏光" },
  dokbawi: { ko: "독바위", en: "Dokbawi", zh: "瓮岩", ja: "トッパウィ" },
  yeonsinnae: { ko: "연신내", en: "Yeonsinnae", zh: "延新川", ja: "延新川" },
  gusan: { ko: "구산", en: "Gusan", zh: "龟山", ja: "亀山" },
  saejeol: { ko: "새절", en: "Saejeol", zh: "赛折", ja: "セジョル" },
  jeungsan: { ko: "증산", en: "Jeungsan", zh: "缯山", ja: "繒山" },
  dmc: { ko: "디지털미디어시티", en: "Digital Media City", zh: "数码媒体城", ja: "デジタルメディアシティ" },
  worldcup: { ko: "월드컵경기장", en: "World Cup Stadium", zh: "世界杯竞技场", ja: "ワールドカップ競技場" },
  mapoGu: { ko: "마포구청", en: "Mapo-gu Office", zh: "麻浦区厅", ja: "麻浦区庁" },
  mangwon: { ko: "망원", en: "Mangwon", zh: "望远", ja: "望遠" },
  hapjeong: { ko: "합정", en: "Hapjeong", zh: "合井", ja: "合井" },
  sangsu: { ko: "상수", en: "Sangsu", zh: "上水", ja: "上水" },
  gwangheungchang: { ko: "광흥창", en: "Gwangheungchang", zh: "广兴仓", ja: "広興倉" },
  daeheung: { ko: "대흥", en: "Daeheung", zh: "大兴", ja: "大興" },
  gongdeok: { ko: "공덕", en: "Gongdeok", zh: "孔德", ja: "孔徳" },
  hyochang: { ko: "효창공원앞", en: "Hyochang Park", zh: "孝昌公园前", ja: "孝昌公園前" },
  samgakji: { ko: "삼각지", en: "Samgakji", zh: "三角地", ja: "三角地" },
  noksapyeong: { ko: "녹사평", en: "Noksapyeong", zh: "绿莎坪", ja: "緑莎坪" },
  itaewon: { ko: "이태원", en: "Itaewon", zh: "梨泰院", ja: "梨泰院" },
  hangangjin: { ko: "한강진", en: "Hangangjin", zh: "汉江镇", ja: "漢江鎮" },
  beotigogae: { ko: "버티고개", en: "Beotigogae", zh: "伯提岭", ja: "ボティゴゲ" },
  yaksu: { ko: "약수", en: "Yaksu", zh: "药水", ja: "薬水" },
  cheonggu: { ko: "청구", en: "Cheonggu", zh: "青丘", ja: "青丘" },
  sindang: { ko: "신당", en: "Sindang", zh: "新堂", ja: "新堂" },
  dongmyo: { ko: "동묘앞", en: "Dongmyo", zh: "东庙前", ja: "東廟前" },
  changsin: { ko: "창신", en: "Changsin", zh: "昌信", ja: "昌信" },
  bomun: { ko: "보문", en: "Bomun", zh: "普门", ja: "普門" },
  anam: { ko: "안암", en: "Anam", zh: "安岩", ja: "安岩" },
  koreaUniv: { ko: "고려대", en: "Korea Univ.", zh: "高丽大", ja: "高麗大" },
  wolgok: { ko: "월곡", en: "Wolgok", zh: "月谷", ja: "月谷" },
  sangwolgok: { ko: "상월곡", en: "Sangwolgok", zh: "上月谷", ja: "上月谷" },
  dolgoji: { ko: "돌곶이", en: "Dolgoji", zh: "石串", ja: "トルゴジ" },
  seokgye: { ko: "석계", en: "Seokgye", zh: "石溪", ja: "石渓" },
  taereung: { ko: "태릉입구", en: "Taereung", zh: "泰陵入口", ja: "泰陵入口" },
  hwarangdae: { ko: "화랑대", en: "Hwarangdae", zh: "花郎台", ja: "花郎台" },
  bonghwasan: { ko: "봉화산", en: "Bonghwasan", zh: "烽火山", ja: "烽火山" },
  sinnae: { ko: "신내", en: "Sinnae", zh: "新内", ja: "新内" },
  sinnaeEnd: { ko: "신내(종착)", en: "Sinnae (terminal)", zh: "新内（终点）", ja: "新内（終点）" },
} satisfies Record<string, Localized>;

const UNDER = underground();

function map(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE6, "line6", code, slug, ends, layout, route);
}

const LOOP = note(
  "🔁",
  "응암순환(응암 → 역촌 → 불광 → 독바위 → 연신내 → 구산 → 응암) 구간은 열차가 한 방향으로만 돌아요.",
  "On the Eungam loop (Eungam → Yeokchon → Bulgwang → Dokbawi → Yeonsinnae → Gusan → Eungam) trains run one way only.",
);

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE6_MAPS: Record<string, StepFreeMap> = {
  응암역: map("610", "eungam", [N.saejeol, N.yeokchon], UNDER, {
    platformEv: 0.49,
    gate: 0.57,
    exitEv: 0.73,
    exit: STREET_LIFT_EXIT,
    notes: [
      LOOP,
      note("🛗", "지상 엘리베이터는 1·4번과 2·3번 출구 사이에 있어요.", "The street lift is between Exits 1·4 and 2·3."),
      toilet("B1 역촌 방면", "B1, Yeokchon side"),
    ],
  }),
  역촌역: map("611", "yeokchon", [N.bulgwang, N.eungam], underground("B1", "B4"), {
    platformEv: 0.41,
    gate: 0.46,
    exitEv: 0.38,
    exit: exitNo("1"),
    notes: [
      LOOP,
      note("🛗", "승강장(B4)에서 B1 대합실까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B4 platform to the B1 concourse."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  불광역: map("612", "bulgwang", [N.yeokchon, N.dokbawi], underground("B2", "B4"), {
    platformEv: 0.55,
    gate: 0.55,
    exitEv: 0.59,
    exit: STREET_LIFT_EXIT,
    notes: [
      LOOP,
      note("🛗", "승강장(B4) → B2 대합실 → 지상(8·9번 출구 쪽) 엘리베이터가 나란히 있어요.", "Lifts side by side: B4 platform → B2 concourse → street (Exits 8·9 side)."),
      note(
        "🔁",
        "3호선: B4 승강장 '녹번 방면'·'연신내 방면' 갈아타는 곳 → B2 → 3호선 대합실 (1~5번 출구는 3호선 대합실)",
        "Line 3: B4 transfer points 'to Nokbeon' / 'to Yeonsinnae' → B2 → Line 3 concourse (Exits 1–5 via Line 3)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  독바위역: map("613", "dokbawi", [N.bulgwang, N.yeonsinnae], underground("B1", "B6"), {
    platformEv: 0.56,
    gate: 0.52,
    exitEv: 0.59,
    exit: exitNo("1"),
    notes: [
      LOOP,
      note("ℹ️", "지하 6층 깊은 역이에요. 엘리베이터로 승강장(B6)에서 B1까지 바로 올라가고, 출구는 1번 하나예요.", "A deep (B6) station: the lift goes straight to B1, and there is only one exit (Exit 1)."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  연신내역: map("614", "yeonsinnae", [N.gusan, N.dokbawi], underground("B1", "B5"), {
    platformEv: 0.59,
    gate: 0.7,
    exitEv: 0.7,
    exit: STREET_LIFT_EXIT,
    notes: [
      LOOP,
      note("🛗", "승강장(B5)에서 B1 대합실까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B5 platform to the B1 concourse."),
      note(
        "🔁",
        "3호선: B5 승강장 '갈아타는 곳' → B3 → B1 '갈아타는 곳' (1~7번 출구는 3호선 대합실)",
        "Line 3: B5 transfer point → B3 → B1 transfer point (Exits 1–7 via Line 3)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  구산역: map("615", "gusan", [N.eungam, N.yeonsinnae], underground("B1", "B4"), {
    platformEv: 0.48,
    gate: 0.54,
    exitEv: 0.47,
    exit: exitNo("1·4"),
    notes: [
      LOOP,
      note("🛗", "엘리베이터 하나로 승강장(B4) ↔ 대합실(B1) ↔ 지상(1·4번 출구 쪽)이 이어져요.", "One lift links the B4 platform, B1 concourse and the street (Exits 1·4 side)."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  새절역: map("616", "saejeol", [N.eungam, N.jeungsan], UNDER, {
    platformEv: 0.5,
    gate: 0.32,
    exitEv: 0.2,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 응암 방면 1·4번과 2·3번 출구 사이에 있어요.", "The street lift is between Exits 1·4 and 2·3, toward Eungam."),
      toilet("B1 응암 방면", "B1, Eungam side"),
    ],
  }),
  증산역: map("617", "jeungsan", [N.dmc, N.saejeol], UNDER, {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.37,
    exit: STREET_LIFT_EXIT,
    notes: [toilet("B1 새절 방면", "B1, Saejeol side")],
  }),
  디지털미디어시티역: map("618", "dmc", [N.jeungsan, N.worldcup], UNDER, {
    platformEv: 0.2,
    gate: 0.25,
    exitEv: 0.2,
    exit: exitNo("1·5"),
    notes: [
      note("🛗", "증산 방면 엘리베이터로 승강장(B2)에서 1F 대합실(1·5번 출구)까지 바로 올라가요.", "The lift at the Jeungsan end goes straight from the B2 platform up to the 1F concourse (Exits 1·5)."),
      note("🔁", "경의중앙선: B2 승강장 가운데 '갈아타는 곳' → B1 (6번 출구는 경의중앙선 대합실)", "Gyeongui–Jungang: mid-platform transfer point on B2 → B1 (Exit 6 via Gyeongui–Jungang)"),
      note(
        "🔁",
        "공항철도: B2 승강장 월드컵경기장 방면 '갈아타는 곳' (7·8·9번 출구는 공항철도 대합실)",
        "AREX: transfer point at the World Cup Stadium end of B2 (Exits 7–9 via AREX)",
      ),
      toilet("B1 증산 방면", "B1, Jeungsan side"),
    ],
  }),
  월드컵경기장역: map("619", "worldcup", [N.mapoGu, N.dmc], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.62,
    exitEv: 0.66,
    exit: exitNo("2"),
    notes: [
      note("🛗", "지상 엘리베이터는 2번 출구(경기장 쪽) 옆에 있어요.", "The street lift is next to Exit 2 (stadium side)."),
      toilet("B2 양쪽", "both sides of B2"),
    ],
  }),
  마포구청역: map("620", "mapo-gu", [N.mangwon, N.worldcup], underground("B2", "B3"), {
    platformEv: 0.69,
    gate: 0.77,
    exitEv: 0.73,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터는 월드컵경기장 방면 끝에 모여 있어요.", "The lifts are grouped at the World Cup Stadium end."),
      toilet("B1 망원 방면 · B2 월드컵경기장 방면", "B1 Mangwon side; B2 World Cup Stadium side"),
    ],
  }),
  망원역: map("621", "mangwon", [N.hapjeong, N.mapoGu], UNDER, {
    platformEv: 0.5,
    gate: 0.5,
    exitEv: 0.5,
    exit: exitNo("2"),
    notes: [
      note("🛗", "엘리베이터로 승강장(B2) ↔ 대합실(B1) ↔ 지상(2번 출구 쪽)이 이어져요.", "Lifts link the B2 platform, B1 concourse and the street (Exit 2 side)."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  합정역: map("622", "hapjeong", [N.mangwon, N.sangsu], underground("B1", "B4"), {
    platformEv: 0.52,
    gate: 0.5,
    exitEv: 0.41,
    exit: exitNo("10"),
    notes: [
      note("🛗", "승강장(B4)에서 B1 대합실까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B4 platform to the B1 concourse."),
      note(
        "🔁",
        "2호선: B4 승강장 양쪽 '갈아타는 곳' → B3 → 당산 방면 / 홍대입구 방면 (1~4번 출구는 2호선 대합실)",
        "Line 2: transfer points at both ends of B4 → B3 → to Dangsan / to Hongik Univ. (Exits 1–4 via Line 2)",
      ),
      toilet("B1 망원 방면", "B1, Mangwon side"),
    ],
  }),
  상수역: map("623", "sangsu", [N.hapjeong, N.gwangheungchang], underground("B2", "B3"), {
    platformEv: 0.53,
    gate: 0.66,
    exitEv: 0.95,
    exit: exitNo("3"),
    notes: [
      note(
        "⚠️",
        "엘리베이터가 이어지지 않아요: 승강장(B3) → B2 대합실 → 광흥창 방면으로 이동 → B1 → 지상(3번 출구 쪽) 엘리베이터를 차례로 타요.",
        "Lifts aren't stacked: B3 platform → B2 concourse → walk toward Gwangheungchang → B1 → street lift near Exit 3.",
      ),
      toilet("B2 광흥창 방면", "B2, Gwangheungchang side"),
    ],
  }),
  광흥창역: map("624", "gwangheungchang", [N.sangsu, N.daeheung], underground("B2", "B3"), {
    platformEv: 0.85,
    gate: 0.88,
    exitEv: 0.85,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "대흥 방면 엘리베이터는 승강장(B3)에서 지상(3·4번 출구 사이)까지 한 번에 이어져요.", "At the Daeheung end one lift runs straight from the B3 platform to the street (between Exits 3 and 4)."),
      note("🛗", "상수 방면 끝에도 엘리베이터가 있어요: B3 → B2 → 지상(1번 출구 쪽).", "There are also lifts at the Sangsu end: B3 → B2 → street (Exit 1 side)."),
      toilet("B2 상수 방면", "B2, Sangsu side"),
    ],
  }),
  대흥역: map("625", "daeheung", [N.gwangheungchang, N.gongdeok], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.48,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2 대합실, 그리고 B2에서 지상까지 엘리베이터로 바로 올라가요.", "Lift from the B3 platform to the B2 concourse, then a lift from B2 straight to the street."),
      toilet("B1 광흥창 방면", "B1, Gwangheungchang side"),
    ],
  }),
  공덕역: map("626", "gongdeok", [N.hyochang, N.daeheung], UNDER, {
    platformEv: 0.5,
    gate: 0.6,
    exitEv: 0.85,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "6호선 쪽에는 지상 엘리베이터가 없어요. B1 대합실에서 대흥 방면 5호선 대합실(1~5·8번 출구)로 가서 지상 엘리베이터를 이용하세요.",
        "There is no street lift on the Line 6 side. From B1 walk toward Daeheung into the Line 5 concourse (Exits 1–5, 8) and use its street lift.",
      ),
      note("🔁", "5호선: B2 승강장 대흥 방면 '갈아타는 곳' → 환승통로", "Line 5: transfer point at the Daeheung end of B2 → transfer passage"),
      note(
        "🔁",
        "경의중앙선·공항철도: B2 승강장 '갈아타는 곳' → 경의중앙선 대합실 (9·10번 출구)",
        "Gyeongui–Jungang / AREX: B2 transfer point → Gyeongui–Jungang concourse (Exits 9·10)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  효창공원앞역: map("627", "hyochang", [N.gongdeok, N.samgakji], underground("B2", "B3"), {
    platformEv: 0.52,
    gate: 0.6,
    exitEv: 0.67,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 up to the street."),
      note(
        "🔁",
        "경의중앙선: B3 승강장 '갈아타는 곳' → B2 '갈아타는 곳' (4·5번 출구는 경의중앙선 대합실)",
        "Gyeongui–Jungang: B3 transfer point → B2 transfer point (Exits 4·5 via Gyeongui–Jungang)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  삼각지역: map("628", "samgakji", [N.hyochang, N.noksapyeong], underground("B3", "B4"), {
    platformEv: 0.83,
    gate: 0.72,
    exitEv: 0.78,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "녹사평 방면: 승강장(B4) → B3 → 지상(11~14번 출구 쪽) 엘리베이터", "Noksapyeong end: B4 platform → B3 → street lift (Exits 11–14 side)"),
      note("🛗", "효창공원 방면에도 B4 → B3 → 지상(7~10번 출구 쪽) 엘리베이터가 있어요.", "The Hyochang end also has lifts: B4 → B3 → street (Exits 7–10 side)."),
      note(
        "🔁",
        "4호선: B4 승강장 → B3 '신용산 방면' / '숙대입구 방면' 갈아타는 곳 (1~6번 출구는 4호선 대합실)",
        "Line 4: B4 platform → B3 transfer points 'to Sinyongsan' / 'to Sookmyung Women's Univ.' (Exits 1–6 via Line 4)",
      ),
      toilet("B1 효창공원 방면", "B1, Hyochang Park side"),
    ],
  }),
  녹사평역: map("629", "noksapyeong", [N.samgakji, N.itaewon], underground("B4", "B5"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.57,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "ℹ️",
        "지하 5층 깊은 역이에요. 엘리베이터를 갈아타며 B5 → B4 → B2 → 지상 순서로 올라가요.",
        "A deep (B5) station: change lifts B5 → B4 → B2 → street.",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  이태원역: map("630", "itaewon", [N.noksapyeong, N.hangangjin], underground("B1", "B5"), {
    platformEv: 0.33,
    gate: 0.38,
    exitEv: 0.25,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B5)에서 B1까지 엘리베이터로 바로 올라가고, 지상 엘리베이터는 1~4번 출구 쪽에 있어요.", "The lift goes straight from B5 to B1; the street lift is by Exits 1–4."),
      toilet("B1 녹사평 방면", "B1, Noksapyeong side"),
    ],
  }),
  한강진역: map("631", "hangangjin", [N.beotigogae, N.itaewon], underground("B1", "B4"), {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.34,
    exit: exitNo("1"),
    notes: [
      note("🛗", "승강장(B4)에서 B1 대합실까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B4 platform to the B1 concourse."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  버티고개역: map("632", "beotigogae", [N.yaksu, N.hangangjin], underground("B1", "B4"), {
    platformEv: 0.55,
    gate: 0.4,
    exitEv: 0.19,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "엘리베이터를 여러 번 갈아타요: B4 → B3 → (경사형 엘리베이터) B2 → B1 → 지상(1·2번 출구 쪽).",
        "Several lift changes: B4 → B3 → (inclined lift) B2 → B1 → street (Exits 1·2 side).",
      ),
      toilet("B1 약수 방면", "B1, Yaksu side"),
    ],
  }),
  약수역: map("633", "yaksu", [N.cheonggu, N.beotigogae], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.08,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "지상 엘리베이터는 청구 방면 끝 3호선 대합실 쪽에 있어요. B2 → B1으로 올라간 뒤 청구 방면으로 이동하세요.",
        "The street lift is at the Cheonggu end by the Line 3 concourse: go up B2 → B1, then walk toward Cheonggu.",
      ),
      note("🔁", "3호선: B3 승강장 청구 방면 '갈아타는 곳' → B2 → 3호선 승강장", "Line 3: transfer point at the Cheonggu end of B3 → B2 → Line 3 platform"),
      toilet("B1 버티고개 방면", "B1, Beotigogae side"),
    ],
  }),
  청구역: map("634", "cheonggu", [N.sindang, N.yaksu], UNDER, {
    platformEv: 0.62,
    gate: 0.62,
    exitEv: 0.51,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터가 1번 출구 쪽과 2·3번 출구 사이에 하나씩 있어요.", "There are street lifts by Exit 1 and between Exits 2 and 3."),
      note("🔁", "5호선: B2 승강장 가운데 '갈아타는 곳' → 환승통로 → 5호선 (B3·B4)", "Line 5: mid-platform transfer point on B2 → transfer passage → Line 5 (B3/B4)"),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  신당역: map("635", "sindang", [N.cheonggu, N.dongmyo], underground("B1", "B3"), {
    platformEv: 0.54,
    gate: 0.55,
    exitEv: 0.71,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3)에서 B1까지 엘리베이터로 바로 올라가고, 지상 엘리베이터는 10·11번 출구 쪽에 있어요.", "The lift goes straight from B3 to B1; the street lift is by Exits 10·11."),
      note(
        "🔁",
        "2호선: B3 승강장 청구 방면 '갈아타는 곳' → B2 '갈아타는 곳' (1~4번 출구는 2호선 대합실)",
        "Line 2: transfer point at the Cheonggu end of B3 → B2 transfer point (Exits 1–4 via Line 2)",
      ),
      toilet("B1 청구 방면", "B1, Cheonggu side"),
    ],
  }),
  동묘앞역: map("636", "dongmyo", [N.sindang, N.changsin], underground("B2", "B3"), {
    platformEv: 0.82,
    gate: 0.8,
    exitEv: 0.9,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "6호선 쪽에는 지상 엘리베이터가 없어요. 창신 방면 엘리베이터로 B2에 올라가 1호선 대합실(1~3번 출구 쪽) 엘리베이터를 이용하세요.",
        "There is no street lift on the Line 6 side. Take the Changsin-end lift to B2, then use the lifts in the Line 1 concourse (Exits 1–3).",
      ),
      note("🔁", "1호선: B3 승강장 창신 방면 '갈아타는 곳' → B2 → 1호선 (2·3번 출구는 1호선 대합실)", "Line 1: transfer point at the Changsin end of B3 → B2 → Line 1 (Exits 2·3 via Line 1)"),
      note("🛗", "신당 방면 끝에도 B3 → B2 엘리베이터가 있어요.", "There is also a B3 → B2 lift at the Sindang end."),
      toilet("B1 창신 방면", "B1, Changsin side"),
    ],
  }),
  창신역: map("637", "changsin", [N.bomun, N.dongmyo], underground("B1", "B4"), {
    platformEv: 0.67,
    gate: 0.7,
    exitEv: 0.63,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B4)에서 B1까지 엘리베이터로 바로 올라가요. 지상 엘리베이터는 2·3번 출구 쪽과 1·4번 출구 쪽에 있어요.", "The lift goes straight from B4 to B1; street lifts are by Exits 2·3 and Exits 1·4."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  보문역: map("638", "bomun", [N.anam, N.changsin], underground("B2", "B3"), {
    platformEv: 0.41,
    gate: 0.55,
    exitEv: 0.71,
    exit: exitNo("7"),
    notes: [
      note("🛗", "승강장(B3) → B2 대합실, 그리고 B2에서 지상(7번 출구 쪽)까지 엘리베이터로 올라가요.", "Lift from the B3 platform to the B2 concourse, then from B2 up to the street (Exit 7 side)."),
      note("🔁", "우이신설선: B3 승강장 '갈아타는 곳' → B2 '갈아타는 곳' → 우이신설선 승강장(B4)", "Ui–Sinseol Line: B3 transfer point → B2 transfer point → Ui–Sinseol platform (B4)"),
      toilet("B2 창신 방면", "B2, Changsin side"),
    ],
  }),
  안암역: map("639", "anam", [N.koreaUniv, N.bomun], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.78,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 출구 계단과 떨어진 보문 방면 끝에 따로 있어요.", "The street lift stands on its own at the Bomun end, away from the exit stairs."),
      toilet("B1 · B2 대합실", "B1 and B2 concourses"),
    ],
  }),
  고려대역: map("640", "korea-univ", [N.wolgok, N.anam], underground("B1", "B4"), {
    platformEv: 0.29,
    gate: 0.4,
    exitEv: 0.61,
    exit: exitNo("2"),
    notes: [
      note("🛗", "월곡 방면 엘리베이터로 승강장(B4)에서 B1까지 바로 올라가요. 지상 엘리베이터는 2번 출구 쪽과 1·6번 출구 쪽에 있어요.", "The Wolgok-end lift goes straight from B4 to B1; street lifts are by Exit 2 and Exits 1·6."),
      toilet("B1 월곡 방면", "B1, Wolgok side"),
    ],
  }),
  월곡역: map("641", "wolgok", [N.sangwolgok, N.koreaUniv], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.37,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상(1·5번 출구 쪽)까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 to the street (Exits 1·5 side)."),
      toilet("B1 상월곡 방면", "B1, Sangwolgok side"),
    ],
  }),
  상월곡역: map("642", "sangwolgok", [N.wolgok, N.dolgoji], underground("B2", "B3"), {
    platformEv: 0.39,
    gate: 0.35,
    exitEv: 0.23,
    exit: exitNo("1·4"),
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상(1·4번 출구 쪽)까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 to the street (Exits 1·4 side)."),
      toilet("B2 월곡 방면", "B2, Wolgok side"),
    ],
  }),
  돌곶이역: map("643", "dolgoji", [N.seokgye, N.sangwolgok], UNDER, {
    platformEv: 0.59,
    gate: 0.55,
    exitEv: 0.28,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 석계 방면 2~5번 출구 쪽에 있어요.", "The street lift is toward Seokgye, by Exits 2–5."),
      toilet("B1 석계 방면", "B1, Seokgye side"),
    ],
  }),
  석계역: map("644", "seokgye", [N.taereung, N.dolgoji], underground("B2", "B3"), {
    platformEv: 0.46,
    gate: 0.3,
    exitEv: 0.19,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터가 태릉입구 방면(2·3·4번 출구 쪽)과 돌곶이 방면(1·6번 출구 쪽)에 있어요.", "Street lifts are at the Taereung end (Exits 2–4) and the Dolgoji end (Exits 1·6)."),
      note(
        "🔁",
        "1호선: B3 승강장 태릉입구 방면 '갈아타는 곳' → B2 환승통로 → B1 → 1호선 승강장(지상 2층)",
        "Line 1: transfer point at the Taereung end of B3 → B2 transfer passage → B1 → Line 1 platform (2F above ground)",
      ),
      toilet("B2 대합실 가운데", "middle of the B2 concourse"),
    ],
  }),
  태릉입구역: map("645", "taereung", [N.hwarangdae, N.seokgye], UNDER, {
    platformEv: 0.5,
    gate: 0.5,
    exitEv: 0.41,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 1번과 8번 출구 사이에 있어요.", "The street lift is between Exits 1 and 8."),
      note(
        "🔁",
        "7호선: B2 승강장 화랑대 방면 '갈아타는 곳' → 7호선 (2~5번 출구는 7호선 대합실)",
        "Line 7: transfer point at the Hwarangdae end of B2 → Line 7 (Exits 2–5 via Line 7)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  화랑대역: map("646", "hwarangdae", [N.bonghwasan, N.taereung], UNDER, {
    platformEv: 0.57,
    gate: 0.6,
    exitEv: 0.45,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터가 3번 출구 쪽과 5·6·7번 출구 쪽(봉화산 방면)에 있어요.", "Street lifts are by Exit 3 and by Exits 5–7 (Bonghwasan side)."),
      toilet("B1 봉화산 방면", "B1, Bonghwasan side"),
    ],
  }),
  봉화산역: map("647", "bonghwasan", [N.hwarangdae, N.sinnae], UNDER, {
    platformEv: 0.67,
    gate: 0.65,
    exitEv: 0.8,
    exit: exitNo("2"),
    notes: [
      note("🛗", "지상 엘리베이터는 2번 출구 쪽과 4번 출구 쪽(화랑대 방면)에 있어요.", "Street lifts are by Exit 2 and by Exit 4 (Hwarangdae side)."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  신내역: map(
    "648",
    "sinnae",
    [N.sinnaeEnd, N.bonghwasan],
    {
      levels: [
        { floor: "2F", kind: "concourse", label: CONCOURSE_EXITS_LABEL },
        { floor: "1F", kind: "platform" },
      ],
      exitLevel: 0,
      gateLevel: 0,
      platformLevel: 1,
    },
    {
      platformEv: 0.84,
      gate: 0.86,
      exitEv: 0.9,
      exit: STREET_LIFT_EXIT,
      notes: [
        note("ℹ️", "지상 1층 승강장의 종착역이에요. 대합실은 2층(경춘선 대합실)에 있어요.", "Terminal with a ground-level (1F) platform; the concourse is upstairs on 2F (Gyeongchun Line concourse)."),
        note("🛗", "2층 대합실에서 지상으로 내려가는 엘리베이터는 3·4번 출구 쪽에 있어요.", "Lifts from the 2F concourse down to the street are by Exits 3·4."),
        note("🔁", "경춘선: 1F 승강장 → 2F '갈아타는 곳' → 3F 경춘선 승강장", "Gyeongchun Line: 1F platform → 2F transfer point → 3F Gyeongchun platform"),
        toilet("2F 경춘선 대합실", "2F Gyeongchun concourse"),
      ],
    },
  ),
};
