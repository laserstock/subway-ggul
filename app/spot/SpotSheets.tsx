"use client";

import Link from "next/link";
import { useState } from "react";
import AuthorLine from "../_components/AuthorLine";
import BeeAvatar from "../_components/BeeAvatar";
import Sheet from "../_components/BottomSheet";
import { FlagButton, type FlagRequest } from "../_components/FlagSheet";
import { t, type Locale, type Localized } from "../_lib/i18n";
import { authorLabel, type AvatarId, type BadgeId } from "../_lib/profile";
import { formatRelativeTime } from "../_lib/reports";
import { usePostTranslation } from "../_lib/translate";
import {
  addSpotComment,
  addSpotPost,
  SPOT_BODY_MAX,
  SPOT_CATEGORIES,
  SPOT_COMMENT_MAX,
  SPOT_COMMENTS_SHOWN,
  SPOT_TITLE_MAX,
  useSpotComments,
  type SpotCategory,
  type SpotComment,
  type SpotPost,
} from "../_lib/spot";

const COPY = {
  writeTitle: { ko: "{plaza}에 글쓰기", en: "Post to {plaza}", zh: "在{plaza}发帖", ja: "{plaza}に投稿" },
  category: { ko: "말머리", en: "Topic", zh: "分类", ja: "カテゴリー" },
  titlePlaceholder: { ko: "제목 (최대 40자)", en: "Title (max 40)", zh: "标题（最多40字）", ja: "タイトル（最大40文字）" },
  bodyPlaceholder: {
    ko: "역 이웃들과 나누고 싶은 이야기를 적어 주세요",
    en: "Share something with your line neighbors",
    zh: "写下想和同线邻居分享的内容",
    ja: "同じ路線のご近所さんと共有したいことを書いてください",
  },
  postAs: { ko: "이 이름으로 올라가요", en: "Posting as", zh: "将以此身份发布", ja: "この名前で投稿されます" },
  changeProfile: { ko: "마이에서 변경", en: "Change in Me", zh: "在我的中修改", ja: "マイで変更" },
  submit: { ko: "올리기", en: "Post", zh: "发布", ja: "投稿する" },
  submitting: { ko: "올리는 중…", en: "Posting…", zh: "发布中…", ja: "投稿中…" },
  rules: {
    ko: "글은 이 광장의 모든 이용자에게 공개돼요 · 욕설·비방·개인정보 노출 글은 숨김 처리될 수 있어요",
    en: "Posts are public to everyone in this plaza · Abusive or private-info posts may be hidden",
    zh: "帖子对本广场所有用户公开 · 辱骂、诽谤或泄露隐私的帖子可能被隐藏",
    ja: "投稿はこの広場の全員に公開されます · 暴言・誹謗・個人情報を含む投稿は非表示になる場合があります",
  },
  comments: { ko: "댓글 {n}", en: "{n} comments", zh: "评论 {n}", ja: "コメント {n}" },
  noComments: {
    ko: "아직 댓글이 없어요. 첫 댓글을 남겨 보세요!",
    en: "No comments yet. Be the first!",
    zh: "还没有评论，来抢沙发吧！",
    ja: "まだコメントがありません。最初のコメントをどうぞ！",
  },
  hiddenComments: {
    ko: "최근 댓글 {n}개까지 보여요",
    en: "Showing the latest {n} comments",
    zh: "仅显示最近{n}条评论",
    ja: "最新{n}件のコメントを表示しています",
  },
  commentPlaceholder: { ko: "댓글 달기…", en: "Add a comment…", zh: "写评论…", ja: "コメントする…" },
  send: { ko: "등록", en: "Send", zh: "发送", ja: "送信" },
  me: { ko: "나", en: "Me", zh: "我", ja: "自分" },
  translate: {
    ko: "🌐 번역",
    en: "🌐 Translate to English / 번역",
    zh: "🌐 翻译成中文 / 번역",
    ja: "🌐 日本語に翻訳 / 번역",
  },
  original: { ko: "🌐 원문 보기", en: "🌐 Show original", zh: "🌐 查看原文", ja: "🌐 原文を表示" },
  translating: { ko: "번역 중…", en: "Translating…", zh: "翻译中…", ja: "翻訳中…" },
  translated: { ko: "번역됨", en: "Translated", zh: "已翻译", ja: "翻訳済み" },
  translateFailed: {
    ko: "번역하지 못했어요 · 다시 시도",
    en: "Couldn't translate · Retry",
    zh: "翻译失败 · 重试",
    ja: "翻訳できませんでした · 再試行",
  },
} satisfies Record<string, Localized>;

