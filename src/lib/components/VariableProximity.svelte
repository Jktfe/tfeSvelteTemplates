<!--
	============================================================
	VariableProximity — Cursor-reactive variable-font typography
	============================================================

	🎯 WHAT IT DOES
	Splits a phrase into per-letter spans, then drives each
	letter's font-variation-settings axes (weight, width, slant,
	optical size) by how close the cursor is. Letters near the
	pointer swell in weight and width; letters far away rest at
	their base values. The effect is purely cursor-reactive —
	no timer, no autoplay, no animation loop after each mouse
	update. CSS transitions interpolate between axis values so
	the letterforms morph smoothly.

	✨ FEATURES
	• Per-letter cursor-reactive font-variation-settings.
	• Configurable axes — wght, wdth, slnt, opsz, or any custom
	  variable-font axis. Multiple axes drive simultaneously.
	• Configurable falloff curve (linear / quadratic / gaussian)
	  and proximity radius.
	• Pure CSS transition between axis values — no JS tweening.
	• rAF-throttled mousemove handler — at most one DOM-write
	  pass per frame regardless of pointer event rate.
	• Keyboard parity: focus-within places a virtual cursor at
	  the wrapper centre so keyboard users see a static effect.
	• Detects variable-font support via CSS.supports — degrades
	  gracefully to flat static rendering on unsupported browsers
	  with no error and no flash of missing style.

	♿ ACCESSIBILITY
	• Wrapper carries aria-label with the full string; per-letter
	  spans are aria-hidden so screen readers announce one
	  continuous text node.
	• prefers-reduced-motion → cursor handler bails out, letters
	  stay frozen at their base axes. The phrase reads as flat
	  static type.
	• Keyboard users can Tab onto the wrapper; focus places the
	  proximity centre at the wrapper midpoint as a parallel
	  static effect, then blur restores base.
	• The component does not change the layout — variable-font
	  axes affect the rendering, not the glyph metrics, so the
	  baseline and surrounding flow stay put.

	📦 DEPENDENCIES
	Zero external dependencies. Uses native CSS
	font-variation-settings + CSS.supports for the capability
	check. Variable font is sourced from the OS — Inter Variable,
	Roboto Flex, Segoe UI Variable, or San Francisco — all of
	which ship as variable on modern systems. No font CDN.

	⚡ PERFORMANCE
	• rAF-throttled mousemove → at most 60 DOM writes per second
	  per letter regardless of pointer event flood rate.
	• font-variation-settings is GPU-friendly on modern engines;
	  no layout reflow on axis change.
	• Letter rect is measured fresh each frame (no cache), so
	  resize / scroll / zoom adjust automatically with no extra
	  observer.

	🎨 USAGE
	<VariableProximity text="Move your cursor over me" />

	<VariableProximity
	    text="Drift the focus close, see weight bloom."
	    radius={140}
	    falloffCurve="gaussian"
	    axes={[
	        { axis: 'wght', base: 300, peak: 900 },
	        { axis: 'wdth', base: 90,  peak: 125 },
	        { axis: 'slnt', base: 0,   peak: -12 }
	    ]} />

	📋 PROPS
	| Prop          | Type           | Default        | Description                                |
	|---------------|----------------|----------------|--------------------------------------------|
	| text          | string         | required       | Phrase rendered per-letter                 |
	| radius        | number         | 120            | Cursor radius in px (proximity falloff)    |
	| falloffCurve  | FalloffCurve   | 'quadratic'    | linear / quadratic / gaussian              |
	| axes          | AxisRange[]    | wght+wdth      | Axes driven by proximity (base→peak)       |
	| transitionMs  | number         | 150            | CSS transition duration between writes     |
	| class         | string         | ''             | Extra classes on the wrapper               |

	💡 DISTINCT FROM
	• Typewriter   — char-reveal timer
	• ScrambledText — glyph-swap timer
	• ShinyText    — gradient-sweep timer
	• TrueFocus    — word-cycle timer
	All four animate on a clock. VariableProximity is purely
	cursor-reactive — the glyphs are static when the pointer is
	away. First component in the library that maps spatial cursor
	proximity to typography rendering.
	============================================================
