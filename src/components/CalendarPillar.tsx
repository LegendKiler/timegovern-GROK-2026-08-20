import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Calculator,
  Clock,
  Printer,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  Check,
  Filter,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Briefcase,
  Layers,
  Info,
  CalendarRange,
  CalendarCheck2,
  Zap,
  CheckCircle2,
  Copy,
  Download,
  FileDown,
  Settings2,
  CheckSquare,
  Square,
  Tag,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play
} from 'lucide-react';
import { getPublicHolidaysForCountry } from '../lib/holidayData';
import { calculateDaysBetweenDates, addDurationToDate, DateDiffResult } from '../lib/dateCalculators';
import { PublicHoliday } from '../types';
import { PdfScheduleModal } from './PdfScheduleModal';
import { EventAlertBanner } from './EventAlertBanner';
import { EventNotificationModal } from './EventNotificationModal';
import { 
  CustomScheduleEvent, 
  downloadMonthlyPdfSchedule, 
  PdfScheduleOptions 
} from '../lib/pdfScheduleGenerator';
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  ActiveAlert,
  playNotificationChime,
  dispatchBrowserNotification,
  parseEventDateTime
} from '../lib/eventNotifications';

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  JP: 'Japan',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
};

export const CalendarPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'calendar' | 'between' | 'addsub' | 'countdown'>('calendar');

  // Calendar View State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');

  // PDF Schedule & Custom Events State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);
  const [selectedHolidayDates, setSelectedHolidayDates] = useState<Set<string>>(() => new Set());
  const [customEvents, setCustomEvents] = useState<CustomScheduleEvent[]>(() => {
    try {
      const saved = localStorage.getItem('timegovern_custom_events');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'sample-1',
        date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
        title: 'Global Quarterly Review',
        time: '10:00',
        category: 'meeting',
        notes: 'Executive time zone alignment sync'
      },
      {
        id: 'sample-2',
        date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-24`,
        title: 'Milestone Release v3.0',
        category: 'milestone',
        notes: 'Worldwide product rollout'
      }
    ];
  });

  // Save custom events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timegovern_custom_events', JSON.stringify(customEvents));
    } catch {
      // ignore
    }
  }, [customEvents]);

  // Event Notification State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('timegovern_notification_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(() => new Set());

  // Save notification settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timegovern_notification_settings', JSON.stringify(notificationSettings));
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  // Periodic alert check for upcoming events
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const checkUpcomingEvents = () => {
      const now = new Date();
      const newAlerts: ActiveAlert[] = [];
      const updatedNotified = new Set(notifiedKeys);
      let chimePlayed = false;

      // Check custom events
      customEvents.forEach((evt) => {
        if (evt.notify === false) return;
        const evtDate = parseEventDateTime(evt.date, evt.time);
        const diffMs = evtDate.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const leadMins = evt.remindMinutesBefore ?? notificationSettings.remindMinutes;

        // Trigger if within lead window and not older than 90 mins
        if (diffMins <= leadMins && diffMins >= -90) {
          const alertKey = `evt-${evt.id}-${evt.date}`;
          if (!updatedNotified.has(alertKey)) {
            updatedNotified.add(alertKey);

            const alertObj: ActiveAlert = {
              id: alertKey,
              eventId: evt.id,
              title: evt.title,
              date: evt.date,
              time: evt.time,
              category: evt.category,
              notes: evt.notes,
              minutesRemaining: diffMins,
              triggeredAt: Date.now(),
            };
            newAlerts.push(alertObj);

            if (notificationSettings.browserPush) {
              const bodyText = evt.time
                ? `Upcoming at ${evt.time} (${diffMins <= 0 ? 'Starting now' : `in ${diffMins} min`})`
                : `Calendar event scheduled for today`;
              dispatchBrowserNotification(`­ƒôà ${evt.title}`, {
                body: bodyText,
                tag: alertKey,
              });
            }

            if (notificationSettings.soundEnabled && !chimePlayed) {
              playNotificationChime();
              chimePlayed = true;
            }
          }
        }
      });

      // Check today's public holiday observances if enabled
      if (notificationSettings.notifyHolidays) {
        const curYearHolidays = getPublicHolidaysForCountry(selectedCountryCode, now.getFullYear());
        const todayIso = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        const holidayToday = curYearHolidays.find((h) => h.date === todayIso);

        if (holidayToday) {
          const holKey = `hol-${holidayToday.countryCode}-${holidayToday.date}`;
          if (!updatedNotified.has(holKey)) {
            updatedNotified.add(holKey);

            const holAlert: ActiveAlert = {
              id: holKey,
              eventId: holKey,
              title: holidayToday.name,
              date: holidayToday.date,
              category: 'Holiday',
              notes: `${holidayToday.type} in ${COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode}`,
              minutesRemaining: 0,
              triggeredAt: Date.now(),
              isHoliday: true,
            };
            newAlerts.push(holAlert);

            if (notificationSettings.browserPush) {
              dispatchBrowserNotification(`­ƒÄë ${holidayToday.name}`, {
                body: `Public Holiday today in ${COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode}`,
                tag: holKey,
              });
            }

            if (notificationSettings.soundEnabled && !chimePlayed) {
              playNotificationChime();
              chimePlayed = true;
            }
          }
        }
      }

      if (newAlerts.length > 0) {
        setActiveAlerts((prev) => [...newAlerts, ...prev]);
        setNotifiedKeys(updatedNotified);
      }
    };

    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, 15000);
    return () => clearInterval(interval);
  }, [customEvents, notificationSettings, selectedCountryCode, notifiedKeys]);

  const handleDismissAlert = (id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDismissAllAlerts = () => {
    setActiveAlerts([]);
  };

  const handleToggleEventNotify = (eventId: string) => {
    setCustomEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const current = e.notify !== false;
          return { ...e, notify: !current };
        }
        return e;
      })
    );
  };

  const handleTriggerTestAlert = () => {
    const testAlert: ActiveAlert = {
      id: `test-${Date.now()}`,
      eventId: 'test',
      title: 'TimeGovern Test Event Alert',
      date: todayStr,
      time: '14:30',
      category: 'meeting',
      notes: 'Upcoming international alignment session',
      minutesRemaining: 15,
      triggeredAt: Date.now(),
    };

    setActiveAlerts((prev) => [testAlert, ...prev]);

    if (notificationSettings.soundEnabled) {
      playNotificationChime();
    }

    if (notificationSettings.browserPush) {
      dispatchBrowserNotification('­ƒöö Test Alert: Global Strategy Sync', {
        body: 'Your upcoming event starts in 15 minutes. Click to view on TimeGovern.',
        tag: `test-${Date.now()}`,
      });
    }
  };

  // Calendar Click-to-Calculate Range State
  const pad = (n: number) => n.toString().padStart(2, '0');
  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;
  
  const [calRangeStart, setCalRangeStart] = useState<string>(todayStr);
  const [calRangeEnd, setCalRangeEnd] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('end');
  const [isMeasuringMode, setIsMeasuringMode] = useState<boolean>(true);

  // Dedicated "Days between" State
  const [startDateStr, setStartDateStr] = useState<string>(todayStr);
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    const endOfYear = new Date(new Date().getFullYear(), 11, 31);
    return `${endOfYear.getFullYear()}-${pad(endOfYear.getMonth() + 1)}-${pad(endOfYear.getDate())}`;
  });
  const [betweenExcludeHolidays, setBetweenExcludeHolidays] = useState<boolean>(true);
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [weekendPattern, setWeekendPattern] = useState<'sat-sun' | 'fri-sat' | 'sun-only' | 'none'>('sat-sun');

  // Add / Subtract State
  const [baseDateStr, setBaseDateStr] = useState<string>(todayStr);
  const [addAmount, setAddAmount] = useState<number>(30);
  const [addUnit, setAddUnit] = useState<'days' | 'weeks' | 'months' | 'years' | 'businessDays'>('days');
  const [addDirection, setAddDirection] = useState<'add' | 'subtract'>('add');

  // Countdown creator state
  const [cdTitle, setCdTitle] = useState('New Year 2027');
  const [cdTargetStr, setCdTargetStr] = useState('2027-01-01T00:00');
  const [copiedCd, setCopiedCd] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Holidays for current calendar view
  const holidays: PublicHoliday[] = useMemo(() => {
    return getPublicHolidaysForCountry(selectedCountryCode, selectedYear);
  }, [selectedCountryCode, selectedYear]);

  // Sync selected holidays set when holidays change
  useEffect(() => {
    setSelectedHolidayDates(new Set(holidays.map((h) => h.date)));
  }, [holidays]);

  // Holiday Selection Handlers
  const handleToggleHolidayDate = (dateStr: string) => {
    setSelectedHolidayDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const handleSelectAllHolidays = () => {
    setSelectedHolidayDates(new Set(holidays.map((h) => h.date)));
  };

  const handleClearAllHolidays = () => {
    setSelectedHolidayDates(new Set());
  };

  // Custom Event Handlers
  const handleAddCustomEvent = (event: CustomScheduleEvent) => {
    setCustomEvents((prev) => [...prev, event]);
  };

  const handleDeleteCustomEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Instant 1-Click PDF Download
  const handleInstantDownloadPdf = () => {
    try {
      const monthHolidays = holidays.filter((h) => {
        const parts = h.date.split('-');
        return parseInt(parts[0], 10) === selectedYear && parseInt(parts[1], 10) - 1 === selectedMonth;
      });

      const monthEvents = customEvents.filter((e) => {
        const parts = e.date.split('-');
        return parseInt(parts[0], 10) === selectedYear && parseInt(parts[1], 10) - 1 === selectedMonth;
      });

      const activeHolidays = monthHolidays.filter((h) => selectedHolidayDates.has(h.date));

      const options: PdfScheduleOptions = {
        year: selectedYear,
        month: selectedMonth,
        countryName: COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode,
        countryCode: selectedCountryCode,
        selectedHolidays: activeHolidays,
        customEvents: monthEvents,
        orientation: 'landscape',
        includeAgenda: true,
        includeWeekNumbers: true,
        startWeekOnMonday: false,
      };

      downloadMonthlyPdfSchedule(options);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download PDF schedule:', err);
    }
  };

  // Weekend days array based on pattern
  const weekendDays = useMemo(() => {
    switch (weekendPattern) {
      case 'fri-sat':
        return [5, 6];
      case 'sun-only':
        return [0];
      case 'none':
        return [];
      case 'sat-sun':
      default:
        return [0, 6];
    }
  }, [weekendPattern]);

  // Dedicated Calculator Result
  const betweenResult: DateDiffResult = useMemo(() => {
    return calculateDaysBetweenDates(
      new Date(startDateStr),
      new Date(endDateStr),
      selectedCountryCode,
      weekendDays,
      betweenExcludeHolidays,
      includeEndDate
    );
  }, [startDateStr, endDateStr, selectedCountryCode, weekendDays, betweenExcludeHolidays, includeEndDate]);

  // Calendar Direct Selection Result
  const calSelectionResult: DateDiffResult = useMemo(() => {
    return calculateDaysBetweenDates(
      new Date(calRangeStart),
      new Date(calRangeEnd),
      selectedCountryCode,
      [0, 6],
      true,
      true
    );
  }, [calRangeStart, calRangeEnd, selectedCountryCode]);

  // Add/Subtract Calculation
  const calculatedTargetDate = useMemo(() => {
    return addDurationToDate(
      new Date(baseDateStr),
      addDirection === 'add' ? addAmount : -addAmount,
      addUnit,
      [0, 6],
      selectedCountryCode
    );
  }, [baseDateStr, addDirection, addAmount, addUnit, selectedCountryCode]);

  // Handler for Calendar Grid Click
  const handleCalendarDayClick = (isoDateStr: string) => {
    if (!isMeasuringMode) {
      setCalRangeStart(isoDateStr);
      setCalRangeEnd(isoDateStr);
      setSelectionStep('end');
      return;
    }

    if (selectionStep === 'start') {
      setCalRangeStart(isoDateStr);
      setSelectionStep('end');
    } else {
      // If clicked date is before start date, swap or make it the new start
      const clicked = new Date(isoDateStr);
      const start = new Date(calRangeStart);
      if (clicked < start) {
        setCalRangeEnd(calRangeStart);
        setCalRangeStart(isoDateStr);
      } else {
        setCalRangeEnd(isoDateStr);
      }
      setSelectionStep('start');
    }
  };

  // Quick preset helper for Days between
  const applyPreset = (preset: 'next30' | 'next90' | 'restOfYear' | 'q1' | 'q2' | 'q3' | 'q4') => {
    const now = new Date();
    const curYear = now.getFullYear();

    if (preset === 'next30') {
      setStartDateStr(todayStr);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setEndDateStr(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    } else if (preset === 'next90') {
      setStartDateStr(todayStr);
      const d = new Date();
      d.setDate(d.getDate() + 90);
      setEndDateStr(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    } else if (preset === 'restOfYear') {
      setStartDateStr(todayStr);
      setEndDateStr(`${curYear}-12-31`);
    } else if (preset === 'q1') {
      setStartDateStr(`${curYear}-01-01`);
      setEndDateStr(`${curYear}-03-31`);
    } else if (preset === 'q2') {
      setStartDateStr(`${curYear}-04-01`);
      setEndDateStr(`${curYear}-06-30`);
    } else if (preset === 'q3') {
      setStartDateStr(`${curYear}-07-01`);
      setEndDateStr(`${curYear}-09-30`);
    } else if (preset === 'q4') {
      setStartDateStr(`${curYear}-10-01`);
      setEndDateStr(`${curYear}-12-31`);
    }
  };

  // Copy Calculation Summary
  const handleCopyResult = (res: DateDiffResult, start: string, end: string) => {
    const text = `Date Calculation (${start} to ${end}):\nÔÇó Total Days: ${res.totalDays} days\nÔÇó Weeks: ${res.weeksAndDays.weeks} weeks + ${res.weeksAndDays.days} days (${res.exactWeeks} weeks)\nÔÇó Business Days: ${res.businessDays} work days\nÔÇó Weekend Days: ${res.weekendDaysCount} days\nÔÇó Holidays: ${res.holidaysCount} days\nCalculated via TimeGovern`;
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Pillar II ÔÇó Temporal Mathematics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Calendar & date calculator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Count days, weeks, and business days between two dates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-semibold self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setSubTab('calendar')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('between')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'between'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Days between</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('addsub')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'addsub'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add or subtract</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('countdown')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'countdown'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Countdown</span>
            </button>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: INTERACTIVE CALENDAR WITH RANGE SELECTION ---------------- */}
        {subTab === 'calendar' && (
          <div className="mt-5 space-y-5">
            {/* Top Interactive Measure Notice & Quick Bar */}
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shrink-0">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Date range
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold animate-pulse">
                      Click two dates
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {selectionStep === 'start'
                      ? 'Click a day to set the start date.'
                      : 'Click a day to set the end date.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCalRangeStart(todayStr);
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setCalRangeEnd(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                    setSelectionStep('start');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reset (+30 days)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartDateStr(calRangeStart);
                    setEndDateStr(calRangeEnd);
                    setSubTab('between');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Full calculation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* LIVE CALENDAR MEASUREMENT HUD / RESULT CARDS */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    START: {new Date(calRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    END: {new Date(calRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyResult(calSelectionResult, calRangeStart, calRangeEnd)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
                    title="Copy calculation summary"
                  >
                    {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedResult ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Essential Calculation Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* 1. Exact Days */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 text-blue-400" /> Total Calendar Days
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      {calSelectionResult.totalDays}
                    </span>
                    <span className="text-xs text-blue-400 font-bold">days</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {calSelectionResult.years > 0 ? `${calSelectionResult.years}y ` : ''}
                    {calSelectionResult.months > 0 ? `${calSelectionResult.months}m ` : ''}
                    {calSelectionResult.days}d span
                  </span>
                </div>

                {/* 2. Exact Weeks */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> Exact Weeks
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-indigo-300">
                      {calSelectionResult.exactWeeks}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold">wks</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    {calSelectionResult.weeksAndDays.weeks} wks + {calSelectionResult.weeksAndDays.days} days
                  </span>
                </div>

                {/* 3. Business Days */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-emerald-400" /> Business / Work Days
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                      {calSelectionResult.businessDays}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">workdays</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Excludes {calSelectionResult.weekendDaysCount}wknd / {calSelectionResult.holidaysCount}hols
                  </span>
                </div>

                {/* 4. Working Hours */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Total Work Hours
                  </span>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                      {calSelectionResult.workingHours.toLocaleString()}
                    </span>
                    <span className="text-xs text-amber-400 font-bold">hrs</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    {calSelectionResult.totalHours.toLocaleString()} clock hrs (24h/d)
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar Controls & View Navigator */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-bold text-sm text-slate-900 dark:text-white min-w-36 text-center">
                  {new Date(selectedYear, selectedMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const n = new Date();
                    setSelectedYear(n.getFullYear());
                    setSelectedMonth(n.getMonth());
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              {/* Country Holidays, Notifications, PDF Schedule & Print */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-blue-500" /> Holidays:
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs px-2.5 py-1 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                    <option value="JP">Japan (JP)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="FR">France (FR)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                </div>

                {/* Event Notifications Master Toggle & Settings Button */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      notificationSettings.enabled
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={
                      notificationSettings.enabled
                        ? 'Event Reminder Alerts are ACTIVE. Click to mute.'
                        : 'Event Reminder Alerts are MUTED. Click to enable.'
                    }
                  >
                    {notificationSettings.enabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span>Alerts: On</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Alerts: Off</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNotificationModalOpen(true)}
                    className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="Configure Notification Timing, Sound Chimes & Browser Push"
                  >
                    <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                {/* Primary Download PDF Schedule Button */}
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-blue-400/30"
                  title="Generate & Download a printable PDF Calendar Month View with selected holidays & custom events"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Print Current Web Layout"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* INTERACTIVE CALENDAR MONTH GRID */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
                <span className="text-blue-500">Wk #</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-8 text-center text-xs gap-y-2 gap-x-1">
                {(() => {
                  const firstDay = new Date(selectedYear, selectedMonth, 1);
                  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                  const startDayOfWeek = firstDay.getDay();

                  const cells = [];
                  let weekNum = Math.ceil(((firstDay.getTime() - new Date(selectedYear, 0, 1).getTime()) / 86400000 + 1) / 7);

                  // Range boundary dates
                  const rangeStartObj = new Date(calRangeStart);
                  const rangeEndObj = new Date(calRangeEnd);
                  const minDate = rangeStartObj <= rangeEndObj ? rangeStartObj : rangeEndObj;
                  const maxDate = rangeStartObj <= rangeEndObj ? rangeEndObj : rangeStartObj;

                  // Padding before month start
                  for (let i = 0; i < startDayOfWeek; i++) {
                    if (i === 0) {
                      cells.push(
                        <div key="wk-pad" className="font-mono text-[11px] text-blue-500/80 font-bold py-2.5 flex items-center justify-center">
                          W{weekNum}
                        </div>
                      );
                    }
                    cells.push(<div key={`empty-${i}`} className="p-2"></div>);
                  }

                  // Month days
                  for (let d = 1; d <= daysInMonth; d++) {
                    const cellDate = new Date(selectedYear, selectedMonth, d);
                    const dayOfWeek = cellDate.getDay();

                    if (dayOfWeek === 0 && cells.length % 8 === 0) {
                      weekNum++;
                      cells.push(
                        <div key={`wk-${d}`} className="font-mono text-[11px] text-blue-500/80 font-bold py-2.5 flex items-center justify-center">
                          W{weekNum}
                        </div>
                      );
                    }

                    const isoStr = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(d)}`;
                    const isHoliday = holidays.find((h) => h.date === isoStr);
                    const dayCustomEvents = customEvents.filter((e) => e.date === isoStr);
                    const isToday =
                      new Date().getFullYear() === selectedYear &&
                      new Date().getMonth() === selectedMonth &&
                      new Date().getDate() === d;

                    const isStart = isoStr === calRangeStart;
                    const isEnd = isoStr === calRangeEnd;
                    const inRange = cellDate >= minDate && cellDate <= maxDate;

                    cells.push(
                      <button
                        type="button"
                        key={`day-${d}`}
                        onClick={() => handleCalendarDayClick(isoStr)}
                        className={`relative p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[58px] ${
                          isStart
                            ? 'bg-blue-600 text-white font-extrabold border-blue-500 shadow-md ring-2 ring-blue-400/50'
                            : isEnd
                            ? 'bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                            : inRange
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                            : isToday
                            ? 'bg-slate-100 dark:bg-slate-800 font-bold border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
                            : isHoliday
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-transparent text-slate-800 dark:text-slate-200'
                        }`}
                        title={
                          isHoliday
                            ? `${isHoliday.name} ÔÇó Click to select`
                            : isStart
                            ? 'Range Start Date'
                            : isEnd
                            ? 'Range End Date'
                            : 'Click to select date'
                        }
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-mono">{d}</span>
                          {isStart && (
                            <span className="text-[8px] uppercase tracking-wider bg-white/30 text-white font-black px-1 rounded">
                              START
                            </span>
                          )}
                          {isEnd && !isStart && (
                            <span className="text-[8px] uppercase tracking-wider bg-white/30 text-white font-black px-1 rounded">
                              END
                            </span>
                          )}
                        </div>

                        {/* Holiday badge */}
                        {isHoliday && (
                          <span className="block text-[8px] truncate max-w-full font-semibold mt-1 px-1 rounded bg-amber-200/50 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                            Ôÿà {isHoliday.name}
                          </span>
                        )}

                        {/* Custom Event badges */}
                        {dayCustomEvents.map((evt) => (
                          <span
                            key={evt.id}
                            className="block text-[8px] truncate max-w-full font-semibold mt-0.5 px-1 rounded bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700/60 flex items-center justify-between gap-0.5"
                          >
                            <span className="truncate">ÔÇó {evt.title}</span>
                            {evt.notify !== false && notificationSettings.enabled && (
                              <Bell className="w-2 h-2 text-amber-500 shrink-0" />
                            )}
                          </span>
                        ))}

                        {/* Weekend label */}
                        {(dayOfWeek === 0 || dayOfWeek === 6) && !isHoliday && dayCustomEvents.length === 0 && (
                          <span className="text-[7px] text-slate-400 dark:text-slate-500 uppercase">
                            {dayOfWeek === 0 ? 'SUN' : 'SAT'}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>

            {/* Public Holiday List for Selected Country & PDF Schedule Checklist */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedYear} Public Holidays & Observances ({selectedCountryCode})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Click checkboxes to include or exclude specific holidays from your downloadable PDF schedule.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllHolidays}
                    className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllHolidays}
                    className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Configure & Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                {holidays.map((h, i) => {
                  const isSelectedForPdf = selectedHolidayDates.has(h.date);
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border flex justify-between items-center transition-all ${
                        isSelectedForPdf
                          ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700/80 shadow-xs'
                          : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleHolidayDate(h.date);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform cursor-pointer p-0.5"
                          title={isSelectedForPdf ? 'Remove from PDF Schedule' : 'Include in PDF Schedule'}
                        >
                          {isSelectedForPdf ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div 
                          onClick={() => handleCalendarDayClick(h.date)}
                          className="cursor-pointer min-w-0"
                          title="Click to measure to/from this holiday"
                        >
                          <span className="font-semibold block text-slate-900 dark:text-slate-100 truncate max-w-36">
                            {h.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{h.date}</span>
                        </div>
                      </div>

                      <span className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded shrink-0">
                        {h.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 2: DAYS BETWEEN DATES (ADVANCED CALCULATOR) ---------------- */}
        {subTab === 'between' && (
          <div className="mt-5 space-y-6">
            {/* Input Controls Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span>Date Difference & Business Days Calculator</span>
                </h3>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-semibold mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('next30')}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('next90')}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    +90 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('restOfYear')}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    End of Year
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('q4')}
                    className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Q4
                  </button>
                </div>
              </div>

              {/* Date Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Weekend Structure
                  </label>
                  <select
                    value={weekendPattern}
                    onChange={(e) => setWeekendPattern(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
                  >
                    <option value="sat-sun">Saturday & Sunday (Standard)</option>
                    <option value="fri-sat">Friday & Saturday (Middle East)</option>
                    <option value="sun-only">Sunday Only</option>
                    <option value="none">No Weekends (7-Day Workweek)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Holiday Database
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                    <option value="JP">Japan (JP)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="FR">France (FR)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 flex-wrap pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeEndDate}
                    onChange={(e) => setIncludeEndDate(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Include End Date (Inclusive Calculation, +1 day)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={betweenExcludeHolidays}
                    onChange={(e) => setBetweenExcludeHolidays(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Exclude Public Holidays ({selectedCountryCode}) from Business Days</span>
                </label>
              </div>
            </div>

            {/* RESULTS METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Calendar Days */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block">
                  Total Calendar Days
                </span>
                <span className="block text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 mt-2 font-mono">
                  {betweenResult.totalDays} Days
                </span>
                <span className="text-xs text-slate-400 mt-1 block font-mono">
                  ({betweenResult.years > 0 ? `${betweenResult.years}y, ` : ''}{betweenResult.months}m, {betweenResult.days}d)
                </span>
              </div>

              {/* Total Exact Weeks */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block">
                  Exact Weeks
                </span>
                <span className="block text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2 font-mono">
                  {betweenResult.exactWeeks} Wks
                </span>
                <span className="text-xs text-slate-400 mt-1 block font-mono">
                  ({betweenResult.weeksAndDays.weeks} full weeks + {betweenResult.weeksAndDays.days} days)
                </span>
              </div>

              {/* Net Business Days */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block">
                  Net Business Days
                </span>
                <span className="block text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                  {betweenResult.businessDays} Days
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  (Excluding {betweenResult.weekendDaysCount} weekend & {betweenResult.holidaysCount} holidays)
                </span>
              </div>

              {/* Working Hours */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider block">
                  Equivalent Hours
                </span>
                <span className="block text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">
                  {betweenResult.workingHours.toLocaleString()} Hrs
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                  {betweenResult.totalHours.toLocaleString()} clock hrs / {betweenResult.totalMinutes.toLocaleString()} min
                </span>
              </div>
            </div>

            {/* List of holidays occurring within range if any */}
            {betweenResult.holidaysList && betweenResult.holidaysList.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-amber-500" />
                  <span>Public Holidays Occurring in this Span ({betweenResult.holidaysList.length}):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {betweenResult.holidaysList.map((h, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{h.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{h.date}</span>
                      </div>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        {h.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- SUB TAB 3: ADD/SUBTRACT DURATION ---------------- */}
        {subTab === 'addsub' && (
          <div className="mt-5 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add or Subtract Duration to Target Date</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Base Date
                  </label>
                  <input
                    type="date"
                    value={baseDateStr}
                    onChange={(e) => setBaseDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Action
                  </label>
                  <select
                    value={addDirection}
                    onChange={(e) => setAddDirection(e.target.value as 'add' | 'subtract')}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
                  >
                    <option value="add">+ Add Duration</option>
                    <option value="subtract">- Subtract Duration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit
                  </label>
                  <select
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
                  >
                    <option value="days">Calendar Days</option>
                    <option value="businessDays">Business Work Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Output */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white p-6 rounded-2xl shadow-lg text-center">
              <span className="text-xs uppercase tracking-wider font-bold opacity-80">Calculated Resulting Date</span>
              <span className="block text-2xl sm:text-4xl font-extrabold mt-2 font-mono">
                {calculatedTargetDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 4: CUSTOM COUNTDOWN ---------------- */}
        {subTab === 'countdown' && (
          <div className="mt-5 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Shareable Custom Countdown Generator</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Countdown Title
                  </label>
                  <input
                    type="text"
                    value={cdTitle}
                    onChange={(e) => setCdTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={cdTargetStr}
                    onChange={(e) => setCdTargetStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Countdown Preview Ticker */}
            <div className="bg-slate-950 text-white p-8 rounded-2xl border border-slate-800 text-center shadow-xl">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-mono font-bold block mb-3">
                {cdTitle}
              </span>
              <div className="flex justify-center items-center gap-3 sm:gap-6 text-2xl sm:text-5xl font-extrabold font-mono text-white">
                <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 shadow-inner">
                  <span>142</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">DAYS</span>
                </div>
                <span className="text-slate-600">:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 shadow-inner">
                  <span>18</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">HOURS</span>
                </div>
                <span className="text-slate-600">:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 shadow-inner">
                  <span>42</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">MINS</span>
                </div>
                <span className="text-slate-600">:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 text-blue-400 shadow-inner">
                  <span>09</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">SECS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Schedule Customizer & Download Modal */}
        <PdfScheduleModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          year={selectedYear}
          month={selectedMonth}
          countryName={COUNTRY_NAMES[selectedCountryCode] || selectedCountryCode}
          countryCode={selectedCountryCode}
          allHolidays={holidays}
          selectedHolidayDates={selectedHolidayDates}
          onToggleHolidayDate={handleToggleHolidayDate}
          onSelectAllHolidays={handleSelectAllHolidays}
          onClearAllHolidays={handleClearAllHolidays}
          customEvents={customEvents}
          onAddCustomEvent={handleAddCustomEvent}
          onDeleteCustomEvent={handleDeleteCustomEvent}
        />

        {/* Floating Active Event Notification Banner */}
        <EventAlertBanner
          alerts={activeAlerts}
          onDismiss={handleDismissAlert}
          onDismissAll={handleDismissAllAlerts}
          soundEnabled={notificationSettings.soundEnabled}
          onToggleSound={() =>
            setNotificationSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onJumpToDate={(dateStr) => {
            const [y, m] = dateStr.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m)) {
              setSelectedYear(y);
              setSelectedMonth(m - 1);
              setCalRangeStart(dateStr);
            }
          }}
        />

        {/* Event Notification Settings & Test Dialog */}
        <EventNotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          settings={notificationSettings}
          onUpdateSettings={setNotificationSettings}
          customEvents={customEvents}
          onToggleEventNotify={handleToggleEventNotify}
          onTriggerTestAlert={handleTriggerTestAlert}
        />
      </div>
    </div>
  );
};
