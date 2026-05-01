# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Svelte MCP server (use first for Svelte work)

You have access to the Svelte MCP server. Use it for any Svelte/SvelteKit question before answering from memory.

### `list-sections`
Use FIRST to discover available documentation sections — returns titles, use_cases, and paths. **Always call this at the start of a Svelte-related task.**

### `get-documentation`
Retrieves full content for one or more sections. After `list-sections`, analyse the `use_cases` field and fetch every section relevant to the task.

### `svelte-autofixer`
Analyses Svelte code and returns issues/suggestions. **Use this on every piece of Svelte code before sending it to the user.** Keep calling until it returns no issues.

## Project purpose

TFE Svelte Templates is a collection of production-ready Svelte 5 component templates. Each component is designed to be **copy-paste ready** with extensive inline comments, full TypeScript types, and zero or minimal dependencies. The site itself doubles as an editorial showcase application built on a shared `ComponentPageShell`.

Additional reading:
- `README.md` — public-facing showcase tour and quick start
- `tfeSvelteTemplatesLogic.md` — design rationale and roadmap
- `docs/THEMING.md` — project-wide theming convention (read before adding theme tokens)
- `docs/DATAGRID_FORMATTING.md` — DataGrid cell formatter conventions
- `docs/OVERNIGHT_COMPONENT_FACTORY.md` — bulk-component-generation workflow
- `docs/motion package considerations.md` — when to reach for `@humanspeak/svelte-motion`
- Each component has a sibling `[Name].md` next to its `.svelte` file describing props, usage, and gotchas. **Read it before modifying the component.**

## Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | SvelteKit + Svelte 5 | Runes only (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) |
| Language | TypeScript | All props typed; shared interfaces in `src/lib/types.ts` |
| Styling | Scoped CSS + Tailwind + `tailwind-merge` | Component-level scoped CSS; Tailwind for layout/utilities |
| Animation | `@humanspeak/svelte-motion`, `gsap`, `animejs` | Pick the lightest tool that does the job; many components are pure CSS |
| 3D / charts | `three`, `layerchart`, `@unovis/svelte` | Only where genuinely required |
| Database | Neon (Postgres) via `@neondatabase/serverless` | Optional — fallback constants always available |
| Auth | **Better Auth** via `better-auth` + `better-auth/svelte` | Optional; graceful "Auth Offline" mode without env |
| Sanitisation / markdown | `isomorphic-dompurify`, `marked`, `highlight.js` | |
| Search | `fuse.js` | |
| Interaction | `@panzoom/panzoom` | Pan/zoom for diagrams/maps |
| Analytics | `@vercel/analytics` | |
| Deployment | Vercel | `@sveltejs/adapter-vercel`, Node 20.x runtime (Neon driver requirement) |
| Test | Vitest + `@testing-library/svelte`; Playwright for E2E | |
| Package manager | bun | |

## Development commands

```bash
bun run dev              # dev server with HMR
bun run build            # production build
bun run preview          # preview production build locally
bun run check            # svelte-kit sync + svelte-check (run before commits)
bun run check:watch      # type checking in watch mode
bun run lint             # eslint
bun run lint:fix         # eslint --fix
bun run code-qa          # lint + check + test (full pre-PR gate)

bun run test             # vitest (one-shot)
bun run test:watch       # vitest in watch mode
bun run test:ui          # visual test runner
bun run test:coverage    # coverage report

bun run test:e2e         # playwright
bun run test:e2e:ui      # playwright UI mode
bun run test:e2e:headed  # playwright headed mode

bun run seed:demo-user   # seed the local read-only demo user (requires DATABASE_URL + Better Auth env)
```

## Architecture

### 1. Component self-containment
Every file in `src/lib/components/` is designed to be copied to another project unmodified:
- All styles in scoped `<style>` tags — no external CSS dependencies
- Props fully typed via interfaces in `src/lib/types.ts`
- JSDoc comments explain non-obvious logic
- Minimal external dependencies (or zero)

### 2. Data source with graceful fallback (cross-cutting)

Data loading uses a typed result wrapper from `src/lib/server/dataSource.ts`:

```typescript
interface DataSourceResult<T> {
  data: T;
  source: 'database' | 'fallback' | 'error' | 'static';
  usingDatabase: boolean;
  databaseConfigured: boolean;
  message?: string;
}
```

Helpers:

| Helper | Purpose |
|---|---|
| `isPlaceholderDatabaseUrl(url)` | Detects the `.env.example` template URL — treated as **unconfigured** |
| `getConfiguredDatabaseUrl()` | Returns the real `DATABASE_URL`, or `undefined` if missing/placeholder |
| `isDatabaseConfigured()` | Boolean shortcut |
| `fromDatabase(data)` / `fromFallback(data, msg?)` / `fromDatabaseError(data, err)` | Build a `DataSourceResult<T>` with the right status |

Server utilities under `src/lib/server/` follow this shape:

```typescript
export async function loadXFromDatabase(): Promise<DataSourceResult<X[]>> {
  const databaseUrl = getConfiguredDatabaseUrl();
  if (!databaseUrl) return fromFallback(FALLBACK_X);

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT * FROM table WHERE is_active = TRUE`;
    return fromDatabase(rows.map(rowToCamelCase));   // snake_case → camelCase at boundary
  } catch (err) {
    console.error('Error loading X:', err);
    return fromDatabaseError(FALLBACK_X, err);
  }
}
```

`DatabaseStatus.svelte` reads the result and shows users which mode the page is in.

### 3. Type consistency
- Component prop interfaces (camelCase): `Card`, `Testimonial`, `EditorData`, `Employee`, `AuthUser`, etc.
- Database row interfaces (snake_case): `CardRow`, `EditorDataRow`, `EmployeeRow`, etc.
- Component prop shapes: `CardStackProps`, `MarqueeProps`, `ComponentPageShellProps`, etc.
- Server utilities transform snake_case → camelCase at the data-layer boundary.

### 4. Component variants demonstrate progressive enhancement
Multiple implementations of the same idea show different trade-offs — e.g. `CardStack` (interactive selection) vs `CardStackMotionFlip` (FLIP + 3D + 4-direction swipe), `Marquee` (static) vs `MarqueeDraggable`, `DataGridBasic` (~10KB, zero-dep) vs `DataGridAdvanced` (SVAR Grid wrapper, ~155KB, virtual scrolling, inline edit).

## Auth (Better Auth)

Auth replaced an earlier Clerk integration. **Do not reintroduce `svelte-clerk` or `useClerkContext`** — they are gone.

### Files

| Path | Role |
|---|---|
| `src/lib/server/betterAuth.ts` | The Better Auth instance (Neon `Pool` + `sveltekitCookies` plugin) |
| `src/lib/server/auth.ts` | Server helpers (`requireAuth`, `checkAuth`, `requireAuthAPI`, `isDemoUser`, `hasClaim`, `getSessionId`) |
| `src/lib/auth-client.ts` | Browser client — exports `authClient` from `better-auth/svelte` |
| `src/hooks.server.ts` | Populates `event.locals.session` / `event.locals.user`, calls `svelteKitHandler` |
| `src/app.d.ts` | `App.Locals` declares `session: Session \| null`, `user: User \| null` from `better-auth` |
| `src/routes/+layout.server.ts` | Returns `{ isAuthConfigured, authUser }` to every page |
| `src/routes/(protected)/+layout.server.ts` | Calls `requireAuth` to gate the route group |
| `database/schema_better_auth.sql` | Auth tables (regen via `bunx @better-auth/cli@latest generate --config src/lib/server/betterAuth.ts --output database/schema_better_auth.sql -y`) |

### Server helpers

| Helper | Behaviour |
|---|---|
| `requireAuth(event, redirectUrl?)` | Redirects to `/auth/sign-in?redirect_url=...` if unauthenticated; returns `userId` |
| `checkAuth(event)` | Returns `{ authenticated, userId }` without redirecting |
| `requireAuthAPI(event)` | Throws 401 from API endpoints if unauthenticated; **also throws 403 for demo users** |
| `isDemoUser(event)` | True when `PUBLIC_DEMO_AUTH=true` and the signed-in email matches `PUBLIC_DEMO_USER_EMAIL` |
| `hasClaim(event, claim, value?)` | Role/permission check on `locals.user` |

### Client usage

```svelte
<script lang="ts">
  import { authClient } from '$lib/auth-client';
  // authClient.signIn.email({...}), authClient.signOut(), authClient.useSession(), etc.
