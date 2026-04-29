<!--
  ============================================================
  TickerTape

  🎯 WHAT IT DOES
  A horizontal infinite-scroll display of structured data
  points. Each item is a tuple of `{label, value, delta, trend}`
  rather than arbitrary content — Bloomberg / airport-info-board
  energy, but as a portable Svelte 5 primitive.

  Pure CSS keyframe scroll. The track holds two copies of the
  items list back-to-back; the keyframe translates the track
  by exactly 50% so the seam is always off-screen. Zero rAF,
  zero canvas, zero JS frame loop. Hover pauses via
  `animation-play-state` — that's it.

  ✨ FEATURES
  • 4 variants — default / finance / sports / minimal —
    each carries its own colour grammar (mono, green/red
    deltas, scoreboard, hairline)
  • Trend chevrons inferred from delta sign or set
    explicitly via `trend` field — green ▲ up, red ▼ down,
    grey ▬ flat
  • Configurable speed (px/s, default 60), direction
    (left/right), separator glyph between items
  • Pause-on-hover (default on) via animation-play-state
  • Optional href wraps each item as a link
  • Surrogate-pair-safe — emoji and combined glyphs render
    as single tokens in labels/values

  ♿ ACCESSIBILITY
  • Outer wrapper is `role="marquee"` with `aria-live="off"`
    (animated content, screen readers should not announce
    every cycle) — pass `aria-label` to describe purpose
  • prefers-reduced-motion: reduce → animation stops at the
    first frame; the strip is fully readable as a static row
  • Each item is keyboard-navigable when `href` is set

  📦 DEPENDENCIES
  Zero external dependencies — pure Svelte 5 + scoped CSS.

  ⚡ PERFORMANCE
  • One keyframe animates a `transform: translateX` on the
    track — single GPU compositor effect
  • The track renders 2× the items (just enough for a
    seamless wrap); no resize observer, no measurement loop
  • `will-change: transform` hints the GPU
  • Pause-on-hover costs nothing — animation-play-state
    flips, no JS handler

  🎨 USAGE
  <TickerTape items={prices} variant="finance" />

  <TickerTape
    items={scores}
    variant="sports"
    speed={80}
    pauseOnHover={false} />

  <TickerTape
    items={status}
    variant="minimal"
    direction="right"
    separator="·" />

  📋 PROPS
  | Prop          | Type                  | Default    |
  |---------------|-----------------------|------------|
  | items         | TickerItem[]          | []         |
  | speed         | number (px/s)         | 60         |
  | direction     | 'left' \| 'right'     | 'left'     |
  | pauseOnHover  | boolean               | true       |
  | separator     | string                | '•'        |
  | variant       | TickerVariant         | 'default'  |
  | class         | string                | ''         |

  ============================================================
-->

