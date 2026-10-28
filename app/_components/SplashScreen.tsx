"use client";

import { usePathname } from "next/navigation";
import { useId, useSyncExternalStore, type AnimationEvent } from "react";
import { guideLocale } from "../_lib/site";
import { TrainMark } from "./icons";

/** Per tab session: a new launch shows the logo again, reloads and in-app navigation don't. */
const SESSION_KEY = "subway-ggul:splashed";
let finished = false;
const listeners = new Set<() => void>();

function readFinished() {
  if (finished) return true;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function finish() {
  finished = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

/** Runs during HTML parsing on full page loads; inert when React renders it on the client. */
function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Brief launch logo, shown once per app launch. It is server-rendered and animated purely in CSS so it
 * appears with the first paint; on later full page loads in the same tab the inline script hides it
 * before paint, and the store below unmounts it after hydration.
 */
export default function SplashScreen() {
  const id = useId();
  const done = useSyncExternalStore(subscribe, readFinished, () => false);
  const pathname = usePathname();
  if (done || guideLocale(pathname)) return null;

  function onAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.animationName === "splash-out") finish();
  }

  return (
    <>
      <div
        id={id}
        aria-hidden
        suppressHydrationWarning
        onAnimationEnd={onAnimationEnd}
        className="splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-app"
      >
        <div className="splash-logo flex h-28 w-28 items-center justify-center rounded-[32px] bg-honey-soft text-honey">
          <TrainMark size={68} />
        </div>
        <p className="splash-logo mt-5 text-[22px] font-extrabold tracking-tight text-honey-strong">지하철꿀정보</p>
      </div>
      <InlineScript
        html={`try{if(sessionStorage.getItem(${JSON.stringify(SESSION_KEY)})==="1"){var s=document.getElementById(${JSON.stringify(id)});if(s)s.style.display="none"}}catch(e){}`}
      />
    </>
  );
}
