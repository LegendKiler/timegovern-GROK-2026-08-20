# Company content — how to edit (Stage A)

**One rule:** change company information only in these files. Do not put phone/address/ABN in React components.

| File | What it controls |
|------|------------------|
| `src/content/companyContent.ts` | Brand, HQ, About, values, podcast, newsletters, social, contact templates |
| `src/content/legalContent.ts` | Privacy, Terms, Advertising, Cookies, Trust Centre text (entity fields auto-sync from companyContent) |
| `src/content/advertiseContent.ts` | Media kit / rate card (email & HQ pull from companyContent) |
| `src/content/emailTemplates.ts` | Newsletter HTML templates (footer uses companyContent) |

## Quick edits

### Phone / WhatsApp / email
Open `src/content/companyContent.ts` → `hq`:

```ts
phone: '+61 4XX XXX XXX',
phoneDisplay: '+61 4XX XXX XXX',
whatsapp: '614XXXXXXXX',  // digits only, country code, no +
email: 'contact@yourdomain.com',
```

### Address / ABN
Same file → `hq.fullAddress`, `hq.addressLine1`, `hq.abn`.

Legal pages pick up ABN and address automatically via `legalContent`.

### About text
`aboutUs.lead`, `aboutUs.paragraphs[]`, `aboutUs.mission`, `aboutUs.vision`.

### Podcast episode + audio
`podcast.episodes[]` — set `audioUrl` to an MP3 URL when ready.

### Newsletter labels
`newsletter.weekly` / `monthly` / `yearly`.

## After you edit

**Local:**
```powershell
# if npm run dev is already running, just save the file — Vite reloads
```

**Production (Cloudflare):**
```powershell
git add src/content/
git commit -m "Update company HQ details"
git push origin lab-dev   # or main when you promote
```

## AI agent workflow

Tell the agent exactly:

> Edit only `src/content/companyContent.ts`. Set whatsapp to 614…, abn to …, phone to …

The agent should not change colours, layout, or non-content files unless you ask.

## Stage B / C (later)

- **B:** Browser admin forms at `/admin/company` (password) writing to KV/JSON  
- **C:** Same forms + D1 database + optional AI fill via API  

Do not start B until you have tested Stage A (change a field, refresh Company tab, confirm it updates).
