"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { lineColor } from "../kakao-places";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import { PinIcon } from "../_components/icons";
import LineBadges, { LineIcon } from "../_components/LineBadges";
import ReportSheet from "../_components/ReportSheet";
import SearchOverlay from "../_components/SearchOverlay";
import { Toast, useToast } from "../_components/Toast";
import { useFacilityVotes, voteFacility, type FacilityVote } from "../_lib/facilityVotes";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import { stationParams, t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { stepFreeMaps } from "../_lib/stepFree";
import { lineLabel, stationLines } from "../_lib/subwayLine";
import {
  transferInfo,
  type AccessCourse,
  type Difficulty,
  type Facility,
  type FacilityStatus,
  type Landmark,
  type TransferRoute,
} from "../_lib/transfer";
import { TRANSFER_TABS, TRANSFER_TITLE, TransferIcon, type TransferTab } from "./header";
import StepFreeGuide from "./StepFreeGuide";

const COPY = {
  chooseRoute: { ko: "환승 노선 선택", en: "Choose your transfer", zh: "选择换乘线路", ja: "乗換路線を選択" },
  transferOf: { ko: "{from} ➔ {to} 환승", en: "{from} ➔ {to}", zh: "{from} ➔ {to} 换乘", ja: "{from} ➔ {to} 乗換" },
  carTip: {
    ko: "💡 {car}번 칸에서 내리면 {landmark} 바로 앞!",
    en: "💡 Get off at car {car}: the {landmark} is right there!",
    zh: "💡 在{car}号车厢下车，{landmark}就在眼前！",
    ja: "💡 {car}号車で降りると{landmark}がすぐ目の前！",
  },
  carUnknown: {
    ko: "🙋 아직 빠른 환승 칸 정보가 없어요. 아는 칸이 있다면 알려 주세요!",
    en: "🙋 No best-car info yet. Know the spot? Let us know!",
    zh: "🙋 暂无最佳换乘车厢信息，知道的话请告诉我们！",
    ja: "🙋 まだ乗換に便利な号車情報がありません。ご存じなら教えてください！",
  },
  walk: { ko: "도보 {n}분", en: "{n} min walk", zh: "步行{n}分钟", ja: "徒歩{n}分" },
  walkUnknown: { ko: "소요 시간 준비 중", en: "Walk time coming soon", zh: "步行时间准备中", ja: "所要時間は準備中" },
  alight: { ko: "{line} {car}번 칸 하차", en: "Get off {line} at car {car}", zh: "{line} {car}号车厢下车", ja: "{line} {car}号車で降車" },
  arrive: { ko: "{line} 승강장 도착", en: "Arrive at the {line} platform", zh: "到达{line}站台", ja: "{line}ホームに到着" },
  reverse: { ko: "반대 방향", en: "Reverse", zh: "反方向", ja: "逆方向" },
  noTransferTitle: {
    ko: "{station}은 환승역이 아니에요",
    en: "{station} has no transfers",
    zh: "{station}不是换乘站",
    ja: "{station}は乗換駅ではありません",
  },
  noTransferBody: {
    ko: "단일 노선 역이에요. 엘리베이터·에스컬레이터 동선은 '계단 없는 길' 탭에서 확인하세요.",
    en: "This is a single-line station. Check elevator and escalator routes in the Step-free tab.",
    zh: "这是单线车站。电梯·扶梯路线请在“无台阶路线”中查看。",
    ja: "単一路線の駅です。エレベーター・エスカレーターの動線は「階段なしルート」タブで確認できます。",
  },
  goBarrierFree: { ko: "♿ 계단 없는 길 보기", en: "♿ See step-free route", zh: "♿ 查看无台阶路线", ja: "♿ 階段なしルートを見る" },
  fastNote: {
    ko: "베타 샘플: 칸 번호·소요 시간은 예시이며 실제와 다를 수 있어요.",
    en: "Beta sample: car numbers and times are examples and may differ.",
    zh: "测试样例：车厢号与时间仅供参考，可能与实际不同。",
    ja: "ベータ版サンプル：号車・所要時間は例であり、実際と異なる場合があります。",
  },
  stepFreeBadge: { ko: "계단 0개", en: "0 stairs", zh: "0台阶", ja: "階段0" },
  stepFreeTitle: {
    ko: "계단 0개 무장애 동선 코스",
    en: "Step-free accessible route",
    zh: "零台阶无障碍路线",
    ja: "階段ゼロのバリアフリールート",
  },
  audience: {
    ko: "♿ 휠체어 · 👶 유모차 · 🧳 캐리어 OK",
    en: "♿ Wheelchair · 👶 Stroller · 🧳 Luggage OK",
    zh: "♿ 轮椅 · 👶 婴儿车 · 🧳 行李箱 OK",
    ja: "♿ 車いす · 👶 ベビーカー · 🧳 スーツケース OK",
  },
  noCourseTitle: {
    ko: "이 역의 무장애 동선은 준비 중이에요",
    en: "Step-free route for this station is coming soon",
    zh: "本站无障碍路线准备中",
    ja: "この駅のバリアフリールートは準備中です",
  },
  noCourseBody: {
    ko: "'시설 상태' 탭에서 엘리베이터 위치를 확인하거나, 직접 다녀온 길을 알려 주세요.",
    en: "Check elevator spots in the Facilities tab, or share the route you took.",
    zh: "可在“设施状态”中查看电梯位置，或分享您走过的路线。",
    ja: "「設備状況」タブでエレベーターの位置を確認するか、通った道を教えてください。",
  },
  pickLine: { ko: "어느 호선을 타시나요?", en: "Which line are you taking?", zh: "您乘坐哪条线？", ja: "どの路線に乗りますか？" },
  moreCourses: { ko: "♿ 다른 무장애 코스", en: "♿ More step-free routes", zh: "♿ 其他无障碍路线", ja: "♿ ほかのバリアフリールート" },
  diagramTitle: { ko: "역사 단면도 · 안내도", en: "Station cross-section", zh: "车站剖面图 · 导览图", ja: "駅断面図 · 案内図" },
  diagramPlaceholder: {
    ko: "공공데이터 역사 단면도 이미지 연동 예정",
    en: "Public-data station diagram coming soon",
    zh: "公共数据车站剖面图即将接入",
    ja: "公共データの駅断面図を連携予定",
  },
  diagramSource: {
    ko: "출처(예정): 국가철도공단 · 서울교통공사 공공데이터",
    en: "Source (planned): KR / Seoul Metro open data",
    zh: "来源（预定）：国家铁道公团 · 首尔交通公社公共数据",
    ja: "出典（予定）：国家鉄道公団 · ソウル交通公社 公共データ",
  },
  openMap: { ko: "카카오맵에서 역 보기", en: "Open in Kakao Map", zh: "在Kakao地图中查看", ja: "カカオマップで見る" },
  shareRoute: { ko: "✏️ 내가 아는 길 알려주기", en: "✏️ Share a route you know", zh: "✏️ 分享我知道的路线", ja: "✏️ 知っているルートを教える" },
  summary: { ko: "지금 시설 현황", en: "Facility status now", zh: "当前设施状况", ja: "現在の設備状況" },
  askWorking: { ko: "지금 잘 되나요?", en: "Working now?", zh: "现在能用吗？", ja: "今動いていますか？" },
  voteOk: { ko: "👍 잘 돼요", en: "👍 Working", zh: "👍 正常", ja: "👍 動いてます" },
  voteBroken: { ko: "🔧 공사/점검 중", en: "🔧 Under repair", zh: "🔧 施工/检修中", ja: "🔧 工事/点検中" },
  disagreeBroken: {
    ko: "👥 최근 제보는 '점검 중'이 더 많아요",
    en: "👥 Most recent votes say it's under repair",
    zh: "👥 最近多数反馈为“检修中”",
    ja: "👥 最近の投稿は「点検中」が多いです",
  },
  disagreeOk: {
    ko: "👥 최근 제보는 '잘 돼요'가 더 많아요",
    en: "👥 Most recent votes say it's working",
    zh: "👥 最近多数反馈为“正常”",
    ja: "👥 最近の投稿は「動いてます」が多いです",
  },
  votedThanks: {
    ko: "고마워요! 투표가 바로 반영됐어요",
    en: "Thanks! Your vote is counted",
    zh: "谢谢！投票已即时生效",
    ja: "ありがとうございます！投票を反映しました",
  },
  voteCanceled: { ko: "투표를 취소했어요", en: "Vote removed", zh: "已取消投票", ja: "投票を取り消しました" },
  facilitiesNote: {
    ko: "베타: 상태는 샘플 데이터 + 이 기기의 투표 기준이에요. 서울교통공사 승강기 가동현황 공공데이터 연동 예정.",
    en: "Beta: status uses sample data plus votes on this device. Seoul Metro live lift data coming soon.",
    zh: "测试版：状态基于样例数据与本设备投票，将接入首尔交通公社电梯运行公共数据。",
    ja: "ベータ版：状況はサンプルデータとこの端末の投票に基づきます。ソウル交通公社の昇降機稼働データを連携予定。",
  },
  insideStation: { ko: "역 내부", en: "Inside station", zh: "站内", ja: "駅構内" },
  exitN: { ko: "{n}번 출구", en: "Exit {n}", zh: "{n}号出口", ja: "{n}番出口" },
  pickStation: {
    ko: "역을 선택하면 환승·무장애 동선을 보여드려요",
    en: "Pick a station to see transfers and step-free routes",
    zh: "选择车站即可查看换乘与无障碍路线",
    ja: "駅を選ぶと乗換・バリアフリールートを表示します",
  },
  searchStation: { ko: "🔍 역 검색하기", en: "🔍 Search a station", zh: "🔍 搜索车站", ja: "🔍 駅を検索" },
  reportDone: {
    ko: "제보가 등록됐어요. 고마워요!",
    en: "Report posted. Thank you!",
    zh: "上报成功，谢谢！",
    ja: "投稿しました。ありがとうございます！",
  },
} satisfies Record<string, Localized>;

const TAB_META: Record<TransferTab, { emoji: string; label: Localized; caption: Localized }> = {
  fast: {
    emoji: "⚡",
    label: { ko: "빠른 환승", en: "Fast transfer", zh: "快速换乘", ja: "スムーズ乗換" },
    caption: { ko: "노선 간 이동", en: "Between lines", zh: "线路间换乘", ja: "路線間の移動" },
  },
  barrierFree: {
    emoji: "♿",
    label: { ko: "계단 없는 길", en: "Step-free", zh: "无台阶路线", ja: "階段なしルート" },
    caption: { ko: "엘리베이터/무장애", en: "Elevator · Accessible", zh: "电梯/无障碍", ja: "EV/バリアフリー" },
  },
  facilities: {
    emoji: "🔧",
    label: { ko: "시설 상태", en: "Facilities", zh: "设施状态", ja: "設備状況" },
    caption: { ko: "에스컬레이터/엘리베이터", en: "Escalator · Elevator", zh: "扶梯/电梯", ja: "エスカ/EV" },
  },
};

const DIFFICULTY_META: Record<Difficulty, { label: Localized; className: string }> = {
  easy: { label: { ko: "🟢 쉬움", en: "🟢 Easy", zh: "🟢 简单", ja: "🟢 かんたん" }, className: "bg-[#e7f8ee] text-[#15803d]" },
  normal: { label: { ko: "🟡 보통", en: "🟡 Moderate", zh: "🟡 一般", ja: "🟡 ふつう" }, className: "bg-[#fff6d6] text-[#a16207]" },
  hard: { label: { ko: "🔴 어려움", en: "🔴 Hard", zh: "🔴 较难", ja: "🔴 むずかしい" }, className: "bg-[#fdecec] text-[#dc2626]" },
};

const LANDMARK_META: Record<Landmark, { emoji: string; label: Localized }> = {
  escalator: { emoji: "↗️", label: { ko: "에스컬레이터", en: "escalator", zh: "扶梯", ja: "エスカレーター" } },
  elevator: { emoji: "🛗", label: { ko: "엘리베이터", en: "elevator", zh: "电梯", ja: "エレベーター" } },
  stairs: { emoji: "🪜", label: { ko: "계단", en: "stairs", zh: "楼梯", ja: "階段" } },
  corridor: { emoji: "➡️", label: { ko: "환승통로 입구", en: "transfer passage", zh: "换乘通道入口", ja: "乗換通路の入口" } },
};

const FACILITY_KIND_META: Record<Facility["kind"], { emoji: string; label: Localized }> = {
  escalator: { emoji: "↗️", label: { ko: "에스컬레이터", en: "Escalator", zh: "扶梯", ja: "エスカレーター" } },
  elevator: { emoji: "🛗", label: { ko: "엘리베이터", en: "Elevator", zh: "电梯", ja: "エレベーター" } },
};

const STATUS_META: Record<FacilityStatus, { dot: string; label: Localized; className: string }> = {
  ok: {
    dot: "🟢",
    label: { ko: "정상 가동", en: "Running", zh: "正常运行", ja: "正常稼働" },
    className: "bg-[#e7f8ee] text-[#15803d] ring-[#bbf7d0]",
  },
  maintenance: {
    dot: "🔴",
    label: { ko: "점검 중", en: "Under repair", zh: "检修中", ja: "点検中" },
    className: "bg-[#fdecec] text-[#dc2626] ring-[#fecaca]",
  },
  unknown: {
    dot: "⚪",
    label: { ko: "확인 필요", en: "Unconfirmed", zh: "待确认", ja: "要確認" },
    className: "bg-neutral-100 text-neutral-500 ring-neutral-200",
  },
};

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function lineName(station: StationOption, line: string, locale: Locale) {
  const index = stationLines(station).indexOf(line);
  return (index >= 0 ? t(station.lines, locale).split(" · ")[index] : undefined) ?? line;
}

function LineMark({
  station,
  line,
  locale,
  size = "sm",
}: {
  station: StationOption;
  line: string;
  locale: Locale;
  size?: "sm" | "lg";
}) {
  return (
    <LineIcon
      line={line}
      locale={locale}
      label={lineName(station, line, locale)}
      size={size === "lg" ? "lg" : "md"}
      className={size === "lg" ? "shadow-[0_3px_10px_rgba(15,23,42,0.18)]" : ""}
    />
  );
}

function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-neutral-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function BigArrow() {
  return (
    <div className="flex justify-center py-0.5 text-[22px] leading-none text-[#93c5fd]" aria-hidden>
      ⬇
    </div>
  );
}

function FastTransferPanel({
  station,
  routes,
  locale,
  onShowBarrierFree,
  onReport,
}: {
  station: StationOption;
  routes: TransferRoute[];
  locale: Locale;
  onShowBarrierFree: () => void;
  onReport: () => void;
}) {
  const [routeId, setRouteId] = useState<string | null>(null);
  const route = routes.find((candidate) => candidate.id === routeId) ?? routes[0];

  if (!route) {
    return (
      <SectionCard className="px-4 py-5 text-center">
        <p className="text-[34px]" aria-hidden>
          🚉
        </p>
        <h2 className="mt-2 text-[16px] font-extrabold text-neutral-900">
          {fill(t(COPY.noTransferTitle, locale), { station: t(station.name, locale) })}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{t(COPY.noTransferBody, locale)}</p>
        <button
          type="button"
          onClick={onShowBarrierFree}
          className="mt-4 rounded-xl bg-[#2563eb] px-4 py-2.5 text-[13px] font-bold text-white transition active:scale-95"
        >
          {t(COPY.goBarrierFree, locale)}
        </button>
      </SectionCard>
    );
  }

  const from = lineName(station, route.from, locale);
  const to = lineName(station, route.to, locale);
  const reverse = routes.find((candidate) => candidate.from === route.to && candidate.to === route.from);
  const landmark = LANDMARK_META[route.landmark];

  return (
    <>
      <h2 className="mb-2 text-[13px] font-bold text-neutral-500">{t(COPY.chooseRoute, locale)}</h2>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {routes.map((candidate) => {
          const active = candidate.id === route.id;
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => setRouteId(candidate.id)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl border-2 bg-white px-3 py-2 text-[13px] font-bold transition active:scale-95 ${
                active ? "border-[#2563eb] text-neutral-900 shadow-[0_2px_8px_rgba(37,99,235,0.18)]" : "border-transparent text-neutral-600"
              }`}
            >
              <LineMark station={station} line={candidate.from} locale={locale} />
              <span className="text-[15px] text-neutral-400" aria-hidden>
                ➔
              </span>
              <LineMark station={station} line={candidate.to} locale={locale} />
              <span className="sr-only">
                {fill(t(COPY.transferOf, locale), {
                  from: lineName(station, candidate.from, locale),
                  to: lineName(station, candidate.to, locale),
                })}
              </span>
            </button>
          );
        })}
      </div>

      <SectionCard className="mt-3 overflow-hidden">
        <div className="bg-gradient-to-br from-[#eef4ff] to-white px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold tracking-tight text-neutral-900">
              {fill(t(COPY.transferOf, locale), { from, to })}
            </h3>
            {reverse ? (
              <button
                type="button"
                onClick={() => setRouteId(reverse.id)}
                className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-600 transition active:scale-95"
              >
                ⇄ {t(COPY.reverse, locale)}
              </button>
            ) : null}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex w-[72px] shrink-0 flex-col items-center gap-1">
              <LineMark station={station} line={route.from} locale={locale} size="lg" />
              <span className="max-w-full truncate text-[11px] font-bold text-neutral-600">{from}</span>
            </div>
            <div className="flex flex-1 items-center pb-5" aria-hidden>
              <span
                className="h-1.5 flex-1 rounded-full"
                style={{ backgroundImage: `linear-gradient(90deg, ${lineColor([route.from])}, ${lineColor([route.to])})` }}
              />
              <span className="-ml-1 text-[30px] font-black leading-none" style={{ color: lineColor([route.to]) }}>
                ➔
              </span>
            </div>
            <div className="flex w-[72px] shrink-0 flex-col items-center gap-1">
              <LineMark station={station} line={route.to} locale={locale} size="lg" />
              <span className="max-w-full truncate text-[11px] font-bold text-neutral-600">{to}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          {route.car ? (
            <p className="rounded-2xl border-2 border-[#fbbf24] bg-[#fff8e1] px-3.5 py-3 text-[16px] font-extrabold leading-snug text-[#92400e]">
              {fill(t(COPY.carTip, locale), { car: route.car, landmark: t(landmark.label, locale) })}
            </p>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-3">
              <p className="text-[13px] font-semibold leading-snug text-neutral-600">{t(COPY.carUnknown, locale)}</p>
              <button type="button" onClick={onReport} className="mt-2 text-[12px] font-bold text-[#2563eb]">
                {t(COPY.shareRoute, locale)} →
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-[13px] font-bold text-[#1d4ed8]">
              🚶 {route.walkMinutes !== null ? fill(t(COPY.walk, locale), { n: route.walkMinutes }) : t(COPY.walkUnknown, locale)}
            </span>
            {route.difficulty ? (
              <span className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${DIFFICULTY_META[route.difficulty].className}`}>
                {t(DIFFICULTY_META[route.difficulty].label, locale)}
              </span>
            ) : null}
          </div>

          {route.car ? (
            <ol className="mt-4">
              <li className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5 text-[14px] font-bold text-neutral-800">
                <LineMark station={station} line={route.from} locale={locale} />
                {fill(t(COPY.alight, locale), { line: from, car: route.car })}
              </li>
              <BigArrow />
              <li className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5 text-[14px] font-bold text-neutral-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[18px]" aria-hidden>
                  {landmark.emoji}
                </span>
                {route.path ? t(route.path, locale) : t(landmark.label, locale)}
              </li>
              <BigArrow />
              <li className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5 text-[14px] font-bold text-neutral-800">
                <LineMark station={station} line={route.to} locale={locale} />
                {fill(t(COPY.arrive, locale), { line: to })}
              </li>
            </ol>
          ) : null}
        </div>
      </SectionCard>

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{t(COPY.fastNote, locale)}</p>
    </>
  );
}

function CourseCard({ course, locale }: { course: AccessCourse; locale: Locale }) {
  return (
    <SectionCard className="px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#e7f8ee] px-2 py-[3px] text-[11px] font-extrabold text-[#15803d]">
          ✅ {t(COPY.stepFreeBadge, locale)}
        </span>
        <span className="text-[12px] font-bold text-neutral-500">{t(COPY.stepFreeTitle, locale)}</span>
      </div>
      <h3 className="mt-2 text-[16px] font-extrabold tracking-tight text-neutral-900">{t(course.title, locale)}</h3>
      <ol className="mt-3">
        {course.steps.map((step, index) => (
          <li key={step.text.ko}>
            {index > 0 ? <BigArrow /> : null}
            <div className="flex items-center gap-2.5 rounded-xl bg-[#f3f7ff] px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[12px] font-extrabold text-white">
                {index + 1}
              </span>
              <span className="text-[18px]" aria-hidden>
                {step.icon}
              </span>
              <span className="min-w-0 text-[14px] font-bold leading-snug text-neutral-800">{t(step.text, locale)}</span>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function StationDiagramPlaceholder({ locale }: { locale: Locale }) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#c7d7f5] bg-gradient-to-b from-[#f6f9ff] to-[#eef3fb]">
      <svg viewBox="0 0 320 170" className="h-auto w-full" role="img" aria-label={t(COPY.diagramPlaceholder, locale)}>
        <rect x="0" y="0" width="320" height="38" fill="#e0f2fe" />
        <path d="M0 38H320" stroke="#94a3b8" strokeWidth="2" />
        <text x="10" y="26" fontSize="12" fontWeight="700" fill="#64748b">1F</text>
        <rect x="24" y="72" width="272" height="6" rx="3" fill="#cbd5e1" />
        <text x="10" y="68" fontSize="12" fontWeight="700" fill="#64748b">B1</text>
        <rect x="24" y="126" width="272" height="6" rx="3" fill="#cbd5e1" />
        <text x="10" y="122" fontSize="12" fontWeight="700" fill="#64748b">B2</text>
        <rect x="56" y="26" width="26" height="106" rx="5" fill="#2563eb" opacity="0.85" />
        <text x="69" y="86" fontSize="13" textAnchor="middle" fill="#fff">♿</text>
        <path d="M200 132L262 78" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        <rect x="120" y="138" width="170" height="16" rx="8" fill="#a5b4fc" opacity="0.6" />
      </svg>
      <div className="absolute inset-x-3 bottom-2.5 rounded-lg bg-white/90 px-2.5 py-1.5 text-center shadow-sm backdrop-blur">
        <p className="text-[12px] font-bold text-neutral-700">🖼️ {t(COPY.diagramPlaceholder, locale)}</p>
        <p className="text-[10px] text-neutral-400">{t(COPY.diagramSource, locale)}</p>
      </div>
    </div>
  );
}

function BarrierFreePanel({
  station,
  courses,
  locale,
  onReport,
}: {
  station: StationOption;
  courses: AccessCourse[];
  locale: Locale;
  onReport: () => void;
}) {
  const [guideIndex, setGuideIndex] = useState(0);
  const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(station.name.ko)},${station.center.lat},${station.center.lng}`;
  const guides = stepFreeMaps(station);
  const guide = guides[guideIndex] ?? guides[0];
  if (guide) {
    return (
      <>
        <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-neutral-700 shadow-sm">
          {t(COPY.audience, locale)}
        </p>
        {guides.length > 1 ? (
          <div className="mb-3">
            <p className="mb-1.5 text-[12px] font-extrabold text-neutral-600">{t(COPY.pickLine, locale)}</p>
            <div role="radiogroup" aria-label={t(COPY.pickLine, locale)} className="flex flex-wrap gap-2">
              {guides.map((option, index) => {
                const active = option === guide;
                return (
                  <button
                    key={option.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setGuideIndex(index)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-extrabold transition active:scale-95 ${
                      active
                        ? "bg-white text-neutral-900 shadow-[0_2px_8px_rgba(15,23,42,0.12)] ring-2 ring-honey"
                        : "bg-white/70 text-neutral-500 ring-1 ring-neutral-200"
                    }`}
                  >
                    <LineIcon line={option.line} locale={locale} size="sm" />
                    {t(lineLabel(option.line), locale)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <StepFreeGuide key={guide.code} map={guide} station={station} locale={locale} />
          {courses.length > 0 ? (
            <>
              <h3 className="mt-2 text-[14px] font-extrabold text-neutral-900">{t(COPY.moreCourses, locale)}</h3>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} />
              ))}
            </>
          ) : null}
        </div>
      </>
    );
  }
  return (
    <>
      <p className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-neutral-700 shadow-sm">
        {t(COPY.audience, locale)}
      </p>
      <div className="flex flex-col gap-3">
        {courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} locale={locale} />)
        ) : (
          <SectionCard className="px-4 py-5 text-center">
            <p className="text-[32px]" aria-hidden>
              ♿
            </p>
            <h3 className="mt-1.5 text-[15px] font-extrabold text-neutral-900">{t(COPY.noCourseTitle, locale)}</h3>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-500">{t(COPY.noCourseBody, locale)}</p>
            <button
              type="button"
              onClick={onReport}
              className="mt-3 rounded-xl bg-[#2563eb] px-4 py-2.5 text-[13px] font-bold text-white transition active:scale-95"
            >
              {t(COPY.shareRoute, locale)}
            </button>
          </SectionCard>
        )}

        <SectionCard className="px-4 py-4">
          <h3 className="mb-2.5 text-[14px] font-extrabold text-neutral-900">🗺️ {t(COPY.diagramTitle, locale)}</h3>
          <StationDiagramPlaceholder locale={locale} />
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#2563eb]"
          >
            {t(COPY.openMap, locale)} ↗
          </a>
        </SectionCard>
      </div>
    </>
  );
}

