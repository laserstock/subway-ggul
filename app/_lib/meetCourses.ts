import type { Localized } from "./stations";
import { stationByKoName } from "./meetMidpoint";

export type CoursePlace = {
  id: string;
  category: Localized;
  name: Localized;
  feature: Localized;
  rating: number;
  exit: number;
  walkMin: number;
};

export type CourseStepId = "food" | "cafe" | "fun";

export type CourseStep = {
  id: CourseStepId;
  time: string;
  title: Localized;
  options: [CoursePlace, CoursePlace];
};

export type StationCourse = {
  stationKo: string;
  meetExit: number;
  meetSpot: Localized;
  doorTipA: Localized;
  doorTipB: Localized;
  steps: CourseStep[];
};

const STEP_META: Record<CourseStepId, { time: string; title: Localized }> = {
  food: {
    time: "12:30 PM",
    title: { ko: "맛집 · 식사", en: "Lunch · Food", zh: "美食 · 午餐", ja: "グルメ · ランチ" },
  },
  cafe: {
    time: "02:00 PM",
    title: { ko: "감성 카페 · 디저트", en: "Cafe · Dessert", zh: "氛围咖啡 · 甜品", ja: "カフェ · デザート" },
  },
  fun: {
    time: "04:00 PM",
    title: { ko: "산책 · 쇼핑 · 놀거리", en: "Walk · Shop · Fun", zh: "散步 · 购物 · 玩乐", ja: "散歩 · 買い物 · 遊び" },
  },
};

function place(
  id: string,
  category: Localized,
  name: Localized,
  feature: Localized,
  rating: number,
  exit: number,
  walkMin: number,
): CoursePlace {
  return { id, category, name, feature, rating, exit, walkMin };
}

function step(id: CourseStepId, a: CoursePlace, b: CoursePlace): CourseStep {
  return { id, time: STEP_META[id].time, title: STEP_META[id].title, options: [a, b] };
}

function L(ko: string, en: string, zh = en, ja = en): Localized {
  return { ko, en, zh, ja };
}

const CAT = {
  bbq: L("한식/고기", "K-BBQ", "韩餐/烤肉", "韓国BBQ"),
  ramen: L("라멘/면", "Ramen", "拉面", "ラーメン"),
  cafe: L("카페", "Cafe", "咖啡", "カフェ"),
  dessert: L("디저트", "Dessert", "甜品", "デザート"),
  mall: L("쇼핑", "Shopping", "购物", "ショッピング"),
  walk: L("산책", "Walk", "散步", "散歩"),
  culture: L("전시/문화", "Culture", "文化/展览", "文化"),
  fun: L("놀거리", "Fun", "娱乐", "遊び"),
};

