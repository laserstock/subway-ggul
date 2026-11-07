import type { GuideLocale } from "./guideLocale";
import { gt } from "./hant";
import type { Localized } from "./i18n";
import { fillCopy } from "./plannerParams";
import { PLANNER_CATEGORIES, QUICK_TAGS, type PlannerCategory, type QuickTag } from "./plannerTypes";

/** Planner copy in every guide language; `{name}` slots are filled after the zh-tw conversion. */
const TEXT = {
  // Planner home
  homeTitle: {
    ko: "서울 지하철 여행 플래너·일정 만들기",
    en: "Seoul Subway Travel Planner & Itinerary Generator",
    zh: "首尔地铁旅行规划·行程生成器",
    ja: "ソウル地下鉄 旅行プランナー・旅程メーカー",
  },
  homeDescription: {
    ko: "출발역부터 도착역까지 나만의 서울 지하철 여행 일정을 만들어 보세요. 물품보관함, 출구, 올리브영, 다이소, 인기 카페까지 한 번에.",
    en: "Plan your custom Seoul subway travel itinerary from station to station. Find lockers, exit maps, Olive Young, Daiso, and top cafes.",
    zh: "从出发站到到达站，定制你的首尔地铁旅行行程。一次查清储物柜、出口地图、Olive Young、大创和热门咖啡馆。",
    ja: "出発駅から到着駅まで、自分だけのソウル地下鉄旅行プランを作成。ロッカー、出口マップ、オリーブヤング、ダイソー、人気カフェもまとめてチェック。",
  },
  plannerName: {
    ko: "서울 지하철 여행 플래너",
    en: "Seoul Subway Travel Planner",
    zh: "首尔地铁旅行规划",
    ja: "ソウル地下鉄 旅行プランナー",
  },
  homeCardBody: {
    ko: "두 역과 시간만 정하면 보관함, 올리브영, 카페, 팝업까지 담은 시간대별 투어가 완성돼요.",
    en: "Two stations and your hours in, a timed tour with lockers, Olive Young, cafés and pop-ups out.",
    zh: "输入两个车站和时间，即可生成含储物柜、Olive Young、咖啡馆和快闪店的分时段行程。",
    ja: "2つの駅と時間を入れるだけで、ロッカー、オリーブヤング、カフェ、ポップアップ入りの時間別ツアーが完成。",
  },
  freeNoSignup: { ko: "무료 · 가입 없음", en: "Free · No sign-up", zh: "免费 · 无需注册", ja: "無料 · 登録不要" },
  homeLead: {
    ko: "역과 시간, 관심사를 고르면 물품보관함, 화장실, 출구, 올리브영, 다이소, 카페, 팝업까지 담은 시간대별 지하철 투어를 만들어 드려요.",
    en: "Pick your stations, your hours and what you're into. Get a timed subway tour with lockers, restrooms, exits, Olive Young, Daiso, cafés and pop-ups along the way.",
    zh: "选好车站、时间和兴趣，即可获得包含储物柜、洗手间、出口、Olive Young、大创、咖啡馆和快闪店的分时段地铁游。",
    ja: "駅と時間、興味を選ぶだけで、ロッカー、トイレ、出口、オリーブヤング、ダイソー、カフェ、ポップアップを盛り込んだ時間別の地下鉄ツアーが完成します。",
  },
  mapGuideTitle: { ko: "지하철 노선도 가이드", en: "Subway map guide", zh: "地铁线路图指南", ja: "路線図ガイド" },
  mapGuideBody: {
    ko: "어느 역인지 모르겠다면 서울 지하철 전체 노선도를 보거나 1단계에서 “{pick}”을 눌러 보세요.",
    en: "Not sure which stations? Browse the full Seoul subway map, or tap “{pick}” in Step 1.",
    zh: "不确定选哪站？浏览首尔地铁全图，或在第1步点击“{pick}”。",
    ja: "どの駅か迷ったら、ソウル地下鉄の路線図を見るか、ステップ1の「{pick}」をタップ。",
  },
  setupLead: {
    ko: "역, 여행 시간, 카테고리, 퀵태그를 고르세요. 다음 단계에서 경로와 일정을 보여드려요.",
    en: "Stations, travel hours, categories and quick tags. Route options and your itinerary come next.",
    zh: "选择车站、出行时间、类别和快捷标签，接下来会显示路线和行程。",
    ja: "駅、旅行時間、カテゴリー、クイックタグを選びます。次にルートと旅程が表示されます。",
  },
  popularTours: { ko: "인기 지하철 투어", en: "Popular subway tours", zh: "热门地铁游", ja: "人気の地下鉄ツアー" },
  changeAt: { ko: " · {stations} 환승", en: " · change at {stations}", zh: " · 在{stations}换乘", ja: " · {stations}で乗り換え" },
  whatYouGet: { ko: "이런 걸 알려드려요", en: "What you get", zh: "你将获得", ja: "わかること" },
  featureRoutes: { ko: "두 가지 경로", en: "Two routes", zh: "两种路线", ja: "2つのルート" },
  featureRoutesBody: {
    ko: "가장 빠른 경로와 환승이 가장 적은 경로를 비교해요.",
    en: "Compare the shortest ride with the one that has the fewest transfers.",
    zh: "比较最快路线和换乘最少的路线。",
    ja: "最短時間ルートと乗り換え最少ルートを比較できます。",
  },
  featureBags: { ko: "짐과 화장실 걱정 끝", en: "Bags and restrooms sorted", zh: "行李和洗手间不用愁", ja: "荷物とトイレも安心" },
  featureBagsBody: {
    ko: "출구별 T-Locker 위치와 개찰구 안팎 화장실을 알려드려요.",
    en: "T-Locker banks and restrooms inside or outside the gates, by exit.",
    zh: "按出口列出T-Locker储物柜和闸机内外的洗手间。",
    ja: "出口ごとのT-Lockerと、改札内外のトイレがわかります。",
  },
  featureExits: { ko: "출구별 안내", en: "Exit by exit", zh: "按出口导航", ja: "出口ごとに案内" },
  featureExitsBody: {
    ko: "모든 장소에 출구 번호, 도보 시간, 구글 지도 링크가 붙어 있어요.",
    en: "Every spot comes with its exit number, walking time and a Google Maps link.",
    zh: "每个地点都附有出口编号、步行时间和谷歌地图链接。",
    ja: "すべてのスポットに出口番号、徒歩時間、Googleマップのリンク付き。",
  },
  featureLocal: { ko: "현지인에게 보여주기", en: "Show to a local", zh: "出示给当地人", ja: "現地の人に見せる" },
  featureLocalBody: {
    ko: "한 번만 누르면 목적지와 주소를 큰 한글로 띄워 택시 기사님께 보여줄 수 있어요.",
    en: "One tap puts your destination and its address in big Korean text for a taxi driver.",
    zh: "一键用大号韩文显示目的地和地址，方便给出租车司机看。",
    ja: "ワンタップで目的地と住所を大きなハングルで表示し、タクシー運転手に見せられます。",
  },
  homeNote: {
    ko: "탑승 시간은 낮 시간대 기준 추정치이며 첫 열차 대기 시간은 포함하지 않아요. 장소는 직접 고른 곳이고 퀵태그는 구글 지도 검색으로 연결되니, 방문 전 영업시간을 확인하세요.",
    en: "Ride times are typical daytime estimates and leave out the wait for your first train. Spots are hand-picked and quick tags open live Google Maps searches; check opening hours before you go.",
    zh: "乘车时间为白天的一般估算，不含首班车的等候时间。地点为精选推荐，快捷标签会打开谷歌地图实时搜索，出发前请确认营业时间。",
    ja: "乗車時間は日中の目安で、最初の列車の待ち時間は含みません。スポットは厳選したもので、クイックタグはGoogleマップ検索を開きます。営業時間は事前にご確認ください。",
  },

  // Result page
  travelPlanner: { ko: "여행 플래너", en: "Travel Planner", zh: "旅行规划", ja: "旅行プランナー" },
  routeHeading: {
    ko: "{from} → {to} 서울 지하철 하루 여행 일정",
    en: "{from} to {to}: Seoul Subway Day Itinerary",
    zh: "{from}到{to}：首尔地铁一日游行程",
    ja: "{from}から{to}へ：ソウル地下鉄 日帰り旅程",
  },
  routeMetaTitle: {
    ko: "{from} → {to} 서울 지하철 여행 일정",
    en: "{from} to {to} Seoul Subway Travel Itinerary",
    zh: "{from}到{to} 首尔地铁旅行行程",
    ja: "{from}から{to} ソウル地下鉄 旅行プラン",
  },
  routeTripName: {
    ko: "{from} → {to} 서울 지하철 여행 일정",
    en: "{from} to {to} Seoul subway itinerary",
    zh: "{from}到{to}首尔地铁行程",
    ja: "{from}から{to} ソウル地下鉄旅程",
  },
  routeBreadcrumb: { ko: "{from} → {to}", en: "{from} to {to}", zh: "{from}到{to}", ja: "{from}から{to}" },
  routeDescription: {
    ko: "{from}에서 {to}까지 서울 지하철로 약 {n}분({lines}{via}). 물품보관함, 화장실, 출구, 카페, 올리브영, 쇼핑 정보를 출구 번호와 함께 담은 시간대별 하루 일정.",
    en: "{from} to {to} on the Seoul subway: about {n} min on {lines}{via}. A timed day plan with lockers, restrooms, exits, cafés, Olive Young and shopping by exit number.",
    zh: "从{from}到{to}乘首尔地铁约{n}分钟（{lines}{via}）。按出口编号整理储物柜、洗手间、出口、咖啡馆、Olive Young和购物信息的分时段一日行程。",
    ja: "{from}から{to}までソウル地下鉄で約{n}分（{lines}{via}）。ロッカー、トイレ、出口、カフェ、オリーブヤング、ショッピングを出口番号付きでまとめた時間別の1日プラン。",
  },
  routeVia: { ko: ", {stations} 환승", en: ", changing at {stations}", zh: "，在{stations}换乘", ja: "、{stations}で乗り換え" },
  viaJoin: { ko: ", ", en: " and ", zh: "、", ja: "、" },
  planYourTour: { ko: "서울 지하철 투어 계획하기", en: "Plan your Seoul subway tour", zh: "规划你的首尔地铁游", ja: "ソウル地下鉄ツアーを計画" },
  errorStation: {
    ko: "역을 찾지 못했어요. 아래에서 다시 선택해 주세요.",
    en: "We couldn't find one of those stations. Pick them again below.",
    zh: "找不到其中一个车站，请在下方重新选择。",
    ja: "駅が見つかりませんでした。下でもう一度選んでください。",
  },
  errorSameStation: {
    ko: "출발역과 도착역이 같아요. 다른 도착역을 골라 주세요.",
    en: "Departure and arrival are the same station. Pick a different arrival.",
    zh: "出发站和到达站相同，请选择其他到达站。",
    ja: "出発駅と到着駅が同じです。別の到着駅を選んでください。",
  },
  errorRoute: {
    ko: "두 역 사이 지하철 경로를 찾지 못했어요. 근처 다른 역으로 시도해 보세요.",
    en: "We couldn't find a subway route between those stations. Try a nearby station instead.",
    zh: "找不到这两站之间的地铁路线，请改用附近的车站。",
    ja: "この2駅間の地下鉄ルートが見つかりませんでした。近くの別の駅でお試しください。",
  },
  stationGuides: { ko: "이번 여행의 역 가이드", en: "Station guides for this trip", zh: "本次行程的车站指南", ja: "この旅の駅ガイド" },
  stationGuideLink: {
    ko: "{station}: 출구·화장실·보관함",
    en: "{station}: exits, restrooms & lockers",
    zh: "{station}：出口、洗手间、储物柜",
    ja: "{station}：出口・トイレ・ロッカー",
  },
  routeNote: {
    ko: "탑승 시간은 낮 시간대 기준 추정치이며 첫 열차 대기 시간은 포함하지 않아요. 출구 번호는 가장 가까운 출구 기준이에요. 장소는 직접 고른 곳이고 퀵태그는 구글 지도 검색으로 연결되니, 방문 전 영업시간을 확인하세요.",
    en: "Ride times are typical daytime estimates and leave out the wait for your first train. Exit numbers point to the nearest exit; spots are hand-picked and quick-tag results open live Google Maps searches, so check opening hours before you go.",
    zh: "乘车时间为白天的一般估算，不含首班车的等候时间。出口编号为最近的出口；地点为精选推荐，快捷标签会打开谷歌地图实时搜索，出发前请确认营业时间。",
    ja: "乗車時間は日中の目安で、最初の列車の待ち時間は含みません。出口番号は最寄り出口です。スポットは厳選したもので、クイックタグはGoogleマップ検索を開きます。営業時間は事前にご確認ください。",
  },
  routesLead: {
    ko: "가장 빠른 경로와 환승이 가장 적은 경로를 비교하세요. 아래 일정은 선택한 경로를 따라가요.",
    en: "Compare the quickest ride with the one that changes trains the least. The itinerary below follows your pick.",
    zh: "比较最快路线和换乘最少的路线，下方行程会按你的选择更新。",
    ja: "最速ルートと乗り換えが最も少ないルートを比べられます。下の旅程は選んだルートに合わせて変わります。",
  },
  itineraryLead: {
    ko: "{from}에서 {to}까지 시간대별 카드예요. 출구, 도보 시간, 구글 지도 링크를 함께 보여줘요.",
    en: "Timed cards from {from} to {to}, with exits, walking times and Google Maps links.",
    zh: "从{from}到{to}的分时段卡片，附出口、步行时间和谷歌地图链接。",
    ja: "{from}から{to}までの時間付きカード。出口、徒歩時間、Googleマップのリンク付き。",
  },

  // Steps
  step: { ko: "{n}단계", en: "Step {n}", zh: "第{n}步", ja: "ステップ{n}" },
  stepSetup: { ko: "설정", en: "Setup", zh: "设置", ja: "設定" },
  stepRoutes: { ko: "경로 선택", en: "Route Options", zh: "路线选项", ja: "ルート選択" },
  stepItinerary: { ko: "인터랙티브 일정", en: "Interactive Itinerary", zh: "互动行程", ja: "インタラクティブ旅程" },
  stepsLabel: { ko: "플래너 단계", en: "Planner steps", zh: "规划步骤", ja: "プランナーの手順" },

  // Form
  stationsLegend: { ko: "역", en: "Stations", zh: "车站", ja: "駅" },
  departureStation: { ko: "출발역", en: "Departure station", zh: "出发站", ja: "出発駅" },
  arrivalStation: { ko: "도착역", en: "Arrival station", zh: "到达站", ja: "到着駅" },
  departurePlaceholder: { ko: "예: 서울역", en: "e.g. Seoul Station", zh: "例如：首尔站", ja: "例：ソウル駅" },
  arrivalPlaceholder: { ko: "예: 성수역", en: "e.g. Seongsu", zh: "例如：圣水站", ja: "例：聖水駅" },
  searchEmpty: {
    ko: "역을 찾지 못했어요. 다른 이름으로 검색해 보세요.",
    en: "No station found. Try another spelling.",
    zh: "没有找到车站，换个写法试试。",
    ja: "駅が見つかりません。別の表記で試してください。",
  },
  swap: { ko: "출발역과 도착역 바꾸기", en: "Swap departure and arrival", zh: "交换出发站和到达站", ja: "出発駅と到着駅を入れ替え" },
  pickOnMap: { ko: "노선도에서 선택", en: "Pick on the subway map", zh: "在地铁线路图上选择", ja: "路線図から選ぶ" },
  mapPickerTitle: { ko: "지도에서 선택", en: "Pick on the map", zh: "在地图上选择", ja: "地図から選ぶ" },
  mapPickerHint: {
    ko: "역을 누른 뒤 출발역이나 도착역으로 지정하세요.",
    en: "Tap a station, then set it as your departure or arrival.",
    zh: "点选车站，再设为出发站或到达站。",
    ja: "駅をタップして、出発駅か到着駅に設定してください。",
  },
  mapPickerLabel: { ko: "지도에서 역 선택", en: "Pick a station on the map", zh: "在地图上选择车站", ja: "地図で駅を選ぶ" },
  mapFailed: {
    ko: "지도를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.",
    en: "The map couldn't load. Check your connection and try again.",
    zh: "地图加载失败，请检查网络后重试。",
    ja: "地図を読み込めませんでした。接続を確認してもう一度お試しください。",
  },
  mapLoading: { ko: "지하철 노선도를 불러오는 중…", en: "Loading the subway map…", zh: "正在加载地铁线路图…", ja: "路線図を読み込み中…" },
  departure: { ko: "출발", en: "Departure", zh: "出发", ja: "出発" },
  arrival: { ko: "도착", en: "Arrival", zh: "到达", ja: "到着" },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  schedule: { ko: "여행 시간", en: "Travel schedule", zh: "出行时间", ja: "旅行スケジュール" },
  start: { ko: "출발", en: "Start", zh: "出发", ja: "出発" },
  return: { ko: "귀가", en: "Return", zh: "返回", ja: "帰り" },
  interests: { ko: "관심 있는 것", en: "What are you into?", zh: "你想玩什么？", ja: "興味のあること" },
  quickTags: { ko: "인기 퀵태그", en: "Popular quick tags", zh: "热门快捷标签", ja: "人気のクイックタグ" },
  errorStations: {
    ko: "출발역과 도착역을 모두 선택해 주세요.",
    en: "Choose both a departure and an arrival station.",
    zh: "请同时选择出发站和到达站。",
    ja: "出発駅と到着駅の両方を選んでください。",
  },
  errorSame: {
    ko: "출발역과 도착역이 달라야 해요.",
    en: "Departure and arrival need to be different stations.",
    zh: "出发站和到达站不能相同。",
    ja: "出発駅と到着駅は別の駅にしてください。",
  },
  errorWindow: {
    ko: "출발 시간과 귀가 시간 사이를 2시간 이상 두세요.",
    en: "Leave at least 2 hours between the start and return times.",
    zh: "出发和返回时间之间至少留出2小时。",
    ja: "出発と帰りの時刻は2時間以上あけてください。",
  },
  submit: { ko: "지하철 투어 경로 만들기", en: "Generate Subway Tour Route", zh: "生成地铁游路线", ja: "地下鉄ツアールートを作成" },
  submitting: { ko: "투어 경로를 만드는 중…", en: "Building your tour route…", zh: "正在生成路线…", ja: "ルートを作成中…" },
  editTrip: { ko: "여행 수정", en: "Edit trip", zh: "修改行程", ja: "旅程を編集" },
  setupDialog: { ko: "지하철 투어 설정", en: "Set up your subway tour", zh: "设置地铁游", ja: "地下鉄ツアーを設定" },

  // Route options
  fastest: { ko: "최단 시간", en: "Shortest Time", zh: "最短时间", ja: "最短時間" },
  fewest: { ko: "최소 환승", en: "Minimum Transfer", zh: "最少换乘", ja: "乗り換え最少" },
  routeOptions: { ko: "경로 옵션", en: "Route options", zh: "路线选项", ja: "ルートオプション" },
  minutes: { ko: "{n}분", en: "{n} min", zh: "{n}分钟", ja: "{n}分" },
  hours: { ko: "{n}시간", en: "{n} h", zh: "{n}小时", ja: "{n}時間" },
  hoursMinutes: { ko: "{h}시간 {m}분", en: "{h} h {m} min", zh: "{h}小时{m}分钟", ja: "{h}時間{m}分" },
  transfersNone: { ko: "환승 없음", en: "No transfers", zh: "无需换乘", ja: "乗り換えなし" },
  transfersOne: { ko: "환승 1회", en: "1 transfer", zh: "换乘1次", ja: "乗り換え1回" },
  transfersMany: { ko: "환승 {n}회", en: "{n} transfers", zh: "换乘{n}次", ja: "乗り換え{n}回" },
  sameRoute: {
    ko: "이 여행은 두 옵션의 경로가 같아요.",
    en: "Both options take the same route for this trip.",
    zh: "此行程两个选项的路线相同。",
    ja: "この旅程では両方のルートが同じです。",
  },
  rideMinutes: { ko: "탑승 {n}분", en: "{n} min ride", zh: "乘车{n}分钟", ja: "乗車{n}分" },
  routeGlance: { ko: "한눈에 보는 경로", en: "Route at a glance", zh: "路线一览", ja: "ルート概要" },
  flowStart: { ko: "출발", en: "Start", zh: "出发", ja: "出発" },
  flowTransfer: { ko: "환승", en: "Transfer", zh: "换乘", ja: "乗換" },
  flowArrive: { ko: "도착", en: "Arrive", zh: "到达", ja: "到着" },
  stopsOne: { ko: "{n}개 역", en: "{n} stop", zh: "{n}站", ja: "{n}駅" },
  stopsMany: { ko: "{n}개 역", en: "{n} stops", zh: "{n}站", ja: "{n}駅" },
  spotsOnRoute: { ko: "경로 위 추천 장소", en: "Spots on this route", zh: "沿线推荐地点", ja: "ルート上のおすすめスポット" },
  exitWalk: { ko: "{exit}번 출구 • 도보 {n}분", en: "Exit {exit} • {n} min walk", zh: "{exit}号出口 • 步行{n}分钟", ja: "{exit}番出口 • 徒歩{n}分" },
  walk: { ko: "도보 {n}분", en: "{n} min walk", zh: "步行{n}分钟", ja: "徒歩{n}分" },
  exit: { ko: "{exit}번 출구", en: "Exit {exit}", zh: "{exit}号出口", ja: "{exit}番出口" },

  // Timeline
  itinerary: { ko: "일정", en: "Itinerary", zh: "行程", ja: "旅程" },
  googleMaps: { ko: "구글 지도", en: "Google Maps", zh: "谷歌地图", ja: "Googleマップ" },
  onGoogleMaps: { ko: "구글 지도에서 {name} 보기", en: "{name} on Google Maps", zh: "在谷歌地图查看{name}", ja: "Googleマップで{name}を見る" },
  insideGates: { ko: "개찰구 안", en: "Inside gates", zh: "闸机内", ja: "改札内" },
  outsideGates: { ko: "개찰구 밖", en: "Outside gates", zh: "闸机外", ja: "改札外" },
  showKorean: { ko: "크게 보기", en: "Show", zh: "出示", ja: "見せる" },
  depart: { ko: "출발", en: "Departure", zh: "出发", ja: "出発" },
  lockersTitle: { ko: "T-Locker·짐 보관", en: "T-Locker & luggage", zh: "T-Locker与行李", ja: "T-Locker・荷物" },
  luggageDesk: {
    ko: "유인 T-Luggage 데스크: {where}",
    en: "Staffed T-Luggage desk: {where}",
    zh: "人工行李寄存台：{where}",
    ja: "有人の荷物預かりカウンター：{where}",
  },
  noLockers: {
    ko: "등록된 보관함이 없어요. 짐을 줄이거나 짐 배송 서비스를 이용하세요.",
    en: "No lockers listed here; travel light or use a luggage delivery service.",
    zh: "此站未登记储物柜；请轻装出行或使用行李配送服务。",
    ja: "登録されたロッカーはありません。荷物を減らすか荷物配送サービスをご利用ください。",
  },
  restrooms: { ko: "화장실", en: "Restrooms", zh: "洗手间", ja: "トイレ" },
  noRestrooms: {
    ko: "화장실 정보가 없어요. 역 가이드를 확인하세요.",
    en: "No restroom details listed; check the station guide.",
    zh: "暂无洗手间信息，请查看车站指南。",
    ja: "トイレ情報がありません。駅ガイドをご確認ください。",
  },
  elevatorTitle: { ko: "엘리베이터 동선", en: "Elevator route", zh: "电梯路线", ja: "エレベーター動線" },
  noElevator: {
    ko: "지상에서 승강장까지 이어지는 엘리베이터 정보가 없어요. 에스컬레이터는 역 가이드를 확인하세요.",
    en: "No street-to-platform elevator route is listed; check the station guide for escalators.",
    zh: "暂无从地面到站台的电梯路线；扶梯信息请查看车站指南。",
    ja: "地上からホームまでのエレベーター情報がありません。エスカレーターは駅ガイドをご確認ください。",
  },
  lunch: { ko: "출발 전 점심", en: "Lunch before you ride", zh: "出发前吃午饭", ja: "乗る前にランチ" },
  bite: { ko: "근처에서 간단히 먹기", en: "Grab a bite nearby", zh: "在附近吃点东西", ja: "近くで軽く食事" },
  lunchNote: {
    ko: "점심 시간으로 약 1시간을 잡았어요.",
    en: "About an hour is set aside for lunch.",
    zh: "已预留约1小时午餐时间。",
    ja: "昼食に約1時間を確保しています。",
  },
  rideOne: {
    ko: "{from}에서 타고 한 정거장 가서 {to}에서 내리세요.",
    en: "Board at {from} and ride one stop to {to}.",
    zh: "在{from}上车，坐一站到{to}下车。",
    ja: "{from}で乗車し、1駅先の{to}で降ります。",
  },
  rideToward: {
    ko: "{from}에서 {next} 방면 승강장에서 타고 {to}에서 내리세요.",
    en: "Board at {from} on the platform toward {next}, get off at {to}.",
    zh: "在{from}往{next}方向的站台上车，到{to}下车。",
    ja: "{from}で{next}方面のホームから乗車し、{to}で降ります。",
  },
  rideTo: {
    ko: "{from}에서 타고 {to}에서 내리세요.",
    en: "Board at {from}, get off at {to}.",
    zh: "在{from}上车，到{to}下车。",
    ja: "{from}で乗車し、{to}で降ります。",
  },
  transferAt: { ko: "{station}에서 {line} 환승", en: "Transfer at {station} to {line}", zh: "在{station}换乘{line}", ja: "{station}で{line}に乗り換え" },
  transferWalkTo: { ko: "({station}까지 도보)", en: "(walk to {station})", zh: "（步行至{station}）", ja: "（{station}まで徒歩）" },
  transferWalk: { ko: "도보 약 {n}분", en: "about {n} min walk", zh: "步行约{n}分钟", ja: "徒歩約{n}分" },
  stopTransit: { ko: "환승역 들르기", en: "Transit stop", zh: "换乘站停留", ja: "乗換駅に立ち寄り" },
  stopOnWay: { ko: "가는 길에 들르기", en: "Stop on the way", zh: "途中停留", ja: "途中で寄り道" },
  until: { ko: "{time}까지", en: "until {time}", zh: "至{time}", ja: "{time}まで" },
  hotSpots: { ko: "출구 근처 핫플", en: "Hot spots near the exits", zh: "出口附近热门地点", ja: "出口近くの人気スポット" },
  lockersHere: { ko: "이 역의 T-Locker", en: "T-Locker here", zh: "本站T-Locker", ja: "この駅のT-Locker" },
  destination: { ko: "도착", en: "Destination", zh: "目的地", ja: "目的地" },
  suggestedWalk: { ko: "추천 동선 (가까운 순)", en: "Suggested walk, nearest first", zh: "推荐路线（由近到远）", ja: "おすすめの回り方（近い順）" },
  showToLocalTaxi: {
    ko: "택시 기사님께 보여주기",
    en: "Show to Local (Taxi / Driver)",
    zh: "出示给当地人（出租车/司机）",
    ja: "現地の人に見せる（タクシー・運転手）",
  },
  timeHere: { ko: "이곳에서 약 {duration}. ", en: "About {duration} here. ", zh: "可在此停留约{duration}。", ja: "ここで約{duration}過ごせます。" },
  headBack: {
    ko: "{time}까지 출발하세요. {station}까지 돌아가는 데 약 {n}분 걸려요.",
    en: "Head back by {time}: the ride back to {station} takes about {n} min.",
    zh: "请在{time}前返程：回到{station}约需{n}分钟。",
    ja: "{time}までに出発しましょう。{station}までの帰りは約{n}分です。",
  },
  tight: {
    ko: " 시간이 빠듯하니 출발을 앞당기거나 귀가 시간을 늦춰 보세요.",
    en: " That's tight, so try an earlier start or a later return time.",
    zh: "时间有点紧，建议提早出发或推迟返回时间。",
    ja: "時間に余裕がないので、出発を早めるか帰りを遅らせてみてください。",
  },

  // Show to Local
  showToLocal: { ko: "현지인에게 보여주기", en: "Show to Local", zh: "出示给当地人", ja: "現地の人に見せる" },
  showLocalLabel: { ko: "현지인에게 보여주기", en: "Show to a local", zh: "出示给当地人", ja: "現地の人に見せる" },
  showLocalHint: {
    ko: "택시 기사님이나 주변 분께 이 화면을 보여주세요.",
    en: "Show this screen to a taxi driver or a local.",
    zh: "把这个画面给出租车司机或当地人看。",
    ja: "この画面をタクシー運転手や現地の人に見せてください。",
  },
  meaning: { ko: "", en: "“Please take me to {station}.”", zh: "“请带我去{station}。”", ja: "「{station}まで行ってください」" },
  meaningExit: {
    ko: "",
    en: "“Please take me to Exit {exit} of {station}.”",
    zh: "“请带我去{station}{exit}号出口。”",
    ja: "「{station}の{exit}番出口まで行ってください」",
  },
  addressFor: { ko: "· 내비게이션 입력용", en: "· Address for the driver's navigation", zh: "· 供司机导航使用的地址", ja: "· カーナビ入力用の住所" },
  copyAddress: { ko: "주소 복사", en: "Copy address", zh: "复制地址", ja: "住所をコピー" },
  copied: { ko: "복사됨", en: "Copied", zh: "已复制", ja: "コピーしました" },
  pickExit: { ko: "출구 선택 (선택 사항)", en: "Pick an exit (optional)", zh: "选择出口（可选）", ja: "出口を選ぶ（任意）" },

  // Saved tours
  saveTour: { ko: "투어 저장", en: "Save Tour", zh: "保存行程", ja: "ツアーを保存" },
  saved: { ko: "저장됨", en: "Saved", zh: "已保存", ja: "保存済み" },
  copyLink: { ko: "링크 복사", en: "Copy link", zh: "复制链接", ja: "リンクをコピー" },
  removedSaved: { ko: "저장한 투어에서 삭제했어요", en: "Removed from saved tours", zh: "已从收藏中移除", ja: "保存したツアーから削除しました" },
  savedCopied: { ko: "저장 완료 · 공유 링크 복사됨", en: "Saved · share link copied", zh: "已保存 · 分享链接已复制", ja: "保存しました · 共有リンクをコピー" },
  savedLocal: { ko: "이 브라우저에 저장했어요", en: "Saved in this browser", zh: "已保存在此浏览器", ja: "このブラウザに保存しました" },
  linkCopied: { ko: "공유 링크를 복사했어요", en: "Share link copied", zh: "分享链接已复制", ja: "共有リンクをコピーしました" },
  copyFailed: {
    ko: "복사하지 못했어요. 주소창을 이용하세요",
    en: "Couldn't copy; use the address bar",
    zh: "复制失败，请使用地址栏",
    ja: "コピーできませんでした。アドレスバーをご利用ください",
  },
  savedTours: { ko: "저장한 투어", en: "Your saved tours", zh: "已保存的行程", ja: "保存したツアー" },
  savedOn: { ko: "{date} 저장", en: "Saved {date}", zh: "保存于{date}", ja: "{date}に保存" },
  remove: { ko: "{title} 삭제", en: "Remove {title}", zh: "删除{title}", ja: "{title}を削除" },

  // Itinerary data
  express: { ko: " 급행", en: " Express", zh: " 急行", ja: " 急行" },
  lockerCount: { ko: "보관함 {n}칸", en: "{n} lockers", zh: "{n}个储物柜", ja: "ロッカー{n}個" },
  elevator: {
    ko: "지상~승강장 엘리베이터: {exits}",
    en: "Street-to-platform elevator: {exits}",
    zh: "地面至站台电梯：{exits}",
    ja: "地上〜ホームのエレベーター：{exits}",
  },
  linkNear: { ko: "{station} 주변 {label}", en: "{label} near {station}", zh: "{station}附近的{label}", ja: "{station}周辺の{label}" },
} satisfies Record<string, Localized>;

