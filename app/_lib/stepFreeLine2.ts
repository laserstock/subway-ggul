import type { Localized } from "./stations";
import {
  CONCOURSE_EXITS_LABEL,
  ELEVATED_2F,
  ELEVATED_3F,
  exitNo,
  LINE2,
  LINE2_BRANCH,
  note,
  PASSAGE_LABEL,
  SAME_FLOOR_LABEL,
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
  cityHall: { ko: "시청", en: "City Hall", zh: "市厅", ja: "市庁" },
  euljiro1ga: { ko: "을지로입구", en: "Euljiro 1-ga", zh: "乙支路入口", ja: "乙支路入口" },
  euljiro3ga: { ko: "을지로3가", en: "Euljiro 3-ga", zh: "乙支路3街", ja: "乙支路3街" },
  euljiro4ga: { ko: "을지로4가", en: "Euljiro 4-ga", zh: "乙支路4街", ja: "乙支路4街" },
  ddp: { ko: "동대문역사문화공원", en: "DDP", zh: "东大门历史文化公园", ja: "東大門歴史文化公園" },
  sindang: { ko: "신당", en: "Sindang", zh: "新堂", ja: "新堂" },
  sangwangsimni: { ko: "상왕십리", en: "Sangwangsimni", zh: "上往十里", ja: "上往十里" },
  wangsimni: { ko: "왕십리", en: "Wangsimni", zh: "往十里", ja: "往十里" },
  hanyang: { ko: "한양대", en: "Hanyang Univ.", zh: "汉阳大学", ja: "漢陽大" },
  ttukseom: { ko: "뚝섬", en: "Ttukseom", zh: "纛岛", ja: "纛島" },
  seongsu: { ko: "성수", en: "Seongsu", zh: "圣水", ja: "聖水" },
  konkuk: { ko: "건대입구", en: "Konkuk Univ.", zh: "建大入口", ja: "建大入口" },
  guui: { ko: "구의", en: "Guui", zh: "九宜", ja: "九宜" },
  gangbyeon: { ko: "강변", en: "Gangbyeon", zh: "江边", ja: "江辺" },
  jamsillaru: { ko: "잠실나루", en: "Jamsillaru", zh: "蚕室渡口", ja: "蚕室ナル" },
  jamsil: { ko: "잠실", en: "Jamsil", zh: "蚕室", ja: "蚕室" },
  jamsilsaenae: { ko: "잠실새내", en: "Jamsilsaenae", zh: "蚕室新内", ja: "蚕室セネ" },
  sportsComplex: { ko: "종합운동장", en: "Sports Complex", zh: "综合运动场", ja: "総合運動場" },
  samseong: { ko: "삼성", en: "Samseong", zh: "三成", ja: "三成" },
  seolleung: { ko: "선릉", en: "Seolleung", zh: "宣陵", ja: "宣陵" },
  yeoksam: { ko: "역삼", en: "Yeoksam", zh: "驿三", ja: "駅三" },
  gangnam: { ko: "강남", en: "Gangnam", zh: "江南", ja: "江南" },
  kyodae: { ko: "교대", en: "Seoul Nat'l Univ. of Education", zh: "教大", ja: "教大" },
  seocho: { ko: "서초", en: "Seocho", zh: "瑞草", ja: "瑞草" },
  bangbae: { ko: "방배", en: "Bangbae", zh: "方背", ja: "方背" },
  sadang: { ko: "사당", en: "Sadang", zh: "舍堂", ja: "舎堂" },
  nakseongdae: { ko: "낙성대", en: "Nakseongdae", zh: "落星垈", ja: "落星垈" },
  snu: { ko: "서울대입구", en: "Seoul Nat'l Univ.", zh: "首尔大入口", ja: "ソウル大入口" },
  bongcheon: { ko: "봉천", en: "Bongcheon", zh: "奉天", ja: "奉天" },
  sillim: { ko: "신림", en: "Sillim", zh: "新林", ja: "新林" },
  sindaebang: { ko: "신대방", en: "Sindaebang", zh: "新大方", ja: "新大方" },
  guroDigital: { ko: "구로디지털단지", en: "Guro Digital Complex", zh: "九老数码园区", ja: "九老デジタル団地" },
  daerim: { ko: "대림", en: "Daerim", zh: "大林", ja: "大林" },
  sindorimWest: { ko: "문래·도림천", en: "Mullae · Dorimcheon", zh: "文来 · 道林川", ja: "文来 · 道林川" },
  sindorim: { ko: "신도림", en: "Sindorim", zh: "新道林", ja: "新道林" },
  dorimcheon: { ko: "도림천", en: "Dorimcheon", zh: "道林川", ja: "道林川" },
  yangcheon: { ko: "양천구청", en: "Yangcheon-gu Office", zh: "阳川区厅", ja: "陽川区庁" },
  sinjeong: { ko: "신정네거리", en: "Sinjeongnegeori", zh: "新亭十字路口", ja: "新亭四つ角" },
  kkachisan: { ko: "까치산", en: "Kkachisan", zh: "喜鹊山", ja: "カチサン" },
  mullae: { ko: "문래", en: "Mullae", zh: "文来", ja: "文来" },
  yeongdeungpo: { ko: "영등포구청", en: "Yeongdeungpo-gu Office", zh: "永登浦区厅", ja: "永登浦区庁" },
  dangsan: { ko: "당산", en: "Dangsan", zh: "堂山", ja: "堂山" },
  hapjeong: { ko: "합정", en: "Hapjeong", zh: "合井", ja: "合井" },
  hongik: { ko: "홍대입구", en: "Hongik Univ.", zh: "弘大入口", ja: "弘大入口" },
  sinchon: { ko: "신촌", en: "Sinchon", zh: "新村", ja: "新村" },
  ewha: { ko: "이대", en: "Ewha Womans Univ.", zh: "梨大", ja: "梨大" },
  ahyeon: { ko: "아현", en: "Ahyeon", zh: "阿岘", ja: "阿峴" },
  chungjeongno: { ko: "충정로", en: "Chungjeongno", zh: "忠正路", ja: "忠正路" },
  seongsuWest: { ko: "뚝섬·용답", en: "Ttukseom · Yongdap", zh: "纛岛 · 龙踏", ja: "纛島 · 龍踏" },
  yongdap: { ko: "용답", en: "Yongdap", zh: "龙踏", ja: "龍踏" },
  sindap: { ko: "신답", en: "Sindap", zh: "新踏", ja: "新踏" },
  yongdu: { ko: "용두", en: "Yongdu", zh: "龙头", ja: "龍頭" },
  sinseoldong: { ko: "신설동", en: "Sinseol-dong", zh: "新设洞", ja: "新設洞" },
  sinseoldongEnd: { ko: "신설동(종착)", en: "Sinseol-dong (terminal)", zh: "新设洞（终点）", ja: "新設洞（終点）" },
} satisfies Record<string, Localized>;

