"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import DragScroll from "../_components/DragScroll";
import FlagSheet, { FlagButton, type FlagRequest } from "../_components/FlagSheet";
import { LineIcon } from "../_components/LineBadges";
import ReportSheet from "../_components/ReportSheet";
import { Toast, useToast } from "../_components/Toast";
import type { LatLng } from "../KakaoMap";
import type { KakaoStation } from "../kakao-places";
import { useLocale } from "../_lib/locale";
import { rankReports } from "../_lib/freshness";
import { confirmReport, useNow, useStationReports } from "../_lib/reports";
import { LOCATION_ISSUE_COPY, useStationTracker } from "../_lib/useStationTracker";
import {
  distanceMeters,
  kakaoOption,
  t,
  type Locale,
  type Localized,
  type StationOption,
} from "../_lib/stations";
import {
  angleBetween,
  bearingDegrees,
  lineCacheKey,
  lineLabel,
  lineNeighbors,
  loadLineStations,
  sameLine,
  stationLines,
} from "../_lib/subwayLine";
import {
  loadUrgent,
  pickRecommendation,
  sortSpots,
  type Recommendation,
  type StationUrgent,
  type UrgentKind,
  type UrgentSpot,
  type UrgentZone,
} from "../_lib/urgent";
import { TOILET_DATA_DATE } from "../_lib/stationToilets";
import { URGENT_TITLE, UrgentIcon } from "./header";

type UrgentTab = "all" | UrgentKind;

const HEADING_MIN_METERS = 100;
const TRAIN_METERS_PER_MINUTE = 600;
const DISPLAY_ORDER: UrgentKind[] = ["restroom", "pharmacy", "clinic"];
const RECOMMEND_ORDER: UrgentKind[] = ["pharmacy", "restroom", "clinic"];

