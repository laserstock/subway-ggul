import Link from "next/link";
import { contentLocale, type GuideLocale } from "../_lib/guideLocale";
import { t, type Localized } from "../_lib/i18n";
import { CONTACT_TITLE, PRIVACY_TITLE } from "../_lib/legal";

const TERMS: Localized = { ko: "이용약관", en: "Terms of Service", zh: "服务条款", ja: "利用規約" };
const STATIONS: Localized = { ko: "전체 역 목록", en: "Station Directory", zh: "车站目录", ja: "駅一覧" };
const MAP: Localized = { ko: "지하철 노선도", en: "Subway Map", zh: "地铁线路图", ja: "地下鉄路線図" };
const GUIDES: Localized = { ko: "이용 가이드", en: "Travel Guides", zh: "乘车指南", ja: "乗り方ガイド" };
const ABOUT: Localized = { ko: "K-SUB 소개", en: "About Us", zh: "关于我们", ja: "K-SUBについて" };
const EDITORIAL: Localized = { ko: "데이터·편집 정책", en: "Data & Editorial Policy", zh: "数据与编辑方针", ja: "データ・編集方針" };

/** Traditional Chinese labels, written out because this footer also renders in client screens. */
const HANT = {
  about: "關於我們",
  editorial: "資料與編輯方針",
  privacy: "隱私權政策",
  terms: "服務條款",
  contact: "聯絡我們",
  stations: "車站目錄",
  map: "地鐵路線圖",
  guides: "乘車指南",
};

/** Site-wide footer for the guide and legal pages, with the links AdSense and app stores look for. */
export default function Footer({ locale, className = "" }: { locale: GuideLocale; className?: string }) {
  const app = contentLocale(locale);
  const links: [string, Localized, string][] = [
    [`/${locale}/about`, ABOUT, HANT.about],
    [`/${locale}/editorial-policy`, EDITORIAL, HANT.editorial],
    [`/privacy?lang=${app}`, PRIVACY_TITLE, HANT.privacy],
    [`/terms?lang=${app}`, TERMS, HANT.terms],
    [`/contact?lang=${app}`, CONTACT_TITLE, HANT.contact],
    [`/${locale}/stations`, STATIONS, HANT.stations],
    [`/${locale}/map`, MAP, HANT.map],
    [`/${locale}/guides`, GUIDES, HANT.guides],
  ];
  return (
    <footer
      className={`border-t border-line bg-surface-muted pb-[max(20px,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 py-6 text-[12px] text-ink-muted">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-y-2 font-semibold text-ink">
            {links.map(([href, label, hant], index) => (
              <li key={href} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-2.5 text-ink-muted/50" aria-hidden>
                    |
                  </span>
                ) : null}
                <Link href={href} className="underline-offset-2 hover:underline">
                  {locale === "zh-tw" ? hant : t(label, app)}
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
