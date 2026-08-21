/**
 * LAB pay / tax tables — estimates only, not official tax advice.
 * AU default with LITO, MLS, resident types, salary sacrifice.
 * US: federal + FICA + all 50 states + DC (simplified flat or effective rates).
 */

export type PayCountry =
  | 'AU'
  | 'US'
  | 'UK'
  | 'NZ'
  | 'CA'
  | 'SG'
  | 'DE'
  | 'IE'
  | 'IN'
  | 'JP';

export const PAY_COUNTRIES: {
  code: PayCountry;
  name: string;
  currency: string;
  symbol: string;
}[] = [
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: '$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
];

export type PayFrequency = 'annual' | 'monthly' | 'fortnightly' | 'weekly' | 'hourly';

export type AuResidentType = 'resident' | 'foreign' | 'whm';

export function toAnnual(amount: number, freq: PayFrequency, hoursPerWeek = 38): number {
  switch (freq) {
    case 'annual':
      return amount;
    case 'monthly':
      return amount * 12;
    case 'fortnightly':
      return amount * 26;
    case 'weekly':
      return amount * 52;
    case 'hourly':
      return amount * hoursPerWeek * 52;
    default:
      return amount;
  }
}

export function fromAnnual(annual: number, freq: PayFrequency, hoursPerWeek = 38): number {
  switch (freq) {
    case 'annual':
      return annual;
    case 'monthly':
      return annual / 12;
    case 'fortnightly':
      return annual / 26;
    case 'weekly':
      return annual / 52;
    case 'hourly':
      return annual / (hoursPerWeek * 52);
    default:
      return annual;
  }
}

function progressiveTax(
  income: number,
  brackets: { upTo: number; rate: number; base: number }[]
): number {
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (income <= prev) break;
    const slice = Math.min(income, b.upTo) - prev;
    if (slice > 0) tax = b.base + slice * b.rate;
    if (income <= b.upTo) return Math.max(0, tax);
    prev = b.upTo;
  }
  return Math.max(0, tax);
}

/** AU resident income tax 2025–26 style */
export function auIncomeTaxResident(taxable: number): number {
  if (taxable <= 18200) return 0;
  if (taxable <= 45000) return (taxable - 18200) * 0.16;
  if (taxable <= 135000) return 4288 + (taxable - 45000) * 0.3;
  if (taxable <= 190000) return 31288 + (taxable - 135000) * 0.37;
  return 51638 + (taxable - 190000) * 0.45;
}

/** Foreign resident — no tax-free threshold (simplified) */
export function auIncomeTaxForeign(taxable: number): number {
  if (taxable <= 135000) return taxable * 0.3;
  if (taxable <= 190000) return 40500 + (taxable - 135000) * 0.37;
  return 60850 + (taxable - 190000) * 0.45;
}

/** Working holiday maker — simplified WHM rates */
export function auIncomeTaxWhm(taxable: number): number {
  if (taxable <= 45000) return taxable * 0.15;
  if (taxable <= 135000) return 6750 + (taxable - 45000) * 0.3;
  if (taxable <= 190000) return 33750 + (taxable - 135000) * 0.37;
  return 54100 + (taxable - 190000) * 0.45;
}

/** Low Income Tax Offset (LITO) — simplified 2025–26 style max $700 */
export function auLito(taxable: number): number {
  if (taxable <= 37500) return 700;
  if (taxable <= 45000) return 700 - (taxable - 37500) * 0.05;
  if (taxable <= 66667) return 325 - (taxable - 45000) * 0.015;
  return 0;
}

export function auMedicare(taxable: number, exempt: boolean): number {
  if (exempt) return 0;
  // Low-income phase-in simplified
  if (taxable <= 26000) return 0;
  if (taxable <= 32500) return (taxable - 26000) * 0.1; // phase-in approx
  return taxable * 0.02;
}

