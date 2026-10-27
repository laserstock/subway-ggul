"use client";

import AppHeader from "./AppHeader";
import { t, type Localized } from "../_lib/i18n";
import { LEGAL_UPDATED, type LegalSection } from "../_lib/legal";
import { useLocale } from "../_lib/locale";

const UPDATED: Localized = { ko: "시행일 {date}", en: "Effective {date}", zh: "生效日期 {date}", ja: "施行日 {date}" };

export default function LegalScreen({ title, sections }: { title: Localized; sections: LegalSection[] }) {
  const locale = useLocale();
  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={title} />
        <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
          <p className="text-[12px] text-neutral-400">{t(UPDATED, locale).replace("{date}", LEGAL_UPDATED)}</p>
          {sections.map((section) => (
            <section key={section.title.ko} className="mt-5">
              <h2 className="text-[15px] font-extrabold text-ink">{t(section.title, locale)}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.ko} className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                  {t(paragraph, locale)}
                </p>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
