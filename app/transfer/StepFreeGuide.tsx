"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { lineColor } from "../kakao-places";
import { LineIcon } from "../_components/LineBadges";
import { t, type Locale, type Localized, type StationOption } from "../_lib/stations";
import { carDoorAt, type LevelKind, type StepFreeMap } from "../_lib/stepFree";

const COPY = {
  badge: {
    ko: "🟢 계단 0개 엘리베이터 최단 코스",
    en: "🟢 0 stairs · Shortest lift route",
    zh: "🟢 零台阶 · 电梯最短路线",
    ja: "🟢 階段0 · エレベーター最短ルート",
  },
  modeExit: { ko: "🚪 나갈 때", en: "🚪 Leaving", zh: "🚪 出站", ja: "🚪 出るとき" },
  modeBoard: { ko: "🚇 탈 때", en: "🚇 Boarding", zh: "🚇 乘车", ja: "🚇 乗るとき" },
  modeLabel: { ko: "이동 방향", en: "Trip", zh: "出行方向", ja: "移動の向き" },
  towardLabel: { ko: "열차 방향", en: "Train to", zh: "列车方向", ja: "列車の方向" },
  toward: { ko: "{dir} 방면", en: "{dir}", zh: "开往{dir}", ja: "{dir}方面" },
  stepAlight: { ko: "승강장 {car}번 내림", en: "Exit train at {car}", zh: "{car}号门下车", ja: "{car}番ドアで降車" },
  stepBoard: { ko: "승강장 {car}번 탑승", en: "Board at {car}", zh: "{car}号门上车", ja: "{car}番ドアで乗車" },
  stepLift: { ko: "E/V 탑승", en: "Take the lift", zh: "乘电梯", ja: "EVに乗る" },
  stepGate: { ko: "{floor} 개찰구", en: "{floor} gates", zh: "{floor} 检票口", ja: "{floor} 改札" },
  liftCount: {
    ko: "🛗 엘리베이터 {n}번 · 🪜 계단 0개",
    en: "🛗 {n} lift ride(s) · 🪜 0 stairs",
    zh: "🛗 电梯{n}次 · 🪜 0台阶",
    ja: "🛗 エレベーター{n}回 · 🪜 階段0",
  },
  levelAccess: {
    ko: "🪜 계단 0개 · 엘리베이터 없이 평지로 이동",
    en: "🪜 0 stairs · level access, no lift needed",
    zh: "🪜 0台阶 · 平地通行，无需电梯",
    ja: "🪜 階段0 · EVなしで段差なし",
  },
  carHint: {
    ko: "{dir} 방면 열차는 {car}번 문 앞이 엘리베이터와 가장 가까워요",
    en: "On trains to {dir}, door {car} is closest to the lift",
    zh: "开往{dir}的列车，{car}号门离电梯最近",
    ja: "{dir}方面の列車は{car}番ドアがエレベーターに一番近いです",
  },
  carHintGate: {
    ko: "{dir} 방면 열차는 {car}번 문 앞이 개찰구와 가장 가까워요",
    en: "On trains to {dir}, door {car} is closest to the gates",
    zh: "开往{dir}的列车，{car}号门离检票口最近",
    ja: "{dir}方面の列車は{car}番ドアが改札に一番近いです",
  },
  diagramTitle: {
    ko: "🗺️ 한눈에 보는 역 단면도",
    en: "🗺️ Station at a glance",
    zh: "🗺️ 车站剖面一览",
    ja: "🗺️ ひと目でわかる駅断面図",
  },
  legendLift: { ko: "엘리베이터", en: "Lift", zh: "电梯", ja: "エレベーター" },
  legendWalk: { ko: "걷는 길", en: "Walk", zh: "步行", ja: "徒歩" },
  legendCar: { ko: "내릴/탈 칸", en: "Your car", zh: "推荐车厢", ja: "おすすめ号車" },
  gate: { ko: "개찰구", en: "Gates", zh: "检票口", ja: "改札" },
  front: { ko: "{dir} 방면 · 1번 칸이 맨 앞", en: "To {dir} · car 1 at front", zh: "开往{dir} · 1号车厢在前", ja: "{dir}方面 · 1号車が先頭" },
  openMap: {
    ko: "🔍 원본 역사 안내도 크게보기",
    en: "🔍 View the original station map",
    zh: "🔍 查看原版车站导览图",
    ja: "🔍 元の駅案内図を拡大表示",
  },
  mapTitle: { ko: "{station} 역사 안내도", en: "{station} station map", zh: "{station} 车站导览图", ja: "{station} 駅案内図" },
  mapSource: {
    ko: "출처: 서울교통공사 역 이용 안내도",
    en: "Source: Seoul Metro station guide map",
    zh: "来源：首尔交通公社车站导览图",
    ja: "出典：ソウル交通公社 駅利用案内図",
  },
  zoomIn: { ko: "확대", en: "Zoom in", zh: "放大", ja: "拡大" },
  zoomOut: { ko: "축소", en: "Zoom out", zh: "缩小", ja: "縮小" },
  zoomHint: {
    ko: "두 번 탭하면 확대돼요 · 드래그해서 이동",
    en: "Double-tap to zoom · drag to move",
    zh: "双击放大 · 拖动查看",
    ja: "ダブルタップで拡大 · ドラッグで移動",
  },
  close: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる" },
  tipsTitle: { ko: "💡 알아두면 좋아요", en: "💡 Good to know", zh: "💡 小贴士", ja: "💡 知っておくと便利" },
  disclaimer: {
    ko: "베타: 서울교통공사 안내도를 요약한 추정 동선이에요. 칸 번호는 1칸 정도 차이 날 수 있어요. 엘리베이터 점검 여부는 '시설 상태' 탭에서 확인하세요.",
    en: "Beta: estimated from Seoul Metro station maps; car numbers may be off by about one car. Check the Facilities tab for lift outages.",
    zh: "测试版：根据首尔交通公社导览图推算，车厢号可能相差约1节。电梯检修情况请查看“设施状态”。",
    ja: "ベータ版：ソウル交通公社の案内図から推定したルートです。号車は1両ほどずれる場合があります。EVの点検状況は「設備状況」タブで確認してください。",
  },
} satisfies Record<string, Localized>;

