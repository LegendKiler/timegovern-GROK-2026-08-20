/**
 * Ad monetisation config — all values from Vite env.
 * Never commit real ca-pub- / slot IDs. Default = house placeholders only.
 */

export type AdSlotId =
  | 'tg_header'
  | 'tg_rail_sticky'
  | 'tg_infeed'
  | 'tg_footer'
  | 'tg_mobile_anchor'
  | 'tg_rectangle';

function env(key: string): string {
  try {
    const v = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[key];
    return typeof v === 'string' ? v.trim() : '';
  } catch {
    return '';
  }
}

/** Master switch — must be exactly "true" */
export function isAdsLiveEnabled(): boolean {
  return env('VITE_ADS_ENABLED').toLowerCase() === 'true';
}

export function getAdSenseClient(): string {
  return env('VITE_ADSENSE_CLIENT'); // e.g. ca-pub-xxxxxxxx
}

const SLOT_ENV: Record<AdSlotId, string> = {
  tg_header: 'VITE_ADSENSE_SLOT_HEADER',
  tg_rail_sticky: 'VITE_ADSENSE_SLOT_RAIL',
  tg_infeed: 'VITE_ADSENSE_SLOT_INFEED',
  tg_footer: 'VITE_ADSENSE_SLOT_FOOTER',
  tg_mobile_anchor: 'VITE_ADSENSE_SLOT_ANCHOR',
  tg_rectangle: 'VITE_ADSENSE_SLOT_MREC',
};

export function getAdSenseSlotId(slotId: AdSlotId): string {
  return env(SLOT_ENV[slotId]);
}

/** Live fill only when enabled + client + this unit's slot ID present */
export function canRenderLiveAd(slotId: AdSlotId): boolean {
  if (!isAdsLiveEnabled()) return false;
  const client = getAdSenseClient();
  if (!client.startsWith('ca-pub-')) return false;
  const unit = getAdSenseSlotId(slotId);
  return unit.length > 0;
}

export function adsDebugSummary(): string {
  return [
    `VITE_ADS_ENABLED=${isAdsLiveEnabled()}`,
    `client=${getAdSenseClient() ? 'set' : 'empty'}`,
    `header=${getAdSenseSlotId('tg_header') ? 'set' : 'empty'}`,
    `rail=${getAdSenseSlotId('tg_rail_sticky') ? 'set' : 'empty'}`,
  ].join(' · ');
}
