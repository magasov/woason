import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-paper">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path
            fill="currentColor"
            d="M6 8h5l2.4 9.2L16 8h0.1L18.6 17.2 21 8h5l-4.2 16h-5.2L16 14.4 15.4 24H10.2z"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[19px] font-extrabold tracking-tight text-ink">WOAson</span>
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
            ВОАЗОН
          </span>
        </span>
      )}
    </Link>
  );
}
