<!--
  ============================================================
  ScrollProgressBar

  🎯 WHAT IT DOES
  Viewport-level reading-progress bar fixed to the top or
  bottom edge of the screen. Width fills 0→100% as the user
  scrolls through the document (or a named container). Useful
  for blog posts, docs, articles, and any long-form content
  where readers benefit from a continuous "how far am I"
  signal.

  Pure JS scroll listener with requestAnimationFrame
  throttling — universal browser support, no scroll-timeline
  dependency. Single rAF tick per scroll event keeps it
  lightweight even on long documents.

  ✨ FEATURES
  • 4 variants — thin (2px), bold (6px), gradient
    (multi-stop colour flow), pulse (leading-edge glow)
  • Tracks `window` by default, or any CSS-selector-named
    scrollable element via the `target` prop
  • Configurable position — top edge (default) or bottom edge
  • Custom solid colour via `color` prop; gradient variant
    uses it as the seed/anchor of the gradient
  • Custom height in px (clamped 1–20)
  • `class` prop forwards to the wrapper for further styling

  ♿ ACCESSIBILITY
  • role="progressbar" + aria-valuenow / aria-valuemin /
    aria-valuemax / aria-label — screen readers announce
    the current scroll percentage
  • aria-valuenow rounds to integer; updates per rAF tick
    so screen readers don't churn
  • prefers-reduced-motion → CSS transitions disabled, no
    gradient flow, no pulse glow; the bar updates instantly
    on each scroll tick (no smooth interpolation)
  • Triple-defence reduced-motion: JS probe in onMount +
    .reduced gate class + CSS @media fallback
  • Pointer-events none — never interferes with click targets

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • Single rAF-throttled scroll listener, passive
  • One CSS custom-property write per scroll tick (--spb-progress)
  • Width transition 80ms linear smooths jitter between ticks
  • No ResizeObserver, no IntersectionObserver, no MutationObserver

  🎨 USAGE
  <ScrollProgressBar />

  <ScrollProgressBar
    variant="gradient"
    position="top"
    color="#6366f1"
    height={4}
  />

  <ScrollProgressBar
    target="#article-body"
    variant="pulse"
    color="#ec4899"
  />

  📋 PROPS
  | Prop         | Type                                       | Default              |
  |--------------|--------------------------------------------|----------------------|
  | target       | 'window' \| string (selector)              | 'window'             |
  | variant      | 'thin' \| 'bold' \| 'gradient' \| 'pulse'  | 'thin'               |
  | position     | 'top' \| 'bottom'                          | 'top'                |
  | color        | string (CSS colour)                        | '#6366f1'            |
  | height       | number (px, 0=auto)                        | 0                    |
  | aria-label   | string                                     | 'Reading progress'   |
  | class        | string                                     | ''                   |

  ============================================================
-->

