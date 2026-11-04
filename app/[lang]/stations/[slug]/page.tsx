import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import AdSense from "../../../_components/AdSense";
import ShareButtons from "../../../_components/ShareButtons";
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
  gt,
  lineLabel,
  stationFaq,
  stationMetaDescription,
  stationMetaTitle,
  stationOgTitle,
  stationSummary,
  stationTitle,
  tc,
  walkMinutesLabel,
} from "../../../_lib/guideCopy";
import { GUIDE_LANGUAGES, isGuideLocale, contentLocale, type GuideLocale } from "../../../_lib/guideLocale";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { Icon, IconTile, type IconName } from "../../_guide/icons";
import { AppPromo, JsonLd, LineChip, LineLink, StationLink } from "../../_guide/parts";
import ShowKorean from "../../_guide/ShowKorean";

export function generateStaticParams() {
  return GUIDE_STATIONS.map((station) => ({ slug: station.slug }));
}

function ogImagePath(station: GuideStation, lang: GuideLocale) {
  return `/api/og/station/${station.slug}${lang === "en" ? "" : `?lang=${lang}`}`;
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
  const image = {
    url: ogImagePath(station, lang),
    width: 1200,
    height: 630,
    alt: `${stationTitle(station, lang)} ${tc("ogGuide", lang)} | K-SUB`,
  };
  return {
    title,
    description,
    alternates: guideAlternates(`/stations/${station.slug}`, lang),
    openGraph: {
      type: "website",
      siteName: gt(BRAND, lang),
      title: ogTitle,
      description,
      locale: OG_LOCALES[lang],
      url: `${SITE_URL}/${lang}/stations/${station.slug}`,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [image] },
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
        <span className="block break-words text-[13px] font-bold leading-snug text-ink">{label}</span>
        <span className="mt-0.5 block break-words text-[12px] font-semibold text-honey-strong">{value}</span>
      </span>
    </>
  );
  const className =
    "flex h-full items-start gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]";
  if (!href) return <div className={className}>{body}</div>;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className={`${className} transition active:scale-[0.98]`}
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
    <section aria-label={tc("essentials", locale)} className="mt-4 grid grid-cols-2 gap-2">
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
    <li className="flex flex-col rounded-2xl border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#f5b800] px-2 text-[17px] font-black text-neutral-900">
          {exit.label}
        </span>
        <span className="text-[14px] font-bold text-ink">{tc("exitLabel", locale, { n: exit.label })}</span>
      </div>
      {restroom || elevator ? (
        <p className="mt-2 flex flex-wrap gap-1 text-[11px] font-bold">
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
      <div className="mt-auto flex gap-1.5 pt-2.5 text-[12px] font-bold">
        <a
          href={googleMapsHref(exit.lat, exit.lng)}
          target="_blank"
          rel="noopener"
          aria-label={`${tc("exitLabel", locale, { n: exit.label })} · ${tc("exitMap", locale)}`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface-muted px-2 py-1.5 text-center text-ink active:scale-95"
        >
          <Icon name="pin" size={14} />
          {tc("exitMap", locale)}
        </a>
        <a
          href={nearbyMapsHref(exit.lat, exit.lng)}
          target="_blank"
          rel="noopener"
          aria-label={`${tc("exitLabel", locale, { n: exit.label })} · ${tc("exitNearby", locale)}`}
          className="flex-1 rounded-lg bg-honey-soft px-2 py-1.5 text-center text-honey-strong active:scale-95"
        >
          {tc("exitNearby", locale)}
        </a>
      </div>
    </li>
  );
}

function Section({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-7">
      <h2 id={id} className="text-[18px] font-extrabold tracking-tight text-ink">
        {title}
      </h2>
      {hint ? <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">{children}</p>;
}

function towardName(station: GuideStation | null, fallback: string, locale: GuideLocale) {
  return station ? gt(station.name, locale) : fallback;
}

function TransferRow({ row, locale }: { row: GuideTransfer; locale: GuideLocale }) {
  const [car, door = ""] = row.alight.split("-");
  return (
    <li className="rounded-2xl border border-line bg-surface px-4 py-3">
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-ink">
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
        <span className="rounded-lg bg-honey-soft px-2 py-0.5 text-[14px] font-extrabold text-honey-strong">
          {tc("carDoor", locale, { car, door })}
        </span>
        {row.seconds !== null ? (
          <span className="text-[12px] text-ink-muted">{walkMinutesLabel(row.seconds, locale)}</span>
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

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TrainStation",
            name: title,
            alternateName: [station.name.ko, station.name.en, station.name.zh, station.name.ja].filter(
              (name) => name && name !== title,
            ),
            url,
            geo: { "@type": "GeoCoordinates", latitude: station.lat, longitude: station.lng },
            ...(detail.address
              ? { address: { "@type": "PostalAddress", streetAddress: detail.address, addressCountry: "KR" } }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: tc("breadcrumbHome", lang), item: `${SITE_URL}/${lang}` },
              {
                "@type": "ListItem",
                position: 2,
                name: tc("breadcrumbStations", lang),
                item: `${SITE_URL}/${lang}/stations`,
              },
              { "@type": "ListItem", position: 3, name: title, item: url },
            ],
          },
          ...(faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faq.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: { "@type": "Answer", text: item.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${lang}`}>{gt(BRAND, lang)}</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={`/${lang}/stations`}>{tc("breadcrumbStations", lang)}</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <header className="mt-3">
        <h1 className="break-words text-[28px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
        {lang !== "ko" ? (
          <p className="mt-1 text-[14px] text-ink-muted">
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
        <div className="mt-4 flex flex-wrap gap-1.5">
          {station.lines.map((line) => (
            <LineLink key={line} line={line} locale={lang} />
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed text-ink">
          {stationSummary(station, detail, lang).map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={appStationHref(station, contentLocale(lang))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-honey px-4 py-3 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(245,167,0,0.25)] transition active:scale-[0.98]"
          >
            {tc("openInApp", lang)} →
          </a>
          <a
            href="#get-app"
            className="inline-flex items-center rounded-xl border border-line bg-surface px-4 py-3 text-[15px] font-bold text-ink transition active:scale-[0.98]"
          >
            {tc("appTitle", lang)}
          </a>
        </div>
        {detail.address ? (
          <p className="mt-4 rounded-2xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">
            {tc("address", lang)}
            <span lang="ko" className="mt-0.5 block select-all break-words text-[15px] font-bold text-ink">
              {detail.address}
            </span>
          </p>
        ) : null}
      </header>

      <AdSense slot={AD_SLOTS.top} layout="in-article" label={tc("advertisement", lang)} className="mt-6" />

      <Section id="exits" title={tc("exits", lang)} hint={detail.exits.length ? tc("exitsHint", lang) : undefined}>
        {detail.exits.length ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          <ul className="flex flex-col gap-2">
            {detail.toilets.map((row, index) => (
              <li key={index} className="rounded-2xl border border-line bg-surface px-4 py-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink">
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
                  <p className="mt-1 text-[13px] text-ink-muted">{tc("nearExit", lang, { n: row.exit })}</p>
                ) : null}
                {lang === "ko" && row.detail ? <p className="mt-1 text-[13px] text-ink-muted">{row.detail}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{tc("noToilets", lang)}</Empty>
        )}
      </Section>

      <Section id="lockers" title={tc("lockers", lang)}>
        {detail.lockers.length ? (
          <ul className="flex flex-col gap-2">
            {detail.lockers.map((row, index) => (
              <li key={index} className="rounded-2xl border border-line bg-surface px-4 py-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink">
                  <LineChip line={row.line} locale={lang} />
                  {row.floor ? <span>{floorLabel(row.floor, lang)}</span> : null}
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[12px] text-ink-muted">
                    {tc(row.insideGate ? "insideGate" : "outsideGate", lang)}
                  </span>
                  {row.slots ? (
                    <span className="text-[13px] font-semibold text-ink-muted">{tc("slots", lang, { n: row.slots })}</span>
                  ) : null}
                </p>
                {lang === "ko" && row.detail ? <p className="mt-1 text-[13px] text-ink-muted">{row.detail}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{tc("noLockers", lang)}</Empty>
        )}
        {detail.luggageDesk ? (
          <p className="mt-2 flex items-start gap-2 rounded-2xl bg-honey-soft px-4 py-3 text-[13px] font-semibold text-ink">
            <Icon name="luggage" size={17} className="text-honey-strong" />
            <span>
              {tc("utilLuggageDesk", lang)}: <span className="font-bold">{gt(detail.luggageDesk, lang)}</span>
            </span>
          </p>
        ) : null}
      </Section>

      {detail.elevators.length ? (
        <Section id="step-free" title={tc("stepFree", lang)} hint={tc("stepFreeHint", lang)}>
          <ul className="flex flex-col gap-2">
            {detail.elevators.map((row) => (
              <li key={row.line} className="rounded-2xl border border-line bg-surface px-4 py-3">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-ink">
                  <LineChip line={row.line} locale={lang} />
                  <span className="inline-flex items-center gap-1">
                    <Icon name="elevator" size={16} className="text-[#2563eb]" />
                    {gt(row.exit, lang)}
                  </span>
                </p>
                {row.notes.length ? (
                  <ul className="mt-1.5 space-y-0.5 text-[13px] leading-relaxed text-ink-muted">
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
          <ul className="flex flex-col gap-2">
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
                  <StationLink key={next.slug} station={next} locale={lang} />
                ))}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {faq.length ? (
        <Section id="faq" title={tc("faq", lang)}>
          <div className="flex flex-col gap-2">
            {faq.map((item) => (
              <div key={item.question} className="rounded-2xl border border-line bg-surface px-4 py-3">
                <h3 className="text-[14px] font-bold text-ink">{item.question}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <div className="mt-8">
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
                  imageUrl: `${SITE_URL}${ogImagePath(station, lang)}`,
                }
              : undefined
          }
        />
      </div>

      <AdSense slot={AD_SLOTS.bottom} label={tc("advertisement", lang)} className="mt-9" />

      <div className="mt-6">
        <AppPromo locale={lang} />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">{tc("dataNote", lang)}</p>
    </>
  );
}
