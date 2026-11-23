"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDragToClose } from "../_lib/useSheetDrag";

/** Full-viewport bottom sheet; portaled to `document.body` so home GPS/search layers cannot stack under it. */
export default function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const { sheetRef, sheetStyle, handleProps } = useDragToClose(onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200]" data-overlay-open="true">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-black/45"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-overlay-open="true"
        ref={sheetRef}
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 flex h-[min(92dvh,92%)] max-h-[92%] animate-[sheet-up_300ms_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden rounded-t-[28px] bg-surface pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out"
      >
        <div {...handleProps} className="flex shrink-0 cursor-grab justify-center pb-3 pt-2.5 active:cursor-grabbing" aria-hidden>
          <span className="h-[5px] w-11 rounded-full bg-neutral-300" />
        </div>
        <h2 id={titleId} className="shrink-0 px-5 text-[18px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
