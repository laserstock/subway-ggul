import type { Localized } from "./i18n";

/** Bump when the About or Editorial Policy copy changes; shown on both pages and used for the sitemap's lastmod. */
export const TRUST_UPDATED = "2026-11-14";

export type TrustSection = { heading: Localized; paragraphs: Localized[] };

export type TrustFeature = {
  icon: "exit" | "elevator" | "luggage" | "restroom" | "transfer" | "route";
  title: Localized;
  body: Localized;
};

export type DataSource = {
  /** The dataset's official (Korean) name in `ko`, so readers can look it up. */
  name: Localized;
  publisher: Localized;
  use: Localized;
  url: string;
};

export const ABOUT_TITLE: Localized = {
  ko: "K-SUB 소개",
  en: "About K-SUB",
  zh: "关于 K-SUB",
  ja: "K-SUBについて",
};

export const EDITORIAL_TITLE: Localized = {
  ko: "데이터 출처 및 편집 정책",
  en: "Data Sources & Editorial Policy",
  zh: "数据来源与编辑方针",
  ja: "データ出典と編集方針",
};

/** `{stations}` is the number of station guides. */
export const ABOUT_DESCRIPTION: Localized = {
  ko: "K-SUB(지하철꿀정보)는 서울·수도권 {stations}개 전철역의 출구, 엘리베이터, 물품보관함, 환승 정보를 여행자를 위해 4개 언어로 안내하는 독립 지하철 가이드예요.",
  en: "K-SUB is an independent Seoul subway guide for travelers: exits, step-free elevators, lockers and transfers for all {stations} stations in Seoul and the capital area, in four languages.",
  zh: "K-SUB 是面向旅客的独立首尔地铁指南，用四种语言介绍首尔及首都圈全部{stations}个车站的出口、无障碍电梯、储物柜和换乘信息。",
  ja: "K-SUBは、ソウル・首都圏の全{stations}駅の出口、エレベーター、コインロッカー、乗り換え情報を旅行者向けに4言語で案内する独立系の地下鉄ガイドです。",
};

export const ABOUT_STORY: TrustSection = {
  heading: { ko: "K-SUB를 만든 이유", en: "Why we built K-SUB", zh: "我们为什么做 K-SUB", ja: "K-SUBを作った理由" },
  paragraphs: [
    {
      ko: "서울 지하철은 빠르고 저렴하며 여행지 대부분을 연결해요. 어려운 건 열차에서 내린 다음이에요. 출구 십여 개 중 어디로 나가야 숙소가 가까운지, 화장실이 개찰구 안에 있는지, 캐리어는 어디에 맡길 수 있는지, 몇 번 칸에 타야 환승 계단이 가까운지. 이런 정보는 이미 있지만 운영기관의 한국어 웹사이트와 공공데이터 파일, 역 안에 들어가야 보이는 안내판에 흩어져 있어요.",
      en: "Seoul's subway is fast, cheap and reaches almost everywhere a traveler wants to go. The hard part starts once you step off the train: which of a dozen exits leads to your hotel, whether the restroom is inside the fare gates, where to leave a suitcase, and which car puts you next to the stairs for your transfer. That information exists, but it is spread across operators' Korean-language websites, open-data files and signs you only see once you are standing in the station.",
      zh: "首尔地铁快捷、便宜，几乎能到达旅客想去的所有地方。真正的难题在下车之后：十几个出口里哪个离酒店最近，洗手间在检票口内还是外，行李箱能寄存在哪里，坐哪节车厢换乘最近。这些信息其实都有，但分散在运营机构的韩文网站、公共数据文件，以及只有进站后才看得到的指示牌上。",
      ja: "ソウルの地下鉄は速くて安く、旅行者が行きたい場所のほとんどにつながっています。難しいのは電車を降りてからです。十数か所ある出口のどれがホテルに近いのか、トイレは改札の内側か外側か、スーツケースはどこに預けられるのか、乗り換えの階段に近いのは何号車か。こうした情報は存在するものの、運営機関の韓国語サイトや公開データのファイル、駅に入って初めて見える案内板に散らばっています。",
    },
    {
      ko: "K-SUB는 이 정보를 역마다 한 페이지로 모아 한국어, 영어, 일본어, 중국어(간체·번체)로 보여 줘요. 승강장에서 헤매기 전에 미리 동선을 정할 수 있도록요.",
      en: "K-SUB brings it together on one page per station, in English, Korean, Japanese and Chinese (Simplified and Traditional), so you can plan the walk before you arrive instead of working it out on the platform.",
      zh: "K-SUB 把这些信息按车站整理成一页，用中文（简体、繁体）、英语、韩语和日语呈现，让您在到达之前就规划好路线，而不必在站台上摸索。",
      ja: "K-SUBはそれを駅ごとに1ページにまとめ、日本語、英語、韓国語、中国語（簡体字・繁体字）で表示します。ホームで迷う前に、到着前から動線を決められるようにするためです。",
    },
  ],
};

