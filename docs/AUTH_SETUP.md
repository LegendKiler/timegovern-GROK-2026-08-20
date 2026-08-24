# Phase 2 auth setup (lab → production)

## Works on localhost without deploy
- Email + password → **device session** (localStorage)
- **Export/import sync code** → move profile to another browser without D1

## Cloud features (after Worker deploy + D1)
- Password register/login against D1
- Magic link email
- Google sign-in
- Email verification messages

### 1. D1 migrations
```bash
npx wrangler d1 migrations apply zoneshift-db --remote -c wrangler.toml
```
Includes `0003_users_sessions.sql` and `0004_auth_tokens.sql`.

### 2. Resend (real emails)
1. Create account at https://resend.com
2. Cloudflare Worker secrets:
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put EMAIL_FROM
# example: TimeGovern <noreply@yourdomain.com>
```
Optional: `PUBLIC_APP_URL=https://timegovern.com`

Without Resend, API returns `labLink` in JSON for testing.

### 3. Google OAuth
1. Google Cloud Console → OAuth 2.0 Client (Web)
2. Authorized JS origins: `http://localhost:3000` and `https://timegovern.com`
3. Frontend `.env`:
```
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```
4. Worker:
```bash
npx wrangler secret put GOOGLE_CLIENT_ID
```

### 4. Stripe
**Phase 3** — not enabled in Phase 2.

## Test checklist
1. Local: password account → export sync code → import in private window
2. After deploy: magic link, Google, verification email
