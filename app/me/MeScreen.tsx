"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import BadgeMedal, { TIER_PILL } from "../_components/BadgeMedal";
import BeeAvatar from "../_components/BeeAvatar";
import BottomNav from "../_components/BottomNav";
import BottomSheet from "../_components/BottomSheet";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import PrimaryStationSheet from "../_components/PrimaryStationSheet";
import { APP_VERSION } from "../_components/SideDrawer";
import ThemePicker from "../_components/ThemePicker";
import { Toast, useToast } from "../_components/Toast";
import { deleteMyAccount } from "../_lib/account";
import { LANGUAGES, LOCALES, t, type Locale, type Localized } from "../_lib/i18n";
import { useLastStation } from "../_lib/lastStation";
import { PRIVACY_TITLE } from "../_lib/legal";
import { setLocale, useLocale } from "../_lib/locale";
import {
  authorLabel,
  AVATARS,
  BADGE_TRACKS,
  BADGES,
  badgeById,
  isAvatarUnlocked,
  NICKNAME_MAX,
  setActiveBadge,
  setAvatar,
  setNickname,
  setPrimaryStation,
  useProfile,
  type AvatarId,
  type BadgeId,
} from "../_lib/profile";
import { deleteReport, formatRelativeTime, useMyReports, useNow } from "../_lib/reports";
import { unblockAll, useSafety } from "../_lib/safety";
import { useDestinationStation } from "../_lib/selectedStation";
import { deleteSpotPost, useSpotActivity, type SpotPost } from "../_lib/spot";
import { ME_TITLE } from "./header";

