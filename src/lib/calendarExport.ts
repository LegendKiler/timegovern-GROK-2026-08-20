import type { PublicHoliday } from "../types";

export type ExportEvent = {
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** CSV for Excel / Sheets */
export function downloadCalendarCsv(
  events: ExportEvent[],
  meta: { year: number; month?: number; countryCode: string; countryName: string }
) {
  const header = "Date,Title,Country,CountryCode,Notes";
  const rows = events.map((e) => {
    const notes = (e.notes || "").replace(/"/g, '""');
    const title = (e.title || "").replace(/"/g, '""');
    return `${e.date},"${title}","${meta.countryName}",${meta.countryCode},"${notes}"`;
  });
  const body = [header, ...rows].join("\r\n");
  const stamp = meta.month != null ? `${meta.year}-${pad(meta.month + 1)}` : `${meta.year}`;
  downloadBlob(
    `timegovern-calendar-${meta.countryCode}-${stamp}.csv`,
    "text/csv;charset=utf-8",
    "\uFEFF" + body
  );
}

/** ICS for Google Calendar / Outlook / Apple */
export function downloadCalendarIcs(
  events: ExportEvent[],
  meta: { year: number; month?: number; countryCode: string; countryName: string }
) {
  const stamp = meta.month != null ? `${meta.year}${pad(meta.month + 1)}` : `${meta.year}`;
  const dtStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TimeGovern//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:TimeGovern ${meta.countryName} ${stamp}`,
  ];
  events.forEach((e, i) => {
    const day = e.date.replace(/-/g, "");
    // All-day event: DTEND = next day
    const [y, m, d] = e.date.split("-").map(Number);
    const end = new Date(y, m - 1, d + 1);
    const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;
    const uid = `tg-${meta.countryCode}-${day}-${i}@timegovern.com`;
    const summary = (e.title || "Event").replace(/[,;\\]/g, " ");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${day}`);
    lines.push(`DTEND;VALUE=DATE:${endStr}`);
    lines.push(`SUMMARY:${summary}`);
    if (e.notes) lines.push(`DESCRIPTION:${e.notes.replace(/[,;\\]/g, " ")}`);
    lines.push(`LOCATION:${meta.countryName}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  downloadBlob(
    `timegovern-calendar-${meta.countryCode}-${stamp}.ics`,
    "text/calendar;charset=utf-8",
    lines.join("\r\n")
  );
}
