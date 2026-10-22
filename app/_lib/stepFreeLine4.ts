import type { Localized } from "./stations";
import {
  CONCOURSE_EXITS_LABEL,
  ELEVATED_3F,
  exitNo,
  LINE4,
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
  byeollae: { ko: "별내별가람", en: "Byeollae Byeolgaram", zh: "别内别佳蓝", ja: "別内ビョルガラム" },
  danggogae: { ko: "당고개", en: "Danggogae", zh: "堂岘", ja: "堂峴" },
  sanggye: { ko: "상계", en: "Sanggye", zh: "上溪", ja: "上渓" },
  nowon: { ko: "노원", en: "Nowon", zh: "芦原", ja: "蘆原" },
  changdong: { ko: "창동", en: "Chang-dong", zh: "仓洞", ja: "倉洞" },
  ssangmun: { ko: "쌍문", en: "Ssangmun", zh: "双门", ja: "双門" },
  suyu: { ko: "수유", en: "Suyu", zh: "水逾", ja: "水踰" },
  mia: { ko: "미아", en: "Mia", zh: "弥阿", ja: "弥阿" },
  miasageori: { ko: "미아사거리", en: "Miasageori", zh: "弥阿十字路口", ja: "弥阿四つ角" },
  gireum: { ko: "길음", en: "Gireum", zh: "吉音", ja: "吉音" },
  sungshin: { ko: "성신여대입구", en: "Sungshin Women's Univ.", zh: "诚信女大入口", ja: "誠信女大入口" },
  hansung: { ko: "한성대입구", en: "Hansung Univ.", zh: "汉城大入口", ja: "漢城大入口" },
  hyehwa: { ko: "혜화", en: "Hyehwa", zh: "惠化", ja: "恵化" },
  dongdaemun: { ko: "동대문", en: "Dongdaemun", zh: "东大门", ja: "東大門" },
  ddp: { ko: "동대문역사문화공원", en: "Dongdaemun History & Culture Park", zh: "东大门历史文化公园", ja: "東大門歴史文化公園" },
  chungmuro: { ko: "충무로", en: "Chungmuro", zh: "忠武路", ja: "忠武路" },
  myeongdong: { ko: "명동", en: "Myeong-dong", zh: "明洞", ja: "明洞" },
  hoehyeon: { ko: "회현", en: "Hoehyeon", zh: "会贤", ja: "会賢" },
  seoul: { ko: "서울역", en: "Seoul Station", zh: "首尔站", ja: "ソウル駅" },
  sookmyung: { ko: "숙대입구", en: "Sookmyung Women's Univ.", zh: "淑大入口", ja: "淑大入口" },
  samgakji: { ko: "삼각지", en: "Samgakji", zh: "三角地", ja: "三角地" },
  sinyongsan: { ko: "신용산", en: "Sinyongsan", zh: "新龙山", ja: "新龍山" },
  ichon: { ko: "이촌", en: "Ichon", zh: "二村", ja: "二村" },
  dongjak: { ko: "동작", en: "Dongjak", zh: "铜雀", ja: "銅雀" },
  chongshin: { ko: "총신대입구", en: "Chongshin Univ.", zh: "总神大入口", ja: "総神大入口" },
  sadang: { ko: "사당", en: "Sadang", zh: "舍堂", ja: "舎堂" },
  namtaeryeong: { ko: "남태령", en: "Namtaeryeong", zh: "南泰岭", ja: "南泰嶺" },
  seonbawi: { ko: "선바위", en: "Seonbawi", zh: "仙岩", ja: "ソンバウィ" },
} satisfies Record<string, Localized>;

const UNDER = underground();

function map(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE4, "line4", code, slug, ends, layout, route);
}

const DANGGOGAE = map("409", "danggogae", [N.byeollae, N.sanggye], ELEVATED_3F, {
  platformEv: 0.5,
  gate: 0.4,
  exitEv: 0.25,
  exit: exitNo("1·4"),
  notes: [
    note("ℹ️", "2024년 12월부터 역 이름이 '불암산'으로 바뀌었어요.", "Renamed Buramsan in December 2024."),
    note(
      "⬇️",
      "고가역이에요. 3F 승강장 → 2F 대합실 → 엘리베이터로 1F(1·4번 출구 쪽)까지 내려가요.",
      "Elevated station: 3F platform → 2F concourse → lift down to 1F (Exits 1·4).",
    ),
    toilet("1F 1·4번 출구 쪽 · 2F 상계 방면", "1F near Exits 1·4; 2F, Sanggye side"),
  ],
});