export type PlannerTextKey = keyof typeof TEXT;

const CATEGORY_TEXT: Record<PlannerCategory, { label: Localized; short: Localized }> = {
  food: {
    label: { ko: "맛집·먹거리", en: "Food & Eats", zh: "美食", ja: "グルメ" },
    short: { ko: "맛집", en: "Food", zh: "美食", ja: "グルメ" },
  },
  cafe: {
    label: { ko: "카페·베이커리", en: "Cafes & Bakery", zh: "咖啡与烘焙", ja: "カフェ・ベーカリー" },
    short: { ko: "카페", en: "Cafe", zh: "咖啡", ja: "カフェ" },
  },
  shopping: {
    label: { ko: "쇼핑·팝업", en: "Shopping & Pop-ups", zh: "购物与快闪店", ja: "ショッピング・ポップアップ" },
    short: { ko: "쇼핑", en: "Shopping", zh: "购物", ja: "ショッピング" },
  },
  beauty: {
    label: { ko: "K-뷰티·클리닉", en: "K-Beauty & Clinics", zh: "韩妆与医美", ja: "Kビューティー・クリニック" },
    short: { ko: "K-뷰티", en: "K-Beauty", zh: "韩妆", ja: "Kビューティー" },
  },
  culture: {
    label: { ko: "관광·문화", en: "Sights & Culture", zh: "景点与文化", ja: "観光・カルチャー" },
    short: { ko: "관광", en: "Culture", zh: "景点", ja: "観光" },
  },
  essentials: {
    label: { ko: "환전·편의 서비스", en: "Essentials & Services", zh: "实用服务", ja: "両替・お役立ち" },
    short: { ko: "편의", en: "Essentials", zh: "实用", ja: "お役立ち" },
  },
};

