# TimeGovern AI Coding Agent Guidelines

This repository contains the full-stack web application for **TimeGovern**, running on **Cloudflare Workers** with a **Cloudflare D1 Database** (`zoneshift-db`) and a **React + Tailwind CSS** frontend.

## Architecture & System Overview
- **Backend Edge API**: `src/index.ts` handles API routes (`/api/admin/seed-db`, `/api/search`, `/api/health`).
- **Frontend SPA**: React app built with Vite and Tailwind CSS located in `src/`.
- **Database**: Cloudflare D1 relational database bound as `env.DB`.
- **Build Output**: `npm run build` runs `vite build` (frontend to `dist/`) AND `esbuild` (bundling `src/index.ts` to `dist/_worker.js`).
- **Deployment Config**: `wrangler.toml` specifies `main = "dist/_worker.js"` and `[assets] directory = "./dist"`.

## Development Rules for AI Agents
1. **API & Static Routing Integrity**:
   - Always retain `/api/*` handlers in `src/index.ts`.
   - Never bypass or overwrite the fallback to static assets (`env.ASSETS.fetch(request)`).
2. **Build Scripts**:
   - Ensure `package.json` contains: `"build": "vite build && esbuild src/index.ts --bundle --outfile=dist/_worker.js --format=esm --target=es2022 --external:node:*"`
3. **Database Operations**:
   - Query Cloudflare D1 using parameterized SQL statements (`env.DB.prepare(...)`).
4. **Code Quality**:
   - Verify every update with `compile_applet` / `lint_applet` to maintain zero compilation and type errors.
