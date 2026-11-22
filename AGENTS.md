<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook

Single Next.js 16 app at repo root; use npm (`package-lock.json`). App Router in `src/app`, `@/*` → `src/*`. A separate Express API (not in this repo) is expected at `http://localhost:8000` unless `NEXT_PUBLIC_API_BASE_URL` overrides it.

## Commands

- `npm run dev` (Turbopack, `http://localhost:3000`), `npm run build` (also typechecks), `npm start`.
- `npx tsc --noEmit` passes on the current tree.
- `npm run lint` is currently **red baseline**: `react-hooks/set-state-in-effect` in `src/components/ui/carousel.tsx` and `src/app/dashboard/admin/customers/page.tsx`; unused imports in that customers page, `src/app/services/services-browser.tsx`, and `src/app/signin/page.tsx`. Use `npx eslint <paths>` for focused verification.
- No test runner, test script, or CI workflow. Do not invent one unless asked.

## Verification gotchas

- ESLint enforces `react-hooks/set-state-in-effect`: do not call `setState` synchronously in a `useEffect` body, including through a helper called there. Use promise callbacks or a keyed child component instead.
- Base UI `<Button render={<Link ... />}>` needs `nativeButton={false}`; otherwise it logs an a11y warning and drops native button semantics.
- `next build` warns about missing Google OAuth env vars locally; that is expected because they are absent from `.env`.

## Next.js 16 notes

- Read the version-matched guide in `node_modules/next/dist/docs/` before using framework APIs; this version differs from older Next.js conventions.
- Turbopack is default for dev and build; Tailwind v4 is wired via the `@tailwindcss/turbopack` rule in `next.config.ts`. There is no PostCSS config and no `tailwind.config.*`.
- `reactCompiler: true` is enabled in `next.config.ts`.
- Route props use generated helpers, e.g. `LayoutProps<"/">` in `src/app/layout.tsx`. Prefer generated `PageProps`/`RouteContext` types.
- If request middleware is needed, use `proxy.ts` (not `middleware.ts`). `cookies()`, `headers()`, and route `params` are async. `next lint` no longer exists.

## UI and styling

- shadcn uses `base-nova` style on Base UI (`@base-ui/react`), not Radix. Add primitives with `npx shadcn add <component>`; generated primitives stay in `src/components/ui/`.
- `cn` comes from the `cn` package (`import { cn } from "cn"`); `src/lib/utils.ts` only re-exports it. Do not swap in `clsx`/`tailwind-merge`.
- Tailwind is CSS-first (v4): theme tokens live in `src/app/globals.css`, which imports `shadcn/tailwind.css` (keep it).
- Sonner's `<Toaster>` is mounted in `src/app/layout.tsx`; use `toast` from `sonner` for feedback.
- App components (e.g. `Navbar.tsx`, `Banner.tsx`) use hardcoded green/cream hex colors rather than theme tokens; match that style when editing them.

## Auth

- Better Auth + MongoDB adapter. Server config `src/lib/auth.ts` (DB name hardcoded to `salonbook`); handler `src/app/api/auth/[...all]/route.ts`; client `src/lib/auth-client.ts`.
- Client code uses `authClient` from `src/lib/auth-client.ts` (it has `inferAdditionalFields<typeof auth>()`); `signIn`/`signUp`/`useSession` come from that same client. Keep server `auth` imports type-only in client files.
- `.env` is gitignored and holds live credentials: never print or commit values. Keys in use: `MONGODB_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_API_BASE_URL`. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is present but no code reads it. `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are missing.
- `role` is the only additional user field (`input: true`, default `"customer"`). There is no `phoneNumber` field: `authClient.updateUser({ phoneNumber })` is a TypeScript error and won't persist; don't add it client-side.
- Signup sends `admin` or `customer` from the client, so admin self-signup is a development shortcut — enforce real authorization server-side before relying on it.

## Data sources (easy to get wrong)

- `src/lib/` is server-only infra: `mongodb.ts` (`getDb()` → `salonbook`), `auth.ts`, `stripe.ts`, `payments.ts`. `src/app/lib/api/*` and `src/app/lib/appointments.ts` are client-side fetchers for the external Express API.
- `src/app/api/services/*` uses local MongoDB, **not** the external API. Services exist in both places; don't assume they are the same store.
- The external appointments API returns **all** bookings, not just the caller's. Every "my appointments" view must filter by `session.user.id` or case-insensitive email. Payment routes instead read the local `appointments` collection by ObjectId.
- Customer overview counts are computed from filtered appointments. `getCustomerDashboardStats()` (`GET /customer-stats`) returns site-wide totals and is not used by the overview. Admin overview uses `GET /api/admin/dashboard/stats`.

## Routes

- Implemented pages: `/`, `/services`, `/services/[id]`, `/browser`, `/signin`, `/signup`, `/dashboard/admin`, `/dashboard/admin/overview`, `/dashboard/admin/add_book`, `/dashboard/admin/services`, `/dashboard/admin/appointments`, `/dashboard/admin/customers`, `/dashboard/admin/profile`, `/dashboard/customer`, `/dashboard/customer/overview`, `/dashboard/customer/appointments`, `/dashboard/customer/appointments/[id]/payment`, `/dashboard/customer/profile`.
- `/browser` is a one-line re-export alias of `/services` (kept because home-page links use it). `ServicesBrowser` reads `?category=<display name>` via `useSearchParams()` to pre-select the filter; the route is dynamic (`connection()`), so no Suspense boundary is needed.
- Role entry routes are one-line re-export shims: `/dashboard/admin` → `./overview/page`, `/dashboard/customer` → `./overview/page`, and both role profile routes → `@/app/dashboard/profile/page`. Edit the target, not the shim.
- `src/app/components/DashboardSidebar.tsx` picks its menu from the URL prefix (`/dashboard/admin/*` → admin, else customer), not from session role. Some sidebar links (e.g. `transactions`) still have no page.
- Navbar sends admins to `/dashboard/admin` and everyone else to `/dashboard/customer`.
- Real signup route is `/signup`; `Banner.tsx` links to stale `/sign-up`. Do not create a duplicate route.
- Payment `success` verifies the Stripe session and records a paid checkout; `cancel` shows a retry link. Stripe redirects land on these pages.

## Services

- Types in `src/lib/services.ts`; shared validation in `src/lib/service-validation.ts`.
- `GET /api/services` returns active services publicly and all services to admins. `POST /api/services` creates; `PATCH`/`DELETE /api/services/[id]` update/remove. All writes are admin-only.
- Admin list `/dashboard/admin/services` edits via `/dashboard/admin/add_book?edit=<id>`, reusing the same `ServiceForm`.
- Public `/services` queries only `status: "active"` services, so deactivated services cannot be browsed or booked.

## Payments

- Stripe Checkout is server-side; `src/lib/stripe.ts` throws at import if `STRIPE_SECRET_KEY` is missing. Webhook secret is optional: without it `POST /api/webhooks/stripe` returns `ignored: true`.
- `POST /api/checkout_sessions` creates the session and stores `paymentSessionId` on the appointment; `POST /api/payments/sync` asks Stripe to confirm it. Both and the webhook call `recordPaidCheckoutSession()` in `src/lib/payments.ts`.
- `recordPaidCheckoutSession()` is idempotent: upserts `transactions` by `stripeSessionId` and sets the appointment's `paymentStatus` to `Paid`. Keep it that way.
- Checkout price comes from the local `services` document at request time, converted to cents; currency is hardcoded `usd`.
