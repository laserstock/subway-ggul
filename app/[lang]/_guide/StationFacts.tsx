import Link from "next/link";
import type { GuideDetail, GuideStation } from "../../_lib/guide";
import {
  gt,
  quickestTransfer,
  stationTitle,
  tc,
  walkMinutesLabel,
} from "../../_lib/guideCopy";
import type { GuideLocale } from "../../_lib/guideLocale";
import { Icon, IconTile } from "./icons";
import { LineChip } from "./parts";

const CELL = "px-3 py-2.5 align-top lg:px-4 lg:py-3";
const ROW_LABEL = `${CELL} whitespace-nowrap text-[13px] font-bold text-ink lg:text-[14px]`;
const ROW_VALUE = `${CELL} text-[13px] leading-relaxed text-ink-muted lg:text-[14px]`;
const HEAD = "whitespace-nowrap px-3 py-2.5 text-[12px] font-bold text-ink-muted lg:px-4 lg:py-3 lg:text-[13px]";

/**
 * The station's core facts as one semantic table (restrooms, lockers, elevators, fastest transfer, exits).
 * Tables are what answer engines and search snippets lift a station summary from, and they stay readable
 * without JavaScript.
 */
export function StationFactsTable({
  station,
  detail,
  locale,
}: {
  station: GuideStation;
  detail: GuideDetail;
  locale: GuideLocale;
}) {
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const elevatorExits = [...new Set(detail.elevators.map((row) => gt(row.exit, locale)))].slice(0, 3);
  const quickest = quickestTransfer(detail);
  const [car, door] = quickest ? quickest.alight.split("-") : [];

  const rows: { label: string; value: string }[] = [
    {
      label: tc("toilets", locale),
      value: detail.toilets.length
        ? tc("utilRestroomCount", locale, { inside, outside })
        : tc("utilNoData", locale),
    },
    {
      label: tc("lockers", locale),
      value: detail.lockers.length
        ? [
            tc("utilLockersCount", locale, { n: detail.lockers.length }),
            lockerSlots ? tc("slots", locale, { n: lockerSlots }) : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : detail.luggageDesk
          ? tc("utilLuggageDesk", locale)
          : tc("utilNoData", locale),
    },
    {
      label: tc("utilElevator", locale),
      value: elevatorExits.length
        ? tc("utilElevatorVia", locale, { exit: elevatorExits.join(", ") })
        : tc("utilNoData", locale),
    },
    {
      label: tc("transfers", locale),
      value: quickest
        ? `${tc("carDoor", locale, { car, door: door ?? "" })}${
            quickest.seconds !== null ? ` · ${walkMinutesLabel(quickest.seconds, locale)}` : ""
          }`
        : tc("factsNoTransfer", locale),
    },
    {
      label: tc("exits", locale),
      value: detail.exits.length ? tc("factsExitsCount", locale, { n: detail.exits.length }) : tc("utilNoData", locale),
    },
  ];

  const title = stationTitle(station, locale);

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{tc("factsTitle", locale, { station: title })}</caption>
        <thead>
          <tr className="bg-surface-muted">
            <th scope="col" className={HEAD}>
              {tc("factsItem", locale)}
            </th>
            <th scope="col" className={`${HEAD} text-left`}>
              {tc("factsDetail", locale)}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <th scope="row" className={`${ROW_LABEL} text-left`}>
                {row.label}
              </th>
              <td className={ROW_VALUE}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Fastest-transfer rows as a table (from line → to line, car and door to ride, walk time) so the
 * "which car should I board" answer is machine-readable as well as skimmable.
 */
export function TransferTable({
  station,
  detail,
  locale,
}: {
  station: GuideStation;
  detail: GuideDetail;
  locale: GuideLocale;
}) {
  const title = stationTitle(station, locale);
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full border-collapse text-left">
        <caption className="border-b border-line px-3 py-2.5 text-left text-[12px] font-bold text-ink-muted lg:px-4 lg:py-3 lg:text-[13px]">
          {tc("transferCaption", locale, { station: title })}
        </caption>
        <thead>
          <tr className="bg-surface-muted">
            <th scope="col" className={HEAD}>
              {tc("transferColumnRoute", locale)}
            </th>
            <th scope="col" className={HEAD}>
              {tc("transferColumnCar", locale)}
            </th>
            <th scope="col" className={HEAD}>
              {tc("transferColumnWalk", locale)}
            </th>
          </tr>
        </thead>
        <tbody>
          {detail.transfers.map((row, index) => {
            const [car, door = ""] = row.alight.split("-");
            return (
              <tr key={`${row.fromLine}-${row.toLine}-${row.alight}-${index}`} className="border-t border-line">
                <th scope="row" className={`${CELL} text-left text-[13px] font-semibold text-ink lg:text-[14px]`}>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <LineChip line={row.fromLine} locale={locale} />
                    <span aria-hidden className="text-ink-muted">
                      →
                    </span>
                    <LineChip line={row.toLine} locale={locale} />
                  </span>
                </th>
                <td className={ROW_VALUE}>
                  <span className="inline-block rounded-lg bg-honey-soft px-2 py-0.5 text-[13px] font-extrabold text-honey-strong lg:text-[14px]">
                    {tc("carDoor", locale, { car, door })}
                  </span>
                </td>
                <td className={ROW_VALUE}>
                  {row.seconds !== null ? walkMinutesLabel(row.seconds, locale) : tc("utilNoData", locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** One-tap hand-off from a station guide into the trip planner, the site's deepest web feature. */
export function CourseCta({ station, locale }: { station: GuideStation; locale: GuideLocale }) {
  const title = stationTitle(station, locale);
  return (
    <Link
      href={`/${locale}/planner`}
      className="group mt-4 flex items-center gap-3 rounded-2xl border border-[#f6e3a8] bg-gradient-to-r from-[#fff8e1] to-surface p-4 transition hover:-translate-y-0.5 hover:border-honey/50 hover:shadow-[0_10px_24px_rgba(245,167,0,0.15)] active:scale-[0.99] lg:mt-6 lg:gap-4 lg:p-5 lg:duration-200"
    >
      <IconTile name="route" onSurface />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-extrabold leading-snug text-ink lg:text-[16px]">
          {tc("courseCta", locale, { station: title })}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-muted lg:mt-1 lg:text-[14px] lg:leading-relaxed">
          {tc("courseBody", locale)}
        </span>
      </span>
      <Icon
        name="arrow"
        size={16}
        className="shrink-0 text-ink-muted transition group-hover:translate-x-1 group-hover:text-honey-strong"
      />
    </Link>
  );
}
