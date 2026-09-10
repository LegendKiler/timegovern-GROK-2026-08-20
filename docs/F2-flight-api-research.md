# F2 Live flight status — provider research (TimeGovern)

## Product rule
- Free: saved itineraries only (F1).
- Paid: status lookup / limited refresh (F2+).
- Not competing with Flightradar24 full-sky map.

## Providers (verify current pricing before contract)

| Provider | Free tier (approx) | Paid entry | B2C commercial | Best use |
|----------|-------------------|------------|----------------|----------|
| AviationStack | Very low monthly calls | Mid paid tiers | Yes (check plan) | Status + schedules MVP |
| AeroDataBox | Low units/mo | Low–mid | Check RapidAPI terms | Lookups / status |
| AirLabs | ~1k req/mo class | Mid | Check | Live + airline DB |
| FlightAware AeroAPI | Small $ credit (Personal) | Standard min ~US$100+/mo | Personal often NOT B2C; Standard+ for product | High-quality ops status |
| Flightradar24 API | Usually no real free | Credits | Commercial | Premium tracks |
| OpenSky Network | Free research | Licence for commercial | **No** operational product without written licence | LAB demos only |

## Cost drivers
- Polling every N minutes × number of active flights × users
- Cache at Worker (5–30 min) mandatory
- Gate by plan: e.g. Free 0 live, Traveller 25 flights @ 30 min, Pro faster

## Recommendation
1. Ship F1/F1.5 fully (manual + ICS + calendar chips).
2. Pilot **AviationStack or AeroDataBox** for status-at-add (F2).
3. Move to FlightAware Standard only if revenue covers minimum + queries.
4. Never put API keys in the browser.

## Car bookings (parallel product)
Same pattern as flights: manual F1 → optional live fleet APIs later (often partner/affiliate, not free global live).