/** Medicare Levy Surcharge — single, no private hospital (lab tiers) */
export function auMls(
  income: number,
  hasPrivateHospital: boolean,
  family: boolean
): number {
  if (hasPrivateHospital) return 0;
  // Single thresholds (illustrative 2025–26 style)
  const t1 = family ? 202000 : 101000;
  const t2 = family ? 236000 : 118000;
  const t3 = family ? 315000 : 158000;
  if (income <= t1) return 0;
  if (income <= t2) return income * 0.01;
  if (income <= t3) return income * 0.0125;
  return income * 0.015;
}

export function auHecs(repaymentIncome: number, hasDebt: boolean): number {
  if (!hasDebt || repaymentIncome < 56155) return 0;
  const tiers: [number, number][] = [
    [64837, 0.01],
    [68726, 0.02],
    [72851, 0.025],
    [77222, 0.03],
    [81855, 0.035],
    [86766, 0.04],
    [91973, 0.045],
    [97491, 0.05],
    [103341, 0.055],
    [109542, 0.06],
    [116115, 0.065],
    [123081, 0.07],
    [130466, 0.075],
    [138294, 0.08],
    [146593, 0.085],
    [155388, 0.09],
    [164711, 0.095],
    [Infinity, 0.1],
  ];
  for (const [up, rate] of tiers) {
    if (repaymentIncome <= up) return repaymentIncome * rate;
  }
  return repaymentIncome * 0.1;
}

export const AU_SUPER_RATE = 0.12;

/** US states + DC — simplified effective / flat rates for lab (0 = no broad state income tax) */
export const US_STATES: { code: string; name: string; rate: number }[] = [
  { code: 'AL', name: 'Alabama', rate: 0.05 },
  { code: 'AK', name: 'Alaska', rate: 0 },
  { code: 'AZ', name: 'Arizona', rate: 0.025 },
  { code: 'AR', name: 'Arkansas', rate: 0.039 },
  { code: 'CA', name: 'California', rate: 0.093 },
  { code: 'CO', name: 'Colorado', rate: 0.044 },
  { code: 'CT', name: 'Connecticut', rate: 0.05 },
  { code: 'DE', name: 'Delaware', rate: 0.066 },
  { code: 'DC', name: 'District of Columbia', rate: 0.085 },
  { code: 'FL', name: 'Florida', rate: 0 },
  { code: 'GA', name: 'Georgia', rate: 0.0539 },
  { code: 'HI', name: 'Hawaii', rate: 0.08 },
  { code: 'ID', name: 'Idaho', rate: 0.058 },
  { code: 'IL', name: 'Illinois', rate: 0.0495 },
  { code: 'IN', name: 'Indiana', rate: 0.0305 },
  { code: 'IA', name: 'Iowa', rate: 0.057 },
  { code: 'KS', name: 'Kansas', rate: 0.057 },
  { code: 'KY', name: 'Kentucky', rate: 0.04 },
  { code: 'LA', name: 'Louisiana', rate: 0.0425 },
  { code: 'ME', name: 'Maine', rate: 0.0715 },
  { code: 'MD', name: 'Maryland', rate: 0.0575 },
  { code: 'MA', name: 'Massachusetts', rate: 0.05 },
  { code: 'MI', name: 'Michigan', rate: 0.0425 },
  { code: 'MN', name: 'Minnesota', rate: 0.0785 },
  { code: 'MS', name: 'Mississippi', rate: 0.05 },
  { code: 'MO', name: 'Missouri', rate: 0.048 },
  { code: 'MT', name: 'Montana', rate: 0.059 },
  { code: 'NE', name: 'Nebraska', rate: 0.0584 },
  { code: 'NV', name: 'Nevada', rate: 0 },
  { code: 'NH', name: 'New Hampshire', rate: 0 },
  { code: 'NJ', name: 'New Jersey', rate: 0.0637 },
  { code: 'NM', name: 'New Mexico', rate: 0.059 },
  { code: 'NY', name: 'New York', rate: 0.0685 },
  { code: 'NC', name: 'North Carolina', rate: 0.045 },
  { code: 'ND', name: 'North Dakota', rate: 0.025 },
  { code: 'OH', name: 'Ohio', rate: 0.035 },
  { code: 'OK', name: 'Oklahoma', rate: 0.0475 },
  { code: 'OR', name: 'Oregon', rate: 0.099 },
  { code: 'PA', name: 'Pennsylvania', rate: 0.0307 },
  { code: 'RI', name: 'Rhode Island', rate: 0.0599 },
  { code: 'SC', name: 'South Carolina', rate: 0.064 },
  { code: 'SD', name: 'South Dakota', rate: 0 },
  { code: 'TN', name: 'Tennessee', rate: 0 },
  { code: 'TX', name: 'Texas', rate: 0 },
  { code: 'UT', name: 'Utah', rate: 0.0465 },
  { code: 'VT', name: 'Vermont', rate: 0.0875 },
  { code: 'VA', name: 'Virginia', rate: 0.0575 },
  { code: 'WA', name: 'Washington', rate: 0 },
  { code: 'WV', name: 'West Virginia', rate: 0.065 },
  { code: 'WI', name: 'Wisconsin', rate: 0.0765 },
  { code: 'WY', name: 'Wyoming', rate: 0 },
];

