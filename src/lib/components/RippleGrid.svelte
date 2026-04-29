<!--
  ============================================================
  RIPPLEGRID
  ============================================================

  WHAT IT DOES
  An N×M grid of cells where clicking one sends a wave outward —
  each cell pulses on the wave's leading edge, with arrival delay
  proportional to grid distance from the click. Multiple waves
  compose; rapid clicks layer cleanly.

  FEATURES
  - 'manhattan' | 'chebyshev' | 'euclidean' distance modes
  - Optional 'hex' variant (offset odd rows by half a cell)
  - Multi-ripple composition with mix-blend-mode: screen
  - maxConcurrent cap to keep render bounded
  - Pure CSS one-shot animation per ripple layer (no per-frame JS)
  - Keyboard parity: arrow keys navigate, Enter/Space fires a ripple
  - prefers-reduced-motion: reduce → instant colour pulse, no scale

  ACCESSIBILITY
  - Wrapper role="grid", cells role="gridcell"
  - Each cell is a <button> (focusable, keyboard-activatable)
  - Reduced-motion users get the pulse without the wave
  - aria-label on grid carries a configurable description

  PERFORMANCE
  - No rAF in the steady state — animation is CSS-driven
  - Layer count is bounded: rows × cols × maxConcurrent
  - For large grids (40×24 × 3 = 2880 layers) keep maxConcurrent ≤ 3

  USAGE
  <RippleGrid cols={20} rows={12} cellSize={24} />

  ============================================================
-->

