import type { GuideDetail, GuideStation } from "./guide";
import { localLine } from "./guide";
import { contentLocale, type GuideLocale } from "./guideLocale";
import { gt, inScript } from "./hant";
import { lineName } from "./lineNames";
import { t, type Locale, type Localized } from "./i18n";

export { gt } from "./hant";

/** A line's name in the guide language. */
export function lineLabel(line: string, locale: GuideLocale) {
  return gt(lineName(line), locale);
}

export const BRAND: Localized = {
  ko: "지하철꿀정보",
  en: "K-Sub: Seoul Subway Guide",
  zh: "K-Sub 首尔地铁指南",
  ja: "K-Sub ソウル地下鉄ガイド",
};

export const BRAND_SHORT: Localized = { ko: "지하철꿀정보", en: "K-Sub", zh: "K-Sub", ja: "K-Sub" };

export const TAGLINE: Localized = {
  ko: "서울 지하철 역 정보",
  en: "Seoul Subway Guide",
  zh: "首尔地铁指南",
  ja: "ソウル地下鉄ガイド",
};

/** The English title ends in the short "K-SUB" mark searchers see in results; other languages keep BRAND. */
export function homeMetaTitle(locale: GuideLocale) {
  return `${gt(COPY.homeTitle, locale)} | ${locale === "en" ? "K-SUB" : gt(BRAND, locale)}`;
}

export const HOME_KEYWORDS = [
  "seoul subway",
  "seoul subway map",
  "seoul subway exit",
  "seoul subway lockers",
  "t-locker seoul",
  "seoul subway guide",
];

/** Shown on the English landing page; FAQPage data must match questions visible on the page. */
export const HOME_FAQ_EN = [
  {
    question: "How to use Seoul Subway with heavy luggage?",
    answer: "Check K-SUB for exact elevator exits and T-Locker storage locations at each station.",
  },
  {
    question: "Are there restrooms inside Seoul subway ticket gates?",
    answer: "K-SUB clearly marks whether station restrooms are inside or outside ticket gates.",
  },
];

