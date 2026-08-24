import React, { useEffect, useState } from 'react';
import { X, User, Mail, Globe, Sparkles, Check, Heart, Shield, LogIn, UserPlus } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { companyContent } from '../content/companyContent';

const STORAGE_KEY = 'tg_account_prefs_v1';

export type AccountPrefs = {
  fullName: string;
  email: string;
  homeCity: string;
  timeFormat: '12h' | '24h';
  tempUnit: 'C' | 'F';
  dstAlerts: boolean;
  astronomyBulletin: boolean;
  holidayAlerts: boolean;
  mode: 'guest' | 'local_profile';
  updatedAt: string;
};

const defaultPrefs = (): AccountPrefs => {
  const mel = MAJOR_CITIES.find((c) => /melbourne/i.test(c.name)) || MAJOR_CITIES[0];
  return {
    fullName: '',
    email: '',
    homeCity: mel?.name || 'Melbourne',
    timeFormat: '24h',
    tempUnit: 'C',
    dstAlerts: true,
    astronomyBulletin: true,
    holidayAlerts: false,
    mode: 'guest',
    updatedAt: new Date().toISOString(),
  };
};

function loadPrefs(): AccountPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs();
    return { ...defaultPrefs(), ...JSON.parse(raw) };
  } catch {
    return defaultPrefs();
  }
}

function savePrefs(p: AccountPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
}

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPanel?: 'account' | 'supporter';
}

/** Phase 1 — local prefs + Supporter plan info. No auth/payment yet. */
export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  initialPanel = 'account',
}) => {
  const [panel, setPanel] = useState<'account' | 'supporter'>(initialPanel);
  const [prefs, setPrefs] = useState<AccountPrefs>(defaultPrefs);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrefs(loadPrefs());
      setPanel(initialPanel);
      setSaved(false);
      setNotice(null);
    }
  }, [isOpen, initialPanel]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefs.email.trim()) {
      setNotice('Add an email to save a local profile (not sent to a server yet).');
      return;
    }
    const next: AccountPrefs = { ...prefs, mode: 'local_profile' };
    savePrefs(next);
    setPrefs(next);
    setSaved(true);
    setNotice('Saved in this browser only (localStorage). Cloud sign-in is Phase 2.');
    setTimeout(() => setSaved(false), 2500);
  };

  const c = companyContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div className="min-w-0 pr-8">
            <h3 className="font-bold text-lg text-white">Account & Supporter</h3>
            <p className="text-xs text-slate-400">Free local preferences now · Cloud login Phase 2 · Payments Phase 3</p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button type="button" onClick={() => setPanel('account')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${
              panel === 'account' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            <UserPlus className="w-3.5 h-3.5" /> Free profile
          </button>
          <button type="button" onClick={() => setPanel('supporter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${
              panel === 'supporter' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}>
            <Heart className="w-3.5 h-3.5" /> Supporter plans
          </button>
        </div>

        {panel === 'account' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-100/90">
              Phase 1: preferences save in <strong>this browser only</strong>. No password, no cloud account yet. Core tools stay free without an account.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full name</label>
                <input type="text" value={prefs.fullName} onChange={(e) => setPrefs((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Optional" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email</label>
                <input type="email" required value={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Display preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Home city</label>
                  <select value={prefs.homeCity} onChange={(e) => setPrefs((p) => ({ ...p, homeCity: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2">
                    {MAJOR_CITIES.map((city) => (
                      <option key={city.id} value={city.name}>{city.name} ({city.countryCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Clock</label>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button type="button" onClick={() => setPrefs((p) => ({ ...p, timeFormat: '12h' }))}
                      className={`flex-1 py-1 rounded font-mono ${prefs.timeFormat === '12h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>12h</button>
                    <button type="button" onClick={() => setPrefs((p) => ({ ...p, timeFormat: '24h' }))}
                      className={`flex-1 py-1 rounded font-mono ${prefs.timeFormat === '24h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>24h</button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Temperature</label>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button type="button" onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'C' }))}
                      className={`flex-1 py-1 rounded font-mono ${prefs.tempUnit === 'C' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>°C</button>
                    <button type="button" onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'F' }))}
                      className={`flex-1 py-1 rounded font-mono ${prefs.tempUnit === 'F' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>°F</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-400" /> Alert preferences (when email is connected)
              </h4>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                {([
                  ['dstAlerts', 'DST shift warnings', 'Notify before clock changes in your regions'],
                  ['astronomyBulletin', 'Astronomy bulletin', 'Moon phases, eclipses, notable sky events'],
                  ['holidayAlerts', 'Public holiday digest', 'AU / US / major markets overview'],
                ] as const).map(([key, title, desc]) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer gap-3 py-1">
                    <div>
                      <span className="font-semibold text-slate-200 block">{title}</span>
                      <span className="text-[10px] text-slate-400">{desc}</span>
                    </div>
                    <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">Marketing email only with consent (Spam Act 2003).</p>
            </div>

            {notice && (
              <div className="text-[11px] text-cyan-200 border border-cyan-500/30 rounded-xl px-3 py-2 bg-cyan-950/30">{notice}</div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button type="button" onClick={() => setPanel('supporter')} className="text-[11px] font-bold text-rose-300 hover:text-rose-200 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> View Supporter plans
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {saved ? 'Saved locally' : 'Save in browser'}
                </button>
              </div>
            </div>
          </form>
        )}

        {panel === 'supporter' && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
              <h4 className="font-bold text-white flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-400" /> TimeGovern Supporter
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Support keeps core world clocks free. Paid perks when Phase 3 payments go live:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                <li>Ad-free browsing across timegovern.com</li>
                <li>Cloud-saved city pins across devices (with Phase 2 login)</li>
                <li>Precision astronomy extras and export options (as features ship)</li>
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-700 p-4 bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-slate-500">Quarterly</div>
                <div className="text-xl font-black text-white mt-1">A$9.99</div>
                <div className="text-[11px] text-slate-400">≈ US$5.99 / quarter</div>
                <p className="text-[10px] text-slate-500 mt-2">Indicative only — not charged yet</p>
              </div>
              <div className="rounded-xl border border-cyan-500/40 p-4 bg-slate-950">
                <div className="text-[10px] font-bold uppercase text-cyan-400">Yearly · best value</div>
                <div className="text-xl font-black text-white mt-1">A$29.99</div>
                <div className="text-[11px] text-slate-400">≈ US$14.99 / year</div>
                <p className="text-[10px] text-slate-500 mt-2">Indicative only — not charged yet</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 p-3 text-[11px] text-slate-400 space-y-2">
              <p className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Not a charitable donation.</strong> Paid product for digital perks — not tax-deductible in Australia or the US.
                </span>
              </p>
              <p>
                Operator: {c.legalName} · {c.hq.fullAddress} · ABN {c.hq.abn}. Victoria law: Victoria, Australia.
                US visitors: access/deletion via {c.hq.privacyEmail}.
              </p>
              <p>
                Phase 3: Stripe Checkout, clear renewal/cancel, GST-inclusive AUD where applicable. ACL guarantees that cannot be excluded still apply.
              </p>
              <p>Full Privacy and Terms: Company hub → Legal tab.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" disabled
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                title="Phase 3 — Stripe not connected">
                Checkout coming in Phase 3
              </button>
              <button type="button" onClick={() => setPanel('account')}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white flex items-center justify-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /> Save free profile first
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
