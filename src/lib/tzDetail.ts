/** Timezone helpers for country detail (CC3). */
export function formatOffset(timeZone: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const name = parts.find((p) => p.type === "timeZoneName")?.value || "";
    // e.g. GMT+11 → UTC+11
    return name.replace(/^GMT/, "UTC") || "UTC";
  } catch {
    return "—";
  }
}

export function formatLocalTime(timeZone: string, date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "—";
  }
}

/** True if timezone is in DST at date (offset differs from Jan 1 same year). */
export function isLikelyDst(timeZone: string, date = new Date()): boolean | null {
  try {
    const year = date.getUTCFullYear();
    const jan = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
    const jun = new Date(Date.UTC(year, 5, 1, 12, 0, 0));
    const off = (d: Date) => {
      const a = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
      const b = new Date(d.toLocaleString("en-US", { timeZone }));
      return (b.getTime() - a.getTime()) / 60000;
    };
    const oNow = off(date);
    const oJan = off(jan);
    const oJun = off(jun);
    if (oJan === oJun) return false; // no DST in this zone
    // DST is the period with the larger offset east of GMT (usually)
    const std = Math.min(oJan, oJun);
    return oNow !== std;
  } catch {
    return null;
  }
}

export function dstLabel(timeZone: string, date = new Date()): string {
  const v = isLikelyDst(timeZone, date);
  if (v === null) return "DST: unknown";
  if (v === false) {
    // could be no DST ever, or currently standard time
    try {
      const year = date.getUTCFullYear();
      const jan = new Date(Date.UTC(year, 0, 1, 12));
      const jun = new Date(Date.UTC(year, 5, 1, 12));
      const off = (d: Date) => {
        const a = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
        const b = new Date(d.toLocaleString("en-US", { timeZone }));
        return (b.getTime() - a.getTime()) / 60000;
      };
      if (off(jan) === off(jun)) return "No daylight saving in this zone";
    } catch { /* ignore */ }
    return "Standard time (not in DST now)";
  }
  return "Daylight saving time (DST) in effect";
}
