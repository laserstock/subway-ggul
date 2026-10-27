"use client";

import { useState } from "react";
import { t, type Localized } from "../_lib/i18n";
import { useLocale } from "../_lib/locale";
import { blockAuthor, FLAG_REASONS, flagContent, type FlagReason, type FlagTarget } from "../_lib/safety";
import BottomSheet from "./BottomSheet";

export type FlagRequest = { target: FlagTarget; id: string; authorId: string };

const COPY = {
  title: { ko: "신고하기", en: "Report", zh: "举报", ja: "通報する" },
  intro: {
    ko: "어떤 문제가 있나요? 신고한 내용은 바로 숨겨지고, 여러 명이 신고하면 모두에게 숨겨진 뒤 운영자가 확인해요.",
    en: "What's wrong? It's hidden for you right away; once several people report it, it's hidden for everyone and reviewed.",
    zh: "有什么问题？举报后将立即对您隐藏；多人举报后将对所有人隐藏并由运营者审核。",
    ja: "どんな問題がありますか？通報するとすぐ非表示になり、複数人が通報すると全員に非表示となり運営者が確認します。",
  },
  submit: { ko: "신고하기", en: "Report", zh: "提交举报", ja: "通報する" },
  done: {
    ko: "신고가 접수됐어요. 이 내용은 더 이상 보이지 않아요.",
    en: "Thanks — this is now hidden for you.",
    zh: "举报已提交，该内容将不再显示。",
    ja: "通報を受け付けました。この内容は今後表示されません。",
  },
  block: { ko: "🚫 이 사용자 차단하기", en: "🚫 Block this user", zh: "🚫 屏蔽该用户", ja: "🚫 このユーザーをブロック" },
  blockHint: {
    ko: "차단하면 이 사용자의 글·댓글·제보가 모두 보이지 않아요. [마이]에서 해제할 수 있어요.",
    en: "You won't see any posts, comments or reports from them. Undo it from My.",
    zh: "屏蔽后将看不到该用户的帖子、评论和上报。可在“我的”中解除。",
    ja: "ブロックするとこのユーザーの投稿・コメント・情報がすべて非表示になります。「マイ」で解除できます。",
  },
  blocked: { ko: "차단했어요", en: "User blocked", zh: "已屏蔽", ja: "ブロックしました" },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
} satisfies Record<string, Localized>;

const REASONS: Record<FlagReason, Localized> = {
  spam: { ko: "광고 · 스팸", en: "Ads or spam", zh: "广告 · 垃圾信息", ja: "広告・スパム" },
  abuse: {
    ko: "욕설 · 혐오 · 음란물",
    en: "Abuse, hate or sexual content",
    zh: "辱骂 · 仇恨 · 色情",
    ja: "暴言・差別・わいせつ",
  },
  privacy: {
    ko: "개인정보 노출",
    en: "Exposes personal information",
    zh: "泄露个人信息",
    ja: "個人情報の露出",
  },
  other: { ko: "허위 정보 · 기타", en: "False info or other", zh: "虚假信息 · 其他", ja: "虚偽情報・その他" },
};

export default function FlagSheet({
  request,
  onClose,
  onToast,
}: {
  request: FlagRequest;
  onClose: () => void;
  onToast?: (message: string) => void;
}) {
  const locale = useLocale();
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [sent, setSent] = useState(false);

  function submit() {
    if (!reason) return;
    void flagContent(request.target, request.id, reason);
    setSent(true);
  }

  function block() {
    blockAuthor(request.authorId);
    onToast?.(t(COPY.blocked, locale));
    onClose();
  }

  return (
    <BottomSheet title={t(COPY.title, locale)} onClose={onClose}>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-1 pt-2">
        {sent ? (
          <>
            <p className="rounded-2xl bg-[#e6f5e9] px-4 py-4 text-[14px] font-bold leading-relaxed text-[#15803d]">
              ✅ {t(COPY.done, locale)}
            </p>
            <button
              type="button"
              onClick={block}
              className="mt-3 w-full rounded-2xl border border-[#fecaca] bg-[#fef2f2] py-3.5 text-[15px] font-bold text-[#dc2626] transition active:scale-[0.98]"
            >
              {t(COPY.block, locale)}
            </button>
            <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{t(COPY.blockHint, locale)}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-2xl bg-surface-muted py-3.5 text-[15px] font-bold text-ink transition active:scale-[0.98]"
            >
              {t(COPY.close, locale)}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-relaxed text-neutral-500">{t(COPY.intro, locale)}</p>
            <div role="radiogroup" className="mt-3 flex flex-col gap-2">
              {FLAG_REASONS.map((id) => {
                const active = id === reason;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setReason(id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[14px] font-bold transition active:scale-[0.99] ${
                      active ? "border-[#dc2626] bg-[#fef2f2] text-[#b91c1c]" : "border-line bg-surface text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? "border-[#dc2626]" : "border-neutral-300"
                      }`}
                      aria-hidden
                    >
                      {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" /> : null}
                    </span>
                    {t(REASONS[id], locale)}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!reason}
              className="mt-4 w-full rounded-2xl bg-[#dc2626] py-3.5 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:bg-neutral-300"
            >
              {t(COPY.submit, locale)}
            </button>
          </>
        )}
      </div>
    </BottomSheet>
  );
}

const FLAG_LABEL: Localized = { ko: "신고", en: "Report", zh: "举报", ja: "通報" };

/** Small inline trigger placed next to someone else's content. */
export function FlagButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  const locale = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t(FLAG_LABEL, locale)}
      className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[11px] font-semibold text-neutral-400 transition active:scale-95 active:bg-neutral-100 ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 21V4m0 0h11l-2 4 2 4H5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t(FLAG_LABEL, locale)}
    </button>
  );
}
