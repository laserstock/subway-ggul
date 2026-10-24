import type { Localized } from "./i18n";

export type HubTag = "airport" | "ktx" | "exchange" | "luggage" | "shopping" | "tourist";

export const HUB_TAGS: Record<HubTag, { emoji: string; label: Localized }> = {
  airport: { emoji: "✈️", label: { ko: "공항", en: "Airport", zh: "机场", ja: "空港" } },
  ktx: { emoji: "🚄", label: { ko: "KTX·기차", en: "KTX · Trains", zh: "KTX · 火车", ja: "KTX · 列車" } },
  exchange: { emoji: "💱", label: { ko: "환전", en: "Currency exchange", zh: "换钱", ja: "両替" } },
  luggage: { emoji: "🧳", label: { ko: "짐 부치기·배송", en: "Bag check & delivery", zh: "行李托运·配送", ja: "手荷物預け・配送" } },
  shopping: { emoji: "🛍️", label: { ko: "쇼핑", en: "Shopping", zh: "购物", ja: "ショッピング" } },
  tourist: { emoji: "📸", label: { ko: "관광 명소", en: "Sightseeing", zh: "景点", ja: "観光スポット" } },
};

export type HubRoute = {
  emoji: string;
  /** Where the visitor wants to go. */
  to: Localized;
  /** Exit labels as they appear in the station's exit list; empty when the route stays inside the station. */
  exits: string[];
  /** How to get there when there is no exit to point at, or an extra hint next to the exit. */
  via?: Localized;
  tags: HubTag[];
};

const IN_STATION_AREX: Localized = {
  ko: "역 안에서 공항철도(AREX)로 바로 환승",
  en: "Transfer to AREX inside the station",
  zh: "站内直接换乘机场铁路(AREX)",
  ja: "駅構内で空港鉄道(AREX)に直接乗り換え",
};

const AIRPORT_TERMINAL: HubRoute[] = [
  {
    emoji: "🛫",
    to: { ko: "출국장 · 체크인 (3층)", en: "Departures · Check-in (3F)", zh: "出发大厅 · 值机 (3层)", ja: "出国ロビー · チェックイン (3階)" },
    exits: [],
    via: {
      ko: "교통센터에서 엘리베이터·무빙워크로 3층",
      en: "From the Transportation Center, take the elevator or moving walkway to 3F",
      zh: "从交通中心乘电梯或自动步道到3层",
      ja: "交通センターからエレベーター・動く歩道で3階へ",
    },
    tags: ["airport", "exchange"],
  },
  {
    emoji: "🛬",
    to: { ko: "입국장 · 공항버스 (1층)", en: "Arrivals · Airport buses (1F)", zh: "到达大厅 · 机场巴士 (1层)", ja: "入国ロビー · 空港バス (1階)" },
    exits: [],
    via: {
      ko: "교통센터에서 표지판 따라 1층",
      en: "Follow the signs from the Transportation Center to 1F",
      zh: "从交通中心按指示牌前往1层",
      ja: "交通センターから案内表示に従って1階へ",
    },
    tags: ["airport"],
  },
  {
    emoji: "🧳",
    to: { ko: "짐보관 · 수하물 택배", en: "Luggage storage · Bag delivery", zh: "行李寄存 · 行李快递", ja: "荷物預かり · 手荷物宅配" },
    exits: [],
    via: { ko: "터미널 안 안내데스크에 문의", en: "Ask at the terminal information desk", zh: "请咨询航站楼服务台", ja: "ターミナル内の案内所でご確認ください" },
    tags: ["luggage"],
  },
];

