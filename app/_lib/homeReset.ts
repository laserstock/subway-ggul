"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let resetToken = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestHomeReset() {
  resetToken += 1;
  listeners.forEach((listener) => listener());
}

export function useHomeResetToken() {
  return useSyncExternalStore(
    subscribe,
    () => resetToken,
    () => 0,
  );
}
