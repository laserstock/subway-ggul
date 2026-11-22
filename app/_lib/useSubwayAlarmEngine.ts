"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ArrivalAlarm } from "./arrivalAlarm";
import { bareStationName } from "./arrivalTips";
import { currentAlarmLeg, remainingRouteProgress, type AlarmLeg } from "./multiLegAlarm";
import { distanceMeters, restoreStation } from "./stations";
import { useStationTracker } from "./useStationTracker";

const GPS_WEAK_ACCURACY = 150;
const ARRIVED_METERS = 250;
const STALE_FIX_MS = 12_000;

export type AlarmEngineEvent =
  | { type: "preArrival"; leg: AlarmLeg; currentStation: string }
  | { type: "arrival"; leg: AlarmLeg }
  | { type: "missedTransfer"; station: string }
  | { type: "boardNextLeg" }
  | { type: "progress"; remainingStops: number; etaSeconds: number; atStation: string | null };

type Options = {
  alarm: ArrivalAlarm;
  background?: { title: string; message: string };
  onEvent: (event: AlarmEngineEvent) => void;
};

/**
 * Hybrid subway alarm tracker: GPS geofence when accuracy is good, otherwise dead-reckon
 * along the leg's hopSeconds so underground tunnels still fire 1-stop-before / arrival on time.
 */
