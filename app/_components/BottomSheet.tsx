"use client";

import { useEffect, useId, type ReactNode } from "react";

/** Bottom sheet over the app frame; the frame needs `relative`. Escape and the backdrop close it. */
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-[85]">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-black/40 backdrop-blur-[2px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 flex max-h-[88%] animate-[sheet-up_300ms_cubic-bezier(0.22,1,0.36,1)] flex-col rounded-t-[28px] bg-surface pb-[max(16px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_40px_rgba(15,23,42,0.18)]"
      >
        <div className="flex justify-center pb-3" aria-hidden>
          <span className="h-[5px] w-11 rounded-full bg-neutral-300" />
        </div>
        <h2 id={titleId} className="px-5 text-[18px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {children}
      </section>
    </div>
  );
}
