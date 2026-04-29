<!--
  ============================================================
  MeshGradient

  🎯 WHAT IT DOES
  An ambient animated mesh-gradient backdrop. A small set of
  large, blurry radial-gradient "blobs" drift slowly across
  the surface; the GPU composites them through a single
  filter:blur layer so the result looks like a soft, smoky
  mesh — Stripe / Linear / Vercel marketing energy.

  ✨ FEATURES
  • 6 named palettes (sunset, aurora, ember, cosmic, mint,
    monochrome) plus per-blob colour cycling
  • Configurable blob count (1–12), blur radius, opacity,
    drift speed multiplier
  • Pure CSS @keyframes, zero rAF loop, zero canvas
  • Cascaded CSS custom properties — every position, colour
    and timing value is set inline so the GPU only touches
    its compositor layer
  • Settles to a static gradient under prefers-reduced-motion

  ♿ ACCESSIBILITY
  • Host carries role="presentation" — purely decorative
  • prefers-reduced-motion: reduce → all blob animations
    freeze at their first-frame position; static gradient
  • No keyboard or pointer interaction; doesn't steal focus
    or capture events from descendants

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • One DOM node per blob, default 5 blobs → 5 absolutely
    positioned divs. Tested smooth at 12 blobs.
  • All animation runs on the GPU through transform/opacity
    on a filter:blur layer; no layout thrash, no JS frame
    loop.
  • Deterministic blob layout → SSR-safe; no flash of
    unrendered content.

  🎨 USAGE
  <MeshGradient />
  <MeshGradient palette="aurora" blobCount={7} />
  <MeshGradient palette="cosmic" blur={120} opacity={0.85} speed={0.6} />

  📋 PROPS
  | Prop       | Type     | Default     | Description                                              |
  |------------|----------|-------------|----------------------------------------------------------|
  | palette    | Palette  | 'sunset'    | Named palette: sunset/aurora/ember/cosmic/mint/monochrome|
  | blobCount  | number   | 5           | How many blobs to render (clamped 1–12)                  |
  | blur       | number   | 80          | Blur radius in px (clamped ≥0)                           |
  | opacity    | number   | 0.7         | Container opacity (clamped 0–1)                          |
  | speed      | number   | 1           | Animation speed multiplier (0 freezes, clamped ≥0)       |
  | class      | string   | ''          | Extra classes on the host                                |

  ============================================================
-->

