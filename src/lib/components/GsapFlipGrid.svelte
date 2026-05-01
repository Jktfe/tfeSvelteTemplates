<!--
	============================================================
	GsapFlipGrid - Animated CSS Grid Reordering with GSAP Flip
	============================================================

	[CR] WHAT IT DOES
	Provides a reusable Svelte wrapper around GSAP Flip for filtering,
	sorting, density changes, and promoted-card reordering inside CSS Grid.

	[NTL] THE SIMPLE VERSION
	It lets cards move smoothly into their new places when users filter,
	sort, or feature an item, instead of making the page jump.

	============================================================

	FEATURES:
	- Filter buttons for item groups
	- Featured and compact density modes
	- Curated and alphabetical ordering
	- Click-to-promote card behavior
	- Reduced-motion path that changes layout without interpolation
	- Exported pure helpers for tests and agent reuse

	PERFECT FOR:
	- Dense component directories
	- Visual catalogs with a featured item
	- Replacing CardStack where there are too many cards to browse comfortably

	NOT IDEAL FOR:
	- Data tables requiring column-level semantics
	- Infinite masonry feeds or virtualized lists

	DEPENDENCIES:
	- gsap
	- gsap/Flip
	- $lib/gsap/context for SSR-safe plugin loading
	- $lib/styles/gsap-tokens.css for suite styling

	ACCESSIBILITY:
	- Filter and layout controls are native buttons
	- Card destinations render as real anchors when href is supplied
	- aria-pressed exposes active controls
	- prefers-reduced-motion skips Flip animation

	WARNINGS:
	- The Flip measurement depends on layout being stable before animation.
	- Keep grid item IDs stable between renders.

	============================================================
-->

<script lang="ts" module>
	export interface GsapFlipGridItem {
		id: string;
		title: string;
		description: string;
		href?: string;
		icon?: string;
		image?: string;
		meta?: string;
		category?: string;
		filter?: string;
		tags?: string[];
		accent?: string;
	}

	export interface GsapFlipGridFilter {
		id: string;
		label: string;
	}

	export type GsapFlipGridDensity = 'featured' | 'compact';
	export type GsapFlipGridSort = 'curated' | 'alpha';

	export function normalizeFlipGridItems(items: GsapFlipGridItem[]): GsapFlipGridItem[] {
		return items
			.filter((item) => item.title.trim().length > 0)
			.map((item, index) => ({
				...item,
				id: item.id || `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`
			}));
	}

	export function normalizeFlipGridFilters(filters: GsapFlipGridFilter[]): GsapFlipGridFilter[] {
		// Plain Set is correct here: function-local dedupe inside a pure utility.
		// SvelteSet would add reactivity overhead with no consumer — see Pattern #85 in CLAUDE.md.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set<string>();
		const resolved = [{ id: 'all', label: 'All' }, ...filters].filter((filter) => {
			if (!filter.id || seen.has(filter.id)) return false;
			seen.add(filter.id);
			return true;
		});
		return resolved.length ? resolved : [{ id: 'all', label: 'All' }];
	}

	export function filterFlipGridItems(
		items: GsapFlipGridItem[],
		activeFilter: string
	): GsapFlipGridItem[] {
		if (activeFilter === 'all') return items;
		return items.filter(
			(item) =>
				item.filter === activeFilter || item.category === activeFilter || item.tags?.includes(activeFilter)
		);
	}

	export function sortFlipGridItems(
		items: GsapFlipGridItem[],
		sortMode: GsapFlipGridSort
	): GsapFlipGridItem[] {
		if (sortMode === 'alpha') {
			return [...items].sort((a, b) => a.title.localeCompare(b.title));
		}
		return [...items];
	}

	export function orderFlipGridItems(
		items: GsapFlipGridItem[],
		promotedId: string | undefined,
		sortMode: GsapFlipGridSort
	): GsapFlipGridItem[] {
		const sorted = sortFlipGridItems(items, sortMode);
		if (!promotedId) return sorted;
		const promoted = sorted.find((item) => item.id === promotedId);
		if (!promoted) return sorted;
		return [promoted, ...sorted.filter((item) => item.id !== promotedId)];
	}
