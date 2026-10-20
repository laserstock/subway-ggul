import type { Report, ReportType } from "./reports";

export const REPORT_TTL_MINUTES: Record<ReportType, number> = {
  toilet_paper: 60,
  escalator: 120,
  crowd: 30,
  general: 90,
};

export const FRESH_MINUTES = 30;
/** "Needs checking" once less than this share of the TTL is left. */
const EXPIRING_RATIO = 0.25;

export type FreshnessBadge = "fresh" | "expiring" | null;

export type RankedReport = Report & {
  /** Minutes since the report was posted or last confirmed, whichever is later. */
  ageMinutes: number;
  remainingMinutes: number;
  score: number;
  badge: FreshnessBadge;
};

export function getFreshnessScore(upvotes: number, ageMinutes: number) {
  return upvotes * 10 - ageMinutes * 2;
}

export function rankReport(report: Report, now: number): RankedReport {
  const refreshedAt = Math.max(report.createdAt, report.confirmedAt ?? 0);
  const ageMinutes = Math.max(0, Math.floor((now - refreshedAt) / 60_000));
  const ttl = REPORT_TTL_MINUTES[report.type];
  const remainingMinutes = ttl - ageMinutes;
  const badge: FreshnessBadge =
    remainingMinutes > 0 && remainingMinutes <= ttl * EXPIRING_RATIO
      ? "expiring"
      : ageMinutes < FRESH_MINUTES
        ? "fresh"
        : null;
  return { ...report, ageMinutes, remainingMinutes, score: getFreshnessScore(report.likes, ageMinutes), badge };
}

/** Live reports by freshness score (desc); reports past their TTL go to `expired`, newest first. */
export function rankReports(reports: Report[], now: number) {
  const ranked = reports.map((report) => rankReport(report, now));
  return {
    active: ranked
      .filter((report) => report.remainingMinutes > 0)
      .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt),
    expired: ranked
      .filter((report) => report.remainingMinutes <= 0)
      .sort((a, b) => a.ageMinutes - b.ageMinutes),
  };
}
