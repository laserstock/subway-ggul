"use client";

import { useEffect } from "react";
import { t, type Localized } from "../_lib/i18n";
import { useLocale } from "../_lib/locale";
import {
  badgeById,
  byPrestige,
  dismissBadgeCelebration,
  setActiveBadge,
  useBadgeCelebration,
  useProfile,
} from "../_lib/profile";
import BadgeMedal, { TIER_PILL } from "./BadgeMedal";
import BeeAvatar from "./BeeAvatar";

const COPY = {
  title: { ko: "🎉 축하합니다!", en: "🎉 Congratulations!", zh: "🎉 恭喜！", ja: "🎉 おめでとうございます！" },
  subtitle: {
    ko: "새로운 배지를 획득했습니다!",
    en: "You earned a new badge!",
    zh: "你获得了新徽章！",
    ja: "新しいバッジを獲得しました！",
  },
  more: {
    ko: "외 {n}개 배지도 함께 획득했어요",
    en: "+{n} more badges earned",
    zh: "另外还获得了{n}枚徽章",
    ja: "ほかに{n}個のバッジも獲得しました",
  },
  diamondAvatar: {
    ko: "💎 다이아몬드 꿀벌 캐릭터가 열렸어요!",
    en: "💎 The Diamond Bee character is unlocked!",
    zh: "💎 钻石蜜蜂角色已解锁！",
    ja: "💎 ダイヤモンドバチが解放されました！",
  },
  equip: { ko: "대표 배지로 장착하기", en: "Wear this badge", zh: "设为代表徽章", ja: "代表バッジにする" },
  wearing: { ko: "✓ 장착 중", en: "✓ Wearing", zh: "✓ 佩戴中", ja: "✓ 装着中" },
  close: { ko: "확인", en: "OK", zh: "确定", ja: "OK" },
} satisfies Record<string, Localized>;

const CONFETTI_COLORS = ["#ffc93c", "#ff5d8f", "#67e8f9", "#818cf8", "#34d399", "#f97316"];
const CONFETTI = Array.from({ length: 36 }, (_, index) => ({
  left: (index * 37 + 11) % 100,
  delay: (index % 9) * 0.11,
  duration: 2.1 + (index % 5) * 0.32,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  width: 6 + (index % 3) * 2,
  round: index % 4 === 0,
}));

/** Fireworks popup shown the moment a badge is unlocked, on whichever screen the user is on. */
export default function BadgeCelebration() {
  const locale = useLocale();
  const ids = useBadgeCelebration();
  const profile = useProfile();
  const badges = ids.flatMap((id) => badgeById(id) ?? []).sort(byPrestige);
  const open = badges.length > 0;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissBadgeCelebration();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;
  const [top, ...rest] = badges;
  const wearing = profile.activeBadge === top.id;
  const diamondAvatar = badges.some((badge) => badge.tier === "diamond");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-8" role="dialog" aria-modal="true" aria-labelledby="badge-celebration-title">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={dismissBadgeCelebration}
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-black/55 backdrop-blur-[2px]"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {CONFETTI.map((piece, index) => (
          <span
            key={index}
            className={`confetti-piece absolute top-0 block ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
            style={{
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.round ? piece.width : piece.width * 1.6,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>

      <section className="relative w-full max-w-[320px] animate-[celebrate-pop_480ms_cubic-bezier(0.2,1.3,0.4,1)_both] rounded-[28px] bg-surface px-6 pb-5 pt-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
        <div className="relative mx-auto flex h-[112px] w-[112px] items-center justify-center">
          <span className="absolute inset-0 animate-[badge-glow_2.4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(255,201,60,0.45)_0%,rgba(255,201,60,0)_70%)]" />
          <BadgeMedal badge={top} size={92} />
        </div>
        <h2 id="badge-celebration-title" className="mt-3 text-[22px] font-extrabold tracking-tight text-ink">
          {t(COPY.title, locale)}
        </h2>
        <p className="mt-1 text-[14px] font-semibold text-ink-muted">{t(COPY.subtitle, locale)}</p>
        <p className={`mx-auto mt-3 inline-flex rounded-full px-3 py-1 text-[15px] font-extrabold ${TIER_PILL[top.tier]}`}>
          {top.emoji} {t(top.short, locale)}
        </p>

        {rest.length > 0 ? (
          <div className="mt-3">
            <div className="flex justify-center gap-1.5">
              {rest.slice(0, 5).map((badge) => (
                <BadgeMedal key={badge.id} badge={badge} size={30} />
              ))}
            </div>
            <p className="mt-1.5 text-[12px] text-ink-muted">{t(COPY.more, locale).replace("{n}", String(rest.length))}</p>
          </div>
        ) : null}

        {diamondAvatar ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#22d3ee]/15 to-[#a855f7]/15 px-3 py-2 text-[12px] font-bold text-[#6d5df5]">
            <BeeAvatar id="diamond" size={26} />
            {t(COPY.diamondAvatar, locale)}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            disabled={wearing}
            onClick={() => {
              setActiveBadge(top.id);
              dismissBadgeCelebration();
            }}
            className="rounded-2xl bg-[#2b2418] py-3 text-[15px] font-extrabold text-white transition active:scale-[0.98] disabled:bg-honey-soft disabled:text-honey-strong"
          >
            {t(wearing ? COPY.wearing : COPY.equip, locale)}
          </button>
          <button
            type="button"
            onClick={dismissBadgeCelebration}
            className="rounded-2xl py-2.5 text-[14px] font-bold text-ink-muted active:bg-surface-muted"
          >
            {t(COPY.close, locale)}
          </button>
        </div>
      </section>
    </div>
  );
}