const UNDER = underground();
const UNDER_DEEP = underground("B2", "B3");

function main(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE2, "line2", code, slug, ends, layout, route);
}

function branch(code: string, slug: string, ends: readonly [Localized, Localized], layout: StepFreeLayout, route: StepFreeRoute) {
  return stationMap(LINE2_BRANCH, "line2", code, slug, ends, layout, route);
}

/** Keyed by Korean station name as stored in `StationOption.name.ko`. */
export const LINE2_MAPS: Record<string, StepFreeMap> = {
  시청역: main("201", "cityhall", [N.euljiro1ga, N.chungjeongno], underground("B1", "B3"), {
    platformEv: 0.55,
    gate: 0.62,
    exitEv: 0.95,
    exit: exitNo("9"),
    notes: [
      note("🛗", "승강장(B3)에서 엘리베이터 한 번으로 B1 대합실까지 올라가요.", "One lift goes straight from the B3 platform to the B1 concourse."),
      note(
        "🔁",
        "1호선: B1 대합실 을지로입구 방면 끝 '갈아타는 곳' (1~7번 출구는 1호선 대합실 이용)",
        "Line 1: transfer point at the Euljiro 1-ga end of B1 (Exits 1–7 via the Line 1 concourse)",
      ),
      toilet("B1 9번 출구 쪽 · B2 을지로입구 방면", "B1 by Exit 9 · B2, Euljiro 1-ga end"),
    ],
  }),
  을지로입구역: main("202", "euljiro1ga", [N.cityHall, N.euljiro3ga], UNDER, {
    platformEv: 0.5,
    gate: 0.55,
    exitEv: 0.59,
    exit: exitNo("1"),
    notes: [
      note("🛗", "을지로3가 방면 끝(4·5번 출구 쪽)에도 지상 엘리베이터가 있어요.", "Another street lift is at the Euljiro 3-ga end (Exits 4·5)."),
      note("🛍️", "시청 방면 끝은 을지로 지하보도와 이어져요.", "The City Hall end connects to the Euljiro underground walkway."),
      toilet("B1 을지로3가 방면 끝", "Euljiro 3-ga end of B1"),
    ],
  }),
  을지로3가역: main("203", "euljiro3ga", [N.euljiro4ga, N.euljiro1ga], UNDER, {
    platformEv: 0.37,
    gate: 0.5,
    exitEv: 0.37,
    exit: exitNo("6"),
    notes: [
      note("🛗", "엘리베이터 하나로 승강장 ↔ 대합실 ↔ 지상(6번 출구 쪽)이 이어져요.", "One lift links the platform, concourse and street (Exit 6 side)."),
      note(
        "🔁",
        "3호선: B2 승강장 을지로4가 방면 '갈아타는 곳' (3~10번 출구는 3호선 대합실)",
        "Line 3: transfer point at the Euljiro 4-ga end of B2 (Exits 3–10 via Line 3)",
      ),
      toilet("B1 을지로4가 방면", "B1, Euljiro 4-ga side"),
    ],
  }),
  을지로4가역: main("204", "euljiro4ga", [N.euljiro3ga, N.ddp], UNDER, {
    platformEv: 0.21,
    gate: 0.5,
    exitEv: 0.78,
    exit: exitNo("5·8"),
    notes: [
      note(
        "🔁",
        "5호선: B2 승강장 가운데 '갈아타는 곳' → 환승통로 (3·4번 출구는 5호선 대합실)",
        "Line 5: transfer point mid-platform on B2 → passage (Exits 3·4 via Line 5)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  동대문역사문화공원역: main("205", "ddp", [N.euljiro4ga, N.sindang], UNDER, {
    platformEv: 0.69,
    gate: 0.5,
    exitEv: 0.32,
    exit: exitNo("1"),
    notes: [
      note(
        "🔁",
        "4·5호선: B1 대합실 을지로4가 방면 '타는 곳' (4·5·8·9·10번은 4호선, 6·7번은 5호선 쪽)",
        "Lines 4·5: boarding point at the Euljiro 4-ga end of B1 (Exits 4·5·8–10 via Line 4, 6·7 via Line 5)",
      ),
      note("🛍️", "11~14번 출구는 을지로 지하보도를 이용해요.", "Exits 11–14 are via the Euljiro underground walkway."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  신당역: main("206", "sindang", [N.ddp, N.sangwangsimni], UNDER, {
    platformEv: 0.49,
    gate: 0.65,
    exitEv: 0.84,
    exit: exitNo("2"),
    notes: [
      note(
        "🔁",
        "6호선: B1·B2 동대문역사문화공원 방면 '갈아타는 곳' (5~12번 출구는 6호선 대합실)",
        "Line 6: transfer point at the DDP end of B1/B2 (Exits 5–12 via Line 6)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  상왕십리역: main("207", "sangwangsimni", [N.wangsimni, N.sindang], UNDER, {
    platformEv: 0.35,
    gate: 0.3,
    exitEv: 0.22,
    exit: exitNo("2·4"),
    notes: [toilet("B1 1-1·5번 출구 쪽", "B1, near Exits 1-1·5")],
  }),
  왕십리역: main("208", "wangsimni", [N.sangwangsimni, N.hanyang], UNDER, {
    platformEv: 0.39,
    gate: 0.5,
    exitEv: 0.39,
    exit: exitNo("4·5"),
    notes: [
      note(
        "🛗",
        "같은 엘리베이터로 지상 ↔ B1 대합실 ↔ B2 승강장 ↔ B4 5호선 대합실까지 이어져요.",
        "The same lift links the street, B1 concourse, B2 platform and the B4 Line 5 concourse.",
      ),
      note(
        "🔁",
        "경의중앙·수인분당선: B1 대합실 '갈아타는 곳' (6-1번 출구 방면) → 1F·2F",
        "Gyeongui–Jungang / Suin–Bundang: B1 transfer point (toward Exit 6-1) → 1F/2F",
      ),
      toilet("B1 한양대 방면", "B1, Hanyang Univ. side"),
    ],
  }),
  한양대역: main(
    "209",
    "hanyang",
    [N.wangsimni, N.ttukseom],
    {
      levels: [
        { floor: "2F", kind: "concourse" },
        {
          floor: "1F",
          kind: "platform",
          label: { ko: "승강장 · 출구", en: "Platform · Exits", zh: "站台 · 出口", ja: "ホーム · 出口" },
        },
      ],
      exitLevel: 1,
      gateLevel: 0,
      platformLevel: 1,
    },
    {
      platformEv: 0.31,
      gate: 0.42,
      exitEv: 0.52,
      exit: exitNo("4"),
      notes: [
        note(
          "⬆️",
          "한양대는 대합실(2F)이 승강장(1F)보다 위에 있어요. 엘리베이터로 올라가 개찰구를 지난 뒤 다시 내려가요.",
          "The concourse (2F) is above the platform (1F): ride up, pass the gates, then ride down to the street.",
        ),
        note("🛗", "2번 출구(한양대 캠퍼스 방면)도 2F 대합실에서 엘리베이터로 이어져요.", "Exit 2 (campus side) also has a lift from the 2F concourse."),
        toilet("2F 대합실 가운데", "middle of the 2F concourse"),
      ],
    },
  ),
  뚝섬역: main("210", "ttukseom", [N.seongsu, N.hanyang], ELEVATED_3F, {
    platformEv: 0.45,
    gate: 0.37,
    exitEv: 0.29,
    exit: exitNo("3·6"),
    notes: [
      note("🛗", "한양대 방면에도 3F ↔ 2F 엘리베이터가 하나 더 있어요.", "There is a second 3F ↔ 2F lift toward Hanyang Univ."),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  성수역: main("211", "seongsu", [N.seongsuWest, N.konkuk], ELEVATED_3F, {
    platformEv: 0.57,
    gate: 0.47,
    exitEv: 0.37,
    exit: exitNo("1"),
    notes: [
      note("🚇", "성수지선(용답·신답·신설동 방면)도 3F 승강장에서 타요.", "Seongsu branch trains (to Yongdap/Sinseol-dong) also leave from the 3F platform."),
      toilet("2F 대합실 건대입구 방면", "2F, Konkuk Univ. side"),
    ],
  }),
  건대입구역: main("212", "konkuk", [N.seongsu, N.guui], ELEVATED_3F, {
    platformEv: 0.2,
    gate: 0.3,
    exitEv: 0.18,
    exit: exitNo("1·6"),
    notes: [
      note(
        "🔁",
        "7호선: 3F 승강장 '갈아타는 곳' → 2F → 지하 7호선 승강장 (3·4번 출구는 7호선 대합실)",
        "Line 7: 3F transfer point → 2F → underground Line 7 (Exits 3·4 via Line 7)",
      ),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  구의역: main("213", "guui", [N.konkuk, N.gangbyeon], ELEVATED_3F, {
    platformEv: 0.6,
    gate: 0.45,
    exitEv: 0.6,
    exit: { ko: "E/V 전용 출입구", en: "Lift entrance", zh: "电梯出入口", ja: "EV出入口" },
    notes: [
      note("🛗", "엘리베이터 하나로 3F 승강장 ↔ 2F 대합실 ↔ 지상이 이어져요.", "One lift links the 3F platform, 2F concourse and the street."),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  강변역: main("214", "gangbyeon", [N.guui, N.jamsillaru], ELEVATED_2F, {
    platformEv: 0.25,
    gate: 0.3,
    exitEv: 0.36,
    exit: exitNo("1·4"),
    notes: [
      note("⬇️", "대합실이 지상(1F)이라 엘리베이터 한 번이면 밖이에요.", "The concourse is at street level, so one lift ride takes you outside."),
      toilet("1F 대합실 가운데", "middle of the 1F concourse"),
    ],
  }),
  잠실나루역: main("215", "jamsillaru", [N.gangbyeon, N.jamsil], ELEVATED_2F, {
    platformEv: 0.25,
    gate: 0.32,
    exitEv: 0.39,
    exit: exitNo("1·4"),
    notes: [
      note("🌳", "강변 방면 끝 통로로 한강공원 방면에 갈 수 있어요.", "The passage at the Gangbyeon end leads toward Hangang Park."),
      toilet("1F 대합실 가운데", "middle of the 1F concourse"),
    ],
  }),
  잠실역: main("216", "jamsil", [N.jamsilsaenae, N.jamsillaru], UNDER, {
    platformEv: 0.57,
    gate: 0.68,
    exitEv: 0.8,
    exit: exitNo("1"),
    notes: [
      note(
        "🔁",
        "8호선: B1 대합실 잠실나루 방면 끝 '갈아타는 곳' (9~11번 출구는 8호선 대합실)",
        "Line 8: transfer point at the Jamsillaru end of B1 (Exits 9–11 via Line 8)",
      ),
      note("🛗", "4·5번 출구 쪽(잠실새내 방면)에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 4·5 (Jamsilsaenae end)."),
      toilet("B1 2번 출구 쪽", "B1, near Exit 2"),
    ],
  }),
  잠실새내역: main("217", "jamsilsaenae", [N.jamsil, N.sportsComplex], UNDER, {
    platformEv: 0.58,
    gate: 0.62,
    exitEv: 0.68,
    exit: exitNo("2·7"),
    notes: [toilet("B1 2·7번 출구 쪽", "B1, near Exits 2·7")],
  }),
  종합운동장역: main("218", "sportscomplex", [N.samseong, N.jamsilsaenae], UNDER, {
    platformEv: 0.64,
    gate: 0.53,
    exitEv: 0.42,
    exit: exitNo("6"),
    notes: [
      note("🔁", "9호선: B1 대합실 잠실새내 방면 끝 '갈아타는 곳' (9번 출구 방면)", "Line 9: transfer point at the Jamsilsaenae end of B1 (toward Exit 9)"),
      toilet("B1 양쪽 끝", "both ends of B1"),
    ],
  }),
  삼성역: main("219", "samseong", [N.sportsComplex, N.seolleung], UNDER, {
    platformEv: 0.33,
    gate: 0.22,
    exitEv: 0.11,
    exit: exitNo("1"),
    notes: [
      note("🛗", "3번, 4·5번 출구 쪽에도 지상 엘리베이터가 있어요.", "There are also street lifts near Exit 3 and Exits 4·5."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  선릉역: main("220", "seolleung", [N.samseong, N.yeoksam], UNDER, {
    platformEv: 0.24,
    gate: 0.19,
    exitEv: 0.14,
    exit: exitNo("1·10"),
    notes: [
      note("🔁", "수인분당선: B2 승강장 역삼 방면 '갈아타는 곳' → 분당선 승강장", "Suin–Bundang: transfer point at the Yeoksam end of B2 → Bundang platform"),
      note("🛗", "4·5번 출구 쪽(역삼 방면)에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 4·5 (Yeoksam end)."),
      toilet("B1 삼성 방면", "B1, Samseong side"),
    ],
  }),
  역삼역: main("221", "yeoksam", [N.seolleung, N.gangnam], UNDER_DEEP, {
    platformEv: 0.67,
    gate: 0.74,
    exitEv: 0.83,
    exit: exitNo("3·4"),
    notes: [
      note("ℹ️", "역삼은 대합실이 B2예요 (B1은 선릉 방면 일부 출구 통로).", "The main concourse is on B2 (B1 is only an exit passage at the Seolleung end)."),
      toilet("B2 대합실 가운데", "middle of the B2 concourse"),
    ],
  }),
  강남역: main("222", "gangnam", [N.yeoksam, N.kyodae], UNDER, {
    platformEv: 0.71,
    gate: 0.78,
    exitEv: 0.86,
    exit: exitNo("10"),
    notes: [
      note(
        "🔁",
        "신분당선: B2 승강장 가운데 '갈아타는 곳' → 환승통로 (3~6번 출구는 신분당선 대합실)",
        "Shinbundang: mid-platform transfer point on B2 → passage (Exits 3–6 via Shinbundang)",
      ),
      toilet("B1 양쪽 끝", "both ends of B1"),
    ],
  }),
  교대역: main("223", "kyodae", [N.seocho, N.gangnam], UNDER, {
    platformEv: 0.41,
    gate: 0.36,
    exitEv: 0.31,
    exit: exitNo("6"),
    notes: [
      note("🔁", "3호선: B2 승강장 서초 방면 '갈아타는 곳' (12~14번 출구는 3호선 대합실)", "Line 3: transfer point at the Seocho end of B2 (Exits 12–14 via Line 3)"),
      toilet("B1 강남 방면", "B1, Gangnam side"),
    ],
  }),
  서초역: main("224", "seocho", [N.kyodae, N.bangbae], UNDER, {
    platformEv: 0.19,
    gate: 0.25,
    exitEv: 0.32,
    exit: exitNo("2"),
    notes: [
      note("🛗", "3·6번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 3·6."),
      toilet("B1 교대 방면 끝", "B1, Kyodae end"),
    ],
  }),
  방배역: main("225", "bangbae", [N.seocho, N.sadang], UNDER, {
    platformEv: 0.75,
    gate: 0.7,
    exitEv: 0.64,
    exit: exitNo("2·3"),
    notes: [toilet("B1 서초 방면 끝", "B1, Seocho end")],
  }),
  사당역: main("226", "sadang", [N.bangbae, N.nakseongdae], UNDER, {
    platformEv: 0.42,
    gate: 0.31,
    exitEv: 0.21,
    exit: exitNo("14"),
    notes: [
      note("🔁", "4호선: 대합실 가운데 엘리베이터로 4호선 승강장까지 이어져요 (3·4·9~12번 출구는 4호선 대합실).", "Line 4: the mid-concourse lift continues to the Line 4 platform (Exits 3·4·9–12 via Line 4)."),
      note("🛗", "6·7번 출구 쪽(낙성대 방면)에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 6·7 (Nakseongdae end)."),
      toilet("B1 양쪽 끝", "both ends of B1"),
    ],
  }),
  낙성대역: main("227", "nakseongdae", [N.sadang, N.snu], UNDER, {
    platformEv: 0.81,
    gate: 0.65,
    exitEv: 0.5,
    exit: exitNo("3"),
    notes: [toilet("B1 서울대입구 방면 끝", "B1, Seoul Nat'l Univ. end")],
  }),
  서울대입구역: main("228", "snu", [N.nakseongdae, N.bongcheon], UNDER, {
    platformEv: 0.71,
    gate: 0.64,
    exitEv: 0.57,
    exit: exitNo("6"),
    notes: [
      note("🛗", "2·7번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 2·7."),
      toilet("B1 낙성대 방면", "B1, Nakseongdae side"),
    ],
  }),
  봉천역: main("229", "bongcheon", [N.snu, N.sillim], UNDER, {
    platformEv: 0.58,
    gate: 0.66,
    exitEv: 0.75,
    exit: exitNo("3"),
    notes: [toilet("B1 대합실 가운데", "middle of the B1 concourse")],
  }),
  신림역: main("230", "sillim", [N.bongcheon, N.sindaebang], UNDER, {
    platformEv: 0.33,
    gate: 0.24,
    exitEv: 0.14,
    exit: exitNo("8"),
    notes: [
      note("🔁", "신림선: B1 대합실 가운데 '갈아타는 곳' → 신림선 B3 승강장", "Sillim Line: transfer point mid-B1 → Sillim Line platform (B3)"),
      note("🛗", "3·6번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 3·6."),
      toilet("B1 신대방 방면", "B1, Sindaebang side"),
    ],
  }),
  신대방역: main("231", "sindaebang", [N.sillim, N.guroDigital], ELEVATED_3F, {
    platformEv: 0.31,
    gate: 0.38,
    exitEv: 0.45,
    exit: exitNo("1"),
    notes: [toilet("2F 대합실 신림 방면", "2F, Sillim side")],
  }),
  구로디지털단지역: main("232", "gurodigital", [N.sindaebang, N.daerim], ELEVATED_3F, {
    platformEv: 0.35,
    gate: 0.28,
    exitEv: 0.21,
    exit: exitNo("1"),
    notes: [
      note("🛗", "3·4번 출구 쪽(대림 방면)에도 2F ↔ 지상 엘리베이터가 있어요.", "There is also a 2F ↔ street lift near Exits 3·4 (Daerim end)."),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  대림역: main("233", "daerim", [N.guroDigital, N.sindorim], ELEVATED_3F, {
    platformEv: 0.25,
    gate: 0.2,
    exitEv: 0.14,
    exit: exitNo("1·8"),
    notes: [
      note("🔁", "7호선: 2F 대합실 '갈아타는 곳' → B1 7호선 대합실 (9~12번 출구)", "Line 7: 2F transfer point → B1 Line 7 concourse (Exits 9–12)"),
      note("🛗", "신도림 방면 끝(3·6, 4·5번 출구 쪽)에도 엘리베이터가 있어요.", "There are also lifts at the Sindorim end (Exits 3·6, 4·5)."),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  신도림역: main("234", "sindorim", [N.sindorimWest, N.daerim], UNDER, {
    platformEv: 0.34,
    gate: 0.25,
    exitEv: 0.14,
    exit: exitNo("1"),
    notes: [
      note("🔁", "1호선: B1 대합실 가운데 '갈아타는 곳' (4·5·6번 출구 방면) → 1F 1호선 승강장", "Line 1: mid-B1 transfer point (toward Exits 4–6) → 1F Line 1 platform"),
      note("🚇", "까치산 방면(신정지선) 열차도 같은 B2 승강장에서 타요.", "Sinjeong branch trains (to Kkachisan) also leave from the B2 platform."),
      toilet("B1 문래 방면", "B1, Mullae side"),
    ],
  }),
  도림천역: branch(
    "234-1",
    "dorimcheon",
    [N.sindorim, N.yangcheon],
    {
      levels: [
        { floor: "1F", kind: "concourse", label: CONCOURSE_EXITS_LABEL },
        { floor: "B3", kind: "platform" },
      ],
      exitLevel: 0,
      gateLevel: 0,
      platformLevel: 1,
    },
    {
      platformEv: 0.76,
      gate: 0.6,
      exitEv: 0.45,
      exit: exitNo("1"),
      notes: [
        note("🛗", "엘리베이터 하나로 B3 승강장에서 1F 대합실까지 바로 올라가요.", "One lift goes straight from the B3 platform up to the 1F concourse."),
        toilet("1F 대합실", "1F concourse"),
      ],
    },
  ),
  양천구청역: branch("234-2", "yangcheon", [N.dorimcheon, N.sinjeong], UNDER, {
    platformEv: 0.38,
    gate: 0.34,
    exitEv: 0.31,
    exit: exitNo("1"),
    notes: [toilet("B1 대합실 가운데", "middle of the B1 concourse")],
  }),
  신정네거리역: branch("234-3", "sinjeong4", [N.yangcheon, N.kkachisan], UNDER_DEEP, {
    platformEv: 0.48,
    gate: 0.56,
    exitEv: 0.64,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🛗", "지상 엘리베이터는 역 가운데에 있고, B2 대합실로 바로 이어져요.", "The street lift is in the middle of the station and goes straight to the B2 concourse."),
      toilet("B1 까치산 방면", "B1, Kkachisan side"),
    ],
  }),
  문래역: main("235", "mullae", [N.yeongdeungpo, N.sindorim], UNDER, {
    platformEv: 0.34,
    gate: 0.3,
    exitEv: 0.26,
    exit: exitNo("2"),
    notes: [
      note("🛗", "5·6번 출구 쪽(신도림 방면)에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 5·6 (Sindorim end)."),
      toilet("B1 영등포구청 방면 끝", "B1, Yeongdeungpo-gu Office end"),
    ],
  }),
  영등포구청역: main("236", "yeongdeungpo", [N.mullae, N.dangsan], UNDER, {
    platformEv: 0.74,
    gate: 0.66,
    exitEv: 0.58,
    exit: exitNo("2"),
    notes: [
      note("🔁", "5호선: B2 승강장 문래 방면 끝 '갈아타는 곳' (6·7번 출구는 5호선 대합실)", "Line 5: transfer point at the Mullae end of B2 (Exits 6·7 via Line 5)"),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  당산역: main("237", "dangsan", [N.yeongdeungpo, N.hapjeong], ELEVATED_3F, {
    platformEv: 0.81,
    gate: 0.86,
    exitEv: 0.93,
    exit: exitNo("3·4"),
    notes: [
      note("🔁", "9호선: 2F 대합실 '갈아타는 곳' → B1·B2 9호선 대합실 (7~13번 출구)", "Line 9: 2F transfer point → B1/B2 Line 9 concourse (Exits 7–13)"),
      note("🛗", "영등포구청 방면 엘리베이터는 9호선 대합실(B2)까지 내려가요.", "The lift at the Yeongdeungpo-gu Office end goes down to the Line 9 concourse (B2)."),
      toilet("2F 대합실 가운데", "middle of the 2F concourse"),
    ],
  }),
  합정역: main("238", "hapjeong", [N.dangsan, N.hongik], UNDER, {
    platformEv: 0.57,
    gate: 0.7,
    exitEv: 0.86,
    exit: exitNo("1"),
    notes: [
      note("🔁", "6호선: B2 승강장 당산 방면 '갈아타는 곳' → 환승통로 (8번 출구는 6호선 대합실)", "Line 6: transfer point at the Dangsan end of B2 → passage (Exit 8 via Line 6)"),
      note("🛗", "6·7번 출구 쪽(당산 방면)에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 6·7 (Dangsan end)."),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
  홍대입구역: main("239", "hongik", [N.hapjeong, N.sinchon], UNDER, {
    platformEv: 0.52,
    gate: 0.6,
    exitEv: 0.52,
    exit: exitNo("2·8"),
    notes: [
      note("🛗", "엘리베이터 하나로 승강장 ↔ 대합실 ↔ 지상(2·8번 출구 쪽)이 이어져요.", "One lift links the platform, concourse and street (Exits 2·8)."),
      note(
        "🔁",
        "공항철도·경의중앙선: B1 대합실 신촌 방면 '갈아타는 곳' (5~7번 출구 방면)",
        "AREX / Gyeongui–Jungang: transfer point at the Sinchon end of B1 (toward Exits 5–7)",
      ),
      toilet("B1 대합실", "B1 concourse"),
    ],
  }),
  신촌역: main("240", "sinchon", [N.hongik, N.ewha], UNDER, {
    platformEv: 0.67,
    gate: 0.73,
    exitEv: 0.79,
    exit: exitNo("4"),
    notes: [toilet("B1 이대 방면 끝", "B1, Ewha end")],
  }),
  이대역: main("241", "ewha", [N.ahyeon, N.sinchon], UNDER, {
    platformEv: 0.69,
    gate: 0.5,
    exitEv: 0.29,
    exit: exitNo("6"),
    notes: [
      note(
        "⚠️",
        "이대역은 승강장이 깊고 긴 에스컬레이터 위주예요. 엘리베이터·리프트 위치는 원본 안내도와 현장 안내를 꼭 확인하세요.",
        "The platform is deep and mostly served by long escalators. Check the original map and on-site signs for lifts.",
      ),
      toilet("B1 아현 방면", "B1, Ahyeon side"),
    ],
  }),
  아현역: main("242", "ahyeon", [N.ewha, N.chungjeongno], UNDER, {
    platformEv: 0.73,
    gate: 0.65,
    exitEv: 0.56,
    exit: exitNo("2"),
    notes: [
      note("🛗", "1·4번 출구 쪽에도 지상 엘리베이터가 있어요.", "There is also a street lift near Exits 1·4."),
      toilet("B1 이대 방면", "B1, Ewha side"),
    ],
  }),
  충정로역: main("243", "chungjeongno", [N.ahyeon, N.cityHall], UNDER_DEEP, {
    platformEv: 0.3,
    gate: 0.42,
    exitEv: 0.55,
    exit: STREET_LIFT_EXIT,
    notes: [
      note("🔁", "5호선: B2 대합실 가운데 '갈아타는 곳' (7~10번 출구는 5호선 대합실)", "Line 5: mid-B2 transfer point (Exits 7–10 via Line 5)"),
      toilet("B2 아현 방면", "B2, Ahyeon side"),
    ],
  }),
  용답역: branch("211-1", "yongdap", [N.sindap, N.seongsu], ELEVATED_2F, {
    platformEv: 0.42,
    gate: 0.45,
    exitEv: 0.38,
    exit: exitNo("1"),
    notes: [
      note("↔️", "반대편 승강장은 엘리베이터로 3F 연결통로를 지나 건너가요.", "To reach the opposite platform, take the lift via the 3F overpass."),
      toilet("1F 대합실", "1F concourse"),
    ],
  }),
  신답역: branch(
    "211-2",
    "sindap",
    [N.yongdap, N.yongdu],
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
      platformEv: 0.5,
      gate: 0.35,
      exitEv: 0.2,
      exit: exitNo("1"),
      notes: [
        note("➡️", "대합실과 승강장이 같은 1층이라 엘리베이터 없이 평지로 나가요.", "The concourse and platform share the ground floor, so it is level access."),
        note("↔️", "건너편 승강장은 엘리베이터 → 2F 연결통로로 건너가요.", "For the opposite platform, take the lift up to the 2F overpass."),
      ],
    },
  ),
  용두역: branch(
    "211-3",
    "yongdu",
    [N.sindap, N.sinseoldong],
    {
      levels: [
        STREET,
        { floor: "B1", kind: "platform", label: SAME_FLOOR_LABEL },
        { floor: "B2", kind: "passage", label: PASSAGE_LABEL },
      ],
      exitLevel: 0,
      gateLevel: 1,
      platformLevel: 1,
    },
    {
      platformEv: 0.5,
      gate: 0.4,
      exitEv: 0.28,
      exit: exitNo("4"),
      notes: [
        note("↔️", "건너편 승강장은 신답 방면 끝 엘리베이터 → 지하 연결통로로 건너가요.", "For the opposite platform, take the lift at the Sindap end down to the passage."),
        toilet("대합실 가운데", "middle of the concourse"),
      ],
    },
  ),
  신설동역: branch("211-4", "sinseoldong", [N.sinseoldongEnd, N.yongdu], UNDER, {
    platformEv: 0.68,
    gate: 0.8,
    exitEv: 0.92,
    exit: exitNo("9"),
    notes: [
      note(
        "🔁",
        "1호선·우이신설선: 대합실 '갈아타는 곳' (10번 출구 방면, 1~6·11·12번 출구는 1호선 대합실)",
        "Line 1 / Ui–Sinseol: transfer point toward Exit 10 (Exits 1–6·11·12 via Line 1)",
      ),
      toilet("B1 대합실 가운데", "middle of the B1 concourse"),
    ],
  }),
};
