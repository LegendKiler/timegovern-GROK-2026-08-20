import type { SavedFlight } from "./flightStore";

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

function utcStamp(d = new Date()) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/** ICS for Outlook, Google Calendar, Apple Calendar (floating local times as entered). */
export function flightsToIcs(flights: SavedFlight[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TimeGovern//Flights//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TimeGovern Flights",
  ];

  for (const f of flights) {
    const [y, m, d] = f.date.split("-").map(Number);
    const [hh, mm] = (f.depTime || "00:00").split(":").map(Number);
    const start = `${y}${pad(m)}${pad(d)}T${pad(hh || 0)}${pad(mm || 0)}00`;

    const base = new Date(Date.UTC(y, m - 1, d + (f.arrDateOffset || 0)));
    const [ah, am] = (f.arrTime || "00:00").split(":").map(Number);
    const end =
      base.getUTCFullYear() +
      pad(base.getUTCMonth() + 1) +
      pad(base.getUTCDate()) +
      "T" +
      pad(ah || 0) +
      pad(am || 0) +
      "00";

    const summary = `${f.flightNumber} ${f.depAirport} to ${f.arrAirport}`;
    const desc = [
      "TimeGovern saved flight (schedule as you entered).",
      f.notes ? "Notes: " + f.notes.replace(/\r?\n/g, " ") : "",
      "Import: Google Calendar Settings > Import | Outlook open this file | Apple Calendar Import",
    ]
      .filter(Boolean)
      .join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      "UID:" + f.id + "@timegovern.com",
      "DTSTAMP:" + utcStamp(),
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:" + summary,
      "DESCRIPTION:" + desc,
      "LOCATION:" + f.depAirport + " to " + f.arrAirport,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadFlightsIcs(flights: SavedFlight[], filename?: string) {
  const ics = flightsToIcs(flights);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "timegovern-flights.ics";
  a.click();
  URL.revokeObjectURL(url);
}