/** Title, body and loaded comments: everything the translated view of a post covers. */
export function postTexts(post: SpotPost) {
  return [post.title, post.body, ...post.comments.map((comment) => comment.text)];
}

/** "[🌐 Translate to English / 번역]" under a post body; only rendered when the app language isn't Korean. */
export function TranslateToggle({
  translation,
  locale,
}: {
  translation: ReturnType<typeof usePostTranslation>;
  locale: Locale;
}) {
  if (!translation.available) return null;
  const { on, status } = translation;
  const label =
    status === "loading"
      ? COPY.translating
      : status === "error"
        ? COPY.translateFailed
        : on
          ? COPY.original
          : COPY.translate;
  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          translation.toggle();
        }}
        disabled={status === "loading"}
        aria-pressed={on && status === "done"}
        className={`rounded-full px-2.5 py-1 text-[12px] font-bold transition active:scale-95 disabled:opacity-60 ${
          status === "error"
            ? "bg-[#fee2e2] text-[#b91c1c]"
            : on
              ? "bg-surface-muted text-ink-muted ring-1 ring-line"
              : "bg-[#eef4ff] text-[#2563eb]"
        }`}
      >
        {t(label, locale)}
      </button>
      {on && status === "done" ? (
        <span className="text-[11px] font-semibold text-neutral-400">{t(COPY.translated, locale)}</span>
      ) : null}
    </div>
  );
}

export const CATEGORY_META: Record<SpotCategory, { emoji: string; label: Localized }> = {
  commute: { emoji: "🚃", label: { ko: "출퇴근", en: "Commute", zh: "通勤", ja: "通勤" } },
  food: { emoji: "🍽️", label: { ko: "역주변 맛집", en: "Food nearby", zh: "站点周边美食", ja: "駅近グルメ" } },
  lost: { emoji: "🎒", label: { ko: "분실물", en: "Lost & found", zh: "失物招领", ja: "落とし物" } },
  free: { emoji: "💬", label: { ko: "자유", en: "Chat", zh: "闲聊", ja: "雑談" } },
};

export type Author = { station: string | null; nickname: string; avatar: AvatarId; badge: BadgeId | null };

function AuthorChip({ author, locale }: { author: Author; locale: Locale }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-honey-soft px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-ink-muted">{t(COPY.postAs, locale)}</p>
        <p className="text-[14px] font-extrabold text-ink">
          <AuthorLine {...author} locale={locale} />
        </p>
      </div>
      <Link href="/me" className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-honey-strong">
        {t(COPY.changeProfile, locale)} ›
      </Link>
    </div>
  );
}

