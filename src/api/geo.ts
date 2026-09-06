/** Visitor geo from Cloudflare request.cf (production) or safe defaults (local). */
export type GeoPayload = {
  ok: boolean;
  source: "cloudflare" | "fallback" | "query";
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
};

function json(data: GeoPayload, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "private, max-age=300",
    },
  });
}

export async function handleGeo(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Optional overrides for testing: /api/geo?country=LY&city=Tripoli&timezone=Africa/Tripoli
  const qCountry = url.searchParams.get("country");
  const qCity = url.searchParams.get("city");
  const qTz = url.searchParams.get("timezone");
  if (qCountry || qCity || qTz) {
    return json({
      ok: true,
      source: "query",
      country: qCountry ? qCountry.toUpperCase() : null,
      city: qCity,
      region: null,
      timezone: qTz,
      latitude: null,
      longitude: null,
    });
  }

  // Cloudflare Workers populate request.cf
  const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
  if (cf && (cf.country || cf.city || cf.timezone)) {
    const lat = typeof cf.latitude === "string" ? parseFloat(cf.latitude) : (cf as any).latitude;
    const lon = typeof cf.longitude === "string" ? parseFloat(cf.longitude) : (cf as any).longitude;
    return json({
      ok: true,
      source: "cloudflare",
      country: cf.country ? String(cf.country).toUpperCase() : null,
      city: cf.city ? String(cf.city) : null,
      region: cf.region ? String(cf.region) : null,
      timezone: cf.timezone ? String(cf.timezone) : null,
      latitude: Number.isFinite(lat) ? Number(lat) : null,
      longitude: Number.isFinite(lon) ? Number(lon) : null,
    });
  }

  // Local vite / missing cf → Melbourne HQ fallback (site is AU-based)
  return json({
    ok: true,
    source: "fallback",
    country: "AU",
    city: "Melbourne",
    region: "Victoria",
    timezone: "Australia/Melbourne",
    latitude: -37.8136,
    longitude: 144.9631,
  });
}

// Minimal typing so we don't depend on workers-types cf shape at compile time in all envs
type IncomingRequestCfProperties = {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: string | number;
  longitude?: string | number;
};
