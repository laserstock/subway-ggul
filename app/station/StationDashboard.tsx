"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import KakaoMap from "../KakaoMap";
import AppHeader from "../_components/AppHeader";
import BottomNav, { type NavTab } from "../_components/BottomNav";
import LineBadges from "../_components/LineBadges";
import ReportSheet from "../_components/ReportSheet";
import SearchOverlay from "../_components/SearchOverlay";
import { Toast, useToast } from "../_components/Toast";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import { useStationReports } from "../_lib/reports";
import { setDestinationStation } from "../_lib/selectedStation";
import { STATION_TIPS } from "../_lib/stationTips";
import { compactLines, stationParams, t, type Localized, type StationOption } from "../_lib/stations";
import { bestSpot, loadUrgent, type StationUrgent } from "../_lib/urgent";
import { DASHBOARD_TITLE } from "./header";

const COPY = {
  selected: { ko: "선택한 역", en: "Selected station", zh: "已选车站", ja: "選択した駅" },
  searchOther: { ko: "다른 역 검색", en: "Search another", zh: "搜索其他车站", ja: "他の駅を検索" },
  notFound: {
    ko: "역 정보를 찾지 못했어요. 다시 검색해 주세요",
    en: "Couldn't find that station. Please search again",
    zh: "未找到车站信息，请重新搜索",
    ja: "駅情報が見つかりません。もう一度検索してください",
  },
  tilesTitle: { ko: "3초 요약", en: "3-second summary", zh: "3秒速览", ja: "3秒サマリー" },
  mapTitle: { ko: "지도 · 출구 정보", en: "Map & exits", zh: "地图 · 出口信息", ja: "地図 · 出口情報" },
  openMap: { ko: "카카오맵에서 크게 보기", en: "Open in Kakao Map", zh: "在Kakao地图中查看", ja: "カカオマップで開く" },
  exitsPending: {
    ko: "출구별 정보는 준비 중이에요 · 카카오맵에서 확인해 주세요",
    en: "Exit details coming soon · Check Kakao Map",
    zh: "出口信息准备中 · 请在Kakao地图中查看",
    ja: "出口情報は準備中です · カカオマップでご確認ください",
  },
  tipTitle: { ko: "1초 꿀팁", en: "1-second tip", zh: "1秒小贴士", ja: "1秒お役立ち情報" },
  tipSample: { ko: "베타 샘플", en: "Beta sample", zh: "测试样例", ja: "ベータ版サンプル" },
  tipLive: { ko: "실시간 제보", en: "Live report", zh: "实时上报", ja: "リアルタイム投稿" },
  tipEmpty: {
    ko: "아직 꿀팁이 없어요. 이 역의 첫 꿀팁을 남겨 주세요!",
    en: "No tips yet. Be the first to share one!",
    zh: "还没有小贴士，来分享第一条吧！",
    ja: "まだ情報がありません。最初の情報を投稿しましょう！",
  },
  tipCta: { ko: "나도 꿀팁 제보하기", en: "Share a tip", zh: "我也来分享", ja: "情報を投稿する" },
  comingSoon: {
    ko: "곧 열려요! 조금만 기다려 주세요",
    en: "Coming soon!",
    zh: "即将开放！敬请期待",
    ja: "まもなく公開！少々お待ちください",
  },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
  restroomInside: { ko: "🚻 개찰구 안 화장실", en: "🚻 Restroom inside gate", zh: "🚻 闸机内卫生间", ja: "🚻 改札内トイレ" },
  restroomOutside: { ko: "🚻 개찰구 밖 화장실", en: "🚻 Restroom outside gate", zh: "🚻 闸机外卫生间", ja: "🚻 改札外トイレ" },
  pharmacyInside: { ko: "💊 개찰구 안 약국", en: "💊 Pharmacy inside gate", zh: "💊 闸机内药店", ja: "💊 改札内薬局" },
  pharmacyWalk: { ko: "💊 약국 도보 {n}분", en: "💊 Pharmacy {n} min", zh: "💊 药店 步行{n}分钟", ja: "💊 薬局 徒歩{n}分" },
} satisfies Record<string, Localized>;

type Tile = {
  id: "urgent" | "shops" | "transfer" | "luggage";
  emoji: string;
  title: Localized;
  sub: Localized;
  bg: string;
  accent: string;
  href?: "/urgent" | "/shops" | "/transfer";
};

