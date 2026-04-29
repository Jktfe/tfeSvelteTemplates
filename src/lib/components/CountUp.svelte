<script lang="ts" module>
	// ============================================================
	// CountUp — pure helpers + types
	//
	// Exported via module-script so the test suite can assert
	// easing maths, formatting, tick progress, and reduced-motion
	// detection without rendering. Animation itself is rAF-driven
	// in the component body; helpers here are deterministic and
	// pure so the value sequence is fully testable.
	// ============================================================

	export type EasingName = 'linear' | 'quad' | 'cubic' | 'quart' | 'expo';

	export interface FormatOpts {
		locale?: string;
		decimals?: number;
		prefix?: string;
		suffix?: string;
		useGrouping?: boolean;
	}

	const EASINGS: Record<EasingName, (t: number) => number> = {
		linear: (t) => t,
		quad: (t) => 1 - (1 - t) * (1 - t),
		cubic: (t) => 1 - Math.pow(1 - t, 3),
		quart: (t) => 1 - Math.pow(1 - t, 4),
		expo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
	};

	/**
	 * Pick an easing function by name. Falls back to `quart`
	 * (the most "marketing-stat" feel) on unknown input so
	 * consumers passing user data never crash.
	 */
	export function pickEasing(name: string): (t: number) => number {
		if (name in EASINGS) return EASINGS[name as EasingName];
		return EASINGS.quart;
	}

	/**
	 * Quart-out easing — fast start, gentle landing. Exposed
	 * directly so tests can assert the curve shape independent
	 * of the dispatch table.
	 */
	export function easeOutQuart(t: number): number {
		const safe = Math.max(0, Math.min(1, t));
		return 1 - Math.pow(1 - safe, 4);
	}

	/**
	 * Compute the in-flight value at progress `t` (0..1) given
	 * a start, end, and easing function. Direction-aware: works
	 * the same when `start > end` (count down).
	 */
	export function tickValue(
		start: number,
		end: number,
		t: number,
		easeFn: (t: number) => number = easeOutQuart
	): number {
		const safe = Math.max(0, Math.min(1, t));
		const eased = easeFn(safe);
		return start + (end - start) * eased;
	}

	/**
	 * Clamp a value to the [start, end] range, respecting
	 * direction. Used to guard against rAF overshoot on the
	 * final tick (e.g. when timestamps drift past duration).
	 */
	export function clampValue(value: number, start: number, end: number): number {
		const lo = Math.min(start, end);
		const hi = Math.max(start, end);
		return Math.max(lo, Math.min(hi, value));
	}

	/**
	 * Format a number for display via Intl.NumberFormat with
	 * an optional prefix/suffix. Decimals default to 0 (integer
	 * counters); pass 2 for currency-like values.
	 *
	 * Falls back gracefully on unknown locales — `Intl` itself
	 * substitutes the default locale rather than throwing.
	 */
	export function formatNumber(value: number, opts: FormatOpts = {}): string {
		const {
			locale = 'en-GB',
			decimals = 0,
			prefix = '',
			suffix = '',
			useGrouping = true
		} = opts;
		const safeDecimals = Math.max(0, Math.min(20, Math.round(decimals)));
		const formatted = new Intl.NumberFormat(locale, {
			minimumFractionDigits: safeDecimals,
			maximumFractionDigits: safeDecimals,
			useGrouping
		}).format(value);
		return `${prefix}${formatted}${suffix}`;
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Props = {
		end: number;
		start?: number;
		duration?: number;
		easing?: EasingName;
		decimals?: number;
		prefix?: string;
		suffix?: string;
		locale?: string;
		useGrouping?: boolean;
		trigger?: 'viewport' | 'mount' | 'manual';
		threshold?: number;
		flash?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	};

	const {
		end,
		start = 0,
		duration = 1800,
		easing = 'quart',
		decimals = 0,
		prefix = '',
		suffix = '',
		locale = 'en-GB',
		useGrouping = true,
		trigger = 'viewport',
		threshold = 0.4,
		flash = false,
		size = 'md',
		class: extraClass = ''
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	// Initialise to `start` so SSR/hydration render the resting value
	// (avoids a flash of 0 before mount). The animation then overwrites
	// `current` directly; we don't need it to track the `start` prop
	// reactively — `reset()` is the explicit hook for that.
	let current = $state<number>(start);
	let done = $state(false);
	let host = $state<HTMLSpanElement | null>(null);
	let observer: IntersectionObserver | null = null;
	let rafId: number | null = null;
	let startTs: number | null = null;

	const easeFn = $derived(pickEasing(easing));
	const formatOpts = $derived({ locale, decimals, prefix, suffix, useGrouping });
	const displayValue = $derived(formatNumber(current, formatOpts));
	const finalLabel = $derived(formatNumber(end, formatOpts));

	function step(now: number) {
		if (startTs === null) startTs = now;
		const elapsed = now - startTs;
		const t = Math.max(0, Math.min(1, duration <= 0 ? 1 : elapsed / duration));
		const v = tickValue(start, end, t, easeFn);
		current = clampValue(v, start, end);
		if (t < 1) {
			rafId = requestAnimationFrame(step);
		} else {
			current = end;
			done = true;
			rafId = null;
		}
	}

	export function run() {
		if (rafId !== null) cancelAnimationFrame(rafId);
		startTs = null;
		done = false;
		current = start;
		if (typeof window === 'undefined') {
			current = end;
			done = true;
			return;
		}
		if (isReducedMotion() || duration <= 0) {
			current = end;
			done = true;
			return;
		}
		rafId = requestAnimationFrame(step);
	}

	export function reset() {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		startTs = null;
		current = start;
		done = false;
	}

	onMount(() => {
		if (trigger === 'mount') {
			run();
			return;
		}
		if (trigger === 'viewport' && host && typeof IntersectionObserver !== 'undefined') {
			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							run();
							observer?.disconnect();
							observer = null;
							break;
						}
					}
				},
				{ threshold }
			);
			observer.observe(host);
		}
	});

	onDestroy(() => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		observer?.disconnect();
	});
</script>

<span
	bind:this={host}
	class="countup countup-size-{size} {extraClass}"
	class:countup-flash={flash && done}
	data-easing={easing}
	data-trigger={trigger}
	data-done={done}
>
	<span class="countup-value" aria-hidden="true">{displayValue}</span>
	<span class="countup-sr">{finalLabel}</span>
</span>

<style>
	.countup {
		display: inline-block;
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
		line-height: 1;
	}

	.countup-value {
		display: inline-block;
		min-width: 0;
	}

	/* Visually hidden, available to assistive tech: announces
	   the destination value once rather than every rAF tick. */
	.countup-sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.countup-size-sm {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.countup-size-md {
		font-size: 2rem;
		font-weight: 700;
	}

	.countup-size-lg {
		font-size: 3.25rem;
		font-weight: 800;
	}

	.countup-size-xl {
		font-size: 5rem;
		font-weight: 900;
		letter-spacing: -0.02em;
	}

	/* Flash-on-complete: a quick text-shadow pop fading over
	   600ms, then the value sits at its resting style. */
	.countup-flash .countup-value {
		animation: countup-flash 600ms ease-out 1;
	}

	@keyframes countup-flash {
		0% {
			text-shadow: 0 0 0 transparent;
			transform: translateY(0);
		}
		35% {
			text-shadow: 0 0 14px rgba(125, 211, 252, 0.9);
			transform: translateY(-2px);
		}
		100% {
			text-shadow: 0 0 0 transparent;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.countup-flash .countup-value {
			animation: none;
		}
	}
</style>
