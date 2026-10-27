"use client";

import { useState } from "react";
import { rankReports, type RankedReport } from "../_lib/freshness";
import { useLocale } from "../_lib/locale";
import {
  confirmReport,
  formatRelativeTime,
  resolveReport,
  useNow,
  useStationReports,
  type ReportType,
} from "../_lib/reports";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import FlagSheet, { FlagButton, type FlagRequest } from "./FlagSheet";

const MAX_ACTIVE = 5;

const COPY = {
  title: {
    ko: "실시간 현장 소식 & 제보",
    en: "live updates & reports",
    zh: "实时现场消息 & 上报",
    ja: "リアルタイム現場情報 & 投稿",
  },
  sortedBy: { ko: "🔥 신선도순", en: "🔥 Freshest", zh: "🔥 新鲜度排序", ja: "🔥 鮮度順" },
  noStation: {
    ko: "역을 찾으면 실시간 소식이 보여요",
    en: "Live updates appear once a station is found",
    zh: "找到车站后将显示实时消息",
    ja: "駅が見つかるとリアルタイム情報が表示されます",
  },
  empty: {
    ko: "지금 유효한 제보가 없어요. 첫 제보를 남겨 주세요!",
    en: "No live reports right now. Be the first to post!",
    zh: "目前没有有效上报，来发布第一条吧！",
    ja: "現在有効な投稿はありません。最初の投稿をどうぞ！",
  },
  fresh: { ko: "🔥 신선도 높음", en: "🔥 Fresh", zh: "🔥 新鲜", ja: "🔥 鮮度高" },
  expiring: { ko: "⏳ 확인 필요", en: "⏳ Needs check", zh: "⏳ 待确认", ja: "⏳ 要確認" },
  minutesLeft: { ko: "{n}분 남음", en: "{n} min left", zh: "剩余{n}分钟", ja: "残り{n}分" },
  expired: { ko: "⌛ 만료", en: "⌛ Expired", zh: "⌛ 已过期", ja: "⌛ 期限切れ" },
  confirmedAgo: { ko: "✅ {time} 확인", en: "✅ confirmed {time}", zh: "✅ {time}确认", ja: "✅ {time}に確認" },
  stillTrue: { ko: "👍 여전히 그래요", en: "👍 Still true", zh: "👍 依然如此", ja: "👍 まだそうです" },
  resolved: { ko: "❌ 해결됐어요", en: "❌ Resolved", zh: "❌ 已解决", ja: "❌ 解決しました" },
  showExpired: {
    ko: "⌛ 유효시간 지난 제보 {n}개 보기",
    en: "⌛ Show {n} expired reports",
    zh: "⌛ 查看{n}条已过期上报",
    ja: "⌛ 期限切れの投稿{n}件を表示",
  },
  hideExpired: { ko: "지난 제보 접기", en: "Hide expired", zh: "收起已过期", ja: "期限切れを閉じる" },
  confirmedToast: {
    ko: "확인 고마워요! 유효시간이 연장됐어요",
    en: "Thanks! This report's lifetime was extended",
    zh: "谢谢确认！有效时间已延长",
    ja: "ありがとうございます！有効時間を延長しました",
  },
  unconfirmedToast: { ko: "확인을 취소했어요", en: "Confirmation removed", zh: "已取消确认", ja: "確認を取り消しました" },
  resolvedToast: {
    ko: "해결됐다고 표시했어요. 피드에서 숨겼어요",
    en: "Marked as resolved and hidden from the feed",
    zh: "已标记为解决并从动态中隐藏",
    ja: "解決済みにしてフィードから非表示にしました",
  },
} satisfies Record<string, Localized>;

const TYPE_META: Record<ReportType, { emoji: string; label: Localized }> = {
  toilet_paper: { emoji: "🧻", label: { ko: "화장실·위생", en: "Restroom", zh: "卫生间", ja: "トイレ" } },
  escalator: { emoji: "🔧", label: { ko: "시설", en: "Facility", zh: "设施", ja: "設備" } },
  crowd: { emoji: "👥", label: { ko: "혼잡도", en: "Crowd", zh: "拥挤度", ja: "混雑" } },
  general: { emoji: "💬", label: { ko: "일반", en: "General", zh: "一般", ja: "一般" } },
};

