import { NextResponse } from "next/server";
import { dadataRequest } from "@/lib/dadata-server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    query?: string;
    kind?: "address" | "city";
    cityBoost?: string;
  };
  const query = (body.query || "").trim().slice(0, 300);
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const payload: Record<string, unknown> = {
    query,
    count: 8,
    locations: [{ country_iso_code: "RU" }],
  };
  if (body.kind === "city") {
    payload.from_bound = { value: "city" };
    payload.to_bound = { value: "settlement" };
  }
  if (body.cityBoost?.trim()) {
    payload.locations_boost = [{ city: body.cityBoost.trim() }];
  }

  const result = await dadataRequest("/suggest/address", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    return NextResponse.json({ suggestions: [], error: result.data.error }, { status: result.status });
  }
  return NextResponse.json(result.data);
}