const COPY = {
  all: { ko: "전체", en: "All", zh: "全部", ja: "すべて" },
  compareHint: {
    ko: "급하시다면 다음 역도 같이 비교해 보세요!",
    en: "In a hurry? Compare with the next stop too!",
    zh: "着急的话，也比较一下下一站吧！",
    ja: "お急ぎなら次の駅とも比べてみてください！",
  },
  swap: { ko: "반대 방향으로 바꾸기", en: "Flip direction", zh: "切换到反方向", ja: "反対方向に切り替え" },
  passing: { ko: "현재 지나는 역", en: "passing now", zh: "正在经过", ja: "通過中の駅" },
  selected: { ko: "선택한 역", en: "selected", zh: "已选车站", ja: "選択した駅" },
  loading: { ko: "불러오는 중…", en: "Loading…", zh: "加载中…", ja: "読み込み中…" },
  locating: { ko: "현재 위치를 찾는 중…", en: "Finding your location…", zh: "正在获取您的位置…", ja: "現在地を取得中…" },
  locatingHint: {
    ko: "가장 가까운 역과 다음 역을 자동으로 비교해 드려요",
    en: "We'll compare the nearest and next stations for you",
    zh: "自动为您比较最近的车站和下一站",
    ja: "最寄り駅と次の駅を自動で比較します",
  },
  retry: { ko: "다시 시도", en: "Retry", zh: "重试", ja: "再試行" },
  aiBadge: { ko: "AI 추천", en: "AI pick", zh: "AI推荐", ja: "AIおすすめ" },
  recommended: { ko: "추천", en: "Pick", zh: "推荐", ja: "おすすめ" },
  walk: { ko: "도보", en: "Walk", zh: "步行", ja: "徒歩" },
  min: { ko: "분", en: " min", zh: "分钟", ja: "分" },
  exitLinked: { ko: "출구 연계 병원", en: "Exit-linked clinic", zh: "出口附近诊所", ja: "出口直結の医院" },
  map: { ko: "지도 ›", en: "Map ›", zh: "地图 ›", ja: "地図 ›" },
  feedTitle: { ko: "실시간 제보 한 줄 요약", en: "live reports at a glance", zh: "实时报告摘要", ja: "リアルタイム投稿まとめ" },
  feedEmpty: {
    ko: "아직 제보가 없어요. 첫 제보를 남겨 주세요!",
    en: "No reports yet. Be the first!",
    zh: "还没有报告。来发第一条吧！",
    ja: "まだ投稿がありません。最初の投稿をどうぞ！",
  },
  reportCta: { ko: "나도 실시간 제보하기", en: "Post a live report", zh: "我也来实时报告", ja: "リアルタイム投稿する" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "报告已提交，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
  like: { ko: "추천", en: "Like", zh: "赞", ja: "いいね" },
  nextStop: {
    ko: "(다음 역 · {n}분 후 도착)",
    en: "(next stop · ~{n} min)",
    zh: "(下一站 · 约{n}分钟后到达)",
    ja: "(次の駅 · 約{n}分後に到着)",
  },
  betaNote: {
    ko: `화장실: 서울교통공사 역사공중화장실정보(${TOILET_DATA_DATE} 기준, 1~8호선)와 역 이용 안내도. 약국·병원: 카카오 장소 기준(치과·한의원·피부과 등 제외)이며 진료시간은 꼭 확인해 주세요.`,
    en: `Restrooms: Seoul Metro open data (as of ${TOILET_DATA_DATE}, Lines 1–8) and station maps. Pharmacies and clinics: Kakao Places (dental, oriental medicine, dermatology etc. excluded); please confirm hours.`,
    zh: `洗手间：首尔交通公社车站公共洗手间信息（截至${TOILET_DATA_DATE}，1~8号线）及车站导览图。药店·诊所：以Kakao地点为准（不含牙科、韩医院、皮肤科等），请务必确认营业时间。`,
    ja: `トイレ：ソウル交通公社の駅公衆トイレ情報（${TOILET_DATA_DATE}時点、1~8号線）と駅構内図。薬局・医院：カカオの場所情報に基づき（歯科・韓医院・皮膚科などを除く）、診療時間は必ずご確認ください。`,
  },
};

const ROUTE_COPY = {
  moving: {
    ko: "현재 {line} {here} → {there} 방면 이동 중",
    en: "Riding {line}: {here} → toward {there}",
    zh: "正在乘坐{line}：{here} → 往{there}方向",
    ja: "{line}で移動中：{here} → {there}方面",
  },
  heading: {
    ko: "{line} {here} → {there} 방면",
    en: "{line}: {here} → toward {there}",
    zh: "{line}：{here} → 往{there}方向",
    ja: "{line}：{here} → {there}方面",
  },
  finding: {
    ko: "{line} {here} · 다음 역 찾는 중…",
    en: "{line}: {here} · finding next stop…",
    zh: "{line}：{here} · 正在查找下一站…",
    ja: "{line}：{here} · 次の駅を検索中…",
  },
  notFound: {
    ko: "{line} {here} · 다음 역 정보를 찾지 못했어요",
    en: "{line}: {here} · next stop not found",
    zh: "{line}：{here} · 未找到下一站信息",
    ja: "{line}：{here} · 次の駅が見つかりませんでした",
  },
  getOffNext: {
    ko: "급하시다면 1정거장 더 가서 {station} {zone} {noun}에서 내리세요!",
    en: "In a hurry? Ride one more stop to {station} — {noun} {zone}!",
    zh: "着急的话，再坐1站到{station}，那里{zone}有{noun}！",
    ja: "お急ぎなら1駅先の{station}で降りてください。{zone}に{noun}があります！",
  },
  getOffNow: {
    ko: "지금 {station}에서 내리세요! {zone} {noun} 도보 {walk}분",
    en: "Get off now at {station}: {noun} {zone}, {walk} min walk",
    zh: "现在在{station}下车！{zone}{noun}，步行{walk}分钟",
    ja: "今すぐ{station}で降りてください！{zone}の{noun}まで徒歩{walk}分",
  },
};

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    t(template, locale),
  );
}

const KIND_META: Record<UrgentKind, { emoji: string; label: Localized; noun: Localized; empty: Localized }> = {
  restroom: {
    emoji: "🚽",
    label: { ko: "화장실", en: "Restroom", zh: "洗手间", ja: "トイレ" },
    noun: { ko: "화장실", en: "restroom", zh: "洗手间", ja: "トイレ" },
    empty: { ko: "화장실 정보 준비 중", en: "Restroom info coming soon", zh: "洗手间信息准备中", ja: "トイレ情報は準備中" },
  },
  pharmacy: {
    emoji: "💊",
    label: { ko: "약국", en: "Pharmacy", zh: "药店", ja: "薬局" },
    noun: { ko: "약국", en: "pharmacy", zh: "药店", ja: "薬局" },
    empty: {
      ko: "주변 500m 안에 약국이 없어요",
      en: "No pharmacy within 500 m",
      zh: "周边500m内没有药店",
      ja: "周辺500m以内に薬局がありません",
    },
  },
  clinic: {
    emoji: "🏥",
    label: { ko: "응급의원", en: "Clinic", zh: "诊所", ja: "医院" },
    noun: { ko: "병원", en: "clinic", zh: "诊所", ja: "医院" },
    empty: {
      ko: "주변 500m 안에 내과·가정의학과 등 의원이 없어요",
      en: "No general clinic within 500 m",
      zh: "周边500m内没有内科·家庭医学科等诊所",
      ja: "周辺500m以内に内科・家庭医学科などの医院がありません",
    },
  },
};

