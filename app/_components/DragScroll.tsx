"use client";

import { useRef, type ComponentProps, type PointerEvent as ReactPointerEvent } from "react";

/** Below this many px a mouse press still counts as a click on the chip under it. */
const DRAG_THRESHOLD = 5;

/**
 * Horizontal chip row. Touch already swipes it natively; this adds click-and-drag for desktop mice,
 * which otherwise can't scroll a row whose scrollbar is hidden.
 */
export default function DragScroll({ className = "", children, ...rest }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    const row = ref.current;
    if (event.pointerType !== "mouse" || event.button !== 0 || !row || row.scrollWidth <= row.clientWidth) return;
    drag.current = { id: event.pointerId, x: event.clientX, left: row.scrollLeft, moved: false };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    const row = ref.current;
    if (!current || !row || event.pointerId !== current.id) return;
    const dx = event.clientX - current.x;
    if (!current.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      current.moved = true;
      row.setPointerCapture(current.id);
    }
    row.scrollLeft = current.left - dx;
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    drag.current = null;
    if (current.moved) suppressClick.current = true;
  }

  return (
    <div
      ref={ref}
      {...rest}
      className={`no-scrollbar overflow-x-auto select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
}
