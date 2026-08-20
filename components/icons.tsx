export function IconSearch({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({
  className = "h-5 w-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21s-6.7-4.35-9.3-7.7C.7 10.7 1.2 6.8 4.4 5.2 6.6 4.1 9 4.7 12 7.2c3-2.5 5.4-3.1 7.6-2 3.2 1.6 3.7 5.5 1.7 8.1C18.7 16.65 12 21 12 21z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCart({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 7h15l-1.4 8.2A2 2 0 0 1 17.6 17H9.2A2 2 0 0 1 7.3 15.4L5 4H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconUser({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.2c.8-3.2 3.4-5 7-5s6.2 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconStar({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M10 1.8 12.5 7l5.8.5-4.4 3.8 1.4 5.7L10 14.6 4.7 17l1.4-5.7L1.7 7.5 7.5 7z"
      />
    </svg>
  );
}

export function IconPlay({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

export function IconShorts({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.6 9.2v5.6L15.4 12z" fill="currentColor" />
    </svg>
  );
}

export function IconClose({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconChat({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4.5 3.5V6.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShare({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 10.8 15.8 6.4M8.2 13.2l7.6 4.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function IconStore({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 10.5 5.2 6h13.6L20 10.5v1a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3-3v-1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M6 14.2V20h12v-5.8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTruck({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 7h11v9H3zM14 10h5l3 3.5V16h-8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="17.5" r="1.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
