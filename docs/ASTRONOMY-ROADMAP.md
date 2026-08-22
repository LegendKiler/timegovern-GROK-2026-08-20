# Sun & Moon / Astronomy — competitor map + LIVE redesign

## Competitors (what they ship)

| Feature | timeanddate | todaysuntimes / similar | USNO | TimeGovern (now) |
|---------|-------------|-------------------------|------|------------------|
| Sunrise / sunset + azimuth | Yes | Yes | Yes | Yes (engine) |
| Civil / nautical / astro twilight | Yes | Yes | Yes | Yes |
| Golden hour | Yes | Yes | — | Yes |
| Live sun altitude / azimuth | Yes (~1s) | Yes | Snapshot | **Needs LIVE tick** |
| Day length vs yesterday | Yes | Yes | — | Partial |
| Countdown to next rise/set | Common | Yes | — | **Add** |
| Moon phase + rise/set | Yes | Yes | Yes | Yes |
| Moon illumination % | Yes | Yes | Yes | Yes |
| Multi-day / month table | Yes | Yes | Year tables | Moon calendar |
| Polar day/night null handling | Yes | Yes | Best-in-class | Engine returns null |
| Night sky / planets | Yes | — | — | Sky tab |
| Eclipse catalog | Yes | — | — | Static catalog |
| City search + lat/lng | Yes | Yes | Manual coords | MAJOR_CITIES |

**Accuracy reference:** SunCalc / Meeus algorithms match timeanddate & USNO to ~15s on rise/set. Our `astronomyEngine.ts` is already Meeus/NOAA-style — keep it (no paid API required for core times).

**LIVE definition for TimeGovern:** recalculate positions every **1 second** from `getSyncedNow()` (same drift sync as World Clock), not a static “page load” snapshot.

## Data strategy (always LIVE, free)

1. **Client ephemeris (primary)** — `astronomyEngine` + 1s tick → altitude, azimuth, phase, rise/set for selected lat/lng/date.
2. **Optional Open-Meteo** — weather + UV context only (not required for rise/set).
3. **No NewsAPI / paid astronomy API** for core sun/moon.

## Phases

| Phase | Work | Status |
|-------|------|--------|
| **AS1** | LIVE bar: altitude, azimuth, next event countdown, 1s tick | This commit |
| **AS2** | 7–14 day sun table + day-length delta vs yesterday | Next |
| **AS3** | Moon altitude live + illuminated disc visual | Next |
| **AS4** | Polar-safe messaging (never rises/sets) | Next |
| **AS5** | Wire primary city from World Clock / geolocation | Later |

## QA

1. Astronomy pillar → LIVE badge updates every second.
2. Change city → rise/set and altitude jump correctly.
3. Network: no required external astronomy API calls for core times.
