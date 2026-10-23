"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import AuthorLine from "../_components/AuthorLine";
import BottomNav from "../_components/BottomNav";
import BottomSheet from "../_components/BottomSheet";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import PrimaryStationSheet from "../_components/PrimaryStationSheet";
import { APP_VERSION } from "../_components/SideDrawer";
import ThemePicker from "../_components/ThemePicker";
import { Toast, useToast } from "../_components/Toast";
import { LANGUAGES, LOCALES, t, type Locale, type Localized } from "../_lib/i18n";
import { useLastStation } from "../_lib/lastStation";
import { setLocale, useLocale } from "../_lib/locale";
import {
  authorLabel,
  AVATARS,
  avatarEmoji,
  BADGES,
  NICKNAME_MAX,
  setActiveBadge,
  setAvatar,
  setNickname,
  setPrimaryStation,
  syncReportCount,
  useProfile,
  type AvatarId,
} from "../_lib/profile";
import { deleteReport, formatRelativeTime, useMyReports, useNow } from "../_lib/reports";
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
    ko: "꿀스팟 글에 닉네임과 함께 표시돼요",
    en: "Shown next to your nickname on Honey Spot posts",
    zh: "会和昵称一起显示在蜜点帖子上",
    ja: "ハニースポットの投稿でニックネームと一緒に表示されます",
  },
  avatarSaved: { ko: "캐릭터를 바꿨어요", en: "Character changed", zh: "已更换角色", ja: "キャラクターを変更しました" },
  changeAvatar: { ko: "캐릭터 변경", en: "Change character", zh: "更换角色", ja: "キャラクター変更" },
  stats: {
    ko: "꿀스팟 글|댓글|스크랩|제보",
    en: "Posts|Comments|Saved|Reports",
    zh: "帖子|评论|收藏|上报",
    ja: "投稿|コメント|保存|報告",
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
    ko: "달성한 배지를 누르면 대표 배지로 장착돼요 · 장착한 배지는 꿀스팟 새 글에 표시돼요",
    en: "Tap an unlocked badge to wear it · It shows on your new Honey Spot posts",
    zh: "点击已达成的徽章即可佩戴 · 会显示在新的蜜点帖子上",
    ja: "達成したバッジをタップで装着 · 新しいハニースポット投稿に表示されます",
  },
  badgeGoal: { ko: "1초 제보 {n}회", en: "{n} quick reports", zh: "1秒上报 {n}次", ja: "1秒報告 {n}回" },
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
} satisfies Record<string, Localized>;

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
        <p className="truncate text-[14px] font-bold text-ink">{post.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink-muted">
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
  onClose,
  onPick,
}: {
  locale: Locale;
  current: AvatarId;
  onClose: () => void;
  onPick: (id: AvatarId) => void;
}) {
  return (
    <BottomSheet title={t(COPY.avatarTitle, locale)} onClose={onClose}>
      <p className="mt-1 px-5 text-[12px] text-ink-muted">{t(COPY.avatarHint, locale)}</p>
      <ul className="mt-4 grid grid-cols-3 gap-2.5 px-5 pb-2">
        {AVATARS.map((avatar) => {
          const selected = avatar.id === current;
          return (
            <li key={avatar.id}>
              <button
                type="button"
                onClick={() => onPick(avatar.id)}
                aria-pressed={selected}
                className={`relative flex w-full flex-col items-center gap-1 rounded-2xl py-3.5 transition active:scale-95 ${
                  selected ? "bg-honey-soft ring-2 ring-honey" : "bg-surface-muted"
                }`}
              >
                <span className="text-[36px] leading-none" aria-hidden>
                  {avatar.emoji}
                </span>
                <span className={`text-[12px] font-bold ${selected ? "text-honey-strong" : "text-ink-muted"}`}>
                  {t(avatar.label, locale)}
                </span>
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
    </BottomSheet>
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

  const here = destination ?? lastStation;
  const primary = profile.primaryStation;
  const statLabels = t(COPY.stats, locale).split("|");
  const stats = [activity.posts.length, activity.commentCount, activity.scrapped.length, profile.reportCount];

  useEffect(() => {
    syncReportCount(reports.length);
  }, [reports.length]);

  function toggleBadge(id: (typeof BADGES)[number]["id"]) {
    const wearing = profile.activeBadge === id;
    if (!setActiveBadge(wearing ? null : id)) return;
    const badge = BADGES.find((item) => item.id === id);
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
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[34px] shadow-[0_4px_12px_rgba(245,167,0,0.25)] transition active:scale-95"
              >
                <span aria-hidden>{avatarEmoji(profile.selectedAvatar)}</span>
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2b2418] px-2 py-[2px] text-[10px] font-bold text-white"
                  aria-hidden
                >
                  {t(COPY.change, locale)}
                </span>
              </button>
              <div className="min-w-0">
                <p className="text-[19px] font-extrabold tracking-tight text-ink">
                  <AuthorLine
                    station={primary ? t(primary.name, locale) : null}
                    nickname={profile.nickname}
                    avatar={profile.selectedAvatar}
                    badge={profile.activeBadge}
                    locale={locale}
                  />
                </p>
                <p className="mt-0.5 text-[12px] text-ink-muted">{t(COPY.profileHint, locale)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/80 px-3.5 py-3">
              <p className="text-[12px] font-bold text-ink-muted">{t(COPY.nickname, locale)}</p>
              {nicknameDraft === null ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-[16px] font-extrabold text-ink">{profile.nickname}</p>
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
                  <p className="flex min-w-0 items-center gap-1.5 text-[16px] font-extrabold text-ink">
                    <LineBadges station={primary} locale={locale} size="md" />
                    <span className="truncate">{t(primary.name, locale)}</span>
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
                <p className="mt-0.5 truncate text-[11px] font-semibold text-ink-muted">{statLabels[index]}</p>
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

          <Section title={t(COPY.benefits, locale)}>
            <ul className="mt-3 flex flex-col gap-2">
              {BADGES.map((badge) => {
                const current = Math.min(profile.reportCount, badge.goal);
                const unlocked = profile.unlockedBadges.includes(badge.id);
                const wearing = profile.activeBadge === badge.id;
                const body = (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[22px] ${
                          unlocked ? "bg-white shadow-[0_2px_8px_rgba(245,167,0,0.25)]" : "bg-white/70 grayscale"
                        }`}
                        aria-hidden
                      >
                        {badge.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-extrabold leading-snug text-ink">{t(badge.title, locale)}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">
                          {t(COPY.badgeGoal, locale).replace("{n}", String(badge.goal))}
                        </p>
                      </div>
                      {unlocked ? (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-extrabold ${
                            wearing ? "bg-[#2b2418] text-white" : "bg-white text-honey-strong ring-1 ring-[#f6e3a8]"
                          }`}
                        >
                          {wearing ? `✓ ${t(COPY.equipped, locale)}` : t(COPY.equip, locale)}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[12px] font-extrabold text-ink-muted">
                          {current}/{badge.goal}
                        </span>
                      )}
                    </div>
                    {unlocked ? null : (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden>
                        <div className="h-full rounded-full bg-honey" style={{ width: `${(current / badge.goal) * 100}%` }} />
                      </div>
                    )}
                  </>
                );
                return (
                  <li key={badge.id}>
                    {unlocked ? (
                      <button
                        type="button"
                        onClick={() => toggleBadge(badge.id)}
                        aria-pressed={wearing}
                        className={`block w-full rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.99] ${
                          wearing ? "bg-honey-soft ring-2 ring-honey" : "bg-honey-soft ring-1 ring-[#f6e3a8]"
                        }`}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className="rounded-2xl bg-surface-muted px-3.5 py-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] text-neutral-400">{t(COPY.benefitsNote, locale)}</p>
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

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-neutral-400">{t(COPY.savedNote, locale)}</p>
        </main>

        <BottomNav active="me" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />

        <Toast message={toast} />

        {avatarSheetOpen ? (
          <AvatarSheet
            locale={locale}
            current={profile.selectedAvatar}
            onClose={() => setAvatarSheetOpen(false)}
            onPick={(id) => {
              setAvatar(id);
              setAvatarSheetOpen(false);
              showToast(t(COPY.avatarSaved, locale));
            }}
          />
        ) : null}

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