const ZONE_META: Record<UrgentZone, { label: Localized; color: string }> = {
  inside: { label: { ko: "개찰구 안", en: "Inside gate", zh: "检票口内", ja: "改札内" }, color: "#2563eb" },
  station: {
    label: { ko: "역 안 · 개찰구 밖", en: "In station, outside gate", zh: "站内 · 检票口外", ja: "駅構内 · 改札外" },
    color: "#d97706",
  },
  exit: { label: { ko: "출구 바로 앞", en: "Right by exit", zh: "出口旁", ja: "出口すぐ" }, color: "#e5484d" },
  outside: { label: { ko: "개찰구 밖", en: "Outside gate", zh: "检票口外", ja: "改札外" }, color: "#e5484d" },
  unknown: { label: { ko: "위치 확인 필요", en: "Check location", zh: "需确认位置", ja: "場所の確認が必要" }, color: "#9ca3af" },
};

const TABS: { id: UrgentTab; emoji?: string; label: Localized }[] = [
  { id: "all", label: COPY.all },
  { id: "restroom", emoji: "🚽", label: KIND_META.restroom.label },
  { id: "pharmacy", emoji: "💊", label: KIND_META.pharmacy.label },
  { id: "clinic", emoji: "🏥", label: KIND_META.clinic.label },
];

const URGENT_REPORTS: { emoji: string; text: Localized }[] = [
  { emoji: "🧻", text: { ko: "화장실 휴지 있어요", en: "Restroom has tissue", zh: "洗手间有纸巾", ja: "トイレにペーパーあり" } },
  {
    emoji: "🚧",
    text: { ko: "화장실 청소·고장 중", en: "Restroom closed for cleaning/repair", zh: "洗手间清洁·维修中", ja: "トイレ清掃・故障中" },
  },
  { emoji: "💊", text: { ko: "역 안 약국 영업 중", en: "In-station pharmacy is open", zh: "站内药店营业中", ja: "駅構内の薬局営業中" } },
  { emoji: "🔒", text: { ko: "약국 문 닫았어요", en: "Pharmacy is closed", zh: "药店已关门", ja: "薬局は閉まっています" } },
  { emoji: "🏥", text: { ko: "출구 앞 의원 진료 중", en: "Clinic by the exit is open", zh: "出口旁诊所接诊中", ja: "出口前の医院診療中" } },
  { emoji: "👥", text: { ko: "화장실 줄이 길어요", en: "Long restroom line", zh: "洗手间排长队", ja: "トイレが混んでいます" } },
];

function chooseNext(
  current: StationOption,
  neighbors: KakaoStation[],
  manualNext: string | null,
  heading: number | null,
): KakaoStation | null {
  const chosen = manualNext ? neighbors.find((candidate) => candidate.name === manualNext) : undefined;
  if (chosen) return chosen;
  if (heading === null || neighbors.length < 2) return neighbors[0] ?? null;
  const offset = (candidate: KakaoStation) =>
    angleBetween(bearingDegrees(current.center, candidate.center), heading);
  return neighbors.reduce((best, candidate) => (offset(candidate) < offset(best) ? candidate : best));
}

function chooseLine(
  current: StationOption,
  lines: string[],
  preferred: (string | null)[],
  heading: number | null,
  neighborsByLine: Map<string, KakaoStation[] | null>,
): string | null {
  for (const candidate of preferred) {
    const match = candidate ? lines.find((line) => sameLine(line, candidate)) : undefined;
    if (match) return match;
  }
  if (heading === null || lines.length < 2) return lines[0] ?? null;
  let best: { line: string; offset: number } | null = null;
  for (const line of lines) {
    for (const neighbor of neighborsByLine.get(line) ?? []) {
      const offset = angleBetween(bearingDegrees(current.center, neighbor.center), heading);
      if (!best || offset < best.offset) best = { line, offset };
    }
  }
  return best?.line ?? lines[0] ?? null;
}

