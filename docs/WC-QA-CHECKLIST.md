# World Clock QA checklist (lab-dev)

## WC1 — Display + LIVE sync
- [ ] Prefs bar: 12h / 24h toggles (localStorage `timegovern_clock_prefs_v1`)
- [ ] Seconds on/off
- [ ] Sort: name / offset / country (when wired into pillar list)
- [ ] LIVE label shows `synced` after `/api/v1/time?tz=UTC` (or drift)
- [ ] Tab hidden: tick pauses; visible: resync

## WC2 — Cities
- [ ] Search finds Lagos, Nairobi, Seoul, Bogotá, Canberra, etc. (`EXTRA_CITIES` + `allCities()`)
- [ ] Pin / unpin still works

## WC3 — Meeting hour strip
- [ ] Meeting planner shows colour hour strip (work/shoulder/sleep)
- [ ] Click column selects hour

## Classic board
- [ ] Times update every second
- [ ] Grid / table / map / 3d / converter / announcer / regions
- [ ] DST badges still correct vs timeanddate for London / Sydney / NYC

Paste failures back for bugfix only.
