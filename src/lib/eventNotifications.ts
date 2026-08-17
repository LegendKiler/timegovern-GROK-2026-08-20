import { CustomScheduleEvent } from './pdfScheduleGenerator';
import { PublicHoliday } from '../types';

export interface NotificationSettings {
  enabled: boolean; // Global event notification toggle
  browserPush: boolean; // Browser native Notification API
  soundEnabled: boolean; // Gentle Web Audio chime
  remindMinutes: number; // Default reminder lead time in minutes (0, 15, 30, 60, 1440)
  notifyHolidays: boolean; // Also alert on national/public holidays
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  browserPush: true,
  soundEnabled: true,
  remindMinutes: 15,
  notifyHolidays: true,
};

export interface ActiveAlert {
  id: string;
  eventId: string;
  title: string;
  date: string;
  time?: string;
  category: string;
  notes?: string;
  minutesRemaining: number;
  triggeredAt: number;
  isHoliday?: boolean;
}

// Gentle Web Audio API synthesizer chime (C5 -> E5 -> G5 chord)
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  } catch (err) {
    // Audio context may be restricted before user gesture
    console.debug('Audio chime playback omitted:', err);
  }
}

/**
 * Check if the browser supports notifications and what the current permission is.
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

/**
 * Dispatch a native browser notification if permitted.
 */
export function dispatchBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'timegovern-event',
        ...options,
      });
      return true;
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
  return false;
}

/**
 * Parses an event date and optional time string into a Date object.
 */
export function parseEventDateTime(dateStr: string, timeStr?: string): Date {
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  let hours = 9; // default to 09:00 if no time specified
  let minutes = 0;

  if (timeStr && timeStr.includes(':')) {
    const [h, min] = timeStr.split(':').map((v) => parseInt(v, 10));
    if (!isNaN(h)) hours = h;
    if (!isNaN(min)) minutes = min;
  }

  return new Date(y, m - 1, d, hours, minutes, 0, 0);
}

/**
 * Formats a lead-time minutes number into human readable text.
 */
export function formatRemindTimeText(minutes: number): string {
  if (minutes <= 0) return 'At time of event';
  if (minutes === 5) return '5 minutes before';
  if (minutes === 10) return '10 minutes before';
  if (minutes === 15) return '15 minutes before';
  if (minutes === 30) return '30 minutes before';
  if (minutes === 60) return '1 hour before';
  if (minutes === 120) return '2 hours before';
  if (minutes === 1440) return '1 day before';
  if (minutes === 2880) return '2 days before';
  return `${minutes} minutes before`;
}
