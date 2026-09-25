# DataGridAdvanced — Technical Logic Explainer

## What Does It Do? (Plain English)

DataGridAdvanced is the heavy-duty sibling of DataGridBasic. It wraps SVAR Grid to give you a spreadsheet-like table that stays smooth with thousands of rows, lets people double-click a cell to edit it, select several rows to delete, search everything at once and download what they see as a CSV.

Crucially, it doesn't know or care where your data lives. When someone edits a cell it calls your `onCellEdit`; when they delete rows it calls your `onDelete`. If your callback throws, the grid quietly puts the old value back and tells the user why.

**Think of it like:** a very good receptionist. They take the change request, update the whiteboard straight away so everyone sees it, and phone head office. If head office says no, they rub it out and put the old value back.

---

## How It Works (Pseudo-Code)

```
props → state:
  rows          = writable $derived copy of `data` (re-syncs when the parent passes new data)
  columns       = `columns` prop ?? inferColumns(rows[0])
  visibleRows   = rows matching searchQuery (raw OR formatted value, any column)
  gridRows      = visibleRows with ISO date strings turned into Date objects
  gridColumns   = columns mapped to SVAR's format (editor, options, template, sort)

on SVAR "update-cell" { id, column, value }:
  coerced = coerce(value)           # number → Number('1,250' → 1250), date → Date, select → must be an option
  if invalid:
    rows = [...rows]                # re-feed untouched data → SVAR repaints the old value
    show error, call onError
    stop
  previous = row[column]
  row[column] = coerced             # optimistic
  if onCellEdit:
    try:
      patch = await onCellEdit({ id, column, value: coerced, previousValue: previous, row })
      if patch: merge patch into row  # server has the last word
      show "Saved <column>."
    catch error:
      row[column] = previous         # rollback
      show "Couldn't save <column>: <message>", call onError

on SVAR "select-row":
  selectedIds = grid.getState().selectedRows
  onSelectionChange(selectedIds)

on Delete selected (only rendered when onDelete is supplied):
  if not await confirmDelete(count): stop
  try:
    await onDelete(ids)
    tell SVAR to drop those rows, then filter them out of `rows`
  catch: keep rows, show error, call onError

on Export CSV:
  build header + visibleRows (dates as yyyy-mm-dd) → Blob → temporary <a download>
```

---

## The Core Concept: Callback-Driven Persistence

Earlier versions of this component hard-coded `fetch('/datagrid/api')` and a map of employee fields. That made it impossible to copy into another project. Now the component owns only **UI state**; persistence is a contract expressed in types:

```ts
interface DataGridCellEdit<T> {
  id: DataGridRowId;       // string | number
  column: string;          // the row key that changed
  value: unknown;          // already coerced to the column type
  previousValue: unknown;  // what a rollback restores
  row: T;                  // the row after the edit
}

onCellEdit?: (edit: DataGridCellEdit<T>) => void | Partial<T> | Promise<void | Partial<T>>;
onDelete?:   (ids: DataGridRowId[]) => void | Promise<void>;
```

The rules are deliberately small:

| Your callback… | The grid… |
|---|---|
| returns / resolves nothing | Keeps the optimistic value and shows "Saved". |
| resolves a partial row | Merges it in (e.g. a server-normalised email or new `updatedAt`). |
| throws / rejects | Restores the previous value and shows your error message. |
| isn't provided | Edits stay local — handy for prototypes and in-memory demos. |

The demo route shows the real-world version: `/datagrid/+page.svelte` turns `onCellEdit` into `PUT /datagrid/api`, and maps an HTTP **403** to "The public demo account is read-only — changes were not saved." so the grid rolls back with a friendly message.

---

## Recipes

**Persist to a REST endpoint and surface server validation**

```svelte
<script lang="ts">
  import DataGridAdvanced from '$lib/components/DataGridAdvanced.svelte';
  import type { DataGridCellEdit } from '$lib/types';

  type Order = { id: number; customer: string; total: number; status: string };
  let { data } = $props();

  async function save({ id, column, value }: DataGridCellEdit<Order>) {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [column]: value })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Save failed');  // → rollback + message
    return body.order as Partial<Order>;                         // → merged into the row
  }
</script>

<DataGridAdvanced data={data.orders} editable onCellEdit={save} />
```

