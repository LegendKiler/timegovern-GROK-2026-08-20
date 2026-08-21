# FULL LAB only — do not treat as production deploy

Branch: **`lab-dev`**

Cloudflare should stay on **`main`**. This branch is for local testing.

## Use in FULL LAB folder

```powershell
cd "C:\Users\Superman\Documents\TIMEGOVERN FULL LAB"
git fetch origin
git checkout lab-dev
git pull origin lab-dev
npm install
npm run dev
```

## What this branch changes

1. **Fonts** — single Inter + system stack (timeanddate-like clean sans); mono for clocks; no competing Plus Jakarta/serif
2. **Cities** — expanded MAJOR_CITIES list (more countries/capitals)

## Production

Do **not** merge to `main` until you approve.
