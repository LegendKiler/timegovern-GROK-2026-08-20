# TimeGovern Billing (Phase 3) — Stripe

## Products (AUD)

| Plan code | Product | Price | Interval |
|-----------|---------|-------|----------|
| `supporter_quarterly` | Supporter | **A$9.99** | Every 3 months |
| `supporter_yearly` | Supporter | **A$29.99** | Yearly |
| `calendar_yearly` | Calendar PDF + Logo | **A$79.00** | Yearly |

**No PayPal in this phase.** Cards, Apple Pay, Google Pay, Link via Stripe Checkout.

## Lab vs production

| Mode | When | Behaviour |
|------|------|-----------|
| **lab-mock** | `STRIPE_SECRET_KEY` missing | Checkout grants entitlement in D1/local without charging |
| **test** | `sk_test_...` key | Real Stripe test Checkout |
| **live** | `sk_live_...` key | Real charges |

You do **not** need production deploy to develop. `npm run dev` uses local mock if `/api/billing` is offline.

## Cloudflare Worker secrets (production later)

```bash
npx wrangler secret put STRIPE_SECRET_KEY -c wrangler.toml
npx wrangler secret put STRIPE_WEBHOOK_SECRET -c wrangler.toml
# optional fixed Price IDs (else inline price_data is used):
npx wrangler secret put STRIPE_PRICE_SUPPORTER_QUARTERLY -c wrangler.toml
npx wrangler secret put STRIPE_PRICE_SUPPORTER_YEARLY -c wrangler.toml
npx wrangler secret put STRIPE_PRICE_CALENDAR_YEARLY -c wrangler.toml
```

Optional var:

```toml
[vars]
PUBLIC_ORIGIN = "https://timegovern.com"
```

## Webhook

Stripe Dashboard → Developers → Webhooks → endpoint:

`https://timegovern.com/api/billing/webhook`

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.

## Migrate D1

```bash
npx wrangler d1 migrations apply zoneshift-db --remote -c wrangler.toml
```

## API

- `GET  /api/billing/status` (Bearer)
- `POST /api/billing/checkout` `{ "plan": "supporter_yearly" }`
- `POST /api/billing/portal`
- `POST /api/billing/webhook`
- `POST /api/billing/lab-revoke` (non-live only)

## Legal notes (AU)

- Not a charitable donation.
- Show ABN on receipts (Stripe business settings).
- Clear cancel via Customer Portal.
- GST: configure with your accountant when registered.
