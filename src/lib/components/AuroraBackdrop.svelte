<script lang="ts" module>
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
			base: '#0a1020'
		},
		dawn: {
			name: 'dawn',
			stops: ['#f472b6', '#fbbf24', '#fb7185', '#a855f7'],
			base: '#1a0a15'
		},
		deep: {
			name: 'deep',
			stops: ['#0ea5e9', '#1e293b', '#22d3ee', '#312e81'],
			base: '#0a1025'
		}
	};

	export function pickPalette(name: string): AuroraPalette {
		return PALETTES[name as AuroraPaletteName] ?? PALETTES.classic;
	}

	export interface RibbonConfig {
		idx: number;
		period: number;
		delay: number;
		direction: 'normal' | 'reverse';
		opacity: number;
	}

	// Prime-based periods for non-harmonic rotation (no visible loops)
	const BASE_PERIODS = [8, 13, 19, 29] as const;
	const BASE_DELAYS = [0, -4, -9, -15] as const;

	export function ribbonConfig(idx: number, intensity = 1): RibbonConfig {
		const safeIdx = ((idx % 4) + 4) % 4;
		const period = BASE_PERIODS[safeIdx] * Math.max(0.25, intensity);
		const delay = BASE_DELAYS[safeIdx];
		const direction = safeIdx % 2 === 0 ? 'normal' : 'reverse';
		const opacity = safeIdx < 2 ? 0.95 : 0.75;
		return { idx: safeIdx, period, delay, direction, opacity };
	}

	export function buildRibbonGradient(palette: AuroraPalette, fromAngle: number): string {
		const [a, b, c, d] = palette.stops;
		return `conic-gradient(from ${fromAngle.toFixed(0)}deg at 50% 50%, ${a}, ${b}, ${c}, ${d}, ${a})`;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
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
		blur = 20,
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
	}

	.ab-ribbon {
		position: absolute;
		inset: -12%;
		filter: blur(var(--ab-blur));
		mix-blend-mode: lighten;
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
			transparent 75%,
			rgba(0, 0, 0, 0.15) 92%,
			rgba(0, 0, 0, 0.3) 100%
		);
		z-index: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.ab-ribbon {
			animation: none;
		}
	}
</style>
