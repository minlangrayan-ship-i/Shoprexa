# Shoprexa Production Runbook

This document describes how to deploy Shoprexa on Vercel with managed PostgreSQL and hosted checkout payments (Flutterwave or CinetPay), without storing card data.

## 1) Prerequisites

- Node.js 20+
- A managed PostgreSQL instance (Neon, Supabase, Render, RDS, etc.)
- Vercel project connected to this GitHub repository
- Flutterwave or CinetPay merchant account
- Public domain name

## 2) Environment Variables

Copy `.env.example` and configure values:

```bash
cp .env.example .env
```

Required in production:

- `DATABASE_URL`
- `APP_BASE_URL` (e.g. `https://shoprexa.com`)
- `APP_SESSION_SECRET`
- payment provider secrets:
  - Flutterwave: `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`
  - CinetPay: `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_WEBHOOK_SECRET`

## 3) Database Migration

Generate Prisma client and deploy migrations:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

Optional seed:

```bash
npm run prisma:seed
```

## 4) Deploy to Vercel

1. Import repository in Vercel.
2. Set all environment variables in Vercel Project Settings.
3. Deploy branch `main`.
4. Validate health:
   - `/`
   - `/shop`
   - `/api/products`
   - `/api/categories`

## 5) Configure Domain

1. Add domain in Vercel.
2. Configure DNS records at registrar.
3. Ensure `APP_BASE_URL` matches the final HTTPS domain.

## 6) Payment Webhooks

Configure webhook URLs:

- Flutterwave:
  - `https://<your-domain>/api/payments/payment-webhook?provider=FLUTTERWAVE`
- CinetPay:
  - `https://<your-domain>/api/payments/payment-webhook?provider=CINETPAY`

Important:

- Webhooks must be verified by signature.
- Order is marked paid only after server-side verification.
- Duplicate webhook deliveries are idempotent (already-success state is ignored).

## 7) Security Notes

- Card data is never stored in Shoprexa database.
- Checkout is hosted by PSP provider (Flutterwave/CinetPay).
- Private API routes are role-protected server-side.
- Session cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.

## 8) Core Data Model (Production)

Main entities:

- `users`
- `sellers`
- `categories`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `commissions`

## 9) Test Checklist (Pre-Production)

1. Register customer user and login.
2. Add cart items and create order.
3. Create hosted checkout URL.
4. Simulate/execute payment callback and webhook.
5. Verify:
   - payment status transitions `PENDING -> SUCCESS/FAILED`
   - order status transitions `PENDING -> PAID`
   - no double payment validation on repeated webhook
6. Verify admin endpoints require admin role.
7. Verify seller dashboard endpoint requires seller/admin role.
8. Verify legal pages are accessible:
   - `/cgu`
   - `/privacy`
   - `/refunds`
   - `/seller-terms`

## 10) Remaining Manual Steps

- Provision real production PostgreSQL credentials.
- Create real Flutterwave or CinetPay credentials.
- Configure webhook endpoints in PSP dashboard.
- Configure production DNS/domain in Vercel.
