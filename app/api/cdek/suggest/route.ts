import { NextResponse } from "next/server";
import { asList, cdekFetch, mapCdekOffice, type CdekCity, type CdekOffice } from "@/lib/cdek-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ cities: [], offices: [] });

  const codeLike = /^[A-Za-z]{2,4}\d{1,4}$/.test(q.replace(/\s/g, ""));

  const [citiesRes, byCodeRes] = await Promise.all([
    cdekFetch(`/v2/location/suggest/cities?name=${encodeURIComponent(q)}&country_code=RU`),
    codeLike
      ? cdekFetch(`/v2/deliverypoints?code=${encodeURIComponent(q.toUpperCase())}&country_code=RU`)
      : Promise.resolve({ ok: true as const, status: 200, data: [] as unknown }),
  ]);

  const cities = asList<CdekCity>(citiesRes.data).slice(0, 8);
  let offices = asList<CdekOffice>(byCodeRes.ok ? byCodeRes.data : []).map(mapCdekOffice);

  const cityCode = cities[0]?.code;
  if (cityCode) {
    const points = await cdekFetch(
      `/v2/deliverypoints?city_code=${cityCode}&type=ALL&country_code=RU&is_handout=true&size=30`,
    );
    if (points.ok) {
      const extra = asList<CdekOffice>(points.data).map(mapCdekOffice);
      const seen = new Set(offices.map((o) => o.code));
      for (const o of extra) {
        if (!seen.has(o.code)) {
          seen.add(o.code);
          offices.push(o);
        }
      }
    }
  }

  const needle = q.toLowerCase();
  const filtered = offices.filter((o) =>
    `${o.code} ${o.name} ${o.address} ${o.city}`.toLowerCase().includes(needle),
  );
  offices = (filtered.length ? filtered : offices).slice(0, 20);

  return NextResponse.json({
    cities: cities.map((c) => ({
      code: c.code,
      city: c.city || c.full_name || q,
      fullName: c.full_name || c.city || q,
    })),
    offices,
  });
}
