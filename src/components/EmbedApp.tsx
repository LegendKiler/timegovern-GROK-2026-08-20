import React from 'react';
import { parseEmbedParams, renderWidget } from './widgets/WidgetKit';

/** Minimal shell for iframe embeds — no header/ads */
export function EmbedApp() {
  const cfg = parseEmbedParams(window.location.search);
  if (!cfg.embed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm p-4">
        Missing embed type. Example: ?embed=digital&city=London&theme=dark
      </div>
    );
  }
  return (
    <div className={`min-h-screen p-2 ${cfg.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <div className="w-full max-w-xl mx-auto" style={{ minHeight: 120 }}>
        {renderWidget(cfg.embed, {
          city: cfg.city,
          theme: cfg.theme,
          cities: cfg.cities,
          targetIso: cfg.target,
          label: cfg.label,
        })}
      </div>
    </div>
  );
}