export const COPY = {
  homeTitle: {
    ko: "서울 지하철 역 정보 가이드: 출구·화장실·물품보관함·빠른환승",
    en: "Seoul Subway Guide & Exit Maps: Lockers, Restrooms & Elevators",
    zh: "首尔地铁出行指南：出口、洗手间、储物柜、换乘",
    ja: "ソウル地下鉄 旅行者ガイド：出口・トイレ・コインロッカー・乗り換え",
  },
  homeHeading: {
    ko: "서울 지하철, 역마다 꿀정보",
    en: "Seoul Subway Exit & Locker Guide for Travelers",
    zh: "首尔地铁每一站，一查就懂",
    ja: "ソウル地下鉄の全駅を、迷わずスイスイ",
  },
  homeLead: {
    ko: "수도권 {n}개 역의 출구 위치, 화장실, 물품보관함, 가장 빠른 환승 칸을 한 곳에서 확인하세요.",
    en: "Exits, restrooms, coin lockers and the fastest transfer doors for all {n} stations in Seoul and the capital area, in plain English.",
    zh: "首尔及首都圈全部{n}个车站的出口位置、洗手间、投币储物柜和最快换乘车门，一站查清。",
    ja: "ソウル・首都圏の全{n}駅の出口、トイレ、コインロッカー、最速乗り換えドアをまとめてチェック。",
  },
  homeDescription: {
    ko: "서울·수도권 지하철 모든 역의 출구 위치, 화장실, 물품보관함, 빠른환승 칸과 실시간 도착 정보를 한눈에.",
    en: "The ultimate Seoul subway guide for travelers. Find real-time exit maps, luggage storage (T-Locker) locations, inside-gate restrooms, and elevator routes in Seoul.",
    zh: "免费首尔地铁中文指南：各站出口地图、洗手间、投币储物柜、最快换乘车门及实时列车到站信息。",
    ja: "無料のソウル地下鉄日本語ガイド。全駅の出口マップ、トイレ、コインロッカー、最速乗り換えドア、リアルタイム列車到着情報。",
  },
  searchLabel: { ko: "역 검색", en: "Search a station", zh: "搜索车站", ja: "駅を検索" },
  searchPlaceholder: {
    ko: "역 이름을 입력하세요 (예: 강남)",
    en: "Type a station name, e.g. Myeong-dong",
    zh: "输入站名，例如：明洞",
    ja: "駅名を入力（例：明洞）",
  },
  searchEmpty: {
    ko: "일치하는 역이 없어요.",
    en: "No matching station.",
    zh: "没有找到相关车站。",
    ja: "該当する駅がありません。",
  },
  popular: { ko: "인기 역", en: "Popular stations", zh: "热门车站", ja: "人気の駅" },
  allStations: { ko: "전체 역 보기", en: "Browse all stations", zh: "查看全部车站", ja: "全駅を見る" },
  allStationsTitle: {
    ko: "서울·수도권 지하철 전체 역 목록",
    en: "All Seoul Subway Stations by Line",
    zh: "首尔地铁全部车站（按线路）",
    ja: "ソウル地下鉄 全駅一覧（路線別）",
  },
  allStationsDescription: {
    ko: "1~9호선, 신분당선, 수인분당선, 경의중앙선, 공항철도 등 수도권 모든 역의 출구·화장실·물품보관함 정보.",
    en: "Every station on Seoul Subway Lines 1–9, Shinbundang, Suin–Bundang, Gyeongui–Jungang, AREX and more, with exits, restrooms and lockers.",
    zh: "首尔地铁1~9号线、新盆唐线、水仁盆唐线、京义中央线、机场铁路等全部车站的出口、洗手间与储物柜信息。",
    ja: "ソウル地下鉄1～9号線、新盆唐線、水仁盆唐線、京義中央線、空港鉄道など全駅の出口・トイレ・ロッカー情報。",
  },
  stationsCount: {
    ko: "{n}개 역",
    en: "{n} stations",
    zh: "{n}个车站",
    ja: "{n}駅",
  },
  features: { ko: "이런 정보를 볼 수 있어요", en: "What you'll find", zh: "你可以查到", ja: "わかること" },
  featureExits: {
    ko: "출구 번호별 위치를 지도에서 바로",
    en: "Every numbered exit, one tap to the map",
    zh: "每个出口编号，一键打开地图",
    ja: "番号付き出口をワンタップで地図に",
  },
  featureToilets: {
    ko: "개찰구 안·밖 화장실 위치",
    en: "Restrooms inside or outside the fare gates",
    zh: "检票口内外的洗手间位置",
    ja: "改札内・改札外のトイレの場所",
  },
  featureLockers: {
    ko: "물품보관함 위치와 칸 수",
    en: "Coin lockers for your luggage",
    zh: "存放行李的投币储物柜",
    ja: "荷物を預けるコインロッカー",
  },
  featureTransfers: {
    ko: "가장 빠른 환승 칸 번호",
    en: "Which car and door is closest to your transfer",
    zh: "离换乘通道最近的车厢和车门",
    ja: "乗り換えに一番近い号車とドア",
  },
  featureLive: {
    ko: "실시간 도착 정보와 하차 알림 (앱)",
    en: "Live arrivals and a get-off alarm in the app",
    zh: "App内实时到站与下车提醒",
    ja: "アプリでリアルタイム到着と降車アラーム",
  },
  openWebApp: {
    ko: "웹에서 바로 사용하기",
    en: "Use the web app now",
    zh: "立即使用网页版",
    ja: "Web版をすぐ使う",
  },
  appTitle: {
    ko: "지하철꿀정보 앱으로 더 편하게",
    en: "Get the K-Sub app",
    zh: "下载 K-Sub App",
    ja: "K-Sub アプリを入手",
  },
  appBody: {
    ko: "실시간 열차 도착, 내릴 역 알림, 출구 지도까지 폰에서 바로 확인하세요.",
    en: "Live train arrivals, an alarm before your stop, exit maps and transfer tips, all on your phone. Free, in English, Chinese, Japanese and Korean.",
    zh: "实时列车到站、下车前提醒、出口地图与换乘提示，尽在手机。免费，支持中文、英语、日语和韩语。",
    ja: "リアルタイム列車到着、降車駅アラーム、出口マップ、乗り換えのコツをスマホで。無料・日本語/英語/中国語/韓国語対応。",
  },
  getOnPlay: { ko: "Google Play에서 받기", en: "Get it on Google Play", zh: "在 Google Play 下载", ja: "Google Play で手に入れよう" },
  comingSoon: { ko: "곧 출시", en: "Coming soon", zh: "即将上线", ja: "近日公開" },
  appSoonNote: {
    ko: "출시 전까지는 웹에서 모든 기능을 무료로 쓸 수 있어요.",
    en: "Until launch, every feature works free in your browser.",
    zh: "正式上线前，所有功能均可在浏览器中免费使用。",
    ja: "リリースまではブラウザで全機能を無料で使えます。",
  },
  openInApp: {
    ko: "실시간 도착·지도 보기",
    en: "Live arrivals & map",
    zh: "实时到站与地图",
    ja: "リアルタイム到着と地図",
  },
  breadcrumbHome: { ko: "홈", en: "Home", zh: "首页", ja: "ホーム" },
  breadcrumbStations: { ko: "전체 역", en: "Stations", zh: "车站", ja: "駅一覧" },
  lines: { ko: "노선", en: "Lines", zh: "线路", ja: "路線" },
  koreanName: { ko: "한국어 이름", en: "Korean name", zh: "韩文站名", ja: "韓国語の駅名" },
  address: { ko: "주소", en: "Address (show to a taxi driver)", zh: "地址（可出示给出租车司机）", ja: "住所（タクシーで見せる用）" },
  exits: { ko: "출구", en: "Exits", zh: "出口", ja: "出口" },
  exitsHint: {
    ko: "'지도'로 출구 위치를, '주변 장소'로 출구 앞 가게·명소를 Google 지도에서 볼 수 있어요.",
    en: "Tap Map to open an exit in Google Maps, or What's nearby to see the shops and landmarks around it.",
    zh: "点“地图”在 Google 地图中查看出口位置，点“周边地点”查看出口附近的商店和景点。",
    ja: "「地図」で出口の位置、「周辺スポット」で出口周辺のお店や名所を Google マップで確認できます。",
  },
  exitLabel: { ko: "{n}번 출구", en: "Exit {n}", zh: "{n}号出口", ja: "{n}番出口" },
  noExits: {
    ko: "출구 위치 데이터가 아직 없어요.",
    en: "No exit location data for this station yet.",
    zh: "暂无该站的出口位置数据。",
    ja: "この駅の出口位置データはまだありません。",
  },
  toilets: { ko: "화장실", en: "Restrooms", zh: "洗手间", ja: "トイレ" },
  noToilets: {
    ko: "이 역의 화장실 상세 데이터는 아직 없어요.",
    en: "No detailed restroom data for this station yet.",
    zh: "暂无该站洗手间的详细数据。",
    ja: "この駅のトイレ詳細データはまだありません。",
  },
  insideGate: { ko: "개찰구 안", en: "Inside fare gates", zh: "检票口内", ja: "改札内" },
  outsideGate: { ko: "개찰구 밖", en: "Outside fare gates", zh: "检票口外", ja: "改札外" },
  nearExit: { ko: "{n}번 출구 쪽", en: "Near Exit {n}", zh: "靠近{n}号出口", ja: "{n}番出口付近" },
  lockers: { ko: "물품보관함", en: "Coin lockers", zh: "投币储物柜", ja: "コインロッカー" },
  noLockers: {
    ko: "이 역의 물품보관함 데이터는 아직 없어요.",
    en: "No coin locker data for this station yet.",
    zh: "暂无该站的储物柜数据。",
    ja: "この駅のコインロッカーデータはまだありません。",
  },
  slots: { ko: "{n}칸", en: "{n} lockers", zh: "{n}格", ja: "{n}個" },
  transfers: { ko: "빠른환승", en: "Fastest transfer doors", zh: "最快换乘车门", ja: "最速乗り換えドア" },
  transfersHint: {
    ko: "타고 오는 방향에 맞춰 이 칸에서 내리면 환승 통로가 가장 가까워요.",
    en: "Ride in this car and door on your way in, and you'll step out right by the transfer passage.",
    zh: "按来车方向在这节车厢的这扇门下车，离换乘通道最近。",
    ja: "来る方向に合わせてこの号車・ドアに乗れば、乗り換え通路のすぐ前で降りられます。",
  },
  transferFrom: { ko: "{line} {toward} 방면", en: "{line} toward {toward}", zh: "{line} 开往{toward}方向", ja: "{line} {toward}方面" },
  carDoor: { ko: "{car}-{door} 칸", en: "Car {car}, door {door}", zh: "{car}号车厢{door}号门", ja: "{car}号車{door}番ドア" },
  walk: { ko: "도보 약 {n}분", en: "About {n} min walk", zh: "步行约{n}分钟", ja: "徒歩約{n}分" },
  next: { ko: "인접 역", en: "Next stations", zh: "相邻车站", ja: "隣の駅" },
  essentials: { ko: "여행자 필수 정보", en: "Traveler essentials", zh: "旅客必备信息", ja: "旅行者の必須情報" },
  utilLockers: {
    ko: "물품보관함 (T-Locker / T-Luggage)",
    en: "Storage Locker (T-Locker / T-Luggage)",
    zh: "行李寄存（T-Locker / T-Luggage）",
    ja: "荷物預け（T-Locker / T-Luggage）",
  },
  utilLockersCount: { ko: "보관함 {n}곳", en: "Lockers ×{n}", zh: "{n}处储物柜", ja: "ロッカー{n}か所" },
  utilLuggageDesk: { ko: "T-Luggage 데스크", en: "T-Luggage desk", zh: "T-Luggage 柜台", ja: "T-Luggage カウンター" },
  utilRestroom: {
    ko: "화장실 (개찰구 안/밖)",
    en: "Restroom (Inside/Outside Gate)",
    zh: "洗手间（检票口内/外）",
    ja: "トイレ（改札内/改札外）",
  },
  utilRestroomCount: {
    ko: "안 {inside} · 밖 {outside}",
    en: "{inside} inside · {outside} outside",
    zh: "内{inside} · 外{outside}",
    ja: "改札内{inside} · 改札外{outside}",
  },
  utilElevator: {
    ko: "계단 없이 / 엘리베이터",
    en: "No-Stairs / Elevator Access",
    zh: "无台阶 / 电梯",
    ja: "階段なし / エレベーター",
  },
  utilElevatorVia: { ko: "{exit} 이용", en: "Via {exit}", zh: "经{exit}", ja: "{exit}から" },
  utilWowpass: {
    ko: "WOWPASS / 환전기",
    en: "WOWPASS / Currency Exchange Machine",
    zh: "WOWPASS / 自助换钱机",
    ja: "WOWPASS / 両替機",
  },
  utilFindNearby: { ko: "주변 찾기 ↗", en: "Find nearby ↗", zh: "查找附近 ↗", ja: "近くを探す ↗" },
  utilNoData: { ko: "데이터 준비 중", en: "No data yet", zh: "暂无数据", ja: "データ準備中" },
  showKorean: {
    ko: "한국인·택시 기사에게 보여주기",
    en: "Show to Korean / Taxi Driver",
    zh: "出示给韩国人 / 出租车司机",
    ja: "韓国人・タクシー運転手に見せる",
  },
  showKoreanHint: {
    ko: "이 화면을 그대로 보여 주세요.",
    en: "Show this screen to a local or a taxi driver.",
    zh: "请把这个画面出示给当地人或出租车司机。",
    ja: "この画面を地元の人やタクシー運転手に見せてください。",
  },
  showKoreanMeaning: {
    ko: "뜻: “{station}으로 가 주세요”",
    en: "Meaning: “Please take me to {station}.”",
    zh: "意思：“请带我去{station}。”",
    ja: "意味：「{station}まで行ってください」",
  },
  showKoreanMeaningExit: {
    ko: "뜻: “{station} {exit}번 출구로 가 주세요”",
    en: "Meaning: “Please take me to Exit {exit} of {station}.”",
    zh: "意思：“请带我去{station}{exit}号出口。”",
    ja: "意味：「{station}の{exit}番出口まで行ってください」",
  },
  pickExit: { ko: "출구 선택", en: "Pick an exit", zh: "选择出口", ja: "出口を選ぶ" },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  ogGuide: {
    ko: "출구 & 물품보관함 가이드",
    en: "Exit & Locker Guide",
    zh: "出口 & 储物柜指南",
    ja: "出口 & ロッカーガイド",
  },
  shareTitle: {
    ko: "이 역 정보 친구에게 공유하기",
    en: "Share this station guide",
    zh: "分享本站指南",
    ja: "この駅ガイドをシェア",
  },
  shareText: {
    ko: "{station} 출구·화장실·물품보관함 정보 | 지하철꿀정보",
    en: "{station} exits, lockers & restrooms | K-SUB Seoul Subway Guide",
    zh: "{station}出口·储物柜·洗手间信息 | K-SUB 首尔地铁指南",
    ja: "{station}の出口・ロッカー・トイレ情報 | K-SUB ソウル地下鉄ガイド",
  },
  shareKakao: { ko: "카카오톡 공유", en: "KakaoTalk" },
  shareKakaoButton: { ko: "역 정보 보기", en: "View station guide" },
  shareCopy: { ko: "링크 복사", en: "Copy link", zh: "复制链接", ja: "リンクをコピー" },
  shareCopied: { ko: "링크를 복사했어요", en: "Link copied!", zh: "链接已复制", ja: "リンクをコピーしました" },
  shareBookmark: { ko: "즐겨찾기", en: "Save bookmark", zh: "收藏书签", ja: "ブックマーク" },
  shareBookmarkHint: {
    ko: "Ctrl+D(Mac은 ⌘+D)로 즐겨찾기에 추가하세요. 휴대폰은 브라우저 메뉴의 ☆ 또는 '북마크 추가'를 누르세요.",
    en: "Press Ctrl+D (⌘+D on Mac) to bookmark this page. On a phone, open the browser menu and tap ☆ or “Add bookmark”.",
    zh: "按 Ctrl+D（Mac 为 ⌘+D）收藏本页。手机请打开浏览器菜单，点击 ☆ 或“添加书签”。",
    ja: "Ctrl+D（Macは⌘+D）でこのページをブックマーク。スマホはブラウザのメニューから ☆ または「ブックマークに追加」をタップ。",
  },
  exitMap: { ko: "지도", en: "Map", zh: "地图", ja: "地図" },
  exitNearby: { ko: "주변 장소", en: "What's nearby", zh: "周边地点", ja: "周辺スポット" },
  exitRestroom: { ko: "근처 화장실", en: "Restroom nearby", zh: "附近有洗手间", ja: "近くにトイレ" },
  exitElevator: { ko: "엘리베이터 출구", en: "Elevator exit", zh: "电梯出口", ja: "エレベーター出口" },
  stepFree: {
    ko: "계단 없는 이동 (엘리베이터)",
    en: "Step-free access (elevators)",
    zh: "无障碍通行（电梯）",
    ja: "段差なしルート（エレベーター）",
  },
  stepFreeHint: {
    ko: "지상에서 승강장까지 엘리베이터로 이동하는 출구예요. 큰 짐이나 유모차가 있을 때 편해요.",
    en: "Take this exit to ride elevators all the way between the street and the platform: easier with big luggage or a stroller.",
    zh: "从这个出口可全程乘电梯往返地面与站台，携带大件行李或婴儿车更方便。",
    ja: "この出口なら地上からホームまでエレベーターだけで移動できます。大きな荷物やベビーカーでも安心。",
  },
  advertisement: { ko: "광고", en: "Advertisement", zh: "广告", ja: "広告" },
  faq: { ko: "자주 묻는 질문", en: "FAQ", zh: "常见问题", ja: "よくある質問" },
  browseLines: { ko: "노선별로 보기", en: "Browse by line", zh: "按线路浏览", ja: "路線から探す" },
  lineHeading: {
    ko: "{line} 전체 역 안내",
    en: "Seoul Subway {line}: All Stations",
    zh: "首尔地铁{line}全部车站",
    ja: "ソウル地下鉄{line} 全駅ガイド",
  },
  lineMetaTitle: {
    ko: "{line} 역 목록: 출구·화장실·물품보관함 | 지하철꿀정보",
    en: "Seoul Subway {line} Stations: Exits, Lockers & Restrooms | K-SUB",
    zh: "首尔地铁{line}车站一览：出口、储物柜、洗手间 | K-Sub",
    ja: "ソウル地下鉄{line} 駅一覧：出口・ロッカー・トイレ | K-Sub",
  },
  lineDescription: {
    ko: "{line} {n}개 역을 순서대로, 출구 지도·화장실·물품보관함·엘리베이터·환승 정보와 함께 확인하세요.",
    en: "All {n} stations on Seoul Subway {line} in order, with exit maps, restrooms, coin lockers, elevators and transfer tips for travelers.",
    zh: "按顺序查看首尔地铁{line}全部{n}个车站，附出口地图、洗手间、投币储物柜、电梯及换乘信息。",
    ja: "ソウル地下鉄{line}の全{n}駅を順番に。出口マップ、トイレ、コインロッカー、エレベーター、乗り換え情報付き。",
  },
  lineFactLockers: { ko: "보관함 있는 역 {n}", en: "{n} with lockers", zh: "{n}站有储物柜", ja: "ロッカーあり {n}駅" },
  lineFactStepFree: { ko: "엘리베이터 출구 {n}", en: "{n} step-free", zh: "{n}站有电梯出口", ja: "エレベーター出口 {n}駅" },
  lineFactTransfers: { ko: "환승역 {n}", en: "{n} transfer stations", zh: "换乘站{n}个", ja: "乗り換え駅 {n}" },
  lineStations: { ko: "역 순서", en: "Stations in order", zh: "车站顺序", ja: "駅の順番" },
  lineStationsHint: {
    ko: "역 이름을 누르면 출구·화장실·물품보관함 정보를 볼 수 있어요.",
    en: "Tap a station for its exits, restrooms and lockers.",
    zh: "点击站名查看出口、洗手间和储物柜信息。",
    ja: "駅名をタップすると出口・トイレ・ロッカー情報を見られます。",
  },
  lineGuide: { ko: "{line} 전체 역 →", en: "All {line} stations →", zh: "{line}全部车站 →", ja: "{line}の全駅 →" },
  otherLines: { ko: "다른 노선", en: "Other lines", zh: "其他线路", ja: "ほかの路線" },
  dataNote: {
    ko: "자료: 서울교통공사(화장실·물품보관함·환승), 출구 위치 © OpenStreetMap 기여자(ODbL). 현장 사정과 다를 수 있어요.",
    en: "Sources: Seoul Metro (restrooms, lockers, transfers); exit locations © OpenStreetMap contributors (ODbL). Conditions on site may differ.",
    zh: "数据来源：首尔交通公社（洗手间、储物柜、换乘）；出口位置 © OpenStreetMap 贡献者（ODbL）。实际情况可能有所不同。",
    ja: "出典：ソウル交通公社（トイレ・ロッカー・乗り換え）、出口位置 © OpenStreetMap contributors（ODbL）。現地の状況と異なる場合があります。",
  },
  language: { ko: "언어", en: "Language", zh: "语言", ja: "言語" },
  navMap: { ko: "노선도", en: "Subway map", zh: "线路图", ja: "路線図" },
  navGuides: { ko: "이용 가이드", en: "Travel guides", zh: "乘车指南", ja: "乗り方ガイド" },
  mapTitle: {
    ko: "서울 지하철 노선도: 전체 노선·역 인터랙티브 지도",
    en: "Seoul Subway Map: Interactive Map of All Lines & Stations",
    zh: "首尔地铁线路图：全部线路与车站互动地图",
    ja: "ソウル地下鉄路線図：全路線・全駅のインタラクティブマップ",
  },
  mapHeading: {
    ko: "서울 지하철 노선도",
    en: "Seoul Subway Map",
    zh: "首尔地铁线路图",
    ja: "ソウル地下鉄 路線図",
  },
  mapLead: {
    ko: "수도권 {lines}개 노선, {n}개 역을 한눈에 보는 노선도예요. 역을 누르면 출구·화장실·물품보관함 정보가 바로 나와요.",
    en: "All {lines} lines and {n} stations of the Seoul metro area on one map. Tap any station to see its exits, restrooms and lockers.",
    zh: "一张图看懂首尔首都圈{lines}条线路、{n}个车站。点击车站即可查看出口、洗手间和储物柜信息。",
    ja: "首都圏の{lines}路線・{n}駅をひと目で見られる路線図です。駅をタップすると出口・トイレ・ロッカー情報がすぐに表示されます。",
  },
  mapDescription: {
    ko: "서울 지하철 노선도를 확대·이동하며 보세요. 1~9호선, 신분당선, 공항철도 등 수도권 전 노선과 역별 출구·화장실·물품보관함 정보로 바로 연결돼요.",
    en: "Interactive Seoul subway map with every line, from Lines 1–9 to AREX and the Shinbundang Line. Zoom, pan and tap any station for exits, restrooms and lockers.",
    zh: "可缩放的首尔地铁线路图，涵盖1～9号线、机场铁路、新盆唐线等全部线路，点击任意车站即可查看出口、洗手间和储物柜。",
    ja: "拡大・移動できるソウル地下鉄路線図。1～9号線、空港鉄道、新盆唐線など全路線を掲載し、各駅の出口・トイレ・ロッカー情報にすぐアクセス。",
  },
  mapHint: {
    ko: "드래그로 이동, 휠·두 손가락으로 확대해요. 확대할수록 역 이름이 더 많이 보여요.",
    en: "Drag to move, scroll or pinch to zoom. More station names appear as you zoom in.",
    zh: "拖动移动，滚轮或双指缩放。越放大，显示的站名越多。",
    ja: "ドラッグで移動、ホイールやピンチで拡大。拡大するほど駅名が多く表示されます。",
  },
  mapLabel: {
    ko: "서울 지하철 노선도. 역을 누르면 역 정보가 열립니다.",
    en: "Seoul subway map. Select a station to see its details.",
    zh: "首尔地铁线路图。点击车站查看详情。",
    ja: "ソウル地下鉄路線図。駅を選ぶと詳細が表示されます。",
  },
  mapSearch: { ko: "역 이름 검색", en: "Search a station", zh: "搜索车站", ja: "駅名で検索" },
  mapAllLines: { ko: "전체 노선", en: "All lines", zh: "全部线路", ja: "全路線" },
  mapClose: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  mapExpand: { ko: "크게 보기", en: "Full screen", zh: "全屏", ja: "全画面" },
  mapCollapse: { ko: "작게 보기", en: "Exit full screen", zh: "退出全屏", ja: "全画面を終了" },
  mapFactExits: { ko: "출구", en: "Exits", zh: "出口", ja: "出口" },
  mapFactRestrooms: { ko: "화장실", en: "Restrooms", zh: "洗手间", ja: "トイレ" },
  mapFactLockers: { ko: "물품보관함", en: "Lockers", zh: "储物柜", ja: "ロッカー" },
  mapFactElevator: { ko: "엘리베이터", en: "Elevator", zh: "电梯", ja: "エレベーター" },
  mapExitsCount: { ko: "{n}개", en: "{n} exits", zh: "{n}个", ja: "{n}か所" },
  mapGuide: {
    ko: "출구·화장실·보관함 자세히",
    en: "Exits, restrooms & lockers",
    zh: "出口、洗手间、储物柜详情",
    ja: "出口・トイレ・ロッカーの詳細",
  },
  mapLive: { ko: "실시간 도착 정보", en: "Live arrivals", zh: "实时到站信息", ja: "リアルタイム到着情報" },
  mapZoomIn: { ko: "확대", en: "Zoom in", zh: "放大", ja: "拡大" },
  mapZoomOut: { ko: "축소", en: "Zoom out", zh: "缩小", ja: "縮小" },
  mapReset: { ko: "서울 중심으로", en: "Back to central Seoul", zh: "回到首尔市中心", ja: "ソウル中心部に戻る" },
  mapLegend: { ko: "노선별 역 목록", en: "Stations by line", zh: "各线路车站", ja: "路線別の駅一覧" },
  mapHowTitle: { ko: "노선도 보는 법", en: "How to read this map", zh: "如何看这张线路图", ja: "路線図の見方" },
  mapHow1: {
    ko: "선 색은 노선 색이에요. 서울 지하철 역과 열차에도 같은 색이 쓰여요.",
    en: "Each colour is a line, the same colour used on signs and trains in Seoul stations.",
    zh: "每种颜色代表一条线路，与首尔车站标识和列车上的颜色相同。",
    ja: "線の色は路線の色で、ソウルの駅や車両の案内にも同じ色が使われています。",
  },
  mapHow2: {
    ko: "검은 테두리 동그라미는 환승역이에요. 갈아탈 때 가장 빠른 칸은 각 역 페이지에 있어요.",
    en: "Stations with a black ring are transfer stations. Each station page lists the fastest car and door for changing lines.",
    zh: "黑色圆圈的车站是换乘站。各车站页面列出了换乘最快的车厢和车门。",
    ja: "黒い縁取りの駅は乗り換え駅です。最速の乗り換え号車・ドアは各駅のページに載っています。",
  },
  mapHow3: {
    ko: "공식 노선도처럼 선을 곧게 펴고 역 간격을 고르게 그렸어요. 실제 거리와 방향은 조금 달라요.",
    en: "Like the official diagram, lines are straightened and stations evenly spaced, so distances and directions are approximate.",
    zh: "与官方线路图一样，线路被拉直、车站等距排列，因此距离和方向仅供参考。",
    ja: "公式路線図のように線をまっすぐにし、駅を等間隔に描いているため、距離や方角はおおよそです。",
  },
  mapNote: {
    ko: "역 순서 © OpenStreetMap 기여자(ODbL). 급행 노선은 표시하지 않았어요.",
    en: "Station order © OpenStreetMap contributors (ODbL). Express services are not drawn separately.",
    zh: "车站顺序 © OpenStreetMap 贡献者（ODbL）。快车线路未单独绘制。",
    ja: "駅の順番 © OpenStreetMap contributors（ODbL）。急行は別に描いていません。",
  },
  guidesTitle: {
    ko: "서울 지하철 이용 가이드: 공항·교통카드·요금·짐",
    en: "Seoul Subway Travel Guides: Airport, T-money, Fares & Luggage",
    zh: "首尔地铁乘车指南：机场、T-money、票价与行李",
    ja: "ソウル地下鉄 乗り方ガイド：空港・T-money・運賃・荷物",
  },
  guidesHeading: {
    ko: "서울 지하철 이용 가이드",
    en: "Seoul subway travel guides",
    zh: "首尔地铁乘车指南",
    ja: "ソウル地下鉄 乗り方ガイド",
  },
  guidesLead: {
    ko: "처음 서울 지하철을 타는 여행자를 위한 핵심 정리예요.",
    en: "Everything first-time visitors ask about riding the Seoul subway, in one place.",
    zh: "第一次乘坐首尔地铁的旅客最常问的问题，一次讲清楚。",
    ja: "初めてソウルの地下鉄に乗る旅行者がよく迷うポイントをまとめました。",
  },
  guidesDescription: {
    ko: "인천공항에서 시내 가는 법, 티머니·기후동행카드, 지하철 요금과 막차, 캐리어 들고 타는 법까지 서울 지하철 이용 가이드.",
    en: "How to get from Incheon Airport to Seoul, buy and top up T-money, pay fares, catch the last train and ride with luggage on the Seoul subway.",
    zh: "从仁川机场到首尔市区、T-money 交通卡购买与充值、票价与末班车、携带行李乘车，首尔地铁实用指南。",
    ja: "仁川空港からソウル市内への行き方、T-moneyの買い方・チャージ、運賃と終電、荷物を持っての乗り方まで、ソウル地下鉄ガイド。",
  },
  guidesMore: { ko: "다른 가이드", en: "More guides", zh: "更多指南", ja: "ほかのガイド" },
  guideRead: { ko: "읽기", en: "Read", zh: "阅读", ja: "読む" },
  guideStations: { ko: "관련 역", en: "Stations in this guide", zh: "相关车站", ja: "関連する駅" },
  guideChecked: {
    ko: "{date} 기준 정보예요. 요금과 운행 시간은 바뀔 수 있으니 공식 안내도 확인하세요.",
    en: "Checked {date}. Fares and timetables change, so confirm with the official sources linked below.",
    zh: "信息更新于{date}。票价和时刻可能调整，请以下方官方信息为准。",
    ja: "{date}時点の情報です。運賃や時刻は変わることがあるため、下の公式情報もご確認ください。",
  },
  guideSources: { ko: "공식 안내", en: "Official sources", zh: "官方信息", ja: "公式情報" },
  lockerPrices: {
    ko: "T-Locker 크기와 기본요금 (4시간)",
    en: "T-Locker sizes and base prices (4 hours)",
    zh: "T-Locker 尺寸与基本费用（4小时）",
    ja: "T-Lockerのサイズと基本料金（4時間）",
  },
  lockerSize: { ko: "크기", en: "Size", zh: "尺寸", ja: "サイズ" },
  weekday: { ko: "평일", en: "Weekdays", zh: "工作日", ja: "平日" },
  weekend: { ko: "주말·공휴일", en: "Weekends & holidays", zh: "周末及节假日", ja: "土日祝" },
  lockerExtra: {
    ko: "4시간 이후 1시간마다 추가 요금, 운영 {open}:00~{close}:00, 최대 {days}일.",
    en: "Extra charge per hour after 4 hours. Open {open}:00–{close}:00, up to {days} days.",
    zh: "超过4小时后每小时加收费用。使用时间 {open}:00～{close}:00，最长{days}天。",
    ja: "4時間以降は1時間ごとに追加料金。利用時間 {open}:00～{close}:00、最大{days}日。",
  },
  deskList: {
    ko: "T-Luggage 데스크 위치 ({open}:00~{close}:00)",
    en: "T-Luggage desk locations ({open}:00–{close}:00)",
    zh: "T-Luggage 柜台位置（{open}:00～{close}:00）",
    ja: "T-Luggageカウンターの場所（{open}:00～{close}:00）",
  },
  pricesMayChange: {
    ko: "요금은 운영사 사정에 따라 바뀔 수 있어요.",
    en: "Prices are set by the operator and may change.",
    zh: "价格由运营方制定，可能会调整。",
    ja: "料金は運営会社の都合で変わることがあります。",
  },
} satisfies Record<string, Localized>;

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** `values` are inserted after conversion, so pass them already in the guide language. */
export function tc(key: keyof typeof COPY, locale: GuideLocale, values?: Record<string, string | number>) {
  const text = gt(COPY[key], locale);
  return values ? fill(text, values) : text;
}

