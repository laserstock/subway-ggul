"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** A drag this far down, or a quick flick, dismisses a sheet. */
const CLOSE_DISTANCE = 90;
/** px/ms */
const FLICK_VELOCITY = 0.5;
const CLOSE_MS = 200;

type DragEnd = { dy: number; velocity: number };

/** Pointer handlers for a vertical drag on a grab handle (touch and mouse alike). */
export function useVerticalDrag({
  onStart,
  onMove,
  onEnd,
}: {
  onStart?: () => void;
  onMove: (dy: number) => void;
  onEnd: (end: DragEnd) => void;
}) {
  const drag = useRef<{ id: number; startY: number; lastY: number; lastT: number; velocity: number } | null>(null);

  function finish(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const recent = event.timeStamp - current.lastT < 100;
    onEnd({ dy: event.clientY - current.startY, velocity: recent ? current.velocity : 0 });
  }

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastT: event.timeStamp,
        velocity: 0,
      };
      onStart?.();
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      const elapsed = event.timeStamp - current.lastT;
      if (elapsed > 0) current.velocity = (event.clientY - current.lastY) / elapsed;
      current.lastY = event.clientY;
      current.lastT = event.timeStamp;
      onMove(event.clientY - current.startY);
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    style: { touchAction: "none" } as const,
  };
}

/**
 * Drag-down-to-close for a bottom sheet. Put `handleProps` on the grab handle and `sheetRef` /
 * `sheetStyle` on the sheet; the sheet needs a transform transition class so it springs back.
 */
export function useDragToClose<T extends HTMLElement = HTMLElement>(onClose: () => void) {
  const sheetRef = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleProps = useVerticalDrag({
    onStart: () => setDragging(true),
    onMove: (dy) => setOffset(dy > 0 ? dy : dy / 5),
    onEnd: ({ dy, velocity }) => {
      setDragging(false);
      if (dy > CLOSE_DISTANCE || (dy > 12 && velocity > FLICK_VELOCITY)) {
        setOffset(sheetRef.current?.offsetHeight ?? window.innerHeight);
        window.setTimeout(() => {
          onClose();
          setOffset(0);
        }, CLOSE_MS);
      } else {
        setOffset(0);
      }
    },
  });

  const sheetStyle =
    offset === 0 && !dragging
      ? undefined
      : { transform: `translateY(${offset}px)`, transition: dragging ? "none" : `transform ${CLOSE_MS}ms ease-out` };

  return { sheetRef, sheetStyle, handleProps };
}