const TILES: Tile[] = [
  {
    id: "urgent",
    emoji: "🚨",
    title: { ko: "긴급", en: "Urgent", zh: "紧急", ja: "緊急" },
    sub: {
      ko: "개찰구 안 화장실 · 약국",
      en: "Restroom · Pharmacy in gate",
      zh: "闸机内卫生间 · 药店",
      ja: "改札内トイレ · 薬局",
    },
    bg: "#fde9ec",
    accent: "#e5484d",
    href: "/urgent",
  },
  {
    id: "shops",
    emoji: "🛍️",
    title: { ko: "출구 매장 & 픽업", en: "Exit Shops & Pickup", zh: "出口商店 & 自提", ja: "出口ショップ & 受け取り" },
    sub: {
      ko: "올영 · 다이소 · 스벅",
      en: "Olive Young · Daiso · Starbucks",
      zh: "Olive Young · 大创 · 星巴克",
      ja: "オリーブヤング · ダイソー · スタバ",
    },
    bg: "#fdf1df",
    accent: "#b45309",
    href: "/shops",
  },
  {
    id: "transfer",
    emoji: "⚡",
    title: {
      ko: "빠른환승 & 편한길",
      en: "Fast Transfer & Easy Route",
      zh: "快速换乘 & 舒适路线",
      ja: "スムーズ乗換 & らくらくルート",
    },
    sub: {
      ko: "에스컬레이터 · 무장애",
      en: "Escalator · Barrier-free",
      zh: "扶梯 · 无障碍",
      ja: "エスカレーター · バリアフリー",
    },
    bg: "#e5efff",
    accent: "#2563eb",
    href: "/transfer",
  },
  {
    id: "luggage",
    emoji: "🧳",
    title: { ko: "짐보관 & 외국인", en: "Lockers & Travelers", zh: "行李寄存 & 外国游客", ja: "荷物預け & 旅行者" },
    sub: { ko: "T-Locker · 환전", en: "T-Locker · Exchange", zh: "T-Locker · 换汇", ja: "T-Locker · 両替" },
    bg: "#e6f5e9",
    accent: "#15803d",
  },
];

function urgentSummary(urgent: StationUrgent): Localized[] {
  const lines: Localized[] = [];
  const restroom = bestSpot(urgent.restroom);
  if (restroom?.zone === "inside") lines.push(COPY.restroomInside);
  else if (restroom && restroom.zone !== "unknown") lines.push(COPY.restroomOutside);
  const pharmacy = bestSpot(urgent.pharmacy);
  if (pharmacy?.zone === "inside") lines.push(COPY.pharmacyInside);
  else if (pharmacy?.walkMinutes != null) {
    const minutes = String(pharmacy.walkMinutes);
    lines.push({
      ko: COPY.pharmacyWalk.ko.replace("{n}", minutes),
      en: COPY.pharmacyWalk.en.replace("{n}", minutes),
      zh: COPY.pharmacyWalk.zh.replace("{n}", minutes),
      ja: COPY.pharmacyWalk.ja.replace("{n}", minutes),
    });
  }
  return lines;
}

function exitLabels(station: StationOption): Localized[] {
  const exits = station.curated?.exits ?? [];
  const unique = new Map(exits.map((exit) => [exit.label.ko, exit.label]));
  return [...unique.values()].sort((a, b) => (parseInt(a.ko, 10) || 0) - (parseInt(b.ko, 10) || 0));
}

