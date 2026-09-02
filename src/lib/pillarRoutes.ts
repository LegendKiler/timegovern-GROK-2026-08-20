/** Public pillar slugs for URL ?pillar= and sitemap SEO */

export const PILLAR_SLUGS: Record<number, string> = {
  1: 'world-clock',
  2: 'calendar',
  3: 'astronomy',
  4: 'weather',
  5: 'timers',
  6: 'live-data',
  7: 'widgets',
  8: 'services',
  9: 'news',
  10: 'calculators',
  11: 'company',
};

export const SLUG_TO_PILLAR: Record<string, number> = Object.fromEntries(
  Object.entries(PILLAR_SLUGS).map(([id, slug]) => [slug, Number(id)])
) as Record<string, number>;

/** Aliases users / old links might use */
const ALIASES: Record<string, number> = {
  clock: 1,
  worldclock: 1,
  sun: 3,
  moon: 3,
  'sun-moon': 3,
  worldometers: 6,
  enterprise: 8,
  about: 11,
  legal: 11,
  contact: 11,
};

export function pillarFromSearch(search: string): number | null {
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const raw = (q.get('pillar') || q.get('section') || '').trim().toLowerCase();
    if (!raw) return null;
    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      return PILLAR_SLUGS[n] ? n : null;
    }
    if (SLUG_TO_PILLAR[raw]) return SLUG_TO_PILLAR[raw];
    if (ALIASES[raw]) return ALIASES[raw];
    return null;
  } catch {
    return null;
  }
}

export function writePillarToUrl(pillarId: number, replace = true) {
  if (typeof window === 'undefined') return;
  const slug = PILLAR_SLUGS[pillarId] || 'world-clock';
  const url = new URL(window.location.href);
  url.searchParams.set('pillar', slug);
  const next = url.pathname + url.search + url.hash;
  if (replace) window.history.replaceState({ pillar: pillarId }, '', next);
  else window.history.pushState({ pillar: pillarId }, '', next);
}