function walkLabel(minutes: number, locale: Locale) {
  return `${t(COPY.walk, locale)} ${minutes}${t(COPY.min, locale)}`;
}

function recommendationText(
  rec: Recommendation,
  current: StationOption,
  next: StationOption | null,
  locale: Locale,
) {
  const noun = KIND_META[rec.kind].noun;
  const zone = ZONE_META[rec.spot.zone].label;
  const zoneText = locale === "en" ? zone.en.toLowerCase() : t(zone, locale);
  if (rec.target === "next" && next) {
    return fill(ROUTE_COPY.getOffNext, locale, { station: t(next.name, locale), zone: zoneText, noun: t(noun, locale) });
  }
  return fill(ROUTE_COPY.getOffNow, locale, {
    station: t(current.name, locale),
    zone: zoneText,
    noun: t(noun, locale),
    walk: rec.spot.walkMinutes ?? 1,
  });
}

function SpotRow({
  spot,
  recommended,
  locale,
}: {
  spot: UrgentSpot;
  recommended: boolean;
  locale: Locale;
}) {
  const kind = KIND_META[spot.kind];
  const zone = ZONE_META[spot.zone];
  return (
    <li className="py-2">
      <div className="flex items-center gap-1.5">
        <span className="w-6 shrink-0 text-center text-[17px]" aria-hidden>
          {kind.emoji}
        </span>
        <span className="min-w-[62px] shrink-0 text-[14px] font-bold text-neutral-900">{t(kind.label, locale)}</span>
        <span
          className="flex min-w-0 flex-1 items-center gap-1 text-[13px] font-extrabold leading-tight"
          style={{ color: zone.color }}
        >
          <span className="min-w-0">{t(zone.label, locale)}</span>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: zone.color }} />
        </span>
        {spot.walkMinutes !== null ? (
          <span className="shrink-0 text-[12px] font-semibold text-neutral-700">
            {walkLabel(spot.walkMinutes, locale)}
          </span>
        ) : null}
      </div>
      <p className="ml-[30px] mt-0.5 text-[11px] leading-snug text-neutral-500">
        {recommended ? (
          <span className="mr-1 inline-block rounded-full bg-[#f59e0b] px-1.5 py-[1px] text-[10px] font-bold text-white">
            {t(COPY.recommended, locale)}
          </span>
        ) : null}
        {t(spot.detail, locale)}
        {spot.hours ? <span className="ml-1 font-semibold text-[#7c3aed]">· {t(spot.hours, locale)}</span> : null}
        {spot.exitLinked ? (
          <span className="ml-1 inline-block rounded-full bg-[#e6f5e9] px-1.5 text-[10px] font-bold text-[#15803d]">
            {t(COPY.exitLinked, locale)}
          </span>
        ) : null}
        {spot.url ? (
          <a
            href={spot.url}
            target="_blank"
            rel="noreferrer"
            className="ml-1.5 font-semibold text-[#2563eb]"
          >
            {t(COPY.map, locale)}
          </a>
        ) : null}
      </p>
    </li>
  );
}