export const ABOUT_FEATURES_HEADING: Localized = {
  ko: "역 페이지에서 볼 수 있는 정보",
  en: "What each station page covers",
  zh: "每个车站页面包含的信息",
  ja: "駅ページでわかること",
};

export const ABOUT_FEATURES: TrustFeature[] = [
  {
    icon: "exit",
    title: { ko: "출구 위치 지도", en: "Exits on a map", zh: "出口地图", ja: "出口マップ" },
    body: {
      ko: "번호가 있는 모든 출구의 위치와 출구별 주변 명소, 출구 사이 거리까지 지도로 보여 줘요.",
      en: "Every numbered exit with its position on the map, the landmarks it leads to and how far apart the exits are.",
      zh: "每个编号出口在地图上的位置、通往的周边景点，以及出口之间相距多远。",
      ja: "番号付きのすべての出口の位置、出口ごとの周辺スポット、出口同士の距離を地図で確認できます。",
    },
  },
  {
    icon: "elevator",
    title: { ko: "무장애 엘리베이터 동선", en: "Step-free elevator routes", zh: "无障碍电梯路线", ja: "段差のないエレベーター動線" },
    body: {
      ko: "지상에서 승강장까지 엘리베이터만으로 이동할 수 있는 출구와, 서울교통공사 역의 엘리베이터 동선도를 안내해요.",
      en: "Which exits have an elevator route all the way from the street to the platform, with route diagrams for Seoul Metro stations.",
      zh: "哪些出口能从地面一路乘电梯到站台，以及首尔交通公社车站的电梯路线图。",
      ja: "地上からホームまでエレベーターだけで行ける出口と、ソウル交通公社の駅のエレベーター動線図を案内します。",
    },
  },
  {
    icon: "luggage",
    title: { ko: "물품보관함·짐 보관 데스크", en: "Lockers and luggage desks", zh: "储物柜与行李寄存柜台", ja: "コインロッカー・荷物預かり" },
    body: {
      ko: "T-Locker 보관함 위치와 개찰구 안팎 여부, 요금과 이용 시간, 유인 T-Luggage 데스크까지 정리했어요.",
      en: "Where each T-Locker bank is, whether it is inside or outside the gates, prices and hours, and the staffed T-Luggage desks.",
      zh: "各处 T-Locker 的位置、在检票口内还是外、价格和存取时间，以及人工 T-Luggage 柜台。",
      ja: "T-Lockerの設置場所と改札の内外、料金と利用時間、有人のT-Luggageカウンターまでまとめています。",
    },
  },
  {
    icon: "restroom",
    title: { ko: "화장실 개찰구 안팎", en: "Restrooms inside or outside the gates", zh: "洗手间在检票口内还是外", ja: "トイレは改札内か改札外か" },
    body: {
      ko: "화장실이 개찰구 안에 있는지 알려 줘서, 개찰구를 나가지 않고 이용할 수 있는지 미리 알 수 있어요.",
      en: "Whether each restroom is inside the fare gates, so you know if you can use it without tapping out.",
      zh: "标明洗手间是否在检票口内，让您提前知道能否不出站就使用。",
      ja: "トイレが改札内にあるかを示すので、改札を出ずに使えるか事前にわかります。",
    },
  },
  {
    icon: "transfer",
    title: { ko: "빠른 환승 칸", en: "Quickest transfer doors", zh: "最快换乘车门", ja: "最速乗り換えドア" },
    body: {
      ko: "노선을 갈아탈 때 걷는 거리가 가장 짧은 칸·문 번호와 환승별 도보 시간을 알려 줘요.",
      en: "The car and door to ride in for the shortest walk between lines, and how long each transfer takes on foot.",
      zh: "换乘步行距离最短的车厢和车门编号，以及每条换乘路线的步行时间。",
      ja: "乗り換えの歩く距離が最短になる号車・ドア番号と、乗り換えごとの徒歩時間を案内します。",
    },
  },
  {
    icon: "route",
    title: { ko: "경로 찾기·여행 가이드", en: "Route planner and travel guides", zh: "路线规划与出行指南", ja: "経路検索・旅行ガイド" },
    body: {
      ko: "역 사이 경로 찾기와 공항철도, 요금, 교통카드, 짐 보관에 관한 가이드를 함께 제공해요.",
      en: "A route planner between stations, plus longer guides to airport trains, fares, transit cards and luggage.",
      zh: "提供车站间的路线规划，以及机场铁路、票价、交通卡和行李寄存等详细指南。",
      ja: "駅間の経路検索と、空港鉄道、運賃、交通カード、荷物預かりについてのガイドも用意しています。",
    },
  },
];

