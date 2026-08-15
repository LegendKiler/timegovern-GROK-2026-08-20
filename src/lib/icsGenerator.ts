/**
 * Utilities for ICS file generation and Google Calendar export URLs.
 */

export function generateGoogleCalendarUrl(title: string, startUtcIso: string, durationMinutes = 60, details = ''): string {
  const startDate = new Date(startUtcIso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const startStr = formatGCalDate(startDate);
  const endStr = formatGCalDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details || `Scheduled via Timegovern.com - Global Time Platform.`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(title: string, startUtcIso: string, durationMinutes = 60, details = '') {
  const startDate = new Date(startUtcIso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Timegovern.com//Global Time Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${details || 'Scheduled via Timegovern.com - Global Time Platform.'}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `DTSTAMP:${startStr}`,
    `UID:timegovern-${Date.now()}@timegovern.com`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