/** Hand-picked "where do I come out?" answers for stations visitors use most, keyed by Korean station name. */
export const HUB_GUIDES: Record<string, HubRoute[]> = {
  서울역: [
    {
      emoji: "✈️",
      to: {
        ko: "인천·김포공항 공항철도(AREX)",
        en: "AREX to Incheon & Gimpo Airports",
        zh: "前往仁川·金浦机场的机场铁路(AREX)",
        ja: "仁川・金浦空港行き空港鉄道(AREX)",
      },
      exits: ["15"],
      via: { ko: "15번 출구 방향", en: "Toward Exit 15", zh: "15号出口方向", ja: "15番出口方面" },
      tags: ["airport", "luggage"],
    },
    {
      emoji: "🧳",
      to: {
        ko: "도심공항터미널 · 미리 짐 부치기",
        en: "City Airport Terminal · Early bag check",
        zh: "城市机场航站楼 · 提前托运",
        ja: "都心空港ターミナル · 事前手荷物預け",
      },
      exits: ["15"],
      via: {
        ko: "공항철도 서울역 안 · 일부 항공사만",
        en: "Inside AREX Seoul Station · Selected airlines only",
        zh: "机场铁路首尔站内 · 仅限部分航空公司",
        ja: "空港鉄道ソウル駅構内 · 一部航空会社のみ",
      },
      tags: ["luggage", "airport"],
    },
    {
      emoji: "🚄",
      to: { ko: "KTX·기차 타는 곳", en: "KTX & train platforms", zh: "KTX · 火车乘车处", ja: "KTX・列車乗り場" },
      exits: ["1"],
      tags: ["ktx", "exchange"],
    },
  ],
  명동역: [
    {
      emoji: "🛍️",
      to: { ko: "명동 쇼핑거리 · 환전소", en: "Myeongdong shopping street · Exchange", zh: "明洞购物街 · 换钱所", ja: "明洞ショッピング街 · 両替所" },
      exits: ["6"],
      tags: ["shopping", "exchange"],
    },
    {
      emoji: "🚡",
      to: { ko: "남산 케이블카 · N서울타워", en: "Namsan Cable Car · N Seoul Tower", zh: "南山缆车 · N首尔塔", ja: "南山ケーブルカー · Nソウルタワー" },
      exits: ["3"],
      via: { ko: "도보 약 10분", en: "About 10 min on foot", zh: "步行约10分钟", ja: "徒歩約10分" },
      tags: ["tourist"],
    },
    {
      emoji: "✈️",
      to: { ko: "인천·김포공항 가는 법", en: "Getting to the airports", zh: "前往机场", ja: "空港への行き方" },
      exits: [],
      via: {
        ko: "4호선 서울역에서 공항철도(AREX) 환승",
        en: "Line 4 to Seoul Station, then transfer to AREX",
        zh: "乘4号线到首尔站换乘机场铁路(AREX)",
        ja: "4号線ソウル駅で空港鉄道(AREX)に乗り換え",
      },
      tags: ["airport"],
    },
  ],
  홍대입구역: [
    {
      emoji: "✈️",
      to: {
        ko: "인천·김포공항 공항철도(AREX)",
        en: "AREX to Incheon & Gimpo Airports",
        zh: "前往仁川·金浦机场的机场铁路(AREX)",
        ja: "仁川・金浦空港行き空港鉄道(AREX)",
      },
      exits: [],
      via: IN_STATION_AREX,
      tags: ["airport"],
    },
    {
      emoji: "🎸",
      to: { ko: "홍대 거리 · 걷고싶은거리", en: "Hongdae streets & busking", zh: "弘大街 · 步行街", ja: "弘大ストリート" },
      exits: ["9"],
      tags: ["shopping", "tourist"],
    },
    {
      emoji: "🌳",
      to: { ko: "연남동 · 경의선숲길", en: "Yeonnam-dong · Gyeongui Line Forest Park", zh: "延南洞 · 京义线林荫道", ja: "延南洞 · 京義線森の道" },
      exits: ["3"],
      tags: ["tourist"],
    },
  ],
  김포공항역: [
    {
      emoji: "🛫",
      to: { ko: "국내선 청사", en: "Domestic terminal", zh: "国内航站楼", ja: "国内線ターミナル" },
      exits: [],
      via: {
        ko: "지하 연결통로로 표지판 따라 이동",
        en: "Follow the signs through the underground walkway",
        zh: "沿地下通道按指示牌前往",
        ja: "地下連絡通路を案内表示に従って移動",
      },
      tags: ["airport"],
    },
    {
      emoji: "🌏",
      to: { ko: "국제선 청사", en: "International terminal", zh: "国际航站楼", ja: "国際線ターミナル" },
      exits: [],
      via: {
        ko: "지하 연결통로로 표지판 따라 이동",
        en: "Follow the signs through the underground walkway",
        zh: "沿地下通道按指示牌前往",
        ja: "地下連絡通路を案内表示に従って移動",
      },
      tags: ["airport", "exchange"],
    },
    {
      emoji: "🚆",
      to: { ko: "인천공항 가는 공항철도(AREX)", en: "AREX to Incheon Airport", zh: "前往仁川机场的机场铁路(AREX)", ja: "仁川空港行き空港鉄道(AREX)" },
      exits: [],
      via: IN_STATION_AREX,
      tags: ["airport"],
    },
  ],
  인천공항1터미널역: AIRPORT_TERMINAL,
  인천공항2터미널역: AIRPORT_TERMINAL,
  잠실역: [
    {
      emoji: "🏙️",
      to: { ko: "롯데월드타워 · 롯데월드몰", en: "Lotte World Tower & Mall", zh: "乐天世界塔 · 乐天世界购物中心", ja: "ロッテワールドタワー · モール" },
      exits: ["1", "2"],
      via: { ko: "지하로 연결", en: "Connected underground", zh: "地下直连", ja: "地下で直結" },
      tags: ["shopping", "tourist"],
    },
    {
      emoji: "🎢",
      to: { ko: "롯데월드 어드벤처", en: "Lotte World Adventure", zh: "乐天世界探险乐园", ja: "ロッテワールドアドベンチャー" },
      exits: ["4"],
      via: { ko: "지하로 연결", en: "Connected underground", zh: "地下直连", ja: "地下で直結" },
      tags: ["tourist"],
    },
  ],
};

export function hubGuide(stationName: string): HubRoute[] | null {
  return HUB_GUIDES[stationName] ?? null;
}

/** Routes that leave through this exit, and the tags they add up to (airport first). */
export function hubForExit(routes: HubRoute[] | null, exit: string | null) {
  const matched = exit && routes ? routes.filter((route) => route.exits.includes(exit)) : [];
  const order = Object.keys(HUB_TAGS) as HubTag[];
  const tags = order.filter((tag) => matched.some((route) => route.tags.includes(tag)));
  return { routes: matched, tags };
}
