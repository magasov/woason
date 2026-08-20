import type { SellerKind, SellerTradeType } from "@/lib/types";
import { publicTradeType, sellerKindLabel, tradeTypeLabel } from "@/lib/format";

export function SellerBadge({ kind }: { kind: SellerKind }) {
  const shop = kind === "shop";
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        shop ? "bg-ink text-paper" : "bg-stone-700 text-white"
      }`}
    >
      {sellerKindLabel[kind]}
    </span>
  );
}

export function TradeBadge({
  type,
  revealDropship = false,
}: {
  type?: SellerTradeType;
  revealDropship?: boolean;
}) {
  const shown = revealDropship ? type : publicTradeType(type);
  if (!shown) return null;
  return (
    <span className="inline-flex items-center rounded-md bg-paper/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink ring-1 ring-stone-300">
      {tradeTypeLabel[shown]}
    </span>
  );
}
