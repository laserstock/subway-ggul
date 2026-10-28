import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  appStationHref,
  GUIDE_STATIONS,
  guideDetail,
  guideStation,
  googleMapsHref,
  localLine,
  type GuideStation,
  type GuideTransfer,
} from "../../../_lib/guide";
import {
  BRAND,
  floorLabel,
  stationMetaDescription,
  stationMetaTitle,
  stationSummary,
  stationTitle,
  tc,
  walkMinutesLabel,
} from "../../../_lib/guideCopy";
import { isLocale, t, type Locale } from "../../../_lib/i18n";
import { guideAlternates, OG_LOCALES, SITE_URL } from "../../../_lib/site";
import { AppPromo, JsonLd, LineChip, StationLink } from "../../_guide/parts";

export function generateStaticParams() {
  return GUIDE_STATIONS.map((station) => ({ slug: station.slug }));
}

async function resolve(params: PageProps<"/[lang]/stations/[slug]">["params"]) {
  const { lang, slug } = await params;
  const station = guideStation(slug);
  if (!isLocale(lang) || !station) return null;
  return { lang, station };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/stations/[slug]">): Promise<Metadata> {
  const found = await resolve(params);
  if (!found) return {};
  const { lang, station } = found;
  const title = stationMetaTitle(station, lang);
  const description = stationMetaDescription(station, guideDetail(station), lang);
  return {
    title,
    description,
    alternates: guideAlternates(`/stations/${station.slug}`, lang),
    openGraph: { type: "website", siteName: t(BRAND, lang), title, description, locale: OG_LOCALES[lang] },
  };
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

function towardName(station: GuideStation | null, fallback: string, locale: Locale) {
  return station ? t(station.name, locale) : fallback;
}

function TransferRow({ row, locale }: { row: GuideTransfer; locale: Locale }) {
  const [car, door = ""] = row.alight.split("-");
  return (
    <li className="rounded-2xl border border-line bg-surface px-4 py-3">
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-ink">
        <span className="break-words">
          {tc("transferFrom", locale, {
            line: localLine(row.fromLine, locale),
            toward: towardName(row.fromToward, row.fromTowardKo, locale),
          })}
        </span>
        <span aria-hidden className="text-ink-muted">
          →
        </span>
        <span className="break-words">
          {tc("transferFrom", locale, {
            line: localLine(row.toLine, locale),
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
              { "@type": "ListItem", position: 1, name: t(BRAND, lang), item: `${SITE_URL}/${lang}` },
              {
                "@type": "ListItem",
                position: 2,
                name: tc("breadcrumbStations", lang),
                item: `${SITE_URL}/${lang}/stations`,
              },
              { "@type": "ListItem", position: 3, name: title, item: url },
            ],
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-[12px] font-semibold text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={`/${lang}`}>{t(BRAND, lang)}</Link>
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          {station.lines.map((line) => (
            <LineChip key={line} line={line} locale={lang} />
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed text-ink">
          {stationSummary(station, detail, lang).map((sentence) => (
            <p key={sentence}>{sentence}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={appStationHref(station, lang)}
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

      <Section id="exits" title={tc("exits", lang)} hint={detail.exits.length ? tc("exitsHint", lang) : undefined}>
        {detail.exits.length ? (
          <ul className="flex flex-wrap gap-2">
            {detail.exits.map((exit) => (
              <li key={exit.label}>
                <a
                  href={googleMapsHref(exit.lat, exit.lng)}
                  target="_blank"
                  rel="noopener"
                  aria-label={tc("exitLabel", lang, { n: exit.label })}
                  className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-[#f5b800] px-2.5 text-[16px] font-black text-neutral-900 shadow-[0_2px_6px_rgba(245,184,0,0.35)] active:scale-95"
                >
                  {exit.label}
                </a>
              </li>
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
      </Section>

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

      <div className="mt-9">
        <AppPromo locale={lang} />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-ink-muted">{tc("dataNote", lang)}</p>
    </>
  );
}
