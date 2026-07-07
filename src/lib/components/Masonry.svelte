<!--
  ===========================================================
  MASONRY
  ===========================================================
  WHAT — A responsive masonry layout that spreads items across N
         balanced columns, placing each item into whichever column
         is currently shortest (measured by real pixel height).
  WHY  — Reach for this when items have varying heights (image
         galleries, cards, notes) and a plain CSS grid leaves ugly
         ragged gaps. Unlike CSS `columns`, this keeps each item as a
         single indivisible block and balances column heights.

  FEATURES
  • Generic over the item type `T` — render anything via the `item` snippet.
  • Shortest-column-first packing keeps columns height-balanced.
  • Items stay in source order within each column.
  • `columns` accepts a fixed number OR a responsive map
    ({ base: 1, sm: 2, lg: 3 }) resolved against the container width.
  • ResizeObserver re-balances on container OR content resize
    (e.g. late-loading images), and is disconnected on unmount.

  ACCESSIBILITY
  • Pure layout primitive — renders a plain container, adds no roles
    that would fight your content's semantics.
  • Item mount fade is gated behind `prefers-reduced-motion`.

  DEPENDENCIES — zero (Svelte 5 + native ResizeObserver only).

  PERFORMANCE — One measure pass per resize; packing is O(items × columns).
  Suitable for a few hundred items. Column widths come from flexbox, so
  no per-item width maths runs on the main thread.

  USAGE
    <Masonry items={photos} columns={{ base: 1, sm: 2, lg: 3 }} gap={16}>
      {#snippet item(photo)}
        <img src={photo.src} alt={photo.alt} />
      {/snippet}
    </Masonry>

  PROPS
  | Prop    | Type                                   | Default | Description |
  |---------|----------------------------------------|---------|-------------|
  | items   | T[]                                    | []      | Items to lay out |
  | item    | Snippet<[T, number]>                   | —       | Renders one item (receives item + index) |
  | columns | number \| Partial<Record<Bp, number>>  | 3       | Fixed count or responsive breakpoint map |
  | gap     | number                                 | 16      | Gap in px between columns and items |
  | class   | string                                 | ''      | Extra class on the container |
  ===========================================================
-->

<script lang="ts" generics="T">
	import { type Snippet } from 'svelte';

	/** Tailwind-aligned breakpoints (min-width, px). `base` is the 0-width default. */
	type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	const BREAKPOINTS: Record<Breakpoint, number> = {
		base: 0,
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280,
		'2xl': 1536
	};

	interface Props {
		/** The items to distribute across columns. */
		items?: T[];
		/** Renders a single item. Receives the item and its source index. */
		item?: Snippet<[T, number]>;
		/**
		 * Number of columns. Either a fixed number, or a responsive map keyed by
		 * breakpoint — the widest breakpoint whose min-width fits the container wins.
		 */
		columns?: number | Partial<Record<Breakpoint, number>>;
		/** Gap in pixels between columns and between stacked items. */
		gap?: number;
		/** Extra CSS class on the container. */
		class?: string;
	}

	let {
		items = [],
		item,
		columns = 3,
		gap = 16,
		class: className = ''
	}: Props = $props();

	// --- Element refs -------------------------------------------------------
	let containerEl = $state<HTMLDivElement | null>(null);
	// Indexed by item source index; each rendered item binds its element here.
	let itemEls = $state<(HTMLElement | null)[]>([]);

	// --- Measured state -----------------------------------------------------
	let containerWidth = $state(0);
	let heights = $state<number[]>([]);

	/** Resolve the effective column count for the current container width. */
	function resolveColumns(
		cols: number | Partial<Record<Breakpoint, number>>,
		width: number
	): number {
		if (typeof cols === 'number') return Math.max(1, Math.floor(cols));
		// Walk breakpoints ascending; the last one whose min-width fits wins.
		let chosen = 1;
		for (const key of Object.keys(BREAKPOINTS) as Breakpoint[]) {
			const value = cols[key];
			if (value == null) continue;
			if (width >= BREAKPOINTS[key]) chosen = value;
		}
		return Math.max(1, Math.floor(chosen));
	}

	let numCols = $derived(resolveColumns(columns, containerWidth));

	/**
	 * Assign each item to a column by always feeding the currently shortest
	 * column. Because every column is the same width, an item's height does not
	 * depend on which column it lands in, so this converges in a single pass.
	 * Before heights are measured we fall back to a round-robin so the first
	 * paint is still sensible (and correct in source order).
	 */
	let assignment = $derived.by<number[]>(() => {
		const n = items.length;
		const cols = numCols;
		const measured = heights.length === n && heights.every((h) => h > 0);
		if (!measured) {
			// Round-robin fallback: item i → column i % cols.
			return Array.from({ length: n }, (_, i) => i % cols);
		}
		const colHeights = new Array(cols).fill(0);
		const result = new Array<number>(n);
		for (let i = 0; i < n; i++) {
			// Shortest column wins; ties go to the leftmost (lowest index).
			let shortest = 0;
			for (let c = 1; c < cols; c++) {
				if (colHeights[c] < colHeights[shortest]) shortest = c;
			}
			result[i] = shortest;
			colHeights[shortest] += heights[i] + gap;
		}
		return result;
	});

	/** Group items into columns as [{ item, index }] preserving source order. */
	let columnItems = $derived.by(() => {
		const cols: { value: T; index: number }[][] = Array.from(
			{ length: numCols },
			() => []
		);
		items.forEach((value, index) => {
			const col = assignment[index] ?? index % numCols;
			cols[col].push({ value, index });
		});
		return cols;
	});

	/** Read every item's rendered height; only commit when something changed. */
	function measure() {
		const next = items.map((_, i) => itemEls[i]?.getBoundingClientRect().height ?? 0);
		const changed =
			next.length !== heights.length ||
			next.some((h, i) => Math.abs(h - heights[i]) > 0.5);
		if (changed) heights = next;
	}

	// One ResizeObserver watches the container (width → column count) AND every
	// item (content/image resize → re-balance). It is rebuilt whenever the
	// rendered element set changes, and disconnected on unmount. Measurement is
	// coalesced into a rAF so a burst of resizes triggers a single pass.
	$effect(() => {
		if (!containerEl) return;

		// Referencing these makes the effect rerun when the rendered set changes,
		// so newly bound item elements always get observed.
		const container = containerEl;
		const els = itemEls.filter((el): el is HTMLElement => el != null);

		let frame = 0;
		const observer = new ResizeObserver(() => {
			containerWidth = container.clientWidth;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(measure);
		});

		containerWidth = container.clientWidth;
		observer.observe(container);
		for (const el of els) observer.observe(el);
		measure();

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={containerEl}
	class={`masonry ${className}`.trim()}
	style={`--masonry-gap:${gap}px`}
>
	{#each columnItems as col, colIndex (colIndex)}
		<div class="masonry__col">
			{#each col as entry (entry.index)}
				<div class="masonry__item" bind:this={itemEls[entry.index]}>
					{@render item?.(entry.value, entry.index)}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.masonry {
		display: flex;
		align-items: flex-start;
		gap: var(--masonry-gap, 16px);
		width: 100%;
	}

	.masonry__col {
		display: flex;
		flex-direction: column;
		gap: var(--masonry-gap, 16px);
		/* Equal-width columns — the width maths lives entirely in flexbox. */
		flex: 1 1 0;
		min-width: 0;
	}

	.masonry__item {
		/* Items are indivisible blocks; never let one be clipped by the column. */
		min-width: 0;
	}

	/* Gentle mount fade — only for users who accept motion. */
	@media (prefers-reduced-motion: no-preference) {
		.masonry__item {
			animation: masonry-fade 240ms ease both;
		}
	}

	@keyframes masonry-fade {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
