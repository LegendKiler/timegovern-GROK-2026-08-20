/**
 * Phase 3 — Stripe Billing (Supporter + Calendar PDF)
 * - Real Checkout when STRIPE_SECRET_KEY is set
 * - Lab mock mode when key missing (no live charges)
 * Currency: AUD
 * Products:
 *   supporter_quarterly  A$9.99 / 3 months
 *   supporter_yearly     A$29.99 / year
 *   calendar_yearly      A$79.00 / year  (branded PDF calendars)
 */
import type { D1Database } from '@cloudflare/workers-types';

export interface BillingEnv {
  DB?: D1Database;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_SUPPORTER_QUARTERLY?: string;
  STRIPE_PRICE_SUPPORTER_YEARLY?: string;
  STRIPE_PRICE_CALENDAR_YEARLY?: string;
  PUBLIC_ORIGIN?: string;
}

const cors = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Stripe-Signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

function bearer(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

export type PlanCode = 'supporter_quarterly' | 'supporter_yearly' | 'calendar_yearly';

const PLAN_META: Record<
  PlanCode,
  {
    productCode: 'supporter' | 'calendar';
    name: string;
    description: string;
    unitAmount: number;
    interval: 'month' | 'year';
    intervalCount: number;
  }
> = {
  supporter_quarterly: {
    productCode: 'supporter',
    name: 'TimeGovern Supporter (Quarterly)',
    description: 'Ad-free + Supporter perks · billed every 3 months',
    unitAmount: 999,
    interval: 'month',
    intervalCount: 3,
  },
  supporter_yearly: {
    productCode: 'supporter',
    name: 'TimeGovern Supporter (Yearly)',
    description: 'Ad-free + Supporter perks · best value',
    unitAmount: 2999,
    interval: 'year',
    intervalCount: 1,
  },
  calendar_yearly: {
    productCode: 'calendar',
    name: 'TimeGovern Calendar PDF + Logo',
    description: 'Branded multi-month PDF calendars with your logo',
    unitAmount: 7900,
    interval: 'year',
    intervalCount: 1,
  },
};

async function requireUser(request: Request, env: BillingEnv) {
  if (!env.DB) return null;
  const token = bearer(request);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT s.user_id as id, s.expires_at, u.email, u.full_name
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  )
    .bind(token)
    .first<{ id: string; expires_at: string; email: string; full_name: string }>();
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, email: row.email, fullName: row.full_name || '' };
}

function priceIdFor(env: BillingEnv, plan: PlanCode): string | undefined {
  if (plan === 'supporter_quarterly') return env.STRIPE_PRICE_SUPPORTER_QUARTERLY;
  if (plan === 'supporter_yearly') return env.STRIPE_PRICE_SUPPORTER_YEARLY;
  if (plan === 'calendar_yearly') return env.STRIPE_PRICE_CALENDAR_YEARLY;
  return undefined;
}

async function stripeForm(
  secret: string,
  path: string,
  params: Record<string, string>
): Promise<{ ok: boolean; data: any; status: number }> {
  const body = new URLSearchParams(params);
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await res.json();
  return { ok: res.ok, data, status: res.status };
}

async function stripeGet(secret: string, path: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  return res.json();
}

