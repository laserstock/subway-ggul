export function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.8 3.8 6 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-6-3.8-9s1.3-6.2 3.8-9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function LocateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The app's train mark, drawn in `currentColor`. */
export function TrainMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="2.5" width="14" height="15" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5 10h14" stroke="currentColor" strokeWidth="2" />
      <path d="M10 5.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="13.6" r="1.3" fill="currentColor" />
      <circle cx="15" cy="13.6" r="1.3" fill="currentColor" />
      <path d="M8.5 21.5l1.6-3.6M15.5 21.5l-1.6-3.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TrainLogo() {
  return (
    <span className="flex h-9 w-9 items-center justify-center text-honey" aria-hidden>
      <TrainMark />
    </span>
  );
}

export function PinIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 21.5s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0c0 5.1-6.5 11.2-6.5 11.2z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.85l-5.5 2.9 1.05-6.12L3.1 9.3l6.15-.9z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
