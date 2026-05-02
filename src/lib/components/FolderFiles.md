# FolderFiles — Technical Logic Explainer

## What Does It Do? (Plain English)

FolderFiles is a 3D filing-cabinet UI: a row of coloured folder tabs that cascade open on hover, then expand into a two-panel modal where files can be dragged between "All Items" and "Selected" lists. Underneath it sits a hierarchical data model — folders contain files — backed by a Neon Postgres database with two tables (`folders` + `files`) joined by a foreign key. The same graceful-fallback pattern as Editor: if `DATABASE_URL` is missing, the demo runs from constants and everything works except persistence.

Think of it as a real filing cabinet: the tabs poke out the top, hovering grabs the tabs underneath, clicking pulls the whole drawer onto your desk. The desk has two trays — the one on the right is the folder's actual contents, the one on the left is your sorting pile. You drag papers between them. On a phone, drag is replaced with a tap-to-select pattern because finger-drag is a usability minefield.

The component is a complex interaction layer; the *data* side is a textbook hierarchical CRUD: `loadFolderStructure` returns folders with their files, `createFolder`/`createFile` insert with auto-incremented `display_order`, `deleteFolder` cascades to its files via a foreign-key delete-cascade plus a soft-delete on the parent.

## How It Works (Pseudo-Code)

```
CLIENT (FolderFiles.svelte) ─────────────────────────────────────
  state:
    hoveredIndex          : number | null   // which tab triggered cascade
    openFolder            : Folder | null   // which folder is in the modal
    leftPanelItems        : FileItem[]      // sorting tray
    rightPanelItems       : FileItem[]      // folder contents
    draggedItem           : FileItem | null
    dragOverPanel         : 'left' | 'right' | null
    isTouchDevice         : boolean
    selectedItems         : Set<number>     // mobile multi-select
    mobilePreviewIndex    : number | null   // first-tap state on mobile

  on hover folder tab (desktop):
    hoveredIndex = i
    folders[i+1..n].classList add 'cascaded'   // they drop down

  on click tab (desktop):
    openFolder = folders[i]
    rightPanelItems = files.filter(f => f.folderId === openFolder.id)
    leftPanelItems = []
    lockScroll()

  on tap tab (mobile, two-tap pattern):
    if mobilePreviewIndex !== i:
      mobilePreviewIndex = i           // first tap: cascade + tooltip
    else:
      open modal (as desktop click)    // second tap on same tab

  on dragstart(file):
    draggedItem = file
    e.dataTransfer.effectAllowed = 'move'

  on drop(panel):
    e.preventDefault()
    remove draggedItem from source panel
    push draggedItem onto target panel
    draggedItem = null

  on tap file (mobile):
    toggle selectedItems.has(file.id)

  on Move-button (mobile action bar):
    move every file in selectedItems to the opposite panel
    selectedItems.clear()

  on close modal:
    openFolder = null
    unlockScroll()

  on Escape: close modal
  on Tab inside modal: trap focus (panel headers, list items, action buttons)

PARENT / PAGE (+page.server.ts) ─────────────────────────────────
  load:
    folders = loadFoldersFromDatabase('folderfiles-demo')
    files   = loadFilesFromDatabase()
    return { folders, files, usingDatabase: !!DATABASE_URL }

SERVER UTILITY (folderFiles.ts) ─────────────────────────────────
  loadFoldersFromDatabase(category?):
    if !DATABASE_URL → return FALLBACK_FOLDERS (filtered by category)
    SELECT * FROM folders WHERE is_active=TRUE [AND category=$1]
                          ORDER BY display_order
    map row → camelCase

  loadFilesFromDatabase(folderId?):
    if !DATABASE_URL → return FALLBACK_FILES
    SELECT * FROM files WHERE is_active=TRUE [AND folder_id=$1]
                          ORDER BY folder_id, display_order
    JSON.parse(row.pages)     // multi-page HTML array
    JSON.parse(row.metadata)  // {author, date, tags, …}

  loadFolderStructure(category?):
    folders = loadFolders(category)
    files   = loadFiles()
    return folders.map(f => ({ folder: f, files: files.filter(x => x.folderId === f.id) }))

  createFolder / createFile:
    require DATABASE_URL (else throw)
    SELECT MAX(display_order)+1 for the parent scope
    INSERT … RETURNING *

  updateFolder / updateFile:
    require DATABASE_URL (else throw)
    UPDATE … COALESCE(${field}, field) WHERE id=$1 AND is_active=TRUE
    RETURNING *

  deleteFolder:
    UPDATE files SET is_active=FALSE WHERE folder_id=$1   // soft-cascade
    UPDATE folders SET is_active=FALSE WHERE id=$1
  deleteFile:
    UPDATE files SET is_active=FALSE WHERE id=$1
```

