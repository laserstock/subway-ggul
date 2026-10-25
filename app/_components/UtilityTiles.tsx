import ActionTile, { type ActionKind } from "./ActionTile";
import { HoneyPotIcon } from "./BottomNav";
import LineBadges from "./LineBadges";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";

export type UtilityHref = "/urgent" | "/shops" | "/transfer" | "/luggage";

type Utility = { kind: ActionKind; title: Localized; sub: Localized; href: UtilityHref };

const UTILITIES: Utility[] = [
  {
    kind: "urgent",
    title: { ko: "화장실 · 약국", en: "Restroom · Pharmacy", zh: "卫生间 · 药店", ja: "トイレ · 薬局" },
    sub: { ko: "개찰구 안/밖 3초 비교", en: "In/out of gate", zh: "闸机内/外比较", ja: "改札内/外を比較" },
    href: "/urgent",
  },
  {
    kind: "shops",
    title: { ko: "출구 주변 가게", en: "Shops by exits", zh: "出口周边商店", ja: "出口近くの店" },
    sub: { ko: "올영 · 카페 · 편의점", en: "Olive Young · Cafe · Store", zh: "Olive Young · 咖啡 · 便利店", ja: "オリヤン · カフェ · コンビニ" },
    href: "/shops",
  },
  {
    kind: "transfer",
    title: { ko: "빠른 환승", en: "Fast transfer", zh: "快速换乘", ja: "スムーズ乗換" },
    sub: { ko: "에스컬레이터 · 엘리베이터", en: "Escalator · Elevator", zh: "扶梯 · 电梯", ja: "エスカレーター · エレベーター" },
    href: "/transfer",
  },
  {
    kind: "luggage",
    title: { ko: "짐 보관", en: "Luggage", zh: "行李寄存", ja: "荷物預け" },
    sub: { ko: "또타라커 · 러기지", en: "T-Locker · T-Luggage", zh: "T-Locker · T-Luggage", ja: "T-Locker · T-Luggage" },
    href: "/luggage",
  },
];

const COPY = {
  check: { ko: "내리기 전 필수 체크!", en: "Before you get off!", zh: "下车前必看！", ja: "降りる前にチェック！" },
  honey: { ko: "꿀정보", en: "tips", zh: "攻略", ja: "お役立ち情報" },
} satisfies Record<string, Localized>;

/** "내리기 전 필수 체크! 잠실역 (2)(8) 꿀정보 🍯" and the four compact utility tiles, on home and every station page. */
export default function UtilityTiles({
  station,
  locale,
  hrefFor,
  className = "",
}: {
  station: StationOption | null;
  locale: Locale;
  hrefFor: (href: UtilityHref) => string;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-2 flex items-center gap-1 text-[15px] font-extrabold tracking-tight text-neutral-900">
        <span className="mr-0.5 shrink-0 text-[#b45309]">{t(COPY.check, locale)}</span>
        {station ? (
          <>
            <span className="min-w-0 truncate">{t(station.name, locale)}</span>
            <LineBadges station={station} locale={locale} size="sm" className="shrink-0" />
          </>
        ) : null}
        <span className="shrink-0">{t(COPY.honey, locale)}</span>
        <HoneyPotIcon size={20} />
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {UTILITIES.map((utility) => (
          <ActionTile
            key={utility.kind}
            kind={utility.kind}
            title={t(utility.title, locale)}
            sub={t(utility.sub, locale)}
            href={hrefFor(utility.href)}
          />
        ))}
      </div>
    </section>
  );
}