<script lang="ts" module>
	export type TickerVariant = 'default' | 'finance' | 'sports' | 'minimal';
	export type TickerDirection = 'left' | 'right';
	export type TickerTrend = 'up' | 'down' | 'flat';

	export interface TickerItem {
		label: string;
		value: string | number;
		delta?: number;
		trend?: TickerTrend;
		href?: string;
	}

	const VALID_VARIANTS: readonly TickerVariant[] = ['default', 'finance', 'sports', 'minimal'];
	const VALID_DIRECTIONS: readonly TickerDirection[] = ['left', 'right'];

	export function isValidVariant(name: string | undefined | null): name is TickerVariant {
		return typeof name === 'string' && (VALID_VARIANTS as readonly string[]).includes(name);
	}

	export function pickVariant(name: string | undefined | null): TickerVariant {
		return isValidVariant(name) ? name : 'default';
	}

	export function isValidDirection(name: string | undefined | null): name is TickerDirection {
		return typeof name === 'string' && (VALID_DIRECTIONS as readonly string[]).includes(name);
	}

	export function pickDirection(name: string | undefined | null): TickerDirection {
		return isValidDirection(name) ? name : 'left';
	}

	export function clampSpeed(n: number | undefined | null, fallback = 60): number {
		if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
		if (n < 1) return 1;
		if (n > 1000) return 1000;
		return n;
	}

	export function inferTrend(item: TickerItem): TickerTrend {
		if (item.trend && (['up', 'down', 'flat'] as const).includes(item.trend)) return item.trend;
		if (typeof item.delta === 'number' && Number.isFinite(item.delta)) {
			if (item.delta > 0) return 'up';
			if (item.delta < 0) return 'down';
		}
		return 'flat';
	}

	export function formatDelta(delta: number | undefined | null): string {
		if (typeof delta !== 'number' || !Number.isFinite(delta)) return '';
		const sign = delta > 0 ? '+' : '';
		return `${sign}${delta.toFixed(2)}%`;
	}

	export function trendGlyph(trend: TickerTrend): string {
		if (trend === 'up') return '▲';
		if (trend === 'down') return '▼';
		return '▬';
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
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		items?: TickerItem[];
		speed?: number;
		direction?: TickerDirection;
		pauseOnHover?: boolean;
		separator?: string;
		variant?: TickerVariant;
	}

	let {
		items = [],
		speed = 60,
		direction = 'left',
		pauseOnHover = true,
		separator = '•',
		variant = 'default',
		class: className = '',
		'aria-label': ariaLabel = 'Ticker tape'
	}: Props = $props();

	const safeVariant = $derived(pickVariant(variant));
	const safeDirection = $derived(pickDirection(direction));
	const safeSpeed = $derived(clampSpeed(speed));

	// Approximate track width per item (avg 220px) — drives keyframe duration.
	// Real layout governs visual; this just gates scroll velocity.
	const estimatedItemWidth = 220;
	const trackWidth = $derived(items.length * estimatedItemWidth);
	const durationSec = $derived(trackWidth > 0 ? trackWidth / safeSpeed : 30);
</script>

<div
	class="tickertape tickertape--{safeVariant} tickertape--{safeDirection} {className}"
	class:tickertape--pause-on-hover={pauseOnHover}
	role="marquee"
	aria-live="off"
	aria-label={ariaLabel}
	style:--tickertape-duration="{durationSec}s"
