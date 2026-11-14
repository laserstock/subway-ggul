import type { Localized } from "./i18n";

export type LocalNoteKind = "route" | "luggage" | "access" | "timing";

export type LocalNote = { kind: LocalNoteKind; text: Localized };

export type StationLocalGuide = {
  /** Set when two stations share the Korean name (신촌역 on Line 2 and on the Gyeongui–Jungang Line). */
  line?: string;
  /** Why travelers come here; opens the station overview right after the line facts. */
  intro: Localized;
  notes: LocalNote[];
};

/** When the notes below were last reviewed against official operator and venue information. */
export const LOCAL_GUIDES_CHECKED = "2026-11-14";

const AREX_TICKETS: LocalNote = {
  kind: "route",
  text: {
    ko: "공항철도 직통열차는 매표소나 발매기에서 별도 승차권을 사야 하고, 일반열차는 교통카드로 탈 수 있어 더 저렴하지만 시간이 더 걸려요.",
    en: "AREX express trains need a separate ticket from the counter or machines; all-stop trains take T-money and cost less, but take longer.",
    zh: "机场铁路直达列车需在售票处或售票机另购车票；普通列车可直接刷T-money，票价更便宜，但用时更长。",
    ja: "空港鉄道の直通列車は窓口か券売機で別途乗車券が必要です。一般列車はT-moneyで乗れて安いですが、時間は長めです。",
  },
};

/**
 * Hand-written local know-how for the stations visitors use most, keyed by Korean station name with 역.
 * Exit numbers stay out of these notes: the overview takes them from the planner spots and exit tables.
 */
