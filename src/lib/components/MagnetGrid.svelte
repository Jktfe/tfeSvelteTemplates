<script lang="ts" module>
	// ============================================================
	// MagnetGrid — pure helpers + types
	//
	// A cursor-driven displacement field. The pure helpers below
	// (grid layout, smoothstep falloff, displacement vector) live
	// in module scope so the test suite can exercise them without
	// rendering. The component body is the pointer-tracking
	// dispatcher and per-cell CSS custom-property writes.
	// ============================================================

	export type CellIndex = { row: number; col: number };
	export type Vec2 = { x: number; y: number };
	export type Displacement = { dx: number; dy: number };
	export type Policy = 'attract' | 'repel';

	const VALID_POLICIES: readonly Policy[] = ['attract', 'repel'];

	/**
	 * Generate every cell index in row-major order.
	 *
	 * Returns a flat array of {row, col} pairs. Non-finite or
	 * sub-1 dimensions return an empty array so the component
	 * never iterates over NaN entries.
	 */
	export function gridIndices(cols: number, rows: number): CellIndex[] {
		if (!Number.isFinite(cols) || !Number.isFinite(rows)) return [];
		if (cols < 1 || rows < 1) return [];
		const safeCols = Math.floor(cols);
		const safeRows = Math.floor(rows);
		const indices: CellIndex[] = [];
		for (let r = 0; r < safeRows; r += 1) {
			for (let c = 0; c < safeCols; c += 1) {
				indices.push({ row: r, col: c });
			}
		}
		return indices;
	}

	/**
	 * Centre point of a cell in pixel coordinates.
	 *
	 * Uses (col + 0.5) * cellW so the centre lies inside the cell
	 * regardless of dimensions (a 100px cell at col 0 returns
	 * x=50). Non-finite or non-positive dimensions return 0,0.
	 */
	export function cellCenter(
		row: number,
		col: number,
		cellW: number,
		cellH: number
	): Vec2 {
		const r = Number.isFinite(row) ? row : 0;
		const c = Number.isFinite(col) ? col : 0;
		const w = Number.isFinite(cellW) && cellW > 0 ? cellW : 0;
		const h = Number.isFinite(cellH) && cellH > 0 ? cellH : 0;
		return { x: (c + 0.5) * w, y: (r + 0.5) * h };
	}

	/**
	 * Smoothstep falloff: (1 - clamp(d/r, 0, 1))².
	 *
	 * Returns 1 at distance 0, 0 at distance ≥ radius, with a
	 * smooth quadratic transition. Non-finite inputs or
	 * non-positive radius return 0.
	 */
	export function falloff(dist: number, radius: number): number {
		if (!Number.isFinite(dist) || !Number.isFinite(radius)) return 0;
		if (radius <= 0) return 0;
		const d = Math.max(0, dist);
		const t = Math.min(1, d / radius);
		const inv = 1 - t;
		return inv * inv;
	}

	/**
	 * Displacement vector for a cell relative to the cursor.
	 *
	 *  - 'attract' pulls cells toward the cursor.
	 *  - 'repel'   pushes them away.
	 *
	 * Magnitude scales by `falloff(dist, radius) * strength`. Outside
	 * the radius (or at the cursor exactly) the result is {0, 0}.
	 */
	export function displacement(
		cellX: number,
		cellY: number,
		cursorX: number,
		cursorY: number,
		radius: number,
		strength: number,
		policy: Policy = 'attract'
	): Displacement {
		if (
			!Number.isFinite(cellX) ||
			!Number.isFinite(cellY) ||
			!Number.isFinite(cursorX) ||
			!Number.isFinite(cursorY)
		) {
			return { dx: 0, dy: 0 };
		}
		const dx0 = cursorX - cellX;
		const dy0 = cursorY - cellY;
		const dist = Math.hypot(dx0, dy0);
		const f = falloff(dist, radius);
		if (f === 0 || dist === 0) return { dx: 0, dy: 0 };
		const sign = policy === 'repel' ? -1 : 1;
		const s = Number.isFinite(strength) ? strength : 0;
		const ux = dx0 / dist;
		const uy = dy0 / dist;
		const dx = sign * ux * f * s;
		const dy = sign * uy * f * s;
		// Normalise -0 to +0 so toBe(0) tests don't trip on Object.is.
		return {
			dx: dx === 0 ? 0 : dx,
			dy: dy === 0 ? 0 : dy
		};
	}

	/**
	 * Validate a policy string. Falls back to 'attract' for
	 * unknown input so consumers passing user data never crash.
	 */
	export function pickPolicy(name: string): Policy {
		if (VALID_POLICIES.includes(name as Policy)) return name as Policy;
		return 'attract';
	}

	/**
	 * SSR-safe wrapper around matchMedia('(prefers-reduced-motion:
	 * reduce)'). Returns false on the server; on the client honours
	 * the user's pref.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	type Props = {
		cols?: number;
		rows?: number;
		radius?: number;
		strength?: number;
		policy?: Policy | string;
		cellSize?: number;
		gap?: number;
		class?: string;
		cell?: Snippet<[number, number]>;
	};

	const {
		cols = 8,
		rows = 6,
		radius = 140,
		strength = 24,
		policy = 'attract',
		cellSize = 36,
		gap = 0,
		class: extraClass = '',
		cell
	}: Props = $props();

	const safePolicy = $derived(pickPolicy(typeof policy === 'string' ? policy : 'attract'));
	const safeCols = $derived(Math.max(1, Math.floor(Number.isFinite(cols) ? cols : 8)));
	const safeRows = $derived(Math.max(1, Math.floor(Number.isFinite(rows) ? rows : 6)));
	const cells = $derived(gridIndices(safeCols, safeRows));

	let containerEl = $state<HTMLDivElement | null>(null);
	let reduced = $state(false);
	let pointerActive = $state(false);

	onMount(() => {
		reduced = isReducedMotion();
	});

	function handleMove(event: PointerEvent) {
		if (!containerEl || reduced) return;
		const rect = containerEl.getBoundingClientRect();
		const cx = event.clientX - rect.left;
		const cy = event.clientY - rect.top;
		pointerActive = true;
		const cellEls = containerEl.querySelectorAll<HTMLElement>('.magnet-grid__cell');
		const stride = cellSize + gap;
		cellEls.forEach((el) => {
			const r = Number(el.dataset.row ?? 0);
			const c = Number(el.dataset.col ?? 0);
			const center = cellCenter(r, c, stride, stride);
			const d = displacement(center.x, center.y, cx, cy, radius, strength, safePolicy);
			el.style.setProperty('--cell-dx', `${d.dx}px`);
			el.style.setProperty('--cell-dy', `${d.dy}px`);
		});
	}

	function handleLeave() {
		if (!containerEl) return;
		pointerActive = false;
		const cellEls = containerEl.querySelectorAll<HTMLElement>('.magnet-grid__cell');
		cellEls.forEach((el) => {
			el.style.setProperty('--cell-dx', '0px');
			el.style.setProperty('--cell-dy', '0px');
		});
	}
</script>

<div
	bind:this={containerEl}
	role="presentation"
	class="magnet-grid {extraClass}"
	data-policy={safePolicy}
	data-reduced={reduced ? 'true' : 'false'}
	data-active={pointerActive ? 'true' : 'false'}
	style:--magnet-cols={safeCols}
	style:--magnet-rows={safeRows}
	style:--magnet-cell-size={`${cellSize}px`}
	style:--magnet-gap={`${gap}px`}
	onpointermove={handleMove}
	onpointerleave={handleLeave}
>
	{#each cells as { row, col } (row * safeCols + col)}
		<div
			class="magnet-grid__cell"
			data-row={row}
			data-col={col}
			style:--cell-dx="0px"
			style:--cell-dy="0px"
		>
			{#if cell}
				{@render cell(row, col)}
			{:else}
				<span class="magnet-grid__dot" aria-hidden="true"></span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.magnet-grid {
		display: grid;
		grid-template-columns: repeat(var(--magnet-cols, 8), var(--magnet-cell-size, 36px));
		grid-auto-rows: var(--magnet-cell-size, 36px);
		gap: var(--magnet-gap, 0px);
		touch-action: none;
		user-select: none;
	}

	.magnet-grid__cell {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translate(var(--cell-dx, 0px), var(--cell-dy, 0px));
		transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.magnet-grid[data-active='true'] .magnet-grid__cell {
		transition: transform 60ms linear;
	}

	.magnet-grid__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.6;
	}

	@media (prefers-reduced-motion: reduce) {
		.magnet-grid__cell {
			transform: none !important;
			transition: none !important;
		}
	}
</style>
