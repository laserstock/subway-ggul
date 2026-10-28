import Link from "next/link";
import { TrainMark } from "../../_components/icons";
import { GUIDE_STATIONS, localLine, stationLineColor, type GuideStation } from "../../_lib/guide";
import { BRAND_SHORT, TAGLINE, tc } from "../../_lib/guideCopy";
import { t, type Locale } from "../../_lib/i18n";
import { APP_RELEASED, PLAY_STORE_URL } from "../../_lib/site";
import type { GuideSearchItem } from "./GuideSearch";
import LanguageSwitcher from "./LanguageSwitcher";
import { normalizeQuery } from "./searchKeys";

export function GuideHeader({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-app/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-4 py-2.5">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-honey-soft text-honey">
            <TrainMark size={24} />
          </span>
          <span className="min-w-0">
            <span className="block text-[16px] font-extrabold leading-tight tracking-tight text-honey-strong">
              {t(BRAND_SHORT, locale)}
            </span>
            <span className="block break-words text-[11px] font-semibold text-ink-muted">{t(TAGLINE, locale)}</span>
          </span>
        </Link>
        <LanguageSwitcher current={locale} label={tc("language", locale)} />
      </div>
    </header>
  );
}

export function GuideFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-line bg-surface-muted pb-[max(20px,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 px-4 py-6 text-[12px] text-ink-muted">
        <nav className="flex flex-wrap gap-x-4 gap-y-2 font-semibold">
          <Link href={`/${locale}/stations`}>{tc("allStations", locale)}</Link>
          <a href={`/?lang=${locale}`}>{tc("openWebApp", locale)}</a>
          <a href={`/privacy?lang=${locale}`}>{tc("privacy", locale)}</a>
          <a href={`/terms?lang=${locale}`}>{tc("terms", locale)}</a>
        </nav>
        <p>© 2026 {t(BRAND_SHORT, locale)}</p>
      </div>
    </footer>
  );
}

function PlayLogo() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden>
      <path d="M1 1.2 12.6 12 1 22.8c-.4-.3-.6-.8-.6-1.4V2.6c0-.6.2-1.1.6-1.4z" fill="#00d7fe" />
      <path d="m16.4 8.4-3.8 3.6L1 1.2c.4-.4 1.1-.5 1.7-.1z" fill="#00f076" />
      <path d="M16.4 15.6 2.7 22.9c-.6.4-1.3.3-1.7-.1L12.6 12z" fill="#ff3a44" />
      <path d="m16.4 8.4 3.9 2.2c1 .6 1 2.2 0 2.8l-3.9 2.2-3.8-3.6z" fill="#ffd500" />
    </svg>
  );
}

/** Download box: Google Play (marked "coming soon" until release) plus the web app as the fallback. */
export function AppPromo({ locale }: { locale: Locale }) {
  return (
    <section
      aria-labelledby="get-app"
      className="rounded-3xl bg-gradient-to-br from-[#fff8e1] to-[#fffdf6] p-5 ring-1 ring-[#f6e3a8]"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-honey text-white">
          <TrainMark size={30} />
        </span>
        <div className="min-w-0">
          <h2 id="get-app" className="text-[18px] font-extrabold tracking-tight text-ink">
            {tc("appTitle", locale)}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{tc("appBody", locale)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2.5 rounded-xl bg-[#111827] px-4 py-2.5 text-white transition active:scale-[0.98]"
        >
          <PlayLogo />
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/80">
              {APP_RELEASED ? tc("getOnPlay", locale) : tc("comingSoon", locale)}
            </span>
            <span className="block text-[16px] font-bold">Google Play</span>
          </span>
        </a>
        <a
          href={`/?lang=${locale}`}
          className="inline-flex items-center rounded-xl bg-honey px-4 py-2.5 text-[14px] font-bold text-white transition active:scale-[0.98]"
        >
          {tc("openWebApp", locale)} →
        </a>
      </div>
      {APP_RELEASED ? null : <p className="mt-2.5 text-[12px] text-ink-muted">{tc("appSoonNote", locale)}</p>}
    </section>
  );
}

export function LineChip({ line, locale }: { line: string; locale: Locale }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold text-white"
      style={{ backgroundColor: stationLineColor(line) }}
    >
      {localLine(line, locale)}
    </span>
  );
}

export function searchItems(locale: Locale): GuideSearchItem[] {
  return GUIDE_STATIONS.map((station) => ({
    slug: station.slug,
    label: t(station.name, locale),
    sub: station.lines.map((line) => localLine(line, locale)).join(" · "),
    color: stationLineColor(station.lines[0] ?? ""),
    keys: [station.name.ko, station.name.en, station.name.zh ?? "", station.name.ja ?? ""]
      .map(normalizeQuery)
      .filter(Boolean)
      .join("|"),
  }));
}

export function StationLink({ station, locale }: { station: GuideStation; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/stations/${station.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink active:bg-surface-muted"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: stationLineColor(station.lines[0] ?? "") }}
        aria-hidden
      />
      {t(station.name, locale)}
    </Link>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}