/** "Gangnam" → "Gangnam Station"; the other languages already end in 역/站/駅. */
export function stationTitle(station: GuideStation, locale: GuideLocale) {
  const name = gt(station.name, locale);
  if (locale !== "en") return name;
  return /station$/i.test(name) ? name : `${name} Station`;
}

function floorText(floor: string, locale: Locale) {
  const below = /^B(\d+)$/.exec(floor);
  if (below) {
    const n = below[1];
    return { ko: `지하 ${n}층`, en: `B${n}`, zh: `地下${n}层`, ja: `地下${n}階` }[locale];
  }
  const above = /^(\d+)F$/.exec(floor);
  if (above) {
    const n = above[1];
    return { ko: `지상 ${n}층`, en: `${n}F`, zh: `${n}层`, ja: `${n}階` }[locale];
  }
  if (floor === "중층") return { ko: "중층", en: "Mezzanine", zh: "夹层", ja: "中層" }[locale];
  return floor;
}

export function floorLabel(floor: string, locale: GuideLocale) {
  return inScript(locale, floorText(floor, contentLocale(locale)));
}

function listJoin(items: string[], locale: Locale) {
  if (locale === "en") {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
  }
  return items.join(locale === "ko" ? ", " : "、");
}

function minutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

/** "Line 2 and the Shinbundang Line" */
function linesPhrase(lines: readonly string[], locale: Locale) {
  return listJoin(
    lines.map((line) => {
      const name = localLine(line, locale);
      return locale === "en" && / Line$/.test(name) && !/^Line /.test(name) ? `the ${name}` : name;
    }),
    locale,
  );
}

