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
    ko: "출구 번호를 누르면 지도에서 위치를 볼 수 있어요.",
    en: "Tap an exit number to open it in Google Maps.",
    zh: "点击出口编号，在 Google 地图中查看位置。",
    ja: "出口番号をタップすると Google マップで開きます。",
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
  dataNote: {
    ko: "자료: 서울교통공사(화장실·물품보관함·환승), 출구 위치 © OpenStreetMap 기여자(ODbL). 현장 사정과 다를 수 있어요.",
    en: "Sources: Seoul Metro (restrooms, lockers, transfers); exit locations © OpenStreetMap contributors (ODbL). Conditions on site may differ.",
    zh: "数据来源：首尔交通公社（洗手间、储物柜、换乘）；出口位置 © OpenStreetMap 贡献者（ODbL）。实际情况可能有所不同。",
    ja: "出典：ソウル交通公社（トイレ・ロッカー・乗り換え）、出口位置 © OpenStreetMap contributors（ODbL）。現地の状況と異なる場合があります。",
  },
  language: { ko: "언어", en: "Language", zh: "语言", ja: "言語" },
  privacy: { ko: "개인정보처리방침", en: "Privacy", zh: "隐私政策", ja: "プライバシー" },
  terms: { ko: "이용약관", en: "Terms", zh: "使用条款", ja: "利用規約" },
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

/** A few data-driven sentences, so every station page says something specific about that station. */
export function stationSummary(station: GuideStation, detail: GuideDetail, locale: Locale): string[] {
  const title = stationTitle(station, locale);
  const lines = listJoin(
    station.lines.map((line) => {
      const name = localLine(line, locale);
      return locale === "en" && / Line$/.test(name) && !/^Line /.test(name) ? `the ${name}` : name;
    }),
    locale,
  );
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

export function stationMetaTitle(station: GuideStation, locale: Locale) {
  const title = stationTitle(station, locale);
  return {
    ko: `${title} 출구·화장실·물품보관함·빠른환승 정보 | 지하철꿀정보`,
    en: `${title} Guide: Exits, Restrooms, Lockers & Transfers | K-Sub`,
    zh: `${title}指南：出口、洗手间、储物柜、换乘 | K-Sub`,
    ja: `${title}ガイド：出口・トイレ・ロッカー・乗り換え | K-Sub`,
  }[locale];
}

export function stationMetaDescription(station: GuideStation, detail: GuideDetail, locale: Locale) {
  const title = stationTitle(station, locale);
  const lines = station.lines.map((line) => localLine(line, locale)).join(" · ");
  const exits = detail.exits.length;
  return {
    ko: `${title}(${lines}) ${exits ? `출구 ${exits}곳 위치, ` : ""}화장실, 물품보관함, 빠른환승 칸과 실시간 도착 정보를 한눈에 확인하세요.`,
    en: `${title} (${lines}), Seoul: ${exits ? `${exits} exits on the map, ` : ""}restrooms, coin lockers, fastest transfer doors and live train arrivals, in English.`,
    zh: `首尔${title}（${lines}）：${exits ? `${exits}个出口地图、` : ""}洗手间、投币储物柜、最快换乘车门及实时列车到站信息。`,
    ja: `ソウル${title}（${lines}）の${exits ? `出口${exits}か所の地図、` : ""}トイレ、コインロッカー、最速乗り換えドア、リアルタイム列車到着情報。`,
  }[locale];
}

export function walkMinutesLabel(seconds: number, locale: Locale) {
  return tc("walk", locale, { n: minutes(seconds) });
}
