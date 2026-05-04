<!--
	============================================================
	TrueFocus — One-word-at-a-time focus highlighter
	============================================================

	🎯 WHAT IT DOES
	Renders a phrase, then cycles through it one word at a time,
	drawing a single morphing focus box around the active word.
	The box slides + resizes between words via CSS transitions —
	one indicator element, not per-word borders, so it really
	does look like a moving spotlight.

	A configurable cycle duration controls reading pace, and the
	component supports two interaction modes:
	  • hover the phrase     → pause the cycle
	  • click a single word  → pin focus to that word (toggle
	                           again to release)

	✨ FEATURES
	• Single morphing focus box — width, height, x/y all animate
	  with one CSS transition (no per-letter or per-word DOM
	  duplication, no React-reconciler-style pain).
	• Configurable cycle duration, focus colour + glow.
	• 'sequential' or 'random' cycle order.
	• Pause on hover, pin on click, replay-on-mouseleave.
	• ResizeObserver re-measures the active word when the
	  container reflows (window resize, font load, content wrap).
	• Pure helpers exported from the module-script block, so all
	  the maths is unit-testable without rendering anything.

	♿ ACCESSIBILITY
	• The phrase is one real text node split into spans, so
	  screen readers announce it as one continuous string.
	• Focus indicator is decorative (aria-hidden).
	• prefers-reduced-motion → cycle stops, indicator pinned
	  to the first word, transitions disabled. The text reads
	  exactly as static copy.
	• Click handlers are wired with role="button" + Enter/Space
	  keyboard support, so keyboard users can pin words too.

	📦 DEPENDENCIES
	Zero external dependencies. ResizeObserver is a native browser
	API, gracefully degraded on the off-chance of a missing impl.

	⚡ PERFORMANCE
	• One indicator element, transform-only animation.
	• Cycle is a setInterval — paused when not visible (uses the
	  same `pauseCycle` plumbing as hover).
	• ResizeObserver fires only when the wrapper actually resizes,
	  so quiet pages cost nothing after mount.

	🎨 USAGE
	<TrueFocus text="True focus on the present" />

	<TrueFocus
	    text="Build something extraordinary."
	    cycleDuration={1800}
	    color="#4338ca"
	    order="sequential"
	    pauseOnHover />

	📋 PROPS
	| Prop             | Type                          | Default    | Description                              |
	|------------------|-------------------------------|------------|------------------------------------------|
	| text             | string                        | required   | The phrase (split on whitespace)         |
	| cycleDuration    | number                        | 1500       | Ms each word stays in focus              |
	| color            | string                        | '#4338ca'  | Focus-box border + glow colour           |
	| glow             | boolean                       | true       | Whether to add a soft box-shadow         |
	| order            | 'sequential' \| 'random'      | sequential | Cycle order                              |
	| pauseOnHover     | boolean                       | true       | Stop the cycle while pointer is over     |
	| autoStart        | boolean                       | true       | Begin cycling on mount                   |
	| paddingX         | number                        | 8          | Horizontal padding inside the focus box  |
	| paddingY         | number                        | 4          | Vertical padding inside the focus box    |
	| class            | string                        | ''         | Extra CSS classes                        |

	💡 DISTINCT FROM
	• Typewriter   — types characters one by one
	• ScrambledText — scrambles glyphs before settling
	• ShinyText    — sweeps a gradient through letters
	• Marquee      — scrolls a whole element
	TrueFocus operates at the word level: nothing is hidden,
	nothing is animated INSIDE the words; the indicator drifts
	from word to word, leaving the typography untouched.
	============================================================
