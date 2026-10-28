"use client";

import { useEffect, useState } from "react";
import { bareStationName } from "./arrivalTips";
import { stationName, t, type Locale, type Localized } from "./stations";
import { sameLine } from "./subwayLine";

export type Train = {
  line: string;
  /** 상행/하행, or 내선/외선 on Line 2. */
  direction: string;
  /** Next stop in this direction, e.g. "신촌". */
  heading: string;
  terminal: string;
  /** 급행, ITX, 특급…; null for regular trains. */
  express: string | null;
  /** Seconds to arrival when Seoul provides it, else 0. */
  seconds: number;
  /** 0 entering, 1 arrived, 2 departed, 3 left previous stop, 4 entering previous, 5 at previous, 99 running. */
  code: number;
  stationsAway: number | null;
  /** Station the train is at now. */
  at: string;
  /** Seoul's sort key: direction, order, stops away. */
  order: string;
  last: boolean;
};

export type ArrivalBoard =
  | { status: "loading" | "unconfigured" | "failed" }
  | { status: "ok"; trains: Train[]; fetchedAt: number };

const POLL_MS = 15_000;
const SHARE_MS = 10_000;
const inflight = new Map<string, { at: number; request: Promise<ArrivalBoard> }>();

function fetchBoard(name: string): Promise<ArrivalBoard> {
  const cached = inflight.get(name);
  if (cached && Date.now() - cached.at < SHARE_MS) return cached.request;
  const request = fetch(`/api/arrivals?station=${encodeURIComponent(name)}`)
    .then(async (response): Promise<ArrivalBoard> => {
      if (!response.ok) return { status: "failed" };
      const data = (await response.json()) as { configured: boolean; trains: Train[]; fetchedAt: number };
      if (!data.configured) return { status: "unconfigured" };
      return { status: "ok", trains: data.trains, fetchedAt: Date.now() };
    })
    .catch((): ArrivalBoard => ({ status: "failed" }));
  inflight.set(name, { at: Date.now(), request });
  return request;
}

/** Live arrivals for a station (Korean name, e.g. "장한평역"), refreshed every 15 s while the screen is visible. */
export function useArrivals(stationName: string | null): { board: ArrivalBoard; refresh: () => void } {
  const name = stationName ?? "";
  const [state, setState] = useState<{ name: string; board: ArrivalBoard } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!name) return;
    let alive = true;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      fetchBoard(name).then((board) => {
        if (!alive) return;
        // A failed refresh keeps the last good board rather than blanking it.
        setState((previous) =>
          board.status === "failed" && previous?.name === name && previous.board.status === "ok"
            ? previous
            : { name, board },
        );
      });
    };
    load();
    const timer = window.setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [name, tick]);

  return {
    board: state?.name === name ? state.board : { status: "loading" },
    refresh: () => {
      inflight.delete(name);
      setTick((value) => value + 1);
    },
  };
}

const TICK_MS = 5_000;

/** Seconds since the board was fetched, ticking so countdowns stay current between polls. */
export function useElapsed(board: ArrivalBoard) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, []);
  return board.status === "ok" ? Math.max(0, (now - board.fetchedAt) / 1000) : 0;
}

