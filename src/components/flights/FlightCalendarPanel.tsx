import React, { useEffect, useState } from "react";
import {
  loadFlights,
  upsertFlight,
  removeFlight,
  newFlightId,
  type SavedFlight,
} from "../../lib/flightStore";
import { downloadFlightsIcs } from "../../lib/flightIcs";

const emptyForm = {
  flightNumber: "",
  date: new Date().toISOString().slice(0, 10),
  depAirport: "",
  arrAirport: "",
  depTime: "09:00",
  arrTime: "17:00",
  arrDateOffset: 0,
  notes: "",
};

/** F1: manual flight calendar — no live API */
export function FlightCalendarPanel() {
  const [flights, setFlights] = useState<SavedFlight[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setFlights(loadFlights());
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fn = form.flightNumber.trim().toUpperCase();
    const dep = form.depAirport.trim().toUpperCase();
    const arr = form.arrAirport.trim().toUpperCase();
    if (!fn || !dep || !arr || dep.length < 3 || arr.length < 3) {
      alert("Enter flight number and 3-letter airport codes (e.g. SYD, MEL).");
      return;
    }
    const row: SavedFlight = {
      id: editingId || newFlightId(),
      flightNumber: fn,
      date: form.date,
      depAirport: dep.slice(0, 4),
      arrAirport: arr.slice(0, 4),
      depTime: form.depTime,
      arrTime: form.arrTime,
      arrDateOffset: Number(form.arrDateOffset) || 0,
      notes: form.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setFlights(upsertFlight(row));
    setEditingId(null);
    setForm({ ...emptyForm, date: form.date });
  }

  function edit(f: SavedFlight) {
    setEditingId(f.id);
    setForm({
      flightNumber: f.flightNumber,
      date: f.date,
      depAirport: f.depAirport,
      arrAirport: f.arrAirport,
      depTime: f.depTime,
      arrTime: f.arrTime,
      arrDateOffset: f.arrDateOffset,
      notes: f.notes || "",
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flight calendar</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Save flights on your calendar (manual times). Live status comes in a later plan — no tracking API yet.
          </p>
        </div>
        <button
          type="button"
          disabled={flights.length === 0}
          onClick={() => downloadFlightsIcs(flights)}
          className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          Download ICS
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          Flight number
          <input
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.flightNumber}
            onChange={(e) => setForm({ ...form, flightNumber: e.target.value })}
            placeholder="QF1"
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          Departure date
          <input
            type="date"
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          From (IATA)
          <input
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm uppercase"
            value={form.depAirport}
            onChange={(e) => setForm({ ...form, depAirport: e.target.value })}
            placeholder="SYD"
            maxLength={4}
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          To (IATA)
          <input
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm uppercase"
            value={form.arrAirport}
            onChange={(e) => setForm({ ...form, arrAirport: e.target.value })}
            placeholder="LAX"
            maxLength={4}
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          Depart time (local)
          <input
            type="time"
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.depTime}
            onChange={(e) => setForm({ ...form, depTime: e.target.value })}
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          Arrive time (local)
          <input
            type="time"
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.arrTime}
            onChange={(e) => setForm({ ...form, arrTime: e.target.value })}
            required
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1">
          Arrive day offset
          <select
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.arrDateOffset}
            onChange={(e) => setForm({ ...form, arrDateOffset: Number(e.target.value) })}
          >
            <option value={0}>Same day</option>
            <option value={1}>+1 day</option>
            <option value={2}>+2 days</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 space-y-1 sm:col-span-2 lg:col-span-1">
          Notes
          <input
            className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="PNR, seat, etc."
          />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="px-4 py-2.5 rounded-lg text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-500">
            {editingId ? "Update flight" : "Add to calendar"}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-3 py-2.5 rounded-lg text-xs font-bold border border-slate-400 text-slate-600 dark:text-slate-300"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-2 py-2">Flight</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Route</th>
              <th className="px-2 py-2">Times</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-4 text-slate-500">
                  No saved flights yet. Add one above.
                </td>
              </tr>
            )}
            {flights
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || a.depTime.localeCompare(b.depTime))
              .map((f) => (
                <tr key={f.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-2 py-2 font-bold text-slate-900 dark:text-white">{f.flightNumber}</td>
                  <td className="px-2 py-2 font-mono">{f.date}</td>
                  <td className="px-2 py-2">
                    {f.depAirport} → {f.arrAirport}
                    {f.arrDateOffset ? ` (+${f.arrDateOffset}d)` : ""}
                  </td>
                  <td className="px-2 py-2 font-mono">
                    {f.depTime} – {f.arrTime}
                  </td>
                  <td className="px-2 py-2 space-x-2 whitespace-nowrap">
                    <button type="button" className="text-cyan-600 font-bold hover:underline" onClick={() => edit(f)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-500 font-bold hover:underline"
                      onClick={() => setFlights(removeFlight(f.id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
