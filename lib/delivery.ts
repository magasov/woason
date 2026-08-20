import type { DeliveryMethod } from "./types";

const cityFactor: Record<string, number> = {
  Москва: 1,
  "Санкт-Петербург": 1.15,
  Казань: 1.25,
  Новосибирск: 1.55,
  Краснодар: 1.35,
  Екатеринбург: 1.4,
};

export const CITIES = Object.keys(cityFactor);

export function quoteDelivery(
  method: DeliveryMethod,
  city: string,
  weightKg: number,
) {
  const factor = cityFactor[city] ?? 1.4;
  const weight = Math.max(0.3, weightKg);

  if (method === "pickup") {
    return {
      price: 0,
      eta: "Сегодня — завтра",
      days: "встреча с продавцом",
    };
  }

  if (method === "cdek") {
    const price = Math.round(290 + factor * weight * 85);
    const from = Math.max(1, Math.round(factor));
    const to = from + 2;
    return {
      price,
      eta: `${from}–${to} дня`,
      days: "склад СДЭК / курьер",
    };
  }

  const price = Math.round(190 + factor * weight * 55);
  const from = 5 + Math.round((factor - 1) * 4);
  const to = from + 7;
  return {
    price,
    eta: `${from}–${to} дней`,
    days: "отделение Почты России",
  };
}

export function makeTrackNumber(method: DeliveryMethod) {
  const n = Math.floor(100000000 + Math.random() * 899999999);
  if (method === "cdek") return `CDEK${n}`;
  if (method === "pochta") return `14${String(n).slice(0, 12)}RU`;
  return `PICKUP-${n}`;
}