export const ABOUT_SECTIONS: TrustSection[] = [
  {
    heading: { ko: "운영 방식", en: "Who runs K-SUB", zh: "K-SUB 由谁运营", ja: "運営について" },
    paragraphs: [
      {
        ko: "K-SUB(지하철꿀정보)는 독립적으로 운영하는 프로젝트예요. 서울교통공사, 코레일 등 지하철 운영기관과는 관련이 없고 무료로 이용할 수 있어요. 웹사이트는 Google AdSense 광고로 운영비를 충당하며, 광고는 역 정보와 구분해 표시하고 광고주는 콘텐츠 내용에 관여하지 않아요.",
        en: "K-SUB (지하철꿀정보 in Korean) is an independent project. It is not affiliated with Seoul Metro, Korail or any other subway operator, and it is free to use. The website is supported by Google AdSense ads, which are shown apart from the station information; advertisers have no say in what we publish.",
        zh: "K-SUB（韩文名 지하철꿀정보）是独立运营的项目，与首尔交通公社、韩国铁道公社（Korail）等地铁运营机构无关，可免费使用。网站依靠 Google AdSense 广告维持运营，广告与车站信息分开显示，广告主不参与内容编写。",
        ja: "K-SUB（韓国語名：지하철꿀정보）は独立して運営しているプロジェクトです。ソウル交通公社やKORAILなどの地下鉄運営機関とは関係がなく、無料で利用できます。ウェブサイトはGoogle AdSenseの広告で運営費をまかなっており、広告は駅情報と区別して表示し、広告主が内容に関与することはありません。",
      },
      {
        ko: "역 정보는 서울교통공사와 공공데이터포털이 공개한 공식 데이터를 바탕으로 정리해요. 항목별 출처와 갱신 방법은 데이터 출처 및 편집 정책에서 자세히 볼 수 있어요.",
        en: "Station information is compiled from official open data published by Seoul Metro and Korea's Public Data Portal. Our Data Sources & Editorial Policy lists where each piece comes from and how we keep it current.",
        zh: "车站信息以首尔交通公社和韩国公共数据门户公开的官方数据为基础整理。各项数据的来源和更新方式，请参阅「数据来源与编辑方针」。",
        ja: "駅情報は、ソウル交通公社と韓国の公共データポータルが公開している公式データをもとに整理しています。項目ごとの出典と更新方法は「データ出典と編集方針」で詳しくご覧いただけます。",
      },
    ],
  },
  {
    heading: { ko: "문의와 제보", en: "Get in touch", zh: "联系与反馈", ja: "お問い合わせ・情報提供" },
    paragraphs: [
      {
        ko: "역에서 본 출구 번호, 엘리베이터, 보관함 위치가 다르다면 문의하기 페이지나 앱의 제보 버튼으로 알려 주세요. 현장에서 보내 주시는 제보는 바뀐 내용을 찾아내는 가장 중요한 경로 중 하나예요.",
        en: "Found an exit number, elevator or locker that doesn't match what you saw at the station? Tell us through the Contact page or the report button in the app. Reports from travelers on the ground are one of the main ways we catch changes.",
        zh: "如果在车站看到的出口编号、电梯或储物柜位置与本站信息不符，请通过「联系我们」页面或应用内的上报按钮告诉我们。旅客从现场发来的反馈，是我们发现变化的重要途径之一。",
        ja: "駅で見た出口番号、エレベーター、ロッカーの位置が違っていたら、お問い合わせページかアプリの報告ボタンからお知らせください。現地の旅行者からの報告は、変更に気づくための大切な手がかりです。",
      },
    ],
  },
];

export const EDITORIAL_DESCRIPTION: Localized = {
  ko: "K-SUB 역 정보의 출처와 정리·검증 방법, 역 페이지 작성 방식, 오류 제보 방법을 안내해요.",
  en: "Where K-SUB's station data comes from, how we match and check it, how station pages are written and how to report an error.",
  zh: "介绍 K-SUB 车站信息的来源、整理与核对方式、车站页面的编写方法，以及如何报告错误。",
  ja: "K-SUBの駅情報の出典、照合・確認の方法、駅ページの作り方、誤りの報告方法をご案内します。",
};

