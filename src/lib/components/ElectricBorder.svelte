<script lang="ts" module>
	export type IntensityName = 'mild' | 'crackling' | 'lightning';
	export type PaletteName = 'electric-blue' | 'plasma-purple' | 'volt-yellow';

	export interface IntensityConfig {
		frequency: number;
		distortion: number;
		animSpeed: number;
		strokeWidth: number;
		glowBlur: number;
	}

	export interface PaletteConfig {
		stroke: string;
		glow: string;
		highlight: string;
	}

	const INTENSITIES: Record<IntensityName, IntensityConfig> = {
		mild: { frequency: 0.015, distortion: 3, animSpeed: 5, strokeWidth: 2, glowBlur: 4 },
		crackling: { frequency: 0.03, distortion: 6, animSpeed: 3, strokeWidth: 2, glowBlur: 8 },
		lightning: { frequency: 0.06, distortion: 12, animSpeed: 1.5, strokeWidth: 3, glowBlur: 14 }
	};

	const PALETTES: Record<PaletteName, PaletteConfig> = {
		'electric-blue': { stroke: '#00bfff', glow: '#0080ff', highlight: '#ffffff' },
		'plasma-purple': { stroke: '#c77dff', glow: '#9d00ff', highlight: '#ff00ff' },
		'volt-yellow': { stroke: '#ffea00', glow: '#ffd60a', highlight: '#ffffff' }
	};

	export function pickIntensity(name: IntensityName | string | null | undefined): IntensityConfig {
		return INTENSITIES[name as IntensityName] ?? INTENSITIES.crackling;
	}

	export function pickPalette(name: PaletteName | string | null | undefined): PaletteConfig {
		return PALETTES[name as PaletteName] ?? PALETTES['electric-blue'];
	}

	export function clamp01(n: number): number {
		if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > 1) return 1;
		return n;
	}

	export function clampPositive(n: number, max: number = Number.POSITIVE_INFINITY): number {
		if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > max) return max;
		return n;
	}

	let filterCounter = 0;

	export function nextFilterId(prefix: string = 'ec'): string {
		filterCounter += 1;
		return `${prefix}-${filterCounter}`;
	}

	export function resetFilterCounterForTesting(): void {
		filterCounter = 0;
	}

	export function frequencyValuesString(base: number): string {
		const cb = clampPositive(base, 1);
		const peak = Math.min(cb * 2.2, 1);
		return `${cb.toFixed(4)};${peak.toFixed(4)};${cb.toFixed(4)}`;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		intensity?: IntensityName;
		palette?: PaletteName;
		radius?: number;
		children?: Snippet;
	};

	let { intensity = 'crackling', palette = 'electric-blue', radius = 12, children }: Props =
		$props();

	const cfg = $derived(pickIntensity(intensity));
	const colors = $derived(pickPalette(palette));
	const frequencyValues = $derived(frequencyValuesString(cfg.frequency));

	let filterId = $state('ec-static');
	let reduced = $state(false);

	onMount(() => {
		filterId = nextFilterId('ec');
		reduced = isReducedMotion();
	});
</script>

<div
	class="electric-wrapper"
	class:reduced
	data-intensity={intensity}
	data-palette={palette}
	style="--ec-stroke:{colors.stroke};--ec-glow:{colors.glow};--ec-radius:{radius}px;--ec-stroke-width:{cfg.strokeWidth}px;--ec-glow-blur:{cfg.glowBlur}px;"
>
	<div class="electric-content">
		{@render children?.()}
	</div>
	<svg
		class="electric-border-svg"
		aria-hidden="true"
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
	>
		<defs>
			<filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
				<feTurbulence type="fractalNoise" baseFrequency={cfg.frequency} numOctaves="2" seed="0">
					{#if !reduced}
						<animate
							attributeName="baseFrequency"
							dur="{cfg.animSpeed}s"
							values={frequencyValues}
							repeatCount="indefinite"
						/>
					{/if}
				</feTurbulence>
				<feDisplacementMap in="SourceGraphic" scale={reduced ? 0 : cfg.distortion} />
			</filter>
		</defs>
		<rect
			x="0"
			y="0"
			width="100"
			height="100"
			rx="3"
			fill="none"
			stroke="var(--ec-stroke)"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
			filter="url(#{filterId})"
		/>
	</svg>
</div>

<style>
	.electric-wrapper {
		position: relative;
		display: inline-block;
		border-radius: var(--ec-radius, 12px);
		isolation: isolate;
	}

	.electric-content {
		position: relative;
		z-index: 1;
		border-radius: inherit;
	}

	.electric-border-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
		z-index: 2;
		filter: drop-shadow(0 0 var(--ec-glow-blur, 8px) var(--ec-glow, #0080ff));
	}

	.electric-wrapper.reduced .electric-border-svg {
		filter: drop-shadow(0 0 4px var(--ec-glow, #0080ff));
	}

	@media (prefers-reduced-motion: reduce) {
		.electric-border-svg {
			filter: drop-shadow(0 0 4px var(--ec-glow, #0080ff));
		}
	}
</style>
