# Min-shop

Min-shop is a marketplace web app built with Next.js, TypeScript, Tailwind, Prisma, and PostgreSQL.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

## Quick Start

1. Install dependencies:

```bash
npm install
cp .env.example .env
```

2. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npx prisma migrate dev
```

3. Seed optional data:

```bash
npm run prisma:seed
```

4. Run locally:

```bash
npm run dev
```

App URL: `http://localhost:3000`

## Production Readiness

For Vercel + managed PostgreSQL + hosted payments (Flutterwave/CinetPay), see:

- [README_PRODUCTION.md](./README_PRODUCTION.md)

Main payment routes:

- `POST /api/payments/create-payment`
- `POST /api/payments/payment-webhook`
- `GET /payment-return`

## Roles

- `ADMIN`
- `SELLER`
- `CUSTOMER`

Route protections:

- `/admin/*` requires admin session
- `/seller/*` requires seller or admin session
- Admin and seller APIs are protected server-side with role checks

## Legal Pages

- `/cgu`
- `/privacy`
- `/refunds`
- `/seller-terms`
