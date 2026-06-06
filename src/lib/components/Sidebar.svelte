<!--
  ===========================================================
  SIDEBAR
  ===========================================================
  WHAT — A collapsible navigation rail with sections, icons, an
         active-item highlight, and a mobile off-canvas drawer mode.
  WHY  — Reach for this as the primary left-hand nav of an app
         shell: it adapts from a roomy expanded rail to an icon-only
         strip on the desktop, and collapses into a backdrop drawer
         on small screens.
  FEATURES
    - Expanded (icon + label) <-> collapsed (icon-only + tooltip) toggle
    - Nested section groups with expand/collapse
    - Active item highlight via activeHref + aria-current="page"
    - Mobile drawer: hamburger, backdrop, Escape, focus trap + restore
    - Collapsed state persisted to localStorage (SSR-guarded)
  ACCESSIBILITY
    - <nav> landmark, aria-label, aria-current on the active link
    - Drawer is role="dialog" aria-modal; Escape closes; focus is
      trapped while open and restored to the trigger on close
    - Group toggles expose aria-expanded; :focus-visible rings
    - Honours prefers-reduced-motion
  DEPENDENCIES — none (inline SVG, scoped CSS)
  PERFORMANCE — Pure CSS transitions; no layout thrash. Items are a
    flat-ish tree so render cost is O(items).
  USAGE
    <Sidebar items={items} activeHref="/dashboard" />
  PROPS — | Prop | Type | Default | Description |
  ===========================================================
