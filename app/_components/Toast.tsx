"use client";

import { useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function showToast(message: string) {
    setToast(message);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), 2200);
  }

  return { toast, showToast };
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-6 bottom-20 z-[70] rounded-xl bg-neutral-900/90 px-4 py-2.5 text-center text-[13px] font-medium text-white"
    >
      {message}
    </div>
  );
}