**Select options that are validated before your callback runs**

```ts
const columns: DataGridColumn[] = [
  { id: 'status', header: 'Status', type: 'select', options: ['open', 'shipped', 'cancelled'] }
];
```

**A custom confirmation instead of `window.confirm`**

```svelte
<DataGridAdvanced
  data={rows}
  selectable
  onDelete={remove}
  confirmDelete={(n) => myDialog.ask(`Remove ${n} rows?`)}
/>
```

---

## Theming

The grid body is styled by SVAR's **Willow** / **WillowDark** skins. `theme="auto"` (the default) follows `prefers-color-scheme` and updates live when the OS setting changes.

The search bar, action buttons and status line are ours, tokenised per `docs/THEMING.md`. Because the skin is chosen by a prop rather than purely by a media query, the chrome flips on the wrapper's `data-scheme` attribute — so `theme="willow"` on a dark OS keeps everything light and consistent.

| Property | Light | Dark | Used by |
|---|---|---|---|
| `--dga-surface` | `#f9fafb` | `#1f2937` | Search bar background |
| `--dga-input-bg` | `#ffffff` | `#111827` | Search input |
| `--dga-border` / `--dga-input-border` | `#e5e7eb` / `#d1d5db` | `#374151` / `#4b5563` | Frames |
| `--dga-fg` / `--dga-muted` / `--dga-placeholder` | slate / grey / light grey | light / grey / dim grey | Text |
| `--dga-chip-bg` / `--dga-chip-bg-hover` | `#e5e7eb` / `#d1d5db` | `#374151` / `#4b5563` | Clear-search button |
| `--dga-accent` *(brand)* | `#146ef5` | *unchanged* | Export button, focus rings, spinner |
| `--dga-danger` *(semantic)* | `#dc2626` | *unchanged* | Delete button |
| `--dga-success` / `--dga-error` *(semantic)* | green / red | lightened for contrast on dark | Status line |

---

## State Flow Diagram

```
                 ┌───────────────┐
                 │     idle      │◀──────────────────────────────┐
                 └──────┬────────┘                               │
        double-click    │   click / Ctrl / Shift          Delete selected
        + commit        │   (select-row)                   (onDelete given)
             ▼          ▼                                        │
      ┌────────────┐  selectedIds updated ─▶ onSelectionChange   │
      │  coerce    │                                             ▼
      └──┬─────┬───┘                                   confirmDelete(count)
   invalid│     │valid                                   no │        │ yes
         ▼      ▼                                           ▼        ▼
  repaint old  optimistic value shown                     idle   ┌──────────┐
  + error      │                                                 │ deleting │ aria-busy
               ▼                                                 └──┬────┬──┘
        ┌──────────────┐ aria-busy                          resolve │    │ reject
        │   saving     │                                          ▼    ▼
        └──┬────────┬──┘                                  rows removed  rows kept
   resolve │        │ reject                              "Deleted n"   error + onError
           ▼        ▼
     merge patch   restore previous value
     "Saved …"     error + onError
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` (`T extends DataGridRow`) | `[]` | Rows of any shape; include an `id` for editing, selection and deletion. |
| `columns` | `DataGridColumn[]` | inferred | Column definitions; inferred from the first row when omitted. |
| `editable` | `boolean` | `false` | Double-click a cell to edit; a column's `editable: false` opts it out. |
| `selectable` | `boolean` | `false` | Multi-row selection (Ctrl-click toggles, Shift-click selects a range). |
| `exportable` | `boolean` | `false` | Show the Export CSV button. |
| `searchable` | `boolean` | `true` | Show the global search box. |
| `theme` | `'willow' \| 'willowDark' \| 'auto'` | `'auto'` | SVAR skin; `'auto'` follows the OS colour scheme. |
| `height` | `string` | `'600px'` | CSS height of the whole component. |
| `rowHeight` | `number` | `40` | Row height in pixels. |
| `ariaLabel` | `string` | `'Data grid'` | Accessible name for the grid region. |
| `searchLabel` | `string` | `'Search rows'` | Accessible name for the search box. |
| `searchPlaceholder` | `string` | `'Search across all columns...'` | Search placeholder text. |
| `exportFilename` | `string` | `'data'` | CSV base filename; today's date is appended. |
| `onCellEdit` | `(edit: DataGridCellEdit<T>) => void \| Partial<T> \| Promise<void \| Partial<T>>` | — | Persist an edit; throw to roll back, return a partial row to merge. |
| `onDelete` | `(ids: DataGridRowId[]) => void \| Promise<void>` | — | Persist a bulk delete; the Delete button only renders when supplied. |
| `confirmDelete` | `(count: number) => boolean \| Promise<boolean>` | `window.confirm` | Confirmation before `onDelete` runs. |
| `onSelectionChange` | `(ids: DataGridRowId[]) => void` | — | Fires whenever the selection changes. |
| `onError` | `(message: string, error: unknown) => void` | — | Fires when validation, an edit or a delete fails. |

