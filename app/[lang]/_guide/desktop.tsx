import type { ReactNode } from "react";

/**
 * Widens a guide page to max-w-5xl from `lg` up. The [lang] layout caps <main> at 760px, so this breaks out of it
 * symmetrically; below `lg` it is a plain block and the mobile layout is unchanged.
 */
export function DesktopWide({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`lg:ml-[calc(50%-min(512px,calc(50vw-32px)))] lg:w-[min(1024px,calc(100vw-64px))] lg:pt-6 ${className}`}>
      {children}
    </div>
  );
}
