# TimeGovern — Cloudflare Workers & React Application

A full-stack web application built with **React**, **Vite**, **Tailwind CSS**, and **Cloudflare Workers** backed by **Cloudflare D1 Database** (`zoneshift-db`).

---

## 🚀 Fully Automated CI/CD Deployment Pipeline

This repository is pre-configured with **Automated CI/CD Deployment** via **GitHub Actions** and **Cloudflare Workers / Pages**.

### How Automated Deployment Works:

```
[ Git Push to main ] ➔ [ GitHub Actions Workflow ] ➔ [ Vite & esbuild Build ] ➔ [ Deploy to Cloudflare ]
```

1. **Automatic Build Step**: When code is pushed or merged into `main`/`master`, `npm run build` executes:
   - **Vite** bundles the React frontend into `./dist`
   - **esbuild** bundles the Cloudflare Worker backend (`src/index.ts`) into `./dist/_worker.js`
2. **Automatic Cloudflare Deployment**: The `.github/workflows/deploy.yml` workflow runs `cloudflare/wrangler-action` and deploys both static frontend assets and edge API endpoints straight to Cloudflare's global edge network.

---

## 🛠️ Required One-Time GitHub Setup

To connect your GitHub repository to Cloudflare for automatic deployment:

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

## 📋 Summary Checklist & Workflow

| Step | Action | Who Handles It? | Outcome |
| :--- | :--- | :--- | :--- |
| **1. Rulebook** | `AGENTS.md` created in root | Completed | AI auto-aligns with Cloudflare & D1 standards on every task |
| **2. Development** | Prompt features in chat | You & AI Agent | Features built, tested, and previewed with zero compilation errors |
| **3. Automated CI/CD** | `git push origin main` | GitHub Actions + Cloudflare | Site & API go live globally on Cloudflare automatically |

---

## 💻 Local Development Commands

- `npm run dev` — Start Vite dev server on port 3000
- `npm run build` — Build Vite frontend & esbuild Worker backend to `./dist`
- `npm run lint` — Typecheck TypeScript code
