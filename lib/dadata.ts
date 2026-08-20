export type DadataSuggestKind = "address" | "city";

export type DadataSuggestion = {
  value: string;
  unrestricted_value: string;
  data: {
    postal_code?: string | null;
    country?: string | null;
    region?: string | null;
    region_with_type?: string | null;
    city?: string | null;
    city_with_type?: string | null;
    settlement?: string | null;
    settlement_with_type?: string | null;
    street_with_type?: string | null;
    house?: string | null;
    flat?: string | null;
    kladr_id?: string | null;
    fias_id?: string | null;
  };
};

export function cityFromSuggestion(s: DadataSuggestion) {
  const d = s.data;
  return (d.city || d.settlement || d.region || s.value.replace(/^г\s+/i, "")).trim();
}

export async function suggestAddress(
  query: string,
  kind: DadataSuggestKind = "address",
  cityBoost?: string,
): Promise<DadataSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await fetch("/api/dadata/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, kind, cityBoost }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { suggestions?: DadataSuggestion[] };
  return data.suggestions || [];
}

export async function detectCityByIp(): Promise<string | null> {
  const res = await fetch("/api/dadata/iplocate");
  if (!res.ok) return null;
  const data = (await res.json()) as { city?: string | null };
  return data.city || null;
}