</script>
```

### Demo mode (read-only public account)
- `bun run seed:demo-user` creates a local demo user (defaults: `tester@test.com` / `test1`)
- `PUBLIC_DEMO_AUTH=true` exposes the credentials on the sign-in page (for hosted OSS demos only)
- `requireAuthAPI` blocks writes from the demo user with **403 "The public demo account is read-only"** — preserve this behaviour when adding write endpoints

### Graceful degrade
`isBetterAuthConfigured()` returns false unless `DATABASE_URL` is real (not the placeholder), `BETTER_AUTH_SECRET` is set (not the placeholder), and `BETTER_AUTH_URL` is set. When false, `hooks.server.ts` skips Better Auth entirely — the app still runs, auth pages show "Auth Offline".

## Editorial scaffolding (`ComponentPageShell`)

Every component demo page wraps content in `ComponentPageShell.svelte`, which renders the canonical layout (breadcrumbs / Anton title / Plex lede / Live Demo / Implementation / Installation / Dependencies / Agent Instructions / Resources / Tags). Pages opt into sections via Svelte snippets — anything you don't pass is omitted. The anatomy is defined in `tfeconcepts.pen` (a Pencil design file).

Related files:
- `src/lib/componentCatalog.ts` — typed catalog metadata (`ComponentCatalogItem` with name/href/icon/screenshot/themeSupport/source/docs/demo/dependencies/relatedFiles/usage/agentHint), grouped by `ComponentCatalogCategory`
- `src/lib/components/ComponentDirectory.svelte` — listing/grid driven by the catalog
- `src/lib/components/AgentPromptCopy.svelte` — "copy prompt for your agent" UI block on each page
- `src/lib/components/BadgeProvenance.svelte` — provenance/source markers
- `src/lib/registry/gsap-suite.ts` — GSAP showcase registry

When you add a new component, register it in `componentCatalog.ts` so it appears in directories and home-page shelves.

## File layout (current)

```
src/
├── lib/
│   ├── components/         # 143 .svelte files + sibling .md docs + .test.ts (some *TestHarness.test.svelte)
│   ├── server/             # auth, betterAuth, dataSource, cards, dataGrid, editorData,
│   │                       # expandingCards, linkPreviews, testimonials, sankeyData,
│   │                       # calendarData, folderFiles, maps
│   ├── data/storyboards/   # ExplainerCanvas data per component
│   ├── registry/           # Editorial registries (gsap-suite, ...)
│   ├── gsap/               # GSAP utilities
│   ├── styles/             # Shared tokens / theme CSS
│   ├── auth-client.ts      # Better Auth browser client
│   ├── componentCatalog.ts # Typed catalog metadata for the showcase
│   ├── constants.ts        # FALLBACK_* data for every component
│   ├── tokenize.ts         # highlight.js wrapper for code blocks
│   ├── toast.svelte.ts     # Module-level $state toast bus (Svelte 5 module-state pattern)
│   ├── dataGridFormatters.ts
│   ├── formUtils.ts
│   ├── gsapMotion.ts
│   ├── htmlUtils.ts
│   ├── mapUtils.ts
│   ├── scrollLock.ts
│   ├── browser.ts
│   ├── types.ts
│   └── utils.ts            # cn (clsx + tailwind-merge), sanitiseHTML
├── routes/                 # ~112 demo routes
│   ├── (protected)/        # Auth-required (dashboard, profile)
│   ├── auth/               # sign-in, sign-up, account
│   ├── api/                # REST endpoints
│   ├── storyboard/[component]/  # Dynamic ExplainerCanvas per component
│   └── <component>/        # Per-component demo (uses ComponentPageShell)
├── hooks.server.ts         # Better Auth middleware
├── app.d.ts                # App.Locals (Session | null, User | null)
└── app.html

database/                   # schema.sql, schema_v2.sql, schema_editor.sql,
                            # schema_datagrid.sql, schema_better_auth.sql,
                            # schema_calendar.sql, schema_folderfiles.sql,
                            # schema_maps.sql, seed_more_employees.sql

docs/                       # THEMING.md, DATAGRID_FORMATTING.md,
                            # OVERNIGHT_COMPONENT_FACTORY.md,
                            # motion package considerations.md, ComponentTracker.csv
