# TimeGovern Calculators Roadmap (A–D)

**Branch:** `lab-dev` only  
**Status:** Planning document — **not implemented yet**  
**Do not merge to `main` until explicitly approved**

This roadmap captures the full calculator catalogue for the Calculators pillar, based on worldwide competitor research (timeanddate, World Time Buddy, time.is, Starlight Tools, Kordu, CalcBE, and general date/IT tool sites).

---

## Positioning

> Competitors give you **times**. TimeGovern gives you **decisions**: fair meetings, safe deadlines, and IT-ready timestamps — on the same world-clock backbone.

---

## A. Must-have (match competitors)

| ID | Calculator | Description | Primary competitors |
|----|------------|-------------|---------------------|
| A1 | **Date difference** | Years / months / days / hours between two dates | timeanddate, almost all tool sites |
| A2 | **Add / subtract date** | Add or subtract days, weeks, months, years from a start date | timeanddate, CoolConversion |
| A3 | **Business days** | Count or project workdays; exclude weekends; optional holidays | timeanddate, Kordu, CalcBE |
| A4 | **Time zone converter** | Convert a date/time across multiple cities (DST-safe, IANA) | timeanddate, World Time Buddy |
| A5 | **Meeting overlap / best slot** | Visual or ranked overlap of work hours across N cities | World Time Buddy, SyncZones |
| A6 | **Duration / timesheet hours** | Hours between times; overnight shifts; decimal hours | Kordu, payroll-oriented tools |
| A7 | **Age + weekday of birth** | Exact age Y/M/D; day of week born; next birthday | Widespread micro-tools |
| A8 | **ISO week number** | Week number, day-of-year, quarter, days left in year | Kordu, calendar tools |
| A9 | **Unix ↔ human date** | Epoch seconds/ms ↔ local/UTC/ISO display | Dev tool sites |
| A10 | **Sunrise / sunset + moon** | For city + date; day length; moon phase | timeanddate, time.is |

**Phase 1 implementation target:** A1–A4  
**Phase 2:** A5–A6  
**Phase 3:** A7–A10

---

## B. Weather-linked (differentiated, still simple)

| ID | Calculator | Description | Notes |
|----|------------|-------------|-------|
| B1 | **Outdoor comfort window** | Heat index / rough “comfortable outdoor hours” for a city today | Open-Meteo current + simple formula |
| B2 | **Heating / cooling degree-day** | Simple degree-day style metric vs baseline temp | Optional; niche but unique on a clock site |

**Data:** Open-Meteo (free, no key). Fail soft if offline.

**Phase:** After A1–A10 core is stable.

---

## C. IT / developer

| ID | Calculator | Description | Notes |
|----|------------|-------------|-------|
| C1 | **Unix / ms / ISO 8601 converter** | Expand A9: seconds, ms, ISO 8601, RFC 3339 | Core IT traffic |
| C2 | **Cron next-run (in chosen TZ)** | Show next N fire times in a selected IANA zone | Rare on pure clock sites |
| C3 | **Leap year / calendar edge cases** | Leap year check, rare date rules, educational | Low effort, high clarity |

**Phase:** Parallel with A9 or immediately after.

---

## D. Unique (TimeGovern brand)

| ID | Calculator | Description | Why unique |
|----|------------|-------------|------------|
| D1 | **Govern Score™ — meeting fairness** | Score 0–100 for a proposed time across N cities (sleep, weekend, work-hour overlap, span). Suggest top 3 alternatives. Shareable link. | Overlap grids exist; **fairness scoring** does not |
| D2 | **Multi-jurisdiction deadline** | “Due Friday 17:00 Melbourne” → equivalent instants + business-day validity in other cities with local holiday sets (start AU/UK/US) | Generic business-day tools ignore multi-country holidays |
| D3 | **DST risk radar** | Next 12 months: which of *your pinned cities* change clocks; flag meeting weeks at risk | DST pages exist; **your pins → conflict calendar** is rare |
| D4 | **Log timestamp decoder** | Paste Unix/ms/ISO log time → local wall times in pinned cities + “who was likely off-hours?” | Built for SRE/support, not tourists |
| D5 | **Share result → ICS + embed** | Every calculator result: copy ISO, human string, optional ICS, optional widget embed URL | Competitors often stop at on-screen answer |

**Phase 4 (brand):** D1 first, then D2–D5.

**Disclaimer (D2):** Educational planning aid — not legal advice.

---

## Suggested build order (lab-dev only)

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | This roadmap file | Done |
| **1** | A1–A4 (date diff, add/subtract, business days, TZ converter) | Not started |
| **2** | A5 + **D1 Govern Score** | Not started |
| **3** | A6–A10 + C1–C3 | Not started |
| **4** | D2–D5 | Not started |
| **5** | B1–B2 weather-linked | Not started |

All work stays on **`lab-dev`**. Merge to **`main` / production only after explicit approval.

---

## UX notes (when implementing)

1. One **calculator switcher** in Calculators pillar (searchable list by ID/name).
2. Prefer **client-side** math (date-fns / Temporal / Intl); holidays via static JSON or Nager.Date.
3. Every tool: **inputs → result → copy ISO / share URL** (prep for D5).
4. Reuse `MAJOR_CITIES` + IANA search from World Clock.
5. Keep fonts consistent with lab Inter stack; no competing serif themes.
6. Loading/error states for any network (weather, holidays).

---

## Competitor snapshot (research summary)

| Competitor | Strength | Weakness vs TimeGovern opportunity |
|------------|----------|-------------------------------------|
| **timeanddate.com** | Full date + astronomy suite | Heavy UI; weak “decision score” for meetings |
| **World Time Buddy** | Meeting overlap UX | Not a full date/business/IT suite |
| **time.is** | Accuracy / atomic framing | Thin calculator set |
| **Generic tool farms** | Many micro-calcs | No unified world-clock + brand |
| **Dev epoch tools** | Unix/ISO | No world cities / astronomy |

---

## Out of scope (for now)

- Prayer-time calculators (niche; optional later)
- Paid astrology
- Scraping third-party calculator UIs
- Legal advice products

---

## Changelog

| Date | Note |
|------|------|
| 2026-08-21 | Initial A–D roadmap committed to `lab-dev` only |