<script lang="ts" module>
	export type ScrollProgressBarVariant = 'thin' | 'bold' | 'gradient' | 'pulse';
	export type ScrollProgressBarPosition = 'top' | 'bottom';

	export const VALID_VARIANTS: readonly ScrollProgressBarVariant[] = [
		'thin',
		'bold',
		'gradient',
		'pulse'
	];
	export const VALID_POSITIONS: readonly ScrollProgressBarPosition[] = ['top', 'bottom'];

	export function isValidVariant(v: unknown): v is ScrollProgressBarVariant {
		return typeof v === 'string' && (VALID_VARIANTS as readonly string[]).includes(v);
	}

	export function pickVariant(v: unknown): ScrollProgressBarVariant {
		return isValidVariant(v) ? v : 'thin';
	}

	export function isValidPosition(p: unknown): p is ScrollProgressBarPosition {
		return typeof p === 'string' && (VALID_POSITIONS as readonly string[]).includes(p);
	}

	export function pickPosition(p: unknown): ScrollProgressBarPosition {
		return isValidPosition(p) ? p : 'top';
	}

	/**
	 * Clamp a height value to the supported range [1, 20] in px.
	 * Returns the fallback if input is NaN, Infinity, or non-finite.
	 */
	export function clampHeight(h: unknown, fallback: number): number {
		const n = typeof h === 'number' ? h : Number(h);
		if (!Number.isFinite(n) || n <= 0) return fallback;
		if (n < 1) return 1;
		if (n > 20) return 20;
		return Math.round(n);
	}

	/**
	 * Compute scroll progress as 0..100 from raw measurements.
	 * Returns 0 when the document doesn't scroll (scrollHeight ≤ clientHeight).
	 * Returns 100 when scrolled past the bottom (some browsers overshoot).
	 */
	export function calculateProgress(
		scrollTop: number,
		scrollHeight: number,
		clientHeight: number
	): number {
		const top = Number.isFinite(scrollTop) && scrollTop > 0 ? scrollTop : 0;
		const total = Number.isFinite(scrollHeight) ? scrollHeight : 0;
		const visible = Number.isFinite(clientHeight) ? clientHeight : 0;
		const scrollable = total - visible;
		if (scrollable <= 0) return 0;
		const pct = (top / scrollable) * 100;
		if (pct < 0) return 0;
		if (pct > 100) return 100;
		return pct;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		try {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		} catch {
			return false;
		}
	}

	export function supportsScrollTimeline(): boolean {
		if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
		try {
			return CSS.supports('animation-timeline: scroll()');
		} catch {
			return false;
		}
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		target?: 'window' | string;
		variant?: ScrollProgressBarVariant | string;
		position?: ScrollProgressBarPosition | string;
		color?: string;
		height?: number;
		'aria-label'?: string;
		class?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props -- 'aria-label' false-positive on hyphenated key (destructured to ariaLabel)
	let {
		target = 'window',
		variant = 'thin',
		position = 'top',
		color = '#6366f1',
		height = 0,
		'aria-label': ariaLabel = 'Reading progress',
		class: className = ''
	}: Props = $props();

	const resolvedVariant = $derived(pickVariant(variant));
	const resolvedPosition = $derived(pickPosition(position));
	const defaultHeight = $derived(
		resolvedVariant === 'thin' ? 2 : resolvedVariant === 'bold' ? 6 : 4
	);
	const resolvedHeight = $derived(clampHeight(height || defaultHeight, defaultHeight));

	let progress = $state(0);
	let reduced = $state(false);
	let rafId = 0;
	let scrollTarget: Window | HTMLElement | null = null;

	function readScroll(): { scrollTop: number; scrollHeight: number; clientHeight: number } | null {
		if (!scrollTarget) return null;
		if (scrollTarget === window) {
			const root = document.documentElement;
			return {
				scrollTop: window.scrollY || root.scrollTop || 0,
				scrollHeight: root.scrollHeight,
				clientHeight: window.innerHeight
			};
		}
		const el = scrollTarget as HTMLElement;
		return {
			scrollTop: el.scrollTop,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight
		};
	}

	function tick() {
		rafId = 0;
		const m = readScroll();
		if (!m) return;
		progress = calculateProgress(m.scrollTop, m.scrollHeight, m.clientHeight);
	}

	function handleScroll() {
		if (rafId) return;
		rafId = requestAnimationFrame(tick);
	}

	onMount(() => {
		reduced = isReducedMotion();

		if (target === 'window') {
			scrollTarget = window;
		} else if (typeof target === 'string' && target.length > 0) {
			scrollTarget = document.querySelector(target) as HTMLElement | null;
		}

		if (!scrollTarget) return;

		(scrollTarget as Window | HTMLElement).addEventListener('scroll', handleScroll, {
			passive: true
		});
		// resize affects scrollable distance
		window.addEventListener('resize', handleScroll, { passive: true });
		tick(); // initial calc
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		if (scrollTarget) {
			(scrollTarget as Window | HTMLElement).removeEventListener('scroll', handleScroll);
		}
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleScroll);
		}
	});
</script>

<div
	class="scroll-progress-bar pos-{resolvedPosition} variant-{resolvedVariant} {className}"
	class:reduced
	role="progressbar"
	aria-valuenow={Math.round(progress)}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label={ariaLabel}
	style:--spb-color={color}
	style:--spb-height="{resolvedHeight}px"
	style:--spb-progress="{progress}%"
>
	<div class="fill"></div>
</div>

<style>
	.scroll-progress-bar {
		position: fixed;
		left: 0;
		right: 0;
		height: var(--spb-height);
		z-index: 9999;
		pointer-events: none;
		overflow: hidden;
		background: transparent;
	}

	.scroll-progress-bar.pos-top {
		top: 0;
	}

	.scroll-progress-bar.pos-bottom {
		bottom: 0;
	}

	.fill {
		height: 100%;
		width: var(--spb-progress, 0%);
		background: var(--spb-color, #6366f1);
		transition: width 80ms linear;
		position: relative;
	}

	.variant-gradient .fill {
		background: linear-gradient(
			90deg,
			var(--spb-color, #6366f1),
			#ec4899,
			#f59e0b,
			#06b6d4,
			var(--spb-color, #6366f1)
		);
		background-size: 200% 100%;
		animation: spb-gradient-flow 8s linear infinite;
	}

	@keyframes spb-gradient-flow {
		from {
			background-position: 0% 0%;
		}
		to {
			background-position: 200% 0%;
		}
	}

	.variant-pulse .fill {
		box-shadow:
			0 0 6px var(--spb-color, #6366f1),
			0 0 12px var(--spb-color, #6366f1);
	}

	.variant-pulse .fill::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 12px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85));
		filter: blur(1px);
		animation: spb-pulse-glow 1.2s ease-in-out infinite;
	}

	@keyframes spb-pulse-glow {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 0.95;
		}
	}

	.scroll-progress-bar.reduced .fill,
	.scroll-progress-bar.reduced .fill::after {
		transition: none !important;
		animation: none !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-progress-bar .fill,
		.scroll-progress-bar .fill::after {
			transition: none;
			animation: none;
		}
	}
</style>
