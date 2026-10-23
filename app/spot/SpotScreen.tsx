"use client";

import { useRef, useState } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import { LineIcon } from "../_components/LineBadges";
import { Toast, useToast } from "../_components/Toast";
import { t, type Locale, type Localized } from "../_lib/i18n";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import AuthorLine from "../_components/AuthorLine";
import PrimaryStationSheet from "../_components/PrimaryStationSheet";
import { authorLabel, authorTag, useProfile } from "../_lib/profile";
import { formatRelativeTime, useNow } from "../_lib/reports";
import { useDestinationStation } from "../_lib/selectedStation";
import {
  DEFAULT_PLAZA_LINE,
  filterSpotPosts,
  markSpotViewed,
  PLAZA_LINES,
  SPOT_TABS,
  toggleSpotLike,
  toggleSpotScrap,
  usePlazaOnline,
  useSpotPosts,
  type SpotPost,
  type SpotTab,
} from "../_lib/spot";
import { lineLabel, stationLines } from "../_lib/subwayLine";
import { SERVER_CONFIGURED } from "../_lib/supabase";
import { SpotIcon } from "./header";
import { CATEGORY_META, CommentSheet, WriteSheet } from "./SpotSheets";

const COPY = {
  plaza: { ko: "{line} 광장", en: "{line} Plaza", zh: "{line}广场", ja: "{line}広場" },
  online: {
    ko: "지금 {n}명이 {plaza}에서 실시간 수다 중",
    en: "{n} people chatting in {plaza} now",
    zh: "现在有{n}人在{plaza}实时聊天",
    ja: "今{n}人が{plaza}でリアルタイムおしゃべり中",
  },
  connecting: { ko: "광장에 입장하는 중…", en: "Entering the plaza…", zh: "正在进入广场…", ja: "広場に入場中…" },
  offline: {
    ko: "서버 연결 준비 중이에요",
    en: "Server connection is being set up",
    zh: "服务器连接准备中",
    ja: "サーバー接続を準備中です",
  },
  composer: {
    ko: "{line} 이웃들에게 실시간 수다를 던져보세요",
    en: "Say something to your {line} neighbors",
    zh: "和{line}的邻居们聊聊吧",
    ja: "{line}のご近所さんに話しかけてみよう",
  },
  search: { ko: "광장 글 검색", en: "Search posts", zh: "搜索帖子", ja: "投稿を検索" },
  searchPlaceholder: { ko: "제목·내용·역 이름으로 검색", en: "Search title, text, station", zh: "按标题、内容、车站搜索", ja: "タイトル・本文・駅名で検索" },
  views: { ko: "조회 {n}", en: "{n} views", zh: "浏览 {n}", ja: "閲覧 {n}" },
  like: { ko: "공감", en: "Like", zh: "赞", ja: "いいね" },
  comment: { ko: "댓글", en: "Comment", zh: "评论", ja: "コメント" },
  scrap: { ko: "스크랩", en: "Save", zh: "收藏", ja: "保存" },
  write: { ko: "글쓰기", en: "Write", zh: "发帖", ja: "投稿" },
  mine: { ko: "내 글", en: "Mine", zh: "我的", ja: "自分" },
  empty: {
    ko: "아직 이 말머리에 글이 없어요. 첫 글의 주인공이 되어 보세요!",
    en: "No posts here yet. Be the first!",
    zh: "这里还没有帖子，来发第一帖吧！",
    ja: "まだ投稿がありません。最初の投稿をどうぞ！",
  },
  emptySearch: { ko: "'{q}' 검색 결과가 없어요", en: "No results for '{q}'", zh: "没有找到“{q}”", ja: "「{q}」の検索結果はありません" },
  needStation: {
    ko: "주 사용 역을 먼저 설정해 주세요!",
    en: "Please set your home station first!",
    zh: "请先设置常用车站！",
    ja: "よく使う駅を先に設定してください！",
  },
  posted: { ko: "광장에 글을 올렸어요 🐝", en: "Posted to the plaza 🐝", zh: "已发布到广场 🐝", ja: "広場に投稿しました 🐝" },
  scrapped: { ko: "스크랩했어요 · 마이에서 볼 수 있어요", en: "Saved · find it in Me", zh: "已收藏 · 可在我的中查看", ja: "保存しました · マイで確認できます" },
  unscrapped: { ko: "스크랩을 취소했어요", en: "Removed from saved", zh: "已取消收藏", ja: "保存を取り消しました" },
  beta: {
    ko: "광장 글은 같은 호선을 타는 모든 이용자에게 공개돼요 · 개인정보는 올리지 말아 주세요",
    en: "Plaza posts are public to everyone on this line · Please don't share personal info",
    zh: "广场帖子对同线所有用户公开 · 请勿发布个人信息",
    ja: "広場の投稿は同じ路線の全員に公開されます · 個人情報は投稿しないでください",
  },
} satisfies Record<string, Localized>;

