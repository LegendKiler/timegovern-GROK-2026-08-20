/**
 * LAB pay / tax tables — estimates only, not official advice.
 * Australia = default (resident 2025–26 style brackets from public ATO-aligned sites).
 * Other countries use simplified published structures for comparison.
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

/** AU resident income tax 2025–26 style (Stage 3 aligned public tables) */
export function auIncomeTax(taxable: number): number {
  if (taxable <= 18200) return 0;
  if (taxable <= 45000) return (taxable - 18200) * 0.16;
  if (taxable <= 135000) return 4288 + (taxable - 45000) * 0.3;
  if (taxable <= 190000) return 31288 + (taxable - 135000) * 0.37;
  return 51638 + (taxable - 190000) * 0.45;
}

export function auMedicare(taxable: number, exempt: boolean): number {
  if (exempt) return 0;
  // Simplified: full 2% above phase-in; phase-in omitted for lab clarity
  if (taxable <= 26000) return 0;
  return taxable * 0.02;
}

/** Simplified HECS/HELP marginal-style estimate (illustrative rates) */
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

export const AU_SUPER_RATE = 0.12; // SG rate used in lab

/** US simplified: federal single + FICA only (no state — optional flat later) */
export function usFederalTax(taxable: number): number {
  // Rough 2026 single brackets after std deduction applied outside
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

/** UK simplified England PAYE + employee NI (illustrative) */
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
  if (gross <= 180000) return 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.3 + (gross - 78100) * 0.33;
  return 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.3 + (180000 - 78100) * 0.33 + (gross - 180000) * 0.39;
}

export function caFederalTax(taxable: number): number {
  if (taxable <= 57375) return taxable * 0.15;
  if (taxable <= 114750) return 57375 * 0.15 + (taxable - 57375) * 0.205;
  if (taxable <= 177882) return 57375 * 0.15 + (114750 - 57375) * 0.205 + (taxable - 114750) * 0.26;
  if (taxable <= 253414) return 57375 * 0.15 + (114750 - 57375) * 0.205 + (177882 - 114750) * 0.26 + (taxable - 177882) * 0.29;
  return 57375 * 0.15 + (114750 - 57375) * 0.205 + (177882 - 114750) * 0.26 + (253414 - 177882) * 0.29 + (taxable - 253414) * 0.33;
}

export function sgTax(chargeable: number): number {
  // Simplified resident progressive sketch
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

/** Flat effective estimates for remaining countries (lab) */
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
  incomeTax: number;
  socialOrLevy: number;
  studentLoan: number;
  other: number;
  netAnnual: number;
  employerPensionOrSuper: number;
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
  usStateFlatRate?: number; // 0 for TX/FL etc.
}): PayBreakdown {
  const meta = PAY_COUNTRIES.find((c) => c.code === opts.country)!;
  const gross = toAnnual(opts.grossInput, opts.frequency, opts.hoursPerWeek ?? 38);
  const notes: string[] = [];
  let incomeTax = 0;
  let socialOrLevy = 0;
  let studentLoan = 0;
  let other = 0;
  let employerPensionOrSuper = 0;

  switch (opts.country) {
    case 'AU': {
      incomeTax = auIncomeTax(gross);
      socialOrLevy = auMedicare(gross, !!opts.medicareExempt);
      studentLoan = auHecs(gross, !!opts.hasHecs);
      employerPensionOrSuper = opts.includeSuperOnTop !== false ? gross * AU_SUPER_RATE : 0;
      notes.push('AU resident rates (lab estimate, 2025–26 style).');
      notes.push(`Super Guarantee ${AU_SUPER_RATE * 100}% shown on top of salary (not deducted from take-home).`);
      if (opts.hasHecs) notes.push('HELP/HECS estimate using public threshold table.');
      break;
    }
    case 'US': {
      const stdDed = 16100;
      const taxable = Math.max(0, gross - stdDed);
      incomeTax = usFederalTax(taxable);
      const fica = usFica(gross);
      socialOrLevy = fica.ss + fica.medicare;
      const stateRate = opts.usStateFlatRate ?? 0.05;
      other = gross * stateRate;
      notes.push('US: federal (simplified single) + FICA + optional flat state (default 5%; set 0 for no-tax states).');
      break;
    }
    case 'UK': {
      incomeTax = ukIncomeTax(gross);
      socialOrLevy = ukNI(gross);
      notes.push('UK England-style PAYE + employee NI (simplified lab model).');
      break;
    }
    case 'NZ': {
      incomeTax = nzTax(gross);
      notes.push('NZ PAYE progressive bands (simplified).');
      break;
    }
    case 'CA': {
      incomeTax = caFederalTax(gross);
      socialOrLevy = Math.min(gross, 68500) * 0.0595; // rough CPP employee
      notes.push('Canada federal tax + rough CPP; provincial tax not fully modelled.');
      break;
    }
    case 'SG': {
      incomeTax = sgTax(gross);
      notes.push('Singapore resident progressive sketch (simplified).');
      break;
    }
    default: {
      incomeTax = simpleEffectiveTax(opts.country, gross);
      notes.push('Simplified effective-rate model for this country (lab).');
    }
  }

  const totalDed = incomeTax + socialOrLevy + studentLoan + other;
  const netAnnual = Math.max(0, gross - totalDed);
  const effectiveRate = gross > 0 ? (totalDed / gross) * 100 : 0;

  return {
    country: opts.country,
    currency: meta.currency,
    symbol: meta.symbol,
    grossAnnual: gross,
    incomeTax,
    socialOrLevy,
    studentLoan,
    other,
    netAnnual,
    employerPensionOrSuper,
    effectiveRate,
    notes,
  };
}
