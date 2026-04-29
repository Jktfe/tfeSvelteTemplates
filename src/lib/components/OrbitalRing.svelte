<script lang="ts" module>
	// ============================================================
	// OrbitalRing — pure helpers + types
	//
	// Layout maths and validation live here so the test suite can
	// assert distribution, transforms, counter-rotation, clamping,
	// and direction validation without rendering. The component
	// body is the rAF dispatcher and DOM lifecycle; everything
	// below is deterministic, pure, and DOM-free.
	// ============================================================

	export type Direction = 'clockwise' | 'counter-clockwise';

	const VALID_DIRECTIONS: readonly Direction[] = ['clockwise', 'counter-clockwise'];

	/**
	 * Distribute N positions evenly around a circle, in degrees.
	 *
	 * Returns an array of length `count` with angles starting at
	 * `startDeg` and stepping by 360/count. Non-finite or sub-1
	 * counts return an empty array so the component never iterates
	 * over NaN entries.
	 */
	export function distributeAngles(count: number, startDeg = 0): number[] {
		if (!Number.isFinite(count) || count < 1) return [];
		const safeStart = Number.isFinite(startDeg) ? startDeg : 0;
		const step = 360 / count;
		const angles: number[] = [];
		for (let i = 0; i < count; i += 1) {
			angles.push(safeStart + i * step);
		}
		return angles;
	}

	/**
	 * Position transform that pins a slot to the ring at `angleDeg`
	 * and `radius`. Output is the CSS `transform` string applied to
	 * the slot wrapper — note this does NOT include any counter-
	 * rotation; that lives on the inner content.
	 *
	 * Translation order: translate the slot to the centre, rotate by
	 * its angle, walk outward by `radius`. The leading translate
	 * keeps top-left anchoring centred on the ring.
	 */
	export function slotTransform(angleDeg: number, radius: number): string {
		if (!Number.isFinite(angleDeg) || !Number.isFinite(radius)) {
			return 'translate(-50%, -50%)';
		}
		const r = Math.max(0, radius);
		return `translate(-50%, -50%) rotate(${angleDeg}deg) translateY(${-r}px)`;
	}

	/**
	 * Counter-rotation that keeps a slot's content readable.
	 *
	 *  - `upright = true`  → world-frame upright. Compensates the
	 *    slot angle AND the ring rotation, so a face stays facing
	 *    the viewer regardless of where the ring has spun to.
	 *  - `upright = false` → ring-frame upright. Compensates only
	 *    the slot angle, so content rotates with the ring (a clock
	 *    face's numbers travel with the dial).
	 */
	export function contentRotation(
		angleDeg: number,
		ringRotationDeg: number,
		upright: boolean
	): number {
		const a = Number.isFinite(angleDeg) ? angleDeg : 0;
		const r = Number.isFinite(ringRotationDeg) ? ringRotationDeg : 0;
		const rotation = upright ? -(a + r) : -a;
		// Normalise -0 to +0 so toBe(0) tests don't trip on Object.is.
		return rotation === 0 ? 0 : rotation;
	}

	/**
	 * Validate a direction string. Falls back to 'clockwise' for
	 * unknown input so consumers passing user data never crash.
	 */
	export function pickDirection(name: string): Direction {
		if (VALID_DIRECTIONS.includes(name as Direction)) return name as Direction;
		return 'clockwise';
	}

	/**
	 * Defensive radius clamp. Non-finite or invalid bounds return
	 * `minPx` so the inline style never receives `NaNpx`.
	 */
	export function clampRadius(value: number, minPx = 20, maxPx = 2000): number {
		if (!Number.isFinite(value)) return minPx;
		if (!Number.isFinite(minPx) || !Number.isFinite(maxPx) || maxPx <= minPx) {
			return Number.isFinite(minPx) ? minPx : 0;
		}
		if (value < minPx) return minPx;
		if (value > maxPx) return maxPx;
		return value;
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

<script lang="ts" generics="T">
	import { onMount, onDestroy, type Snippet } from 'svelte';

	type Props = {
		items: T[];
		radius?: number;
		autoSpin?: boolean;
		spinDurationMs?: number;
		direction?: Direction | string;
		pauseOnHover?: boolean;
		counterRotateItems?: boolean;
		itemSize?: number;
		startAngleDeg?: number;
		class?: string;
		item?: Snippet<[T, number]>;
		center?: Snippet;
	};

	const {
		items,
		radius = 160,
		autoSpin = true,
		spinDurationMs = 20000,
		direction = 'clockwise',
		pauseOnHover = true,
		counterRotateItems = true,
		itemSize = 80,
		startAngleDeg = 0,
		class: extraClass = '',
		item,
		center
	}: Props = $props();

	const safeDirection = $derived(pickDirection(typeof direction === 'string' ? direction : 'clockwise'));
	const safeRadius = $derived(clampRadius(radius));
	const angles = $derived(distributeAngles(items?.length ?? 0, startAngleDeg));

	let ringRotation = $state(0);
	let reduced = $state(false);
	let hovered = $state(false);
	let visible = $state(true);
	let containerEl = $state<HTMLDivElement | null>(null);
	let rafId: number | null = null;
	let lastTs: number | null = null;
	let observer: IntersectionObserver | null = null;

	function tick(now: number) {
		if (lastTs === null) lastTs = now;
		const elapsed = now - lastTs;
		lastTs = now;

		const degPerMs = 360 / Math.max(spinDurationMs, 1);
		const sign = safeDirection === 'clockwise' ? 1 : -1;
		ringRotation = (ringRotation + sign * elapsed * degPerMs) % 360;

		rafId = requestAnimationFrame(tick);
	}

	function start() {
		if (rafId !== null) return;
		if (typeof window === 'undefined') return;
		if (reduced || !autoSpin) return;
		if (pauseOnHover && hovered) return;
		if (!visible) return;
		lastTs = null;
		rafId = requestAnimationFrame(tick);
	}

	function stop() {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		lastTs = null;
	}

	$effect(() => {
		if (autoSpin && !reduced && !(pauseOnHover && hovered) && visible) {
			start();
		} else {
			stop();
		}
	});

	onMount(() => {
		reduced = isReducedMotion();
		if (containerEl && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						visible = entry.isIntersecting;
					}
				},
				{ threshold: 0 }
			);
			observer.observe(containerEl);
		}
	});

	onDestroy(() => {
		stop();
		observer?.disconnect();
	});

	function handleEnter() {
		hovered = true;
	}

	function handleLeave() {
		hovered = false;
	}
