"use client";

import { useState, type AnimationEvent } from "react";
import { TrainMark } from "./icons";

/**
 * Brief launch logo. It is server-rendered and animated purely in CSS, so it shows with the
 * first paint and fades out on its own even before hydration; afterwards it unmounts.
 */
export default function SplashScreen() {
  const [done, setDone] = useState(false);
  if (done) return null;

  function onAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.animationName === "splash-out") setDone(true);
  }

  return (
    <div
      aria-hidden
      onAnimationEnd={onAnimationEnd}
      className="splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-app"
    >
      <div className="splash-logo flex h-28 w-28 items-center justify-center rounded-[32px] bg-honey-soft text-honey">
        <TrainMark size={68} />
      </div>
      <p className="splash-logo mt-5 text-[22px] font-extrabold tracking-tight text-honey-strong">지하철꿀정보</p>
    </div>
  );
}
