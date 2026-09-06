/** International Direct Dialing (exit) prefixes by ISO2. Common carrier defaults. */
export const IDD_BY_ISO2: Record<string, string> = {
  AU: "0011",
  US: "011",
  CA: "011",
  GB: "00",
  NZ: "00",
  IE: "00",
  DE: "00",
  FR: "00",
  IT: "00",
  ES: "00",
  NL: "00",
  BE: "00",
  CH: "00",
  AT: "00",
  SE: "00",
  NO: "00",
  DK: "00",
  FI: "00",
  PL: "00",
  PT: "00",
  GR: "00",
  TR: "00",
  RU: "810",
  CN: "00",
  JP: "010",
  KR: "001",
  IN: "00",
  SG: "001",
  MY: "00",
  TH: "001",
  ID: "001",
  PH: "00",
  VN: "00",
  HK: "001",
  TW: "002",
  AE: "00",
  SA: "00",
  ZA: "00",
  BR: "00",
  MX: "00",
  AR: "00",
  CL: "00",
  CO: "00",
  IL: "00",
  EG: "00",
  NG: "009",
  KE: "000",
  PK: "00",
  BD: "00",
};

export function getIdd(iso2: string): string {
  return IDD_BY_ISO2[iso2.toUpperCase()] || "00";
}

/** Build landline-style sequence: IDD + country code + national number (no leading 0). */
export function buildDialSequence(opts: {
  fromIso2: string;
  toDial: string;
  nationalNumber?: string;
}): { idd: string; countryCode: string; national: string; full: string; plusForm: string; steps: string[] } {
  const idd = getIdd(opts.fromIso2);
  const countryCode = (opts.toDial || "").replace(/\D/g, "");
  let national = (opts.nationalNumber || "").replace(/\D/g, "");
  // Drop a single leading 0 (common trunk prefix) for international form
  if (national.startsWith("0") && national.length > 1) national = national.slice(1);
  const parts = [idd, countryCode, national].filter(Boolean);
  const full = parts.join(" ");
  const plusForm = national ? `+${countryCode}${national}` : `+${countryCode}`;
  const steps = [
    `Exit code (IDD) from your country: ${idd}`,
    `Country calling code: +${countryCode}`,
    national ? `National number (without leading 0): ${national}` : "Add the area/city code and local number",
    `Mobile tip: many phones accept ${plusForm} instead of IDD`,
  ];
  return { idd, countryCode, national, full, plusForm, steps };
}