export function usFederalTax(taxable: number): number {
  const brackets = [
    { upTo: 11925, rate: 0.1, base: 0 },
    { upTo: 48475, rate: 0.12, base: 1192.5 },
    { upTo: 103350, rate: 0.22, base: 5578.5 },
    { upTo: 197300, rate: 0.24, base: 17651 },
    { upTo: 250525, rate: 0.32, base: 40199 },
    { upTo: 626350, rate: 0.35, base: 57231 },
    { upTo: Infinity, rate: 0.37, base: 168809.75 },
  ];
  return progressiveTax(taxable, brackets);
}

export function usFica(gross: number): { ss: number; medicare: number } {
  const ssWageBase = 184500;
  const ss = Math.min(gross, ssWageBase) * 0.062;
  let medicare = gross * 0.0145;
  if (gross > 200000) medicare += (gross - 200000) * 0.009;
  return { ss, medicare };
}

export function ukIncomeTax(taxable: number): number {
  const pa = 12570;
  const inc = Math.max(0, taxable - pa);
  if (inc <= 37700) return inc * 0.2;
  if (inc <= 125140 - pa) return 37700 * 0.2 + (inc - 37700) * 0.4;
  return 37700 * 0.2 + (125140 - pa - 37700) * 0.4 + (inc - (125140 - pa)) * 0.45;
}

export function ukNI(gross: number): number {
  const pt = 12570;
  const uel = 50270;
  if (gross <= pt) return 0;
  if (gross <= uel) return (gross - pt) * 0.08;
  return (uel - pt) * 0.08 + (gross - uel) * 0.02;
}

export function nzTax(gross: number): number {
  if (gross <= 15600) return gross * 0.105;
  if (gross <= 53500) return 15600 * 0.105 + (gross - 15600) * 0.175;
  if (gross <= 78100) return 15600 * 0.105 + (53500 - 15600) * 0.175 + (gross - 53500) * 0.3;
  if (gross <= 180000)
    return 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.3 + (gross - 78100) * 0.33;
  return (
    15600 * 0.105 +
    (53500 - 15600) * 0.175 +
    (78100 - 53500) * 0.3 +
    (180000 - 78100) * 0.33 +
    (gross - 180000) * 0.39
  );
}

export function caFederalTax(taxable: number): number {
  if (taxable <= 57375) return taxable * 0.15;
  if (taxable <= 114750) return 57375 * 0.15 + (taxable - 57375) * 0.205;
  if (taxable <= 177882)
    return 57375 * 0.15 + (114750 - 57375) * 0.205 + (taxable - 114750) * 0.26;
  if (taxable <= 253414)
    return (
      57375 * 0.15 +
      (114750 - 57375) * 0.205 +
      (177882 - 114750) * 0.26 +
      (taxable - 177882) * 0.29
    );
  return (
    57375 * 0.15 +
    (114750 - 57375) * 0.205 +
    (177882 - 114750) * 0.26 +
    (253414 - 177882) * 0.29 +
    (taxable - 253414) * 0.33
  );
}

