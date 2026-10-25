"use client";

import { useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import { LineIcon } from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { useLocale } from "../_lib/locale";
import {
  LOCKER_HOURS,
  LOCKER_MAX_DAYS,
  LOCKER_SIZES,
  LUGGAGE_DESKS,
  LUGGAGE_HOURS,
  LUGGAGE_LINKS,
  LUGGAGE_SIZES,
  STORAGE_DISCOUNTS,
  STORAGE_ROOMS,
  STORAGE_SITES,
  exitText,
  formatWon,
  isWeekend,
  lockerFee,
  luggageFee,
  recommendLuggage,
  stationDesk,
  stationLockers,
  stationStorage,
  type BagSize,
  type LockerSize,
  type LuggagePick,
  type LuggagePlan,
  type LuggageSize,
} from "../_lib/luggage";
import { useNow } from "../_lib/reports";
import { LOCKER_DATA_DATE } from "../_lib/stationLockers";
import { stationKeys, stationName, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { useAutoTranslation } from "../_lib/translate";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import { LUGGAGE_TITLE, LuggageIcon } from "./header";

const HOUR_CHOICES = [2, 4, 6, 8, 12] as const;
const LATE_HOUR = 21;

const COPY = {
  search: { ko: "다른 역 검색", en: "Search another station", zh: "搜索其他车站", ja: "他の駅を検索" },
  nearest: { ko: "가장 가까운 역", en: "Nearest station", zh: "最近的车站", ja: "最寄り駅" },
  selected: { ko: "선택한 역", en: "Selected station", zh: "已选车站", ja: "選択した駅" },
  backToMe: { ko: "내 위치로", en: "Use my location", zh: "回到我的位置", ja: "現在地に戻る" },
  locating: { ko: "현재 위치를 찾는 중…", en: "Finding your location…", zh: "正在获取您的位置…", ja: "現在地を取得中…" },
  locatingHint: {
    ko: "위에서 역을 검색해도 돼요. 요금·추천은 아래에서 바로 볼 수 있어요.",
    en: "You can also search a station above. Fees and tips are below.",
    zh: "也可以在上方搜索车站。费用和推荐见下方。",
    ja: "上で駅を検索することもできます。料金とおすすめは下にあります。",
  },
  retry: { ko: "다시 시도", en: "Retry", zh: "重试", ja: "再試行" },
  lockerCount: { ko: "또타라커 {n}곳", en: "{n} T-Locker banks", zh: "T-Locker {n}处", ja: "T-Locker {n}か所" },
  slotCount: { ko: "{n}칸", en: "{n} slots", zh: "{n}格", ja: "{n}個" },
  noLocker: { ko: "또타라커 정보 없음", en: "No T-Locker data", zh: "暂无T-Locker信息", ja: "T-Locker情報なし" },
  deskHere: { ko: "또타러기지 있음", en: "T-Luggage desk here", zh: "有T-Luggage柜台", ja: "T-Luggageあり" },
  storageHere: { ko: "또타스토리지 있음", en: "T-Storage here", zh: "有T-Storage", ja: "T-Storageあり" },

  finderTitle: { ko: "나에게 맞는 보관 찾기", en: "Find the right storage", zh: "找到适合我的寄存方式", ja: "自分に合う預け方を探す" },
  planQuestion: { ko: "얼마나 맡기세요?", en: "How long?", zh: "要寄存多久？", ja: "どのくらい預けますか？" },
  bagQuestion: { ko: "짐 크기는요?", en: "How big is it?", zh: "行李有多大？", ja: "荷物の大きさは？" },
  pickBadge: { ko: "추천", en: "Pick", zh: "推荐", ja: "おすすめ" },

  lockersTitle: {
    ko: "{station} 또타라커 위치",
    en: "T-Lockers at {station}",
    zh: "{station} T-Locker位置",
    ja: "{station}のT-Locker",
  },
  insideGate: { ko: "개찰구 안", en: "Inside gate", zh: "检票口内", ja: "改札内" },
  mezzanine: { ko: "중층", en: "Mezzanine", zh: "夹层", ja: "中層" },
  noLockerHere: {
    ko: "이 역엔 서울교통공사 또타라커 정보가 없어요. 코레일·민자 노선 역은 공공데이터에 빠져 있어요. 위에서 근처 다른 역을 검색해 보세요.",
    en: "No Seoul Metro T-Locker data for this station. Korail and private-line stations aren't in the open data, so try a nearby station above.",
    zh: "该站没有首尔交通公社T-Locker信息。韩国铁道公社和民营线路车站不在公开数据中，请在上方搜索附近的其他车站。",
    ja: "この駅にはソウル交通公社のT-Locker情報がありません。KORAILや民間路線の駅は公開データに含まれていないため、上で近くの別の駅を検索してください。",
  },
  lockerWeb: { ko: "앱 없이 웹으로 맡기기", en: "Store via web, no app", zh: "无需APP，网页寄存", ja: "アプリなしでWebから預ける" },
  lockerWebHint: {
    ko: "보관함의 QR을 찍거나 웹에서 바로 결제해요. 빈 칸 수는 현장 화면에서 확인해 주세요.",
    en: "Scan the locker's QR or pay on the web. Check free slots on the locker screen.",
    zh: "扫描储物柜上的二维码或直接在网页支付。空格数量请在现场屏幕确认。",
    ja: "ロッカーのQRを読み取るか、Webで直接決済します。空き数は現地の画面で確認してください。",
  },
  lateWarning: {
    ko: "또타라커는 {open}~{close}시에만 넣고 찾을 수 있어요. 지금 맡기면 {close}시 전에 꼭 찾으세요!",
    en: "T-Locker only opens {open}:00–{close}:00. If you store now, pick up before {close}:00!",
    zh: "T-Locker仅在{open}:00~{close}:00可存取。现在寄存的话，请务必在{close}:00前取回！",
    ja: "T-Lockerは{open}時~{close}時のみ出し入れできます。今預けるなら{close}時までに必ず取り出してください！",
  },

  feeTitle: { ko: "요금 계산기", en: "Fee calculator", zh: "费用计算器", ja: "料金計算" },
  weekday: { ko: "평일", en: "Weekday", zh: "工作日", ja: "平日" },
  weekend: { ko: "주말·공휴일", en: "Weekend/holiday", zh: "周末·节假日", ja: "土日祝" },
  hoursUnit: { ko: "{n}시간", en: "{n}h", zh: "{n}小时", ja: "{n}時間" },
  feeNote: {
    ko: "두 서비스 모두 4시간 기본요금 + 이후 1시간마다 추가요금이에요.",
    en: "Both charge a 4-hour base fee plus an hourly fee after that.",
    zh: "两项服务均为4小时基本费用，之后每小时加收费用。",
    ja: "どちらも4時間の基本料金＋以降1時間ごとの追加料金です。",
  },
  tLocker: { ko: "또타라커", en: "T-Locker" },
  tLuggage: { ko: "또타러기지", en: "T-Luggage" },
  storage: { ko: "또타스토리지", en: "T-Storage" },
  selfService: { ko: "무인 보관함", en: "self-service", zh: "自助储物柜", ja: "無人ロッカー" },
  staffed: { ko: "직원이 보관", en: "staffed", zh: "工作人员保管", ja: "スタッフが保管" },

  deskTitle: {
    ko: "또타러기지 · 보관과 당일 배송",
    en: "T-Luggage · storage & same-day delivery",
    zh: "T-Luggage · 寄存和当日配送",
    ja: "T-Luggage · 預かりと当日配送",
  },
  deskIntro: {
    ko: "직원이 직접 맡아줘서 대형 캐리어도 OK. 숙소·인천공항으로 당일 배송도 돼요.",
    en: "Staff take your bags, even large suitcases, and can deliver them to your hotel or Incheon Airport the same day.",
    zh: "由工作人员直接保管，大号行李箱也没问题。还可当日配送到住处或仁川机场。",
    ja: "スタッフが直接預かるので大型スーツケースもOK。宿泊先・仁川空港への当日配送もできます。",
  },
  deskHereNote: { ko: "이 역에 있어요", en: "At this station", zh: "就在本站", ja: "この駅にあります" },
  deliveryCity: { ko: "서울 시내 당일", en: "Seoul same-day", zh: "首尔市内当日", ja: "ソウル市内当日" },
  deliveryAirport: { ko: "인천공항", en: "Incheon Airport", zh: "仁川机场", ja: "仁川空港" },
  deskBook: { ko: "또타러기지 예약하기", en: "Book T-Luggage", zh: "预约T-Luggage", ja: "T-Luggageを予約" },
  from: { ko: "{price}부터", en: "from {price}", zh: "{price}起", ja: "{price}から" },

  storageTitle: {
    ko: "또타스토리지 · 한 달 이상 보관",
    en: "T-Storage · monthly storage",
    zh: "T-Storage · 一个月以上寄存",
    ja: "T-Storage · 1か月以上の保管",
  },
  storageIntro: {
    ko: "역 안 개인 창고예요. 이사·계절옷·캠핑용품처럼 오래 둘 짐에 맞아요. 또타라커 앱에서 신청해요.",
    en: "Private rooms inside stations for moving boxes, seasonal clothes or gear. Apply in the T-Locker app.",
    zh: "车站内的个人仓库，适合搬家物品、换季衣物、露营用品等长期存放的行李。在T-Locker APP申请。",
    ja: "駅構内の個人倉庫です。引っ越し荷物・季節の服・キャンプ用品など長く置く荷物向け。T-Lockerアプリで申し込みます。",
  },
  perMonth: { ko: "월", en: "/mo", zh: "/月", ja: "/月" },
  discount: { ko: "{m}개월 {r}% 할인", en: "{m} mo −{r}%", zh: "{m}个月 −{r}%", ja: "{m}か月 {r}%割引" },
  storageHereNote: { ko: "이 역에 있어요", en: "At this station", zh: "就在本站", ja: "この駅にあります" },
  appAndroid: { ko: "또타라커 앱 (Android)", en: "T-Locker app (Android)", zh: "T-Locker APP (Android)", ja: "T-Lockerアプリ (Android)" },
  appIphone: { ko: "또타라커 앱 (iPhone)", en: "T-Locker app (iPhone)", zh: "T-Locker APP (iPhone)", ja: "T-Lockerアプリ (iPhone)" },

  tipsTitle: { ko: "맡기기 전에 꼭 확인", en: "Before you store", zh: "寄存前请确认", ja: "預ける前に確認" },
  tips: [
    {
      ko: `또타라커: ${LOCKER_HOURS.open}~${LOCKER_HOURS.close}시에만 넣고 찾을 수 있고, 최대 ${LOCKER_MAX_DAYS}일까지 보관돼요.`,
      en: `T-Locker: store and pick up ${LOCKER_HOURS.open}:00–${LOCKER_HOURS.close}:00 only, up to ${LOCKER_MAX_DAYS} days.`,
      zh: `T-Locker：仅在${LOCKER_HOURS.open}:00~${LOCKER_HOURS.close}:00可存取，最长保管${LOCKER_MAX_DAYS}天。`,
      ja: `T-Locker：${LOCKER_HOURS.open}時~${LOCKER_HOURS.close}時のみ出し入れでき、最大${LOCKER_MAX_DAYS}日間保管できます。`,
    },
    {
      ko: `또타러기지: 매일 ${LUGGAGE_HOURS.open}~${LUGGAGE_HOURS.close}시 운영해요.`,
      en: `T-Luggage desks: open daily ${LUGGAGE_HOURS.open}:00–${LUGGAGE_HOURS.close}:00.`,
      zh: `T-Luggage：每天${LUGGAGE_HOURS.open}:00~${LUGGAGE_HOURS.close}:00营业。`,
      ja: `T-Luggage：毎日${LUGGAGE_HOURS.open}時~${LUGGAGE_HOURS.close}時営業。`,
    },
    {
      ko: "귀중품·현금, 음식물, 동물, 위험물은 맡길 수 없어요.",
      en: "No valuables or cash, food, animals or hazardous items.",
      zh: "贵重物品·现金、食物、动物、危险品不可寄存。",
      ja: "貴重品・現金、飲食物、動物、危険物は預けられません。",
    },
    {
      ko: "대형 칸은 역마다 몇 칸뿐이라 주말·관광지 역은 일찍 차요.",
      en: "Each station has only a few large slots; they fill early at weekends and tourist stops.",
      zh: "每站大号格子只有几个，周末和景点附近的车站很快就会满。",
      ja: "大型ロッカーは駅ごとに数個しかなく、週末や観光地の駅はすぐ埋まります。",
    },
  ] satisfies Localized[],
  callCenter: {
    ko: "보관함 고장·분실 문의 1877-1265",
    en: "Locker help line 1877-1265",
    zh: "储物柜故障·遗失咨询 1877-1265",
    ja: "ロッカー故障・紛失のお問い合わせ 1877-1265",
  },

  sourceNote: {
    ko: `보관함 위치: 서울교통공사 물품보관함 위치정보(공공데이터포털, ${LOCKER_DATA_DATE} 기준, 1~8호선·9호선 2·3단계). 요금·운영시간·러기지·스토리지: 각 서비스 공식 안내 기준이며 바뀔 수 있어요.`,
    en: `Locker locations: Seoul Metro open data (as of ${LOCKER_DATA_DATE}, Lines 1–8 and Line 9 phases 2–3). Fees, hours, T-Luggage and T-Storage: official service pages; subject to change. Locker spots are machine-translated.`,
    zh: `储物柜位置：首尔交通公社公开数据（截至${LOCKER_DATA_DATE}，1~8号线·9号线2·3期）。费用、营业时间、T-Luggage和T-Storage以各服务官方说明为准，可能会变更。位置说明为机器翻译。`,
    ja: `ロッカー位置：ソウル交通公社の公開データ（${LOCKER_DATA_DATE}時点、1~8号線・9号線2・3段階）。料金・営業時間・T-Luggage・T-Storageは各サービスの公式案内に基づき、変更される場合があります。設置場所の説明は機械翻訳です。`,
  },
};

const PLAN_OPTIONS: { id: LuggagePlan; emoji: string; label: Localized }[] = [
  { id: "hours", emoji: "⏱️", label: { ko: "몇 시간 (오늘 찾기)", en: "A few hours", zh: "几小时 (当天取)", ja: "数時間 (当日受取)" } },
  { id: "send", emoji: "🚚", label: { ko: "숙소·공항으로 보내기", en: "Send to hotel/airport", zh: "送到住处·机场", ja: "宿・空港へ送る" } },
  { id: "months", emoji: "📦", label: { ko: "한 달 이상", en: "A month or more", zh: "一个月以上", ja: "1か月以上" } },
];

const BAG_OPTIONS: { id: BagSize; emoji: string; label: Localized }[] = [
  { id: "bag", emoji: "🎒", label: { ko: "백팩·쇼핑백", en: "Backpack/bags", zh: "背包·购物袋", ja: "リュック・買い物袋" } },
  { id: "carryOn", emoji: "🧳", label: { ko: "기내용 캐리어", en: "Carry-on", zh: "登机箱", ja: "機内持ち込みサイズ" } },
  { id: "large", emoji: "🛄", label: { ko: "대형 캐리어", en: "Large suitcase", zh: "大号行李箱", ja: "大型スーツケース" } },
];

const SERVICE_ACCENT = { tLocker: "#22a559", tLuggage: "#2563eb", storage: "#7c3aed" } as const;

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    t(template, locale),
  );
}

