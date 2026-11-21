<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook

Single Next.js app at the repo root; use npm (`package-lock.json`). App Router code lives in `src/app`, and `@/*` maps to `src/*`.

## Commands

- `npm run dev` — Turbopack dev server on `http://localhost:3000`.
- `npm run build` — production build with Turbopack; it also runs TypeScript.
- `npx tsc --noEmit` — standalone typecheck (passes on the current tree).
- `npm run lint` — ESLint flat config. It currently fails on two shadcn-generated files, `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts` (`react-hooks/set-state-in-effect`), and warns about an unused `cn` import in `src/app/signin/page.tsx`. Use `npx eslint <paths>` to lint only your changes instead of treating the baseline as a regression.
- There is no test runner, test script, or CI workflow in this repo. Do not invent one unless asked.

## Next.js 16 notes

- Read the version-matched guide in `node_modules/next/dist/docs/` before using framework APIs; this version differs from older Next.js conventions.
- Turbopack is the default for both dev and build; Tailwind v4 is wired through the `@tailwindcss/turbopack` rule in `next.config.ts`, and there is no PostCSS config.
- `reactCompiler: true` is enabled in `next.config.ts`.
- Route props use Next's generated helpers, e.g. `LayoutProps<"/">` in `src/app/layout.tsx`, rather than handwritten prop types. Prefer generated `PageProps`/`RouteContext` types.
- If request middleware is needed, use `proxy.ts` (not `middleware.ts`). `cookies()`, `headers()`, and route `params` are async. `next lint` no longer exists.

## UI and styling

- shadcn is configured with the `base-nova` style on Base UI (`@base-ui/react`), not Radix. Add primitives with `npx shadcn add <component>`; generated primitives stay in `src/components/ui/`.
- `cn` comes from the `cn` package (`import { cn } from "cn"`), which generated components import directly; `src/lib/utils.ts` only re-exports it. Do not swap in `clsx`/`tailwind-merge`.
- Tailwind is CSS-first (v4): theme tokens live in `src/app/globals.css`, which imports `shadcn/tailwind.css` (keep it); there is no `tailwind.config.*`.
- Sonner's `<Toaster>` is mounted in `src/app/layout.tsx`; use `toast` from `sonner` for feedback.
- App components (e.g. `Navbar.tsx`, `Banner.tsx`) use hardcoded hex colors from the green/cream palette rather than theme tokens; match that style when editing them.

## Auth

- Better Auth with the MongoDB adapter. Server config: `src/lib/auth.ts` (database name hardcoded to `salonbook`). API handler: `src/app/api/auth/[...all]/route.ts`. Client: `src/lib/auth-client.ts`.
- Client code uses the `authClient` export in `src/lib/auth-client.ts`, which includes `inferAdditionalFields<typeof auth>()`; `signIn`/`signUp`/`useSession` are destructured from that same client. Keep server `auth` imports type-only in client files.
- `.env` is gitignored and contains live credentials: never print or commit its values. The app reads `MONGODB_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`; Google OAuth additionally reads `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (currently missing, so Google buttons fail locally and `next build` warns).
- `role` is a Better Auth additional user field (`input: true`, default `"customer"`). The signup form sends `admin` or `customer`; because the client chooses this value, admin self-signup is only a development shortcut — enforce real authorization server-side before relying on it.

## Routes

- Implemented: `/`, `/services`, `/signin`, `/signup`, `/dashboard/admin`, `/dashboard/admin/add_book`, `/dashboard/admin/services`, `/dashboard/customer`, `/api/auth/[...all]`, `/api/services`, and `/api/services/[id]`.
- `src/app/components/DashboardSidebar.tsx` picks its menu from the URL (`/dashboard/admin/*` → admin, otherwise customer), not from the session role. Its subpage links (`appointments`, `customers`, `transactions`, `profile`) are mostly not implemented yet.
- Navbar sends admins to `/dashboard/admin` and other users to `/dashboard/customer`.
- The real signup route is `/signup`. `Banner.tsx` links to the stale `/sign-up`; do not create a duplicate route.

## Services

- Service types live in `src/lib/services.ts`; shared request validation lives in `src/lib/service-validation.ts`; `src/lib/mongodb.ts` exposes a cached `getDb()` for the `salonbook` database.
- `GET /api/services` returns only active services to the public and all services to admins. `POST /api/services` creates a service, while `PATCH`/`DELETE /api/services/[id]` update or remove one. All write routes are admin-only.
- The admin list at `/dashboard/admin/services` can edit, activate/deactivate, and delete services. Editing links to `/dashboard/admin/add_book?edit=<id>`, which reuses the same `ServiceForm` as creation.
- The public `/services` page queries only `status: "active"` services, so deactivated services disappear from browsing and cannot be booked.
