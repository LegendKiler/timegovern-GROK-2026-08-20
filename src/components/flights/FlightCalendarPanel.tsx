import React, { useEffect, useMemo, useState } from "react";
import {
  loadFlights,
  upsertFlight,
  removeFlight,
  newFlightId,
  type SavedFlight,
} from "../../lib/flightStore";
import { downloadFlightsIcs } from "../../lib/flightIcs";
import {
  loadCars,
  upsertCar,
  removeCar,
  newCarId,
  type SavedCarBooking,
} from "../../lib/carStore";
import { downloadCarsIcs } from "../../lib/carIcs";

type Tab = "flights" | "cars" | "month";

const emptyFlight = {
  flightNumber: "",
  date: new Date().toISOString().slice(0, 10),
  depAirport: "",
  arrAirport: "",
  depTime: "09:00",
  arrTime: "17:00",
  arrDateOffset: 0,
  notes: "",
};

const emptyCar = {
  supplier: "",
  confirmation: "",
  pickupLocation: "",
  dropoffLocation: "",
  pickupDate: new Date().toISOString().slice(0, 10),
  pickupTime: "10:00",
  dropoffDate: new Date().toISOString().slice(0, 10),
  dropoffTime: "10:00",
  vehicle: "",
  notes: "",
};

/** A+B+C: My flights + cars, ICS help, month chips. No live API. */
export function FlightCalendarPanel() {
  const [tab, setTab] = useState<Tab>("flights");
  const [flights, setFlights] = useState<SavedFlight[]>([]);
  const [cars, setCars] = useState<SavedCarBooking[]>([]);
  const [form, setForm] = useState(emptyFlight);
  const [carForm, setCarForm] = useState(emptyCar);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    setFlights(loadFlights());
    setCars(loadCars());
  }, []);

  const flightDays = useMemo(() => {
    const s = new Set<string>();
    flights.forEach((f) => s.add(f.date));
    return s;
  }, [flights]);

  const carDays = useMemo(() => {
    const s = new Set<string>();
    cars.forEach((c) => s.add(c.pickupDate));
    return s;
  }, [cars]);

  const monthDays = useMemo(() => {
    const base = selectedDay ? new Date(selectedDay + "T12:00:00") : new Date();
    const y = base.getFullYear();
    const m = base.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const cells: { date: string; day: number }[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: ds, day: d });
    }
    return { y, m, firstDow: first.getDay(), cells };
  }, [selectedDay, flights, cars]);

  function submitFlight(e: React.FormEvent) {
    e.preventDefault();
    const fn = form.flightNumber.trim().toUpperCase();
    const dep = form.depAirport.trim().toUpperCase();
    const arr = form.arrAirport.trim().toUpperCase();
    if (!fn || dep.length < 3 || arr.length < 3) {
      alert("Flight number and 3-letter airport codes required.");
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
    setForm({ ...emptyFlight, date: form.date });
  }

  function submitCar(e: React.FormEvent) {
    e.preventDefault();
    if (!carForm.pickupLocation.trim() || !carForm.dropoffLocation.trim()) {
      alert("Pickup and drop-off locations required.");
      return;
    }
    const row: SavedCarBooking = {
      id: editingCarId || newCarId(),
      supplier: carForm.supplier.trim() || "Car rental",
      confirmation: carForm.confirmation.trim() || undefined,
      pickupLocation: carForm.pickupLocation.trim(),
      dropoffLocation: carForm.dropoffLocation.trim(),
      pickupDate: carForm.pickupDate,
      pickupTime: carForm.pickupTime,
      dropoffDate: carForm.dropoffDate,
      dropoffTime: carForm.dropoffTime,
      vehicle: carForm.vehicle.trim() || undefined,
      notes: carForm.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setCars(upsertCar(row));
    setEditingCarId(null);
    setCarForm({ ...emptyCar, pickupDate: carForm.pickupDate });
  }

  const dayFlights = selectedDay ? flights.filter((f) => f.date === selectedDay) : [];
  const dayCars = selectedDay ? cars.filter((c) => c.pickupDate === selectedDay) : [];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/70 p-4">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          Travel on your calendar
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Save flights and car pickups with times you enter. Export to Outlook, Google Calendar, or Apple Calendar via ICS.
          Live airline status is a later paid feature — nothing is tracked live yet.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["flights", "My flights"],
            ["cars", "Car bookings"],
            ["month", "Month view"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              "px-3 py-2 rounded-lg text-xs font-bold border transition " +
              (tab === id
                ? "bg-cyan-600 text-white border-cyan-500"
                : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "flights" && (
        <>
          <form onSubmit={submitFlight} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Flight number
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="QF1" required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Departure date
              <input type="date" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              From (IATA)
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm uppercase" value={form.depAirport} onChange={(e) => setForm({ ...form, depAirport: e.target.value })} placeholder="SYD" maxLength={4} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              To (IATA)
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm uppercase" value={form.arrAirport} onChange={(e) => setForm({ ...form, arrAirport: e.target.value })} placeholder="LAX" maxLength={4} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Depart (local)
              <input type="time" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.depTime} onChange={(e) => setForm({ ...form, depTime: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Arrive (local)
              <input type="time" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.arrTime} onChange={(e) => setForm({ ...form, arrTime: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Arrive day
              <select className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.arrDateOffset} onChange={(e) => setForm({ ...form, arrDateOffset: Number(e.target.value) })}>
                <option value={0}>Same day</option>
                <option value={1}>+1 day</option>
                <option value={2}>+2 days</option>
              </select>
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Notes
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="PNR, seat" />
            </label>
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
              <button type="submit" className="px-4 py-2.5 rounded-lg text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-500">
                {editingId ? "Update flight" : "Save flight"}
              </button>
              <button type="button" disabled={!flights.length} onClick={() => downloadFlightsIcs(flights)} className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white disabled:opacity-40">
                Download flights ICS
              </button>
            </div>
          </form>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-100">Add to Outlook / Gmail / Apple</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong>Google Calendar:</strong> Settings (gear) → Import &amp; export → Import → choose the .ics file</li>
              <li><strong>Outlook:</strong> open the downloaded .ics (or File → Open &amp; Export → Open Calendar)</li>
              <li><strong>Apple Calendar:</strong> File → Import, or double-click the .ics</li>
            </ul>
          </div>

          <FlightTable
            flights={flights}
            onEdit={(f) => {
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
            }}
            onDelete={(id) => setFlights(removeFlight(id))}
          />
        </>
      )}

      {tab === "cars" && (
        <>
          <form onSubmit={submitCar} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Supplier
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.supplier} onChange={(e) => setCarForm({ ...carForm, supplier: e.target.value })} placeholder="Hertz, Avis…" />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Confirmation #
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.confirmation} onChange={(e) => setCarForm({ ...carForm, confirmation: e.target.value })} />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Pickup location
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.pickupLocation} onChange={(e) => setCarForm({ ...carForm, pickupLocation: e.target.value })} placeholder="MEL Airport T2" required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Drop-off location
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.dropoffLocation} onChange={(e) => setCarForm({ ...carForm, dropoffLocation: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Pickup date
              <input type="date" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.pickupDate} onChange={(e) => setCarForm({ ...carForm, pickupDate: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Pickup time
              <input type="time" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.pickupTime} onChange={(e) => setCarForm({ ...carForm, pickupTime: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Drop-off date
              <input type="date" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.dropoffDate} onChange={(e) => setCarForm({ ...carForm, dropoffDate: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
              Drop-off time
              <input type="time" className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.dropoffTime} onChange={(e) => setCarForm({ ...carForm, dropoffTime: e.target.value })} required />
            </label>
            <label className="text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300 sm:col-span-2">
              Vehicle
              <input className="w-full h-10 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm" value={carForm.vehicle} onChange={(e) => setCarForm({ ...carForm, vehicle: e.target.value })} placeholder="Compact, SUV…" />
            </label>
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
              <button type="submit" className="px-4 py-2.5 rounded-lg text-xs font-bold bg-cyan-600 text-white">
                {editingCarId ? "Update car booking" : "Save car booking"}
              </button>
              <button type="button" disabled={!cars.length} onClick={() => downloadCarsIcs(cars)} className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white disabled:opacity-40">
                Download cars ICS
              </button>
            </div>
          </form>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300">
            Same import steps as flights: Google Import, Outlook open .ics, Apple Import.
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-2 py-2">Supplier</th>
                  <th className="px-2 py-2">Pickup</th>
                  <th className="px-2 py-2">When</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {cars.length === 0 && (
                  <tr><td colSpan={4} className="px-2 py-4 text-slate-500">No car bookings yet.</td></tr>
                )}
                {cars.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2 font-bold">{c.supplier}</td>
                    <td className="px-2 py-2">{c.pickupLocation} → {c.dropoffLocation}</td>
                    <td className="px-2 py-2 font-mono">{c.pickupDate} {c.pickupTime}</td>
                    <td className="px-2 py-2 space-x-2">
                      <button type="button" className="text-cyan-600 font-bold" onClick={() => {
                        setEditingCarId(c.id);
                        setCarForm({
                          supplier: c.supplier,
                          confirmation: c.confirmation || "",
                          pickupLocation: c.pickupLocation,
                          dropoffLocation: c.dropoffLocation,
                          pickupDate: c.pickupDate,
                          pickupTime: c.pickupTime,
                          dropoffDate: c.dropoffDate,
                          dropoffTime: c.dropoffTime,
                          vehicle: c.vehicle || "",
                          notes: c.notes || "",
                        });
                      }}>Edit</button>
                      <button type="button" className="text-red-500 font-bold" onClick={() => setCars(removeCar(c.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "month" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Cyan = flight · Emerald = car pickup. Click a day to see items. (Schedule only — not live tracking.)
          </p>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthDays.firstDow }).map((_, i) => (
              <div key={"e" + i} />
            ))}
            {monthDays.cells.map((cell) => {
              const hasF = flightDays.has(cell.date);
              const hasC = carDays.has(cell.date);
              const sel = selectedDay === cell.date;
              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelectedDay(cell.date)}
                  className={
                    "relative min-h-[2.5rem] rounded-lg border text-xs font-semibold " +
                    (sel
                      ? "border-cyan-500 bg-cyan-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950")
                  }
                >
                  {cell.day}
                  <span className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                    {hasF && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                    {hasC && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-xs space-y-2">
              <p className="font-bold">{selectedDay}</p>
              {dayFlights.length === 0 && dayCars.length === 0 && <p className="text-slate-500">Nothing saved this day.</p>}
              {dayFlights.map((f) => (
                <p key={f.id}>{f.flightNumber}: {f.depAirport}→{f.arrAirport} {f.depTime}</p>
              ))}
              {dayCars.map((c) => (
                <p key={c.id}>Car {c.supplier}: {c.pickupLocation} {c.pickupTime}</p>
              ))}
              <button
                type="button"
                className="text-cyan-600 font-bold"
                onClick={() => {
                  setTab("flights");
                  setForm((prev) => ({ ...prev, date: selectedDay }));
                }}
              >
                Add flight on this day
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FlightTable({
  flights,
  onEdit,
  onDelete,
}: {
  flights: SavedFlight[];
  onEdit: (f: SavedFlight) => void;
  onDelete: (id: string) => void;
}) {
  return (
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
            <tr><td colSpan={5} className="px-2 py-4 text-slate-500">No flights yet.</td></tr>
          )}
          {flights
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((f) => (
              <tr key={f.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-2 py-2 font-bold">{f.flightNumber}</td>
                <td className="px-2 py-2 font-mono">{f.date}</td>
                <td className="px-2 py-2">{f.depAirport} → {f.arrAirport}</td>
                <td className="px-2 py-2 font-mono">{f.depTime}–{f.arrTime}</td>
                <td className="px-2 py-2 space-x-2">
                  <button type="button" className="text-cyan-600 font-bold" onClick={() => onEdit(f)}>Edit</button>
                  <button type="button" className="text-red-500 font-bold" onClick={() => onDelete(f.id)}>Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
