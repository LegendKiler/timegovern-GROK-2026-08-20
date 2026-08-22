# AD3 — Google AdSense Integration Plan (TimeGovern)

**Branch:** `lab-dev` only until approved for production.  
**Status:** Plan + placeholders only — **no live AdSense publisher ID in the repo.**

---

## 1. Goals

- Fill named slots (`tg_header`, `tg_rail_sticky`, `tg_infeed`, `tg_footer`, `tg_mobile_anchor`, `tg_rectangle`) with compliant display ads.
- Keep Core Web Vitals stable (reserved min-heights already in `AdSlot`).
- Support later hybrid: **direct-sold first**, AdSense/GAM as backfill.

---

## 2. Environment variables (never commit secrets)

Use Vite env (Cloudflare Pages → Settings → Environment variables):

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_ADS_ENABLED` | `true` / `false` | Master switch for third-party ad scripts |
| `VITE_ADSENSE_CLIENT` | `ca-pub-xxxxxxxx` | Publisher client ID |
| `VITE_ADSENSE_SLOT_HEADER` | `1234567890` | Slot for `tg_header` |
| `VITE_ADSENSE_SLOT_RAIL` | `1234567891` | Slot for `tg_rail_sticky` |
| `VITE_ADSENSE_SLOT_INFEED` | `1234567892` | Slot for `tg_infeed` |
| `VITE_ADSENSE_SLOT_FOOTER` | `1234567893` | Slot for `tg_footer` |
| `VITE_ADSENSE_SLOT_MREC` | `1234567894` | Slot for `tg_rectangle` |
| `VITE_ADSENSE_SLOT_ANCHOR` | `1234567895` | Optional mobile anchor |

Local `.env.local` (gitignored):

```bash
VITE_ADS_ENABLED=false
VITE_ADSENSE_CLIENT=
VITE_ADSENSE_SLOT_HEADER=
```

**Rule:** If `VITE_ADS_ENABLED` is not `true` or client is empty → render **house** `AdSlot` only (current behaviour).

---

## 3. Where scripts load

### Preferred (SPA-friendly)

1. **Single loader** in `index.html` or a small `AdSenseLoader` component mounted once in `App`:
   - Load `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX` with `async` and `crossorigin="anonymous"`.
   - Only when `VITE_ADS_ENABLED === 'true'`.
2. **Per slot:** `<ins class="adsbygoogle" ... data-ad-client data-ad-slot data-ad-format data-full-width-responsive>` inside `AdSlot` when live mode is on.
3. After mount: `(window.adsbygoogle = window.adsbygoogle || []).push({});` once per unit.

### Avoid

- Injecting the script on every route change without cleanup checks.
- Multiple full script tags.
- Loading ads before consent if you deploy a CMP (EU traffic).

### Cloudflare Pages

- Set env vars per environment (Preview vs Production).
- Preview: keep `VITE_ADS_ENABLED=false` until policy review done.

---

## 4. Slot → format mapping

| Slot ID | AdSense format guidance |
|---------|-------------------------|
| `tg_header` | Display, horizontal / fixed 728×90 |
| `tg_rail_sticky` | Display, vertical 300×600 |
| `tg_infeed` | In-article or fluid |
| `tg_rectangle` | 300×250 rectangle |
| `tg_footer` | Horizontal |
| `tg_mobile_anchor` | Anchor / fixed mobile (use sparingly; one max) |

---

## 5. Policy checklist (before enabling live ads)

### Site & content

- [ ] Original, useful content (clocks, tools, calculators) — not thin doorway pages.
- [ ] Working navigation and about/contact/privacy/terms.
- [ ] No prohibited content (Google Publisher Policies).
- [ ] No encouraging accidental clicks (“click here to continue” over ads).
- [ ] Ads clearly separable from UI controls (already: label **Advertisement**).

### Technical

- [ ] Valid HTTPS production domain.
- [ ] ads.txt at `https://timegovern.com/ads.txt` when using AdSense/authorized sellers.
- [ ] Reserved space (min-height) to limit CLS.
- [ ] Privacy Policy mentions ads / Google as a processor where applicable.
- [ ] AU: advertising & consumer law alignment (no misleading claims on house pages).

### Account

- [ ] AdSense application approved for the live domain.
- [ ] Payment identity matches business (ABN if required for AU payouts).
- [ ] Test on production URL only after approval (not only localhost).

---

## 6. Implementation phases

| Phase | Work | Live money |
|-------|------|------------|
| **AD1 (done in lab)** | Named slots, house creatives, sticky 300×600 | No |
| **AD2 (done in lab)** | Media kit `/advertise` copy + rate card | Direct sales prep |
| **AD3 (this doc)** | Env-gated AdSense wiring | After approval |
| **AD4** | `ads.txt` + production enable | Yes |
| **AD5** | Optional GAM / header bidding / direct priority | Hybrid |

---

## 7. Direct vs AdSense priority

Recommended waterfall later:

1. Direct-sold creative (date-ranged) if booked for that slot.
2. Else AdSense / programmatic if `VITE_ADS_ENABLED`.
3. Else house “Advertise here” creative.

---

## 8. Testing (lab)

1. `npm run dev` — confirm placeholders only; no `googlesyndication` requests.
2. Toggle ads off via existing UI (`showAds`) — rails and header hide.
3. Open Company → Advertise (or `#advertise`) — media kit + slot previews.
4. When ready for real ads: set env on Cloudflare Preview first, verify one slot, then Production.

---

## 9. Contacts

- Sales: `advertise@timegovern.com` (see `advertiseContent.ts`)
- Policy pages: Company hub Legal / Trust tabs
