"use client";

import { useSyncExternalStore } from "react";
import type { LatLng } from "../KakaoMap";
import { distanceMeters, type StationOption } from "./stations";

export type StationSource = "gps" | "chip" | "search";

/** A station the user picked by hand because GPS was off (common underground). */
export type ManualStation = {
  station: StationOption;
  source: Exclude<StationSource, "gps">;
  /** GPS fix at the time of the correction; once the user moves away from it, GPS takes over again. */
  anchor: LatLng | null;
};

export type SelectedStation = { station: StationOption; source: StationSource };

/** Roughly one station apart; smaller values let underground GPS drift undo the user's correction. */
export const MANUAL_RELEASE_METERS = 1000;
/** Coarser fixes (Wi-Fi/cell, typical underground) can jump over a kilometre, so they never move or release a correction. */
const ANCHOR_MAX_ACCURACY_METERS = 150;

export type LocationFix = { position: LatLng | null; accuracy: number | null };

function reliable(fix: LocationFix): LatLng | null {
  return fix.position && fix.accuracy !== null && fix.accuracy <= ANCHOR_MAX_ACCURACY_METERS ? fix.position : null;
}

const listeners = new Set<() => void>();
let manual: ManualStation | null = null;
/** The station the user searched for and is viewing (not necessarily where they are). */
let destination: StationOption | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function selectStation(station: StationOption, source: ManualStation["source"], fix: LocationFix) {
  manual = { station, source, anchor: reliable(fix) };
  emit();
}

export function clearSelectedStation() {
  if (!manual) return;
  manual = null;
  emit();
}

/** Re-anchors a correction made without GPS, or releases it once the user has clearly moved on. */
export function syncSelectedStation(fix: LocationFix) {
  const position = reliable(fix);
  if (!manual || !position) return;
  if (!manual.anchor) {
    manual = { ...manual, anchor: position };
    emit();
  } else if (distanceMeters(manual.anchor, position) > MANUAL_RELEASE_METERS) {
    clearSelectedStation();
  }
}

export function useManualStation(): ManualStation | null {
  return useSyncExternalStore(
    subscribe,
    () => manual,
    () => null,
  );
}

export function setDestinationStation(station: StationOption | null) {
  if (destination?.key === station?.key) return;
  destination = station;
  emit();
}

export function useDestinationStation(): StationOption | null {
  return useSyncExternalStore(
    subscribe,
    () => destination,
    () => null,
  );
}

export function useSelectedStation(gpsStation: StationOption | null): SelectedStation | null {
  const picked = useManualStation();
  if (picked) return { station: picked.station, source: picked.source };
  return gpsStation ? { station: gpsStation, source: "gps" } : null;
}
