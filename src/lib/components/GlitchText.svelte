<script lang="ts" module>
	export type IntensityName = 'subtle' | 'moderate' | 'wild';
	export type TriggerName = 'auto' | 'hover' | 'viewport';

	export interface IntensityConfig {
		offsetMax: number;
		tearMs: number;
		jitterMs: number;
		opacity: number;
	}

	const INTENSITIES: Record<IntensityName, IntensityConfig> = {
		subtle: { offsetMax: 1, tearMs: 80, jitterMs: 700, opacity: 0.45 },
		moderate: { offsetMax: 3, tearMs: 130, jitterMs: 380, opacity: 0.65 },
		wild: { offsetMax: 6, tearMs: 200, jitterMs: 220, opacity: 0.85 }
	};

	export function pickIntensity(name: IntensityName | string | null | undefined): IntensityConfig {
		return INTENSITIES[name as IntensityName] ?? INTENSITIES.moderate;
	}

	function pseudoRand(seed: number, salt: number): number {
		const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
		return v - Math.floor(v);
	}

	export function jitterOffset(
		intensity: IntensityConfig,
		seed: number
	): { dx: number; dy: number } {
		const rx = pseudoRand(seed, 1) * 2 - 1;
		const ry = pseudoRand(seed, 2) * 2 - 1;
		return {
			dx: Math.round(rx * intensity.offsetMax),
			dy: Math.round(ry * intensity.offsetMax)
		};
	}

	export function tearBand(
		intensity: IntensityConfig,
		seed: number
	): { top: number; height: number; dx: number } {
		const rt = pseudoRand(seed, 3);
		const rh = pseudoRand(seed, 4);
		const rd = pseudoRand(seed, 5) * 2 - 1;
		const top = Math.round(rt * 80);
		const height = 5 + Math.round(rh * 25);
		const dx = Math.round(rd * intensity.offsetMax * 4);
		return { top, height, dx };
	}

	export function scheduleNextTear(intensity: IntensityConfig, now: number): number {
		const r = pseudoRand(Math.floor(now), 6);
		return Math.round(intensity.jitterMs * (0.5 + r));
	}

	export function pickTrigger(name: TriggerName | string | null | undefined): TriggerName {
		return name === 'auto' || name === 'hover' || name === 'viewport' ? name : 'auto';
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Props = {
		text: string;
		intensity?: IntensityName;
		trigger?: TriggerName;
	};

	let { text, intensity = 'moderate', trigger = 'auto' }: Props = $props();

	let host: HTMLElement | undefined = $state();
	let active = $state(false);
	let dxCyan = $state(0);
	let dyCyan = $state(0);
	let dxMagenta = $state(0);
	let dyMagenta = $state(0);
	let tearTop = $state(0);
	let tearHeight = $state(0);
	let tearDx = $state(0);
	let tearVisible = $state(false);

	let rafId: number | null = null;
	let tearTimeout: ReturnType<typeof setTimeout> | null = null;
	let tearHideTimeout: ReturnType<typeof setTimeout> | null = null;
	let observer: IntersectionObserver | null = null;

	const cfg = $derived(pickIntensity(intensity));
	const resolvedTrigger = $derived(pickTrigger(trigger));

	function tickJitter() {
		const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
		const seedA = Math.floor(now / 80);
		const a = jitterOffset(cfg, seedA);
		const b = jitterOffset(cfg, seedA + 7);
		dxCyan = a.dx;
		dyCyan = a.dy;
		dxMagenta = -b.dx;
		dyMagenta = -b.dy;
		rafId = requestAnimationFrame(tickJitter);
	}

	function scheduleTear() {
		const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
		const next = scheduleNextTear(cfg, now);
		tearTimeout = setTimeout(() => {
			const seed = Math.floor(
				typeof performance !== 'undefined' ? performance.now() : Date.now()
			);
			const band = tearBand(cfg, seed);
			tearTop = band.top;
			tearHeight = band.height;
			tearDx = band.dx;
			tearVisible = true;
			tearHideTimeout = setTimeout(() => {
				tearVisible = false;
				if (active) scheduleTear();
			}, cfg.tearMs);
		}, next);
	}

	function start() {
		if (active) return;
		if (isReducedMotion()) return;
		active = true;
		rafId = requestAnimationFrame(tickJitter);
		scheduleTear();
	}

	function stop() {
		active = false;
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
		if (tearTimeout) clearTimeout(tearTimeout);
		tearTimeout = null;
		if (tearHideTimeout) clearTimeout(tearHideTimeout);
		tearHideTimeout = null;
		dxCyan = 0;
		dyCyan = 0;
		dxMagenta = 0;
		dyMagenta = 0;
		tearVisible = false;
	}

	onMount(() => {
		if (resolvedTrigger === 'auto') {
			start();
		} else if (resolvedTrigger === 'viewport') {
			if (typeof IntersectionObserver === 'undefined') {
				start();
				return;
			}
			observer = new IntersectionObserver((entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						start();
						observer?.disconnect();
						observer = null;
						break;
					}
				}
			});
			if (host) observer.observe(host);
		}
	});

	onDestroy(() => {
		stop();
		observer?.disconnect();
		observer = null;
	});

	function handleEnter() {
		if (resolvedTrigger === 'hover') start();
	}

	function handleLeave() {
		if (resolvedTrigger === 'hover') stop();
	}