## The Core Concept: Hierarchical CRUD with Soft Cascade

The interesting bit about FolderFiles, server-side, is the parent/child shape. `folders` is the parent table; `files` has a `folder_id INTEGER NOT NULL REFERENCES folders(id) ON DELETE CASCADE`. That foreign key would, on a hard delete, take the children with it automatically. But the project never hard-deletes — every "delete" sets `is_active = FALSE`. So `deleteFolder` does it manually:

```sql
UPDATE files   SET is_active = FALSE WHERE folder_id = $1;
UPDATE folders SET is_active = FALSE WHERE id        = $1 AND is_active = TRUE;
```

The order matters (children first, then parent) so a concurrent reader never sees a folder marked inactive while its files are still listed. Both queries are independent; they're not wrapped in a transaction here, which is a known trade-off — the Neon HTTP driver makes single-statement sql tag calls and a real BEGIN/COMMIT would need `neon().transaction([...])` if strict atomicity matters. For demo purposes the two-statement pattern is acceptable; in production, wrap them.

JSON columns (`pages` and `metadata`) are stored as `TEXT` and `JSON.parse`d on load. This is deliberately old-school — it works on any Postgres without needing the `jsonb` operators. The trade-off: you can't query inside `metadata` from SQL without `metadata::jsonb ->> 'author'` casts. For this demo, all filtering happens in JS after load, so the raw text column is fine.

## Server-Side Data Flow

The flow from URL to DOM:

1. **Page load** → `src/routes/folderfiles/+page.server.ts` runs server-side. Calls `loadFoldersFromDatabase('folderfiles-demo')` and `loadFilesFromDatabase()` in series. Returns `{ folders, files, usingDatabase }` to the page component.
2. **Component receives** `data` via `let { data } = $props()`. Folders and files are passed as props to `<FolderFiles>`.
3. **User opens a folder** — entirely client-side. The component already has every file in memory; it filters by `folderId`. No round-trip.
4. **User drags between panels** — also client-side. Mutating `leftPanelItems` and `rightPanelItems` arrays. Nothing persists. (This is intentional: the demo treats the modal as a scratchpad.)

The CRUD endpoints (`createFolder`, `updateFile`, etc.) exist in the server utility but **no REST API route is currently mounted** for them. That's the difference between FolderFiles and Editor: Editor exposes `/editor/api/+server.ts` for end-to-end CRUD; FolderFiles ships read-only on the route, with the write functions available for code that wires them up. To turn FolderFiles into a fully editable feature, add `src/routes/folderfiles/api/+server.ts` mirroring the Editor pattern (GET/POST/PUT/DELETE → server utility → JSON response).

## Fallback Behaviour

Same principle as the rest of the project: the demo must run with zero configuration. If `DATABASE_URL` is unset (or matches the placeholder string detected by `dataSource.isPlaceholderDatabaseUrl`), the read functions return `FALLBACK_FOLDERS` and `FALLBACK_FILES` from `src/lib/constants.ts` — six folders, eleven files, all the seed data from `schema_folderfiles.sql` mirrored as TypeScript objects.

Read failures (DB unreachable, syntax error, anything thrown by Neon) are caught, logged with `[FolderFiles]` prefix, and the fallback is returned. Pages never crash because of the database.

Write failures distinguish two cases:

- **No `DATABASE_URL`**: throw a specific error so callers can route the user to a 503 or a "configure your database" message. Writes deliberately do *not* fall back to a "pretend it worked" mode — silent data loss is worse than a clear failure.
- **DB error during write**: log, return `null` (or `false` for delete). Caller treats this as a transient failure, can retry or surface to the user.

The `dataSource.ts` helpers (`fromDatabase`, `fromFallback`, `fromDatabaseError`, `combineDataSources`) wrap these states into a typed `DataSourceResult<T>` for pages that want to render a `DatabaseStatus` indicator with the precise reason. FolderFiles' page currently uses the simpler `!!process.env.DATABASE_URL` flag, but `combineDataSources` is the right tool when both folders *and* files might independently fall back.