>
	{#if items.length > 0}
		<div class="tickertape__track">
			{#each [0, 1] as copy (copy)}
				{#each items as item, idx (`${copy}-${idx}`)}
					{@const trend = inferTrend(item)}
					{@const glyph = trendGlyph(trend)}
					{@const deltaText = formatDelta(item.delta)}
					{#if item.href}
						<a class="tickertape__item" href={item.href} aria-hidden={copy === 1 ? 'true' : undefined}>
							<span class="tickertape__label">{item.label}</span>
							<span class="tickertape__value">{item.value}</span>
							{#if deltaText || trend !== 'flat'}
								<span class="tickertape__delta tickertape__delta--{trend}">
									<span class="tickertape__glyph" aria-hidden="true">{glyph}</span>
									{#if deltaText}<span>{deltaText}</span>{/if}
								</span>
							{/if}
						</a>
					{:else}
						<span class="tickertape__item" aria-hidden={copy === 1 ? 'true' : undefined}>
							<span class="tickertape__label">{item.label}</span>
							<span class="tickertape__value">{item.value}</span>
							{#if deltaText || trend !== 'flat'}
								<span class="tickertape__delta tickertape__delta--{trend}">
									<span class="tickertape__glyph" aria-hidden="true">{glyph}</span>
									{#if deltaText}<span>{deltaText}</span>{/if}
								</span>
							{/if}
						</span>
					{/if}
					<span class="tickertape__sep" aria-hidden="true">{separator}</span>
				{/each}
			{/each}
		</div>
	{/if}
</div>

<style>
	.tickertape {
		--tickertape-bg: #0f172a;
		--tickertape-fg: #e2e8f0;
		--tickertape-label: #94a3b8;
		--tickertape-value: #f8fafc;
		--tickertape-up: #10b981;
		--tickertape-down: #ef4444;
		--tickertape-flat: #94a3b8;
		--tickertape-sep: #475569;
		--tickertape-py: 0.625rem;
		--tickertape-gap: 1.25rem;
		--tickertape-font: ui-monospace, 'SF Mono', Menlo, monospace;
		--tickertape-fs: 0.875rem;
		--tickertape-fw: 500;
		--tickertape-radius: 0;
		--tickertape-border: none;
		--tickertape-duration: 30s;

		position: relative;
		width: 100%;
		overflow: hidden;
		background: var(--tickertape-bg);
		color: var(--tickertape-fg);
		padding: var(--tickertape-py) 0;
		font-family: var(--tickertape-font);
		font-size: var(--tickertape-fs);
		font-weight: var(--tickertape-fw);
		border-radius: var(--tickertape-radius);
		border: var(--tickertape-border);
		mask-image: linear-gradient(
			to right,
			transparent 0,
			#000 4%,
			#000 96%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0,
			#000 4%,
			#000 96%,
			transparent 100%
		);
	}

	.tickertape--finance {
		--tickertape-bg: #0a0e1a;
		--tickertape-fg: #cbd5e1;
		--tickertape-label: #64748b;
		--tickertape-value: #fbbf24;
		--tickertape-fs: 0.9375rem;
		--tickertape-py: 0.75rem;
		border-top: 1px solid #1e293b;
		border-bottom: 1px solid #1e293b;
	}

	.tickertape--sports {
		--tickertape-bg: #042f2e;
		--tickertape-fg: #ccfbf1;
		--tickertape-label: #5eead4;
		--tickertape-value: #ffffff;
		--tickertape-up: #34d399;
		--tickertape-down: #f87171;
		--tickertape-fs: 0.9375rem;
		--tickertape-py: 0.875rem;
		--tickertape-fw: 600;
	}

	.tickertape--minimal {
		--tickertape-bg: transparent;
		--tickertape-fg: #1e293b;
		--tickertape-label: #94a3b8;
		--tickertape-value: #0f172a;
		--tickertape-up: #059669;
		--tickertape-down: #dc2626;
		--tickertape-flat: #64748b;
		--tickertape-sep: #cbd5e1;
		--tickertape-py: 0.5rem;
		--tickertape-fs: 0.8125rem;
		--tickertape-fw: 400;
		border-top: 1px solid #e2e8f0;
		border-bottom: 1px solid #e2e8f0;
	}

	.tickertape__track {
		display: inline-flex;
		align-items: center;
		gap: var(--tickertape-gap);
		white-space: nowrap;
		will-change: transform;
		animation: tickertape-scroll var(--tickertape-duration) linear infinite;
	}

	.tickertape--right .tickertape__track {
		animation-direction: reverse;
	}

	.tickertape--pause-on-hover:hover .tickertape__track {
		animation-play-state: paused;
	}

	.tickertape__item {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		text-decoration: none;
		color: inherit;
	}

	a.tickertape__item:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
		border-radius: 2px;
	}

	.tickertape__label {
		color: var(--tickertape-label);
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 0.8125em;
	}

	.tickertape__value {
		color: var(--tickertape-value);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.tickertape__delta {
		display: inline-flex;
		align-items: baseline;
		gap: 0.25rem;
		font-variant-numeric: tabular-nums;
		font-size: 0.875em;
	}

	.tickertape__delta--up {
		color: var(--tickertape-up);
	}

	.tickertape__delta--down {
		color: var(--tickertape-down);
	}

	.tickertape__delta--flat {
		color: var(--tickertape-flat);
	}

	.tickertape__glyph {
		font-size: 0.75em;
		transform: translateY(-1px);
	}

	.tickertape__sep {
		color: var(--tickertape-sep);
		font-weight: 400;
		opacity: 0.6;
	}

	@keyframes tickertape-scroll {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(-50%, 0, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tickertape__track {
			animation: none !important;
			transform: translate3d(0, 0, 0);
		}
	}
</style>
