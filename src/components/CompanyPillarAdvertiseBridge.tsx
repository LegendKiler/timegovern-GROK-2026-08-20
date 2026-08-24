/**
 * Optional bridge: mount AdvertiseHub when hash is #advertise without rewriting full CompanyPillar.
 */
import React, { useEffect, useState } from 'react';
import { AdvertiseHub } from './AdvertiseHub';

export const CompanyPillarAdvertiseBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [forceAdvertise, setForceAdvertise] = useState(false);

  useEffect(() => {
    const check = () => setForceAdvertise(window.location.hash.replace('#', '') === 'advertise');
    check();
    const open = () => setForceAdvertise(true);
    window.addEventListener('hashchange', check);
    window.addEventListener('tg-open-advertise', open);
    return () => {
      window.removeEventListener('hashchange', check);
      window.removeEventListener('tg-open-advertise', open);
    };
  }, []);

  if (forceAdvertise) {
    return (
      <div className="space-y-4" data-testid="advertise-hub">
        <button
          type="button"
          className="text-xs font-bold text-cyan-300 border border-cyan-500/40 px-3 py-2 rounded-lg bg-slate-900"
          onClick={() => {
            setForceAdvertise(false);
            window.location.hash = '';
          }}
        >
          ← Back to Company hub (tabs)
        </button>
        <AdvertiseHub />
      </div>
    );
  }

  return <>{children}</>;
};
