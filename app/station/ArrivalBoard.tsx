"use client";

import { LineIcon } from "../_components/LineBadges";
import {
  clockTime,
  directionLabel,
  groupTrains,
  trainBound,
  trainStatus,
  trainTags,
  towardLabel,
  useArrivals,
  useElapsed,
} from "../_lib/arrivals";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";

const COPY = {
  title: { ko: "실시간 도착", en: "Live arrivals", zh: "实时到站", ja: "リアルタイム到着" },
  updated: { ko: "{time} 기준", en: "as of {time}", zh: "{time} 更新", ja: "{time} 時点" },
  refresh: { ko: "새로고침", en: "Refresh", zh: "刷新", ja: "更新" },
  empty: {
    ko: "지금은 도착 정보가 없어요 · 운행 시간이 아니거나 실시간 정보를 제공하지 않는 역이에요",
    en: "No arrivals right now · Service may be over, or this station has no live data",
    zh: "暂无到站信息 · 可能已停运，或本站不提供实时信息",
    ja: "現在到着情報はありません · 運行時間外か、リアルタイム情報のない駅です",
  },
  failed: {
    ko: "실시간 정보를 불러오지 못했어요",
    en: "Couldn't load live arrivals",
    zh: "无法加载实时信息",
    ja: "リアルタイム情報を読み込めませんでした",
  },
  source: { ko: "서울시 실시간 지하철 정보", en: "Seoul real-time subway data", zh: "首尔市实时地铁信息", ja: "ソウル市リアルタイム地下鉄情報" },
} satisfies Record<string, Localized>;

const TRAINS_PER_GROUP = 2;

export default function ArrivalBoard({ station, locale }: { station: StationOption; locale: Locale }) {
  const { board, refresh } = useArrivals(station.name.ko);
  const elapsed = useElapsed(board);

  if (board.status === "unconfigured") return null;

  const groups = board.status === "ok" ? groupTrains(board.trains) : [];

  return (
    <section className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-line">
      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h2 className="flex items-center gap-1.5 text-[15px] font-extrabold tracking-tight text-neutral-900">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e]/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
          {t(COPY.title, locale)}
        </h2>
        <button
          type="button"
          onClick={refresh}
          aria-label={t(COPY.refresh, locale)}
          className="flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-neutral-500 active:scale-95"
        >
          {board.status === "ok" ? t(COPY.updated, locale).replace("{time}", clockTime(board.fetchedAt)) : null}
          <span aria-hidden>↻</span>
        </button>
      </div>

      {board.status === "loading" ? (
        <ul className="flex flex-col gap-2 px-4 pb-3" aria-busy>
          {[0, 1].map((index) => (
            <li key={index} className="h-11 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </ul>
      ) : board.status === "failed" ? (
        <p className="px-4 pb-3 text-[12.5px] text-neutral-500">{t(COPY.failed, locale)}</p>
      ) : groups.length === 0 ? (
        <p className="px-4 pb-3 text-[12.5px] leading-relaxed text-neutral-500">{t(COPY.empty, locale)}</p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {groups.map((group) => (
            <li key={group.key} className="flex items-center gap-2.5 px-4 py-2.5">
              <LineIcon line={group.line} locale={locale} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-extrabold text-neutral-900">
                  {towardLabel(group.heading, locale)}
                </span>
                <span className="block text-[11px] font-semibold text-neutral-400">
                  {directionLabel(group.direction, locale)}
                </span>
              </span>
              <span className="flex shrink-0 gap-3">
                {group.trains.slice(0, TRAINS_PER_GROUP).map((train) => {
                  const tags = trainTags(train, locale);
                  return (
                    <span key={train.order} className="w-[76px] text-right">
                      <span className="block text-[13.5px] font-black text-[#2563eb]">
                        {trainStatus(train, elapsed, locale)}
                      </span>
                      <span className="block truncate text-[10.5px] font-semibold text-neutral-500">
                        {tags.length > 0 ? (
                          <span className="mr-1 font-extrabold text-[#dc2626]">{tags.join(" · ")}</span>
                        ) : null}
                        {trainBound(train, locale)}
                      </span>
                    </span>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-line px-4 py-1.5 text-right text-[10px] text-neutral-400">{t(COPY.source, locale)}</p>
    </section>
  );
}
