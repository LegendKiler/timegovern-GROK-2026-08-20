import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  KeyRound, Shield, Smartphone, Copy, Check, AlertCircle,
} from 'lucide-react';
import {
  requestPasswordReset,
  resetPasswordWithKey,
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  getTwoFactorStatus,
} from '../lib/accountSecurity';

/** Forgot password + set new password (timeanddate-style activation key). */
export const PasswordResetForms: React.FC<{
  mode: 'forgot' | 'reset';
  onMode: (m: 'forgot' | 'reset' | 'signin') => void;
  onNotice: (m: string | null) => void;
  onError: (m: string | null) => void;
  initialEmail?: string;
}> = ({ mode, onMode, onNotice, onError, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [key, setKey] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [busy, setBusy] = useState(false);
  const [labKey, setLabKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const requestKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError(null);
    onNotice(null);
    const r = await requestPasswordReset(email);
    setBusy(false);
    if (!r.success) {
      onError(r.error || 'Request failed');
      return;
    }
    onNotice(r.message);
    if (r.labActivationKey) {
      setLabKey(r.labActivationKey);
      setKey(r.labActivationKey);
      onMode('reset');
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== pass2) {
      onError('Passwords do not match');
      return;
    }
    setBusy(true);
    onError(null);
    const r = await resetPasswordWithKey({ email, activationKey: key, newPassword: pass });
    setBusy(false);
    if (!r.success) {
      onError(r.error || 'Reset failed');
      return;
    }
    onNotice(r.message || 'Password saved. Sign in.');
    onMode('signin');
  };

  if (mode === 'forgot') {
    return (
      <form onSubmit={requestKey} className="space-y-3">
        <p className="text-xs text-slate-400 leading-relaxed">
          Enter your account email. We send an <strong className="text-slate-200">activation key</strong> (lab:
          shown on screen; production: email).
        </p>
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
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Email me an activation key'}
        </button>
        <button type="button" onClick={() => onMode('signin')} className="w-full text-[11px] text-slate-400 hover:text-white">
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={savePassword} className="space-y-3">
      <div className="flex items-start gap-2">
        <KeyRound className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-white">Set new password</h4>
          <p className="text-[11px] text-slate-400">Use the activation key from email (or lab demo below).</p>
        </div>
      </div>
      {labKey && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-[11px] text-amber-100">
          <p className="font-bold mb-1">Lab activation key (production emails this)</p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm text-white">{labKey}</code>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(labKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="p-1 rounded border border-slate-600"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
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
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1">Activation key</label>
        <input
          required
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
          placeholder="e.g. 1234-abcd-5678-efgh"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1">New password (min 8)</label>
        <input
          type="password"
          required
          minLength={8}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1">Repeat password</label>
        <input
          type="password"
          required
          minLength={8}
          value={pass2}
          onChange={(e) => setPass2(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Save password'}
      </button>
      <button
        type="button"
        onClick={() => onMode('forgot')}
        className="w-full text-[11px] text-indigo-300 hover:text-indigo-200"
      >
        Request a new activation key
      </button>
      <button type="button" onClick={() => onMode('signin')} className="w-full text-[11px] text-slate-400 hover:text-white">
        Back to sign in
      </button>
    </form>
  );
};

/** Authenticator 2FA setup / disable (Google & Microsoft Authenticator). */
export const TwoFactorPanel: React.FC<{
  onNotice: (m: string | null) => void;
  onError: (m: string | null) => void;
}> = ({ onNotice, onError }) => {
  const [status, setStatus] = useState(getTwoFactorStatus());
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disPass, setDisPass] = useState('');
  const [disCode, setDisCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(getTwoFactorStatus());
  }, []);

  const start = async () => {
    setBusy(true);
    onError(null);
    const r = await beginTwoFactorSetup();
    setBusy(false);
    if (!r.success || !r.secret || !r.otpauthUrl) {
      onError(r.error || 'Could not start 2FA');
      return;
    }
    setSetup({ secret: r.secret, otpauthUrl: r.otpauthUrl });
    setBackupCodes(null);
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError(null);
    const r = await confirmTwoFactorSetup(code);
    setBusy(false);
    if (!r.success) {
      onError(r.error || 'Invalid code');
      return;
    }
    setBackupCodes(r.backupCodes || []);
    setSetup(null);
    setCode('');
    setStatus(getTwoFactorStatus());
    onNotice('Authenticator enabled. Save your backup codes.');
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError(null);
    const r = await disableTwoFactor({ password: disPass, code: disCode });
    setBusy(false);
    if (!r.success) {
      onError(r.error || 'Could not disable');
      return;
    }
    setStatus(getTwoFactorStatus());
    onNotice('Two-factor authentication turned off.');
    setDisPass('');
    setDisCode('');
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-bold text-white">Authenticator app (2FA)</h4>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Works with <strong className="text-slate-200">Google Authenticator</strong> and{' '}
        <strong className="text-slate-200">Microsoft Authenticator</strong> (same QR). Free TOTP — no SMS fees.
      </p>

      {status.enabled ? (
        <div className="space-y-2">
          <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> 2FA is on for this account
          </p>
          <form onSubmit={disable} className="space-y-2 border-t border-slate-800 pt-3">
            <p className="text-[11px] text-slate-500">Turn off — password + current code (or backup code)</p>
            <input
              type="password"
              placeholder="Password"
              value={disPass}
              onChange={(e) => setDisPass(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              required
            />
            <input
              placeholder="6-digit code or backup code"
              value={disCode}
              onChange={(e) => setDisCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 rounded-lg text-xs font-bold border border-rose-500/40 text-rose-300 hover:bg-rose-950/40"
            >
              Disable 2FA
            </button>
          </form>
        </div>
      ) : !setup ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          {busy ? 'Preparing…' : 'Set up authenticator'}
        </button>
      ) : (
        <form onSubmit={confirm} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="bg-white p-2 rounded-xl">
              <QRCodeSVG value={setup.otpauthUrl} size={140} level="M" />
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 min-w-0">
              <p>1. Open Google or Microsoft Authenticator</p>
              <p>2. Scan this QR (or enter secret manually)</p>
              <p className="font-mono text-[10px] text-slate-300 break-all">Secret: {setup.secret}</p>
              <p>3. Enter the 6-digit code below</p>
            </div>
          </div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest"
            maxLength={6}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {busy ? 'Verifying…' : 'Confirm and enable 2FA'}
          </button>
          <button type="button" onClick={() => setSetup(null)} className="w-full text-[11px] text-slate-500">
            Cancel
          </button>
        </form>
      )}

      {backupCodes && backupCodes.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3">
          <p className="text-xs font-bold text-amber-100 flex items-center gap-1 mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> Save these backup codes (once)
          </p>
          <ul className="grid grid-cols-2 gap-1 font-mono text-[11px] text-white">
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/** Optional second step after password login */
export const TwoFactorLoginStep: React.FC<{
  onSubmit: (code: string) => Promise<void>;
  busy?: boolean;
}> = ({ onSubmit, busy }) => {
  const [code, setCode] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(code);
      }}
      className="space-y-3"
    >
      <p className="text-xs text-slate-300">Enter the 6-digit code from your authenticator app.</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest"
        placeholder="123456"
        maxLength={12}
        required
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white"
      >
        {busy ? 'Checking…' : 'Verify and sign in'}
      </button>
    </form>
  );
};