/** A few data-driven sentences, so every station page says something specific about that station. */
export function stationSummary(station: GuideStation, detail: GuideDetail, locale: GuideLocale) {
  return summaryText(station, detail, contentLocale(locale)).map((sentence) => inScript(locale, sentence));
}

function summaryText(station: GuideStation, detail: GuideDetail, locale: Locale): string[] {
  const title = stationTitle(station, locale);
  const lines = linesPhrase(station.lines, locale);
  const exits = detail.exits.length;
  const toilets = detail.toilets.length;
  const insideToilets = detail.toilets.filter((row) => row.gate === "inside").length;
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const walks = detail.transfers.map((row) => row.seconds).filter((value): value is number => value !== null);
  const fastest = walks.length ? minutes(Math.min(...walks)) : null;
  const slowest = walks.length ? minutes(Math.max(...walks)) : null;
  const walkRange = fastest === null ? "" : fastest === slowest ? `${fastest}` : `${fastest}–${slowest}`;
  const out: string[] = [];

  if (locale === "en") {
    out.push(`${title} is a Seoul-area subway station on ${lines}.`);
    if (exits) out.push(`It has ${exits} numbered exit${exits === 1 ? "" : "s"}; tap any exit below to see it on the map.`);
    if (toilets === 1)
      out.push(`There is 1 restroom, ${insideToilets ? "inside" : "outside"} the fare gates.`);
    else if (toilets)
      out.push(
        `There are ${toilets} restrooms` +
          (insideToilets ? `, ${insideToilets} of them inside the fare gates.` : ", all outside the fare gates."),
      );
    if (detail.lockers.length)
      out.push(
        `You can store luggage in ${detail.lockers.length} coin locker bank${detail.lockers.length === 1 ? "" : "s"}` +
          (lockerSlots ? ` (about ${lockerSlots} lockers in total).` : "."),
      );
    if (walkRange) out.push(`Changing lines here takes about ${walkRange} minutes on foot.`);
  } else if (locale === "zh") {
    out.push(`${title}是首尔地铁${lines}的车站。`);
    if (exits) out.push(`共有${exits}个编号出口，点击下方出口编号即可在地图上查看。`);
    if (toilets === 1) out.push(`站内有1处洗手间，位于检票口${insideToilets ? "内" : "外"}。`);
    else if (toilets)
      out.push(`站内共有${toilets}处洗手间${insideToilets ? `，其中${insideToilets}处位于检票口内` : "，均位于检票口外"}。`);
    if (detail.lockers.length)
      out.push(`设有${detail.lockers.length}处投币储物柜${lockerSlots ? `（共约${lockerSlots}格）` : ""}，可寄存行李。`);
    if (walkRange) out.push(`在本站换乘步行约需${walkRange}分钟。`);
  } else if (locale === "ja") {
    out.push(`${title}はソウル地下鉄${lines}の駅です。`);
    if (exits) out.push(`番号付きの出口が${exits}か所あり、下の出口番号をタップすると地図で確認できます。`);
    if (toilets === 1) out.push(`トイレは1か所（改札${insideToilets ? "内" : "外"}）です。`);
    else if (toilets)
      out.push(`トイレは${toilets}か所${insideToilets ? `（うち改札内${insideToilets}か所）` : "（すべて改札外）"}です。`);
    if (detail.lockers.length)
      out.push(`コインロッカーが${detail.lockers.length}か所${lockerSlots ? `（計約${lockerSlots}個）` : ""}あり、荷物を預けられます。`);
    if (walkRange) out.push(`この駅での乗り換えは徒歩約${walkRange}分です。`);
  } else {
    out.push(`${title}(${lines})은 수도권 지하철역이에요.`);
    if (exits) out.push(`출구는 ${exits}개이고, 아래 출구 번호를 누르면 지도에서 위치를 볼 수 있어요.`);
    if (toilets === 1) out.push(`화장실은 개찰구 ${insideToilets ? "안" : "밖"}에 1곳 있어요.`);
    else if (toilets)
      out.push(`화장실은 ${toilets}곳${insideToilets ? `(개찰구 안 ${insideToilets}곳)` : "(모두 개찰구 밖)"} 있어요.`);
    if (detail.lockers.length)
      out.push(`물품보관함은 ${detail.lockers.length}곳${lockerSlots ? `(약 ${lockerSlots}칸)` : ""} 있어요.`);
    if (walkRange) out.push(`이 역에서 환승할 때는 도보로 약 ${walkRange}분 걸려요.`);
  }
  return out;
}