export function WriteSheet({
  line,
  plaza,
  author,
  locale,
  onClose,
  onPosted,
}: {
  line: string;
  plaza: string;
  author: Author & { station: string };
  locale: Locale;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [category, setCategory] = useState<SpotCategory>("free");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ready = title.trim().length > 0 && body.trim().length > 0;

  async function submit() {
    if (!ready || submitting) return;
    setSubmitting(true);
    const ok = await addSpotPost({
      line,
      station: author.station,
      author: author.nickname,
      avatar: author.avatar,
      badge: author.badge,
      category,
      title: title.trim(),
      body: body.trim(),
    });
    // On failure the error toast explains why; the draft stays so the user can retry.
    if (ok) onPosted();
    else setSubmitting(false);
  }

  return (
    <Sheet title={t(COPY.writeTitle, locale).replace("{plaza}", plaza)} onClose={onClose}>
      <form
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <p className="mt-3 text-[12px] font-bold text-ink-muted">{t(COPY.category, locale)}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {SPOT_CATEGORIES.map((id) => {
            const active = id === category;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition active:scale-95 ${
                  active ? "bg-ink text-white" : "bg-surface-muted text-ink-muted ring-1 ring-line"
                }`}
              >
                {CATEGORY_META[id].emoji} {t(CATEGORY_META[id].label, locale)}
              </button>
            );
          })}
        </div>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value.slice(0, SPOT_TITLE_MAX))}
          placeholder={t(COPY.titlePlaceholder, locale)}
          className="mt-3 w-full rounded-2xl border border-line bg-surface-muted px-3.5 py-3 text-[15px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-neutral-400 focus:border-honey"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value.slice(0, SPOT_BODY_MAX))}
          placeholder={t(COPY.bodyPlaceholder, locale)}
          rows={5}
          className="mt-2 w-full resize-none rounded-2xl border border-line bg-surface-muted px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none placeholder:text-neutral-400 focus:border-honey"
        />
        <p className="mt-0.5 text-right text-[11px] text-neutral-400">
          {body.length}/{SPOT_BODY_MAX}
        </p>
        <div className="mt-1.5">
          <AuthorChip author={author} locale={locale} />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">{t(COPY.rules, locale)}</p>
        <button
          type="submit"
          disabled={!ready || submitting}
          className="mb-1 mt-3 w-full rounded-2xl bg-[#2b2418] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:bg-neutral-300"
        >
          ✏️ {t(submitting ? COPY.submitting : COPY.submit, locale)}
        </button>
      </form>
    </Sheet>
  );
}

function CommentRow({
  comment,
  text,
  now,
  locale,
  onFlag,
}: {
  comment: SpotComment;
  /** Shown text: the comment itself or its translation. */
  text: string;
  now: number | null;
  locale: Locale;
  onFlag: () => void;
}) {
  return (
    <li className="rounded-2xl bg-surface-muted px-3.5 py-2.5">
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
        <AuthorLine
          station={comment.station}
          nickname={comment.author}
          avatar={comment.avatar}
          badge={comment.badge}
          locale={locale}
          avatarSize={16}
        />
        {comment.mine ? (
          <span className="rounded-full bg-honey-soft px-1.5 py-[1px] text-[10px] text-honey-strong">
            {t(COPY.me, locale)}
          </span>
        ) : null}
        {now !== null ? (
          <span className="ml-auto text-[11px] font-medium text-neutral-400">
            {formatRelativeTime(comment.createdAt, now, locale)}
          </span>
        ) : null}
        {comment.mine ? null : <FlagButton onClick={onFlag} className={now !== null ? "-my-1 -mr-1.5" : "-my-1 -mr-1.5 ml-auto"} />}
      </div>
      <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-neutral-700">{text}</p>
    </li>
  );
}

export function CommentSheet({
  post,
  author,
  now,
  locale,
  onClose,
  onFlag,
}: {
  post: SpotPost;
  author: Author;
  now: number | null;
  locale: Locale;
  onClose: () => void;
  onFlag: (request: FlagRequest) => void;
}) {
  const [draft, setDraft] = useState("");
  const loaded = useSpotComments(post.id);
  const hidden = loaded && post.commentCount > post.comments.length;
  const translation = usePostTranslation(post.id, postTexts(post), locale);

  async function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const ok = await addSpotComment(post.id, {
      station: author.station,
      author: author.nickname,
      avatar: author.avatar,
      badge: author.badge,
      text,
    });
    if (!ok) setDraft((current) => current || text);
  }

  return (
    <Sheet title={t(COPY.comments, locale).replace("{n}", String(post.commentCount))} onClose={onClose}>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5">
        <article className="mt-3 border-b border-line pb-3">
          <p className="text-[12px] font-bold text-ink-muted">
            <AuthorLine
              station={post.station}
              nickname={post.author}
              avatar={post.avatar}
              badge={post.badge}
              locale={locale}
            />
          </p>
          <h3 className="mt-1 text-[16px] font-extrabold leading-snug text-ink">{translation.show(post.title)}</h3>
          <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-neutral-600">
            {translation.show(post.body)}
          </p>
          <TranslateToggle translation={translation} locale={locale} />
        </article>
        {post.comments.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-neutral-400">{t(COPY.noComments, locale)}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {post.comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                text={translation.show(comment.text)}
                now={now}
                locale={locale}
                onFlag={() => onFlag({ target: "comment", id: comment.id, authorId: comment.authorId })}
              />
            ))}
          </ul>
        )}
        {hidden ? (
          <p className="mt-2 text-center text-[11px] text-neutral-400">
            {t(COPY.hiddenComments, locale).replace("{n}", String(SPOT_COMMENTS_SHOWN))}
          </p>
        ) : null}
      </div>
      <form
        className="mt-2 flex items-center gap-2 border-t border-line px-4 pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <span className="flex max-w-[38%] shrink-0 items-center gap-1 rounded-full bg-honey-soft py-1 pl-1 pr-2 text-[11px] font-bold text-honey-strong">
          <BeeAvatar id={author.avatar} size={18} />
          <span className="min-w-0 break-words">{authorLabel(author.station, author.nickname)}</span>
        </span>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, SPOT_COMMENT_MAX))}
          placeholder={t(COPY.commentPlaceholder, locale)}
          aria-label={t(COPY.commentPlaceholder, locale)}
          className="min-w-0 flex-1 rounded-full border border-line bg-surface-muted px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-neutral-400 focus:border-honey"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="shrink-0 rounded-full bg-[#2b2418] px-3.5 py-2.5 text-[13px] font-bold text-white disabled:bg-neutral-300"
        >
          {t(COPY.send, locale)}
        </button>
      </form>
    </Sheet>
  );
}
