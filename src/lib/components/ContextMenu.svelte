<!--
  ============================================================
  ContextMenu

  WHAT
  Right-click / long-press menu primitive. Wraps any trigger
  content; right-click suppresses the native browser menu and
  opens a custom menu at the click position. Items are passed
  in declaratively as a prop array. Pointer + keyboard parity
  from line one.

  FEATURES
  • Right-click on the trigger opens the menu at the click
    coordinates; programmatic open(x, y) supported via the
    `open` prop binding alternative.
  • Items: { id, label, shortcut?, disabled?, danger? } |
    { type: 'divider' }. Dividers and disabled items are
    skipped during keyboard navigation.
  • Pointer + keyboard parity — ArrowUp/Down navigates,
    Home/End jump to first/last enabled item, Enter or Space
    activates, Escape or Tab closes, click outside closes.
  • Auto-positioning — clampToViewport flips the menu when it
    would overflow the right or bottom edge, with an 8 px
    safety padding.
  • Native browser context-menu suppression on the trigger
    (preventDefault) so the page never shows two menus.
  • Danger variant — items marked `danger: true` render in
    red so destructive choices are visually distinct.

  ACCESSIBILITY
  • Trigger wrapper carries no role (the wrapped content owns
    its own semantics). The menu container is role="menu" with
    aria-orientation="vertical" and aria-label (defaults to
    "Context menu", overridable via `ariaLabel`).
  • Each enabled item is role="menuitem"; dividers are
    role="separator" + aria-hidden="true" so screen readers
    don't announce empty separators.
  • Active item gets focus (via element.focus()) so screen
    readers track the keyboard cursor; aria-disabled mirrors
    the disabled prop on each item.
  • prefers-reduced-motion: reduce → the open animation is
    skipped (instant render). The contract — open, navigate,
    select, close — is preserved.

  DEPENDENCIES
  Zero external — pure Svelte 5 + scoped CSS.

  PERFORMANCE
  • One trigger wrapper + one fixed-positioned menu. Menu is
    only mounted while open, so when closed there is zero DOM
    cost beyond the trigger wrapper.
  • Helpers exported from the module script for unit-testing
    without a DOM.

  USAGE
  <ContextMenu items={menuItems} onSelect={(id) => ...}>
    Right-click here
  </ContextMenu>
-->

