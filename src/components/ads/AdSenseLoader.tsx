/**
 * Loads AdSense script once when live mode is on.
 * Safe no-op when VITE_ADS_ENABLED is not true or client missing.
 */
import { useEffect } from 'react';
import { getAdSenseClient, isAdsLiveEnabled } from '../../lib/adsConfig';

const SCRIPT_ID = 'tg-adsense-loader';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSenseLoader() {
  useEffect(() => {
    if (!isAdsLiveEnabled()) return;
    const client = getAdSenseClient();
    if (!client.startsWith('ca-pub-')) return;
    if (typeof document === 'undefined') return;
    if (document.getElementById(SCRIPT_ID)) return;

    const s = document.createElement('script');
    s.id = SCRIPT_ID;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    document.head.appendChild(s);
  }, []);

  return null;
}

/** Push one unit after <ins> mounts */
export function pushAdsByGoogle(): void {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // Script not ready yet — ignore in lab
  }
}
