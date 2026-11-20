"use client";

import { useSyncExternalStore } from "react";
import { unlockAlarmSpeech, stopAlarmSpeech } from "./alarmSpeech";
import { buildAlarmLegs, type AlarmLeg } from "./multiLegAlarm";
import {
  hasNativeArrivalAlarm,
  isNativeApp,
  prepareNativeAlerts,
  sendNativeAlert,
  stopNativeArrivalAlarm,
} from "./native";
import type { Route } from "./routeFinder";
import { serializeStation, type SavedStation, type StationOption } from "./stations";

export type AlarmStage = "armed" | "approaching" | "arrived" | "transferring" | "wrong_way";

export type ArrivalAlarm = {
  station: SavedStation;
  stage: AlarmStage;
  armedAt: number;
  /** Korean name of the last station passed, which tells the train's direction. */
  from: string | null;
  /** Line shared by `from` and the destination. */
  line: string | null;
  /** System notifications allowed; otherwise only the in-app alert, sound and vibration. */
  systemAlerts: boolean;
  /** Multi-leg queue; single-station alarms use one arrival leg. */
  legs: AlarmLeg[];
  legIndex: number;
  /** TTS muted by the rider; voice is on by default. */
  muteVoice: boolean;
  mode: "single" | "route";
};

export const VIBE = {
  preArrival: [200, 100, 200] as number[],
  arrival: [500, 200, 500, 200, 500] as number[],
  wrongWay: [400, 100, 400, 100, 400] as number[],
  legacy: [300, 150, 300, 150, 600] as number[],
};

const STORAGE_KEY = "subway-ggul:arrival-alarm";
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

let state: ArrivalAlarm | null = null;
let loaded = false;
const listeners = new Set<() => void>();

/** The app keeps alerting after it's closed, so its alarm must survive a restart; a browser tab's must not. */
function storage() {
  return isNativeApp() ? localStorage : sessionStorage;
}

function lineFromSaved(station: SavedStation, line: string | null): string {
  if (line) return line;
  return station.lines.ko.split(/[·,|/]/)[0]?.trim() ?? "";
}

function asSingleLeg(station: SavedStation, line: string | null): AlarmLeg {
  return {
    station,
    kind: "arrival",
    line: lineFromSaved(station, line),
    stations: [station.name.ko],
    stationIds: [],
    hopSeconds: [],
    expectedNextStations: [],
    oppositeStations: [],
    transferTip: null,
    restroomGate: null,
  };
}

function normalize(raw: ArrivalAlarm): ArrivalAlarm {
  const legs =
    raw.legs?.length > 0
      ? raw.legs
      : [asSingleLeg(raw.station, raw.line)];
  const legIndex = Math.min(Math.max(0, raw.legIndex ?? 0), legs.length - 1);
  return {
    ...raw,
    legs,
    legIndex,
    muteVoice: Boolean(raw.muteVoice),
    mode: raw.mode === "route" ? "route" : "single",
    station: legs[legIndex]?.station ?? raw.station,
    line: legs[legIndex]?.line ?? raw.line,
  };
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = storage().getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as ArrivalAlarm) : null;
    if (saved && Date.now() - saved.armedAt < MAX_AGE_MS) state = normalize(saved);
  } catch {}
}

function save(next: ArrivalAlarm | null) {
  state = next ? normalize(next) : null;
  try {
    if (state) storage().setItem(STORAGE_KEY, JSON.stringify(state));
    else storage().removeItem(STORAGE_KEY);
  } catch {}
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function read() {
  load();
  return state;
}

export function useArrivalAlarm(): ArrivalAlarm | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function updateArrivalAlarm(patch: Partial<Omit<ArrivalAlarm, "armedAt">>) {
  if (!state) return;
  const next = { ...state, ...patch };
  if (typeof patch.legIndex === "number" && next.legs[patch.legIndex]) {
    next.station = next.legs[patch.legIndex].station;
    next.line = next.legs[patch.legIndex].line;
  }
  save(next);
}

export function setAlarmMuteVoice(muteVoice: boolean) {
  if (state) {
    if (muteVoice) stopAlarmSpeech();
    save({ ...state, muteVoice });
  }
}

export function cancelArrivalAlarm() {
  if (hasNativeArrivalAlarm()) stopNativeArrivalAlarm();
  stopAlarmSpeech();
  save(null);
}

let audio: AudioContext | null = null;

/** Browsers only start audio from a user gesture, so the context is created when the alarm is set. */
function unlockSound() {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    audio = null;
  }
}