function StationCard({
  title,
  data,
  kinds,
  limit,
  highlight,
  aiMessage,
  recommendedId,
  line,
  locale,
}: {
  title: ReactNode;
  data: StationUrgent | null;
  kinds: UrgentKind[];
  limit: number;
  highlight: boolean;
  aiMessage: string | null;
  recommendedId: string | null;
  line: string | null;
  locale: Locale;
}) {
  return (
    <section
      className={`mt-3 rounded-2xl px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${
        highlight ? "border-2 border-[#f59e0b] bg-[#fffaf0]" : "border border-line bg-surface"
      }`}
    >
      <h2 className="text-[15px] font-extrabold tracking-tight text-neutral-900">{title}</h2>
      {aiMessage ? (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-[#fff3c4] px-2.5 py-2 text-[12px] font-bold leading-snug text-[#92400e]">
          <span className="shrink-0 rounded-full bg-[#f59e0b] px-1.5 py-[1px] text-[10px] text-white">
            ⚡ {t(COPY.aiBadge, locale)}
          </span>
          <span>🔔 {aiMessage}</span>
        </p>
      ) : null}
      {data ? (
        <ul className="mt-1 divide-y divide-neutral-100">
          {kinds.flatMap((kind) => {
            const spots = sortSpots(data[kind], line).slice(0, limit);
            if (spots.length === 0) {
              return [
                <li key={kind} className="flex items-center gap-1.5 py-2 text-[12px] text-neutral-400">
                  <span className="w-6 shrink-0 text-center text-[17px]" aria-hidden>
                    {KIND_META[kind].emoji}
                  </span>
                  <span className="min-w-[62px] shrink-0 text-[14px] font-bold text-neutral-900">
                    {t(KIND_META[kind].label, locale)}
                  </span>
                  {t(KIND_META[kind].empty, locale)}
                </li>,
              ];
            }
            return spots.map((spot) => (
              <SpotRow key={spot.id} spot={spot} recommended={spot.id === recommendedId} locale={locale} />
            ));
          })}
        </ul>
      ) : (
        <p className="py-4 text-center text-[12px] text-neutral-400">{t(COPY.loading, locale)}</p>
      )}
    </section>
  );
}

export default function UrgentScreen({
  initialStation,
  follow,
}: {
  initialStation: StationOption | null;
  follow: boolean;
}) {
  const locale = useLocale();
  const [tab, setTab] = useState<UrgentTab>("all");
  const [picked, setPicked] = useState<StationOption | null>(follow ? null : initialStation);
  const [heading, setHeading] = useState<number | null>(null);
  const [ridingLine, setRidingLine] = useState<string | null>(null);
  const [manualLine, setManualLine] = useState<string | null>(null);
  const [manualNext, setManualNext] = useState<string | null>(null);
  const [lineStations, setLineStations] = useState<Record<string, KakaoStation[]>>({});
  const [urgent, setUrgent] = useState<Record<string, StationUrgent>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flagging, setFlagging] = useState<FlagRequest | null>(null);
  const { toast, showToast } = useToast();
  const lastFixRef = useRef<{ position: LatLng; station: StationOption } | null>(null);

  const tracker = useStationTracker({
    autoStart: follow,
    onNearest: ({ station: reached, position }) => {
      const last = lastFixRef.current;
      lastFixRef.current = { position, station: reached };
      if (!last) return;
      if (distanceMeters(last.position, position) >= HEADING_MIN_METERS) {
        setHeading(bearingDegrees(last.position, position));
      }
      if (last.station.key === reached.key) return;
      const shared = stationLines(reached).find((line) =>
        stationLines(last.station).some((previous) => sameLine(previous, line)),
      );
      if (shared) setRidingLine(shared);
      setManualLine(null);
      setManualNext(null);
    },
  });

  const current = picked ?? tracker.nearest ?? (follow ? initialStation : null);
  const live = !picked && tracker.tracking && tracker.nearest !== null;
  const lines = current ? stationLines(current) : [];
  const neighborsByLine = new Map(
    lines.map((candidate) => {
      const stations = current ? lineStations[lineCacheKey(current, candidate)] : undefined;
      return [candidate, current && stations ? lineNeighbors(current, stations) : null] as const;
    }),
  );
  const line = current
    ? chooseLine(current, lines, [manualLine, ridingLine], live ? heading : null, neighborsByLine)
    : null;
  const neighbors = line ? (neighborsByLine.get(line) ?? null) : null;

  const nextStation =
    current && neighbors ? chooseNext(current, neighbors, manualNext, live ? heading : null) : null;
  const nextOption = nextStation ? kakaoOption(nextStation) : null;
  const otherNeighbor = neighbors?.find((candidate) => candidate !== nextStation) ?? null;

  useEffect(() => {
    if (!current) return;
    let active = true;
    for (const candidate of stationLines(current)) {
      const key = lineCacheKey(current, candidate);
      loadLineStations(current, candidate).then((stations) => {
        if (!active) return;
        setLineStations((previous) =>
          previous[key] === stations ? previous : { ...previous, [key]: stations },
        );
      });
    }
    return () => {
      active = false;
    };
  }, [current]);

  useEffect(() => {
    if (!current) return;
    let active = true;
    const around = stationLines(current).flatMap((candidate) => {
      const stations = lineStations[lineCacheKey(current, candidate)];
      return stations ? lineNeighbors(current, stations).map(kakaoOption) : [];
    });
    for (const station of [current, ...around]) {
      loadUrgent(station).then((data) => {
        if (!active) return;
        setUrgent((previous) =>
          previous[station.key] === data ? previous : { ...previous, [station.key]: data },
        );
      });
    }
    return () => {
      active = false;
    };
  }, [current, lineStations]);

  const currentData = current ? (urgent[current.key] ?? null) : null;
  const nextData = nextOption ? (urgent[nextOption.key] ?? null) : null;
  const neighborsLoading = current !== null && line !== null && neighbors === null;
  const ready = !neighborsLoading && (nextOption === null || nextData !== null);
  const recommendation =
    current && currentData && ready
      ? pickRecommendation(currentData, nextData, tab === "all" ? RECOMMEND_ORDER : [tab], line)
      : null;
  const aiMessage =
    current && recommendation ? recommendationText(recommendation, current, nextOption, locale) : null;

  const etaMinutes =
    current && nextOption
      ? Math.max(
          1,
          Math.round(
            distanceMeters(live && tracker.position ? tracker.position : current.center, nextOption.center) /
              TRAIN_METERS_PER_MINUTE,
          ),
        )
      : null;

  const feedStation = recommendation?.target === "current" ? current : (nextOption ?? current);
  const reports = useStationReports(feedStation);
  const now = useNow();
  const topReports = now !== null ? rankReports(reports, now).active.slice(0, 2) : [];

  const kinds = tab === "all" ? DISPLAY_ORDER : [tab];
  const limit = tab === "all" ? 1 : 3;
  const lineText = line ? t(lineLabel(line), locale) : "";

  let route: string | null = null;
  if (current) {
    const values = { line: lineText, here: t(current.name, locale) };
    if (nextOption) {
      route = fill(live ? ROUTE_COPY.moving : ROUTE_COPY.heading, locale, { ...values, there: t(nextOption.name, locale) });
    } else {
      route = fill(neighborsLoading ? ROUTE_COPY.finding : ROUTE_COPY.notFound, locale, values);
    }
    route = route.replace(/^[\s:：]+/, "").replace(/\s{2,}/g, " ").trim();
  }

  function backToMyStation() {
    setPicked(null);
    setManualLine(null);
    setManualNext(null);
    tracker.start();
  }

  function onReportPosted() {
    setSheetOpen(false);
    showToast(t(COPY.reportDone, locale));
  }

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={URGENT_TITLE} icon={<UrgentIcon />} />

        <DragScroll className="flex shrink-0 gap-1.5 px-4 pb-2">
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-bold ${
                  active
                    ? "border-[#1e293b] bg-[#1e293b] text-white"
                    : "border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                {item.emoji ? <span aria-hidden>{item.emoji}</span> : null}
                {t(item.label, locale)}
              </button>
            );
          })}
        </DragScroll>

        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
          {current ? (
            <>
              {lines.length > 1 ? (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {lines.map((candidate) => {
                    const active = line !== null && sameLine(candidate, line);
                    return (
                      <button
                        key={candidate}
                        type="button"
                        onClick={() => {
                          setManualLine(candidate);
                          setManualNext(null);
                        }}
                        aria-pressed={active}
                        className={`flex items-center gap-1 rounded-full py-1 pl-1 pr-2.5 text-[11px] font-bold ${
                          active ? "bg-[#5b3fd6] text-white" : "bg-white text-[#5b3fd6] ring-1 ring-[#ddd3ff]"
                        }`}
                      >
                        <LineIcon line={candidate} locale={locale} size="sm" className={active ? "ring-2 ring-white" : ""} />
                        {t(lineLabel(candidate), locale)}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <div className="flex items-center gap-2 rounded-xl bg-[#efe9ff] px-3 py-2.5">
                {line ? (
                  <LineIcon line={line} locale={locale} size="md" />
                ) : (
                  <span aria-hidden className="text-[16px]">
                    🚇
                  </span>
                )}
                <p className="min-w-0 flex-1 text-[13px] font-extrabold leading-snug text-[#4c2fd1]">{route}</p>
                {otherNeighbor ? (
                  <button
                    type="button"
                    onClick={() => setManualNext(otherNeighbor.name)}
                    aria-label={t(COPY.swap, locale)}
                    title={t(COPY.swap, locale)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#5b3fd6] shadow-sm"
                  >
                    ⇄
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-center text-[12px] font-semibold text-neutral-500">
                {t(COPY.compareHint, locale)}
              </p>

              <StationCard
                title={
                  <>
                    <span aria-hidden>📍</span>
                    {t(current.name, locale)}{" "}
                    <span className="text-[12px] font-semibold text-neutral-500">
                      ({t(live ? COPY.passing : COPY.selected, locale)})
                    </span>
                  </>
                }
                data={currentData}
                kinds={kinds}
                limit={limit}
                highlight={recommendation?.target === "current"}
                aiMessage={recommendation?.target === "current" ? aiMessage : null}
                recommendedId={recommendation?.target === "current" ? recommendation.spot.id : null}
                line={line}
                locale={locale}
              />

              {nextOption ? (
                <StationCard
                  title={
                    <>
                      <span aria-hidden>📍</span>
                      {t(nextOption.name, locale)}{" "}
                      <span className="text-[12px] font-semibold text-neutral-500">
                        {fill(COPY.nextStop, locale, { n: etaMinutes ?? "" })}
                      </span>
                    </>
                  }
                  data={nextData}
                  kinds={kinds}
                  limit={limit}
                  highlight={recommendation?.target === "next"}
                  aiMessage={recommendation?.target === "next" ? aiMessage : null}
                  recommendedId={recommendation?.target === "next" ? recommendation.spot.id : null}
                  line={line}
                  locale={locale}
                />
              ) : null}

              {feedStation ? (
                <section className="mt-4">
                  <h2 className="text-[14px] font-extrabold text-neutral-900">
                    <span aria-hidden>💬 </span>
                    {t(feedStation.name, locale)} {t(COPY.feedTitle, locale)}
                  </h2>
                  {topReports.length === 0 ? (
                    <p className="mt-1.5 text-[12px] text-neutral-400">{t(COPY.feedEmpty, locale)}</p>
                  ) : (
                    <ul className="mt-1">
                      {topReports.map((report) => (
                        <li key={report.id} className="flex items-center gap-2 py-1.5">
                          <span className="text-[12px] text-neutral-400" aria-hidden>
                            •
                          </span>
                          <p className="min-w-0 flex-1 break-words text-[13px] leading-snug text-neutral-800">
                            {t(report.text, locale)}
                          </p>
                          <button
                            type="button"
                            onClick={() => confirmReport(report.id)}
                            aria-pressed={report.liked}
                            aria-label={t(COPY.like, locale)}
                            className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-semibold ${
                              report.liked ? "bg-[#fff1d6] text-[#b45309]" : "text-neutral-500"
                            }`}
                          >
                            <span aria-hidden>👍</span>
                            {report.likes}
                          </button>
                          {report.mine ? null : (
                            <FlagButton
                              onClick={() => setFlagging({ target: "report", id: report.id, authorId: report.authorId })}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}

              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="mx-auto mt-3 flex items-center gap-1.5 rounded-full border border-line bg-surface px-5 py-2.5 text-[13px] font-extrabold text-neutral-900 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              >
                <span aria-hidden>💬</span>
                {t(COPY.reportCta, locale)} →
              </button>

              <p className="mt-4 text-[10.5px] leading-relaxed text-neutral-400">{t(COPY.betaNote, locale)}</p>
            </>
          ) : (
            <section className="mt-2 rounded-2xl border border-line bg-surface px-4 py-6 text-center">
              <p className="text-[15px] font-extrabold text-neutral-900">
                <span aria-hidden>📍 </span>
                {t(COPY.locating, locale)}
              </p>
              <p className="mt-1.5 text-[12px] text-neutral-500">
                {tracker.issue ? t(LOCATION_ISSUE_COPY[tracker.issue], locale) : t(COPY.locatingHint, locale)}
              </p>
              {tracker.issue ? (
                <button
                  type="button"
                  onClick={backToMyStation}
                  className="mt-3 rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] font-semibold text-neutral-700"
                >
                  {t(COPY.retry, locale)}
                </button>
              ) : null}
            </section>
          )}
        </main>

        <BottomNav />

        <Toast message={toast} />

        {flagging ? <FlagSheet request={flagging} onClose={() => setFlagging(null)} onToast={showToast} /> : null}

        {sheetOpen ? (
          <ReportSheet
            station={current}
            quickReports={URGENT_REPORTS}
            onClose={() => setSheetOpen(false)}
            onPosted={onReportPosted}
          />
        ) : null}
      </div>
    </div>
  );
}