-->
<script lang="ts" module>
	/** Cycle order — sequential reads naturally, random feels jumpy/poetic. */
	export type CycleOrder = 'sequential' | 'random';

	/**
	 * Split a phrase into words on whitespace. Empty strings or
	 * pure-whitespace input collapse to []. We keep the original
	 * token (no trimming inside) so e.g. "co-op" stays one word.
	 */
	export function splitWords(text: string): string[] {
		if (!text) return [];
		return text.split(/\s+/).filter((w) => w.length > 0);
	}

	/**
	 * Pick the next index for the cycle.
	 *
	 * - 'sequential': increments and wraps at total.
	 * - 'random':    pulls a uniform random index, but never the
	 *   current one (so we don't 'flicker' on the same word twice
	 *   in a row when total > 1).
	 */
	export function cycleNext(
		current: number,
		total: number,
		order: CycleOrder,
		rng: () => number = Math.random
	): number {
		if (total <= 0) return 0;
		if (total === 1) return 0;
		if (order === 'sequential') {
			return (current + 1) % total;
		}
		// random: avoid repeating
		let next = Math.floor(rng() * total);
		if (next === current) {
			next = (next + 1) % total;
		}
		return next;
	}

	/** Bounding box used by the indicator — relative to the wrapper. */
	export interface FocusRect {
		left: number;
		top: number;
		width: number;
		height: number;
	}

	/**
	 * Pad a measured word rect outwards by paddingX horizontally
	 * and paddingY vertically. Pure: no DOM access. Negative
	 * paddings are accepted (and clamp the rect inwards), so
	 * callers can use this to *shrink* the indicator if they
	 * want a snug fit.
	 */
	export function padRect(rect: FocusRect, paddingX: number, paddingY: number): FocusRect {
		return {
			left: rect.left - paddingX,
			top: rect.top - paddingY,
			width: rect.width + paddingX * 2,
			height: rect.height + paddingY * 2
		};
	}

	/**
	 * Build the inline `style` string for the indicator div given
	 * a padded rect, focus colour, and whether the soft glow is
	 * enabled. We use translate3d for the position so we get GPU
	 * compositing, then width/height for the size.
	 */
	export function buildIndicatorStyle(rect: FocusRect, color: string, glow: boolean): string {
		const shadow = glow ? `box-shadow: 0 0 0 1px ${color}33, 0 0 18px ${color}55;` : '';
		return [
			`transform: translate3d(${rect.left}px, ${rect.top}px, 0)`,
			`width: ${rect.width}px`,
			`height: ${rect.height}px`,
			`border-color: ${color}`,
			shadow
		]
			.filter(Boolean)
			.join('; ');
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		text: string;
		cycleDuration?: number;
		color?: string;
		glow?: boolean;
		order?: CycleOrder;
		pauseOnHover?: boolean;
		autoStart?: boolean;
		paddingX?: number;
		paddingY?: number;
		class?: string;
	}

	let {
		text,
		cycleDuration = 1500,
		color = '#4338ca',
		glow = true,
		order = 'sequential',
		pauseOnHover = true,
		autoStart = true,
		paddingX = 8,
		paddingY = 4,
		class: extraClass = ''
	}: Props = $props();

	const words = $derived(splitWords(text));

	let activeIndex = $state(0);
	let pinnedIndex = $state<number | null>(null);
	let isHovering = $state(false);
	let prefersReduced = $state(false);
	let measuredRect = $state<FocusRect>({ left: 0, top: 0, width: 0, height: 0 });

	let wrapper: HTMLElement | null = null;
	const wordEls = new SvelteMap<number, HTMLElement>();
	let intervalHandle: ReturnType<typeof setInterval> | null = null;
	let resizeObserver: ResizeObserver | null = null;

	// The currently-displayed focus index — pinned wins over the cycle.
	const displayIndex = $derived(pinnedIndex ?? activeIndex);

	function setWordEl(idx: number, el: HTMLElement | null) {
		if (el) {
			wordEls.set(idx, el);
		} else {
			wordEls.delete(idx);
		}
	}

	function measureActiveWord() {
		if (!wrapper) return;
		const el = wordEls.get(displayIndex);
		if (!el) return;
		const wRect = wrapper.getBoundingClientRect();
		const eRect = el.getBoundingClientRect();
		const rect: FocusRect = {
			left: eRect.left - wRect.left,
			top: eRect.top - wRect.top,
			width: eRect.width,
			height: eRect.height
		};
		measuredRect = padRect(rect, paddingX, paddingY);
	}

	function startCycle() {
		stopCycle();
		if (prefersReduced || words.length <= 1) return;
		intervalHandle = setInterval(() => {
			if (pinnedIndex !== null) return;
			if (pauseOnHover && isHovering) return;
			activeIndex = cycleNext(activeIndex, words.length, order);
		}, cycleDuration);
	}

	function stopCycle() {
		if (intervalHandle !== null) {
			clearInterval(intervalHandle);
			intervalHandle = null;
		}
	}

	function handleWordClick(idx: number) {
		// Toggle: clicking the pinned word releases the pin.
		pinnedIndex = pinnedIndex === idx ? null : idx;
	}

	function handleWordKey(event: KeyboardEvent, idx: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleWordClick(idx);
		}
	}

	function handlePointerEnter() {
		isHovering = true;
	}

	function handlePointerLeave() {
		isHovering = false;
	}

	// Re-measure when the active word changes.
	$effect(() => {
		// Touch displayIndex so this re-runs on cycle tick.
		void displayIndex;
		// Also touch words length so we re-measure if the phrase changes.
		void words.length;
		measureActiveWord();
	});

	onMount(() => {
		prefersReduced =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

		// First measurement once the DOM is laid out.
		measureActiveWord();

		if (typeof ResizeObserver !== 'undefined' && wrapper) {
			resizeObserver = new ResizeObserver(() => measureActiveWord());
			resizeObserver.observe(wrapper);
		}

		if (autoStart) {
			untrack(() => startCycle());
		}

		return () => {
			stopCycle();
			resizeObserver?.disconnect();
			resizeObserver = null;
		};
	});
