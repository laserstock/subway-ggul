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

export function HomeIcon({
  size = 20,
  className = "",
  doorColor = "currentColor",
}: {
  size?: number;
  className?: string;
  doorColor?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.8 10.4 12 3.6l8.2 6.8v8.6a1.8 1.8 0 0 1-1.8 1.8H5.6a1.8 1.8 0 0 1-1.8-1.8z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.6 20.8v-4.6a2.4 2.4 0 0 1 4.8 0v4.6" stroke={doorColor} strokeWidth="2.2" strokeLinecap="round" />
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="7.2" cy="5" r="1.7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.4 8.6h3.6c.55 0 1 .45 1 1V13H8.6v6.2H5.8V13H4.4V9.6c0-.55.45-1 1-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16.8" cy="5" r="1.7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M15.4 8.6h2.8l2.6 6.2h-2v5.4h-3.4v-5.4h-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 3.8v16.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
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

export function BellIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.2 10.2a5.8 5.8 0 0 1 11.6 0v3.4l1.4 2.6H4.8l1.4-2.6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 19.2a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SpeakerIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4.5 9.5h3.2L13 5.8v12.4l-5.3-3.7H4.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16.2 9.2a3.4 3.4 0 0 1 0 5.6M18.4 7a6 6 0 0 1 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MuteIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4.5 9.5h3.2L13 5.8v12.4l-5.3-3.7H4.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 9.5 20 14.5M20 9.5 16 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TransferIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 7h11.5M15.2 3.8 18.5 7l-3.3 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H5.5M8.8 20.2 5.5 17l3.3-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalkIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="13.2" cy="4.6" r="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10.2 21.2 12 14.8l-2.4-2.6 2.2-3.8h2.6l1.4 3.2 2.6 1.4M12 14.8l2.8 6.4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlagIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 21V4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 5h9.2l-1.6 3.4 1.6 3.4H6.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function DoorIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6.5 20.5V5.2A1.7 1.7 0 0 1 8.2 3.5h7.6A1.7 1.7 0 0 1 17.5 5.2v15.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M5 20.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14.2" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 9.5 12 15.5 18 9.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