const COPY = {
  profileHint: {
    ko: "꿀스팟에서 이 이름으로 이웃들과 소통해요",
    en: "This is how neighbors see you in Honey Spot",
    zh: "在蜜点中邻居们会看到这个名字",
    ja: "ハニースポットではこの名前で表示されます",
  },
  nickname: { ko: "닉네임", en: "Nickname", zh: "昵称", ja: "ニックネーム" },
  nicknamePlaceholder: { ko: "최대 10자", en: "Up to 10 characters", zh: "最多10个字", ja: "最大10文字" },
  edit: { ko: "수정", en: "Edit", zh: "修改", ja: "編集" },
  save: { ko: "저장", en: "Save", zh: "保存", ja: "保存" },
  cancel: { ko: "취소", en: "Cancel", zh: "取消", ja: "キャンセル" },
  homeStation: { ko: "나의 주 사용 역 (거주 역)", en: "My home station", zh: "我的常用车站（居住站）", ja: "よく使う駅（最寄り駅）" },
  homeStationHint: {
    ko: "블라인드의 회사명처럼 닉네임 앞에 표시돼요",
    en: "Shown before your nickname, like a company tag",
    zh: "会像公司标签一样显示在昵称前",
    ja: "会社名タグのようにニックネームの前に表示されます",
  },
  notSet: { ko: "등록 안 됨", en: "Not set", zh: "未设置", ja: "未登録" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  register: { ko: "등록", en: "Set", zh: "登记", ja: "登録" },
  clear: { ko: "해제", en: "Clear", zh: "清除", ja: "解除" },
  avatarTitle: { ko: "캐릭터 선택", en: "Choose a character", zh: "选择角色", ja: "キャラクターを選択" },
  avatarHint: {
    ko: "꿀벌 패밀리 12종 · 꿀스팟 글과 댓글에 닉네임과 함께 표시돼요",
    en: "12 bee family characters · Shown next to your nickname on posts and comments",
    zh: "12种蜜蜂家族角色 · 会和昵称一起显示在帖子和评论上",
    ja: "ミツバチファミリー12種 · 投稿とコメントでニックネームと一緒に表示されます",
  },
  avatarLocked: { ko: "💎 배지 필요", en: "💎 badge needed", zh: "需💎徽章", ja: "💎バッジが必要" },
  avatarLockedToast: {
    ko: "💎 다이아몬드 등급 배지를 달성하면 열려요",
    en: "Unlocks with any 💎 diamond-tier badge",
    zh: "获得任意💎钻石级徽章后解锁",
    ja: "💎ダイヤモンド級バッジを獲得すると解放されます",
  },
  avatarSaved: { ko: "캐릭터를 바꿨어요", en: "Character changed", zh: "已更换角色", ja: "キャラクターを変更しました" },
  changeAvatar: { ko: "캐릭터 변경", en: "Change character", zh: "更换角色", ja: "キャラクター変更" },
  stats: {
    ko: "꿀스팟 글|댓글|받은 공감|제보",
    en: "Posts|Comments|Likes|Reports",
    zh: "帖子|评论|获赞|上报",
    ja: "投稿|コメント|いいね|報告",
  },
  myPosts: { ko: "✏️ 내가 쓴 꿀스팟 글", en: "✏️ My Honey Spot posts", zh: "✏️ 我的蜜点帖子", ja: "✏️ 自分の投稿" },
  myPostsEmpty: {
    ko: "아직 쓴 글이 없어요. 호선 광장에 첫 수다를 남겨 보세요!",
    en: "No posts yet. Say hi in your line plaza!",
    zh: "还没有帖子，去线路广场打个招呼吧！",
    ja: "まだ投稿がありません。路線広場であいさつしてみよう！",
  },
  goPlaza: { ko: "🍯 꿀스팟 가기", en: "🍯 Go to Honey Spot", zh: "🍯 前往蜜点", ja: "🍯 ハニースポットへ" },
  scrapped: { ko: "🔖 스크랩한 글", en: "🔖 Saved posts", zh: "🔖 收藏的帖子", ja: "🔖 保存した投稿" },
  scrappedEmpty: {
    ko: "마음에 드는 글을 스크랩하면 여기에 모여요",
    en: "Posts you save will show up here",
    zh: "收藏的帖子会显示在这里",
    ja: "保存した投稿がここに表示されます",
  },
  reports: { ko: "📣 내 제보 내역", en: "📣 My reports", zh: "📣 我的上报", ja: "📣 自分の報告" },
  reportsEmpty: {
    ko: "아직 남긴 제보가 없어요. 홈에서 1초 제보를 남겨 보세요!",
    en: "No reports yet. Leave a 1-second report from Home!",
    zh: "还没有上报，去首页1秒上报吧！",
    ja: "まだ報告がありません。ホームから1秒で報告してみよう！",
  },
  delete: { ko: "삭제", en: "Delete", zh: "删除", ja: "削除" },
  deleted: { ko: "삭제했어요", en: "Deleted", zh: "已删除", ja: "削除しました" },
  benefits: { ko: "🎁 혜택함", en: "🎁 Rewards", zh: "🎁 福利箱", ja: "🎁 特典ボックス" },
  benefitsNote: {
    ko: "장착한 배지는 꿀스팟 새 글·댓글의 닉네임 옆에 표시돼요 · 💎 등급 배지를 달성하면 다이아몬드 꿀벌 캐릭터가 열려요",
    en: "Your badge shows next to your name on new posts and comments · Any 💎 badge unlocks the Diamond Bee",
    zh: "佩戴的徽章会显示在新帖子和评论的昵称旁 · 获得💎徽章可解锁钻石蜜蜂",
    ja: "装着したバッジは新しい投稿・コメントの名前の横に表示 · 💎バッジでダイヤモンドバチが解放",
  },
  collected: { ko: "획득 {n}/{total}", en: "{n}/{total} earned", zh: "已获得 {n}/{total}", ja: "獲得 {n}/{total}" },
  wearingNow: { ko: "대표 배지", en: "Wearing", zh: "代表徽章", ja: "代表バッジ" },
  noBadge: { ko: "없음", en: "None", zh: "无", ja: "なし" },
  total: { ko: "누적 {n}{unit}", en: "{n} so far", zh: "累计 {n}{unit}", ja: "累計 {n}{unit}" },
  equip: { ko: "장착하기", en: "Wear", zh: "佩戴", ja: "装着する" },
  equipped: { ko: "장착 중", en: "Wearing", zh: "佩戴中", ja: "装着中" },
  badgeEquipped: {
    ko: "{badge} 배지를 대표 배지로 장착했어요",
    en: "Now wearing the {badge} badge",
    zh: "已佩戴「{badge}」徽章",
    ja: "「{badge}」バッジを装着しました",
  },
  badgeRemoved: { ko: "대표 배지를 해제했어요", en: "Badge removed", zh: "已取下徽章", ja: "バッジを外しました" },
  settings: { ko: "⚙️ 앱 설정", en: "⚙️ Settings", zh: "⚙️ 应用设置", ja: "⚙️ アプリ設定" },
  language: { ko: "언어", en: "Language", zh: "语言", ja: "言語" },
  theme: { ko: "화면 모드", en: "Display mode", zh: "显示模式", ja: "表示モード" },
  manageMy: { ko: "⭐ My 역 & 출퇴근 동선 관리", en: "⭐ Manage My Stations & routes", zh: "⭐ 管理 My 车站与路线", ja: "⭐ My 駅 & ルートを管理" },
  version: { ko: "버전", en: "Version", zh: "版本", ja: "バージョン" },
  savedNote: {
    ko: "💾 프로필은 이 기기에, 글·제보는 이 기기의 익명 계정으로 서버에 저장돼요",
    en: "💾 Your profile stays on this device; posts and reports are saved to the server under this device's anonymous account",
    zh: "💾 个人资料保存在本设备，帖子和上报以本设备的匿名账号保存到服务器",
    ja: "💾 プロフィールはこの端末に、投稿と報告はこの端末の匿名アカウントでサーバーに保存されます",
  },
  profileSaved: { ko: "프로필을 저장했어요", en: "Profile saved", zh: "已保存个人资料", ja: "プロフィールを保存しました" },
  account: { ko: "🔒 개인정보 · 계정", en: "🔒 Privacy & account", zh: "🔒 隐私 · 账号", ja: "🔒 プライバシー・アカウント" },
  terms: {
    ko: "이용약관 · 커뮤니티 가이드라인",
    en: "Terms & community guidelines",
    zh: "使用条款 · 社区准则",
    ja: "利用規約・コミュニティガイドライン",
  },
  blocked: { ko: "차단한 사용자 {n}명", en: "{n} blocked users", zh: "已屏蔽 {n} 位用户", ja: "ブロック中のユーザー {n}人" },
  unblockAll: { ko: "모두 해제", en: "Unblock all", zh: "全部解除", ja: "すべて解除" },
  unblocked: { ko: "차단을 모두 해제했어요", en: "Everyone unblocked", zh: "已全部解除屏蔽", ja: "ブロックをすべて解除しました" },
  deleteAll: { ko: "내 데이터 모두 삭제", en: "Delete all my data", zh: "删除我的全部数据", ja: "自分のデータをすべて削除" },
  deleteTitle: {
    ko: "내 데이터를 모두 삭제할까요?",
    en: "Delete all your data?",
    zh: "要删除您的全部数据吗？",
    ja: "データをすべて削除しますか？",
  },
  deleteBody: {
    ko: "이 기기의 익명 계정과 그 계정으로 올린 꿀스팟 글·댓글, 역 제보, 공감·스크랩·투표, 보낸 의견이 서버에서 즉시 영구 삭제돼요. 프로필·내 역·설정 등 기기에 저장된 정보도 모두 지워지며 되돌릴 수 없어요.",
    en: "This device's anonymous account and every post, comment, report, like, save, vote and feedback message it made are permanently deleted from the server right away. Your profile, saved stations and settings on this device are erased too. This can't be undone.",
    zh: "本设备的匿名账号及其发布的帖子、评论、上报、点赞、收藏、投票和反馈将立即从服务器永久删除。本设备上的个人资料、车站和设置也会被清除，且无法恢复。",
    ja: "この端末の匿名アカウントと、そのアカウントの投稿・コメント・報告・いいね・保存・投票・ご意見がサーバーから直ちに完全削除されます。端末内のプロフィール・駅・設定も消去され、元に戻せません。",
  },
  deleteConfirm: { ko: "영구 삭제하기", en: "Delete permanently", zh: "永久删除", ja: "完全に削除する" },
  deleting: { ko: "삭제하는 중…", en: "Deleting…", zh: "正在删除…", ja: "削除中…" },
  deleteFailed: {
    ko: "삭제하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.",
    en: "Couldn't delete. Check your connection and try again.",
    zh: "删除失败。请检查网络连接后重试。",
    ja: "削除できませんでした。接続を確認して再度お試しください。",
  },
} satisfies Record<string, Localized>;

function DeleteAccountSheet({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "deleting" | "failed">("idle");

  async function confirm() {
    setStatus("deleting");
    if (await deleteMyAccount()) window.location.replace("/");
    else setStatus("failed");
  }

  return (
    <BottomSheet title={t(COPY.deleteTitle, locale)} onClose={status === "deleting" ? () => {} : onClose}>
      <div className="px-5 pb-1 pt-2">
        <p className="text-[13px] leading-relaxed text-neutral-600">{t(COPY.deleteBody, locale)}</p>
        {status === "failed" ? (
          <p role="alert" className="mt-3 rounded-xl bg-[#fef2f2] px-3 py-2 text-[12px] font-semibold text-[#dc2626]">
            {t(COPY.deleteFailed, locale)}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={status === "deleting"}
          className="mt-4 w-full rounded-2xl bg-[#dc2626] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {t(status === "deleting" ? COPY.deleting : COPY.deleteConfirm, locale)}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={status === "deleting"}
          className="mt-2 w-full rounded-2xl bg-surface-muted py-3.5 text-[15px] font-bold text-ink transition active:scale-[0.98]"
        >
          {t(COPY.cancel, locale)}
        </button>
      </div>
    </BottomSheet>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl bg-surface px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)] ring-1 ring-line">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[16px] font-extrabold tracking-tight text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PostRow({
  post,
  now,
  locale,
  onDelete,
}: {
  post: SpotPost;
  now: number | null;
  locale: Locale;
  onDelete?: () => void;
}) {
  return (
    <li className="flex items-start gap-2.5 rounded-2xl bg-surface-muted px-3 py-2.5">
      <LineIcon line={post.line} locale={locale} size="md" className="mt-0.5" />
      <Link href={`/spot?line=${encodeURIComponent(post.line)}`} className="min-w-0 flex-1">
        <p className="break-words text-[14px] font-bold leading-snug text-ink">{post.title}</p>
        <p className="mt-0.5 break-words text-[11px] leading-snug text-ink-muted">
          {authorLabel(post.station, post.author)}
          {now !== null ? ` · ${formatRelativeTime(post.createdAt, now, locale)}` : ""} · 👍 {post.likes} · 💬{" "}
          {post.commentCount}
        </p>
      </Link>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold text-neutral-400 active:bg-neutral-200"
        >
          {t(COPY.delete, locale)}
        </button>
      ) : null}
    </li>
  );
}

