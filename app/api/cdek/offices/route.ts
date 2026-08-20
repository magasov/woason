import { NextResponse } from "next/server";
import { asList, cdekFetch, mapCdekOffice, type CdekCity, type CdekOffice } from "@/lib/cdek-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city")?.trim() || "";
  if (city.length < 2) return NextResponse.json({ offices: [] });

  const loc = await cdekFetch(
    `/v2/location/suggest/cities?name=${encodeURIComponent(city)}&country_code=RU`,
  );
  const cities = asList<CdekCity>(loc.data);
  const code = cities[0]?.code;
  if (!code) return NextResponse.json({ offices: [] });

  const result = await cdekFetch(
    `/v2/deliverypoints?city_code=${code}&type=PVZ&country_code=RU&is_handout=true&size=20`,
  );
  if (!result.ok) {
    return NextResponse.json({ offices: [], error: result.data.error }, { status: result.status });
  }
  const offices = asList<CdekOffice>(result.data).slice(0, 30).map(mapCdekOffice);
  return NextResponse.json({ offices, cityCode: code });
}