<script lang="ts" module>
	// ============================================================
	// MeshGradient — pure helpers + types
	//
	// All maths and validation live in module scope so the test
	// suite can verify palette pickers, blob layout, clamps, and
	// timing without rendering. The component body just wires
	// these helpers to props and hands the results to scoped CSS.
	// ============================================================

	export type Palette =
		| 'sunset'
		| 'aurora'
		| 'ember'
		| 'cosmic'
		| 'mint'
		| 'monochrome';

	const VALID_PALETTES: readonly Palette[] = [
		'sunset',
		'aurora',
		'ember',
		'cosmic',
		'mint',
		'monochrome'
	];

	/**
	 * Hand-picked palette tables. Each palette carries 5 colours
	 * chosen to blend cleanly under heavy blur — saturated mid-
	 * lights work better than pure pastels (they stay visible
	 * once the layer is blurred 80px) and avoid muddy grays
	 * (they go flat under a mix). Order matters: blobs cycle
	 * through this list by index, so adjacent blobs pick up
	 * adjacent palette entries.
	 */
	const PALETTES: Record<Palette, readonly string[]> = {
		sunset: ['#ff6b9d', '#feca57', '#ff9ff3', '#ff6b6b', '#a55eea'],
		aurora: ['#00f2fe', '#4facfe', '#43e97b', '#38f9d7', '#5ee7df'],
		ember: ['#f12711', '#f5af19', '#ff5e62', '#ff9966', '#fbb034'],
		cosmic: ['#7f00ff', '#e100ff', '#3a1c71', '#d76d77', '#5f2c82'],
		mint: ['#11998e', '#38ef7d', '#a8e063', '#56ab2f', '#80d0c7'],
		monochrome: ['#2c3e50', '#bdc3c7', '#7f8c8d', '#34495e', '#95a5a6']
	};

	/**
	 * Validate a palette name. Falls back to 'sunset' for
	 * unknown input so consumers passing user data never crash
	 * the layout.
	 */
	export function pickPalette(name: string): Palette {
		if (VALID_PALETTES.includes(name as Palette)) return name as Palette;
		return 'sunset';
	}

	/**
	 * Return the colour list for a named palette. Unknown names
	 * resolve to 'sunset' so callers always get a usable list.
	 */
	export function getPaletteColors(name: string): readonly string[] {
		return PALETTES[pickPalette(name)];
	}

	/** Clamp to [0, 1]. Non-finite input collapses to 0. */
	export function clamp01(n: number): number {
		if (!Number.isFinite(n)) return 0;
		if (n <= 0) return 0;
		if (n >= 1) return 1;
		return n;
	}

	/**
	 * Clamp to [0, ∞). Non-finite input falls back to `fallback`,
	 * which itself defaults to 0. Used for blur and speed where a
	 * negative or NaN value would corrupt the inline style.
	 */
	export function clampPositive(n: number, fallback = 0): number {
		if (!Number.isFinite(n)) return Math.max(0, fallback);
		return Math.max(0, n);
	}

	/**
	 * Clamp an integer to [min, max], flooring fractional input
	 * and falling back to `min` for non-finite values. Used to
	 * tame blob count so the array map never iterates over NaN.
	 */
	export function clampInt(n: number, min: number, max: number): number {
		if (!Number.isFinite(n)) return min;
		const floored = Math.floor(n);
		if (floored < min) return min;
		if (floored > max) return max;
		return floored;
	}

	export interface BlobLayout {
		/** Position percent across the host (0–100). */
		xPercent: number;
		yPercent: number;
		/** Blob diameter as percent of host's smaller dimension. */
		sizePercent: number;
		/** Hex colour drawn from the active palette. */
		color: string;
		/** Negative animation-delay in ms, so blobs start mid-cycle. */
		delayMs: number;
		/** Animation duration in ms — staggered so blobs don't sync. */
		durationMs: number;
	}

	/**
	 * Distribute a single blob using a golden-angle spiral. With
	 * count=1 the blob sits dead centre; with count>1 each blob
	 * walks outward along the spiral so coverage is even without
	 * a regular grid pattern.
	 *
	 * Returns {xPercent, yPercent} where 50/50 is the host centre.
	 * Out-of-range or non-finite inputs collapse to centre, which
	 * is a safe visible fallback.
	 */
	export function blobPosition(
		index: number,
		count: number
	): { xPercent: number; yPercent: number } {
		const i = Math.floor(index);
		const c = Math.floor(count);
		if (!Number.isFinite(i) || !Number.isFinite(c) || c < 1 || i < 0 || i >= c) {
			return { xPercent: 50, yPercent: 50 };
		}
		// Golden angle spaces consecutive points by the most-
		// irrational angle, giving the most uniform spread.
		const goldenAngle = 137.5077640500378;
		const angleRad = (i * goldenAngle * Math.PI) / 180;
		const ratio = c <= 1 ? 0 : Math.sqrt((i + 0.5) / c);
		const radiusPercent = 38;
		return {
			xPercent: 50 + Math.cos(angleRad) * ratio * radiusPercent,
			yPercent: 50 + Math.sin(angleRad) * ratio * radiusPercent
		};
	}

	/**
	 * Compute negative animation-delay and per-blob duration so
	 * blobs drift out of phase with each other. Blob 0 starts at
	 * baseDurationMs; each subsequent blob runs slightly slower
	 * and starts at a different point in its cycle.
	 */
	export function blobAnimation(
		index: number,
		count: number,
		baseDurationMs = 18000
	): { delayMs: number; durationMs: number } {
		if (!Number.isFinite(index) || !Number.isFinite(count) || index < 0) {
			return { delayMs: 0, durationMs: Math.max(1000, baseDurationMs) };
		}
		const safeBase = Number.isFinite(baseDurationMs)
			? Math.max(1000, baseDurationMs)
			: 18000;
		const safeCount = Math.max(1, Math.floor(count));
		const i = Math.floor(index);
		const durationMs = safeBase + i * 1500;
		const rawDelay = -(i * safeBase) / safeCount;
		// Normalise -0 to +0 so toBe(0) tests pass under Object.is.
		const delayMs = rawDelay === 0 ? 0 : rawDelay;
		return { delayMs, durationMs };
	}

	/** Pull the i-th colour from a palette, cycling on overflow. */
	export function blobColor(index: number, name: string): string {
		const colors = getPaletteColors(name);
		if (colors.length === 0) return '#000000';
		const i = Math.floor(Math.abs(Number.isFinite(index) ? index : 0));
		return colors[i % colors.length];
	}

	/**
	 * Blob diameter sizing: bigger blobs when there are fewer of
	 * them, so single-blob compositions still cover the host.
	 * Always returns a finite percent in [40, 90].
	 */
	export function blobSize(count: number): number {
		if (!Number.isFinite(count) || count < 1) return 70;
		const c = Math.floor(count);
		if (c === 1) return 90;
		if (c === 2) return 80;
		if (c <= 4) return 72;
		if (c <= 6) return 65;
		if (c <= 8) return 58;
		return 52;
	}

	/**
	 * Build the full layout array — one BlobLayout per blob —
	 * by composing the helpers above. This is what the render
	 * loop consumes; everything below it in the component is
	 * a thin wrapper over this single source of truth.
	 */
	export function buildBlobLayout(count: number, paletteName: string): BlobLayout[] {
		const c = clampInt(count, 1, 12);
		const palette = pickPalette(paletteName);
		const size = blobSize(c);
		const layout: BlobLayout[] = [];
		for (let i = 0; i < c; i += 1) {
			const pos = blobPosition(i, c);
			const anim = blobAnimation(i, c);
			layout.push({
				xPercent: pos.xPercent,
				yPercent: pos.yPercent,
				sizePercent: size,
				color: blobColor(i, palette),
				delayMs: anim.delayMs,
				durationMs: anim.durationMs
			});
		}
		return layout;
	}

	/**
	 * SSR-safe wrapper around matchMedia('(prefers-reduced-
	 * motion: reduce)'). Returns false on the server; on the
	 * client honours the user's pref. Tests stub matchMedia.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	type Props = {
		palette?: string;
		blobCount?: number;
		blur?: number;
		opacity?: number;
		speed?: number;
		class?: string;
	};

	let {
		palette = 'sunset',
		blobCount = 5,
		blur = 80,
		opacity = 0.7,
		speed = 1,
		class: extraClass = ''
	}: Props = $props();

	// Derived state — re-runs when any prop changes. Single
	// pipeline through the pure helpers so the test suite can
	// reproduce exactly what the DOM ends up showing.
	let activePalette = $derived(pickPalette(palette));
	let blobs = $derived(buildBlobLayout(blobCount, palette));
	let safeBlur = $derived(clampPositive(blur, 80));
	let safeOpacity = $derived(clamp01(opacity));
	// Animation speed multiplier — 0 freezes everything, higher
	// values run faster. We invert because animation-duration
	// scales inversely with speed (2× speed = ½ duration).
	let speedFactor = $derived(clampPositive(speed, 1));
</script>

<div
	class={`mesh-gradient ${extraClass}`}
	role="presentation"
	data-palette={activePalette}
	style:--mesh-blur={`${safeBlur}px`}
	style:--mesh-opacity={safeOpacity}
	style:--mesh-speed={speedFactor === 0 ? '0' : `${1 / speedFactor}`}
>
	{#each blobs as blob, i (i)}
		<div
			class="mesh-gradient__blob"
			data-index={i}
			style:--blob-x={`${blob.xPercent}%`}
			style:--blob-y={`${blob.yPercent}%`}
			style:--blob-size={`${blob.sizePercent}%`}
			style:--blob-color={blob.color}
			style:--blob-delay={`${blob.delayMs}ms`}
			style:--blob-duration={`${blob.durationMs}ms`}
		></div>
	{/each}
</div>

<style>
	.mesh-gradient {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		isolation: isolate;
		opacity: var(--mesh-opacity, 0.7);
		/* Heavy blur lives on the host so blobs composite into
		   one another rather than each sitting in its own blur
		   layer — that's what gives the soft mesh feel. */
		filter: blur(var(--mesh-blur, 80px));
		/* Background gives a base tint so the unblurred edges
		   don't reveal the host's parent through gaps between
		   blobs. Keeping this a near-neutral dark works for
		   most palettes; consumers can override via wrapper bg. */
		background: transparent;
		pointer-events: none;
	}

	.mesh-gradient__blob {
		position: absolute;
		left: var(--blob-x, 50%);
		top: var(--blob-y, 50%);
		width: var(--blob-size, 60%);
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background: radial-gradient(
			circle at 50% 50%,
			var(--blob-color, #ff6b9d) 0%,
			color-mix(in srgb, var(--blob-color, #ff6b9d) 40%, transparent) 45%,
			transparent 75%
		);
		/* The translate(-50%, -50%) anchors the blob's centre to
		   its (left, top) coordinate. Drift then rides on top
		   of that anchor — see @keyframes below. */
		transform: translate(-50%, -50%);
		animation: mesh-drift var(--blob-duration, 18000ms) ease-in-out infinite;
		animation-delay: var(--blob-delay, 0ms);
		/* speed multiplier rescales animation duration via
		   --mesh-speed; 1 = baseline, 0.5 = double speed,
		   2 = half speed. */
		animation-duration: calc(var(--blob-duration, 18000ms) * var(--mesh-speed, 1));
		will-change: transform;
	}

	@keyframes mesh-drift {
		0%,
		100% {
			transform: translate(-50%, -50%) translate(0, 0);
		}
		25% {
			transform: translate(-50%, -50%) translate(8%, -6%);
		}
		50% {
			transform: translate(-50%, -50%) translate(-4%, 10%);
		}
		75% {
			transform: translate(-50%, -50%) translate(-7%, -4%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mesh-gradient__blob {
			animation: none !important;
			/* Freeze at base position — no drift but the
			   composition still reads as a gradient. */
			transform: translate(-50%, -50%) !important;
		}
	}
</style>
