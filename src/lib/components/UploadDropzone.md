# UploadDropzone — Technical Logic Explainer

## What Does It Do? (Plain English)

A typed file-upload surface that accepts files three ways — drag-and-drop onto the panel, click-to-browse via the native file picker, or paste from the clipboard. It validates count, size, and accepted MIME types up front, then renders a typed list with image previews, progress bars, and per-row remove and retry actions. It owns local display state by default and emits callback hooks so the parent app can persist files, run uploads, or replace items with server-backed status.

Think of it as the "deposit box" for your upload pipeline: the box itself doesn't talk to the bank, it just holds the envelopes, checks they're addressed correctly, and rings a bell when the user adds or removes one. Wiring up the actual upload (XHR, fetch, presigned S3, tRPC mutation) is the consumer's job — this component handles the messy human part.

## How It Works (Pseudo-Code)

```
state:
  internalItems[]      = uncontrolled file list, used when `files` prop is omitted
  isDragging           = true while the cursor is over the panel
  dragDepth            = nesting counter for nested dragenter/dragleave events
  liveMessage          = SR-only string for aria-live announcements
  createdPreviewUrls   = Set of object URLs we created (for cleanup on destroy)

derive items = controlledFiles ?? internalItems   // controlled-or-uncontrolled

events:
  on click panel (or Enter/Space — it's a real <button>):
    if disabled or at limit: return
    open native file picker via inputEl.click()

  on drag enter:    dragDepth++; isDragging = true
  on drag over:     preventDefault; dropEffect = 'copy' or 'none' (at-limit)
  on drag leave:    dragDepth--; isDragging = dragDepth > 0
  on drop:          preventDefault; addFiles(dataTransfer.files)
  on paste:         if clipboardData.files: preventDefault; addFiles(...)

addFiles(fileList):
  for each file:
    if no slots left: rejection { reason: 'count' }
    else if accept rule fails: rejection { reason: 'type' }
    else if file.size > maxSize: rejection { reason: 'size' }
    else: build UploadDropzoneItem (with preview URL for images)
  commit accepted; fire onFilesAdded; fire onFilesRejected
  liveMessage announces the result for screen readers

removeItem(item):
  revoke item.previewUrl (free memory)
  commit items minus this one
  fire onRemove + onChange

retryItem(item):
  fire onRetry — parent restarts the upload, leaves the row in place
```

The component is **uncontrolled by default**: omit `files` and it manages its own list. Pass `files` to take over — `controlledFiles ?? internalItems` makes the switch transparent at the `derived` level.

## The Core Concept: Drag-Depth Counter

Drag-and-drop on a parent element is haunted by nested elements. As the cursor moves from the panel onto a child (the icon, the title, the button), the browser fires `dragleave` on the parent and `dragenter` on the child — even though the cursor is still inside the panel. A naïve `isDragging = true on enter, false on leave` would flicker every time the user moved across the icon.

The fix is a depth counter:

```
on dragenter:   dragDepth += 1
on dragleave:   dragDepth = max(0, dragDepth - 1)
on drop:        dragDepth = 0
isDragging      = dragDepth > 0
```

Each `dragenter` increments. Each `dragleave` decrements. The cursor can only truly leave the panel when the counter hits zero — by which point every nested `dragenter` has been balanced by a `dragleave`. Hovering across the inner icon increments-then-decrements before the parent's leave fires, so `isDragging` stays `true` throughout.

The `Math.max(0, ...)` guard is paranoia: if the browser drops a `dragleave` event (Safari has been known to), the counter stays non-negative and the flag eventually resets when the user starts a new drag.

## File Validation Strategy

The accept-rule matcher implements the same three-grammar shape that `<input accept>` uses:

```
".pdf"          → matches any filename ending in .pdf
"image/*"       → matches any MIME type starting with "image/"
"application/pdf" → exact MIME match
```

```
validateFileType(file):
  for each rule in accept.split(','):
    if rule starts with '.': filename ends with rule? → match
    if rule ends with '/*':  fileType starts with prefix? → match
    else:                    fileType === rule? → match
  return null on match, error message on mismatch
```

Three rejection reasons — `'count'`, `'type'`, `'size'` — are deliberately machine-readable so consumers can branch on them in `onFilesRejected`. Each rejection also carries a human message ready to surface in a toast.

The size check is byte-accurate: `maxSize` defaults to 10 MB (`10 * 1024 * 1024`). Files over the limit are rejected with the formatted size in the message ("foo.pdf is larger than 10 MB.") so users see exactly what budget they overran.

## Memory Management: Preview URLs

Image previews use `URL.createObjectURL(file)`, which allocates a blob URL backed by the file's bytes. These URLs **leak memory** if not revoked — the browser keeps the file alive in the page's heap until the URL is freed.

The component tracks every URL it creates in a `SvelteSet`:

