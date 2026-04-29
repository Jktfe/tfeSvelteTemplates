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
	Decorative effect: the underlying text node is still in the DOM and read
	normally by AT. Hover/focus handlers are no-ops outside the 'hover' trigger;
	for the 'hover' trigger, focusin / focusout provide keyboard parity with
	mouseenter / mouseleave so keyboard users can also activate the effect.
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
		color: #00f5ff;
		transform: translate(var(--cyan-dx, 0), var(--cyan-dy, 0));
	}

	.glitch.active .glitch-base::after {
		color: #ff00c8;
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
