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

export function TrainLogo() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1e3a8a] text-white shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2c-4.6 0-8 1.35-8 4.2V15c0 1.8 1.4 3.3 3.2 3.6V21h-1.4v1.5h5.1V21h2.2v1.5h5.1V21h-1.4v-2.4c1.8-.3 3.2-1.8 3.2-3.6V6.2C20 3.35 16.6 2 12 2zm-4.2 15.1a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zm8.4 0a1.35 1.35 0 1 1 0-2.7 1.35 1.35 0 0 1 0 2.7zM18 12.2H6V7.1h12v5.1z" />
      </svg>
    </div>
  );
}
