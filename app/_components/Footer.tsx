import Link from "next/link";
import { t, type Locale, type Localized } from "../_lib/i18n";
import { CONTACT_TITLE, PRIVACY_TITLE } from "../_lib/legal";

const TERMS: Localized = { ko: "이용약관", en: "Terms of Service", zh: "服务条款", ja: "利用規約" };
const STATIONS: Localized = { ko: "전체 역 목록", en: "Station Directory", zh: "车站目录", ja: "駅一覧" };

/** Site-wide footer for the guide and legal pages, with the links AdSense and app stores look for. */
export default function Footer({ locale, className = "" }: { locale: Locale; className?: string }) {
  const links: [string, Localized][] = [
    [`/privacy?lang=${locale}`, PRIVACY_TITLE],
    [`/terms?lang=${locale}`, TERMS],
    [`/contact?lang=${locale}`, CONTACT_TITLE],
    [`/${locale}/stations`, STATIONS],
  ];
  return (
    <footer
      className={`border-t border-line bg-surface-muted pb-[max(20px,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 py-6 text-[12px] text-ink-muted">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-y-2 font-semibold text-ink">
            {links.map(([href, label], index) => (
              <li key={href} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-2.5 text-ink-muted/50" aria-hidden>
                    |
                  </span>
                ) : null}
                <Link href={href} className="underline-offset-2 hover:underline">
                  {t(label, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-0.5 leading-relaxed">
          <p lang="en">© 2026 K-SUB. All rights reserved. K-SUB is a subway guide app for Seoul travelers.</p>
          <p lang="ko">© 2026 K-SUB(지하철꿀정보). K-SUB는 서울을 여행하는 사람들을 위한 지하철 안내 앱입니다.</p>
        </div>
      </div>
    </footer>
  );
}