function AvatarSheet({
  locale,
  current,
  unlockedBadges,
  onClose,
  onPick,
}: {
  locale: Locale;
  current: AvatarId;
  unlockedBadges: BadgeId[];
  onClose: () => void;
  onPick: (id: AvatarId) => void;
}) {
  const [lockedTapped, setLockedTapped] = useState(false);

  return (
    <BottomSheet title={t(COPY.avatarTitle, locale)} onClose={onClose}>
      <p className="mt-1 px-5 text-[12px] text-ink-muted">{t(COPY.avatarHint, locale)}</p>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
        <ul className="grid grid-cols-3 gap-2.5">
          {AVATARS.map((avatar) => {
            const selected = avatar.id === current;
            const unlocked = isAvatarUnlocked(avatar, unlockedBadges);
            const premium = "requires" in avatar;
            return (
              <li key={avatar.id}>
                <button
                  type="button"
                  onClick={() => (unlocked ? onPick(avatar.id) : setLockedTapped(true))}
                  aria-pressed={selected}
                  aria-disabled={!unlocked}
                  className={`relative flex w-full flex-col items-center gap-1 rounded-2xl pb-2.5 pt-3 transition active:scale-95 ${
                    selected
                      ? "bg-honey-soft ring-2 ring-honey"
                      : premium
                        ? "bg-gradient-to-br from-[#22d3ee]/12 to-[#a855f7]/15 ring-1 ring-[#a5b4fc]/60"
                        : "bg-surface-muted"
                  }`}
                >
                  <span className={unlocked ? "" : "opacity-40 grayscale"}>
                    <BeeAvatar id={avatar.id} size={56} />
                  </span>
                  <span
                    className={`px-1 text-center text-[12px] font-bold leading-tight ${
                      selected ? "text-honey-strong" : premium ? "text-[#6d5df5]" : "text-ink-muted"
                    }`}
                  >
                    {t(avatar.label, locale)}
                  </span>
                  {unlocked ? null : (
                    <span className="absolute inset-x-2 top-[38%] rounded-full bg-[#2b2418]/85 py-0.5 text-[10px] font-bold text-white">
                      🔒 {t(COPY.avatarLocked, locale)}
                    </span>
                  )}
                  {selected ? (
                    <span
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-honey text-[11px] font-extrabold text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        {lockedTapped ? (
          <p className="mt-3 rounded-2xl bg-gradient-to-r from-[#22d3ee]/15 to-[#a855f7]/15 px-3.5 py-2.5 text-center text-[12px] font-bold text-[#6d5df5]">
            {t(COPY.avatarLockedToast, locale)}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function BadgeRow({
  badge,
  value,
  unit,
  goalText,
  unlocked,
  wearing,
  locale,
  onToggle,
}: {
  badge: (typeof BADGES)[number];
  value: number;
  unit: string;
  goalText: string;
  unlocked: boolean;
  wearing: boolean;
  locale: Locale;
  onToggle: () => void;
}) {
  const current = Math.min(value, badge.goal);
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
        wearing ? "bg-honey-soft ring-2 ring-honey" : unlocked ? "bg-honey-soft/60 ring-1 ring-[#f6e3a8]" : "bg-surface-muted"
      }`}
    >
      <BadgeMedal badge={badge} size={42} locked={!unlocked} />
      <div className="min-w-0 flex-1">
        <p className={`break-words text-[14px] font-extrabold leading-snug ${unlocked ? "text-ink" : "text-ink-muted"}`}>
          {t(badge.short, locale)}
        </p>
        <p className="mt-0.5 break-words text-[11px] font-semibold leading-snug text-ink-muted">{goalText}</p>
        {unlocked ? null : (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-honey" style={{ width: `${(current / badge.goal) * 100}%` }} />
            </div>
            <span className="shrink-0 text-[11px] font-extrabold tabular-nums text-ink-muted">
              {current}/{badge.goal}
              {unit}
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={!unlocked}
        onClick={onToggle}
        aria-pressed={wearing}
        className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold transition active:scale-95 disabled:active:scale-100 ${
          wearing
            ? "bg-[#2b2418] text-white"
            : unlocked
              ? "bg-surface text-honey-strong ring-1 ring-honey"
              : "bg-transparent text-neutral-400 ring-1 ring-line"
        }`}
      >
        {wearing ? `✓ ${t(COPY.equipped, locale)}` : unlocked ? t(COPY.equip, locale) : "🔒"}
      </button>
    </li>
  );
}

export default function MeScreen() {
  const locale = useLocale();
  const now = useNow();
  const profile = useProfile();
  const lastStation = useLastStation();
  const destination = useDestinationStation();
  const activity = useSpotActivity();
  const reports = useMyReports();
  const { toast, showToast } = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const [nicknameDraft, setNicknameDraft] = useState<string | null>(null);
  const [stationSheetOpen, setStationSheetOpen] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const safety = useSafety();

  const here = destination ?? lastStation;
  const primary = profile.primaryStation;
  const statLabels = t(COPY.stats, locale).split("|");
  const stats = [profile.stats.posts, profile.stats.comments, profile.stats.likes, profile.stats.reports];
  const equipped = badgeById(profile.activeBadge);

  function toggleBadge(id: BadgeId) {
    const wearing = profile.activeBadge === id;
    if (!setActiveBadge(wearing ? null : id)) return;
    const badge = badgeById(id);
    showToast(
      wearing || !badge
        ? t(COPY.badgeRemoved, locale)
        : t(COPY.badgeEquipped, locale).replace("{badge}", `${badge.emoji}${t(badge.short, locale)}`),
    );
  }

  function saveNickname() {
    if (nicknameDraft === null) return;
    setNickname(nicknameDraft);
    setNicknameDraft(null);
    showToast(t(COPY.profileSaved, locale));
  }

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader title={ME_TITLE} />

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          <section className="rounded-3xl bg-gradient-to-br from-[#fff6dc] to-[#fffdf6] px-4 py-4 ring-1 ring-[#f6e3a8]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAvatarSheetOpen(true)}
                aria-label={t(COPY.changeAvatar, locale)}
                className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(245,167,0,0.25)] transition active:scale-95"
              >
                <BeeAvatar id={profile.selectedAvatar} size={60} />
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2b2418] px-2 py-[2px] text-[10px] font-bold text-white"
                  aria-hidden
                >
                  {t(COPY.change, locale)}
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="break-words text-[19px] font-extrabold leading-tight tracking-tight text-ink">
                  {authorLabel(primary ? t(primary.name, locale) : null, profile.nickname)}
                </p>
                {equipped ? (
                  <p className="mt-1 flex">
                    <span
                      className={`min-w-0 break-words rounded-full px-2 py-0.5 text-[12px] font-extrabold leading-snug ${TIER_PILL[equipped.tier]}`}
                    >
                      {equipped.emoji} {t(equipped.short, locale)}
                    </span>
                  </p>
                ) : null}
                <p className="mt-1 text-[12px] text-ink-muted">{t(COPY.profileHint, locale)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/80 px-3.5 py-3">
              <p className="text-[12px] font-bold text-ink-muted">{t(COPY.nickname, locale)}</p>
              {nicknameDraft === null ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="min-w-0 break-words text-[16px] font-extrabold text-ink">{profile.nickname}</p>
                  <button
                    type="button"
                    onClick={() => setNicknameDraft(profile.nickname)}
                    className="shrink-0 rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-honey-strong ring-1 ring-[#f6e3a8] active:scale-95"
                  >
                    ✏️ {t(COPY.edit, locale)}
                  </button>
                </div>
              ) : (
                <form
                  className="mt-1.5 flex items-center gap-1.5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveNickname();
                  }}
                >
                  <input
                    value={nicknameDraft}
                    onChange={(event) => setNicknameDraft([...event.target.value].slice(0, NICKNAME_MAX).join(""))}
                    placeholder={t(COPY.nicknamePlaceholder, locale)}
                    aria-label={t(COPY.nickname, locale)}
                    className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[15px] font-bold text-ink outline-none focus:border-honey"
                  />
                  <button
                    type="button"
                    onClick={() => setNicknameDraft(null)}
                    className="shrink-0 rounded-xl px-2.5 py-2 text-[13px] font-semibold text-ink-muted"
                  >
                    {t(COPY.cancel, locale)}
                  </button>
                  <button
                    type="submit"
                    disabled={!nicknameDraft.trim()}
                    className="shrink-0 rounded-xl bg-[#2b2418] px-3 py-2 text-[13px] font-bold text-white disabled:bg-neutral-300"
                  >
                    {t(COPY.save, locale)}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-2 rounded-2xl bg-white/80 px-3.5 py-3">
              <p className="text-[12px] font-bold text-ink-muted">{t(COPY.homeStation, locale)}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                {primary ? (
                  <p className="flex min-w-0 flex-wrap items-center gap-1.5 text-[16px] font-extrabold leading-snug text-ink">
                    <LineBadges station={primary} locale={locale} size="md" />
                    <span className="min-w-0 break-words">{t(primary.name, locale)}</span>
                  </p>
                ) : (
                  <p className="text-[14px] font-semibold text-neutral-400">{t(COPY.notSet, locale)}</p>
                )}
                <div className="flex shrink-0 gap-1">
                  {primary ? (
                    <button
                      type="button"
                      onClick={() => setPrimaryStation(null)}
                      className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-neutral-400 active:bg-neutral-100"
                    >
                      {t(COPY.clear, locale)}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setStationSheetOpen(true)}
                    aria-haspopup="dialog"
                    className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-honey-strong ring-1 ring-[#f6e3a8] active:scale-95"
                  >
                    {t(primary ? COPY.change : COPY.register, locale)}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">{t(COPY.homeStationHint, locale)}</p>
            </div>
          </section>

          <ul className="mt-3 grid grid-cols-4 gap-2">
            {stats.map((value, index) => (
              <li key={statLabels[index]} className="rounded-2xl bg-surface px-1 py-2.5 text-center ring-1 ring-line">
                <p className="text-[18px] font-extrabold text-ink">{value}</p>
                <p className="mt-0.5 break-words text-[11px] font-semibold leading-tight text-ink-muted">{statLabels[index]}</p>
              </li>
            ))}
          </ul>

          <Section
            title={t(COPY.myPosts, locale)}
            action={
              <Link href="/spot" className="shrink-0 text-[12px] font-bold text-honey-strong">
                {t(COPY.goPlaza, locale)} ›
              </Link>
            }
          >
            {activity.posts.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-surface-muted px-4 py-5 text-center text-[12px] leading-relaxed text-neutral-500">
                {t(COPY.myPostsEmpty, locale)}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {activity.posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    now={now}
                    locale={locale}
                    onDelete={() => {
                      deleteSpotPost(post.id);
                      showToast(t(COPY.deleted, locale));
                    }}
                  />
                ))}
              </ul>
            )}
          </Section>

          <Section title={t(COPY.scrapped, locale)}>
            {activity.scrapped.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-surface-muted px-4 py-5 text-center text-[12px] text-neutral-500">
                {t(COPY.scrappedEmpty, locale)}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {activity.scrapped.map((post) => (
                  <PostRow key={post.id} post={post} now={now} locale={locale} />
                ))}
              </ul>
            )}
          </Section>

          <Section title={t(COPY.reports, locale)}>
            {reports.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-surface-muted px-4 py-5 text-center text-[12px] leading-relaxed text-neutral-500">
                {t(COPY.reportsEmpty, locale)}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {reports.map((report) => (
                  <li key={report.id} className="flex items-start gap-3 rounded-2xl bg-surface-muted px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#2563eb]">
                        📍 {t(report.stationName, locale)}
                        {now !== null ? (
                          <span className="ml-1.5 font-medium text-neutral-400">
                            {formatRelativeTime(report.createdAt, now, locale)}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[13px] text-neutral-800">{t(report.text, locale)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        deleteReport(report.id);
                        showToast(t(COPY.deleted, locale));
                      }}
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold text-neutral-400 active:bg-neutral-200"
                    >
                      {t(COPY.delete, locale)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title={t(COPY.benefits, locale)}
            action={
              <span className="shrink-0 rounded-full bg-honey-soft px-2.5 py-1 text-[12px] font-extrabold text-honey-strong">
                {t(COPY.collected, locale)
                  .replace("{n}", String(profile.unlockedBadges.length))
                  .replace("{total}", String(BADGES.length))}
              </span>
            }
          >
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
              {t(COPY.wearingNow, locale)}
              {equipped ? (
                <span className={`rounded-full px-2 py-0.5 font-extrabold ${TIER_PILL[equipped.tier]}`}>
                  {equipped.emoji} {t(equipped.short, locale)}
                </span>
              ) : (
                <span className="text-neutral-400">{t(COPY.noBadge, locale)}</span>
              )}
            </p>
            {BADGE_TRACKS.map((track) => {
              const value = profile.stats[track.metric];
              const unit = t(track.unit, locale);
              return (
                <div key={track.metric} className="mt-4">
                  <div className="flex items-baseline justify-between gap-2 px-0.5">
                    <h3 className="text-[14px] font-extrabold text-ink">
                      <span aria-hidden>{track.emoji}</span> {t(track.title, locale)}
                    </h3>
                    <span className="shrink-0 text-[11px] font-bold text-ink-muted">
                      {t(COPY.total, locale).replace("{n}", value.toLocaleString()).replace("{unit}", unit)}
                    </span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {BADGES.filter((badge) => badge.metric === track.metric).map((badge) => (
                      <BadgeRow
                        key={badge.id}
                        badge={badge}
                        value={value}
                        unit={unit}
                        goalText={t(track.goal, locale).replace("{n}", String(badge.goal))}
                        unlocked={profile.unlockedBadges.includes(badge.id)}
                        wearing={profile.activeBadge === badge.id}
                        locale={locale}
                        onToggle={() => toggleBadge(badge.id)}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{t(COPY.benefitsNote, locale)}</p>
          </Section>

          <Section title={t(COPY.settings, locale)}>
            <p className="mt-3 text-[12px] font-bold text-ink-muted">{t(COPY.language, locale)}</p>
            <div role="radiogroup" aria-label={t(COPY.language, locale)} className="mt-2 grid grid-cols-4 gap-1.5">
              {LOCALES.map((code) => {
                const active = code === locale;
                return (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setLocale(code)}
                    className={`flex flex-col items-center rounded-xl border py-2 text-[12px] font-bold transition-colors ${
                      active ? "border-honey bg-honey-soft text-honey-strong" : "border-line bg-surface text-ink"
                    }`}
                  >
                    <span aria-hidden>{LANGUAGES[code].flag}</span>
                    {LANGUAGES[code].native}
                  </button>
                );
              })}
            </div>
            <p className="mb-2 mt-4 text-[12px] font-bold text-ink-muted">{t(COPY.theme, locale)}</p>
            <ThemePicker />
            <Link
              href="/my"
              className="mt-4 flex items-center justify-between rounded-2xl bg-surface-muted px-3.5 py-3 text-[14px] font-bold text-ink active:scale-[0.99]"
            >
              {t(COPY.manageMy, locale)}
              <span className="text-neutral-400" aria-hidden>
                ›
              </span>
            </Link>
            <p className="mt-3 flex justify-between px-1 text-[12px] text-ink-muted">
              <span>{t(COPY.version, locale)}</span>
              <span>v{APP_VERSION}</span>
            </p>
          </Section>

          <Section title={t(COPY.account, locale)}>
            <div className="mt-3 flex flex-col gap-1.5">
              {(
                [
                  ["/privacy", PRIVACY_TITLE],
                  ["/terms", COPY.terms],
                ] as const
              ).map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-2xl bg-surface-muted px-3.5 py-3 text-[14px] font-bold text-ink active:scale-[0.99]"
                >
                  {t(label, locale)}
                  <span className="text-neutral-400" aria-hidden>
                    ›
                  </span>
                </Link>
              ))}
            </div>
            {safety.blocked.size > 0 ? (
              <div className="mt-3 flex items-center justify-between gap-2 px-1 text-[13px] font-semibold text-ink-muted">
                <span>🚫 {t(COPY.blocked, locale).replace("{n}", String(safety.blocked.size))}</span>
                <button
                  type="button"
                  onClick={() => {
                    unblockAll();
                    showToast(t(COPY.unblocked, locale));
                  }}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold text-honey-strong ring-1 ring-[#f6e3a8] active:scale-95"
                >
                  {t(COPY.unblockAll, locale)}
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              aria-haspopup="dialog"
              className="mt-3 w-full rounded-2xl py-2.5 text-[13px] font-bold text-[#dc2626] ring-1 ring-[#fecaca] active:bg-[#fef2f2]"
            >
              {t(COPY.deleteAll, locale)}
            </button>
          </Section>

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-neutral-400">{t(COPY.savedNote, locale)}</p>
        </main>

        <BottomNav active="me" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />

        <Toast message={toast} />

        {avatarSheetOpen ? (
          <AvatarSheet
            locale={locale}
            current={profile.selectedAvatar}
            unlockedBadges={profile.unlockedBadges}
            onClose={() => setAvatarSheetOpen(false)}
            onPick={(id) => {
              if (!setAvatar(id)) return;
              setAvatarSheetOpen(false);
              showToast(t(COPY.avatarSaved, locale));
            }}
          />
        ) : null}

        {deleteOpen ? <DeleteAccountSheet locale={locale} onClose={() => setDeleteOpen(false)} /> : null}

        {stationSheetOpen ? (
          <PrimaryStationSheet
            locale={locale}
            here={here}
            current={primary}
            onClose={() => setStationSheetOpen(false)}
            onPicked={() => {
              setStationSheetOpen(false);
              showToast(t(COPY.profileSaved, locale));
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
