import type { Localized } from "./i18n";

/** Bump when an article's facts are re-checked; shown on every article and used for dateModified. */
export const ARTICLES_CHECKED = "2026-11-04";

export type GuideArticle = {
  slug: string;
  emoji: string;
  title: Localized;
  description: Localized;
  sections: { heading: Localized; paragraphs: Localized[] }[];
  /** Data-driven block rendered after the sections: locker sizes and prices plus the T-Luggage desks. */
  extra?: "luggage";
  /** Korean station names (with 역) linked at the end. */
  stations: string[];
  sources: { label: string; url: string }[];
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "incheon-airport-to-seoul",
    emoji: "✈️",
    title: {
      ko: "인천공항에서 서울 시내 가는 법: 공항철도 일반열차 vs 직통열차",
      en: "Incheon Airport to Seoul by Subway: AREX All-Stop vs Express Train",
      zh: "仁川机场到首尔市区怎么走：机场铁路普通列车与直达列车",
      ja: "仁川空港からソウル市内への行き方：空港鉄道 一般列車と直通列車",
    },
    description: {
      ko: "인천공항 1·2터미널에서 서울역·홍대입구·명동·강남까지 공항철도(AREX)로 가는 방법, 일반열차와 직통열차 차이, 숙소별 환승역 정리.",
      en: "How to ride the AREX airport railroad from Incheon Airport T1 and T2 to Seoul Station, Hongdae, Myeongdong and Gangnam, and which train to take.",
      zh: "从仁川机场第1、第2航站楼乘机场铁路（AREX）前往首尔站、弘大、明洞、江南的方法，普通列车与直达列车的区别及换乘站。",
      ja: "仁川空港第1・第2ターミナルから空港鉄道（AREX）でソウル駅・弘大・明洞・江南へ行く方法と、一般列車と直通列車の違い。",
    },
    sections: [
      {
        heading: {
          ko: "공항철도(AREX) 한눈에 보기",
          en: "The AREX airport railroad in a nutshell",
          zh: "机场铁路（AREX）概要",
          ja: "空港鉄道（AREX）のポイント",
        },
        paragraphs: [
          {
            ko: "공항철도는 인천공항 1·2터미널에서 김포공항, 디지털미디어시티, 홍대입구, 공덕을 거쳐 서울역까지 가는 노선이에요. 버스보다 막히지 않고 택시보다 훨씬 저렴해서 여행자가 가장 많이 이용해요.",
            en: "AREX runs from Incheon Airport Terminals 1 and 2 through Gimpo Airport, Digital Media City, Hongik University and Gongdeok to Seoul Station. It never sits in traffic and costs a fraction of a taxi, which is why most visitors use it.",
            zh: "机场铁路从仁川机场第1、第2航站楼出发，经金浦机场、数码媒体城、弘大入口、孔德，终点为首尔站。不会堵车，价格也比出租车便宜得多，是游客最常用的交通方式。",
            ja: "空港鉄道は仁川空港第1・第2ターミナルから金浦空港、デジタルメディアシティ、弘大入口、孔徳を経てソウル駅まで走ります。渋滞がなくタクシーよりずっと安いので、旅行者に最も使われています。",
          },
          {
            ko: "공항 도착층에서 'Train to City' 표지판을 따라가면 공항철도 역이 나와요. 2터미널에서 타면 1터미널을 거쳐 가요.",
            en: "From arrivals, follow the “Train to City” signs to the AREX station. Trains from Terminal 2 stop at Terminal 1 on the way.",
            zh: "在到达层按照“Train to City”指示牌即可找到机场铁路车站。从第2航站楼上车的列车会经停第1航站楼。",
            ja: "到着ロビーから「Train to City」の案内に従うと空港鉄道の駅に着きます。第2ターミナル発の列車は第1ターミナルにも停まります。",
          },
        ],
      },
      {
        heading: {
          ko: "일반열차와 직통열차, 뭘 탈까?",
          en: "All-stop train or express train?",
          zh: "普通列车还是直达列车？",
          ja: "一般列車と直通列車、どっちに乗る？",
        },
        paragraphs: [
          {
            ko: "일반열차는 모든 역에 서고, 1터미널에서 서울역까지 약 1시간 걸려요. 교통카드(티머니)를 찍고 타면 되고, 지하철로 갈아탈 때도 환승이 돼요. 대부분의 여행자에게는 일반열차가 가장 편하고 저렴해요.",
            en: "All-stop trains call at every station and take about an hour from Terminal 1 to Seoul Station. You simply tap a T-money card, and changing to the subway counts as a transfer. For most visitors this is the easiest and cheapest option.",
            zh: "普通列车每站都停，从第1航站楼到首尔站约需1小时。刷 T-money 交通卡即可进站，换乘地铁也能享受换乘优惠。对大多数游客来说，普通列车最方便、最便宜。",
            ja: "一般列車は全駅に停まり、第1ターミナルからソウル駅まで約1時間です。T-moneyをタッチするだけで乗れ、地下鉄への乗り換えも乗継扱いになります。多くの旅行者にはこれが一番手軽で安い方法です。",
          },
          {
            ko: "직통열차는 서울역까지 쉬지 않고 가요(1터미널 약 43분, 2터미널 약 51분). 지정좌석이고 표를 따로 사야 하며 요금이 더 비싸요. 숙소가 서울역 근처이거나 짐이 많아 앉아서 가고 싶을 때 좋아요.",
            en: "Express trains run non-stop to Seoul Station (about 43 minutes from Terminal 1, 51 from Terminal 2). Seats are reserved, you need a separate ticket and it costs more. It's worth it if you're staying near Seoul Station or want a guaranteed seat with big luggage.",
            zh: "直达列车中途不停站，直达首尔站（第1航站楼约43分钟，第2航站楼约51分钟）。实行对号入座，需要单独购票，票价较高。如果住在首尔站附近，或行李多想确保有座位，可以选择直达列车。",
            ja: "直通列車はソウル駅までノンストップです（第1ターミナルから約43分、第2ターミナルから約51分）。全席指定で別途きっぷが必要、運賃も高めです。宿がソウル駅の近くの場合や、大きな荷物で確実に座りたいときに向いています。",
          },
        ],
      },
      {
        heading: {
          ko: "숙소별로 어디서 갈아탈까",
          en: "Where to change for your hotel",
          zh: "按住宿地点选择换乘站",
          ja: "宿泊エリア別の乗り換え駅",
        },
        paragraphs: [
          {
            ko: "홍대·연남동: 홍대입구역에서 내리면 돼요. 공항철도 승강장에서 2호선까지는 꽤 걸으니 시간을 넉넉히 잡으세요.",
            en: "Hongdae and Yeonnam-dong: get off at Hongik University. The walk from the AREX platform to Line 2 is long, so allow a few extra minutes.",
            zh: "弘大、延南洞：在弘大入口站下车即可。从机场铁路站台走到2号线距离较远，请预留时间。",
            ja: "弘大・延南洞：弘大入口駅で降ります。空港鉄道のホームから2号線までは少し歩くので、時間に余裕を持ってください。",
          },
          {
            ko: "명동·동대문: 서울역에서 4호선으로 갈아타요(명동까지 두 정거장). 공항철도 서울역은 아주 깊어서 환승에 10분 정도 걸려요.",
            en: "Myeongdong and Dongdaemun: change at Seoul Station to Line 4 (Myeongdong is two stops). The AREX platforms at Seoul Station are very deep, so the transfer takes around 10 minutes.",
            zh: "明洞、东大门：在首尔站换乘4号线（到明洞两站）。机场铁路首尔站站台很深，换乘约需10分钟。",
            ja: "明洞・東大門：ソウル駅で4号線に乗り換えます（明洞まで2駅）。空港鉄道のソウル駅ホームはとても深く、乗り換えに10分ほどかかります。",
          },
          {
            ko: "이태원: 공덕역에서 6호선으로 갈아타요. 강남: 김포공항역에서 9호선 급행으로 갈아타면 신논현역(강남역 근처)까지 한 번에 가요.",
            en: "Itaewon: change at Gongdeok to Line 6. Gangnam: change at Gimpo Airport to a Line 9 express train, which runs straight to Sinnonhyeon, a short walk from Gangnam.",
            zh: "梨泰院：在孔德站换乘6号线。江南：在金浦机场站换乘9号线快车，可直达新论岘站（步行即可到江南站一带）。",
            ja: "梨泰院：孔徳駅で6号線に乗り換え。江南：金浦空港駅で9号線の急行に乗り換えると、江南駅近くの新論峴駅まで直通です。",
          },
        ],
      },
      {
        heading: {
          ko: "늦게 도착한다면",
          en: "Landing late?",
          zh: "深夜抵达怎么办",
          ja: "夜遅く到着する場合",
        },
        paragraphs: [
          {
            ko: "공항철도는 이른 아침부터 자정 무렵까지 다녀요. 밤늦게 도착하면 공항철도 홈페이지에서 막차 시간을 먼저 확인하고, 놓쳤다면 심야버스나 택시를 이용하세요.",
            en: "AREX runs from early morning until around midnight. If you land late, check the last train time on the AREX website first; if you miss it, take a late-night bus or a taxi.",
            zh: "机场铁路从清晨运营到午夜前后。深夜抵达时，请先在机场铁路官网确认末班车时间；如果错过，可乘坐深夜巴士或出租车。",
            ja: "空港鉄道は早朝から深夜0時ごろまで運行しています。夜遅く着く場合は空港鉄道の公式サイトで終電時刻を確認し、間に合わなければ深夜バスかタクシーを利用しましょう。",
          },
        ],
      },
    ],
    stations: ["인천공항1터미널역", "인천공항2터미널역", "서울역", "홍대입구역", "공덕역", "김포공항역", "명동역", "신논현역"],
    sources: [
      { label: "AREX (Airport Railroad)", url: "https://www.arex.or.kr" },
      { label: "Incheon International Airport", url: "https://www.airport.kr" },
    ],
  },
  {
    slug: "t-money-card",
    emoji: "💳",
    title: {
      ko: "티머니 교통카드 사는 법·충전·환불, 기후동행카드 단기권까지",
      en: "T-money Card Guide: Where to Buy, How to Top Up, Fares & Climate Card",
      zh: "T-money 交通卡指南：在哪买、怎么充值、票价与气候同行卡",
      ja: "T-moneyカードの買い方・チャージ・払い戻しと気候同行カード",
    },
    description: {
      ko: "서울 지하철·버스를 타는 데 필요한 티머니 카드를 어디서 사고 어떻게 충전하는지, 요금과 환승, 기후동행카드 단기권이 이득인지 정리했어요.",
      en: "Where to buy a T-money card in Seoul, how to top it up with cash, how subway fares and bus transfers work, and whether the Climate Card tourist pass is worth it.",
      zh: "在首尔哪里买 T-money 交通卡、如何用现金充值、地铁票价与公交换乘规则，以及气候同行卡短期券是否划算。",
      ja: "ソウルでT-moneyカードを買える場所、現金でのチャージ方法、地下鉄運賃とバス乗り継ぎ、気候同行カード短期券はお得かをまとめました。",
    },
    sections: [
      {
        heading: { ko: "티머니가 뭔가요?", en: "What is T-money?", zh: "T-money 是什么？", ja: "T-moneyとは？" },
        paragraphs: [
          {
            ko: "티머니는 지하철, 버스, 일부 택시와 편의점에서 쓰는 충전식 교통카드예요. 개찰구에 들어갈 때와 나올 때 한 번씩 찍으면 거리만큼 요금이 빠져요. 1회용 승차권보다 싸고, 버스와 갈아탈 때 환승 할인도 받아요.",
            en: "T-money is a rechargeable card for the subway, buses, some taxis and convenience stores. Tap it on the reader when you enter and when you leave, and the fare for your distance is deducted. It's cheaper than single-journey tickets and gets you transfer discounts with buses.",
            zh: "T-money 是可充值的交通卡，可用于地铁、公交、部分出租车和便利店。进站和出站时各刷一次，系统按距离扣费。比单程票便宜，换乘公交还有优惠。",
            ja: "T-moneyは地下鉄、バス、一部のタクシーやコンビニで使えるチャージ式の交通カードです。改札に入るときと出るときにタッチすると距離に応じた運賃が引かれます。1回券より安く、バスとの乗り継ぎ割引も受けられます。",
          },
        ],
      },
      {
        heading: { ko: "어디서 사나요?", en: "Where to buy one", zh: "在哪里购买", ja: "どこで買える？" },
        paragraphs: [
          {
            ko: "공항과 시내의 편의점(GS25, CU, 세븐일레븐, 이마트24)에서 팔아요. 카드값은 몇천 원이고 잔액은 0원이니 사자마자 충전해야 해요. 와우패스처럼 환전·결제 기능이 있는 여행자 카드에도 티머니 기능이 들어 있어요.",
            en: "Convenience stores at the airport and across the city (GS25, CU, 7-Eleven, emart24) sell them. The card itself costs a few thousand won and starts with no balance, so top it up right away. Tourist cards such as WOWPASS also include a T-money function.",
            zh: "机场和市区的便利店（GS25、CU、7-Eleven、emart24）都有售。卡费几千韩元，初始余额为0，买后需立即充值。WOWPASS 等旅游卡也带有 T-money 功能。",
            ja: "空港や市内のコンビニ（GS25、CU、セブンイレブン、emart24）で買えます。カード代は数千ウォンで残高は0なので、買ったらすぐチャージしましょう。WOWPASSなどの旅行者向けカードにもT-money機能が付いています。",
          },
        ],
      },
      {
        heading: { ko: "충전과 환불", en: "Topping up and refunds", zh: "充值与退款", ja: "チャージと払い戻し" },
        paragraphs: [
          {
            ko: "역마다 있는 '교통카드 충전기'에서 영어 화면으로 충전할 수 있어요. 카드를 올려놓고 금액을 고른 뒤 지폐를 넣으면 돼요. 충전은 현금만 되고, 편의점 계산대에서도 '티머니 충전'이라고 하면 현금으로 충전해 줘요.",
            en: "Every station has top-up machines with an English menu: place the card on the reader, choose an amount and insert banknotes. Top-ups are cash only. You can also top up at a convenience store counter; just say “T-money charge” and pay in cash.",
            zh: "每个车站都有交通卡充值机，可切换英文界面：放上卡片，选择金额，投入纸币即可。充值只收现金。也可以在便利店收银台说“T-money charge”，用现金充值。",
            ja: "各駅のチャージ機は英語表示に切り替えられます。カードを置いて金額を選び、紙幣を入れるだけです。チャージは現金のみ。コンビニのレジで「T-moneyチャージ」と伝えて現金で払うこともできます。",
          },
          {
            ko: "남은 잔액은 편의점에서 소액 수수료를 내고 환불받을 수 있어요(금액 한도 있음). 많이 남았다면 귀국 전에 편의점 결제로 쓰는 것도 방법이에요.",
            en: "Leftover balance can be refunded at convenience stores for a small fee, up to a limit. Spending it on snacks before you fly home works too.",
            zh: "剩余余额可在便利店支付少量手续费后退还（有金额上限）。也可以在回国前用于便利店消费。",
            ja: "残高はコンビニで少額の手数料を払えば払い戻せます（上限あり）。帰国前にコンビニの買い物で使い切るのも手です。",
          },
        ],
      },
      {
        heading: { ko: "요금과 환승", en: "Fares and transfers", zh: "票价与换乘", ja: "運賃と乗り継ぎ" },
        paragraphs: [
          {
            ko: "지하철 요금은 거리 비례제예요. 기본요금(카드 기준 1,500원 안팎)으로 10km까지 가고, 그 뒤로 거리에 따라 조금씩 올라가요. 1회용 승차권은 조금 더 비싸고 보증금 500원이 붙어서 내린 뒤 보증금 환급기에서 돌려받아야 해요.",
            en: "Subway fares go by distance. The base fare (around 1,500 won with a card) covers the first 10 km, then rises a little with distance. Single-journey tickets cost slightly more and carry a 500-won deposit you reclaim at a refund machine after your ride.",
            zh: "地铁按距离计费。基本票价（刷卡约1,500韩元）可乘坐10公里，之后按距离小幅加价。单程票稍贵，还需支付500韩元押金，下车后在押金退还机取回。",
            ja: "地下鉄は距離制運賃です。基本運賃（カードで約1,500ウォン前後）で10kmまで乗れ、それ以降は距離に応じて少しずつ上がります。1回券は少し高く、500ウォンの保証金が付くので、降りた後に保証金払戻機で返してもらいましょう。",
          },
          {
            ko: "지하철끼리는 개찰구 안에서 갈아타면 추가 요금 없이 이어져요. 내린 뒤 30분 안에(밤 9시~아침 7시는 1시간) 버스로 갈아타면 환승 할인을 받는데, 버스에서 내릴 때도 카드를 꼭 찍어야 해요.",
            en: "Changing between subway lines inside the gates costs nothing extra. Board a bus within 30 minutes of leaving the subway (1 hour between 9 pm and 7 am) to get the transfer discount, and remember to tap your card when you get off the bus too.",
            zh: "在检票口内换乘其他地铁线路不另收费。出站后30分钟内（晚9点至早7点为1小时）换乘公交可享受换乘优惠，下公交时也一定要刷卡。",
            ja: "改札内での地下鉄の乗り換えは追加料金なし。地下鉄を出てから30分以内（21時～翌7時は1時間）にバスに乗ると乗継割引になります。バスを降りるときもカードのタッチを忘れずに。",
          },
        ],
      },
      {
        heading: {
          ko: "기후동행카드 단기권, 살 만할까?",
          en: "Is the Climate Card tourist pass worth it?",
          zh: "气候同行卡短期券划算吗？",
          ja: "気候同行カード短期券はお得？",
        },
        paragraphs: [
          {
            ko: "기후동행카드는 서울 지하철과 서울 버스를 정해진 기간 동안 무제한으로 타는 서울시 정기권이에요. 여행자용으로 1·2·3·5·7일권이 있어요. 하루에 지하철을 서너 번 이상 탄다면 이득이에요.",
            en: "The Climate Card is Seoul's unlimited pass for the subway and city buses. Visitors can buy 1, 2, 3, 5 or 7-day versions. If you'll ride three or four times a day or more, it usually pays off.",
            zh: "气候同行卡是首尔市推出的无限次乘车券，可在有效期内不限次乘坐首尔地铁和首尔公交。面向游客有1、2、3、5、7日券。如果每天乘坐三四次以上，通常比较划算。",
            ja: "気候同行カードはソウルの地下鉄と市内バスが期間中乗り放題になるソウル市の定期券です。旅行者向けに1・2・3・5・7日券があります。1日に3～4回以上乗るなら元が取れることが多いです。",
          },
          {
            ko: "단, 서울 밖 구간이나 인천공항 이동 등 일부 노선과 구간은 쓸 수 없으니 일정에 맞는지 먼저 확인하세요.",
            en: "It isn't valid on some lines and sections outside Seoul, including trips to Incheon Airport, so check your plans against the coverage before you buy.",
            zh: "但首尔以外的部分线路和区间（包括往返仁川机场）不能使用，购买前请先确认是否符合行程。",
            ja: "ただしソウル市外の一部路線・区間（仁川空港への移動など）では使えないので、購入前に行程に合うか確認しましょう。",
          },
        ],
      },
    ],
    stations: ["서울역", "명동역", "홍대입구역", "강남역"],
    sources: [
      { label: "T-money", url: "https://www.t-money.co.kr" },
      { label: "Seoul Metro", url: "https://www.seoulmetro.co.kr" },
      { label: "Seoul Metropolitan Government", url: "https://english.seoul.go.kr" },
    ],
  },
  {
    slug: "how-to-ride-seoul-subway",
    emoji: "🚇",
    title: {
      ko: "서울 지하철 타는 법: 방향 찾기·환승·출구·운행 시간",
      en: "How to Ride the Seoul Subway: Directions, Transfers, Exits & Hours",
      zh: "首尔地铁乘坐方法：找方向、换乘、出口与运营时间",
      ja: "ソウル地下鉄の乗り方：方向・乗り換え・出口・運行時間",
    },
    description: {
      ko: "서울 지하철을 처음 타는 사람을 위한 단계별 안내. 방향 찾기, 개찰구, 환승, 출구 번호, 첫차·막차, 급행열차와 지하철 예절까지.",
      en: "A step-by-step guide to riding the Seoul subway: finding the right direction, the gates, transfers, numbered exits, first and last trains, express trains and etiquette.",
      zh: "首次乘坐首尔地铁的分步指南：找方向、过闸机、换乘、出口编号、首末班车、快车以及乘车礼仪。",
      ja: "初めてソウルの地下鉄に乗る人のためのステップガイド。方向の確認、改札、乗り換え、出口番号、始発・終電、急行、マナーまで。",
    },
    sections: [
      {
        heading: { ko: "1. 노선과 방향 확인", en: "1. Find your line and direction", zh: "1. 确认线路和方向", ja: "1. 路線と方向を確認" },
        paragraphs: [
          {
            ko: "노선마다 번호와 색이 있어요(2호선은 초록, 4호선은 하늘색). 승강장은 방향별로 나뉘고 '○○ 방면'이라고 종착역이나 다음 역이 적혀 있으니, 가려는 역 쪽 승강장인지 확인하고 들어가세요.",
            en: "Every line has a number and a colour (Line 2 is green, Line 4 sky blue). Platforms are split by direction and signed with the terminus or next station (“toward …”), so check you're entering the platform heading to your stop.",
            zh: "每条线路都有编号和颜色（2号线为绿色，4号线为天蓝色）。站台按方向区分，标有终点站或下一站（“往○○方向”），进站前请确认方向。",
            ja: "路線ごとに番号と色があります（2号線は緑、4号線は水色）。ホームは方向別に分かれ、終着駅や次の駅（「○○方面」）が書かれているので、目的地方向のホームか確認してから入りましょう。",
          },
          {
            ko: "2호선은 순환선이라 내선(시계 방향)과 외선(반시계 방향)이 있어요. 표지판의 다음 역 이름으로 방향을 고르면 헷갈리지 않아요.",
            en: "Line 2 is a loop with an inner (clockwise) and outer (anticlockwise) track. Pick the side by the next station's name on the sign and you can't go wrong.",
            zh: "2号线是环线，分内环（顺时针）和外环（逆时针）。根据指示牌上的下一站名称选择方向就不会搞错。",
            ja: "2号線は環状線で、内回り（時計回り）と外回り（反時計回り）があります。案内板の次の駅名で方向を選べば迷いません。",
          },
        ],
      },
      {
        heading: { ko: "2. 개찰구와 열차 안", en: "2. Through the gates and on the train", zh: "2. 过闸机与车厢内", ja: "2. 改札と車内" },
        paragraphs: [
          {
            ko: "개찰구 단말기에 카드를 찍고 들어가요. 한 장으로 여러 명이 탈 수 없으니 1인 1카드예요. 열차 안에서는 한국어·영어(노선에 따라 중국어·일본어도) 안내 방송과 화면으로 다음 역을 알려줘요.",
            en: "Tap your card on the gate reader to enter; one card per person, as cards can't be shared on the same trip. On board, announcements in Korean and English (plus Chinese and Japanese on some lines) and screens show the next stop.",
            zh: "在闸机读卡器上刷卡进站，一人一卡，同一行程不能多人共用。车厢内有韩语、英语（部分线路还有中文、日语）广播和屏幕提示下一站。",
            ja: "改札の読み取り機にカードをタッチして入ります。1枚を複数人で使うことはできないので1人1枚です。車内では韓国語・英語（路線により中国語・日本語も）の放送と画面で次の駅を案内します。",
          },
          {
            ko: "칸 양 끝의 노약자석과 분홍색 임산부석은 비워 두는 게 예절이에요. 통화는 짧고 조용히, 큰 짐은 문 앞을 막지 않게 두세요.",
            en: "Leave the priority seats at each end of the car and the pink seats for pregnant women empty. Keep phone calls short and quiet, and don't park big luggage in the doorway.",
            zh: "车厢两端的老弱病残座和粉色孕妇专座请留空。通话简短安静，大件行李不要挡住车门。",
            ja: "車両両端の優先席とピンク色の妊婦席は空けておくのがマナー。通話は短く静かに、大きな荷物はドアの前をふさがないように置きましょう。",
          },
        ],
      },
      {
        heading: { ko: "3. 환승", en: "3. Changing lines", zh: "3. 换乘", ja: "3. 乗り換え" },
        paragraphs: [
          {
            ko: "환승역에서는 갈아탈 노선 색과 번호가 적힌 표지판을 따라가면 돼요. 큰 역은 환승 통로가 길어서 5~10분 걸리기도 해요. 각 역 페이지의 '빠른환승' 칸 정보를 보고 그 칸에 타면 계단과 통로를 가장 짧게 지나요.",
            en: "At transfer stations, follow the signs in the colour and number of the line you want. Big stations can mean a 5–10 minute walk. Ride in the car and door listed under “Fastest transfer doors” on each station page and you'll come out right by the stairs to your next line.",
            zh: "在换乘站，按照目标线路颜色和编号的指示牌走即可。大站换乘通道较长，可能需要5～10分钟。乘坐各车站页面“最快换乘车门”中列出的车厢和车门，下车就在换乘楼梯旁。",
            ja: "乗り換え駅では、乗りたい路線の色と番号の案内に従います。大きな駅では5～10分歩くことも。各駅ページの「最速乗り換えドア」の号車・ドアに乗ると、降りてすぐ乗り換え階段に着きます。",
          },
          {
            ko: "9호선, 경의중앙선 등 일부 노선에는 '급행' 열차가 있어 작은 역을 지나쳐요. 열차 앞 표시와 승강장 안내판에서 급행인지 일반인지 확인하세요.",
            en: "Some lines, such as Line 9 and the Gyeongui–Jungang Line, run express trains (급행) that skip smaller stations. Check the sign on the train and the platform display before you board.",
            zh: "9号线、京义中央线等部分线路有快车（급행），会跳过小站。上车前请确认列车和站台显示屏上标示的是快车还是普通车。",
            ja: "9号線や京義・中央線など一部の路線には小さな駅を通過する急行（급행）があります。乗る前に車両の表示とホームの案内板で急行か各停か確認しましょう。",
          },
        ],
      },
      {
        heading: { ko: "4. 출구 찾기", en: "4. Picking the right exit", zh: "4. 找对出口", ja: "4. 出口を選ぶ" },
        paragraphs: [
          {
            ko: "서울 지하철역 출구에는 번호가 있고, 큰 역은 10개가 넘어요. 개찰구를 나오기 전에 목적지에서 가까운 출구 번호를 확인하세요. 잘못 나오면 큰길을 건너느라 한참 돌아가야 할 수 있어요.",
            en: "Exits are numbered and big stations have more than ten. Check which exit is closest to where you're going before you leave the gates; the wrong one can leave you on the far side of a wide road.",
            zh: "首尔地铁站出口都有编号，大站出口超过10个。出闸前请先确认离目的地最近的出口编号，走错出口可能要绕很远过大马路。",
            ja: "ソウルの地下鉄駅の出口には番号があり、大きな駅では10か所以上あります。改札を出る前に目的地に近い出口番号を確認しましょう。間違えると大通りを渡るのに大回りすることも。",
          },
          {
            ko: "한국에서는 네이버 지도와 카카오맵이 출구 번호와 도보 길 안내가 가장 정확해요. 구글 지도는 대중교통 경로는 되지만 도보 안내가 부족해요. 각 역 페이지에서도 출구를 눌러 지도에서 위치를 볼 수 있어요.",
            en: "In Korea, Naver Map and KakaoMap give the most accurate exit numbers and walking directions; Google Maps handles transit routes but its walking directions are limited. On each station page you can also tap an exit to see it on the map.",
            zh: "在韩国，Naver 地图和 KakaoMap 的出口编号和步行导航最准确；Google 地图可以查公共交通路线，但步行导航有限。在各车站页面点击出口，也能在地图上查看位置。",
            ja: "韓国ではNAVER地図とカカオマップが出口番号と徒歩案内に最も正確です。Googleマップは乗換案内はできますが徒歩案内が限られます。各駅ページでも出口をタップすると地図で位置を確認できます。",
          },
        ],
      },
      {
        heading: { ko: "5. 운행 시간과 막차", en: "5. Operating hours and last trains", zh: "5. 运营时间与末班车", ja: "5. 運行時間と終電" },
        paragraphs: [
          {
            ko: "대부분의 노선은 새벽 5시 30분 무렵부터 자정 무렵까지 다녀요. 막차 시간은 노선과 방향, 역마다 다르고 주말·공휴일에는 배차 간격이 길어져요. 늦게 움직인다면 지도 앱에서 막차 시간을 꼭 확인하세요.",
            en: "Most lines run from about 5:30 am until around midnight. Last trains differ by line, direction and station, and weekends and holidays have fewer trains, so check the last train in a map app if you'll be out late.",
            zh: "大多数线路的运营时间约为早上5点半到午夜前后。末班车时间因线路、方向和车站而异，周末和节假日班次较少。晚上出行请务必在地图应用中确认末班车时间。",
            ja: "ほとんどの路線は朝5時半ごろから深夜0時ごろまで運行しています。終電は路線・方向・駅によって異なり、週末・祝日は本数が減るので、夜遅くなるときは地図アプリで終電を必ず確認しましょう。",
          },
          {
            ko: "출근(오전 7~9시)·퇴근(오후 6~8시) 시간에는 아주 붐벼요. 큰 캐리어가 있다면 이 시간을 피하는 게 좋아요.",
            en: "Rush hours (7–9 am and 6–8 pm) are very crowded; avoid them if you're travelling with big suitcases.",
            zh: "早高峰（7～9点）和晚高峰（18～20点）非常拥挤，携带大行李箱时最好避开。",
            ja: "朝（7～9時）と夕方（18～20時）のラッシュはとても混みます。大きなスーツケースがある場合は避けるのがおすすめです。",
          },
        ],
      },
    ],
    stations: ["서울역", "시청역", "강남역", "홍대입구역", "명동역", "동대문역사문화공원역"],
    sources: [
      { label: "Seoul Metro", url: "https://www.seoulmetro.co.kr" },
      { label: "VisitKorea", url: "https://english.visitkorea.or.kr" },
    ],
  },
  {
    slug: "luggage-lockers-elevators",
    emoji: "🧳",
    title: {
      ko: "캐리어 들고 서울 지하철 타기: 물품보관함·T-Luggage·엘리베이터",
      en: "Seoul Subway with Luggage: Coin Lockers, T-Luggage Desks & Elevators",
      zh: "带行李乘坐首尔地铁：储物柜、T-Luggage 柜台与电梯",
      ja: "荷物を持ってソウル地下鉄に乗る：コインロッカー・T-Luggage・エレベーター",
    },
    description: {
      ko: "서울 지하철역 물품보관함(T-Locker) 크기와 요금, 유인 짐 보관소 T-Luggage 위치, 엘리베이터 출구 찾는 법까지 짐 많은 여행자를 위한 가이드.",
      en: "Store luggage in Seoul subway stations: T-Locker sizes and prices, staffed T-Luggage desks, and how to find the exit with a street-to-platform elevator.",
      zh: "首尔地铁站寄存行李指南：T-Locker 储物柜尺寸与价格、人工 T-Luggage 柜台位置，以及如何找到有直达电梯的出口。",
      ja: "ソウルの地下鉄駅で荷物を預ける方法：T-Lockerのサイズと料金、有人のT-Luggageカウンター、地上とホームを結ぶエレベーター出口の探し方。",
    },
    sections: [
      {
        heading: {
          ko: "역 물품보관함(T-Locker)",
          en: "Station coin lockers (T-Locker)",
          zh: "车站储物柜（T-Locker）",
          ja: "駅のコインロッカー（T-Locker）",
        },
        paragraphs: [
          {
            ko: "서울교통공사 역의 보관함은 대부분 터치스크린 'T-Locker'예요. 영어 화면에서 크기를 고르고 카드로 결제하면 비밀번호나 QR로 열 수 있어요. 기본 4시간 요금에 시간이 지나면 추가 요금이 붙어요.",
            en: "Most lockers in Seoul Metro stations are touchscreen “T-Lockers”. Pick a size on the English screen, pay by card and open it later with a PIN or QR code. The base price covers 4 hours, with extra charged after that.",
            zh: "首尔交通公社车站的储物柜大多是触屏式“T-Locker”。在英文界面选择尺寸并刷卡支付，之后用密码或二维码开柜。基本费用包含4小时，超时另行收费。",
            ja: "ソウル交通公社の駅のロッカーはほとんどがタッチパネル式の「T-Locker」です。英語画面でサイズを選んでカードで支払い、暗証番号かQRコードで開けます。基本料金は4時間分で、超過すると追加料金がかかります。",
          },
          {
            ko: "서울역, 명동, 홍대입구처럼 붐비는 역은 대형 칸이 먼저 차요. 각 역 페이지에서 보관함이 개찰구 안인지 밖인지, 몇 칸인지 미리 확인하세요.",
            en: "Large lockers fill up first at busy stations like Seoul Station, Myeongdong and Hongik University. Each station page shows whether its lockers are inside or outside the gates and how many there are.",
            zh: "首尔站、明洞、弘大入口等热门车站的大号柜最先被占满。各车站页面会显示储物柜在检票口内还是外，以及大约有多少格。",
            ja: "ソウル駅、明洞、弘大入口など混雑する駅では大型が先に埋まります。各駅ページで、ロッカーが改札内か改札外か、何個あるかを事前に確認しましょう。",
          },
        ],
      },
      {
        heading: {
          ko: "유인 짐 보관소 T-Luggage",
          en: "Staffed T-Luggage desks",
          zh: "人工行李寄存 T-Luggage",
          ja: "有人の荷物預かり T-Luggage",
        },
        paragraphs: [
          {
            ko: "보관함이 꽉 찼거나 짐이 너무 크면 직원이 맡아 주는 T-Luggage 데스크를 이용하세요. 숙소나 공항으로 짐을 보내 주는 배송 서비스도 있어서, 체크아웃 후 짐 없이 마지막 날을 돌아다닐 수 있어요.",
            en: "If lockers are full or your bag is too big, hand it to a staffed T-Luggage desk. They can also deliver bags to your hotel or the airport, so you can spend your last day bag-free after checking out.",
            zh: "如果储物柜满了或行李太大，可以交给有工作人员的 T-Luggage 柜台寄存。还提供送往酒店或机场的配送服务，退房后最后一天也能轻松游玩。",
            ja: "ロッカーが満杯のときや荷物が大きすぎるときは、スタッフが預かってくれるT-Luggageカウンターへ。ホテルや空港への配送サービスもあるので、チェックアウト後の最終日も身軽に観光できます。",
          },
        ],
      },
      {
        heading: {
          ko: "엘리베이터 출구 찾기",
          en: "Finding the elevator exit",
          zh: "找到有电梯的出口",
          ja: "エレベーター出口を探す",
        },
        paragraphs: [
          {
            ko: "모든 출구에 엘리베이터가 있는 건 아니에요. 각 역 페이지의 '엘리베이터' 항목에서 지상부터 승강장까지 엘리베이터로만 이어지는 출구를 확인하세요. 환승 통로에는 계단이나 에스컬레이터만 있는 곳도 있어요.",
            en: "Not every exit has an elevator. The “Step-free access” section on each station page tells you which exit links the street to the platform by elevator. Some transfer passages only have stairs or escalators.",
            zh: "并不是每个出口都有电梯。各车站页面的“无障碍通道（电梯）”部分会说明哪个出口可以全程乘电梯往返地面与站台。部分换乘通道只有楼梯或扶梯。",
            ja: "すべての出口にエレベーターがあるわけではありません。各駅ページの「エレベーター」欄で、地上からホームまでエレベーターだけで行ける出口を確認しましょう。乗り換え通路には階段やエスカレーターしかない場所もあります。",
          },
          {
            ko: "큰 캐리어는 출퇴근 시간을 피하고, 휠체어·유모차 표시가 있는 칸에 타면 공간이 넉넉해요.",
            en: "Avoid rush hours with big suitcases, and board the cars marked with wheelchair and stroller symbols for more space.",
            zh: "带大行李箱请避开高峰时段，乘坐标有轮椅和婴儿车标志的车厢，空间更宽敞。",
            ja: "大きなスーツケースはラッシュ時を避け、車いす・ベビーカーのマークがある車両に乗るとスペースに余裕があります。",
          },
        ],
      },
    ],
    extra: "luggage",
    stations: ["서울역", "명동역", "홍대입구역", "잠실역", "김포공항역", "종로3가역"],
    sources: [
      { label: "T-Locker", url: "https://tlocker.otpin.co/?lang=en" },
      { label: "T-Luggage", url: "https://www.tluggage.co.kr/eng" },
      { label: "Seoul Metro", url: "https://www.seoulmetro.co.kr" },
    ],
  },
];

export function guideArticle(slug: string) {
  return GUIDE_ARTICLES.find((article) => article.slug === slug) ?? null;
}