export function useSubwayAlarmEngine({ alarm, background, onEvent }: Options) {
  const leg = currentAlarmLeg(alarm.legs, alarm.legIndex);
  const target = restoreStation(alarm.station);
  const [remainingStops, setRemainingStops] = useState(() => {
    const at = alarm.from ? bareStationName(alarm.from) : null;
    return remainingRouteProgress(alarm.legs, alarm.legIndex, at).remainingStops;
  });
  const [etaSeconds, setEtaSeconds] = useState(() => {
    const at = alarm.from ? bareStationName(alarm.from) : null;
    return remainingRouteProgress(alarm.legs, alarm.legIndex, at).etaSeconds;
  });

  const [atStation, setAtStation] = useState<string | null>(
    alarm.from ? bareStationName(alarm.from) : null,
  );

  const progressRef = useRef(0);
  const lastHopAtRef = useRef(Date.now());
  const lastNearestAtRef = useRef(0);
  const firedPreRef = useRef(false);
  const firedArriveRef = useRef(false);
  const firedMissedRef = useRef(false);
  const legKeyRef = useRef(`${alarm.legIndex}:${alarm.station.key}`);
  const stageRef = useRef(alarm.stage);
  const legRef = useRef(leg);
  const legsRef = useRef(alarm.legs);
  const legIndexRef = useRef(alarm.legIndex);

  const emit = useEffectEvent((event: AlarmEngineEvent) => onEvent(event));

  useEffect(() => {
    stageRef.current = alarm.stage;
  }, [alarm.stage]);

  useEffect(() => {
    legRef.current = leg;
    legsRef.current = alarm.legs;
    legIndexRef.current = alarm.legIndex;
  }, [leg, alarm.legs, alarm.legIndex]);

  useEffect(() => {
    const key = `${alarm.legIndex}:${alarm.station.key}`;
    if (legKeyRef.current === key) return;
    legKeyRef.current = key;
    progressRef.current = 0;
    lastHopAtRef.current = Date.now();
    firedPreRef.current = false;
    firedArriveRef.current = false;
    firedMissedRef.current = false;
    setAtStation(alarm.from ? bareStationName(alarm.from) : null);
    const seeded = remainingRouteProgress(alarm.legs, alarm.legIndex, alarm.from ? bareStationName(alarm.from) : null);
    setRemainingStops(seeded.remainingStops);
    setEtaSeconds(seeded.etaSeconds);
  }, [alarm.legIndex, alarm.station.key, alarm.legs, alarm.from, leg]);

  function publishProgress(nextAt: string | null) {
    const { remainingStops: stops, etaSeconds: eta } = remainingRouteProgress(
      legsRef.current,
      legIndexRef.current,
      nextAt,
    );
    setRemainingStops(stops);
    setEtaSeconds(eta);
    setAtStation(nextAt);
    emit({ type: "progress", remainingStops: stops, etaSeconds: eta, atStation: nextAt });
  }

  function handleStation(bare: string, nextLeg: AlarmLeg, stage: ArrivalAlarm["stage"], distanceToTarget: number) {
    if (stage === "arrived" || stage === "missed_transfer") return;
    const targetBare = bareStationName(nextLeg.station.name.ko);
    const index = nextLeg.stations.findIndex((name) => bareStationName(name) === bare);
    const nearOrPastTarget = progressRef.current >= Math.max(0, nextLeg.stations.length - 2);
    const pastTransfer =
      nextLeg.kind === "transfer" &&
      (nextLeg.beyondStations ?? []).includes(bare) &&
      (nearOrPastTarget || stage === "transferring" || stage === "approaching");

    if (pastTransfer && !firedMissedRef.current) {
      firedMissedRef.current = true;
      publishProgress(bare);
      emit({ type: "missedTransfer", station: bare });
      return;
    }

    if (stage === "transferring") {
      const following = legsRef.current[legIndexRef.current + 1];
      if (!following) return;
      const onNext =
        following.expectedNextStations.includes(bare) ||
        following.stations.some((name, stop) => stop > 0 && bareStationName(name) === bare);
      if (onNext) emit({ type: "boardNextLeg" });
      return;
    }

    if (distanceToTarget <= ARRIVED_METERS || bare === targetBare || index >= nextLeg.stations.length - 1) {
      if (!firedArriveRef.current) {
        firedArriveRef.current = true;
        publishProgress(targetBare);
        emit({ type: "arrival", leg: nextLeg });
      }
      return;
    }

    if (index >= 0) {
      // Ignore brief GPS blips that look "behind" on the line — never warn about opposite direction.
      if (index < progressRef.current && index < nextLeg.stations.length - 1) return;
      progressRef.current = Math.max(progressRef.current, index);
      lastHopAtRef.current = Date.now();
      publishProgress(bare);
      if (index === nextLeg.stations.length - 2 && !firedPreRef.current) {
        firedPreRef.current = true;
        emit({ type: "preArrival", leg: nextLeg, currentStation: bare });
      }
      return;
    }

    if (nextLeg.expectedNextStations.includes(bare)) {
      const expectedIndex = nextLeg.stations.findIndex((name) => bareStationName(name) === bare);
      if (expectedIndex >= 0) {
        progressRef.current = Math.max(progressRef.current, expectedIndex);
        lastHopAtRef.current = Date.now();
      }
      publishProgress(bare);
    }
  }

  const tracker = useStationTracker({
    autoStart: alarm.stage !== "arrived",
    background,
    onNearest: ({ station: here, position }) => {
      const active = legRef.current;
      if (!active) return;
      lastNearestAtRef.current = Date.now();
      const bare = bareStationName(here.name.ko);
      const distance = distanceMeters(position, target.center);
      handleStation(bare, active, stageRef.current, distance);
    },
  });

  // Dead reckoning when GPS is weak or stalled.
  useEffect(() => {
    if (!leg || alarm.stage === "arrived" || alarm.stage === "transferring" || alarm.stage === "missed_transfer") return;
    const hops = leg.hopSeconds;
    if (!hops.length) return;
    const id = window.setInterval(() => {
      const active = legRef.current;
      if (!active) return;
      const accuracy = tracker.accuracy;
      const weak = accuracy !== null && accuracy > GPS_WEAK_ACCURACY;
      const stale = Date.now() - lastNearestAtRef.current > STALE_FIX_MS;
      const elapsed = (Date.now() - lastHopAtRef.current) / 1000;
      const idx = progressRef.current;
      const due = hops[idx] ?? hops[hops.length - 1] ?? 90;

      if (!weak && !stale) {
        const base = remainingRouteProgress(legsRef.current, legIndexRef.current, atStation).etaSeconds;
        const eta = Math.max(0, Math.round(base - Math.min(elapsed, due) * 0.15));
        setEtaSeconds(eta);
        return;
      }

      if (elapsed < due * 0.9) {
        const base = remainingRouteProgress(legsRef.current, legIndexRef.current, atStation);
        const eta = Math.max(0, Math.round(base.etaSeconds - elapsed));
        setRemainingStops(base.remainingStops);
        setEtaSeconds(eta);
        emit({ type: "progress", remainingStops: base.remainingStops, etaSeconds: eta, atStation });
        return;
      }

      const nextIdx = Math.min(idx + 1, active.stations.length - 1);
      progressRef.current = nextIdx;
      lastHopAtRef.current = Date.now();
      const name = bareStationName(active.stations[nextIdx] ?? "");
      publishProgress(name);

      if (nextIdx === active.stations.length - 2 && !firedPreRef.current) {
        firedPreRef.current = true;
        emit({ type: "preArrival", leg: active, currentStation: name });
      }
      if (nextIdx >= active.stations.length - 1 && !firedArriveRef.current) {
        firedArriveRef.current = true;
        emit({ type: "arrival", leg: active });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [leg, alarm.stage, tracker.accuracy, atStation]);

  return {
    remainingStops,
    etaSeconds,
    atStation,
    issue: tracker.issue,
    nearest: tracker.nearest,
    accuracy: tracker.accuracy,
    stop: tracker.stop,
  };
}
