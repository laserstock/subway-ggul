import type { ReactNode } from "react";
import { DesktopWide } from "./desktop";
import TocNav, { type TocItem } from "./TocNav";

export type { TocItem };

/**
 * Two-column article shell for long-form guides (for example per-station guides): a sticky table of contents on the
 * left and the body on the right from `lg` up, a collapsible contents box above the body on smaller screens.
 * Every TocItem id must match an element id inside `children`.
 */
export default function TocLayout({
  toc,
  tocTitle,
  header,
  aside,
  children,
}: {
  toc: TocItem[];
  tocTitle: string;
  /** Title block rendered above both columns. */
  header?: ReactNode;
  /** Desktop-only extras under the contents list, such as related links. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DesktopWide>
      {header ? <div className="mb-6 lg:mb-10">{header}</div> : null}
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-16">
        {toc.length ? (
          <details className="group mb-6 rounded-2xl border border-line bg-surface px-4 py-3 lg:hidden">
            <summary className="cursor-pointer list-none text-[14px] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
              {tocTitle}
              <span aria-hidden className="float-right text-ink-muted transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <div className="mt-3">
              <TocNav items={toc} label={tocTitle} />
            </div>
          </details>
        ) : null}

        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-6">
            <p className="mb-3 text-[12px] font-extrabold uppercase tracking-wider text-ink-muted">{tocTitle}</p>
            {toc.length ? <TocNav items={toc} label={tocTitle} /> : null}
            {aside ? <div className="mt-8">{aside}</div> : null}
          </div>
        </aside>

        <div className="min-w-0 text-[15px] leading-relaxed text-ink lg:max-w-3xl lg:text-lg lg:leading-relaxed [&_[id]]:scroll-mt-24">
          {children}
        </div>
      </div>
    </DesktopWide>
  );
}