/** Curated courses for 20+ major hubs. */
const PRESETS: StationCourse[] = [
  {
    stationKo: "왕십리역",
    meetExit: 6,
    meetSpot: L("6번 출구 앞 (엔터식스 연결)", "Exit 6 (linked to Enter-6)", "6号出口（连接Enter-6）", "6番出口（Enter-6接続）"),
    doorTipA: L("빠른 하차 칸 5-1", "Fast alight car 5-1", "快速下车 5-1", "降車しやすい 5-1"),
    doorTipB: L("빠른 하차 칸 4-2", "Fast alight car 4-2", "快速下车 4-2", "降車しやすい 4-2"),
    steps: [
      step(
        "food",
        place("ws-f1", CAT.bbq, L("왕십리 곱창골목", "Wangsimni Gopchang Alley", "往十里肥肠街", "往十里ホルモン横丁"), L("곱창·막창 세트", "Gopchang set", "肥肠套餐", "ホルモンセット"), 4.7, 6, 3),
        place("ws-f2", CAT.ramen, L("본가 우동", "Bonga Udon", "本家乌冬", "本家うどん"), L("따뜻한 우동·돈가스", "Hot udon & tonkatsu", "乌冬·炸猪排", "うどん・とんかつ"), 4.5, 2, 4),
      ),
      step(
        "cafe",
        place("ws-c1", CAT.cafe, L("엔터식스 로스터리", "Enter-6 Roastery", "Enter-6烘焙咖啡", "Enter-6ロースタリー"), L("역 연결 브루잉", "Station-linked brew", "车站连通手冲", "駅直結の淹れ立て"), 4.6, 6, 2),
        place("ws-c2", CAT.dessert, L("비트윈브레드", "Between Bread", "Between面包", "Betweenブレッド"), L("소금빵·휘낭시에", "Salt bread & financiers", "盐面包", "塩パン"), 4.8, 4, 5),
      ),
      step(
        "fun",
        place("ws-u1", CAT.mall, L("엔터식스 쇼핑", "Enter-6 Mall", "Enter-6购物", "Enter-6モール"), L("패션·잡화 한바퀴", "Fashion & lifestyle", "时装生活馆", "ファッション"), 4.4, 6, 1),
        place("ws-u2", CAT.walk, L("청계천 산책", "Cheonggyecheon Walk", "清溪川散步", "清渓川散歩"), L("물길 따라 여유", "Riverside stroll", "沿河散步", "川沿いの散策"), 4.6, 3, 8),
      ),
    ],
  },
  {
    stationKo: "성수역",
    meetExit: 2,
    meetSpot: L("2번 출구 성수연방 방향", "Exit 2 toward Seongsu Yeonbang", "2号出口往圣水联邦", "2番出口 聖水連邦方面"),
    doorTipA: L("빠른 하차 칸 3-2", "Fast alight car 3-2", "快速下车 3-2", "降車しやすい 3-2"),
    doorTipB: L("빠른 하차 칸 7-3", "Fast alight car 7-3", "快速下车 7-3", "降車しやすい 7-3"),
    steps: [
      step(
        "food",
        place("ss-f1", CAT.bbq, L("성수 수제버거", "Seongsu Smash Burger", "圣水手作汉堡", "聖水手作りバーガー"), L("수제 패티·감자튀김", "Smash patty & fries", "手工肉饼薯条", "スマッシュパティ"), 4.8, 2, 4),
        place("ss-f2", L("파스타", "Pasta", "意面", "パスタ"), L("연무장길 파스타", "Yeonmujang Pasta", "延武庄意面", "延武庄パスタ"), L("트러플 크림", "Truffle cream", "松露奶油", "トリュフクリーム"), 4.6, 3, 6),
      ),
      step(
        "cafe",
        place("ss-c1", CAT.cafe, L("대림창고 카페", "Daelim Warehouse Cafe", "大林仓库咖啡", "大林倉庫カフェ"), L("창고형 포토존", "Warehouse photo spot", "仓库风打卡", "倉庫フォトスポット"), 4.7, 1, 7),
        place("ss-c2", CAT.dessert, L("성수 디저트랩", "Seongsu Dessert Lab", "圣水甜品实验室", "聖水デザートラボ"), L("티라미수·휘낭시에", "Tiramisu & financiers", "提拉米苏", "ティラミス"), 4.9, 2, 5),
      ),
      step(
        "fun",
        place("ss-u1", CAT.walk, L("성수연방 산책", "Seongsu Yeonbang Walk", "圣水联邦散步", "聖水連邦散歩"), L("팝업·편집숍", "Pop-ups & boutiques", "快闪店", "ポップアップ"), 4.7, 2, 5),
        place("ss-u2", CAT.culture, L("성수 전시 갤러리", "Seongsu Gallery Hop", "圣水画廊", "聖水ギャラリー"), L("주말 전시 투어", "Weekend shows", "周末展览", "週末展示"), 4.5, 4, 8),
      ),
    ],
  },
  {
    stationKo: "홍대입구역",
    meetExit: 9,
    meetSpot: L("9번 출구 앞 (걷고싶은거리)", "Exit 9 (Walking Street)", "9号出口步行街", "9番出口 歩きたい通り"),
    doorTipA: L("빠른 하차 칸 1-1", "Fast alight car 1-1", "快速下车 1-1", "降車しやすい 1-1"),
    doorTipB: L("빠른 하차 칸 6-4", "Fast alight car 6-4", "快速下车 6-4", "降車しやすい 6-4"),
    steps: [
      step(
        "food",
        place("hd-f1", L("분식", "Snack", "小吃", "軽食"), L("홍대 엽기떡볶이", "Hongdae Tteokbokki", "弘大炒年糕", "弘大トッポギ"), L("매콤 국물 떡볶이", "Spicy tteokbokki", "辣炒年糕", "ピリ辛トッポギ"), 4.6, 9, 3),
        place("hd-f2", CAT.bbq, L("홍대 삼겹살집", "Hongdae Samgyeopsal", "弘大五花肉", "弘大サムギョプサル"), L("무한리필·된장찌개", "Refills & doenjang", "无限续肉", "食べ放題"), 4.5, 8, 5),
      ),
      step(
        "cafe",
        place("hd-c1", CAT.cafe, L("연남동 브런치카페", "Yeonnam Brunch Cafe", "延南洞早午餐", "延南ブランチ"), L("에그베네딕트", "Eggs Benedict", "班尼迪克蛋", "エッグベネディクト"), 4.7, 3, 10),
        place("hd-c2", CAT.dessert, L("홍대 크로플맛집", "Hongdae Croffle", "弘大可颂华夫", "弘大クロッフル"), L("아이스크림 크로플", "Ice cream croffle", "冰淇淋可颂华夫", "アイスクロッフル"), 4.8, 9, 4),
      ),
      step(
        "fun",
        place("hd-u1", CAT.fun, L("홍대 거리공연", "Hongdae Street Shows", "弘大街头表演", "弘大街頭パフォーマンス"), L("버스킹·소품샵", "Busking & shops", "街头艺人", "バスキング"), 4.6, 9, 2),
        place("hd-u2", CAT.mall, L("홍대 스타일 쇼핑", "Hongdae Style Hunt", "弘大潮流购物", "弘大スタイル"), L("빈티지·편집숍", "Vintage & select shops", "古着店", "ヴィンテージ"), 4.5, 8, 6),
      ),
    ],
  },
  {
    stationKo: "강남역",
    meetExit: 10,
    meetSpot: L("10번 출구 강남대로 쪽", "Exit 10 toward Gangnam-daero", "10号出口江南大道", "10番出口 江南大路方面"),
    doorTipA: L("빠른 하차 칸 9-4", "Fast alight car 9-4", "快速下车 9-4", "降車しやすい 9-4"),
    doorTipB: L("빠른 하차 칸 2-1", "Fast alight car 2-1", "快速下车 2-1", "降車しやすい 2-1"),
    steps: [
      step(
        "food",
        place("gn-f1", CAT.bbq, L("강남 한우 맛집", "Gangnam Hanwoo", "江南韩牛", "江南韓牛"), L("등심·특수부위", "Sirloin cuts", "雪花牛排", "ロース"), 4.7, 5, 4),
        place("gn-f2", L("일식", "Japanese", "日料", "和食"), L("강남 스시바", "Gangnam Sushi Bar", "江南寿司吧", "江南寿司バー"), L("오마카세 런치", "Omakase lunch", "主厨午餐", "おまかせランチ"), 4.8, 11, 6),
      ),
      step(
        "cafe",
        place("gn-c1", CAT.cafe, L("테헤란로 카페", "Teheran-ro Cafe", "德黑兰路咖啡", "テヘラン路カフェ"), L("라떼·디저트 플레이트", "Latte & dessert plate", "拿铁甜品盘", "ラテとデザート"), 4.6, 10, 3),
        place("gn-c2", CAT.dessert, L("강남 마카롱", "Gangnam Macaron", "江南马卡龙", "江南マカロン"), L("시즌 마카롱 박스", "Seasonal box", "季节礼盒", "季節ボックス"), 4.7, 4, 5),
      ),
      step(
        "fun",
        place("gn-u1", CAT.mall, L("강남 지하쇼핑", "Gangnam Underground", "江南地下街", "江南地下街"), L("패션·뷰티", "Fashion & beauty", "时尚美妆", "ファッション・美容"), 4.4, 11, 2),
        place("gn-u2", CAT.fun, L("CGV 강남", "CGV Gangnam", "CGV江南", "CGV江南"), L("최신작·아이맥스", "New releases / IMAX", "新片/IMAX", "最新作・IMAX"), 4.5, 2, 7),
      ),
    ],
  },
  {
    stationKo: "을지로3가역",
    meetExit: 4,
    meetSpot: L("4번 출구 을지로 노가리골목", "Exit 4 Nogari Alley", "4号出口烤鱼巷", "4番出口 ノガリ横丁"),
    doorTipA: L("빠른 하차 칸 4-3", "Fast alight car 4-3", "快速下车 4-3", "降車しやすい 4-3"),
    doorTipB: L("빠른 하차 칸 6-1", "Fast alight car 6-1", "快速下车 6-1", "降車しやすい 6-1"),
    steps: [
      step(
        "food",
        place("ej-f1", CAT.bbq, L("노가리 골목", "Nogari Alley", "烤鱼巷", "ノガリ横丁"), L("노가리·맥주", "Dried pollack & beer", "明太鱼啤酒", "ノガリとビール"), 4.6, 4, 2),
        place("ej-f2", L("중식", "Chinese", "中餐", "中華"), L("을지로 짜장면", "Euljiro Jjajang", "乙支路炸酱面", "乙支路ジャージャー"), L("곱빼기 추천", "Large jjajang", "大份炸酱面", "大盛り推奨"), 4.5, 8, 5),
      ),
      step(
        "cafe",
        place("ej-c1", CAT.cafe, L("을지로 로스터리", "Euljiro Roastery", "乙支路烘焙", "乙支路ロースタリー"), L("다크 로스팅", "Dark roast", "深度烘焙", "ダークロースト"), 4.7, 5, 4),
        place("ej-c2", CAT.dessert, L("인쇄골목 디저트", "Print Alley Dessert", "印刷巷甜品", "印刷横丁デザート"), L("약과·티세트", "Yakgwa tea set", "药果茶点", "薬菓ティー"), 4.6, 12, 6),
      ),
      step(
        "fun",
        place("ej-u1", CAT.walk, L("세운상가 산책", "Sewoon Walk", "世运商街散步", "世運商街散歩"), L("옥상 전망", "Rooftop views", "屋顶观景", "屋上ビュー"), 4.5, 12, 8),
        place("ej-u2", CAT.culture, L("을지로 소품샵", "Euljiro Lifestyle Shops", "乙支路杂货", "乙支路雑貨"), L("빈티지 소품", "Vintage goods", "复古杂货", "ヴィンテージ雑貨"), 4.4, 4, 5),
      ),
    ],
  },
  {
    stationKo: "합정역",
    meetExit: 7,
    meetSpot: L("7번 출구 망원·합정 카페거리", "Exit 7 cafe street", "7号出口咖啡街", "7番出口カフェ通り"),
    doorTipA: L("빠른 하차 칸 2-2", "Fast alight car 2-2", "快速下车 2-2", "降車しやすい 2-2"),
    doorTipB: L("빠른 하차 칸 8-3", "Fast alight car 8-3", "快速下车 8-3", "降車しやすい 8-3"),
    steps: [
      step(
        "food",
        place("hj-f1", L("브런치", "Brunch", "早午餐", "ブランチ"), L("합정 브런치", "Hapjeong Brunch", "合井早午餐", "合井ブランチ"), L("팬케이크·해시", "Pancakes & hash", "松饼土豆饼", "パンケーキ"), 4.7, 7, 4),
        place("hj-f2", CAT.ramen, L("합정 라멘", "Hapjeong Ramen", "合井拉面", "合井ラーメン"), L("돈코츠 진한 국물", "Tonkotsu broth", "豚骨汤", "豚骨スープ"), 4.6, 3, 6),
      ),
      step(
        "cafe",
        place("hj-c1", CAT.cafe, L("망원 한강뷰 카페", "Mangwon River Cafe", "望远汉江咖啡", "望远漢江カフェ"), L("테라스 좌석", "Terrace seats", "露台座位", "テラス席"), 4.8, 2, 12),
        place("hj-c2", CAT.dessert, L("합정 베이커리", "Hapjeong Bakery", "合井面包店", "合井ベーカリー"), L("크루아상·스콘", "Croissant & scone", "可颂司康", "クロワッサン"), 4.7, 7, 5),
      ),
      step(
        "fun",
        place("hj-u1", CAT.walk, L("한강공원 산책", "Hangang Park Walk", "汉江公园散步", "漢江公園散歩"), L("자전거·피크닉", "Bike & picnic", "骑行野餐", "自転車・ピクニック"), 4.8, 2, 10),
        place("hj-u2", CAT.mall, L("메세나폴리스", "Mecenatpolis", "美莎娜城", "メッセナポリス"), L("영화·쇼핑", "Cinema & shops", "电影购物", "映画・買い物"), 4.5, 1, 3),
      ),
    ],
  },
  {
    stationKo: "잠실역",
    meetExit: 11,
    meetSpot: L("11번 출구 롯데월드몰 방향", "Exit 11 Lotte World Mall", "11号出口乐天世界", "11番出口 ロッテワールドモール"),
    doorTipA: L("빠른 하차 칸 8-4", "Fast alight car 8-4", "快速下车 8-4", "降車しやすい 8-4"),
    doorTipB: L("빠른 하차 칸 1-1", "Fast alight car 1-1", "快速下车 1-1", "降車しやすい 1-1"),
    steps: [
      step(
        "food",
        place("js-f1", L("뷔페", "Buffet", "自助餐", "バイキング"), L("롯데 뷔페", "Lotte Buffet", "乐天自助", "ロッテバイキング"), L("디저트 코너 강추", "Dessert corner pick", "甜品区推荐", "デザートコーナー"), 4.6, 11, 5),
        place("js-f2", CAT.bbq, L("잠실 고기집", "Jamsil BBQ", "蚕室烤肉", "蚕室BBQ"), L("삼겹·목살", "Pork belly & neck", "五花肉颈肉", "サムギョプ・トンネク"), 4.5, 4, 6),
      ),
      step(
        "cafe",
        place("js-c1", CAT.cafe, L("석촌호수 카페", "Seokchon Lake Cafe", "石村湖咖啡", "石村湖カフェ"), L("호수 전망", "Lake view", "湖景", "湖の眺め"), 4.7, 2, 8),
        place("js-c2", CAT.dessert, L("몰 디저트숍", "Mall Dessert Shop", "商场甜品店", "モールのデザート"), L("타르트·젤라토", "Tart & gelato", "挞意式冰淇淋", "タルト・ジェラート"), 4.6, 11, 3),
      ),
      step(
        "fun",
        place("js-u1", CAT.mall, L("롯데월드몰", "Lotte World Mall", "乐天世界购物中心", "ロッテワールドモール"), L("아쿠아리움·쇼핑", "Aquarium & shops", "水族馆购物", "水族館・買い物"), 4.7, 11, 2),
        place("js-u2", CAT.walk, L("석촌호수 산책", "Seokchon Lake Loop", "石村湖环湖", "石村湖散歩"), L("벚꽃·야경 코스", "Cherry blossoms / night view", "樱花夜景", "桜・夜景"), 4.8, 2, 7),
      ),
    ],
  },
  {
    stationKo: "건대입구역",
    meetExit: 4,
    meetSpot: L("4번 출구 커먼그라운드", "Exit 4 Common Ground", "4号出口Common Ground", "4番出口 コモングラウンド"),
    doorTipA: L("빠른 하차 칸 5-2", "Fast alight car 5-2", "快速下车 5-2", "降車しやすい 5-2"),
    doorTipB: L("빠른 하차 칸 3-4", "Fast alight car 3-4", "快速下车 3-4", "降車しやすい 3-4"),
    steps: [
      step(
        "food",
        place("kd-f1", CAT.bbq, L("건대 닭갈비", "Konkuk Dakgalbi", "建大辣炒鸡", "建大タッカルビ"), L("치즈 닭갈비", "Cheese dakgalbi", "芝士辣炒鸡", "チーズタッカルビ"), 4.6, 6, 4),
        place("kd-f2", L("분식", "Snack", "小吃", "軽食"), L("건대 떡볶이", "Konkuk Tteokbokki", "建大炒年糕", "建大トッポギ"), L("로제 떡볶이", "Rose tteokbokki", "奶油炒年糕", "ロゼトッポギ"), 4.5, 4, 3),
      ),
      step(
        "cafe",
        place("kd-c1", CAT.cafe, L("커먼그라운드 카페", "Common Ground Cafe", "Common Ground咖啡", "コモングラウンドカフェ"), L("컨테이너 루프탑", "Container rooftop", "集装箱屋顶", "コンテナ屋上"), 4.7, 4, 2),
        place("kd-c2", CAT.dessert, L("건대 디저트카페", "Konkuk Dessert Cafe", "建大甜品咖啡", "建大デザートカフェ"), L("생크림 케이크", "Fresh cream cake", "鲜奶油蛋糕", "生クリームケーキ"), 4.6, 2, 5),
      ),
      step(
        "fun",
        place("kd-u1", CAT.mall, L("커먼그라운드", "Common Ground", "Common Ground", "コモングラウンド"), L("팝업·라이프스타일", "Pop-ups & lifestyle", "快闪店", "ポップアップ"), 4.6, 4, 1),
        place("kd-u2", CAT.fun, L("스타시티 시네마", "Star City Cinema", "星城影院", "スターシティシネマ"), L("영화·볼링", "Movie & bowling", "电影保龄球", "映画・ボウリング"), 4.4, 3, 4),
      ),
    ],
  },
  {
    stationKo: "여의도역",
    meetExit: 3,
    meetSpot: L("3번 출구 IFC몰 방향", "Exit 3 IFC Mall", "3号出口IFC", "3番出口 IFCモール"),
    doorTipA: L("빠른 하차 칸 6-2", "Fast alight car 6-2", "快速下车 6-2", "降車しやすい 6-2"),
    doorTipB: L("빠른 하차 칸 4-1", "Fast alight car 4-1", "快速下车 4-1", "降車しやすい 4-1"),
    steps: [
      step(
        "food",
        place("yd-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("여의도 한정식", "Yeouido Hansik", "汝矣岛韩定食", "汝矣島韓定食"), L("점심 코스", "Lunch course", "午餐套餐", "ランチコース"), 4.6, 5, 5),
        place("yd-f2", L("이탈리안", "Italian", "意餐", "イタリアン"), L("IFC 파스타", "IFC Pasta", "IFC意面", "IFCパスタ"), L("알리오올리오", "Aglio e olio", "蒜香意面", "アーリオ・オーリオ"), 4.5, 3, 3),
      ),
      step(
        "cafe",
        place("yd-c1", CAT.cafe, L("한강뷰 카페", "River View Cafe", "汉江景咖啡", "漢江ビューカフェ"), L("창가 좌석", "Window seats", "靠窗座位", "窓際席"), 4.7, 2, 8),
        place("yd-c2", CAT.dessert, L("여의도 베이커리", "Yeouido Bakery", "汝矣岛面包", "汝矣島ベーカリー"), L("소금빵·휘낭시에", "Salt bread", "盐面包", "塩パン"), 4.6, 3, 4),
      ),
      step(
        "fun",
        place("yd-u1", CAT.walk, L("여의도 한강공원", "Yeouido Hangang Park", "汝矣岛汉江公园", "汝矣島漢江公園"), L("자전거·피크닉", "Bike & picnic", "骑行野餐", "自転車・ピクニック"), 4.8, 2, 9),
        place("yd-u2", CAT.mall, L("IFC몰", "IFC Mall", "IFC购物中心", "IFCモール"), L("쇼핑·영화", "Shop & cinema", "购物电影", "買い物・映画"), 4.5, 3, 2),
      ),
    ],
  },
  {
    stationKo: "사당역",
    meetExit: 4,
    meetSpot: L("4번 출구 사당로 카페거리", "Exit 4 cafe street", "4号出口咖啡街", "4番出口カフェ通り"),
    doorTipA: L("빠른 하차 칸 7-2", "Fast alight car 7-2", "快速下车 7-2", "降車しやすい 7-2"),
    doorTipB: L("빠른 하차 칸 3-3", "Fast alight car 3-3", "快速下车 3-3", "降車しやすい 3-3"),
    steps: [
      step(
        "food",
        place("sd-f1", CAT.bbq, L("사당 삼겹살", "Sadang Samgyeopsal", "舍堂五花肉", "舎堂サムギョプサル"), L("된장찌개 무한", "Unlimited doenjang", "大酱汤续加", "テンジャンチゲ"), 4.5, 4, 4),
        place("sd-f2", CAT.ramen, L("사당 라멘", "Sadang Ramen", "舍堂拉面", "舎堂ラーメン"), L("매운 미소", "Spicy miso", "辣味增汤", "辛みそ"), 4.4, 14, 6),
      ),
      step(
        "cafe",
        place("sd-c1", CAT.cafe, L("사당 브런치카페", "Sadang Brunch Cafe", "舍堂早午餐", "舎堂ブランチ"), L("에그스크램블", "Scramble plate", "炒蛋套餐", "スクランブル"), 4.5, 4, 5),
        place("sd-c2", CAT.dessert, L("빙수집", "Shaved Ice Cafe", "刨冰店", "かき氷カフェ"), L("인절미 빙수", "Injeolmi bingsu", "年糕刨冰", "インジョルミ氷"), 4.6, 3, 7),
      ),
      step(
        "fun",
        place("sd-u1", CAT.walk, L("관악산 입구 산책", "Gwanaksan Trailhead", "冠岳山入口散步", "冠岳山入り口散歩"), L("가벼운 트레킹", "Easy trek", "轻松徒步", "ゆるトレック"), 4.6, 2, 15),
        place("sd-u2", CAT.mall, L("사당 지하상가", "Sadang Underground", "舍堂地下街", "舎堂地下街"), L("잡화·화장품", "Sundries & beauty", "杂货美妆", "雑貨・コスメ"), 4.3, 4, 2),
      ),
    ],
  },
  {
    stationKo: "신논현역",
    meetExit: 5,
    meetSpot: L("5번 출구 강남대로", "Exit 5 Gangnam-daero", "5号出口江南大道", "5番出口 江南大路"),
    doorTipA: L("빠른 하차 칸 4-2", "Fast alight car 4-2", "快速下车 4-2", "降車しやすい 4-2"),
    doorTipB: L("빠른 하차 칸 6-3", "Fast alight car 6-3", "快速下车 6-3", "降車しやすい 6-3"),
    steps: [
      step(
        "food",
        place("sn-f1", L("이자카야", "Izakaya", "居酒屋", "居酒屋"), L("신논현 이자카야", "Sinnonhyeon Izakaya", "新论岘居酒屋", "新論峴居酒屋"), L("사시미·하이볼", "Sashimi & highball", "生鱼片汽酒", "刺身・ハイボール"), 4.6, 5, 4),
        place("sn-f2", CAT.bbq, L("논현 고기집", "Nonhyeon BBQ", "论岘烤肉", "論峴BBQ"), L("한우 모듬", "Hanwoo platter", "韩牛拼盘", "韓牛盛り合わせ"), 4.7, 6, 6),
      ),
      step(
        "cafe",
        place("sn-c1", CAT.cafe, L("논현 루프탑카페", "Nonhyeon Rooftop", "论岘屋顶咖啡", "論峴ルーフトップ"), L("시티뷰 라떼", "City-view latte", "城市景拿铁", "シティビューラテ"), 4.7, 3, 7),
        place("sn-c2", CAT.dessert, L("강남 디저트바", "Gangnam Dessert Bar", "江南甜品吧", "江南デザートバー"), L("티라미수 잔", "Tiramisu glass", "杯装提拉米苏", "グラスティラミス"), 4.8, 5, 3),
      ),
      step(
        "fun",
        place("sn-u1", CAT.mall, L("강남 편집숍 투어", "Gangnam Select Shops", "江南买手店", "江南セレクトショップ"), L("스트릿·브랜드", "Street brands", "街头品牌", "ストリートブランド"), 4.5, 5, 5),
        place("sn-u2", CAT.fun, L("볼링·보드게임", "Bowling & Board Games", "保龄球桌游", "ボウリング・ボドゲ"), L("실내 액티비티", "Indoor activity", "室内活动", "室内アクティビティ"), 4.4, 4, 8),
      ),
    ],
  },
  {
    stationKo: "용산역",
    meetExit: 1,
    meetSpot: L("1번 출구 아이파크몰", "Exit 1 I'Park Mall", "1号出口I'Park", "1番出口 アイパークモール"),
    doorTipA: L("빠른 하차 칸 5-3", "Fast alight car 5-3", "快速下车 5-3", "降車しやすい 5-3"),
    doorTipB: L("빠른 하차 칸 2-2", "Fast alight car 2-2", "快速下车 2-2", "降車しやすい 2-2"),
    steps: [
      step(
        "food",
        place("ys-f1", L("푸드코트", "Food court", "美食广场", "フードコート"), L("아이파크 푸드코트", "I'Park Food Court", "I'Park美食广场", "アイパークフードコート"), L("다양한 한식·양식", "Korean & Western picks", "韩西荟萃", "韓食・洋食"), 4.4, 1, 2),
        place("ys-f2", L("일식", "Japanese", "日料", "和食"), L("용산 스시", "Yongsan Sushi", "龙山寿司", "龍山寿司"), L("런치 세트", "Lunch set", "午餐套餐", "ランチセット"), 4.6, 3, 6),
      ),
      step(
        "cafe",
        place("ys-c1", CAT.cafe, L("몰 카페테라스", "Mall Cafe Terrace", "商场咖啡露台", "モールカフェテラス"), L("한강 방향 창가", "River-side window", "靠汉江窗边", "漢江側の窓"), 4.5, 1, 3),
        place("ys-c2", CAT.dessert, L("용산 디저트", "Yongsan Dessert", "龙山甜品", "龍山デザート"), L("생과일 빙수", "Fruit bingsu", "水果刨冰", "フルーツかき氷"), 4.6, 2, 5),
      ),
      step(
        "fun",
        place("ys-u1", CAT.mall, L("아이파크몰", "I'Park Mall", "I'Park购物中心", "アイパークモール"), L("쇼핑·시네마", "Shop & cinema", "购物影院", "買い物・シネマ"), 4.5, 1, 1),
        place("ys-u2", CAT.culture, L("국립중앙박물관", "National Museum", "国立中央博物馆", "国立中央博物館"), L("상설 전시", "Permanent exhibits", "常设展", "常設展示"), 4.8, 4, 15),
      ),
    ],
  },
  {
    stationKo: "서울역",
    meetExit: 9,
    meetSpot: L("9번 출구 로비 만남의 광장", "Exit 9 Meeting Plaza", "9号出口会面广场", "9番出口 出会いの広場"),
    doorTipA: L("빠른 하차 칸 4-1", "Fast alight car 4-1", "快速下车 4-1", "降車しやすい 4-1"),
    doorTipB: L("빠른 하차 칸 8-2", "Fast alight car 8-2", "快速下车 8-2", "降車しやすい 8-2"),
    steps: [
      step(
        "food",
        place("su-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("서울로 한식당", "Seoullo Hansik", "首尔路韩餐厅", "ソウル路韓食堂"), L("비빔밥·불고기", "Bibimbap & bulgogi", "拌饭烤肉", "ビビンバ・プルコギ"), 4.5, 9, 4),
        place("su-f2", L("양식", "Western", "西餐", "洋食"), L("스테이션 그릴", "Station Grill", "车站烤肉西餐", "ステーショングリル"), L("스테이크 런치", "Steak lunch", "牛排午餐", "ステーキランチ"), 4.4, 3, 5),
      ),
      step(
        "cafe",
        place("su-c1", CAT.cafe, L("서울로7017 카페", "Seoullo 7017 Cafe", "首尔路7017咖啡", "ソウル路7017カフェ"), L("공중정원 뷰", "Sky-garden view", "空中花园景", "空中庭園ビュー"), 4.6, 9, 6),
        place("su-c2", CAT.dessert, L("역 베이커리", "Station Bakery", "车站面包店", "駅ベーカリー"), L("크루아상·커피", "Croissant & coffee", "可颂咖啡", "クロワッサンとコーヒー"), 4.5, 1, 2),
      ),
      step(
        "fun",
        place("su-u1", CAT.walk, L("서울로7017", "Seoullo 7017", "首尔路7017", "ソウル路7017"), L("공중 산책로", "Elevated walkway", "空中步道", "空中歩道"), 4.7, 9, 5),
        place("su-u2", CAT.culture, L("문화역서울284", "Culture Station Seoul 284", "文化站首尔284", "文化駅ソウル284"), L("기획 전시", "Special exhibits", "特别展览", "企画展示"), 4.6, 1, 4),
      ),
    ],
  },
  {
    stationKo: "명동역",
    meetExit: 6,
    meetSpot: L("6번 출구 명동거리", "Exit 6 Myeongdong Street", "6号出口明洞街", "6番出口 明洞通り"),
    doorTipA: L("빠른 하차 칸 3-1", "Fast alight car 3-1", "快速下车 3-1", "降車しやすい 3-1"),
    doorTipB: L("빠른 하차 칸 5-4", "Fast alight car 5-4", "快速下车 5-4", "降車しやすい 5-4"),
    steps: [
      step(
        "food",
        place("md-f1", L("분식", "Snack", "小吃", "軽食"), L("명동 교자", "Myeongdong Kyoja", "明洞饺子", "明洞餃子"), L("칼국수·만두", "Kalguksu & dumplings", "刀削面饺子", "カルグクス・饅頭"), 4.7, 6, 3),
        place("md-f2", CAT.bbq, L("명동 갈비", "Myeongdong Galbi", "明洞排骨", "明洞カルビ"), L("양념갈비", "Marinated galbi", "腌制排骨", "タレカルビ"), 4.5, 8, 5),
      ),
      step(
        "cafe",
        place("md-c1", CAT.cafe, L("명동 루프탑", "Myeongdong Rooftop", "明洞屋顶咖啡", "明洞ルーフトップ"), L("시티뷰 음료", "City-view drinks", "城市景饮品", "シティビュードリンク"), 4.6, 5, 4),
        place("md-c2", CAT.dessert, L("명동 디저트카페", "Myeongdong Dessert", "明洞甜品", "明洞デザート"), L("팥빙수", "Patbingsu", "红豆刨冰", "パッピンス"), 4.7, 6, 2),
      ),
      step(
        "fun",
        place("md-u1", CAT.mall, L("명동 쇼핑거리", "Myeongdong Shopping", "明洞购物街", "明洞ショッピング"), L("뷰티·패션", "Beauty & fashion", "美妆时尚", "美容・ファッション"), 4.6, 6, 1),
        place("md-u2", CAT.culture, L("남산 케이블카", "Namsan Cable Car", "南山缆车", "南山ケーブルカー"), L("남산타워 뷰", "N Seoul Tower view", "首尔塔景观", "Nソウルタワー"), 4.8, 3, 12),
      ),
    ],
  },
  {
    stationKo: "이태원역",
    meetExit: 3,
    meetSpot: L("3번 출구 경리단길 방향", "Exit 3 Gyeongnidan", "3号出口京畿团路", "3番出口 京畿団ギル"),
    doorTipA: L("빠른 하차 칸 2-3", "Fast alight car 2-3", "快速下车 2-3", "降車しやすい 2-3"),
    doorTipB: L("빠른 하차 칸 4-2", "Fast alight car 4-2", "快速下车 4-2", "降車しやすい 4-2"),
    steps: [
      step(
        "food",
        place("it-f1", L("세계요리", "World food", "世界料理", "世界の料理"), L("이태원 타코", "Itaewon Tacos", "梨泰院塔可", "梨泰院タコス"), L("과카몰리 타코", "Guac tacos", "牛油果塔可", "ワカモレタコス"), 4.7, 3, 5),
        place("it-f2", L("브런치", "Brunch", "早午餐", "ブランチ"), L("경리단 브런치", "Gyeongnidan Brunch", "京畿团早午餐", "京畿団ブランチ"), L("아보카도 토스트", "Avocado toast", "牛油果吐司", "アボカドトースト"), 4.6, 1, 8),
      ),
      step(
        "cafe",
        place("it-c1", CAT.cafe, L("해방촌 카페", "Haebangchon Cafe", "解放村咖啡", "解放村カフェ"), L("빈티지 인테리어", "Vintage interior", "复古装潢", "ヴィンテージ内装"), 4.7, 4, 10),
        place("it-c2", CAT.dessert, L("이태원 베이커리", "Itaewon Bakery", "梨泰院面包", "梨泰院ベーカリー"), L("사워도우", "Sourdough", "酸种面包", "サワードウ"), 4.6, 3, 4),
      ),
      step(
        "fun",
        place("it-u1", CAT.walk, L("경리단길 산책", "Gyeongnidan Stroll", "京畿团路散步", "京畿団ギル散歩"), L("숍·갤러리", "Shops & galleries", "商店画廊", "ショップ・ギャラリー"), 4.7, 1, 7),
        place("it-u2", CAT.culture, L("리움미술관", "Leeum Museum", "三星美术馆", "リウム美術館"), L("현대미술 전시", "Contemporary art", "当代艺术展", "現代美術"), 4.8, 2, 12),
      ),
    ],
  },
  {
    stationKo: "교대역",
    meetExit: 6,
    meetSpot: L("6번 출구 서초 카페거리", "Exit 6 Seocho cafe street", "6号出口瑞草咖啡街", "6番出口 瑞草カフェ通り"),
    doorTipA: L("빠른 하차 칸 5-1", "Fast alight car 5-1", "快速下车 5-1", "降車しやすい 5-1"),
    doorTipB: L("빠른 하차 칸 3-2", "Fast alight car 3-2", "快速下车 3-2", "降車しやすい 3-2"),
    steps: [
      step(
        "food",
        place("gy-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("교대 국밥", "Gyodae Gukbap", "教大国饭", "教大国飯"), L("순대국·수육", "Sundae gukbap", "血肠汤", "スンデ国飯"), 4.5, 6, 3),
        place("gy-f2", CAT.ramen, L("교대 라멘", "Gyodae Ramen", "教大拉面", "教大ラーメン"), L("소유 라멘", "Shoyu ramen", "酱油拉面", "醤油ラーメン"), 4.4, 4, 5),
      ),
      step(
        "cafe",
        place("gy-c1", CAT.cafe, L("서초 브런치카페", "Seocho Brunch Cafe", "瑞草早午餐", "瑞草ブランチ"), L("수플레 팬케이크", "Souffle pancakes", "舒芙蕾松饼", "スフレパンケーキ"), 4.6, 6, 4),
        place("gy-c2", CAT.dessert, L("교대 디저트", "Gyodae Dessert", "教大甜品", "教大デザート"), L("치즈케이크", "Cheesecake", "芝士蛋糕", "チーズケーキ"), 4.5, 3, 6),
      ),
      step(
        "fun",
        place("gy-u1", CAT.culture, L("예술의전당", "Seoul Arts Center", "艺术殿堂", "芸術の殿堂"), L("전시·공연", "Shows & exhibits", "展览演出", "展示・公演"), 4.7, 5, 12),
        place("gy-u2", CAT.mall, L("교대 지하상가", "Gyodae Underground", "教大地下街", "教大地下街"), L("서점·잡화", "Books & sundries", "书店杂货", "書店・雑貨"), 4.3, 6, 2),
      ),
    ],
  },
  {
    stationKo: "선릉역",
    meetExit: 10,
    meetSpot: L("10번 출구 테헤란로", "Exit 10 Teheran-ro", "10号出口德黑兰路", "10番出口 テヘラン路"),
    doorTipA: L("빠른 하차 칸 8-3", "Fast alight car 8-3", "快速下车 8-3", "降車しやすい 8-3"),
    doorTipB: L("빠른 하차 칸 2-1", "Fast alight car 2-1", "快速下车 2-1", "降車しやすい 2-1"),
    steps: [
      step(
        "food",
        place("sl-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("선릉 한정식", "Seolleung Hansik", "宣陵韩定食", "宣陵韓定食"), L("정식 런치", "Set lunch", "套餐午餐", "定食ランチ"), 4.5, 5, 4),
        place("sl-f2", L("샐러드", "Salad", "沙拉", "サラダ"), L("오피스 샐러드", "Office Salad Bowl", "办公室沙拉", "オフィスサラダ"), L("그릴드 치킨", "Grilled chicken", "烤鸡", "グリルチキン"), 4.4, 10, 3),
      ),
      step(
        "cafe",
        place("sl-c1", CAT.cafe, L("선릉 스페셜티", "Seolleung Specialty", "宣陵精品咖啡", "宣陵スペシャルティ"), L("싱글오리진", "Single origin", "单一产地", "シングルオリジン"), 4.6, 10, 2),
        place("sl-c2", CAT.dessert, L("선릉 디저트바", "Seolleung Dessert Bar", "宣陵甜品吧", "宣陵デザートバー"), L("밀크티·타르트", "Milk tea & tart", "奶茶挞", "ミルクティーとタルト"), 4.5, 4, 5),
      ),
      step(
        "fun",
        place("sl-u1", CAT.walk, L("선릉·정릉 산책", "Seolleung Royal Tombs", "宣陵王陵散步", "宣陵・靖陵散歩"), L("왕릉 숲길", "Tomb forest path", "王陵林荫道", "王陵の森道"), 4.7, 8, 8),
        place("sl-u2", CAT.mall, L("코엑스 방향 쇼핑", "Toward COEX", "往COEX购物", "COEX方面ショッピング"), L("라이프스타일숍", "Lifestyle shops", "生活方式店", "ライフスタイルショップ"), 4.4, 1, 10),
      ),
    ],
  },
  {
    stationKo: "고속터미널역",
    meetExit: 8,
    meetSpot: L("8번 출구 신세계백화점", "Exit 8 Shinsegae", "8号出口新世界", "8番出口 新世界"),
    doorTipA: L("빠른 하차 칸 6-4", "Fast alight car 6-4", "快速下车 6-4", "降車しやすい 6-4"),
    doorTipB: L("빠른 하차 칸 3-1", "Fast alight car 3-1", "快速下车 3-1", "降車しやすい 3-1"),
    steps: [
      step(
        "food",
        place("gt-f1", L("백화점 식당", "Dept. dining", "百货餐饮", "百貨の食堂"), L("신세계 푸드홀", "Shinsegae Food Hall", "新世界美食汇", "新世界フードホール"), L("다양한 미식", "Gourmet variety", "多样美食", "多彩な美食"), 4.6, 8, 3),
        place("gt-f2", CAT.bbq, L("반포 고기집", "Banpo BBQ", "盘浦烤肉", "盤浦BBQ"), L("삼겹·항정살", "Pork cuts", "五花肉", "サムギョプ"), 4.5, 5, 7),
      ),
      step(
        "cafe",
        place("gt-c1", CAT.cafe, L("백화점 카페", "Dept. Cafe", "百货咖啡", "百貨カフェ"), L("케이크 세트", "Cake set", "蛋糕套餐", "ケーキセット"), 4.5, 8, 2),
        place("gt-c2", CAT.dessert, L("반포 디저트", "Banpo Dessert", "盘浦甜品", "盤浦デザート"), L("마카롱 박스", "Macaron box", "马卡龙礼盒", "マカロンボックス"), 4.6, 3, 6),
      ),
      step(
        "fun",
        place("gt-u1", CAT.mall, L("신세계·센트럴시티", "Shinsegae · Central City", "新世界·Central City", "新世界・セントラルシティ"), L("쇼핑·스파", "Shop & spa", "购物水疗", "買い物・スパ"), 4.6, 8, 2),
        place("gt-u2", CAT.walk, L("반포한강공원", "Banpo Hangang Park", "盘浦汉江公园", "盤浦漢江公園"), L("달빛무지개분수", "Moonlight Rainbow Fountain", "月光彩虹喷泉", "月光の虹噴水"), 4.8, 1, 12),
      ),
    ],
  },
  {
    stationKo: "신촌역",
    meetExit: 2,
    meetSpot: L("2번 출구 연세로", "Exit 2 Yonsei-ro", "2号出口延世路", "2番出口 延世路"),
    doorTipA: L("빠른 하차 칸 4-2", "Fast alight car 4-2", "快速下车 4-2", "降車しやすい 4-2"),
    doorTipB: L("빠른 하차 칸 6-1", "Fast alight car 6-1", "快速下车 6-1", "降車しやすい 6-1"),
    steps: [
      step(
        "food",
        place("sc-f1", L("분식", "Snack", "小吃", "軽食"), L("신촌 떡볶이", "Sinchon Tteokbokki", "新村炒年糕", "新村トッポギ"), L("치즈 떡볶이", "Cheese tteokbokki", "芝士炒年糕", "チーズトッポギ"), 4.5, 2, 3),
        place("sc-f2", CAT.bbq, L("신촌 삼겹살", "Sinchon Samgyeopsal", "新村五花肉", "新村サムギョプサル"), L("학생 맛집", "Student favorite", "学生人气店", "学生人気店"), 4.4, 3, 5),
      ),
      step(
        "cafe",
        place("sc-c1", CAT.cafe, L("연대앞 카페", "Yonsei Gate Cafe", "延世大门咖啡", "延世前カフェ"), L("라떼·디저트", "Latte & dessert", "拿铁甜品", "ラテとデザート"), 4.6, 2, 4),
        place("sc-c2", CAT.dessert, L("신촌 빙수", "Sinchon Bingsu", "新村刨冰", "新村かき氷"), L("인절미 빙수", "Injeolmi bingsu", "年糕刨冰", "インジョルミ氷"), 4.5, 4, 6),
      ),
      step(
        "fun",
        place("sc-u1", CAT.mall, L("신촌 유플렉스", "Sinchon U-Plex", "新村U-Plex", "新村Uプレックス"), L("쇼핑·시네마", "Shop & cinema", "购物影院", "買い物・シネマ"), 4.4, 2, 2),
        place("sc-u2", CAT.walk, L("연세로 산책", "Yonsei-ro Stroll", "延世路散步", "延世路散歩"), L("차 없는 거리", "Car-free street", "步行街", "歩行者天国"), 4.6, 2, 1),
      ),
    ],
  },
  {
    stationKo: "시청역",
    meetExit: 5,
    meetSpot: L("5번 출구 서울광장", "Exit 5 Seoul Plaza", "5号出口首尔广场", "5番出口 ソウル広場"),
    doorTipA: L("빠른 하차 칸 3-2", "Fast alight car 3-2", "快速下车 3-2", "降車しやすい 3-2"),
    doorTipB: L("빠른 하차 칸 7-1", "Fast alight car 7-1", "快速下车 7-1", "降車しやすい 7-1"),
    steps: [
      step(
        "food",
        place("ch-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("시청 한정식", "City Hall Hansik", "市厅韩定食", "市庁韓定食"), L("정갈한 정식", "Neat set meal", "精致套餐", "きちんとした定食"), 4.5, 6, 4),
        place("ch-f2", L("양식", "Western", "西餐", "洋食"), L("덕수궁 근처 레스토랑", "Deoksugung Restaurant", "德寿宫附近餐厅", "徳寿宮近くのレストラン"), L("파스타·스테이크", "Pasta & steak", "意面牛排", "パスタ・ステーキ"), 4.6, 2, 7),
      ),
      step(
        "cafe",
        place("ch-c1", CAT.cafe, L("덕수궁 돌담길 카페", "Deoksugung Wall Cafe", "德寿宫石墙咖啡", "徳寿宮石垣カフェ"), L("산책 후 커피", "Coffee after a stroll", "散步后喝咖啡", "散歩後のコーヒー"), 4.7, 2, 6),
        place("ch-c2", CAT.dessert, L("시청 디저트", "City Hall Dessert", "市厅甜品", "市庁デザート"), L("케이크·티", "Cake & tea", "蛋糕茶", "ケーキとティー"), 4.5, 5, 3),
      ),
      step(
        "fun",
        place("ch-u1", CAT.walk, L("덕수궁·서울광장", "Deoksugung · Plaza", "德寿宫·首尔广场", "徳寿宮・ソウル広場"), L("고궁 산책", "Palace walk", "古宫散步", "古宮散歩"), 4.8, 2, 5),
        place("ch-u2", CAT.culture, L("서울시립미술관", "SeMA", "首尔市立美术馆", "ソウル市立美術館"), L("기획 전시", "Special shows", "特别展览", "企画展示"), 4.6, 1, 4),
      ),
    ],
  },
  {
    stationKo: "종로3가역",
    meetExit: 1,
    meetSpot: L("1번 출구 종로 젊음의 거리", "Exit 1 Jongno Youth Street", "1号出口钟路青春街", "1番出口 鐘路若者の通り"),
    doorTipA: L("빠른 하차 칸 5-2", "Fast alight car 5-2", "快速下车 5-2", "降車しやすい 5-2"),
    doorTipB: L("빠른 하차 칸 4-3", "Fast alight car 4-3", "快速下车 4-3", "降車しやすい 4-3"),
    steps: [
      step(
        "food",
        place("jr-f1", L("한식", "Korean", "韩餐", "韓国料理"), L("종로 국밥", "Jongno Gukbap", "钟路国饭", "鐘路国飯"), L("설렁탕·수육", "Seolleongtang", "雪浓汤", "ソルロンタン"), 4.6, 1, 3),
        place("jr-f2", L("분식", "Snack", "小吃", "軽食"), L("광장시장 먹거리", "Gwangjang Market Bites", "广藏市场小吃", "広蔵市場グルメ"), L("빈대떡·육회", "Bindaetteok & yukhoe", "绿豆煎饼生牛肉", "ビンデトッ・ユッケ"), 4.7, 4, 8),
      ),
      step(
        "cafe",
        place("jr-c1", CAT.cafe, L("익선동 카페", "Ikseon-dong Cafe", "益善洞咖啡", "益善洞カフェ"), L("한옥 감성", "Hanok vibes", "韩屋氛围", "韓屋の雰囲気"), 4.8, 6, 7),
        place("jr-c2", CAT.dessert, L("종로 디저트", "Jongno Dessert", "钟路甜品", "鐘路デザート"), L("약과·식혜", "Yakgwa & sikhye", "药果甜米露", "薬菓・シッケ"), 4.5, 1, 4),
      ),
      step(
        "fun",
        place("jr-u1", CAT.walk, L("익선동·낙원상가", "Ikseon · Nakwon", "益善洞·乐园商街", "益善洞・楽園商街"), L("골목 산책", "Alley stroll", "巷弄散步", "路地散歩"), 4.7, 6, 6),
        place("jr-u2", CAT.culture, L("탑골공원·인사동", "Tapgol · Insadong", "塔谷·仁寺洞", "塔谷・仁寺洞"), L("전통 거리", "Heritage streets", "传统街区", "伝統の通り"), 4.6, 2, 8),
      ),
    ],
  },
  {
    stationKo: "신도림역",
    meetExit: 1,
    meetSpot: L("1번 출구 디큐브시티", "Exit 1 D Cube City", "1号出口D Cube", "1番出口 ディキューブシティ"),
    doorTipA: L("빠른 하차 칸 9-4", "Fast alight car 9-4", "快速下车 9-4", "降車しやすい 9-4"),
    doorTipB: L("빠른 하차 칸 1-1", "Fast alight car 1-1", "快速下车 1-1", "降車しやすい 1-1"),
    steps: [
      step(
        "food",
        place("sdm-f1", L("푸드코트", "Food court", "美食广场", "フードコート"), L("디큐브 푸드코트", "D Cube Food Court", "D Cube美食广场", "ディキューブフードコート"), L("패밀리 메뉴", "Family picks", "家庭套餐", "ファミリーメニュー"), 4.4, 1, 2),
        place("sdm-f2", CAT.bbq, L("신도림 고기집", "Sindorim BBQ", "新道林烤肉", "新道林BBQ"), L("삼겹살 세트", "Samgyeopsal set", "五花肉套餐", "サムギョプセット"), 4.5, 2, 5),
      ),
      step(
        "cafe",
        place("sdm-c1", CAT.cafe, L("몰 카페", "Mall Cafe", "商场咖啡", "モールカフェ"), L("라떼·스무디", "Latte & smoothie", "拿铁冰沙", "ラテとスムージー"), 4.4, 1, 2),
        place("sdm-c2", CAT.dessert, L("디큐브 디저트", "D Cube Dessert", "D Cube甜品", "ディキューブデザート"), L("케이크 조각", "Cake slice", "切片蛋糕", "ケーキ1カット"), 4.5, 1, 3),
      ),
      step(
        "fun",
        place("sdm-u1", CAT.mall, L("디큐브시티", "D Cube City", "D Cube City", "ディキューブシティ"), L("쇼핑·영화", "Shop & cinema", "购物电影", "買い物・映画"), 4.5, 1, 1),
        place("sdm-u2", CAT.walk, L("안양천 산책", "Anyangcheon Walk", "安养川散步", "安養川散歩"), L("자전거 코스", "Bike path", "骑行道", "自転車コース"), 4.4, 3, 10),
      ),
    ],
  },
];

const PRESET_MAP = new Map(PRESETS.map((course) => [course.stationKo.replace(/역$/, ""), course]));

function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** Smart template when a station has no curated course. */
function templateCourse(stationKo: string): StationCourse {
  const bare = stationKo.replace(/역$/, "");
  const seed = hashSeed(bare);
  const exit = (seed % 9) + 1;
  const walk = (seed % 5) + 2;
  return {
    stationKo: stationKo.endsWith("역") ? stationKo : `${bare}역`,
    meetExit: exit,
    meetSpot: L(
      `${exit}번 출구 앞 만남의 장소`,
      `Meeting spot at Exit ${exit}`,
      `${exit}号出口会面点`,
      `${exit}番出口の待ち合わせ`,
    ),
    doorTipA: L(`빠른 하차 칸 ${(seed % 8) + 1}-2`, `Fast alight car ${(seed % 8) + 1}-2`, `快速下车 ${(seed % 8) + 1}-2`, `降車しやすい ${(seed % 8) + 1}-2`),
    doorTipB: L(`빠른 하차 칸 ${((seed + 3) % 8) + 1}-3`, `Fast alight car ${((seed + 3) % 8) + 1}-3`, `快速下车 ${((seed + 3) % 8) + 1}-3`, `降車しやすい ${((seed + 3) % 8) + 1}-3`),
    steps: [
      step(
        "food",
        place(
          `${bare}-f1`,
          CAT.bbq,
          L(`${bare} 동네 맛집 A`, `${bare} local favorite A`, `${bare}本地美食A`, `${bare}の人気店A`),
          L("현지인 추천 한식", "Local Korean pick", "本地人气韩餐", "地元おすすめ韓食"),
          4.4 + (seed % 4) / 10,
          exit,
          walk,
        ),
        place(
          `${bare}-f2`,
          CAT.ramen,
          L(`${bare} 면 맛집 B`, `${bare} noodle spot B`, `${bare}面馆B`, `${bare}の麺店B`),
          L("국물 진한 면 요리", "Rich broth noodles", "浓汤面食", "スープ濃いめの麺"),
          4.3 + (seed % 5) / 10,
          (exit % 9) + 1,
          walk + 1,
        ),
      ),
      step(
        "cafe",
        place(
          `${bare}-c1`,
          CAT.cafe,
          L(`${bare} 감성 카페`, `${bare} vibe cafe`, `${bare}氛围咖啡`, `${bare}の雰囲気カフェ`),
          L("라떼·디저트 플레이트", "Latte & dessert plate", "拿铁甜品盘", "ラテとデザート"),
          4.5,
          exit,
          walk,
        ),
        place(
          `${bare}-c2`,
          CAT.dessert,
          L(`${bare} 디저트숍`, `${bare} dessert shop`, `${bare}甜品店`, `${bare}のデザート店`),
          L("케이크·티세트", "Cake & tea set", "蛋糕茶点", "ケーキとティー"),
          4.6,
          (exit % 8) + 1,
          walk + 2,
        ),
      ),
      step(
        "fun",
        place(
          `${bare}-u1`,
          CAT.walk,
          L(`${bare} 근처 산책`, `${bare} neighborhood walk`, `${bare}附近散步`, `${bare}周辺散歩`),
          L("골목·공원 코스", "Alleys & park", "巷弄公园", "路地・公園"),
          4.5,
          exit,
          walk + 3,
        ),
        place(
          `${bare}-u2`,
          CAT.mall,
          L(`${bare} 쇼핑·놀거리`, `${bare} shop & fun`, `${bare}购物娱乐`, `${bare}の買い物・遊び`),
          L("편집숍·시네마", "Select shops & cinema", "买手店影院", "セレクトショップ・映画"),
          4.4,
          (exit % 7) + 1,
          walk + 1,
        ),
      ),
    ],
  };
}

export function courseForStation(stationKo: string): StationCourse {
  const bare = stationKo.replace(/역$/, "");
  return PRESET_MAP.get(bare) ?? templateCourse(stationKo);
}

export function courseStationOption(stationKo: string) {
  return stationByKoName(stationKo);
}

export const CURATED_COURSE_COUNT = PRESETS.length;
