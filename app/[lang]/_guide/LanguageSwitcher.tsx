"use client";

import { usePathname } from "next/navigation";
import { LANGUAGES, LOCALES, type Locale } from "../../_lib/i18n";

/** Same page in another language; full page loads so <html lang> and the app's language follow. */
export default function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.split("/").slice(2).join("/");
  return (
    <nav aria-label={label} className="flex shrink-0 items-center gap-1">
      {LOCALES.map((code) => (
        <a
          key={code}
          href={`/${code}${rest ? `/${rest}` : ""}`}
          hrefLang={LANGUAGES[code].htmlLang}
          lang={LANGUAGES[code].htmlLang}
          aria-current={code === current ? "true" : undefined}
          title={LANGUAGES[code].native}
          className={`rounded-full px-2 py-1 text-[12px] font-bold transition-colors ${
            code === current ? "bg-honey-soft text-honey-strong" : "text-ink-muted active:bg-surface-muted"
          }`}
        >
          {LANGUAGES[code].short}
        </a>
      ))}
    </nav>
  );
}