</script>

<script lang="ts">
	import '$lib/styles/gsap-tokens.css';

	import { onMount, tick } from 'svelte';
	import { prefersReducedMotion, registerGsapPlugins, type Gsap } from '$lib/gsap/context';

	interface Props {
		items?: GsapFlipGridItem[];
		filters?: GsapFlipGridFilter[];
		title?: string;
		eyebrow?: string;
		description?: string;
		initialFilter?: string;
		initialFeaturedId?: string;
		initialDensity?: GsapFlipGridDensity;
		initialSort?: GsapFlipGridSort;
		showHeader?: boolean;
		showControls?: boolean;
		promoteOnClick?: boolean;
		controlsLabel?: string;
		class?: string;
	}

	type FlipPlugin = typeof import('gsap/Flip').Flip;

	const fallbackItems: GsapFlipGridItem[] = [
		{
			id: 'catalog',
			title: 'Component catalog',
			description: 'A dense grid of copyable component entries with animated position changes.',
			meta: 'Grid',
			category: 'Structure',
			filter: 'structure',
			accent: '#ff6a3d'
		},
		{
			id: 'promote',
			title: 'Featured promotion',
			description: 'Click a card to move it into the feature slot while the grid keeps its place.',
			meta: 'FLIP',
			category: 'Motion',
			filter: 'motion',
			accent: '#5eb3ff'
		},
		{
			id: 'filter',
			title: 'Filter states',
			description: 'Change filters or sorting without layout jumps or manual transform math.',
			meta: 'CSS Grid',
			category: 'State',
			filter: 'state',
			accent: '#4dd4ac'
		}
	];

	let {
		items = fallbackItems,
		filters = [],
		title = 'Animated CSS Grid positions',
		eyebrow = 'GSAP Flip Grid',
		description = 'A reusable grid/gallery primitive that animates real CSS Grid position changes with GSAP Flip.',
		initialFilter = 'all',
		initialFeaturedId,
		initialDensity = 'featured',
		initialSort = 'curated',
		showHeader = true,
		showControls = true,
		promoteOnClick = true,
		controlsLabel = 'Filter and arrange grid items',
		class: className = ''
	}: Props = $props();

	let grid: HTMLElement | null = null;
	let gsapInstance: Gsap | null = null;
	let flipPlugin: FlipPlugin | null = null;
	// svelte-ignore state_referenced_locally
	let activeFilter = $state(initialFilter);
	// svelte-ignore state_referenced_locally
	let activeItemId = $state(initialFeaturedId ?? items[0]?.id);
	// svelte-ignore state_referenced_locally
	let density = $state<GsapFlipGridDensity>(initialDensity);
	// svelte-ignore state_referenced_locally
	let sortMode = $state<GsapFlipGridSort>(initialSort);

	const normalizedItems = $derived(normalizeFlipGridItems(items));
	const normalizedFilters = $derived(normalizeFlipGridFilters(filters));
	const visibleItems = $derived(
		orderFlipGridItems(filterFlipGridItems(normalizedItems, activeFilter), activeItemId, sortMode)
	);

	function motionTargets(): HTMLElement[] {
		return grid ? Array.from(grid.querySelectorAll<HTMLElement>('[data-flip-grid-card]')) : [];
	}

	async function withFlip(mutate: () => void) {
		if (!grid || !flipPlugin || prefersReducedMotion()) {
			mutate();
			await tick();
			return;
		}

		const targets = motionTargets();
		const state = targets.length
			? flipPlugin.getState(targets, { props: 'opacity,backgroundColor,color,borderColor' })
			: null;

		mutate();
		await tick();

		const nextTargets = motionTargets();
		if (!state || nextTargets.length === 0) return;

		gsapInstance?.killTweensOf(nextTargets);
		flipPlugin.from(state, {
			duration: 0.62,
			ease: 'power3.inOut',
			absolute: true,
			prune: true,
			stagger: 0.024,
			onEnter: (elements: Element[]) =>
				gsapInstance?.fromTo(
					elements,
					{ autoAlpha: 0, scale: 0.94, y: 18 },
					{ autoAlpha: 1, scale: 1, y: 0, duration: 0.36, ease: 'power3.out' }
				),
			onLeave: (elements: Element[]) =>
				gsapInstance?.to(elements, {
					autoAlpha: 0,
					scale: 0.96,
					duration: 0.24,
					ease: 'power2.out'
				})
		});
	}

	function nextVisibleFor(filterId: string, promotedId = activeItemId): GsapFlipGridItem[] {
		return orderFlipGridItems(filterFlipGridItems(normalizedItems, filterId), promotedId, sortMode);
	}

	async function setFilter(filterId: string) {
		if (filterId === activeFilter) return;
		await withFlip(() => {
			activeFilter = filterId;
			const nextItems = nextVisibleFor(filterId);
			if (!nextItems.some((item) => item.id === activeItemId)) {
				activeItemId = nextItems[0]?.id;
			}
		});
	}

	async function setDensity(nextDensity: GsapFlipGridDensity) {
		if (nextDensity === density) return;
		await withFlip(() => {
			density = nextDensity;
		});
	}

	async function setSort(nextSort: GsapFlipGridSort) {
		if (nextSort === sortMode) return;
		await withFlip(() => {
			sortMode = nextSort;
		});
	}

	async function promote(itemId: string, event?: MouseEvent) {
		if (!promoteOnClick) return;
		event?.preventDefault();
		await withFlip(() => {
			activeItemId = itemId;
			if (density !== 'featured') density = 'featured';
		});
	}

	onMount(() => {
		let cancelled = false;

		void (async () => {
			const [gsap, flipModule] = await Promise.all([
				registerGsapPlugins(['Flip']),
				import('gsap/Flip')
			]);
			if (cancelled) return;
			gsapInstance = gsap;
			flipPlugin = flipModule.Flip;

			if (!prefersReducedMotion() && grid) {
				gsap.from(grid.querySelectorAll('[data-flip-grid-card]'), {
					autoAlpha: 0,
					y: 20,
					scale: 0.97,
					duration: 0.5,
					stagger: 0.035,
					ease: 'power3.out',
					clearProps: 'opacity,visibility,transform'
				});
			}
		})();

		return () => {
			cancelled = true;
			gsapInstance?.killTweensOf(motionTargets());
		};
	});
