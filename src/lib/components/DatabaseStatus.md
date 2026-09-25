# DatabaseStatus - Technical Logic Explainer

## What Does It Do? (Plain English)

DatabaseStatus is a small pill-shaped badge that tells visitors where the data on the page came from: a live Neon database, the fallback constants shipped in code, fallback constants because the database errored, or data that is intentionally static. It is the visible half of the library's graceful-fallback pattern — pages keep working without a database, and this badge is honest about it.

**Think of it like:** a traffic light on the dashboard. Green means "live data", amber means "demo data", red means "the database was meant to answer but didn't", and grey means "this page never uses a database".

---

## How It Works (Pseudo-Code)

```
INPUTS:
  usingDatabase   (required boolean)
  source          (optional 'database' | 'fallback' | 'error' | 'static')
  message         (optional string)

DERIVED:
  status = source ?? (usingDatabase ? 'database' : 'fallback')

  statusClass = status == 'database' ? 'connected' : status

  icon, label = LOOKUP status:
    'database' → 🟢  "Database Connected"
    'fallback' → 🟡  "Demo Fixture Data"
    'error'    → 🔴  "Database Error - Demo Fixtures"
    'static'   → ⚪  "Static Demo Data"

RENDER:
  <div role="status" aria-live="polite" title={message}>
    <span aria-hidden="true">{icon}</span>
    <span>{label}</span>
  </div>
```

---

## The Core Concept: Reading a DataSourceResult

Server utilities in `src/lib/server/` return a `DataSourceResult<T>` built with `fromDatabase`, `fromFallback` or `fromDatabaseError` from `dataSource.ts`. Its fields map straight on to this badge's props:

```
  DataSourceResult<T>                  DatabaseStatus
  ─────────────────────                ───────────────
  source: 'database' | 'fallback'  ──▶ source
          | 'error' | 'static'
  usingDatabase: boolean           ──▶ usingDatabase
  message?: string                 ──▶ message   (shown as a hover tooltip)
```

`source` wins when supplied. `usingDatabase` alone can only express two states (database or fallback), so pass `source` whenever you want the error and static states to show.

### Recipe: wiring it to a server load

```typescript
// src/routes/example/+page.server.ts
import type { PageServerLoad } from './$types';
import { loadCardsWithSource } from '$lib/server/cards';

export const load: PageServerLoad = async () => {
	const result = await loadCardsWithSource();
	return {
		cards: result.data,
		source: result.source,
		usingDatabase: result.usingDatabase,
		message: result.message
	};
};
```

```svelte
<!-- src/routes/example/+page.svelte -->
<script lang="ts">
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	let { data } = $props();
</script>

<DatabaseStatus usingDatabase={data.usingDatabase} source={data.source} message={data.message} />
```

---

## Visual States

| Status | Class | Icon | Label | Light palette |
|--------|-------|------|-------|---------------|
| `database` | `.connected` | 🟢 | Database Connected | `#f0fdf4` background, `#166534` text |
| `fallback` | `.fallback` | 🟡 | Demo Fixture Data | `#fefce8` background, `#854d0e` text |
| `error` | `.error` | 🔴 | Database Error - Demo Fixtures | `#fef2f2` background, `#991b1b` text |
| `static` | `.static` | ⚪ | Static Demo Data | `#f8fafc` background, `#475569` text |

Under `prefers-color-scheme: dark` the same four hues switch to translucent rgba tints so the pill sits on dark chrome without glaring. Below 640px the pill shrinks its font, padding and icon.

---

## State Flow Diagram

```
                       ┌──────────────────────┐
                       │  source prop given?  │
                       └──────────┬───────────┘
                  yes ◀───────────┴───────────▶ no
                   │                             │
                   ▼                             ▼
      ┌────────────────────────┐    ┌────────────────────────┐
      │  status = source       │    │  usingDatabase ?       │
      └──┬──────┬──────┬───────┘    └──────┬──────────┬──────┘
         │      │      │      │       true │          │ false
         ▼      ▼      ▼      ▼            ▼          ▼
   [CONNECTED][FALLBACK][ERROR][STATIC] [CONNECTED] [FALLBACK]
      🟢         🟡       🔴      ⚪        🟢          🟡

   Prop change → $derived recomputes → live region announces the new label
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `usingDatabase` | `boolean` | — (required) | Whether live database data is in use; used when `source` is omitted. |
| `source` | `'database' \| 'fallback' \| 'error' \| 'static'` | — | Explicit data-source status; takes precedence over `usingDatabase`. |
| `message` | `string` | `''` | Extra detail (for example the error message) shown as the badge's `title` tooltip. |
| `class` | `string` | `''` | Extra classes on the badge. |

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `source` and `usingDatabase` disagree | `source` wins — the badge shows what the server says happened. |
| Only `usingDatabase` supplied | Only the connected and fallback states are reachable. |
| `message` is empty | No tooltip text is shown. |
| Status changes after hydration | `role="status"` with `aria-live="polite"` announces the new label without stealing focus. |
| Screen reader users | The emoji is `aria-hidden`, so only the text label is read. |
| Dark colour scheme | The palette switches to low-saturation tints via `prefers-color-scheme: dark`. |
| Narrow viewport (≤ 640px) | Font, padding and icon scale down. |

---

## Dependencies

- Zero external dependencies — pure Svelte 5 (`$props`, `$derived`) and scoped CSS; icons are emoji.
- Pairs with `src/lib/server/dataSource.ts`, but does not import it — any boolean or status string works.

---

## File Structure

```
src/lib/components/DatabaseStatus.svelte     # implementation
src/lib/components/DatabaseStatus.md         # this file (rendered inside ComponentPageShell)
src/lib/server/dataSource.ts                 # DataSourceResult helpers that feed the props
src/routes/editor/+page.svelte               # one of several demo pages that mount the badge
```