const PICK_COPY = {
  storageReason: {
    ko: "몇 주 이상 둘 짐이면 역 안 개인 창고가 보관함보다 싸고 편해요.",
    en: "For weeks or more, a private room in the station beats lockers.",
    zh: "存放几周以上的行李，车站内的个人仓库比储物柜更便宜方便。",
    ja: "数週間以上置く荷物なら、駅構内の個人倉庫がロッカーより安くて便利です。",
  },
  storagePrice: {
    ko: "월 {price}부터 · 장기 결제 최대 20% 할인",
    en: "From {price}/month · up to 20% off long-term",
    zh: "每月{price}起 · 长期付款最高优惠20%",
    ja: "月{price}から · 長期払いで最大20%割引",
  },
  delivery: { ko: "배송", en: "delivery", zh: "配送", ja: "配送" },
  sendReason: {
    ko: "6개 역 데스크에 맡기면 숙소·인천공항으로 당일 배송돼요. 빈손으로 여행하세요.",
    en: "Drop bags at one of 6 desks and they reach your hotel or Incheon Airport the same day.",
    zh: "交给6个车站的柜台，即可当日配送到住处或仁川机场。轻装出行吧。",
    ja: "6駅のカウンターに預ければ、宿泊先・仁川空港へ当日配送。手ぶらで旅しましょう。",
  },
  sendPrice: {
    ko: "{fits} · 서울 당일 {city} · 공항 {airport} (평일)",
    en: "{fits} · Seoul {city} · airport {airport} (weekday)",
    zh: "{fits} · 首尔当日 {city} · 机场 {airport} (工作日)",
    ja: "{fits} · ソウル当日 {city} · 空港 {airport} (平日)",
  },
  deskHere: {
    ko: "이 역에 또타러기지가 있어요. ",
    en: "There's a desk here. ",
    zh: "本站有T-Luggage柜台。",
    ja: "この駅にT-Luggageがあります。",
  },
  deskReason: {
    ko: "직원이 맡아줘서 대형 칸이 꽉 찼을 걱정이 없어요.",
    en: "Staff hold big bags, so no worrying about full large lockers.",
    zh: "由工作人员保管，不用担心大号格子已满。",
    ja: "スタッフが預かるので、大型ロッカーの満杯を心配しなくて済みます。",
  },
  basePrice: {
    ko: "4시간 {weekday} (주말 {weekend})",
    en: "4 h {weekday} (weekend {weekend})",
    zh: "4小时 {weekday} (周末 {weekend})",
    ja: "4時間 {weekday} (土日 {weekend})",
  },
  extraPrice: {
    ko: " · 이후 1시간 +{extra}",
    en: " · +{extra}/h after",
    zh: " · 之后每小时 +{extra}",
    ja: " · 以降1時間 +{extra}",
  },
  lockerReasons: {
    S: {
      ko: "백팩·쇼핑백은 소형 칸이면 충분해요.",
      en: "A small slot fits backpacks and shopping bags.",
      zh: "背包和购物袋用小号格子就够了。",
      ja: "リュックや買い物袋なら小型で十分です。",
    },
    M: {
      ko: "기내용 캐리어는 중형 칸에 들어가요.",
      en: "A carry-on fits a medium slot.",
      zh: "登机箱可放进中号格子。",
      ja: "機内持ち込みサイズは中型に入ります。",
    },
    L: {
      ko: "대형 캐리어는 대형 칸으로. 역마다 몇 칸뿐이라 일찍 차요.",
      en: "Use a large slot; there are only a few per station.",
      zh: "大号行李箱请用大号格子。每站只有几个，很快就满。",
      ja: "大型スーツケースは大型へ。駅ごとに数個しかなく、すぐ埋まります。",
    },
  } satisfies Record<LockerSize, Localized>,
};

