<!--
  ============================================================
  EqualizerBars

  WHAT
  N vertical bars that oscillate in concert via phased CSS
  keyframes — looks like an audio spectrum analyser frozen in
  motion. Compact "things are alive / streaming" indicator.
  Decorative only; no input, no value semantics.

  FEATURES
  • 4 variants — equalizer (smooth sine), spectrum (peak-biased
    FFT), pulse (binary high/low), heartbeat (sparse double-spike)
  • Per-bar phase stagger via negative animation-delay — N
    independent CSS animations that LOOK like a coordinated wave
  • Configurable bar count (1–64), speed multiplier (0.25–4×),
    height (16–256 px), colour ("auto"=currentColor or hex)
  • Inactive state — bars freeze at deterministic seeded heights
    via inline CSS custom properties, set once on construction
  • Pure CSS keyframes; zero rAF; zero canvas

  ACCESSIBILITY
  • Wrapper carries role="img" + descriptive aria-label
  • Decorative-only — no focus, no value semantics, ignored by
    keyboard / pointer
  • prefers-reduced-motion: reduce → bars freeze at static
    seeded heights (JS probe + CSS @media fallback)

  DEPENDENCIES
  Zero external — pure Svelte 5 + scoped CSS.

  PERFORMANCE
  • 1 DOM node per bar. No per-frame JS. GPU-composited
    transform (scaleY) drives the visible motion.
  • Seeded random heights computed once on mount and reused for
    the inactive state — no re-rolling on rerender.

  USAGE
  <EqualizerBars />
  <EqualizerBars bars={16} variant="spectrum" speed={1.5} />
  <EqualizerBars variant="heartbeat" color="#ff3a6e" height={64} />
  <EqualizerBars active={false} bars={20} ariaLabel="Idle signal meter" />

  PROPS
  | Prop      | Type                                                     | Default               |
  |-----------|----------------------------------------------------------|-----------------------|
  | bars      | number  (clamped 1–64)                                   | 12                    |
  | variant   | 'equalizer' \| 'spectrum' \| 'pulse' \| 'heartbeat'      | 'equalizer'           |
  | speed     | number  (clamped 0.25–4)                                 | 1                     |
  | color     | string  ('auto' = currentColor, otherwise CSS colour)    | 'auto'                |
  | active    | boolean                                                  | true                  |
  | height    | number  (clamped 16–256, px)                             | 48                    |
  | seed      | number  (any int — drives inactive heights)              | 1                     |
  | ariaLabel | string                                                   | 'Audio visualisation' |
  | class     | string                                                   | ''                    |
  ============================================================
-->