## Mobile Detection and the Two-Tap Pattern

Drag-and-drop on touchscreens is famously bad: HTML5 native drag events don't fire on touch, libraries that polyfill it conflict with scroll, and even when it works, the user often can't see the drop target under their finger. FolderFiles dodges this by switching interaction models entirely on touch devices.

Detection has to be careful — laptops with touchscreens *should not* count as mobile, because users still expect drag:

```
isTouchDevice = matchMedia('(pointer: coarse)').matches
                && window.innerWidth <= 768
```

Coarse pointer (finger) AND narrow viewport. Both must be true.

When `isTouchDevice` is true:

1. **Two-tap to open**: first tap on a folder tab cascades the tabs and shows a tooltip. Second tap on the *same* tab opens the modal. This prevents accidental opens during scroll.
2. **Tap-to-select**: in the modal, tapping a file toggles its membership in `selectedItems` (a `Set<number>`).
3. **Action bar**: a fixed-bottom bar shows "Move →" and "← Move" buttons that move every selected file to the opposite panel in one go. This replaces drag entirely.

CSS handles the cascade animation (3D `rotateX` driven by `transform`, hardware-accelerated). The two-tap state lives in a single `mobilePreviewIndex` variable, reset on outside-tap or modal-open.

## State Flow Diagram

```
FOLDER TAB INTERACTION:

       ┌──────────────┐
       │ TABS RESTING │  hoveredIndex=null, openFolder=null
       └──────┬───────┘
              │
   ┌──────────┼──────────┐
   │ desktop  │ mobile   │
   │ hover    │ tap      │
   ▼          ▼          ▼
┌──────────┐ ┌──────────────────┐
│ CASCADE  │ │ MOBILE PREVIEW   │
│ folders  │ │ first-tap state  │
│ behind   │ │ + tooltip        │
│ drop     │ │ + cascade        │
└────┬─────┘ └────────┬─────────┘
     │                │
     │ click          │ second tap (same)
     ▼                ▼
┌────────────────────────┐
│ MODAL OPEN             │
│ openFolder=folder      │
│ rightPanelItems=files  │
│ leftPanelItems=[]      │
│ lockScroll()           │
└────────┬───────────────┘
         │
         ▼
   ┌─────────────────────────────────┐
   │       MODAL ACTIVE              │
   │                                 │
   │  desktop:  drag file panel→panel│
   │  mobile:   tap-select + Move    │
   │  Tab:      trap focus           │
   │  Escape:   close                │
   └─────────────┬───────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ MODAL CLOSE  │  unlockScroll(), openFolder=null
         └──────────────┘


DATABASE-VS-FALLBACK BRANCH (server utility):

   load folders/files
            │
            ▼
   DATABASE_URL set?        (and not placeholder)
            │
       ┌────┴────┐
       │ yes     │ no
       ▼         ▼
   neon().sql   warn '[FolderFiles] DATABASE_URL not configured'
       │        return FALLBACK_FOLDERS / FALLBACK_FILES
   ┌───┴───┐         │
   │ ok    │ err     │
   ▼       ▼         ▼
   map     log+      → page renders identically
   to      return    (just no real persistence)
   camel   FALLBACK
   case
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `folders` | `Folder[]` | `[]` | Folder definitions: `{ id, label, color, textColor?, icon?, description?, category? }`. Order in the array determines tab order; the cascade animation cascades from the hovered tab onwards. |
| `files` | `FileItem[]` | `[]` | All files across all folders. Each has `folderId` linking back to a `Folder.id`. The component filters in memory when a folder opens, so all files load up-front (fine for hundreds, not for tens of thousands). |

### Data shapes

```ts
interface Folder {
  id: number;
  label: string;
  color: string;          // hex, e.g. '#a855f7'
  textColor?: string;     // tailwind class, default 'text-white'
  icon?: string;          // emoji
  description?: string;   // tooltip on hover
  category?: string;      // for filtering at load time
}

