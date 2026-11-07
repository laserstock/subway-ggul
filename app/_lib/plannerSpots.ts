import type { PlannerCategory } from "./plannerParams";

export type PlannerSpot = {
  name: string;
  blurb: string;
  categories: PlannerCategory[];
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
      name: "Myeongdong Shopping Street",
      blurb: "Seoul's busiest shopping strip: K-beauty flagships, fashion and evening street-food stalls.",
      categories: ["shopping", "k-beauty"],
      lat: 37.5637,
      lng: 126.9852,
      exit: "6",
    },
    {
      name: "Myeongdong Kyoja",
      blurb: "Known since 1966 for kalguksu (knife-cut noodle soup) and dumplings; the lunch queue moves fast.",
      categories: ["food"],
      lat: 37.5626,
      lng: 126.9856,
    },
    {
      name: "Myeongdong Cathedral",
      blurb: "Korea's first Gothic-style cathedral (1898), a quiet stop between the shops.",
      categories: ["attraction"],
      lat: 37.5633,
      lng: 126.9873,
    },
    {
      name: "Namsan Cable Car to N Seoul Tower",
      blurb: "Ride up Namsan for the classic city view; the base station is uphill from the exit.",
      categories: ["attraction"],
      lat: 37.5579,
      lng: 126.983,
      exit: "3",
      walk: 10,
    },
  ],
  홍대입구역: [
    {
      name: "Hongdae Street & Busking Zone",
      blurb: "Indie fashion, character shops and street performers, liveliest from late afternoon.",
      categories: ["shopping", "attraction"],
      lat: 37.5552,
      lng: 126.9227,
      exit: "9",
    },
    {
      name: "Gyeongui Line Forest Park",
      blurb: "A long park on a former rail line, lined with cafés toward Yeonnam-dong.",
      categories: ["attraction", "cafe"],
      lat: 37.5601,
      lng: 126.9246,
      exit: "3",
    },
    {
      name: "Yeonnam-dong Café Streets",
      blurb: "Small roasteries, bakeries and brunch spots in low-rise side streets.",
      categories: ["cafe", "food"],
      lat: 37.5626,
      lng: 126.9228,
      exit: "3",
    },
  ],
  성수역: [
    {
      name: "Yeonmujang-gil Pop-up Street",
      blurb: "Brand pop-ups, concept stores and K-beauty showrooms in old factories; the line-up changes every few weeks.",
      categories: ["shopping", "k-beauty"],
      lat: 37.5434,
      lng: 127.0553,
      exit: "3",
    },
    {
      name: "Seongsu Warehouse Cafés",
      blurb: "Industrial-style cafés and bakeries in converted workshops around the station.",
      categories: ["cafe"],
      lat: 37.5427,
      lng: 127.0565,
    },
  ],
  서울숲역: [
    {
      name: "Seoul Forest",
      blurb: "A big park with lawns, a deer enclosure and paths down to the Han River.",
      categories: ["attraction"],
      lat: 37.5443,
      lng: 127.0374,
      exit: "3",
    },
  ],
  동대문역사문화공원역: [
    {
      name: "Dongdaemun Design Plaza (DDP)",
      blurb: "Zaha Hadid's curving landmark with exhibitions and design shops, lit up at night.",
      categories: ["attraction", "shopping"],
      lat: 37.5667,
      lng: 127.0093,
      exit: "1",
    },
    {
      name: "Dongdaemun Fashion Malls",
      blurb: "Multi-floor fashion towers such as Doota Mall, known for late opening hours.",
      categories: ["shopping"],
      lat: 37.5692,
      lng: 127.0094,
    },
  ],
  종로5가역: [
    {
      name: "Gwangjang Market",
      blurb: "Seoul's classic food market: bindaetteok (mung-bean pancakes), mayak gimbap and yukhoe at the stalls.",
      categories: ["food", "shopping"],
      lat: 37.57,
      lng: 126.9996,
    },
  ],
  경복궁역: [
    {
      name: "Gyeongbokgung Palace",
      blurb: "The main Joseon palace; visitors in hanbok get in free. Closed on Tuesdays.",
      categories: ["attraction"],
      lat: 37.5788,
      lng: 126.977,
      exit: "5",
    },
    {
      name: "Tongin Market",
      blurb: "Neighborhood market known for its coin lunchbox (dosirak) and oil tteokbokki.",
      categories: ["food"],
      lat: 37.581,
      lng: 126.9706,
      exit: "2",
    },
    {
      name: "Seochon Village",
      blurb: "Hanok alleys west of the palace with small galleries, cafés and bookshops.",
      categories: ["cafe", "shopping"],
      lat: 37.5795,
      lng: 126.9705,
    },
  ],
  안국역: [
    {
      name: "Bukchon Hanok Village",
      blurb: "Hillside lanes of traditional homes. Residents live here: visit between 10 AM and 5 PM and keep voices down.",
      categories: ["attraction"],
      lat: 37.5826,
      lng: 126.9836,
      exit: "2",
    },
    {
      name: "Insadong-gil",
      blurb: "Traditional crafts, tea houses and the spiral Ssamziegil shopping courtyard.",
      categories: ["shopping", "attraction", "cafe"],
      lat: 37.5742,
      lng: 126.9852,
      exit: "6",
    },
    {
      name: "Changdeokgung Palace",
      blurb: "UNESCO-listed palace; the Secret Garden needs a separate timed ticket.",
      categories: ["attraction"],
      lat: 37.5794,
      lng: 126.991,
      exit: "3",
    },
  ],
  종로3가역: [
    {
      name: "Ikseon-dong Hanok Street",
      blurb: "Narrow hanok alleys turned into cafés, dessert shops and small restaurants.",
      categories: ["cafe", "food", "shopping"],
      lat: 37.5743,
      lng: 126.9898,
    },
  ],
  광화문역: [
    {
      name: "Gwanghwamun Square",
      blurb: "Statues of King Sejong and Admiral Yi, with Gwanghwamun Gate and the mountains behind.",
      categories: ["attraction"],
      lat: 37.5727,
      lng: 126.9769,
    },
    {
      name: "Kyobo Bookstore Gwanghwamun",
      blurb: "A huge bookstore with stationery and Korean design goods, connected underground.",
      categories: ["shopping"],
      lat: 37.571,
      lng: 126.978,
    },
    {
      name: "Cheonggyecheon Stream",
      blurb: "A sunken stream walk starting at Cheonggye Plaza, cool on summer evenings.",
      categories: ["attraction"],
      lat: 37.5694,
      lng: 126.978,
    },
  ],
  시청역: [
    {
      name: "Deoksugung Palace",
      blurb: "A palace with Western-style stone halls; leave along the Deoksugung stone-wall road.",
      categories: ["attraction"],
      lat: 37.5658,
      lng: 126.9752,
      exit: "2",
    },
  ],
  회현역: [
    {
      name: "Namdaemun Market",
      blurb: "A sprawling traditional market for souvenirs, ginseng and the kalguksu alley.",
      categories: ["shopping", "food"],
      lat: 37.5593,
      lng: 126.9773,
      exit: "5",
    },
    {
      name: "Shinsegae Department Store (Main)",
      blurb: "The historic flagship, with luxury floors and a big basement food hall.",
      categories: ["shopping", "food", "k-beauty"],
      lat: 37.5609,
      lng: 126.981,
      exit: "7",
    },
  ],
  을지로입구역: [
    {
      name: "Lotte Department Store & Duty Free (Main)",
      blurb: "Department store and duty-free floors under one roof; bring your passport for duty-free.",
      categories: ["shopping", "k-beauty"],
      lat: 37.5646,
      lng: 126.9817,
      exit: "7",
    },
  ],
  서울역: [
    {
      name: "Seoullo 7017",
      blurb: "A garden walkway on a former highway overpass next to the station.",
      categories: ["attraction"],
      lat: 37.5563,
      lng: 126.9706,
    },
    {
      name: "Lotte Mart Seoul Station",
      blurb: "Popular with travelers for snacks, ramyeon and K-beauty basics before flying home.",
      categories: ["shopping", "k-beauty"],
      lat: 37.5555,
      lng: 126.9698,
    },
  ],
  이태원역: [
    {
      name: "Itaewon-ro & Side Streets",
      blurb: "International restaurants, vintage shops and bars along the main road and alleys.",
      categories: ["food", "shopping"],
      lat: 37.5346,
      lng: 126.993,
    },
  ],
  한강진역: [
    {
      name: "Leeum Museum of Art",
      blurb: "Korean ceramics through to contemporary art; booking ahead is recommended.",
      categories: ["attraction"],
      lat: 37.5382,
      lng: 126.999,
      exit: "1",
    },
  ],
  신사역: [
    {
      name: "Garosu-gil",
      blurb: "A tree-lined street of brand flagships, boutiques and cafés.",
      categories: ["shopping", "cafe", "k-beauty"],
      lat: 37.5208,
      lng: 127.023,
      exit: "8",
    },
  ],
  압구정로데오역: [
    {
      name: "Galleria Department Store",
      blurb: "Seoul's best-known luxury department store, split into East and West halls.",
      categories: ["shopping", "k-beauty"],
      lat: 37.5279,
      lng: 127.04,
      exit: "7",
    },
    {
      name: "Apgujeong Rodeo Street",
      blurb: "Side streets of designer boutiques, cafés and brunch spots.",
      categories: ["cafe", "shopping", "food"],
      lat: 37.5257,
      lng: 127.039,
    },
  ],
  삼성역: [
    {
      name: "Starfield COEX Mall & Library",
      blurb: "A giant underground mall around the photogenic two-story Starfield Library.",
      categories: ["shopping", "attraction"],
      lat: 37.51,
      lng: 127.06,
      exit: "5",
    },
    {
      name: "Bongeunsa Temple",
      blurb: "A Buddhist temple founded in 794, facing the COEX towers; free to enter.",
      categories: ["attraction"],
      lat: 37.5146,
      lng: 127.0576,
      exit: "6",
    },
  ],
  잠실역: [
    {
      name: "Lotte World Tower & Seoul Sky",
      blurb: "Korea's tallest building, with the Seoul Sky observatory and Lotte World Mall below.",
      categories: ["attraction", "shopping"],
      lat: 37.5126,
      lng: 127.1025,
      exit: "1",
    },
    {
      name: "Lotte World Adventure",
      blurb: "An indoor theme park plus the outdoor Magic Island on Seokchon Lake.",
      categories: ["attraction"],
      lat: 37.5111,
      lng: 127.098,
      exit: "4",
    },
    {
      name: "Seokchon Lake",
      blurb: "An easy lakeside loop beside Lotte World; cherry blossoms in early April.",
      categories: ["attraction", "cafe"],
      lat: 37.5095,
      lng: 127.104,
    },
  ],
  여의도역: [
    {
      name: "The Hyundai Seoul",
      blurb: "A department store with an indoor garden, rotating pop-ups and a big food hall.",
      categories: ["shopping", "food", "k-beauty"],
      lat: 37.5259,
      lng: 126.9284,
      exit: "3",
    },
    {
      name: "IFC Mall",
      blurb: "An underground mall with fashion brands and restaurants.",
      categories: ["shopping", "food"],
      lat: 37.5251,
      lng: 126.9255,
    },
  ],
  여의나루역: [
    {
      name: "Yeouido Hangang Park",
      blurb: "Riverside lawns, bike rental and convenience-store ramyeon by the Han River.",
      categories: ["attraction"],
      lat: 37.5283,
      lng: 126.933,
    },
  ],
  고속터미널역: [
    {
      name: "GOTO Mall",
      blurb: "A long underground arcade of budget fashion and home goods.",
      categories: ["shopping"],
      lat: 37.5057,
      lng: 127.005,
    },
    {
      name: "Shinsegae Gangnam",
      blurb: "One of Korea's biggest department stores, with a large food hall.",
      categories: ["shopping", "food", "k-beauty"],
      lat: 37.5046,
      lng: 127.004,
    },
  ],
  강남역: [
    {
      name: "Gangnam-daero",
      blurb: "The main strip of K-beauty stores, restaurants and the underground shopping arcade.",
      categories: ["shopping", "k-beauty", "food"],
      lat: 37.499,
      lng: 127.0275,
    },
  ],
};

/** Suggested day trips for the planner home and the sitemap, by Korean station name. */
export const PLANNER_PAIRS: [string, string, PlannerCategory[]][] = [
  ["서울역", "명동역", ["shopping", "k-beauty"]],
  ["명동역", "성수역", ["shopping", "cafe"]],
  ["홍대입구역", "명동역", ["shopping", "food"]],
  ["서울역", "경복궁역", ["attraction", "food"]],
  ["명동역", "잠실역", ["attraction", "shopping"]],
  ["홍대입구역", "성수역", ["cafe", "shopping"]],
  ["강남역", "삼성역", ["shopping", "attraction"]],
  ["을지로입구역", "동대문역사문화공원역", ["shopping", "food"]],
];
