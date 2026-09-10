import type { SavedFlight } from "./flightStore";

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

/** Build floating local ICS (no live API). Times are as entered by user. */
export function flightsToIcs(flights: SavedFlight[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TimeGovern//Flights F1//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const f of flights) {
    const [y, m, d] = f.date.split("-").map(Number);
    const [hh, mm] = f.depTime.split(":").map(Number);
    const start = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;

    const arr = new Date(Date.UTC(y, m - 1, d + (f.arrDateOffset || 0)));
    const [ah, am] = f.arrTime.split(":").map(Number);
    const endY = arr.getUTCFullYear();
    const endM = arr.getUTCMonth() + 1;
    const endD = arr.getUTCDate();
    const end = `${endY}${pad(endM)}${pad(endD)}T${pad(ah)}${pad(am)}00`;

    const summary = `${f.flightNumber} ${f.depAirport}→${f.arrAirport}`;
    const uid = `${f.id}@timegovern.com`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${start}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:TimeGovern saved flight (manual schedule). ${(f.notes || "").replace(/\n/g, " ")}`,
      `LOCATION:${f.depAirport} to ${f.arrAirport}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadFlightsIcs(flights: SavedFlight[], filename = "timegovern-flights.ics") {
  const ics = flightsToIcs(flights);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
