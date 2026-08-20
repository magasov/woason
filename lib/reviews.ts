import type { Order, PendingReview, Product, Review, User } from "./types";

export type ReviewEligibility =
  | { status: "guest" }
  | { status: "owner" }
  | { status: "none" }
  | { status: "pending"; orderId: string }
  | { status: "in_transit"; orderId: string }
  | { status: "eligible"; orderId: string }
  | { status: "done"; orderId?: string };

const BLOCKED: Order["status"][] = ["cancelled", "refunded"];
const TRANSIT: Order["status"][] = ["label_printed", "in_transit"];

export function isProductOwner(user: User | null | undefined, product: Product) {
  if (!user) return false;
  return user.id === product.sellerId || user.seller?.id === product.sellerId;
}

export function ordersWithProduct(orders: Order[], userId: string, productId: string) {
  return orders.filter(
    (o) =>
      o.buyerId === userId &&
      !BLOCKED.includes(o.status) &&
      o.items.some((item) => item.productId === productId),
  );
}

export function hasUserReviewed(reviews: Review[] | undefined, userId: string, productId?: string) {
  return (reviews ?? []).some((r) => {
    if (r.userId && r.userId === userId) {
      return productId ? !r.productId || r.productId === productId : true;
    }
    return false;
  });
}

export function reviewEligibility(opts: {
  user: User | null;
  product: Product;
  orders: Order[];
  myReviews?: Review[];
  pending?: PendingReview[];
}): ReviewEligibility {
  const { user, product, orders, myReviews = [], pending = [] } = opts;
  if (!user) return { status: "guest" };
  if (isProductOwner(user, product)) return { status: "owner" };

  const mine = ordersWithProduct(orders, user.id, product.id);
  const pendingRow = pending.find((row) => row.productId === product.id);
  const delivered = mine.find((o) => o.status === "delivered");
  const done =
    hasUserReviewed(product.reviews, user.id, product.id) ||
    myReviews.some((r) => r.productId === product.id && (!r.userId || r.userId === user.id));

  if (done) return { status: "done", orderId: pendingRow?.orderId || delivered?.id };
  if (pendingRow) return { status: "eligible", orderId: pendingRow.orderId };
  if (delivered) return { status: "eligible", orderId: delivered.id };

  if (!mine.length) return { status: "none" };

  const transit = mine.find((o) => TRANSIT.includes(o.status));
  if (transit) return { status: "in_transit", orderId: transit.id };

  return { status: "pending", orderId: mine[0].id };
}

export function formatReviewDate(date: string) {
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) return date;
  const t = Date.parse(date);
  if (Number.isNaN(t)) return date;
  return new Date(t).toLocaleDateString("ru-RU");
}

export function ratingHistogram(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    counts[star - 1] += 1;
  }
  const total = reviews.length || 1;
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: counts[star - 1],
    ratio: counts[star - 1] / total,
  }));
}

export function avgRating(reviews: Review[], fallback = 0) {
  if (!reviews.length) return fallback;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function applyReviewStats(product: Product, review: Review): Product {
  const reviews = [review, ...(product.reviews ?? []).filter((r) => r.id !== review.id)];
  const prevCount = product.reviewsCount || product.reviews?.length || 0;
  const wasNew = !(product.reviews ?? []).some((r) => r.id === review.id);
  const reviewsCount = wasNew ? prevCount + 1 : prevCount;
  const rating = wasNew
    ? Number((((product.rating || 0) * prevCount + review.rating) / Math.max(1, reviewsCount)).toFixed(1))
    : Number((reviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, reviews.length)).toFixed(1));
  return { ...product, reviews, reviewsCount, rating };
}

export function pendingReviewItems(opts: {
  userId: string;
  orders: Order[];
  catalog: Product[];
  myReviews?: Review[];
}) {
  const reviewed = new Set<string>();
  for (const p of opts.catalog) {
    for (const r of p.reviews ?? []) {
      if (r.userId === opts.userId) reviewed.add(r.productId || p.id);
    }
  }
  for (const r of opts.myReviews ?? []) {
    if (r.userId === opts.userId && r.productId) reviewed.add(r.productId);
  }

  const rows: {
    orderId: string;
    productId: string;
    title: string;
    price: number;
    image: string;
    deliveredAt: string;
  }[] = [];

  for (const order of opts.orders) {
    if (order.buyerId !== opts.userId || order.status !== "delivered") continue;
    for (const item of order.items) {
      if (reviewed.has(item.productId)) continue;
      if (rows.some((row) => row.productId === item.productId)) continue;
      rows.push({
        orderId: order.id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        image: item.image,
        deliveredAt: order.createdAt,
      });
    }
  }
  return rows;
}

export function reviewsForSeller(catalog: Product[], sellerId: string) {
  const rows: { product: Product; review: Review }[] = [];
  for (const product of catalog) {
    if (product.sellerId !== sellerId) continue;
    for (const review of product.reviews ?? []) {
      rows.push({ product, review: { ...review, productId: review.productId || product.id } });
    }
  }
  return rows.sort((a, b) => b.review.date.localeCompare(a.review.date));
}
