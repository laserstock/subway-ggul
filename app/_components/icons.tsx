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

export function ElevatorIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="3" width="17" height="18" rx="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 15.5V8.5M6.6 10.9 9 8.5l2.4 2.4M15 8.5v7M12.6 13.1 15 15.5l2.4-2.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RestroomIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="7.5" cy="4.6" r="2" />
      <path d="M5.6 8.2h3.8c.6 0 1.1.5 1.1 1.1V14H9.3v6.2H5.7V14H4.5V9.3c0-.6.5-1.1 1.1-1.1z" />
      <circle cx="16.5" cy="4.6" r="2" />
      <path d="M15.3 8.2h2.4l2.8 6.6h-2.1v5.4h-3.6v-5.4h-2.1z" />
      <path d="M12 3.5v17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** Door with an outward arrow, like station exit signage. */
export function ExitIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M13 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 12h9M16.5 8.5 20 12l-3.5 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Ring-to-dot S-curve: a trip from one station to another. */
export function RouteIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8.5v3.5a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0.1 3.6"
      />
      <circle cx="6" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="18" cy="19" r="3" fill="currentColor" />
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
