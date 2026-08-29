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
import { localUserRequires2FA, verifyLoginSecondFactor } from '../lib/accountSecurity';
import {
  PasswordResetForms,
  TwoFactorPanel,
  TwoFactorLoginStep,
} from './AccountSecurityPanel';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPanel?: 'account' | 'supporter';
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

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

/** Free accounts + Supporter + password reset + authenticator 2FA (lab). */
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
  const [pending2fa, setPending2fa] = useState(false);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
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
    setPending2fa(false);
    setPendingUser(null);
    const s = getSession();
    if (s) {
      setUser(s.user);
      setSource(s.source);
      const p = loadUserPrefs(s.user.id);
      setPrefs(p || { ...emptyPrefs(s.user.email), fullName: s.user.fullName, email: s.user.email });
      void refreshMe().then((me) => {
        if (me) {
          setUser(me.user);
          setSource(me.source);
          if (me.prefs) setPrefs((prev) => ({ ...prev, ...me.prefs, email: me.user.email }));
        }
      });
    } else {
      setUser(null);
      setSource(null);
      setPrefs(emptyPrefs());
    }
  }, [isOpen, initialPanel]);

  if (!isOpen) return null;

  const finishLogin = (resUser: AuthUser, resSource: 'cloud' | 'local') => {
    setUser(resUser);
    setSource(resSource);
    const p = loadUserPrefs(resUser.id) || {
      ...emptyPrefs(resUser.email),
      fullName: resUser.fullName,
      email: resUser.email,
    };
    setPrefs(p);
    setPending2fa(false);
    setPendingUser(null);
    setPassword('');
    setNotice(resSource === 'cloud' ? 'Signed in · cloud session (D1).' : 'Signed in · saved on this device.');
  };

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
      if (authMode === 'signin' && localUserRequires2FA(email)) {
        setPendingUser(res.user);
        setSource(res.source || 'local');
        setPending2fa(true);
        setNotice('Enter your authenticator code to finish sign-in.');
        return;
      }
      finishLogin(res.user, res.source || 'local');
    } finally {
      setBusy(false);
    }
  };

  const handle2faLogin = async (code: string) => {
    setBusy(true);
    setError(null);
    const v = await verifyLoginSecondFactor({ email, code });
    setBusy(false);
    if (!v.success) {
      setError(v.error || 'Invalid code');
      return;
    }
    if (pendingUser) finishLogin(pendingUser, source || 'local');
  };

  const handleLogout = async () => {
    await logoutAccount();
    setUser(null);
    setSource(null);
    setPending2fa(false);
    setPendingUser(null);
    setPrefs(emptyPrefs());
    setNotice('Signed out.');
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    const result = await saveUserPrefs({ ...prefs, email: user.email });
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'Save failed');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setNotice('Preferences saved.');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> Account
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setPanel('account')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${
              panel === 'account' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Account
          </button>
          <button
            type="button"
            onClick={() => setPanel('supporter')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold ${
              panel === 'supporter' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Supporter
          </button>
        </div>

        {notice && <div className="mb-3 text-[11px] text-cyan-200 bg-cyan-950/40 border border-cyan-800/40 rounded-lg px-3 py-2">{notice}</div>}
        {error && <div className="mb-3 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-lg px-3 py-2">{error}</div>}

        {panel === 'account' && !user && (
          <div className="space-y-4">
            {pending2fa ? (
              <TwoFactorLoginStep onSubmit={handle2faLogin} busy={busy} />
            ) : authMode === 'forgot' || authMode === 'reset' ? (
              <PasswordResetForms
                mode={authMode}
                onMode={(m) => setAuthMode(m)}
                onNotice={setNotice}
                onError={setError}
                initialEmail={email}
              />
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                      authMode === 'signin' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5 inline mr-1" /> Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                      authMode === 'signup' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Create free account
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Free account: save preferences. Passwords hashed (PBKDF2). Optional authenticator 2FA after sign-in.
                </p>
                {authMode === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Full name</label>
                    <input
                      type="text"
                      value={prefs.fullName}
                      onChange={(e) => setPrefs((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Password (min 8)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[11px] text-indigo-300 hover:text-indigo-200"
                  >
                    Forgot your password?
                  </button>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {busy ? 'Please wait…' : authMode === 'signup' ? 'Create free account' : 'Sign in'}
                </button>
              </form>
            )}
          </div>
        )}

        {panel === 'account' && user && (
          <form onSubmit={handleSavePrefs} className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-2">
              <div className="text-xs min-w-0">
                <div className="font-bold text-emerald-200 truncate">{user.email}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  {source === 'cloud' ? <Cloud className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {source === 'cloud' ? 'Cloud account' : 'Device account (local)'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>

            <TwoFactorPanel onNotice={setNotice} onError={setError} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Full name</label>
                <input
                  type="text"
                  value={prefs.fullName}
                  onChange={(e) => setPrefs((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Home city</label>
                <select
                  value={prefs.homeCity}
                  onChange={(e) => setPrefs((p) => ({ ...p, homeCity: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {MAJOR_CITIES.slice(0, 80).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Time format</label>
                <div className="flex p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, timeFormat: '24h' }))}
                    className={`flex-1 py-1 rounded ${prefs.timeFormat === '24h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, timeFormat: '12h' }))}
                    className={`flex-1 py-1 rounded ${prefs.timeFormat === '12h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    12h
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Temperature</label>
                <div className="flex p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'C' }))}
                    className={`flex-1 py-1 rounded ${prefs.tempUnit === 'C' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, tempUnit: 'F' }))}
                    className={`flex-1 py-1 rounded ${prefs.tempUnit === 'F' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              {(
                [
                  ['dstAlerts', 'DST shift warnings'],
                  ['astronomyBulletin', 'Astronomy bulletin'],
                  ['holidayAlerts', 'Public holiday digest'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-200">{label}</span>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    className="accent-blue-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-between">
              <button type="button" onClick={() => setPanel('supporter')} className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> Supporter plans
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {saved ? 'Saved' : 'Save preferences'}
              </button>
            </div>
          </form>
        )}

        {panel === 'supporter' && (
          <BillingPlansPanel
            user={user}
            onNeedAccount={() => {
              setPanel('account');
              setAuthMode('signup');
            }}
            onNotice={setNotice}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default UserAccountModal;
