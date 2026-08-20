import { NextResponse } from "next/server";
import { asList, cdekFetch, type CdekCity } from "@/lib/cdek-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim() || "";
  if (name.length < 2) return NextResponse.json({ cities: [] });

  const result = await cdekFetch(
    `/v2/location/suggest/cities?name=${encodeURIComponent(name)}&country_code=RU`,
  );
  if (!result.ok) {
    return NextResponse.json({ cities: [], error: result.data.error }, { status: result.status });
  }
  const cities = asList<CdekCity>(result.data).slice(0, 12);
  return NextResponse.json({ cities });
}
