<script lang="ts">
	/*
	 * Breadcrumbs
	 *
	 * Hierarchical path navigation. Renders an ordered list of links from a
	 * conceptual root (e.g. Home) to the current page. The last item is
	 * rendered as plain text with aria-current="page" — it's not a link
	 * because it represents the page the user is already on.
	 *
	 * When the path is long, collapses the middle into a "..." marker so the
	 * row stays single-line on narrow screens. Always preserves the first and
	 * last items (the user always wants to see where they started and where
	 * they are now).
	 *
	 * Accessibility:
	 *   - <nav aria-label="Breadcrumb"> wrapper
	 *   - <ol> with semantic ordering
	 *   - aria-current="page" on the final item
	 *   - separators are aria-hidden so screen readers don't read "slash"
	 *
	 * Theming:
	 *   Six CSS custom properties scoped to .breadcrumbs, with light defaults
	 *   inline and a dark flip under @media (prefers-color-scheme: dark).
	 *   - --breadcrumbs-fg            base text colour (slate-600 / slate-400)
	 *   - --breadcrumbs-fg-strong     hover + current label (slate-900 / slate-50)
	 *   - --breadcrumbs-link-hover-bg link hover background (slate-100 / slate-800)
	 *   - --breadcrumbs-focus-ring    keyboard focus outline (TFE blue / blue-400)
	 *   - --breadcrumbs-ellipsis-fg   "…" marker colour (slate-400 / slate-500)
	 *   - --breadcrumbs-separator-fg  divider colour (slate-300 / slate-600)
	 *
	 *   Override at any scope (`:root`, ancestor, or `.dark` class) and the
	 *   nearest declaration wins. Example — recolour for a brand:
	 *       :root { --breadcrumbs-focus-ring: #db2777; }
	 *
	 * Usage:
	 *   <Breadcrumbs items={[
	 *     { label: 'Home', href: '/' },
	 *     { label: 'Components', href: '/components' },
	 *     { label: 'Breadcrumbs' }
	 *   ]} />
	 */

	export type Crumb = {
		label: string;
		href?: string;
	};

	type Props = {
		items: Crumb[];
		separator?: string;
		maxVisible?: number;
		ariaLabel?: string;
		class?: string;
	};

	let {
		items,
		separator = '/',
		maxVisible = 0,
		ariaLabel = 'Breadcrumb',
		class: className = ''
	}: Props = $props();

	type RenderItem = Crumb | { ellipsis: true };

	function buildVisible(crumbs: Crumb[], max: number): RenderItem[] {
		if (max <= 0 || crumbs.length <= max) return crumbs;
		// Always keep first and last; pad with last (max-2) items, then ellipsis
		const last = crumbs.slice(-(max - 2));
		return [crumbs[0], { ellipsis: true }, ...last];
	}

	const visible = $derived(buildVisible(items, maxVisible));
</script>

<nav aria-label={ariaLabel} class="breadcrumbs {className}">
	<ol class="breadcrumb-list">
		{#each visible as item, index (index)}
			{@const isLast = index === visible.length - 1}
			<li class="breadcrumb-item">
				{#if 'ellipsis' in item}
					<span class="crumb-ellipsis" aria-hidden="true">…</span>
				{:else if isLast || !item.href}
					<span class="crumb-current" aria-current={isLast ? 'page' : undefined}>
						{item.label}
					</span>
				{:else}
					<a class="crumb-link" href={item.href}>{item.label}</a>
				{/if}
				{#if !isLast}
					<span class="crumb-sep" aria-hidden="true">{separator}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		/* Light-mode chrome tokens. Override at :root, an ancestor, or a
		   .dark class to retheme without forking. */
		--breadcrumbs-fg: #475569;
		--breadcrumbs-fg-strong: #0f172a;
		--breadcrumbs-link-hover-bg: #f1f5f9;
		--breadcrumbs-focus-ring: #146ef5;
		--breadcrumbs-ellipsis-fg: #94a3b8;
		--breadcrumbs-separator-fg: #cbd5e1;

		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--breadcrumbs-fg);
	}

	.breadcrumb-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.breadcrumb-item {
		display: inline-flex;
		align-items: center;
		min-width: 0;
	}

	.crumb-link {
		color: var(--breadcrumbs-fg);
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		transition: background-color 0.15s ease, color 0.15s ease;
		max-width: 18ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.crumb-link:hover {
		background-color: var(--breadcrumbs-link-hover-bg);
		color: var(--breadcrumbs-fg-strong);
	}

	.crumb-link:focus-visible {
		outline: 2px solid var(--breadcrumbs-focus-ring);
		outline-offset: 2px;
	}

	.crumb-current {
		color: var(--breadcrumbs-fg-strong);
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		max-width: 22ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.crumb-ellipsis {
		padding: 0.25rem 0.5rem;
		color: var(--breadcrumbs-ellipsis-fg);
		user-select: none;
	}

	.crumb-sep {
		color: var(--breadcrumbs-separator-fg);
		padding: 0 0.125rem;
		user-select: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.crumb-link {
			transition: none;
		}
	}

	/*
	 * Dark mode — flip every chrome token so the path stays high-contrast
	 * on dark surfaces. Light text on dark hover patch, lighter slate
	 * separator, and a softer blue-400 focus ring (saturated TFE blue
	 * gets too vivid against deep slate). Consumer overrides at :root or
	 * any closer ancestor still win because their declarations cascade
	 * after these defaults — this block only fires when no override is
	 * present and the OS is in dark mode.
	 */
	@media (prefers-color-scheme: dark) {
		.breadcrumbs {
			--breadcrumbs-fg: #94a3b8;
			--breadcrumbs-fg-strong: #f8fafc;
			--breadcrumbs-link-hover-bg: #1e293b;
			--breadcrumbs-focus-ring: #60a5fa;
			--breadcrumbs-ellipsis-fg: #64748b;
			--breadcrumbs-separator-fg: #475569;
		}
	}
</style>
