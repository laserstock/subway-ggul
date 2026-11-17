import Link from "next/link";
import { stationLineColor } from "../../_lib/guide";
import { gt, lineLabel, tc } from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import type { RelatedStation } from "../../_lib/stationRelated";
import { Icon } from "./icons";

/** Internal-link cards that keep readers moving to the next useful station guide. */
export default function RelatedStations({
  items,
  locale,
}: {
  items: RelatedStation[];
  locale: GuideLocale;
}) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:gap-3">
      {items.map(({ station, blurb }) => {
        const name = gt(station.name, locale);
        const href = `/${locale}/stations/${station.slug}`;
        const openLabel = tc("relatedOpen", locale, { station: name });
        return (
          <li key={station.slug}>
            <Link
              href={href}
              aria-label={openLabel}
              className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-honey/45 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.99] lg:p-5 lg:duration-200"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {station.lines.slice(0, 3).map((line) => (
                  <span
                    key={line}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: stationLineColor(line) }}
                  >
                    {lineLabel(line, locale)}
                  </span>
                ))}
              </div>
              <h3 className="mt-2.5 text-[16px] font-extrabold leading-snug text-ink lg:text-[17px]">{name}</h3>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-muted lg:text-[14px]">{blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-honey-strong">
                {tc("relatedCta", locale)}
                <span aria-hidden>
                  <Icon name="arrow" size={14} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
