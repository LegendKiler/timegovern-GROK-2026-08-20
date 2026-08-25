import React, { useEffect, useState } from 'react';
import {
  X, User, Mail, Globe, Sparkles, Check, Heart, Shield, LogIn, UserPlus, LogOut, Cloud, Lock,
} from 'lucide-react';
import { BillingPlansPanel } from './BillingPlansPanel';
import { MAJOR_CITIES } from '../lib/citiesData';
import { companyContent } from '../content/companyContent';
import {
  getSession,
  registerAccount,
  loginAccount,
  logoutAccount,
  saveUserPrefs,
  loadUserPrefs,
  refreshMe,
  type AuthUser,
  type UserPrefs,
} from '../lib/accountAuth';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPanel?: 'account' | 'supporter';
}

type AuthMode = 'signin' | 'signup';

const emptyPrefs = (email = ''): UserPrefs => ({
  fullName: '',
  email,
  homeCity: MAJOR_CITIES.find((c) => /melbourne/i.test(c.name))?.name || 'Melbourne',
  timeFormat: '24h',
  tempUnit: 'C',
  dstAlerts: true,
  astronomyBulletin: true,
  holidayAlerts: false,
});

/** Phase 2 free accounts + Phase 3 Supporter/Calendar checkout. */
export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  initialPanel = 'account',
}) => {
  const [panel, setPanel] = useState<'account' | 'supporter'>(initialPanel);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [source, setSource] = useState<'cloud' | 'local' | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prefs, setPrefs] = useState<UserPrefs>(emptyPrefs());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPanel(initialPanel);
    setError(null);
    setNotice(null);
    setPassword('');
    const s = getSession();
    if (s) {
      setUser(s.user);
      setSource(s.source);
      const p = loadUserPrefs(s.user.id);
      setPrefs(p || { ...emptyPrefs(s.user.email), fullName: s.user.fullName, email: s.user.email });
      refreshMe().then((r) => {
        if (!r) return;
        setUser(r.user);
        setSource(r.source);
        if (r.prefs) {
          const pr = r.prefs as Record<string, unknown>;
          setPrefs((prev) => ({
            ...prev,
            fullName: r.user.fullName || prev.fullName,
            email: r.user.email,
            homeCity: String(pr.home_city || pr.homeCity || prev.homeCity),
            timeFormat: (pr.time_format || pr.timeFormat || prev.timeFormat) as '12h' | '24h',
            tempUnit: (pr.temp_unit || pr.tempUnit || prev.tempUnit) as 'C' | 'F',
            dstAlerts: pr.dst_alerts !== undefined ? !!pr.dst_alerts : (pr.dstAlerts as boolean) ?? prev.dstAlerts,
            astronomyBulletin:
              pr.astronomy_bulletin !== undefined
                ? !!pr.astronomy_bulletin
                : (pr.astronomyBulletin as boolean) ?? prev.astronomyBulletin,
            holidayAlerts:
              pr.holiday_alerts !== undefined ? !!pr.holiday_alerts : (pr.holidayAlerts as boolean) ?? prev.holidayAlerts,
          }));
        }
      });
    } else {
      setUser(null);
      setSource(null);
      setPrefs(emptyPrefs());
    }
  }, [isOpen, initialPanel]);

  if (!isOpen) return null;

  const c = companyContent;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res =
        authMode === 'signup'
          ? await registerAccount({ email, password, fullName: prefs.fullName })
          : await loginAccount({ email, password });
      if (!res.success || !res.user) {
        setError(res.error || 'Authentication failed');
        return;
      }
      setUser(res.user);
      setSource(res.source || 'local');
      const p = loadUserPrefs(res.user.id) || {
        ...emptyPrefs(res.user.email),
        fullName: res.user.fullName,
        email: res.user.email,
      };
      setPrefs(p);
      setNotice(
        res.source === 'cloud'
          ? 'Signed in · cloud session (D1).'
          : 'Signed in · saved on this device (API/D1 offline — deploy + migrate for cloud).'
      );
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    const result = await saveUserPrefs({ ...prefs, email: user.email });
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'Could not save');
      return;
    }
    setSaved(true);
    setNotice(result.source === 'cloud' ? 'Preferences saved to cloud.' : 'Preferences saved on this device.');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await logoutAccount();
    setUser(null);
    setSource(null);
    setPrefs(emptyPrefs());
    setNotice('Signed out.');
  };

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
            <p className="text-xs text-slate-400">
              Phase 2 free accounts · Phase 3 payments
              {user && source && (
                <span className="ml-2 text-cyan-400">· {source === 'cloud' ? 'Cloud session' : 'Device session'}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button type="button" onClick={() => setPanel('account')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${panel === 'account' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <UserPlus className="w-3.5 h-3.5" /> Account
          </button>
          <button type="button" onClick={() => setPanel('supporter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${panel === 'supporter' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Heart className="w-3.5 h-3.5" /> Supporter plans
          </button>
        </div>

        {panel === 'account' && !user && (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="flex gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button type="button" onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'signin' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
                <LogIn className="w-3.5 h-3.5 inline mr-1" /> Sign in
              </button>
              <button type="button" onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'signup' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
                <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Create free account
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Free account: save preferences and (when D1 is live) sync across devices. Passwords are hashed (PBKDF2).
            </p>

            {authMode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full name</label>
                <input type="text" value={prefs.fullName} onChange={(e) => setPrefs((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="Optional" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Password (min 8)</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="••••••••" />
            </div>

            {error && <div className="text-[11px] text-rose-300 border border-rose-500/40 rounded-xl px-3 py-2">{error}</div>}
            {notice && <div className="text-[11px] text-cyan-200 border border-cyan-500/30 rounded-xl px-3 py-2">{notice}</div>}

            <button type="submit" disabled={busy}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              <Lock className="w-3.5 h-3.5" />
              {busy ? 'Please wait…' : authMode === 'signup' ? 'Create free account' : 'Sign in'}
            </button>
            <p className="text-[10px] text-slate-500">
              Spam Act: marketing only with opt-in. Privacy: {c.hq.privacyEmail}. AU operator {c.legalName}.
            </p>
          </form>
        )}

        {panel === 'account' && user && (
          <form onSubmit={handleSavePrefs} className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-2">
              <div className="text-xs min-w-0">
                <div className="font-bold text-emerald-200 truncate">{user.email}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  {source === 'cloud' ? <Cloud className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {source === 'cloud' ? 'Cloud account' : 'Device account (local)'}
                  {!user.emailVerified && ' · email verify when mail provider connected'}
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shrink-0">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full name</label>
                <input type="text" value={prefs.fullName} onChange={(e) => setPrefs((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Home city</label>
                <select value={prefs.homeCity} onChange={(e) => setPrefs((p) => ({ ...p, homeCity: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                  {MAJOR_CITIES.map((city) => (
                    <option key={city.id} value={city.name}>{city.name} ({city.countryCode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Clock</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button type="button" onClick={() => setPrefs((p) => ({ ...p, timeFormat: '12h' }))}
                    className={`flex-1 py-1 rounded ${prefs.timeFormat === '12h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>12h</button>
                  <button type="button" onClick={() => setPrefs((p) => ({ ...p, timeFormat: '24h' }))}
                    className={`flex-1 py-1 rounded ${prefs.timeFormat === '24h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>24h</button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Temperature</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button type="button" onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'C' }))}
                    className={`flex-1 py-1 rounded ${prefs.tempUnit === 'C' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>°C</button>
                  <button type="button" onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'F' }))}
                    className={`flex-1 py-1 rounded ${prefs.tempUnit === 'F' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>°F</button>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              {([
                ['dstAlerts', 'DST shift warnings'],
                ['astronomyBulletin', 'Astronomy bulletin'],
                ['holidayAlerts', 'Public holiday digest'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">{label}</span>
                  <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))} className="accent-blue-600" />
                </label>
              ))}
            </div>

            {error && <div className="text-[11px] text-rose-300">{error}</div>}
            {notice && <div className="text-[11px] text-cyan-200">{notice}</div>}

            <div className="flex flex-wrap gap-2 justify-between">
              <button type="button" onClick={() => setPanel('supporter')} className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> Supporter plans
              </button>
              <button type="submit" disabled={busy}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
                {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {saved ? 'Saved' : 'Save preferences'}
              </button>
            </div>
          </form>
        )}

        {panel === 'supporter' && (
          <BillingPlansPanel
            user={user}
            onNeedAccount={() => { setPanel('account'); setAuthMode('signup'); }}
            onNotice={setNotice}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};
