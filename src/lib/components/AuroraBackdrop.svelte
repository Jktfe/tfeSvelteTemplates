<script lang="ts" module>
	// ============================================================
	// AuroraBackdrop — pure helpers + types
	//
	// Exported via module-script so the test suite can assert
	// palette selection, ribbon configuration, and motion-gate
	// behaviour without rendering a component.
	// ============================================================

	export type AuroraPaletteName = 'classic' | 'dawn' | 'deep';

	export interface AuroraPalette {
		name: AuroraPaletteName;
		stops: [string, string, string, string];
		base: string;
	}

	const PALETTES: Record<AuroraPaletteName, AuroraPalette> = {
		classic: {
			name: 'classic',
			stops: ['#22d3ee', '#a78bfa', '#34d399', '#0ea5e9'],
			base: '#04060d'
		},
		dawn: {
			name: 'dawn',
			stops: ['#f472b6', '#fbbf24', '#fb7185', '#a855f7'],
			base: '#1a0710'
		},
		deep: {
			name: 'deep',
			stops: ['#0ea5e9', '#1e293b', '#22d3ee', '#312e81'],
			base: '#020617'
		}
	};

	/**
	 * Resolve a palette by name. Falls back to `classic` on any
	 * unknown input so consumers passing user data never crash.
	 */
	export function pickPalette(name: string): AuroraPalette {
		return PALETTES[name as AuroraPaletteName] ?? PALETTES.classic;
	}

	/**
	 * Per-ribbon animation configuration. The four ribbons rotate
	 * at deliberately non-harmonic periods so the composite never
	 * loops cleanly to the eye, and start at staggered phase
	 * offsets so the wall reads as alive on the first frame.
	 *
	 * `intensity` scales the base period — 1.0 is the default,
	 * <1 speeds the rotation up (more energetic), >1 slows it
	 * down (more meditative).
	 */
	export interface RibbonConfig {
		idx: number;
		period: number; // seconds per full rotation
		delay: number; // seconds before the loop begins
		direction: 'normal' | 'reverse';
		opacity: number; // 0..1 — outer ribbons fade slightly
	}

	const BASE_PERIODS = [40, 65, 80, 110] as const;
	const BASE_DELAYS = [0, -12, -34, -52] as const;

	export function ribbonConfig(idx: number, intensity = 1): RibbonConfig {
		const safeIdx = ((idx % 4) + 4) % 4;
		const period = BASE_PERIODS[safeIdx] * Math.max(0.25, intensity);
		const delay = BASE_DELAYS[safeIdx];
		// Alternate direction so neighbouring ribbons swirl against each other.
		const direction = safeIdx % 2 === 0 ? 'normal' : 'reverse';
		// Outer ribbons (idx 2 and 3) fade slightly so the centre reads brighter.
		const opacity = safeIdx < 2 ? 0.85 : 0.6;
		return { idx: safeIdx, period, delay, direction, opacity };
	}

	/**
	 * Build the CSS conic-gradient string for a ribbon, given a
	 * palette and a rotation offset (degrees). The rotation offset
	 * is applied as the gradient's `from` angle so each ribbon
	 * starts pointing in a different direction even before any
	 * animation runs.
	 */
	export function buildRibbonGradient(palette: AuroraPalette, fromAngle: number): string {
		const [a, b, c, d] = palette.stops;
		return `conic-gradient(from ${fromAngle.toFixed(0)}deg at 50% 50%, ${a}, ${b}, ${c}, ${d}, ${a})`;
	}

	/**
	 * Read-only motion-preference probe. Returns `false` in non-DOM
	 * environments so SSR + tests stay deterministic.
	 */
	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false;
		}
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	interface Props {
		palette?: AuroraPaletteName;
		intensity?: number;
		blur?: number;
		class?: string;
	}

	let {
		palette: paletteName = 'classic',
		intensity = 1,
		blur = 60,
		class: className = ''
	}: Props = $props();

	const palette = $derived(pickPalette(paletteName));
	const ribbons = $derived([0, 1, 2, 3].map((i) => ribbonConfig(i, intensity)));
	const startAngles = [15, 110, 215, 305];
</script>

<div
	class="ab-root {className}"
	style="
		--ab-base: {palette.base};
		--ab-blur: {blur}px;
	"
	aria-hidden="true"
>
	{#each ribbons as r (r.idx)}
		<div
			class="ab-ribbon"
			data-ribbon={r.idx}
			style="
				background: {buildRibbonGradient(palette, startAngles[r.idx])};
				animation-duration: {r.period.toFixed(0)}s;
				animation-delay: {r.delay.toFixed(0)}s;
				animation-direction: {r.direction};
				opacity: {r.opacity};
			"
		></div>
	{/each}
	<div class="ab-veil"></div>
</div>

<style>
	.ab-root {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 360px;
		background: var(--ab-base);
		overflow: hidden;
		isolation: isolate;
	}

	.ab-ribbon {
		position: absolute;
		inset: -25%;
		filter: blur(var(--ab-blur));
		mix-blend-mode: screen;
		animation-name: ab-spin;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		will-change: transform;
		transform: translateZ(0);
	}

	@keyframes ab-spin {
		from {
			transform: translateZ(0) rotate(0deg);
		}
		to {
			transform: translateZ(0) rotate(360deg);
		}
	}

	.ab-veil {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			transparent 55%,
			rgba(0, 0, 0, 0.45) 90%,
			rgba(0, 0, 0, 0.7) 100%
		);
		z-index: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.ab-ribbon {
			animation: none;
		}
	}
</style>
