/**
 * Live AdSense unit — only mounts when canRenderLiveAd(slotId).
 * House creative stays as fallback when env incomplete.
 */
import React, { useEffect, useRef } from 'react';
import { AdSlotId, getAdSenseClient, getAdSenseSlotId } from '../../lib/adsConfig';
import { pushAdsByGoogle } from './AdSenseLoader';

interface AdSenseUnitProps {
  slotId: AdSlotId;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  minHeight?: number;
}

export const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slotId,
  format = 'auto',
  className = '',
  minHeight = 90,
}) => {
  const pushed = useRef(false);
  const client = getAdSenseClient();
  const adSlot = getAdSenseSlotId(slotId);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    // Small delay so ins is in DOM
    const t = window.setTimeout(() => pushAdsByGoogle(), 50);
    return () => clearTimeout(t);
  }, [slotId]);

  return (
    <div
      className={`overflow-hidden ${className}`}
      data-ad-slot={slotId}
      data-ad-mode="adsense-live"
      style={{ minHeight }}
    >
      <span className="sr-only">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
