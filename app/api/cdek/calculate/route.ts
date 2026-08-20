import { NextResponse } from "next/server";
import { cdekFetch, etaFromTariff, pickCdekTariff, type CdekTariff } from "@/lib/cdek-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    fromCity?: string;
    toCity?: string ;
    weightKg?: number;
  };
  const fromCity = (body.fromCity || "").trim();
  const toCity = (body.toCity || "").trim();
  const grams = Math.max(100, Math.round((body.weightKg || 0.5) * 1000));
  if (!fromCity || !toCity) {
    return NextResponse.json({ error: "Нужны города отправителя и получателя" }, { status: 400 });
  }

  const payload = {
    type: 1,
    currency: 1,
    lang: "rus",
    from_location: { city: fromCity, country_code: "RU" },
    to_location: { city: toCity, country_code: "RU" },
    packages: [{ weight: grams }],
  };

  let result = await cdekFetch("/v2/calculator/tarifflist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.ok || !(result.data.tariff_codes as CdekTariff[] | undefined)?.length) {
    result = await cdekFetch("/v2/calculator/tarifflist", {
      method: "POST",
      body: JSON.stringify({ ...payload, type: 2 }),
    });
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.data.error || "Не удалось посчитать СДЭК" }, { status: result.status });
  }

  const tariffs = (result.data.tariff_codes as CdekTariff[]) || [];
  const best = pickCdekTariff(tariffs);
  if (!best) {
    return NextResponse.json({ price: null, eta: null, tariffs: [] });
  }
  return NextResponse.json({
    price: Math.round(best.delivery_sum || 0),
    eta: etaFromTariff(best),
    tariffCode: best.tariff_code,
    tariffName: best.tariff_name || "СДЭК",
    tariffs: tariffs.slice(0, 8).map((t) => ({
      code: t.tariff_code,
      name: t.tariff_name,
      price: Math.round(t.delivery_sum || 0),
      eta: etaFromTariff(t),
    })),
  });
}
