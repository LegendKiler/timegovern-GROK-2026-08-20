import React from 'react';
import { Bell, Clock, X, Volume2, VolumeX, Calendar, Check, AlertCircle } from 'lucide-react';
import { ActiveAlert, playNotificationChime } from '../lib/eventNotifications';

interface EventAlertBannerProps {
  alerts: ActiveAlert[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onJumpToDate?: (date: string) => void;
}

export const EventAlertBanner: React.FC<EventAlertBannerProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
  soundEnabled,
  onToggleSound,
  onJumpToDate,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0 space-y-2 pointer-events-none">
      {alerts.map((alert) => {
        const isUrgent = alert.minutesRemaining <= 15;
        return (
          <div
            key={alert.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              isUrgent
                ? 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-500/10'
                : 'bg-slate-900/95 border-blue-500/50 text-white shadow-blue-500/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    alert.isHoliday
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : isUrgent
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        alert.isHoliday
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {alert.isHoliday ? 'Holiday Observance' : alert.category}
                    </span>

                    <span className="text-[11px] font-bold font-mono text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.minutesRemaining <= 0
                        ? 'Happening Now!'
                        : alert.minutesRemaining <= 60
                        ? `In ${alert.minutesRemaining} min`
                        : `In ${Math.round(alert.minutesRemaining / 60)} hr`}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white leading-snug">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <span>{alert.date}</span>
                    {alert.time && <span className="font-mono text-cyan-300">at {alert.time}</span>}
                    {alert.notes && <span className="text-slate-400 truncate max-w-48">({alert.notes})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="text-[11px] text-slate-400">
                TimeGovern Temporal Reminder
              </div>

              <div className="flex items-center gap-2">
                {onJumpToDate && (
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToDate(alert.date);
                      onDismiss(alert.id);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>View Date</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDismiss(alert.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length > 1 && (
        <div className="flex justify-end pointer-events-auto">
          <button
            type="button"
            onClick={onDismissAll}
            className="text-xs text-slate-400 hover:text-white bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg shadow-md cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Dismiss All Alerts ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
};
