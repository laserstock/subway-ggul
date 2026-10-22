"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import AppHeader from "../_components/AppHeader";
import BottomNav, { type NavTab } from "../_components/BottomNav";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import ReportSheet from "../_components/ReportSheet";
import SearchOverlay from "../_components/SearchOverlay";
import { Toast, useToast } from "../_components/Toast";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import {
  removePlace,
  removeRoute,
  reverseRoute,
  useMyStations,
  type MyPlace,
  type MyRoute,
} from "../_lib/myStations";
import { addRecentStation } from "../_lib/recentStations";
import { routeSummary } from "../_lib/routeTips";
import { setDestinationStation, useDestinationStation } from "../_lib/selectedStation";
import { stationParams, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { MY_TITLE } from "./header";
import { placeLabel, PlaceSheet, RouteSheet } from "./MySheets";

const COPY = {
  edit: { ko: "✏️ 편집", en: "✏️ Edit", zh: "✏️ 编辑", ja: "✏️ 編集" },
  done: { ko: "✅ 완료", en: "✅ Done", zh: "✅ 完成", ja: "✅ 完了" },
  summary: {
    ko: "My 역 {places}곳 · 동선 {routes}개",
    en: "{places} stations · {routes} routes",
    zh: "{places}个车站 · {routes}条路线",
    ja: "駅{places}件 · ルート{routes}件",
  },
  placesTitle: { ko: "내가 즐겨찾는 My 역", en: "My favorite stations", zh: "我收藏的 My 车站", ja: "お気に入りの My 駅" },
  placesHint: {
    ko: "탭하면 1초 만에 그 역 꿀정보로 이동해요",
    en: "Tap to jump to that station's tips",
    zh: "点击即可1秒跳转到该站信息",
    ja: "タップで1秒でその駅の情報へ",
  },
  placesEditHint: {
    ko: "칩을 눌러 수정하거나 ✕로 삭제하세요",
    en: "Tap a chip to edit, or ✕ to delete",
    zh: "点击标签可编辑，点 ✕ 删除",
    ja: "チップをタップで編集、✕で削除",
  },
  placesEmpty: {
    ko: "집·회사처럼 자주 가는 역을 저장해 두면 1초 만에 꿀정보를 볼 수 있어요",
    en: "Save stations like home or work to see their tips in a second",
    zh: "保存家、公司等常去车站，1秒查看信息",
    ja: "自宅や会社などよく行く駅を保存すると、1秒で情報を確認できます",
  },
  addPlace: { ko: "+ 새 역 추가하기", en: "+ Add a station", zh: "+ 添加车站", ja: "+ 駅を追加" },
  viewing: { ko: "보는 중", en: "Viewing", zh: "查看中", ja: "表示中" },
  here: { ko: "현재", en: "Here", zh: "当前", ja: "現在地" },
  routesTitle: { ko: "My 자주 가는 동선", en: "My frequent routes", zh: "My 常用路线", ja: "My よく使うルート" },
  routesHint: {
    ko: "출퇴근·통학 경로의 환승·동선 꿀팁을 한눈에",
    en: "Commute tips for your daily routes at a glance",
    zh: "通勤·上学路线的换乘技巧一目了然",
    ja: "通勤・通学ルートの乗換のコツをひと目で",
  },
  routesEmpty: {
    ko: "출발역 ➔ 도착역을 묶어 두면 탑승 칸·꿀팁을 모아서 보여드려요",
    en: "Pair a From and To station to see boarding cars and tips together",
    zh: "将出发站与到达站组合，即可集中查看乘车位置与技巧",
    ja: "出発駅と到着駅をセットにすると、乗車位置とコツをまとめて表示します",
  },
  addRoute: { ko: "+ 자주 가는 동선 추가", en: "+ Add a frequent route", zh: "+ 添加常用路线", ja: "+ よく使うルートを追加" },
  boarding: {
    ko: "{line} 탑승 위치: {car}번 칸 ({note})",
    en: "{line} boarding: car {car} ({note})",
    zh: "{line} 乘车位置：{car}号车厢（{note}）",
    ja: "{line} 乗車位置：{car}号車（{note}）",
  },
  direct: {
    ko: "{line} 한 번에 가요 · 탑승 칸 정보 준비 중",
    en: "Direct on {line} · boarding car info coming soon",
    zh: "{line}直达 · 乘车位置信息准备中",
    ja: "{line}で乗り換えなし · 乗車位置は準備中",
  },
  transfer: {
    ko: "{from} → {to} 환승이 필요해요",
    en: "Transfer needed: {from} → {to}",
    zh: "需要换乘：{from} → {to}",
    ja: "乗り換えが必要：{from} → {to}",
  },
  noTips: {
    ko: "아직 꿀팁이 없어요 · 제보로 채워 주세요",
    en: "No tips yet · Share one with a report",
    zh: "还没有小贴士 · 欢迎上报补充",
    ja: "まだ情報がありません · 投稿で教えてください",
  },
  stationInfo: { ko: "{station} 꿀정보", en: "{station} tips", zh: "{station} 信息", ja: "{station}の情報" },
  reverse: { ko: "방향 바꾸기", en: "Reverse", zh: "反向", ja: "逆方向" },
  remove: { ko: "삭제", en: "Delete", zh: "删除", ja: "削除" },
  savedNote: {
    ko: "💾 이 기기에 자동 저장돼요 · 동선 꿀팁 일부는 베타 샘플이에요",
    en: "💾 Saved on this device automatically · Some route tips are beta samples",
    zh: "💾 自动保存在本设备 · 部分路线技巧为测试样例",
    ja: "💾 この端末に自動保存 · 一部のルート情報はベータ版サンプルです",
  },
  placeSaved: { ko: "My 역을 저장했어요", en: "My Station saved", zh: "已保存 My 车站", ja: "My 駅を保存しました" },
  placeRemoved: { ko: "My 역을 삭제했어요", en: "My Station removed", zh: "已删除 My 车站", ja: "My 駅を削除しました" },
  routeSaved: { ko: "동선을 저장했어요", en: "Route saved", zh: "已保存路线", ja: "ルートを保存しました" },
  routeRemoved: { ko: "동선을 삭제했어요", en: "Route removed", zh: "已删除路线", ja: "ルートを削除しました" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
} satisfies Record<string, Localized>;

function localizedLine(line: string, locale: Locale) {
  const number = line.match(/^(\d+)호선$/)?.[1];
  if (!number) return line;
  const byLocale: Record<Locale, string> = {
    ko: line,
    en: `Line ${number}`,
    zh: `${number}号线`,
    ja: `${number}号線`,
  };
  return byLocale[locale];
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function PlaceChip({
  place,
  locale,
  editing,
  status,
  onOpen,
  onRemove,
}: {
  place: MyPlace;
  locale: Locale;
  editing: boolean;
  status: Localized | null;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[48px] items-center gap-1.5 rounded-2xl bg-surface px-3 py-2.5 text-left transition active:scale-[0.96]"
        style={{ boxShadow: `inset 0 0 0 1px ${place.station.color}40` }}
      >
        <LineBadges station={place.station} locale={locale} size="md" />
        <span className="text-[12px] font-bold text-ink-muted">{placeLabel(place, locale)}:</span>
        <span className="text-[14px] font-extrabold text-ink">{t(place.station.name, locale)}</span>
        {status ? (
          <span className="ml-0.5 rounded-full bg-white/90 px-1.5 py-[1px] text-[10px] font-bold text-[#2563eb]">
            {t(status, locale)}
          </span>
        ) : null}
      </button>
      {editing ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${t(COPY.remove, locale)}: ${placeLabel(place, locale)}`}
          className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-bold text-white shadow-md active:scale-90"
        >
          ✕
        </button>
      ) : null}
    </li>
  );
}

function RouteCard({
  route,
  locale,
  editing,
  onOpenStation,
  onReverse,
  onRemove,
}: {
  route: MyRoute;
  locale: Locale;
  editing: boolean;
  onOpenStation: (station: StationOption) => void;
  onReverse: () => void;
  onRemove: () => void;
}) {
  const { from, to } = route;
  const summary = routeSummary(from.station, to.station);
  const lineText = (line: string) => localizedLine(line, locale);

  let rideLine: string;
  if (summary.boarding) {
    rideLine = fill(t(COPY.boarding, locale), {
      line: lineText(summary.boarding.line),
      car: summary.boarding.car,
      note: t(summary.boarding.note, locale),
    });
  } else if (summary.directLine) {
    rideLine = fill(t(COPY.direct, locale), { line: lineText(summary.directLine) });
  } else {
    rideLine = fill(t(COPY.transfer, locale), {
      from: summary.fromLine ? lineText(summary.fromLine) : "?",
      to: summary.toLine ? lineText(summary.toLine) : "?",
    });
  }
  const rideIcon = summary.boarding?.line ?? summary.directLine ?? summary.fromLine;

  return (
    <li className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ring-neutral-200/70">
      <div
        className="flex items-start gap-2 px-4 pb-3 pt-3.5"
        style={{ backgroundImage: `linear-gradient(120deg, ${from.station.color}1f, ${to.station.color}1f)` }}
      >
        <h3 className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 text-[16px] font-extrabold leading-snug tracking-tight text-neutral-900">
          <span className="inline-flex items-center gap-1">
            <LineBadges station={from.station} locale={locale} size="sm" />
            {t(from.station.name, locale)}
          </span>
          <span className="text-neutral-400" aria-hidden>
            ➔
          </span>
          <span className="inline-flex items-center gap-1">
            <LineBadges station={to.station} locale={locale} size="sm" />
            {t(to.station.name, locale)}
          </span>
        </h3>
        {editing ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-full bg-[#fdecec] px-2.5 py-1 text-[12px] font-bold text-[#dc2626] active:scale-95"
          >
            🗑 {t(COPY.remove, locale)}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReverse}
            aria-label={t(COPY.reverse, locale)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[14px] text-neutral-600 shadow-sm active:scale-90"
          >
            ⇄
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-1.5 px-4 py-3 text-[13px] leading-snug text-neutral-700">
        <li className="flex gap-1.5">
          {rideIcon ? (
            <LineIcon line={rideIcon} locale={locale} size="xs" className="mt-px" />
          ) : (
            <span aria-hidden>🚇</span>
          )}
          <span className={summary.boarding ? "font-bold text-neutral-900" : ""}>{rideLine}</span>
        </li>
        {summary.tips.length > 0 ? (
          summary.tips.map((tip) => (
            <li key={tip.ko} className="flex gap-1.5">
              <span aria-hidden>🍯</span>
              <span>{t(tip, locale)}</span>
            </li>
          ))
        ) : (
          <li className="flex gap-1.5 text-neutral-400">
            <span aria-hidden>💬</span>
            <span>{t(COPY.noTips, locale)}</span>
          </li>
        )}
      </ul>
      <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 px-4 py-3">
        {[from, to].map((endpoint, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onOpenStation(endpoint.station)}
            className="flex min-w-0 items-center justify-center gap-1 rounded-xl bg-surface-muted px-2 py-2 text-[12px] font-bold text-neutral-700 active:scale-95"
          >
            <LineBadges station={endpoint.station} locale={locale} size="xs" />
            <span className="truncate">
              {fill(t(COPY.stationInfo, locale), { station: t(endpoint.station.name, locale) })} ›
            </span>
          </button>
        ))}
      </div>
    </li>
  );
}

export default function MyScreen() {
  const locale = useLocale();
  const router = useRouter();
  const { places, routes } = useMyStations();
  const destination = useDestinationStation();
  const lastStation = useLastStation();
  const { toast, showToast } = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [placeSheet, setPlaceSheet] = useState<{ place: MyPlace | null } | null>(null);
  const [routeSheetOpen, setRouteSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePlaceSheet = useCallback(() => setPlaceSheet(null), []);
  const closeRouteSheet = useCallback(() => setRouteSheetOpen(false), []);

  useEffect(() => {
    router.prefetch("/station");
  }, [router]);

  function openDashboard(station: StationOption) {
    setDestinationStation(station);
    addRecentStation(station);
    setSearchOpen(false);
    router.push(`/station?${stationParams(station)}`);
  }

  function openSearch() {
    flushSync(() => setSearchOpen(true));
    searchInputRef.current?.focus();
  }

  function onNavTab(tab: NavTab) {
    if (tab === "home") router.push("/");
    if (tab === "search") openSearch();
    if (tab === "station") mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (tab === "report") setReportOpen(true);
  }

  function placeStatus(place: MyPlace): Localized | null {
    if (place.station.key === destination?.key) return COPY.viewing;
    if (place.station.key === lastStation?.key) return COPY.here;
    return null;
  }

  const summary = fill(t(COPY.summary, locale), { places: places.length, routes: routes.length });

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader
          title={MY_TITLE}
          subtitle={summary}
          action={
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              aria-pressed={editing}
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-bold transition active:scale-95 ${
                editing ? "bg-[#2563eb] text-white" : "border border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {t(editing ? COPY.done : COPY.edit, locale)}
            </button>
          }
        />

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          <section className="rounded-3xl bg-surface px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)] ring-1 ring-line">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-extrabold tracking-tight text-neutral-900">
                ⭐ {t(COPY.placesTitle, locale)}
              </h2>
              <span className="rounded-full bg-[#fff8d6] px-2 py-[1px] text-[11px] font-bold text-[#a16207]">
                {places.length}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              {t(editing ? COPY.placesEditHint : COPY.placesHint, locale)}
            </p>
            {places.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-[#f7f8fa] px-4 py-4 text-center text-[12px] leading-relaxed text-neutral-500">
                {t(COPY.placesEmpty, locale)}
              </p>
            ) : null}
            <ul className="mt-3 flex flex-wrap gap-2">
              {places.map((place) => (
                <PlaceChip
                  key={place.id}
                  place={place}
                  locale={locale}
                  editing={editing}
                  status={placeStatus(place)}
                  onOpen={() => (editing ? setPlaceSheet({ place }) : openDashboard(place.station))}
                  onRemove={() => {
                    removePlace(place.id);
                    showToast(t(COPY.placeRemoved, locale));
                  }}
                />
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setPlaceSheet({ place: null })}
                  className="flex min-h-[48px] items-center rounded-2xl border-2 border-dashed border-neutral-300 px-4 py-2.5 text-[13px] font-bold text-neutral-500 transition active:scale-[0.96] active:bg-neutral-50"
                >
                  {t(COPY.addPlace, locale)}
                </button>
              </li>
            </ul>
          </section>

          <section className="mt-4">
            <div className="px-1">
              <h2 className="text-[16px] font-extrabold tracking-tight text-neutral-900">
                🧭 {t(COPY.routesTitle, locale)}
              </h2>
              <p className="mt-0.5 text-[12px] text-neutral-500">{t(COPY.routesHint, locale)}</p>
            </div>
            {routes.length === 0 ? (
              <p className="mt-3 rounded-3xl bg-surface-muted px-4 py-5 text-center text-[12px] leading-relaxed text-neutral-500">
                {t(COPY.routesEmpty, locale)}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    locale={locale}
                    editing={editing}
                    onOpenStation={openDashboard}
                    onReverse={() => reverseRoute(route.id)}
                    onRemove={() => {
                      removeRoute(route.id);
                      showToast(t(COPY.routeRemoved, locale));
                    }}
                  />
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setRouteSheetOpen(true)}
              className="mt-3 w-full rounded-3xl border-2 border-dashed border-neutral-300 bg-white/60 py-3.5 text-[14px] font-bold text-neutral-500 transition active:scale-[0.98] active:bg-white"
            >
              {t(COPY.addRoute, locale)}
            </button>
          </section>

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-neutral-400">{t(COPY.savedNote, locale)}</p>
        </main>

        <BottomNav active="station" onTab={onNavTab} />

        <Toast message={toast} />

        {placeSheet ? (
          <PlaceSheet
            place={placeSheet.place}
            suggested={destination ?? lastStation}
            onClose={closePlaceSheet}
            onDone={(result) => {
              setPlaceSheet(null);
              showToast(t(result === "removed" ? COPY.placeRemoved : COPY.placeSaved, locale));
            }}
          />
        ) : null}

        {routeSheetOpen ? (
          <RouteSheet
            places={places}
            onClose={closeRouteSheet}
            onSaved={() => {
              setRouteSheetOpen(false);
              showToast(t(COPY.routeSaved, locale));
            }}
          />
        ) : null}

        {reportOpen ? (
          <ReportSheet
            station={destination ?? lastStation}
            onClose={() => setReportOpen(false)}
            onPosted={() => {
              setReportOpen(false);
              showToast(t(COPY.reportDone, locale));
            }}
          />
        ) : null}

        <SearchOverlay
          isOpen={searchOpen}
          onClose={closeSearch}
          onSelect={openDashboard}
          inputRef={searchInputRef}
          near={lastStation?.center ?? null}
        />
      </div>
    </div>
  );
}

