import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import AdSense from "../../../_components/AdSense";
import ShareButtons from "../../../_components/ShareButtons";
import StationFaqSchema from "../../../_components/StationFaqSchema";
import {
  appStationHref,
  GUIDE_STATIONS,
  guideDetail,
  guideStation,
  googleMapsHref,
  nearbyMapsHref,
  type GuideDetail,
  type GuideExit,
  type GuideStation,
  type GuideTransfer,
} from "../../../_lib/guide";
import {
  BRAND,
  floorLabel,
  GUIDE_YEAR,
  guideYearTag,
  gt,
  lineLabel,
  stationFaq,
  stationKeywords,
  stationMetaDescription,
  stationMetaTitle,
  stationOgDescription,
  stationOgTitle,
  stationSummary,
  stationTips,
  stationTitle,
  tc,
  walkMinutesLabel,
} from "../../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale, contentLocale, type GuideLocale } from "../../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { Icon, IconTile, type IconName } from "../../_guide/icons";
import { DesktopWide } from "../../_guide/desktop";
import { AppPromo, LineChip, LineLink, StationLink } from "../../_guide/parts";
import ShowKorean from "../../_guide/ShowKorean";
import StationSeoSchema from "../../_guide/StationSeoSchema";

export function generateStaticParams() {
  return GUIDE_STATIONS.map((station) => ({ slug: station.slug }));
}

/** `v` changes whenever the card design changes, so KakaoTalk, Facebook and X re-fetch instead of reusing their cache. */
function ogImageUrl(station: GuideStation, lang: GuideLocale) {
  const query = new URLSearchParams({ ...(lang === "en" ? {} : { lang }), v: String(GUIDE_YEAR) });
  return `${SITE_URL}/api/og/station/${station.slug}?${query}`;
}

async function resolve(params: PageProps<"/[lang]/stations/[slug]">["params"]) {
  const { lang, slug } = await params;
  const station = guideStation(slug);
  if (!isGuideLocale(lang) || !station) return null;
  return { lang, station };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/stations/[slug]">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return {};
  const { lang, station } = found;
  const detail = guideDetail(station);
  const title = stationMetaTitle(station, detail, lang);
  const description = stationMetaDescription(station, detail, lang);
  const ogTitle = stationOgTitle(station, lang);
  const ogDescription = stationOgDescription(station, detail, lang);
  const image = {
    url: ogImageUrl(station, lang),
    width: 1200,
    height: 630,
    type: "image/png",
    alt: `${guideYearTag(lang)} ${stationTitle(station, lang)}: ${tc("ogGuide", lang)} | K-SUB`,
  };
  return {
    title,
    description,
    keywords: stationKeywords(station, lang),
    alternates: guideAlternates(`/stations/${station.slug}`, lang),
    openGraph: {
      type: "website",
      siteName: gt(BRAND, lang),
      title: ogTitle,
      description: ogDescription,
      locale: OG_LOCALES[lang],
      url: `${SITE_URL}/${lang}/stations/${station.slug}`,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: [image] },
  };
}

const AD_SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATION_TOP,
  mid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATION_MID,
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATION_BOTTOM,
};

/** Cards before the mid-list ad in the exit list. */
const AD_AFTER_EXIT = 3;

function koExitLabel(label: string) {
  return `${label}번 출구`;
}

function UtilityChip({ href, icon, label, value, external }: {
  href: string | null;
  icon: IconName;
  label: string;
  value: string;
  external?: boolean;
}) {
  const body = (
    <>
      <IconTile name={icon} size="sm" />
      <span className="min-w-0">
        <span className="block break-words text-[14px] font-bold leading-snug text-ink lg:text-[15px]">{label}</span>
        <span className="mt-0.5 block break-words text-[13px] font-semibold text-honey-strong lg:mt-1">
          {value}
        </span>
      </span>
    </>
  );
  const className =
    "flex h-full items-start gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] lg:gap-3 lg:px-4 lg:py-4";
  if (!href) return <div className={className}>{body}</div>;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`${className} transition hover:-translate-y-1 hover:border-honey/40 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.98] lg:duration-200`}
    >
      {body}
    </a>
  );
}

