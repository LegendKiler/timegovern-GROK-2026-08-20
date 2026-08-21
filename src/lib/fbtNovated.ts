/**
 * LAB: Fringe benefits & novated lease estimates.
 * Australia uses public FBT car statutory / operating-cost style formulas.
 * Other countries: simplified company-car / benefit-in-kind sketches.
 * Not official tax advice.
 */

export type FbtCountry = 'AU' | 'US' | 'UK' | 'NZ' | 'CA' | 'SG' | 'DE' | 'IE';

export const FBT_COUNTRIES: { code: FbtCountry; name: string; currency: string; symbol: string }[] = [
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: '$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$' },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€' },
];

/** AU FBT year rates (lab — illustrative current-style) */
export const AU_FBT = {
  /** FBT rate */
  rate: 0.47,
  /** Type 1 gross-up (GST credits) */
  grossUpType1: 2.0802,
  /** Type 2 gross-up */
  grossUpType2: 1.8868,
  /** Statutory percentages by km band (simplified modern AU car fringe) */
  statutoryByKm: (km: number) => {
    // Post-reform many use flat 20% base value; keep classic bands as option
    if (km < 15000) return 0.26;
    if (km < 25000) return 0.2;
    if (km < 40000) return 0.11;
    return 0.07;
  },
  flatStatutory: 0.2,
};

export type AuCarMethod = 'statutory_flat' | 'statutory_km' | 'operating_cost';

export interface AuFbtCarInput {
  baseValue: number; // cost incl GST for statutory
  kmPerYear: number;
  businessUsePercent: number; // 0–100 for operating cost
  operatingCosts: number; // fuel, insurance, rego, maint (annual)
  method: AuCarMethod;
  hasGstCredits: boolean; // type 1 vs type 2
}

export interface AuFbtCarResult {
  taxableValue: number;
  grossedUp: number;
  fbtPayable: number;
  employeePackageImpact: number; // rough after-tax cost if employee-borne via package
  notes: string[];
}

export function calcAuCarFbt(input: AuFbtCarInput): AuFbtCarResult {
  const notes: string[] = [];
  let taxableValue = 0;

  if (input.method === 'operating_cost') {
    const privatePct = Math.max(0, Math.min(100, 100 - input.businessUsePercent)) / 100;
    taxableValue = input.operatingCosts * privatePct;
    notes.push('Operating cost method: private-use share of running costs.');
  } else {
    const rate =
      input.method === 'statutory_km'
        ? AU_FBT.statutoryByKm(input.kmPerYear)
        : AU_FBT.flatStatutory;
    taxableValue = input.baseValue * rate;
    notes.push(
      input.method === 'statutory_km'
        ? `Statutory method (km band): ${(rate * 100).toFixed(0)}% of base value.`
        : `Statutory flat 20% of base value (common modern approach).`
    );
  }

  const grossUp = input.hasGstCredits ? AU_FBT.grossUpType1 : AU_FBT.grossUpType2;
  const grossedUp = taxableValue * grossUp;
  const fbtPayable = grossedUp * AU_FBT.rate;
  // Employee impact rough: if FBT passed on / salary sacrificed, ~ tax effect
  const employeePackageImpact = fbtPayable; // employer FBT; packaging often aims to neutralise

  notes.push(`Gross-up factor ${grossUp} (${input.hasGstCredits ? 'Type 1' : 'Type 2'}).`);
  notes.push(`FBT rate ${(AU_FBT.rate * 100).toFixed(0)}%. Estimates only.`);

  return { taxableValue, grossedUp, fbtPayable, employeePackageImpact, notes };
}

export interface NovatedLeaseInput {
  vehiclePrice: number;
  residualPercent: number; // e.g. 30–50
  termYears: number;
  interestRatePa: number; // finance rate %
  annualRunning: number; // fuel, insurance, rego, service
  annualKm: number;
  employeeMarginalRate: number; // 0.32 etc for rough tax save
  includeFbt: boolean;
  baseValueForFbt: number;
}

export interface NovatedLeaseResult {
  financedAmount: number;
  residual: number;
  monthlyFinance: number;
  monthlyRunning: number;
  monthlyTotalPreTax: number;
  estimatedAnnualFbt: number;
  estimatedMonthlyPostTaxCost: number;
  notes: string[];
}