/** Tags keep their English URL slugs; only the chip text changes. */
const TAG_TEXT: Record<QuickTag, Localized> = {
  "#OliveYoung": { ko: "#올리브영", en: "#OliveYoung", zh: "#OliveYoung", ja: "#オリーブヤング" },
  "#Daiso": { ko: "#다이소", en: "#Daiso", zh: "#大创", ja: "#ダイソー" },
  "#WOWPASS": { ko: "#와우패스", en: "#WOWPASS", zh: "#WOWPASS", ja: "#WOWPASS" },
  "#K-BBQ": { ko: "#고깃집", en: "#K-BBQ", zh: "#韩国烤肉", ja: "#韓国焼肉" },
  "#Pop-up": { ko: "#팝업스토어", en: "#Pop-up", zh: "#快闪店", ja: "#ポップアップ" },
  "#Life4Cut": { ko: "#인생네컷", en: "#Life4Cut", zh: "#人生四格", ja: "#人生4カット" },
  "#LuggageLocker": { ko: "#짐보관", en: "#LuggageLocker", zh: "#行李寄存", ja: "#荷物預かり" },
  "#HanokVillage": { ko: "#한옥마을", en: "#HanokVillage", zh: "#韩屋村", ja: "#韓屋村" },
};

/** Planner copy in `locale`, `values` inserted as given (pass them already in that language). */
export function pt(key: PlannerTextKey, locale: GuideLocale, values?: Record<string, string | number>) {
  const text = gt(TEXT[key], locale);
  return values ? fillCopy(text, values) : text;
}

export function categoryText(category: PlannerCategory, locale: GuideLocale) {
  return { label: gt(CATEGORY_TEXT[category].label, locale), short: gt(CATEGORY_TEXT[category].short, locale) };
}

export function tagText(tag: QuickTag, locale: GuideLocale) {
  return gt(TAG_TEXT[tag], locale);
}

export type PlannerCopy = Record<PlannerTextKey, string> & {
  categories: Record<PlannerCategory, { label: string; short: string }>;
  tags: Record<QuickTag, string>;
};

const copies = new Map<GuideLocale, PlannerCopy>();

/** Every planner string for the client components, converted once per language. */
export function plannerCopy(locale: GuideLocale): PlannerCopy {
  let copy = copies.get(locale);
  if (!copy) {
    copy = {
      ...(Object.fromEntries(Object.keys(TEXT).map((key) => [key, pt(key as PlannerTextKey, locale)])) as Record<PlannerTextKey, string>),
      categories: Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, categoryText(category, locale)])) as PlannerCopy["categories"],
      tags: Object.fromEntries(QUICK_TAGS.map((tag) => [tag, tagText(tag, locale)])) as PlannerCopy["tags"],
    };
    copies.set(locale, copy);
  }
  return copy;
}