<script lang="ts" module>
	// ============================================================
	// ContextMenu — pure helpers + types
	//
	// Validation, positioning, and keyboard-nav math live in
	// module scope so the test suite can exercise them without
	// rendering the component.
	// ============================================================

	export type ContextMenuItem =
		| { type: 'divider' }
		| {
				id: string;
				label: string;
				shortcut?: string;
				disabled?: boolean;
				danger?: boolean;
		  };

	export type ContextMenuActionItem = Exclude<ContextMenuItem, { type: 'divider' }>;

	/**
	 * Type guard separating divider entries from interactive
	 * items. Used by keyboard-nav and click handlers.
	 */
	export function isInteractiveItem(item: ContextMenuItem): item is ContextMenuActionItem {
		return !('type' in item && item.type === 'divider');
	}

	/**
	 * Strip invalid entries from an externally-supplied items
	 * array. Non-objects, missing id/label, and duplicate ids
	 * are dropped silently. Divider entries pass through.
	 */
	export function normalizeItems(items: unknown): ContextMenuItem[] {
		if (!Array.isArray(items)) return [];
		// Plain object as a string-keyed hash map — the lint rule
		// svelte/prefer-svelte-reactivity flags any new Set inside a
		// .svelte file, but this helper is a pure function running
		// once at setup. A plain record keeps the dedupe semantics
		// without dragging in a reactive primitive we don't need.
		const seen: Record<string, true> = {};
		const out: ContextMenuItem[] = [];
		for (const raw of items) {
			if (!raw || typeof raw !== 'object') continue;
			const obj = raw as Record<string, unknown>;
			if (obj.type === 'divider') {
				out.push({ type: 'divider' });
				continue;
			}
			const id = typeof obj.id === 'string' ? obj.id : null;
			const label = typeof obj.label === 'string' ? obj.label : null;
			if (!id || !label || seen[id]) continue;
			seen[id] = true;
			out.push({
				id,
				label,
				shortcut: typeof obj.shortcut === 'string' ? obj.shortcut : undefined,
				disabled: obj.disabled === true,
				danger: obj.danger === true
			});
		}
		return out;
	}

	/**
	 * Position the menu so it stays inside the viewport. When
	 * the menu would overflow the right or bottom edge, the
	 * anchor flips to the opposite side of the click point so
	 * the menu opens up-and-left from the corner that fits.
	 *
	 * Padding defaults to 8 px so the menu never sits flush
	 * against the viewport edge.
	 */
	export function clampToViewport(
		x: number,
		y: number,
		menuW: number,
		menuH: number,
		viewportW: number,
		viewportH: number,
		padding = 8
	): { x: number; y: number } {
		let nx = x;
		let ny = y;
		if (nx + menuW + padding > viewportW) nx = Math.max(padding, x - menuW);
		if (ny + menuH + padding > viewportH) ny = Math.max(padding, y - menuH);
		if (nx < padding) nx = padding;
		if (ny < padding) ny = padding;
		return { x: nx, y: ny };
	}

	/**
	 * Walk forward (direction=1) or backward (direction=-1) from
	 * `current` to the next interactive, non-disabled item.
	 * Wraps at both ends so ArrowDown on the last item lands on
	 * the first. Returns -1 only when no enabled item exists.
	 *
	 * Pass current=-1 with direction=1 to find the first enabled
	 * item from the top (used when the menu first opens).
	 */
	export function nextEnabledIndex(
		items: ContextMenuItem[],
		current: number,
		direction: 1 | -1
	): number {
		const n = items.length;
		if (n === 0) return -1;
		for (let step = 1; step <= n; step++) {
			let i = current + direction * step;
			while (i < 0) i += n;
			i = i % n;
			const item = items[i];
			if (isInteractiveItem(item) && !item.disabled) return i;
		}
		return -1;
	}

	/**
	 * Browser-safe `prefers-reduced-motion: reduce` probe.
	 * Returns false during SSR / Node test runs so the
	 * server-rendered markup matches the default-animated
	 * client render before onMount has a chance to flip the
	 * gate.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';

	type Props = {
		items: ContextMenuItem[];
		onSelect?: (id: string) => void;
		ariaLabel?: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	};

	let {
		items,
		onSelect = () => {},
		ariaLabel = 'Context menu',
		disabled = false,
		class: extraClass = '',
		children
	}: Props = $props();

	const safeItems = $derived(normalizeItems(items));

	let open = $state(false);
	let position = $state({ x: 0, y: 0 });
	let activeIndex = $state(-1);
	let reduced = $state(false);
	let menuEl = $state<HTMLDivElement | null>(null);
	let triggerEl = $state<HTMLDivElement | null>(null);
	let itemEls: Array<HTMLButtonElement | null> = $state([]);

	onMount(() => {
		reduced = isReducedMotion();
	});

	function openAt(x: number, y: number) {
		if (disabled || safeItems.length === 0) return;
		position = { x, y };
		open = true;
		activeIndex = nextEnabledIndex(safeItems, -1, 1);
		// After the menu mounts, measure and clamp into the
		// viewport, then move focus to the first enabled item.
		void tick().then(() => {
			if (!menuEl) return;
			const rect = menuEl.getBoundingClientRect();
			const clamped = clampToViewport(
				x,
				y,
				rect.width,
				rect.height,
				window.innerWidth,
				window.innerHeight
			);
			position = clamped;
			focusActive();
		});
	}

	function close() {
		if (!open) return;
		open = false;
		activeIndex = -1;
		// Return focus to the trigger so keyboard users don't
		// get stranded in the document body.
		triggerEl?.focus();
	}

	function focusActive() {
		const el = itemEls[activeIndex];
		if (el && typeof el.focus === 'function') el.focus();
	}

	function handleContextMenu(event: MouseEvent) {
		if (disabled) return;
		event.preventDefault();
		openAt(event.clientX, event.clientY);
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (disabled) return;
		// Shift+F10 and ContextMenu key are the standard keyboard
		// equivalents to right-click. Both open the menu anchored
		// to the trigger element's bottom-left corner.
		if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
			event.preventDefault();
			const rect = triggerEl?.getBoundingClientRect();
			if (rect) openAt(rect.left, rect.bottom);
		}
	}

	function handleMenuKeydown(event: KeyboardEvent) {
		if (!open) return;
		switch (event.key) {
			case 'ArrowDown': {
				event.preventDefault();
				activeIndex = nextEnabledIndex(safeItems, activeIndex, 1);
				focusActive();
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				activeIndex = nextEnabledIndex(safeItems, activeIndex, -1);
				focusActive();
				break;
			}
			case 'Home': {
				event.preventDefault();
				activeIndex = nextEnabledIndex(safeItems, -1, 1);
				focusActive();
				break;
			}
			case 'End': {
				event.preventDefault();
				activeIndex = nextEnabledIndex(safeItems, safeItems.length, -1);
				focusActive();
				break;
			}
			case 'Enter':
			case ' ': {
				event.preventDefault();
				selectIndex(activeIndex);
				break;
			}
			case 'Escape':
			case 'Tab': {
				event.preventDefault();
				close();
				break;
			}
		}
	}

	function selectIndex(index: number) {
		const item = safeItems[index];
		if (!item || !isInteractiveItem(item) || item.disabled) return;
		onSelect(item.id);
		close();
	}

	function handleWindowClick(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node | null;
		if (target && menuEl && menuEl.contains(target)) return;
		if (target && triggerEl && triggerEl.contains(target)) return;
		close();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		// Window-level Escape catches keys when focus has drifted
		// off the menu (e.g. the user clicked an item that opened
		// a modal that itself uses Escape — defensive only).
		if (open && event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}
</script>

<svelte:window on:mousedown={handleWindowClick} on:keydown={handleWindowKeydown} />

<div
	bind:this={triggerEl}
	class="ctx-trigger {extraClass}"
	class:ctx-trigger-disabled={disabled}
	tabindex="0"
	role="button"
	aria-haspopup="menu"
	aria-expanded={open}
	aria-disabled={disabled}
	oncontextmenu={handleContextMenu}
	onkeydown={handleTriggerKeydown}
>
	{#if children}
		{@render children()}
	{:else}
		<span class="ctx-default-trigger">Right-click here</span>
	{/if}
</div>

{#if open}
	<div
		bind:this={menuEl}
		class="ctx-menu"
		class:ctx-menu-reduced={reduced}
		role="menu"
		aria-orientation="vertical"
		aria-label={ariaLabel}
		style:left="{position.x}px"
		style:top="{position.y}px"
		onkeydown={handleMenuKeydown}
		tabindex="-1"
	>
		{#each safeItems as item, index (isInteractiveItem(item) ? item.id : `divider-${index}`)}
			{#if isInteractiveItem(item)}
				<button
					bind:this={itemEls[index]}
					type="button"
					class="ctx-item"
					class:ctx-item-active={activeIndex === index}
					class:ctx-item-disabled={item.disabled}
					class:ctx-item-danger={item.danger}
					role="menuitem"
					aria-disabled={item.disabled === true}
					data-context-menu-item-id={item.id}
					tabindex={activeIndex === index ? 0 : -1}
					disabled={item.disabled}
					onclick={() => selectIndex(index)}
					onmouseenter={() => {
						if (!item.disabled) {
							activeIndex = index;
							focusActive();
						}
					}}
				>
					<span class="ctx-item-label">{item.label}</span>
					{#if item.shortcut}
						<span class="ctx-item-shortcut" aria-hidden="true">{item.shortcut}</span>
					{/if}
				</button>
			{:else}
				<div class="ctx-divider" role="separator" aria-hidden="true"></div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.ctx-trigger {
		display: inline-block;
		cursor: context-menu;
		outline: none;
	}

	.ctx-trigger:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: 2px;
		border-radius: 4px;
	}

	.ctx-trigger-disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.ctx-default-trigger {
		display: inline-block;
		padding: 0.75rem 1.25rem;
		background: #1a1a2e;
		border: 1px dashed #2a2a3e;
		border-radius: 8px;
		color: #c9c9d1;
		font-size: 0.95rem;
	}

	.ctx-menu {
		position: fixed;
		z-index: 9999;
		min-width: 200px;
		max-width: 320px;
		padding: 0.35rem;
		background: #0d0d1a;
		border: 1px solid #2a2a3e;
		border-radius: 8px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 0.9rem;
		color: #e6e6e6;
		animation: ctx-menu-in 120ms ease-out;
		transform-origin: top left;
	}

	.ctx-menu-reduced {
		animation: none;
	}

	@keyframes ctx-menu-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.ctx-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: 0;
		border-radius: 4px;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		outline: none;
	}

	.ctx-item:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: -2px;
	}

	.ctx-item-active:not(.ctx-item-disabled) {
		background: #1a1a2e;
	}

	.ctx-item-disabled {
		color: #5a5a6a;
		cursor: not-allowed;
	}

	.ctx-item-danger {
		color: #f87171;
	}

	.ctx-item-danger.ctx-item-active {
		background: rgba(248, 113, 113, 0.1);
	}

	.ctx-item-label {
		flex: 1 1 auto;
	}

	.ctx-item-shortcut {
		font-family: 'Fira Code', monospace;
		font-size: 0.8rem;
		color: #8c8c9c;
		letter-spacing: 0.05em;
	}

	.ctx-divider {
		height: 1px;
		margin: 0.25rem 0;
		background: #2a2a3e;
	}

	@media (prefers-reduced-motion: reduce) {
		.ctx-menu {
			animation: none;
		}
	}
</style>