<script lang="ts" module>
	export type DistanceMode = 'manhattan' | 'chebyshev' | 'euclidean';
	export type GridVariant = 'rect' | 'hex';

	export interface Point {
		row: number;
		col: number;
	}

	export interface Ripple {
		id: number;
		origin: Point;
		startedAt: number;
	}

	/**
	 * Distance between two grid points under a chosen metric.
	 * - manhattan: |dr| + |dc| — diamond-shaped wavefront
	 * - chebyshev: max(|dr|, |dc|) — square wavefront
	 * - euclidean: hypot(dr, dc) — circular wavefront (default)
	 */
	export function gridDistance(
		a: Point,
		b: Point,
		mode: DistanceMode = 'euclidean'
	): number {
		const dr = a.row - b.row;
		const dc = a.col - b.col;
		if (mode === 'manhattan') return Math.abs(dr) + Math.abs(dc);
		if (mode === 'chebyshev') return Math.max(Math.abs(dr), Math.abs(dc));
		return Math.sqrt(dr * dr + dc * dc);
	}

	/**
	 * Time (ms) until the wavefront reaches a cell. speed is in cells/sec.
	 * Defensive: speed ≤ 0 → 0 (every cell fires immediately).
	 */
	export function delayForCell(
		origin: Point,
		cell: Point,
		speed: number,
		mode: DistanceMode = 'euclidean'
	): number {
		if (speed <= 0) return 0;
		const d = gridDistance(origin, cell, mode);
		return (d / speed) * 1000;
	}

	/**
	 * Per-cell pulse intensity at time `now` for a single ripple.
	 * Returns 0 outside the cell's active window, sin-shaped in [0, 1] within.
	 */
	export function cellIntensity(
		ripple: Ripple,
		cell: Point,
		now: number,
		duration: number,
		speed: number,
		mode: DistanceMode = 'euclidean'
	): number {
		if (duration <= 0) return 0;
		const delay = delayForCell(ripple.origin, cell, speed, mode);
		const t = now - ripple.startedAt - delay;
		if (t < 0 || t > duration) return 0;
		return Math.sin((Math.PI * t) / duration);
	}

	/**
	 * Maximum intensity across all active ripples for one cell.
	 * Using max (not sum) keeps overlap from blowing out colour.
	 */
	export function composeRipples(
		ripples: Ripple[],
		cell: Point,
		now: number,
		duration: number,
		speed: number,
		mode: DistanceMode = 'euclidean'
	): number {
		let max = 0;
		for (const r of ripples) {
			const i = cellIntensity(r, cell, now, duration, speed, mode);
			if (i > max) max = i;
		}
		return max;
	}

	/**
	 * Drop oldest ripples beyond the concurrent cap. Preserves order.
	 */
	export function clampConcurrent(ripples: Ripple[], max: number): Ripple[] {
		if (max <= 0) return [];
		if (ripples.length <= max) return ripples.slice();
		return ripples.slice(ripples.length - max);
	}

	/**
	 * Total lifetime (ms) of a ripple in this grid: max delay + duration.
	 */
	export function rippleLifetime(
		rows: number,
		cols: number,
		speed: number,
		duration: number,
		mode: DistanceMode = 'euclidean'
	): number {
		if (speed <= 0) return Math.max(0, duration);
		let farthest: number;
		if (mode === 'manhattan') farthest = (rows - 1) + (cols - 1);
		else if (mode === 'chebyshev') farthest = Math.max(rows - 1, cols - 1);
		else farthest = Math.sqrt((rows - 1) * (rows - 1) + (cols - 1) * (cols - 1));
		return (farthest / speed) * 1000 + Math.max(0, duration);
	}

	/** SSR-safe wrapper around prefers-reduced-motion media query. */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		if (typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** Number of columns. */
		cols?: number;
		/** Number of rows. */
		rows?: number;
		/** Cell edge length in px. */
		cellSize?: number;
		/** Gap between cells in px. */
		gap?: number;
		/** Accent colour for the pulse. Any CSS colour. */
		colour?: string;
		/** Pulse duration per cell in ms. */
		rippleDuration?: number;
		/** Wave propagation speed in cells/sec. */
		rippleSpeed?: number;
		/** Cap on simultaneous ripples. */
		maxConcurrent?: number;
		/** Distance metric used for the wavefront. */
		distanceMode?: DistanceMode;
		/** Grid variant — rect or staggered hex rows. */
		variant?: GridVariant;
		/** Optional aria-label for the grid. */
		ariaLabel?: string;
		/** Optional click callback with cell coordinates. */
		onRipple?: (event: { row: number; col: number }) => void;
		/** Extra class names appended to the wrapper. */
		class?: string;
	}

	let {
		cols = 20,
		rows = 12,
		cellSize = 24,
		gap = 2,
		colour = '#6366f1',
		rippleDuration = 700,
		rippleSpeed = 12,
		maxConcurrent = 3,
		distanceMode = 'euclidean',
		variant = 'rect',
		ariaLabel = 'Ripple grid — click any cell to send a wave',
		onRipple,
		class: extraClass = ''
	}: Props = $props();

	let ripples = $state<Ripple[]>([]);
	let nextId = 0;
	let prefersReduced = $state(false);
	let focusRow = $state(0);
	let focusCol = $state(0);

	onMount(() => {
		prefersReduced = isReducedMotion();
		if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			const handler = (e: MediaQueryListEvent) => {
				prefersReduced = e.matches;
			};
			mq.addEventListener?.('change', handler);
			return () => mq.removeEventListener?.('change', handler);
		}
	});

	const lifetime = $derived(
		rippleLifetime(rows, cols, rippleSpeed, rippleDuration, distanceMode)
	);

	function fireRipple(row: number, col: number): void {
		const id = nextId++;
		const next = clampConcurrent(
			[...ripples, { id, origin: { row, col }, startedAt: performance.now() }],
			maxConcurrent
		);
		ripples = next;
		onRipple?.({ row, col });

		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, lifetime + 16);
	}

	function handleCellClick(row: number, col: number): void {
		focusRow = row;
		focusCol = col;
		fireRipple(row, col);
	}

	function handleKeyDown(event: KeyboardEvent, row: number, col: number): void {
		const key = event.key;
		if (key === 'Enter' || key === ' ') {
			event.preventDefault();
			fireRipple(row, col);
			return;
		}
		let nr = row;
		let nc = col;
		if (key === 'ArrowUp') nr = Math.max(0, row - 1);
		else if (key === 'ArrowDown') nr = Math.min(rows - 1, row + 1);
		else if (key === 'ArrowLeft') nc = Math.max(0, col - 1);
		else if (key === 'ArrowRight') nc = Math.min(cols - 1, col + 1);
		else return;
		event.preventDefault();
		focusRow = nr;
		focusCol = nc;
		const cellId = `cell-${nr}-${nc}`;
		const next = document.getElementById(cellId);
		next?.focus();
	}

	function layerDelay(ripple: Ripple, row: number, col: number): number {
		return delayForCell(ripple.origin, { row, col }, rippleSpeed, distanceMode);
	}
