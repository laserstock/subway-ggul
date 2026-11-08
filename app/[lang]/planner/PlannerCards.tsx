import { ExternalLink, Footprints, MapPin, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { PlanLink, PlanSpot } from "../../_lib/planner";
import { plannerImageSrc, searchImage, type PlannerImage } from "../../_lib/plannerImages";
import { exitWalkText, fillCopy } from "../../_lib/plannerParams";
import type { PlannerCopy } from "../../_lib/plannerText";
import { CATEGORY_ICONS, TAG_ICONS } from "./plannerIcons";

export function ExampleBadge({ copy }: { copy: PlannerCopy }) {
  return (
    <span className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/85 backdrop-blur-sm">
      {copy.examplePhoto}
    </span>
  );
}

export function Photo({ image, alt, sizes, children }: { image: PlannerImage; alt: string; sizes: string; children?: ReactNode }) {
  return (
    <span className="relative block aspect-[4/3] overflow-hidden bg-surface-muted">
      <Image src={plannerImageSrc(image)} alt={alt} fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      {children}
    </span>
  );
}

const CARD_SIZES = "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 75vw";

/** Horizontal swipe row on phones, a grid from `sm` up. */
export function CardRail({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul
      aria-label={label}
      className="-mx-1 mt-2.5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-3"
    >
      {children}
    </ul>
  );
}

export const railItem = "w-[76%] shrink-0 snap-start sm:w-auto";

/** A hand-picked spot with an example photo, its exit and walk, and a Google Maps link. */
export function SpotPhotoCard({ spot, number, copy }: { spot: PlanSpot; number?: number; copy: PlannerCopy }) {
  const MainIcon: LucideIcon = spot.tags[0] ? TAG_ICONS[spot.tags[0]] : CATEGORY_ICONS[spot.categories[0] ?? "culture"];
  const main = spot.tags[0] ? copy.tags[spot.tags[0]] : copy.categories[spot.categories[0] ?? "culture"].short;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.13)]">
      <Photo image={spot.image} alt={`${spot.name} (${copy.examplePhoto})`} sizes={CARD_SIZES}>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-extrabold text-neutral-900 shadow-sm">
          {number ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-black text-white">{number}</span>
          ) : null}
          <MainIcon size={12} aria-hidden />
          {main}
        </span>
        <ExampleBadge copy={copy} />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-lg bg-[#f5b800] px-2 py-0.5 text-[11.5px] font-extrabold text-neutral-900">
          <Footprints size={12} aria-hidden />
          {exitWalkText(copy, spot.exit, spot.walk)}
        </span>
      </Photo>
      <div className="flex flex-1 flex-col p-3.5">
        <h5 className="break-words text-[15px] font-extrabold leading-snug text-ink">{spot.name}</h5>
        <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-ink-muted">{spot.blurb}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="flex min-w-0 flex-wrap gap-1">
            {spot.categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category];
              return (
                <span key={category} className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 text-[11px] font-bold text-ink-muted">
                  <CategoryIcon size={11} aria-hidden />
                  {copy.categories[category].short}
                </span>
              );
            })}
          </span>
          <a
            href={spot.maps}
            target="_blank"
            rel="noopener"
            aria-label={fillCopy(copy.onGoogleMaps, { name: spot.name })}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11.5px] font-bold text-white transition hover:bg-honey active:scale-95"
          >
            <MapPin size={12} aria-hidden />
            {copy.googleMaps}
          </a>
        </div>
      </div>
    </article>
  );
}

/** A Google Maps search for places we haven't hand-picked, shown as a photo card. */
export function SearchPhotoCard({ link, seed, copy }: { link: PlanLink; seed: string; copy: PlannerCopy }) {
  const LinkIcon: LucideIcon = link.tag ? TAG_ICONS[link.tag] : link.category ? CATEGORY_ICONS[link.category] : MapPin;
  return (
    <a
      href={link.maps}
      target="_blank"
      rel="noopener"
      className="group relative flex h-full min-h-[180px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-neutral-900 text-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
    >
      <Image
        src={plannerImageSrc(searchImage(link, seed))}
        alt=""
        fill
        sizes={CARD_SIZES}
        className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <ExampleBadge copy={copy} />
      <span className="relative block p-3.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm">
          <LinkIcon size={12} aria-hidden className="text-[#f5b800]" />
          {link.tag ? copy.tags[link.tag] : copy.moreNearby}
        </span>
        <span className="mt-1.5 block break-words text-[15px] font-extrabold leading-snug">{link.label}</span>
        <span className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-white/75 group-hover:text-[#f5b800]">
          {copy.googleMaps}
          <ExternalLink size={12} aria-hidden />
        </span>
      </span>
    </a>
  );
}