export function sgTax(chargeable: number): number {
  if (chargeable <= 20000) return 0;
  if (chargeable <= 30000) return (chargeable - 20000) * 0.02;
  if (chargeable <= 40000) return 200 + (chargeable - 30000) * 0.035;
  if (chargeable <= 80000) return 550 + (chargeable - 40000) * 0.07;
  if (chargeable <= 120000) return 3350 + (chargeable - 80000) * 0.115;
  if (chargeable <= 160000) return 7950 + (chargeable - 120000) * 0.15;
  if (chargeable <= 200000) return 13950 + (chargeable - 160000) * 0.18;
  if (chargeable <= 240000) return 21150 + (chargeable - 200000) * 0.19;
  if (chargeable <= 280000) return 28750 + (chargeable - 240000) * 0.195;
  if (chargeable <= 320000) return 36550 + (chargeable - 280000) * 0.2;
  return 44550 + (chargeable - 320000) * 0.22;
}

export function simpleEffectiveTax(country: PayCountry, gross: number): number {
  const rates: Partial<Record<PayCountry, number>> = {
    DE: 0.35,
    IE: 0.28,
    IN: 0.2,
    JP: 0.25,
  };
  return gross * (rates[country] || 0.25);
}

export interface PayBreakdown {
  country: PayCountry;
  currency: string;
  symbol: string;
  grossAnnual: number;
  taxableIncome: number;
  incomeTax: number;
  lito: number;
  incomeTaxAfterOffset: number;
  socialOrLevy: number;
  mls: number;
  studentLoan: number;
  other: number;
  salarySacrifice: number;
  netAnnual: number;
  employerPensionOrSuper: number;
  employeeExtraSuper: number;
  effectiveRate: number;
  notes: string[];
}