</script>

<div
	class="ripple-grid {variant} {extraClass}"
	class:reduced={prefersReduced}
	role="grid"
	aria-label={ariaLabel}
	style="--rg-cell: {cellSize}px; --rg-gap: {gap}px; --rg-cols: {cols}; --rg-rows: {rows}; --rg-colour: {colour}; --rg-duration: {rippleDuration}ms;"
>
	{#each Array.from({ length: rows }, (_, r) => r) as r (r)}
		<div class="row" role="row" class:offset={variant === 'hex' && r % 2 === 1}>
			{#each Array.from({ length: cols }, (_, c) => c) as c (c)}
				{@const isFocus = r === focusRow && c === focusCol}
				<button
					id="cell-{r}-{c}"
					class="cell"
					role="gridcell"
					type="button"
					tabindex={isFocus ? 0 : -1}
					aria-label="Cell row {r + 1} column {c + 1}"
					onclick={() => handleCellClick(r, c)}
					onkeydown={(e) => handleKeyDown(e, r, c)}
				>
					{#each ripples as ripple (ripple.id)}
						<span
							class="layer"
							style="--rg-delay: {layerDelay(ripple, r, c)}ms;"
						></span>
					{/each}
				</button>
			{/each}
		</div>
	{/each}
</div>

<style>
	.ripple-grid {
		display: inline-flex;
		flex-direction: column;
		gap: var(--rg-gap);
		padding: var(--rg-gap);
		background: rgba(15, 23, 42, 0.04);
		border-radius: 0.5rem;
		isolation: isolate;
	}

	.row {
		display: flex;
		gap: var(--rg-gap);
	}

	.row.offset {
		margin-left: calc(var(--rg-cell) / 2 + var(--rg-gap) / 2);
	}

	.cell {
		position: relative;
		width: var(--rg-cell);
		height: var(--rg-cell);
		border: none;
		padding: 0;
		margin: 0;
		background: rgba(15, 23, 42, 0.08);
		border-radius: 4px;
		cursor: pointer;
		overflow: hidden;
		transition: background 0.15s ease;
	}

	.cell:hover {
		background: rgba(15, 23, 42, 0.14);
	}

	.cell:focus-visible {
		outline: 2px solid var(--rg-colour);
		outline-offset: 2px;
		z-index: 1;
	}

	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: var(--rg-colour);
		opacity: 0;
		transform: scale(0.6);
		mix-blend-mode: screen;
		animation: rg-pulse var(--rg-duration) ease-out forwards;
		animation-delay: var(--rg-delay);
		border-radius: 4px;
	}

	@keyframes rg-pulse {
		0% {
			opacity: 0;
			transform: scale(0.6);
		}
		35% {
			opacity: 0.9;
			transform: scale(1.08);
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}

	.ripple-grid.reduced .layer {
		animation: rg-pulse-reduced var(--rg-duration) linear forwards;
		animation-delay: var(--rg-delay);
	}

	@keyframes rg-pulse-reduced {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 0;
		}
	}
</style>