const TAB_META: Record<SpotTab, { label: Localized; emoji?: string }> = {
  all: { label: { ko: "전체", en: "All", zh: "全部", ja: "すべて" } },
  popular: { label: { ko: "인기", en: "Hot", zh: "热门", ja: "人気" }, emoji: "💬" },
  commute: { label: CATEGORY_META.commute.label, emoji: "🚃" },
  food: { label: CATEGORY_META.food.label, emoji: "🍽️" },
  lost: { label: CATEGORY_META.lost.label, emoji: "🎒" },
};

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function plazaName(line: string, locale: Locale) {
  return fill(t(COPY.plaza, locale), { line: t(lineLabel(line), locale) });
}

function plazaTitle(line: string): Localized {
  const title = (locale: Locale) => `${plazaName(line, locale)} 🚆`;
  return { ko: title("ko"), en: title("en"), zh: title("zh"), ja: title("ja") };
}

function ThumbIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 10.5V20H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1zM7 10.5l3.6-6.3a1.9 1.9 0 0 1 3.4 1.5L13.2 9.5h5.3a2 2 0 0 1 2 2.4l-1.3 6.4a2 2 0 0 1-2 1.7H7"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.18 : 0}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4c4.7 0 8.5 3.1 8.5 7s-3.8 7-8.5 7c-1 0-2-.1-2.9-.4L5 19.5l1.2-3.4C4.6 14.8 3.5 13 3.5 11c0-3.9 3.8-7 8.5-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" fill="#ffbe2e" stroke="#ffbe2e" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.5 7l3 3" stroke="#2b2418" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PostCard({
  post,
  now,
  locale,
  onOpen,
  onLike,
  onScrap,
}: {
  post: SpotPost;
  now: number | null;
  locale: Locale;
  onOpen: () => void;
  onLike: () => void;
  onScrap: () => void;
}) {
  const category = CATEGORY_META[post.category];
  return (
    <article className="rounded-[20px] border border-line bg-surface px-4 pb-3 pt-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <div className="flex min-w-0 items-center gap-1 font-bold text-ink">
          <AuthorLine
            station={post.station}
            nickname={post.author}
            avatar={post.avatar}
            badge={post.badge}
            locale={locale}
          />
          {post.mine ? (
            <span className="shrink-0 rounded-full bg-honey-soft px-1.5 py-[1px] text-[10px] text-honey-strong">
              {t(COPY.mine, locale)}
            </span>
          ) : null}
        </div>
        <p className="shrink-0 text-ink-muted">
          {now !== null ? `${formatRelativeTime(post.createdAt, now, locale)} · ` : ""}
          {fill(t(COPY.views, locale), { n: post.views })}
        </p>
      </div>
      <button type="button" onClick={onOpen} className="mt-1.5 block w-full text-left">
        {post.category !== "free" ? (
          <span className="mb-1 inline-block rounded-md bg-surface-muted px-1.5 py-[1px] text-[11px] font-bold text-ink-muted">
            {category.emoji} {t(category.label, locale)}
          </span>
        ) : null}
        <h3 className="text-[17px] font-extrabold leading-snug tracking-tight text-ink">{post.title}</h3>
        <p className="mt-1 line-clamp-3 whitespace-pre-line text-[14px] leading-relaxed text-neutral-600">{post.body}</p>
      </button>
      {post.bestReply ? (
        <button
          type="button"
          onClick={onOpen}
          className="mt-2.5 flex w-full gap-1.5 border-l-2 border-line py-0.5 pl-2.5 text-left text-[13px] leading-snug text-neutral-500"
        >
          <span aria-hidden>💬</span>
          <span className="line-clamp-2">
            <b className="font-bold text-neutral-700">{authorLabel(post.bestReply.station, post.bestReply.author)}:</b>{" "}
            {post.bestReply.text}
          </span>
        </button>
      ) : null}
      <div className="mt-3 flex items-center gap-4 text-[13px] font-semibold text-neutral-500">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={post.liked}
          className={`flex items-center gap-1 transition active:scale-90 ${post.liked ? "text-honey-strong" : ""}`}
        >
          <ThumbIcon filled={post.liked} />
          {t(COPY.like, locale)} {post.likes}
        </button>
        <button type="button" onClick={onOpen} className="flex items-center gap-1 transition active:scale-90">
          <BubbleIcon />
          {t(COPY.comment, locale)} {post.commentCount}
        </button>
        <button
          type="button"
          onClick={onScrap}
          aria-pressed={post.scrapped}
          className={`flex items-center gap-1 transition active:scale-90 ${post.scrapped ? "text-honey-strong" : ""}`}
        >
          <BookmarkIcon filled={post.scrapped} />
          {t(COPY.scrap, locale)}
        </button>
      </div>
    </article>
  );
}