function pickCopy(pick: LuggagePick, plan: LuggagePlan, hasDeskHere: boolean, locale: Locale) {
  const won = (amount: number) => formatWon(amount, locale);
  if (pick.service === "storage") {
    return {
      title: t(COPY.storage, locale),
      reason: t(PICK_COPY.storageReason, locale),
      price: fill(PICK_COPY.storagePrice, locale, { price: won(STORAGE_ROOMS.small.monthly) }),
    };
  }
  if (pick.service === "tLuggage") {
    const size = LUGGAGE_SIZES[pick.luggageSize ?? "S"];
    if (plan === "send") {
      return {
        title: `${t(COPY.tLuggage, locale)} ${t(PICK_COPY.delivery, locale)}`,
        reason: t(PICK_COPY.sendReason, locale),
        price: fill(PICK_COPY.sendPrice, locale, {
          fits: t(size.fits, locale),
          city: won(size.city[0]),
          airport: won(size.airport[0]),
        }),
      };
    }
    return {
      title: `${t(COPY.tLuggage, locale)} ${t(size.label, locale)}`,
      reason: `${hasDeskHere ? t(PICK_COPY.deskHere, locale) : ""}${t(PICK_COPY.deskReason, locale)}`,
      price: fill(PICK_COPY.basePrice, locale, { weekday: won(size.base[0]), weekend: won(size.base[1]) }),
    };
  }
  const sizeId: LockerSize = pick.lockerSize ?? "M";
  const size = LOCKER_SIZES[sizeId];
  return {
    title: `${t(COPY.tLocker, locale)} ${t(size.label, locale)} (${size.dims})`,
    reason: t(PICK_COPY.lockerReasons[sizeId], locale),
    price:
      fill(PICK_COPY.basePrice, locale, { weekday: won(size.base[0]), weekend: won(size.base[1]) }) +
      fill(PICK_COPY.extraPrice, locale, { extra: won(size.extra) }),
  };
}