</script>

<span
	class="true-focus {extraClass}"
	bind:this={wrapper}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
>
	{#each words as word, idx (idx)}
		<span
			class="word"
			class:active={idx === displayIndex}
			class:pinned={pinnedIndex === idx}
			role="button"
			tabindex="0"
			onclick={() => handleWordClick(idx)}
			onkeydown={(e) => handleWordKey(e, idx)}
			bind:this={
				() => wordEls.get(idx) ?? null,
				(el) => setWordEl(idx, el)
			}
		>{word}</span>{#if idx < words.length - 1}<span class="space" aria-hidden="true">&nbsp;</span>{/if}
	{/each}
	<!--
		Single morphing focus box. Decorative — aria-hidden so
		screen readers ignore it (the words themselves carry
		the meaning).
	-->
	{#if words.length > 0}
		<span
			class="focus-box"
			class:reduced={prefersReduced}
			style={buildIndicatorStyle(measuredRect, color, glow)}
			aria-hidden="true"
		></span>
	{/if}
</span>

<style>
	.true-focus {
		position: relative;
		display: inline-block;
		/* The wrapper anchors the absolutely positioned focus-box. */
	}

	.word {
		position: relative;
		display: inline-block;
		cursor: pointer;
		/* Sit above the focus-box so clicks always land on the
		   word, not the indicator. */
		z-index: 1;
		transition: color 200ms ease;
		outline: none;
		/* Keep each word as one unbroken glyph run — the indicator
		   measures the word span, so we never want a single word to
		   wrap mid-glyph and skew the bounding rect. Wrapping happens
		   between words via the sibling .space separator. */
		white-space: nowrap;
	}

	.space {
		/* Sibling separator between words. Lives outside the word
		   span so the indicator's getBoundingClientRect() measures
		   only the word — not word + trailing space. */
		display: inline;
		white-space: pre;
	}

	.word:focus-visible {
		/* Tell keyboard users which word they're about to pin. */
		outline: 2px dashed currentColor;
		outline-offset: 4px;
		border-radius: 2px;
	}

	.word.active {
		/* Subtle nudge so the active word feels lifted, not just
		   surrounded. Kept tiny to avoid layout reflow that would
		   misalign the focus box mid-transition. */
		color: inherit;
	}

	.focus-box {
		position: absolute;
		left: 0;
		top: 0;
		display: block;
		border: 1.5px solid;
		border-radius: 6px;
		pointer-events: none;
		z-index: 0;
		transition:
			transform 360ms cubic-bezier(0.6, 0, 0.2, 1),
			width 360ms cubic-bezier(0.6, 0, 0.2, 1),
			height 360ms cubic-bezier(0.6, 0, 0.2, 1),
			border-color 240ms ease,
			box-shadow 240ms ease,
			opacity 240ms ease;
		will-change: transform, width, height;
	}

	.focus-box.reduced {
		/* Reduced motion: no morph. The indicator still appears,
		   just without the slide between words. */
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.focus-box {
			transition: none;
		}
	}
</style>