function UtilityChips({ station, detail, locale }: { station: GuideStation; detail: GuideDetail; locale: GuideLocale }) {
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const lockerValue = [
    detail.lockers.length ? tc("utilLockersCount", locale, { n: detail.lockers.length }) : null,
    detail.luggageDesk ? tc("utilLuggageDesk", locale) : null,
  ].filter(Boolean);
  const elevatorExits = [...new Set(detail.elevators.map((row) => gt(row.exit, locale)))];
  const wowpassQuery = encodeURIComponent(`WOWPASS ${station.name.en} Station Seoul`);
  return (
    <section aria-label={tc("essentials", locale)} className="mt-4 grid grid-cols-2 gap-2 lg:mt-6 lg:grid-cols-4 lg:gap-3">
      <UtilityChip
        href={detail.lockers.length || detail.luggageDesk ? "#lockers" : null}
        icon="luggage"
        label={tc("utilLockers", locale)}
        value={lockerValue.length ? lockerValue.join(" · ") : tc("utilNoData", locale)}
      />
      <UtilityChip
        href={detail.toilets.length ? "#restrooms" : null}
        icon="restroom"
        label={tc("utilRestroom", locale)}
        value={detail.toilets.length ? tc("utilRestroomCount", locale, { inside, outside }) : tc("utilNoData", locale)}
      />
      <UtilityChip
        href={elevatorExits.length ? "#step-free" : null}
        icon="elevator"
        label={tc("utilElevator", locale)}
        value={
          elevatorExits.length
            ? tc("utilElevatorVia", locale, { exit: elevatorExits.slice(0, 2).join(", ") })
            : tc("utilNoData", locale)
        }
      />
      <UtilityChip
        href={`https://www.google.com/maps/search/?api=1&query=${wowpassQuery}`}
        external
        icon="card"
        label={tc("utilWowpass", locale)}
        value={tc("utilFindNearby", locale)}
      />
    </section>
  );
}

function ExitCard({ exit, detail, locale }: { exit: GuideExit; detail: GuideDetail; locale: GuideLocale }) {
  const restroom = detail.toilets.some((row) => row.exit === exit.label);
  const elevator = detail.elevators.some((row) => row.exit.ko === koExitLabel(exit.label));
  return (
    <li className="flex flex-col rounded-2xl border border-line bg-surface p-3 hover:-translate-y-1 hover:border-honey/40 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:p-4 lg:transition-all lg:duration-200">
      <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
        <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#f5b800] px-2 text-[17px] font-black text-neutral-900">
          {exit.label}
        </span>
        <span className="text-[14px] font-bold text-ink lg:text-[15px]">{tc("exitLabel", locale, { n: exit.label })}</span>
      </div>
      {restroom || elevator ? (
        <p className="mt-2 flex flex-wrap gap-1 text-[12px] font-bold">
          {restroom ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[#15803d]">
              <Icon name="restroom" size={13} />
              {tc("exitRestroom", locale)}
            </span>
          ) : null}
          {elevator ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#2563eb]">
              <Icon name="elevator" size={13} />
              {tc("exitElevator", locale)}
            </span>
          ) : null}
        </p>
      ) : null}
      <div className="mt-auto flex gap-1.5 pt-2.5 text-[13px] font-bold lg:gap-2 lg:pt-3">
        <a
          href={googleMapsHref(exit.lat, exit.lng)}
          target="_blank"
          rel="noopener"
          aria-label={`${tc("exitLabel", locale, { n: exit.label })} · ${tc("exitMap", locale)}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-surface-muted px-2 py-1.5 text-center text-ink hover:bg-line active:scale-95 lg:transition-colors lg:duration-200"
        >
          <Icon name="pin" size={14} />
          {tc("exitMap", locale)}
        </a>
        <a
          href={nearbyMapsHref(exit.lat, exit.lng)}
          target="_blank"
          rel="noopener"
          aria-label={`${tc("exitLabel", locale, { n: exit.label })} · ${tc("exitNearby", locale)}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-honey-soft px-2 py-1.5 text-center text-honey-strong hover:bg-honey hover:text-white active:scale-95 lg:transition-colors lg:duration-200"
        >
          {tc("exitNearby", locale)}
        </a>
      </div>
    </li>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-7 lg:mt-14">
      <h2 id={id} className="text-[18px] font-extrabold tracking-tight text-ink lg:text-[24px]">
        {title}
      </h2>
      {hint ? <p className="mt-1 text-[14px] leading-relaxed text-ink-muted lg:mt-2 lg:max-w-3xl lg:text-[16px]">{hint}</p> : null}
      <div className="mt-3 lg:mt-5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-surface-muted px-4 py-3 text-[14px] text-ink-muted lg:px-5 lg:py-4 lg:text-[15px]">{children}</p>;
}

function towardName(station: GuideStation | null, fallback: string, locale: GuideLocale) {
  return station ? gt(station.name, locale) : fallback;
}

function TransferRow({ row, locale }: { row: GuideTransfer; locale: GuideLocale }) {
  const [car, door = ""] = row.alight.split("-");
  return (
    <li className="rounded-2xl border border-line bg-surface px-4 py-3 lg:px-5 lg:py-4">
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] font-semibold text-ink lg:text-[15px]">
        <span className="break-words">
          {tc("transferFrom", locale, {
            line: lineLabel(row.fromLine, locale),
            toward: towardName(row.fromToward, row.fromTowardKo, locale),
          })}
        </span>
        <span aria-hidden className="text-ink-muted">
          →
        </span>
        <span className="break-words">
          {tc("transferFrom", locale, {
            line: lineLabel(row.toLine, locale),
            toward: towardName(row.toToward, row.toTowardKo, locale),
          })}
        </span>
      </p>
      <p className="mt-1.5 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-honey-soft px-2 py-0.5 text-[14px] font-extrabold text-honey-strong lg:text-[16px]">
          {tc("carDoor", locale, { car, door })}
        </span>
        {row.seconds !== null ? (
          <span className="text-[13px] text-ink-muted lg:text-[14px]">{walkMinutesLabel(row.seconds, locale)}</span>
        ) : null}
      </p>
    </li>
  );
}

