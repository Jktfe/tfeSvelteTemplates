<!--
  ============================================================
  NoiseField

  🎯 WHAT IT DOES
  An ambient grain / film-noise / TV-static overlay. A single
  SVG <feTurbulence> + <feColorMatrix> filter renders a noise
  pattern, layered over the slot via mix-blend-mode. The
  overlay can shimmer (CSS-translated SVG, steps() easing) for
  a 24-fps film-grain feel, or stay static.

  ✨ FEATURES
  • 3 intensities: fine / medium / coarse — controls
    feTurbulence baseFrequency and numOctaves
  • 3 modes: mono (achromatic) / chroma (RGB) / retro
    (chromatic + scanline overlay)
  • Animated shimmer via CSS keyframe with steps() — looks
    like discrete film frames, not a smooth slide
  • Pure SVG + CSS, zero rAF, zero canvas
  • SSR-safe filter ID (static fallback + onMount swap)

  ♿ ACCESSIBILITY
  • Overlay is aria-hidden + pointer-events:none
  • prefers-reduced-motion: reduce → animation stops; the
    grain pattern renders statically
  • Slotted content stays in the a11y tree, fully interactive

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • One SVG <rect> per instance; the filter chain is GPU-
    composited via mix-blend-mode
  • CSS keyframe animates a transform on the SVG (the filter
    output slides) — no JS frame loop, no resize observer
  • Oversized SVG (120%, -10% inset) hides edge reveal during
    shimmer

  🎨 USAGE
  <NoiseField>
    <section class="hero">…</section>
  </NoiseField>

  <NoiseField intensity="coarse" mode="retro" opacity={0.5}>
    <article class="terminal">…</article>
  </NoiseField>

  <NoiseField intensity="fine" mode="chroma" animated={false}>
    <div class="card">…</div>
  </NoiseField>

  📋 PROPS
  | Prop      | Type                                  | Default    |
  |-----------|---------------------------------------|------------|
  | intensity | 'fine' \| 'medium' \| 'coarse'        | 'medium'   |
  | mode      | 'mono' \| 'chroma' \| 'retro'         | 'mono'     |
  | animated  | boolean                               | true       |
  | opacity   | number  (clamped 0–1)                 | 0.4        |
  | class     | string                                | ''         |
  | children  | Snippet                               | (required) |

  ============================================================
-->

<script lang="ts" module>
	export type NoiseFieldIntensity = 'fine' | 'medium' | 'coarse';
	export type NoiseFieldMode = 'mono' | 'chroma' | 'retro';

	export interface IntensityConfig {
		baseFrequency: number;
		numOctaves: number;
	}

	const INTENSITIES: Record<NoiseFieldIntensity, IntensityConfig> = {
		fine: { baseFrequency: 1.6, numOctaves: 2 },
		medium: { baseFrequency: 0.85, numOctaves: 3 },
		coarse: { baseFrequency: 0.4, numOctaves: 4 }
	};

	const VALID_INTENSITIES: readonly NoiseFieldIntensity[] = ['fine', 'medium', 'coarse'];
	const VALID_MODES: readonly NoiseFieldMode[] = ['mono', 'chroma', 'retro'];

	export function isValidIntensity(name: string | undefined | null): name is NoiseFieldIntensity {
		return typeof name === 'string' && (VALID_INTENSITIES as readonly string[]).includes(name);
	}

	export function pickIntensity(name: string | undefined | null): IntensityConfig {
		return isValidIntensity(name) ? INTENSITIES[name] : INTENSITIES.medium;
	}

	export function isValidMode(name: string | undefined | null): name is NoiseFieldMode {
		return typeof name === 'string' && (VALID_MODES as readonly string[]).includes(name);
	}

	export function pickMode(name: string | undefined | null): NoiseFieldMode {
		return isValidMode(name) ? name : 'mono';
	}

	export function clamp01(n: number): number {
		if (!Number.isFinite(n)) return 0;
		return Math.max(0, Math.min(1, n));
	}

	let filterIdCounter = 0;
	export function nextFilterId(prefix = 'nf'): string {
		filterIdCounter += 1;
		return `${prefix}-${filterIdCounter}`;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		intensity?: NoiseFieldIntensity;
		mode?: NoiseFieldMode;
		animated?: boolean;
		opacity?: number;
		class?: string;
		children?: Snippet;
	}

	let {
		intensity = 'medium',
		mode = 'mono',
		animated = true,
		opacity = 0.4,
		class: className = '',
		children
	}: Props = $props();

	let filterId = $state('nf-static');
	let reducedMotion = $state(false);

	onMount(() => {
		filterId = nextFilterId('nf');
		reducedMotion = isReducedMotion();
	});

	const intensityConfig = $derived(pickIntensity(intensity));
	const safeMode = $derived(pickMode(mode));
	const safeOpacity = $derived(clamp01(opacity));
	const isAnimated = $derived(animated && !reducedMotion);
</script>

<div class="noisefield-wrapper {className}" data-noisefield-mode={safeMode}>
	{#if children}
		<div class="noisefield-content">{@render children()}</div>
	{/if}

	<div
		class="noisefield-overlay"
		class:animated={isAnimated}
		class:retro={safeMode === 'retro'}
		style:opacity={safeOpacity}
		aria-hidden="true"
	>
		<svg width="120%" height="120%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
			<filter id={filterId}>
				<feTurbulence
					type="fractalNoise"
					baseFrequency={intensityConfig.baseFrequency}
					numOctaves={intensityConfig.numOctaves}
					seed="3"
				/>
				{#if safeMode === 'mono'}
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 1 0"
					/>
				{:else if safeMode === 'chroma'}
					<feColorMatrix
						type="matrix"
						values="1.2 0 0 0 0   0 1.0 0 0 0   0 0 1.4 0 0   0 0 0 1 0"
					/>
				{:else}
					<feColorMatrix
						type="matrix"
						values="0.7 0 0 0 0.1   0 0.9 0 0 0.15   0 0 1.0 0 0.2   0 0 0 1 0"
					/>
				{/if}
			</filter>
			<rect width="100%" height="100%" filter="url(#{filterId})" />
		</svg>
	</div>
</div>

<style>
	.noisefield-wrapper {
		position: relative;
		display: block;
		isolation: isolate;
	}

	.noisefield-content {
		position: relative;
		z-index: 0;
	}

	.noisefield-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
		mix-blend-mode: overlay;
	}

	.noisefield-overlay svg {
		position: absolute;
		top: -10%;
		left: -10%;
		width: 120%;
		height: 120%;
		display: block;
	}

	.noisefield-overlay.animated svg {
		animation: noisefield-shimmer 2.4s steps(8) infinite;
	}

	.noisefield-overlay.retro::after {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.22) 0px,
			rgba(0, 0, 0, 0.22) 1px,
			transparent 1px,
			transparent 3px
		);
		pointer-events: none;
		mix-blend-mode: multiply;
	}

	@keyframes noisefield-shimmer {
		0% {
			transform: translate(0, 0);
		}
		20% {
			transform: translate(-2%, 1%);
		}
		40% {
			transform: translate(1%, -2%);
		}
		60% {
			transform: translate(-1%, -1%);
		}
		80% {
			transform: translate(2%, 0);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.noisefield-overlay.animated svg {
			animation: none;
		}
	}
</style>
