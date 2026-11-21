"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../_components/AppHeader";
import BottomNav from "../_components/BottomNav";
import BottomSheet from "../_components/BottomSheet";
import LineBadges from "../_components/LineBadges";
import StationSearch from "../_components/StationSearch";
import { Toast, useToast } from "../_components/Toast";
import {
  BellIcon,
  CompassIcon,
  CopyIcon,
  DoorIcon,
  FlagIcon,
  HandshakeIcon,
  PlaceKindIcon,
  SparkleIcon,
} from "../_components/icons";
import { armArrivalAlarm } from "../_lib/arrivalAlarm";
import { useLastStation } from "../_lib/lastStation";
import { useLocale } from "../_lib/locale";
import {
  CAFE_CHIPS,
  courseForStation,
  FOOD_CHIPS,
  type CoursePlace,
  type CourseStep,
  type CourseStepId,
  type PlaceChip,
  type StationCourse,
} from "../_lib/meetCourses";
import { findOptimalMidpoints, type MidpointCandidate } from "../_lib/meetMidpoint";
import {
  applyLivePlaces,
  clearStockImages,
  fetchMeetPlacePack,
  naverMapSearchUrl,
  placeThumbnailQuery,
  placeVisualKind,
} from "../_lib/meetPlaces";
import { useMyStations } from "../_lib/myStations";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { MEET_TITLE, MeetHeaderIcon } from "./header";

type Mode = "course" | "meet";

