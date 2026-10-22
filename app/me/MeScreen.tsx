"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import { APP_VERSION } from "../_components/SideDrawer";
import StationSearch from "../_components/StationSearch";
import ThemePicker from "../_components/ThemePicker";
import { Toast, useToast } from "../_components/Toast";
import { LANGUAGES, LOCALES, t, type Locale, type Localized } from "../_lib/i18n";
import { useLastStation } from "../_lib/lastStation";
import { setLocale, useLocale } from "../_lib/locale";
import { authorLabel, authorTag, NICKNAME_MAX, setHomeStation, setNickname, useProfile } from "../_lib/profile";
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
  notSet: { ko: "아직 등록하지 않았어요", en: "Not set yet", zh: "尚未设置", ja: "まだ登録していません" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  register: { ko: "등록", en: "Set", zh: "登记", ja: "登録" },
  clear: { ko: "해제", en: "Clear", zh: "清除", ja: "解除" },
  useHere: { ko: "📍 지금 {station}로 설정", en: "📍 Use {station}", zh: "📍 设为当前 {station}", ja: "📍 今の{station}に設定" },
  searchStation: { ko: "역 이름 검색 (예: 장한평역)", en: "Search a station", zh: "搜索车站", ja: "駅名で検索" },
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
    ko: "베타: 조건을 채운 혜택은 정식 오픈 때 지급돼요",
    en: "Beta: rewards you unlock are paid out at launch",
    zh: "测试版：达成条件的福利将在正式上线时发放",
    ja: "ベータ：達成した特典は正式オープン時に付与されます",
  },
  unlocked: { ko: "달성!", en: "Unlocked!", zh: "已达成！", ja: "達成！" },
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

type Benefit = { id: string; emoji: string; title: Localized; goal: number; metric: "posts" | "reports" };

const BENEFITS: Benefit[] = [
  {
    id: "first-report",
    emoji: "🏅",
    title: { ko: "첫 제보 달성 배지", en: "First report badge", zh: "首次上报徽章", ja: "初報告バッジ" },
    goal: 1,
    metric: "reports",
  },
  {
    id: "spot-coffee",
    emoji: "☕",
    title: {
      ko: "꿀스팟 글 5개 작성 시 편의점 커피 쿠폰",
      en: "Write 5 posts: convenience-store coffee",
      zh: "发布5篇帖子：便利店咖啡券",
      ja: "5件投稿でコンビニコーヒー券",
    },
    goal: 5,
    metric: "posts",
  },
  {
    id: "locker",
    emoji: "🧳",
    title: {
      ko: "제보 10회 달성 시 T-Locker 1시간 무료",
      en: "10 reports: 1 free hour of T-Locker",
      zh: "上报10次：T-Locker免费1小时",
      ja: "報告10回でT-Locker 1時間無料",
    },
    goal: 10,
    metric: "reports",
  },
];

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
  const [pickingStation, setPickingStation] = useState(false);
  const [stationQuery, setStationQuery] = useState("");

  const here = destination ?? lastStation;
  const tag = authorTag(profile, here);
  const statLabels = t(COPY.stats, locale).split("|");
  const stats = [activity.posts.length, activity.commentCount, activity.scrapped.length, reports.length];
  const progress = { posts: activity.posts.length, reports: reports.length };

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
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[30px] shadow-[0_4px_12px_rgba(245,167,0,0.25)]"
                aria-hidden
              >
                🐝
              </span>
              <div className="min-w-0">
                <p className="truncate text-[19px] font-extrabold tracking-tight text-ink">
                  [{authorLabel(tag.station, tag.nickname)}]
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
                {profile.homeStation ? (
                  <p className="flex min-w-0 items-center gap-1.5 text-[16px] font-extrabold text-ink">
                    <LineBadges station={profile.homeStation} locale={locale} size="md" />
                    <span className="truncate">{t(profile.homeStation.name, locale)}</span>
                  </p>
                ) : (
                  <p className="text-[14px] font-semibold text-neutral-400">{t(COPY.notSet, locale)}</p>
                )}
                <div className="flex shrink-0 gap-1">
                  {profile.homeStation ? (
                    <button
                      type="button"
                      onClick={() => setHomeStation(null)}
                      className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-neutral-400 active:bg-neutral-100"
                    >
                      {t(COPY.clear, locale)}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPickingStation((value) => !value)}
                    aria-expanded={pickingStation}
                    className="rounded-full bg-surface px-3 py-1 text-[12px] font-bold text-honey-strong ring-1 ring-[#f6e3a8] active:scale-95"
                  >
                    {t(profile.homeStation ? COPY.change : COPY.register, locale)}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">{t(COPY.homeStationHint, locale)}</p>
              {pickingStation ? (
                <div className="mt-2.5">
                  {here && here.key !== profile.homeStation?.key ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHomeStation(here);
                        setPickingStation(false);
                        showToast(t(COPY.profileSaved, locale));
                      }}
                      className="mb-2 rounded-full bg-honey-soft px-3 py-1.5 text-[12px] font-bold text-honey-strong active:scale-95"
                    >
                      {t(COPY.useHere, locale).replace("{station}", t(here.name, locale))}
                    </button>
                  ) : null}
                  <StationSearch
                    locale={locale}
                    query={stationQuery}
                    onQueryChange={setStationQuery}
                    onSelect={(station) => {
                      setHomeStation(station);
                      setStationQuery("");
                      setPickingStation(false);
                      showToast(t(COPY.profileSaved, locale));
                    }}
                    currentKey={profile.homeStation?.key ?? null}
                    placeholder={t(COPY.searchStation, locale)}
                    near={here?.center ?? null}
                    inputClassName="rounded-xl border border-line bg-surface px-3 py-2.5"
                  />
                </div>
              ) : null}
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
              {BENEFITS.map((benefit) => {
                const current = Math.min(progress[benefit.metric], benefit.goal);
                const done = current >= benefit.goal;
                return (
                  <li
                    key={benefit.id}
                    className={`rounded-2xl px-3.5 py-3 ${done ? "bg-honey-soft ring-1 ring-[#f6e3a8]" : "bg-surface-muted"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[20px]" aria-hidden>
                        {benefit.emoji}
                      </span>
                      <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-ink">{t(benefit.title, locale)}</p>
                      <span className={`shrink-0 text-[12px] font-extrabold ${done ? "text-honey-strong" : "text-ink-muted"}`}>
                        {done ? t(COPY.unlocked, locale) : `${current}/${benefit.goal}`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden>
                      <div className="h-full rounded-full bg-honey" style={{ width: `${(current / benefit.goal) * 100}%` }} />
                    </div>
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
      </div>
    </div>
  );
}
