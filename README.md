# TimeGovern — Cloudflare Workers & React Application

A high-precision global time, timezone, astronomical ephemeris, and temporal intelligence application built with **React**, **Vite**, **Tailwind CSS v4**, and **Cloudflare Workers** backed by an optional **Cloudflare D1 Database** (`zoneshift-db`).

---

## 🚀 Automated CI/CD Deployment Pipeline

This repository is fully configured with **Automated CI/CD** via **GitHub Actions** and **Cloudflare Workers**:

```
[ Git Push to main ] ➔ [ GitHub Actions ] ➔ [ Vite & esbuild Build ] ➔ [ Deploy to Cloudflare Edge ]
```

1. **Automatic Build Step**: When code is pushed or merged into `main`/`master`, `npm run build` executes:
   - **Vite** bundles the React SPA frontend into `./dist`
   - **esbuild** bundles the Cloudflare Worker backend (`src/index.ts`) into `./dist-worker/index.js`
   - Automatically writes `.assetsignore` to prevent recursion errors.
2. **Graceful Deployment**: The `.github/workflows/deploy.yml` workflow runs `cloudflare/wrangler-action` to deploy static assets and edge API endpoints to Cloudflare.

---

## 🛠️ How to Connect Cloudflare D1 Database (Optional)

1. **Create the D1 Database**:
   ```bash
   npx wrangler d1 create zoneshift-db
   ```
2. **Update `wrangler.toml`**:
   Uncomment the `[[d1_databases]]` block in `wrangler.toml` and paste your actual `database_id`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "zoneshift-db"
   database_id = "your-actual-d1-database-uuid"
   migrations_dir = "migrations"
   ```
3. **Apply Schema Migrations**:
   ```bash
   npx wrangler d1 execute zoneshift-db --remote --file=migrations/0001_initial_schema.sql
   ```
4. **Seed Database**:
   Make a GET or POST request to `/api/admin/seed-db` to populate global city and timezone records.

---

## 🔐 Required One-Time GitHub Setup

To enable automated deployment from GitHub to Cloudflare:

1. **Get Cloudflare API Token**:
   - Go to Cloudflare Dashboard ➔ **My Profile** ➔ **API Tokens**.
   - Create a token with **Edit Cloudflare Workers** permissions.
2. **Get Cloudflare Account ID**:
   - Copy your Account ID from the right sidebar of your Cloudflare Dashboard overview page.
3. **Add GitHub Repository Secrets**:
   - In your GitHub repo: Go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
   - Add **`CLOUDFLARE_API_TOKEN`**
   - Add **`CLOUDFLARE_ACCOUNT_ID`**

---

## 💻 Local Development Commands

- `npm run dev` — Start Vite dev server on port 3000
- `npm run build` — Build Vite frontend & esbuild Worker backend
- `npm run lint` — Typecheck TypeScript code without emitting files
