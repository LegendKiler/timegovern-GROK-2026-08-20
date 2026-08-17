import React, { useState } from 'react';
import { 
  X, Download, Printer, FileText, CheckSquare, Square, Plus, Trash2, 
  Sparkles, Calendar as CalendarIcon, Clock, Tag, Settings2, Check, ArrowRight,
  Bell, BellOff
} from 'lucide-react';
import { PublicHoliday } from '../types';
import { 
  CustomScheduleEvent, 
  generateMonthlyPdf, 
  downloadMonthlyPdfSchedule, 
  PdfScheduleOptions 
} from '../lib/pdfScheduleGenerator';

interface PdfScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  countryName: string;
  countryCode: string;
  allHolidays: PublicHoliday[];
  selectedHolidayDates: Set<string>;
  onToggleHolidayDate: (date: string) => void;
  onSelectAllHolidays: () => void;
  onClearAllHolidays: () => void;
  customEvents: CustomScheduleEvent[];
  onAddCustomEvent: (event: CustomScheduleEvent) => void;
  onDeleteCustomEvent: (id: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PdfScheduleModal: React.FC<PdfScheduleModalProps> = ({
  isOpen,
  onClose,
  year,
  month,
  countryName,
  countryCode,
  allHolidays,
  selectedHolidayDates,
  onToggleHolidayDate,
  onSelectAllHolidays,
  onClearAllHolidays,
  customEvents,
  onAddCustomEvent,
  onDeleteCustomEvent,
}) => {
  // Config state
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [includeAgenda, setIncludeAgenda] = useState<boolean>(true);
  const [includeWeekNumbers, setIncludeWeekNumbers] = useState<boolean>(true);
  const [startWeekOnMonday, setStartWeekOnMonday] = useState<boolean>(false);
  const [notesText, setNotesText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDate, setNewEventDate] = useState<string>(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${year}-${pad(month + 1)}-15`;
  });
  const [newEventTime, setNewEventTime] = useState<string>('');
  const [newEventCategory, setNewEventCategory] = useState<CustomScheduleEvent['category']>('meeting');
  const [newEventNotes, setNewEventNotes] = useState<string>('');
  const [newEventNotify, setNewEventNotify] = useState<boolean>(true);
  const [newEventRemindMinutes, setNewEventRemindMinutes] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'holidays' | 'events' | 'options'>('holidays');

  if (!isOpen) return null;

  const monthHolidays = allHolidays.filter((h) => {
    const parts = h.date.split('-');
    return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) - 1 === month;
  });

  const monthCustomEvents = customEvents.filter((e) => {
    const parts = e.date.split('-');
    return parseInt(parts[0], 10) === year && parseInt(parts[1], 10) - 1 === month;
  });

  const selectedHolidaysList = monthHolidays.filter((h) => selectedHolidayDates.has(h.date));

  const handleDownload = () => {
    setIsGenerating(true);
    try {
      const options: PdfScheduleOptions = {
        year,
        month,
        countryName,
        countryCode,
        selectedHolidays: selectedHolidaysList,
        customEvents: monthCustomEvents,
        orientation,
        includeAgenda,
        includeWeekNumbers,
        startWeekOnMonday,
        notesText,
      };
      downloadMonthlyPdfSchedule(options);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF schedule:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    try {
      const options: PdfScheduleOptions = {
        year,
        month,
        countryName,
        countryCode,
        selectedHolidays: selectedHolidaysList,
        customEvents: monthCustomEvents,
        orientation,
        includeAgenda,
        includeWeekNumbers,
        startWeekOnMonday,
        notesText,
      };
      const doc = generateMonthlyPdf(options);
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error printing PDF schedule:', err);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const eventObj: CustomScheduleEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime.trim() || undefined,
      category: newEventCategory,
      notes: newEventNotes.trim() || undefined,
      notify: newEventNotify,
      remindMinutesBefore: newEventRemindMinutes,
    };

    onAddCustomEvent(eventObj);
    setNewEventTitle('');
    setNewEventNotes('');
    setNewEventTime('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  PRINTABLE PDF ENGINE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {countryName} ({countryCode})
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Download PDF Schedule: {MONTH_NAMES[month]} {year}
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'holidays'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Select Holidays ({selectedHolidaysList.length}/{monthHolidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Events ({monthCustomEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'options'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Layout & PDF Options</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 max-h-[55vh]">
          {/* TAB 1: HOLIDAYS SELECTION */}
          {activeTab === 'holidays' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Public Holidays & Observances in {MONTH_NAMES[month]} {year}</h3>
                  <p className="text-xs text-slate-400">Check the holidays you wish to feature on the exported calendar grid & agenda.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSelectAllHolidays}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={onClearAllHolidays}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {monthHolidays.length === 0 ? (
                <div className="text-center p-8 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300 font-semibold">No statutory holidays recorded for this specific month in {countryName}.</p>
                  <p className="text-xs text-slate-500">You can add your own custom meetings, milestones, or events in the Custom Events tab.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {monthHolidays.map((holiday) => {
                    const isSelected = selectedHolidayDates.has(holiday.date);
                    return (
                      <div
                        key={holiday.date + holiday.name}
                        onClick={() => onToggleHolidayDate(holiday.date)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <div>
                            <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {holiday.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {holiday.date} • {holiday.type}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {holiday.countryCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOM EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-5">
              {/* Event Creation Form */}
              <form onSubmit={handleCreateEvent} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-400" /> Add Custom Event to PDF Schedule
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Q3 Planning, Product Launch, Doctor Visit"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Date *</label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Time (Optional)</label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-4">
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Category</label>
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="meeting">💼 Meeting / Work</option>
                      <option value="deadline">⏰ Deadline / Due Date</option>
                      <option value="milestone">🎯 Milestone / Goal</option>
                      <option value="personal">🌟 Personal / Family</option>
                      <option value="travel">✈️ Travel / Flight</option>
                    </select>
                  </div>

                  <div className="sm:col-span-8">
                    <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Notes / Agenda Details (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Conference room 3B / Zoom link"
                      value={newEventNotes}
                      onChange={(e) => setNewEventNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Reminder Notification Settings Row */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newEventNotify}
                        onChange={(e) => setNewEventNotify(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Arm Upcoming Alert Notification</span>
                      </span>
                    </label>

                    {newEventNotify && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Lead:</span>
                        <select
                          value={newEventRemindMinutes}
                          onChange={(e) => setNewEventRemindMinutes(parseInt(e.target.value, 10))}
                          className="bg-slate-900 border border-slate-700 rounded text-xs px-2 py-0.5 text-cyan-300 font-mono cursor-pointer"
                        >
                          <option value="0">At event time</option>
                          <option value="5">5 mins before</option>
                          <option value="15">15 mins before</option>
                          <option value="30">30 mins before</option>
                          <option value="60">1 hour before</option>
                          <option value="1440">1 day before</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer shadow-xs ml-auto"
                  >
                    Add Event
                  </button>
                </div>
              </form>

              {/* Event List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Scheduled Events for {MONTH_NAMES[month]} {year} ({monthCustomEvents.length})
                  </span>
                </div>

                {monthCustomEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl text-center">
                    No custom events created for this month yet. Use the form above to add meetings, deadlines, or trips.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {monthCustomEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                            {evt.category}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{evt.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                              <span>{evt.date}</span>
                              {evt.time && <span className="text-cyan-300">• {evt.time}</span>}
                              {evt.notes && <span>• {evt.notes}</span>}
                              {evt.notify !== false ? (
                                <span className="inline-flex items-center gap-0.5 text-amber-400 text-[10px] font-semibold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                                  <Bell className="w-2.5 h-2.5" />
                                  <span>{evt.remindMinutesBefore ? `${evt.remindMinutesBefore}m lead` : 'Alert On'}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px] inline-flex items-center gap-0.5">
                                  <BellOff className="w-2.5 h-2.5" /> Muted
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteCustomEvent(evt.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT & PDF OPTIONS */}
          {activeTab === 'options' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Orientation */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">Page Orientation</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        orientation === 'landscape'
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Landscape (Wide)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        orientation === 'portrait'
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Portrait (Tall)
                    </button>
                  </div>
                </div>

                {/* Week Start Day */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">Week Start Day</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStartWeekOnMonday(false)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        !startWeekOnMonday
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Sunday First
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartWeekOnMonday(true)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        startWeekOnMonday
                          ? 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      Monday First (ISO)
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAgenda}
                    onChange={(e) => setIncludeAgenda(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Include Monthly Agenda & Key Dates Sidebar</span>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWeekNumbers}
                    onChange={(e) => setIncludeWeekNumbers(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Include ISO Week Numbers (W1, W2...)</span>
                </label>
              </div>

              {/* Notes block */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Custom Schedule Notes & Footer Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="e.g., Monthly executive review on 3rd week. Office closed on statutory bank holidays."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Ready: {selectedHolidaysList.length} holidays & {monthCustomEvents.length} custom events included</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Preview</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Schedule'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
