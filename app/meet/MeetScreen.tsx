"use client";

import { useMemo, useRef, useState } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import LineBadges from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { Toast, useToast } from "../_components/Toast";
import { DoorIcon, FlagIcon, TransferIcon } from "../_components/icons";
import { armArrivalAlarm } from "../_lib/arrivalAlarm";
import { useLocale } from "../_lib/locale";
import { useLastStation } from "../_lib/lastStation";
import {
  courseForStation,
  type CoursePlace,
  type CourseStep,
  type CourseStepId,
  type StationCourse,
} from "../_lib/meetCourses";
import { findOptimalMidpoints, type MidpointCandidate } from "../_lib/meetMidpoint";
import { useMyStations } from "../_lib/myStations";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { MEET_TITLE, MeetHeaderIcon } from "./header";

type Mode = "course" | "meet";

const COPY = {
  tabCourse: {
    ko: "역 중심 여행·데이트 코스",
    en: "Station date & travel course",
    zh: "车站主题约会·旅行行程",
    ja: "駅中心デート・旅行コース",
  },
  tabMeet: {
    ko: "중간 약속역 찾기 (2인)",
    en: "Meet in the middle (2 people)",
    zh: "中间会面站（双人）",
    ja: "中間の待ち合わせ駅（2人）",
  },
  pickDest: { ko: "목적지역 선택", en: "Pick a destination", zh: "选择目的地站", ja: "目的地駅を選ぶ" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  searchPh: { ko: "역 이름 검색", en: "Search station", zh: "搜索车站", ja: "駅名で検索" },
  favorites: { ko: "My 역에서 고르기", en: "From My Stations", zh: "从 My 车站选择", ja: "My 駅から選ぶ" },
  startA: { ko: "내 출발역 (A)", en: "My start (A)", zh: "我的出发站 (A)", ja: "自分の出発駅 (A)" },
  startB: { ko: "상대 출발역 (B)", en: "Their start (B)", zh: "对方出发站 (B)", ja: "相手の出発駅 (B)" },
  swap: { ko: "A·B 바꾸기", en: "Swap A·B", zh: "交换 A·B", ja: "A・B入れ替え" },
  find: { ko: "중간역 찾기", en: "Find midpoint", zh: "查找中间站", ja: "中間駅を探す" },
  update: { ko: "다시 찾기", en: "Update", zh: "重新查找", ja: "再検索" },
  best: { ko: "추천 중간 약속역", en: "Best meeting station", zh: "推荐中间会面站", ja: "おすすめ中間駅" },
  alt: { ko: "대안 {n}", en: "Alt {n}", zh: "备选 {n}", ja: "代替 {n}" },
  timeA: { ko: "A 약 {m}분", en: "A ~{m} min", zh: "A 约{m}分", ja: "A 約{m}分" },
  timeB: { ko: "B 약 {m}분", en: "B ~{m} min", zh: "B 约{m}分", ja: "B 約{m}分" },
  fair: {
    ko: "이동 합계 {total}분 · 차이 {gap}분",
    en: "Total {total} min · gap {gap} min",
    zh: "合计 {total} 分 · 差距 {gap} 分",
    ja: "合計 {total} 分 · 差 {gap} 分",
  },
  tipMeet: { ko: "추천 만남 장소", en: "Meeting spot", zh: "推荐会面点", ja: "おすすめ待ち合わせ" },
  tipDoor: { ko: "빠른 하차/출구 칸", en: "Fast alight cars", zh: "快速下车车厢", ja: "降車しやすい車両" },
  courseTitle: { ko: "추천 코스 플랜", en: "Recommended course", zh: "推荐行程", ja: "おすすめコース" },
  courseHint: {
    ko: "각 단계마다 원하는 장소를 골라 나만의 코스를 만드세요",
    en: "Pick one place per step to build your course",
    zh: "每一步选一个地点，组成你的行程",
    ja: "各ステップで場所を選んでコースを作りましょう",
  },
  rating: { ko: "★ {n}", en: "★ {n}", zh: "★ {n}", ja: "★ {n}" },
  walk: {
    ko: "{exit}번 출구 도보 {min}분",
    en: "{min} min walk from Exit {exit}",
    zh: "{exit}号出口步行{min}分",
    ja: "{exit}番出口から徒歩{min}分",
  },
  alarm: { ko: "약속역 하차 알람 바로 켜기", en: "Arm arrival alarm now", zh: "立即开启下车提醒", ja: "待ち合わせ駅の降車アラーム" },
  share: { ko: "완성된 코스 텍스트 복사", en: "Copy course text", zh: "复制行程文本", ja: "コース文をコピー" },
  alarmOn: { ko: "하차 알람을 켰어요", en: "Arrival alarm armed", zh: "已开启下车提醒", ja: "降車アラームをオンにしました" },
  copied: { ko: "코스를 클립보드에 복사했어요", en: "Course copied to clipboard", zh: "行程已复制到剪贴板", ja: "コースをコピーしました" },
  needStations: {
    ko: "출발역 A와 B를 모두 선택해 주세요",
    en: "Pick both start stations A and B",
    zh: "请选择出发站 A 和 B",
    ja: "出発駅 A と B を選んでください",
  },
  needDest: { ko: "목적지역을 선택해 주세요", en: "Pick a destination station", zh: "请选择目的地站", ja: "目的地駅を選んでください" },
  sameStation: {
    ko: "서로 다른 두 역을 골라 주세요",
    en: "Choose two different stations",
    zh: "请选择两个不同的车站",
    ja: "違う2つの駅を選んでください",
  },
  noMid: {
    ko: "중간역을 찾지 못했어요. 다른 출발역을 시도해 보세요",
    en: "Couldn't find a midpoint. Try other starts.",
    zh: "未找到中间站，请换出发站试试",
    ja: "中間駅が見つかりません。別の駅で試してください",
  },
  pickA: { ko: "A 선택", en: "Pick A", zh: "选择 A", ja: "A を選ぶ" },
  pickB: { ko: "B 선택", en: "Pick B", zh: "选择 B", ja: "B を選ぶ" },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function StationPicker({
  label,
  station,
  locale,
  favorites,
  suggested,
  onPick,
}: {
  label: string;
  station: StationOption | null;
  locale: Locale;
  favorites: StationOption[];
  suggested: StationOption | null;
  onPick: (station: StationOption) => void;
}) {
  const [open, setOpen] = useState(!station);
  const [query, setQuery] = useState("");

  return (
    <div>
      <p className="text-[12px] font-bold text-[#92400E]">{label}</p>
      {station && !open ? (
        <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-amber-200/80">
          <LineBadges station={station} locale={locale} size="md" />
          <span className="min-w-0 flex-1 text-[14px] font-extrabold text-ink">{t(station.name, locale)}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-bold text-[#B45309] ring-1 ring-amber-200"
          >
            {t(COPY.change, locale)}
          </button>
        </div>
      ) : (
        <div className="mt-1.5 space-y-2">
          {favorites.length ? (
            <div className="flex flex-wrap gap-1.5">
              {favorites.map((fav) => (
                <button
                  key={fav.key}
                  type="button"
                  onClick={() => {
                    onPick(fav);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-700 ring-1 ring-neutral-200 active:scale-95"
                >
                  {t(fav.name, locale)}
                </button>
              ))}
              {suggested ? (
                <button
                  type="button"
                  onClick={() => {
                    onPick(suggested);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-[#B45309] active:scale-95"
                >
                  {t(suggested.name, locale)}
                </button>
              ) : null}
            </div>
          ) : null}
          <StationSearch
            locale={locale}
            query={query}
            onQueryChange={setQuery}
            placeholder={t(COPY.searchPh, locale)}
            inputClassName="rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5"
            onSelect={(next) => {
              onPick(next);
              setOpen(false);
              setQuery("");
            }}
          />
        </div>
      )}
    </div>
  );
}

function MidpointLine({
  a,
  mid,
  b,
  minutesA,
  minutesB,
  locale,
}: {
  a: StationOption;
  mid: StationOption;
  b: StationOption;
  minutesA: number;
  minutesB: number;
  locale: Locale;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-[#FFFBEB] px-3 py-3 ring-1 ring-amber-200/70">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-bold text-neutral-500">{t(a.name, locale)}</p>
          <p className="mt-0.5 text-[12px] font-extrabold text-[#B45309]">{fill(t(COPY.timeA, locale), { m: minutesA })}</p>
        </div>
        <div className="relative flex h-2 flex-[1.4] items-center">
          <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-400 to-amber-300" />
          <span className="absolute left-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#B45309] ring-2 ring-white" />
          <span className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-emerald-500 ring-[3px] ring-white" />
          <span className="absolute right-0 h-2.5 w-2.5 translate-x-1/2 rounded-full bg-[#B45309] ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-bold text-neutral-500">{t(b.name, locale)}</p>
          <p className="mt-0.5 text-[12px] font-extrabold text-[#B45309]">{fill(t(COPY.timeB, locale), { m: minutesB })}</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[12px] font-extrabold text-emerald-700">
        ● {t(mid.name, locale)}
      </p>
    </div>
  );
}

function PlaceCard({
  place,
  selected,
  locale,
  onSelect,
}: {
  place: CoursePlace;
  selected: boolean;
  locale: Locale;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex min-h-[132px] flex-1 flex-col rounded-2xl p-3 text-left transition active:scale-[0.98] ${
        selected
          ? "border-2 border-amber-500 bg-amber-50/40 shadow-[0_4px_14px_rgba(245,158,11,0.18)]"
          : "border border-neutral-200 bg-white"
      }`}
    >
      {selected ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-black text-white">
          ✓
        </span>
      ) : null}
      <span className="w-fit rounded-full bg-[#FFFBEB] px-2 py-[2px] text-[10px] font-extrabold text-[#B45309] ring-1 ring-amber-200">
        {t(place.category, locale)}
      </span>
      <p className="mt-1.5 text-[13px] font-extrabold leading-snug text-ink">{t(place.name, locale)}</p>
      <p className="mt-1 text-[11px] font-semibold leading-snug text-neutral-500">{t(place.feature, locale)}</p>
      <p className="mt-auto pt-2 text-[11px] font-bold text-amber-700">
        {fill(t(COPY.rating, locale), { n: place.rating.toFixed(1) })}
      </p>
      <p className="text-[10px] font-semibold text-neutral-400">
        {fill(t(COPY.walk, locale), { exit: place.exit, min: place.walkMin })}
      </p>
    </button>
  );
}

function CourseTimeline({
  course,
  picks,
  locale,
  onPick,
}: {
  course: StationCourse;
  picks: Record<CourseStepId, string>;
  locale: Locale;
  onPick: (step: CourseStep, placeId: string) => void;
}) {
  return (
    <div className="relative mt-3 pl-3">
      <div className="absolute bottom-4 left-[7px] top-4 w-px bg-gradient-to-b from-amber-300 via-amber-400 to-amber-200" aria-hidden />
      <ol className="flex flex-col gap-4">
        {course.steps.map((stepItem, index) => (
          <li key={stepItem.id} className="relative">
            <span className="absolute -left-[9px] top-3 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-[#FFFBEB]" aria-hidden />
            <p className="text-[12px] font-extrabold text-[#92400E]">
              Step {index + 1} · {stepItem.time} · {t(stepItem.title, locale)}
            </p>
            <div className="mt-2 flex gap-2">
              {stepItem.options.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  selected={picks[stepItem.id] === place.id}
                  locale={locale}
                  onSelect={() => onPick(stepItem, place.id)}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function defaultPicks(course: StationCourse): Record<CourseStepId, string> {
  return {
    food: course.steps[0]?.options[0].id ?? "",
    cafe: course.steps[1]?.options[0].id ?? "",
    fun: course.steps[2]?.options[0].id ?? "",
  };
}

function buildShareText(
  locale: Locale,
  hub: StationOption,
  course: StationCourse,
  picks: Record<CourseStepId, string>,
  mid: MidpointCandidate | null,
) {
  const lines: string[] = [];
  lines.push(`📍 ${t(hub.name, locale)}`);
  if (mid) {
    lines.push(fill(t(COPY.fair, locale), { total: mid.totalMinutes, gap: mid.gapMinutes }));
  }
  lines.push(`🤝 ${t(COPY.tipMeet, locale)}: ${t(course.meetSpot, locale)}`);
  lines.push(`🚪 ${t(course.doorTipA, locale)} / ${t(course.doorTipB, locale)}`);
  course.steps.forEach((stepItem, index) => {
    const chosen = stepItem.options.find((opt) => opt.id === picks[stepItem.id]) ?? stepItem.options[0];
    lines.push(
      `Step ${index + 1} (${stepItem.time}) ${t(stepItem.title, locale)}: ${t(chosen.name, locale)} · ${t(chosen.feature, locale)}`,
    );
  });
  lines.push("— 지하철꿀정보 K-SUB");
  return lines.join("\n");
}

export default function MeetScreen() {
  const locale = useLocale();
  const { places } = useMyStations();
  const lastStation = useLastStation();
  const { toast, showToast } = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const favorites = places.map((place) => place.station);

  const [mode, setMode] = useState<Mode>("course");
  const [dest, setDest] = useState<StationOption | null>(favorites[0] ?? lastStation);
  const [startA, setStartA] = useState<StationOption | null>(favorites[0] ?? lastStation);
  const [startB, setStartB] = useState<StationOption | null>(favorites[1] ?? null);
  const [midpoints, setMidpoints] = useState<MidpointCandidate[]>([]);
  const [activeMidIndex, setActiveMidIndex] = useState(0);
  const [picks, setPicks] = useState<Record<CourseStepId, string>>(() =>
    defaultPicks(courseForStation((favorites[0] ?? lastStation)?.name.ko ?? "성수역")),
  );

  const activeHub = mode === "meet" ? midpoints[activeMidIndex]?.station ?? null : dest;
  const course = useMemo(
    () => (activeHub ? courseForStation(activeHub.name.ko) : null),
    [activeHub],
  );

  function applyCourseStation(station: StationOption) {
    const next = courseForStation(station.name.ko);
    setPicks(defaultPicks(next));
  }

  function runMeet() {
    if (!startA || !startB) {
      showToast(t(COPY.needStations, locale));
      return;
    }
    if (startA.key === startB.key) {
      showToast(t(COPY.sameStation, locale));
      return;
    }
    const found = findOptimalMidpoints(startA, startB, 3);
    if (!found.length) {
      setMidpoints([]);
      showToast(t(COPY.noMid, locale));
      return;
    }
    setMidpoints(found);
    setActiveMidIndex(0);
    applyCourseStation(found[0].station);
  }

  async function onAlarm() {
    if (!activeHub) {
      showToast(t(mode === "meet" ? COPY.needStations : COPY.needDest, locale));
      return;
    }
    const from = mode === "meet" ? startA : lastStation;
    await armArrivalAlarm(activeHub, from);
    showToast(t(COPY.alarmOn, locale));
  }

  async function onShare() {
    if (!activeHub || !course) {
      showToast(t(mode === "meet" ? COPY.needStations : COPY.needDest, locale));
      return;
    }
    const text = buildShareText(locale, activeHub, course, picks, mode === "meet" ? midpoints[activeMidIndex] ?? null : null);
    try {
      await navigator.clipboard.writeText(text);
      showToast(t(COPY.copied, locale));
    } catch {
      showToast(t(COPY.copied, locale));
    }
  }

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <AppHeader title={MEET_TITLE} icon={<MeetHeaderIcon />} />

        <div className="shrink-0 px-4 pb-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#FFF7ED] p-1 ring-1 ring-amber-200/80">
            {(
              [
                ["course", COPY.tabCourse],
                ["meet", COPY.tabMeet],
              ] as const
            ).map(([id, label]) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`rounded-xl px-2 py-2.5 text-[11px] font-extrabold leading-snug transition ${
                    active ? "bg-amber-500 text-white shadow-sm" : "text-[#92400E]"
                  }`}
                >
                  {id === "course" ? "🧭 " : "🤝 "}
                  {t(label, locale)}
                </button>
              );
            })}
          </div>
        </div>

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
          {mode === "course" ? (
            <section className="rounded-3xl bg-[#FFFBEB] p-4 ring-1 ring-amber-200/80">
              <StationPicker
                label={t(COPY.pickDest, locale)}
                station={dest}
                locale={locale}
                favorites={favorites}
                suggested={lastStation}
                onPick={(station) => {
                  setDest(station);
                  applyCourseStation(station);
                }}
              />
            </section>
          ) : (
            <section className="rounded-3xl bg-[#FFFBEB] p-4 ring-1 ring-amber-200/80">
              <StationPicker
                label={t(COPY.startA, locale)}
                station={startA}
                locale={locale}
                favorites={favorites}
                suggested={lastStation}
                onPick={setStartA}
              />
              <div className="my-2 flex justify-center">
                <button
                  type="button"
                  aria-label={t(COPY.swap, locale)}
                  onClick={() => {
                    setStartA(startB);
                    setStartB(startA);
                  }}
                  className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#B45309] ring-1 ring-amber-200 active:scale-95"
                >
                  ⇅ {t(COPY.swap, locale)}
                </button>
              </div>
              <StationPicker
                label={t(COPY.startB, locale)}
                station={startB}
                locale={locale}
                favorites={favorites}
                suggested={null}
                onPick={setStartB}
              />
              <button
                type="button"
                onClick={runMeet}
                className="mt-3 w-full rounded-2xl bg-amber-500 py-3 text-[14px] font-extrabold text-white shadow-[0_6px_16px_rgba(245,158,11,0.35)] active:scale-[0.98]"
              >
                {midpoints.length ? t(COPY.update, locale) : t(COPY.find, locale)}
              </button>
            </section>
          )}

          {mode === "meet" && midpoints[activeMidIndex] ? (
            <section className="mt-4 rounded-3xl bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)] ring-1 ring-amber-200/70">
              <p className="text-[12px] font-bold text-[#92400E]">{t(COPY.best, locale)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {midpoints.map((mid, index) => (
                  <button
                    key={mid.station.key}
                    type="button"
                    onClick={() => {
                      setActiveMidIndex(index);
                      applyCourseStation(mid.station);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold active:scale-95 ${
                      index === activeMidIndex
                        ? "bg-amber-500 text-white"
                        : "bg-[#FFFBEB] text-[#92400E] ring-1 ring-amber-200"
                    }`}
                  >
                    {index === 0 ? t(mid.station.name, locale) : fill(t(COPY.alt, locale), { n: index })}
                  </button>
                ))}
              </div>
              <h3 className="mt-3 flex flex-wrap items-center gap-1.5 text-[17px] font-extrabold text-ink">
                <LineBadges station={midpoints[activeMidIndex].station} locale={locale} size="md" />
                {t(midpoints[activeMidIndex].station.name, locale)}
              </h3>
              <p className="mt-1 text-[12px] font-semibold text-neutral-500">
                {fill(t(COPY.fair, locale), {
                  total: midpoints[activeMidIndex].totalMinutes,
                  gap: midpoints[activeMidIndex].gapMinutes,
                })}
              </p>
              {startA && startB ? (
                <MidpointLine
                  a={startA}
                  b={startB}
                  mid={midpoints[activeMidIndex].station}
                  minutesA={midpoints[activeMidIndex].minutesA}
                  minutesB={midpoints[activeMidIndex].minutesB}
                  locale={locale}
                />
              ) : null}
              {course ? (
                <div className="mt-3 space-y-2 rounded-2xl bg-amber-500 px-3 py-2.5 text-white">
                  <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
                    <FlagIcon size={13} />
                    <span>
                      {t(COPY.tipMeet, locale)}: {t(course.meetSpot, locale)}
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
                    <DoorIcon size={13} />
                    <span>
                      {t(COPY.tipDoor, locale)}: {t(course.doorTipA, locale)} · {t(course.doorTipB, locale)}
                    </span>
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {course && activeHub ? (
            <section className="mt-4 rounded-3xl bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.05)] ring-1 ring-amber-200/60">
              <div className="flex items-center gap-2">
                <TransferIcon size={16} />
                <h3 className="text-[15px] font-extrabold text-ink">{t(COPY.courseTitle, locale)}</h3>
              </div>
              <p className="mt-0.5 text-[12px] text-neutral-500">{t(COPY.courseHint, locale)}</p>
              {mode === "course" && course ? (
                <div className="mt-3 space-y-2 rounded-2xl bg-amber-500 px-3 py-2.5 text-white">
                  <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
                    <FlagIcon size={13} />
                    <span>
                      {t(COPY.tipMeet, locale)}: {t(course.meetSpot, locale)}
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
                    <DoorIcon size={13} />
                    <span>
                      {t(COPY.tipDoor, locale)}: {t(course.doorTipA, locale)} · {t(course.doorTipB, locale)}
                    </span>
                  </p>
                </div>
              ) : null}
              <CourseTimeline
                course={course}
                picks={picks}
                locale={locale}
                onPick={(stepItem, placeId) => setPicks((prev) => ({ ...prev, [stepItem.id]: placeId }))}
              />
            </section>
          ) : null}
        </main>

        <div className="absolute inset-x-0 bottom-[58px] z-20 border-t border-amber-200/80 bg-[#FFFBEB]/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void onAlarm()}
              className="w-full rounded-2xl bg-amber-500 py-3 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] active:scale-[0.98]"
            >
              🔔 {t(COPY.alarm, locale)}
            </button>
            <button
              type="button"
              onClick={() => void onShare()}
              className="w-full rounded-2xl bg-[#1e3a8a] py-3 text-[13px] font-extrabold text-white active:scale-[0.98]"
            >
              📋 {t(COPY.share, locale)}
            </button>
          </div>
        </div>

        <BottomNav active="meet" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />
        <Toast message={toast} />
      </div>
    </div>
  );
}
