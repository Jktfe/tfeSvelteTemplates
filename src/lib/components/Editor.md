# Editor — Technical Logic Explainer

## What Does It Do? (Plain English)

Editor is a CRUD modal — a focused, accessible form panel for creating new records or editing existing ones, wired through to a REST API and ultimately a Postgres table. It is the "admin interface" for ExpandingCard data, but the pattern generalises to any record with a heading, two text bodies, an image, and some metadata.

Think of it as a specialised data-entry slip. You hand it a blank slip (`mode='create'`) or a slip already filled in by somebody else (`mode='edit'` plus `initialData`). The user types, the form validates as they go, only nags about missing fields *after* they have touched them, and on submit it hands the data back to the parent through `onSave`. The parent is the one who decides whether to POST or PUT to `/editor/api`, which talks to `editorData.ts`, which talks to Neon — or, when `DATABASE_URL` is unset, falls back to in-memory constants so the demo still works.

This is not just a UI component. It is a small full-stack reference implementation: a modal, a REST surface, a server utility, a soft-delete schema, and a fallback path, all hanging together.

## How It Works (Pseudo-Code)

```
CLIENT (Editor.svelte) ─────────────────────────────────────────
  state:
    formData            = { ...initialData with sensible defaults }
    errors              = {}            // field → message
    touched             = {}            // field → was-blurred-or-typed-into
    saving              = false

  derive isValid          = errors has no keys
  derive visibleErrors    = errors filtered to keys with touched[key] === true

  on mount:
    snapshot previouslyFocused = document.activeElement
    body.style.overflow = 'hidden'      // lock page scroll
    rAF → focus first form field

  on input/blur:
    touched[field] = true
    re-run validateForm() via $effect (watches JSON.stringify(formData))

  on Submit clicked:
    mark all fields touched
    if !isValid: focus first invalid field; return
    saving = true
    onSave(formData)                    // hand off to parent
    // parent does the network call; component just closes

  on Cancel / Escape / backdrop click:
    onCancel()                          // parent flips its `open` to false

  on cleanup:
    body.style.overflow = previous
    previouslyFocused?.focus()

PARENT (typically a demo page) ──────────────────────────────────
  on Save:
    if mode === 'create': POST   /editor/api  with formData
    else:                 PUT    /editor/api  with { id, ...formData }
    on success: refresh list, close modal

API (/editor/api/+server.ts) ────────────────────────────────────
  GET    ?category=…  → loadEditorDataFromDatabase(category)
  POST   body         → validate required fields → createEditorData(body) → 201
  PUT    body+id      → updateEditorData(id, body) → 200 / 404
  DELETE ?id=…        → deleteEditorData(id) → 200 / 404
  errors: 400 (bad request), 404 (not found), 503 (no DB), 500 (everything else)

SERVER UTILITY (editorData.ts) ──────────────────────────────────
  load:   if !DATABASE_URL → return FALLBACK_EDITOR_DATA
          else SELECT … WHERE is_active = TRUE ORDER BY display_order
          map snake_case → camelCase
  create: throw if no DB; SELECT MAX(display_order)+1; INSERT RETURNING *
  update: throw if no DB; UPDATE … COALESCE(${field}, field) WHERE id = ?
  delete: throw if no DB; UPDATE SET is_active = FALSE  (soft delete)
  any error → log + return null/false/fallback (never crash the page)
```

## The Core Concept: The Touched/Validation Pattern

The "touched" pattern is the hinge that makes this form feel polite rather than aggressive. Three reactive primitives co-operate:

1. `errors` — derived from the current `formData`. Re-runs on every keystroke via a `$effect` that depends on `JSON.stringify(formData)`. This is the *truth* about what is wrong with the form.
2. `touched` — a record of which fields the user has actually engaged with. A field becomes touched on first input or blur, and stays touched.
3. `visibleErrors` — `$derived(Object.entries(errors).filter(([k]) => touched[k]))`. This is what the UI actually displays.

The result: open the modal in `create` mode and you see no red. Type into the heading and tab away — if it's empty, *now* it goes red. Submit prematurely and we mark every field touched in one go, exposing every problem at once and focusing the first invalid input. Browser-style validation, but warmer.

Validation rules:

| Field | Rules |
|-------|-------|
| `heading` | Required, ≤255 chars |
| `compactText` | Required |
| `expandedText` | Required |
| `imageSrc` | Required, valid URL |
| `imageAlt` | Required, ≤255 chars |
| `bgColor` | Optional, restricted to preset palette |
| `category` | Optional |

`isValid = $derived(Object.keys(errors).length === 0)` is what gates the Submit button — it disables until the form is truly clean, regardless of what is currently visible.

## Server-Side Data Flow

The Editor itself is dumb about transport. Everything network-facing lives in three layers underneath it.

**Layer 1 — REST API at `/editor/api/+server.ts`.** Standard SvelteKit `RequestHandler` exports for GET, POST, PUT, and DELETE. Each:

- Parses input (JSON body for POST/PUT; query string for GET/DELETE).
- Performs minimum-viable validation (required fields, ID present and numeric).
- Delegates to the server utility.
- Returns appropriate HTTP status: 200 (read/update OK), 201 (create OK), 400 (bad input), 404 (not found), 503 (`DATABASE_URL` not configured), 500 (anything else).
- Catches the specific "DATABASE_URL not configured" error from the utility and translates it into a 503 with a friendly message, so clients can distinguish "service down" from "your input is wrong".

**Layer 2 — server utility at `src/lib/server/editorData.ts`.** Four exported functions: `loadEditorDataFromDatabase`, `createEditorData`, `updateEditorData`, `deleteEditorData`. Each follows the same skeleton: read `DATABASE_URL`, branch to fallback if missing (read only) or throw if missing (writes), wrap the SQL in try/catch, transform `snake_case` columns to `camelCase` props on the way out. The update uses `COALESCE(${field}, field)` so callers can pass partial objects and the database keeps existing values for anything omitted.

**Layer 3 — schema at `database/schema_editor.sql`.** A single table, `editor_data`, with `id`, the user-facing columns, `display_order`, `is_active`, and `created_at`/`updated_at`. A trigger (`update_editor_data_updated_at`) keeps `updated_at` honest on every UPDATE. New items get `MAX(display_order) + 1` for their category — appending without manual ordering.

The contract between layers is the `EditorData` type (`src/lib/types.ts`) on the client side and `EditorDataRow` on the database side. The utility owns the transformation; nothing else needs to think in snake_case.

## Fallback Behaviour

The whole stack is built around the assumption that *the database may not exist*. This isn't an oversight — it's the demo principle. A new contributor clones the repo, runs `bun run dev`, and the Editor works immediately. Saves don't persist, but the form, the validation, the modal, the REST round-trip — all functional.

How the fallback decides:

- **Reads** (`loadEditorDataFromDatabase`): if `DATABASE_URL` is unset or matches a placeholder string, log a warning and return `FALLBACK_EDITOR_DATA` from `src/lib/constants.ts`. On any DB error, return the fallback rather than throw. Pages always render.
- **Writes** (`create`/`update`/`delete`): without a DB, *throw* a specific error. The API handler catches it and returns 503. The client surfaces this as a "Database not configured" message rather than silently pretending the write worked.
- **Component awareness**: the Editor takes a `usingDatabase` boolean prop. When false, it shows a yellow banner inside the modal: "Changes won't be saved — no database connected." Set by the page's `+page.server.ts` from `!!process.env.DATABASE_URL`.

The `dataSource.ts` utility (`src/lib/server/dataSource.ts`) provides typed helpers — `fromDatabase`, `fromFallback`, `fromDatabaseError`, `combineDataSources` — for pages that want a richer status object (e.g. the `DatabaseStatus` indicator at the top of the page). The Editor itself only needs the boolean.

## Focus Trapping

Because Editor is a modal, it must own focus while open. The implementation is the standard hand-rolled trap (same pattern as `Drawer`):