/** 로 after a vowel or ㄹ, 으로 after any other final consonant. */
function toParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "로";
  const final = code % 28;
  return final === 0 || final === 8 ? "로" : "으로";
}

export type FaqItem = { question: string; answer: string };

/** Question-style answers built from the station's data; questions without data are left out. */
export function stationFaq(station: GuideStation, detail: GuideDetail, locale: GuideLocale): FaqItem[] {
  return faqText(station, detail, contentLocale(locale)).map((item) => ({
    question: inScript(locale, item.question),
    answer: inScript(locale, item.answer),
  }));
}

function faqText(station: GuideStation, detail: GuideDetail, locale: Locale): FaqItem[] {
  const title = stationTitle(station, locale);
  const lines = linesPhrase(station.lines, locale);
  const nextStops = [
    ...new Map(detail.neighbors.flatMap((group) => group.stations).map((next) => [next.slug, next])).values(),
  ].map((next) => stationTitle(next, locale));
  const exits = detail.exits.length;
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const toiletExits = [...new Set(detail.toilets.map((row) => row.exit).filter((exit): exit is string => !!exit))].map(
    (exit) => tc("exitLabel", locale, { n: exit }),
  );
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const lockersInside = detail.lockers.filter((row) => row.insideGate).length;
  const lockerGate =
    lockersInside === detail.lockers.length ? "inside" : lockersInside === 0 ? "outside" : "both";
  const desk = detail.luggageDesk ? t(detail.luggageDesk, locale) : null;
  const elevatorExits = detail.elevators.map((row) =>
    detail.elevators.length > 1 ? `${t(row.exit, locale)} (${localLine(row.line, locale)})` : t(row.exit, locale),
  );
  const walks = detail.transfers.filter((row) => row.seconds !== null);
  const quickest = walks.length ? walks.reduce((best, row) => (row.seconds! < best.seconds! ? row : best)) : null;
  const fastestMinutes = quickest ? minutes(quickest.seconds!) : null;
  const slowestMinutes = walks.length ? minutes(Math.max(...walks.map((row) => row.seconds!))) : null;
  const walkRange =
    fastestMinutes === null ? "" : fastestMinutes === slowestMinutes ? `${fastestMinutes}` : `${fastestMinutes}–${slowestMinutes}`;
  const [car, door = ""] = quickest?.alight.split("-") ?? [];
  const toiletGate = inside && outside ? "both" : inside ? "inside" : "outside";
  const quickFrom = quickest ? linesPhrase([quickest.fromLine], locale) : "";
  const quickTo = quickest ? linesPhrase([quickest.toLine], locale) : "";
  const quickToward = quickest ? (quickest.fromToward ? t(quickest.fromToward.name, locale) : quickest.fromTowardKo) : "";
  const address = detail.address;
  const out: FaqItem[] = [];

  if (locale === "en") {
    if (detail.lockers.length || desk)
      out.push({
        question: `Are there luggage lockers (coin lockers) at ${title}?`,
        answer:
          (detail.lockers.length
            ? `Yes. There ${detail.lockers.length === 1 ? "is 1 coin locker bank" : `are ${detail.lockers.length} coin locker banks`}` +
              (lockerSlots ? ` with about ${lockerSlots} lockers in total` : "") +
              `, ${lockerGate === "both" ? "both inside and outside" : lockerGate} the fare gates.`
            : "There are no coin lockers listed here.") + (desk ? ` A staffed T-Luggage desk is available: ${desk}.` : ""),
      });
    if (detail.toilets.length)
      out.push({
        question: `Where are the restrooms located in ${title}?`,
        answer:
          (detail.toilets.length === 1
            ? `There is 1 restroom, ${toiletGate} the fare gates.`
            : toiletGate === "both"
              ? `There are ${detail.toilets.length} restrooms: ${inside} inside and ${outside} outside the fare gates.`
              : `There are ${detail.toilets.length} restrooms, all ${toiletGate} the fare gates.`) +
          (toiletExits.length ? ` They're near ${listJoin(toiletExits, locale)}.` : ""),
      });
    if (elevatorExits.length)
      out.push({
        question: `Which exit of ${title} has elevators?`,
        answer: `Use ${listJoin(elevatorExits, locale)} to go between the street and the platform by elevator, the easiest route with big luggage or a stroller.`,
      });
    out.push({
      question: `Which subway lines stop at ${title}?`,
      answer: `${title} is on ${lines}.` + (nextStops.length ? ` The next stops are ${listJoin(nextStops, locale)}.` : ""),
    });
    if (exits)
      out.push({
        question: `How many exits does ${title} have?`,
        answer: `${title} has ${exits} numbered exit${exits === 1 ? "" : "s"}. Each exit card on this page opens the exit in Google Maps and shows what's around it.`,
      });
    if (quickest)
      out.push({
        question: `How long does it take to transfer at ${title}?`,
        answer: `About ${walkRange} minutes on foot. For the quickest change from ${quickFrom} (toward ${quickToward}) to ${quickTo}, ride in car ${car}, door ${door}.`,
      });
    out.push({
      question: `How do I tell a taxi driver to go to ${title}?`,
      answer:
        `Show the driver the Korean name ${station.ko}` +
        (address ? ` or the address ${address}` : "") +
        `. The "Show to Korean / Taxi Driver" button on this page puts it on screen in large text.`,
    });
  } else if (locale === "zh") {
    out.push({
      question: `${title}有哪些线路经过？`,
      answer: `${title}是${lines}的车站。` + (nextStops.length ? `相邻车站为${listJoin(nextStops, locale)}。` : ""),
    });
    if (exits)
      out.push({
        question: `${title}有几个出口？`,
        answer: `${title}共有${exits}个编号出口。点击本页的出口卡片，可在 Google 地图中查看出口位置及周边。`,
      });
    if (detail.toilets.length)
      out.push({
        question: `${title}的洗手间在哪里？`,
        answer:
          `共有${detail.toilets.length}处洗手间，${
            toiletGate === "both" ? `检票口内${inside}处、检票口外${outside}处` : `位于检票口${toiletGate === "inside" ? "内" : "外"}`
          }。` +
          (toiletExits.length ? `位于${listJoin(toiletExits, locale)}附近。` : ""),
      });
    if (detail.lockers.length || desk)
      out.push({
        question: `${title}有行李寄存柜吗？`,
        answer:
          (detail.lockers.length
            ? `有。设有${detail.lockers.length}处投币储物柜${lockerSlots ? `（共约${lockerSlots}格）` : ""}，位于检票口${
                { inside: "内", outside: "外", both: "内外" }[lockerGate]
              }。`
            : "本站没有投币储物柜。") + (desk ? `另有人工 T-Luggage 柜台：${desk}。` : ""),
      });
    if (elevatorExits.length)
      out.push({
        question: `${title}有从地面直达站台的电梯吗？`,
        answer: `有。从${listJoin(elevatorExits, locale)}可全程乘电梯往返地面与站台，携带大件行李或婴儿车最方便。`,
      });
    if (quickest)
      out.push({
        question: `在${title}换乘需要多久？`,
        answer: `步行约${walkRange}分钟。从${quickFrom}（开往${quickToward}方向）换乘${quickTo}时，在${car}号车厢${door}号门下车最快。`,
      });
    out.push({
      question: `怎么告诉出租车司机去${title}？`,
      answer:
        `向司机出示韩文站名“${station.ko}”` +
        (address ? `或地址“${address}”` : "") +
        `即可。点击本页的“出示给韩国人 / 出租车司机”按钮，会以大字显示。`,
    });
  } else if (locale === "ja") {
    out.push({
      question: `${title}には何線が通っていますか？`,
      answer: `${title}は${lines}の駅です。` + (nextStops.length ? `隣の駅は${listJoin(nextStops, locale)}です。` : ""),
    });
    if (exits)
      out.push({
        question: `${title}の出口はいくつありますか？`,
        answer: `${title}には番号付きの出口が${exits}か所あります。このページの出口カードから Google マップで位置と周辺を確認できます。`,
      });
    if (detail.toilets.length)
      out.push({
        question: `${title}のトイレはどこですか？`,
        answer:
          `トイレは${detail.toilets.length}か所（${
            toiletGate === "both" ? `改札内${inside}・改札外${outside}` : `改札${toiletGate === "inside" ? "内" : "外"}`
          }）です。` +
          (toiletExits.length ? `${listJoin(toiletExits, locale)}の近くにあります。` : ""),
      });
    if (detail.lockers.length || desk)
      out.push({
        question: `${title}にコインロッカーはありますか？`,
        answer:
          (detail.lockers.length
            ? `あります。コインロッカーが${detail.lockers.length}か所${lockerSlots ? `（計約${lockerSlots}個）` : ""}、改札${
                { inside: "内", outside: "外", both: "内と改札外" }[lockerGate]
              }にあります。`
            : "コインロッカーはありません。") + (desk ? `有人の T-Luggage カウンターもあります：${desk}。` : ""),
      });
    if (elevatorExits.length)
      out.push({
        question: `${title}に地上からホームまでのエレベーターはありますか？`,
        answer: `あります。${listJoin(elevatorExits, locale)}を使えば地上とホームの間をエレベーターだけで移動でき、大きな荷物やベビーカーでも安心です。`,
      });
    if (quickest)
      out.push({
        question: `${title}での乗り換えにかかる時間は？`,
        answer: `徒歩約${walkRange}分です。${quickFrom}（${quickToward}方面）から${quickTo}へは${car}号車${door}番ドアで降りると最速です。`,
      });
    out.push({
      question: `タクシーで${title}へ行くには？`,
      answer:
        `運転手に韓国語の駅名「${station.ko}」` +
        (address ? `か住所「${address}」` : "") +
        `を見せてください。このページの「韓国人・タクシー運転手に見せる」ボタンで大きく表示できます。`,
    });
  } else {
    out.push({
      question: `${title}에는 어떤 노선이 다니나요?`,
      answer: `${title}은 ${lines} 역이에요.` + (nextStops.length ? ` 인접 역은 ${listJoin(nextStops, locale)}이에요.` : ""),
    });
    if (exits)
      out.push({
        question: `${title} 출구는 몇 개인가요?`,
        answer: `${title} 출구는 ${exits}개예요. 출구 카드를 누르면 Google 지도에서 위치와 주변 장소를 볼 수 있어요.`,
      });
    if (detail.toilets.length)
      out.push({
        question: `${title} 화장실은 어디에 있나요?`,
        answer:
          `화장실은 ${detail.toilets.length}곳(${
            toiletGate === "both" ? `개찰구 안 ${inside}곳, 밖 ${outside}곳` : `개찰구 ${toiletGate === "inside" ? "안" : "밖"}`
          })이에요.` +
          (toiletExits.length ? ` ${listJoin(toiletExits, locale)} 근처에 있어요.` : ""),
      });
    if (detail.lockers.length || desk)
      out.push({
        question: `${title}에 물품보관함이 있나요?`,
        answer:
          (detail.lockers.length
            ? `네. 물품보관함이 개찰구 ${{ inside: "안", outside: "밖", both: "안팎" }[lockerGate]}에 ${detail.lockers.length}곳${
                lockerSlots ? `(약 ${lockerSlots}칸)` : ""
              } 있어요.`
            : "물품보관함은 없어요.") + (desk ? ` 유인 T-Luggage 데스크도 있어요: ${desk}.` : ""),
      });
    if (elevatorExits.length)
      out.push({
        question: `${title}에 지상에서 승강장까지 가는 엘리베이터가 있나요?`,
        answer: `네. ${listJoin(elevatorExits, locale)}를 이용하면 지상과 승강장 사이를 엘리베이터로만 이동할 수 있어요.`,
      });
    if (quickest)
      out.push({
        question: `${title}에서 환승하는 데 얼마나 걸리나요?`,
        answer: `도보로 약 ${walkRange}분 걸려요. ${quickFrom}(${quickToward} 방면)에서 ${quickTo}${toParticle(quickTo)} 갈아탈 때는 ${car}-${door} 칸에서 내리면 가장 빨라요.`,
      });
  }
  return out;
}

