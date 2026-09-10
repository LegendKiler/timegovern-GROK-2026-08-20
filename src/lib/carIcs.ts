import type { SavedCarBooking } from "./carStore";

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

export function carsToIcs(cars: SavedCarBooking[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TimeGovern//Cars//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TimeGovern Car bookings",
  ];
  for (const c of cars) {
    const [y, m, d] = c.pickupDate.split("-").map(Number);
    const [hh, mm] = (c.pickupTime || "10:00").split(":").map(Number);
    const start = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
    const [ey, em, ed] = c.dropoffDate.split("-").map(Number);
    const [eh, emin] = (c.dropoffTime || "10:00").split(":").map(Number);
    const end = `${ey}${pad(em)}${pad(ed)}T${pad(eh)}${pad(emin)}00`;
    const summary = "Car: " + (c.supplier || "Rental") + " " + c.pickupLocation;
    lines.push(
      "BEGIN:VEVENT",
      "UID:" + c.id + "@timegovern.com",
      "DTSTAMP:" + utcStamp(),
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:" + summary,
      "DESCRIPTION:Pickup " +
        c.pickupLocation +
        " / Dropoff " +
        c.dropoffLocation +
        (c.confirmation ? " / Conf " + c.confirmation : "") +
        "\\nImport: Google Calendar Settings > Import | Outlook open file",
      "LOCATION:" + c.pickupLocation,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadCarsIcs(cars: SavedCarBooking[]) {
  const blob = new Blob([carsToIcs(cars)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "timegovern-cars.ics";
  a.click();
  URL.revokeObjectURL(url);
}
