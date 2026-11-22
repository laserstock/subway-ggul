/**
 * Travelpayouts / Klook deeplinks for web-only affiliate CTAs.
 * Paste dashboard deeplinks into the `href` fields below — never load a global LinkSwitcher script.
 */
export type AffiliateOffer = {
  id: string;
  /** Travelpayouts tracking deeplink (replace placeholders with your dashboard URLs). */
  href: string;
  /** Short labels shown on the banner buttons. */
  label: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
  };
  blurb: {
    ko: string;
    en: string;
    zh: string;
    ja: string;
  };
};

/**
 * ↓↓↓ Paste Travelpayouts deeplinks here ↓↓↓
 * Keep `https://` absolute URLs. Empty `href` hides that button until filled.
 */
export const AFFILIATE_OFFERS: readonly AffiliateOffer[] = [
  {
    id: "arex",
    href: "", // e.g. https://www.klook.com/...?aid=...
    label: {
      ko: "공항철도 AREX",
      en: "AREX Airport Railroad",
      zh: "机场铁路 AREX",
      ja: "空港鉄道 AREX",
    },
    blurb: {
      ko: "인천공항 ↔ 서울역 직통·일반 열차 티켓",
      en: "Incheon Airport ↔ Seoul Station express & all-stop tickets",
      zh: "仁川机场 ↔ 首尔站直达/普通车票",
      ja: "仁川空港 ↔ ソウル駅 直通・各駅停車チケット",
    },
  },
  {
    id: "tmoney",
    href: "", // Climate Card / T-money traveler pass
    label: {
      ko: "기후동행카드·티머니",
      en: "Climate Card / T-money",
      zh: "气候同行卡 / T-money",
      ja: "気候同行カード・T-money",
    },
    blurb: {
      ko: "서울 대중교통 패스·교통카드 옵션",
      en: "Seoul transit passes and T-money top-up options",
      zh: "首尔公交地铁通票与 T-money 充值",
      ja: "ソウル交通パス・T-moneyチャージ",
    },
  },
  {
    id: "seoul-tour-luggage",
    href: "", // Tours / luggage storage
    label: {
      ko: "서울 투어·짐보관",
      en: "Seoul tours & luggage storage",
      zh: "首尔行程与行李寄存",
      ja: "ソウルツアー・荷物預かり",
    },
    blurb: {
      ko: "시티투어·수하물 보관 예약",
      en: "City tours and bag storage near major stations",
      zh: "城市观光与主要车站附近行李寄存",
      ja: "市内ツアー・主要駅付近の荷物預かり",
    },
  },
] as const;

export const AFFILIATE_BANNER = {
  eyebrow: {
    ko: "여행 예약 (웹 전용)",
    en: "Travel bookings (web only)",
    zh: "旅行预订（仅网页）",
    ja: "旅行予約（ウェブのみ）",
  },
  title: {
    ko: "공항·교통·투어를 한곳에서",
    en: "Airport rail, transit passes & tours",
    zh: "机场铁路、交通卡与行程",
    ja: "空港鉄道・交通パス・ツアー",
  },
  lead: {
    ko: "Klook 등 파트너 예약은 웹 브라우저에서만 열려요. 앱 안에서는 표시되지 않습니다.",
    en: "Partner bookings (Klook etc.) open only in a regular browser — never inside the app WebView.",
    zh: "合作伙伴预订（Klook 等）仅在普通浏览器中打开，不会在 App WebView 中显示。",
    ja: "Klookなどの提携予約は通常のブラウザでのみ開きます。アプリ内WebViewでは表示されません。",
  },
  cta: {
    ko: "예약하기",
    en: "Book",
    zh: "去预订",
    ja: "予約する",
  },
} as const;