export const EDITORIAL_LEAD: Localized = {
  ko: "K-SUB의 모든 역 페이지는 서울교통공사, 서울특별시, 공공데이터포털(data.go.kr)이 공개한 공식 데이터를 바탕으로 만들어요. 여러 데이터를 역 하나의 기록으로 합치고, 빈 부분은 아래에 밝힌 공개 자료로 채우며, 이용자 제보로 바뀐 내용을 고쳐요.",
  en: "Every station page on K-SUB is built from official open data published by Seoul Metro (서울교통공사), the Seoul Metropolitan Government and Korea's Public Data Portal (data.go.kr). We combine those datasets into one record per station, fill the gaps from the open sources named below, and correct the record when travelers report changes.",
  zh: "K-SUB 的每个车站页面都以首尔交通公社、首尔特别市和韩国公共数据门户（data.go.kr）公开的官方数据为基础。我们把多个数据集合并为每个车站的一条记录，用下文列出的公开资料补全空缺，并根据旅客反馈修正变化。",
  ja: "K-SUBの駅ページはすべて、ソウル交通公社、ソウル特別市、公共データポータル（data.go.kr）が公開している公式データをもとに作っています。複数のデータを駅ごとの1件の記録にまとめ、足りない部分は下記の公開資料で補い、利用者からの報告をもとに変更を反映しています。",
};

export const SOURCES_HEADING: Localized = { ko: "데이터 출처", en: "Where the data comes from", zh: "数据来源", ja: "データの出典" };

const SEOUL_METRO: Localized = { ko: "서울교통공사", en: "Seoul Metro", zh: "首尔交通公社", ja: "ソウル交通公社" };
const PUBLIC_DATA = (id: string) => `https://www.data.go.kr/data/${id}/fileData.do`;