export default async function StationGuide({ params }: PageProps<"/[lang]/stations/[slug]">) {
  const found = await resolve(params);
  if (!found) notFound();
  const { lang, station } = found;
  const detail = guideDetail(station);
  const title = stationTitle(station, lang);
  const url = `${SITE_URL}/${lang}/stations/${station.slug}`;
  const faq = stationFaq(station, detail, lang);
  const tips = stationTips(station, detail, lang);

  return (
    <DesktopWide>
      <StationSeoSchema station={station} detail={detail} lang={lang} />
      <StationFaqSchema url={url} lang={lang} faq={faq} />

      <nav aria-label="Breadcrumb" className="text-[13px] font-semibold text-ink-muted lg:text-[14px]">
        <ol className="flex flex-wrap items-center gap-1 lg:gap-1.5">
          <li>
            <Link
              href={`/${lang}`}
              className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0 lg:transition-colors lg:duration-200"
            >
              {gt(BRAND, lang)}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link
              href={`/${lang}/stations`}
              className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0 lg:transition-colors lg:duration-200"
            >
              {tc("breadcrumbStations", lang)}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <header className="mt-1 lg:mt-5">
        <h1 className="break-words text-[28px] font-extrabold leading-tight tracking-tight text-ink lg:text-[42px] lg:leading-[1.15]">
          {title}
        </h1>
        {lang !== "ko" ? (
          <p className="mt-1 text-[14px] text-ink-muted lg:mt-2 lg:text-[17px]">
            {tc("koreanName", lang)}: <span lang="ko" className="font-bold text-ink">{station.name.ko}</span>
          </p>
        ) : null}
        {lang !== "ko" ? (
          <div className="mt-3">
            <ShowKorean
              name={station.ko}
              exits={detail.exits.map((exit) => exit.label)}
              copy={{
                button: tc("showKorean", lang),
                lead: tc("showKoreanLead", lang, { station: title }),
                hint: tc("showKoreanHint", lang),
                pickExit: tc("pickExit", lang),
                close: tc("close", lang),
              }}
              meaning={{
                lang: GUIDE_LANGUAGES[lang].htmlLang,
                station: tc("showKoreanMeaning", lang).replace("{station}", title),
                exit: tc("showKoreanMeaningExit", lang).replace("{station}", title),
              }}
            />
          </div>
        ) : null}
        <UtilityChips station={station} detail={detail} locale={lang} />
        <div className="mt-4 flex flex-wrap gap-2 lg:mt-6">
          {station.lines.map((line) => (
            <LineLink key={line} line={line} locale={lang} large />
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-[16px] leading-relaxed text-ink lg:mt-6 lg:max-w-3xl lg:space-y-3 lg:text-lg lg:leading-relaxed">
          {stationSummary(station, detail, lang).map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 lg:mt-6 lg:gap-3">
          <a
            href={appStationHref(station, contentLocale(lang))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-honey px-4 py-3 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(245,167,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_10px_22px_rgba(245,167,0,0.35)] active:scale-[0.98] lg:px-6 lg:text-[16px] lg:duration-200"
          >
            {tc("openInApp", lang)} →
          </a>
          <a
            href="#get-app"
            className="inline-flex items-center rounded-xl border border-line bg-surface px-4 py-3 text-[15px] font-bold text-ink transition hover:-translate-y-0.5 hover:bg-surface-muted hover:shadow-[0_6px_16px_rgba(15,23,42,0.06)] active:scale-[0.98] lg:px-6 lg:text-[16px] lg:duration-200"
          >
            {tc("appTitle", lang)}
          </a>
        </div>
        {detail.address ? (
          <p className="mt-4 rounded-2xl bg-surface-muted px-4 py-3 text-[14px] text-ink-muted lg:mt-6 lg:max-w-3xl lg:px-5 lg:py-4">
            {tc("address", lang)}
            <span lang="ko" className="mt-0.5 block select-all break-words text-[15px] font-bold text-ink lg:mt-1 lg:text-[17px]">
              {detail.address}
            </span>
          </p>
        ) : null}
      </header>

      <AdSense slot={AD_SLOTS.top} layout="in-article" label={tc("advertisement", lang)} className="mt-6" />

      <Section id="tips" title={tc("tipsTitle", lang, { station: title })}>
        <ul className="space-y-3 rounded-2xl bg-honey-soft px-4 py-4 text-[16px] leading-relaxed text-ink lg:max-w-3xl lg:space-y-4 lg:px-6 lg:py-5 lg:text-lg">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5">
              <Icon name="sparkle" size={18} className="mt-1 text-honey-strong" />
              <span className="min-w-0">{tip}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="exits" title={tc("exits", lang)} hint={detail.exits.length ? tc("exitsHint", lang) : undefined}>
        {detail.exits.length ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:gap-4">
            {detail.exits.map((exit, index) => (
              <Fragment key={exit.label}>
                <ExitCard exit={exit} detail={detail} locale={lang} />
                {index === AD_AFTER_EXIT - 1 && detail.exits.length > AD_AFTER_EXIT ? (
                  <li className="col-span-full">
                    <AdSense slot={AD_SLOTS.mid} layout="in-article" label={tc("advertisement", lang)} />
                  </li>
                ) : null}
              </Fragment>
            ))}
          </ul>
        ) : (
          <Empty>{tc("noExits", lang)}</Empty>
        )}
      </Section>

      <Section id="restrooms" title={tc("toilets", lang)}>
        {detail.toilets.length ? (
          <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
            {detail.toilets.map((row, index) => (
              <li key={index} className="rounded-2xl border border-line bg-surface px-4 py-3 lg:px-5 lg:py-4">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink lg:gap-2 lg:text-[16px]">
                  <LineChip line={row.line} locale={lang} />
                  <span>{floorLabel(row.floor, lang)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[12px] ${
                      row.gate === "inside" ? "bg-[#e7f8ee] text-[#15803d]" : "bg-surface-muted text-ink-muted"
                    }`}
                  >
                    {tc(row.gate === "inside" ? "insideGate" : "outsideGate", lang)}
                  </span>
                </p>
                {row.exit ? (
                  <p className="mt-1 text-[14px] text-ink-muted lg:mt-2 lg:text-[15px] lg:leading-relaxed">{tc("nearExit", lang, { n: row.exit })}</p>
                ) : null}
                {lang === "ko" && row.detail ? <p className="mt-1 text-[14px] text-ink-muted lg:mt-2 lg:text-[15px] lg:leading-relaxed">{row.detail}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{tc("noToilets", lang)}</Empty>
        )}
      </Section>

      <Section id="lockers" title={tc("lockers", lang)}>
        {detail.lockers.length ? (
          <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
            {detail.lockers.map((row, index) => (
              <li key={index} className="rounded-2xl border border-line bg-surface px-4 py-3 lg:px-5 lg:py-4">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink lg:gap-2 lg:text-[16px]">
                  <LineChip line={row.line} locale={lang} />
                  {row.floor ? <span>{floorLabel(row.floor, lang)}</span> : null}
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[12px] text-ink-muted">
                    {tc(row.insideGate ? "insideGate" : "outsideGate", lang)}
                  </span>
                  {row.slots ? (
                    <span className="text-[14px] font-semibold text-ink-muted">{tc("slots", lang, { n: row.slots })}</span>
                  ) : null}
                </p>
                {lang === "ko" && row.detail ? <p className="mt-1 text-[14px] text-ink-muted lg:mt-2 lg:text-[15px] lg:leading-relaxed">{row.detail}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{tc("noLockers", lang)}</Empty>
        )}
        {detail.luggageDesk ? (
          <p className="mt-2 flex items-start gap-2 rounded-2xl bg-honey-soft px-4 py-3 text-[14px] font-semibold text-ink lg:mt-4 lg:px-5 lg:py-4 lg:text-[15px]">
            <Icon name="luggage" size={17} className="text-honey-strong" />
            <span>
              {tc("utilLuggageDesk", lang)}: <span className="font-bold">{gt(detail.luggageDesk, lang)}</span>
            </span>
          </p>
        ) : null}
      </Section>

      {detail.elevators.length ? (
        <Section id="step-free" title={tc("stepFree", lang)} hint={tc("stepFreeHint", lang)}>
          <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
            {detail.elevators.map((row) => (
              <li key={row.line} className="rounded-2xl border border-line bg-surface px-4 py-3 lg:px-5 lg:py-4">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink lg:gap-2 lg:text-[16px]">
                  <LineChip line={row.line} locale={lang} />
                  <span className="inline-flex items-center gap-1">
                    <Icon name="elevator" size={16} className="text-[#2563eb]" />
                    {gt(row.exit, lang)}
                  </span>
                </p>
                {row.notes.length ? (
                  <ul className="mt-1.5 space-y-0.5 text-[14px] leading-relaxed text-ink-muted lg:mt-2 lg:space-y-1 lg:text-[15px]">
                    {row.notes.slice(0, 3).map((note, index) => (
                      <li key={index}>· {gt(note, lang)}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {detail.transfers.length ? (
        <Section id="transfers" title={tc("transfers", lang)} hint={tc("transfersHint", lang)}>
          <ul className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
            {detail.transfers.map((row, index) => (
              <TransferRow key={index} row={row} locale={lang} />
            ))}
          </ul>
        </Section>
      ) : null}

      {detail.neighbors.length ? (
        <Section id="next-stations" title={tc("next", lang)}>
          <div className="flex flex-col gap-3">
            {detail.neighbors.map(({ line, stations }) => (
              <div key={line} className="flex flex-wrap items-center gap-2">
                <LineChip line={line} locale={lang} />
                {stations.map((next) => (
                  <StationLink key={next.slug} station={next} locale={lang} large />
                ))}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {faq.length ? (
        <Section id="faq" title={tc("faq", lang)}>
          <div className="flex flex-col gap-2 lg:max-w-3xl lg:gap-3">
            {faq.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-2xl border border-line bg-surface open:border-honey/40 lg:transition-colors lg:duration-200"
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 hover:text-honey-strong lg:px-5 lg:py-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-ink lg:text-[17px]">{item.question}</h3>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition-transform duration-200 group-open:rotate-45 group-open:bg-honey-soft group-open:text-honey-strong"
                  >
                    <Icon name="plus" size={16} />
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-muted lg:px-5 lg:pb-5 lg:text-[16px]">{item.answer}</p>
              </details>
            ))}
          </div>
        </Section>
      ) : null}

      <div className="mt-8 lg:mt-14">
        <ShareButtons
          url={url}
          text={tc("shareText", lang, { station: title })}
          labels={{
            title: tc("shareTitle", lang),
            copy: tc("shareCopy", lang),
            copied: tc("shareCopied", lang),
            bookmark: tc("shareBookmark", lang),
            bookmarkHint: tc("shareBookmarkHint", lang),
          }}
          kakao={
            lang === "ko"
              ? {
                  label: tc("shareKakao", lang),
                  button: tc("shareKakaoButton", lang),
                  description: stationSummary(station, detail, lang).slice(1, 3).join(" "),
                  imageUrl: ogImageUrl(station, lang),
                }
              : undefined
          }
        />
      </div>

      <AdSense slot={AD_SLOTS.bottom} label={tc("advertisement", lang)} className="mt-9" />

      <div className="mt-6 lg:mt-10">
        <AppPromo locale={lang} />
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-ink-muted lg:text-[13px]">{tc("dataNote", lang)}</p>
    </DesktopWide>
  );
}
