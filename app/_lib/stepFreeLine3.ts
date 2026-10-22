import type { Localized } from "./stations";
import {
  ELEVATED_2F,
  exitNo,
  LINE3,
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
  samsong: { ko: "삼송", en: "Samsong", zh: "三松", ja: "三松" },
  jichuk: { ko: "지축", en: "Jichuk", zh: "纸杻", ja: "紙杻" },
  gupabal: { ko: "구파발", en: "Gupabal", zh: "旧把拨", ja: "旧把撥" },
  yeonsinnae: { ko: "연신내", en: "Yeonsinnae", zh: "延新川", ja: "延新川" },
  bulgwang: { ko: "불광", en: "Bulgwang", zh: "佛光", ja: "仏光" },
  nokbeon: { ko: "녹번", en: "Nokbeon", zh: "碌磻", ja: "碌磻" },
  hongje: { ko: "홍제", en: "Hongje", zh: "弘济", ja: "弘済" },
  muakjae: { ko: "무악재", en: "Muakjae", zh: "毋岳岭", ja: "毋岳峠" },
  dongnimmun: { ko: "독립문", en: "Dongnimmun", zh: "独立门", ja: "独立門" },
  gyeongbokgung: { ko: "경복궁", en: "Gyeongbokgung", zh: "景福宫", ja: "景福宮" },
  anguk: { ko: "안국", en: "Anguk", zh: "安国", ja: "安国" },
  jongno3ga: { ko: "종로3가", en: "Jongno 3-ga", zh: "钟路3街", ja: "鍾路3街" },
  euljiro3ga: { ko: "을지로3가", en: "Euljiro 3-ga", zh: "乙支路3街", ja: "乙支路3街" },
  chungmuro: { ko: "충무로", en: "Chungmuro", zh: "忠武路", ja: "忠武路" },
  dongguk: { ko: "동대입구", en: "Dongguk Univ.", zh: "东大入口", ja: "東大入口" },
  yaksu: { ko: "약수", en: "Yaksu", zh: "药水", ja: "薬水" },
  geumho: { ko: "금호", en: "Geumho", zh: "金湖", ja: "金湖" },
  oksu: { ko: "옥수", en: "Oksu", zh: "玉水", ja: "玉水" },
  apgujeong: { ko: "압구정", en: "Apgujeong", zh: "狎鸥亭", ja: "狎鴎亭" },
  sinsa: { ko: "신사", en: "Sinsa", zh: "新沙", ja: "新沙" },
  jamwon: { ko: "잠원", en: "Jamwon", zh: "蚕院", ja: "蚕院" },
  expressBus: { ko: "고속터미널", en: "Express Bus Terminal", zh: "高速巴士客运站", ja: "高速ターミナル" },
  kyodae: { ko: "교대", en: "Seoul Nat'l Univ. of Education", zh: "教大", ja: "教大" },
  nambu: { ko: "남부터미널", en: "Nambu Bus Terminal", zh: "南部客运站", ja: "南部ターミナル" },
  yangjae: { ko: "양재", en: "Yangjae", zh: "良才", ja: "良才" },
  maebong: { ko: "매봉", en: "Maebong", zh: "梅峰", ja: "梅峰" },
  dogok: { ko: "도곡", en: "Dogok", zh: "道谷", ja: "道谷" },
  daechi: { ko: "대치", en: "Daechi", zh: "大峙", ja: "大峙" },
  hangnyeoul: { ko: "학여울", en: "Hangnyeoul", zh: "鹤滩", ja: "鶴灘" },
  daecheong: { ko: "대청", en: "Daecheong", zh: "大清", ja: "大清" },
  irwon: { ko: "일원", en: "Irwon", zh: "逸院", ja: "逸院" },
  suseo: { ko: "수서", en: "Suseo", zh: "水西", ja: "水西" },
  garak: { ko: "가락시장", en: "Garak Market", zh: "可乐市场", ja: "可楽市場" },
  policeHospital: { ko: "경찰병원", en: "National Police Hospital", zh: "警察医院", ja: "警察病院" },
  ogeum: { ko: "오금", en: "Ogeum", zh: "梧琴", ja: "梧琴" },
  ogeumEnd: { ko: "오금(종착)", en: "Ogeum (terminal)", zh: "梧琴（终点）", ja: "梧琴（終点）" },
} satisfies Record<string, Localized>;