export const DATA_SOURCES: DataSource[] = [
  {
    name: { ko: "지하철역 역사마스터", en: "Subway station master list", zh: "地铁站主数据", ja: "地下鉄駅マスターデータ" },
    publisher: { ko: "서울특별시 교통빅데이터플랫폼", en: "Seoul Metropolitan Government (Seoul Transport Big Data Platform)", zh: "首尔特别市交通大数据平台", ja: "ソウル特別市 交通ビッグデータプラットフォーム" },
    use: {
      ko: "역 목록, 역 위치, 역마다 다니는 노선",
      en: "The list of stations, their locations and the lines serving each one",
      zh: "车站列表、车站位置及经过各站的线路",
      ja: "駅の一覧、駅の位置、各駅に乗り入れる路線",
    },
    url: "https://t-data.seoul.go.kr",
  },
  {
    name: { ko: "서울교통공사_역명다국어표기", en: "Station names in other languages", zh: "车站名称多语言标注", ja: "駅名の多言語表記" },
    publisher: SEOUL_METRO,
    use: {
      ko: "영어·중국어·일본어 공식 역명",
      en: "Official station names in English, Chinese and Japanese",
      zh: "英语、中文、日语的官方站名",
      ja: "英語・中国語・日本語の公式駅名",
    },
    url: PUBLIC_DATA("15044232"),
  },
  {
    name: { ko: "서울교통공사_역사공중화장실정보", en: "Station public restrooms", zh: "车站公共洗手间信息", ja: "駅の公衆トイレ情報" },
    publisher: SEOUL_METRO,
    use: {
      ko: "1~8호선 화장실의 층, 가까운 출구, 개찰구 안팎 여부",
      en: "Floor, nearest exit and inside-or-outside-the-gates for restrooms on Lines 1–8",
      zh: "1～8号线洗手间所在楼层、最近出口以及在检票口内还是外",
      ja: "1～8号線のトイレの階、最寄り出口、改札内か改札外か",
    },
    url: PUBLIC_DATA("15044453"),
  },
  {
    name: { ko: "서울교통공사_물품보관함 위치정보", en: "Locker locations", zh: "储物柜位置信息", ja: "コインロッカーの設置場所" },
    publisher: SEOUL_METRO,
    use: {
      ko: "T-Locker 보관함 위치와 칸 수",
      en: "Where each T-Locker bank is and how many lockers it has",
      zh: "T-Locker 储物柜的位置和格数",
      ja: "T-Lockerの設置場所と個数",
    },
    url: PUBLIC_DATA("15044234"),
  },
  {
    name: { ko: "서울교통공사_서울 도시철도 환승정보", en: "Transfer information", zh: "首尔城市铁路换乘信息", ja: "ソウル都市鉄道の乗り換え情報" },
    publisher: SEOUL_METRO,
    use: {
      ko: "빠른 환승 칸·문 번호와 환승 도보 시간",
      en: "Quickest-transfer car and door numbers and transfer walking times",
      zh: "最快换乘车厢、车门编号及换乘步行时间",
      ja: "最速乗り換えの号車・ドア番号と乗り換えの徒歩時間",
    },
    url: PUBLIC_DATA("15098252"),
  },
  {
    name: { ko: "서울교통공사_역이용안내도", en: "Station layout maps", zh: "车站使用示意图", ja: "駅構内案内図" },
    publisher: {
      ko: "서울교통공사, 국토교통부 철도산업정보센터",
      en: "Seoul Metro; Ministry of Land, Infrastructure and Transport (Korea Rail Information Center)",
      zh: "首尔交通公社、韩国国土交通部铁道产业信息中心",
      ja: "ソウル交通公社、国土交通部 鉄道産業情報センター",
    },
    use: {
      ko: "지상에서 승강장까지 이어지는 엘리베이터 동선",
      en: "Elevator routes from the street to the platform",
      zh: "从地面到站台的电梯路线",
      ja: "地上からホームまでのエレベーター動線",
    },
    url: PUBLIC_DATA("15004974"),
  },
  {
    name: { ko: "서울교통공사 역간거리 및 소요시간", en: "Distances and running times between stations", zh: "站间距离与运行时间", ja: "駅間距離と所要時間" },
    publisher: SEOUL_METRO,
    use: {
      ko: "경로 찾기의 역 사이 운행 시간 (1~8호선)",
      en: "Running times between stations for the route planner (Lines 1–8)",
      zh: "路线规划中的站间运行时间（1～8号线）",
      ja: "経路検索で使う駅間の運行時間（1～8号線）",
    },
    url: "https://www.seoulmetro.co.kr",
  },
  {
    name: { ko: "서울시 실시간 지하철 도착정보", en: "Live subway arrivals", zh: "首尔市实时地铁到站信息", ja: "ソウル市 リアルタイム地下鉄到着情報" },
    publisher: { ko: "서울 열린데이터광장", en: "Seoul Open Data Plaza", zh: "首尔开放数据广场", ja: "ソウル・オープンデータ広場" },
    use: {
      ko: "앱의 실시간 열차 도착 정보",
      en: "Live train arrival times in the app",
      zh: "应用中的实时列车到站信息",
      ja: "アプリのリアルタイム列車到着情報",
    },
    url: "https://data.seoul.go.kr",
  },
  {
    name: { ko: "OpenStreetMap", en: "OpenStreetMap", zh: "OpenStreetMap", ja: "OpenStreetMap" },
    publisher: { ko: "OpenStreetMap 기여자 (ODbL)", en: "OpenStreetMap contributors (ODbL)", zh: "OpenStreetMap 贡献者（ODbL）", ja: "OpenStreetMap 寄稿者（ODbL）" },
    use: {
      ko: "출구 좌표와 노선별 역 순서",
      en: "Exit positions and the order of stations along each line",
      zh: "出口坐标及各线路的车站顺序",
      ja: "出口の座標と路線ごとの駅の順序",
    },
    url: "https://www.openstreetmap.org/copyright",
  },
  {
    name: { ko: "Wikidata", en: "Wikidata", zh: "Wikidata", ja: "Wikidata" },
    publisher: { ko: "위키미디어 재단", en: "Wikimedia Foundation", zh: "维基媒体基金会", ja: "ウィキメディア財団" },
    use: {
      ko: "서울교통공사 목록에 없는 노선의 외국어 역명",
      en: "Station names in other languages for lines not in Seoul Metro's list",
      zh: "首尔交通公社列表未收录线路的外语站名",
      ja: "ソウル交通公社の一覧にない路線の外国語駅名",
    },
    url: "https://www.wikidata.org",
  },
  {
    name: { ko: "T-Locker·T-Luggage 이용 안내", en: "T-Locker and T-Luggage service pages", zh: "T-Locker 与 T-Luggage 服务说明", ja: "T-Locker・T-Luggageの利用案内" },
    publisher: SEOUL_METRO,
    use: {
      ko: "보관함 요금·이용 시간과 유인 짐 보관 데스크",
      en: "Locker prices and hours, and the staffed luggage desks",
      zh: "储物柜价格、存取时间及人工行李寄存柜台",
      ja: "ロッカーの料金・利用時間と有人の荷物預かりカウンター",
    },
    url: "https://www.tluggage.co.kr",
  },
];

