# Auth & OSS Demo — Technical Logic Explainer

This explainer covers three catalog entries that share a single document because they share a single auth system: **Auth Demo** (`/auth`), **Dashboard** (`/dashboard`, protected) and **Profile** (`/profile`, protected). The `AuthStatus.svelte` badge that lives next to this file is the visible tip of the iceberg; everything underneath — Better Auth, the Neon `Pool`, the `(protected)` route group, the `event.locals.user` lookup in `hooks.server.ts`, and the public demo-user account — is what these pages exist to demonstrate.

## What Does It Do? (Plain English)

These three pages together show how to wire **Better Auth** into SvelteKit on top of the same Neon Postgres database used by every other component demo, and how to gate routes behind a server-side session check.

- **`/auth`** is the public overview: it shows whether auth is configured, whether you're signed in, and (when `PUBLIC_DEMO_AUTH=true`) advertises the read-only demo account so anyone visiting the deployed site can poke a "real" authenticated session without registering.
- **`/auth/sign-in/[...rest]`** and **`/auth/sign-up/[...rest]`** are the actual email/password forms. The catch-all `[...rest]` segment is there because Better Auth's client SDK can navigate to nested paths (e.g. password-reset flows) without us declaring each one.
- **`/dashboard`** and **`/profile`** live inside the `(protected)` route group. Their parent `+layout.server.ts` calls `requireAuth(event)` — if there's no session, the load function throws a 303 redirect to `/auth/sign-in?redirect_url=...` before any page code runs.

Think of it like a hotel keycard system. The lobby (`/auth`) is open to everyone and the front desk hands out cards. Floors marked `(protected)` only let you off the lift if your card scans green. The card itself is a Better Auth session cookie; the scanner is `hooks.server.ts`.

## How It Works (Pseudo-Code)

**Server boot (`hooks.server.ts`)**

```
on every request:
  event.locals.session = null
  event.locals.user    = null

  if NOT isBetterAuthConfigured():
    return resolve(event)              // graceful degrade — no auth, but app still loads

  session = auth.api.getSession({ headers: event.request.headers })
    .catch(() => null)                  // never throw on a flaky DB

  if session:
    event.locals.session = session.session
    event.locals.user    = session.user

  return svelteKitHandler({ event, resolve, auth, building })
                                        // delegates /api/auth/* routes to Better Auth
```

**Client sign-in (`/auth/sign-in/[...rest]/+page.svelte`)**

```
on form submit:
  result = await authClient.signIn.email({ email, password })
  if result.error:
    show errorMessage; stop
  await invalidateAll()                 // re-runs every server load with the new cookie
  await goto(redirectUrl ?? '/dashboard')
```

**Server gate (`(protected)/+layout.server.ts`)**

```
on load(event):
  userId = requireAuth(event)           // throws 303 → /auth/sign-in?redirect_url=<here>
  return {
    userId,
    authUser:   toAuthUser(event.locals.user),
    isDemoUser: isDemoUser(event)       // true only when PUBLIC_DEMO_AUTH=true and email matches
  }
```

**API gate (`requireAuthAPI`)**

```
userId = event.locals.user?.id
if NOT userId:           throw error(401, 'Authentication required')
if isDemoUser(event):    throw error(403, 'The public demo account is read-only')
return userId
```

The whole flow is a single chain: cookie arrives → `hooks.server.ts` populates `locals.user` → load functions read it via the helpers in `$lib/server/auth.ts` → the page either renders or redirects.

## The Core Concept: Better Auth Wiring

`betterAuth(...)` in `src/lib/server/betterAuth.ts` is the single source of truth. Three things make it work in this project:

