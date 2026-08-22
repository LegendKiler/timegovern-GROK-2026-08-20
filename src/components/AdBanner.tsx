/**
 * Compatibility wrapper — routes legacy types to professional AdSlot inventory.
 * Prefer importing AdSlot with named slotId (tg_header, tg_rail_sticky, …).
 */
import React from 'react';
import { AdSlot, legacyTypeToSlotId, LegacyAdType } from './ads/AdSlot';

interface AdBannerProps {
  type: LegacyAdType;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, className }) => {
  // Single sticky rail: avoid dual 160px columns crowding the UI
  if (type === 'skyscraper-left') {
    return null;
  }
  return <AdSlot slotId={legacyTypeToSlotId(type)} className={className} />;
};