/** `{curated}` is the number of stations with hand-written local notes; `{email}` the contact address. */
export const EDITORIAL_SECTIONS: TrustSection[] = [
  {
    heading: { ko: "데이터를 정리하는 방법", en: "How we put the data together", zh: "数据整理方式", ja: "データの整理方法" },
    paragraphs: [
      {
        ko: "데이터마다 역 이름을 조금씩 다르게 적어요. 옛 역명, '역'이 붙거나 빠진 이름, 여러 방식으로 쓰인 노선명이 섞여 있죠. 그래서 모든 기록을 이름·노선·위치로 하나의 역 목록에 맞춰서, 화장실이나 보관함이 실제로 속한 역과 노선에만 표시되도록 해요. 2호선 신촌역과 경의중앙선 신촌역처럼 이름이 같은 역은 노선과 거리로 구분해요.",
        en: "Each dataset names stations a little differently: old names, names with or without 역 (\"station\"), line names spelled several ways. We match every record to one station list by name, line and location, so a restroom or locker is only shown at the station and line it belongs to. Stations that share a name, such as Sinchon on Line 2 and Sinchon on the Gyeongui–Jungang Line, are kept apart by line and distance.",
        zh: "不同数据集对车站的写法略有不同：旧站名、带或不带「站」字的名称、线路名的多种写法。我们按名称、线路和位置把每条记录对应到同一份车站列表，确保洗手间或储物柜只显示在它真正所属的车站和线路上。像2号线新村站和京义中央线新村站这样同名的车站，按线路和距离区分。",
        ja: "データごとに駅名の書き方が少しずつ違います。旧駅名、「駅」の有無、何通りもある路線名の表記などです。そこで、すべての記録を駅名・路線・位置で1つの駅リストに照合し、トイレやロッカーが実際に属する駅と路線にだけ表示されるようにしています。2号線の新村駅と京義中央線の新村駅のように同名の駅は、路線と距離で区別します。",
      },
      {
        ko: "역에서 1.5km 넘게 떨어진 출구 좌표는 다른 역의 것으로 보고 제외해요. 외국어 역명은 서울교통공사 공식 표기를 먼저 따르고, 없으면 Wikidata를 따라요. 중국어 번체 페이지는 오픈소스 변환기(OpenCC)로 간체 페이지를 변환해 만들어요.",
        en: "Exit positions more than 1.5 km from a station are dropped as belonging to a different station. Station names in other languages follow Seoul Metro's official translations first, then Wikidata. Traditional Chinese pages are converted from the Simplified Chinese ones with an open-source converter (OpenCC).",
        zh: "距车站超过1.5公里的出口坐标会被视为其他车站的数据而排除。外语站名优先采用首尔交通公社的官方译名，没有时参考 Wikidata。繁体中文页面由开源转换工具（OpenCC）从简体中文页面转换而来。",
        ja: "駅から1.5km以上離れた出口の座標は、別の駅のものとして除外します。外国語の駅名はソウル交通公社の公式表記を優先し、ない場合はWikidataに従います。中国語繁体字のページは、オープンソースの変換ツール（OpenCC）で簡体字のページを変換して作成しています。",
      },
    ],
  },
  {
    heading: { ko: "역 페이지 작성 방식", en: "How station pages are written", zh: "车站页面的编写方式", ja: "駅ページの書き方" },
    paragraphs: [
      {
        ko: "역 페이지의 개요와 여행자 팁은 그 역의 데이터로 자동 작성돼요. 보관함 문장은 그 역에 보관함이 있을 때만 나오고, 도보 시간·출구 번호·칸 번호는 위 데이터에서 그대로 가져와요. 데이터로 뒷받침되지 않는 문장으로 분량을 채우지 않기 때문에, 공개 데이터가 적은 역은 페이지도 짧아요.",
        en: "The overview and traveler tips on each station page are written automatically from that station's own data. A sentence about lockers appears only if the station has lockers, and walking times, exit numbers and door numbers come straight from the datasets above. We don't pad pages with text the data doesn't support, so stations with less published data have shorter pages.",
        zh: "车站页面上的概况和旅客贴士由该站自己的数据自动生成。只有车站有储物柜时才会出现储物柜的句子，步行时间、出口编号和车门编号都直接取自上述数据。我们不用缺乏数据支撑的文字充实页面，因此公开数据较少的车站，页面也会比较简短。",
        ja: "駅ページの概要と旅行者向けヒントは、その駅自身のデータから自動で作成しています。ロッカーの文はその駅にロッカーがある場合にだけ表示され、徒歩時間・出口番号・号車番号は上記のデータからそのまま取っています。データの裏付けがない文章でページを水増ししないため、公開データが少ない駅はページも短くなります。",
      },
      {
        ko: "서울역, 명동, 홍대입구처럼 여행자가 많이 찾는 {curated}개 역에는 직접 쓴 현지 팁을 더해요. 공항철도 타는 길, 짐을 들고 다니기 편한 동선, 관광지 휴무일 같은 내용이에요. 이 팁과 여행 가이드에는 마지막으로 확인한 날짜를 표시해요.",
        en: "For {curated} of the stations visitors use most, such as Seoul Station, Myeongdong and Hongik University, we add local notes we write ourselves: how to reach the airport trains, the easiest way through with luggage, which days attractions close. These notes and our travel guides show the date they were last checked.",
        zh: "对于首尔站、明洞、弘大入口等{curated}个旅客最常去的车站，我们另外加入自行撰写的本地贴士，例如怎样去坐机场铁路、带行李走哪条路线最方便、景点哪天休息。这些贴士和出行指南都会标明最后核实的日期。",
        ja: "ソウル駅、明洞、弘大入口など旅行者がよく利用する{curated}駅には、独自に書いた現地メモを加えています。空港鉄道への行き方、荷物を持って歩きやすい動線、観光地の休館日などです。これらのメモと旅行ガイドには最終確認日を表示しています。",
      },
    ],
  },
  {
    heading: { ko: "정확성을 유지하는 방법", en: "Keeping it accurate", zh: "如何保持准确", ja: "正確さを保つために" },
    paragraphs: [
      {
        ko: "서울교통공사나 서울시가 데이터 새 버전을 공개하면 다시 내려받아 역 데이터를 새로 만들어요. 물품보관함 요금과 이용 시간은 T-Locker·T-Luggage 공식 사이트와 대조해 확인해요.",
        en: "When Seoul Metro or the Seoul Metropolitan Government publishes a new version of a dataset, we download it again and rebuild the station data from it. Locker prices and hours are checked against the official T-Locker and T-Luggage websites.",
        zh: "首尔交通公社或首尔市发布新版数据后，我们会重新下载并据此重建车站数据。储物柜的价格和存取时间会与 T-Locker、T-Luggage 官方网站核对。",
        ja: "ソウル交通公社やソウル市がデータの新しい版を公開したら、改めてダウンロードして駅データを作り直します。ロッカーの料金と利用時間は、T-Locker・T-Luggageの公式サイトと照らし合わせて確認しています。",
      },
      {
        ko: "데이터가 갱신되기 전에도 역은 바뀌어요. 공사로 출구가 닫히거나, 엘리베이터가 새로 생기거나, 보관함이 옮겨지죠. 이런 변화는 대부분 역 현장에서 보내 주시는 이용자 제보로 알게 돼요. 제보는 역 안내도나 운영기관 공지 같은 공식 자료와 대조해 확인한 뒤 반영해요.",
        en: "Stations change between dataset releases: exits close for construction, elevators are added, lockers move. Reports from riders at the station are how we catch most of these, and we check each one against official material such as station maps and operator notices before changing a page.",
        zh: "在数据更新之间，车站也会变化：出口因施工关闭、新增电梯、储物柜搬迁等。这类变化大多来自乘客在车站现场发来的反馈。我们会先对照车站示意图、运营机构公告等官方资料核实，再修改页面。",
        ja: "データの更新を待たずに駅は変わります。工事で出口が閉鎖されたり、エレベーターが新設されたり、ロッカーが移設されたりします。こうした変化の多くは、駅の現場にいる利用者からの報告で知ることになります。報告は、駅構内案内図や運営機関のお知らせなどの公式資料と照らし合わせて確認してから反映します。",
      },
      {
        ko: "실시간 열차 도착 정보는 서울 열린데이터광장에서 받은 그대로 보여 주며 따로 편집하지 않아요.",
        en: "Live arrival times are shown exactly as received from the Seoul Open Data Plaza feed; we don't edit them.",
        zh: "实时列车到站信息直接显示从首尔开放数据广场获取的内容，我们不作编辑。",
        ja: "リアルタイムの列車到着情報は、ソウル・オープンデータ広場から受け取ったまま表示しており、編集はしていません。",
      },
    ],
  },
  {
    heading: { ko: "독립성과 광고", en: "Independence and advertising", zh: "独立性与广告", ja: "独立性と広告" },
    paragraphs: [
      {
        ko: "K-SUB는 서울교통공사, 코레일 등 어떤 운영기관과도 제휴하거나 후원을 받지 않는 독립 서비스예요. 사이트는 Google AdSense 광고로 운영되며, 광고는 역 정보와 분리해 표시하고 광고주는 게시 내용에 관여하지 않아요.",
        en: "K-SUB is not affiliated with, endorsed by or funded by Seoul Metro, Korail or any other operator. The site is supported by Google AdSense ads, which are shown apart from the station information; advertisers have no say in what we publish.",
        zh: "K-SUB 与首尔交通公社、韩国铁道公社等任何运营机构均无合作或赞助关系。网站依靠 Google AdSense 广告运营，广告与车站信息分开显示，广告主不参与发布内容。",
        ja: "K-SUBは、ソウル交通公社やKORAILなどいかなる運営機関とも提携しておらず、支援も受けていない独立したサービスです。サイトはGoogle AdSenseの広告で運営しており、広告は駅情報と分けて表示し、広告主が掲載内容に関与することはありません。",
      },
    ],
  },
  {
    heading: { ko: "이용 시 유의사항", en: "Limits of the information", zh: "使用须知", ja: "ご利用上の注意" },
    paragraphs: [
      {
        ko: "모든 페이지를 정확하게 유지하려 노력하지만, 역 시설은 바뀌고 데이터가 늦게 반영될 수 있어요. K-SUB는 이동 계획을 돕는 참고 자료로 활용하시고, 특히 공사 중인 출구나 엘리베이터는 역 안내판과 직원 안내를 따라 주세요. 자세한 면책 내용은 이용약관에 있어요.",
        en: "We work to keep every page accurate, but station facilities change and data can lag behind. Use K-SUB as a planning aid and follow the signs and staff at the station, especially for exits and elevators under construction. Our Terms of Service has the full disclaimer.",
        zh: "我们努力保持每个页面准确，但车站设施会变化，数据也可能滞后。请把 K-SUB 当作规划行程的参考，尤其是施工中的出口和电梯，请以车站指示牌和工作人员的指引为准。完整的免责说明请参阅服务条款。",
        ja: "すべてのページを正確に保つよう努めていますが、駅の設備は変わり、データの反映が遅れることもあります。K-SUBは移動計画の参考としてお使いいただき、特に工事中の出口やエレベーターは駅の案内表示と係員の案内に従ってください。免責事項の詳細は利用規約をご覧ください。",
      },
    ],
  },
  {
    heading: { ko: "오류 제보", en: "Report an error", zh: "报告错误", ja: "誤りの報告" },
    paragraphs: [
      {
        ko: "페이지 내용이 틀렸거나 오래됐다면 {email}로 메일을 보내거나 앱의 제보 버튼을 눌러 주세요. 역 이름, 노선, 현장에서 본 내용을 적어 주시고 안내판 사진이 있으면 더 좋아요. 모든 제보를 확인하고, 확인된 오류는 고쳐요.",
        en: "If something on a page is wrong or out of date, email {email} or use the report button in the app. Tell us the station, the line and what you saw; a photo of the sign helps. We check every report and fix the errors we confirm.",
        zh: "如果页面内容有误或已过时，请发送邮件至 {email}，或使用应用中的上报按钮。请注明车站、线路和您在现场看到的情况，附上指示牌照片会更有帮助。我们会核实每一条反馈，并修正经确认的错误。",
        ja: "ページの内容が間違っている、または古くなっている場合は、{email} までメールいただくか、アプリの報告ボタンからお知らせください。駅名、路線、現地で見た内容を書いていただき、案内板の写真があればなお助かります。すべての報告を確認し、確認できた誤りは修正します。",
      },
    ],
  },
];