```
on createUploadItem (image only):  createdPreviewUrls.add(url)
on removeItem:                      URL.revokeObjectURL(url); set.delete(url)
on onDestroy:                       revoke every URL still in the set
```

The `onDestroy` cleanup is the safety net: if the parent unmounts the component without removing items first (e.g. user navigates away), every preview URL is revoked in one pass.

## State Flow Diagram

```
                ┌─────────────────────────┐
                │   IDLE                  │
                │   items = []            │
                │   isDragging = false    │
                └───────────┬─────────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
       drag over        click panel       paste files
       (dragDepth>0)    → file picker     (clipboard)
            │               │                │
            ▼               ▼                ▼
                 ┌────────────────────────┐
                 │   ADDING               │
                 │  validate each file    │
                 │  accept / type / size  │
                 └───────────┬────────────┘
                             │
                ┌────────────┴────────────┐
                │                          │
           accepted ≥ 1                rejected ≥ 1
                │                          │
                ▼                          ▼
      ┌──────────────┐          ┌─────────────────┐
      │ APPEND items │          │ onFilesRejected │
      │ onFilesAdded │          │  liveMessage    │
      │  onChange    │          └─────────────────┘
      └──────┬───────┘
             │
             ▼
     ┌────────────────┐    user clicks ×        ┌─────────────┐
     │   POPULATED    │ ───────────────────────▶│  REMOVING   │
     │  items.length  │                          │ revoke URL  │
     │     > 0        │ ◀────────────────────────│  onRemove   │
     └────────────────┘    user clicks retry     └─────────────┘
                              │
                              ▼
                        onRetry fires —
                        parent restarts upload
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `UploadDropzoneItem[]` | `undefined` | Controlled file list. Omit for uncontrolled (component manages its own list). |
| `accept` | `string` | `''` | File-accept rules; same grammar as native `<input accept>`. Empty string allows any type. |
| `multiple` | `boolean` | `true` | Allow multiple files per selection. When `false`, each pick is capped at 1. |
| `maxFiles` | `number` | `8` | Maximum files in the list. Excess are rejected with reason `'count'`. |
| `maxSize` | `number` | `10485760` | Maximum bytes per file (10 MB). Larger files rejected with reason `'size'`. |
| `disabled` | `boolean` | `false` | Disable add / remove / retry controls. |
| `title` | `string` | `'Drop files here'` | Primary heading on the surface. |
| `description` | `string` | upload instructions | Supporting copy under the title. |
| `browseLabel` | `string` | `'Browse files'` | Browse-action button text. |
| `emptyLabel` | `string` | `'No files selected'` | Empty-list placeholder. |
| `class` | `string` | `''` | Extra classes on the wrapper. |
| `fileItem` | `Snippet<[UploadDropzoneItem]>` | `undefined` | Optional custom row renderer. |
| `onChange` | `(items) => void` | `undefined` | Fires whenever local items change. |
| `onFilesAdded` | `(items) => void` | `undefined` | Fires with accepted files only. |
| `onFilesRejected` | `(rejections) => void` | `undefined` | Fires with rejected files + reason + message. |
| `onRemove` | `(item) => void` | `undefined` | Fires when a row's × is clicked. |
| `onRetry` | `(item) => void` | `undefined` | Fires when retry is clicked on an errored row. |

## Theming

Follows the project-wide convention in `docs/THEMING.md`: chrome flips under `prefers-color-scheme: dark`, brand and semantic colours stay.

`--upload-accent` (brand), `--upload-success` and `--upload-danger` (semantic) never flip, so the progress gradient and hover accents keep their meaning. Everything else is chrome.

| Property | Light | Dark | Used by |
|---|---|---|---|
| `--upload-accent` | `#2563eb` | *(unchanged — brand / semantic)* | `.surface-icon`, `.progress-track span` |
| `--upload-success` | `#059669` | *(unchanged — brand / semantic)* | `.progress-track span` |
| `--upload-danger` | `#dc2626` | *(unchanged — brand / semantic)* | `.icon-button.danger:hover:not(:disabled)` |
| `--upload-fg` | `#172033` | `#e2e8f0` | `.upload-dropzone` |
| `--upload-title-fg` | `#0f172a` | `#f8fafc` | `.surface-title`, `.file-name` |
| `--upload-muted-fg` | `#64748b` | `#94a3b8` | `.surface-description`, `.empty-state` |
| `--upload-surface-bg` | `#fbfdff` | `#0f172a` | `.upload-surface` |
| `--upload-surface-bg-dragging` | `#f7fffb` | `#052e1f` | `.upload-surface.is-dragging` |
| `--upload-surface-bg-limit` | `#f8fafc` | `#111827` | `.upload-surface.is-at-limit` |
| `--upload-surface-shadow` | `0 18px 45px rgba(23, 32, 51, 0.08)` | `0 18px 45px rgba(0, 0, 0, 0.35)` | `.upload-surface` |
| `--upload-card-bg` | `#ffffff` | `#1e293b` | `.surface-icon`, `.empty-state` |
| `--upload-row-bg` | `rgba(255, 255, 255, 0.94)` | `rgba(15, 23, 42, 0.94)` | `.file-row` |
| `--upload-row-bg-error` | `#fffafa` | `#2a0f12` | `.file-row.is-error` |
| `--upload-row-shadow` | `0 10px 28px rgba(15, 23, 42, 0.06)` | `0 10px 28px rgba(0, 0, 0, 0.3)` | `.file-row` |
| `--upload-action-bg` | `#0f172a` | `#f8fafc` | `.surface-action` |
| `--upload-action-fg` | `#ffffff` | `#0f172a` | `.surface-action` |
| `--upload-preview-bg` | `#eef2ff` | `#1e1b4b` | `.file-preview` |
| `--upload-preview-fg` | `#334155` | `#cbd5e1` | `.file-preview` |
| `--upload-track-bg` | `#e2e8f0` | `#334155` | `.progress-track` |
| `--upload-button-bg` | `#f1f5f9` | `#1e293b` | `.icon-button` |
| `--upload-button-fg` | `#334155` | `#cbd5e1` | `.icon-button` |
| `--upload-button-hover-bg` | `#dbeafe` | `#172554` | `.icon-button:hover:not(:disabled)` |
| `--upload-button-danger-hover-bg` | `#fee2e2` | `#450a0a` | `.icon-button.danger:hover:not(:disabled)` |
| `--upload-pill-bg` | `#e0f2fe` | `#0c4a6e` | `.status-pill` |
| `--upload-pill-fg` | `#075985` | `#bae6fd` | `.status-pill` |
| `--upload-pill-success-bg` | `#dcfce7` | `#052e16` | `.status-pill.success` |
| `--upload-pill-success-fg` | `#166534` | `#86efac` | `.status-pill.success` |
| `--upload-pill-error-bg` | `#fee2e2` | `#450a0a` | `.status-pill.error` |
| `--upload-pill-error-fg` | `#991b1b` | `#fca5a5` | `.status-pill.error` |

