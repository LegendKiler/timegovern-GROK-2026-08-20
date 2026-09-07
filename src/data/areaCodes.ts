/** Major area / city dial codes — Phase CC2a (AU + US). Expand later (GB, etc.). */
export type AreaCodeRow = {
  code: string;       // digits after country calling code, e.g. "2" or "212"
  label: string;      // city / region name
  note?: string;
};

export const AREA_CODES: Record<string, AreaCodeRow[]> = {
  AU: [
    { code: "2", label: "Sydney / NSW / ACT (geographic 02)" },
    { code: "3", label: "Melbourne / VIC / TAS (geographic 03)" },
    { code: "7", label: "Brisbane / QLD (geographic 07)" },
    { code: "8", label: "Adelaide / Perth / SA / WA / NT (geographic 08)" },
    { code: "4", label: "Mobile (04…)" },
    { code: "1", label: "Local-rate / special (e.g. 13/18 prefix context)" },
  ],
  US: [
    { code: "212", label: "New York, NY (Manhattan)" },
    { code: "646", label: "New York, NY" },
    { code: "917", label: "New York, NY (overlay / mobile)" },
    { code: "718", label: "New York City (outer boroughs)" },
    { code: "213", label: "Los Angeles, CA" },
    { code: "310", label: "Los Angeles / West LA, CA" },
    { code: "323", label: "Los Angeles, CA" },
    { code: "424", label: "Los Angeles, CA" },
    { code: "312", label: "Chicago, IL" },
    { code: "773", label: "Chicago, IL" },
    { code: "872", label: "Chicago, IL" },
    { code: "415", label: "San Francisco, CA" },
    { code: "628", label: "San Francisco, CA" },
    { code: "650", label: "San Mateo / Silicon Valley, CA" },
    { code: "408", label: "San Jose, CA" },
    { code: "206", label: "Seattle, WA" },
    { code: "425", label: "Seattle suburbs, WA" },
    { code: "202", label: "Washington, DC" },
    { code: "703", label: "Northern Virginia / DC area" },
    { code: "301", label: "Maryland / DC area" },
    { code: "305", label: "Miami, FL" },
    { code: "786", label: "Miami, FL" },
    { code: "404", label: "Atlanta, GA" },
    { code: "470", label: "Atlanta, GA" },
    { code: "678", label: "Atlanta, GA" },
    { code: "214", label: "Dallas, TX" },
    { code: "469", label: "Dallas, TX" },
    { code: "972", label: "Dallas, TX" },
    { code: "713", label: "Houston, TX" },
    { code: "281", label: "Houston, TX" },
    { code: "832", label: "Houston, TX" },
    { code: "512", label: "Austin, TX" },
    { code: "602", label: "Phoenix, AZ" },
    { code: "480", label: "Phoenix area, AZ" },
    { code: "303", label: "Denver, CO" },
    { code: "720", label: "Denver, CO" },
    { code: "617", label: "Boston, MA" },
    { code: "857", label: "Boston, MA" },
    { code: "215", label: "Philadelphia, PA" },
    { code: "267", label: "Philadelphia, PA" },
    { code: "702", label: "Las Vegas, NV" },
    { code: "725", label: "Las Vegas, NV" },
    { code: "808", label: "Hawaii" },
    { code: "907", label: "Alaska" },
  ],
};

export function getAreaCodes(iso2: string): AreaCodeRow[] {
  const key = (iso2 || "").toUpperCase();
  return AREA_CODES[key] || [];
}