function OptionChips<T extends string>({
  options,
  value,
  onChange,
  locale,
}: {
  options: { id: T; emoji: string; label: Localized }[];
  value: T;
  onChange: (next: T) => void;
  locale: Locale;
}) {
  return (
    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-0.5 rounded-xl border px-1.5 py-2 text-[11.5px] font-bold leading-tight ${
              active ? "border-[#22a559] bg-[#eefaf2] text-[#15803d]" : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            <span className="text-[18px]" aria-hidden>
              {option.emoji}
            </span>
            {t(option.label, locale)}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, emoji, children, id }: { title: string; emoji: string; children: ReactNode; id?: string }) {
  return (
    <section
      id={id}
      className="mt-3 rounded-2xl border border-line bg-surface px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
    >
      <h2 className="text-[15px] font-extrabold tracking-tight text-neutral-900">
        <span aria-hidden>{emoji} </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExternalButton({ href, color, children }: { href: string; color: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2.5 flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      {children}
      <span aria-hidden>↗</span>
    </a>
  );
}

function AppLinks({ locale }: { locale: Locale }) {
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
      <ExternalButton href={t(LUGGAGE_LINKS.appGooglePlay, locale)} color={SERVICE_ACCENT.storage}>
        {t(COPY.appAndroid, locale)}
      </ExternalButton>
      <ExternalButton href={t(LUGGAGE_LINKS.appAppStore, locale)} color={SERVICE_ACCENT.storage}>
        {t(COPY.appIphone, locale)}
      </ExternalButton>
    </div>
  );
}

function FeeRow({ label, sub, price, highlight }: { label: ReactNode; sub: string; price: string; highlight: boolean }) {
  return (
    <li className={`flex items-center gap-2 px-2 py-1.5 ${highlight ? "rounded-lg bg-[#eefaf2]" : ""}`}>
      <span className="min-w-0 flex-1 text-[12.5px] font-bold text-neutral-800">
        {label}
        <span className="ml-1 text-[11px] font-semibold text-neutral-400">{sub}</span>
      </span>
      <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-neutral-900">{price}</span>
    </li>
  );
}

export default function LuggageScreen({
  initialStation,
  follow,
}: {
  initialStation: StationOption | null;
  follow: boolean;
}) {
  const locale = useLocale();
  const now = useNow();
  const [picked, setPicked] = useState<StationOption | null>(follow ? null : initialStation);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<LuggagePlan>("hours");
  const [bag, setBag] = useState<BagSize>("carryOn");
  const [hours, setHours] = useState<number>(4);
  const [weekendPick, setWeekendPick] = useState<boolean | null>(null);

  const tracker = useStationTracker({ autoStart: follow || !initialStation, quickStart: true });
  const current = picked ?? tracker.nearest ?? (follow ? initialStation : null);
  const live = !picked && tracker.tracking && tracker.nearest !== null;

  const lockers = current ? stationLockers(current) : [];
  const desk = current ? stationDesk(current) : null;
  const storage = current ? stationStorage(current) : null;
  const totalSlots = lockers.reduce((sum, locker) => sum + (locker.slots ?? 0), 0);
  const keys = current ? stationKeys(current) : [];
  const translated = useAutoTranslation(
    lockers.map((locker) => locker.detail),
    locale,
  );

  const pick = recommendLuggage(plan, bag, current);
  const pickText = pickCopy(pick, plan, desk !== null, locale);

  const weekend = weekendPick ?? (now !== null && isWeekend(new Date(now)));
  const hour = now !== null ? new Date(now).getHours() : null;
  const late = hour !== null && (hour >= LATE_HOUR || hour < LOCKER_HOURS.open);

  function selectStation(next: StationOption) {
    setPicked(next);
    setQuery("");
    if (tracker.tracking) tracker.stop();
    else tracker.dismissIssue();
  }

  function backToMyStation() {
    setPicked(null);
    tracker.start();
  }

  const pickHref =
    pick.service === "tLocker"
      ? t(LUGGAGE_LINKS.tLockerWeb, locale)
      : pick.service === "tLuggage"
        ? t(LUGGAGE_LINKS.tLuggage, locale)
        : null;

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={LUGGAGE_TITLE} icon={<LuggageIcon />} />

        <StationSearch
          className="relative z-20 mx-4"
          locale={locale}
          query={query}
          onQueryChange={setQuery}
          onSelect={selectStation}
          currentKey={current?.key ?? null}
          placeholder={t(COPY.search, locale)}
          near={tracker.position}
        />

        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5 pt-1">
          {current ? (
            <section
              className="mt-2 rounded-2xl px-4 py-3.5 text-white shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
              style={{ background: `linear-gradient(135deg, ${current.color}, #14532d)` }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-white/80">
                  📍 {t(live ? COPY.nearest : COPY.selected, locale)}
                </p>
                {picked ? (
                  <button
                    type="button"
                    onClick={backToMyStation}
                    className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur"
                  >
                    {t(COPY.backToMe, locale)}
                  </button>
                ) : null}
              </div>
              <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-tight">
                {t(current.name, locale)}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px] font-bold">
                <span className="rounded-full bg-white/20 px-2 py-0.5">
                  🔐{" "}
                  {lockers.length > 0
                    ? `${fill(COPY.lockerCount, locale, { n: lockers.length })}${
                        totalSlots > 0 ? ` · ${fill(COPY.slotCount, locale, { n: totalSlots })}+` : ""
                      }`
                    : t(COPY.noLocker, locale)}
                </span>
                {desk ? <span className="rounded-full bg-white/90 px-2 py-0.5 text-[#1d4ed8]">🙋 {t(COPY.deskHere, locale)}</span> : null}
                {storage ? (
                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[#6d28d9]">📦 {t(COPY.storageHere, locale)}</span>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="mt-2 rounded-2xl border border-line bg-surface px-4 py-5 text-center">
              <p className="text-[15px] font-extrabold text-neutral-900">
                <span aria-hidden>📍 </span>
                {t(COPY.locating, locale)}
              </p>
              <p className="mt-1.5 text-[12px] text-neutral-500">
                {tracker.issue ? t(LOCATION_ISSUE_COPY[tracker.issue], locale) : t(COPY.locatingHint, locale)}
              </p>
              {tracker.issue ? (
                <button
                  type="button"
                  onClick={backToMyStation}
                  className="mt-3 rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] font-semibold text-neutral-700"
                >
                  {t(COPY.retry, locale)}
                </button>
              ) : null}
            </section>
          )}

          <Section emoji="🧭" title={t(COPY.finderTitle, locale)}>
            <p className="mt-2 text-[12px] font-bold text-neutral-500">{t(COPY.planQuestion, locale)}</p>
            <OptionChips options={PLAN_OPTIONS} value={plan} onChange={setPlan} locale={locale} />
            {plan !== "months" ? (
              <>
                <p className="mt-2.5 text-[12px] font-bold text-neutral-500">{t(COPY.bagQuestion, locale)}</p>
                <OptionChips options={BAG_OPTIONS} value={bag} onChange={setBag} locale={locale} />
              </>
            ) : null}
            <div
              className="mt-3 rounded-xl border-2 px-3 py-2.5"
              style={{ borderColor: SERVICE_ACCENT[pick.service], backgroundColor: `${SERVICE_ACCENT[pick.service]}0d` }}
            >
              <p className="flex items-center gap-1.5 text-[14px] font-extrabold text-neutral-900">
                <span
                  className="shrink-0 rounded-full px-1.5 py-[1px] text-[10px] font-bold text-white"
                  style={{ backgroundColor: SERVICE_ACCENT[pick.service] }}
                >
                  {t(COPY.pickBadge, locale)}
                </span>
                {pickText.title}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-neutral-700">{pickText.reason}</p>
              <p className="mt-1 text-[12px] font-bold text-neutral-900">💰 {pickText.price}</p>
              {pick.service === "tLocker" && current && lockers.length === 0 ? (
                <p className="mt-1 text-[11.5px] font-semibold text-[#b45309]">⚠️ {t(COPY.noLockerHere, locale)}</p>
              ) : null}
              {pickHref ? (
                <ExternalButton href={pickHref} color={SERVICE_ACCENT[pick.service]}>
                  {t(pick.service === "tLocker" ? COPY.lockerWeb : COPY.deskBook, locale)}
                </ExternalButton>
              ) : (
                <AppLinks locale={locale} />
              )}
            </div>
          </Section>

          {current ? (
            <Section emoji="🔐" title={fill(COPY.lockersTitle, locale, { station: t(current.name, locale) })}>
              {late ? (
                <p className="mt-2 rounded-xl bg-[#fff3c4] px-2.5 py-2 text-[12px] font-bold leading-snug text-[#92400e]">
                  🌙 {fill(COPY.lateWarning, locale, { open: LOCKER_HOURS.open, close: LOCKER_HOURS.close })}
                </p>
              ) : null}
              {lockers.length > 0 ? (
                <ul className="mt-1 divide-y divide-neutral-100">
                  {lockers.map((locker, index) => (
                    <li key={`${locker.line}-${index}`} className="flex items-start gap-2 py-2">
                      <LineIcon line={locker.line} locale={locale} size="sm" className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold leading-snug text-neutral-900">
                          {locker.floor ? (
                            <span className="mr-1 rounded bg-neutral-100 px-1 py-[1px] text-[11px] font-extrabold text-neutral-600">
                              {locker.floor === "중층" ? t(COPY.mezzanine, locale) : locker.floor}
                            </span>
                          ) : null}
                          {translated(locker.detail)}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-neutral-500">
                          {locker.slots ? <span>{fill(COPY.slotCount, locale, { n: locker.slots })}</span> : null}
                          {locker.insideGate ? (
                            <span className="rounded-full bg-[#e8f0ff] px-1.5 text-[10px] font-bold text-[#2563eb]">
                              {t(COPY.insideGate, locale)}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{t(COPY.noLockerHere, locale)}</p>
              )}
              {lockers.length > 0 ? (
                <>
                  <ExternalButton href={t(LUGGAGE_LINKS.tLockerWeb, locale)} color={SERVICE_ACCENT.tLocker}>
                    {t(COPY.lockerWeb, locale)}
                  </ExternalButton>
                  <p className="mt-1.5 text-[11px] leading-snug text-neutral-500">{t(COPY.lockerWebHint, locale)}</p>
                </>
              ) : null}
            </Section>
          ) : null}

          <Section emoji="💰" title={t(COPY.feeTitle, locale)}>
            <div className="mt-2 flex gap-1.5">
              {[false, true].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setWeekendPick(value)}
                  aria-pressed={weekend === value}
                  className={`flex-1 rounded-full border py-1.5 text-[12px] font-bold ${
                    weekend === value
                      ? "border-[#1e293b] bg-[#1e293b] text-white"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {t(value ? COPY.weekend : COPY.weekday, locale)}
                </button>
              ))}
            </div>
            <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto">
              {HOUR_CHOICES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHours(value)}
                  aria-pressed={hours === value}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-bold ${
                    hours === value
                      ? "border-[#22a559] bg-[#eefaf2] text-[#15803d]"
                      : "border-neutral-200 bg-white text-neutral-700"
                  }`}
                >
                  {fill(COPY.hoursUnit, locale, { n: value })}
                </button>
              ))}
            </div>

            <p className="mt-3 text-[12px] font-extrabold text-[#15803d]">
              🔐 {t(COPY.tLocker, locale)} <span className="font-semibold text-neutral-400">· {t(COPY.selfService, locale)}</span>
            </p>
            <ul className="mt-0.5">
              {(Object.keys(LOCKER_SIZES) as LockerSize[]).map((size) => (
                <FeeRow
                  key={size}
                  label={t(LOCKER_SIZES[size].label, locale)}
                  sub={LOCKER_SIZES[size].dims}
                  price={formatWon(lockerFee(size, hours, weekend), locale)}
                  highlight={pick.service === "tLocker" && pick.lockerSize === size}
                />
              ))}
            </ul>
            <p className="mt-2 text-[12px] font-extrabold text-[#1d4ed8]">
              🙋 {t(COPY.tLuggage, locale)} <span className="font-semibold text-neutral-400">· {t(COPY.staffed, locale)}</span>
            </p>
            <ul className="mt-0.5">
              {(Object.keys(LUGGAGE_SIZES) as LuggageSize[]).map((size) => (
                <FeeRow
                  key={size}
                  label={t(LUGGAGE_SIZES[size].label, locale)}
                  sub={t(LUGGAGE_SIZES[size].fits, locale)}
                  price={formatWon(luggageFee(size, hours, weekend), locale)}
                  highlight={pick.service === "tLuggage" && plan === "hours" && pick.luggageSize === size}
                />
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-neutral-500">{t(COPY.feeNote, locale)}</p>
          </Section>

          <Section emoji="🙋" title={t(COPY.deskTitle, locale)}>
            <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">{t(COPY.deskIntro, locale)}</p>
            <ul className="mt-2 grid grid-cols-2 gap-1.5">
              {LUGGAGE_DESKS.map((item) => {
                const here = keys.includes(item.station);
                return (
                  <li
                    key={item.station}
                    className={`rounded-xl border px-2 py-1.5 ${
                      here ? "border-[#2563eb] bg-[#eef4ff]" : "border-neutral-200 bg-white"
                    }`}
                  >
                    <p className="flex items-center gap-1 text-[12.5px] font-extrabold text-neutral-900">
                      <LineIcon line={item.line} locale={locale} size="xs" />
                      {t(stationName(item.station), locale)}
                    </p>
                    <p className="mt-0.5 text-[10.5px] font-semibold text-neutral-500">{t(item.where, locale)}</p>
                    {here ? (
                      <p className="mt-0.5 text-[10.5px] font-bold text-[#2563eb]">{t(COPY.deskHereNote, locale)}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center">
              <div className="rounded-xl bg-[#f3f6fb] px-2 py-2">
                <p className="text-[11px] font-bold text-neutral-500">🚚 {t(COPY.deliveryCity, locale)}</p>
                <p className="mt-0.5 text-[13px] font-extrabold text-neutral-900">
                  {fill(COPY.from, locale, { price: formatWon(LUGGAGE_SIZES.S.city[0], locale) })}
                </p>
              </div>
              <div className="rounded-xl bg-[#f3f6fb] px-2 py-2">
                <p className="text-[11px] font-bold text-neutral-500">✈️ {t(COPY.deliveryAirport, locale)}</p>
                <p className="mt-0.5 text-[13px] font-extrabold text-neutral-900">
                  {fill(COPY.from, locale, { price: formatWon(LUGGAGE_SIZES.S.airport[0], locale) })}
                </p>
              </div>
            </div>
            <ExternalButton href={t(LUGGAGE_LINKS.tLuggage, locale)} color={SERVICE_ACCENT.tLuggage}>
              {t(COPY.deskBook, locale)}
            </ExternalButton>
          </Section>

          <Section emoji="📦" title={t(COPY.storageTitle, locale)}>
            <p className="mt-1.5 text-[12px] leading-snug text-neutral-600">{t(COPY.storageIntro, locale)}</p>
            <ul className="mt-2 grid grid-cols-3 gap-1.5 text-center">
              {Object.values(STORAGE_ROOMS).map((room) => (
                <li key={room.monthly} className="rounded-xl bg-[#f5f1ff] px-1.5 py-2">
                  <p className="text-[12.5px] font-extrabold text-[#6d28d9]">{t(room.label, locale)}</p>
                  <p className="text-[10px] font-semibold text-neutral-500">{t(room.size, locale)}</p>
                  <p className="mt-0.5 text-[12px] font-extrabold text-neutral-900">
                    {locale === "ko"
                      ? `${t(COPY.perMonth, locale)} ${formatWon(room.monthly, locale)}`
                      : `${formatWon(room.monthly, locale)}${t(COPY.perMonth, locale)}`}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[11px] font-semibold text-neutral-500">
              {STORAGE_DISCOUNTS.map((item) =>
                fill(COPY.discount, locale, { m: item.months, r: Math.round(item.rate * 100) }),
              ).join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {STORAGE_SITES.map((site) => {
                const here = keys.includes(site.station);
                return (
                  <span
                    key={site.station}
                    title={exitText(site.where, locale)}
                    className={`flex items-center gap-0.5 rounded-full py-0.5 pl-0.5 pr-2 text-[11px] font-bold ${
                      here ? "bg-[#7c3aed] text-white" : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <LineIcon line={site.line} locale={locale} size="xs" />
                    {locale === "ko" ? site.station.replace(/역$/, "") : t(stationName(site.station), locale)}
                  </span>
                );
              })}
            </div>
            {storage ? (
              <p className="mt-1.5 text-[11.5px] font-bold text-[#6d28d9]">
                📍 {t(COPY.storageHereNote, locale)} · {exitText(storage.where, locale)}
              </p>
            ) : null}
            <AppLinks locale={locale} />
          </Section>

          <Section emoji="⚠️" title={t(COPY.tipsTitle, locale)}>
            <ul className="mt-1.5 space-y-1">
              {COPY.tips.map((tip) => (
                <li key={tip.ko} className="flex gap-1.5 text-[12px] leading-snug text-neutral-700">
                  <span className="text-neutral-400" aria-hidden>
                    •
                  </span>
                  {t(tip, locale)}
                </li>
              ))}
            </ul>
            <a
              href={LUGGAGE_LINKS.callCenter}
              className="mt-2 inline-block rounded-full border border-neutral-200 px-3 py-1 text-[12px] font-bold text-neutral-700"
            >
              📞 {t(COPY.callCenter, locale)}
            </a>
          </Section>

          <p className="mt-4 text-[10.5px] leading-relaxed text-neutral-400">{t(COPY.sourceNote, locale)}</p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
