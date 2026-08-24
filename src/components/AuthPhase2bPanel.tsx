import React, { useEffect, useState } from 'react';
import {
  requestMagicLink,
  loginWithGoogle,
  sendVerificationEmail,
  exportSyncCode,
  importSyncCode,
  getGoogleClientId,
  type AuthUser,
} from '../lib/accountAuth';

type Props = {
  mode: 'guest' | 'signed-in';
  user?: AuthUser | null;
  defaultEmail?: string;
  onSignedIn?: (user: AuthUser) => void;
  onNotice?: (msg: string) => void;
  onError?: (msg: string) => void;
};

/** Magic link, Google, verification, offline sync — Phase 2b */
export function AuthPhase2bPanel({ mode, user, defaultEmail = '', onSignedIn, onNotice, onError }: Props) {
  const [magicEmail, setMagicEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [syncPass, setSyncPass] = useState('');
  const [syncCode, setSyncCode] = useState('');

  useEffect(() => {
    setMagicEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) return;
    if (document.getElementById('google-gsi')) {
      setGoogleReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.id = 'google-gsi';
    s.onload = () => setGoogleReady(true);
    document.head.appendChild(s);
  }, []);

  if (mode === 'guest') {
    return (
      <div className="space-y-3 border-t border-slate-800 pt-3">
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-slate-900 px-2 text-slate-500">or</span></div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Magic link (no password)</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const r = await requestMagicLink(magicEmail);
                setBusy(false);
                if (!r.success) onError?.(r.error || 'Failed');
                else onNotice?.((r.message || 'OK') + (r.labLink ? ` Lab link: ${r.labLink}` : ''));
              }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold shrink-0"
            >
              Send link
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Needs Worker + Resend for real email. Lab may show a one-time link in the notice.</p>
        </div>

        {getGoogleClientId() ? (
          <button
            type="button"
            disabled={busy || !googleReady}
            onClick={() => {
              const g = (window as any).google;
              if (!g?.accounts?.id) {
                onError?.('Google script not loaded');
                return;
              }
              g.accounts.id.initialize({
                client_id: getGoogleClientId(),
                callback: async (resp: { credential: string }) => {
                  setBusy(true);
                  const r = await loginWithGoogle(resp.credential);
                  setBusy(false);
                  if (!r.success || !r.user) onError?.(r.error || 'Google failed');
                  else {
                    onNotice?.('Signed in with Google (cloud).');
                    onSignedIn?.(r.user);
                  }
                },
              });
              g.accounts.id.prompt();
            }}
            className="w-full py-2.5 border border-slate-600 rounded-xl text-xs font-bold text-white hover:bg-slate-800"
          >
            Continue with Google
          </button>
        ) : (
          <p className="text-[10px] text-slate-500">Google: set VITE_GOOGLE_CLIENT_ID in .env to enable.</p>
        )}

        <div className="rounded-xl border border-slate-700 p-3 space-y-2 text-xs">
          <div className="font-bold text-slate-200">Import sync code (other device)</div>
          <input
            type="password"
            value={syncPass}
            onChange={(e) => setSyncPass(e.target.value)}
            placeholder="Passphrase"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs"
          />
          <textarea
            value={syncCode}
            onChange={(e) => setSyncCode(e.target.value)}
            placeholder="Paste sync code"
            className="w-full h-16 text-[10px] bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono"
          />
          <button
            type="button"
            onClick={async () => {
              const r = await importSyncCode(syncCode, syncPass);
              if (!r.success) onError?.(r.error || 'Import failed');
              else {
                onNotice?.('Imported on this device.');
                if (r.user) onSignedIn?.(r.user);
              }
            }}
            className="px-3 py-1.5 bg-slate-700 rounded-lg font-bold text-[11px]"
          >
            Import code
          </button>
        </div>
      </div>
    );
  }

  // signed-in
  return (
    <div className="space-y-3 border-t border-slate-800 pt-3">
      <div className="rounded-xl border border-slate-700 p-3 space-y-2 text-xs">
        <div className="font-bold text-slate-200">Email verification</div>
        {user?.emailVerified ? (
          <p className="text-emerald-400 text-[11px]">Email verified</p>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const r = await sendVerificationEmail();
              setBusy(false);
              if (!r.success) onError?.(r.error || 'Failed');
              else onNotice?.((r.message || 'OK') + (r.labLink ? ` Lab: ${r.labLink}` : ''));
            }}
            className="px-3 py-1.5 bg-slate-800 rounded-lg font-bold text-[11px]"
          >
            Send verification email
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 p-3 space-y-2 text-xs">
        <div className="font-bold text-slate-200">Cross-device sync (no cloud required)</div>
        <p className="text-[10px] text-slate-500">Export encrypted code → import on another browser with the same passphrase.</p>
        <input
          type="password"
          value={syncPass}
          onChange={(e) => setSyncPass(e.target.value)}
          placeholder="Passphrase"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={async () => {
            if (!syncPass) {
              onError?.('Enter a passphrase');
              return;
            }
            const r = await exportSyncCode(syncPass);
            if (!r.success) onError?.(r.error || 'Export failed');
            else {
              setSyncCode(r.code || '');
              onNotice?.('Copy the sync code below.');
            }
          }}
          className="px-3 py-1.5 bg-cyan-700 rounded-lg font-bold text-[11px]"
        >
          Export code
        </button>
        {syncCode && (
          <textarea
            readOnly
            value={syncCode}
            className="w-full h-20 text-[10px] bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        )}
      </div>
    </div>
  );
}