/** "09:05" in the device's time zone. */
export function clockTime(ms: number) {
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Seconds until the train can be boarded, or null when Seoul only gives its position. Departing trains are gone. */
export function trainWait(train: Train, elapsed: number): number | null {
  if (train.code === 2) return null;
  if (train.code === 0 || train.code === 1) return 0;
  return train.seconds > 0 ? Math.max(0, train.seconds - elapsed) : null;
}

/** Trains on `line` whose next stop is `nextStop`, soonest first. */
export function trainsToward(trains: Train[], line: string, nextStop: string) {
  const target = bareStationName(nextStop);
  return trains
    .filter((train) => sameLine(train.line, line) && train.heading === target)
    .sort((a, b) => a.order.localeCompare(b.order));
}

export type TrainGroup = { key: string; line: string; direction: string; heading: string; trains: Train[] };

/** Line → direction groups, each with its trains soonest first. */
export function groupTrains(trains: Train[]): TrainGroup[] {
  const groups = new Map<string, TrainGroup>();
  for (const train of trains) {
    const key = `${train.line}|${train.direction}|${train.heading}`;
    const group = groups.get(key) ?? { key, line: train.line, direction: train.direction, heading: train.heading, trains: [] };
    group.trains.push(train);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({ ...group, trains: group.trains.sort((a, b) => a.order.localeCompare(b.order)) }))
    .sort((a, b) => a.line.localeCompare(b.line, "ko") || a.trains[0].order.localeCompare(b.trains[0].order));
}

const COPY = {
  minutes: { ko: "{n}분 후", en: "{n} min", zh: "{n}分钟后", ja: "{n}分後" },
  soon: { ko: "곧 도착", en: "Arriving", zh: "即将到达", ja: "まもなく到着" },
  arrived: { ko: "도착", en: "At platform", zh: "已到站", ja: "到着" },
  departed: { ko: "출발", en: "Departing", zh: "出发", ja: "発車" },
  leftPrevious: { ko: "전역 출발", en: "Left prev. stop", zh: "前站出发", ja: "前駅発車" },
  atPrevious: { ko: "전역 도착", en: "At prev. stop", zh: "前站到达", ja: "前駅到着" },
  stops: { ko: "{n}정거장 전", en: "{n} stops away", zh: "还有{n}站", ja: "{n}駅前" },
  running: { ko: "운행 중", en: "On the way", zh: "运行中", ja: "運行中" },
  bound: { ko: "{name}행", en: "to {name}", zh: "开往{name}", ja: "{name}行き" },
  toward: { ko: "{name} 방면", en: "toward {name}", zh: "往{name}方向", ja: "{name}方面" },
  last: { ko: "막차", en: "Last", zh: "末班", ja: "終電" },
  express: { ko: "급행", en: "Express", zh: "急行", ja: "急行" },
} satisfies Record<string, Localized>;

function fill(template: Localized, locale: Locale, values: Record<string, string | number>) {
  return t(template, locale).replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function place(name: string, locale: Locale) {
  return t(stationName(name), locale).replace(/(역|駅|站)$/, "");
}

/** "3분 후", "곧 도착", "2정거장 전"… `elapsed` is seconds since the board was fetched. */
export function trainStatus(train: Train, elapsed: number, locale: Locale) {
  if (train.code === 0) return t(COPY.soon, locale);
  if (train.code === 1) return t(COPY.arrived, locale);
  if (train.code === 2) return t(COPY.departed, locale);
  if (train.seconds > 0) {
    const left = train.seconds - elapsed;
    return left <= 30 ? t(COPY.soon, locale) : fill(COPY.minutes, locale, { n: Math.ceil(left / 60) });
  }
  if (train.code === 3) return t(COPY.leftPrevious, locale);
  if (train.code === 4 || train.code === 5) return t(COPY.atPrevious, locale);
  if (train.stationsAway) return fill(COPY.stops, locale, { n: train.stationsAway });
  return t(COPY.running, locale);
}

export function trainBound(train: Train, locale: Locale) {
  return fill(COPY.bound, locale, { name: place(train.terminal, locale) });
}

export function towardLabel(heading: string, locale: Locale) {
  return fill(COPY.toward, locale, { name: place(heading, locale) });
}

const DIRECTIONS: Record<string, Localized> = {
  상행: { ko: "상행", en: "Up", zh: "上行", ja: "上り" },
  하행: { ko: "하행", en: "Down", zh: "下行", ja: "下り" },
  내선: { ko: "내선순환", en: "Inner loop", zh: "内环", ja: "内回り" },
  외선: { ko: "외선순환", en: "Outer loop", zh: "外环", ja: "外回り" },
};

export function directionLabel(direction: string, locale: Locale) {
  const known = DIRECTIONS[direction];
  return known ? t(known, locale) : direction;
}

/** Localized 막차 / 급행 tags for a train. */
export function trainTags(train: Train, locale: Locale) {
  const tags: string[] = [];
  if (train.express) tags.push(train.express === "급행" ? t(COPY.express, locale) : train.express);
  if (train.last) tags.push(t(COPY.last, locale));
  return tags;
}