const UNDER = underground();
const UNDER_DEEP = underground("B2", "B3");

function map(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE3, "line3", code, slug, ends, layout, route);
}

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE3_MAPS: Record<string, StepFreeMap> = {
  지축역: map("319", "jichuk", [N.samsong, N.gupabal], ELEVATED_2F, {
    platformEv: 0.8,
    gate: 0.68,
    exitEv: 0.63,
    exit: exitNo("1"),
    notes: [
      note("⬇️", "대합실이 지상(1F)이라 엘리베이터 한 번이면 밖이에요.", "The concourse is at street level, so one lift ride takes you outside."),
      note(
        "ℹ️",
        "1F 대합실은 1번·2번 출구 쪽으로 나뉘어 있어요. 엘리베이터는 구파발 방면 1번 출구 쪽이에요.",
        "The 1F concourse is split in two; the lift is on the Exit 1 side, toward Gupabal.",
      ),
      toilet("1F 2번 출구 쪽(삼송 방면)", "1F, Exit 2 side (Samsong end)"),
    ],
  }),
  구파발역: map("320", "gupabal", [N.yeonsinnae, N.jichuk], UNDER, {
    platformEv: 0.48,
    gate: 0.45,
    exitEv: 0.6,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 지축 방면 1번 출구 쪽(화장실 옆)에 있어요.", "The street lift is on the Jichuk side near Exit 1, next to the toilets."),
      toilet("B1 지축 방면", "B1, Jichuk side"),
    ],
  }),
  연신내역: map("321", "yeonsinnae", [N.bulgwang, N.gupabal], UNDER, {
    platformEv: 0.43,
    gate: 0.52,
    exitEv: 0.61,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🔁",
        "6호선: B1 대합실 가운데 '갈아타는 곳' → B3·B5 6호선 (B2 승강장 불광 방면에도 갈아타는 곳)",
        "Line 6: mid-B1 transfer point → B3/B5 Line 6 (another one at the Bulgwang end of B2)",
      ),
      note("🛗", "지상 엘리베이터는 2·6번 출구 쪽(구파발 방면)에 있어요.", "The street lift is near Exits 2·6 (Gupabal side)."),
      toilet("B1 양쪽 끝", "both ends of B1"),
    ],
  }),
  불광역: map("322", "bulgwang", [N.yeonsinnae, N.nokbeon], UNDER, {
    platformEv: 0.42,
    gate: 0.33,
    exitEv: 0.3,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🔁", "6호선: B2 승강장 연신내 방면 끝 '갈아타는 곳' (6~9번 출구는 6호선 대합실)", "Line 6: transfer point at the Yeonsinnae end of B2 (Exits 6–9 via Line 6)"),
      note("🛗", "지상 엘리베이터는 5번 출구와 1·4번 출구 사이에 있어요.", "The street lift is between Exit 5 and Exits 1·4."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  녹번역: map("323", "nokbeon", [N.bulgwang, N.hongje], UNDER, {
    platformEv: 0.25,
    gate: 0.3,
    exitEv: 0.4,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "승강장 엘리베이터는 불광 방면에 하나 있어요.", "The only platform lift is toward Bulgwang."),
      note(
        "🛗",
        "지상 엘리베이터는 1·5번과 4번 출구 사이, 2·3번 출구 사이에 하나씩 있어요.",
        "Street lifts: one between Exits 1·5 and 4, another between Exits 2 and 3.",
      ),
      toilet("B1 불광 방면", "B1, Bulgwang side"),
    ],
  }),
  홍제역: map("324", "hongje", [N.nokbeon, N.muakjae], UNDER_DEEP, {
    platformEv: 0.36,
    gate: 0.32,
    exitEv: 0.4,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("ℹ️", "개찰구는 B2 대합실에 있어요 (B1은 출구 통로).", "The fare gates are on the B2 concourse (B1 is an exit passage)."),
      toilet("B1·B2 대합실 가운데", "middle of B1 and B2"),
    ],
  }),
  무악재역: map("325", "muakjae", [N.hongje, N.dongnimmun], UNDER_DEEP, {
    platformEv: 0.25,
    gate: 0.4,
    exitEv: 0.32,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "ℹ️",
        "B1은 출구 통로뿐이고, 지상 엘리베이터는 B2 대합실로 바로 이어져요.",
        "B1 is only an exit passage; the street lift goes straight to the B2 concourse.",
      ),
      toilet("B2 홍제 방면", "B2, Hongje side"),
    ],
  }),
  독립문역: map("326", "dongnimmun", [N.muakjae, N.gyeongbokgung], UNDER_DEEP, {
    platformEv: 0.75,
    gate: 0.79,
    exitEv: 0.73,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터는 경복궁 방면 3-1번 출구 쪽에 모여 있어요.", "The lifts are grouped near Exit 3-1, toward Gyeongbokgung."),
      toilet("B2 경복궁 방면", "B2, Gyeongbokgung side"),
    ],
  }),
  경복궁역: map("327", "gyeongbokgung", [N.dongnimmun, N.anguk], UNDER_DEEP, {
    platformEv: 0.5,
    gate: 0.47,
    exitEv: 0.5,
    exit: exitNo("6"),
    notes: [
      note(
        "🛗",
        "엘리베이터 하나로 승강장(B3) ↔ 대합실(B2) ↔ 지상(6번 출구 쪽)이 이어져요.",
        "One lift links the B3 platform, B2 concourse and the street (Exit 6 side).",
      ),
      toilet("B2 독립문 방면", "B2, Dongnimmun side"),
    ],
  }),
  안국역: map("328", "anguk", [N.gyeongbokgung, N.jongno3ga], UNDER_DEEP, {
    platformEv: 0.38,
    gate: 0.3,
    exitEv: 0.38,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🛗",
        "경복궁 방면 엘리베이터 하나로 승강장(B3)에서 지상까지 이어져요.",
        "One lift on the Gyeongbokgung side runs from the B3 platform to the street.",
      ),
      toilet("B2 종로3가 방면", "B2, Jongno 3-ga side"),
    ],
  }),
  종로3가역: map("329", "jongno3ga", [N.anguk, N.euljiro3ga], underground("B1", "B4"), {
    platformEv: 0.62,
    gate: 0.75,
    exitEv: 0.77,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "⚠️",
        "종로3가는 1·3·5호선이 얽힌 깊은 역이라 3호선 승강장(B4)의 엘리베이터 연결이 복잡해요. 원본 안내도와 역무원 안내를 꼭 확인하세요.",
        "A deep three-line interchange: lift links from the Line 3 platform (B4) are complicated. Check the original map and ask staff.",
      ),
      note(
        "🔁",
        "1호선: B2 대합실 을지로3가 방면 '갈아타는 곳' (1·2·10~15번 출구는 1호선 대합실)",
        "Line 1: transfer point at the Euljiro 3-ga end of B2 (Exits 1·2·10–15 via Line 1)",
      ),
      note("🔁", "5호선: B3 대합실 안국 방면 '갈아타는 곳' (4·5번 출구는 5호선 대합실)", "Line 5: transfer point at the Anguk end of B3 (Exits 4·5 via Line 5)"),
      toilet("B2·B3 안국 방면", "B2/B3, Anguk side"),
    ],
  }),
  을지로3가역: map("330", "euljiro3ga", [N.jongno3ga, N.chungmuro], underground("B1", "B3"), {
    platformEv: 0.65,
    gate: 0.72,
    exitEv: 0.65,
    exit: exitNo("7"),
    notes: [
      note(
        "🛗",
        "엘리베이터 하나로 승강장(B3) ↔ 대합실 ↔ 지상(7번 출구 쪽)이 이어져요.",
        "One lift links the B3 platform, the concourse and the street (Exit 7 side).",
      ),
      note("🔁", "2호선: B2 대합실 가운데 '갈아타는 곳' (1·2·11·12번 출구는 2호선 대합실)", "Line 2: mid-B2 transfer point (Exits 1·2·11·12 via Line 2)"),
      toilet("B2 대합실 가운데", "middle of the B2 concourse"),
    ],
  }),
  충무로역: map("331", "chungmuro", [N.euljiro3ga, N.dongguk], underground("B1", "B4"), {
    platformEv: 0.27,
    gate: 0.23,
    exitEv: 0.19,
    exit: exitNo("3"),
    notes: [
      note(
        "⚠️",
        "3호선 승강장(B4)은 4호선 승강장(B3) 아래에 있어요. B4 → B3 구간은 동대입구 방면 장애인용 리프트를 써야 할 수 있으니 역무원 도움을 요청하세요.",
        "The Line 3 platform (B4) is below the Line 4 platform (B3). B4 → B3 may need the wheelchair lift at the Dongguk Univ. end — ask staff for help.",
      ),
      note("🔁", "4호선: B4 승강장 가운데 계단 → B3 4호선 승강장", "Line 4: stairs mid-platform from B4 up to the Line 4 platform (B3)"),
      toilet("B2 을지로3가 방면", "B2, Euljiro 3-ga side"),
    ],
  }),
  동대입구역: map("332", "dongguk", [N.chungmuro, N.yaksu], UNDER_DEEP, {
    platformEv: 0.26,
    gate: 0.38,
    exitEv: 0.46,
    exit: exitNo("2"),
    notes: [
      note("🛗", "약수 방면 B1 대합실(3·4·5번 출구 쪽)에도 엘리베이터가 있어요.", "There is also a lift on the B1 concourse toward Yaksu (Exits 3–5)."),
      toilet("B2 충무로 방면", "B2, Chungmuro side"),
    ],
  }),
  약수역: map("333", "yaksu", [N.dongguk, N.geumho], UNDER, {
    platformEv: 0.76,
    gate: 0.33,
    exitEv: 0.29,
    exit: exitNo("9"),
    notes: [
      note(
        "🚶",
        "승강장 엘리베이터는 금호 방면에 있어요. 대합실을 따라 동대입구 방면 9번 출구 엘리베이터까지 걸어가요.",
        "The platform lift is toward Geumho; walk along the concourse to the Exit 9 lift toward Dongguk Univ.",
      ),
      note("🔁", "6호선: B2 승강장 '갈아타는 곳' → 환승통로 (7·8번 출구는 6호선 대합실)", "Line 6: B2 transfer point → passage (Exits 7·8 via Line 6)"),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  금호역: map("334", "geumho", [N.yaksu, N.oksu], UNDER, {
    platformEv: 0.28,
    gate: 0.42,
    exitEv: 0.49,
    exit: exitNo("2"),
    notes: [
      note("🛗", "옥수 방면(3번 출구 쪽)에도 지상 엘리베이터가 있어요.", "There is also a street lift toward Oksu (Exit 3 side)."),
      toilet("B1 약수 방면", "B1, Yaksu side"),
    ],
  }),
  옥수역: map(
    "335",
    "oksu",
    [N.geumho, N.apgujeong],
    {
      levels: [{ floor: "4F", kind: "platform" }, { floor: "3F", kind: "concourse" }, { floor: "2F", kind: "concourse" }, STREET],
      exitLevel: 3,
      gateLevel: 1,
      platformLevel: 0,
    },
    {
      platformEv: 0.86,
      gate: 0.64,
      exitEv: 0.38,
      exit: STREET_LIFT_EXIT,
      notes: [
        note(
          "⬇️",
          "옥수는 고가역이에요. 4F 승강장 → 3F 대합실 → 엘리베이터로 1F 지상까지 내려가요.",
          "Oksu is elevated: 4F platform → 3F concourse → lift down to the street (1F).",
        ),
        note(
          "🔁",
          "경의·중앙선: 3F 대합실 압구정 방면 '갈아타는 곳' → 1F 경의·중앙선 승강장",
          "Gyeongui–Jungang: transfer point at the Apgujeong end of 3F → 1F platform",
        ),
        toilet("3F 대합실 양쪽", "both sides of the 3F concourse"),
      ],
    },
  ),
  압구정역: map("336", "apgujeong", [N.oksu, N.sinsa], UNDER, {
    platformEv: 0.74,
    gate: 0.8,
    exitEv: 0.87,
    exit: exitNo("3"),
    notes: [
      note("🛗", "옥수 방면 2번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exit 2, toward Oksu."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  신사역: map("337", "sinsa", [N.jamwon, N.apgujeong], UNDER, {
    platformEv: 0.8,
    gate: 0.74,
    exitEv: 0.62,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🔁", "신분당선: B2 승강장 잠원 방면 '갈아타는 곳' → B4 신분당선 승강장", "Shinbundang: transfer point at the Jamwon end of B2 → B4 platform"),
      note("🛗", "잠원 방면 5·6·7번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 5–7, toward Jamwon."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  잠원역: map("338", "jamwon", [N.sinsa, N.expressBus], UNDER, {
    platformEv: 0.26,
    gate: 0.42,
    exitEv: 0.37,
    exit: STREET_LIFT_EXIT,
    notes: [toilet("B1 신사 방면", "B1, Sinsa side")],
  }),
  고속터미널역: map("339", "expressbus", [N.kyodae, N.jamwon], UNDER_DEEP, {
    platformEv: 0.28,
    gate: 0.39,
    exitEv: 0.8,
    exit: exitNo("1"),
    notes: [
      note(
        "🚶",
        "승강장 엘리베이터(교대 방면)에서 지상 엘리베이터(잠원 방면 1번 출구)까지 B2 대합실을 길게 걸어가요.",
        "From the platform lift (Kyodae end), walk the length of the B2 concourse to the street lift at Exit 1 (Jamwon end).",
      ),
      note("🔁", "7호선: B2 교대 방면 '갈아타는 곳' (3~6번 출구는 7호선 대합실)", "Line 7: transfer point at the Kyodae end of B2 (Exits 3–6 via Line 7)"),
      note("🔁", "9호선: B2 잠원 방면 '갈아타는 곳' (8-1·8-2번 출구는 9호선 대합실)", "Line 9: transfer point at the Jamwon end of B2 (Exits 8-1·8-2 via Line 9)"),
      note("🚌", "경부선·영동선 버스 타는 곳은 B1 대합실에서 이어져요.", "The Gyeongbu and Yeongdong bus terminals connect from the B1 concourse."),
    ],
  }),
  교대역: map("340", "kyodae", [N.nambu, N.expressBus], underground("B1", "B3"), {
    platformEv: 0.55,
    gate: 0.45,
    exitEv: 0.55,
    exit: exitNo("12"),
    notes: [
      note(
        "🛗",
        "엘리베이터 하나로 승강장(B3) ↔ 대합실(B1) ↔ 지상(12번 출구 쪽)이 이어져요.",
        "One lift links the B3 platform, B1 concourse and the street (Exit 12 side).",
      ),
      note("🔁", "2호선: B2 '갈아타는 곳' (1~7번 출구는 2호선 대합실)", "Line 2: B2 transfer point (Exits 1–7 via Line 2)"),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  남부터미널역: map("341", "nambu", [N.kyodae, N.yangjae], UNDER_DEEP, {
    platformEv: 0.29,
    gate: 0.34,
    exitEv: 0.64,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🚌", "4-1·4-2번 출구는 B2 대합실 양재 방면 통로로 나가요.", "Exits 4-1·4-2 are via the passage at the Yangjae end of B2."),
      toilet("B2 교대 방면", "B2, Kyodae side"),
    ],
  }),
  양재역: map("342", "yangjae", [N.nambu, N.maebong], UNDER, {
    platformEv: 0.21,
    gate: 0.3,
    exitEv: 0.28,
    exit: exitNo("1·12"),
    notes: [
      note("🛗", "승강장 엘리베이터는 남부터미널 방면 끝에 있어요.", "The platform lift is at the Nambu Bus Terminal end."),
      note(
        "🔁",
        "신분당선: B2 승강장 가운데 '갈아타는 곳' → 환승통로 (7~10번 출구는 신분당선 대합실)",
        "Shinbundang: mid-platform transfer point on B2 → passage (Exits 7–10 via Shinbundang)",
      ),
      toilet("B1 매봉 방면", "B1, Maebong side"),
    ],
  }),
  매봉역: map("343", "maebong", [N.yangjae, N.dogok], UNDER, {
    platformEv: 0.51,
    gate: 0.31,
    exitEv: 0.18,
    exit: exitNo("1"),
    notes: [toilet("B1 대합실 가운데", "middle of the B1 concourse")],
  }),
  도곡역: map("344", "dogok", [N.maebong, N.daechi], underground("B2", "B4"), {
    platformEv: 0.62,
    gate: 0.55,
    exitEv: 0.62,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터 하나로 승강장(B4) ↔ 대합실 ↔ 지상이 이어져요.", "One lift links the B4 platform, the concourse and the street."),
      note("🔁", "수인분당선: B4 승강장 가운데 '갈아타는 곳' → B6 수인분당선 승강장", "Suin–Bundang: mid-platform transfer point on B4 → B6 platform"),
      toilet("B1·B2 매봉 방면", "B1/B2, Maebong side"),
    ],
  }),
  대치역: map("345", "daechi", [N.dogok, N.hangnyeoul], underground("B1", "B3"), {
    platformEv: 0.13,
    gate: 0.21,
    exitEv: 0.33,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터는 도곡 방면 끝에 모여 있어요.", "The lifts are grouped at the Dogok end."),
      toilet("B1 학여울 방면", "B1, Hangnyeoul side"),
    ],
  }),
  학여울역: map("346", "hangnyeoul", [N.daechi, N.daecheong], underground("B4", "B5"), {
    platformEv: 0.51,
    gate: 0.38,
    exitEv: 0.51,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🛗",
        "엘리베이터 하나로 승강장(B5) ↔ 대합실(B4) ↔ 지상이 이어져요.",
        "One lift links the B5 platform, B4 concourse and the street.",
      ),
      note("ℹ️", "출구는 1번 하나뿐이에요.", "There is only one exit (Exit 1)."),
      toilet("B4 대치 방면", "B4, Daechi side"),
    ],
  }),
  대청역: map("347", "daecheong", [N.hangnyeoul, N.irwon], UNDER_DEEP, {
    platformEv: 0.54,
    gate: 0.44,
    exitEv: 0.27,
    exit: STREET_LIFT_EXIT,
    notes: [toilet("B2 대합실 가운데", "middle of the B2 concourse")],
  }),
  일원역: map("348", "irwon", [N.daecheong, N.suseo], UNDER_DEEP, {
    platformEv: 0.54,
    gate: 0.5,
    exitEv: 0.34,
    exit: exitNo("6"),
    notes: [toilet("B2 대청 방면", "B2, Daecheong side")],
  }),
  수서역: map("349", "suseo", [N.irwon, N.garak], UNDER, {
    platformEv: 0.74,
    gate: 0.51,
    exitEv: 0.41,
    exit: STREET_LIFT_EXIT,
    notes: [
      note(
        "🔁",
        "수인분당선: B2 승강장 '갈아타는 곳' → 환승통로 → B3·B4 수인분당선",
        "Suin–Bundang: B2 transfer point → passage → B3/B4 Suin–Bundang",
      ),
      note("🚄", "SRT·GTX는 B1 대합실 5-1·5-2번 '나가는 곳' 방면이에요.", "For SRT/GTX, follow Exits 5-1·5-2 from the B1 concourse."),
      toilet("B1 일원 방면 · 가운데", "B1, Irwon side and middle"),
    ],
  }),
  가락시장역: map("350", "garak", [N.policeHospital, N.suseo], underground("B2", "B4"), {
    platformEv: 0.47,
    gate: 0.3,
    exitEv: 0.23,
    exit: exitNo("7"),
    notes: [
      note("🔁", "8호선: B3 대합실 경찰병원 방면 '갈아타는 곳' (1~6번 출구는 8호선 대합실)", "Line 8: transfer point at the Police Hospital end of B3 (Exits 1–6 via Line 8)"),
      toilet("B2 경찰병원 방면", "B2, Police Hospital side"),
    ],
  }),
  경찰병원역: map("351", "policehospital", [N.garak, N.ogeum], underground("B1", "B3"), {
    platformEv: 0.4,
    gate: 0.21,
    exitEv: 0.16,
    exit: exitNo("1"),
    notes: [toilet("B1 대합실 가운데", "middle of the B1 concourse")],
  }),
  오금역: map("352", "ogeum", [N.policeHospital, N.ogeumEnd], underground("B1", "B4"), {
    platformEv: 0.53,
    gate: 0.25,
    exitEv: 0.53,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "엘리베이터 하나로 승강장(B4)에서 지상까지 이어져요.", "One lift runs from the B4 platform to the street."),
      note("🔁", "5호선: B3 대합실 '갈아타는 곳' (3~7번 출구는 5호선 대합실)", "Line 5: B3 transfer point (Exits 3–7 via Line 5)"),
      toilet("B1 경찰병원 방면", "B1, Police Hospital side"),
    ],
  }),
};