const LEVEL_LABEL: Record<LevelKind, Localized> = {
  street: { ko: "지상 · 출구", en: "Street · Exits", zh: "地面 · 出口", ja: "地上 · 出口" },
  concourse: { ko: "대합실 · 개찰구", en: "Concourse · Gates", zh: "大厅 · 检票口", ja: "コンコース · 改札" },
  platform: { ko: "승강장", en: "Platform", zh: "站台", ja: "ホーム" },
  passage: { ko: "통로", en: "Passage", zh: "通道", ja: "通路" },
};

const ROW_HEIGHT: Record<LevelKind, number> = { street: 66, concourse: 66, platform: 84, passage: 44 };
const ROW_GAP = 18;
const TRACK_MIN = 0.1;
const TRACK_MAX = 0.9;
const MARKER_GAP = 0.15;

type Mode = "exit" | "board";

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function trackX(fraction: number) {
  return TRACK_MIN + fraction * (TRACK_MAX - TRACK_MIN);
}

function awayFrom(x: number, taken: number, direction: number) {
  return Math.abs(x - taken) < MARKER_GAP ? taken + direction * MARKER_GAP : x;
}

/**
 * Schematic x positions. The platform lift stays true to scale so it lines up with the car strip;
 * the gate and exit markers are nudged sideways so they never overlap on the concourse row.
 */
function markerPositions(map: StepFreeMap) {
  const lift = trackX(map.platformEv);
  const side = (value: number, from: number) => (value >= from ? 1 : -1);
  const gate = awayFrom(trackX(map.gate), lift, side(map.gate, map.platformEv));
  const exit =
    map.exitEv === map.platformEv
      ? lift
      : awayFrom(
          awayFrom(trackX(map.exitEv), lift, side(map.exitEv, map.platformEv)),
          gate,
          side(map.exitEv, map.gate),
        );
  const clamp = (x: number) => Math.min(Math.max(x, 0.06), 0.94);
  return { lift, gate: clamp(gate), exit: clamp(exit) };
}

