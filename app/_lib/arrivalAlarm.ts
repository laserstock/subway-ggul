"use client";

import { useSyncExternalStore } from "react";
import { serializeStation, type SavedStation, type StationOption } from "./stations";

export type AlarmStage = "armed" | "approaching" | "arrived";

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
};

const STORAGE_KEY = "subway-ggul:arrival-alarm";
const MAX_AGE_MS = 3 * 60 * 60 * 1000;
const VIBRATION = [300, 150, 300, 150, 600];

let state: ArrivalAlarm | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as ArrivalAlarm) : null;
    if (saved && Date.now() - saved.armedAt < MAX_AGE_MS) state = saved;
  } catch {}
}

function save(next: ArrivalAlarm | null) {
  state = next;
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(STORAGE_KEY);
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

export function updateArrivalAlarm(patch: Partial<Omit<ArrivalAlarm, "station" | "armedAt">>) {
  if (state) save({ ...state, ...patch });
}

export function cancelArrivalAlarm() {
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

/**
 * Must run inside the tap that sets the alarm: it unlocks sound and asks for notification permission.
 * Android Chrome only shows notifications through a service worker, so one is registered here.
 */
export async function armArrivalAlarm(station: StationOption) {
  unlockSound();
  const armedAt = Date.now();
  save({
    station: serializeStation(station),
    stage: "armed",
    armedAt,
    from: null,
    line: null,
    systemAlerts: notificationsGranted(),
  });
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  const permission =
    Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (state?.armedAt === armedAt) updateArrivalAlarm({ systemAlerts: permission === "granted" });
}

export async function sendArrivalAlert(title: string, body: string) {
  navigator.vibrate?.(VIBRATION);
  chime();
  if (!notificationsGranted()) return;
  const options: NotificationOptions = { body, tag: "arrival-alarm", requireInteraction: true };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) await registration.showNotification(title, options);
    else new Notification(title, options);
  } catch {}
}
