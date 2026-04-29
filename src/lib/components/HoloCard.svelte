<script lang="ts" module>
	export type IntensityName = 'subtle' | 'iridescent' | 'cosmic';
	export type PaletteName = 'rainbow' | 'pastel' | 'cosmic' | 'gold';

	export interface IntensityConfig {
		saturation: number;
		sheenAlpha: number;
		paletteSize: number;
	}

	const INTENSITIES: Record<IntensityName, IntensityConfig> = {
		subtle: { saturation: 0.18, sheenAlpha: 0.25, paletteSize: 3 },
		iridescent: { saturation: 0.32, sheenAlpha: 0.45, paletteSize: 5 },
		cosmic: { saturation: 0.5, sheenAlpha: 0.6, paletteSize: 7 }
	};

	const PALETTES: Record<PaletteName, string[]> = {
		rainbow: ['#ff006e', '#ff7900', '#ffd60a', '#06d6a0', '#118ab2', '#8338ec', '#ff006e'],
		pastel: ['#ffd6e0', '#fce5cd', '#fff2b3', '#d6f5d6', '#cce5ff', '#e0ccff', '#ffd6e0'],
		cosmic: ['#0a0a23', '#5a189a', '#9d4edd', '#c77dff', '#e0aaff', '#9d4edd', '#0a0a23'],
		gold: ['#7a4f01', '#b48b1a', '#e6b800', '#ffd700', '#fff5b8', '#ffd700', '#7a4f01']
	};

	export function pickIntensity(name: IntensityName | string | null | undefined): IntensityConfig {
		return INTENSITIES[name as IntensityName] ?? INTENSITIES.iridescent;
	}

	export function pickPalette(name: PaletteName | string | null | undefined): string[] {
		return PALETTES[name as PaletteName] ?? PALETTES.rainbow;
	}

	export function clamp01(n: number): number {
		if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
		if (n < 0) return 0;
		if (n > 1) return 1;
		return n;
	}

	export function cursorAngle(
		cursorX: number,
		cursorY: number,
		rect: { left: number; top: number; width: number; height: number }
	): number {
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const dx = cursorX - cx;
		const dy = cursorY - cy;
		const rad = Math.atan2(dy, dx);
		let deg = (rad * 180) / Math.PI;
		if (deg < 0) deg += 360;
		return deg;
	}

	export function hueAtAngle(angle: number, paletteSize: number): number {
		const mult = Math.max(1, Math.min(paletteSize, 8));
		const scaled = (angle * mult) % 360;
		return ((scaled % 360) + 360) % 360;
	}

	export function sheenAtAngle(angle: number, intensity: IntensityConfig): number {
		const t = Math.sin((angle * Math.PI) / 180) * 0.5 + 0.5;
		return clamp01(t * intensity.sheenAlpha);
	}

	export function isReducedMotion(): boolean {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		intensity?: IntensityName;
		palette?: PaletteName;
		children?: Snippet;
	};

	let { intensity = 'iridescent', palette = 'rainbow', children }: Props = $props();

	let host: HTMLElement | undefined = $state();
	let hue = $state(0);
	let sheen = $state(0);
	let reduced = $state(false);

	const cfg = $derived(pickIntensity(intensity));
	const colors = $derived(pickPalette(palette));
	const gradientStops = $derived(colors.join(', '));

	onMount(() => {
		reduced = isReducedMotion();
	});

	function handlePointerMove(e: PointerEvent) {
		if (reduced) return;
		if (!host) return;
		const rect = host.getBoundingClientRect();
		const angle = cursorAngle(e.clientX, e.clientY, rect);
		hue = hueAtAngle(angle, cfg.paletteSize);
		sheen = sheenAtAngle(angle, cfg);
	}

	function handlePointerLeave() {
		hue = 0;
		sheen = 0;
	}
</script>

<!--
	Decorative wrapper: slotted content stays in the DOM and a11y tree.
	Foil and sheen are pointer-event-none, aria-hidden overlays. Pointer handlers
	are no-ops under prefers-reduced-motion: reduce.
-->
<div
	bind:this={host}
	class="holo"
	class:reduced
	data-intensity={intensity}
	data-palette={palette}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	style="--holo-hue:{hue}deg;--holo-sheen:{sheen};--holo-saturation:{cfg.saturation};"
>
	<div class="holo-content">
		{@render children?.()}
	</div>
	<div
		class="holo-foil"
		aria-hidden="true"
		style="background: conic-gradient(from {hue}deg, {gradientStops});"
	></div>
	<div class="holo-sheen" aria-hidden="true"></div>
</div>

<style>
	.holo {
		position: relative;
		display: inline-block;
		overflow: hidden;
		isolation: isolate;
		border-radius: inherit;
	}

	.holo-content {
		position: relative;
		z-index: 1;
	}

	.holo-foil {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		opacity: var(--holo-saturation, 0.32);
		mix-blend-mode: color-dodge;
		transition: opacity 200ms ease-out;
	}

	.holo-sheen {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		background: linear-gradient(
			105deg,
			transparent 30%,
			rgba(255, 255, 255, calc(0.85 * var(--holo-sheen, 0))) 50%,
			transparent 70%
		);
		mix-blend-mode: overlay;
		transition: background 80ms linear;
	}

	.holo.reduced .holo-foil {
		opacity: 0.18;
	}

	.holo.reduced .holo-sheen {
		background: linear-gradient(
			105deg,
			transparent 30%,
			rgba(255, 255, 255, 0.15) 50%,
			transparent 70%
		);
	}

	@media (prefers-reduced-motion: reduce) {
		.holo .holo-foil {
			opacity: 0.18;
		}
		.holo .holo-sheen {
			background: linear-gradient(
				105deg,
				transparent 30%,
				rgba(255, 255, 255, 0.15) 50%,
				transparent 70%
			);
		}
	}
</style>
