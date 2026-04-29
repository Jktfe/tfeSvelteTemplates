<!--
  ============================================================
  PerspectiveGrid

  🎯 WHAT IT DOES
  An ambient 3D-perspective grid backdrop. Two infinite grid
  planes (floor + optional ceiling) are tilted in real CSS 3D
  space via transform-style: preserve-3d, then drift toward
  the viewer through a single CSS keyframe animating
  background-position. The result is the classic synthwave /
  TRON / arcade-tunnel look — receding grid lines flowing
  past at a steady cadence — without canvas, WebGL, or rAF.

  ✨ FEATURES
  • 3 intensities: calm / standard / rush — each preset
    bundles drift duration + cell size + line opacity so a
    single prop tunes everything proportionally
  • 3 modes: mono (achromatic) / neon (cyan + magenta glow) /
    wireframe (hairline, no glow)
  • Optional ceiling plane mirrored above the floor — turns
    the surface into a tunnel. Off by default.
  • Pure CSS keyframe + repeating-linear-gradient lines, zero
    rAF, zero canvas, zero ResizeObserver
  • Settles to a static grid under prefers-reduced-motion;
    the grid still renders, only the drift freezes

  ♿ ACCESSIBILITY
  • Wrapper carries no role; the slotted child keeps its own
    semantics. The grid layer is aria-hidden + pointer-
    events:none and stacked behind the slot via z-index.
  • prefers-reduced-motion: reduce → animation is forced off
    on mount AND a CSS @media query freezes the keyframe
    even if the JS probe ever drifts
  • No keyboard or pointer interaction; doesn't steal focus
    from descendants

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • One DOM node per plane (1 floor, +1 ceiling if enabled).
    All grid lines come from a 2-stop repeating-linear-
    gradient — no per-cell DOM.
  • Animation drives only background-position on the GPU-
    composited plane; no layout thrash, no JS frame loop.
  • Edge fade is a static mask-image (linear-gradient at
    horizon) — no runtime cost.

  🎨 USAGE
  <PerspectiveGrid>
    <section class="hero">…</section>
  </PerspectiveGrid>

  <PerspectiveGrid intensity="rush" mode="neon" ceiling>
    <article class="terminal">…</article>
  </PerspectiveGrid>

  <PerspectiveGrid intensity="calm" mode="wireframe" animated={false}>
    <div class="card">…</div>
  </PerspectiveGrid>

  📋 PROPS
  | Prop      | Type                                  | Default      |
  |-----------|---------------------------------------|--------------|
  | intensity | 'calm' \| 'standard' \| 'rush'        | 'standard'   |
  | mode      | 'mono' \| 'neon' \| 'wireframe'       | 'mono'       |
  | ceiling   | boolean                               | false        |
  | animated  | boolean                               | true         |
  | opacity   | number  (clamped 0–1)                 | 1            |
  | class     | string                                | ''           |
  | children  | Snippet                               | (required)   |

  ============================================================
-->