</script>

<div
	bind:this={containerEl}
	role="list"
	class="orbital-ring {extraClass}"
	style:--orbital-radius={`${safeRadius}px`}
	style:--orbital-size={`${safeRadius * 2 + itemSize}px`}
	style:--orbital-item-size={`${itemSize}px`}
	style:--orbital-ring-rotation={`${ringRotation}deg`}
	data-direction={safeDirection}
	data-reduced={reduced ? 'true' : 'false'}
	onmouseenter={handleEnter}
	onmouseleave={handleLeave}
>
	<div class="orbital-ring__track">
		{#if center}
			<div class="orbital-ring__center" role="presentation">
				{@render center()}
			</div>
		{/if}
		{#each items as data, i (i)}
			<div
				role="listitem"
				class="orbital-ring__slot"
				style:--orbital-slot-angle={`${angles[i] ?? 0}deg`}
			>
				<div
					class="orbital-ring__content"
					class:orbital-ring__content--upright={counterRotateItems}
				>
					{@render item?.(data, i)}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.orbital-ring {
		position: relative;
		width: var(--orbital-size, 400px);
		height: var(--orbital-size, 400px);
		margin: 0 auto;
	}

	.orbital-ring__track {
		position: absolute;
		inset: 0;
		transform: rotate(var(--orbital-ring-rotation, 0deg));
		transform-origin: 50% 50%;
		will-change: transform;
	}

	.orbital-ring__center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(calc(var(--orbital-ring-rotation, 0deg) * -1));
	}

	.orbital-ring__slot {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--orbital-item-size, 80px);
		height: var(--orbital-item-size, 80px);
		transform:
			translate(-50%, -50%)
			rotate(var(--orbital-slot-angle, 0deg))
			translateY(calc(var(--orbital-radius, 160px) * -1));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.orbital-ring__content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		transform: rotate(calc(var(--orbital-slot-angle, 0deg) * -1));
	}

	.orbital-ring__content--upright {
		transform: rotate(calc(var(--orbital-slot-angle, 0deg) * -1 - var(--orbital-ring-rotation, 0deg)));
	}

	@media (prefers-reduced-motion: reduce) {
		.orbital-ring__track {
			transform: none !important;
			animation: none !important;
		}
		.orbital-ring__content--upright,
		.orbital-ring__content {
			transform: rotate(calc(var(--orbital-slot-angle, 0deg) * -1)) !important;
		}
	}
</style>