export function calculatePay(opts: {
  country: PayCountry;
  grossInput: number;
  frequency: PayFrequency;
  hoursPerWeek?: number;
  hasHecs?: boolean;
  medicareExempt?: boolean;
  includeSuperOnTop?: boolean;
  usStateCode?: string;
  auResident?: AuResidentType;
  hasPrivateHospital?: boolean;
  familyMls?: boolean;
  /** Pre-tax salary sacrifice / packaging amount (annual) */
  salarySacrificeAnnual?: number;
  /** Extra employee concessional super (annual, from package) */
  extraSuperAnnual?: number;
}): PayBreakdown {
  const meta = PAY_COUNTRIES.find((c) => c.code === opts.country)!;
  const gross = toAnnual(opts.grossInput, opts.frequency, opts.hoursPerWeek ?? 38);
  const sacrifice = Math.max(0, Math.min(opts.salarySacrificeAnnual || 0, gross));
  const extraSuper = Math.max(0, opts.extraSuperAnnual || 0);
  const notes: string[] = [];
  let incomeTax = 0;
  let lito = 0;
  let socialOrLevy = 0;
  let mls = 0;
  let studentLoan = 0;
  let other = 0;
  let employerPensionOrSuper = 0;
  let taxableIncome = gross;

  switch (opts.country) {
    case 'AU': {
      const resident = opts.auResident || 'resident';
      // Salary sacrifice reduces taxable; extra super often via sacrifice
      taxableIncome = Math.max(0, gross - sacrifice - extraSuper);
      if (resident === 'foreign') {
        incomeTax = auIncomeTaxForeign(taxableIncome);
        notes.push('Foreign resident rates (no tax-free threshold).');
      } else if (resident === 'whm') {
        incomeTax = auIncomeTaxWhm(taxableIncome);
        notes.push('Working holiday maker rates (simplified).');
      } else {
        incomeTax = auIncomeTaxResident(taxableIncome);
        lito = auLito(taxableIncome);
        notes.push('Australian resident + LITO applied where eligible.');
      }
      socialOrLevy = auMedicare(taxableIncome, !!opts.medicareExempt || resident !== 'resident');
      mls =
        resident === 'resident'
          ? auMls(taxableIncome, !!opts.hasPrivateHospital, !!opts.familyMls)
          : 0;
      studentLoan = auHecs(taxableIncome, !!opts.hasHecs);
      employerPensionOrSuper =
        opts.includeSuperOnTop !== false ? gross * AU_SUPER_RATE : 0;
      notes.push(`Super Guarantee ${AU_SUPER_RATE * 100}% on OTE (shown on top).`);
      if (sacrifice > 0 || extraSuper > 0) {
        notes.push('Pre-tax salary sacrifice / packaging reduces taxable income (lab model).');
      }
      if (mls > 0) notes.push('Medicare Levy Surcharge estimated (no private hospital).');
      break;
    }
    case 'US': {
      const stdDed = 16100;
      taxableIncome = Math.max(0, gross - sacrifice - stdDed);
      incomeTax = usFederalTax(taxableIncome);
      const fica = usFica(Math.max(0, gross - sacrifice));
      socialOrLevy = fica.ss + fica.medicare;
      const st = US_STATES.find((s) => s.code === (opts.usStateCode || 'CA'));
      other = Math.max(0, gross - sacrifice) * (st?.rate ?? 0.05);
      notes.push(`US federal (single) + FICA + ${st?.name || 'state'} (~${((st?.rate || 0) * 100).toFixed(2)}% effective lab rate).`);
      if (sacrifice > 0) notes.push('Pre-tax 401(k)/HSA-style reduction applied to wages (simplified).');
      break;
    }
    case 'UK': {
      taxableIncome = Math.max(0, gross - sacrifice);
      incomeTax = ukIncomeTax(taxableIncome);
      socialOrLevy = ukNI(taxableIncome);
      notes.push('UK England-style PAYE + NI; sacrifice modelled as lower gross.');
      break;
    }
    case 'NZ': {
      taxableIncome = Math.max(0, gross - sacrifice);
      incomeTax = nzTax(taxableIncome);
      notes.push('NZ PAYE (simplified).');
      break;
    }
    case 'CA': {
      taxableIncome = Math.max(0, gross - sacrifice);
      incomeTax = caFederalTax(taxableIncome);
      socialOrLevy = Math.min(taxableIncome, 68500) * 0.0595;
      notes.push('Canada federal + rough CPP; provincial not fully modelled.');
      break;
    }
    case 'SG': {
      taxableIncome = Math.max(0, gross - sacrifice);
      incomeTax = sgTax(taxableIncome);
      notes.push('Singapore resident progressive sketch.');
      break;
    }
    default: {
      taxableIncome = Math.max(0, gross - sacrifice);
      incomeTax = simpleEffectiveTax(opts.country, taxableIncome);
      notes.push('Simplified effective-rate model.');
    }
  }

  const incomeTaxAfterOffset = Math.max(0, incomeTax - lito);
  const totalDed = incomeTaxAfterOffset + socialOrLevy + mls + studentLoan + other;
  // Net from remaining cash after tax; sacrifice already removed from take-home path
  const netAnnual = Math.max(0, gross - sacrifice - extraSuper - totalDed);
  const effectiveRate = gross > 0 ? ((gross - netAnnual - (opts.includeSuperOnTop !== false ? 0 : 0)) / gross) * 100 : 0;
  // Effective on cash: tax+levy+sacrifice not in bank
  const cashOut = totalDed + sacrifice + extraSuper;
  const effectiveCash = gross > 0 ? (cashOut / gross) * 100 : 0;

  return {
    country: opts.country,
    currency: meta.currency,
    symbol: meta.symbol,
    grossAnnual: gross,
    taxableIncome,
    incomeTax,
    lito,
    incomeTaxAfterOffset,
    socialOrLevy,
    mls,
    studentLoan,
    other,
    salarySacrifice: sacrifice + extraSuper,
    netAnnual,
    employerPensionOrSuper,
    employeeExtraSuper: extraSuper,
    effectiveRate: effectiveCash,
    notes,
  };
}
