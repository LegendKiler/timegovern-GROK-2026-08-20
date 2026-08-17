import { useEffect, useState, useCallback } from 'react';
import { City } from '../types';

export interface ShortcutActionMap {
  onSelectPillar: (pillarIndex: number) => void;
  onFocusSearch: () => void;
  onToggleDarkMode: () => void;
  onCycleTheme: () => void;
  onOpenShortcutsModal: () => void;
  onOpenSecurityModal: () => void;
  onOpenQrModal: () => void;
  onOpenAccountModal: () => void;
  onOpenArchModal: () => void;
  onToggleAds: () => void;
  onCloseModals: () => void;
}

export interface ShortcutFeedback {
  key: string;
  label: string;
  timestamp: number;
}

export function useGlobalShortcuts(
  actions: ShortcutActionMap,
  enabled: boolean = true
) {
  const [lastShortcut, setLastShortcut] = useState<ShortcutFeedback | null>(null);
  const [isMac, setIsMac] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  const triggerFeedback = useCallback((key: string, label: string) => {
    setLastShortcut({ key, label, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    if (!lastShortcut) return;
    const timer = setTimeout(() => {
      setLastShortcut(null);
    }, 1800);
    return () => clearTimeout(timer);
  }, [lastShortcut]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an interactive input element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      const hasMetaOrCtrl = e.metaKey || e.ctrlKey;

      // Global Search: Ctrl+K / Cmd+K
      if (hasMetaOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        actions.onFocusSearch();
        triggerFeedback(isMac ? '⌘K' : 'Ctrl+K', 'Focused Global Search');
        return;
      }

      // Escape key
      if (e.key === 'Escape') {
        actions.onCloseModals();
        return;
      }

      // If user is typing in an input field, do not trigger single-key navigation shortcuts
      if (isInput) {
        return;
      }

      // Single-key Search hotkey: '/'
      if (e.key === '/') {
        e.preventDefault();
        actions.onFocusSearch();
        triggerFeedback('/', 'Focused Global Search');
        return;
      }

      // Shortcuts Cheatsheet: '?' or 'Shift+/'
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        actions.onOpenShortcutsModal();
        triggerFeedback('?', 'Opened Keyboard Shortcuts Cheat Sheet');
        return;
      }

      // Number keys 1-9 & 0 for instant Pillar Switching
      if (e.key >= '1' && e.key <= '9') {
        const pillarNum = parseInt(e.key, 10);
        e.preventDefault();
        actions.onSelectPillar(pillarNum);

        const pillarNames: Record<number, string> = {
          1: 'World Clock & Regions',
          2: 'Calendar & Holidays',
          3: 'Sun, Moon & Space',
          4: 'Weather Forecasts',
          5: 'Timers & Stopwatch',
          6: 'Live Tickers (Worldometers)',
          7: 'Embed Widgets',
          8: 'API & Dev Portal',
          9: 'News & Articles',
        };

        triggerFeedback(e.key, `Switched to ${pillarNames[pillarNum] || `Pillar ${pillarNum}`}`);
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        actions.onSelectPillar(10); // Calculators Pillar
        triggerFeedback('0', 'Switched to Calculators & Converters');
        return;
      }

      // Single-key Hotkeys (case-insensitive)
      const keyLower = e.key.toLowerCase();

      // D: Toggle Dark Mode
      if (keyLower === 'd' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onToggleDarkMode();
        triggerFeedback('D', 'Toggled Dark / Light Theme');
        return;
      }

      // T: Cycle Template Themes
      if (keyLower === 't' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onCycleTheme();
        triggerFeedback('T', 'Cycled Layout Template');
        return;
      }

      // S: Open SSL & Security Modal
      if (keyLower === 's' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onOpenSecurityModal();
        triggerFeedback('S', 'Opened Security & Trust Center');
        return;
      }

      // Q: Open Mobile QR Modal
      if (keyLower === 'q' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onOpenQrModal();
        triggerFeedback('Q', 'Opened Mobile QR Code');
        return;
      }

      // A: Open Account Modal
      if (keyLower === 'a' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onOpenAccountModal();
        triggerFeedback('A', 'Opened User Account & Sync');
        return;
      }

      // M: Open Architecture Modal
      if (keyLower === 'm' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onOpenArchModal();
        triggerFeedback('M', 'Opened Cloudflare Architecture Specs');
        return;
      }

      // B: Toggle Ad Banners
      if (keyLower === 'b' && !hasMetaOrCtrl && !e.altKey) {
        e.preventDefault();
        actions.onToggleAds();
        triggerFeedback('B', 'Toggled Commercial Ad Banners');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, actions, isMac, triggerFeedback]);

  return { 
    lastShortcut, 
    lastFeedback: lastShortcut, 
    isMac 
  };
}