-->
<script lang="ts">
	interface SidebarItem {
		label: string;
		href?: string;
		icon?: string;
		children?: SidebarItem[];
	}

	interface Props {
		/** The navigation tree. Items may nest one level via `children`. */
		items?: SidebarItem[];
		/** href of the current page — drives the active highlight. */
		activeHref?: string;
		/** Heading shown at the top of the rail (hidden when collapsed). */
		title?: string;
		/** Start collapsed (icon-only). Overridden by a stored preference. */
		collapsed?: boolean;
		/** localStorage key for persisting the collapsed state. Empty = no persist. */
		storageKey?: string;
		/** Accessible label for the nav landmark and drawer. */
		ariaLabel?: string;
		/** Bindable: true while the mobile drawer is open. */
		mobileOpen?: boolean;
	}

	let {
		items = [],
		activeHref = '',
		title = 'Menu',
		collapsed = $bindable(false),
		storageKey = 'tfe-sidebar-collapsed',
		ariaLabel = 'Main navigation',
		mobileOpen = $bindable(false)
	}: Props = $props();

	// Small SSR-/test-safe accessor: localStorage isn't present during SSR,
	// and some test environments expose `window` without it.
	function safeStorage(): Storage | null {
		try {
			if (typeof window === 'undefined') return null;
			return window.localStorage ?? null;
		} catch {
			return null;
		}
	}

	// Restore the persisted collapsed preference (client-only, guarded).
	$effect(() => {
		if (!storageKey) return;
		const stored = safeStorage()?.getItem(storageKey);
		if (stored != null) collapsed = stored === '1';
	});

	function toggleCollapsed() {
		collapsed = !collapsed;
		if (storageKey) safeStorage()?.setItem(storageKey, collapsed ? '1' : '0');
	}

	// Track which groups are open. Default: a group is open if it owns the active item.
	let openGroups = $state<Record<string, boolean>>({});

	function groupOwnsActive(item: SidebarItem): boolean {
		return !!item.children?.some((c) => c.href === activeHref);
	}

	function isGroupOpen(item: SidebarItem, key: string): boolean {
		return openGroups[key] ?? groupOwnsActive(item);
	}

	function toggleGroup(key: string, item: SidebarItem) {
		openGroups[key] = !isGroupOpen(item, key);
	}

	// --- Mobile drawer: focus management ----------------------------------
	let drawerEl = $state<HTMLElement | null>(null);
	let triggerEl = $state<HTMLButtonElement | null>(null);

	function openDrawer() {
		mobileOpen = true;
	}
	function closeDrawer() {
		mobileOpen = false;
		triggerEl?.focus();
	}

	$effect(() => {
		if (!mobileOpen || !drawerEl) return;
		// Move focus into the drawer when it opens.
		const focusables = () =>
			Array.from(
				drawerEl!.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
		focusables()[0]?.focus();

		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeDrawer();
				return;
			}
			if (e.key !== 'Tab') return;
			const list = focusables();
			if (list.length === 0) return;
			const first = list[0];
			const last = list[list.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});

	function keyFor(item: SidebarItem, i: number): string {
		return item.href ?? `${item.label}-${i}`;
	}
</script>

<!-- Mobile hamburger — only visible at narrow widths -->
<button
	class="sb-hamburger"
	bind:this={triggerEl}
	onclick={openDrawer}
	aria-label="Open {ariaLabel}"
	aria-expanded={mobileOpen}
	type="button"
>
	<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
		<path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
	</svg>
</button>

{#if mobileOpen}
	<!-- Backdrop: click to dismiss the drawer -->
	<div
		class="sb-backdrop"
		onclick={closeDrawer}
		role="presentation"
	></div>
{/if}

<nav
	bind:this={drawerEl}
	class="sb-rail"
	class:collapsed
	class:mobile-open={mobileOpen}
	aria-label={ariaLabel}
	role={mobileOpen ? 'dialog' : undefined}
	aria-modal={mobileOpen ? 'true' : undefined}
>
	<div class="sb-head">
		{#if !collapsed}<span class="sb-title">{title}</span>{/if}
		<button
			class="sb-collapse"
			onclick={toggleCollapsed}
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			aria-pressed={collapsed}
			type="button"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" class:flip={collapsed}>
				<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<!-- Close button — only meaningful in the mobile drawer -->
		<button class="sb-close" onclick={closeDrawer} aria-label="Close {ariaLabel}" type="button">
			<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
				<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	<ul class="sb-list">
		{#each items as item, i (keyFor(item, i))}
			{@const key = keyFor(item, i)}
			<li class="sb-item">
				{#if item.children?.length}
					<button
						class="sb-link sb-group"
						onclick={() => toggleGroup(key, item)}
						aria-expanded={isGroupOpen(item, key)}
						type="button"
					>
						{#if item.icon}<span class="sb-icon" aria-hidden="true">{item.icon}</span>{/if}
						{#if !collapsed}<span class="sb-label">{item.label}</span>{/if}
						{#if !collapsed}
							<svg class="sb-chev" class:open={isGroupOpen(item, key)} viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
								<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{/if}
						{#if collapsed}<span class="sb-tooltip">{item.label}</span>{/if}
					</button>
					{#if isGroupOpen(item, key) && !collapsed}
						<ul class="sb-sublist">
							{#each item.children as child, ci (child.href ?? `${child.label}-${ci}`)}
								<li>
									<a
										class="sb-link sb-sublink"
										href={child.href}
										aria-current={child.href === activeHref ? 'page' : undefined}
										class:active={child.href === activeHref}
									>
										{#if child.icon}<span class="sb-icon" aria-hidden="true">{child.icon}</span>{/if}
										<span class="sb-label">{child.label}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					<a
						class="sb-link"
						href={item.href}
						aria-current={item.href === activeHref ? 'page' : undefined}
						class:active={item.href === activeHref}
					>
						{#if item.icon}<span class="sb-icon" aria-hidden="true">{item.icon}</span>{/if}
						{#if !collapsed}<span class="sb-label">{item.label}</span>{/if}
						{#if collapsed}<span class="sb-tooltip">{item.label}</span>{/if}
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Theme tokens — light defaults, overridden for dark scheme below. */
	.sb-rail {
		--sb-bg: #ffffff;
		--sb-fg: #1f2430;
		--sb-muted: #5b6472;
		--sb-border: #e6e8ec;
		--sb-hover: #f1f3f7;
		--sb-active-bg: #eef2ff;
		--sb-active-fg: #4338ca;
		--sb-accent: #6366f1;

		display: flex;
		flex-direction: column;
		width: 248px;
		height: 100%;
		background: var(--sb-bg);
		color: var(--sb-fg);
		border-right: 1px solid var(--sb-border);
		box-sizing: border-box;
		transition: width 0.22s ease;
		overflow: hidden;
	}
	.sb-rail.collapsed {
		width: 64px;
	}

	@media (prefers-color-scheme: dark) {
		.sb-rail {
			--sb-bg: #14161c;
			--sb-fg: #e7eaf0;
			--sb-muted: #98a2b3;
			--sb-border: #262a33;
			--sb-hover: #1d2129;
			--sb-active-bg: #1e1b4b;
			--sb-active-fg: #c7d2fe;
			--sb-accent: #818cf8;
		}
	}

	.sb-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-bottom: 1px solid var(--sb-border);
		min-height: 56px;
		box-sizing: border-box;
	}
	.sb-title {
		font-weight: 700;
		font-size: 0.95rem;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
	}
	.sb-collapse,
	.sb-close,
	.sb-hamburger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid var(--sb-border, #e6e8ec);
		border-radius: 8px;
		color: inherit;
		cursor: pointer;
		padding: 0.35rem;
		transition: background 0.15s ease;
	}
	.sb-collapse:hover,
	.sb-close:hover,
	.sb-hamburger:hover {
		background: var(--sb-hover);
	}
	.sb-collapse svg.flip {
		transform: rotate(180deg);
	}
	.sb-rail.collapsed .sb-head {
		justify-content: center;
	}
	/* Close button is only for the mobile drawer */
	.sb-close {
		display: none;
	}

	.sb-list {
		list-style: none;
		margin: 0;
		padding: 0.5rem;
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.sb-sublist {
		list-style: none;
		margin: 0.15rem 0 0.15rem 0;
		padding: 0 0 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.sb-link {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.7rem;
		width: 100%;
		padding: 0.55rem 0.6rem;
		border: none;
		background: transparent;
		color: var(--sb-fg);
		font: inherit;
		font-size: 0.9rem;
		text-align: left;
		text-decoration: none;
		border-radius: 8px;
		cursor: pointer;
		box-sizing: border-box;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.sb-link:hover {
		background: var(--sb-hover);
	}
	.sb-link.active {
		background: var(--sb-active-bg);
		color: var(--sb-active-fg);
		font-weight: 600;
	}
	.sb-link.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.35rem;
		bottom: 0.35rem;
		width: 3px;
		border-radius: 0 3px 3px 0;
		background: var(--sb-accent);
	}
	.sb-link:focus-visible {
		outline: 2px solid var(--sb-accent);
		outline-offset: 2px;
	}
	.sb-icon {
		flex: 0 0 auto;
		width: 1.4rem;
		text-align: center;
		font-size: 1.05rem;
		line-height: 1;
	}
	.sb-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sb-sublink {
		font-size: 0.85rem;
		color: var(--sb-muted);
		padding: 0.4rem 0.6rem;
	}
	.sb-chev {
		margin-left: auto;
		transition: transform 0.18s ease;
	}
	.sb-chev.open {
		transform: rotate(180deg);
	}

	.sb-rail.collapsed .sb-link {
		justify-content: center;
		padding: 0.55rem 0;
	}

	/* Tooltip — only rendered/shown when collapsed */
	.sb-tooltip {
		position: absolute;
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%) scale(0.96);
		background: var(--sb-fg);
		color: var(--sb-bg);
		padding: 0.3rem 0.55rem;
		border-radius: 6px;
		font-size: 0.78rem;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s ease, transform 0.12s ease;
		z-index: 20;
	}
	.sb-link:hover .sb-tooltip,
	.sb-link:focus-visible .sb-tooltip {
		opacity: 1;
		transform: translateY(-50%) scale(1);
	}

	/* --- Mobile hamburger + drawer ------------------------------------- */
	.sb-hamburger {
		display: none;
		position: absolute;
		top: 0.6rem;
		left: 0.6rem;
		z-index: 40;
		background: var(--sb-bg, #fff);
		color: var(--sb-fg, #1f2430);
	}
	.sb-backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 30;
		animation: sb-fade 0.18s ease;
	}
	@keyframes sb-fade {
		from {
			opacity: 0;
		}
	}

	/* Containing-block-aware mobile mode: the rail goes off-canvas inside
	   its positioned ancestor, not the viewport. */
	@media (max-width: 640px) {
		.sb-hamburger {
			display: inline-flex;
		}
		.sb-rail {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			width: 248px;
			z-index: 35;
			transform: translateX(-110%);
			transition: transform 0.24s ease;
			box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25);
		}
		.sb-rail.collapsed {
			width: 248px; /* drawer is always full width when open */
		}
		.sb-rail.mobile-open {
			transform: translateX(0);
		}
		.sb-rail .sb-collapse {
			display: none; /* collapse toggle is desktop-only */
		}
		.sb-close {
			display: inline-flex;
		}
		.sb-rail .sb-label {
			display: inline; /* always show labels in the drawer */
		}
		.sb-tooltip {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sb-rail,
		.sb-chev,
		.sb-tooltip,
		.sb-collapse svg {
			transition: none;
		}
		.sb-backdrop {
			animation: none;
		}
	}
</style>
