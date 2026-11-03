"use client";

import Link from "next/link";
import { t, type Localized } from "../_lib/i18n";
import { CONTACT_EMAIL, DELETION_TITLE } from "../_lib/legal";
import { useLocale } from "../_lib/locale";

const COPY = {
  lead: {
    ko: "궁금한 점이나 잘못된 역 정보가 있으면 언제든 알려 주세요.",
    en: "Questions, or spotted wrong station info? Let us know anytime.",
    zh: "如有疑问或发现车站信息有误，请随时告诉我们。",
    ja: "ご質問や駅情報の誤りがあれば、いつでもお知らせください。",
  },
  email: { ko: "이메일 보내기", en: "Send an email", zh: "发送邮件", ja: "メールを送る" },
  subject: {
    ko: "[K-SUB] 문의",
    en: "[K-SUB] Inquiry",
    zh: "[K-SUB] 咨询",
    ja: "[K-SUB] お問い合わせ",
  },
} satisfies Record<string, Localized>;

export default function ContactActions() {
  const locale = useLocale();
  if (!CONTACT_EMAIL) return null;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t(COPY.subject, locale))}`;
  return (
    <div className="mt-4 rounded-2xl bg-surface-muted p-4">
      <p className="text-[13px] font-semibold leading-relaxed text-ink">{t(COPY.lead, locale)}</p>
      <a
        href={mailto}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-honey py-2.5 text-[14px] font-extrabold text-white transition active:scale-[0.98]"
      >
        <span aria-hidden>✉️</span>
        {t(COPY.email, locale)}
      </a>
      <p className="mt-2 select-all text-center text-[13px] font-bold text-ink">{CONTACT_EMAIL}</p>
      <Link
        href="/delete-account"
        className="mt-2 block text-center text-[12px] font-semibold text-ink-muted underline underline-offset-2"
      >
        {t(DELETION_TITLE, locale)}
      </Link>
    </div>
  );
}