</script>

<!--
  ============================================================
  GlitchText — Chromatic-aberration text glitch primitive
  ============================================================

  WHAT IT DOES
  Wraps text in a real DOM node plus two CSS pseudo-element
  ghost layers that drift cyan and magenta either side of the
  glyph centre. An occasional clip-path "tear" band slices a
  horizontal strip and shoves it sideways. The combined effect
  fakes the rapid RGB-channel separation you see on glitchy CRTs
  or analogue tape damage. Asset-free — pure CSS pseudo-elements
  + clip-path + a small rAF loop for the timing.

  FEATURES
  - Three intensity profiles (subtle / moderate / wild)
  - Three triggers (auto on mount / hover with kbd parity / first viewport entry)
  - Pseudo-random deterministic jitter at 60fps via rAF
  - Honours prefers-reduced-motion (effect disabled, clones hidden)
  - Cyan/magenta channels exposed as CSS tokens so consumers can
    retint without forking the component

  ACCESSIBILITY
  - Underlying text node is unmodified; screen readers read it
    as-is. Ghost layers are CSS pseudo-elements (invisible to AT);
    the tear span is aria-hidden and pointer-events:none.
  - Hover trigger pairs with focusin / focusout for keyboard
    parity, so keyboard users can also activate the effect.
  - Reduced-motion users see the static base text, no jitter.

  DEPENDENCIES
  Zero external dependencies. Pure CSS pseudo-elements and a
  small rAF/timeout loop for the deterministic jitter.

  THEMING
  Two CSS custom properties on .glitch, brand defaults inline.
  The chromatic-aberration hues are treated as brand colours
  — they stay vivid on both light and dark schemes (mirrors the
  RatingStars gold-star pattern: brand colour stays, chrome
  flips). No prefers-color-scheme block is needed because nothing
  in this component is chrome — the underlying text inherits
  colour from the parent, so it already adapts to whichever
  scheme the host page uses.
  - --glitch-cyan      cyan ghost colour    (default #00f5ff)
  - --glitch-magenta   magenta ghost colour (default #ff00c8)
  Override the brand tokens by targeting .glitch directly with
  at least 2-class specificity — required to overcome the (0,2,0)
  specificity of the component's scoped internal styles. Svelte
  appends a hash class to every selector, so the component's own
  .glitch.svelte-HASH rule (specificity (0,2,0)) declares the
  default directly on the element. An ancestor :root or body rule
  sets a value that descendants would inherit, but that inherited
  value is shadowed by the component's own declaration on the
  same element — declared values always win over inherited values
  on the element where they're declared, regardless of the
  ancestor rule's specificity. To override, you must declare on
  the same element with ≥(0,2,0) specificity. See docs/THEMING.md
  for the full arithmetic. Doubled-class trick is the cheapest
  unconditional override:
      body .glitch.glitch { --glitch-cyan: #fbbf24; --glitch-magenta: #ef4444; }

  USAGE
  Plain text:
      <GlitchText text="ERROR" />

  Wild on hover (keyboard accessible):
      <GlitchText text="GLITCH" intensity="wild" trigger="hover" />

  Trigger when scrolled into view:
      <GlitchText text="HEADLINE" trigger="viewport" />

  PROPS
  | Prop      | Type                              | Default    | Description |
  |-----------|-----------------------------------|------------|-------------|
  | text      | string                            | required   | Text content (read by AT) |
  | intensity | 'subtle' \| 'moderate' \| 'wild'  | 'moderate' | Effect amplitude |
  | trigger   | 'auto' \| 'hover' \| 'viewport'   | 'auto'     | When to start the effect |
  ============================================================
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	bind:this={host}
	class="glitch"
	class:active
	data-intensity={intensity}
	data-trigger={resolvedTrigger}
	onmouseenter={handleEnter}
	onmouseleave={handleLeave}
	onfocusin={handleEnter}
	onfocusout={handleLeave}
	style="--cyan-dx:{dxCyan}px;--cyan-dy:{dyCyan}px;--magenta-dx:{dxMagenta}px;--magenta-dy:{dyMagenta}px;--tear-top:{tearTop}%;--tear-height:{tearHeight}%;--tear-dx:{tearDx}px;--clone-opacity:{cfg.opacity};"
>
	<span class="glitch-base" data-text={text}>{text}</span>
	{#if active && tearVisible}
		<span class="glitch-tear" aria-hidden="true">{text}</span>
	{/if}
</span>

<style>
	.glitch {
		/*
		 * Theming tokens — chromatic-aberration hues. These are
		 * brand colours and stay vivid on both light and dark
		 * schemes (mirrors the RatingStars gold-star pattern).
		 * To retheme, target .glitch with ≥2-class specificity —
		 * required to overcome this rule's (0,2,0) scoped specificity.
		 * An ancestor :root or body rule sets a value that
		 * descendants would inherit, but that inherited value is
		 * shadowed by this component's own declaration on the
		 * .glitch element — declared values always win over
		 * inherited values on the same element. See
		 * docs/THEMING.md for the full arithmetic.
		 */
		--glitch-cyan: #00f5ff;
		--glitch-magenta: #ff00c8;

		position: relative;
		display: inline-block;
		font-family: inherit;
		color: inherit;
		isolation: isolate;
	}

	.glitch-base {
		position: relative;
		display: inline-block;
		z-index: 2;
	}

	.glitch.active .glitch-base::before,
	.glitch.active .glitch-base::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: var(--clone-opacity, 0.65);
		z-index: -1;
	}

	.glitch.active .glitch-base::before {
		color: var(--glitch-cyan);
		transform: translate(var(--cyan-dx, 0), var(--cyan-dy, 0));
	}

	.glitch.active .glitch-base::after {
		color: var(--glitch-magenta);
		transform: translate(var(--magenta-dx, 0), var(--magenta-dy, 0));
	}

	.glitch-tear {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		color: inherit;
		pointer-events: none;
		clip-path: inset(
			var(--tear-top, 0) 0 calc(100% - var(--tear-top, 0) - var(--tear-height, 0)) 0
		);
		transform: translateX(var(--tear-dx, 0));
		z-index: 3;
		mix-blend-mode: difference;
	}

	@media (prefers-reduced-motion: reduce) {
		.glitch.active .glitch-base::before,
		.glitch.active .glitch-base::after,
		.glitch-tear {
			display: none;
		}
	}
</style>
