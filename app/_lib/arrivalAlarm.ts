"use client";

import { useSyncExternalStore } from "react";
import { unlockAlarmSpeech, stopAlarmSpeech } from "./alarmSpeech";
import { bareStationName } from "./arrivalTips";
import { buildAlarmLegs, remainingRouteProgress, type AlarmLeg } from "./multiLegAlarm";
import {
  hasNativeArrivalAlarm,
  isNativeApp,
  prepareNativeAlerts,
  sendNativeAlert,
  stopNativeArrivalAlarm,
} from "./native";
import { findRoute, networkStationId, type Route } from "./routeFinder";
import { serializeStation, type SavedStation, type StationOption } from "./stations";

export type AlarmStage =
  | "armed"
  | "approaching"
  | "arrived"
  | "transferring"
  | "wrong_way"
  | "missed_transfer";

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
  missedTransfer: [600, 120, 600, 120, 600, 120, 800] as number[],
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
    rideSeconds: 0,
    hopSeconds: [],
    afterTransferSeconds: 0,
    expectedNextStations: [],
    oppositeStations: [],
    beyondStations: [],
    transferTip: null,
    nextLine: null,
    nextToward: null,
    elevatorTip: null,
    restroomGate: null,
  };
}

/** Older saved alarms may lack ride/transfer fields — fill defaults. */
function normalizeLeg(leg: AlarmLeg): AlarmLeg {
  return {
    ...leg,
    rideSeconds: leg.rideSeconds ?? leg.hopSeconds?.reduce((sum, hop) => sum + hop, 0) ?? 0,
    afterTransferSeconds: leg.afterTransferSeconds ?? 0,
    hopSeconds: leg.hopSeconds ?? [],
    beyondStations: leg.beyondStations ?? [],
    nextLine: leg.nextLine ?? null,
    nextToward: leg.nextToward ?? null,
    elevatorTip: leg.elevatorTip ?? null,
  };
}

function normalize(raw: ArrivalAlarm): ArrivalAlarm {
  const legs =
    (raw.legs?.length > 0 ? raw.legs : [asSingleLeg(raw.station, raw.line)]).map(normalizeLeg);
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
  setAlarmProgress({ remainingStops: 0, etaSeconds: 0, atStation: null });
  save(null);
}

/** Live hop countdown for the slim ticker — kept out of sessionStorage to avoid write thrash. */
export type AlarmProgress = { remainingStops: number; etaSeconds: number; atStation: string | null };

let progress: AlarmProgress = { remainingStops: 0, etaSeconds: 0, atStation: null };
const progressListeners = new Set<() => void>();

export function setAlarmProgress(next: AlarmProgress) {
  if (
    progress.remainingStops === next.remainingStops &&
    progress.etaSeconds === next.etaSeconds &&
    progress.atStation === next.atStation
  ) {
    return;
  }
  progress = next;
  for (const listener of progressListeners) listener();
}

function subscribeProgress(listener: () => void) {
  progressListeners.add(listener);
  return () => {
    progressListeners.delete(listener);
  };
}

export function useAlarmProgress(): AlarmProgress {
  return useSyncExternalStore(subscribeProgress, () => progress, () => progress);
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

function seedProgress(legs: AlarmLeg[], fromKo: string | null) {
  const at = fromKo ? bareStationName(fromKo) : null;
  const { remainingStops, etaSeconds } = remainingRouteProgress(legs, 0, at);
  setAlarmProgress({ remainingStops, etaSeconds, atStation: at });
}

async function finishArming(armed: ArrivalAlarm) {
  unlockSound();
  unlockAlarmSpeech();
  seedProgress(armed.legs, armed.from);
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

/** Build alarm legs from origin → destination via the route finder when both are known. */
function legsForTrip(from: StationOption | null | undefined, destination: StationOption): AlarmLeg[] {
  if (!from || bareStationName(from.name.ko) === bareStationName(destination.name.ko)) {
    return [asSingleLeg(serializeStation(destination), null)];
  }
  const fromId = networkStationId(from.name.ko, from.center);
  const toId = networkStationId(destination.name.ko, destination.center);
  if (fromId === null || toId === null) return [asSingleLeg(serializeStation(destination), null)];
  const route = findRoute(fromId, toId, "fastest");
  if (!route) return [asSingleLeg(serializeStation(destination), null)];
  const legs = buildAlarmLegs(route);
  return legs.length ? legs : [asSingleLeg(serializeStation(destination), null)];
}

/**
 * Must run inside the tap that sets the alarm: it unlocks sound and asks for notification permission.
 * Pass `from` (current/boarding station) so the ticker can show remaining stops and ETA immediately.
 */
export async function armArrivalAlarm(station: StationOption, from?: StationOption | null) {
  const armedAt = Date.now();
  const legs = legsForTrip(from, station);
  const first = legs[0];
  await finishArming({
    station: first.station,
    stage: "armed",
    armedAt,
    from: from?.name.ko ?? null,
    line: first.line || null,
    systemAlerts: false,
    legs,
    legIndex: 0,
    muteVoice: false,
    mode: from ? "route" : "single",
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
