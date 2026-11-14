import type { LocalNoteKind } from "../../_lib/stationLocalGuides";
import type { StationOverview } from "../../_lib/stationOverview";
import { Icon, type IconName } from "./icons";

const NOTE_ICONS: Record<LocalNoteKind, IconName> = {
  route: "route",
  luggage: "luggage",
  access: "elevator",
  timing: "clock",
};

/** The written station overview under the H1. */
export function OverviewLead({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-4 space-y-3 text-[16px] leading-relaxed text-ink lg:mt-6 lg:max-w-3xl lg:space-y-4 lg:text-lg lg:leading-relaxed">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Traveler tips written from the station's data, then the hand-written local notes when the station has them. */
export function TravelerTips({
  overview,
  notesTitle,
  checked,
}: {
  overview: StationOverview;
  notesTitle: string;
  checked: string | null;
}) {
  return (
    <>
      {overview.tips.length ? (
        <div className="space-y-3 rounded-2xl bg-honey-soft px-4 py-4 text-[16px] leading-relaxed text-ink lg:max-w-3xl lg:space-y-4 lg:px-6 lg:py-5 lg:text-lg">
          {overview.tips.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {overview.notes.length ? (
        <div className={overview.tips.length ? "mt-4 lg:mt-6 lg:max-w-3xl" : "lg:max-w-3xl"}>
          <h3 className="text-[16px] font-extrabold tracking-tight text-ink lg:text-[19px]">{notesTitle}</h3>
          <ul className="mt-2 space-y-2 lg:mt-3 lg:space-y-3">
            {overview.notes.map((note) => (
              <li
                key={note.text}
                className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink lg:gap-3 lg:px-5 lg:py-4 lg:text-[16px]"
              >
                <Icon name={NOTE_ICONS[note.kind]} size={18} className="mt-0.5 shrink-0 text-honey-strong" />
                <span className="min-w-0">{note.text}</span>
              </li>
            ))}
          </ul>
          {checked ? <p className="mt-2 text-[12px] leading-relaxed text-ink-muted lg:text-[13px]">{checked}</p> : null}
        </div>
      ) : null}
    </>
  );
}
