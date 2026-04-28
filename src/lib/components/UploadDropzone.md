# UploadDropzone - Technical Logic Explainer

## What Does It Do?

UploadDropzone is an accessible file upload surface for Svelte apps. Users can drag files onto the panel, click to browse, or paste files from the clipboard. The component validates count, size, and accepted file types, then renders a typed file list with previews, progress states, retry actions, and remove actions.

It is designed as a copy-paste template: no upload backend is assumed. The component owns local display state and emits callback hooks so the parent app can persist files, run uploads, or replace items with server-backed status.

---

## How It Works

```
WHEN user adds files:
  1. Convert FileList into an array
  2. Check max file count
  3. Check accept rules such as image/*, .pdf, application/pdf
  4. Check max file size
  5. Create typed UploadDropzoneItem records
  6. Generate image preview URLs when possible
  7. Render accepted files and announce results
  8. Emit accepted and rejected callbacks

WHEN user removes a file:
  1. Revoke generated preview URL
  2. Remove the item from local state
  3. Emit onRemove and onChange callbacks

WHEN user retries:
  1. Keep the row in place
  2. Emit onRetry so the parent upload workflow can restart
```

---

## Validation Rules

| Rule | Prop | Behaviour |
|------|------|-----------|
| Type | `accept` | Matches file extensions, exact MIME types, and wildcards such as `image/*` |
| Size | `maxSize` | Rejects files larger than the byte limit |
| Count | `maxFiles` | Rejects files once the list reaches the configured limit |
| Multiple | `multiple` | Limits each selection to one file when false |

Rejected files are returned through `onFilesRejected` with the original `File`, a machine-readable reason, and a readable message.

---

## Accessibility

- The drop surface is a real `<button>`, so keyboard focus and activation work without extra ARIA tricks.
- The native file input remains available to assistive technology via an explicit label.
- Status changes are announced through a polite live region.
- Upload progress uses `role="progressbar"` with numeric values.
- Icon-only row actions include screen-reader labels.
- Motion-sensitive users keep a stable experience through `prefers-reduced-motion`.

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `UploadDropzoneItem[]` | `undefined` | Optional controlled/initial file list |
| `accept` | `string` | `''` | File accept rules, same format as native input |
| `multiple` | `boolean` | `true` | Allow multiple files per selection |
| `maxFiles` | `number` | `8` | Maximum number of files in the list |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes |
| `disabled` | `boolean` | `false` | Disable all add/remove/retry controls |
| `title` | `string` | `'Drop files here'` | Primary dropzone heading |
| `description` | `string` | Upload instructions | Supporting copy |
| `browseLabel` | `string` | `'Browse files'` | Browse action text |
| `emptyLabel` | `string` | `'No files selected'` | Empty list text |
| `fileItem` | `Snippet<[UploadDropzoneItem]>` | `undefined` | Optional custom row renderer |
| `onChange` | `(items) => void` | `undefined` | Fires whenever local items change |
| `onFilesAdded` | `(items) => void` | `undefined` | Fires with accepted files |
| `onFilesRejected` | `(rejections) => void` | `undefined` | Fires with rejected files |
| `onRemove` | `(item) => void` | `undefined` | Fires when a row is removed |
| `onRetry` | `(item) => void` | `undefined` | Fires when retry is requested |

---

## Usage

```svelte
<script lang="ts">
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
</script>

<UploadDropzone
	accept="image/*,.pdf"
	maxFiles={5}
	maxSize={5 * 1024 * 1024}
	onFilesAdded={(items) => console.log('Accepted', items)}
	onFilesRejected={(rejections) => console.log('Rejected', rejections)}
/>
```

## Custom File Row

```svelte
<UploadDropzone files={files}>
	{#snippet fileItem(item)}
		<div class="custom-row">
			<strong>{item.name}</strong>
			<span>{item.status}</span>
		</div>
	{/snippet}
</UploadDropzone>
```

---

## File Structure

```
UploadDropzone.svelte      # Component
UploadDropzone.test.ts     # Unit tests
UploadDropzone.md          # This explainer
routes/uploaddropzone      # Demo page
```