export const COVERAGE_HEADING: Localized = { ko: "현재 수록 범위", en: "Current coverage", zh: "当前收录范围", ja: "現在の収録範囲" };

export const COVERAGE_LABELS = {
  stations: { ko: "역 안내 페이지", en: "Station guides", zh: "车站指南页面", ja: "駅ガイドページ" },
  lines: { ko: "노선", en: "Lines", zh: "线路", ja: "路線" },
  exits: { ko: "출구 위치가 있는 역", en: "Stations with exit positions", zh: "有出口位置的车站", ja: "出口の位置がある駅" },
  toilets: { ko: "화장실 정보가 있는 역", en: "Stations with restroom details", zh: "有洗手间信息的车站", ja: "トイレ情報がある駅" },
  lockers: { ko: "물품보관함이 있는 역", en: "Stations with T-Lockers", zh: "有 T-Locker 的车站", ja: "T-Lockerがある駅" },
  transfers: { ko: "빠른 환승 정보가 있는 역", en: "Stations with transfer doors", zh: "有最快换乘信息的车站", ja: "最速乗り換え情報がある駅" },
  elevators: { ko: "엘리베이터 동선이 있는 역", en: "Stations with step-free routes", zh: "有电梯路线的车站", ja: "エレベーター動線がある駅" },
  curated: { ko: "현지 팁을 직접 쓴 역", en: "Stations with local notes", zh: "有本地贴士的车站", ja: "現地メモがある駅" },
} satisfies Record<string, Localized>;

export const STATS_LABELS = {
  stations: { ko: "역", en: "stations", zh: "车站", ja: "駅" },
  lines: { ko: "노선", en: "lines", zh: "线路", ja: "路線" },
  languages: { ko: "언어", en: "languages", zh: "语言", ja: "言語" },
} satisfies Record<string, Localized>;

export const TRUST_COPY = {
  updated: { ko: "최종 업데이트: {date}", en: "Last updated {date}", zh: "最后更新：{date}", ja: "最終更新：{date}" },
  related: { ko: "함께 보기", en: "See also", zh: "相关页面", ja: "関連ページ" },
  koreanName: { ko: "", en: "Korean name", zh: "韩文名称", ja: "韓国語名" },
} satisfies Record<string, Localized>;
