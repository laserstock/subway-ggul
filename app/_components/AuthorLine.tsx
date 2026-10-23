import { t, type Locale } from "../_lib/i18n";
import { authorLabel, badgeById, type AvatarId, type BadgeId } from "../_lib/profile";
import { TIER_PILL } from "./BadgeMedal";
import BeeAvatar from "./BeeAvatar";

/** "장한평역 · 꿀벌 🐝 [💎다이아몬드 꿀벌]" — Blind-style author line. Posts without a character get the baby bee. */
export default function AuthorLine({
  station,
  nickname,
  avatar,
  badge,
  locale,
  avatarSize = 18,
}: {
  station: string | null;
  nickname: string;
  avatar: AvatarId | null;
  badge: BadgeId | null;
  locale: Locale;
  avatarSize?: number;
}) {
  const equipped = badgeById(badge);
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{authorLabel(station, nickname)}</span>
      <BeeAvatar id={avatar} size={avatarSize} />
      {equipped ? (
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10.5px] font-extrabold ${TIER_PILL[equipped.tier]}`}
        >
          {equipped.emoji}
          {t(equipped.short, locale)}
        </span>
      ) : null}
    </span>
  );
}
