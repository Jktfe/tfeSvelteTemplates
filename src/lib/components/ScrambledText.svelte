<!--
	============================================================
	ScrambledText — Glyph-shuffle reveal effect
	============================================================

	🎯 WHAT IT DOES
	Renders a string where each character starts as a random
	glyph from a configurable pool, then settles to its final
	letter at a per-character "settle time". The result is the
	classic "decoding" / "Mission Impossible terminal" reveal.

	The math is split into pure helpers (exported from the
	module-script block) so the component itself is just:

	  1. build settleTimes once
	  2. rAF loop ticks `elapsed`
	  3. on each tick, compute the visible string from
	     (text, settleTimes, elapsed, pool)

	No DOM diffing, no per-letter component, just a single
	text node updated each frame.

	✨ FEATURES
	• Configurable total scramble duration
	• Configurable character pool (default A-Z + 0-9)
	• Two reveal orders: left-to-right or random
	• Auto-start on mount, or trigger via replayOnHover
	• Optional start delay
	• Spaces are preserved (never scrambled — keeps word
	  boundaries readable mid-scramble)

	♿ ACCESSIBILITY
	• aria-label always carries the final text, so screen
	  readers announce the destination string immediately.
	• The animated text node is aria-hidden (decorative).
	• prefers-reduced-motion → skip the animation, render
	  the final text directly. No flicker.

	📦 DEPENDENCIES
	Zero external dependencies. Pure JS state machine + rAF.

	⚡ PERFORMANCE
	• One rAF loop while scrambling, cleared on completion.
	• No layout reads, no ResizeObserver.
	• Text is updated in a single text node — no per-letter
	  spans, so DOM cost stays flat with text length.

	🎨 USAGE
	<ScrambledText text="Hello, world" />

	<ScrambledText
	    text="DECODED"
	    duration={2000}
	    order="random"
	    replayOnHover />

	📋 PROPS
	| Prop           | Type                          | Default  | Description                              |
	|----------------|-------------------------------|----------|------------------------------------------|
	| text           | string                        | required | Final string                             |
	| duration       | number                        | 1500     | Total scramble length in ms              |
	| pool           | string                        | A-Z 0-9  | Characters to pick from while scrambling |
	| order          | 'left-to-right' \| 'random'   | 'lr'     | Per-char settle order                    |
	| replayOnHover  | boolean                       | false    | Restart the scramble on pointerenter     |
	| autoStart      | boolean                       | true     | Run the scramble on mount                |
	| delay          | number                        | 0        | Ms to wait before the first tick         |
	| class          | string                        | ''       | Extra CSS classes                        |

	💡 DISTINCT FROM
	• Typewriter — types one char at a time; never scrambles
	• ShinyText  — recolours letters via gradient; never swaps glyphs
	• Marquee    — scrolls an element, doesn't change its text
	============================================================
