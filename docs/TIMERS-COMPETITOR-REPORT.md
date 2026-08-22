# Timers pillar — competitor report, accuracy model, unique roadmap

## What TimeGovern has now (`TimersPillar`)

| Mode | Features |
|------|----------|
| **Alarm clock** | Multiple alarms, labels, weekday repeat, sound presets (classic / digital / chime / marimba), enable/disable, test sound via `audioSynth` |
| **Stopwatch** | Start/pause/reset, lap list, ~10 ms tick display |
| **Countdown timer** | Multiple named timers, Pomodoro-style presets, start/pause/reset, alarm sound on zero |

All run **in the browser** (React state + `setInterval`). No backend required for basic use.

---

## Competitor map

| Feature | timeanddate | online-stopwatch / vclock | Stage / event timers (XTimer etc.) | **TimeGovern now** |
|---------|-------------|---------------------------|------------------------------------|--------------------|
| Multi countdown timers + alarm | Yes | Yes | Yes | Yes |
| Sequential / simultaneous multi-timer | Yes | Some | Yes | Partial |
| Stopwatch + laps + export | Yes (export text) | Yes | Rare | Laps yes, export no |
| Event countdown to **date + timezone** | Strong | Weak | Marketing widgets | **Gap** |
| DST-aware event countdown | Yes | Rare | Rare | **Gap** |
| Fullscreen / presentation mode | Yes | Yes | Strong | **Gap** |
| Shareable URL / embed widget | Yes | Some | Yes | Widgets pillar exists — not wired to timers |
| Pomodoro presets | Common | Yes | — | Yes |
| Kitchen / classroom visual themes | online-stopwatch strong | Strong | — | **Gap** |
| Browser Notification API | Some | Some | — | **Gap** |
| Background-tab accuracy | Varies | Claimed on better sites | — | Interval drift risk |
| Remote control (speaker view) | No | No | Paid pro | Future enterprise |

**Sources for landscape:** timeanddate.com timer / stopwatch / countdown help; online-stopwatch.com; worldwideclock.com/timer; event tools (XTimer, Stagetimer).

---

## How timers stay accurate (no paid API required)

### Truth: pure client timers do **not** need a backend

| Approach | How it works | Accuracy | Free? |
|----------|--------------|----------|-------|
| **A. Wall-clock deadline (best)** | Store `endAt = Date.now() + remainingMs`. Each frame: `remaining = endAt - Date.now()` | Survives tab throttle better; 1s UI is enough | Yes |
| **B. `performance.now()` elapsed** | Stopwatch: `elapsed = performance.now() - startMark` | Best for short races | Yes |
| **C. `setInterval` only** | `remaining--` every 1000 ms | Drifts when tab backgrounded | Yes but weaker |
| **D. Server time sync** | Same as World Clock: `/api/v1/time` or NIST-style offset (`timeDrift.ts`) | Aligns **alarms** and **event countdowns** to true UTC | Your Worker / free |

**Recommendation for TimeGovern:**
1. Refactor countdown + stopwatch to **A + B** (deadline / performance marks).
2. For **alarms** and **event countdowns**, use **`getSyncedNow()`** so “07:00 Melbourne” is correct even if the laptop clock is wrong.
3. Optional: `Notification` + Web Audio when timer hits zero (user gesture required once).

### Free external resources (optional, not required)

| Resource | Use |
|----------|-----|
| **Your own `/api/v1/time`** | Drift sync (already on lab for clocks) |
| **Browser `Intl` + IANA TZ** | Event countdown in any city |
| **Open-Meteo** | Not for timers; weather only |
| **No free “timer API”** | Industry standard is client-side math |

There is **no useful free third-party API** whose job is “run my kitchen timer.” Accuracy is **local math + optional UTC sync**.

### Backend connection options (when you want them)

| Goal | Backend |
|------|---------|
| Persist alarms across devices | Cloudflare D1 / KV + auth (Workers) |
| Shareable countdown links | Worker stores `{title, targetUtc, tz}` → public URL |
| Push when tab closed | Web Push (VAPID) + Worker — more complex, not free on all tiers |
| Embed on other sites | Static widget URL already fits Pages |

**Cloudflare free Pages/Workers** is enough for share links + light persistence. No Google/News API needed for timers.

---

## Unique features TimeGovern can add (differentiating)

Ideas competitors rarely combine with a full time platform:

1. **Timezone-aware event countdown** — “Launch in Sydney” using same city DB as World Clock; DST safe.
2. **Meeting-end timer** — “This call ends in 12:00 in everyone’s zones” tied to Meeting Planner.
3. **Synced multi-device room code** — same countdown on phone + projector via Worker channel (unique vs kitchen sites).
4. **Business-day deadline timer** — countdown that skips weekends/holidays (links Calculators).
5. **Fullscreen stage mode** — large digits, hide chrome, keyboard shortcuts (presenters).
6. **Export laps CSV** + copy share text (match timeanddate).
7. **Pomodoro + world clock strip** — focus session while seeing team cities.
8. **Alarm that uses synced UTC** — “Fire at 09:00 America/New_York” even if OS TZ is wrong.

---

## Suggested implementation phases (lab only)

| Phase | Work |
|-------|------|
| **T1** | Deadline-based countdown + `performance.now` stopwatch (fix drift) |
| **T2** | Fullscreen + keyboard shortcuts |
| **T3** | Event countdown (date + city TZ) using `getSyncedNow` |
| **T4** | Notification API + stronger sounds |
| **T5** | Shareable link via Worker (optional) |

---

## QA (current pillar)

1. Alarm / stopwatch / timer tabs switch cleanly.
2. Lap list works; timer hits 0 and plays sound.
3. Title no longer shows “5.” prefix after this commit.
