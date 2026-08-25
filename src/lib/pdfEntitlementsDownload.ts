/**
 * F3 — apply Supporter/Calendar entitlements when downloading PDF schedules.
 * Use this from CalendarPillar instead of raw downloadMonthlyPdfSchedule.
 */
import type { PdfScheduleOptions } from './pdfScheduleGenerator';
import { downloadMonthlyPdfSchedule } from './pdfScheduleGenerator';
import { getMemberEntitlements } from './memberEntitlements';

export function downloadPdfWithMemberGates(
  options: Omit<PdfScheduleOptions, 'removeBranding' | 'multiMonthCount' | 'companyLabel'>
): void {
  const ent = getMemberEntitlements();
  const multi = ent.multiMonthPdf ? 3 : 1;
  const removeBranding = ent.removePdfBranding;
  const companyLabel = ent.brandedPdf
    ? 'COMPANY CALENDAR'
    : removeBranding
      ? 'PERSONAL CALENDAR SCHEDULE'
      : '';

  // Prefer extended options when pdfScheduleGenerator supports them
  const full = {
    ...options,
    removeBranding,
    multiMonthCount: multi,
    companyLabel,
  } as PdfScheduleOptions;

  try {
    downloadMonthlyPdfSchedule(full);
  } catch (e) {
    // Fallback if generator does not yet accept new fields
    downloadMonthlyPdfSchedule(options as PdfScheduleOptions);
    if (multi > 1) {
      console.info('Multi-month PDF requires updated pdfScheduleGenerator (removeBranding/multiMonthCount).');
    }
  }
}
