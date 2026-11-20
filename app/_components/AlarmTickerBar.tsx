"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  cancelArrivalAlarm,
  setAlarmMuteVoice,
  useAlarmProgress,
  useArrivalAlarm,
} from "../_lib/arrivalAlarm";
import { bareStationName, restroomText, restroomTip } from "../_lib/arrivalTips";
import { useLocale } from "../_lib/locale";
import {
  currentAlarmLeg,
  currentTransferOrdinal,
  etaSecondsOnLeg,
  finalAlarmStation,
  remainingStopsOnLeg,
  routeProgressRatio,
  transferLegCount,
  type AlarmLeg,
} from "../_lib/multiLegAlarm";
import { restoreStation, stationName, t, type Localized } from "../_lib/stations";
import {
  BellIcon,
  ChevronDownIcon,
  DoorIcon,
  ElevatorIcon,
  FlagIcon,
  MuteIcon,
  RestroomIcon,
  SpeakerIcon,
  TransferIcon,
  WalkIcon,
} from "./icons";

const COPY = {
  transferring: {
    ko: "{station} 환승 중 · {line}({toward}) 승강장으로 이동하세요",
    en: "Transferring at {station} · walk to {line} ({toward})",
    zh: "{station}换乘中 · 请前往{line}（{toward}）站台",
    ja: "{station}乗換中 · {line}（{toward}）ホームへ",
  },
  towardFallback: { ko: "다음 방면", en: "next direction", zh: "下一方向", ja: "次方面" },
  wrongWay: {
    ko: "주의! 반대 방향입니다 · 다음 역에서 갈아타세요",
    en: "Wrong direction · change at the next stop",
    zh: "注意！反方向 · 请在下一站换乘",
    ja: "注意！逆方向 · 次駅で乗換えて",
  },
  missed: {
    ko: "환승역을 지나쳤습니다 · 다음 역에서 내려 반대편 열차를 이용하세요",
    en: "Passed the transfer · get off next and take the opposite train",
    zh: "已错过换乘站 · 请在下一站下车并乘坐对向列车",
    ja: "乗換駅を過ぎました · 次駅で降りて反対方面へ",
  },
  arrived: {
    ko: "{station} 도착 · 알림을 확인해 주세요",
    en: "Arrived at {station}",
    zh: "已到达{station}",
    ja: "{station}に到着",
  },
  transferLeg: {
    ko: "[환승 {n}/{total}] {station}까지 {stops}정거장 (약 {min}분)",
    en: "[Transfer {n}/{total}] {stops} stops to {station} (~{min} min)",
    zh: "[换乘 {n}/{total}] 距{station}还有{stops}站（约{min}分）",
    ja: "[乗換 {n}/{total}] {station}まで{stops}駅（約{min}分）",
  },
  finalLeg: {
    ko: "[최종 도착] {station}까지 {stops}정거장 (약 {min}분)",
    en: "[Final] {stops} stops to {station} (~{min} min)",
    zh: "[终点] 距{station}还有{stops}站（约{min}分）",
    ja: "[最終到着] {station}まで{stops}駅（約{min}分）",
  },
  fastTransfer: { ko: "빠른 환승", en: "Fast transfer", zh: "快速换乘", ja: "快速乗換" },
  finalDest: { ko: "최종 목적지", en: "Final destination", zh: "最终目的地", ja: "最終目的地" },
  totalEta: { ko: "총 약 {min}분", en: "total ~{min} min", zh: "全程约{min}分", ja: "合計約{min}分" },
  restroom: { ko: "화장실", en: "Restroom", zh: "洗手间", ja: "トイレ" },
  tipLabel: { ko: "추천 출구/엘리베이터", en: "Exit / elevator", zh: "出口/电梯", ja: "出口/エレベーター" },
  gateUnknown: { ko: "개찰구 안·밖 확인", en: "check near gates", zh: "请查看检票口附近", ja: "改札付近を確認" },
  tipDefault: {
    ko: "내릴 준비 · 두고 내리는 물건 확인",
    en: "Get ready · check your belongings",
    zh: "准备下车 · 请确认随身物品",
    ja: "降りる準備 · 忘れ物確認",
  },
  muteOn: { ko: "음성", en: "Voice", zh: "语音", ja: "音声" },
  muteOff: { ko: "음소거", en: "Mute", zh: "静音", ja: "消音" },
  cancel: { ko: "끄기", en: "Off", zh: "关闭", ja: "オフ" },
  timeline: { ko: "경로 요약", en: "Route summary", zh: "路线摘要", ja: "経路サマリー" },
  depart: { ko: "출발", en: "Depart", zh: "出发", ja: "出発" },
  transfer: { ko: "환승", en: "Transfer", zh: "换乘", ja: "乗換" },
  arrive: { ko: "도착", en: "Arrive", zh: "到达", ja: "到着" },
  expand: { ko: "경로 펼치기", en: "Expand route", zh: "展开路线", ja: "経路を開く" },
  collapse: { ko: "경로 접기", en: "Collapse route", zh: "收起路线", ja: "経路を閉じる" },
} satisfies Record<string, Localized>;

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function Dot() {
  return <span className="mx-2.5 opacity-40">•</span>;
}

