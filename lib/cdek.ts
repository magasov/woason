export type CdekQuote = {
  price: number | null;
  eta: string | null;
  tariffCode?: number;
  tariffName?: string;
};

export type CdekOfficeOption = {
  code: string;
  name: string;
  address: string;
  workTime: string;
  type: string;
  city: string;
};

export type CdekCityOption = {
  code: number;
  city: string;
  fullName: string;
};

export async function calculateCdek(fromCity: string, toCity: string, weightKg: number): Promise<CdekQuote | null> {
  if (!fromCity.trim() || !toCity.trim()) return null;
  const res = await fetch("/api/cdek/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromCity, toCity, weightKg }),
  });
  if (!res.ok) return null;
  return (await res.json()) as CdekQuote;
}

export async function loadCdekOffices(city: string): Promise<CdekOfficeOption[]> {
  if (city.trim().length < 2) return [];
  const res = await fetch(`/api/cdek/offices?city=${encodeURIComponent(city)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { offices?: CdekOfficeOption[] };
  return data.offices || [];
}

export async function suggestCdek(query: string): Promise<{ cities: CdekCityOption[]; offices: CdekOfficeOption[] }> {
  const q = query.trim();
  if (q.length < 2) return { cities: [], offices: [] };
  const res = await fetch(`/api/cdek/suggest?q=${encodeURIComponent(q)}`);
  if (!res.ok) return { cities: [], offices: [] };
  const data = (await res.json()) as { cities?: CdekCityOption[]; offices?: CdekOfficeOption[] };
  return { cities: data.cities || [], offices: data.offices || [] };
}