export function SpotSkeleton() {
  return (
    <div className="px-4" aria-hidden>
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="h-8 w-[76px] animate-pulse rounded-full bg-surface-muted" />
        ))}
      </div>
      <div className="mt-3 h-[42px] animate-pulse rounded-2xl bg-surface-muted" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="mt-3 h-[150px] animate-pulse rounded-[20px] bg-surface-muted" />
      ))}
    </div>
  );
}

export default function SpotScreen({ initialLine }: { initialLine: string | null }) {
  const locale = useLocale();
  const now = useNow();
  const profile = useProfile();
  const destination = useDestinationStation();
  const lastStation = useLastStation();
  const here = destination ?? lastStation;
  const lineSource = here ?? profile.primaryStation;
  const hereLines = lineSource ? stationLines(lineSource) : [];
  const [pickedLine, setPickedLine] = useState(initialLine);
  const line = pickedLine ?? hereLines[0] ?? DEFAULT_PLAZA_LINE;
  const posts = useSpotPosts(line);
  const online = usePlazaOnline(line);
  const [tab, setTab] = useState<SpotTab>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [writeOpen, setWriteOpen] = useState(false);
  const [stationGateOpen, setStationGateOpen] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const closeWrite = () => setWriteOpen(false);
  const closeComments = () => setOpenPostId(null);

  const ready = now !== null || initialLine !== null;
  const me = authorTag(profile, here);
  const plaza = plazaName(line, locale);
  const visible = filterSpotPosts(posts, tab, searchOpen ? query : "");
  const openPost = openPostId ? (posts.find((post) => post.id === openPostId) ?? null) : null;
  const homeLines = profile.primaryStation ? stationLines(profile.primaryStation) : [];
  const plazaLines = [...new Set([...hereLines, ...homeLines, ...PLAZA_LINES])];

  function startWriting() {
    if (profile.primaryStation) setWriteOpen(true);
    else setStationGateOpen(true);
  }

  function changeLine(next: string) {
    setPickedLine(next);
    setTab("all");
    const url = new URL(window.location.href);
    url.searchParams.set("line", next);
    window.history.replaceState(null, "", url);
    mainRef.current?.scrollTo({ top: 0 });
  }

  function openComments(post: SpotPost) {
    markSpotViewed(post.id);
    setOpenPostId(post.id);
  }

  function scrap(post: SpotPost) {
    showToast(t(toggleSpotScrap(post.id) ? COPY.scrapped : COPY.unscrapped, locale));
  }

  const [onlineBefore, onlineAfter] = fill(t(COPY.online, locale), { plaza }).split("{n}");
  const subtitle =
    online !== null ? (
      <span className="truncate">
        {onlineBefore}
        <b className="font-extrabold text-honey-strong">{online.toLocaleString()}</b>
        {onlineAfter}
      </span>
    ) : (
      <span className="truncate">{t(SERVER_CONFIGURED ? COPY.connecting : COPY.offline, locale)}</span>
    );

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader
          backHref="/"
          title={plazaTitle(line)}
          subtitle={subtitle}
          icon={<SpotIcon />}
          action={
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setQuery("");
              }}
              aria-pressed={searchOpen}
              aria-label={t(COPY.search, locale)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${
                searchOpen ? "bg-ink text-white" : "text-ink"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          }
        />

        {ready ? (
          <>
            <div className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-2">
              {plazaLines.map((candidate) => {
                const active = candidate === line;
                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => changeLine(candidate)}
                    aria-pressed={active}
                    className={`flex shrink-0 items-center gap-1 rounded-full py-1 pl-1 pr-2.5 text-[12px] font-bold transition active:scale-95 ${
                      active ? "bg-ink text-white" : "bg-surface text-ink-muted ring-1 ring-line"
                    }`}
                  >
                    <LineIcon line={candidate} locale={locale} size="sm" />
                    {plazaName(candidate, locale)}
                  </button>
                );
              })}
            </div>

            <div role="tablist" className="no-scrollbar flex shrink-0 gap-4 overflow-x-auto border-b border-line px-4">
              {SPOT_TABS.map((id) => {
                const active = id === tab;
                const meta = TAB_META[id];
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`-mb-px shrink-0 border-b-2 pb-2 pt-1 text-[14px] transition-colors ${
                      active ? "border-ink font-extrabold text-ink" : "border-transparent font-semibold text-neutral-400"
                    }`}
                  >
                    {t(meta.label, locale)}
                    {meta.emoji ? <span className="ml-0.5" aria-hidden>{meta.emoji}</span> : null}
                  </button>
                );
              })}
            </div>

            {searchOpen ? (
              <div className="shrink-0 px-4 pt-3">
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t(COPY.searchPlaceholder, locale)}
                  aria-label={t(COPY.search, locale)}
                  className="w-full rounded-2xl border border-line bg-surface-muted px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-neutral-400 focus:border-honey"
                />
              </div>
            ) : null}

            <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-24 pt-3">
              <button
                type="button"
                onClick={startWriting}
                className="flex w-full items-center rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[14px] text-neutral-400 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1 truncate">
                  {fill(t(COPY.composer, locale), { line: t(lineLabel(line), locale) })}
                </span>
                <span aria-hidden>✏️</span>
              </button>

              {visible.length === 0 ? (
                <p className="mt-8 px-6 text-center text-[13px] leading-relaxed text-neutral-400">
                  {searchOpen && query.trim()
                    ? fill(t(COPY.emptySearch, locale), { q: query.trim() })
                    : t(COPY.empty, locale)}
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {visible.map((post) => (
                    <li key={post.id}>
                      <PostCard
                        post={post}
                        now={now}
                        locale={locale}
                        onOpen={() => openComments(post)}
                        onLike={() => toggleSpotLike(post.id)}
                        onScrap={() => scrap(post)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 px-1 text-[11px] leading-relaxed text-neutral-400">{t(COPY.beta, locale)}</p>
            </main>

            <button
              type="button"
              onClick={startWriting}
              className="absolute bottom-[84px] right-4 z-30 flex items-center gap-1.5 rounded-full bg-[#2b2418] py-3 pl-3.5 pr-4 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(43,36,24,0.35)] transition active:scale-95"
            >
              <PencilIcon />
              {t(COPY.write, locale)}
            </button>
          </>
        ) : (
          <div className="flex-1">
            <SpotSkeleton />
          </div>
        )}

        <BottomNav active="spot" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />

        <Toast message={toast} />

        {stationGateOpen ? (
          <PrimaryStationSheet
            locale={locale}
            here={here}
            current={null}
            notice={t(COPY.needStation, locale)}
            onClose={() => setStationGateOpen(false)}
            onPicked={() => {
              setStationGateOpen(false);
              setWriteOpen(true);
            }}
          />
        ) : null}

        {writeOpen && profile.primaryStation ? (
          <WriteSheet
            line={line}
            plaza={plaza}
            author={{
              station: profile.primaryStation.name.ko,
              nickname: profile.nickname,
              avatar: profile.selectedAvatar,
              badge: profile.activeBadge,
            }}
            locale={locale}
            onClose={closeWrite}
            onPosted={() => {
              setWriteOpen(false);
              setTab("all");
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              showToast(t(COPY.posted, locale));
            }}
          />
        ) : null}

        {openPost ? (
          <CommentSheet
            post={openPost}
            author={{ ...me, avatar: profile.selectedAvatar, badge: profile.activeBadge }}
            now={now}
            locale={locale}
            onClose={closeComments}
          />
        ) : null}
      </div>
    </div>
  );
}
