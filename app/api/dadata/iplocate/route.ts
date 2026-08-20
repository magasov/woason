import { NextResponse } from "next/server";
import { cityFromSuggestion, type DadataSuggestion } from "@/lib/dadata";
import { clientIp, dadataRequest, isPrivateIp } from "@/lib/dadata-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const publicIp = ip && !isPrivateIp(ip) ? ip : null;

  const result = publicIp
    ? await dadataRequest("/iplocate/address", {
        method: "POST",
        body: JSON.stringify({ ip: publicIp }),
      })
    : await dadataRequest("/iplocate/address", { method: "GET" });

  if (!result.ok) {
    return NextResponse.json({ city: null, error: result.data.error }, { status: result.status });
  }

  const location = result.data.location as DadataSuggestion | null | undefined;
  if (!location) return NextResponse.json({ city: null });
  return NextResponse.json({ city: cityFromSuggestion(location), location });
}
