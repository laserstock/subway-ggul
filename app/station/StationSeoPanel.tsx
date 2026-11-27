import Link from "next/link";
import type { GuideDetail, GuideStation } from "../_lib/guide";
import { exitName, listJoin, lockerSpot, minutes, quickestTransfer } from "../_lib/guideCopy";
import { t } from "../_lib/i18n";
import { stationSpotsFor } from "../_lib/planner";

/**
 * Crawlable English facility summary for `/station/[slug]`.
 * Rendered after the interactive dashboard so web users see the app UI first.
 * Hidden with zero layout cost in the native app via `html[data-platform=app] [data-web-seo]`.
 * Kept in SSR HTML so Googlebot still indexes the copy.
 */
export default function StationSeoPanel({
  station,
  detail,
}: {
  station: GuideStation;
  detail: GuideDetail;
}) {
  const enName = station.name.en.replace(/\s+station$/i, "");
  const title = `${enName} Station`;
  const inside = detail.toilets.filter((row) => row.gate === "inside").length;
  const outside = detail.toilets.length - inside;
  const elevators = [
    ...new Set(detail.elevators.map((row) => exitName(t(row.exit, "en"), "en"))),
  ];
  const lockerBanks = detail.lockers.length;
  const lockerSlots = detail.lockers.reduce((sum, row) => sum + (row.slots ?? 0), 0);
  const lockerPlaces = [...new Set(detail.lockers.map((row) => lockerSpot(row, "en")))].slice(0, 3);
  const spots = stationSpotsFor(station, detail, "en").slice(0, 4);
  const quickest = quickestTransfer(detail);
  const toiletSummary =
    detail.toilets.length === 0
      ? "Not verified yet — check signs at the ticket gates"
      : inside && outside
        ? `${detail.toilets.length} listed (${inside} inside gates, ${outside} outside)`
        : inside
          ? `${detail.toilets.length} listed inside the ticket gates`
          : `${detail.toilets.length} listed outside the ticket gates`;
  const elevatorSummary = elevators.length
    ? listJoin(elevators, "en")
    : "Not verified yet — follow elevator pictograms on exit boards";
  const lockerSummary = lockerBanks
    ? `${lockerBanks} T-Locker bank${lockerBanks === 1 ? "" : "s"}${lockerSlots ? ` (~${lockerSlots} lockers)` : ""}${
        lockerPlaces.length ? ` at ${listJoin(lockerPlaces, "en")}` : ""
      }`
    : detail.luggageDesk
      ? `Staffed luggage desk: ${t(detail.luggageDesk, "en")}`
      : "No T-Locker banks listed yet";
  const nearby = spots.length
    ? spots.map((spot) => `${spot.name}${spot.exit ? ` (Exit ${spot.exit})` : ""}`).join(" · ")
    : "Open exit cards in the app panel above for map pins";

  return (
    <aside
      data-web-seo
      className="border-t border-line bg-white text-ink lg:mx-auto lg:w-full lg:max-w-[760px]"
    >
      <details className="group px-4 py-3">
        <summary className="cursor-pointer list-none py-1 marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-honey-strong">
                K-SUB · k-sub.com
              </span>
              <span className="mt-0.5 block text-[15px] font-extrabold tracking-tight text-ink lg:text-[17px]">
                {title}: Exit, Restroom & Elevator Guide
              </span>
              <span className="mt-1 block text-[12px] leading-snug text-ink-muted lg:text-[13px]">
                English facility snapshot for search — tap to expand
              </span>
            </span>
            <span
              aria-hidden
              className="mt-1 shrink-0 rounded-full border border-line bg-surface-muted px-2 py-0.5 text-[12px] font-bold text-ink-muted transition group-open:rotate-180"
            >
              ▾
            </span>
          </span>
        </summary>

        <div className="border-t border-line/80 pb-4 pt-3">
          <p className="text-[14px] leading-relaxed text-ink-muted lg:text-[15px]">
            Seoul Subway facility snapshot for {title} ({station.lines.join(" · ")}). Confirm details in the live
            dashboard above — official site www.k-sub.com (k-sub com).
          </p>

          <h2 className="mt-5 text-[15px] font-extrabold tracking-tight lg:text-[16px]">Key facilities</h2>
          <dl className="mt-2 grid gap-2 text-[13px] leading-snug lg:grid-cols-2 lg:gap-3 lg:text-[14px]">
            <div className="rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5">
              <dt className="font-bold text-ink">Restrooms (ticket gates)</dt>
              <dd className="mt-0.5 text-ink-muted">{toiletSummary}</dd>
            </div>
            <div className="rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5">
              <dt className="font-bold text-ink">Elevator exits</dt>
              <dd className="mt-0.5 text-ink-muted">{elevatorSummary}</dd>
            </div>
            <div className="rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5">
              <dt className="font-bold text-ink">Luggage lockers</dt>
              <dd className="mt-0.5 text-ink-muted">{lockerSummary}</dd>
            </div>
            <div className="rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5">
              <dt className="font-bold text-ink">Nearby places</dt>
              <dd className="mt-0.5 text-ink-muted">{nearby}</dd>
            </div>
          </dl>

          {quickest ? (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted lg:text-[14px]">
              Fastest verified transfer walk: about {minutes(quickest.seconds!)} min (
              {quickest.alight.replace("-", " car · door ")}).
            </p>
          ) : null}

          <p className="mt-3 text-[13px] font-semibold text-honey-strong">
            <Link href={`/en/stations/${station.slug}`} className="underline-offset-2 hover:underline">
              Full multilingual guide for {title} →
            </Link>
          </p>
        </div>
      </details>
    </aside>
  );
}