function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span className="inline-flex shrink-0 opacity-90">{icon}</span>
      <span>{children}</span>
    </span>
  );
}

function stationLabel(saved: AlarmLeg["station"] | null | undefined, locale: ReturnType<typeof useLocale>) {
  if (!saved) return "";
  return t(restoreStation(saved).name, locale);
}

function nameFromKo(ko: string, locale: ReturnType<typeof useLocale>) {
  return t(stationName(ko.endsWith("역") ? ko : `${bareStationName(ko)}역`), locale);
}

/** JS marquee — reliable in WebView / Capacitor where CSS animation can fail or reset. */
function MarqueeText({ children, paused }: { children: ReactNode; paused?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(Boolean(paused));

  useEffect(() => {
    pausedRef.current = Boolean(paused);
  }, [paused]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    let offset = 0;
    const speed = 42;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      if (!pausedRef.current) {
        const loop = Math.max(1, track.scrollWidth / 2);
        offset = (offset + speed * dt) % loop;
        track.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ksub-marquee-viewport relative flex min-w-0 flex-1 items-center overflow-hidden">
      <div
        ref={trackRef}
        className="ksub-marquee-track flex w-max shrink-0 items-center text-[13px] font-semibold leading-9 text-inherit"
      >
        <span className="inline-flex shrink-0 items-center whitespace-nowrap pr-12">{children}</span>
        <span className="inline-flex shrink-0 items-center whitespace-nowrap pr-12" aria-hidden="true">
          {children}
        </span>
      </div>
    </div>
  );
}

function MiniTimeline({
  legs,
  legIndex,
  locale,
}: {
  legs: AlarmLeg[];
  legIndex: number;
  locale: ReturnType<typeof useLocale>;
}) {
  if (!legs.length) return null;
  const origin = legs[0]?.stations[0];
  const final = finalAlarmStation(legs);
  const finalStation = final ? restoreStation(final) : null;
  const toilet = finalStation ? restroomTip(finalStation, legs.at(-1)?.line ?? null) : null;
  const gate =
    toilet?.gate === "inside"
      ? locale === "ko"
        ? "개찰구 안"
        : "inside gate"
      : toilet?.gate === "outside"
        ? locale === "ko"
          ? "개찰구 밖"
          : "outside gate"
        : null;

  const rows: { key: string; active: boolean; done: boolean; icon: ReactNode; title: string; detail: string | null }[] =
    [];

  if (origin) {
    rows.push({
      key: "origin",
      active: legIndex === 0,
      done: legIndex > 0,
      icon: <FlagIcon size={13} />,
      title: `${t(COPY.depart, locale)} ${nameFromKo(origin, locale)}`,
      detail: legs[0]?.line ?? null,
    });
  }

  legs.forEach((leg, index) => {
    if (leg.kind === "transfer") {
      rows.push({
        key: `xfer-${index}`,
        active: index === legIndex,
        done: index < legIndex,
        icon: <TransferIcon size={13} />,
        title: `${t(COPY.transfer, locale)} ${stationLabel(leg.station, locale)}`,
        detail: leg.transferTip,
      });
    } else {
      rows.push({
        key: `arrive-${index}`,
        active: index === legIndex,
        done: index < legIndex,
        icon: <FlagIcon size={13} />,
        title: `${t(COPY.arrive, locale)} ${stationLabel(leg.station, locale)}`,
        detail: gate ? `${t(COPY.restroom, locale)} ${gate}` : leg.elevatorTip,
      });
    }
  });

  return (
    <div className="border-t border-amber-200/80 bg-[#FFFBEB] px-3 py-2.5 text-[#78350F] shadow-[0_8px_20px_rgba(120,53,15,0.08)]">
      <p className="mb-2 text-[11px] font-extrabold tracking-tight text-[#92400E]">{t(COPY.timeline, locale)}</p>
      <ol className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className={`flex items-start gap-2 rounded-xl px-2 py-1.5 text-[12px] ${
              row.active ? "bg-amber-200/70 font-bold" : row.done ? "opacity-55" : "font-semibold"
            }`}
          >
            <span className="mt-0.5 inline-flex shrink-0 text-[#B45309]">{row.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block leading-snug">{row.title}</span>
              {row.detail ? <span className="mt-0.5 block text-[11px] font-medium opacity-75">{row.detail}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Slim in-flow smart navigation ticker under AppHeader. */
export default function AlarmTickerBar() {
  const alarm = useArrivalAlarm();
  const progress = useAlarmProgress();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [alarm?.armedAt, alarm?.legIndex]);

  if (!alarm) return null;

  const leg = currentAlarmLeg(alarm.legs, alarm.legIndex);
  const final = finalAlarmStation(alarm.legs);
  const finalStation = restoreStation(final ?? alarm.station);
  const finalName = t(finalStation.name, locale);
  const at = progress.atStation ?? (alarm.from ? bareStationName(alarm.from) : null);
  const legStops = leg ? remainingStopsOnLeg(leg, at) : Math.max(progress.remainingStops, 0);
  const legMinutes = Math.max(1, Math.round(((leg ? etaSecondsOnLeg(leg, at) : progress.etaSeconds) || 60) / 60));
  const tripMinutes = Math.max(1, Math.round((progress.etaSeconds || 60) / 60));
  const transfers = transferLegCount(alarm.legs);
  const transferN = currentTransferOrdinal(alarm.legs, alarm.legIndex);
  const ratio = routeProgressRatio(alarm.legs, alarm.legIndex, at);
  const warning = alarm.stage === "wrong_way" || alarm.stage === "missed_transfer";
  const targetName = leg ? stationLabel(leg.station, locale) : finalName;
  const toilet = restroomTip(finalStation, leg?.line ?? alarm.line);
  const gate = toilet ? restroomText(finalStation, toilet, locale) : t(COPY.gateUnknown, locale);
  const toward =
    leg?.nextToward != null
      ? nameFromKo(leg.nextToward, locale)
      : t(COPY.towardFallback, locale);

  let content: ReactNode;
  if (alarm.stage === "missed_transfer") {
    content = (
      <Label icon={<TransferIcon size={13} />}>{t(COPY.missed, locale)}</Label>
    );
  } else if (alarm.stage === "wrong_way") {
    content = t(COPY.wrongWay, locale);
  } else if (alarm.stage === "arrived") {
    content = fill(t(COPY.arrived, locale), { station: finalName });
  } else if (alarm.stage === "transferring") {
    content = (
      <Label icon={<WalkIcon size={13} />}>
        {fill(t(COPY.transferring, locale), {
          station: targetName,
          line: leg?.nextLine ?? "",
          toward,
        })}
      </Label>
    );
  } else if (leg?.kind === "transfer" && transfers > 0) {
    content = (
      <>
        <Label icon={<TransferIcon size={13} />}>
          {fill(t(COPY.transferLeg, locale), {
            n: transferN,
            total: transfers,
            station: targetName,
            stops: legStops,
            min: legMinutes,
          })}
        </Label>
        <Dot />
        <Label icon={<DoorIcon size={13} />}>
          {t(COPY.fastTransfer, locale)}: {leg.transferTip ?? t(COPY.tipDefault, locale)}
        </Label>
        <Dot />
        <Label icon={<FlagIcon size={13} />}>
          {t(COPY.finalDest, locale)}: {finalName} ({fill(t(COPY.totalEta, locale), { min: tripMinutes })})
        </Label>
      </>
    );
  } else {
    content = (
      <>
        <Label icon={<FlagIcon size={13} />}>
          {fill(t(COPY.finalLeg, locale), { station: finalName, stops: legStops, min: legMinutes })}
        </Label>
        <Dot />
        <Label icon={<RestroomIcon size={13} />}>
          {t(COPY.restroom, locale)}: {gate}
        </Label>
        <Dot />
        <Label icon={<ElevatorIcon size={13} />}>
          {t(COPY.tipLabel, locale)}: {leg?.elevatorTip ?? t(COPY.tipDefault, locale)}
        </Label>
      </>
    );
  }

  const shell = warning
    ? "border-red-200 bg-[#FEE2E2] text-red-900"
    : "border-amber-200 bg-[#FEF9C3] text-[#78350F]";

  return (
    <div className="relative z-30 w-full">
      <div role="status" aria-live="polite" className={`relative w-full border-b ${shell}`}>
        <div className="flex h-9 w-full items-center gap-1 px-1.5">
          <span className={`shrink-0 ${warning ? "text-red-600" : "text-[#B45309]"}`} aria-hidden>
            <BellIcon size={14} />
          </span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t(COPY.collapse, locale) : t(COPY.expand, locale)}
            className="flex min-w-0 flex-1 items-center gap-0.5 text-left"
            onPointerEnter={() => setHold(true)}
            onPointerLeave={() => setHold(false)}
            onPointerDown={() => setHold(true)}
            onPointerUp={() => setHold(false)}
            onPointerCancel={() => setHold(false)}
          >
            <MarqueeText paused={hold || open}>{content}</MarqueeText>
            <span className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
              <ChevronDownIcon size={14} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAlarmMuteVoice(!alarm.muteVoice)}
            aria-pressed={alarm.muteVoice}
            aria-label={alarm.muteVoice ? t(COPY.muteOff, locale) : t(COPY.muteOn, locale)}
            className="shrink-0 rounded-md px-1.5 py-1 text-inherit transition active:scale-95"
          >
            {alarm.muteVoice ? <MuteIcon size={14} /> : <SpeakerIcon size={14} />}
          </button>
          <button
            type="button"
            onClick={cancelArrivalAlarm}
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold transition active:scale-95 ${
              warning ? "bg-red-200/90 text-red-900" : "bg-amber-200/80 text-[#78350F]"
            }`}
          >
            {t(COPY.cancel, locale)}
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2.5px] bg-black/5" aria-hidden>
          <div
            className={`h-full transition-[width] duration-500 ease-out ${warning ? "bg-red-500" : "bg-[#F59E0B]"}`}
            style={{ width: `${Math.round(ratio * 1000) / 10}%` }}
          />
        </div>
      </div>
      {open ? <MiniTimeline legs={alarm.legs} legIndex={alarm.legIndex} locale={locale} /> : null}
    </div>
  );
}