const CHONGSHIN = map("432", "chongshin", [N.dongjak, N.sadang], UNDER, {
  platformEv: 0.25,
  gate: 0.31,
  exitEv: 0.36,
  exit: STREET_LIFT_EXIT,
  notes: [
    note("🛗", "지상 엘리베이터는 동작 방면 1·14번 출구 쪽에 있어요.", "The street lift is near Exits 1·14, toward Dongjak."),
    note(
      "🔁",
      "7호선(이수): B2 승강장 사당 방면 끝 '갈아타는 곳' (3~12번 출구는 7호선 대합실)",
      "Line 7 (Isu): transfer point at the Sadang end of B2 (Exits 3–12 via Line 7)",
    ),
    note("🛗", "승강장 가운데에도 대합실로 올라가는 엘리베이터가 하나 더 있어요.", "Another platform lift stands mid-platform."),
    toilet("B1 동작 방면", "B1, Dongjak side"),
  ],
});

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE4_MAPS: Record<string, StepFreeMap> = {
  당고개역: DANGGOGAE,
  불암산역: DANGGOGAE,
  상계역: map("410", "sanggye", [N.danggogae, N.nowon], ELEVATED_3F, {
    platformEv: 0.19,
    gate: 0.34,
    exitEv: 0.38,
    exit: exitNo("1·5"),
    notes: [
      note("🛗", "승강장 엘리베이터는 당고개 방면 끝에 있어요.", "The platform lift is at the Danggogae end."),
      toilet("2F 노원 방면", "2F, Nowon side"),
    ],
  }),
  노원역: map("411", "nowon", [N.sanggye, N.changdong], ELEVATED_3F, {
    platformEv: 0.75,
    gate: 0.65,
    exitEv: 0.62,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🔁",
        "7호선: 3F 승강장 창동 방면 '갈아타는 곳' → 연결통로 → 7호선 지하 대합실 (3~8번 출구는 7호선 대합실)",
        "Line 7: transfer point at the Chang-dong end of 3F → passage → underground Line 7 (Exits 3–8 via Line 7)",
      ),
      toilet("2F 창동 방면", "2F, Chang-dong side"),
    ],
  }),
  창동역: map("412", "changdong", [N.ssangmun, N.nowon], ELEVATED_3F, {
    platformEv: 0.26,
    gate: 0.2,
    exitEv: 0.18,
    exit: exitNo("2"),
    notes: [
      note(
        "🔁",
        "1호선: 3F 승강장 가운데 '방학 방면'·'녹천 방면' 엘리베이터로 1F 1호선 승강장까지 바로 내려가요.",
        "Line 1: mid-platform lifts on 3F ('to Banghak' / 'to Nokcheon') go straight down to the 1F Line 1 platforms.",
      ),
      note("🛗", "노원 방면 1번 출구 쪽에도 엘리베이터가 있어요.", "There is also a lift near Exit 1, toward Nowon."),
      toilet("2F 쌍문 방면", "2F, Ssangmun side"),
    ],
  }),
  쌍문역: map("413", "ssangmun", [N.changdong, N.suyu], UNDER, {
    platformEv: 0.69,
    gate: 0.63,
    exitEv: 0.47,
    exit: exitNo("4"),
    notes: [toilet("B1 수유 방면", "B1, Suyu side")],
  }),
  수유역: map("414", "suyu", [N.mia, N.ssangmun], UNDER, {
    platformEv: 0.46,
    gate: 0.66,
    exitEv: 0.77,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 쌍문 방면 2·7번과 1·8번 출구 사이에 있어요.", "The street lift is between Exits 2·7 and 1·8, toward Ssangmun."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  미아역: map("415", "mia", [N.suyu, N.miasageori], UNDER, {
    platformEv: 0.66,
    gate: 0.71,
    exitEv: 0.17,
    exit: exitNo("2"),
    notes: [
      note(
        "🚶",
        "승강장 엘리베이터는 미아사거리 방면에 있어요. 대합실을 따라 수유 방면 2번 출구 엘리베이터까지 걸어가요.",
        "The platform lift is toward Miasageori; walk along the concourse to the Exit 2 lift toward Suyu.",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  미아사거리역: map("416", "miasageori", [N.mia, N.gireum], UNDER, {
    platformEv: 0.34,
    gate: 0.3,
    exitEv: 0.22,
    exit: exitNo("1"),
    notes: [toilet("B1 미아 방면", "B1, Mia side")],
  }),
  길음역: map("417", "gireum", [N.miasageori, N.sungshin], UNDER, {
    platformEv: 0.5,
    gate: 0.42,
    exitEv: 0.53,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 승강장 엘리베이터 바로 옆(1·4번 출구 쪽)에 있어요.", "The street lift is right next to the platform lift (Exits 1·4 side)."),
      note("🛗", "미아사거리 방면 5번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exit 5, toward Miasageori."),
      toilet("B1 미아사거리 방면", "B1, Miasageori side"),
    ],
  }),
  성신여대입구역: map("418", "sungshin", [N.gireum, N.hansung], UNDER, {
    platformEv: 0.74,
    gate: 0.69,
    exitEv: 0.58,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 5번 출구 쪽과 2·6번 출구 쪽에 있어요.", "Street lifts are near Exit 5 and Exits 2·6."),
      note(
        "🔁",
        "우이신설선: B2 승강장 가운데 '갈아타는 곳' → 엘리베이터로 우이신설선 승강장",
        "Ui–Sinseol: mid-platform transfer point on B2 → lift down to the Ui–Sinseol platform",
      ),
      toilet("B1 한성대입구 방면", "B1, Hansung Univ. side"),
    ],
  }),
  한성대입구역: map("419", "hansung", [N.sungshin, N.hyehwa], UNDER, {
    platformEv: 0.52,
    gate: 0.7,
    exitEv: 0.68,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 혜화 방면 3·5번과 4번 출구 사이에 있어요.", "The street lift is between Exits 3·5 and 4, toward Hyehwa."),
      toilet("B1 성신여대입구 방면", "B1, Sungshin Women's Univ. side"),
    ],
  }),
  혜화역: map("420", "hyehwa", [N.dongdaemun, N.hansung], UNDER, {
    platformEv: 0.34,
    gate: 0.29,
    exitEv: 0.23,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 동대문 방면 2·3번 출구 쪽에 있어요.", "The street lift is near Exits 2·3, toward Dongdaemun."),
      toilet("B1 동대문 방면", "B1, Dongdaemun side"),
    ],
  }),
  동대문역: map("421", "dongdaemun", [N.hyehwa, N.ddp], underground("B1", "B4"), {
    platformEv: 0.6,
    gate: 0.55,
    exitEv: 0.5,
    exit: exitNo("9"),
    notes: [
      note("ℹ️", "깊은 역이에요. 승강장(B4)에서 엘리베이터로 B1 대합실까지 바로 올라가요.", "A deep station: the lift goes straight from the B4 platform to the B1 concourse."),
      note(
        "🔁",
        "1호선: B1 대합실 혜화 방면 '갈아타는 곳' (1~6번 출구는 1호선 대합실)",
        "Line 1: transfer point at the Hyehwa end of B1 (Exits 1–6 via Line 1)",
      ),
      toilet("B2 동대문역사문화공원 방면", "B2, DDP side"),
    ],
  }),
  동대문역사문화공원역: map("422", "ddp", [N.dongdaemun, N.chungmuro], underground("B1", "B3"), {
    platformEv: 0.57,
    gate: 0.54,
    exitEv: 0.47,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 9·10번 출구 쪽에 있어요.", "The street lift is near Exits 9·10."),
      note(
        "🔁",
        "2호선: B2 대합실 '갈아타는 곳' (1~3번 출구는 2호선 대합실, 11~14번은 을지로 지하보도)",
        "Line 2: B2 transfer point (Exits 1–3 via Line 2, 11–14 via the Euljiro underpass)",
      ),
      note(
        "🔁",
        "5호선: B3 승강장 충무로 방면 '갈아타는 곳' → 엘리베이터로 B5 5호선 승강장 (6·7번 출구는 5호선 대합실)",
        "Line 5: transfer point at the Chungmuro end of B3 → lift to the B5 Line 5 platform (Exits 6·7 via Line 5)",
      ),
      toilet("B1·B2 대합실 가운데", "middle of B1 and B2"),
    ],
  }),
  충무로역: map("423", "chungmuro", [N.ddp, N.myeongdong], underground("B1", "B3"), {
    platformEv: 0.74,
    gate: 0.81,
    exitEv: 0.84,
    exit: exitNo("3"),
    notes: [
      note(
        "🔁",
        "3호선: B3 승강장 가운데 엘리베이터로 B4 3호선 승강장까지 바로 내려가요 (B2 대합실에도 '갈아타는 곳').",
        "Line 3: the mid-platform lift on B3 goes straight down to the B4 Line 3 platform (another transfer point on B2).",
      ),
      toilet("B2 명동 방면", "B2, Myeong-dong side"),
    ],
  }),
  명동역: map("424", "myeongdong", [N.chungmuro, N.hoehyeon], underground("B1", "B3"), {
    platformEv: 0.24,
    gate: 0.21,
    exitEv: 0.26,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터는 충무로 방면 끝(1·9·10번 출구 쪽)에 모여 있어요.", "The lifts are grouped at the Chungmuro end (Exits 1·9·10 side)."),
      toilet("B1 2·8번 출구 쪽 · 회현 방면", "B1 near Exits 2·8 and at the Hoehyeon end"),
    ],
  }),
  회현역: map("425", "hoehyeon", [N.myeongdong, N.seoul], underground("B1", "B4"), {
    platformEv: 0.83,
    gate: 0.75,
    exitEv: 0.84,
    exit: exitNo("4"),
    notes: [
      note(
        "🛗",
        "서울역 방면 엘리베이터로 승강장(B4)에서 B1 대합실까지 바로 올라간 뒤, 옆 엘리베이터로 4번 출구까지 나가요.",
        "From the B4 platform, the lift at the Seoul Station end goes straight to B1; the next lift takes you out at Exit 4.",
      ),
      note("🛗", "명동 방면 1·7번 출구 쪽에도 지상 엘리베이터가 있어요.", "There are also street lifts near Exits 1·7, toward Myeong-dong."),
      toilet("B2 서울역 방면", "B2, Seoul Station side"),
    ],
  }),
  서울역: map("426", "seoul", [N.hoehyeon, N.sookmyung], UNDER, {
    platformEv: 0.67,
    gate: 0.74,
    exitEv: 0.79,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 숙대입구 방면 12·13번 출구 쪽에 있어요.", "The street lift is near Exits 12·13, toward Sookmyung."),
      note(
        "🔁",
        "1호선·GTX-A: B2 승강장 회현 방면 '갈아타는 곳' (1~9번 출구는 1호선 대합실)",
        "Line 1 / GTX-A: transfer point at the Hoehyeon end of B2 (Exits 1–9 via Line 1)",
      ),
      note(
        "🔁",
        "공항철도·경의중앙선: B2 승강장 '갈아타는 곳' → 15번 출구 방면 연결통로",
        "AREX / Gyeongui–Jungang: B2 transfer point → passage toward Exit 15",
      ),
      toilet("B1 10~14번 출구 쪽", "B1, near Exits 10–14"),
    ],
  }),
  숙대입구역: map("427", "sookmyung", [N.seoul, N.samgakji], UNDER, {
    platformEv: 0.7,
    gate: 0.26,
    exitEv: 0.19,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🚶",
        "승강장 엘리베이터는 삼각지 방면에 있어요. 대합실을 따라 서울역 방면 지상 엘리베이터(1·2·10번 출구 쪽)까지 걸어가요.",
        "The platform lift is toward Samgakji; walk along the concourse to the street lift toward Seoul Station (Exits 1·2·10 side).",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  삼각지역: map("428", "samgakji", [N.sookmyung, N.sinyongsan], UNDER, {
    platformEv: 0.59,
    gate: 0.81,
    exitEv: 0.84,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 신용산 방면 3·4번 출구 쪽과 숙대입구 방면 1·6번 출구 쪽에 있어요.", "Street lifts: near Exits 3·4 (Sinyongsan side) and Exits 1·6 (Sookmyung side)."),
      note(
        "🔁",
        "6호선: B2 승강장 숙대입구 방면 '갈아타는 곳' (7~14번 출구는 6호선 대합실)",
        "Line 6: transfer point at the Sookmyung end of B2 (Exits 7–14 via Line 6)",
      ),
      toilet("B1 신용산 방면", "B1, Sinyongsan side"),
    ],
  }),
  신용산역: map("429", "sinyongsan", [N.samgakji, N.ichon], UNDER, {
    platformEv: 0.68,
    gate: 0.62,
    exitEv: 0.48,
    exit: exitNo("4"),
    notes: [
      note("🛗", "삼각지 방면 1·6번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 1·6, toward Samgakji."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  이촌역: map("430", "ichon", [N.sinyongsan, N.dongjak], UNDER, {
    platformEv: 0.67,
    gate: 0.81,
    exitEv: 0.84,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 동작 방면 2·3번 출구 쪽과 신용산 방면 1·5번 출구 쪽에 있어요.", "Street lifts: near Exits 2·3 (Dongjak side) and Exits 1·5 (Sinyongsan side)."),
      note(
        "🔁",
        "경의중앙선: B1 대합실 가운데 · B2 승강장 동작 방면 '갈아타는 곳' (4번 출구는 경의중앙선 대합실)",
        "Gyeongui–Jungang: transfer points mid-B1 and at the Dongjak end of B2 (Exit 4 via Gyeongui–Jungang)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  동작역: map(
    "431",
    "dongjak",
    [N.ichon, N.chongshin],
    {
      levels: [{ floor: "3F", kind: "platform" }, { floor: "2F", kind: "concourse" }, { floor: "1F", kind: "concourse", label: CONCOURSE_EXITS_LABEL }],
      exitLevel: 2,
      gateLevel: 2,
      platformLevel: 0,
    },
    {
      platformEv: 0.66,
      gate: 0.5,
      exitEv: 0.5,
      exit: exitNo("1"),
      notes: [
        note("⬇️", "동작대교 위 고가역이에요. 3F 승강장에서 엘리베이터로 1F 대합실까지 바로 내려가요.", "Elevated over Dongjak Bridge: the lift goes straight from the 3F platform to the 1F concourse."),
        note(
          "🔁",
          "9호선: 2F 대합실 총신대입구 방면 '갈아타는 곳' → 환승통로 (5~9번 출구는 9호선 대합실)",
          "Line 9: transfer point at the Chongshin end of 2F → passage (Exits 5–9 via Line 9)",
        ),
        toilet("2F 이촌 방면", "2F, Ichon side"),
      ],
    },
  ),
  총신대입구역: CHONGSHIN,
  이수역: CHONGSHIN,
  사당역: map("433", "sadang", [N.chongshin, N.namtaeryeong], underground("B1", "B3"), {
    platformEv: 0.62,
    gate: 0.81,
    exitEv: 0.62,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "사당은 2·4호선이 겹친 역이라 엘리베이터 연결이 복잡해요. 원본 안내도와 역무원 안내를 꼭 확인하세요.",
        "Lines 2 and 4 overlap here, so lift links are complicated. Check the original map and ask staff.",
      ),
      note(
        "🔁",
        "2호선: B3 승강장 계단으로 B2 2호선 승강장 (1·2·5~8·13·14번 출구는 2호선 대합실)",
        "Line 2: stairs from the B3 platform up to the B2 Line 2 platform (Exits 1·2·5–8·13·14 via Line 2)",
      ),
      note("🛗", "총신대입구 방면 10·11번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 10·11, toward Chongshin."),
      toilet("B1 양쪽 · B2 낙성대 방면", "both ends of B1; B2, Nakseongdae side"),
    ],
  }),
  남태령역: map(
    "434",
    "namtaeryeong",
    [N.sadang, N.seonbawi],
    {
      levels: [STREET, { floor: "B1", kind: "concourse" }, { floor: "B2", kind: "concourse" }, { floor: "B3", kind: "platform" }],
      exitLevel: 0,
      gateLevel: 2,
      platformLevel: 3,
    },
    {
      platformEv: 0.33,
      gate: 0.5,
      exitEv: 0.58,
      exit: STREET_LIFT_EXIT,
      notes: [
        note(
          "🛗",
          "B3 승강장 → B2 대합실은 경사형 엘리베이터, B2 → B1 → 지상은 엘리베이터를 갈아타요.",
          "An inclined lift links the B3 platform and B2 concourse; regular lifts continue B2 → B1 → street.",
        ),
        note("🛗", "지상 엘리베이터는 2·3번 출구 쪽에 있어요.", "The street lift is near Exits 2·3."),
        toilet("B2 선바위 방면", "B2, Seonbawi side"),
      ],
    },
  ),
};