/** "Line 2 · Shinbundang": short line names, optionally capped with "+n". */
function shortLines(lines: readonly string[], locale: Locale, separator: string, max = Infinity) {
  const numbers = lines.map((line) => /^(\d+)호선$/.exec(line)?.[1]).filter((n): n is string => !!n);
  const grouped = locale === "en" && numbers.length > 1;
  const names = (grouped ? lines.filter((line) => !/^\d+호선$/.test(line)) : lines).map((line) => {
    const name = localLine(line, locale);
    const short = locale === "en" ? name.replace(/ Line$/, "") : name;
    return short.length > 2 ? short : name;
  });
  if (grouped) names.unshift(`Lines ${numbers.join(", ")}`);
  const shown = names.slice(0, max).join(separator);
  return names.length > max ? `${shown} +${names.length - max}` : shown;
}

/** Station name with its "station" word exactly once: 서울역, ソウル駅, 首尔站, Seoul Station. */
function stationName(station: GuideStation, locale: Locale) {
  const name = stationTitle(station, locale);
  const suffix = { ko: "역", ja: "駅", zh: "站", en: "" }[locale];
  return suffix && !name.endsWith(suffix) ? `${name}${suffix}` : name;
}

/** Search-phrase titles; claims a station can't back (gated restrooms, transfers) are dropped for that station. */
export function stationMetaTitle(station: GuideStation, detail: GuideDetail, locale: GuideLocale) {
  const base = contentLocale(locale);
  const name = stationName(station, base);
  const insideRestroom = detail.toilets.some((row) => row.gate === "inside");
  const transfers = detail.transfers.length > 0;
  return inScript(
    locale,
    {
      en: `${name} Exit Map, Lockers & Restrooms Guide | K-SUB`,
      ja: `${name} コインロッカー・出口マップ・トイレ位置ガイド | K-SUB`,
      zh: `${name}出口地图、储物柜及洗手间位置指南 | K-SUB`,
      ko: `${name} ${insideRestroom ? "개찰구 안 " : ""}화장실 위치, 물품보관함 & ${transfers ? "빠른환승 " : ""}출구 꿀팁 | 지하철꿀정보`,
    }[base],
  );
}

