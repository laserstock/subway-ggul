import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";

/** The three-step progress bar: done steps get a check, current ones the brand color. */
export function StepTracker({
  copy,
  done,
  current,
  links = false,
}: {
  copy: PlannerCopy;
  done: number[];
  current: number[];
  links?: boolean;
}) {
  const steps = [copy.stepSetup, copy.stepRoutes, copy.stepItinerary];
  return (
    <ol aria-label={copy.stepsLabel} className="grid grid-cols-3 gap-1.5">
      {steps.map((label, index) => {
        const step = index + 1;
        const isDone = done.includes(step);
        const isCurrent = current.includes(step);
        const body = (
          <>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${
                isDone ? "bg-ink text-white" : isCurrent ? "bg-honey text-white" : "bg-surface-muted text-ink-muted"
              }`}
            >
              {isDone ? <Check size={13} strokeWidth={3} aria-hidden /> : step}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-muted">
                {fillCopy(copy.step, { n: step })}
              </span>
              <span className={`block text-[12.5px] font-extrabold leading-tight sm:text-[13.5px] ${isDone || isCurrent ? "text-ink" : "text-ink-muted"}`}>
                {label}
              </span>
            </span>
          </>
        );
        const className = `flex h-full items-center gap-2 rounded-2xl border px-2.5 py-2 sm:px-3 ${
          isCurrent ? "border-honey/40 bg-honey-soft" : "border-line bg-surface"
        }`;
        return (
          <li key={step} aria-current={isCurrent ? "step" : undefined}>
            {links && (isDone || isCurrent) ? (
              <a href={`#step-${step}`} className={`${className} transition hover:border-honey/60`}>
                {body}
              </a>
            ) : (
              <div className={className}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function StepHeader({
  copy,
  step,
  title,
  id,
  children,
  action,
}: {
  copy: PlannerCopy;
  step: number;
  title: string;
  id?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-honey-strong">{fillCopy(copy.step, { n: step })}</p>
        <h2 id={id} className="mt-0.5 text-[20px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {children ? <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{children}</p> : null}
      </div>
      {action}
    </div>
  );
}