interface FileItem {
  id: number;
  folderId: number;
  title: string;
  subtitle?: string;
  previewText: string;
  content?: string;       // single-page HTML
  pages?: string[];       // multi-page HTML array (alternative to content)
  thumbnailUrl?: string;
  metadata?: FileMetadata;// { author, date, tags, pageCount, … }
  fileType: 'document' | 'image' | 'pdf' | 'text';
}
```

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle focus through tabs (closed) or modal controls (open). |
| `Enter` on a tab | Open the folder. |
| `Enter` on a file (mobile) | Toggle selection. |
| `Escape` | Close the modal. |

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `DATABASE_URL` not configured | Reads return `FALLBACK_FOLDERS` / `FALLBACK_FILES`. Page renders identically. Writes (if wired up) throw and the API would 503. |
| Folder has zero files | Modal opens with an empty right panel; left panel also empty. No error, just two empty trays. |
| File with `pages` *and* `content` set | The component prefers `pages` (multi-page renderer). `content` is ignored when `pages` is non-empty. Don't set both. |
| User soft-deletes a folder while another tab has it open | Other tab's in-memory list is stale; on next page load the folder is gone. The soft-cascade also marks files inactive, so reopening would show nothing anyway. |
| Hard-delete on the `folders` row | The foreign key cascade removes child files. Bypasses the soft-delete pattern. The schema permits this for ops/cleanup, but the app never does it. |
| Refresh during edit | Files dragged between panels are *not* persisted (modal state is purely client-side). Refreshing returns to the original folder contents. Expected. |
| Two users editing the same file via the (unmounted) write API | `UPDATE … COALESCE(${field}, field)` partial-updates mean non-overlapping field edits coexist; overlapping edits last-writer-wins. No optimistic-concurrency token. |
| `metadata` JSON malformed in the DB | `JSON.parse` throws inside the row mapper, the whole load fails, error is logged, fallback is returned. One bad row poisons the whole list — defensive callers should validate at write time. |
| Mobile user with viewport > 768 (foldable phone, tablet landscape) | Treated as desktop: drag is enabled, two-tap is off. The 768 threshold is intentional but may need tuning per project. |
| `prefers-reduced-motion: reduce` | Cascade animation falls back to a quick fade; `transform` keyframes are replaced with `opacity`. |
| File `pages` is `[]` (empty array, not undefined) | Treated as falsy by the component; `content` is shown instead if present. Safe but confusing — prefer `null`/`undefined` over empty arrays. |
| Server-side render | Component checks `typeof window !== 'undefined'` before calling `matchMedia` for mobile detection. SSR HTML is the desktop layout; the mobile path activates on mount. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$effect`, `$props`, snippets. The cascade animation is a CSS-only `transform` keyframe; no JS animation library.
- **`@neondatabase/serverless`** — Neon HTTP driver, used in the server utility. Requires Node.js 20.x runtime (configured in `svelte.config.js`).
- **`$lib/server/dataSource`** — typed helpers for distinguishing database / fallback / error sources; `combineDataSources` is useful when folders and files might fall back independently.
- **`$lib/scrollLock`** — body-scroll lock helper used by the modal; returns a cleanup function so opens and closes balance precisely.
- **`$lib/types`** — `Folder`, `FolderRow`, `FileItem`, `FileItemRow`, `FolderWithFiles`, `FileMetadata`. Component types are camelCase, database types are snake_case.
- **Zero external drag libraries** — uses the native HTML5 `dragstart` / `dragover` / `drop` events. The mobile branch sidesteps drag entirely with tap-to-select.

## File Structure

```
src/lib/components/FolderFiles.svelte         # cabinet UI, drag/drop, mobile two-tap
src/lib/components/FolderFiles.md             # this file
src/lib/components/FolderFiles.test.ts        # unit tests
src/lib/server/folderFiles.ts                 # CRUD utility (read + write functions)
src/lib/server/dataSource.ts                  # typed source-status helpers
src/lib/scrollLock.ts                         # body-scroll lock helper
src/lib/constants.ts                          # FALLBACK_FOLDERS, FALLBACK_FILES
src/lib/types.ts                              # Folder / FileItem / *Row interfaces
src/routes/folderfiles/+page.svelte           # demo page
src/routes/folderfiles/+page.server.ts        # SSR load: folders, files, usingDatabase
                                              # (no /api/+server.ts mounted yet — write
                                              #  functions in folderFiles.ts are ready
                                              #  to wire up if persistence is needed)
database/schema_folderfiles.sql               # folders + files tables, FK cascade,
                                              # triggers, seed data (6 folders, 11 files)
```