/** Shorter title for link previews (KakaoTalk, WhatsApp, Reddit). */
export function stationOgTitle(station: GuideStation, locale: GuideLocale) {
  const base = contentLocale(locale);
  const name = stationName(station, base);
  return inScript(
    locale,
    {
      en: `${name} Guide & Exit Map - K-SUB`,
      ja: `${name}ガイド & 出口マップ - K-SUB`,
      zh: `${name}指南 & 出口地图 - K-SUB`,
      ko: `${name} 정보 & 출구 지도 - 지하철꿀정보`,
    }[base],
  );
}

/** English and Japanese follow travelers' search phrases; Korean and Chinese lead with the station's own numbers. */
export function stationMetaDescription(station: GuideStation, detail: GuideDetail, locale: GuideLocale) {
  return inScript(locale, metaDescriptionText(station, detail, contentLocale(locale)));
}

function metaDescriptionText(station: GuideStation, detail: GuideDetail, locale: Locale) {
  if (locale === "en" || locale === "ja") {
    const name = stationName(station, locale);
    const insideRestroom = detail.toilets.some((row) => row.gate === "inside");
    const transfers = detail.transfers.length > 0;
    if (locale === "ja")
      return `${name}のコインロッカー位置、改札内外のトイレ、エレベーター出口情報を分かりやすく案内。${transfers ? "最速乗り換えドアも掲載。" : ""}`;
    return (
      `Find ${name} exit maps, luggage storage/lockers, ${insideRestroom ? "restrooms inside the gates" : "restroom locations"}, ` +
      `and ${transfers ? "transfer info" : "elevator access"} for travelers in Seoul.`
    );
  }
  return stationFactsDescription(station, detail, locale);
}