function FeedItem({
  report,
  now,
  locale,
  expired,
  onConfirm,
  onResolve,
  onFlag,
}: {
  report: RankedReport;
  now: number;
  locale: Locale;
  expired: boolean;
  onConfirm: () => void;
  onResolve: () => void;
  onFlag: () => void;
}) {
  const type = TYPE_META[report.type];
  const confirmedAt =
    report.confirmedAt !== null && report.confirmedAt > report.createdAt ? report.confirmedAt : null;
  return (
    <li className={`py-2.5 ${expired ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2">
        <span
          className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-[13px]"
          title={t(type.label, locale)}
          aria-hidden
        >
          {type.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-neutral-800">{t(report.text, locale)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <time dateTime={new Date(report.createdAt).toISOString()} className="font-medium text-neutral-400">
              🕒 {formatRelativeTime(report.createdAt, now, locale)}
            </time>
            {confirmedAt !== null ? (
              <span className="font-medium text-[#16a34a]">
                {t(COPY.confirmedAgo, locale).replace("{time}", formatRelativeTime(confirmedAt, now, locale))}
              </span>
            ) : null}
            {expired ? (
              <span className="rounded-full bg-neutral-100 px-1.5 py-[1px] font-bold text-neutral-500">
                {t(COPY.expired, locale)}
              </span>
            ) : report.badge === "expiring" ? (
              <span className="rounded-full bg-[#fef3c7] px-1.5 py-[1px] font-bold text-[#b45309]">
                {t(COPY.expiring, locale)} · {t(COPY.minutesLeft, locale).replace("{n}", String(report.remainingMinutes))}
              </span>
            ) : report.badge === "fresh" ? (
              <span className="rounded-full bg-[#fff1e6] px-1.5 py-[1px] font-bold text-[#ea580c]">
                {t(COPY.fresh, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5 pl-8">
        <button
          type="button"
          onClick={onConfirm}
          aria-pressed={report.liked}
          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-bold transition active:scale-95 ${
            report.liked
              ? "border-[#f59e0b] bg-[#fff1d6] text-[#b45309]"
              : "border-neutral-200 bg-white text-neutral-600"
          }`}
        >
          {t(COPY.stillTrue, locale)}
          <span key={report.likes} className="inline-block animate-[vote-pop_320ms_ease-out] tabular-nums">
            {report.likes}
          </span>
        </button>
        <button
          type="button"
          onClick={onResolve}
          className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-bold text-neutral-600 transition active:scale-95"
        >
          {t(COPY.resolved, locale)}
        </button>
        {report.mine ? null : <FlagButton onClick={onFlag} className="ml-auto" />}
      </div>
    </li>
  );
}

/** Station feed ranked by freshness; re-ranks on every clock tick from useNow(). */
export default function LiveFeed({
  station,
  onToast,
}: {
  station: StationOption | null;
  onToast: (message: string) => void;
}) {
  const locale = useLocale();
  const now = useNow();
  const reports = useStationReports(station);
  const [showExpired, setShowExpired] = useState(false);
  const [flagging, setFlagging] = useState<FlagRequest | null>(null);
  const { active, expired } = now !== null ? rankReports(reports, now) : { active: [], expired: [] };

  function confirm(id: string) {
    onToast(t(confirmReport(id) ? COPY.confirmedToast : COPY.unconfirmedToast, locale));
  }

  function resolve(id: string) {
    resolveReport(id);
    onToast(t(COPY.resolvedToast, locale));
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-[14px] font-extrabold text-neutral-900">
          <span aria-hidden>💬 </span>
          {station ? `${t(station.name, locale)} ` : ""}
          {t(COPY.title, locale)}
        </h2>
        {station ? (
          <span className="shrink-0 rounded-full bg-[#fff1e6] px-2 py-[2px] text-[10px] font-bold text-[#ea580c]">
            {t(COPY.sortedBy, locale)}
          </span>
        ) : null}
      </div>

      {!station ? (
        <p className="mt-2 text-[12px] text-neutral-400">{t(COPY.noStation, locale)}</p>
      ) : now === null ? null : (
        <>
          {active.length === 0 ? (
            <p className="mt-2 text-[12px] text-neutral-400">{t(COPY.empty, locale)}</p>
          ) : (
            <ul className="mt-1 divide-y divide-neutral-100">
              {active.slice(0, MAX_ACTIVE).map((report) => (
                <FeedItem
                  key={report.id}
                  report={report}
                  now={now}
                  locale={locale}
                  expired={false}
                  onConfirm={() => confirm(report.id)}
                  onResolve={() => resolve(report.id)}
                  onFlag={() => setFlagging({ target: "report", id: report.id, authorId: report.authorId })}
                />
              ))}
            </ul>
          )}

          {expired.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setShowExpired((open) => !open)}
                aria-expanded={showExpired}
                className="mt-1.5 text-[12px] font-bold text-neutral-400"
              >
                {showExpired
                  ? t(COPY.hideExpired, locale)
                  : t(COPY.showExpired, locale).replace("{n}", String(expired.length))}
              </button>
              {showExpired ? (
                <ul className="mt-1 divide-y divide-neutral-100">
                  {expired.map((report) => (
                    <FeedItem
                      key={report.id}
                      report={report}
                      now={now}
                      locale={locale}
                      expired
                      onConfirm={() => confirm(report.id)}
                      onResolve={() => resolve(report.id)}
                      onFlag={() => setFlagging({ target: "report", id: report.id, authorId: report.authorId })}
                    />
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </>
      )}
      {flagging ? <FlagSheet request={flagging} onClose={() => setFlagging(null)} onToast={onToast} /> : null}
    </section>
  );
}