/** Simple P&I monthly payment */
function monthlyLoanPayment(principal: number, annualRate: number, years: number): number {
  if (years <= 0) return principal;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcNovatedLease(input: NovatedLeaseInput): NovatedLeaseResult {
  const residual = input.vehiclePrice * (input.residualPercent / 100);
  const financedAmount = Math.max(0, input.vehiclePrice - residual);
  const monthlyFinance = monthlyLoanPayment(financedAmount, input.interestRatePa, input.termYears);
  const monthlyRunning = input.annualRunning / 12;
  const monthlyTotalPreTax = monthlyFinance + monthlyRunning;

  let estimatedAnnualFbt = 0;
  if (input.includeFbt) {
    const fbt = calcAuCarFbt({
      baseValue: input.baseValueForFbt || input.vehiclePrice,
      kmPerYear: input.annualKm,
      businessUsePercent: 20,
      operatingCosts: input.annualRunning,
      method: 'statutory_flat',
      hasGstCredits: true,
    });
    estimatedAnnualFbt = fbt.fbtPayable;
  }

  // Rough post-tax: pre-tax deduction saves tax at marginal rate; FBT may be employer cost in package
  const annualPreTax = monthlyTotalPreTax * 12;
  const taxSave = annualPreTax * input.employeeMarginalRate;
  const estimatedMonthlyPostTaxCost = (annualPreTax - taxSave + estimatedAnnualFbt) / 12;

  return {
    financedAmount,
    residual,
    monthlyFinance,
    monthlyRunning,
    monthlyTotalPreTax,
    estimatedAnnualFbt,
    estimatedMonthlyPostTaxCost,
    notes: [
      'Novated lease: finance + running often paid from pre-tax salary (AU).',
      'Residual balloon due at end of term.',
      'FBT may be packaged; actual deals vary by provider.',
      'Not a quote — lab estimate only.',
    ],
  };
}

/** Simplified company car / BIK for other countries */
export function calcInternationalCarBenefit(opts: {
  country: FbtCountry;
  listPrice: number;
  co2OrBand?: number; // UK CO2 g/km optional
  privateUsePercent?: number;
}): { taxableBenefit: number; notes: string[] } {
  const p = opts.listPrice;
  const priv = (opts.privateUsePercent ?? 100) / 100;

  switch (opts.country) {
    case 'UK': {
      // Simplified: ~10–30% of list by CO2; default 20%
      const co2 = opts.co2OrBand ?? 120;
      let pct = 0.15;
      if (co2 > 100) pct = 0.2;
      if (co2 > 130) pct = 0.25;
      if (co2 > 160) pct = 0.3;
      return {
        taxableBenefit: p * pct,
        notes: ['UK company car BIK % of list price by CO2 band (simplified lab).'],
      };
    }
    case 'US': {
      // Personal use of company car — simplified annual inclusion
      return {
        taxableBenefit: p * 0.05 * priv + 1500 * priv,
        notes: ['US: rough personal-use auto inclusion (not lease inclusion tables).'],
      };
    }
    case 'NZ': {
      return {
        taxableBenefit: p * 0.2 * priv,
        notes: ['NZ motor vehicle fringe benefit — simplified % of cost.'],
      };
    }
    case 'CA': {
      return {
        taxableBenefit: p * 2 / 100 * 12 * priv, // ~2%/mo standby rough
        notes: ['Canada standby charge style sketch (2%/mo of cost × private use).'],
      };
    }
    case 'SG': {
      return {
        taxableBenefit: p * 0.03 * priv,
        notes: ['Singapore car benefit sketch (not full IRAS tables).'],
      };
    }
    case 'DE': {
      return {
        taxableBenefit: p * 0.01 * 12 * priv, // 1% rule monthly
        notes: ['Germany 1% rule style (1% of list per month for private use).'],
      };
    }
    case 'IE': {
      return {
        taxableBenefit: p * 0.3 * priv,
        notes: ['Ireland BIK on company cars — simplified %.'],
      };
    }
    default:
      return { taxableBenefit: p * 0.2 * priv, notes: ['Generic estimate.'] };
  }
}
