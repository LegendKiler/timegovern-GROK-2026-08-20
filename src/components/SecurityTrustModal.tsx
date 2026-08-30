import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Cpu,
} from 'lucide-react';

interface SecurityTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Public Trust & Security centre — written for visitors, not hosting dashboards.
 * Explains how timegovern.com protects connections and data in plain language.
 * Close: X, footer Close, click outside backdrop, or Escape.
 */
export const SecurityTrustModal: React.FC<SecurityTrustModalProps> = ({ isOpen, onClose }) => {
  const [testingSecurity, setTestingSecurity] = useState(false);
  const [testResults, setTestResults] = useState<{
    protocol: string;
    host: string;
    isHttps: boolean;
    tlsLabel: string;
    secureContext: boolean;
  } | null>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Esc + body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const runSecurityAudit = () => {
    setTestingSecurity(true);
    window.setTimeout(() => {
      const isHttps = window.location.protocol === 'https:';
      const secureContext =
        typeof window.isSecureContext === 'boolean' ? window.isSecureContext : isHttps;
      setTestResults({
        protocol: window.location.protocol.replace(':', '').toUpperCase() || 'HTTP',
        host: window.location.hostname || 'timegovern.com',
        isHttps,
        tlsLabel: isHttps ? 'Encrypted connection (browser HTTPS)' : 'Local or non-HTTPS session',
        secureContext,
      });
      setTestingSecurity(false);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={handleClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-security-trust-title"
        className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="tg-security-trust-title"
                  className="text-lg font-bold text-white tracking-tight"
                >
                  Security & Trust Centre
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  TIMEGOVERN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                How we protect your connection, privacy expectations, and site integrity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-xl border border-slate-600 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-3">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Encrypted transport</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Production sites use HTTPS so browsers encrypt data in transit (TLS).
              </p>
            </div>
            <div className="rounded-xl border border-cyan-500/40 bg-slate-900/50 p-3">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Official domains</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use <span className="text-cyan-300 font-semibold">timegovern.com</span> or{' '}
                <span className="text-cyan-300 font-semibold">www.timegovern.com</span> — same service.
              </p>
            </div>
            <div className="rounded-xl border border-violet-500/40 bg-slate-900/50 p-3">
              <div className="flex items-center gap-2 text-violet-300 mb-1">
                <Server className="w-4 h-4" />
                <span className="text-xs font-bold text-white">Availability & abuse resistance</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Global edge delivery and standard protections against common volumetric attacks.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Domains & the browser padlock</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you open TimeGovern on the public internet, your browser should show a secure connection
              (padlock) for <span className="text-cyan-300 font-semibold">timegovern.com</span>. That means
              the page and API calls between your device and our servers are encrypted. On local development
              (for example <span className="font-mono text-slate-300">localhost</span>), HTTP is normal and
              the padlock may not appear.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
              Certificates are issued and renewed automatically for the production domain. You do not need to
              install a certificate on your computer to use the site.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Quick connection check</h3>
              </div>
              <button
                type="button"
                onClick={runSecurityAudit}
                disabled={testingSecurity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSecurity ? 'animate-spin' : ''}`} />
                {testingSecurity ? 'Checking…' : 'Run Security check'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Runs entirely in your browser. It reports the protocol and host of this page — it does not scan
              other people&apos;s devices or change your settings.
            </p>
            {testResults && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-2.5">
                  <span className="text-slate-500">Protocol</span>
                  <p className="font-mono text-white font-semibold">{testResults.protocol}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-2.5">
                  <span className="text-slate-500">Host</span>
                  <p className="font-mono text-white font-semibold">{testResults.host}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-2.5 sm:col-span-2">
                  <span className="text-slate-500">Status</span>
                  <p className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                    {testResults.isHttps ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    {testResults.tlsLabel}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">What TimeGovern does with your data</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Tools first, accounts optional</h5>
                  <p className="text-slate-400 text-[10px]">
                    World clocks, calendars and many calculators work without signing in. Preferences such as
                    pinned cities can stay in your browser.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Standards-based time data</h5>
                  <p className="text-slate-400 text-[10px]">
                    Zone rules follow the public IANA time zone database. Astronomical times use established
                    solar and lunar algorithms. Always confirm critical legal or medical deadlines with official
                    sources.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Privacy & contact</h5>
                  <p className="text-slate-400 text-[10px]">
                    See Privacy Policy and Trust Centre under Company for collection purposes, marketing rules
                    (including Australia&apos;s Spam Act 2003), and how to request access or deletion:{' '}
                    <span className="text-cyan-300">privacy@timegovern.com</span>. Report security issues to{' '}
                    <span className="text-cyan-300">security@timegovern.com</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Note for visitors:</strong> This panel explains TimeGovern&apos;s
            security posture in everyday language. It is not a substitute for independent security testing or legal
            advice. For full policy text open <strong className="text-slate-200">Company → Legal</strong> and{' '}
            <strong className="text-slate-200">Company → Trust Centre</strong>.
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TimeGovern Trust & Security · Melbourne, Australia</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTrustModal;
