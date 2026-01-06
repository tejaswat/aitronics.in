# Fina Storefront

Production-ready e-commerce storefront built with Next.js (App Router), TypeScript, Supabase at `https://gateway.thefina.com`, and Docker — optimized for Coolify.

---

## Features
- Next.js App Router + TypeScript + responsive UI
- Supabase Auth, Postgres, RLS, and transactional order creation
- Secure checkout Edge Function (price/stock validation + rate limiting)
- Cart persisted locally and synced to Supabase when authenticated
- State management with Zustand, loading skeletons, error boundaries
- Hardened security headers, HTTPS enforcement, CSP, and input validation
- Multi-stage Docker image with non-root user and healthcheck

---

## Quick Start (local)
1. Clone repo.
2. Create a Supabase project (or use `https://gateway.thefina.com`) and run:
   - `supabase/schema.sql`
   - `supabase/rls.sql`
3. Create `.env.local`:
   ```
   SUPABASE_URL=https://gateway.thefina.com
   SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_URL=https://gateway.thefina.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server/Edge Functions only
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Install and run:
   ```
   npm install
   npm run dev
   ```

---

## Supabase setup (gateway.thefina.com)
1. Apply SQL: `supabase/schema.sql` then `supabase/rls.sql`.
2. Deploy the Edge Function:
   ```
   supabase functions deploy checkout --project-ref <your-ref>
   ```
3. Ensure RLS is enabled; anon has read-only to products/categories; orders/cart restricted to owners; admin via JWT claim `role = 'admin'`.
4. Store `SUPABASE_SERVICE_ROLE_KEY` only in server/Edge Function environments (never in the client).

---

## Deployment (Coolify)
- Use the provided `Dockerfile` (multi-stage, non-root). Exposes port `3000` (respects `PORT` env).
- Configure env vars in Coolify:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
  - `NEXT_PUBLIC_APP_URL`
- Set healthcheck to `/api/health`.

---

## Security notes & threat model
- Frontend uses only anon key; service role remains server-side.
- Orders are created only via Edge Function calling `create_order_with_items` (price/stock checked server-side).
- Rate limiting enforced per IP/user on checkout; HTTPS + HSTS + CSP enabled.
- RLS prevents IDOR: users read/write only their carts/orders; products/categories are public read-only; admin via JWT `role=admin`.
- Checkout payload validated client/server; no price tampering or direct DB writes from client.

---

## Production checklist
- Enforce HTTPS and keep HSTS enabled.
- Rotate and store `SUPABASE_SERVICE_ROLE_KEY` as a secret (not public).
- Configure payment provider (Stripe-ready stub in Edge Function) server-side only.
- Add monitoring/alerting for Edge Functions and DB.
- Run tests before deploy: `npm run lint && npm run typecheck && npm test`.

---