const COPY = {
  tabCourse: {
    ko: "데이트 · 여행 코스",
    en: "Date · travel course",
    zh: "约会 · 旅行行程",
    ja: "デート · 旅行コース",
  },
  tabMeet: {
    ko: "우리 어디서 볼까?",
    en: "Where should we meet?",
    zh: "我们在哪儿见？",
    ja: "どこで会う？",
  },
  pickDest: { ko: "목적지역 선택", en: "Pick a destination", zh: "选择目的地站", ja: "目的地駅を選ぶ" },
  change: { ko: "변경", en: "Change", zh: "更改", ja: "変更" },
  searchPh: { ko: "역 이름 검색", en: "Search station", zh: "搜索车站", ja: "駅名で検索" },
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
  courseTitle: {
    ko: "시간대별 나만의 코스 만들기",
    en: "Build your timed course",
    zh: "按时段打造专属行程",
    ja: "時間帯別マイコース",
  },
  courseHint: {
    ko: "각 단계마다 원하는 장소를 골라 나만의 코스를 만드세요",
    en: "Pick one place per step to build your course",
    zh: "每一步选一个地点，组成你的行程",
    ja: "各ステップで場所を選んでコースを作りましょう",
  },
  loadingPlaces: {
    ko: "역 주변 맛집·카페·명소를 불러오는 중…",
    en: "Loading nearby places…",
    zh: "正在加载附近地点…",
    ja: "周辺スポットを読み込み中…",
  },
  rating: { ko: "★ {n}", en: "★ {n}", zh: "★ {n}", ja: "★ {n}" },
  walk: {
    ko: "{exit}번 출구 도보 {min}분",
    en: "{min} min walk from Exit {exit}",
    zh: "{exit}号出口步行{min}分",
    ja: "{exit}番出口から徒歩{min}分",
  },
  walkHero: {
    ko: "{exit}번 출구 도보 {min}분 · {m}m",
    en: "Exit {exit} · {min} min · {m}m",
    zh: "{exit}号出口步行{min}分 · {m}m",
    ja: "{exit}番出口 徒歩{min}分 · {m}m",
  },
  walkDetail: {
    ko: "{station} {exit}번 출구에서 약 {m}m · 도보 {min}분",
    en: "~{m} m · {min} min walk from {station} Exit {exit}",
    zh: "从{station}{exit}号出口约{m}m · 步行{min}分钟",
    ja: "{station}{exit}番出口から約{m}m · 徒歩{min}分",
  },
  copyAddr: { ko: "주소 복사", en: "Copy address", zh: "复制地址", ja: "住所コピー" },
  copiedAddr: { ko: "복사됨", en: "Copied", zh: "已复制", ja: "コピー済み" },
  noPhone: {
    ko: "등록된 전화번호 없음",
    en: "No phone listed",
    zh: "无登记电话",
    ja: "電話番号なし",
  },
  addCourse: {
    ko: "이 장소를 내 코스에 담기",
    en: "Add to my course",
    zh: "加入我的行程",
    ja: "コースに入れる",
  },
  inCourse: {
    ko: "코스에 담김 · 다시 누르면 해제",
    en: "In course · tap to remove",
    zh: "已加入 · 再点取消",
    ja: "コース入り · 再タップで解除",
  },
  kakaoOpen: {
    ko: "카카오맵에서 사진·리뷰 보기",
    en: "Photos & reviews on Kakao Map",
    zh: "在Kakao地图看照片评论",
    ja: "カカオマップで写真・レビュー",
  },
  naverOpen: {
    ko: "네이버지도에서 검색",
    en: "Search on Naver Map",
    zh: "在Naver地图搜索",
    ja: "네이버地図で検索",
  },
  selectPlace: { ko: "코스에 담기", en: "Select", zh: "选入行程", ja: "コースに入れる" },
  deselectPlace: { ko: "선택 해제", en: "Deselect", zh: "取消选择", ja: "選択解除" },
  openDetail: { ko: "매장 상세", en: "Place details", zh: "店铺详情", ja: "店舗詳細" },
  alarm: { ko: "하차 알람 켜기", en: "Arm alarm", zh: "开启下车提醒", ja: "降車アラーム" },
  share: { ko: "코스 복사", en: "Copy course", zh: "复制行程", ja: "コースコピー" },
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
  emptyFilter: {
    ko: "이 카테고리 장소가 없어요. 전체를 눌러 보세요",
    en: "No places in this category — try All",
    zh: "该分类暂无地点，请点全部",
    ja: "このカテゴリの場所がありません。すべてを押してください",
  },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function TipBanner({ course, locale }: { course: StationCourse; locale: Locale }) {
  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900">
      <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
        <span className="mt-0.5 text-[#B45309]">
          <FlagIcon size={13} />
        </span>
        <span>
          {t(COPY.tipMeet, locale)}: {t(course.meetSpot, locale)}
        </span>
      </p>
      <p className="flex items-start gap-1.5 text-[12px] font-bold leading-snug">
        <span className="mt-0.5 text-[#B45309]">
          <DoorIcon size={13} />
        </span>
        <span>
          {t(COPY.tipDoor, locale)}: {t(course.doorTipA, locale)} · {t(course.doorTipB, locale)}
        </span>
      </p>
    </div>
  );
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
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = boxRef.current;
    if (!root || open) return;
    const strip = () => {
      root.querySelectorAll("a").forEach((anchor) => {
        const href = anchor.getAttribute("href") ?? "";
        if (/klook|travelpayouts|emrld|aviasales|hotellook/i.test(href)) {
          anchor.replaceWith(...Array.from(anchor.childNodes));
        }
      });
    };
    strip();
    const observer = new MutationObserver(strip);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [open, station?.key]);

  return (
    <div ref={boxRef} className="meet-no-affiliate">
      <p className="text-[12px] font-bold text-[#78350F]">{label}</p>
      {station && !open ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
          className="mt-1.5 flex w-full items-center gap-2 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-3 py-2.5 text-left transition active:scale-[0.99]"
        >
          <LineBadges station={station} locale={locale} size="md" />
          <span className="min-w-0 flex-1 text-[14px] font-extrabold text-[#1F2937]">{t(station.name, locale)}</span>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#78350F] ring-1 ring-amber-200">
            {t(COPY.change, locale)}
          </span>
        </button>
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
                  className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#1F2937] active:scale-95"
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
                  className="rounded-full border border-amber-200 bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#78350F] active:scale-95"
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
    <div className="mt-3 rounded-2xl border border-amber-200 bg-[#FFFBEB] px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-bold text-neutral-500">{t(a.name, locale)}</p>
          <p className="mt-0.5 text-[12px] font-extrabold text-[#78350F]">{fill(t(COPY.timeA, locale), { m: minutesA })}</p>
        </div>
        <div className="relative flex h-2 flex-[1.4] items-center">
          <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-[#FDE68A] via-[#FCD34D] to-[#FDE68A]" />
          <span className="absolute left-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#D97706] ring-2 ring-white" />
          <span className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#CA8A04] ring-[3px] ring-white" />
          <span className="absolute right-0 h-2.5 w-2.5 translate-x-1/2 rounded-full bg-[#D97706] ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[11px] font-bold text-neutral-500">{t(b.name, locale)}</p>
          <p className="mt-0.5 text-[12px] font-extrabold text-[#78350F]">{fill(t(COPY.timeB, locale), { m: minutesB })}</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[12px] font-extrabold text-[#78350F]">● {t(mid.name, locale)}</p>
    </div>
  );
}

function usePlaceThumbnail(place: CoursePlace) {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">(
    place.placeUrl || place.name.ko ? "loading" : "empty",
  );

  useEffect(() => {
    if (!place.placeUrl && !place.name.ko) {
      setImage(null);
      setStatus("empty");
      return;
    }
    let alive = true;
    setStatus("loading");
    setImage(null);
    fetch(placeThumbnailQuery(place))
      .then((response) => (response.ok ? response.json() : { image: null }))
      .then((data: { image?: string | null }) => {
        if (!alive) return;
        if (data.image) {
          setImage(data.image);
          setStatus("ready");
        } else {
          setImage(null);
          setStatus("empty");
        }
      })
      .catch(() => {
        if (!alive) return;
        setImage(null);
        setStatus("empty");
      });
    return () => {
      alive = false;
    };
  }, [place.id, place.placeUrl, place.name.ko]);

  return { image, status };
}

function PlaceHero({
  place,
  locale,
  tall = false,
}: {
  place: CoursePlace;
  locale: Locale;
  tall?: boolean;
}) {
  const { image, status } = usePlaceThumbnail(place);
  const kind = placeVisualKind(place);
  const meters = place.distanceM ?? place.walkMin * 80;
  const height = tall ? "h-36" : "h-24";

  if (status === "ready" && image) {
    return (
      <div className={`relative ${height} w-full overflow-hidden bg-[#FEF3C7]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className={`${height} w-full object-cover`} />
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${height} w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]/70 px-3 py-2.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-[#92400E] shadow-sm ring-1 ring-amber-200/80">
          <PlaceKindIcon kind={kind} size={tall ? 22 : 20} />
        </span>
        {status === "loading" ? (
          <span className="mt-1 h-1.5 w-8 animate-pulse rounded-full bg-amber-200/80" aria-hidden />
        ) : null}
      </div>
      <div>
        <p className="text-[10px] font-extrabold tracking-wide text-[#78350F]/90">{t(place.category, locale)}</p>
        <p className="mt-0.5 text-[11px] font-bold leading-snug text-[#1F2937]">
          {fill(t(COPY.walkHero, locale), { exit: place.exit, min: place.walkMin, m: meters })}
        </p>
      </div>
    </div>
  );
}

function PlaceCard({
  place,
  selected,
  locale,
  onToggleSelect,
  onOpenDetail,
}: {
  place: CoursePlace;
  selected: boolean;
  locale: Locale;
  onToggleSelect: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <div
      className={`relative flex min-w-[148px] max-w-[180px] flex-1 flex-col overflow-hidden rounded-2xl ${
        selected
          ? "border-2 border-amber-500 bg-amber-50/40 shadow-[0_4px_14px_rgba(245,158,11,0.12)]"
          : "border border-amber-200/80 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label={`${t(COPY.openDetail, locale)}: ${t(place.name, locale)}`}
        className="flex flex-1 flex-col text-left transition active:scale-[0.99]"
      >
        <PlaceHero place={place} locale={locale} />
        <div className="flex flex-1 flex-col p-2.5 pr-8">
          <span className="w-fit rounded-full bg-[#FFFBEB] px-2 py-[2px] text-[10px] font-extrabold text-[#78350F] ring-1 ring-amber-200">
            {t(place.category, locale)}
          </span>
          <p className="mt-1.5 text-[13px] font-extrabold leading-snug text-[#1F2937]">{t(place.name, locale)}</p>
          <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-snug text-neutral-500">{t(place.feature, locale)}</p>
          <p className="mt-auto pt-2 text-[11px] font-bold text-[#92400E]">
            {fill(t(COPY.rating, locale), { n: place.rating.toFixed(1) })}
          </p>
          <p className="text-[10px] font-semibold text-neutral-400">
            {place.distanceM
              ? `${place.distanceM}m · ${fill(t(COPY.walk, locale), { exit: place.exit, min: place.walkMin })}`
              : fill(t(COPY.walk, locale), { exit: place.exit, min: place.walkMin })}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleSelect();
        }}
        aria-label={selected ? t(COPY.deselectPlace, locale) : t(COPY.selectPlace, locale)}
        aria-pressed={selected}
        className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-black shadow-sm ring-1 transition active:scale-95 ${
          selected
            ? "bg-[#CA8A04] text-white ring-[#CA8A04]"
            : "bg-white/95 text-[#92400E] ring-amber-200"
        }`}
      >
        {selected ? "✓" : ""}
      </button>
    </div>
  );
}

function ChipRow({
  chips,
  active,
  locale,
  onChange,
}: {
  chips: { id: PlaceChip; label: Localized }[];
  active: PlaceChip;
  locale: Locale;
  onChange: (id: PlaceChip) => void;
}) {
  return (
    <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
      {chips.map((chip) => {
        const on = chip.id === active;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition active:scale-95 ${
              on
                ? "bg-[#FEF3C7] text-[#78350F] ring-1 ring-amber-300"
                : "bg-white text-neutral-500 ring-1 ring-neutral-200"
            }`}
          >
            {t(chip.label, locale)}
          </button>
        );
      })}
    </div>
  );
}