1. **Database adapter.** Better Auth speaks SQL through a `Pool` from `@neondatabase/serverless`. The same `DATABASE_URL` that powers every other demo also stores the four auth tables (`user`, `session`, `account`, `verification`) defined in `database/schema_better_auth.sql`.
2. **`sveltekitCookies(getRequestEvent)`.** Better Auth's cookie writes need access to SvelteKit's response object. The plugin uses `getRequestEvent` from `$app/server` so cookies set inside Better Auth's own `/api/auth/*` handlers end up on the actual outgoing response.
3. **`svelteKitHandler` in the hook.** Better Auth ships its own catch-all REST endpoints. Wrapping `resolve(event)` with `svelteKitHandler({ event, resolve, auth, building })` lets Better Auth claim `/api/auth/*` requests and pass everything else through to SvelteKit unchanged.

The client side is deliberately tiny. `src/lib/auth-client.ts` is one line:

```ts
export const authClient = createAuthClient();
```

That's a Svelte-flavoured Better Auth client which calls the same `/api/auth/*` endpoints handled above. It exposes `authClient.signIn.email(...)`, `authClient.signUp.email(...)`, `authClient.signOut()`, and a reactive session store.

## Demo User Mode

Public demos have a chicken-and-egg problem: visitors won't sign up, but anonymous routes can't show authenticated UX. The demo-user mode solves this without compromising real users.

- Setting `PUBLIC_DEMO_AUTH=true` (plus `PUBLIC_DEMO_USER_EMAIL` / `PUBLIC_DEMO_USER_PASSWORD`) makes the sign-in card render an extra "Try demo" button and surfaces the credentials on `/auth`.
- The `seed:demo-user` script (`scripts/seed-demo-user.mjs`) creates the user via `auth.api.signUpEmail(...)` so the password is hashed correctly. Run it once after the schema is applied: `bun run seed:demo-user`.
- `isDemoUser(event)` checks the public env flag **and** matches the case-insensitive email. `requireAuthAPI` consults it and throws `403` on writes — meaning the demo session can sign in, view protected pages, and read APIs, but cannot mutate data through `requireAuthAPI`-guarded endpoints.

This is enforced server-side. A clever client cannot bypass it; the demo account is genuinely read-only at the API layer.

## Graceful Degrade — "Auth Offline"

The whole library is built around the rule that demos must work without external services. Auth follows the same pattern:

- `isBetterAuthConfigured()` returns `false` if `DATABASE_URL` is missing or a placeholder (`isPlaceholderDatabaseUrl`), or if `BETTER_AUTH_SECRET` is unset / equal to the example placeholder, or if `BETTER_AUTH_URL` is missing.
- When that returns `false`, `hooks.server.ts` short-circuits before touching the database, so the app never crashes on a misconfigured Vercel preview.
- `event.locals.user` stays `null`. `requireAuth` will still redirect to `/auth/sign-in`, where the form replaces itself with an "Auth offline" panel listing the missing env vars.
- `AuthStatus.svelte` (the badge component this file lives next to) reads the same flag and renders one of two states:

  | State | Icon | Label | Background |
  |---|---|---|---|
  | Configured | 🔐 | "Auth Enabled" | `#f0fdf4` (light green) |
  | Offline | 🔓 | "Auth Offline" | `#f3f4f6` (grey) |

Visitors of an unconfigured deployment see every public component demo and a clear, actionable explanation of how to switch auth on.

## Security Notes

- **Server-only modules.** `auth.ts`, `betterAuth.ts`, and `dataSource.ts` live under `$lib/server/` so SvelteKit's bundler refuses to ship them to the browser. Never import them from a `+page.svelte` or a `.svelte` component.
- **Redirect-loop guard.** `requireAuth` only triggers when `event.locals.user?.id` is missing. The sign-in page itself does the inverse check — if a user is already signed in, it redirects to the supplied `redirect_url`. There is no path where both pages bounce to each other.
- **Open-redirect risk.** `redirect_url` is read straight from the query string and currently allows any path. If you fork this for a real product, validate it against an allow-list of internal paths before passing it to `redirect(303, ...)`.
- **Demo isolation.** `isDemoUser` is intentionally checked inside `requireAuthAPI` rather than the page-level `requireAuth`, so demo users can read but not write. Any new write endpoint must go through `requireAuthAPI` to inherit this protection.
- **Cookies.** Better Auth issues `httpOnly`, `sameSite=Lax` session cookies by default. `sveltekitCookies` ensures they're attached to SvelteKit's response and not lost between Better Auth's internal handler and the outgoing reply.