function chime() {
  const context = audio;
  if (!context) return;
  const start = context.currentTime;
  [880, 880, 1175].forEach((frequency, index) => {
    const at = start + index * 0.35;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.32);
  });
}

function notificationsGranted() {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

async function finishArming(armed: ArrivalAlarm) {
  unlockSound();
  unlockAlarmSpeech();
  if (isNativeApp()) {
    save({ ...armed, systemAlerts: await prepareNativeAlerts("하차 알림 · Arrival alerts") });
    return;
  }
  save({ ...armed, systemAlerts: notificationsGranted() });
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  const permission =
    Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (state?.armedAt === armed.armedAt) updateArrivalAlarm({ systemAlerts: permission === "granted" });
}

/**
 * Must run inside the tap that sets the alarm: it unlocks sound and asks for notification permission.
 * Android Chrome only shows notifications through a service worker, so one is registered here.
 */
export async function armArrivalAlarm(station: StationOption) {
  const armedAt = Date.now();
  const saved = serializeStation(station);
  const leg = asSingleLeg(saved, null);
  await finishArming({
    station: saved,
    stage: "armed",
    armedAt,
    from: null,
    line: leg.line || null,
    systemAlerts: false,
    legs: [leg],
    legIndex: 0,
    muteVoice: false,
    mode: "single",
  });
}

/** Arm every transfer + final destination from a route search result. */
export async function armRouteAlarm(route: Route, from: StationOption) {
  const legs = buildAlarmLegs(route);
  if (!legs.length) return;
  const armedAt = Date.now();
  await finishArming({
    station: legs[0].station,
    stage: "armed",
    armedAt,
    from: from.name.ko,
    line: legs[0].line,
    systemAlerts: false,
    legs,
    legIndex: 0,
    muteVoice: false,
    mode: "route",
  });
}

/** Advance to the next leg after a transfer (or clear when the final leg finishes). */
export function advanceAlarmLeg() {
  if (!state) return;
  const nextIndex = state.legIndex + 1;
  if (nextIndex >= state.legs.length) {
    save({ ...state, stage: "arrived" });
    return;
  }
  const next = state.legs[nextIndex];
  save({
    ...state,
    legIndex: nextIndex,
    station: next.station,
    line: next.line,
    stage: "armed",
    from: null,
  });
}

const PAUSED_TAG = "arrival-alarm-paused";

/** Browser only: a quiet notice while the page is hidden and can't track, cleared with `null`. */
export async function showPausedNotice(notice: { title: string; body: string } | null) {
  if (!notificationsGranted()) return;
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (!registration) return;
    if (notice) await registration.showNotification(notice.title, { body: notice.body, tag: PAUSED_TAG, silent: true });
    else for (const shown of await registration.getNotifications({ tag: PAUSED_TAG })) shown.close();
  } catch {}
}

/** `system: false` when the native alarm service posts the notification itself. */
export async function sendArrivalAlert(
  title: string,
  body: string,
  system = true,
  pattern: number[] = VIBE.legacy,
) {
  navigator.vibrate?.(pattern);
  chime();
  if (!system) return;
  if (isNativeApp()) return sendNativeAlert(title, body);
  if (!notificationsGranted()) return;
  const options: NotificationOptions = { body, tag: "arrival-alarm", requireInteraction: true };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) await registration.showNotification(title, options);
    else new Notification(title, options);
  } catch {}
}