function facilityName(facility: Facility, locale: Locale) {
  const place = facility.exit !== null ? fill(t(COPY.exitN, locale), { n: facility.exit }) : t(COPY.insideStation, locale);
  return `${place} ${t(FACILITY_KIND_META[facility.kind].label, locale)}`;
}

function crowdView(facility: Facility, mine: FacilityVote | undefined) {
  const ok = facility.votes.ok + (mine === "ok" ? 1 : 0);
  const broken = facility.votes.broken + (mine === "broken" ? 1 : 0);
  const byVotes = ok + broken > 0 ? (broken > ok ? "maintenance" : "ok") : "unknown";
  const status: FacilityStatus = facility.status === "unknown" ? byVotes : facility.status;
  const disagree =
    facility.status === "ok" && broken > ok ? "broken" : facility.status === "maintenance" && ok > broken ? "ok" : null;
  return { ok, broken, status, disagree };
}

function FacilityCard({
  facility,
  mine,
  locale,
  onVote,
}: {
  facility: Facility;
  mine: FacilityVote | undefined;
  locale: Locale;
  onVote: (vote: FacilityVote) => void;
}) {
  const { ok, broken, status, disagree } = crowdView(facility, mine);
  const meta = STATUS_META[status];
  const voteButton = (vote: FacilityVote, count: number) => {
    const active = mine === vote;
    const tone =
      vote === "ok"
        ? active
          ? "border-[#16a34a] bg-[#e7f8ee] text-[#15803d]"
          : "border-neutral-200 bg-white text-neutral-700"
        : active
          ? "border-[#dc2626] bg-[#fdecec] text-[#dc2626]"
          : "border-neutral-200 bg-white text-neutral-700";
    return (
      <button
        type="button"
        onClick={() => onVote(vote)}
        aria-pressed={active}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-[13px] font-bold transition active:scale-95 ${tone}`}
      >
        {t(vote === "ok" ? COPY.voteOk : COPY.voteBroken, locale)}
        <span key={count} className="inline-block min-w-[1.25rem] animate-[vote-pop_320ms_ease-out] tabular-nums">
          {count}
        </span>
      </button>
    );
  };

  return (
    <li>
      <SectionCard className="px-3.5 py-3.5">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px] ${
              status === "maintenance" ? "bg-[#fdecec]" : "bg-[#eef4ff]"
            }`}
            aria-hidden
          >
            {FACILITY_KIND_META[facility.kind].emoji}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold leading-tight text-neutral-900">{facilityName(facility, locale)}</h3>
            <p className="mt-0.5 text-[12px] font-semibold text-neutral-400">{facility.levels}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-extrabold ring-1 ${meta.className}`}>
            {meta.dot} {t(meta.label, locale)}
          </span>
        </div>
        {disagree ? (
          <p className="mt-2 rounded-lg bg-[#fff6d6] px-2.5 py-1.5 text-[11px] font-bold text-[#a16207]">
            {t(disagree === "broken" ? COPY.disagreeBroken : COPY.disagreeOk, locale)}
          </p>
        ) : null}
        <div className="mt-3 border-t border-neutral-100 pt-2.5">
          <p className="mb-1.5 text-[12px] font-bold text-neutral-500">{t(COPY.askWorking, locale)}</p>
          <div className="flex gap-2">
            {voteButton("ok", ok)}
            {voteButton("broken", broken)}
          </div>
        </div>
      </SectionCard>
    </li>
  );
}

function FacilitiesPanel({
  facilities,
  locale,
  onVoted,
}: {
  facilities: Facility[];
  locale: Locale;
  onVoted: (added: boolean) => void;
}) {
  const votes = useFacilityVotes();
  const counts = { ok: 0, maintenance: 0, unknown: 0 } satisfies Record<FacilityStatus, number>;
  for (const facility of facilities) counts[crowdView(facility, votes[facility.id]).status] += 1;

  function vote(facility: Facility, next: FacilityVote) {
    const added = votes[facility.id] !== next;
    voteFacility(facility.id, next);
    onVoted(added);
  }

  return (
    <>
      <SectionCard className="flex items-center justify-between px-4 py-3">
        <h2 className="text-[14px] font-extrabold text-neutral-900">📊 {t(COPY.summary, locale)}</h2>
        <div className="flex gap-1.5 text-[12px] font-bold">
          <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[#15803d]">🟢 {counts.ok}</span>
          <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[#dc2626]">🔴 {counts.maintenance}</span>
          {counts.unknown > 0 ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-500">⚪ {counts.unknown}</span>
          ) : null}
        </div>
      </SectionCard>
      <ul className="mt-3 flex flex-col gap-2.5">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            mine={votes[facility.id]}
            locale={locale}
            onVote={(next) => vote(facility, next)}
          />
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">{t(COPY.facilitiesNote, locale)}</p>
    </>
  );
}

export default function TransferScreen({
  initialStation,
  initialTab,
}: {
  initialStation: StationOption | null;
  initialTab: TransferTab;
}) {
  const locale = useLocale();
  const router = useRouter();
  const lastStation = useLastStation();
  const { toast, showToast } = useToast();
  const tabsId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TransferTab>(initialTab);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const station = initialStation ?? lastStation;
  const info = station ? transferInfo(station) : null;

  function changeTab(next: TransferTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  function openSearch() {
    flushSync(() => setSearchOpen(true));
    searchInputRef.current?.focus();
  }

  function selectStation(next: StationOption) {
    setSearchOpen(false);
    const params = stationParams(next);
    params.set("tab", tab);
    router.push(`/transfer?${params}`);
  }

  function onVoted(added: boolean) {
    showToast(t(added ? COPY.votedThanks : COPY.voteCanceled, locale));
  }

  const subtitle = station ? (
    <>
      <PinIcon size={14} className="shrink-0 text-honey" />
      <span className="truncate">{t(station.name, locale)}</span>
      <LineBadges station={station} locale={locale} size="xs" />
    </>
  ) : undefined;

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader backHref="/" title={TRANSFER_TITLE} subtitle={subtitle} icon={<TransferIcon />} />

        {station && info ? (
          <>
            <div role="tablist" className="mx-4 mb-2 grid shrink-0 grid-cols-3 gap-1 rounded-2xl bg-surface-muted p-1">
              {TRANSFER_TABS.map((id) => {
                const meta = TAB_META[id];
                const active = id === tab;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`${tabsId}-${id}`}
                    aria-selected={active}
                    aria-controls={`${tabsId}-panel`}
                    onClick={() => changeTab(id)}
                    className={`flex min-w-0 flex-col items-center rounded-xl px-1 py-2 transition ${
                      active ? "bg-[#2563eb] text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]" : "text-neutral-600 active:bg-neutral-100"
                    }`}
                  >
                    <span className="flex max-w-full items-center gap-1 text-[13px] font-extrabold">
                      <span aria-hidden>{meta.emoji}</span>
                      <span className="truncate">{t(meta.label, locale)}</span>
                    </span>
                    <span className={`mt-0.5 max-w-full truncate text-[10px] font-semibold ${active ? "text-white/80" : "text-neutral-400"}`}>
                      {t(meta.caption, locale)}
                    </span>
                  </button>
                );
              })}
            </div>

            <main
              id={`${tabsId}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabsId}-${tab}`}
              className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-1"
            >
              <div key={tab} className="animate-[tab-in_200ms_ease-out]">
                {tab === "fast" ? (
                  <FastTransferPanel
                    station={station}
                    routes={info.routes}
                    locale={locale}
                    onShowBarrierFree={() => changeTab("barrierFree")}
                    onReport={() => setSheetOpen(true)}
                  />
                ) : tab === "barrierFree" ? (
                  <BarrierFreePanel
                    station={station}
                    courses={info.courses}
                    locale={locale}
                    onReport={() => setSheetOpen(true)}
                  />
                ) : (
                  <FacilitiesPanel facilities={info.facilities} locale={locale} onVoted={onVoted} />
                )}
              </div>
            </main>
          </>
        ) : (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-[40px]" aria-hidden>
              🛗
            </span>
            <p className="text-[14px] text-neutral-500">{t(COPY.pickStation, locale)}</p>
            <button
              type="button"
              onClick={openSearch}
              className="rounded-2xl bg-[#2563eb] px-5 py-3 text-[14px] font-bold text-white transition active:scale-95"
            >
              {t(COPY.searchStation, locale)}
            </button>
          </main>
        )}

        <BottomNav active="home" />

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
          near={station?.center ?? null}
        />
      </div>
    </div>
  );
}