type StepId = "car" | "lift" | "gate" | "exit";

/** Route order when leaving the station; boarding walks it backwards. */
function routeSteps(map: StepFreeMap, mode: Mode): StepId[] {
  const steps: StepId[] = map.platformLevel === map.gateLevel ? ["car", "gate", "exit"] : ["car", "lift", "gate", "exit"];
  return mode === "exit" ? steps : steps.reverse();
}

/** The platform row needs extra room when gate or exit labels sit above the car strip. */
function platformHasLabels(map: StepFreeMap) {
  return map.gateLevel === map.platformLevel || map.exitLevel === map.platformLevel;
}

function rowLayout(map: StepFreeMap) {
  const labeled = platformHasLabels(map);
  let top = 0;
  return map.levels.map((level) => {
    const height = level.kind === "platform" && labeled ? ROW_HEIGHT.platform + 22 : ROW_HEIGHT[level.kind];
    const row = { top, height, anchor: top + (level.kind === "platform" ? 22 : height / 2) };
    top += height + ROW_GAP;
    return row;
  });
}

function labelAlign(x: number) {
  if (x < 0.22) return "left-0 -translate-x-3 text-left";
  if (x > 0.78) return "right-0 translate-x-3 text-right";
  return "left-1/2 -translate-x-1/2 text-center";
}

function StepBubble({ n }: { n: number }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-extrabold text-white ring-2 ring-white">
      {n}
    </span>
  );
}