```

## Adding a new component

1. Create `src/lib/components/ComponentName.svelte` with the documentation header (see "Documentation header")
2. Add prop interface to `src/lib/types.ts`
3. Add fallback data to `src/lib/constants.ts` (if data-driven)
4. Add server utility to `src/lib/server/` returning `DataSourceResult<T>` (if DB-backed)
5. Add a schema file under `database/` (if needed) using the established conventions: `id SERIAL`, `display_order`, `is_active`, `created_at`/`updated_at` triggers
6. Create `src/lib/components/ComponentName.md` (sibling docs)
7. Create `src/lib/components/ComponentName.test.ts` (or a `ComponentNameTestHarness.test.svelte` if the component needs DOM mounting)
8. Create demo at `src/routes/componentname/+page.svelte`, wrapping content in `<ComponentPageShell>` snippets
9. Register in `src/lib/componentCatalog.ts` so it shows up in directories and shelves
10. Add storyboard data at `src/lib/data/storyboards/componentname.ts` (used by `/storyboard/[component]`)

## Conventions

### Naming
- Component files: PascalCase (`CardStack.svelte`)
- Route folders: lowercase (`cardstack/`)
- Variant suffixes describe the variant (`CardStackMotionFlip`, `MarqueeDraggable`)

### Svelte 5
- Runes only — `$state`, `$derived`, `$effect`, `$props`, `$bindable`
- Snippets for render-prop / children patterns
- Typed props using `interface Props` + `let { ... }: Props = $props()`
- Module-level `$state` (e.g. `toast.svelte.ts`) is the canonical "global store" pattern — no Svelte stores

### Styling
- Scoped `<style>` for components — keeps them portable
- Tailwind for page-level layout/utilities only
- `cn()` from `$lib/utils` (clsx + tailwind-merge) for conditional class composition
- CSS custom properties for theming — see `docs/THEMING.md` for the project-wide convention
- **No external component CSS files** (would break copy-paste portability)
- **No icon libraries (e.g. `lucide-svelte`)** — use inline SVG or CSS

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Escape, arrows where appropriate)
- Visible focus indicators
- Honour `prefers-reduced-motion`

### Documentation header (required for every component)
```svelte
<!--
  ===========================================================
  [COMPONENT NAME]
  ===========================================================
  WHAT — one sentence, plain English
  WHY  — when to reach for this (optional, useful for shells/wrappers)
  FEATURES — bullets
  ACCESSIBILITY — keyboard, screen readers, motion
  DEPENDENCIES — zero, or named with reason
  PERFORMANCE — dataset/animation considerations
  USAGE — minimal example
  PROPS — | Prop | Type | Default | Description |
  ===========================================================
-->
```

### Native vs external library
- **Build native** unless: it would take >40h, requires ongoing security updates (auth, sanitisation), is a well-maintained industry standard <200KB, or has no native equivalent.
- **Currently justified externals**: Leaflet (maps), Better Auth (auth), Unovis & layerchart (charts), SVAR Grid (DataGridAdvanced), `isomorphic-dompurify` (sanitisation), GSAP/animejs/`@humanspeak/svelte-motion` (animation), Three (3D), `@panzoom/panzoom`, `marked` + `highlight.js`, `fuse.js`.

### Comment style — "clear and warm"
Explain the *why*, not the *what*. Friendly tone over jargon. Comments should help a reader understand non-obvious decisions, not narrate the obvious.

### UK English in user-facing text
honour, colour, organisation, etc.

### Source-file hygiene
Per `docs:` convention upstream — **do not add author / RFO / self-attestation markers** to shipped source. Provenance lives in `BadgeProvenance` metadata and the catalog, not inline comments.

### Component documentation (sibling `.md` files)

Every component has a sibling `<Name>.md` that is **rendered live** inside `ComponentPageShell` as the "Logic explainer" section (between Implementation and API). The pipeline:

```
src/lib/components/<Name>.md
   ↓ import.meta.glob('?raw', eager)   src/lib/componentDocs.ts
   ↓ getDocsHtmlForPath(item.docs)     src/lib/componentCatalog.ts → shellPropsFromCatalog
   ↓ renderMarkdown(raw, { stripFirstH1: true })   src/lib/utils/markdown.ts
   ↓ docsHtml prop                     ComponentPageShell.svelte
   ↓ {@html} inside .cp-explainer
```

Authoring a doc:

1. Copy `docs/COMPONENT_DOC_TEMPLATE.md` to the component's sibling path, rename, and fill in.
2. **No YAML front-matter, no author/timestamp footer.** SpeedDial.md is the canonical example.
3. Required H2 sections, in this order: `## What Does It Do? (Plain English)`, `## How It Works (Pseudo-Code)`, *(2–3 deep-dive sections)*, `## State Flow Diagram`, `## Props Reference`, `## Edge Cases`, `## Dependencies`, `## File Structure`. Pick deep-dive headings from the template's offered list.
4. Pinned section strings are enforced by `src/lib/componentDocs.test.ts` for components in the `GOLD_STANDARD_DOCS` array. Add new components to that array as they reach standard; don't rename pinned strings.
5. The host page already shows an H1 for the component name — the pipeline strips the `.md`'s leading H1 automatically.

## Database setup (optional, but required for auth and write flows)

