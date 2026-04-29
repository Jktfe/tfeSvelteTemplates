---
name: ContextMenu
category: Helpful UX
author: antclaude
status: shipped
---

# ContextMenu

Right-click / long-press menu primitive. Wrap any trigger content; right-click suppresses the native browser menu and opens a custom menu at the click position. Items are passed declaratively as a prop array, so the consumer never has to wire keyboard navigation, viewport clamping, or focus management themselves.

Pairs naturally with `CommandPalette` (different idiom: spotlight-style search vs. positional menu), `FloatingDock` (different commitment: persistent app launcher vs. transient action menu), `Tooltip` (different intent: passive hint vs. actionable choices). Never a substitute for inline buttons — use it for actions that don't deserve permanent UI real estate.

## Key features

- **Pointer + keyboard parity** — Right-click opens at the click point; `Shift+F10` and the dedicated `ContextMenu` key open the menu anchored to the trigger's bottom-left corner. Once open, `ArrowUp` / `ArrowDown` navigate (skipping dividers and disabled items), `Home` / `End` jump to the first / last enabled item, `Enter` / `Space` activate, `Escape` / `Tab` close, and click-outside dismisses. No 2-step click fakery — keyboard users get a real menu, not a toolbar shim.
- **Auto-positioning** — `clampToViewport` flips the menu when it would overflow the right or bottom edge of the viewport, with an 8 px safety padding so the menu never sits flush against the edge.
- **Native menu suppression** — `event.preventDefault()` on the trigger's `contextmenu` event so the page never shows two menus at once.
- **Declarative items** — items are a single prop array of `{ id, label, shortcut?, disabled?, danger? }` or `{ type: 'divider' }`. `normalizeItems` strips invalid entries, dedupes by id, and coerces optional fields to safe defaults.
- **Reduced-motion bypass** — under `prefers-reduced-motion: reduce`, the open animation is skipped (instant render). The contract — open, navigate, select, close — is preserved.
- **Pure helpers exported** — `normalizeItems`, `clampToViewport`, `nextEnabledIndex`, `isInteractiveItem`, `isReducedMotion`. Directly unit-testable without rendering.

## Usage

```svelte
<script>
	import ContextMenu from '$lib/components/ContextMenu.svelte';

	const items = [
		{ id: 'edit', label: 'Edit', shortcut: '⌘E' },
		{ id: 'copy', label: 'Copy', shortcut: '⌘C' },
		{ type: 'divider' },
		{ id: 'delete', label: 'Delete', danger: true, shortcut: '⌫' }
	];

	function onSelect(id) {
		console.log('selected', id);
	}
</script>

<ContextMenu {items} {onSelect}>
	<div class="my-target">Right-click me</div>
</ContextMenu>
```

## Props

| Prop        | Type                       | Default          | Notes                                                       |
| ----------- | -------------------------- | ---------------- | ----------------------------------------------------------- |
| `items`     | `ContextMenuItem[]`        | required         | Validated via `normalizeItems`; invalid entries are dropped.|
| `onSelect`  | `(id: string) => void`     | no-op            | Fires on item click / `Enter` / `Space`.                    |
| `ariaLabel` | `string`                   | `'Context menu'` | Used as the menu's `aria-label`.                            |
| `disabled`  | `boolean`                  | `false`          | Trigger ignores `contextmenu` and keyboard activators.      |
| `class`     | `string`                   | `''`             | Extra classes on the trigger wrapper.                       |
| `children`  | `Snippet`                  | default text     | Trigger content rendered inside the wrapper.                |

## Item shape

```ts
type ContextMenuItem =
	| { type: 'divider' }
	| {
			id: string;        // unique stable identifier passed to onSelect
			label: string;     // visible label
			shortcut?: string; // optional right-aligned hint, e.g. '⌘C'
			disabled?: boolean; // greyed out, skipped by keyboard nav, no click effect
			danger?: boolean;  // styled in red for destructive actions
		};
```

## Pure helpers (module-script exports)

- `normalizeItems(items)` — strips invalid entries, ensures unique ids, coerces optional fields to safe defaults.
- `clampToViewport(x, y, menuW, menuH, viewportW, viewportH, padding?)` — returns `{ x, y }` flipped when the menu would overflow.
- `nextEnabledIndex(items, current, direction)` — keyboard nav: walks forward (`1`) or backward (`-1`) skipping dividers and disabled items, wrapping at both ends.
- `isInteractiveItem(item)` — type guard separating dividers from action items.
- `isReducedMotion()` — `boolean`. Returns `false` outside the browser.

## Distinct from

- **`CommandPalette`** — spotlight search overlay anchored to the viewport. ContextMenu is positional and triggered by the user's right-click target.
- **`FloatingDock`** — persistent macOS-style dock. ContextMenu is transient.
- **`Tooltip`** — passive hover hint. ContextMenu is interactive.
- **Native browser menu** — `event.preventDefault()` suppresses it so the page never shows two menus.
- **`StaggeredMenu`** — animated nav menu, different idiom (page nav vs. action menu).

## Accessibility

- Trigger wrapper is `role="button"` with `aria-haspopup="menu"`, `aria-expanded` reflecting the open state, and `aria-disabled` mirroring the `disabled` prop. `tabindex="0"` so keyboard users can focus the trigger.
- The menu container is `role="menu"` with `aria-orientation="vertical"` and `aria-label` (defaults to `'Context menu'`, overridable via `ariaLabel`).
- Each enabled item is a `<button role="menuitem">` with `aria-disabled` mirroring its disabled state. Dividers are `role="separator"` + `aria-hidden="true"` so screen readers don't announce empty separators.
- The active item gets focus via `element.focus()` so screen-reader users follow the keyboard cursor; `mouseenter` updates `activeIndex` so pointer and keyboard users converge on the same item.
- `Shift+F10` and the `ContextMenu` key open the menu without a pointer; `Escape` / `Tab` close. The keyboard contract matches the WAI-ARIA menu pattern.
- Under `prefers-reduced-motion: reduce`, the open animation is skipped — the contract is preserved, only the visual transition is removed.

## Performance

- One trigger wrapper + one fixed-positioned menu. The menu is only mounted while open, so when closed there is zero DOM cost beyond the trigger wrapper.
- No `requestAnimationFrame`, no `ResizeObserver`. Position is computed once on open via `getBoundingClientRect` + `clampToViewport`.
- Helpers run in pure functions for unit testing without a DOM.

## Recipes

- **File-tree row actions**: `<ContextMenu items={fileActions} onSelect={handleFileAction}>{file.name}</ContextMenu>`
- **Destructive confirm flow**: combine with `HoldToConfirm` — the context menu offers `Delete`, the click navigates to a hold-to-confirm flow.
- **Keyboard-first menu**: omit the `<children>` and use a button as the trigger; users press `Shift+F10` or the `ContextMenu` key to open.
- **Disabled while saving**: `<ContextMenu disabled items={items} />`
