import { jsPDF } from 'jspdf';
import { PublicHoliday } from '../types';

export interface CustomScheduleEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
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
  month: number; // 0-11
  countryName: string;
  countryCode: string;
  selectedHolidays: PublicHoliday[];
  customEvents: CustomScheduleEvent[];
  orientation?: 'landscape' | 'portrait';
  includeAgenda?: boolean;
  includeWeekNumbers?: boolean;
  startWeekOnMonday?: boolean;
  notesText?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_SUN_FIRST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_MON_FIRST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const pad = (n: number) => n.toString().padStart(2, '0');

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
  } = options;

  // Initialize jsPDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 12;
  const marginTop = 12;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(marginX, marginTop, pageWidth - marginX * 2, 20, 3, 3, 'F');

  // Title: "TIMEGOVERN • TEMPORAL SCHEDULE"
  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TIMEGOVERN • PRECISION TEMPORAL SCHEDULE', marginX + 6, marginTop + 7);

  // Month & Year Large Title
  const monthTitle = `${MONTH_NAMES[month].toUpperCase()} ${year}`;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(monthTitle, marginX + 6, marginTop + 15);

  // Right Header: Country & Event counts
  const totalHolidays = selectedHolidays.length;
  const totalEvents = customEvents.length;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `Region: ${countryName} (${countryCode}) | ${totalHolidays} Holidays • ${totalEvents} Events`,
    pageWidth - marginX - 6,
    marginTop + 13,
    { align: 'right' }
  );

  // Layout parameters for Calendar Grid
  const gridTop = marginTop + 24;
  const availableWidth = pageWidth - marginX * 2;
  
  // If agenda is included in landscape, allocate right sidebar for agenda or bottom area
  let gridWidth = availableWidth;
  let agendaWidth = 0;
  
  const hasAgenda = includeAgenda && (totalHolidays > 0 || totalEvents > 0 || notesText.trim().length > 0);

  if (orientation === 'landscape' && hasAgenda) {
    agendaWidth = 68;
    gridWidth = availableWidth - agendaWidth - 5;
  }

  const weekNumColWidth = includeWeekNumbers ? 8 : 0;
  const dayColWidth = (gridWidth - weekNumColWidth) / 7;

  const headerHeight = 7;
  const daysHeader = startWeekOnMonday ? DAYS_MON_FIRST : DAYS_SUN_FIRST;

  // Draw Day-of-week headers
  let curX = marginX;
  if (includeWeekNumbers) {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(curX, gridTop, weekNumColWidth, headerHeight, 'F');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Wk', curX + weekNumColWidth / 2, gridTop + 4.5, { align: 'center' });
    curX += weekNumColWidth;
  }

  for (let i = 0; i < 7; i++) {
    const isWeekend = startWeekOnMonday ? (i >= 5) : (i === 0 || i === 6);
    if (isWeekend) {
      doc.setFillColor(30, 41, 59); // slate-800
      doc.setTextColor(251, 191, 36); // amber-400 for weekend
    } else {
      doc.setFillColor(51, 65, 85); // slate-700
      doc.setTextColor(255, 255, 255);
    }
    doc.rect(curX, gridTop, dayColWidth, headerHeight, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(daysHeader[i].substring(0, 3).toUpperCase(), curX + dayColWidth / 2, gridTop + 4.8, { align: 'center' });
    curX += dayColWidth;
  }

  // Calculate calendar weeks
  const firstDayObj = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let startOffset = firstDayObj.getDay(); // 0 is Sun, 1 is Mon...
  if (startWeekOnMonday) {
    startOffset = (startOffset + 6) % 7;
  }

  const totalSlots = startOffset + daysInMonth;
  const numWeeks = Math.ceil(totalSlots / 7);

  // Available height for grid cells
  const footerHeight = 8;
  const bottomMargin = marginTop + (orientation === 'portrait' && hasAgenda ? 48 : 0);
  const availableGridHeight = pageHeight - gridTop - headerHeight - footerHeight - 8 - (orientation === 'portrait' && hasAgenda ? 42 : 0);
  const rowHeight = Math.max(16, availableGridHeight / numWeeks);

  // Render Grid Cells
  let dayCounter = 1;
  const currentYear = new Date().getFullYear();
  let weekNumber = Math.ceil(((firstDayObj.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);

  for (let row = 0; row < numWeeks; row++) {
    const rowY = gridTop + headerHeight + row * rowHeight;
    let cellX = marginX;

    // Week number column
    if (includeWeekNumbers) {
      doc.setFillColor(248, 250, 252);
      doc.rect(cellX, rowY, weekNumColWidth, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(cellX, rowY, weekNumColWidth, rowHeight, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`W${weekNumber + row}`, cellX + weekNumColWidth / 2, rowY + rowHeight / 2 + 1, { align: 'center' });
      cellX += weekNumColWidth;
    }

    for (let col = 0; col < 7; col++) {
      const slotIndex = row * 7 + col;
      const isWeekend = startWeekOnMonday ? (col >= 5) : (col === 0 || col === 6);

      if (slotIndex < startOffset || dayCounter > daysInMonth) {
        // Empty / padding cell
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(cellX, rowY, dayColWidth, rowHeight, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(cellX, rowY, dayColWidth, rowHeight, 'D');
      } else {
        const d = dayCounter;
        const isoDate = `${year}-${pad(month + 1)}-${pad(d)}`;
        
        // Find holiday for this day
        const dayHoliday = selectedHolidays.find(h => h.date === isoDate);
        // Find custom events for this day
        const dayEvents = customEvents.filter(e => e.date === isoDate);

        const isToday =
          new Date().getFullYear() === year &&
          new Date().getMonth() === month &&
          new Date().getDate() === d;

        // Background fill
        if (isToday) {
          doc.setFillColor(238, 242, 255); // indigo-50
        } else if (dayHoliday) {
          doc.setFillColor(254, 243, 199); // amber-100
        } else if (isWeekend) {
          doc.setFillColor(248, 250, 252); // slate-50
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(cellX, rowY, dayColWidth, rowHeight, 'F');

        // Cell border
        if (isToday) {
          doc.setDrawColor(99, 102, 241);
          doc.setLineWidth(0.35);
        } else {
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.15);
        }
        doc.rect(cellX, rowY, dayColWidth, rowHeight, 'D');
        doc.setLineWidth(0.15);

        // Day Number Header inside cell
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        if (isToday) {
          doc.setTextColor(67, 56, 202); // indigo-700
        } else if (isWeekend) {
          doc.setTextColor(180, 83, 9); // amber-700
        } else {
          doc.setTextColor(15, 23, 42); // slate-900
        }
        doc.text(`${d}`, cellX + 2, rowY + 3.8);

        if (isToday) {
          doc.setFontSize(5);
          doc.setTextColor(79, 70, 229);
          doc.text('TODAY', cellX + dayColWidth - 2, rowY + 3.5, { align: 'right' });
        }

        // Draw items in cell
        let itemY = rowY + 6.2;
        const maxItemY = rowY + rowHeight - 1.5;

        // Draw Holiday if present
        if (dayHoliday && itemY < maxItemY) {
          doc.setFillColor(217, 119, 6); // amber-600
          doc.roundedRect(cellX + 1.5, itemY, dayColWidth - 3, 3.8, 0.6, 0.6, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          const holidayName = doc.splitTextToSize(dayHoliday.name, dayColWidth - 4)[0] || dayHoliday.name;
          doc.text(`★ ${holidayName}`, cellX + 2.5, itemY + 2.6);
          itemY += 4.3;
        }

        // Draw Custom Events
        for (const evt of dayEvents) {
          if (itemY + 3.8 > maxItemY) {
            doc.setFontSize(5);
            doc.setTextColor(100, 116, 139);
            doc.text(`+${dayEvents.length - dayEvents.indexOf(evt)} more...`, cellX + 2, maxItemY);
            break;
          }

          // Category color pill
          doc.setFillColor(37, 99, 235); // blue-600
          if (evt.category === 'meeting') doc.setFillColor(13, 148, 136); // teal-600
          if (evt.category === 'deadline') doc.setFillColor(225, 29, 72); // rose-600
          if (evt.category === 'milestone') doc.setFillColor(147, 51, 234); // purple-600
          if (evt.category === 'personal') doc.setFillColor(234, 88, 12); // orange-600
          if (evt.category === 'travel') doc.setFillColor(2, 132, 199); // sky-600

          doc.roundedRect(cellX + 1.5, itemY, dayColWidth - 3, 3.6, 0.6, 0.6, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.2);
          const timePrefix = evt.time ? `${evt.time} ` : '';
          const label = `${timePrefix}${evt.title}`;
          const cleanLabel = doc.splitTextToSize(label, dayColWidth - 4)[0] || label;
          doc.text(cleanLabel, cellX + 2.5, itemY + 2.5);
          itemY += 4.0;
        }

        dayCounter++;
      }

      cellX += dayColWidth;
    }
  }

  // Render Agenda / Notes Area
  if (hasAgenda) {
    if (orientation === 'landscape') {
      const agendaX = pageWidth - marginX - agendaWidth;
      const agendaY = gridTop;
      const agendaHeight = pageHeight - gridTop - footerHeight - 8;

      // Agenda Box Container
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(agendaX, agendaY, agendaWidth, agendaHeight, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(agendaX, agendaY, agendaWidth, agendaHeight, 2, 2, 'D');

      // Agenda Header
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(agendaX, agendaY, agendaWidth, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('SCHEDULE AGENDA & KEY DATES', agendaX + agendaWidth / 2, agendaY + 4.8, { align: 'center' });

      let aY = agendaY + 11;
      const maxAY = agendaY + agendaHeight - 8;

      // List all events & holidays chronologically
      const allItems: Array<{ date: string; title: string; category: string; time?: string; notes?: string }> = [
        ...selectedHolidays.map(h => ({ date: h.date, title: h.name, category: 'Holiday', notes: h.type })),
        ...customEvents.map(e => ({ date: e.date, title: e.title, category: e.category.toUpperCase(), time: e.time, notes: e.notes }))
      ].sort((a, b) => a.date.localeCompare(b.date));

      doc.setFontSize(6.5);

      for (const item of allItems) {
        if (aY + 6 > maxAY) {
          doc.setFontSize(6);
          doc.setTextColor(148, 163, 184);
          doc.text(`...and ${allItems.length - allItems.indexOf(item)} more items`, agendaX + 3, maxAY);
          break;
        }

        const dateParts = item.date.split('-');
        const dateFormatted = `${MONTH_NAMES[parseInt(dateParts[1], 10) - 1].substring(0, 3)} ${parseInt(dateParts[2], 10)}`;

        doc.setFont('helvetica', 'bold');
        if (item.category === 'Holiday') {
          doc.setTextColor(180, 83, 9); // amber-700
        } else {
          doc.setTextColor(37, 99, 235); // blue-600
        }
        doc.text(`• ${dateFormatted}`, agendaX + 3, aY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const titleStr = `${item.time ? `[${item.time}] ` : ''}${item.title}`;
        const truncatedTitle = doc.splitTextToSize(titleStr, agendaWidth - 22)[0];
        doc.text(truncatedTitle, agendaX + 20, aY);

        aY += 4.5;
      }

      // Notes block at bottom of agenda if space permits
      if (notesText && aY + 12 < maxAY) {
        doc.setDrawColor(226, 232, 240);
        doc.line(agendaX + 3, aY + 1, agendaX + agendaWidth - 3, aY + 1);
        aY += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        doc.text('NOTES:', agendaX + 3, aY);
        doc.setFont('helvetica', 'normal');
        aY += 3;
        const notesLines = doc.splitTextToSize(notesText, agendaWidth - 6);
        doc.text(notesLines.slice(0, 3), agendaX + 3, aY);
      }
    } else {
      // Portrait bottom agenda
      const agendaY = pageHeight - footerHeight - 42;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(marginX, agendaY, availableWidth, 36, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(marginX, agendaY, availableWidth, 36, 2, 2, 'D');

      doc.setFillColor(30, 41, 59);
      doc.rect(marginX, agendaY, availableWidth, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('MONTHLY AGENDA & OBSERVED HOLIDAYS', marginX + 4, agendaY + 4.2);

      const allItems = [
        ...selectedHolidays.map(h => ({ date: h.date, title: h.name, isHoliday: true })),
        ...customEvents.map(e => ({ date: e.date, title: e.title, isHoliday: false, time: e.time }))
      ].sort((a, b) => a.date.localeCompare(b.date));

      let pX = marginX + 4;
      let pY = agendaY + 10;
      doc.setFontSize(6.5);

      for (let i = 0; i < Math.min(allItems.length, 12); i++) {
        const item = allItems[i];
        const dateParts = item.date.split('-');
        const dateFormatted = `${MONTH_NAMES[parseInt(dateParts[1], 10) - 1].substring(0, 3)} ${parseInt(dateParts[2], 10)}`;

        doc.setFont('helvetica', 'bold');
        if (item.isHoliday) {
          doc.setTextColor(180, 83, 9); // amber-700
        } else {
          doc.setTextColor(37, 99, 235); // blue-600
        }
        doc.text(`${dateFormatted}:`, pX, pY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(item.title, 55)[0], pX + 13, pY);

        pY += 4.2;
        if (pY > agendaY + 32) {
          pY = agendaY + 10;
          pX += 70;
        }
      }
    }
  }

  // Footer Signature & Timestamp
  const now = new Date();
  const timestampStr = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} UTC | TimeGovern High-Precision Engine | IANA tzdata 2026a`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(timestampStr, marginX, pageHeight - 4);
  doc.text(`Page 1 of 1`, pageWidth - marginX, pageHeight - 4, { align: 'right' });

  return doc;
}

export function downloadMonthlyPdfSchedule(options: PdfScheduleOptions): void {
  const doc = generateMonthlyPdf(options);
  const countrySlug = options.countryCode ? `-${options.countryCode}` : '';
  const filename = `TimeGovern-Schedule-${options.year}-${pad(options.month + 1)}${countrySlug}.pdf`;
  doc.save(filename);
}
