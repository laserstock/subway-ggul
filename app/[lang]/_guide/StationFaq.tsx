import type { FaqItem } from "../../_lib/guideCopy";
import { Icon } from "./icons";

/**
 * Visible FAQ accordion that must stay in sync with StationFaqSchema JSON-LD.
 * Native `<details>` keeps answers in the HTML for crawlers without a JS accordion dependency.
 */
export default function StationFaq({
  items,
  sectionLabel,
}: {
  items: FaqItem[];
  /** Used in aria-labels so GA4/GTM enhanced measurement can name the interaction. */
  sectionLabel: string;
}) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2 lg:max-w-3xl lg:gap-3" role="list" aria-label={sectionLabel}>
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          role="listitem"
          className="group rounded-2xl border border-line bg-surface open:border-honey/40 lg:transition-colors lg:duration-200"
        >
          <summary
            aria-label={`${sectionLabel}: ${item.question}`}
            className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 hover:text-honey-strong lg:px-5 lg:py-4 [&::-webkit-details-marker]:hidden"
          >
            <h3 className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-ink lg:text-[17px]">{item.question}</h3>
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted transition-transform duration-200 group-open:rotate-45 group-open:bg-honey-soft group-open:text-honey-strong"
            >
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <p className="px-4 pb-4 text-[15px] leading-relaxed text-ink-muted lg:px-5 lg:pb-5 lg:text-[16px]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
