"use client";

import { useRouter } from "next/navigation";
import { Fragment, useCallback, useId, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { lineColor } from "../kakao-places";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import SearchOverlay from "../_components/SearchOverlay";
import {
  clockTime,
  trainBound,
  trainStatus,
  trainTags,
  trainWait,
  trainsToward,
  useArrivals,
  useElapsed,
  type Train,
} from "../_lib/arrivals";
import { useLocale } from "../_lib/locale";
import { findRoute, networkStationId, type Route, type RouteLeg, type RouteMode, type RouteTransfer } from "../_lib/routeFinder";
import { stationName, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { lineLabel } from "../_lib/subwayLine";
import { ROUTE_MODES, ROUTE_TITLE, RouteHeaderIcon } from "./header";
import { routeHref } from "./params";

const COPY = {
  from: { ko: "출발", en: "From", zh: "出发", ja: "出発" },
  to: { ko: "도착", en: "To", zh: "到达", ja: "到着" },
  pickFrom: { ko: "출발역을 선택하세요", en: "Choose a departure station", zh: "请选择出发站", ja: "出発駅を選択" },
  pickTo: { ko: "도착역을 선택하세요", en: "Choose an arrival station", zh: "请选择到达站", ja: "到着駅を選択" },
  swap: { ko: "출발·도착 바꾸기", en: "Swap stations", zh: "交换出发和到达", ja: "出発と到着を入れ替え" },
  fastest: { ko: "최단시간", en: "Fastest", zh: "最短时间", ja: "最短時間" },
  fewest: { ko: "최소환승", en: "Fewest transfers", zh: "最少换乘", ja: "乗換最少" },
  duration: { ko: "소요시간", en: "Travel time", zh: "所需时间", ja: "所要時間" },
  minutes: { ko: "{m}분", en: "{m} min", zh: "{m}分钟", ja: "{m}分" },
  hours: { ko: "{h}시간 {m}분", en: "{h} h {m} min", zh: "{h}小时{m}分钟", ja: "{h}時間{m}分" },
  summary: {
    ko: "환승 {n}회 | {s}개 역",
    en: "{n} transfers | {s} stops",
    zh: "换乘{n}次 | {s}站",
    ja: "乗換{n}回 | {s}駅",
  },
  noTransfer: { ko: "환승 없음 | {s}개 역", en: "No transfers | {s} stops", zh: "无需换乘 | {s}站", ja: "乗換なし | {s}駅" },
  sameAsFastest: {
    ko: "최단시간 경로가 환승도 가장 적어요",
    en: "The fastest route also has the fewest transfers",
    zh: "最短时间路线的换乘也最少",
    ja: "最短時間ルートが乗換も最少です",
  },
  toward: { ko: "{station} 방향", en: "Toward {station}", zh: "往{station}方向", ja: "{station}方面" },
  express: { ko: "급행", en: "Express", zh: "急行", ja: "急行" },
  stops: { ko: "{n}개 역 ({m})", en: "{n} stops ({m})", zh: "{n}站（{m}）", ja: "{n}駅（{m}）" },
  alight: { ko: "하차", en: "Off", zh: "下车", ja: "降車" },
  arrive: { ko: "도착", en: "End", zh: "到达", ja: "到着" },
  transfer: { ko: "환승 (도보 {walk})", en: "Transfer ({walk} walk)", zh: "换乘（步行{walk}）", ja: "乗換（徒歩{walk}）" },
  branch: { ko: "열차 갈아타기 (같은 노선)", en: "Change trains (same line)", zh: "换车（同一线路）", ja: "乗り換え（同じ路線）" },
  walkTo: { ko: "{station}으로 이동", en: "Walk to {station}", zh: "步行至{station}", ja: "{station}へ移動" },
  live: { ko: "실시간", en: "Live", zh: "实时", ja: "リアルタイム" },
  liveNone: {
    ko: "지금 이 방향 도착 정보가 없어요",
    en: "No live trains this way right now",
    zh: "此方向暂无实时到站信息",
    ja: "この方向の到着情報は現在ありません",
  },
  eta: { ko: "지금 출발하면 {time} 도착 예정", en: "Leave now, arrive ~{time}", zh: "现在出发约{time}到达", ja: "今出発すると{time}頃到着" },
  etaBasis: {
    ko: "{status} 오는 {bound} 열차 탑승 기준",
    en: "If you board the {bound} train ({status})",
    zh: "按乘坐{bound}列车（{status}）计算",
    ja: "{status}の{bound}列車に乗る場合",
  },
  wait: { ko: "평균 대기 {m} 포함", en: "incl. ~{m} average wait", zh: "含平均等候{m}", ja: "平均待ち{m}を含む" },
  sameStation: {
    ko: "출발역과 도착역이 같아요",
    en: "Departure and arrival are the same station",
    zh: "出发站与到达站相同",
    ja: "出発駅と到着駅が同じです",
  },
  notFound: {
    ko: "이 구간은 아직 경로 정보가 없어요",
    en: "No route data for this trip yet",
    zh: "该区间暂无路线信息",
    ja: "この区間のルート情報はまだありません",
  },
  pickBoth: {
    ko: "출발역과 도착역을 고르면 최단시간·최소환승 경로를 보여드려요",
    en: "Pick both stations to see the fastest and fewest-transfer routes",
    zh: "选择出发站和到达站，即可查看最短时间与最少换乘路线",
    ja: "出発駅と到着駅を選ぶと、最短時間・乗換最少ルートを表示します",
  },
  note: {
    ko: "소요시간은 역간 표준 운행시간에 정차·환승 도보·평균 대기시간을 더한 예상치예요. 실제 열차 시각표와는 차이가 있을 수 있어요.",
    en: "Times are estimates from standard running times plus stops, transfer walks and average waits, not live timetables.",
    zh: "所需时间为站间标准运行时间加上停站、换乘步行及平均等候时间的估算值，可能与实际时刻表不同。",
    ja: "所要時間は駅間の標準運行時間に停車・乗換徒歩・平均待ち時間を加えた目安で、実際の時刻表とは異なる場合があります。",
  },
  credit: {
    ko: "노선 데이터 © OpenStreetMap 기여자 · 운행시간 서울교통공사 공공데이터",
    en: "Line data © OpenStreetMap contributors · Running times: Seoul Metro open data",
    zh: "线路数据 © OpenStreetMap 贡献者 · 运行时间：首尔交通公社公共数据",
    ja: "路線データ © OpenStreetMap 寄稿者 · 運行時間：ソウル交通公社 公共データ",
  },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function duration(seconds: number, locale: Locale) {
  const total = Math.max(1, Math.round(seconds / 60));
  if (total < 60) return fill(t(COPY.minutes, locale), { m: total });
  return fill(t(COPY.hours, locale), { h: Math.floor(total / 60), m: total % 60 });
}

function placeName(ko: string, locale: Locale) {
  return t(stationName(ko), locale);
}

/** "대림" rather than "대림역" when the name sits inside a phrase. */
function bareName(ko: string, locale: Locale) {
  return placeName(ko, locale).replace(/(역|駅|站)$/, "");
}

function routeSignature(route: Route | null) {
  return route?.legs.map((leg) => `${leg.line}${leg.express ? "+" : ""}:${leg.stations[0]}>${leg.stations.at(-1)}`).join("|") ?? "";
}

function StationRow({
  label,
  station,
  placeholder,
  tone,
  locale,
  onPick,
}: {
  label: Localized;
  station: StationOption | null;
  placeholder: Localized;
  tone: "from" | "to";
  locale: Locale;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-haspopup="dialog"
      className="flex min-h-[46px] w-full min-w-0 items-center gap-2 px-3 text-left transition active:bg-neutral-50"
    >
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${
          tone === "from" ? "bg-[#e7f8ee] text-[#15803d]" : "bg-[#fdecec] text-[#dc2626]"
        }`}
      >
        {t(label, locale)}
      </span>
      {station ? (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 break-words text-[16px] font-extrabold leading-snug text-neutral-900">{t(station.name, locale)}</span>
          <LineBadges station={station} locale={locale} size="chip" />
        </span>
      ) : (
        <span className="min-w-0 break-words text-[15px] font-semibold leading-snug text-neutral-400">{t(placeholder, locale)}</span>
      )}
    </button>
  );
}

function LiveTrains({ trains, elapsed, locale }: { trains: Train[]; elapsed: number; locale: Locale }) {
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
      <span className="flex items-center gap-1 font-extrabold text-[#16a34a]">
        <span className="relative flex h-1.5 w-1.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e]/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
        </span>
        {t(COPY.live, locale)}
      </span>
      {trains.length === 0 ? (
        <span className="font-semibold text-neutral-400">{t(COPY.liveNone, locale)}</span>
      ) : (
        trains.slice(0, 2).map((train) => {
          const tags = trainTags(train, locale);
          return (
            <span key={train.order} className="rounded-full bg-[#eef4ff] px-2 py-0.5 font-bold text-[#1d4ed8]">
              <span className="font-black">{trainStatus(train, elapsed, locale)}</span> · {trainBound(train, locale)}
              {tags.length > 0 ? <span className="ml-1 font-extrabold text-[#dc2626]">{tags.join(" · ")}</span> : null}
            </span>
          );
        })
      )}
    </p>
  );
}

function LegItem({
  leg,
  last,
  live,
  locale,
}: {
  leg: RouteLeg;
  last: boolean;
  /** Live trains boarding this leg, for the first leg only. */
  live: { trains: Train[]; elapsed: number } | null;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const color = lineColor([leg.line]);
  const label = t(lineLabel(leg.line), locale);
  const between = leg.stations.slice(1, -1);
  const stops = leg.stations.length - 1;
  return (
    <>
      <li className="flex gap-3">
        <div className="flex w-9 shrink-0 flex-col items-center">
          <LineIcon line={leg.line} locale={locale} label={label} size="md" className="h-8 min-w-8 ring-4 ring-white" />
          <span className="-my-0.5 w-[6px] flex-1" style={{ backgroundColor: color }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pb-4 pt-1">
          <p className="break-words text-[16px] font-extrabold leading-tight text-neutral-900">{placeName(leg.stations[0], locale)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] font-semibold text-neutral-500">
            <span style={{ color }}>{label}</span>
            {leg.express ? (
              <span className="rounded bg-[#fdecec] px-1 text-[11px] font-extrabold text-[#dc2626]">{t(COPY.express, locale)}</span>
            ) : null}
            <span aria-hidden>|</span>
            <span>{fill(t(COPY.toward, locale), { station: bareName(leg.stations[1], locale) })}</span>
          </p>
          {live ? <LiveTrains trains={live.trains} elapsed={live.elapsed} locale={locale} /> : null}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            disabled={between.length === 0}
            className="mt-2 flex items-center gap-1 text-[13px] font-bold text-neutral-600 disabled:cursor-default"
          >
            {fill(t(COPY.stops, locale), { n: stops, m: duration(leg.seconds, locale) })}
            {between.length > 0 ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className={`text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </button>
          {open ? (
            <ol className="mt-1.5 flex flex-col gap-1.5 border-l-2 border-neutral-100 pl-2.5">
              {between.map((name) => (
                <li key={name} className="text-[13px] font-medium text-neutral-500">
                  {placeName(name, locale)}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </li>
      <li className="flex items-center gap-3">
        <div className="flex w-9 shrink-0 justify-center">
          <span
            className={`flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
              last ? "text-white" : "border-[2.5px] bg-white"
            }`}
            style={last ? { backgroundColor: color } : { borderColor: color, color }}
          >
            {t(last ? COPY.arrive : COPY.alight, locale)}
          </span>
        </div>
        <p className="min-w-0 break-words text-[16px] font-extrabold leading-tight text-neutral-900">{placeName(leg.stations.at(-1)!, locale)}</p>
      </li>
    </>
  );
}

function TransferItem({ transfer, sameLine, locale }: { transfer: RouteTransfer; sameLine: boolean; locale: Locale }) {
  const walk = duration(transfer.walkSeconds, locale);
  const wait = Math.round(transfer.waitSeconds / 60);
  return (
    <li className="flex gap-3">
      <div className="flex w-9 shrink-0 flex-col items-center py-1">
        <span className="w-0 flex-1 border-l-[3px] border-dotted border-neutral-300" aria-hidden />
        <span className="py-1 text-[16px] leading-none" aria-hidden>
          🚶
        </span>
        <span className="w-0 flex-1 border-l-[3px] border-dotted border-neutral-300" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 py-3.5">
        <p className="text-[13px] font-bold text-neutral-700">
          {sameLine ? t(COPY.branch, locale) : fill(t(COPY.transfer, locale), { walk })}
        </p>
        {transfer.toStation ? (
          <p className="mt-0.5 text-[12px] font-semibold text-neutral-500">
            {fill(t(COPY.walkTo, locale), { station: placeName(transfer.toStation, locale) })}
          </p>
        ) : null}
        {wait > 0 ? (
          <p className="mt-0.5 text-[11px] text-neutral-400">{fill(t(COPY.wait, locale), { m: duration(transfer.waitSeconds, locale) })}</p>
        ) : null}
      </div>
    </li>
  );
}

function RouteResult({
  route,
  from,
  note,
  locale,
}: {
  route: Route;
  from: StationOption;
  note: string | null;
  locale: Locale;
}) {
  const stops = route.legs.reduce((sum, leg) => sum + leg.stations.length - 1, 0);
  const first = route.legs[0];
  const { board } = useArrivals(from.name.ko);
  const elapsed = useElapsed(board);
  const liveTrains = board.status === "ok" ? trainsToward(board.trains, first.line, first.stations[1]) : null;
  const catchable = liveTrains
    ?.map((train) => ({ train, wait: trainWait(train, elapsed) }))
    .find((entry): entry is { train: Train; wait: number } => entry.wait !== null);
  const arriveAt =
    board.status === "ok" && catchable ? board.fetchedAt + (elapsed + catchable.wait + route.seconds) * 1000 : null;
  return (
    <section className="rounded-2xl border border-neutral-200/70 bg-white px-4 pb-2 pt-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <p className="text-[12px] font-bold text-neutral-500">{t(COPY.duration, locale)}</p>
      <p className="mt-0.5 text-[32px] font-black leading-tight tracking-tight text-neutral-900">{duration(route.seconds, locale)}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-neutral-500">
        {route.transfers.length > 0
          ? fill(t(COPY.summary, locale), { n: route.transfers.length, s: stops })
          : fill(t(COPY.noTransfer, locale), { s: stops })}
      </p>
      {arriveAt !== null && catchable ? (
        <div className="mt-2 rounded-xl bg-[#ecfdf3] px-3 py-2">
          <p className="text-[14px] font-extrabold text-[#15803d]">
            🟢 {fill(t(COPY.eta, locale), { time: clockTime(arriveAt) })}
          </p>
          <p className="mt-0.5 text-[11.5px] font-semibold text-[#16a34a]">
            {fill(t(COPY.etaBasis, locale), {
              status: trainStatus(catchable.train, elapsed, locale),
              bound: trainBound(catchable.train, locale),
            })}
          </p>
        </div>
      ) : null}
      {note ? <p className="mt-1.5 text-[12px] font-bold text-[#15803d]">✓ {note}</p> : null}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden>
        {route.legs.map((leg, index) => (
          <span
            key={`${leg.line}-${index}`}
            className="h-full border-r-2 border-white last:border-r-0"
            style={{ backgroundColor: lineColor([leg.line]), flexGrow: leg.seconds }}
          />
        ))}
      </div>
      <ol className="mt-4">
        {route.legs.map((leg, index) => (
          <Fragment key={`${leg.line}-${leg.stations[0]}-${index}`}>
            <LegItem
              leg={leg}
              last={index === route.legs.length - 1}
              live={index === 0 && liveTrains ? { trains: liveTrains, elapsed } : null}
              locale={locale}
            />
            {route.transfers[index] ? (
              <TransferItem
                transfer={route.transfers[index]}
                sameLine={route.legs[index + 1]?.line === leg.line}
                locale={locale}
              />
            ) : null}
          </Fragment>
        ))}
      </ol>
    </section>
  );
}

function Message({ emoji, text }: { emoji: string; text: string }) {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-neutral-200/70 bg-white px-5 py-8 text-center">
      <span className="text-[36px]" aria-hidden>
        {emoji}
      </span>
      <p className="mt-2 text-[14px] font-semibold leading-relaxed text-neutral-600">{text}</p>
    </section>
  );
}

export default function RouteScreen({
  from,
  to,
  initialMode,
}: {
  from: StationOption | null;
  to: StationOption | null;
  initialMode: RouteMode;
}) {
  const locale = useLocale();
  const router = useRouter();
  const tabsId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<RouteMode>(initialMode);
  const [picking, setPicking] = useState<"from" | "to" | null>(null);
  const closeSearch = useCallback(() => setPicking(null), []);

  const result = useMemo(() => {
    if (!from || !to) return null;
    const a = networkStationId(from.name.ko, from.center);
    const b = networkStationId(to.name.ko, to.center);
    if (a === null || b === null) return { same: false, routes: null };
    if (a === b) return { same: true, routes: null };
    return { same: false, routes: { fastest: findRoute(a, b, "fastest"), fewest: findRoute(a, b, "fewest") } };
  }, [from, to]);

  const route = result?.routes?.[mode] ?? null;
  const fewestIsFastest =
    mode === "fewest" && routeSignature(route) === routeSignature(result?.routes?.fastest ?? null);

  function changeMode(next: RouteMode) {
    setMode(next);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", next);
    window.history.replaceState(null, "", url);
  }

  function go(nextFrom: StationOption | null, nextTo: StationOption | null) {
    const href = routeHref(nextFrom, nextTo);
    router.replace(`${href}${href.includes("?") ? "&" : "?"}mode=${mode}`);
  }

  function openSearch(end: "from" | "to") {
    flushSync(() => setPicking(end));
    searchInputRef.current?.focus();
  }

  function select(station: StationOption) {
    const end = picking;
    setPicking(null);
    if (end === "from") go(station, to);
    else go(from, station);
  }

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={ROUTE_TITLE} icon={<RouteHeaderIcon />} />

        <div className="mx-4 flex shrink-0 items-center gap-2 rounded-2xl border border-neutral-200/70 bg-white py-1 pr-2 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <div className="min-w-0 flex-1 divide-y divide-dashed divide-neutral-200">
            <StationRow label={COPY.from} station={from} placeholder={COPY.pickFrom} tone="from" locale={locale} onPick={() => openSearch("from")} />
            <StationRow label={COPY.to} station={to} placeholder={COPY.pickTo} tone="to" locale={locale} onPick={() => openSearch("to")} />
          </div>
          <button
            type="button"
            onClick={() => go(to, from)}
            aria-label={t(COPY.swap, locale)}
            title={t(COPY.swap, locale)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M8 4v15m0 0l-3.5-3.5M8 19l3.5-3.5M16 20V5m0 0l-3.5 3.5M16 5l3.5 3.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div role="tablist" className="mx-4 mt-3 grid shrink-0 grid-cols-2 border-b border-neutral-200">
          {ROUTE_MODES.map((id) => {
            const active = id === mode;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${tabsId}-${id}`}
                aria-selected={active}
                aria-controls={`${tabsId}-panel`}
                onClick={() => changeMode(id)}
                className={`-mb-px border-b-[3px] py-2.5 text-[15px] font-extrabold transition ${
                  active ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400"
                }`}
              >
                {t(COPY[id], locale)}
              </button>
            );
          })}
        </div>

        <main
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${mode}`}
          className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-3"
        >
          <div key={mode} className="animate-[tab-in_200ms_ease-out]">
            {!result ? (
              <Message emoji="🧭" text={t(COPY.pickBoth, locale)} />
            ) : result.same ? (
              <Message emoji="📍" text={t(COPY.sameStation, locale)} />
            ) : route && from ? (
              <RouteResult
                route={route}
                from={from}
                note={fewestIsFastest ? t(COPY.sameAsFastest, locale) : null}
                locale={locale}
              />
            ) : (
              <Message emoji="🚧" text={t(COPY.notFound, locale)} />
            )}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{t(COPY.note, locale)}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-neutral-300">{t(COPY.credit, locale)}</p>
        </main>

        <BottomNav active="home" />

        <SearchOverlay
          isOpen={picking !== null}
          onClose={closeSearch}
          onSelect={select}
          inputRef={searchInputRef}
          near={(picking === "to" ? to : from)?.center ?? from?.center ?? to?.center ?? null}
        />
      </div>
    </div>
  );
}
