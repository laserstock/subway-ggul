import type { Localized } from "./stations";
import {
  ELEVATED_2F,
  ELEVATED_3F,
  exitNo,
  LINE7,
  note,
  PASSAGE_LABEL,
  SAME_FLOOR_LABEL,
  stationMap,
  STREET_LIFT_EXIT,
  toilet,
  underground,
  type StepFreeLayout,
  type StepFreeMap,
  type StepFreeRoute,
} from "./stepFreeKit";

const N = {
  jangamEnd: { ko: "장암(종착)", en: "Jangam (terminal)", zh: "长岩（终点）", ja: "長岩（終点）" },
  jangam: { ko: "장암", en: "Jangam", zh: "长岩", ja: "長岩" },
  dobongsan: { ko: "도봉산", en: "Dobongsan", zh: "道峰山", ja: "道峰山" },
  suraksan: { ko: "수락산", en: "Suraksan", zh: "水落山", ja: "水落山" },
  madeul: { ko: "마들", en: "Madeul", zh: "马得", ja: "マドゥル" },
  nowon: { ko: "노원", en: "Nowon", zh: "芦原", ja: "蘆原" },
  junggye: { ko: "중계", en: "Junggye", zh: "中溪", ja: "中渓" },
  hagye: { ko: "하계", en: "Hagye", zh: "下溪", ja: "下渓" },
  gongneung: { ko: "공릉", en: "Gongneung", zh: "孔陵", ja: "孔陵" },
  taereung: { ko: "태릉입구", en: "Taereung", zh: "泰陵入口", ja: "泰陵入口" },
  meokgol: { ko: "먹골", en: "Meokgol", zh: "墨谷", ja: "モッコル" },
  junghwa: { ko: "중화", en: "Junghwa", zh: "中和", ja: "中和" },
  sangbong: { ko: "상봉", en: "Sangbong", zh: "上凤", ja: "上鳳" },
  myeonmok: { ko: "면목", en: "Myeonmok", zh: "面牧", ja: "面牧" },
  sagajeong: { ko: "사가정", en: "Sagajeong", zh: "四佳亭", ja: "四佳亭" },
  yongmasan: { ko: "용마산", en: "Yongmasan", zh: "龙马山", ja: "龍馬山" },
  junggok: { ko: "중곡", en: "Junggok", zh: "中谷", ja: "中谷" },
  gunja: { ko: "군자", en: "Gunja", zh: "君子", ja: "君子" },
  childrensPark: { ko: "어린이대공원", en: "Children's Grand Park", zh: "儿童大公园", ja: "子供大公園" },
  konkuk: { ko: "건대입구", en: "Konkuk Univ.", zh: "建大入口", ja: "建大入口" },
  jayang: { ko: "자양", en: "Jayang", zh: "紫阳", ja: "紫陽" },
  cheongdam: { ko: "청담", en: "Cheongdam", zh: "清潭", ja: "清潭" },
  gangnamGu: { ko: "강남구청", en: "Gangnam-gu Office", zh: "江南区厅", ja: "江南区庁" },
  hakdong: { ko: "학동", en: "Hakdong", zh: "鹤洞", ja: "鶴洞" },
  nonhyeon: { ko: "논현", en: "Nonhyeon", zh: "论岘", ja: "論峴" },
  banpo: { ko: "반포", en: "Banpo", zh: "盘浦", ja: "盤浦" },
  expressBus: { ko: "고속터미널", en: "Express Bus Terminal", zh: "高速巴士客运站", ja: "高速ターミナル" },
  naebang: { ko: "내방", en: "Naebang", zh: "内方", ja: "内方" },
  isu: { ko: "이수", en: "Isu", zh: "梨水", ja: "梨水" },
  namseong: { ko: "남성", en: "Namseong", zh: "南城", ja: "南城" },
  soongsil: { ko: "숭실대입구", en: "Soongsil Univ.", zh: "崇实大入口", ja: "崇実大入口" },
  sangdo: { ko: "상도", en: "Sangdo", zh: "上道", ja: "上道" },
  jangseungbaegi: { ko: "장승배기", en: "Jangseungbaegi", zh: "长丞排基", ja: "チャンスンベギ" },
  sindaebang: { ko: "신대방삼거리", en: "Sindaebang Samgeori", zh: "新大方三岔路", ja: "新大方三叉路" },
  boramae: { ko: "보라매", en: "Boramae", zh: "波拉美", ja: "ボラメ" },
  sinpung: { ko: "신풍", en: "Sinpung", zh: "新丰", ja: "新豊" },
  daerim: { ko: "대림", en: "Daerim", zh: "大林", ja: "大林" },
  namguro: { ko: "남구로", en: "Namguro", zh: "南九老", ja: "南九老" },
  gasan: { ko: "가산디지털단지", en: "Gasan Digital Complex", zh: "加山数码园区", ja: "加山デジタル団地" },
  cheolsan: { ko: "철산", en: "Cheolsan", zh: "铁山", ja: "鉄山" },
  gwangmyeong: { ko: "광명사거리", en: "Gwangmyeong Sageori", zh: "光明十字路口", ja: "光明四つ角" },
  cheonwang: { ko: "천왕", en: "Cheonwang", zh: "天旺", ja: "天旺" },
  onsu: { ko: "온수", en: "Onsu", zh: "温水", ja: "温水" },
  kkachiul: { ko: "까치울", en: "Kkachiul", zh: "喜鹊谷", ja: "カチウル" },
} satisfies Record<string, Localized>;