## State Flow Diagram

```
                 ┌────────────────────────┐
                 │  Visitor (no cookie)   │
                 └──────────┬─────────────┘
                            │ visits /dashboard
                            ▼
                ┌─────────────────────────┐
                │ (protected) layout.load │
                │   requireAuth(event)    │
                └──────────┬──────────────┘
                           │ no locals.user
                           ▼
       redirect 303 → /auth/sign-in?redirect_url=/dashboard
                           │
                           ▼
                ┌─────────────────────────┐
                │ /auth/sign-in form      │
                │ authClient.signIn.email │
                └──────────┬──────────────┘
                           │ 200 OK + Set-Cookie
                           ▼
                  invalidateAll()  →  goto(redirect_url)
                           │
                           ▼
                ┌─────────────────────────┐
                │ hooks.server.ts         │
                │ getSession(headers)     │
                │ → locals.user populated │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ /dashboard renders      │
                │ {authUser, isDemoUser}  │
                └──────────┬──────────────┘
                           │ user clicks "Sign out"
                           ▼
                authClient.signOut()  →  invalidateAll()
                           │ cookie cleared
                           ▼
                back to "Visitor (no cookie)"
```

## Props Reference

These pages are routes, not reusable components, so they don't take Svelte props — they receive their data from neighbouring `+page.server.ts` / `+layout.server.ts` files and read URL parameters from `event.url.searchParams`.

**`/auth` (`src/routes/auth/+page.svelte`)**

| Source | Key | Type | Description |
|---|---|---|---|
| `data` (from `+page.server.ts`) | `isConfigured` | `boolean` | Result of `isBetterAuthConfigured()` |
| `data` | `authUser` | `AuthUser \| null` | Current Better Auth user, normalised |
| `data` | `demoCredentials` | `{ email, password } \| null` | Set when `PUBLIC_DEMO_AUTH=true` |

**`/auth/sign-in/[...rest]` and `/auth/sign-up/[...rest]`**

| Source | Key | Type | Description |
|---|---|---|---|
| URL search param | `redirect_url` | `string` | Path to send the user to after success (default `/dashboard`) |
| `data` | `isConfigured` | `boolean` | Drives the "Auth offline" fallback panel |
| `data` | `redirectUrl` | `string` | Server-resolved redirect target |
| `data` | `demoCredentials` | `{ email, password } \| null` | Powers the "Try demo" shortcut |

**`/dashboard` and `/profile` (inside `(protected)`)**

| Source | Key | Type | Description |
|---|---|---|---|
| `data` (from `(protected)/+layout.server.ts`) | `userId` | `string` | The authenticated user's ID |
| `data` | `authUser` | `AuthUser \| null` | Normalised user object for display |
| `data` | `isDemoUser` | `boolean` | Renders the "Read-only Demo" badge |

