import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone, ExternalLink, Share2, Download } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  url = window.location.href,
  title = 'Timegovern.com Mobile & QR Portal'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{title}</h3>
            <p className="text-xs text-slate-400">Scan QR Code to open on mobile or share with your team</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-inner my-4 border border-slate-200">
          <QRCodeSVG
            value={targetUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: 'https://api.iconify.design/lucide:globe.svg',
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <span className="text-[10px] font-mono font-bold text-slate-600 mt-2">
            SCAN WITH CAMERA OR TIMEGOVERN APP
          </span>
        </div>

        {/* Copyable Link */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Direct Shareable URL
          </label>
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="bg-transparent text-xs text-blue-300 font-mono w-full focus:outline-none truncate px-1"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Mobile App Promotion Section */}
        <div className="mt-5 pt-4 border-t border-slate-800 bg-slate-950/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Timegovern Mobile Edition (iOS & Android)</h4>
              <p className="text-[11px] text-slate-400">
                Offline atomic clock sync, live home screen widgets, and meeting overlap alerts.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-medium py-1.5 rounded-lg text-center transition-colors">
               Apple App Store
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-medium py-1.5 rounded-lg text-center transition-colors">
              ▶ Google Play Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