</script>

<section class={`gsap-flip-grid ${className}`} data-density={density}>
	{#if showHeader}
		<header class="flip-grid__header">
			<div>
				<p>{eyebrow}</p>
				<h3>{title}</h3>
				<span>{description}</span>
			</div>
		</header>
	{/if}

	{#if showControls}
		<div class="flip-grid__controls" role="group" aria-label={controlsLabel}>
			<div class="flip-grid__control-group" role="group" aria-label="Filter grid">
				{#each normalizedFilters as filter (filter.id)}
					<button
						type="button"
						class:active={activeFilter === filter.id}
						aria-pressed={activeFilter === filter.id}
						onclick={() => setFilter(filter.id)}
					>
						{filter.label}
					</button>
				{/each}
			</div>
			<div class="flip-grid__control-group" role="group" aria-label="Layout mode">
				<button
					type="button"
					class:active={density === 'featured'}
					aria-pressed={density === 'featured'}
					onclick={() => setDensity('featured')}
				>
					Feature
				</button>
				<button
					type="button"
					class:active={density === 'compact'}
					aria-pressed={density === 'compact'}
					onclick={() => setDensity('compact')}
				>
					Compact
				</button>
				<button
					type="button"
					class:active={sortMode === 'alpha'}
					aria-pressed={sortMode === 'alpha'}
					onclick={() => setSort(sortMode === 'alpha' ? 'curated' : 'alpha')}
				>
					{sortMode === 'alpha' ? 'Curated' : 'A-Z'}
				</button>
			</div>
		</div>
	{/if}

	<div bind:this={grid} class="flip-grid__grid" data-density={density}>
		{#each visibleItems as item (item.id)}
			<a
				class="flip-grid__card"
				class:is-featured={density === 'featured' && item.id === activeItemId}
				href={item.href ?? '#'}
				style={`--flip-accent: ${item.accent ?? '#ff6a3d'};`}
				data-flip-id={item.id}
				data-flip-grid-card
				data-filter={item.filter ?? 'all'}
				onclick={(event) => promote(item.id, event)}
			>
				{#if item.image}
					<span class="flip-grid__image">
						<img src={item.image} alt={`${item.title} preview`} loading="lazy" />
					</span>
				{/if}
				<span class="flip-grid__content">
					<span class="flip-grid__topline">
						<span class="flip-grid__icon" aria-hidden="true">{item.icon ?? 'G'}</span>
						{#if item.meta}
							<span class="flip-grid__meta">{item.meta}</span>
						{/if}
					</span>
					<strong>{item.title}</strong>
					<span class="flip-grid__description">{item.description}</span>
					{#if item.category}
						<span class="flip-grid__category">{item.category}</span>
					{/if}
				</span>
			</a>
		{/each}
	</div>

	{#if visibleItems.length === 0}
		<p class="flip-grid__empty">No matching grid items.</p>
	{/if}
</section>

<style>
	.gsap-flip-grid {
		display: grid;
		gap: var(--gsap-space-4);
		min-width: 0;
		color: var(--gsap-fg);
		font-family: var(--gsap-font-sans);
	}

	.flip-grid__header {
		display: flex;
		justify-content: space-between;
		gap: var(--gsap-space-4);
	}

	.flip-grid__header p,
	.flip-grid__header h3,
	.flip-grid__header span {
		margin: 0;
	}

	.flip-grid__header p {
		color: var(--gsap-accent);
		font-size: var(--gsap-text-xs);
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.flip-grid__header h3 {
		margin-top: 0.25rem;
		color: var(--gsap-fg-strong);
		font-size: var(--gsap-text-xl);
		line-height: 1.1;
	}

	.flip-grid__header span {
		display: block;
		max-width: 64ch;
		margin-top: 0.55rem;
		color: var(--gsap-fg-muted);
		font-size: var(--gsap-text-sm);
		line-height: 1.55;
	}

	.flip-grid__controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gsap-space-3);
		flex-wrap: wrap;
	}

	.flip-grid__control-group {
		display: flex;
		gap: var(--gsap-space-2);
		flex-wrap: wrap;
	}

	.flip-grid__control-group button {
		min-height: 2.25rem;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-pill);
		background: var(--gsap-surface-1);
		color: var(--gsap-fg);
		font: inherit;
		font-size: var(--gsap-text-sm);
		font-weight: 750;
		cursor: pointer;
		transition:
			border-color var(--gsap-duration-fast) var(--gsap-ease-out),
			background var(--gsap-duration-fast) var(--gsap-ease-out),
			color var(--gsap-duration-fast) var(--gsap-ease-out);
	}

	.flip-grid__control-group button:hover,
	.flip-grid__control-group button:focus-visible {
		border-color: var(--gsap-accent);
		outline: none;
	}

	.flip-grid__control-group button.active {
		border-color: var(--gsap-accent);
		background: var(--gsap-accent);
		color: var(--gsap-accent-ink);
	}

	.flip-grid__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
		grid-auto-flow: dense;
		gap: var(--gsap-space-3);
		align-items: stretch;
		min-width: 0;
	}

	.flip-grid__card {
		position: relative;
		min-width: 0;
		min-height: 178px;
		display: grid;
		grid-template-rows: auto 1fr;
		overflow: hidden;
		border: 1px solid var(--gsap-border);
		border-radius: var(--gsap-radius-md);
		background:
			linear-gradient(145deg, color-mix(in srgb, var(--flip-accent), transparent 88%), transparent 48%),
			var(--gsap-surface-1);
		box-shadow: var(--gsap-shadow-1);
		color: inherit;
		text-decoration: none;
		will-change: transform, opacity;
		transition:
			border-color var(--gsap-duration-fast) var(--gsap-ease-out),
			box-shadow var(--gsap-duration-fast) var(--gsap-ease-out),
			transform var(--gsap-duration-fast) var(--gsap-ease-out);
	}

	.flip-grid__card:hover,
	.flip-grid__card:focus-visible {
		border-color: color-mix(in srgb, var(--flip-accent), var(--gsap-border) 28%);
		box-shadow: var(--gsap-shadow-2);
		outline: none;
		transform: translateY(-2px);
	}

	.flip-grid__card.is-featured {
		grid-column: span 2;
		grid-row: span 2;
		min-height: 360px;
	}

	.flip-grid__image {
		display: block;
		height: 118px;
		overflow: hidden;
		background: color-mix(in srgb, var(--flip-accent), var(--gsap-surface-2) 74%);
	}

	.flip-grid__card.is-featured .flip-grid__image {
		height: 176px;
	}

	.flip-grid__image img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: center;
	}

	.flip-grid__content {
		min-width: 0;
		display: grid;
		align-content: start;
		gap: var(--gsap-space-2);
		padding: var(--gsap-space-4);
	}

	.flip-grid__topline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gsap-space-2);
		min-width: 0;
	}

	.flip-grid__icon {
		display: grid;
		width: 2rem;
		height: 2rem;
		flex: 0 0 auto;
		place-items: center;
		border-radius: var(--gsap-radius-sm);
		background: color-mix(in srgb, var(--flip-accent), transparent 82%);
		color: var(--flip-accent);
		font-size: var(--gsap-text-sm);
		font-weight: 900;
	}

	.flip-grid__meta {
		min-width: 0;
		color: var(--gsap-fg-subtle);
		font-size: var(--gsap-text-xs);
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}

	.flip-grid__card strong {
		color: var(--gsap-fg-strong);
		font-size: var(--gsap-text-md);
		line-height: 1.16;
		overflow-wrap: anywhere;
	}

	.flip-grid__card.is-featured strong {
		font-size: var(--gsap-text-xl);
	}

	.flip-grid__description {
		display: -webkit-box;
		overflow: hidden;
		color: var(--gsap-fg-muted);
		font-size: var(--gsap-text-sm);
		line-height: 1.48;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.flip-grid__card.is-featured .flip-grid__description {
		line-clamp: 5;
		-webkit-line-clamp: 5;
	}

	.flip-grid__category {
		justify-self: start;
		margin-top: var(--gsap-space-1);
		padding: 0.18rem 0.55rem;
		border: 1px solid color-mix(in srgb, var(--flip-accent), transparent 70%);
		border-radius: var(--gsap-radius-pill);
		background: color-mix(in srgb, var(--flip-accent), transparent 88%);
		color: var(--flip-accent);
		font-size: 0.7rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.flip-grid__empty {
		margin: 0;
		padding: var(--gsap-space-4);
		border: 1px dashed var(--gsap-border);
		border-radius: var(--gsap-radius-md);
		color: var(--gsap-fg-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.flip-grid__control-group button,
		.flip-grid__card {
			transition: none;
		}

		.flip-grid__card:hover,
		.flip-grid__card:focus-visible {
			transform: none;
		}
	}

	@media (max-width: 720px) {
		.flip-grid__controls {
			align-items: stretch;
		}

		.flip-grid__control-group {
			width: 100%;
		}

		.flip-grid__control-group button {
			flex: 1 1 auto;
		}

		.flip-grid__card.is-featured {
			grid-column: span 1;
			grid-row: span 1;
			min-height: 178px;
		}

		.flip-grid__card.is-featured .flip-grid__image {
			height: 118px;
		}

		.flip-grid__card.is-featured strong {
			font-size: var(--gsap-text-md);
		}
	}
</style>
