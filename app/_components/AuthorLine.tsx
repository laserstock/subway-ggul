import { t, type Locale } from "../_lib/i18n";
import { authorLabel, avatarEmoji, badgeById, type AvatarId, type BadgeId } from "../_lib/profile";

/** "장한평역 · 꿀벌 🐝 [🏅첫제보]" — Blind-style author line. Posts without an avatar fall back to the bee. */
export default function AuthorLine({
  station,
  nickname,
  avatar,
  badge,
  locale,
}: {
  station: string | null;
  nickname: string;
  avatar: AvatarId | null;
  badge: BadgeId | null;
  locale: Locale;
}) {
  const equipped = badgeById(badge);
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate">{authorLabel(station, nickname)}</span>
      <span className="shrink-0" aria-hidden>
        {avatarEmoji(avatar)}
      </span>
      {equipped ? (
        <span className="shrink-0 rounded-full bg-honey-soft px-1.5 py-[1px] text-[10.5px] font-extrabold text-honey-strong">
          {equipped.emoji}
          {t(equipped.short, locale)}
        </span>
      ) : null}
    </span>
  );
}
