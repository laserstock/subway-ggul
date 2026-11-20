"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ArrivalAlarm } from "./arrivalAlarm";
import { bareStationName } from "./arrivalTips";
import { currentAlarmLeg, etaSecondsOnLeg, remainingStopsOnLeg, type AlarmLeg } from "./multiLegAlarm";
import { distanceMeters, restoreStation } from "./stations";
import { useStationTracker } from "./useStationTracker";

const GPS_WEAK_ACCURACY = 150;
const ARRIVED_METERS = 250;
const STALE_FIX_MS = 12_000;

export type AlarmEngineEvent =
  | { type: "preArrival"; leg: AlarmLeg; currentStation: string }
  | { type: "arrival"; leg: AlarmLeg }
  | { type: "wrongWay"; station: string }
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
  const [remainingStops, setRemainingStops] = useState(() => (leg ? remainingStopsOnLeg(leg, null) : 0));
  const [etaSeconds, setEtaSeconds] = useState(() => (leg ? etaSecondsOnLeg(leg, null) : 0));
  const [atStation, setAtStation] = useState<string | null>(null);

  const progressRef = useRef(0);
  const lastHopAtRef = useRef(Date.now());
  const lastNearestAtRef = useRef(0);
  const firedPreRef = useRef(false);
  const firedArriveRef = useRef(false);
  const firedWrongRef = useRef(false);
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
    firedWrongRef.current = false;
    setAtStation(null);
    if (leg) {
      setRemainingStops(remainingStopsOnLeg(leg, null));
      setEtaSeconds(etaSecondsOnLeg(leg, null));
    }
  }, [alarm.legIndex, alarm.station.key, leg]);

  function publishProgress(nextAt: string | null, nextLeg: AlarmLeg) {
    const stops = remainingStopsOnLeg(nextLeg, nextAt);
    const eta = etaSecondsOnLeg(nextLeg, nextAt);
    setRemainingStops(stops);
    setEtaSeconds(eta);
    setAtStation(nextAt);
    emit({ type: "progress", remainingStops: stops, etaSeconds: eta, atStation: nextAt });
  }

  function handleStation(bare: string, nextLeg: AlarmLeg, stage: ArrivalAlarm["stage"], distanceToTarget: number) {
    if (stage === "arrived") return;
    const targetBare = bareStationName(nextLeg.station.name.ko);
    const index = nextLeg.stations.findIndex((name) => bareStationName(name) === bare);

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
        publishProgress(targetBare, nextLeg);
        emit({ type: "arrival", leg: nextLeg });
      }
      return;
    }

    const originBare = bareStationName(nextLeg.stations[0] ?? "");
    const onOpposite =
      nextLeg.oppositeStations.includes(bare) &&
      index < 0 &&
      bare !== targetBare &&
      bare !== originBare &&
      !nextLeg.expectedNextStations.includes(bare);

    if (onOpposite && !firedWrongRef.current) {
      firedWrongRef.current = true;
      emit({ type: "wrongWay", station: bare });
      return;
    }

    if (index >= 0) {
      if (index < progressRef.current && index < nextLeg.stations.length - 1 && !firedWrongRef.current) {
        firedWrongRef.current = true;
        emit({ type: "wrongWay", station: bare });
        return;
      }
      progressRef.current = Math.max(progressRef.current, index);
      lastHopAtRef.current = Date.now();
      publishProgress(bare, nextLeg);
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
      publishProgress(bare, nextLeg);
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
    if (!leg || alarm.stage === "arrived" || alarm.stage === "transferring") return;
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
        const eta = Math.max(0, Math.round(etaSecondsOnLeg(active, atStation) - Math.min(elapsed, due) * 0.15));
        setEtaSeconds(eta);
        return;
      }

      if (elapsed < due * 0.9) {
        const stops = Math.max(0, active.stations.length - 1 - idx);
        const eta = Math.max(0, Math.round(hops.slice(idx).reduce((sum, hop) => sum + hop, 0) - elapsed));
        setRemainingStops(stops);
        setEtaSeconds(eta);
        emit({ type: "progress", remainingStops: stops, etaSeconds: eta, atStation });
        return;
      }

      const nextIdx = Math.min(idx + 1, active.stations.length - 1);
      progressRef.current = nextIdx;
      lastHopAtRef.current = Date.now();
      const name = bareStationName(active.stations[nextIdx] ?? "");
      setAtStation(name);
      const stops = Math.max(0, active.stations.length - 1 - nextIdx);
      const eta = hops.slice(nextIdx).reduce((sum, hop) => sum + hop, 0);
      setRemainingStops(stops);
      setEtaSeconds(eta);
      emit({ type: "progress", remainingStops: stops, etaSeconds: eta, atStation: name });

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