-->
<script lang="ts" module>
	/** A variable-font axis we can drive. The big four cover most use-cases. */
	export type Axis = 'wght' | 'wdth' | 'slnt' | 'opsz';

	/** Range definition for a single axis: rest at base, peak at full proximity. */
	export interface AxisRange {
		axis: Axis;
		base: number;
		peak: number;
	}

	/** Falloff curve for proximity → axis weighting. */
	export type FalloffCurve = 'linear' | 'quadratic' | 'gaussian';

	/**
	 * Euclidean distance between two 2D points. Pure — no DOM access.
	 */
	export function distance(
		p1: { x: number; y: number },
		p2: { x: number; y: number }
	): number {
		const dx = p1.x - p2.x;
		const dy = p1.y - p2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Map a distance to a 0..1 proximity weight using a chosen curve.
	 *
	 * - At d = 0   → 1.0 (full peak)
	 * - At d ≥ rad → 0.0 (full base)
	 *
	 * 'linear' is a triangular falloff. 'quadratic' eases out from peak,
	 * giving a smoother, less spiky bloom. 'gaussian' has a bell-shaped
	 * profile — narrow centre, soft tails — closest to a real spotlight.
	 */
	export function falloff(
		d: number,
		radius: number,
		curve: FalloffCurve = 'quadratic'
	): number {
		if (radius <= 0) return 0;
		if (d <= 0) return 1;
		if (d >= radius) return 0;
		const t = 1 - d / radius;
		if (curve === 'linear') return t;
		if (curve === 'quadratic') return t * t;
		// gaussian: exp(-((1-t)*2)^2) gives a nice bell that hits ~0 at t=0.
		const gx = (1 - t) * 2;
		return Math.exp(-(gx * gx));
	}

	/**
	 * Linear interpolate between base and peak by t ∈ [0,1]. We deliberately
	 * do not clamp t — callers feed the falloff() output, which is already
	 * bounded — and unclamped lerp is occasionally useful for over-shoot
	 * effects.
	 */
	export function axisInterpolate(t: number, base: number, peak: number): number {
		return base + (peak - base) * t;
	}

	/**
	 * Build a font-variation-settings string from a list of axis ranges and
	 * a single proximity weight. Output looks like:
	 *   "wght" 750.00, "wdth" 112.50
	 * which is exactly the syntax the CSS property expects. Two-decimal
	 * precision is plenty — variable fonts quantise internally and the
	 * shorter string keeps inline-style writes cheap.
	 */
	export function buildVariationSettings(axes: AxisRange[], proximity: number): string {
		return axes
			.map(({ axis, base, peak }) => {
				const v = axisInterpolate(proximity, base, peak);
				return `"${axis}" ${v.toFixed(2)}`;
			})
			.join(', ');
	}

	/**
	 * Capability probe — does the browser handle font-variation-settings?
	 * Used by the component to bail out of cursor handling on very old
	 * engines (the effect would silently no-op anyway, but skipping the
	 * DOM writes is cheaper). Treats SSR / non-CSS environments as false.
	 */
	export function isVariableFontSupported(): boolean {
		if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false;
		try {
			return CSS.supports('font-variation-settings: "wght" 400');
		} catch {
			return false;
		}
	}

	/**
	 * Split a string into per-character tokens, flagging whitespace so the
	 * component can render space spans separately (uniform width, never
	 * focusable, never targeted). We use Array.from to honour surrogate
	 * pairs — a flag emoji or a CJK ideograph stays one token.
	 */
	export function splitToLetters(text: string): { char: string; isSpace: boolean }[] {
		return Array.from(text).map((char) => ({
			char,
			isSpace: /\s/.test(char)
		}));
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		text: string;
		radius?: number;
		falloffCurve?: FalloffCurve;
		axes?: AxisRange[];
		transitionMs?: number;
		class?: string;
	}

	const DEFAULT_AXES: AxisRange[] = [
		{ axis: 'wght', base: 400, peak: 800 },
		{ axis: 'wdth', base: 100, peak: 125 }
	];

	let {
		text,
		radius = 120,
		falloffCurve = 'quadratic',
		axes = DEFAULT_AXES,
		transitionMs = 150,
		class: extraClass = ''
	}: Props = $props();

	const letters = $derived(splitToLetters(text));
	const baseSettings = $derived(buildVariationSettings(axes, 0));

	let wrapper: HTMLElement | null = null;
	const letterEls = new SvelteMap<number, HTMLElement>();
	let prefersReduced = $state(false);
	let supportsVariable = $state(true);
	let cursorPos = $state<{ x: number; y: number } | null>(null);
	let rafHandle: number | null = null;

	function setLetterEl(idx: number, el: HTMLElement | null) {
		if (el) {
			letterEls.set(idx, el);
		} else {
			letterEls.delete(idx);
		}
	}

	/**
	 * The render pass: walk every registered letter element, measure it
	 * against the wrapper, and write a fresh font-variation-settings
	 * inline style based on current cursor proximity. Called inside an
	 * rAF so we coalesce floods of pointermove events to a single pass.
	 */
	function applyAxesFromCursor() {
		rafHandle = null;
		if (!wrapper) return;
		if (cursorPos === null) {
			// Pointer is away or just left — reset every letter to base.
			for (const el of letterEls.values()) {
				el.style.fontVariationSettings = baseSettings;
			}
			return;
		}
		const wRect = wrapper.getBoundingClientRect();
		const cursor = {
			x: cursorPos.x - wRect.left,
			y: cursorPos.y - wRect.top
		};
		for (const el of letterEls.values()) {
			const lRect = el.getBoundingClientRect();
			const lCenter = {
				x: lRect.left - wRect.left + lRect.width / 2,
				y: lRect.top - wRect.top + lRect.height / 2
			};
			const d = distance(cursor, lCenter);
			const prox = falloff(d, radius, falloffCurve);
			el.style.fontVariationSettings = buildVariationSettings(axes, prox);
		}
	}

	function scheduleApply() {
		if (rafHandle !== null) return;
		rafHandle = requestAnimationFrame(applyAxesFromCursor);
	}

	function handlePointerMove(e: PointerEvent) {
		if (prefersReduced || !supportsVariable) return;
		cursorPos = { x: e.clientX, y: e.clientY };
		scheduleApply();
	}

	function handlePointerLeave() {
		if (prefersReduced || !supportsVariable) return;
		cursorPos = null;
		scheduleApply();
	}

	function handleFocus() {
		if (prefersReduced || !supportsVariable || !wrapper) return;
		// Place a virtual cursor at the wrapper centre so keyboard users
		// see a non-trivial sample of the effect without needing to hunt
		// for it with a pointer.
		const wRect = wrapper.getBoundingClientRect();
		cursorPos = {
			x: wRect.left + wRect.width / 2,
			y: wRect.top + wRect.height / 2
		};
		scheduleApply();
	}

	function handleBlur() {
		if (prefersReduced || !supportsVariable) return;
		cursorPos = null;
		scheduleApply();
	}

	onMount(() => {
		prefersReduced =
			typeof window !== 'undefined' &&
			window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
		supportsVariable = isVariableFontSupported();

		// Apply base settings once so initial render doesn't flash unset values.
		untrack(() => scheduleApply());

		return () => {
			if (rafHandle !== null) {
				cancelAnimationFrame(rafHandle);
				rafHandle = null;
			}
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- Intentional: focus places a virtual cursor at the wrapper centre so keyboard
     users see a peak-centred preview of the proximity effect. -->
<span
	class="variable-proximity {extraClass}"
	class:reduced={prefersReduced}
	class:no-vf={!supportsVariable}
	bind:this={wrapper}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onfocus={handleFocus}
	onblur={handleBlur}
	tabindex="0"
	aria-label={text}
	style="--vp-transition-ms: {transitionMs}ms;"
>
	{#each letters as letter, idx (idx)}
		{#if letter.isSpace}
			<span class="space" aria-hidden="true">&nbsp;</span>
		{:else}
			<span
				class="letter"
				aria-hidden="true"
				style="font-variation-settings: {baseSettings};"
				bind:this={
					() => letterEls.get(idx) ?? null,
					(el) => setLetterEl(idx, el)
				}
			>{letter.char}</span>
		{/if}
	{/each}
</span>

<style>
	.variable-proximity {
		display: inline-block;
		font-family:
			'Inter Variable',
			'Roboto Flex',
			'Segoe UI Variable Display',
			'Segoe UI Variable',
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		cursor: default;
		outline: none;
	}

	.variable-proximity:focus-visible {
		outline: 2px dashed currentColor;
		outline-offset: 4px;
		border-radius: 2px;
	}

	.letter {
		display: inline-block;
		transition: font-variation-settings var(--vp-transition-ms, 150ms) ease-out;
		will-change: font-variation-settings;
	}

	.space {
		display: inline-block;
		width: 0.25em;
	}

	/* Reduced-motion or unsupported variable fonts: freeze the letter at
	   base, no transition, no will-change. Cursor handlers also bail in JS,
	   so no inline style writes happen — the static base shines through. */
	.variable-proximity.reduced .letter,
	.variable-proximity.no-vf .letter {
		transition: none;
		will-change: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.letter {
			transition: none;
			will-change: auto;
		}
	}
</style>