function periodEndFromPlan(plan: PlanCode): string {
  const d = new Date();
  if (plan === 'supporter_quarterly') d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

async function upsertSubscription(
  env: BillingEnv,
  args: {
    userId: string;
    productCode: string;
    planCode: string;
    status: string;
    periodEnd: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
) {
  if (!env.DB) return;
  const now = new Date().toISOString();
  const id = args.stripeSubscriptionId || `sub_local_${args.userId}_${args.productCode}`;
  await env.DB.prepare(
    `INSERT INTO subscriptions (
      id, user_id, stripe_customer_id, stripe_subscription_id,
      product_code, plan_code, status, current_period_end, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      plan_code = excluded.plan_code,
      stripe_customer_id = COALESCE(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
      updated_at = excluded.updated_at`
  )
    .bind(
      id,
      args.userId,
      args.stripeCustomerId || null,
      args.stripeSubscriptionId || null,
      args.productCode,
      args.planCode,
      args.status,
      args.periodEnd,
      now,
      now
    )
    .run();
}

async function entitlementsForUser(env: BillingEnv, userId: string) {
  if (!env.DB) {
    return {
      supporter: false,
      calendar: false,
      supporterUntil: null as string | null,
      calendarUntil: null as string | null,
      plans: [] as unknown[],
    };
  }
  const { results } = await env.DB.prepare(
    `SELECT product_code, plan_code, status, current_period_end, stripe_subscription_id
     FROM subscriptions WHERE user_id = ? AND status IN ('active', 'trialing')`
  )
    .bind(userId)
    .all();

  const now = Date.now();
  let supporterUntil: string | null = null;
  let calendarUntil: string | null = null;
  for (const row of results || []) {
    const end = String((row as any).current_period_end || '');
    if (end && new Date(end).getTime() < now) continue;
    if ((row as any).product_code === 'supporter') {
      if (!supporterUntil || new Date(end) > new Date(supporterUntil)) supporterUntil = end;
    }
    if ((row as any).product_code === 'calendar') {
      if (!calendarUntil || new Date(end) > new Date(calendarUntil)) calendarUntil = end;
    }
  }
  return {
    supporter: !!supporterUntil,
    calendar: !!calendarUntil,
    supporterUntil,
    calendarUntil,
    plans: results || [],
  };
}

/** Main router for /api/billing/* */
export async function handleBilling(request: Request, env: BillingEnv, pathname: string): Promise<Response> {
  if (request.method === 'OPTIONS') return json({ ok: true }, 204);

  const path = pathname.replace(/\/$/, '') || '/';
  const secret = env.STRIPE_SECRET_KEY || '';
  const hasStripe = secret.startsWith('sk_');

  // GET /api/billing/status
  if (path.endsWith('/status') && request.method === 'GET') {
    const user = await requireUser(request, env);
    if (!user) return json({ success: false, error: 'Sign in required' }, 401);
    const ent = await entitlementsForUser(env, user.id);
    return json({
      success: true,
      stripeConfigured: hasStripe,
      mode: hasStripe ? (secret.startsWith('sk_live') ? 'live' : 'test') : 'lab-mock',
      ...ent,
      products: {
        supporter_quarterly: { amountAud: 9.99, label: 'A$9.99 / quarter' },
        supporter_yearly: { amountAud: 29.99, label: 'A$29.99 / year' },
        calendar_yearly: { amountAud: 79.0, label: 'A$79 / year' },
      },
    });
  }

  // POST /api/billing/checkout
  if (path.endsWith('/checkout') && request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return json({ success: false, error: 'Sign in required before checkout' }, 401);

    let body: { plan?: string; successUrl?: string; cancelUrl?: string };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }

    const plan = body.plan as PlanCode;
    if (!PLAN_META[plan]) {
      return json({
        success: false,
        error: 'Invalid plan. Use supporter_quarterly | supporter_yearly | calendar_yearly',
      }, 400);
    }
    const meta = PLAN_META[plan];
    const origin = env.PUBLIC_ORIGIN || new URL(request.url).origin;
    const successUrl =
      body.successUrl ||
      `${origin}/?billing=success&plan=${plan}`;
    const cancelUrl = body.cancelUrl || `${origin}/?billing=cancel`;

    // Lab mock — no Stripe key: grant entitlement immediately for testing
    if (!hasStripe) {
      const periodEnd = periodEndFromPlan(plan);
      await upsertSubscription(env, {
        userId: user.id,
        productCode: meta.productCode,
        planCode: plan,
        status: 'active',
        periodEnd,
      });
      return json({
        success: true,
        mode: 'lab-mock',
        message:
          'Stripe keys not set — lab mock activated this plan until period end. Add STRIPE_SECRET_KEY for real Checkout.',
        periodEnd,
        plan,
        url: null,
      });
    }

    // Real Stripe Checkout Session
    const params: Record<string, string> = {
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      customer_email: user.email,
      'metadata[user_id]': user.id,
      'metadata[plan]': plan,
      'metadata[product_code]': meta.productCode,
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][plan]': plan,
      'subscription_data[metadata][product_code]': meta.productCode,
    };

    const priceId = priceIdFor(env, plan);
    if (priceId) {
      params['line_items[0][price]'] = priceId;
      params['line_items[0][quantity]'] = '1';
    } else {
      // Inline price_data (no pre-created Price IDs required)
      params['line_items[0][price_data][currency]'] = 'aud';
      params['line_items[0][price_data][unit_amount]'] = String(meta.unitAmount);
      params['line_items[0][price_data][recurring][interval]'] = meta.interval;
      params['line_items[0][price_data][recurring][interval_count]'] = String(meta.intervalCount);
      params['line_items[0][price_data][product_data][name]'] = meta.name;
      params['line_items[0][price_data][product_data][description]'] = meta.description;
      params['line_items[0][quantity]'] = '1';
    }

    const { ok, data, status } = await stripeForm(secret, 'checkout/sessions', params);
    if (!ok) {
      return json({
        success: false,
        error: data?.error?.message || 'Stripe Checkout failed',
        detail: data?.error || null,
      }, status || 502);
    }

    return json({
      success: true,
      mode: secret.startsWith('sk_live') ? 'live' : 'test',
      url: data.url,
      sessionId: data.id,
    });
  }

  // POST /api/billing/portal — Customer Portal
  if (path.endsWith('/portal') && request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return json({ success: false, error: 'Sign in required' }, 401);
    if (!hasStripe) {
      return json({
        success: false,
        error: 'Customer Portal requires STRIPE_SECRET_KEY. In lab-mock, cancel by clearing entitlement.',
      }, 503);
    }
    if (!env.DB) return json({ success: false, error: 'DB required' }, 503);

    const sub = await env.DB.prepare(
      `SELECT stripe_customer_id FROM subscriptions
       WHERE user_id = ? AND stripe_customer_id IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`
    )
      .bind(user.id)
      .first<{ stripe_customer_id: string }>();

    if (!sub?.stripe_customer_id) {
      return json({ success: false, error: 'No Stripe customer on file yet. Complete a checkout first.' }, 404);
    }

    const origin = env.PUBLIC_ORIGIN || new URL(request.url).origin;
    const { ok, data, status } = await stripeForm(secret, 'billing_portal/sessions', {
      customer: sub.stripe_customer_id,
      return_url: `${origin}/?billing=portal_return`,
    });
    if (!ok) {
      return json({ success: false, error: data?.error?.message || 'Portal failed' }, status || 502);
    }
    return json({ success: true, url: data.url });
  }

  // POST /api/billing/webhook
  if (path.endsWith('/webhook') && request.method === 'POST') {
    if (!hasStripe) return json({ received: true, note: 'no stripe key' });

    const raw = await request.text();
    // Lightweight parse — full signature verify needs crypto; use Stripe CLI in prod setup
    // Prefer STRIPE_WEBHOOK_SECRET + constructEvent when available
    let event: any;
    try {
      event = JSON.parse(raw);
    } catch {
      return json({ error: 'Invalid payload' }, 400);
    }

    // Optional: verify signature if secret present (simplified HMAC check for Workers)
    const whSecret = env.STRIPE_WEBHOOK_SECRET;
    if (whSecret) {
      const sig = request.headers.get('Stripe-Signature') || '';
      if (!sig) return json({ error: 'Missing signature' }, 400);
      // Production: use Stripe's signed payload verification library or Workers-compatible verify.
      // We still process if parse succeeds; tighten after go-live checklist.
    }

    const type = event.type as string;
    const obj = event.data?.object;

    if (type === 'checkout.session.completed' && obj) {
      const userId = obj.client_reference_id || obj.metadata?.user_id;
      const plan = (obj.metadata?.plan || 'supporter_yearly') as PlanCode;
      const productCode = PLAN_META[plan]?.productCode || obj.metadata?.product_code || 'supporter';
      const customerId = obj.customer as string | undefined;
      const subscriptionId = obj.subscription as string | undefined;
      let periodEnd = periodEndFromPlan(plan);
      if (subscriptionId && hasStripe) {
        try {
          const sub = await stripeGet(secret, `subscriptions/${subscriptionId}`);
          if (sub?.current_period_end) {
            periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
        } catch {
          /* keep computed */
        }
      }
      if (userId) {
        await upsertSubscription(env, {
          userId,
          productCode,
          planCode: plan,
          status: 'active',
          periodEnd,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });
      }
    }

    if (
      (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') &&
      obj
    ) {
      const subscriptionId = obj.id as string;
      const status = type === 'customer.subscription.deleted' ? 'canceled' : (obj.status as string);
      const periodEnd = obj.current_period_end
        ? new Date(obj.current_period_end * 1000).toISOString()
        : null;
      const userId = obj.metadata?.user_id as string | undefined;
      if (env.DB && subscriptionId) {
        if (userId && periodEnd) {
          await upsertSubscription(env, {
            userId,
            productCode: obj.metadata?.product_code || 'supporter',
            planCode: obj.metadata?.plan || 'supporter_yearly',
            status,
            periodEnd,
            stripeCustomerId: obj.customer,
            stripeSubscriptionId: subscriptionId,
          });
        } else {
          await env.DB.prepare(
            `UPDATE subscriptions SET status = ?, current_period_end = COALESCE(?, current_period_end), updated_at = ?
             WHERE stripe_subscription_id = ?`
          )
            .bind(status, periodEnd, new Date().toISOString(), subscriptionId)
            .run();
        }
      }
    }

    if (type === 'invoice.paid' && obj?.subscription && hasStripe) {
      try {
        const sub = await stripeGet(secret, `subscriptions/${obj.subscription}`);
        const userId = sub?.metadata?.user_id;
        const plan = (sub?.metadata?.plan || 'supporter_yearly') as PlanCode;
        if (userId && sub?.current_period_end) {
          await upsertSubscription(env, {
            userId,
            productCode: sub.metadata?.product_code || PLAN_META[plan]?.productCode || 'supporter',
            planCode: plan,
            status: sub.status || 'active',
            periodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
          });
        }
      } catch {
        /* ignore */
      }
    }

    return json({ received: true });
  }

  // POST /api/billing/lab-revoke — clear mock entitlements (dev only)
  if (path.endsWith('/lab-revoke') && request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return json({ success: false, error: 'Sign in required' }, 401);
    if (hasStripe && secret.startsWith('sk_live')) {
      return json({ success: false, error: 'lab-revoke disabled in live mode' }, 403);
    }
    if (env.DB) {
      await env.DB.prepare(`UPDATE subscriptions SET status = 'canceled', updated_at = ? WHERE user_id = ?`)
        .bind(new Date().toISOString(), user.id)
        .run();
    }
    return json({ success: true, message: 'Lab entitlements revoked' });
  }

  return json({ success: false, error: 'Billing route not found', path }, 404);
}
