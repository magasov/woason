"use client";

import { SafeImage } from "@/components/safe-image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { cart, findProduct, setQty } = useStore();
  const rows = cart
    .map((c) => {
      const product = c.product || findProduct(c.productId);
      return product ? { ...c, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Корзина</h1>
      {!rows.length ? (
        <p className="mt-8 text-zinc-500">
          Пока пусто. <Link href="/" className="text-ember">В ленту</Link>
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {rows.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-3 rounded-2xl bg-paper p-3">
                <Link href={`/product/${product.id}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                  <SafeImage src={product.image} alt="" fill className="object-cover" sizes="80px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.id}`} className="line-clamp-2 font-medium">
                    {product.title}
                  </Link>
                  <p className="mt-1 font-bold">{formatPrice(product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className="h-8 w-8 rounded-lg bg-zinc-100" onClick={() => setQty(product.id, qty - 1)}>
                      −
                    </button>
                    <span>{qty}</span>
                    <button type="button" className="h-8 w-8 rounded-lg bg-zinc-100" onClick={() => setQty(product.id, qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-paper p-4">
            <p className="text-lg font-bold">Итого {formatPrice(total)}</p>
            <Link href="/checkout" className="rounded-xl bg-ink px-5 py-3 font-semibold text-paper">
              К оформлению
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