export const STATION_LOCAL_GUIDES: Record<string, StationLocalGuide> = {
  서울역: {
    intro: {
      ko: "서울역은 KTX 고속열차가 출발하는 서울의 대표 철도역이자, 인천·김포공항으로 가는 공항철도(AREX)의 출발역이에요.",
      en: "Seoul Station is the city's main rail gateway: KTX high-speed trains leave from the station building, and AREX trains start here for Incheon and Gimpo airports.",
      zh: "首尔站是首尔的铁路门户：KTX高铁从这里发车，前往仁川和金浦机场的机场铁路（AREX）也从这里始发。",
      ja: "ソウル駅はKTX高速列車が発着するソウルの玄関口で、仁川・金浦空港へ向かう空港鉄道（AREX）の始発駅でもあります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "1·4호선에서 공항철도 승강장까지는 지하 깊이 내려가야 해서, 짐이 있다면 환승에 10~15분 정도 여유를 두세요.",
          en: "The AREX platforms are deep underground, so allow 10–15 minutes to get there from Line 1 or 4, more with luggage.",
          zh: "机场铁路站台位于地下深处，从1号线或4号线过去请预留10～15分钟，带行李时需要更久。",
          ja: "空港鉄道のホームは地下深くにあるため、1・4号線からは10～15分ほど見ておきましょう。荷物があればさらに余裕を。",
        },
      },
      {
        kind: "luggage",
        text: {
          ko: "공항철도 서울역 안 도심공항터미널에서는 일부 항공사에 한해 미리 체크인하고 짐을 부칠 수 있어요. 이용 전에 항공사를 확인하세요.",
          en: "The City Airport Terminal inside AREX Seoul Station lets passengers of selected airlines check in and drop bags before riding to the airport; check your airline first.",
          zh: "机场铁路首尔站内的城市机场航站楼可为部分航空公司的旅客提前办理值机和托运，请先确认您的航空公司。",
          ja: "空港鉄道ソウル駅構内の都心空港ターミナルでは、一部の航空会社に限り事前チェックインと手荷物預けができます。利用前に航空会社をご確認ください。",
        },
      },
    ],
  },
  명동역: {
    intro: {
      ko: "명동역은 K-뷰티 매장과 환전소, 저녁 길거리 음식 노점이 모인 서울 최대 쇼핑 거리의 바로 앞이에요.",
      en: "Myeongdong Station drops you straight into Seoul's busiest shopping district, packed with K-beauty stores, money changers and evening street-food stalls.",
      zh: "明洞站直通首尔最热闹的购物区，韩妆店、换钱所和傍晚的街头小吃摊都集中在这里。",
      ja: "明洞駅を出るとすぐ、Kビューティーの店や両替所、夕方からの屋台が集まるソウル随一のショッピング街です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "노점은 늦은 오후부터 문을 열고 저녁이면 거리가 매우 붐벼요. 이 시간대에는 캐리어보다 백팩이 훨씬 편해요.",
          en: "Street-food stalls open from late afternoon and the streets are packed in the evening; a backpack is far easier than a rolling suitcase then.",
          zh: "小吃摊从傍晚开始营业，晚上街道非常拥挤，这时背双肩包比拖行李箱方便得多。",
          ja: "屋台は夕方から営業し、夜は通りがとても混み合います。この時間帯はスーツケースよりリュックが断然ラクです。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "남산 케이블카 탑승장까지는 오르막길이 이어져요. 서울역은 4호선으로 두 정거장이라 공항철도와 연결하기 쉬워요.",
          en: "The walk to the Namsan cable car is uphill all the way. Seoul Station is two stops away on Line 4, an easy link to AREX.",
          zh: "去南山缆车站一路都是上坡。乘4号线两站即到首尔站，方便换乘机场铁路。",
          ja: "南山ケーブルカー乗り場までは上り坂が続きます。ソウル駅は4号線で2駅なので、空港鉄道への乗り継ぎも簡単です。",
        },
      },
    ],
  },
  홍대입구역: {
    intro: {
      ko: "홍대입구역은 인디 패션숍과 라이브 클럽, 거리 버스킹으로 유명한 홍대 상권의 관문이고, 공항철도도 정차해요.",
      en: "Hongik University Station is the gateway to Hongdae's indie shops, live-music clubs and street busking, and the airport railroad stops here too.",
      zh: "弘大入口站是弘大商圈的门户，以独立时装店、现场音乐俱乐部和街头表演闻名，机场铁路也在此停靠。",
      ja: "弘大入口駅はインディーズ系ショップやライブハウス、路上ライブで知られる弘大エリアの玄関口で、空港鉄道も停車します。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "공항철도 일반열차가 이곳에 서기 때문에 서울역을 거치지 않고 인천공항까지 한 번에 갈 수 있어요.",
          en: "AREX all-stop trains call here, so you can ride straight to Incheon Airport without going through Seoul Station.",
          zh: "机场铁路普通列车在此停靠，无需经过首尔站即可直达仁川机场。",
          ja: "空港鉄道の一般列車が停まるので、ソウル駅を経由せずに仁川空港まで乗り換えなしで行けます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "버스킹은 주말 저녁에 가장 활발하고, 쇼핑은 사람이 적은 평일 오후가 편해요.",
          en: "Buskers are out in force on weekend evenings; weekday afternoons are calmer for shopping.",
          zh: "街头表演在周末傍晚最热闹，想安静购物可以选工作日下午。",
          ja: "路上ライブは週末の夕方がいちばん盛り上がり、買い物なら人の少ない平日の午後がおすすめです。",
        },
      },
    ],
  },
  강남역: {
    intro: {
      ko: "강남역은 강남대로를 따라 오피스 빌딩과 K-뷰티 매장, 음식점이 늘어선 강남 업무·쇼핑 지구의 중심이에요.",
      en: "Gangnam Station is the heart of the Gangnam business and shopping district, ringed by office towers, K-beauty stores and restaurants along Gangnam-daero.",
      zh: "江南站是江南商务和购物区的中心，江南大路两旁写字楼、韩妆店和餐厅林立。",
      ja: "江南駅は江南大路沿いにオフィスビルやKビューティーの店、飲食店が並ぶ江南ビジネス・ショッピング街の中心です。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "여러 출구가 강남역 지하상가로 이어져 있어 비 오는 날이나 한여름에도 지하로 이동할 수 있어요.",
          en: "An underground shopping arcade links many of the exits, handy on rainy days or in the summer heat.",
          zh: "多个出口由江南站地下商街相连，下雨天或盛夏都可以走地下。",
          ja: "多くの出口が江南駅地下街でつながっているので、雨の日や真夏も地下を移動できます。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "신분당선은 일반 지하철 요금에 별도 운임이 조금 더 붙어요.",
          en: "The Shinbundang Line adds a small surcharge on top of the regular subway fare.",
          zh: "新盆唐线在普通地铁票价之外会另加少量费用。",
          ja: "新盆唐線は通常の地下鉄運賃に少額の別料金が加算されます。",
        },
      },
    ],
  },
  성수역: {
    intro: {
      ko: "성수역은 옛 공장과 창고가 카페, 팝업스토어, 패션 브랜드 매장으로 바뀐 성수동의 중심역이에요.",
      en: "Seongsu Station serves Seongsu-dong, where former factories and warehouses now house cafés, pop-up stores and fashion brands.",
      zh: "圣水站位于圣水洞，这里的旧工厂和仓库已变身为咖啡馆、快闪店和时尚品牌店。",
      ja: "聖水駅のある聖水洞は、かつての工場や倉庫がカフェやポップアップストア、ファッションブランドの店に生まれ変わったエリアです。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "인기 팝업스토어는 주말에 대기 줄이 길어요. 평일 오전에 가면 훨씬 여유로워요.",
          en: "Popular pop-up stores often have long queues at weekends; weekday mornings are much quieter.",
          zh: "热门快闪店周末常常大排长龙，工作日上午去会轻松很多。",
          ja: "人気のポップアップストアは週末に長い行列ができがちです。平日の午前ならかなりゆったり回れます。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "서울숲까지는 걸어서 15~20분 정도예요. 공원 쪽에서 시작한다면 수인분당선 서울숲역이 더 가까워요.",
          en: "Seoul Forest is about a 15–20 minute walk away; if you start at the park, Seoul Forest Station on the Suin–Bundang Line is closer.",
          zh: "步行到首尔林约15～20分钟；如果从公园出发，水仁·盆唐线的首尔林站更近。",
          ja: "ソウルの森までは徒歩15～20分ほど。公園から回るなら水仁・盆唐線のソウルの森駅のほうが近いです。",
        },
      },
    ],
  },
  경복궁역: {
    intro: {
      ko: "경복궁역은 조선 5대 궁궐 중 가장 큰 경복궁 바로 옆에 있고, 서쪽으로는 한옥 골목이 이어지는 서촌이 있어요.",
      en: "Gyeongbokgung Station sits right next to Gyeongbokgung, the largest of Seoul's five Joseon-era palaces, with the hanok lanes of Seochon just to the west.",
      zh: "景福宫站紧邻朝鲜王朝五大宫殿中规模最大的景福宫，西侧就是韩屋小巷交错的西村。",
      ja: "景福宮駅は朝鮮王朝の五大宮殿で最大の景福宮のすぐそばにあり、西側には韓屋の路地が続く西村があります。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "경복궁은 매주 화요일 휴궁이고, 한복을 입으면 무료로 입장할 수 있어요.",
          en: "Gyeongbokgung is closed on Tuesdays, and visitors wearing hanbok get in free.",
          zh: "景福宫每周二闭馆，穿韩服可免费入场。",
          ja: "景福宮は毎週火曜日が休宮日で、韓服を着ていれば無料で入場できます。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "궁궐 정문 쪽 광화문광장까지는 걸어서 갈 수 있어서 경복궁과 광화문을 한 번에 둘러보기 좋아요.",
          en: "Gwanghwamun Square, in front of the palace's main gate, is within walking distance, so the palace and the square pair easily.",
          zh: "步行即可到达宫殿正门前的光化门广场，景福宫和光化门可以一次逛完。",
          ja: "宮殿の正門前にある光化門広場まで歩いて行けるので、景福宮と光化門をまとめて回れます。",
        },
      },
    ],
  },
  안국역: {
    intro: {
      ko: "안국역은 북촌한옥마을과 전통 공예·찻집 거리인 인사동, 창덕궁으로 가는 역이에요.",
      en: "Anguk Station is the stop for Bukchon Hanok Village, Insadong's craft and tea shops, and Changdeokgung Palace.",
      zh: "安国站是前往北村韩屋村、以传统工艺和茶馆闻名的仁寺洞以及昌德宫的车站。",
      ja: "安国駅は北村韓屋村、伝統工芸や茶房が並ぶ仁寺洞、昌徳宮への最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "북촌 일부 구역은 주민 거주지라 관광객 방문 시간이 오전 10시~오후 5시로 제한돼요. 골목에서는 조용히 다녀 주세요.",
          en: "Parts of Bukchon are residential and limit tourist visits to 10:00–17:00; keep your voice down in the alleys.",
          zh: "北村部分区域是居民区，游客参观时间限于10:00～17:00，在小巷里请保持安静。",
          ja: "北村の一部は住宅地のため、観光客の訪問は10時～17時に制限されています。路地では静かに歩きましょう。",
        },
      },
      {
        kind: "access",
        text: {
          ko: "북촌 골목은 경사가 가파르고 계단이 많아요. 편한 신발을 신고, 짐은 먼저 보관함에 맡기는 게 좋아요.",
          en: "Bukchon's lanes are steep with plenty of steps: wear comfortable shoes and leave luggage in a locker first.",
          zh: "北村的小巷坡陡、台阶多，建议穿舒适的鞋子，并先把行李寄存起来。",
          ja: "北村の路地は坂が急で階段も多いので、歩きやすい靴で行き、荷物は先にロッカーに預けましょう。",
        },
      },
    ],
  },
  신촌역: {
    line: "2호선",
    intro: {
      ko: "2호선 신촌역은 연세대학교 옆 대학가로, 저렴한 음식점과 카페, 술집이 많은 활기찬 동네예요.",
      en: "Sinchon Station on Line 2 is a lively student area next to Yonsei University, full of affordable restaurants, cafés and bars.",
      zh: "2号线新村站位于延世大学旁的大学街，平价餐厅、咖啡馆和酒吧众多，十分热闹。",
      ja: "2号線の新村駅は延世大学のそばの学生街で、手頃な飲食店やカフェ、バーが集まるにぎやかなエリアです。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "경의중앙선 신촌역은 몇 블록 떨어진 별개의 역이고 이 역과 연결되지 않아요. 경로에 어느 신촌역이 나오는지 꼭 확인하세요.",
          en: "Sinchon Station on the Gyeongui–Jungang Line is a separate station a few blocks away, not connected to this one; check which Sinchon your route uses.",
          zh: "京义·中央线的新村站是几个街区外的另一座车站，与本站不相连，请确认路线中是哪一个新村站。",
          ja: "京義・中央線の新村駅は数ブロック離れた別の駅で、この駅とはつながっていません。ルート上のどちらの新村駅かを必ず確認しましょう。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "이화여대는 2호선으로 한 정거장 떨어진 이대역에서 내리면 가까워요.",
          en: "For Ewha Womans University, ride one stop on Line 2 to Ewha Womans Univ. Station.",
          zh: "去梨花女子大学，乘2号线坐一站到梨大站即可。",
          ja: "梨花女子大学へは2号線で1駅の梨大駅が最寄りです。",
        },
      },
    ],
  },
  압구정로데오역: {
    intro: {
      ko: "압구정로데오역은 갤러리아백화점과 로데오거리의 디자이너 부티크, 카페가 모인 서울의 대표 고급 쇼핑가에 있어요.",
      en: "Apgujeong Rodeo Station serves the Galleria department store and the designer boutiques and cafés of Rodeo Street, one of Seoul's upscale shopping areas.",
      zh: "狎鸥亭罗德奥站位于首尔代表性的高端购物区，周边有Galleria百货和罗德奥街的设计师精品店与咖啡馆。",
      ja: "狎鴎亭ロデオ駅はギャラリア百貨店やロデオ通りのデザイナーズブティック、カフェが集まるソウル屈指の高級ショッピング街にあります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "수인분당선 역이라 3호선 압구정역과는 약 1km 떨어진 다른 역이에요. 길찾기에서 역 이름을 헷갈리지 마세요.",
          en: "This is a Suin–Bundang Line station, separate from Apgujeong Station on Line 3 about 1 km away; don't mix the two up in a route search.",
          zh: "本站属于水仁·盆唐线，与约1公里外的3号线狎鸥亭站是两个不同的车站，搜索路线时别弄混。",
          ja: "水仁・盆唐線の駅で、約1km離れた3号線の狎鴎亭駅とは別の駅です。ルート検索で取り違えないようにしましょう。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "로데오거리 골목의 부티크와 카페는 대체로 오전 늦게 문을 열어요. 오후부터 둘러보는 게 좋아요.",
          en: "Boutiques and cafés in the Rodeo Street lanes mostly open late in the morning, so the afternoon is the best time to browse.",
          zh: "罗德奥街小巷里的精品店和咖啡馆大多上午较晚才开门，下午去逛最合适。",
          ja: "ロデオ通りの路地のブティックやカフェは開店が遅めの店が多いので、午後から回るのがおすすめです。",
        },
      },
    ],
  },
  잠실역: {
    intro: {
      ko: "잠실역은 롯데월드타워와 롯데월드몰, 롯데월드 테마파크로 가는 역이고, 바로 옆에 석촌호수가 있어요.",
      en: "Jamsil Station is the stop for Lotte World Tower, Lotte World Mall and the Lotte World theme park, with Seokchon Lake right beside them.",
      zh: "蚕室站是前往乐天世界塔、乐天世界购物中心和乐天世界主题乐园的车站，旁边就是石村湖。",
      ja: "蚕室駅はロッテワールドタワー、ロッテワールドモール、テーマパークのロッテワールドへの最寄り駅で、すぐ隣に石村湖があります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "롯데월드타워·몰과 롯데월드 어드벤처는 역과 지하로 연결돼 있어서 날씨가 궂어도 밖에 나가지 않고 갈 수 있어요.",
          en: "The tower, the mall and Lotte World Adventure connect to the station underground, so you can stay indoors in bad weather.",
          zh: "乐天世界塔、购物中心和乐天世界探险乐园都与车站地下相连，天气不好也不用出站。",
          ja: "タワー、モール、ロッテワールドアドベンチャーは駅と地下でつながっているので、悪天候でも外に出ずに行けます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "주말과 방학 기간에는 몰과 테마파크 주변이 매우 붐벼요. 일찍 도착하는 게 좋아요.",
          en: "Weekends and school holidays bring big crowds to the mall and theme park; arrive early.",
          zh: "周末和寒暑假期间，购物中心和主题乐园一带人非常多，建议早点到。",
          ja: "週末や学校の休み期間はモールやテーマパーク周辺がとても混むので、早めの到着がおすすめです。",
        },
      },
    ],
  },
  이태원역: {
    intro: {
      ko: "이태원역은 세계 각국 음식점과 빈티지숍, 바가 늘어선 서울에서 가장 국제적인 거리, 이태원로에 있어요.",
      en: "Itaewon Station sits on Itaewon-ro, Seoul's most international street, lined with restaurants from around the world, vintage shops and bars.",
      zh: "梨泰院站位于首尔最国际化的街道梨泰院路，各国餐厅、古着店和酒吧林立。",
      ja: "梨泰院駅はソウルで最も国際色豊かな通り、梨泰院路にあり、世界各国の料理店や古着屋、バーが並びます。",
    },
    notes: [
      {
        kind: "access",
        text: {
          ko: "큰길 양옆 골목은 경사가 가팔라요. 언덕 위 음식점으로 간다면 오르막을 감안하세요.",
          en: "The side streets climb steeply on both sides of the main road, so expect hills if you are heading to restaurants up the lanes.",
          zh: "主街两侧的小巷坡度很陡，去坡上的餐厅要做好爬坡的准备。",
          ja: "大通りの両側の路地は急な坂なので、坂の上の店へ行くなら上り坂を覚悟しておきましょう。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "6호선으로 한 정거장 떨어진 한강진역이 한남동 부티크와 리움미술관에 더 가까워요.",
          en: "Hangangjin Station, one stop away on Line 6, is closer to Hannam-dong's boutiques and the Leeum Museum of Art.",
          zh: "乘6号线一站的汉江镇站离汉南洞的精品店和Leeum美术馆更近。",
          ja: "6号線で1駅の漢江鎮駅のほうが、漢南洞のブティックやリウム美術館に近いです。",
        },
      },
    ],
  },
  인천공항1터미널역: {
    intro: {
      ko: "인천공항1터미널역은 제1여객터미널과 연결된 교통센터 안에 있어요. 여행객이 서울로 들어오는 첫 관문이에요.",
      en: "Incheon Airport Terminal 1 Station is inside the Transportation Center joined to Terminal 1, the first stop for many travelers arriving in Korea.",
      zh: "仁川机场1号航站楼站位于与第一航站楼相连的交通中心内，是许多旅客抵达韩国后的第一站。",
      ja: "仁川空港1ターミナル駅は第1旅客ターミナルとつながる交通センターの中にあり、多くの旅行者にとって韓国での最初の駅です。",
    },
    notes: [
      AREX_TICKETS,
      {
        kind: "route",
        text: {
          ko: "제2여객터미널은 공항철도로 다음 역(종점)이에요. 타기 전에 항공사가 어느 터미널을 쓰는지 확인하세요.",
          en: "Terminal 2 is the next and last stop on AREX; check which terminal your airline uses before you ride.",
          zh: "第二航站楼是机场铁路的下一站（终点站），乘车前请确认您的航空公司在哪个航站楼。",
          ja: "第2旅客ターミナルは空港鉄道の次の駅（終点）です。乗る前に航空会社のターミナルを確認しましょう。",
        },
      },
    ],
  },
  인천공항2터미널역: {
    intro: {
      ko: "인천공항2터미널역은 공항철도의 종점으로, 대한항공과 스카이팀 제휴 항공사가 쓰는 제2여객터미널과 연결돼요.",
      en: "Incheon Airport Terminal 2 Station is the end of the AREX line, linked to Terminal 2, home to Korean Air and its SkyTeam partners.",
      zh: "仁川机场2号航站楼站是机场铁路的终点站，连接大韩航空及天合联盟伙伴使用的第二航站楼。",
      ja: "仁川空港2ターミナル駅は空港鉄道の終点で、大韓航空とスカイチーム加盟各社が使う第2旅客ターミナルにつながっています。",
    },
    notes: [
      AREX_TICKETS,
      {
        kind: "route",
        text: {
          ko: "터미널을 잘못 왔다면 제1·제2여객터미널 사이를 오가는 무료 셔틀버스나 공항철도를 이용하세요.",
          en: "At the wrong terminal? A free shuttle bus and AREX both link Terminal 1 and Terminal 2.",
          zh: "如果走错了航站楼，可以乘坐往返第一、第二航站楼的免费接驳巴士或机场铁路。",
          ja: "ターミナルを間違えたら、第1・第2旅客ターミナル間の無料シャトルバスか空港鉄道で移動できます。",
        },
      },
    ],
  },
  김포공항역: {
    intro: {
      ko: "김포공항역은 다섯 개 노선이 만나는 역으로, 제주 등 국내선과 일본·중국·대만 단거리 국제선이 뜨는 김포공항과 연결돼요.",
      en: "Gimpo International Airport Station links five lines to Gimpo Airport, which handles domestic flights such as Jeju and short-haul routes to Japan, China and Taiwan.",
      zh: "金浦机场站有五条线路交汇，连接金浦机场；这里主要运营济州等国内航线以及飞往日本、中国和台湾的短途国际航线。",
      ja: "金浦空港駅は5路線が乗り入れる駅で、済州などの国内線と日本・中国・台湾への近距離国際線が発着する金浦空港につながっています。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "국내선과 국제선 청사는 별도 건물이에요. 지하 연결통로의 표지판을 따라 맞는 청사로 가세요.",
          en: "The domestic and international terminals are separate buildings; follow the signs through the underground walkway to the right one.",
          zh: "国内和国际航站楼是分开的两栋楼，请沿地下通道的指示牌前往正确的航站楼。",
          ja: "国内線と国際線のターミナルは別の建物です。地下連絡通路の案内表示に従って目的のターミナルへ向かいましょう。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "9호선 급행이 서서 여의도와 강남 방면으로 빠르게 갈 수 있어요.",
          en: "Line 9 express trains stop here, a quick way to Yeouido and Gangnam.",
          zh: "9号线快车在此停靠，去汝矣岛和江南方向很快。",
          ja: "9号線の急行が停車するので、汝矣島や江南方面へ速く移動できます。",
        },
      },
    ],
  },
  시청역: {
    intro: {
      ko: "시청역은 서울광장 아래에 있고, 덕수궁과 바로 붙어 있어 광화문·청계천까지 걸어서 둘러보기 좋은 출발점이에요.",
      en: "City Hall Station sits under Seoul Plaza beside Deoksugung Palace, a good starting point for walking to Gwanghwamun and Cheonggyecheon.",
      zh: "市厅站位于首尔广场地下，紧邻德寿宫，是步行前往光化门和清溪川的好起点。",
      ja: "市庁駅はソウル広場の地下にあり、徳寿宮のすぐ隣。光化門や清渓川へ歩いて回る起点にぴったりです。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "덕수궁은 월요일에 문을 닫아요. 궁 옆 덕수궁 돌담길은 가을 단풍철 산책 코스로 유명해요.",
          en: "Deoksugung is closed on Mondays; the stone-wall road beside it is a classic autumn walk.",
          zh: "德寿宫周一闭馆；宫旁的德寿宫石墙路是秋季散步的经典路线。",
          ja: "徳寿宮は月曜日が休館です。宮殿脇の石垣道は秋の散策の定番コースです。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "남대문시장과 명동은 모두 걸어서 15분 안팎이라 한 번에 묶어 다니기 좋아요.",
          en: "Namdaemun Market and Myeongdong are each roughly 15 minutes away on foot, easy to combine in one outing.",
          zh: "南大门市场和明洞步行都在15分钟左右，适合一起逛。",
          ja: "南大門市場と明洞はどちらも徒歩15分前後なので、まとめて回りやすいです。",
        },
      },
    ],
  },
  광화문역: {
    intro: {
      ko: "광화문역은 세종대왕상과 이순신 장군상이 있는 광화문광장 바로 아래에 있고, 광장 끝에는 경복궁 정문인 광화문이 있어요.",
      en: "Gwanghwamun Station opens onto Gwanghwamun Square, with the statues of King Sejong and Admiral Yi Sun-sin and Gyeongbokgung's main gate at its northern end.",
      zh: "光化门站就在光化门广场下方，广场上有世宗大王像和李舜臣将军像，北端便是景福宫正门光化门。",
      ja: "光化門駅は世宗大王像と李舜臣将軍像が立つ光化門広場の真下にあり、広場の北端には景福宮の正門・光化門があります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "광장을 따라 북쪽으로 10분 정도 걸으면 경복궁 정문이라, 열차를 갈아타지 않고 궁궐까지 갈 수 있어요.",
          en: "The palace gate is about a 10-minute walk north through the square, so you can visit both without changing trains.",
          zh: "沿广场向北步行约10分钟即到景福宫正门，不用换乘就能去宫殿。",
          ja: "広場を北へ10分ほど歩けば景福宮の正門なので、乗り換えなしで宮殿まで行けます。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "청계천 산책로는 청계광장에서 시작돼 걸어서 몇 분 거리예요. 종로와 을지로 쪽으로 걸어가기 좋아요.",
          en: "Cheonggyecheon's stream walk starts at Cheonggye Plaza a few minutes away, a pleasant route on foot toward Jongno and Euljiro.",
          zh: "清溪川步道从几分钟路程外的清溪广场开始，适合步行前往钟路和乙支路一带。",
          ja: "清渓川の遊歩道は徒歩数分の清渓広場から始まり、鍾路や乙支路方面への散歩にぴったりです。",
        },
      },
    ],
  },
  동대문역사문화공원역: {
    intro: {
      ko: "동대문역사문화공원역은 동대문디자인플라자(DDP)와 늦게까지 문을 여는 동대문 패션몰 상권으로 가는 역이에요.",
      en: "Dongdaemun History & Culture Park Station serves Dongdaemun Design Plaza (DDP) and the late-opening fashion malls of the Dongdaemun market area.",
      zh: "东大门历史文化公园站是前往东大门设计广场（DDP）和营业到深夜的东大门时装商圈的车站。",
      ja: "東大門歴史文化公園駅は東大門デザインプラザ（DDP）と、遅くまで営業する東大門のファッションビル街への最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "DDP는 밤에 조명이 켜지고 패션몰도 늦게까지 열어서 저녁 일정으로 들르기 좋아요.",
          en: "DDP is lit up after dark and many fashion malls stay open late, so this works well as an evening stop.",
          zh: "DDP夜晚亮灯，不少时装商场也营业到很晚，适合安排在晚上。",
          ja: "DDPは夜にライトアップされ、ファッションビルも遅くまで営業しているので、夜の予定に組み込みやすいです。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "흥인지문과 낙산 성곽길은 4호선으로 한 정거장인 동대문역이 더 가까워요.",
          en: "For Heunginjimun Gate and the Naksan city-wall trail, Dongdaemun Station, one stop away on Line 4, is closer.",
          zh: "去兴仁之门和骆山城郭路，乘4号线一站的东大门站更近。",
          ja: "興仁之門や駱山の城郭道へは、4号線で1駅の東大門駅のほうが近いです。",
        },
      },
    ],
  },
  을지로입구역: {
    intro: {
      ko: "을지로입구역은 명동 서쪽 끝에 있고, 롯데백화점 본점과 롯데면세점 본점이 바로 옆이에요.",
      en: "Euljiro 1-ga Station is at the western edge of Myeongdong, beside Lotte Department Store's main branch and the Lotte Duty Free flagship.",
      zh: "乙支路入口站位于明洞西端，紧邻乐天百货总店和乐天免税店总店。",
      ja: "乙支路入口駅は明洞の西の端にあり、ロッテ百貨店本店とロッテ免税店本店がすぐ隣です。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "을지로 지하상가가 시청 방면으로 이어져 있어서 상당 부분을 지하로 걸어 다닐 수 있어요.",
          en: "The Euljiro underground arcade runs on toward City Hall, so you can walk much of the way underground.",
          zh: "乙支路地下商街一直延伸到市厅方向，大部分路程都可以走地下。",
          ja: "乙支路地下街が市庁方面へ続いているので、かなりの距離を地下で歩けます。",
        },
      },
      {
        kind: "luggage",
        text: {
          ko: "면세점에서 쇼핑하려면 여권이 꼭 필요해요. 명동 쇼핑거리는 걸어서 금방이라 명동역까지 갈 필요가 없을 때가 많아요.",
          en: "Bring your passport for duty-free shopping. Myeongdong's shopping streets are a short walk away, often quicker than riding to Myeongdong Station.",
          zh: "在免税店购物必须带护照。明洞购物街步行很快就到，常常比坐车去明洞站还快。",
          ja: "免税店での買い物にはパスポートが必須です。明洞のショッピング街は歩いてすぐなので、明洞駅まで乗るより早いことも多いです。",
        },
      },
    ],
  },
  회현역: {
    intro: {
      ko: "회현역은 서울에서 가장 오래되고 큰 전통시장인 남대문시장과 신세계백화점 본점으로 가는 역이에요.",
      en: "Hoehyeon Station is the stop for Namdaemun Market, Seoul's oldest and largest traditional market, and the Shinsegae department store's main branch.",
      zh: "会贤站是前往首尔历史最悠久、规模最大的传统市场南大门市场以及新世界百货总店的车站。",
      ja: "会賢駅はソウル最古で最大級の伝統市場・南大門市場と、新世界百貨店本店への最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "남대문시장은 일요일에 쉬는 가게가 많고 아침 일찍 문을 열어요. 평일 오전이 가장 둘러보기 좋아요.",
          en: "Many Namdaemun stalls close on Sundays and open early in the morning, so weekday mornings are the best time to go.",
          zh: "南大门市场不少店铺周日休息，早上很早开门，工作日上午最适合去逛。",
          ja: "南大門市場は日曜休みの店が多く、朝早くから開いています。平日の午前中がいちばん回りやすいです。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "서울역은 4호선으로 한 정거장, 명동은 걸어서 10분 남짓이에요.",
          en: "Seoul Station is one stop away on Line 4, and Myeongdong is just over 10 minutes on foot.",
          zh: "乘4号线一站就是首尔站，步行10分钟出头就到明洞。",
          ja: "ソウル駅は4号線で1駅、明洞は徒歩10分ちょっとです。",
        },
      },
    ],
  },
  종로3가역: {
    intro: {
      ko: "종로3가역은 1·3·5호선이 만나는 환승역으로, 익선동 한옥 골목과 종묘, 종로 포장마차 거리가 가까워요.",
      en: "Jongno 3-ga Station is a three-line hub close to the hanok alleys of Ikseon-dong, Jongmyo Shrine and the street-food tents of Jongno.",
      zh: "钟路3街站是1、3、5号线交汇的换乘站，靠近益善洞韩屋小巷、宗庙和钟路的路边摊大排档。",
      ja: "鍾路3街駅は1・3・5号線が交わる乗り換え駅で、益善洞の韓屋路地や宗廟、鍾路の屋台街がすぐそばです。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "익선동 골목은 주말에 매우 붐벼요. 평일 낮에 가면 한옥 카페를 여유롭게 즐길 수 있어요.",
          en: "Ikseon-dong's lanes get very crowded at weekends; go on a weekday afternoon to enjoy the hanok cafés in peace.",
          zh: "益善洞小巷周末非常拥挤，工作日白天去可以悠闲地享受韩屋咖啡馆。",
          ja: "益善洞の路地は週末とても混雑します。平日の昼間なら韓屋カフェをゆったり楽しめます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "종묘는 화요일에 문을 닫고, 대부분의 요일에는 정해진 시간의 해설 관람으로만 들어갈 수 있어요.",
          en: "Jongmyo Shrine is closed on Tuesdays, and on most days you visit on a scheduled guided tour.",
          zh: "宗庙周二闭馆，大多数日子只能参加定时的讲解参观。",
          ja: "宗廟は火曜日が休館で、ほとんどの曜日は時間指定のガイドツアーでの見学になります。",
        },
      },
    ],
  },
  종로5가역: {
    intro: {
      ko: "종로5가역은 빈대떡과 마약김밥, 먹자골목으로 유명한 광장시장으로 가는 역이에요.",
      en: "Jongno 5-ga Station is the stop for Gwangjang Market, famous for bindaetteok mung-bean pancakes, mayak gimbap and its food-stall alleys.",
      zh: "钟路5街站是前往广藏市场的车站，这里以绿豆煎饼、麻药紫菜包饭和美食摊位小巷闻名。",
      ja: "鍾路5街駅は、ピンデトック（緑豆チヂミ）や麻薬キンパ、屋台路地で有名な広蔵市場への最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "먹거리 노점은 점심과 저녁에 가장 붐벼요. 작은 노점에서는 현금이 있으면 편해요.",
          en: "The food stalls are busiest at lunch and in the evening; cash is handy at the smaller stalls.",
          zh: "美食摊午餐和晚餐时间最拥挤，小摊位带点现金会更方便。",
          ja: "屋台は昼と夜がいちばん混みます。小さな屋台では現金があると便利です。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "시장 바로 남쪽으로 청계천이 흘러서, 천변을 따라 시내 중심까지 걸어서 돌아가기 좋아요.",
          en: "Cheonggyecheon Stream runs just south of the market, an easy walk back toward the city centre.",
          zh: "清溪川就在市场南边，沿河步行回市中心很方便。",
          ja: "市場のすぐ南を清渓川が流れているので、川沿いを歩いて都心へ戻るのも簡単です。",
        },
      },
    ],
  },
  충무로역: {
    intro: {
      ko: "충무로역은 3·4호선이 만나는 역으로, 남산골한옥마을이 가깝고 남산으로 조용히 올라가는 길의 출발점이에요.",
      en: "Chungmuro Station, where Lines 3 and 4 meet, is the stop for Namsangol Hanok Village and a quieter way up toward Namsan.",
      zh: "忠武路站是3号线和4号线的交汇站，靠近南山谷韩屋村，也是安静登上南山的起点。",
      ja: "忠武路駅は3・4号線が交わる駅で、南山コル韓屋村が近く、南山へ静かに登るルートの起点でもあります。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "남산골한옥마을은 무료로 들어갈 수 있고, 월요일에는 문을 닫아요.",
          en: "Namsangol Hanok Village is free to enter and closed on Mondays.",
          zh: "南山谷韩屋村免费入场，周一闭馆。",
          ja: "南山コル韓屋村は入場無料で、月曜日は休館です。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "명동은 4호선으로 한 정거장이라, 한옥마을을 본 뒤 쇼핑으로 이어 가기 좋아요.",
          en: "Myeongdong is one stop away on Line 4, so the hanok village and an afternoon of shopping pair easily.",
          zh: "乘4号线一站就到明洞，看完韩屋村接着去购物很方便。",
          ja: "明洞は4号線で1駅なので、韓屋村のあとに買い物へ流れやすいです。",
        },
      },
    ],
  },
  고속터미널역: {
    intro: {
      ko: "고속터미널역은 3·7·9호선이 만나는 역으로, 서울 최대 고속버스터미널과 고투몰 지하상가, 신세계백화점 강남점이 연결돼요.",
      en: "Express Bus Terminal Station links Lines 3, 7 and 9 to Seoul's main intercity bus terminal, the GOTO Mall underground arcade and Shinsegae Gangnam.",
      zh: "高速巴士客运站站是3、7、9号线的交汇站，连接首尔最大的高速巴士客运站、GOTO MALL地下商街和新世界百货江南店。",
      ja: "高速ターミナル駅は3・7・9号線が交わる駅で、ソウル最大の高速バスターミナル、GOTOモール地下街、新世界百貨店江南店につながっています。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "고속버스는 경부선과 호남선(센트럴시티) 두 터미널에서 따로 출발해요. 승차권에 적힌 터미널을 먼저 확인하세요.",
          en: "Intercity buses leave from two separate terminals, the Gyeongbu Line terminal and the Honam Line terminal at Central City; check which one is on your ticket.",
          zh: "高速巴士分别从京釜线和湖南线（Central City）两个客运站发车，请先确认车票上写的是哪一个。",
          ja: "高速バスは京釜線と湖南線（セントラルシティ）の2つのターミナルから別々に出発します。乗車券に書かれたターミナルを先に確認しましょう。",
        },
      },
      {
        kind: "luggage",
        text: {
          ko: "고투몰은 지하로 길게 이어져서 걷는 거리가 꽤 길어요. 큰 짐이 있다면 보관함에 맡기고 둘러보세요.",
          en: "GOTO Mall stretches a long way underground, so leave big bags in a locker before you browse.",
          zh: "GOTO MALL在地下绵延很长，逛之前最好先把大件行李寄存起来。",
          ja: "GOTOモールは地下に長く続いているので、大きな荷物はロッカーに預けてから見て回りましょう。",
        },
      },
    ],
  },
  삼성역: {
    intro: {
      ko: "삼성역은 별마당도서관이 있는 스타필드 코엑스몰과 바로 연결되고, 길 건너편에는 봉은사가 있어요.",
      en: "Samseong Station opens directly into Starfield COEX Mall, home of the Starfield Library, with Bongeunsa Temple across the road.",
      zh: "三成站直通拥有星空图书馆的Starfield COEX购物中心，马路对面就是奉恩寺。",
      ja: "三成駅はピョルマダン図書館のあるスターフィールドCOEXモールに直結し、道の向かいには奉恩寺があります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "코엑스는 역과 지하로 연결돼 있어서 쇼핑몰과 아쿠아리움, 별마당도서관까지 밖에 나가지 않고 갈 수 있어요.",
          en: "COEX connects to the station underground, so the mall, the aquarium and the Starfield Library are all reachable without going outside.",
          zh: "COEX与车站地下相连，不用出站就能到购物中心、水族馆和星空图书馆。",
          ja: "COEXは駅と地下でつながっているので、モールや水族館、ピョルマダン図書館まで外に出ずに行けます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "봉은사는 무료로 들어갈 수 있고 템플스테이 프로그램도 운영해요. 도심 빌딩 사이에서 조용히 쉬어 가기 좋아요.",
          en: "Bongeunsa is free to enter and runs temple-stay programmes, a quiet break between the office towers.",
          zh: "奉恩寺免费参观，还提供寺院寄宿体验，是在高楼间静心休息的好去处。",
          ja: "奉恩寺は入場無料でテンプルステイも行っています。ビル街の中で静かにひと息つけます。",
        },
      },
    ],
  },
  여의도역: {
    intro: {
      ko: "여의도역은 5·9호선이 만나는 서울 금융가의 중심역으로, IFC몰과 더현대 서울이 가까워요.",
      en: "Yeouido Station, on Lines 5 and 9, serves Seoul's financial district, the IFC Mall and The Hyundai Seoul department store.",
      zh: "汝矣岛站是5号线和9号线交汇的首尔金融区中心站，靠近IFC购物中心和The Hyundai Seoul百货。",
      ja: "汝矣島駅は5・9号線が交わるソウル金融街の中心駅で、IFCモールやザ・現代ソウルが近くにあります。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "9호선 급행이 서서 강남과 김포공항 방면으로 빠르게 이동할 수 있어요.",
          en: "Line 9 express trains stop here, a fast connection to Gangnam and Gimpo Airport.",
          zh: "9号线快车在此停靠，去江南和金浦机场方向都很快。",
          ja: "9号線の急行が停車するので、江南や金浦空港方面へすばやく移動できます。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "여의도 한강공원과 유람선 선착장은 5호선으로 한 정거장인 여의나루역이 더 가까워요.",
          en: "For Yeouido Hangang Park and the river cruises, Yeouinaru Station, one stop away on Line 5, is closer.",
          zh: "去汝矣岛汉江公园和游船码头，乘5号线一站的汝矣渡口站更近。",
          ja: "汝矣島漢江公園や遊覧船乗り場へは、5号線で1駅の汝矣ナル駅のほうが近いです。",
        },
      },
    ],
  },
  여의나루역: {
    intro: {
      ko: "여의나루역은 피크닉과 야시장, 한강 유람선으로 유명한 여의도 한강공원에서 가장 가까운 역이에요.",
      en: "Yeouinaru Station is the closest stop to Yeouido Hangang Park, the riverside park known for picnics, night markets and river cruises.",
      zh: "汝矣渡口站是离汝矣岛汉江公园最近的车站，这里以野餐、夜市和汉江游船闻名。",
      ja: "汝矣ナル駅は、ピクニックや夜市、漢江クルーズで知られる汝矣島漢江公園の最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "4월 초 벚꽃 시즌과 가을 불꽃축제 때는 역이 매우 혼잡해요. 이 시기에는 시간 여유를 넉넉히 두세요.",
          en: "The station gets extremely crowded during the early-April cherry blossoms and the autumn fireworks festival; leave plenty of time then.",
          zh: "4月初樱花季和秋季烟花节期间车站会非常拥挤，这段时间请多预留时间。",
          ja: "4月初めの桜の季節や秋の花火大会の時期は駅が非常に混雑するので、時間に余裕を持ちましょう。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "5호선은 이 역에서 한강 아래를 지나요. 강북 쪽 다음 역은 마포역이에요.",
          en: "Line 5 crosses under the Han River from here; the next stop on the north bank is Mapo.",
          zh: "5号线从本站穿过汉江底下，江北的下一站是麻浦站。",
          ja: "5号線はこの駅から漢江の下をくぐり、北岸の次の駅は麻浦駅です。",
        },
      },
    ],
  },
  신사역: {
    intro: {
      ko: "신사역은 가로수를 따라 브랜드 플래그십과 편집숍, 카페가 늘어선 가로수길로 가는 역이에요.",
      en: "Sinsa Station is the stop for Garosu-gil, a tree-lined street of brand flagships, boutiques and cafés south of the river.",
      zh: "新沙站是前往林荫道（Garosu-gil）的车站，这条江南的林荫街上品牌旗舰店、精品店和咖啡馆林立。",
      ja: "新沙駅は、並木沿いにブランドの旗艦店やセレクトショップ、カフェが並ぶカロスキルへの最寄り駅です。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "가로수길은 역에서 걸어서 5분 정도예요. 큰길 양옆 골목(세로수길)에 작은 카페와 가게가 더 많아요.",
          en: "Garosu-gil is about five minutes on foot; the side lanes on either side hide many more small cafés and shops.",
          zh: "林荫道离车站步行约5分钟；两侧的小巷里还藏着更多小咖啡馆和小店。",
          ja: "カロスキルは駅から徒歩5分ほど。両側の路地にも小さなカフェや店がたくさんあります。",
        },
      },
      {
        kind: "route",
        text: {
          ko: "신분당선이 이 역에서 강남·판교 방면으로 출발해요. 신분당선은 일반 요금에 별도 운임이 조금 더 붙어요.",
          en: "The Shinbundang Line starts here for Gangnam and Pangyo; it adds a small surcharge to the regular fare.",
          zh: "新盆唐线从本站发车开往江南、板桥方向，在普通票价之外另加少量费用。",
          ja: "新盆唐線はこの駅から江南・板橋方面へ出発します。通常運賃に少額の別料金がかかります。",
        },
      },
    ],
  },
  한강진역: {
    intro: {
      ko: "한강진역은 디자인숍과 갤러리가 모인 한남동, 그리고 서울 대표 미술관 중 하나인 리움미술관으로 가는 역이에요.",
      en: "Hangangjin Station serves Hannam-dong's design shops and galleries and the Leeum Museum of Art, one of Seoul's leading museums.",
      zh: "汉江镇站是前往设计店和画廊云集的汉南洞，以及首尔代表性美术馆之一Leeum美术馆的车站。",
      ja: "漢江鎮駅は、デザインショップやギャラリーが集まる漢南洞と、ソウルを代表する美術館のひとつリウム美術館への最寄り駅です。",
    },
    notes: [
      {
        kind: "timing",
        text: {
          ko: "리움미술관은 온라인 사전 예약을 권장해요. 가기 전에 휴관일도 확인하세요.",
          en: "Leeum recommends booking online in advance; check its closing days before you go.",
          zh: "Leeum美术馆建议提前在线预约，出发前也请确认闭馆日。",
          ja: "リウム美術館はオンラインでの事前予約がおすすめです。休館日も事前に確認しましょう。",
        },
      },
      {
        kind: "access",
        text: {
          ko: "한남동 쪽 길은 오르막이 많아요. 이태원역은 6호선으로 한 정거장이라 두 동네를 이어서 걷기 좋아요.",
          en: "The streets toward Hannam-dong are hilly; Itaewon Station is one stop away on Line 6, so the two areas link up easily on foot.",
          zh: "去汉南洞的路上坡较多；梨泰院站乘6号线只有一站，两个街区可以步行串联。",
          ja: "漢南洞方面の道は坂が多めです。梨泰院駅は6号線で1駅なので、2つのエリアを歩いてつなげられます。",
        },
      },
    ],
  },
  서울숲역: {
    intro: {
      ko: "서울숲역은 꽃사슴 방사장과 정원, 한강 산책로가 있는 큰 공원, 서울숲에서 가장 가까운 역이에요.",
      en: "Seoul Forest Station is the closest stop to Seoul Forest, a large park with a deer enclosure, gardens and riverside paths.",
      zh: "首尔林站是离首尔林最近的车站，这座大公园里有梅花鹿园、花园和汉江步道。",
      ja: "ソウルの森駅は、シカの放牧場や庭園、漢江沿いの散策路がある大きな公園・ソウルの森の最寄り駅です。",
    },
    notes: [
      {
        kind: "route",
        text: {
          ko: "성수동 카페와 팝업스토어가 걸어서 가까워서 공원과 성수동을 한나절 코스로 묶기 좋아요.",
          en: "Seongsu-dong's cafés and pop-up stores are a short walk away, so the park and Seongsu pair easily in one afternoon.",
          zh: "圣水洞的咖啡馆和快闪店步行就能到，公园和圣水洞可以安排成半日行程。",
          ja: "聖水洞のカフェやポップアップストアまで歩いてすぐなので、公園と聖水洞を半日コースで回れます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "맑은 주말에는 공원이 가장 붐비고, 평일 오전은 한적해요.",
          en: "The park is busiest on sunny weekends; weekday mornings are quiet.",
          zh: "晴朗的周末公园人最多，工作日上午很清静。",
          ja: "晴れた週末がいちばん混み、平日の午前中は静かです。",
        },
      },
    ],
  },
  혜화역: {
    intro: {
      ko: "혜화역은 소극장 수십 곳과 마로니에공원, 대학가 카페가 모인 서울의 공연 거리, 대학로로 가는 역이에요.",
      en: "Hyehwa Station is the stop for Daehak-ro, Seoul's theatre district, with dozens of small stages, Marronnier Park and student cafés.",
      zh: "惠化站是前往大学路的车站，这里是首尔的剧场街，聚集了数十家小剧场、马罗尼埃公园和学生咖啡馆。",
      ja: "恵化駅は、数十の小劇場やマロニエ公園、学生街のカフェが集まるソウルの演劇の街・大学路への最寄り駅です。",
    },
    notes: [
      {
        kind: "access",
        text: {
          ko: "낙산공원과 한양도성 성곽길은 오르막을 걸어 올라가야 하지만, 서울 시내 야경이 잘 보여요.",
          en: "Naksan Park and the Seoul City Wall trail are an uphill walk away, rewarded with good night views over the city.",
          zh: "去骆山公园和首尔城郭步道需要走一段上坡，但能看到很棒的首尔夜景。",
          ja: "駱山公園や漢陽都城の城郭道へは上り坂を歩きますが、ソウルの夜景がよく見えます。",
        },
      },
      {
        kind: "timing",
        text: {
          ko: "대부분의 연극은 한국어로 공연되지만, 대사 없는 넌버벌 공연은 언어와 상관없이 즐길 수 있어요.",
          en: "Most plays are in Korean, but non-verbal shows are easy to enjoy whatever language you speak.",
          zh: "大多数话剧用韩语演出，但无对白的非语言表演不懂韩语也能看懂。",
          ja: "ほとんどの演劇は韓国語ですが、セリフのないノンバーバル公演なら言葉を問わず楽しめます。",
        },
      },
    ],
  },
};
