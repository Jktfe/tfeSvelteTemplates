<!--
  ============================================================
  PixelTrail — Cursor-tracked decaying pixel trail
  ============================================================

  WHAT IT DOES
  Wraps any region (hero, card, page) and emits a chain of
  small "pixels" that follow the cursor and fade + scale + drift
  on a CSS keyframe. Pixels self-clean once their animation
  finishes — no rAF loop, no resize observer, no per-frame JS.

  FEATURES
  - Three sizes: small (4px) / medium (8px) / large (16px)
  - Three palettes: mono-white / cyber-cyan / sunset-warm
  - Density is distance-throttled, so a fast and slow drag
    produce visually-similar trails (one pixel per ~size px).
  - Trail-length cap drops oldest pixels first when exceeded.
  - prefers-reduced-motion safe — listener is never attached.
  - Pure helpers exported from `<script module>` for unit tests.

  ACCESSIBILITY
  - Visual-only layer is `aria-hidden`, `pointer-events: none`.
  - Wrapped content keeps its native focus/click semantics.
  - Reduced-motion users see a static wrapper, no movement.

  USAGE
      <PixelTrail>
          <section class="hero">…</section>
      </PixelTrail>

      <PixelTrail size="large" palette="cyber-cyan" trailLength={32}>
          <article>…</article>
      </PixelTrail>

  PROPS
  | Prop          | Type                                            | Default        |
  |---------------|-------------------------------------------------|----------------|
  | size          | 'small' | 'medium' | 'large'                    | 'medium'       |
  | palette       | 'mono-white' | 'cyber-cyan' | 'sunset-warm'      | 'mono-white'   |
  | trailLength   | number (clamped to [4, 64])                     | 16             |
  | duration      | number (ms, clamped to [200, 2000])             | 700            |
  | class         | string                                          | ''             |
  | children      | Snippet                                         | required       |

  ============================================================
-->

