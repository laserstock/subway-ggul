import { Check } from "lucide-react";
import type { ReactNode } from "react";

const STEPS = ["Setup", "Route Options", "Interactive Itinerary"] as const;

/** The three-step progress bar: done steps get a check, current ones the brand color. */
export function StepTracker({ done, current, links = false }: { done: number[]; current: number[]; links?: boolean }) {
  return (
    <ol aria-label="Planner steps" className="grid grid-cols-3 gap-1.5">
      {STEPS.map((label, index) => {
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
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-muted">Step {step}</span>
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
          <li key={label} aria-current={isCurrent ? "step" : undefined}>
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
  step,
  title,
  id,
  children,
  action,
}: {
  step: number;
  title: string;
  id?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-honey-strong">Step {step}</p>
        <h2 id={id} className="mt-0.5 text-[20px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {children ? <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{children}</p> : null}
      </div>
      {action}
    </div>
  );
}
