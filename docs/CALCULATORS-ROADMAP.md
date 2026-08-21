# TimeGovern Calculators Roadmap (A–D)

**Branch:** `lab-dev` only  
**Do not merge to `main` until explicitly approved**

## Status

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | This roadmap | Done |
| **1** | A1–A4 | **Implemented (lab-dev)** |
| **2** | A5 + D1 Govern Score | Not started |
| **3** | A6–A10 + C1–C3 | Not started |
| **4** | D2–D5 | Not started |
| **5** | B1–B2 | Not started |

### Phase 1 files

- `src/lib/calcPhase1.ts` — pure math
- `src/components/calculators/Phase1Calculators.tsx` — UI
- `src/components/CalculatorsPillar.tsx` — Date & Time tab → Phase1

### Phase 1 tools

| ID | Tool |
|----|------|
| A1 | Date difference (days, Y/M/D, weekdays) |
| A2 | Add/subtract days, weeks, months, years |
| A3 | Business days count + project N business days |
| A4 | Time zone converter (city → city, DST via IANA) |

## Full A–D catalogue

See previous roadmap sections for B/C/D unique tools (Govern Score, multi-jurisdiction deadline, DST radar, log decoder, share/ICS).

## Changelog

| Date | Note |
|------|------|
| 2026-08-21 | Initial roadmap |
| 2026-08-21 | Phase 1 implemented on lab-dev |