<script lang="ts" module>
	export type PixelTrailSize = 'small' | 'medium' | 'large';
	export type PixelTrailPalette = 'mono-white' | 'cyber-cyan' | 'sunset-warm';

	export interface SizeConfig {
		px: number;
		throttlePx: number;
	}

	export interface PaletteConfig {
		colors: readonly string[];
		shadow: string;
	}

	const SIZES: Record<PixelTrailSize, SizeConfig> = {
		small: { px: 4, throttlePx: 6 },
		medium: { px: 8, throttlePx: 10 },
		large: { px: 16, throttlePx: 18 }
	};

	const PALETTES: Record<PixelTrailPalette, PaletteConfig> = {
		'mono-white': {
			colors: ['#ffffff', '#f0f0f5', '#dcdce6'],
			shadow: 'rgba(255, 255, 255, 0.6)'
		},
		'cyber-cyan': {
			colors: ['#00f0ff', '#00bfff', '#0080ff'],
			shadow: 'rgba(0, 191, 255, 0.7)'
		},
		'sunset-warm': {
			colors: ['#ffea00', '#ff8c00', '#ff3d6e'],
			shadow: 'rgba(255, 140, 0, 0.7)'
		}
	};

	/**
	 * Returns the size config for a given size name, falling back to
	 * the medium preset for unknown values.
	 */
	export function pickSize(name: string | undefined): SizeConfig {
		if (name && name in SIZES) return SIZES[name as PixelTrailSize];
		return SIZES.medium;
	}

	/**
	 * Returns the palette config for a given palette name, falling
	 * back to mono-white for unknown values.
	 */
	export function pickPalette(name: string | undefined): PaletteConfig {
		if (name && name in PALETTES) return PALETTES[name as PixelTrailPalette];
		return PALETTES['mono-white'];
	}

	/**
	 * Clamps n to [0, 1]. Treats NaN and ±Infinity as 0.
	 */
	export function clamp01(n: number): number {
		if (!Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > 1) return 1;
		return n;
	}

	/**
	 * Clamps n to [0, max]. Treats NaN and ±Infinity as 0.
	 * `max` defaults to Number.MAX_SAFE_INTEGER.
	 */
	export function clampPositive(n: number, max: number = Number.MAX_SAFE_INTEGER): number {
		if (!Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > max) return max;
		return n;
	}

	/**
	 * Squared Euclidean distance between two 2D points. Squared form
	 * avoids the sqrt cost when only comparing against a threshold.
	 */
	export function distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return dx * dx + dy * dy;
	}

	let trailIdCounter = 0;

	/**
	 * Module-scoped counter producing unique trail-pixel IDs across
	 * all instances. Resets only on full module reload.
	 */
	export function nextTrailId(prefix: string = 'pt'): string {
		trailIdCounter += 1;
		return `${prefix}-${trailIdCounter}`;
	}

	/**
	 * Reads the prefers-reduced-motion media query. Returns false
	 * outside the browser so SSR is unaffected.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || !window.matchMedia) return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		size?: PixelTrailSize;
		palette?: PixelTrailPalette;
		trailLength?: number;
		duration?: number;
		class?: string;
		children?: Snippet;
	}

	let {
		size = 'medium',
		palette = 'mono-white',
		trailLength = 16,
		duration = 700,
		class: className = '',
		children
	}: Props = $props();

	type Pixel = {
		id: string;
		x: number;
		y: number;
		color: string;
	};

	let pixels: Pixel[] = $state([]);
	let lastX = 0;
	let lastY = 0;
	let hasLast = false;
	let colorIndex = 0;
	let reducedMotion = $state(false);

	const sizeConfig = $derived(pickSize(size));
	const paletteConfig = $derived(pickPalette(palette));
	const cappedLength = $derived(Math.round(clampPositive(trailLength, 64)) || 16);
	const safeDuration = $derived(Math.round(clampPositive(duration, 2000)) || 700);

	onMount(() => {
		reducedMotion = isReducedMotion();
	});

	function handleMove(event: MouseEvent) {
		if (reducedMotion) return;
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		if (hasLast) {
			const threshold = sizeConfig.throttlePx;
			if (distanceSquared(lastX, lastY, x, y) < threshold * threshold) return;
		}
		lastX = x;
		lastY = y;
		hasLast = true;

		const colors = paletteConfig.colors;
		const color = colors[colorIndex % colors.length];
		colorIndex += 1;
		const id = nextTrailId();

		pixels.push({ id, x, y, color });
		while (pixels.length > cappedLength) pixels.shift();

		setTimeout(() => {
			pixels = pixels.filter((p) => p.id !== id);
		}, safeDuration + 60);
	}

	function handleLeave() {
		hasLast = false;
	}
</script>

<!-- Decorative wrapper — wrapped child owns interaction. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="pixel-trail-wrapper {className}"
	onmousemove={handleMove}
	onmouseleave={handleLeave}
>
	{#if children}
		{@render children()}
	{/if}
	<div class="trail-layer" aria-hidden="true">
		{#each pixels as pixel (pixel.id)}
			<span
				class="pixel"
				style="
					left: {pixel.x}px;
					top: {pixel.y}px;
					--color: {pixel.color};
					--shadow: {paletteConfig.shadow};
					--size: {sizeConfig.px}px;
					--duration: {safeDuration}ms;
				"
			></span>
		{/each}
	</div>
</div>

<style>
	.pixel-trail-wrapper {
		position: relative;
		display: block;
	}

	.trail-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		z-index: 1;
	}

	.pixel {
		position: absolute;
		width: var(--size);
		height: var(--size);
		margin-left: calc(var(--size) / -2);
		margin-top: calc(var(--size) / -2);
		background: var(--color);
		box-shadow: 0 0 calc(var(--size) * 1.25) var(--shadow);
		animation: pixel-fade var(--duration) cubic-bezier(0.32, 0, 0.67, 0) forwards;
		pointer-events: none;
		will-change: opacity, transform;
	}

	@keyframes pixel-fade {
		0% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
		60% {
			opacity: 0.8;
		}
		100% {
			transform: scale(0.2) translateY(-6px);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pixel {
			display: none;
		}
	}
</style>
