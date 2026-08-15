import React, { useState } from 'react';
import { X, User, Shield, Mail, Bell, Check, Key, Smartphone, Cloud, Globe, Sparkles } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose }) => {
  const [userName, setUserName] = useState<string>('Nadeem (Enterprise Admin)');
  const [userEmail, setUserEmail] = useState<string>('Nadeem101@gmail.com');
  const [homeCity, setHomeCity] = useState<string>('New York');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [saved, setSaved] = useState<boolean>(false);

  // Newsletter Subscriptions
  const [dstAlerts, setDstAlerts] = useState<boolean>(true);
  const [astronomyBulletin, setAstronomyBulletin] = useState<boolean>(true);
  const [holidayAlerts, setHolidayAlerts] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-white shadow-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">TimeGovern Account & Cloud Sync</h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage your profile, sync custom city watchlists across Cloudflare Edge, and configure email digests.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Profile Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Regional & Time Display Preferences
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Primary Home City</label>
                <select
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                >
                  {MAJOR_CITIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.countryCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Clock Display Format</label>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`flex-1 py-1 rounded font-mono ${timeFormat === '12h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    12-Hour (AM/PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`flex-1 py-1 rounded font-mono ${timeFormat === '24h' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    24-Hour (00:00)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Temperature Unit</label>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setTempUnit('C')}
                    className={`flex-1 py-1 rounded font-mono ${tempUnit === 'C' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit('F')}
                    className={`flex-1 py-1 rounded font-mono ${tempUnit === 'F' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email Digest & Newsletter Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" /> Temporal Newsletters & Automated Digest Alerts
            </h4>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Daylight Saving Time (DST) Shift Warnings</span>
                  <span className="text-[10px] text-slate-400">Get notified 48 hours before clock shifts in your saved watchlists.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dstAlerts}
                  onChange={(e) => setDstAlerts(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Weekly Astronomy & Solstice/Equinox Bulletin</span>
                  <span className="text-[10px] text-slate-400">Upcoming lunar eclipses, full moons, and meteor showers.</span>
                </div>
                <input
                  type="checkbox"
                  checked={astronomyBulletin}
                  onChange={(e) => setAstronomyBulletin(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200 block">Global Public Holiday Calendar Digest</span>
                  <span className="text-[10px] text-slate-400">Monthly breakdown of bank holidays across US, UK, EU, JP, IN.</span>
                </div>
                <input
                  type="checkbox"
                  checked={holidayAlerts}
                  onChange={(e) => setHolidayAlerts(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Cloud Status */}
          <div className="flex items-center justify-between bg-blue-950/40 p-3 rounded-xl border border-blue-800/50 text-xs">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-semibold text-blue-200 block">Edge Cloud Sync Enabled</span>
                <span className="text-[10px] text-blue-400">Watchlists and custom meeting links synced to Cloudflare KV.</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              SYNCED
            </span>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
            >
              {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{saved ? 'Preferences Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
