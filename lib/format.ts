import type { Condition, DeliveryMethod, OrderStatus, SellerKind, SellerTradeType } from "./types";

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

export function discountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function isGoodPrice(price: number, oldPrice?: number) {
  return discountPercent(price, oldPrice) >= 30;
}

export const sellerKindLabel: Record<SellerKind, string> = {
  shop: "Магазин",
  private: "Частник",
};

export const tradeTypeLabel: Record<SellerTradeType, string> = {
  dropship: "Дропшиппинг",
  retail: "Розница",
  wholesale: "Опт",
};

export const tradeTypeHint: Record<SellerTradeType, string> = {
  dropship: "Дропшиппинг: поставщик хранит и отправляет. Покупатели этого не видят.",
  retail: "Розница — продажа поштучно.",
  wholesale: "Опт — партии для магазинов и перепродавцов.",
};

export function publicTradeType(type?: SellerTradeType): SellerTradeType | undefined {
  if (!type) return undefined;
  if (type === "dropship") return "retail";
  return type;
}

export const conditionLabel: Record<Condition, string> = {
  new: "Новое",
  used: "Б/у",
};

export const deliveryLabel: Record<DeliveryMethod, string> = {
  cdek: "СДЭК",
  pochta: "Почта России",
  pickup: "Самовывоз",
};

export const statusLabel: Record<OrderStatus, string> = {
  placed: "Оформлен",
  awaiting_payment: "Ждёт оплату",
  paid: "Оплачен",
  awaiting_shipment: "Ожидает отправки",
  label_printed: "Этикетка напечатана",
  in_transit: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
  refunded: "Возврат",
};

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}