<script lang="ts" module>
	// ============================================================
	// EqualizerBars — pure helpers + types
	//
	// All validation, clamping and seeded-height generation lives
	// in module scope so the test suite can verify the logic
	// without touching the DOM.
	// ============================================================

	export type EqualizerBarsVariant = 'equalizer' | 'spectrum' | 'pulse' | 'heartbeat';

	const VALID_VARIANTS: readonly EqualizerBarsVariant[] = [
		'equalizer',
		'spectrum',
		'pulse',
		'heartbeat'
	];

	export function isValidVariant(name: unknown): name is EqualizerBarsVariant {
		return typeof name === 'string' && (VALID_VARIANTS as readonly string[]).includes(name);
	}

	export function pickVariant(name: unknown): EqualizerBarsVariant {
		return isValidVariant(name) ? name : 'equalizer';
	}

	/**
	 * Clamp the speed multiplier into [0.25, 4]. Non-finite or
	 * non-numeric input falls back to 1× — a sensible default.
	 */
	export function clampSpeed(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 1;
		if (n < 0.25) return 0.25;
		if (n > 4) return 4;
		return n;
	}

	/**
	 * Clamp the bar count into [1, 64] and floor to an integer.
	 * Anything malformed becomes 12 (the visual default).
	 */
	export function clampBars(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 12;
		const i = Math.floor(n);
		if (i < 1) return 1;
		if (i > 64) return 64;
		return i;
	}

	/**
	 * Clamp the rendered height into [16, 256] px. Below 16 px
	 * the bars become unreadable; above 256 the visual stops
	 * being a "compact indicator" and starts being a chart.
	 */
	export function clampHeight(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 48;
		if (n < 16) return 16;
		if (n > 256) return 256;
		return n;
	}

	/**
	 * Deterministic seeded fractional heights in [0.15, 1.0].
	 * Used for the inactive / reduced-motion state so the same
	 * seed always produces the same silhouette on every render
	 * — important for SSR / hydration parity.
	 *
	 * Implementation is a tiny mulberry32-derived LCG: portable,
	 * dependency-free, and stable across runtimes.
	 */
	export function seededHeights(count: number, seed: number): number[] {
		const safeCount = clampBars(count);
		let state = (seed | 0) || 1;
		const out: number[] = [];
		for (let i = 0; i < safeCount; i++) {
			state = (state + 0x6d2b79f5) | 0;
			let t = state;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
			out.push(0.15 + r * 0.85);
		}
		return out;
	}

	/**
	 * Browser-safe `prefers-reduced-motion: reduce` probe. Returns
	 * false during SSR / Node test runs so the server-rendered
	 * markup matches the default-animated client render before
	 * onMount has a chance to flip the gate.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		bars?: number;
		variant?: EqualizerBarsVariant;
		speed?: number;
		color?: string;
		active?: boolean;
		height?: number;
		seed?: number;
		ariaLabel?: string;
		class?: string;
	};

	let {
		bars = 12,
		variant = 'equalizer',
		speed = 1,
		color = 'auto',
		active = true,
		height = 48,
		seed = 1,
		ariaLabel = 'Audio visualisation',
		class: extraClass = ''
	}: Props = $props();

	const safeBars = $derived(clampBars(bars));
	const safeSpeed = $derived(clampSpeed(speed));
	const safeHeight = $derived(clampHeight(height));
	const safeVariant = $derived(pickVariant(variant));
	const safeColor = $derived(color === 'auto' ? 'currentColor' : color);
	const heights = $derived(seededHeights(safeBars, seed));

	// Per-bar duration scales inversely with speed; faster speed
	// = shorter cycle. The base values were chosen by ear so the
	// four variants visually settle into the "audio-meter" idiom
	// at speed=1.
	const baseDurationS = $derived(1.2 / safeSpeed);
	const staggerStepS = $derived(baseDurationS * 0.09);

	// runAnimation gates whether the CSS animation is applied
	// at all. SSR starts true so the static markup matches a
	// fully-animated client render; onMount drops to false for
	// reduced-motion users (the @media query also handles the
	// case where the JS probe ever drifts).
	let runAnimation = $state(true);

	onMount(() => {
		if (active && !isReducedMotion()) {
			runAnimation = true;
		} else {
			runAnimation = false;
		}
	});

	$effect(() => {
		// React to the `active` prop flipping at runtime.
		if (!active) runAnimation = false;
	});
</script>

<div
	class="eq-wrapper {extraClass}"
	role="img"
	aria-label={ariaLabel}
	data-equalizerbars-variant={safeVariant}
	data-equalizerbars-active={active && runAnimation ? 'true' : 'false'}
	style="--eq-color:{safeColor};--eq-height:{safeHeight}px;--eq-duration:{baseDurationS}s;--eq-stagger:{staggerStepS}s;"
>
	{#each heights as h, i (i)}
		<span
			class="eq-bar"
			class:eq-running={active && runAnimation}
			style="--eq-idx:{i};--eq-static-h:{(h * 100).toFixed(2)}%;"
			aria-hidden="true"
		></span>
	{/each}
</div>

<style>
	.eq-wrapper {
		display: inline-flex;
		align-items: flex-end;
		gap: 3px;
		height: var(--eq-height, 48px);
		color: #38bdf8;
		line-height: 0;
	}

	.eq-bar {
		display: block;
		width: 4px;
		height: var(--eq-static-h, 50%);
		background-color: var(--eq-color, currentColor);
		border-radius: 2px;
		transform-origin: 50% 100%;
		will-change: transform;
	}

	/* ---- equalizer (smooth sine) ----------------------------- */
	.eq-wrapper[data-equalizerbars-variant='equalizer'] .eq-running {
		animation: eq-osc-equalizer var(--eq-duration, 1.2s) ease-in-out infinite alternate;
		animation-delay: calc(var(--eq-idx) * var(--eq-stagger, 0.1s) * -1);
		height: 100%;
		transform-origin: 50% 100%;
	}

	@keyframes eq-osc-equalizer {
		0% {
			transform: scaleY(0.18);
		}
		50% {
			transform: scaleY(0.65);
		}
		100% {
			transform: scaleY(1);
		}
	}

	/* ---- spectrum (peak-biased) ------------------------------ */
	.eq-wrapper[data-equalizerbars-variant='spectrum'] .eq-running {
		animation: eq-osc-spectrum var(--eq-duration, 1.2s) cubic-bezier(0.45, 0.05, 0.55, 0.95)
			infinite alternate;
		animation-delay: calc(var(--eq-idx) * var(--eq-stagger, 0.1s) * -1);
		height: 100%;
		transform-origin: 50% 100%;
	}

	@keyframes eq-osc-spectrum {
		0% {
			transform: scaleY(0.2);
		}
		35% {
			transform: scaleY(0.95);
		}
		65% {
			transform: scaleY(0.45);
		}
		100% {
			transform: scaleY(0.85);
		}
	}

	/* ---- pulse (binary high/low) ----------------------------- */
	.eq-wrapper[data-equalizerbars-variant='pulse'] .eq-running {
		animation: eq-osc-pulse var(--eq-duration, 1.2s) steps(2, jump-none) infinite;
		animation-delay: calc(var(--eq-idx) * var(--eq-stagger, 0.1s) * -1);
		height: 100%;
		transform-origin: 50% 100%;
	}

	@keyframes eq-osc-pulse {
		0% {
			transform: scaleY(0.18);
		}
		50% {
			transform: scaleY(1);
		}
		100% {
			transform: scaleY(0.18);
		}
	}

	/* ---- heartbeat (sparse double-spike) --------------------- */
	.eq-wrapper[data-equalizerbars-variant='heartbeat'] .eq-running {
		animation: eq-osc-heartbeat var(--eq-duration, 1.2s) ease-in-out infinite;
		animation-delay: calc(var(--eq-idx) * var(--eq-stagger, 0.1s) * -1);
		height: 100%;
		transform-origin: 50% 100%;
	}

	@keyframes eq-osc-heartbeat {
		0% {
			transform: scaleY(0.18);
		}
		8% {
			transform: scaleY(1);
		}
		16% {
			transform: scaleY(0.3);
		}
		24% {
			transform: scaleY(0.85);
		}
		32% {
			transform: scaleY(0.18);
		}
		100% {
			transform: scaleY(0.18);
		}
	}

	/* When the bars are NOT running, height is set inline via the
	   --eq-static-h custom property and no transform is applied.
	   The bar then renders at its seeded fractional height — a
	   readable static silhouette. */
	.eq-bar:not(.eq-running) {
		height: var(--eq-static-h, 50%);
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.eq-running {
			animation: none !important;
			transform: none;
			height: var(--eq-static-h, 50%);
		}
	}
</style>