**Sibling component — `AuthStatus.svelte`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isConfigured` | `boolean` | required | Whether Better Auth is active |
| `class` | `string` | `''` | Extra classes for layout glue |

## Edge Cases

| Situation | Behaviour |
|---|---|
| Auth not configured (no `DATABASE_URL` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL`) | `hooks.server.ts` skips the session lookup, `AuthStatus` shows "Auth Offline", sign-in form replaces itself with a config-help panel; protected routes still redirect to sign-in (which then explains the missing env vars). |
| Demo user attempts a write through `requireAuthAPI` | Returns `403 The public demo account is read-only`; reads still succeed. |
| Session expired between page loads | `auth.api.getSession` returns `null`, `locals.user` stays `null`, next protected request redirects to `/auth/sign-in?redirect_url=<current>`. |
| Already signed in and visiting `/auth/sign-in` | The sign-in load function detects `locals.user` and immediately redirects to `redirect_url` — no infinite bounce. |
| `redirect_url` query param missing | Defaults to `/dashboard` in both `requireAuth` (server) and the sign-in form (client). |
| Database transient failure during `getSession` | Caught in `hooks.server.ts`, logged, treated as "no session" — the request continues; protected routes redirect to sign-in rather than 500. |
| Better Auth REST call to `/api/auth/*` | `svelteKitHandler` intercepts before SvelteKit's router, so SvelteKit doesn't 404 these paths. |
| `PUBLIC_DEMO_AUTH` enabled but seed not run | The "Try demo" button submits, Better Auth returns "invalid credentials"; remedy is `bun run seed:demo-user`. |
| User signs out from `/profile` or `/auth` | `authClient.signOut()` clears the cookie, `invalidateAll()` re-runs loaders, `goto('/auth/sign-in')` lands them on the sign-in page. |

## Dependencies

- **`better-auth`** — core auth engine (sessions, password hashing, `/api/auth/*` route handlers).
- **`better-auth/svelte-kit`** — `sveltekitCookies` adapter and `svelteKitHandler` request hook.
- **`better-auth/svelte`** — `createAuthClient()` for the browser-side store.
- **`@neondatabase/serverless`** — `Pool` driver consumed by Better Auth's database adapter; same connection used by every other demo.
- **`$lib/server/dataSource`** — provides `isPlaceholderDatabaseUrl` so `isBetterAuthConfigured` can refuse half-set environments.
- **`$lib/server/auth`** — the `requireAuth`, `checkAuth`, `requireAuthAPI`, `isDemoUser`, `getSessionId`, `hasClaim` helpers.
- **`$env/dynamic/private`** — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- **`$env/dynamic/public`** — `PUBLIC_DEMO_AUTH`, `PUBLIC_DEMO_USER_EMAIL`, `PUBLIC_DEMO_USER_PASSWORD`.
- **`scripts/seed-demo-user.mjs`** — one-shot seeder that creates the demo account via Better Auth's own sign-up API so the password hash is correct.

## File Structure

```
src/
├── hooks.server.ts                                      # populates locals.user, runs svelteKitHandler
├── app.d.ts                                             # App.Locals { session, user } typings
├── lib/
│   ├── auth-client.ts                                   # createAuthClient() for the browser
│   ├── components/
│   │   ├── AuthStatus.svelte                            # configured / offline badge
│   │   └── AuthStatus.md                                # ← this file
│   └── server/
│       ├── auth.ts                                      # requireAuth, checkAuth, requireAuthAPI, isDemoUser
│       ├── betterAuth.ts                                # betterAuth() instance, isBetterAuthConfigured
│       └── dataSource.ts                                # isPlaceholderDatabaseUrl helper
└── routes/
    ├── auth/
    │   ├── +page.server.ts                              # loads isConfigured, authUser, demoCredentials
    │   ├── +page.svelte                                 # /auth overview (Auth Demo catalog entry)
    │   ├── sign-in/[...rest]/+page.{svelte,server.ts}   # email/password sign-in + Try demo
    │   └── sign-up/[...rest]/+page.{svelte,server.ts}   # email/password sign-up
    └── (protected)/
        ├── +layout.server.ts                            # requireAuth gate for the whole group
        ├── dashboard/+page.svelte                       # Dashboard catalog entry
        └── profile/+page.svelte                         # Profile catalog entry

database/
└── schema_better_auth.sql                               # user / session / account / verification tables

scripts/
└── seed-demo-user.mjs                                   # bun run seed:demo-user
```

---

*Maintain alongside `hooks.server.ts` and `$lib/server/auth.ts` — the three documents drift together.*