Override with doubled-class specificity so the rule beats the component's scoped (0,2,0) declaration:

```css
body .upload-dropzone.upload-dropzone {
  --upload-accent: #7c3aed;
  --upload-surface-bg: #faf5ff;
}
```

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| User drops 12 files into a `maxFiles=8` empty zone | First 8 accepted; remaining 4 rejected with reason `'count'`. `onFilesAdded` and `onFilesRejected` both fire. |
| User pastes an image from the clipboard while a text input is focused inside the page | Paste handler is on the panel `<button>`; it only fires when the panel itself is focused. Other paste targets are unaffected. |
| User drags a folder (not a file) | The browser flattens the folder into its top-level files via `dataTransfer.files`. Subdirectories are silently dropped — folders aren't supported by the spec. |
| `accept="image/*,.pdf"` and user uploads a JPEG | `image/*` matches `image/jpeg`; accepted. |
| User removes the last file and re-adds it | The previous preview URL was revoked on remove; a new one is created on add. No leak, no stale image. |
| Component unmounts while preview URLs are alive | `onDestroy` revokes every URL in `createdPreviewUrls` before the DOM is torn down. |
| User has `prefers-reduced-motion: reduce` | The hover-lift transform and progress-bar transition are disabled; state changes are instant. |
| Drag enters a nested element inside the panel | `dragDepth` counter prevents the flicker; `isDragging` stays true until the cursor truly leaves the panel. |
| `crypto.randomUUID()` unavailable (older browser) | Falls back to a timestamp + `Math.random()` slug — collision-resistant enough for client-side row IDs. |

## Dependencies

- **Svelte 5.x** — runes (`$state`, `$derived`, `$props`), snippets (`fileItem`), and `onDestroy` for preview-URL cleanup.
- **`svelte/reactivity`** — `SvelteSet` for the preview-URL tracker (reactive Set so cleanup is observable in tests).
- **`$lib/utils`** (`cn`) — class-name merge helper. Trivial dep, swap for plain template literal if porting.
- Zero other external dependencies. Native drag-and-drop, native clipboard, native file input, scoped CSS.

## File Structure

```
src/lib/components/UploadDropzone.svelte    # implementation
src/lib/components/UploadDropzone.md        # this file (rendered inside ComponentPageShell)
src/lib/components/UploadDropzone.test.ts   # vitest unit tests
src/routes/uploaddropzone/+page.svelte      # demo page
src/lib/types.ts                            # UploadDropzoneItem + UploadDropzoneProps + UploadDropzoneRejection
```
