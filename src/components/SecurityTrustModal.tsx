import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const runSecurityAudit = () => {
    setTestingSecurity(true);
    window.setTimeout(() => {
      const isHttps = window.location.protocol === 'https:';
      const secureContext = typeof window.isSecureContext === 'boolean' ? window.isSecureContext : isHttps;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Security & Trust Centre</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  TIMEGOVERN
                </span>
              </div>
              <p className="text-xs text-slate-400">How we protect your connection, privacy expectations, and site integrity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs">Encrypted transport</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Production sites use HTTPS so browsers encrypt data in transit (TLS).
                </p>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-xl flex items-start gap-3">
              <Globe className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs">Official domains</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Use <span className="font-mono text-cyan-300">timegovern.com</span> or{' '}
                  <span className="font-mono text-cyan-300">www.timegovern.com</span> — same service.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-purple-500/30 p-3.5 rounded-xl flex items-start gap-3">
              <Server className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-xs">Availability & abuse resistance</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Global edge delivery and standard protections against common volumetric attacks.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Domains & the browser padlock</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              When you open TimeGovern on the public internet, your browser should show a secure connection (padlock)
              for <strong className="text-cyan-300 font-mono">timegovern.com</strong>. That means the page and API
              calls between your device and our servers are encrypted. On local development (for example{' '}
              <span className="font-mono text-slate-400">localhost</span>), HTTP is normal and the padlock may not appear.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Certificates are issued and renewed automatically for the production domain. You do not need to install
              a certificate on your computer to use the site.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Quick connection check</h3>
              </div>
              <button
                type="button"
                onClick={runSecurityAudit}
                disabled={testingSecurity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSecurity ? 'animate-spin' : ''}`} />
                {testingSecurity ? 'Checking…' : 'Run Security check'}
              </button>
            </div>
            {!testResults ? (
              <p className="text-slate-400">
                Runs entirely in your browser. It reports the protocol and host of this page — it does not scan other
                people&apos;s devices or change your settings.
              </p>
            ) : (
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Host</span>
                  <span className="text-cyan-300">{testResults.host}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Protocol</span>
                  <span className={testResults.isHttps ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                    {testResults.protocol}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Status</span>
                  <span className="text-slate-200">{testResults.tlsLabel}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Secure context</span>
                  <span className={testResults.secureContext ? 'text-emerald-400' : 'text-amber-300'}>
                    {testResults.secureContext ? 'Yes' : 'No (expected on plain HTTP localhost)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">What TimeGovern does with your data</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Tools first, accounts optional</h5>
                  <p className="text-slate-400 text-[10px]">
                    World clocks, calendars and many calculators work without signing in. Preferences such as pinned
                    cities can stay in your browser.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Standards-based time data</h5>
                  <p className="text-slate-400 text-[10px]">
                    Zone rules follow the public IANA time zone database. Astronomical times use established solar and
                    lunar algorithms. Always confirm critical legal or medical deadlines with official sources.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white text-[11px]">Privacy & contact</h5>
                  <p className="text-slate-400 text-[10px]">
                    See Privacy Policy and Trust Centre under Company for collection purposes, marketing rules (including
                    Australia&apos;s Spam Act 2003), and how to request access or deletion:{' '}
                    <span className="text-cyan-300">privacy@timegovern.com</span>. Report security issues to{' '}
                    <span className="text-cyan-300">security@timegovern.com</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Note for visitors:</strong> This panel explains TimeGovern&apos;s security
            posture in everyday language. It is not a substitute for independent security testing or legal advice. For
            full policy text open <strong className="text-slate-200">Company → Legal</strong> and{' '}
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
            onClick={onClose}
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
