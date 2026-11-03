import type { GuideDetail, GuideStation } from "./guide";
import { localLine } from "./guide";
import { t, type Locale, type Localized } from "./i18n";

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

export const COPY = {
  homeTitle: {
    ko: "서울 지하철 역 정보 가이드: 출구·화장실·물품보관함·빠른환승",
    en: "Seoul Subway Guide for Travelers: Exits, Restrooms, Lockers & Transfers",
    zh: "首尔地铁出行指南：出口、洗手间、储物柜、换乘",
    ja: "ソウル地下鉄 旅行者ガイド：出口・トイレ・コインロッカー・乗り換え",
  },
  homeHeading: {
    ko: "서울 지하철, 역마다 꿀정보",
    en: "Find your way around every Seoul subway station",
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
    en: "Free Seoul subway guide in English: station exits with maps, restrooms, coin lockers, fastest transfer doors and live train arrivals for every Seoul metro station.",
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
  pickExit: { ko: "출구 선택", en: "Pick an exit", zh: "选择出口", ja: "出口を選ぶ" },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
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
    ko: "역 이름을 누르면 출구·화장실·물품보관함 정보를 볼 수 있어요. 🧳 물품보관함 · 🛗 엘리베이터 출구",
    en: "Tap a station for its exits, restrooms and lockers. 🧳 coin lockers · 🛗 elevator exit",
    zh: "点击站名查看出口、洗手间和储物柜信息。🧳 投币储物柜 · 🛗 电梯出口",
    ja: "駅名をタップすると出口・トイレ・ロッカー情報を見られます。🧳 コインロッカー · 🛗 エレベーター出口",
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
} satisfies Record<string, Localized>;

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function tc(key: keyof typeof COPY, locale: Locale, values?: Record<string, string | number>) {
  const text = t(COPY[key], locale);
  return values ? fill(text, values) : text;
}

/** "Gangnam" → "Gangnam Station"; the other languages already end in 역/站/駅. */
export function stationTitle(station: GuideStation, locale: Locale) {
  const name = t(station.name, locale);
  if (locale !== "en") return name;
  return /station$/i.test(name) ? name : `${name} Station`;
}

export function floorLabel(floor: string, locale: Locale) {
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
export function stationSummary(station: GuideStation, detail: GuideDetail, locale: Locale): string[] {
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
export function stationFaq(station: GuideStation, detail: GuideDetail, locale: Locale): FaqItem[] {
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
    out.push({
      question: `Which subway lines stop at ${title}?`,
      answer: `${title} is on ${lines}.` + (nextStops.length ? ` The next stops are ${listJoin(nextStops, locale)}.` : ""),
    });
    if (exits)
      out.push({
        question: `How many exits does ${title} have?`,
        answer: `${title} has ${exits} numbered exit${exits === 1 ? "" : "s"}. Each exit card on this page opens the exit in Google Maps and shows what's around it.`,
      });
    if (detail.toilets.length)
      out.push({
        question: `Where are the restrooms at ${title}?`,
        answer:
          (detail.toilets.length === 1
            ? `There is 1 restroom, ${toiletGate} the fare gates.`
            : toiletGate === "both"
              ? `There are ${detail.toilets.length} restrooms: ${inside} inside and ${outside} outside the fare gates.`
              : `There are ${detail.toilets.length} restrooms, all ${toiletGate} the fare gates.`) +
          (toiletExits.length ? ` They're near ${listJoin(toiletExits, locale)}.` : ""),
      });
    if (detail.lockers.length || desk)
      out.push({
        question: `Are there luggage lockers at ${title}?`,
        answer:
          (detail.lockers.length
            ? `Yes. There ${detail.lockers.length === 1 ? "is 1 coin locker bank" : `are ${detail.lockers.length} coin locker banks`}` +
              (lockerSlots ? ` with about ${lockerSlots} lockers in total` : "") +
              `, ${lockerGate === "both" ? "both inside and outside" : lockerGate} the fare gates.`
            : "There are no coin lockers listed here.") + (desk ? ` A staffed T-Luggage desk is available: ${desk}.` : ""),
      });
    if (elevatorExits.length)
      out.push({
        question: `Does ${title} have an elevator from the street to the platform?`,
        answer: `Yes. Use ${listJoin(elevatorExits, locale)} to go between the street and the platform by elevator, the easiest route with big luggage or a stroller.`,
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

const TITLE_LINES = 2;
/** Roughly where Google starts cutting English titles off. */
const TITLE_MAX = 65;

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

export function stationMetaTitle(station: GuideStation, locale: Locale) {
  const title = stationTitle(station, locale);
  const lines = shortLines(station.lines, locale, locale === "en" ? ", " : "·", TITLE_LINES);
  if (locale === "en") {
    const full = `${title} (${lines}) Exit Guide & Lockers | K-SUB`;
    return full.length <= TITLE_MAX ? full : `${title} (${lines}) Exits & Lockers | K-SUB`;
  }
  return {
    ko: `${title}(${lines}) 출구·화장실·물품보관함 | 지하철꿀정보`,
    zh: `${title}（${lines}）出口·洗手间·储物柜指南 | K-Sub`,
    ja: `${title}（${lines}）出口・トイレ・ロッカー | K-Sub`,
  }[locale];
}

/** Leads with this station's own numbers, which is what makes a result worth clicking. */
export function stationMetaDescription(station: GuideStation, detail: GuideDetail, locale: Locale) {
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

  if (locale === "en") {
    if (exits) facts.push(`${exits} exit map${exits === 1 ? "" : "s"}`);
    if (toilets)
      facts.push(
        toilets === 1
          ? `restroom ${inside ? "inside" : "outside"} the gates`
          : `${toilets} restrooms${allInside ? " inside the gates" : inside ? ` (${inside} inside the gates)` : ""}`,
      );
    if (slots) facts.push(`${slots} coin lockers`);
    else if (banks) facts.push(`${banks} locker bank${banks === 1 ? "" : "s"}`);
    if (elevator) facts.push(`elevator at ${elevator}`);
    if (transfers) facts.push("fastest transfer doors");
    return facts.length
      ? `${title}, Seoul (${lines}): ${listJoin(facts, locale)}.` +
          (facts.length <= 2 ? " Plus the Korean name to show taxi drivers." : "")
      : `${title}, Seoul (${lines}): exits, restrooms, coin lockers and transfer tips for travelers, with the Korean name to show taxi drivers.`;
  }
  if (locale === "zh") {
    if (exits) facts.push(`${exits}个出口地图`);
    if (toilets) facts.push(`${toilets}处洗手间${allInside ? "（检票口内）" : inside ? `（检票口内${inside}处）` : ""}`);
    if (slots) facts.push(`${slots}格投币储物柜`);
    else if (banks) facts.push(`${banks}处储物柜`);
    if (elevator) facts.push(`${elevator}电梯`);
    if (transfers) facts.push("最快换乘车门");
    return `首尔${title}（${lines}）：${facts.length ? listJoin(facts, locale) : "出口、洗手间、投币储物柜与换乘信息"}，一页看懂。`;
  }
  if (locale === "ja") {
    if (exits) facts.push(`出口${exits}か所の地図`);
    if (toilets) facts.push(`トイレ${toilets}か所${allInside ? "（改札内）" : inside ? `（改札内${inside}）` : ""}`);
    if (slots) facts.push(`コインロッカー${slots}個`);
    else if (banks) facts.push(`コインロッカー${banks}か所`);
    if (elevator) facts.push(`${elevator}のエレベーター`);
    if (transfers) facts.push("最速乗り換えドア");
    return `ソウル${title}（${lines}）：${facts.length ? listJoin(facts, locale) : "出口・トイレ・コインロッカー・乗り換え情報"}をまとめてチェック。`;
  }
  if (exits) facts.push(`출구 ${exits}곳 지도`);
  if (toilets) facts.push(`화장실 ${toilets}곳${allInside ? "(개찰구 안)" : inside ? `(개찰구 안 ${inside}곳)` : ""}`);
  if (slots) facts.push(`물품보관함 ${slots}칸`);
  else if (banks) facts.push(`물품보관함 ${banks}곳`);
  if (elevator) facts.push(`${elevator} 엘리베이터`);
  if (transfers) facts.push("빠른환승 칸");
  return `${title}(${lines}) ${facts.length ? listJoin(facts, locale) : "출구, 화장실, 물품보관함, 빠른환승 정보"}까지 한눈에 확인하세요.`;
}

export function walkMinutesLabel(seconds: number, locale: Locale) {
  return tc("walk", locale, { n: minutes(seconds) });
}