export default function StationDashboard({ station }: { station: StationOption | null }) {
  const locale = useLocale();
  const router = useRouter();
  const lastStation = useLastStation();
  const reports = useStationReports(station);
  const { toast, showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [urgent, setUrgent] = useState<StationUrgent | null>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (station) setDestinationStation(station);
  }, [station]);

  useEffect(() => {
    if (!station) return;
    let alive = true;
    loadUrgent(station).then((data) => {
      if (alive) setUrgent(data);
    });
    return () => {
      alive = false;
    };
  }, [station]);

  function openSearch() {
    flushSync(() => setSearchOpen(true));
    searchInputRef.current?.focus();
  }

  function selectStation(next: StationOption) {
    setSearchOpen(false);
    router.push(`/station?${stationParams(next)}`);
  }

  function onTab(tab: NavTab) {
    if (tab === "home") router.push("/");
    if (tab === "search") openSearch();
    if (tab === "station") router.push("/my");
    if (tab === "report") setSheetOpen(true);
  }

  const name = station ? t(station.name, locale) : "";
  const lines = station ? compactLines(station, locale) : "";
  const curatedTip = station ? STATION_TIPS[station.name.ko] : undefined;
  const liveTip = reports[0];
  const exits = station ? exitLabels(station) : [];
  const urgentLines = urgent ? urgentSummary(urgent) : [];
  const mapUrl = station
    ? `https://map.kakao.com/link/map/${encodeURIComponent(station.name.ko)},${station.center.lat},${station.center.lng}`
    : "";

  return (
    <div className="flex min-h-dvh justify-center bg-[#e8eaed]">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-[#f6f7f9] shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={DASHBOARD_TITLE} />

        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          {station ? (
            <>
              <section
                className="relative overflow-hidden rounded-3xl px-5 pb-4 pt-4 text-white shadow-[0_8px_24px_rgba(15,23,42,0.16)]"
                style={{ background: `linear-gradient(135deg, ${station.color}, #1e3a8a)` }}
              >
                <p className="text-[12px] font-semibold text-white/80">📍 {t(COPY.selected, locale)}</p>
                <h1 className="mt-1 text-[24px] font-extrabold leading-tight tracking-tight">
                  {name}
                  {lines ? <span className="ml-1.5 text-[15px] font-bold text-white/85">({lines})</span> : null}
                </h1>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/95 px-1.5 py-1">
                    <LineBadges station={station} locale={locale} />
                  </span>
                  <button
                    type="button"
                    onClick={openSearch}
                    className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[12px] font-bold backdrop-blur transition active:scale-95"
                  >
                    🔍 {t(COPY.searchOther, locale)}
                  </button>
                </div>
              </section>

              <h2 className="mb-2.5 mt-5 text-[16px] font-extrabold tracking-tight text-neutral-900">
                ⏱️ {t(COPY.tilesTitle, locale)}
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {TILES.map((tile) => {
                  const body = (
                    <>
                      <span className="block text-[30px] leading-none" aria-hidden>
                        {tile.emoji}
                      </span>
                      <span className="mt-2.5 block text-[15px] font-extrabold leading-tight text-neutral-900">
                        {t(tile.title, locale)}
                      </span>
                      <span className="mt-1 block text-[11px] font-bold" style={{ color: tile.accent }}>
                        {t(tile.sub, locale)}
                      </span>
                      {tile.id === "urgent" && urgentLines.length > 0 ? (
                        <span className="mt-2 flex flex-col gap-0.5 text-[11px] font-semibold text-neutral-700">
                          {urgentLines.map((line) => (
                            <span key={line.ko} className="truncate">
                              {t(line, locale)}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </>
                  );
                  const className =
                    "block min-h-[124px] rounded-2xl p-3.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition active:scale-[0.98]";
                  return tile.href ? (
                    <Link
                      key={tile.id}
                      href={`${tile.href}?${stationParams(station)}`}
                      className={className}
                      style={{ backgroundColor: tile.bg }}
                    >
                      {body}
                    </Link>
                  ) : (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => showToast(t(COPY.comingSoon, locale))}
                      className={className}
                      style={{ backgroundColor: tile.bg }}
                    >
                      {body}
                    </button>
                  );
                })}
              </div>

              <section className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <h2 className="px-4 pb-2.5 pt-3.5 text-[14px] font-extrabold text-neutral-900">
                  🗺️ {t(COPY.mapTitle, locale)}
                </h2>
                <div className="relative h-[170px]">
                  <KakaoMap
                    center={station.center}
                    level={4}
                    overlays={[
                      {
                        key: "station",
                        position: station.center,
                        yAnchor: 1.2,
                        content: (
                          <span
                            className="whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold text-white shadow-md"
                            style={{ backgroundColor: station.color }}
                          >
                            🚇 {name}
                          </span>
                        ),
                      },
                    ]}
                  />
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(COPY.openMap, locale)}
                    className="absolute inset-0 z-10"
                  />
                </div>
                <div className="px-4 pb-3.5 pt-3">
                  {exits.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {exits.map((exit) => (
                        <span
                          key={exit.ko}
                          className="rounded-lg bg-[#fff6cc] px-2 py-1 text-[12px] font-bold text-[#7a5b00]"
                        >
                          🚪 {t(exit, locale)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-neutral-500">{t(COPY.exitsPending, locale)}</p>
                  )}
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#2563eb]"
                  >
                    {t(COPY.openMap, locale)} ↗
                  </a>
                </div>
              </section>

              <section className="mt-3 rounded-2xl bg-gradient-to-br from-[#fff7e6] to-[#fffdf8] px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-extrabold text-neutral-900">🍯 {t(COPY.tipTitle, locale)}</h2>
                  {curatedTip || liveTip ? (
                    <span className="rounded-full bg-white px-2 py-[2px] text-[10px] font-bold text-[#b45309]">
                      {t(curatedTip ? COPY.tipSample : COPY.tipLive, locale)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[14px] font-semibold leading-relaxed text-neutral-800">
                  {curatedTip
                    ? `💡 ${t(curatedTip, locale)}`
                    : liveTip
                      ? `💬 ${t(liveTip.text, locale)}`
                      : t(COPY.tipEmpty, locale)}
                </p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="mt-2.5 text-[12px] font-bold text-[#b45309]"
                >
                  ✏️ {t(COPY.tipCta, locale)} →
                </button>
              </section>
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="text-[14px] text-neutral-500">{t(COPY.notFound, locale)}</p>
              <button
                type="button"
                onClick={openSearch}
                className="rounded-2xl bg-[#2563eb] px-5 py-3 text-[14px] font-bold text-white"
              >
                🔍 {t(COPY.searchOther, locale)}
              </button>
            </div>
          )}
        </main>

        <BottomNav active="search" onTab={onTab} />

        <Toast message={toast} />

        {sheetOpen ? (
          <ReportSheet
            station={station}
            onClose={() => setSheetOpen(false)}
            onPosted={() => {
              setSheetOpen(false);
              showToast(t(COPY.reportDone, locale));
            }}
          />
        ) : null}

        <SearchOverlay
          isOpen={searchOpen}
          onClose={closeSearch}
          onSelect={selectStation}
          inputRef={searchInputRef}
          near={lastStation?.center ?? null}
        />
      </div>
    </div>
  );
}
