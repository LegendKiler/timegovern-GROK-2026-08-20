/**
 * ICT + Weather & Physics calculators
 * For students, teachers, and tech professionals — all client-side
 */
import React, { useMemo, useState } from 'react';
import {
  Binary, Hash, Palette, HardDrive, Zap, Wind, Droplets,
  Activity, Waves, Gauge, Thermometer, BookOpen,
} from 'lucide-react';

const card =
  'bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs';
const input =
  'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium';
const label = 'block font-medium text-slate-600 dark:text-slate-400 mb-1';
const result =
  'font-mono text-sm p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1';

function clampNum(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export function IctExtras() {
  const [baseVal, setBaseVal] = useState('255');
  const [fromBase, setFromBase] = useState(10);
  const bases = useMemo(() => {
    try {
      const n = parseInt(baseVal.trim(), fromBase);
      if (!Number.isFinite(n) || n < 0) return null;
      return {
        bin: n.toString(2),
        oct: n.toString(8),
        dec: n.toString(10),
        hex: n.toString(16).toUpperCase(),
      };
    } catch {
      return null;
    }
  }, [baseVal, fromBase]);

  const [pctPart, setPctPart] = useState(25);
  const [pctWhole, setPctWhole] = useState(200);
  const [pctOf, setPctOf] = useState(15);
  const [pctBase, setPctBase] = useState(80);
  const pct = pctWhole ? ((pctPart / pctWhole) * 100).toFixed(2) : '—';
  const pctAmount = ((pctOf / 100) * pctBase).toFixed(2);

  const [aw, setAw] = useState(1920);
  const [ah, setAh] = useState(1080);
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(Math.abs(aw) || 1, Math.abs(ah) || 1);
  const ratio = `${Math.round(aw / g)}:${Math.round(ah / g)}`;

  const [hex, setHex] = useState('#3B82F6');
  const [r, setR] = useState(59);
  const [gC, setGC] = useState(130);
  const [b, setB] = useState(246);
  const hexToRgb = (h: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h.trim());
    if (!m) return null;
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  };
  const rgbToHex = (rr: number, gg: number, bb: number) =>
    '#' + [rr, gg, bb].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase();

  const [bytesIn, setBytesIn] = useState(1);
  const [byteUnit, setByteUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB'>('GB');
  const toBytes = () => {
    const m = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
    return bytesIn * m[byteUnit];
  };
  const raw = toBytes();
  const storage = {
    B: raw,
    KB: raw / 1024,
    MB: raw / 1024 ** 2,
    GB: raw / 1024 ** 3,
    TB: raw / 1024 ** 4,
  };

  const [distanceKm, setDistanceKm] = useState(12000);
  const [hops, setHops] = useState(12);
  const oneWayMs = (distanceKm * 1000) / 2e5;
  const rttMs = oneWayMs * 2 + hops * 1.5;

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> ICT tools for students, teachers & network engineers — all offline in browser.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-500" /> Number bases (BIN / OCT / DEC / HEX)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Value</label>
              <input className={input + ' font-mono'} value={baseVal} onChange={(e) => setBaseVal(e.target.value)} />
            </div>
            <div>
              <label className={label}>From base</label>
              <select className={input} value={fromBase} onChange={(e) => setFromBase(Number(e.target.value))}>
                <option value={2}>Binary (2)</option>
                <option value={8}>Octal (8)</option>
                <option value={10}>Decimal (10)</option>
                <option value={16}>Hex (16)</option>
              </select>
            </div>
          </div>
          <div className={result}>
            {bases ? (
              <>
                <div className="flex justify-between"><span>BIN</span><span className="text-cyan-500 break-all">{bases.bin}</span></div>
                <div className="flex justify-between"><span>OCT</span><span>{bases.oct}</span></div>
                <div className="flex justify-between"><span>DEC</span><span>{bases.dec}</span></div>
                <div className="flex justify-between"><span>HEX</span><span className="text-amber-500">{bases.hex}</span></div>
              </>
            ) : (
              <span className="text-rose-400">Invalid for base {fromBase}</span>
            )}
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Hash className="w-4 h-4 text-violet-500" /> Percentage
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Part</label>
              <input type="number" className={input} value={pctPart} onChange={(e) => setPctPart(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Whole</label>
              <input type="number" className={input} value={pctWhole} onChange={(e) => setPctWhole(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>Part is</span><span className="text-violet-400 font-bold">{pct}%</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className={label}>% of</label>
              <input type="number" className={input} value={pctOf} onChange={(e) => setPctOf(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Base value</label>
              <input type="number" className={input} value={pctBase} onChange={(e) => setPctBase(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>{pctOf}% of {pctBase}</span><span className="font-bold">{pctAmount}</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Aspect ratio
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Width</label>
              <input type="number" className={input} value={aw} onChange={(e) => setAw(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Height</label>
              <input type="number" className={input} value={ah} onChange={(e) => setAh(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>Simplified</span><span className="text-blue-400 font-bold text-base">{ratio}</span></div>
            <div className="flex justify-between text-[11px] opacity-70"><span>Decimal</span><span>{ah ? (aw / ah).toFixed(4) : '—'}</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" /> Colour HEX ↔ RGB
          </h2>
          <div>
            <label className={label}>HEX</label>
            <div className="flex gap-2">
              <input className={input + ' font-mono'} value={hex} onChange={(e) => {
                setHex(e.target.value);
                const rgb = hexToRgb(e.target.value);
                if (rgb) { setR(rgb.r); setGC(rgb.g); setB(rgb.b); }
              }} />
              <div className="w-10 h-10 rounded-lg border shrink-0" style={{ background: hexToRgb(hex) ? hex : '#666' }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([['R', r, setR], ['G', gC, setGC], ['B', b, setB]] as const).map(([name, val, set]) => (
              <div key={name}>
                <label className={label}>{name}</label>
                <input type="number" min={0} max={255} className={input} value={val} onChange={(e) => {
                  const v = clampNum(Number(e.target.value));
                  set(v);
                  const nr = name === 'R' ? v : r;
                  const ng = name === 'G' ? v : gC;
                  const nb = name === 'B' ? v : b;
                  setHex(rgbToHex(nr, ng, nb));
                }} />
              </div>
            ))}
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>HEX</span><span className="font-bold">{rgbToHex(r, gC, b)}</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" /> Storage units (1024)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className={input} value={bytesIn} onChange={(e) => setBytesIn(Number(e.target.value))} />
            <select className={input} value={byteUnit} onChange={(e) => setByteUnit(e.target.value as typeof byteUnit)}>
              <option value="B">Bytes</option>
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
          <div className={result}>
            {(['B', 'KB', 'MB', 'GB', 'TB'] as const).map((u) => (
              <div key={u} className="flex justify-between">
                <span>{u}</span>
                <span>{storage[u] < 0.001 ? storage[u].toExponential(3) : storage[u].toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" /> Network latency estimate
          </h2>
          <p className="text-[10px] opacity-70">Rough RTT from distance + hop overhead (fibre ~2×10⁸ m/s). Teaching model only.</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Distance (km)</label>
              <input type="number" className={input} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Hops</label>
              <input type="number" className={input} value={hops} onChange={(e) => setHops(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>One-way (approx)</span><span>{oneWayMs.toFixed(1)} ms</span></div>
            <div className="flex justify-between"><span>RTT estimate</span><span className="text-orange-400 font-bold">{rttMs.toFixed(1)} ms</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhysicsWeatherExtras() {
  const [wcT, setWcT] = useState(-5);
  const [wcV, setWcV] = useState(20);
  const windChill =
    wcT > 10
      ? null
      : 13.12 + 0.6215 * wcT - 11.37 * Math.pow(wcV, 0.16) + 0.3965 * wcT * Math.pow(wcV, 0.16);

  const [hiT, setHiT] = useState(32);
  const [hiRH, setHiRH] = useState(70);
  const heatIndex = (() => {
    const T = (hiT * 9) / 5 + 32;
    const R = hiRH;
    if (T < 80) return hiT;
    const HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;
    return ((HI - 32) * 5) / 9;
  })();

  const [dpT, setDpT] = useState(20);
  const [dpRH, setDpRH] = useState(60);
  const dewPoint = (() => {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * dpT) / (b + dpT) + Math.log(Math.max(0.01, dpRH) / 100);
    return (b * alpha) / (a - alpha);
  })();

  const [spd, setSpd] = useState(100);
  const [spdUnit, setSpdUnit] = useState<'kmh' | 'mph' | 'ms' | 'knot'>('kmh');
  const toMs = () => {
    if (spdUnit === 'kmh') return spd / 3.6;
    if (spdUnit === 'mph') return spd * 0.44704;
    if (spdUnit === 'knot') return spd * 0.514444;
    return spd;
  };
  const ms = toMs();
  const speeds = {
    'm/s': ms,
    'km/h': ms * 3.6,
    mph: ms / 0.44704,
    knots: ms / 0.514444,
  };

  const [ohmMode, setOhmMode] = useState<'V' | 'I' | 'R'>('V');
  const [ohmV, setOhmV] = useState(12);
  const [ohmI, setOhmI] = useState(2);
  const [ohmR, setOhmR] = useState(6);
  const ohm = useMemo(() => {
    if (ohmMode === 'V') return { V: ohmI * ohmR, I: ohmI, R: ohmR, P: ohmI * ohmI * ohmR };
    if (ohmMode === 'I') return { V: ohmV, I: ohmR ? ohmV / ohmR : 0, R: ohmR, P: ohmR ? (ohmV * ohmV) / ohmR : 0 };
    return { V: ohmV, I: ohmI, R: ohmI ? ohmV / ohmI : 0, P: ohmV * ohmI };
  }, [ohmMode, ohmV, ohmI, ohmR]);

  const [mass, setMass] = useState(1.5);
  const [vel, setVel] = useState(10);
  const ke = 0.5 * mass * vel * vel;

  const [freq, setFreq] = useState(100);
  const c = 299792458;
  const lambda = c / (freq * 1e6);

  const [fMass, setFMass] = useState(2);
  const [accel, setAccel] = useState(9.81);
  const force = fMass * accel;

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5" /> Weather & physics for students and teachers — SI units where possible.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-500" /> Wind chill (°C, km/h)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Air temp °C</label>
              <input type="number" className={input} value={wcT} onChange={(e) => setWcT(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Wind km/h</label>
              <input type="number" className={input} value={wcV} onChange={(e) => setWcV(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            {windChill === null ? (
              <span className="opacity-70">Most useful when air ≤ 10°C</span>
            ) : (
              <div className="flex justify-between"><span>Feels like</span><span className="text-sky-400 font-bold">{windChill.toFixed(1)} °C</span></div>
            )}
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-500" /> Heat index
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Temp °C</label>
              <input type="number" className={input} value={hiT} onChange={(e) => setHiT(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>RH %</label>
              <input type="number" className={input} value={hiRH} onChange={(e) => setHiRH(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>Heat index</span><span className="text-rose-400 font-bold">{heatIndex.toFixed(1)} °C</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-500" /> Dew point (Magnus)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Temp °C</label>
              <input type="number" className={input} value={dpT} onChange={(e) => setDpT(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>RH %</label>
              <input type="number" className={input} value={dpRH} onChange={(e) => setDpRH(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>Dew point</span><span className="text-cyan-400 font-bold">{dewPoint.toFixed(1)} °C</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-500" /> Speed units
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className={input} value={spd} onChange={(e) => setSpd(Number(e.target.value))} />
            <select className={input} value={spdUnit} onChange={(e) => setSpdUnit(e.target.value as typeof spdUnit)}>
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
              <option value="ms">m/s</option>
              <option value="knot">knots</option>
            </select>
          </div>
          <div className={result}>
            {Object.entries(speeds).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span>{k}</span><span>{v.toFixed(3)}</span></div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Ohm&apos;s law (V = IR) + power
          </h2>
          <div className="flex gap-1 mb-2">
            {(['V', 'I', 'R'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setOhmMode(m)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${ohmMode === m ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 dark:bg-slate-800'}`}
              >
                Solve {m}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={label}>V (volts)</label>
              <input type="number" className={input} value={ohmV} disabled={ohmMode === 'V'} onChange={(e) => setOhmV(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>I (amps)</label>
              <input type="number" className={input} value={ohmI} disabled={ohmMode === 'I'} onChange={(e) => setOhmI(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>R (ohms)</label>
              <input type="number" className={input} value={ohmR} disabled={ohmMode === 'R'} onChange={(e) => setOhmR(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>V</span><span>{ohm.V.toFixed(4)} V</span></div>
            <div className="flex justify-between"><span>I</span><span>{ohm.I.toFixed(4)} A</span></div>
            <div className="flex justify-between"><span>R</span><span>{ohm.R.toFixed(4)} Ω</span></div>
            <div className="flex justify-between"><span>Power P=VI</span><span className="text-amber-400 font-bold">{ohm.P.toFixed(4)} W</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Kinetic energy · Force
          </h2>
          <p className="text-[10px] opacity-70">KE = ½mv² · F = ma</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={label}>Mass (kg)</label>
              <input type="number" className={input} value={mass} onChange={(e) => setMass(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Velocity (m/s)</label>
              <input type="number" className={input} value={vel} onChange={(e) => setVel(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Mass F=ma (kg)</label>
              <input type="number" className={input} value={fMass} onChange={(e) => setFMass(Number(e.target.value))} />
            </div>
            <div>
              <label className={label}>Accel (m/s²)</label>
              <input type="number" className={input} value={accel} onChange={(e) => setAccel(Number(e.target.value))} />
            </div>
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>KE</span><span className="text-emerald-400 font-bold">{ke.toFixed(3)} J</span></div>
            <div className="flex justify-between"><span>Force</span><span className="font-bold">{force.toFixed(3)} N</span></div>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Waves className="w-4 h-4 text-purple-500" /> Wave: frequency → wavelength
          </h2>
          <p className="text-[10px] opacity-70">λ = c / f · c = 299,792,458 m/s</p>
          <div>
            <label className={label}>Frequency (MHz)</label>
            <input type="number" className={input} value={freq} onChange={(e) => setFreq(Number(e.target.value))} />
          </div>
          <div className={result}>
            <div className="flex justify-between"><span>Wavelength</span><span className="text-purple-400 font-bold">{lambda.toFixed(4)} m</span></div>
            <div className="flex justify-between text-[11px] opacity-70"><span></span><span>{(lambda * 100).toFixed(2)} cm · {(lambda * 1e9).toFixed(2)} nm</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