-->
<script lang="ts" module>
	/** Per-char settle order. */
	export type RevealOrder = 'left-to-right' | 'random';

	/** Default scramble pool — capital letters and digits. Fits any font. */
	export const DEFAULT_SCRAMBLE_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	/**
	 * Pick a single random character from the pool. Exposed so unit
	 * tests can pass a deterministic rng (e.g. () => 0) and assert
	 * that index 0 of the pool comes back.
	 */
	export function pickScrambleChar(pool: string, rng: () => number = Math.random): string {
		if (pool.length === 0) return '';
		const idx = Math.floor(rng() * pool.length);
		return pool.charAt(idx);
	}

	/**
	 * Build the per-character settle-time array (in ms).
	 *
	 * - 'left-to-right': evenly spaced. The final char settles at
	 *   exactly `duration`, earlier chars proportionally sooner.
	 * - 'random':       jitter each char into a uniform random slot
	 *   inside [0, duration]. Picks via the supplied rng for
	 *   determinism in tests.
	 *
	 * A length-0 string returns []. A length-1 string settles at
	 * exactly `duration` regardless of order.
	 */
	export function computeSettleTimes(
		charCount: number,
		duration: number,
		order: RevealOrder,
		rng: () => number = Math.random
	): number[] {
		if (charCount <= 0) return [];
		if (charCount === 1) return [duration];

		if (order === 'left-to-right') {
			return Array.from({ length: charCount }, (_, i) => {
				return ((i + 1) / charCount) * duration;
			});
		}

		return Array.from({ length: charCount }, () => rng() * duration);
	}

	/**
	 * Compute the visible string for a given moment in time.
	 *
	 * For each character in the source text:
	 *   - if it's a space, keep it (whitespace stays stable so the
	 *     reader can see word boundaries forming)
	 *   - if elapsed >= its settleTime, show the final char
	 *   - otherwise, pick a random char from the pool
	 *
	 * Pure: same inputs → same output (when rng is deterministic).
	 */
	export function getDisplayString(
		text: string,
		settleTimes: number[],
		elapsed: number,
		pool: string,
		rng: () => number = Math.random
	): string {
		let out = '';
		for (let i = 0; i < text.length; i++) {
			const finalChar = text.charAt(i);
			if (finalChar === ' ') {
				out += ' ';
				continue;
			}
			const settleAt = settleTimes[i] ?? 0;
			if (elapsed >= settleAt) {
				out += finalChar;
			} else {
				out += pickScrambleChar(pool, rng);
			}
		}
		return out;
	}

	/** True once every (non-space) character has reached its settle time. */
	export function isScrambleComplete(settleTimes: number[], elapsed: number): boolean {
		if (settleTimes.length === 0) return true;
		for (let i = 0; i < settleTimes.length; i++) {
			if (elapsed < settleTimes[i]) return false;
		}
		return true;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		duration?: number;
		pool?: string;
		order?: RevealOrder;
		replayOnHover?: boolean;
		autoStart?: boolean;
		delay?: number;
		class?: string;
	}

	let {
		text,
		duration = 1500,
		pool = DEFAULT_SCRAMBLE_POOL,
		order = 'left-to-right',
		replayOnHover = false,
		autoStart = true,
		delay = 0,
		class: extraClass = ''
	}: Props = $props();

	// detect reduced-motion once at mount; users who want fully
	// reactive behaviour can re-mount the component if they change
	// their OS preference mid-session
	let prefersReduced = $state(false);

	// Start as empty so SSR/initial render bypasses this state and falls
	// through to the literal `text` prop below — see the template. Once we
	// animate, the rAF tick fills `display` frame-by-frame.
	let display = $state('');
	let isAnimating = $state(false);
	let settleTimes: number[] = [];
	let frameHandle: number | null = null;
	let delayHandle: ReturnType<typeof setTimeout> | null = null;
	let startTime = 0;

	function cancelTimers() {
		if (frameHandle !== null) {
			cancelAnimationFrame(frameHandle);
			frameHandle = null;
		}
		if (delayHandle !== null) {
			clearTimeout(delayHandle);
			delayHandle = null;
		}
	}

	function tick(now: number) {
		const elapsed = now - startTime;
		display = getDisplayString(text, settleTimes, elapsed, pool);
		if (isScrambleComplete(settleTimes, elapsed)) {
			display = text;
			isAnimating = false;
			frameHandle = null;
			return;
		}
		frameHandle = requestAnimationFrame(tick);
	}

	function startScramble() {
		cancelTimers();
		if (prefersReduced || !text) {
			display = text;
			isAnimating = false;
			return;
		}
		settleTimes = computeSettleTimes(text.length, duration, order);
		// Show a fully-scrambled state immediately so the eye can latch on
		display = getDisplayString(text, settleTimes, 0, pool);
		isAnimating = true;
		const begin = () => {
			startTime = performance.now();
			frameHandle = requestAnimationFrame(tick);
		};
		if (delay > 0) {
			delayHandle = setTimeout(begin, delay);
		} else {
			begin();
		}
	}

	function handlePointerEnter() {
		if (replayOnHover && !isAnimating) {
			startScramble();
		}
	}

	onMount(() => {
		prefersReduced =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

		if (autoStart) {
			startScramble();
		} else {
			display = text;
		}

		return () => {
			cancelTimers();
		};
	});
</script>

<span
	class="scrambled-text {extraClass}"
	class:is-animating={isAnimating}
	aria-label={text}
	onpointerenter={handlePointerEnter}
>
	<!--
		Visible (decorative) layer. While animating we show the
		frame-by-frame `display` state. Otherwise we render the
		final `text` directly so SSR + pre-hydration paints the
		right thing without hopping through reactive state.
	-->
	<span aria-hidden="true">{isAnimating ? display : text}</span>
</span>

<style>
	.scrambled-text {
		display: inline-block;
		/* lock the visible width to the final text so the surrounding
		   layout doesn't reflow as glyphs swap (most monospace-ish
		   fonts handle this naturally; for proportional fonts we
		   reserve space using `font-variant-numeric: tabular-nums`
		   when digits are involved) */
		font-variant-numeric: tabular-nums;
		/* a hairline letter-spacing helps the random glyphs feel like
		   they belong to a single rolling cipher rather than jumping
		   visually as widths change */
		letter-spacing: 0.02em;
	}

	.scrambled-text.is-animating {
		/* small visual cue that the text is "decoding" — slightly
		   muted feel to emphasise the settled letters */
		opacity: 0.95;
	}
</style>