<script lang="ts" module>
	// ============================================================
	// PerspectiveGrid — pure helpers + types
	//
	// All validation, bundling and clamping lives in module scope so
	// the test suite can verify the helpers without rendering.
	// ============================================================

	export type PerspectiveGridIntensity = 'calm' | 'standard' | 'rush';
	export type PerspectiveGridMode = 'mono' | 'neon' | 'wireframe';

	export interface IntensityConfig {
		/** Drift cycle duration in seconds. Smaller = faster rush. */
		durationS: number;
		/** Grid cell size in px on the un-rotated plane. */
		cellPx: number;
		/** Final stroke opacity for grid lines (0–1). */
		lineOpacity: number;
	}

	const INTENSITIES: Record<PerspectiveGridIntensity, IntensityConfig> = {
		calm: { durationS: 18, cellPx: 80, lineOpacity: 0.35 },
		standard: { durationS: 9, cellPx: 60, lineOpacity: 0.55 },
		rush: { durationS: 4, cellPx: 50, lineOpacity: 0.85 }
	};

	const VALID_INTENSITIES: readonly PerspectiveGridIntensity[] = [
		'calm',
		'standard',
		'rush'
	];

	const VALID_MODES: readonly PerspectiveGridMode[] = ['mono', 'neon', 'wireframe'];

	export function isValidIntensity(name: unknown): name is PerspectiveGridIntensity {
		return typeof name === 'string' && (VALID_INTENSITIES as readonly string[]).includes(name);
	}

	export function isValidMode(name: unknown): name is PerspectiveGridMode {
		return typeof name === 'string' && (VALID_MODES as readonly string[]).includes(name);
	}

	export function pickIntensity(name: unknown): IntensityConfig {
		return isValidIntensity(name) ? INTENSITIES[name] : INTENSITIES.standard;
	}

	export function pickMode(name: unknown): PerspectiveGridMode {
		return isValidMode(name) ? name : 'mono';
	}

	/**
	 * Clamp a number into [0, 1]. Treats NaN / ±Infinity as 0 so
	 * malformed inputs degrade gracefully into "fully transparent"
	 * rather than throwing or yielding visible artefacts.
	 */
	export function clamp01(n: unknown): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > 1) return 1;
		return n;
	}

	/**
	 * Probe `prefers-reduced-motion: reduce` once. Returns false in
	 * any non-browser environment (SSR, Node test runner) so server
	 * output matches the default-animated client render before
	 * onMount runs the real check.
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
	import type { Snippet } from 'svelte';

	type Props = {
		intensity?: PerspectiveGridIntensity;
		mode?: PerspectiveGridMode;
		ceiling?: boolean;
		animated?: boolean;
		opacity?: number;
		class?: string;
		children: Snippet;
	};

	let {
		intensity = 'standard',
		mode = 'mono',
		ceiling = false,
		animated = true,
		opacity = 1,
		class: extraClass = '',
		children
	}: Props = $props();

	const cfg = $derived(pickIntensity(intensity));
	const resolvedMode = $derived(pickMode(mode));
	const resolvedOpacity = $derived(clamp01(opacity));

	// Animated state goes through this gate so reduced-motion users
	// (and the @media fallback below) end up at the same "static"
	// terminal state. We start true to match SSR; onMount drops it
	// to false when the user has asked for less motion.
	let runAnimation = $state(true);

	onMount(() => {
		if (animated && !isReducedMotion()) {
			runAnimation = true;
		} else {
			runAnimation = false;
		}
	});

	$effect(() => {
		// Re-evaluate when the `animated` prop flips at runtime.
		if (!animated) runAnimation = false;
	});
</script>

<div
	class="pg-wrapper {extraClass}"
	data-perspectivegrid-intensity={intensity}
	data-perspectivegrid-mode={resolvedMode}
>
	<div
		class="pg-stage"
		class:pg-animated={runAnimation}
		data-perspectivegrid-mode={resolvedMode}
		aria-hidden="true"
		style="--pg-cell:{cfg.cellPx}px;--pg-duration:{cfg.durationS}s;--pg-line-opacity:{cfg.lineOpacity};--pg-opacity:{resolvedOpacity};"
	>
		<div class="pg-3d">
			<div class="pg-plane pg-floor"></div>
			{#if ceiling}
				<div class="pg-plane pg-ceiling"></div>
			{/if}
		</div>
	</div>

	<div class="pg-content">
		{@render children()}
	</div>
</div>

<style>
	.pg-wrapper {
		position: relative;
		display: block;
		isolation: isolate;
	}

	.pg-stage {
		position: absolute;
		inset: 0;
		overflow: hidden;
		opacity: var(--pg-opacity, 1);
		pointer-events: none;
		z-index: 0;
		/* Horizon fade so the grid dissolves into the canvas instead
		   of cutting hard at the wrapper edges. */
		-webkit-mask-image: linear-gradient(
			to bottom,
			transparent 0%,
			black 18%,
			black 82%,
			transparent 100%
		);
		mask-image: linear-gradient(
			to bottom,
			transparent 0%,
			black 18%,
			black 82%,
			transparent 100%
		);
	}

	.pg-3d {
		position: absolute;
		inset: 0;
		perspective: 600px;
		perspective-origin: 50% 50%;
		transform-style: preserve-3d;
		overflow: hidden;
	}

	.pg-plane {
		position: absolute;
		left: -100%;
		width: 300%;
		height: 100%;
		background-color: transparent;
		background-image:
			linear-gradient(to right, var(--pg-line-color, #ffffff) 1px, transparent 1px),
			linear-gradient(to bottom, var(--pg-line-color, #ffffff) 1px, transparent 1px);
		background-size: var(--pg-cell) var(--pg-cell);
		background-position: 0 0;
		opacity: var(--pg-line-opacity);
		will-change: background-position;
	}

	.pg-floor {
		bottom: 0;
		transform-origin: 50% 100%;
		transform: rotateX(60deg);
	}

	.pg-ceiling {
		top: 0;
		transform-origin: 50% 0%;
		transform: rotateX(-60deg);
	}

	.pg-animated .pg-floor {
		animation: pg-drift var(--pg-duration) linear infinite;
	}

	.pg-animated .pg-ceiling {
		animation: pg-drift-reverse var(--pg-duration) linear infinite;
	}

	@keyframes pg-drift {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 var(--pg-cell);
		}
	}

	@keyframes pg-drift-reverse {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 calc(-1 * var(--pg-cell));
		}
	}

	/* ---- mode: mono ---------------------------------------- */
	.pg-stage[data-perspectivegrid-mode='mono'] {
		--pg-line-color: #ffffff;
	}

	/* ---- mode: neon ---------------------------------------- */
	.pg-stage[data-perspectivegrid-mode='neon'] .pg-floor {
		--pg-line-color: #00f0ff;
		filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.65))
			drop-shadow(0 0 12px rgba(0, 240, 255, 0.35));
	}

	.pg-stage[data-perspectivegrid-mode='neon'] .pg-ceiling {
		--pg-line-color: #ff2dd1;
		filter: drop-shadow(0 0 4px rgba(255, 45, 209, 0.65))
			drop-shadow(0 0 12px rgba(255, 45, 209, 0.35));
	}

	/* ---- mode: wireframe ----------------------------------- */
	.pg-stage[data-perspectivegrid-mode='wireframe'] {
		--pg-line-color: rgba(255, 255, 255, 0.85);
	}

	.pg-stage[data-perspectivegrid-mode='wireframe'] .pg-plane {
		background-image:
			linear-gradient(to right, var(--pg-line-color) 0.5px, transparent 0.5px),
			linear-gradient(to bottom, var(--pg-line-color) 0.5px, transparent 0.5px);
	}

	.pg-content {
		position: relative;
		z-index: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.pg-animated .pg-floor,
		.pg-animated .pg-ceiling {
			animation: none;
		}
	}
</style>