1. On mount, snapshot `document.activeElement` and lock body scroll.
2. `requestAnimationFrame` → focus the first form field.
3. While open, intercept `Tab` and `Shift+Tab` on the modal element. Find tabbables via `button, input, textarea, select, [tabindex]:not([tabindex="-1"])`. Wrap forwards from last → first, backwards from first → last.
4. `Escape` calls `onCancel()`, unless `saving === true` (don't let users abandon a write mid-flight).
5. On unmount, restore body overflow and focus the original element if it still exists.

When the user submits an invalid form, focus jumps to the first invalid input — the trap and the validation cooperate to make keyboard-only completion painless.

## State Flow Diagram

```
                ┌──────────────┐
                │  CLOSED      │  parent: open = false
                └──────┬───────┘
                       │ parent opens with mode + initialData
                       ▼
                ┌──────────────┐
                │  OPENING     │  formData = { ...initialData }
                │              │  errors = validateForm()
                │              │  touched = {}        (clean slate)
                │              │  body.overflow lock + focus first field
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │  EDITING     │  user types → touched[field]=true
                │              │  $effect re-runs validateForm()
                │              │  visibleErrors update
                └──────┬───────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
    [Cancel]       [Submit if      [Submit if    [Escape]
                    invalid]        valid]
        │              │              │              │
        │              │              │              │
        │              ▼              ▼              │
        │       mark all touched      saving = true  │
        │       focus first error     onSave(data)   │
        │              │              │              │
        │              ▼              ▼              │
        │         (stay open)   ┌─────────────┐      │
        │                       │ PARENT      │      │
        │                       │ POST/PUT to │      │
        │                       │ /editor/api │      │
        │                       └──────┬──────┘      │
        │                              │             │
        │                ┌─────────────┼─────────┐   │
        │                │             │         │   │
        │              2xx           4xx/5xx   503   │
        │              close         show toast  show│
        │                │           stay open  banner│
        ▼                ▼                            ▼
                ┌──────────────┐
                │  CLOSING     │  cleanup: restore body overflow,
                │              │           restore focus, onCancel?()
                └──────┬───────┘
                       ▼
                ┌──────────────┐
                │  CLOSED      │
                └──────────────┘

DATABASE BRANCH (server utility):
   request ─▶ DATABASE_URL set?
                │
        ┌───────┴────────┐
        │ yes            │ no
        ▼                ▼
    SQL query      read: return FALLBACK_DATA
    │              write: throw → API → 503
    ▼
    success?
    │
  ┌─┴──┐
  │ ok │ err
  ▼    ▼
 map   log + return fallback (read)
       log + return null    (write)
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'create' \| 'edit'` | `'create'` | Controls submit button label and which validation messaging applies. |
| `initialData` | `Partial<EditorData>` | `{}` | Pre-fills the form. In `edit` mode this should include `id` so the parent can route to PUT. |
| `usingDatabase` | `boolean` | `false` | When `false`, renders an in-modal warning that changes will not persist. Mirrors `!!process.env.DATABASE_URL` from the page loader. |
| `onSave` | `(data: EditorData) => void \| Promise<void>` | `undefined` | Fires on valid submit. Parent decides whether to POST or PUT. The Editor does not perform any network call itself. |
| `onCancel` | `() => void` | `undefined` | Fires on Escape, backdrop click, or Cancel button. Parent flips its `open` flag. |

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle focus, trapped inside the modal. |
| `Escape` | Cancels (unless `saving`). |
| `Enter` (in single-line input) | Advances to next field; submits on the final field. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `DATABASE_URL` not configured, user tries to create | API returns 503; UI shows "Database not configured" banner. No silent success. |
| `DATABASE_URL` set but Neon unreachable mid-write | Server utility catches the error, logs, returns `null`. API returns 500. Modal stays open, parent surfaces a toast. |
| User edits a record then somebody else deletes it before they save | PUT goes through, `UPDATE … WHERE id = ? AND is_active = TRUE` matches zero rows, returns null, API returns 404. Client should refresh the list and notify. |
| User submits with missing required fields | All fields marked touched at once; first invalid field is focused; Submit stays disabled until valid. |
| User refreshes the page after editing | Read path re-fetches via `+page.server.ts` → `loadEditorDataFromDatabase`. Persisted edits show; in-memory edits (no DB) are lost. Expected. |
| Two users editing the same record simultaneously | Last writer wins. The `COALESCE` partial-update means each PUT only overwrites the fields it sends, so non-overlapping edits coexist. Overlapping edits silently clobber. |
| Soft-deleted record referenced elsewhere | Reads filter `is_active = TRUE`, so it disappears from listings. The row remains in the table (audit trail, undelete possible). Hard delete is intentionally not exposed. |
| Image URL is reachable at submit time but goes 404 later | Editor only validates the URL *shape*, not its reachability. Display layer handles broken images. |
| `initialData.id` missing in `edit` mode | Parent's PUT will fail validation (400 from the API). Always pass `id` when editing. |
| Modal opens with no tabbable content (impossible in practice, but defensively) | Focus stays on the dialog container itself (`tabindex="-1"`); Escape still closes. |
| Server-side render | Mount effect short-circuits when `typeof document === 'undefined'`. No DOM access during SSR. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, `$props`. Validation is reactive via the `JSON.stringify(formData)` trick inside `$effect`.
- **`@neondatabase/serverless`** — the Neon HTTP driver, used in the server utility. Requires Node.js 20.x runtime (configured in `svelte.config.js`).
- **`$lib/server/dataSource`** — typed helpers for distinguishing database / fallback / error sources. Used by demo pages for the `DatabaseStatus` indicator.
- **Form sub-components** — `TextField`, `TextareaField`, `SelectField` from `$lib/components/`. These are the actual inputs; the Editor orchestrates them.
- **`$lib/types`** — `EditorData`, `EditorDataRow`, `EditorProps` interfaces. Component types are camelCase, database types are snake_case.

## File Structure

```
src/lib/components/Editor.svelte              # modal UI + validation + focus trap
src/lib/components/Editor.md                  # this file
src/lib/components/Editor.test.ts             # unit tests
src/lib/components/{TextField,TextareaField,SelectField}.svelte  # form atoms
src/lib/server/editorData.ts                  # CRUD server utility (reads + writes)
src/lib/server/dataSource.ts                  # typed source-status helpers
src/lib/constants.ts                          # FALLBACK_EDITOR_DATA
src/lib/types.ts                              # EditorData / EditorDataRow / EditorProps
src/routes/editor/+page.svelte                # demo page (list + open Editor)
src/routes/editor/+page.server.ts             # SSR load: folders + usingDatabase flag
src/routes/editor/api/+server.ts              # GET / POST / PUT / DELETE
database/schema_editor.sql                    # editor_data table + trigger + seed
```
