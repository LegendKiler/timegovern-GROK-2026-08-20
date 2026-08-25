/**
 * F3 — apply Supporter/Calendar entitlements when downloading PDF schedules.
 */
import type { PdfScheduleOptions } from './pdfScheduleGenerator';
import { downloadMonthlyPdfSchedule } from './pdfScheduleGenerator';
import { getMemberEntitlements } from './memberEntitlements';

export type PdfDownloadInput = Omit<
  PdfScheduleOptions,
  'removeBranding' | 'multiMonthCount' | 'companyLabel'
>;

/** Free: 1 month + TimeGovern branding. Supporter: 3 months + logo-free header. */
export function downloadPdfWithMemberGates(options: PdfDownloadInput): void {
  const ent = getMemberEntitlements();
  downloadMonthlyPdfSchedule({
    ...options,
    removeBranding: ent.removePdfBranding,
    multiMonthCount: ent.multiMonthPdf ? 3 : 1,
    companyLabel: ent.brandedPdf
      ? 'COMPANY CALENDAR'
      : ent.removePdfBranding
        ? 'PERSONAL CALENDAR SCHEDULE'
        : '',
  });
}
