# TimeGovern API Product Roadmap

**Branch:** `lab-dev`  
**Status:** Phase A started — real `/api/v1/time` and `/api/v1/convert`

---

## Positioning

> Competitors sell **what time it is**.  
> TimeGovern API sells **what time it means** — meetings, deadlines, and AU-aware workflows.

---

## Current (lab)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/v1/time` | GET | **Live** (Worker + Vite dev) |
| `/v1/time` | GET | Alias |
| `/api/v1/convert` | GET | **Live** |
| `/v1/convert` | GET | Alias |

### Examples

```http
GET /api/v1/time?tz=Australia/Melbourne
GET /api/v1/time?city=Sydney
GET /api/v1/convert?from=America/New_York&to=Australia/Melbourne&at=2026-08-21T09:00:00
```

Enterprise pillar **Execute** button calls these for timezone + convert demos.

Auth: not required yet (lab). API key UI is illustrative.

---

## Competitor snapshot

| Player | Offer |
|--------|--------|
| timeanddate | Paid Time / Holiday / Astronomy APIs |
| WorldTimeAPI | Free zone/IP time, no SLA |
| Abstract / TimeAPI.io | Convert, IP→zone |
| Google Time Zone | Lat/lng → zone |
| ipgeolocation.io | Geo + time + astronomy bundle |

---

## Unique roadmap

| Phase | Deliverable |
|-------|-------------|
| **A** (done lab) | `/v1/time`, `/v1/convert`, roadmap doc, Enterprise wired |
| **B** | OpenAPI YAML + `/docs` page; rate limit headers |
| **C** | API keys in KV/D1; free tier 1k/day |
| **D** | `POST /v1/meetings/score` (Govern Score) |
| **E** | `/v1/holidays`, `/v1/astronomy` real backends |
| **F** | DST risk + multi-jurisdiction deadline |
| **G** | Billing / paid tiers (optional) |

---

## Cloudflare free tier caution

Public APIs must rate-limit. Worker request quotas apply on free plans.

---

## Changelog

| Date | Note |
|------|------|
| 2026-08-21 | Phase A: v1 time + convert + roadmap |