function Marker({
  x,
  y,
  icon,
  label,
  step,
  tone,
}: {
  x: number;
  y: number;
  icon: string;
  label?: string;
  step?: number;
  tone: "lift" | "gate" | "door";
}) {
  const toneClass =
    tone === "lift"
      ? "bg-honey text-white ring-[#fff3cf]"
      : tone === "gate"
        ? "bg-[#2563eb] text-white ring-[#dbeafe]"
        : "bg-white text-ink ring-honey";
  return (
    <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x * 100}%`, top: y }}>
      <span
        className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[14px] shadow-[0_2px_6px_rgba(15,23,42,0.18)] ring-[3px] ${toneClass}`}
        aria-hidden
      >
        {icon}
        {step ? <StepBubble n={step} /> : null}
      </span>
      {label ? (
        <span
          className={`absolute top-[calc(100%+3px)] whitespace-nowrap rounded-md bg-white/95 px-1.5 py-px text-[10.5px] font-extrabold text-ink shadow-[0_1px_3px_rgba(15,23,42,0.12)] ${labelAlign(x)}`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function StationSection({
  map,
  locale,
  mode,
  towardFirst,
  car,
  door,
}: {
  map: StepFreeMap;
  locale: Locale;
  mode: Mode;
  towardFirst: boolean;
  car: number;
  door: number;
}) {
  const rows = rowLayout(map);
  const last = rows[rows.length - 1];
  const height = last ? last.top + last.height : 0;
  const x = markerPositions(map);
  const color = lineColor([map.line]);
  const lifts = [
    map.platformLevel !== map.gateLevel ? { x: x.lift, from: map.platformLevel, to: map.gateLevel } : null,
    map.exitLevel !== map.gateLevel ? { x: x.exit, from: map.gateLevel, to: map.exitLevel } : null,
  ].filter((lift) => lift !== null);
  const walkFrom = Math.min(x.gate, x.exit, x.lift);
  const walkTo = Math.max(x.gate, x.exit, x.lift);
  const steps = routeSteps(map, mode);
  const stepOf = (id: StepId) => steps.indexOf(id) + 1;
  const exitOnGateRow = map.exitLevel === map.gateLevel;
  const ends = map.ends.map((end) => t(end, locale));
  const platformRow = rows[map.platformLevel];
  const stripTop = platformRow ? platformRow.top + (platformHasLabels(map) ? 64 : 42) : 0;

  return (
    <div className="flex gap-2">
      <div className="relative w-[58px] shrink-0" style={{ height }}>
        {map.levels.map((level, index) => {
          const row = rows[index];
          if (!row) return null;
          return (
            <div
              key={index}
              className="absolute inset-x-0 flex flex-col justify-center"
              style={{ top: row.top, height: row.height }}
            >
              <span
                className={`w-fit rounded-md px-1.5 py-0.5 text-[13px] font-black leading-none ${
                  level.kind === "platform" ? "text-white" : "bg-ink text-white"
                }`}
                style={level.kind === "platform" ? { backgroundColor: color } : undefined}
              >
                {level.floor}
              </span>
              <span className="mt-1 text-[10.5px] font-bold leading-tight text-ink-muted">
                {t(level.label ?? LEVEL_LABEL[level.kind], locale)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative min-w-0 flex-1" style={{ height }}>
        {map.levels.map((level, index) => {
          const row = rows[index];
          if (!row) return null;
          const tint =
            level.kind === "platform"
              ? { backgroundColor: `${color}12`, borderColor: `${color}40` }
              : undefined;
          return (
            <div
              key={index}
              className={`absolute inset-x-0 rounded-xl border ${
                level.kind === "street"
                  ? "border-[#bfe3fb] bg-gradient-to-b from-[#eef8ff] to-[#dff1fd]"
                  : level.kind === "concourse"
                    ? "border-line bg-surface-muted"
                    : level.kind === "passage"
                      ? "border-dashed border-neutral-300 bg-white"
                      : ""
              }`}
              style={{ top: row.top, height: row.height, ...tint }}
            >
              {level.kind === "passage" ? (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-ink-muted">
                  ↔ {t(level.label ?? LEVEL_LABEL.passage, locale)}
                </span>
              ) : null}
            </div>
          );
        })}

        {lifts.map((lift) => {
          const a = rows[Math.min(lift.from, lift.to)];
          const b = rows[Math.max(lift.from, lift.to)];
          if (!a || !b) return null;
          return (
            <span
              key={`${lift.from}-${lift.to}`}
              className="absolute z-10 w-[7px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#ffcf5c] via-honey to-honey-strong shadow-[0_0_0_3px_rgba(245,167,0,0.18)]"
              style={{ left: `${lift.x * 100}%`, top: a.anchor, height: b.anchor - a.anchor }}
              aria-hidden
            />
          );
        })}

        {rows[map.gateLevel] ? (
          <span
            className="absolute z-10 h-0 -translate-y-1/2 border-t-[3px] border-dashed border-[#2563eb]"
            style={{
              top: rows[map.gateLevel]?.anchor,
              left: `${walkFrom * 100}%`,
              width: `${(walkTo - walkFrom) * 100}%`,
            }}
            aria-hidden
          />
        ) : null}

        {map.platformLevel !== map.gateLevel ? (
          <>
            <Marker x={x.lift} y={rows[map.platformLevel]?.anchor ?? 0} icon="🛗" tone="lift" step={stepOf("lift")} />
            <Marker x={x.lift} y={rows[map.gateLevel]?.anchor ?? 0} icon="🛗" tone="lift" />
          </>
        ) : null}
        <Marker
          x={x.gate}
          y={rows[map.gateLevel]?.anchor ?? 0}
          icon="🎫"
          tone="gate"
          label={t(COPY.gate, locale)}
          step={stepOf("gate")}
        />
        {exitOnGateRow ? (
          <Marker
            x={x.exit}
            y={rows[map.gateLevel]?.anchor ?? 0}
            icon="🚪"
            tone="door"
            label={t(map.exit, locale)}
            step={stepOf("exit")}
          />
        ) : (
          <>
            <Marker x={x.exit} y={rows[map.gateLevel]?.anchor ?? 0} icon="🛗" tone="lift" />
            <Marker
              x={x.exit}
              y={rows[map.exitLevel]?.anchor ?? 0}
              icon="🚪"
              tone="door"
              label={t(map.exit, locale)}
              step={stepOf("exit")}
            />
          </>
        )}

        {platformRow ? (
          <PlatformStrip
            top={stripTop}
            liftY={platformRow.anchor}
            cars={map.cars}
            car={car}
            door={door}
            towardFirst={towardFirst}
            liftX={x.lift}
            color={color}
            step={stepOf("car")}
            caption={fill(t(COPY.front, locale), { dir: ends[towardFirst ? 0 : 1] ?? "" })}
          />
        ) : null}
      </div>
    </div>
  );
}

function PlatformStrip({
  top,
  liftY,
  cars,
  car,
  door,
  towardFirst,
  liftX,
  color,
  step,
  caption,
}: {
  top: number;
  liftY: number;
  cars: number;
  car: number;
  door: number;
  towardFirst: boolean;
  liftX: number;
  color: string;
  step: number;
  caption: string;
}) {
  const width = (TRACK_MAX - TRACK_MIN) / cars;
  const numbers = Array.from({ length: cars }, (_, index) => (towardFirst ? index + 1 : cars - index));
  return (
    <>
      <span
        className="absolute z-0 w-0 -translate-x-1/2 border-l-2 border-dotted border-honey"
        style={{ left: `${liftX * 100}%`, top: liftY, height: top - liftY }}
        aria-hidden
      />
      <div
        className="absolute flex h-[16px] overflow-hidden rounded-[5px]"
        style={{ top, left: `${TRACK_MIN * 100}%`, width: `${(TRACK_MAX - TRACK_MIN) * 100}%` }}
        aria-hidden
      >
        {numbers.map((number) => (
          <span
            key={number}
            className={`flex flex-1 items-center justify-center border-r border-white text-[9px] font-extrabold last:border-r-0 ${
              number === car ? "text-white" : "text-white/85"
            }`}
            style={{ backgroundColor: number === car ? "var(--honey)" : `${color}b3` }}
          >
            {number === car ? `${car}-${door}` : number}
          </span>
        ))}
      </div>
      <span
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${(TRACK_MIN + (towardFirst ? car : cars - car + 1) * width) * 100}%`, top: top - 4 }}
        aria-hidden
      >
        <span className="relative block h-0 w-0">
          <StepBubble n={step} />
        </span>
      </span>
      <span
        className={`absolute whitespace-nowrap text-[10px] font-bold text-ink-muted ${towardFirst ? "left-2" : "right-2"}`}
        style={{ top: top + 20 }}
      >
        {towardFirst ? `◀ ${caption}` : `${caption} ▶`}
      </span>
    </>
  );
}

function FlowNode({ icon, text, step, accent }: { icon: string; text: string; step: number; accent?: boolean }) {
  return (
    <li
      className={`relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 pb-2 pt-2.5 text-center ${
        accent ? "bg-honey-soft ring-1 ring-honey/60" : "bg-surface-muted"
      }`}
    >
      <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-extrabold text-white">
        {step}
      </span>
      <span className="text-[22px] leading-none" aria-hidden>
        {icon}
      </span>
      <span className="text-[11.5px] font-extrabold leading-tight text-ink [word-break:keep-all]">{text}</span>
    </li>
  );
}

function FlowArrow() {
  return (
    <li className="flex items-center justify-center text-[13px] font-black text-honey" aria-hidden>
      ➔
    </li>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`min-w-0 break-words rounded-lg px-2 py-2 text-[13px] font-extrabold leading-tight transition active:scale-[0.97] ${
              active ? "bg-white text-ink shadow-[0_1px_4px_rgba(15,23,42,0.12)]" : "text-ink-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-neutral-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

const ZOOMS = [1, 1.6, 2.4, 3.2] as const;

function MapModal({ map, title, locale, onClose }: { map: StepFreeMap; title: string; locale: Locale; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOMS[zoomIndex] ?? 1;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function zoomTo(next: number, focus?: { x: number; y: number }) {
    const scroller = scrollRef.current;
    const clamped = Math.min(Math.max(next, 0), ZOOMS.length - 1);
    if (!scroller || clamped === zoomIndex) return;
    const ratio = (ZOOMS[clamped] ?? 1) / zoom;
    const rect = scroller.getBoundingClientRect();
    const fx = focus ? focus.x - rect.left : rect.width / 2;
    const fy = focus ? focus.y - rect.top : rect.height / 2;
    const left = (scroller.scrollLeft + fx) * ratio - fx;
    const top = (scroller.scrollTop + fy) * ratio - fy;
    setZoomIndex(clamped);
    requestAnimationFrame(() => scroller.scrollTo({ left, top }));
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-center">
      <button
        type="button"
        aria-label={t(COPY.close, locale)}
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-black/75"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-dvh w-full max-w-[393px] animate-[fade-in_200ms_ease-out] flex-col bg-[#111827] text-white"
      >
        <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
          <LineIcon line={map.line} locale={locale} size="sm" />
          <h2 id={titleId} className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-snug">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-bold transition active:scale-95"
          >
            ✕ {t(COPY.close, locale)}
          </button>
        </header>
        <div
          ref={scrollRef}
          className="no-scrollbar min-h-0 flex-1 overflow-auto overscroll-contain"
          onDoubleClick={(event) =>
            zoomTo(zoomIndex === ZOOMS.length - 1 ? 0 : zoomIndex + 1, { x: event.clientX, y: event.clientY })
          }
        >
          <div className="flex min-h-full items-center" style={{ width: `${zoom * 100}%` }}>
            <Image
              src={map.image}
              alt={title}
              width={1024}
              height={1024}
              unoptimized
              draggable={false}
              className="h-auto w-full select-none bg-white"
            />
          </div>
        </div>
        <footer className="shrink-0 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => zoomTo(zoomIndex - 1)}
              disabled={zoomIndex === 0}
              aria-label={t(COPY.zoomOut, locale)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[20px] font-bold transition active:scale-95 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-14 text-center text-[13px] font-bold tabular-nums" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomTo(zoomIndex + 1)}
              disabled={zoomIndex === ZOOMS.length - 1}
              aria-label={t(COPY.zoomIn, locale)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-honey text-[20px] font-bold text-white transition active:scale-95 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/60">
            {t(COPY.zoomHint, locale)} · {t(COPY.mapSource, locale)}
          </p>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export default function StepFreeGuide({
  map,
  station,
  locale,
}: {
  map: StepFreeMap;
  station: StationOption;
  locale: Locale;
}) {
  const [mode, setMode] = useState<Mode>("exit");
  const [toward, setToward] = useState<0 | 1>(0);
  const [mapOpen, setMapOpen] = useState(false);

  const towardFirst = toward === 0;
  const { car, door } = carDoorAt(map.platformEv, towardFirst, map.cars);
  const carDoor = `${car}-${door}`;
  const gateFloor = map.levels[map.gateLevel]?.floor ?? "";
  const ends = map.ends.map((end) => t(end, locale));
  const liftRides = (map.platformLevel !== map.gateLevel ? 1 : 0) + (map.exitLevel !== map.gateLevel ? 1 : 0);

  const nodes: Record<StepId, FlowItem> = {
    car: {
      icon: "🚇",
      text: fill(t(mode === "exit" ? COPY.stepAlight : COPY.stepBoard, locale), { car: carDoor }),
      accent: true,
    },
    lift: { icon: "🛗", text: t(COPY.stepLift, locale) },
    gate: { icon: "🎫", text: fill(t(COPY.stepGate, locale), { floor: gateFloor }) },
    exit: { icon: "🚪", text: t(map.exit, locale) },
  };
  const flow = routeSteps(map, mode).map((id) => ({ id, ...nodes[id] }));
  const flowColumns = flow.map(() => "minmax(0,1fr)").join(" auto ");

  const mapTitle = fill(t(COPY.mapTitle, locale), { station: t(station.name, locale) });

  return (
    <>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-[#fff8e1] via-white to-[#eef4ff] px-4 pb-4 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#e7f8ee] px-2.5 py-1 text-[12px] font-extrabold text-[#15803d] ring-1 ring-[#bbf7d0]">
              {t(COPY.badge, locale)}
            </span>
            <LineIcon line={map.line} locale={locale} size="sm" />
          </div>

          <div className="mt-3">
            <Segmented
              label={t(COPY.modeLabel, locale)}
              value={mode}
              onChange={setMode}
              options={[
                { value: "exit", label: t(COPY.modeExit, locale) },
                { value: "board", label: t(COPY.modeBoard, locale) },
              ]}
            />
          </div>

          <ol
            className="mt-3 grid gap-1"
            style={{ gridTemplateColumns: flowColumns }}
            aria-label={t(COPY.badge, locale)}
          >
            {flow.map((node, index) => (
              <FlowStep key={node.id} index={index} node={node} />
            ))}
          </ol>

          <p className="mt-2.5 text-center text-[11.5px] font-bold text-ink-muted">
            {liftRides > 0 ? fill(t(COPY.liftCount, locale), { n: liftRides }) : t(COPY.levelAccess, locale)}
          </p>

          <div className="mt-3 rounded-xl bg-white/80 p-2.5 ring-1 ring-line">
            <p className="mb-1.5 text-[11px] font-extrabold text-ink-muted">🚆 {t(COPY.towardLabel, locale)}</p>
            <Segmented
              label={t(COPY.towardLabel, locale)}
              value={toward}
              onChange={setToward}
              options={[
                { value: 0, label: `◀ ${fill(t(COPY.toward, locale), { dir: ends[0] ?? "" })}` },
                { value: 1, label: `${fill(t(COPY.toward, locale), { dir: ends[1] ?? "" })} ▶` },
              ]}
            />
            <p className="mt-2 text-[12.5px] font-bold leading-snug text-ink">
              💡{" "}
              {fill(t(map.platformLevel === map.gateLevel ? COPY.carHintGate : COPY.carHint, locale), {
                dir: ends[toward] ?? "",
                car: carDoor,
              })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-[14px] font-extrabold text-ink">{t(COPY.diagramTitle, locale)}</h3>
          <div className="flex shrink-0 items-center gap-2 text-[10.5px] font-bold text-ink-muted" aria-hidden>
            <span className="flex items-center gap-1">
              <span className="h-3 w-[5px] rounded-full bg-honey" />
              {t(COPY.legendLift, locale)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-t-2 border-dashed border-[#2563eb]" />
              {t(COPY.legendWalk, locale)}
            </span>
          </div>
        </div>

        <StationSection map={map} locale={locale} mode={mode} towardFirst={towardFirst} car={car} door={door} />

        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-muted px-4 py-3 text-[13.5px] font-extrabold text-ink transition active:scale-[0.98]"
        >
          {t(COPY.openMap, locale)}
        </button>
        <p className="mt-1.5 text-center text-[10.5px] text-ink-muted">{t(COPY.mapSource, locale)}</p>
      </Card>

      {map.notes.length > 0 ? (
        <Card className="px-4 py-3.5">
          <h3 className="text-[14px] font-extrabold text-ink">{t(COPY.tipsTitle, locale)}</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {map.notes.map((note) => (
              <li key={note.text.ko} className="flex gap-2 text-[12.5px] leading-relaxed text-ink">
                <span className="shrink-0" aria-hidden>
                  {note.icon}
                </span>
                <span className="min-w-0">{t(note.text, locale)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <p className="text-[11px] leading-relaxed text-neutral-400">{t(COPY.disclaimer, locale)}</p>

      {mapOpen ? <MapModal map={map} title={mapTitle} locale={locale} onClose={() => setMapOpen(false)} /> : null}
    </>
  );
}

type FlowItem = { icon: string; text: string; accent?: boolean };

function FlowStep({ index, node }: { index: number; node: FlowItem }) {
  return (
    <>
      {index > 0 ? <FlowArrow /> : null}
      <FlowNode icon={node.icon} text={node.text} step={index + 1} accent={node.accent} />
    </>
  );
}
