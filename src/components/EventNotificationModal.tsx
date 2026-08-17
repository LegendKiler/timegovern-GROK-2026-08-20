import React, { useState } from 'react';
import { 
  X, Bell, BellOff, Volume2, VolumeX, Globe, Clock, ShieldCheck, 
  Sparkles, Check, Play, AlertCircle, Calendar, ToggleLeft, ToggleRight
} from 'lucide-react';
import { 
  NotificationSettings, 
  getBrowserNotificationPermission, 
  requestNotificationPermission, 
  dispatchBrowserNotification, 
  playNotificationChime,
  formatRemindTimeText 
} from '../lib/eventNotifications';
import { CustomScheduleEvent } from '../lib/pdfScheduleGenerator';

interface EventNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  customEvents: CustomScheduleEvent[];
  onToggleEventNotify?: (eventId: string) => void;
  onTriggerTestAlert: () => void;
}

export const EventNotificationModal: React.FC<EventNotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  customEvents,
  onToggleEventNotify,
  onTriggerTestAlert,
}) => {
  const [browserPerm, setBrowserPerm] = useState<string>(getBrowserNotificationPermission());
  const [testSent, setTestSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPerm(getBrowserNotificationPermission());
    if (granted) {
      onUpdateSettings({ ...settings, browserPush: true });
    }
  };

  const handleTestNotification = () => {
    onTriggerTestAlert();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              settings.enabled 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  EVENT NOTIFICATION ENGINE
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Calendar Event Notifications
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Main Master Switch Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            settings.enabled 
              ? 'bg-blue-950/40 border-blue-500/40 text-blue-100'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Event Reminders & Alerts</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  settings.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {settings.enabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Trigger visual notifications and alerts when upcoming calendar events and meetings approach.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, enabled: !settings.enabled })}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                settings.enabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              {settings.enabled ? (
                <ToggleRight className="w-10 h-10 text-blue-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>

          {/* Sub Settings */}
          {settings.enabled && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Alert Lead Time Selector */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Default Notification Lead Time</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                    {formatRemindTimeText(settings.remindMinutes)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { val: 0, label: 'At Time' },
                    { val: 15, label: '15 min before' },
                    { val: 60, label: '1 hour before' },
                    { val: 1440, label: '1 day before' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, remindMinutes: opt.val })}
                      className={`p-2 rounded-lg font-semibold border text-center transition-all cursor-pointer ${
                        settings.remindMinutes === opt.val
                          ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-xs'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Browser Desktop Notifications */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Browser Push</span>
                    </span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                      browserPerm === 'granted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : browserPerm === 'denied'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {browserPerm}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Display OS / browser desktop banner notifications even when tab is in background.
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    {browserPerm !== 'granted' ? (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Enable Permission
                      </button>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.browserPush}
                          onChange={(e) => onUpdateSettings({ ...settings, browserPush: e.target.checked })}
                          className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <span className="text-slate-300 text-[11px]">Send Browser Push</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Sound Chimes */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      <span>Audio Chime</span>
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => {
                          const next = e.target.checked;
                          onUpdateSettings({ ...settings, soundEnabled: next });
                          if (next) playNotificationChime();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Play a gentle dual-harmonic sine chime when an alert appears.
                  </p>

                  <button
                    type="button"
                    onClick={() => playNotificationChime()}
                    className="mt-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-cyan-400" /> Preview Chime Sound
                  </button>
                </div>
              </div>

              {/* Public Holiday Alerts Toggle */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Public Holiday Observances</span>
                  <span className="text-[11px] text-slate-400">Alert for statutory national holidays on the day of the holiday.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyHolidays}
                    onChange={(e) => onUpdateSettings({ ...settings, notifyHolidays: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Event Notification Toggles List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-bold text-white block">Individual Event Notifications ({customEvents.length})</span>
                {customEvents.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded-lg">
                    No custom events created yet. Add events via the PDF Schedule / Event Creator.
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {customEvents.map((evt) => {
                      const isArmed = evt.notify !== false;
                      return (
                        <div
                          key={evt.id}
                          className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-200 truncate block">{evt.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {evt.date} {evt.time ? `• ${evt.time}` : ''}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onToggleEventNotify && onToggleEventNotify(evt.id)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isArmed
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isArmed ? <Bell className="w-3 h-3 text-amber-400" /> : <BellOff className="w-3 h-3" />}
                            <span>{isArmed ? 'Armed' : 'Muted'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestNotification}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {testSent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{testSent ? 'Alert Dispatched!' : 'Trigger Test Alert'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