function stationFactsDescription(station: GuideStation, detail: GuideDetail, locale: Locale) {
  const title = stationTitle(station, locale);
  const lines = shortLines(station.lines, locale, " · ");
  const exits = detail.exits.length;
  const toilets = detail.toilets.length;
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const allInside = inside === toilets;
  const slots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const banks = detail.lockers.length;
  const elevator =
    detail.elevators.map((row) => t(row.exit, locale)).find((exit) => /\d/.test(exit)) ?? null;
  const transfers = detail.transfers.length > 0;
  const facts: string[] = [];

  if (locale === "zh") {
    if (exits) facts.push(`${exits}个出口地图`);
    if (toilets) facts.push(`${toilets}处洗手间${allInside ? "（检票口内）" : inside ? `（检票口内${inside}处）` : ""}`);
    if (slots) facts.push(`${slots}格投币储物柜`);
    else if (banks) facts.push(`${banks}处储物柜`);
    if (elevator) facts.push(`${elevator}电梯`);
    if (transfers) facts.push("最快换乘车门");
    return `${title.startsWith("首尔") ? "" : "首尔"}${title}（${lines}）：${facts.length ? listJoin(facts, locale) : "出口、洗手间、投币储物柜与换乘信息"}，一页看懂。`;
  }
  if (exits) facts.push(`출구 ${exits}곳 지도`);
  if (toilets) facts.push(`화장실 ${toilets}곳${allInside ? "(개찰구 안)" : inside ? `(개찰구 안 ${inside}곳)` : ""}`);
  if (slots) facts.push(`물품보관함 ${slots}칸`);
  else if (banks) facts.push(`물품보관함 ${banks}곳`);
  if (elevator) facts.push(`${elevator} 엘리베이터`);
  if (transfers) facts.push("빠른환승 칸");
  return `${title}(${lines}) ${facts.length ? listJoin(facts, locale) : "출구, 화장실, 물품보관함, 빠른환승 정보"}까지 한눈에 확인하세요.`;
}

export function walkMinutesLabel(seconds: number, locale: GuideLocale) {
  return tc("walk", locale, { n: minutes(seconds) });
}