function CourseTimeline({
  course,
  picks,
  filters,
  locale,
  onTogglePick,
  onOpenDetail,
  onFilter,
}: {
  course: StationCourse;
  picks: Record<CourseStepId, string>;
  filters: Record<"food" | "cafe", PlaceChip>;
  locale: Locale;
  onTogglePick: (step: CourseStep, placeId: string) => void;
  onOpenDetail: (step: CourseStep, place: CoursePlace) => void;
  onFilter: (stepId: "food" | "cafe", chip: PlaceChip) => void;
}) {
  return (
    <div className="relative mt-3 pl-3">
      <div className="absolute bottom-4 left-[7px] top-4 w-px bg-gradient-to-b from-[#FDE68A] via-[#FCD34D] to-[#FEF3C7]" aria-hidden />
      <ol className="flex flex-col gap-4">
        {course.steps.map((stepItem, index) => {
          const chip = stepItem.id === "food" || stepItem.id === "cafe" ? filters[stepItem.id] : "all";
          const chips = stepItem.id === "food" ? FOOD_CHIPS : stepItem.id === "cafe" ? CAFE_CHIPS : null;
          const visible =
            chip === "all"
              ? stepItem.options
              : stepItem.options.filter((place) => place.filter === chip);
          return (
            <li key={stepItem.id} className="relative">
              <span className="absolute -left-[9px] top-3 h-2.5 w-2.5 rounded-full bg-[#FCD34D] ring-4 ring-[#FFFBEB]" aria-hidden />
              <p className="text-[12px] font-extrabold text-[#78350F]">
                Step {index + 1} · {stepItem.time} · {t(stepItem.title, locale)}
              </p>
              {chips ? (
                <ChipRow
                  chips={chips}
                  active={chip}
                  locale={locale}
                  onChange={(next) => onFilter(stepItem.id as "food" | "cafe", next)}
                />
              ) : null}
              {visible.length === 0 ? (
                <p className="mt-2 rounded-xl bg-[#FFFBEB] px-3 py-2 text-[11px] font-semibold text-[#92400E]">
                  {t(COPY.emptyFilter, locale)}
                </p>
              ) : (
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {visible.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      selected={picks[stepItem.id] === place.id}
                      locale={locale}
                      onToggleSelect={() => onTogglePick(stepItem, place.id)}
                      onOpenDetail={() => onOpenDetail(stepItem, place)}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MeetPlaceSheet({
  place,
  station,
  selected,
  locale,
  onClose,
  onToggleSelect,
}: {
  place: CoursePlace;
  station: StationOption;
  selected: boolean;
  locale: Locale;
  onClose: () => void;
  onToggleSelect: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const address = place.address ?? "";
  const meters = place.distanceM ?? place.walkMin * 80;
  const kakaoUrl = place.placeUrl || `https://map.kakao.com/link/search/${encodeURIComponent(t(place.name, locale))}`;
  const naverUrl = naverMapSearchUrl(t(place.name, "ko"));

  function copyAddress() {
    if (!address) return;
    void navigator.clipboard?.writeText(address).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {},
    );
  }

  return (
    <BottomSheet title={t(place.name, locale)} onClose={onClose}>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-3">
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-[#FFFBEB]">
          <PlaceHero place={place} locale={locale} tall />
          <div className="px-3 py-2.5">
            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#78350F] ring-1 ring-amber-200">
              {t(place.category, locale)}
            </span>
            {place.kakaoCategory ? (
              <p className="mt-1.5 text-[11px] font-semibold text-neutral-500">{place.kakaoCategory}</p>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-[13px] font-bold leading-snug text-[#1F2937]">
          {fill(t(COPY.walkDetail, locale), {
            station: t(station.name, locale),
            exit: place.exit,
            m: meters,
            min: place.walkMin,
          })}
        </p>

        {address ? (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-white px-3 py-2.5">
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-[#1F2937]">{address}</p>
            <button
              type="button"
              onClick={copyAddress}
              className="shrink-0 rounded-lg bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-extrabold text-[#78350F] ring-1 ring-amber-200 active:scale-95"
            >
              {t(copied ? COPY.copiedAddr : COPY.copyAddr, locale)}
            </button>
          </div>
        ) : null}

        <div className="mt-2.5 rounded-2xl border border-amber-200 bg-white px-3 py-2.5">
          {place.phone ? (
            <a href={`tel:${place.phone}`} className="text-[13px] font-bold text-[#1F2937] underline-offset-2 active:underline">
              {place.phone}
            </a>
          ) : (
            <p className="text-[13px] font-semibold text-neutral-400">{t(COPY.noPhone, locale)}</p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={onToggleSelect}
            className={`inline-flex h-[44px] items-center justify-center gap-1.5 rounded-xl text-[13px] font-extrabold active:scale-[0.98] ${
              selected
                ? "border border-amber-300 bg-[#FEF3C7] text-[#78350F]"
                : "bg-[#1F2937] text-white"
            }`}
          >
            ✓ {t(selected ? COPY.inCourse : COPY.addCourse, locale)}
          </button>
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center rounded-xl bg-[#FEE500] text-[13px] font-extrabold text-[#191919] active:scale-[0.98]"
          >
            {t(COPY.kakaoOpen, locale)}
          </a>
          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center justify-center rounded-xl bg-[#03C75A] text-[13px] font-extrabold text-white active:scale-[0.98]"
          >
            {t(COPY.naverOpen, locale)}
          </a>
        </div>
      </div>
    </BottomSheet>
  );
}

function defaultPicks(course: StationCourse): Record<CourseStepId, string> {
  return {
    food: course.steps[0]?.options[0]?.id ?? "",
    cafe: course.steps[1]?.options[0]?.id ?? "",
    fun: course.steps[2]?.options[0]?.id ?? "",
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
  lines.push(`• ${t(hub.name, locale)}`);
  if (mid) lines.push(fill(t(COPY.fair, locale), { total: mid.totalMinutes, gap: mid.gapMinutes }));
  lines.push(`${t(COPY.tipMeet, locale)}: ${t(course.meetSpot, locale)}`);
  lines.push(`${t(COPY.tipDoor, locale)}: ${t(course.doorTipA, locale)} / ${t(course.doorTipB, locale)}`);
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
  const [picks, setPicks] = useState<Record<CourseStepId, string>>({ food: "", cafe: "", fun: "" });
  const [filters, setFilters] = useState<Record<"food" | "cafe", PlaceChip>>({ food: "all", cafe: "all" });
  const [liveCourse, setLiveCourse] = useState<StationCourse | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [detail, setDetail] = useState<{ stepId: CourseStepId; place: CoursePlace } | null>(null);

  const activeHub = mode === "meet" ? midpoints[activeMidIndex]?.station ?? null : dest;
  const baseCourse = useMemo(
    () => (activeHub ? clearStockImages(courseForStation(activeHub.name.ko)) : null),
    [activeHub],
  );
  const course = liveCourse ?? baseCourse;

  useEffect(() => {
    if (!activeHub || !baseCourse) {
      setLiveCourse(null);
      return;
    }
    let alive = true;
    setPlacesLoading(true);
    setLiveCourse(null);
    fetchMeetPlacePack(activeHub.center)
      .then((pack) => {
        if (!alive) return;
        const next = applyLivePlaces(baseCourse, pack);
        setLiveCourse(next);
        setPicks(defaultPicks(next));
        setFilters({ food: "all", cafe: "all" });
      })
      .catch(() => {
        if (!alive) return;
        setLiveCourse(null);
        setPicks(defaultPicks(baseCourse));
      })
      .finally(() => {
        if (alive) setPlacesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeHub?.key, baseCourse]);

  function applyCourseStation(station: StationOption) {
    const next = clearStockImages(courseForStation(station.name.ko));
    setPicks(defaultPicks(next));
    setFilters({ food: "all", cafe: "all" });
    setLiveCourse(null);
    setDetail(null);
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

  function togglePick(stepId: CourseStepId, placeId: string) {
    setPicks((prev) => ({
      ...prev,
      [stepId]: prev[stepId] === placeId ? "" : placeId,
    }));
  }

  async function onAlarm() {
    if (!activeHub) {
      showToast(t(mode === "meet" ? COPY.needStations : COPY.needDest, locale));
      return;
    }
    await armArrivalAlarm(activeHub, mode === "meet" ? startA : lastStation);
    showToast(t(COPY.alarmOn, locale));
  }

  async function onShare() {
    if (!activeHub || !course) {
      showToast(t(mode === "meet" ? COPY.needStations : COPY.needDest, locale));
      return;
    }
    const text = buildShareText(
      locale,
      activeHub,
      course,
      picks,
      mode === "meet" ? midpoints[activeMidIndex] ?? null : null,
    );
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* still toast */
    }
    showToast(t(COPY.copied, locale));
  }

  const detailSelected = detail ? picks[detail.stepId] === detail.place.id : false;

  return (
    <div className="flex min-h-dvh justify-center bg-frame">
      <div className="relative flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-app shadow-[0_0_40px_rgba(15,23,42,0.12)]">
        <style jsx global>{`
          .meet-no-affiliate a[href*="klook"],
          .meet-no-affiliate a[href*="travelpayouts"],
          .meet-no-affiliate a[href*="emrld"],
          .meet-no-affiliate a[href*="aviasales"],
          .meet-no-affiliate a[href*="hotellook"] {
            pointer-events: none !important;
            cursor: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
        `}</style>
        <AppHeader title={MEET_TITLE} icon={<MeetHeaderIcon />} />

        <div className="shrink-0 px-4 pb-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-amber-200 bg-[#FFFBEB] p-1">
            {(
              [
                ["course", COPY.tabCourse, CompassIcon],
                ["meet", COPY.tabMeet, HandshakeIcon],
              ] as const
            ).map(([id, label, Icon]) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-extrabold leading-snug transition ${
                    active
                      ? "bg-[#FEF3C7] text-[#78350F] shadow-sm ring-1 ring-amber-300"
                      : "text-[#92400E]/80"
                  }`}
                >
                  <Icon size={13} />
                  {t(label, locale)}
                </button>
              );
            })}
          </div>
        </div>

        <main ref={mainRef} className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          {mode === "course" ? (
            <section className="rounded-3xl border border-amber-200 bg-[#FFFBEB] p-4">
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
            <section className="rounded-3xl border border-amber-200 bg-[#FFFBEB] p-4">
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
                  className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[12px] font-bold text-[#78350F] active:scale-95"
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
                className="mt-3 w-full rounded-xl border border-amber-300 bg-[#FEF3C7] py-2.5 text-[14px] font-extrabold text-[#78350F] active:scale-[0.98]"
              >
                {midpoints.length ? t(COPY.update, locale) : t(COPY.find, locale)}
              </button>
            </section>
          )}

          {mode === "meet" && midpoints[activeMidIndex] ? (
            <section className="mt-4 rounded-3xl border border-amber-200 bg-white p-4 shadow-[0_1px_4px_rgba(120,53,15,0.04)]">
              <p className="text-[12px] font-bold text-[#78350F]">{t(COPY.best, locale)}</p>
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
                        ? "bg-[#FEF3C7] text-[#78350F] ring-1 ring-amber-300"
                        : "bg-[#FFFBEB] text-[#92400E] ring-1 ring-amber-200"
                    }`}
                  >
                    {index === 0 ? t(mid.station.name, locale) : fill(t(COPY.alt, locale), { n: index })}
                  </button>
                ))}
              </div>
              <h3 className="meet-no-affiliate mt-3 flex flex-wrap items-center gap-1.5 text-[17px] font-extrabold text-[#1F2937]">
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
              {course ? <TipBanner course={course} locale={locale} /> : null}
            </section>
          ) : null}

          {course && activeHub ? (
            <section className="mt-4 rounded-3xl border border-amber-200 bg-white p-4 shadow-[0_1px_4px_rgba(120,53,15,0.04)]">
              <div className="flex items-center gap-2 text-[#78350F]">
                <SparkleIcon size={16} />
                <h3 className="text-[15px] font-extrabold text-[#1F2937]">{t(COPY.courseTitle, locale)}</h3>
              </div>
              <p className="mt-0.5 text-[12px] text-neutral-500">{t(COPY.courseHint, locale)}</p>
              {placesLoading ? (
                <p className="mt-2 rounded-xl border border-amber-200 bg-[#FFFBEB] px-3 py-2 text-[11px] font-semibold text-[#92400E]">
                  {t(COPY.loadingPlaces, locale)}
                </p>
              ) : null}
              {mode === "course" ? <TipBanner course={course} locale={locale} /> : null}
              <CourseTimeline
                course={course}
                picks={picks}
                filters={filters}
                locale={locale}
                onTogglePick={(stepItem, placeId) => togglePick(stepItem.id, placeId)}
                onOpenDetail={(stepItem, place) => setDetail({ stepId: stepItem.id, place })}
                onFilter={(stepId, chip) => setFilters((prev) => ({ ...prev, [stepId]: chip }))}
              />

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void onAlarm()}
                  className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-[#FEF3C7] text-[12px] font-extrabold text-[#78350F] active:scale-[0.98]"
                >
                  <BellIcon size={14} />
                  {t(COPY.alarm, locale)}
                </button>
                <button
                  type="button"
                  onClick={() => void onShare()}
                  className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-[#FFFBEB] text-[12px] font-extrabold text-[#1F2937] active:scale-[0.98]"
                >
                  <CopyIcon size={14} />
                  {t(COPY.share, locale)}
                </button>
              </div>
            </section>
          ) : null}
        </main>

        <BottomNav active="meet" onReselect={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />
        <Toast message={toast} />

        {detail && activeHub ? (
          <MeetPlaceSheet
            place={detail.place}
            station={activeHub}
            selected={detailSelected}
            locale={locale}
            onClose={() => setDetail(null)}
            onToggleSelect={() => togglePick(detail.stepId, detail.place.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
