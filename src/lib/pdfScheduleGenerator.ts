import { jsPDF } from 'jspdf';
import { PublicHoliday } from '../types';
import { getMemberEntitlements } from './memberEntitlements';

export interface CustomScheduleEvent {
  id: string;
  date: string;
  title: string;
  time?: string;
  category: 'work' | 'meeting' | 'personal' | 'milestone' | 'holiday' | 'travel' | 'deadline';
  notes?: string;
  color?: string;
  notify?: boolean;
  remindMinutesBefore?: number;
}

export interface PdfScheduleOptions {
  year: number;
  month: number;
  countryName: string;
  countryCode: string;
  selectedHolidays: PublicHoliday[];
  customEvents: CustomScheduleEvent[];
  orientation?: 'landscape' | 'portrait';
  includeAgenda?: boolean;
  includeWeekNumbers?: boolean;
  startWeekOnMonday?: boolean;
  notesText?: string;
  removeBranding?: boolean;
  multiMonthCount?: number;
  companyLabel?: string;
  /** Skip auto entitlement merge (internal multi-month loop) */
  _skipMemberGates?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SUN_FIRST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_MON_FIRST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const pad = (n: number) => n.toString().padStart(2, '0');

function applyMemberGates(options: PdfScheduleOptions): PdfScheduleOptions {
  if (options._skipMemberGates) return options;
  // Explicit flags win; otherwise fill from Supporter/Calendar entitlements
  if (
    options.removeBranding !== undefined ||
    options.multiMonthCount !== undefined ||
    options.companyLabel !== undefined
  ) {
    return options;
  }
  const ent = getMemberEntitlements();
  return {
    ...options,
    removeBranding: ent.removePdfBranding,
    multiMonthCount: ent.multiMonthPdf ? 3 : 1,
    companyLabel: ent.brandedPdf
      ? 'COMPANY CALENDAR'
      : ent.removePdfBranding
        ? 'PERSONAL CALENDAR SCHEDULE'
        : '',
  };
}

export function generateMonthlyPdf(options: PdfScheduleOptions): jsPDF {
  const {
    year,
    month,
    countryName,
    countryCode,
    selectedHolidays,
    customEvents,
    orientation = 'landscape',
    includeAgenda = true,
    includeWeekNumbers = true,
    startWeekOnMonday = false,
    notesText = '',
    removeBranding = false,
    companyLabel = '',
  } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const marginTop = 12;

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, marginTop, pageWidth - marginX * 2, 20, 3, 3, 'F');

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (removeBranding) {
    doc.text(companyLabel || 'PERSONAL CALENDAR SCHEDULE', marginX + 6, marginTop + 7);
  } else {
    doc.text('TIMEGOVERN · PRECISION TEMPORAL SCHEDULE', marginX + 6, marginTop + 7);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`${MONTH_NAMES[month].toUpperCase()} ${year}`, marginX + 6, marginTop + 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Region: ${countryName} (${countryCode}) | ${selectedHolidays.length} Holidays · ${customEvents.length} Events`,
    pageWidth - marginX - 6,
    marginTop + 13,
    { align: 'right' }
  );

  const gridTop = marginTop + 24;
  const availableWidth = pageWidth - marginX * 2;
  const dayNames = startWeekOnMonday ? DAYS_MON_FIRST : DAYS_SUN_FIRST;
  const weekNumColWidth = includeWeekNumbers ? 10 : 0;
  const dayColWidth = (availableWidth - weekNumColWidth) / 7;
  const headerHeight = 7;
  const footerHeight = 10;
  const availableGridHeight = pageHeight - gridTop - headerHeight - footerHeight - 8;
  const rowHeight = availableGridHeight / 6;

  let curX = marginX;
  if (includeWeekNumbers) {
    doc.setFillColor(30, 41, 59);
    doc.rect(curX, gridTop, weekNumColWidth, headerHeight, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Wk', curX + weekNumColWidth / 2, gridTop + 4.5, { align: 'center' });
    curX += weekNumColWidth;
  }
  for (let i = 0; i < 7; i++) {
    doc.setFillColor(30, 41, 59);
    doc.rect(curX, gridTop, dayColWidth, headerHeight, 'F');
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(dayNames[i].substring(0, 3).toUpperCase(), curX + dayColWidth / 2, gridTop + 4.5, {
      align: 'center',
    });
    curX += dayColWidth;
  }

  const firstOfMonth = new Date(year, month, 1);
  let startDow = firstOfMonth.getDay();
  if (startWeekOnMonday) startDow = (startDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const holidayMap = new Map(selectedHolidays.map((h) => [h.date, h]));
  const eventsByDate = new Map<string, typeof customEvents>();
  for (const e of customEvents) {
    const list = eventsByDate.get(e.date) || [];
    list.push(e);
    eventsByDate.set(e.date, list);
  }

  for (let row = 0; row < 6; row++) {
    const rowY = gridTop + headerHeight + row * rowHeight;
    curX = marginX;
    if (includeWeekNumbers) {
      const cellDay = row * 7 - startDow + 1;
      const mid = new Date(year, month, Math.max(1, Math.min(daysInMonth, cellDay + 3)));
      const oneJan = new Date(mid.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((mid.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
      doc.setFillColor(248, 250, 252);
      doc.rect(curX, rowY, weekNumColWidth, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(curX, rowY, weekNumColWidth, rowHeight, 'S');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text(String(weekNum), curX + weekNumColWidth / 2, rowY + 5, { align: 'center' });
      curX += weekNumColWidth;
    }
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      const dayNum = cellIndex - startDow + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      doc.setFillColor(inMonth ? 255 : 248, inMonth ? 255 : 250, inMonth ? 255 : 252);
      doc.rect(curX, rowY, dayColWidth, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(curX, rowY, dayColWidth, rowHeight, 'S');

      if (inMonth) {
        const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
        const isWeekend = startWeekOnMonday ? col >= 5 : col === 0 || col === 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(isWeekend ? 180 : 15, isWeekend ? 83 : 23, isWeekend ? 9 : 42);
        doc.text(String(dayNum), curX + 2, rowY + 5);

        const hol = holidayMap.get(dateStr);
        if (hol) {
          doc.setFontSize(5.5);
          doc.setTextColor(180, 83, 9);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(hol.name, dayColWidth - 3);
          doc.text(lines.slice(0, 2), curX + 1.5, rowY + 9);
        }
        const evts = eventsByDate.get(dateStr) || [];
        let ey = rowY + (hol ? 14 : 9);
        doc.setFontSize(5);
        for (const evt of evts.slice(0, hol ? 2 : 3)) {
          doc.setTextColor(37, 99, 235);
          const label = evt.time ? `${evt.time} ${evt.title}` : evt.title;
          doc.text(doc.splitTextToSize(label, dayColWidth - 3)[0], curX + 1.5, ey);
          ey += 3.2;
        }
      }
      curX += dayColWidth;
    }
  }

  if (notesText) {
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(notesText, availableWidth), marginX, pageHeight - footerHeight - 2);
  }

  const now = new Date();
  const timestampStr = removeBranding
    ? `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} UTC`
    : `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} UTC | TimeGovern High-Precision Engine`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(timestampStr, marginX, pageHeight - 4);
  doc.text('Page 1 of 1', pageWidth - marginX, pageHeight - 4, { align: 'right' });

  return doc;
}

/** Downloads 1 month (free) or 3 months logo-free (Supporter) when options omit explicit gates. */
export function downloadMonthlyPdfSchedule(options: PdfScheduleOptions): void {
  const gated = applyMemberGates(options);
  const count = Math.max(1, Math.min(gated.multiMonthCount || 1, 6));
  const countrySlug = gated.countryCode ? `-${gated.countryCode}` : '';
  const brand = gated.removeBranding ? 'Calendar' : 'TimeGovern-Schedule';
  for (let i = 0; i < count; i++) {
    let m = gated.month + i;
    let y = gated.year;
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    const doc = generateMonthlyPdf({
      ...gated,
      year: y,
      month: m,
      multiMonthCount: 1,
      _skipMemberGates: true,
    });
    const suffix = count > 1 ? `-of-${count}` : '';
    doc.save(`${brand}-${y}-${pad(m + 1)}${suffix}${countrySlug}.pdf`);
  }
}
