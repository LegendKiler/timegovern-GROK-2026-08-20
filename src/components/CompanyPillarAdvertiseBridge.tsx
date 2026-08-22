/**
 * Optional bridge: mount AdvertiseHub when hash is #advertise without rewriting full CompanyPillar.
 * App can lazy-load this alongside Company pillar.
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
      <div className="space-y-4">
        <button
          type="button"
          className="text-xs font-bold text-blue-600"
          onClick={() => {
            setForceAdvertise(false);
            window.location.hash = '';
          }}
        >
          ← Back to Company hub
        </button>
        <AdvertiseHub />
      </div>
    );
  }

  return <>{children}</>;
};
