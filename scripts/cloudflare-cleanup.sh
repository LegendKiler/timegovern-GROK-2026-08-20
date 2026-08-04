#!/bin/bash
# Script to clean up legacy worker 'timegovern-site2' and trigger D1 migrations & deployment

echo "Starting Cloudflare Workers cleanup & deployment..."

# 1. Remove duplicate/legacy worker if present
echo "Attempting to delete legacy worker 'timegovern-site2'..."
npx wrangler delete timegovern-site2 --force || echo "No worker 'timegovern-site2' found or already removed."

# 2. Apply D1 migrations to remote database
echo "Applying D1 migrations for 'zoneshift-db'..."
npx wrangler d1 migrations apply zoneshift-db --remote -c wrangler.toml --batch

# 3. Build & Deploy master worker
echo "Building assets and deploying master worker 'timegovern-website'..."
npm run build
npx wrangler deploy -c wrangler.toml

echo "Deployment finished successfully!"