const UNDER = underground();

function map(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE7, "line7", code, slug, ends, layout, route);
}

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE7_MAPS: Record<string, StepFreeMap> = {
  장암역: map(
    "709",
    "jangam",
    [N.jangamEnd, N.dobongsan],
    {
      levels: [
        { floor: "2F", kind: "passage", label: PASSAGE_LABEL },
        { floor: "1F", kind: "platform", label: SAME_FLOOR_LABEL },
      ],
      exitLevel: 1,
      gateLevel: 1,
      platformLevel: 1,
    },
    {
      platformEv: 0.35,
      gate: 0.5,
      exitEv: 0.35,
      exit: exitNo("1"),
      notes: [
        note("ℹ️", "지상 1층 종착역이에요. 승강장과 대합실이 같은 층에 있어요.", "Ground-level terminal: the platform and concourse share one floor."),
        note("🛗", "1번 출구는 육교를 건너가요: 엘리베이터로 올라간 뒤 반대편 엘리베이터로 내려가세요.", "Exit 1 crosses a footbridge: ride one lift up, then the other lift down."),
        toilet("1F 대합실", "1F concourse"),
      ],
    },
  ),
  도봉산역: map("710", "dobongsan", [N.jangam, N.suraksan], ELEVATED_2F, {
    platformEv: 0.82,
    gate: 0.85,
    exitEv: 0.73,
    exit: exitNo("2"),
    notes: [
      note("🛗", "2층 승강장에서 1층 대합실로 내려가는 엘리베이터가 여러 대 있어요(장암 방면 끝, 가운데, 수락산 방면).", "Several lifts go from the 2F platform down to the 1F concourse (Jangam end, middle, Suraksan end)."),
      note(
        "🔁",
        "1호선: 2F 승강장 장암 방면 '갈아타는 곳' → 1F → 1호선 대합실 (1·3번 출구)",
        "Line 1: transfer point at the Jangam end of 2F → 1F → Line 1 concourse (Exits 1·3)",
      ),
      toilet("1F 장암 방면 · 수락산 방면", "1F, Jangam side and Suraksan side"),
    ],
  }),
  수락산역: map("711", "suraksan", [N.dobongsan, N.madeul], underground("B2", "B3"), {
    platformEv: 0.29,
    gate: 0.3,
    exitEv: 0.15,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상(1·6번 출구 쪽)까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 to the street (Exits 1·6 side)."),
      toilet("B2 마들 방면", "B2, Madeul side"),
    ],
  }),
  마들역: map("712", "madeul", [N.suraksan, N.nowon], underground("B2", "B3"), {
    platformEv: 0.84,
    gate: 0.75,
    exitEv: 0.84,
    exit: exitNo("5"),
    notes: [
      note("🛗", "노원 방면 엘리베이터 한 대로 승강장(B3) ↔ 대합실 ↔ 지상(4·5번 출구 쪽)이 이어져요.", "One lift at the Nowon end links the B3 platform, concourse and street (Exits 4·5 side)."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  노원역: map("713", "nowon", [N.madeul, N.junggye], underground("B2", "B3"), {
    platformEv: 0.56,
    gate: 0.6,
    exitEv: 0.44,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) 가운데 엘리베이터로 대합실까지, 지상 엘리베이터는 3·8번 출구 쪽과 5·6번 출구 쪽에 있어요.", "A mid-platform lift goes up from B3; street lifts are by Exits 3·8 and Exits 5·6."),
      note(
        "🔁",
        "4호선: B3 승강장 마들 방면 '갈아타는 곳' → B1 '갈아타는 곳' → 환승통로 → 4호선 (1·2·9·10번 출구는 4호선 대합실)",
        "Line 4: transfer point at the Madeul end of B3 → B1 transfer point → passage → Line 4 (Exits 1, 2, 9, 10 via Line 4)",
      ),
      toilet("B2 중계 방면", "B2, Junggye side"),
    ],
  }),
  중계역: map("714", "junggye", [N.nowon, N.hagye], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.5,
    exitEv: 0.37,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터가 두 곳(2번 출구 쪽, 3·4번 출구 쪽)에 있어요.", "Lift from the B3 platform to B2; from B2 there are street lifts by Exit 2 and by Exits 3·4."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  하계역: map("715", "hagye", [N.junggye, N.gongneung], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.5,
    exitEv: 0.27,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) 가운데 엘리베이터로 올라간 뒤, 중계 방면 1·6번 출구 쪽 지상 엘리베이터를 이용하세요.", "Take the mid-platform lift up from B3, then the street lift by Exits 1·6 (Junggye side)."),
      toilet("B1 공릉 방면", "B1, Gongneung side"),
    ],
  }),
  공릉역: map("716", "gongneung", [N.hagye, N.taereung], underground("B1", "B4"), {
    platformEv: 0.87,
    gate: 0.7,
    exitEv: 0.37,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🛗",
        "승강장 엘리베이터는 태릉입구 방면 끝에 있어요(태릉입구 방면 승강장은 B1까지, 하계 방면 승강장은 B2까지).",
        "Platform lifts are at the Taereung end (the Taereung-bound side goes to B1, the Hagye-bound side to B2).",
      ),
      note("🛗", "지상 엘리베이터는 하계 방면 2·3번 출구 쪽에 있어요.", "The street lift is toward Hagye, by Exits 2·3."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  태릉입구역: map("717", "taereung", [N.gongneung, N.meokgol], underground("B3", "B4"), {
    platformEv: 0.54,
    gate: 0.4,
    exitEv: 0.54,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B4) 가운데 엘리베이터 한 대로 B3 대합실과 지상까지 이어져요.", "One mid-platform lift links the B4 platform, the B3 concourse and the street."),
      note(
        "🔁",
        "6호선: B4 승강장 먹골 방면 '갈아타는 곳' → B3 '갈아타는 곳' → 6호선 (1·6·7·8번 출구는 6호선 대합실)",
        "Line 6: transfer point at the Meokgol end of B4 → B3 transfer point → Line 6 (Exits 1, 6, 7, 8 via Line 6)",
      ),
      toilet("B3 대합실", "B3 concourse"),
    ],
  }),
  먹골역: map("718", "meokgol", [N.junghwa, N.taereung], underground("B2", "B3"), {
    platformEv: 0.48,
    gate: 0.55,
    exitEv: 0.58,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 up to the street."),
      toilet("B1 태릉입구 방면", "B1, Taereung side"),
    ],
  }),
  중화역: map("719", "junghwa", [N.meokgol, N.sangbong], underground("B1", "B3"), {
    platformEv: 0.48,
    gate: 0.45,
    exitEv: 0.71,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3)에서 B1까지 엘리베이터로 바로 올라가고, 지상 엘리베이터는 상봉 방면에 있어요.", "The lift goes straight from B3 to B1; the street lift is toward Sangbong."),
      toilet("B1 상봉 방면", "B1, Sangbong side"),
    ],
  }),
  상봉역: map("720", "sangbong", [N.junghwa, N.myeonmok], underground("B1", "B3"), {
    platformEv: 0.43,
    gate: 0.48,
    exitEv: 0.53,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3)에서 B1까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B3 platform to B1."),
      note(
        "🔁",
        "경의중앙선·경춘선: B3 승강장 '갈아타는 곳' → B2 → B1 '갈아타는 곳' (7·8번 출구는 경의중앙선·경춘선 대합실)",
        "Gyeongui–Jungang / Gyeongchun: B3 transfer point → B2 → B1 transfer point (Exits 7·8 via their concourse)",
      ),
      toilet("B1 중화 방면", "B1, Junghwa side"),
    ],
  }),
  면목역: map("721", "myeonmok", [N.sangbong, N.sagajeong], underground("B1", "B4"), {
    platformEv: 0.44,
    gate: 0.45,
    exitEv: 0.53,
    exit: exitNo("3"),
    notes: [
      note("🛗", "승강장(B4)에서 B1까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B4 platform to B1."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  사가정역: map("722", "sagajeong", [N.myeonmok, N.yongmasan], underground("B1", "B4"), {
    platformEv: 0.48,
    gate: 0.5,
    exitEv: 0.78,
    exit: exitNo("4"),
    notes: [
      note("🛗", "승강장(B4)에서 B1까지 엘리베이터로 바로 올라가고, 지상 엘리베이터는 용마산 방면 3·4번 출구 쪽에 있어요.", "The lift goes straight from B4 to B1; the street lift is by Exits 3·4 (Yongmasan side)."),
      toilet("B1 면목 방면", "B1, Myeonmok side"),
    ],
  }),
  용마산역: map("723", "yongmasan", [N.sagajeong, N.junggok], underground("B1", "B4"), {
    platformEv: 0.43,
    gate: 0.5,
    exitEv: 0.2,
    exit: exitNo("1"),
    notes: [
      note("🛗", "승강장(B4)에서 B1까지 엘리베이터로 바로 올라가요.", "The lift goes straight from the B4 platform to B1."),
      toilet("B1 사가정 방면", "B1, Sagajeong side"),
    ],
  }),
  중곡역: map("724", "junggok", [N.yongmasan, N.gunja], underground("B2", "B3"), {
    platformEv: 0.52,
    gate: 0.5,
    exitEv: 0.43,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 up to the street."),
      toilet("B2 용마산 방면", "B2, Yongmasan side"),
    ],
  }),
  군자역: map("725", "gunja", [N.junggok, N.childrensPark], underground("B1", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.44,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) 가운데 엘리베이터로 B1까지 올라가요. 지상 엘리베이터는 1~4번 출구 쪽과 어린이대공원 방면 끝에 있어요.", "A mid-platform lift goes from B3 to B1; street lifts are by Exits 1–4 and at the Children's Park end."),
      note("🔁", "5호선: B3 승강장 가운데 '갈아타는 곳' → 5호선 대합실 (5~8번 출구 방향)", "Line 5: mid-platform transfer point on B3 → Line 5 concourse (toward Exits 5–8)"),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  어린이대공원역: map("726", "childrens-park", [N.gunja, N.konkuk], underground("B2", "B3"), {
    platformEv: 0.43,
    gate: 0.4,
    exitEv: 0.23,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 군자 방면 1·6번 출구 쪽과 건대입구 방면 2·3·5번 출구 쪽에 있어요.", "Street lifts are by Exits 1·6 (Gunja side) and Exits 2, 3, 5 (Konkuk side)."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  건대입구역: map("727", "konkuk", [N.childrensPark, N.jayang], underground("B1", "B2"), {
    platformEv: 0.5,
    gate: 0.4,
    exitEv: 0.85,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "7호선 쪽에는 지상 엘리베이터가 없어요. 승강장 가운데 엘리베이터로 환승통로에 내려간 뒤 2호선 대합실(2F) 쪽 엘리베이터를 이용하세요.",
        "There is no street lift on the Line 7 side. Take the mid-platform lift down to the transfer passage, then use the lifts by the Line 2 concourse (2F).",
      ),
      note(
        "🔁",
        "2호선: B2 승강장 자양 방면 '갈아타는 곳' → 환승통로 → 2호선 대합실(2F) → 승강장(3F) (1·2·5·6번 출구는 2호선 대합실)",
        "Line 2: transfer point at the Jayang end of B2 → passage → Line 2 concourse (2F) → platform (3F) (Exits 1, 2, 5, 6 via Line 2)",
      ),
      toilet("B2 자양 방면", "B2, Jayang side"),
    ],
  }),
  자양역: map("728", "jayang", [N.konkuk, N.cheongdam], ELEVATED_3F, {
    platformEv: 0.18,
    gate: 0.15,
    exitEv: 0.28,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("ℹ️", "한강 위 다리(청담대교)에 있는 지상 3층 역이에요. 엘리베이터는 건대입구 방면 끝에 있어요.", "An elevated (3F) station on the Cheongdam Bridge; the lifts are at the Konkuk end."),
      note("🛗", "3F 승강장 → 2F 대합실 → 1F(1·4번 출구 쪽)로 엘리베이터를 갈아타요.", "Change lifts: 3F platform → 2F concourse → 1F (Exits 1·4 side)."),
      toilet("2F 대합실", "2F concourse"),
    ],
  }),
  청담역: map("729", "cheongdam", [N.gangnamGu, N.jayang], underground("B3", "B4"), {
    platformEv: 0.26,
    gate: 0.2,
    exitEv: 0.02,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "안내도에는 승강장(B4) ↔ 대합실(B3) 엘리베이터가 없고 계단 휠체어 리프트만 있어요. 고객안전실(B3)에 도움을 요청하세요.",
        "The map shows no lift between the B4 platform and B3 concourse, only stair wheelchair lifts. Ask the B3 customer safety office for help.",
      ),
      note("🛗", "지상 엘리베이터는 강남구청 방면 6~9번 출구 쪽에 있어요.", "The street lift is by Exits 6–9 at the Gangnam-gu Office end."),
      toilet("B3 강남구청 방면", "B3, Gangnam-gu Office side"),
    ],
  }),
  강남구청역: map("730", "gangnam-gu", [N.cheongdam, N.hakdong], underground("B2", "B3"), {
    platformEv: 0.16,
    gate: 0.45,
    exitEv: 0.42,
    exit: exitNo("1·4"),
    notes: [
      note("🛗", "승강장 엘리베이터는 청담 방면 끝에 있어요. B2에서 가운데로 이동해 1·4번 출구 쪽 지상 엘리베이터를 타세요.", "The platform lift is at the Cheongdam end; on B2 walk to the middle for the street lift by Exits 1·4."),
      note("🔁", "수인분당선: B3 승강장 가운데 '갈아타는 곳' → 수인분당선 대합실", "Suin–Bundang: mid-platform transfer point on B3 → Suin–Bundang concourse"),
      toilet("B2 청담 방면 · B1 대합실", "B2 Cheongdam side; B1 concourse"),
    ],
  }),
  학동역: map("731", "hakdong", [N.nonhyeon, N.gangnamGu], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.23,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 논현 방면 3~5번 출구 쪽 지상 엘리베이터를 이용하세요.", "Lift from the B3 platform to B2, then the street lift by Exits 3–5 (Nonhyeon side)."),
      toilet("B2 강남구청 방면", "B2, Gangnam-gu Office side"),
    ],
  }),
  논현역: map("732", "nonhyeon", [N.banpo, N.hakdong], underground("B2", "B3"), {
    platformEv: 0.23,
    gate: 0.55,
    exitEv: 0.63,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장 엘리베이터는 반포 방면 끝에 있어요. B2에서 학동 방면으로 이동해 1·10번 출구 쪽 지상 엘리베이터를 타세요.", "The platform lift is at the Banpo end; on B2 walk toward Hakdong for the street lift by Exits 1·10."),
      note("🔁", "신분당선: B3 승강장 가운데 '갈아타는 곳' → B2 → 신분당선 (3·4번 출구는 신분당선 대합실)", "Shinbundang: mid-platform transfer point on B3 → B2 → Shinbundang (Exits 3·4 via Shinbundang)"),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  반포역: map("733", "banpo", [N.expressBus, N.nonhyeon], underground("B2", "B3"), {
    platformEv: 0.54,
    gate: 0.5,
    exitEv: 0.46,
    exit: exitNo("1"),
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상까지 엘리베이터가 1번 출구 옆과 6번 출구 쪽에 있어요.", "Lift from the B3 platform to B2; street lifts from B2 are next to Exit 1 and by Exit 6."),
      toilet("B2 고속터미널 방면", "B2, Express Bus Terminal side"),
    ],
  }),
  고속터미널역: map("734", "expressbus", [N.banpo, N.naebang], underground("B2", "B3"), {
    platformEv: 0.4,
    gate: 0.35,
    exitEv: 0.1,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "7호선 구역에는 지상 엘리베이터가 없어요. 승강장 엘리베이터로 B2에 올라간 뒤 반포 방면 3호선·9호선 대합실 쪽 엘리베이터를 이용하세요.",
        "There is no street lift in the Line 7 area. Take the platform lift to B2, then walk toward Banpo to the lifts in the Line 3 / Line 9 concourses.",
      ),
      note(
        "🔁",
        "3호선·9호선: B3 승강장 반포 방면 '갈아타는 곳' → B2 (2·7·8번 출구는 3호선 대합실, 1·8-1·8-2번 출구는 9호선 대합실)",
        "Lines 3 & 9: transfer point at the Banpo end of B3 → B2 (Exits 2, 7, 8 via Line 3; Exits 1, 8-1, 8-2 via Line 9)",
      ),
      toilet("B1 반포 방면", "B1, Banpo side"),
    ],
  }),
  내방역: map("735", "naebang", [N.expressBus, N.isu], underground("B2", "B3"), {
    platformEv: 0.46,
    gate: 0.4,
    exitEv: 0.44,
    exit: exitNo("4"),
    notes: [
      note("⚠️", "엘리베이터를 갈아타요: B3 → B2 → B1 → 지상(4번 출구 쪽).", "Change lifts: B3 → B2 → B1 → street (Exit 4 side)."),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  이수역: map("736", "isu", [N.naebang, N.namseong], underground("B3", "B4"), {
    platformEv: 0.54,
    gate: 0.7,
    exitEv: 0.7,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B4) → B3, 그리고 B3에서 지상(7·8번과 9·10번 출구 사이)까지 엘리베이터로 올라가요.", "Lift from the B4 platform to B3, then from B3 to the street (between Exits 7·8 and 9·10)."),
      note(
        "🔁",
        "4호선(총신대입구): B4 승강장 내방 방면 '갈아타는 곳' → B3 '갈아타는 곳' → 4호선 (1·2·13·14번 출구는 4호선 대합실)",
        "Line 4 (Chongshin Univ.): transfer point at the Naebang end of B4 → B3 transfer point → Line 4 (Exits 1, 2, 13, 14 via Line 4)",
      ),
      toilet("B1 · B3 대합실", "B1 and B3 concourses"),
    ],
  }),
  남성역: map("737", "namseong", [N.isu, N.soongsil], underground("B2", "B3"), {
    platformEv: 0.66,
    gate: 0.45,
    exitEv: 0.28,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장 엘리베이터는 숭실대 방면에 있고, 지상 엘리베이터는 이수 방면 1·4번과 2·3번 출구 사이에 있어요.", "The platform lift is toward Soongsil; street lifts are toward Isu, between Exits 1·4 and 2·3."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  숭실대입구역: map("738", "soongsil", [N.namseong, N.sangdo], underground("B2", "B6"), {
    platformEv: 0.69,
    gate: 0.4,
    exitEv: 0.45,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("ℹ️", "지하 6층 깊은 역이에요. 상도 방면 엘리베이터로 승강장(B6)에서 B2 대합실까지 바로 올라가요.", "A deep (B6) station: the lift at the Sangdo end goes straight from B6 to the B2 concourse."),
      toilet("B2 남성 방면", "B2, Namseong side"),
    ],
  }),
  상도역: map("739", "sangdo", [N.soongsil, N.jangseungbaegi], underground("B2", "B3"), {
    platformEv: 0.39,
    gate: 0.4,
    exitEv: 0.49,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2 가운데에서 지상까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from the middle of B2 up to the street."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  장승배기역: map("740", "jangseungbaegi", [N.sangdo, N.sindaebang], underground("B2", "B3"), {
    platformEv: 0.5,
    gate: 0.45,
    exitEv: 0.63,
    exit: exitNo("2"),
    notes: [
      note("🛗", "승강장(B3) → B2, 그리고 B2에서 지상(2번 출구 쪽)까지 엘리베이터로 올라가요.", "Lift from the B3 platform to B2, then from B2 to the street (Exit 2 side)."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  신대방삼거리역: map("741", "sindaebang-samgeori", [N.jangseungbaegi, N.boramae], underground("B2", "B3"), {
    platformEv: 0.51,
    gate: 0.45,
    exitEv: 0.42,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("⚠️", "엘리베이터를 갈아타요: B3 → B2 → B1 → 지상.", "Change lifts: B3 → B2 → B1 → street."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  보라매역: map("742", "boramae", [N.sinpung, N.sindaebang], UNDER, {
    platformEv: 0.67,
    gate: 0.6,
    exitEv: 0.62,
    exit: exitNo("6"),
    notes: [
      note("🛗", "승강장 엘리베이터는 신풍 방면과 신대방삼거리 방면에 하나씩 있고, 지상 엘리베이터는 6번 출구 쪽이에요.", "There are platform lifts toward Sinpung and toward Sindaebang Samgeori; the street lift is by Exit 6."),
      note("🔁", "신림선: B1 '갈아타는 곳' → 신림선 대합실 → 신림선 승강장(B3)", "Sillim Line: B1 transfer point → Sillim concourse → Sillim platform (B3)"),
      toilet("B1 신대방삼거리 방면", "B1, Sindaebang Samgeori side"),
    ],
  }),
  신풍역: map("743", "sinpung", [N.daerim, N.boramae], UNDER, {
    platformEv: 0.48,
    gate: 0.5,
    exitEv: 0.54,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 대합실 가운데와 대림 방면 4번 출구 쪽에 있어요.", "Street lifts are in the middle of the concourse and by Exit 4 (Daerim side)."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  대림역: map("744", "daerim", [N.namguro, N.sinpung], UNDER, {
    platformEv: 0.51,
    gate: 0.6,
    exitEv: 0.81,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 신풍 방면 9·12번과 10·11번 출구 사이에 있어요.", "The street lift is toward Sinpung, between Exits 9·12 and 10·11."),
      note(
        "🔁",
        "2호선: B2 승강장 남구로 방면 '갈아타는 곳' → B1 → 2호선 대합실(2F) → 승강장(3F) (1~8번 출구는 2호선 대합실)",
        "Line 2: transfer point at the Namguro end of B2 → B1 → Line 2 concourse (2F) → platform (3F) (Exits 1–8 via Line 2)",
      ),
      toilet("B1 신풍 방면", "B1, Sinpung side"),
    ],
  }),
  남구로역: map("745", "namguro", [N.daerim, N.gasan], underground("B2", "B5"), {
    platformEv: 0.27,
    gate: 0.25,
    exitEv: 0.19,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("ℹ️", "지하 5층 깊은 역이에요. 엘리베이터는 대림 방면 끝에 있어요: B5 → B2 → 지상(1·6번 출구 쪽).", "A deep (B5) station; the lifts are at the Daerim end: B5 → B2 → street (Exits 1·6 side)."),
      toilet("B1 가산디지털단지 방면", "B1, Gasan Digital Complex side"),
    ],
  }),
  가산디지털단지역: map("746", "gasan", [N.cheolsan, N.namguro], underground("B1", "B4"), {
    platformEv: 0.46,
    gate: 0.35,
    exitEv: 0.27,
    exit: exitNo("9"),
    notes: [
      note("⚠️", "엘리베이터를 갈아타요: B4 → B2 → B1 → 지상(9번 출구 쪽).", "Change lifts: B4 → B2 → B1 → street (Exit 9 side)."),
      note(
        "🔁",
        "1호선: B4 승강장 '갈아타는 곳' → B3 → B1 → 1호선 대합실 (2·3·11번 출구는 1호선 대합실)",
        "Line 1: B4 transfer points → B3 → B1 → Line 1 concourse (Exits 2, 3, 11 via Line 1)",
      ),
      toilet("B1 남구로 방면", "B1, Namguro side"),
    ],
  }),
  철산역: map("747", "cheolsan", [N.gwangmyeong, N.gasan], UNDER, {
    platformEv: 0.48,
    gate: 0.5,
    exitEv: 0.66,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 가산디지털단지 방면 1번 출구 쪽과 4번 출구 쪽에 있어요.", "Street lifts are by Exit 1 and Exit 4 (Gasan side)."),
      toilet("B1 광명사거리 방면", "B1, Gwangmyeong Sageori side"),
    ],
  }),
  광명사거리역: map("748", "gwangmyeong-sageori", [N.cheonwang, N.cheolsan], underground("B2", "B3"), {
    platformEv: 0.76,
    gate: 0.6,
    exitEv: 0.5,
    exit: exitNo("3"),
    notes: [
      note("🛗", "승강장 엘리베이터는 천왕 방면 끝과 철산 방면에 있고, 지상 엘리베이터는 2·3번 출구 쪽이에요.", "Platform lifts are at the Cheonwang end and toward Cheolsan; the street lift is by Exits 2·3."),
      toilet("B2 대합실", "B2 concourse"),
    ],
  }),
  천왕역: map("749", "cheonwang", [N.onsu, N.gwangmyeong], UNDER, {
    platformEv: 0.5,
    gate: 0.6,
    exitEv: 0.68,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터 3대가 광명사거리 방면 2번 출구 주변에 모여 있어요.", "Three street lifts are grouped around Exit 2 (Gwangmyeong Sageori side)."),
      toilet("B1 광명사거리 방면", "B1, Gwangmyeong Sageori side"),
    ],
  }),
  온수역: map("750", "onsu", [N.kkachiul, N.cheonwang], UNDER, {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.69,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 천왕 방면 3번 출구 쪽에 있어요.", "The street lift is by Exit 3 (Cheonwang side)."),
      note(
        "🔁",
        "1호선: B2 승강장 천왕 방면 '갈아타는 곳' → B1 '갈아타는 곳' → 1호선 대합실(2F) (1·3·7·8번 출구는 1호선 대합실)",
        "Line 1: transfer point at the Cheonwang end of B2 → B1 transfer point → Line 1 concourse (2F) (Exits 1, 3, 7, 8 via Line 1)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
};