1. Create a Neon project at neon.tech
2. Run the relevant `database/schema*.sql` files in the SQL editor (component schemas + `schema_better_auth.sql` if you want auth)
3. Add `DATABASE_URL=postgresql://...?sslmode=require` to `.env`
4. Restart the dev server

`@neondatabase/serverless` requires Node 20+ — already configured in `svelte.config.js` (`runtime: 'nodejs20.x'`).

## Better Auth setup (optional)

1. Add to `.env` (see `.env.example`):
   ```
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   BETTER_AUTH_URL=http://localhost:5173
   ```
2. Run `database/schema_better_auth.sql` in your Neon SQL editor — or regenerate it with:
   ```
   bunx @better-auth/cli@latest generate --config src/lib/server/betterAuth.ts --output database/schema_better_auth.sql -y
   ```
3. Optionally `bun run seed:demo-user` to create the local demo account
4. Restart the dev server. Without Better Auth env, pages still render — auth UI shows "Auth Offline".

## Known safe-to-ignore warnings

### `svelte-check` CSS unused selectors (most in `Editor.svelte`, some in `CardStackMotionFlip.svelte`)
These selectors target dynamically rendered or runtime-toggled elements that Svelte's static analysis can't see. The CSS is genuinely used at runtime. **Do not remove these styles to silence the warnings** — they're false positives.

### Runtime: `Avoid using history.pushState(...)` warning
Emitted by third-party libraries (Leaflet, Unovis, SVAR Grid, GSAP/svelte-motion) using the History API for **internal state** (zoom, viewport, etc.), not routing. SvelteKit warns preventatively but no actual conflict occurs. The libraries are bundled, so this can't be fixed from our code. Routing works correctly.

### `bun run check` route-file errors
A handful of route-level type errors are false positives related to generated `$types`. Run `bun run check` to see; verify against `bun run build` (the source of truth — should be clean).

## Quality gates

| Check | Expected |
|---|---|
| `bun run build` | Zero errors, zero warnings |
| `bun run check` | Zero errors (CSS warnings documented above) |
| `bun run lint` | Zero errors |
| `bun run test` | All passing |

`bun run code-qa` runs the first three together — use it before opening a PR.

## Testing

- Co-locate tests with components: `ComponentName.svelte` + `ComponentName.test.ts`
- For DOM-mounted components, use the harness pattern: `ComponentNameTestHarness.test.svelte`
- Use `@testing-library/svelte` + `userEvent` for interaction tests
- `bun run test:ui` opens the visual debugger
- E2E in `tests/`; `bun run test:e2e` for headless, `bun run test:e2e:ui` for interactive

## Storyboards

Each component has an interactive storyboard at `/storyboard/[component]`. Data lives in `src/lib/data/storyboards/[component].ts` and is loaded dynamically by the route. The standard sections (Overview / Visual Guide / Props / Code Examples / Accessibility / Tips) are followed across storyboards — copy an existing file when adding a new one.

## Troubleshooting

**"DATABASE_URL not configured" warning** — expected without Neon setup. Pages fall back to constants. Set `DATABASE_URL` in `.env` to silence.

**"Auth Offline" on `/auth/*` pages** — `isBetterAuthConfigured()` is false. Check that `DATABASE_URL` is not the placeholder, `BETTER_AUTH_SECRET` is set to a real value, and `BETTER_AUTH_URL` is set.

**Build error referencing `@neondatabase/serverless`** — verify `svelte.config.js` has `runtime: 'nodejs20.x'` and Node 20+ locally.

**Component not displaying** — check the page-level `data` prop, browser console, and that any image URLs resolve. If the page wraps in `ComponentPageShell`, confirm the snippets are named correctly.

## Important rules

- **Do not reintroduce Clerk** — auth is Better Auth. `requireAuth`/`checkAuth`/`requireAuthAPI` are the integration surface.
- **Use `dataSource.ts` helpers** — new server utilities should return `DataSourceResult<T>` via `fromDatabase` / `fromFallback` / `fromDatabaseError`. Don't roll your own status flag.
- **Don't install additional animation libraries** without weighing portability impact (see Native vs external library).
- **Keep components self-contained** — they must work when copied to another project.
- **Document the why**, not the what. No author/RFO/self-attestation markers in source.
- **Maintain type safety** — every prop, every server utility, every shared shape.
- **Test without database** — fallback paths must work.
- **UK English** in user-facing text.
- **No icon libraries** — inline SVG or CSS only.
- **Register new components in `componentCatalog.ts`** so they show up in directories.
- **Wrap demo pages in `ComponentPageShell`** to keep the editorial layout consistent.
