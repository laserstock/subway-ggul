import type { Localized } from "./i18n";
import type { PlannerCategory, QuickTag } from "./plannerTypes";

export type PlannerSpot = {
  name: Localized;
  blurb: Localized;
  categories: PlannerCategory[];
  tags?: QuickTag[];
  lat: number;
  lng: number;
  /** The exit travelers are pointed to; when missing, the nearest exit to the spot is used. */
  exit?: string;
  /** Walking minutes when the straight-line estimate would mislead (uphill, long underground walks). */
  walk?: number;
};

/** Hand-picked spots around the stations visitors plan days around, keyed by Korean station name. */
export const PLANNER_SPOTS: Record<string, PlannerSpot[]> = {
  명동역: [
    {
      name: { ko: "명동 쇼핑거리", en: "Myeongdong Shopping Street", zh: "明洞购物街", ja: "明洞ショッピングストリート" },
      blurb: {
        ko: "서울에서 가장 붐비는 쇼핑 거리. 올리브영 여러 매장과 K-뷰티 플래그십, 패션 매장, 저녁 길거리 음식 노점이 모여 있어요.",
        en: "Seoul's busiest shopping strip: several Olive Young stores, K-beauty flagships, fashion and evening street-food stalls.",
        zh: "首尔最热闹的购物街：多家Olive Young、韩妆旗舰店、时装店，傍晚还有街头小吃摊。",
        ja: "ソウルで最もにぎわうショッピング街。オリーブヤング複数店舗やKビューティーの旗艦店、ファッション、夕方からの屋台グルメが集まります。",
      },
      categories: ["shopping", "beauty"],
      tags: ["#OliveYoung"],
      lat: 37.5637,
      lng: 126.9852,
      exit: "6",
    },
    {
      name: { ko: "명동 환전소 거리", en: "Myeongdong Money Changers", zh: "明洞换钱所", ja: "明洞の両替所" },
      blurb: {
        ko: "환전소가 모여 있어 공항보다 환율이 좋은 경우가 많아요. 여권을 챙기세요.",
        en: "A cluster of currency exchange booths, often with better rates than the airport; bring your passport.",
        zh: "换钱所集中的地方，汇率通常比机场好；记得带护照。",
        ja: "両替所が集まるエリア。空港よりレートが良いことが多いです。パスポートをお忘れなく。",
      },
      categories: ["essentials"],
      lat: 37.5617,
      lng: 126.9842,
    },
    {
      name: { ko: "명동교자", en: "Myeongdong Kyoja", zh: "明洞饺子", ja: "明洞餃子" },
      blurb: {
        ko: "1966년부터 이어온 칼국수와 만두 맛집. 점심 줄도 빨리 빠져요.",
        en: "Known since 1966 for kalguksu (knife-cut noodle soup) and dumplings; the lunch queue moves fast.",
        zh: "1966年开业的刀切面和饺子名店，午餐排队也走得很快。",
        ja: "1966年創業、カルグクス（韓国式手打ち麺）と餃子の名店。昼の行列も回転が早めです。",
      },
      categories: ["food"],
      lat: 37.5626,
      lng: 126.9856,
    },
    {
      name: { ko: "명동성당", en: "Myeongdong Cathedral", zh: "明洞天主教堂", ja: "明洞聖堂" },
      blurb: {
        ko: "1898년에 지어진 한국 최초의 고딕 양식 성당. 쇼핑 사이 조용히 쉬어 가기 좋아요.",
        en: "Korea's first Gothic-style cathedral (1898), a quiet stop between the shops.",
        zh: "建于1898年的韩国第一座哥特式教堂，逛街间隙的安静去处。",
        ja: "1898年建立、韓国初のゴシック様式の大聖堂。買い物の合間の静かな立ち寄りスポット。",
      },
      categories: ["culture"],
      lat: 37.5633,
      lng: 126.9873,
    },
    {
      name: { ko: "남산 케이블카 (N서울타워)", en: "Namsan Cable Car to N Seoul Tower", zh: "南山缆车（N首尔塔）", ja: "南山ケーブルカー（Nソウルタワー）" },
      blurb: {
        ko: "남산에 올라 서울 시내를 한눈에. 탑승장은 출구에서 오르막길을 걸어가야 해요.",
        en: "Ride up Namsan for the classic city view; the base station is uphill from the exit.",
        zh: "登上南山欣赏经典城市景观；缆车站位于出口上坡处。",
        ja: "南山に登って定番の市内ビューを。乗り場は出口から上り坂を歩きます。",
      },
      categories: ["culture"],
      lat: 37.5579,
      lng: 126.983,
      exit: "3",
      walk: 10,
    },
  ],
  홍대입구역: [
    {
      name: { ko: "홍대 거리·버스킹존", en: "Hongdae Street & Busking Zone", zh: "弘大街头与路演区", ja: "弘大ストリート＆バスキングゾーン" },
      blurb: {
        ko: "인디 패션, 캐릭터숍, 셀프 사진관, 버스킹 공연까지. 늦은 오후부터 가장 활기차요.",
        en: "Indie fashion, character shops, photo booths and street performers, liveliest from late afternoon.",
        zh: "独立服饰、角色周边店、自拍照相馆和街头表演，傍晚起最热闹。",
        ja: "インディーズファッション、キャラクターショップ、写真ブース、路上ライブ。夕方から一番にぎわいます。",
      },
      categories: ["shopping", "culture"],
      tags: ["#Life4Cut"],
      lat: 37.5552,
      lng: 126.9227,
      exit: "9",
    },
    {
      name: { ko: "경의선숲길", en: "Gyeongui Line Forest Park", zh: "京义线林荫道", ja: "京義線森の道" },
      blurb: {
        ko: "옛 철길을 따라 이어진 긴 공원. 연남동 쪽으로 카페가 줄지어 있어요.",
        en: "A long park on a former rail line, lined with cafés toward Yeonnam-dong.",
        zh: "由旧铁道改造的带状公园，通往延南洞一路都是咖啡馆。",
        ja: "旧線路跡に続く細長い公園。延南洞方面にカフェが並びます。",
      },
      categories: ["culture", "cafe"],
      lat: 37.5601,
      lng: 126.9246,
      exit: "3",
    },
    {
      name: { ko: "연남동 카페거리", en: "Yeonnam-dong Café Streets", zh: "延南洞咖啡街", ja: "延南洞カフェ通り" },
      blurb: {
        ko: "나지막한 골목 사이 작은 로스터리, 베이커리, 브런치 가게.",
        en: "Small roasteries, bakeries and brunch spots in low-rise side streets.",
        zh: "低矮小巷里藏着小型烘焙咖啡馆、面包店和早午餐店。",
        ja: "低層の路地に小さなロースタリー、ベーカリー、ブランチ店が点在。",
      },
      categories: ["cafe", "food"],
      lat: 37.5626,
      lng: 126.9228,
      exit: "3",
    },
  ],
  성수역: [
    {
      name: { ko: "연무장길 팝업 거리", en: "Yeonmujang-gil Pop-up Street", zh: "练武场街快闪店街", ja: "練武場キル ポップアップ通り" },
      blurb: {
        ko: "옛 공장 건물에 들어선 브랜드 팝업, 콘셉트 스토어, K-뷰티 쇼룸. 몇 주마다 구성이 바뀌어요.",
        en: "Brand pop-ups, concept stores and K-beauty showrooms in old factories; the line-up changes every few weeks.",
        zh: "旧工厂里的品牌快闪店、概念店和韩妆展厅，每隔几周就换一批。",
        ja: "古い工場を改装したブランドのポップアップ、コンセプトストア、Kビューティーのショールーム。数週間ごとに入れ替わります。",
      },
      categories: ["shopping", "beauty"],
      tags: ["#Pop-up"],
      lat: 37.5434,
      lng: 127.0553,
      exit: "3",
    },
    {
      name: { ko: "성수 창고형 카페", en: "Seongsu Warehouse Cafés", zh: "圣水仓库咖啡馆", ja: "聖水の倉庫カフェ" },
      blurb: {
        ko: "역 주변 공장을 개조한 인더스트리얼 감성 카페와 베이커리.",
        en: "Industrial-style cafés and bakeries in converted workshops around the station.",
        zh: "车站周边由工坊改造的工业风咖啡馆和面包店。",
        ja: "駅周辺の工房を改装したインダストリアルなカフェとベーカリー。",
      },
      categories: ["cafe"],
      lat: 37.5427,
      lng: 127.0565,
    },
  ],
  서울숲역: [
    {
      name: { ko: "서울숲", en: "Seoul Forest", zh: "首尔林", ja: "ソウルの森" },
      blurb: {
        ko: "넓은 잔디밭과 꽃사슴 방사장, 한강까지 이어지는 산책로가 있는 큰 공원.",
        en: "A big park with lawns, a deer enclosure and paths down to the Han River.",
        zh: "拥有大草坪、梅花鹿园和通往汉江步道的大型公园。",
        ja: "芝生広場やシカの放牧場があり、漢江まで歩ける大きな公園。",
      },
      categories: ["culture"],
      lat: 37.5443,
      lng: 127.0374,
      exit: "3",
    },
  ],
  동대문역사문화공원역: [
    {
      name: { ko: "동대문디자인플라자(DDP)", en: "Dongdaemun Design Plaza (DDP)", zh: "东大门设计广场（DDP）", ja: "東大門デザインプラザ（DDP）" },
      blurb: {
        ko: "자하 하디드가 설계한 곡선형 랜드마크. 전시와 디자인숍이 있고 밤에는 조명이 켜져요.",
        en: "Zaha Hadid's curving landmark with exhibitions and design shops, lit up at night.",
        zh: "扎哈·哈迪德设计的曲线地标，有展览和设计商店，夜晚亮灯。",
        ja: "ザハ・ハディド設計の曲線的なランドマーク。展示やデザインショップがあり、夜はライトアップ。",
      },
      categories: ["culture", "shopping"],
      lat: 37.5667,
      lng: 127.0093,
      exit: "1",
    },
    {
      name: { ko: "동대문 패션몰", en: "Dongdaemun Fashion Malls", zh: "东大门时装商场", ja: "東大門ファッションビル" },
      blurb: {
        ko: "두타몰 등 여러 층의 패션 빌딩. 늦게까지 영업하는 것으로 유명해요.",
        en: "Multi-floor fashion towers such as Doota Mall, known for late opening hours.",
        zh: "斗塔（Doota Mall）等多层时装大楼，以营业到很晚著称。",
        ja: "ドゥータモールなど多層階のファッションビル。夜遅くまで営業することで有名。",
      },
      categories: ["shopping"],
      lat: 37.5692,
      lng: 127.0094,
    },
  ],
  종로5가역: [
    {
      name: { ko: "광장시장", en: "Gwangjang Market", zh: "广藏市场", ja: "広蔵市場" },
      blurb: {
        ko: "서울의 대표 먹거리 시장. 빈대떡, 마약김밥, 육회를 노점에서 맛볼 수 있어요.",
        en: "Seoul's classic food market: bindaetteok (mung-bean pancakes), mayak gimbap and yukhoe at the stalls.",
        zh: "首尔经典美食市场：摊位上有绿豆煎饼、麻药紫菜包饭和生拌牛肉。",
        ja: "ソウル定番の食べ歩き市場。屋台でピンデトック（緑豆チヂミ）、麻薬キンパ、ユッケを。",
      },
      categories: ["food", "shopping"],
      lat: 37.57,
      lng: 126.9996,
    },
  ],
  경복궁역: [
    {
      name: { ko: "경복궁", en: "Gyeongbokgung Palace", zh: "景福宫", ja: "景福宮" },
      blurb: {
        ko: "조선의 법궁. 한복을 입으면 무료 입장이에요. 화요일 휴궁.",
        en: "The main Joseon palace; visitors in hanbok get in free. Closed on Tuesdays.",
        zh: "朝鲜王朝的正宫，穿韩服可免费入场。周二闭馆。",
        ja: "朝鮮王朝の正宮。韓服を着ると入場無料。火曜休み。",
      },
      categories: ["culture"],
      lat: 37.5788,
      lng: 126.977,
      exit: "5",
    },
    {
      name: { ko: "통인시장", en: "Tongin Market", zh: "通仁市场", ja: "通仁市場" },
      blurb: {
        ko: "엽전 도시락과 기름떡볶이로 유명한 동네 시장.",
        en: "Neighborhood market known for its coin lunchbox (dosirak) and oil tteokbokki.",
        zh: "以铜钱便当和油炒年糕闻名的社区市场。",
        ja: "古銭で選ぶお弁当（トシラク）と油トッポッキで知られる市場。",
      },
      categories: ["food"],
      lat: 37.581,
      lng: 126.9706,
      exit: "2",
    },
    {
      name: { ko: "서촌", en: "Seochon Village", zh: "西村", ja: "西村（ソチョン）" },
      blurb: {
        ko: "경복궁 서쪽 한옥 골목. 작은 갤러리, 카페, 책방이 모여 있어요.",
        en: "Hanok alleys west of the palace with small galleries, cafés and bookshops.",
        zh: "景福宫西侧的韩屋小巷，有小画廊、咖啡馆和书店。",
        ja: "景福宮の西側に広がる韓屋の路地。小さなギャラリー、カフェ、本屋が点在。",
      },
      categories: ["cafe", "shopping"],
      tags: ["#HanokVillage"],
      lat: 37.5795,
      lng: 126.9705,
    },
  ],
  안국역: [
    {
      name: { ko: "북촌한옥마을", en: "Bukchon Hanok Village", zh: "北村韩屋村", ja: "北村韓屋村" },
      blurb: {
        ko: "언덕을 따라 한옥이 늘어선 골목. 주민이 사는 곳이니 오전 10시~오후 5시에 방문하고 조용히 다녀 주세요.",
        en: "Hillside lanes of traditional homes. Residents live here: visit between 10 AM and 5 PM and keep voices down.",
        zh: "山坡上传统韩屋林立的小巷。这里有居民生活，请在10:00–17:00参观并保持安静。",
        ja: "坂道に伝統家屋が並ぶ路地。住民が暮らしているので、10時〜17時に訪れ、お静かに。",
      },
      categories: ["culture"],
      tags: ["#HanokVillage"],
      lat: 37.5826,
      lng: 126.9836,
      exit: "2",
    },
    {
      name: { ko: "인사동길", en: "Insadong-gil", zh: "仁寺洞街", ja: "仁寺洞通り" },
      blurb: {
        ko: "전통 공예품, 찻집, 나선형 쇼핑 공간 쌈지길.",
        en: "Traditional crafts, tea houses and the spiral Ssamziegil shopping courtyard.",
        zh: "传统工艺品、茶馆和螺旋形购物庭院Ssamziegil（人人广场）。",
        ja: "伝統工芸品、伝統茶屋、らせん状のショッピングスポット「サムジキル」。",
      },
      categories: ["shopping", "culture", "cafe"],
      lat: 37.5742,
      lng: 126.9852,
      exit: "6",
    },
    {
      name: { ko: "창덕궁", en: "Changdeokgung Palace", zh: "昌德宫", ja: "昌徳宮" },
      blurb: {
        ko: "유네스코 세계유산 궁궐. 후원은 시간 지정 관람권을 따로 예매해야 해요.",
        en: "UNESCO-listed palace; the Secret Garden needs a separate timed ticket.",
        zh: "联合国教科文组织世界遗产宫殿；后苑（秘苑）需另购限时门票。",
        ja: "ユネスコ世界遺産の宮殿。後苑（秘苑）は別途時間指定のチケットが必要。",
      },
      categories: ["culture"],
      lat: 37.5794,
      lng: 126.991,
      exit: "3",
    },
  ],
  종로3가역: [
    {
      name: { ko: "익선동 한옥거리", en: "Ikseon-dong Hanok Street", zh: "益善洞韩屋街", ja: "益善洞韓屋通り" },
      blurb: {
        ko: "좁은 한옥 골목이 카페, 디저트 가게, 작은 식당으로 바뀐 곳.",
        en: "Narrow hanok alleys turned into cafés, dessert shops and small restaurants.",
        zh: "狭窄的韩屋小巷变身为咖啡馆、甜品店和小餐馆。",
        ja: "細い韓屋の路地がカフェ、スイーツ店、小さな食堂に生まれ変わったエリア。",
      },
      categories: ["cafe", "food", "shopping"],
      tags: ["#HanokVillage"],
      lat: 37.5743,
      lng: 126.9898,
    },
  ],
  충무로역: [
    {
      name: { ko: "남산골한옥마을", en: "Namsangol Hanok Village", zh: "南山谷韩屋村", ja: "南山コル韓屋村" },
      blurb: {
        ko: "남산 자락에 복원된 조선시대 한옥 다섯 채와 정원. 전통놀이를 무료로 체험할 수 있어요.",
        en: "Five restored Joseon-era houses, a garden and free traditional games at the foot of Namsan.",
        zh: "南山脚下五座复原的朝鲜时代韩屋和庭园，还可免费体验传统游戏。",
        ja: "南山のふもとに復元された朝鮮時代の韓屋5棟と庭園。伝統遊びも無料で体験できます。",
      },
      categories: ["culture"],
      tags: ["#HanokVillage"],
      lat: 37.5592,
      lng: 126.9946,
    },
  ],
  광화문역: [
    {
      name: { ko: "광화문광장", en: "Gwanghwamun Square", zh: "光化门广场", ja: "光化門広場" },
      blurb: {
        ko: "세종대왕상과 이순신 장군상, 그 뒤로 광화문과 산이 보이는 광장.",
        en: "Statues of King Sejong and Admiral Yi, with Gwanghwamun Gate and the mountains behind.",
        zh: "世宗大王像和李舜臣将军像，背后是光化门和群山。",
        ja: "世宗大王像と李舜臣将軍像、その奥に光化門と山々が見える広場。",
      },
      categories: ["culture"],
      lat: 37.5727,
      lng: 126.9769,
    },
    {
      name: { ko: "교보문고 광화문점", en: "Kyobo Bookstore Gwanghwamun", zh: "教保文库光化门店", ja: "教保文庫 光化門店" },
      blurb: {
        ko: "문구와 디자인 소품까지 갖춘 대형 서점. 지하로 바로 연결돼요.",
        en: "A huge bookstore with stationery and Korean design goods, connected underground.",
        zh: "大型书店，还有文具和韩国设计小物，地下直通。",
        ja: "文房具や韓国デザイングッズもそろう巨大書店。地下で直結。",
      },
      categories: ["shopping"],
      lat: 37.571,
      lng: 126.978,
    },
    {
      name: { ko: "청계천", en: "Cheonggyecheon Stream", zh: "清溪川", ja: "清渓川" },
      blurb: {
        ko: "청계광장에서 시작하는 하천 산책로. 여름 저녁에 시원해요.",
        en: "A sunken stream walk starting at Cheonggye Plaza, cool on summer evenings.",
        zh: "从清溪广场开始的下沉式溪流步道，夏夜很凉爽。",
        ja: "清渓広場から始まる川沿いの遊歩道。夏の夕方は涼しく快適。",
      },
      categories: ["culture"],
      lat: 37.5694,
      lng: 126.978,
    },
  ],
  시청역: [
    {
      name: { ko: "덕수궁", en: "Deoksugung Palace", zh: "德寿宫", ja: "徳寿宮" },
      blurb: {
        ko: "서양식 석조전이 있는 궁궐. 나올 때는 덕수궁 돌담길을 걸어 보세요.",
        en: "A palace with Western-style stone halls; leave along the Deoksugung stone-wall road.",
        zh: "有西式石造殿的宫殿；离开时可沿德寿宫石墙路散步。",
        ja: "西洋式の石造殿がある宮殿。帰りは徳寿宮の石垣道を散策。",
      },
      categories: ["culture"],
      lat: 37.5658,
      lng: 126.9752,
      exit: "2",
    },
  ],
  회현역: [
    {
      name: { ko: "남대문시장", en: "Namdaemun Market", zh: "南大门市场", ja: "南大門市場" },
      blurb: {
        ko: "기념품, 인삼, 칼국수 골목까지 있는 넓은 전통시장.",
        en: "A sprawling traditional market for souvenirs, ginseng and the kalguksu alley.",
        zh: "大型传统市场，有纪念品、人参和刀切面胡同。",
        ja: "お土産、高麗人参、カルグクス横丁がある広大な伝統市場。",
      },
      categories: ["shopping", "food"],
      lat: 37.5593,
      lng: 126.9773,
      exit: "5",
    },
    {
      name: { ko: "신세계백화점 본점", en: "Shinsegae Department Store (Main)", zh: "新世界百货总店", ja: "新世界百貨店 本店" },
      blurb: {
        ko: "역사 깊은 본점. 명품관과 지하의 대형 식품관이 있어요.",
        en: "The historic flagship, with luxury floors and a big basement food hall.",
        zh: "历史悠久的旗舰店，有奢侈品楼层和地下大型美食街。",
        ja: "歴史ある本店。高級ブランドフロアと地下の大型フードホール。",
      },
      categories: ["shopping", "food", "beauty"],
      lat: 37.5609,
      lng: 126.981,
      exit: "7",
    },
  ],
  을지로입구역: [
    {
      name: {
        ko: "롯데백화점·롯데면세점 본점",
        en: "Lotte Department Store & Duty Free (Main)",
        zh: "乐天百货·乐天免税店总店",
        ja: "ロッテ百貨店・ロッテ免税店 本店",
      },
      blurb: {
        ko: "백화점과 면세점이 한 건물에. 면세점 이용 시 여권을 챙기세요.",
        en: "Department store and duty-free floors under one roof; bring your passport for duty-free.",
        zh: "百货和免税店在同一栋楼；去免税店请带护照。",
        ja: "百貨店と免税店が同じ建物に。免税店ではパスポートが必要です。",
      },
      categories: ["shopping", "beauty"],
      lat: 37.5646,
      lng: 126.9817,
      exit: "7",
    },
  ],
  서울역: [
    {
      name: { ko: "서울로7017", en: "Seoullo 7017", zh: "首尔路7017", ja: "ソウル路7017" },
      blurb: {
        ko: "역 옆 옛 고가도로를 공중 정원 산책로로 바꾼 곳.",
        en: "A garden walkway on a former highway overpass next to the station.",
        zh: "车站旁由旧高架桥改造的空中花园步道。",
        ja: "駅の隣、旧高架道路を空中庭園の遊歩道にしたスポット。",
      },
      categories: ["culture"],
      lat: 37.5563,
      lng: 126.9706,
    },
    {
      name: { ko: "롯데마트 서울역점", en: "Lotte Mart Seoul Station", zh: "乐天玛特首尔站店", ja: "ロッテマート ソウル駅店" },
      blurb: {
        ko: "귀국 전 과자, 라면, 기초 화장품을 사려는 여행객에게 인기.",
        en: "Popular with travelers for snacks, ramyeon and K-beauty basics before flying home.",
        zh: "深受游客欢迎，回国前买零食、拉面和基础韩妆的好去处。",
        ja: "帰国前にお菓子、ラーメン、基礎コスメをまとめ買いする旅行者に人気。",
      },
      categories: ["shopping", "beauty"],
      lat: 37.5555,
      lng: 126.9698,
    },
  ],
  이태원역: [
    {
      name: { ko: "이태원로와 골목", en: "Itaewon-ro & Side Streets", zh: "梨泰院路与小巷", ja: "梨泰院路と路地" },
      blurb: {
        ko: "큰길과 골목을 따라 세계 각국 음식점, 빈티지숍, 바가 이어져요.",
        en: "International restaurants, vintage shops and bars along the main road and alleys.",
        zh: "大街小巷遍布各国餐厅、古着店和酒吧。",
        ja: "大通りと路地に各国料理店、古着屋、バーが並びます。",
      },
      categories: ["food", "shopping"],
      lat: 37.5346,
      lng: 126.993,
    },
  ],
  한강진역: [
    {
      name: { ko: "리움미술관", en: "Leeum Museum of Art", zh: "Leeum美术馆", ja: "リウム美術館" },
      blurb: {
        ko: "한국 도자기부터 현대미술까지. 사전 예약을 권해요.",
        en: "Korean ceramics through to contemporary art; booking ahead is recommended.",
        zh: "从韩国陶瓷到当代艺术；建议提前预约。",
        ja: "韓国の陶磁器から現代アートまで。事前予約がおすすめ。",
      },
      categories: ["culture"],
      lat: 37.5382,
      lng: 126.999,
      exit: "1",
    },
  ],
  신사역: [
    {
      name: { ko: "가로수길", en: "Garosu-gil", zh: "林荫道（Garosu-gil）", ja: "カロスキル" },
      blurb: {
        ko: "가로수를 따라 브랜드 플래그십, 편집숍, 카페가 늘어선 거리.",
        en: "A tree-lined street of brand flagships, boutiques and cafés.",
        zh: "绿树成荫的街道，品牌旗舰店、精品店和咖啡馆林立。",
        ja: "並木道に沿ってブランド旗艦店、セレクトショップ、カフェが並ぶ通り。",
      },
      categories: ["shopping", "cafe", "beauty"],
      lat: 37.5208,
      lng: 127.023,
      exit: "8",
    },
  ],
  압구정로데오역: [
    {
      name: { ko: "갤러리아백화점", en: "Galleria Department Store", zh: "Galleria百货", ja: "ギャラリア百貨店" },
      blurb: {
        ko: "서울의 대표 명품 백화점. 동관과 서관으로 나뉘어 있어요.",
        en: "Seoul's best-known luxury department store, split into East and West halls.",
        zh: "首尔最知名的奢华百货，分为东馆和西馆。",
        ja: "ソウルを代表する高級百貨店。東館と西館に分かれています。",
      },
      categories: ["shopping", "beauty"],
      lat: 37.5279,
      lng: 127.04,
      exit: "7",
    },
    {
      name: { ko: "압구정 로데오거리", en: "Apgujeong Rodeo Street", zh: "狎鸥亭罗德奥街", ja: "狎鴎亭ロデオ通り" },
      blurb: {
        ko: "디자이너 부티크, 카페, 브런치 가게가 모인 골목.",
        en: "Side streets of designer boutiques, cafés and brunch spots.",
        zh: "设计师精品店、咖啡馆和早午餐店聚集的街巷。",
        ja: "デザイナーズブティック、カフェ、ブランチ店が集まる路地。",
      },
      categories: ["cafe", "shopping", "food"],
      lat: 37.5257,
      lng: 127.039,
    },
  ],
  삼성역: [
    {
      name: {
        ko: "스타필드 코엑스몰·별마당도서관",
        en: "Starfield COEX Mall & Library",
        zh: "星空图书馆与COEX商场",
        ja: "スターフィールドCOEXモール・ピョルマダン図書館",
      },
      blurb: {
        ko: "사진 명소인 2층 높이 별마당도서관을 품은 거대한 지하 쇼핑몰.",
        en: "A giant underground mall around the photogenic two-story Starfield Library.",
        zh: "环绕着网红两层高星空图书馆的巨型地下商场。",
        ja: "写真映えする2フロア吹き抜けのピョルマダン図書館を囲む巨大地下モール。",
      },
      categories: ["shopping", "culture"],
      lat: 37.51,
      lng: 127.06,
      exit: "5",
    },
    {
      name: { ko: "봉은사", en: "Bongeunsa Temple", zh: "奉恩寺", ja: "奉恩寺" },
      blurb: {
        ko: "794년 창건된 사찰로 코엑스 빌딩과 마주하고 있어요. 무료 입장.",
        en: "A Buddhist temple founded in 794, facing the COEX towers; free to enter.",
        zh: "创建于794年的佛寺，与COEX大楼相望，免费参观。",
        ja: "794年創建の仏教寺院。COEXのビル群の向かいにあり、入場無料。",
      },
      categories: ["culture"],
      lat: 37.5146,
      lng: 127.0576,
      exit: "6",
    },
  ],
  잠실역: [
    {
      name: { ko: "롯데월드타워·서울스카이", en: "Lotte World Tower & Seoul Sky", zh: "乐天世界塔与首尔天空", ja: "ロッテワールドタワー・ソウルスカイ" },
      blurb: {
        ko: "한국에서 가장 높은 건물. 서울스카이 전망대와 아래층 롯데월드몰.",
        en: "Korea's tallest building, with the Seoul Sky observatory and Lotte World Mall below.",
        zh: "韩国最高建筑，有首尔天空观景台，楼下是乐天世界购物中心。",
        ja: "韓国一高いビル。展望台ソウルスカイと下層にロッテワールドモール。",
      },
      categories: ["culture", "shopping"],
      lat: 37.5126,
      lng: 127.1025,
      exit: "1",
    },
    {
      name: { ko: "롯데월드 어드벤처", en: "Lotte World Adventure", zh: "乐天世界探险乐园", ja: "ロッテワールド・アドベンチャー" },
      blurb: {
        ko: "실내 테마파크와 석촌호수 위 야외 매직아일랜드.",
        en: "An indoor theme park plus the outdoor Magic Island on Seokchon Lake.",
        zh: "室内主题乐园，加上石村湖上的户外魔幻岛。",
        ja: "屋内テーマパークと石村湖に浮かぶ屋外のマジックアイランド。",
      },
      categories: ["culture"],
      lat: 37.5111,
      lng: 127.098,
      exit: "4",
    },
    {
      name: { ko: "석촌호수", en: "Seokchon Lake", zh: "石村湖", ja: "石村湖" },
      blurb: {
        ko: "롯데월드 옆 호숫가 산책로. 4월 초에는 벚꽃이 피어요.",
        en: "An easy lakeside loop beside Lotte World; cherry blossoms in early April.",
        zh: "乐天世界旁轻松的环湖步道，四月初樱花盛开。",
        ja: "ロッテワールド横の湖畔散歩道。4月上旬は桜が見頃。",
      },
      categories: ["culture", "cafe"],
      lat: 37.5095,
      lng: 127.104,
    },
  ],
  여의도역: [
    {
      name: { ko: "더현대 서울", en: "The Hyundai Seoul", zh: "现代百货首尔（The Hyundai Seoul）", ja: "ザ・現代ソウル" },
      blurb: {
        ko: "실내 정원과 계속 바뀌는 팝업, 대형 식품관이 있는 백화점.",
        en: "A department store with an indoor garden, rotating pop-ups and a big food hall.",
        zh: "拥有室内花园、轮换快闪店和大型美食街的百货商场。",
        ja: "屋内庭園、入れ替わるポップアップ、大型フードホールのある百貨店。",
      },
      categories: ["shopping", "food", "beauty"],
      tags: ["#Pop-up"],
      lat: 37.5259,
      lng: 126.9284,
      exit: "3",
    },
    {
      name: { ko: "IFC몰", en: "IFC Mall", zh: "IFC商场", ja: "IFCモール" },
      blurb: {
        ko: "패션 브랜드와 음식점이 있는 지하 쇼핑몰.",
        en: "An underground mall with fashion brands and restaurants.",
        zh: "汇集时尚品牌和餐厅的地下商场。",
        ja: "ファッションブランドとレストランが入る地下モール。",
      },
      categories: ["shopping", "food"],
      lat: 37.5251,
      lng: 126.9255,
    },
  ],
  여의나루역: [
    {
      name: { ko: "여의도 한강공원", en: "Yeouido Hangang Park", zh: "汝矣岛汉江公园", ja: "汝矣島漢江公園" },
      blurb: {
        ko: "한강변 잔디밭, 자전거 대여, 편의점 라면까지.",
        en: "Riverside lawns, bike rental and convenience-store ramyeon by the Han River.",
        zh: "汉江边的草坪、自行车租借，还能吃便利店拉面。",
        ja: "漢江沿いの芝生、レンタサイクル、コンビニラーメンを楽しめる公園。",
      },
      categories: ["culture"],
      lat: 37.5283,
      lng: 126.933,
    },
  ],
  고속터미널역: [
    {
      name: { ko: "고투몰", en: "GOTO Mall", zh: "GOTO MALL地下街", ja: "GOTOモール" },
      blurb: {
        ko: "저렴한 옷과 생활용품 가게가 길게 이어진 지하상가.",
        en: "A long underground arcade of budget fashion and home goods.",
        zh: "长长的地下商街，平价服饰和家居用品店林立。",
        ja: "プチプラのファッションや雑貨店が長く続く地下街。",
      },
      categories: ["shopping"],
      lat: 37.5057,
      lng: 127.005,
    },
    {
      name: { ko: "신세계백화점 강남점", en: "Shinsegae Gangnam", zh: "新世界百货江南店", ja: "新世界百貨店 江南店" },
      blurb: {
        ko: "국내 최대급 백화점 중 하나로, 대형 식품관이 있어요.",
        en: "One of Korea's biggest department stores, with a large food hall.",
        zh: "韩国规模最大的百货之一，有大型美食街。",
        ja: "韓国最大級の百貨店のひとつ。大型フードホールも。",
      },
      categories: ["shopping", "food", "beauty"],
      lat: 37.5046,
      lng: 127.004,
    },
  ],
  강남역: [
    {
      name: { ko: "강남대로", en: "Gangnam-daero", zh: "江南大路", ja: "江南大路" },
      blurb: {
        ko: "올리브영 등 K-뷰티 매장과 음식점, 지하상가가 이어지는 중심 거리.",
        en: "The main strip of Olive Young and other K-beauty stores, restaurants and the underground shopping arcade.",
        zh: "Olive Young等韩妆店、餐厅和地下商街集中的主干道。",
        ja: "オリーブヤングなどKビューティーの店、飲食店、地下街が続くメインストリート。",
      },
      categories: ["shopping", "beauty", "food"],
      tags: ["#OliveYoung"],
      lat: 37.499,
      lng: 127.0275,
    },
  ],
};

/** Suggested day trips for the planner home and the sitemap, by Korean station name. */
export const PLANNER_PAIRS: [string, string, PlannerCategory[], QuickTag[]][] = [
  ["서울역", "명동역", ["beauty", "shopping"], ["#OliveYoung", "#Daiso"]],
  ["명동역", "성수역", ["shopping", "cafe"], ["#Pop-up"]],
  ["홍대입구역", "명동역", ["shopping", "food"], ["#Life4Cut"]],
  ["서울역", "경복궁역", ["culture", "food"], ["#HanokVillage"]],
  ["명동역", "잠실역", ["culture", "shopping"], []],
  ["홍대입구역", "성수역", ["cafe", "shopping"], ["#Pop-up"]],
  ["강남역", "삼성역", ["shopping", "culture"], ["#OliveYoung"]],
  ["을지로입구역", "동대문역사문화공원역", ["shopping", "food"], ["#K-BBQ"]],
];