Column features: `formatter` (display text), `cellClass` (class names via SVAR's cell hook), `options` (select editor + validation), `type` (`number` / `date` coercion), `sortable`, `editable`, `width` (`'auto'` flex-grows). `cellStyle` and `cellRenderer` are DataGridBasic-only — SVAR renders cell templates as plain text.

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Non-numeric text typed into a `type: 'number'` column | Rejected before `onCellEdit`; old value repainted; "Score must be a number." shown. |
| `£1,250` typed into a number column | Currency symbols, commas and spaces are stripped → `1250`. |
| Value not in a column's `options` | Rejected before `onCellEdit` with the list of allowed values. |
| `onCellEdit` rejects (e.g. HTTP 403) | Previous value restored; the error message is shown and passed to `onError`. |
| No `onCellEdit` supplied | Edits are kept locally — useful for prototypes. |
| No `onDelete` supplied | The Delete button never renders, even with `selectable`. |
| Parent passes a new `data` array | The working copy re-syncs; local edits not reflected upstream are replaced. |
| Rows without an `id` | They render and search, but can't be reliably edited, selected or deleted. |
| `columns` omitted | Inferred from the first row: numbers → `number`, `Date`/ISO strings → `date`, `id` is read-only. |
| Coercion, a server patch or a rollback changes what SVAR is showing | SVAR re-reads the data, which can reset the header sort — re-click the header if needed. Plain text edits that save cleanly don't trigger this. |
| Search matches nothing | "0 of N rows"; Export is disabled. |
| Server-side rendering | SVAR can't render on the server, so SSR outputs the search bar plus a same-height placeholder; the grid mounts on hydration without layout shift. |
| `theme="auto"` during SSR | Renders light first, then switches after hydration if the OS is dark. |
| `prefers-reduced-motion: reduce` | Spinner stops spinning; button lift/transitions are removed. |

---

## Dependencies

- **`@svar-ui/svelte-grid`** ^2.4 — virtual scrolling, inline editors, keyboard cell navigation and the Willow skins. Building these by hand would be a 100-hour-plus project; SVAR is MIT-licensed and actively maintained (~155 KB).
- **Svelte 5.25+** — generics (`generics="T extends DataGridRow"`), writable `$derived` for the optimistic working copy, `$effect` for the colour-scheme listener.
- **`$lib/types`** — type-only import (`DataGridColumn`, `DataGridAdvancedProps`, `DataGridCellEdit`, `DataGridRowId`).

---

## File Structure

```
src/lib/components/DataGridAdvanced.svelte     # SVAR Grid wrapper
src/lib/components/DataGridAdvanced.md         # this file
src/lib/components/DataGridAdvanced.test.ts    # render, search, CSV, edit/rollback, select/delete tests
src/lib/types.ts                               # DataGridAdvancedProps, DataGridCellEdit, DataGridRow, DataGridRowId
src/routes/datagrid/+page.svelte               # demo: wires onCellEdit/onDelete to /datagrid/api
src/routes/datagrid/api/+server.ts             # demo REST endpoint (403 for the read-only demo user)
```
