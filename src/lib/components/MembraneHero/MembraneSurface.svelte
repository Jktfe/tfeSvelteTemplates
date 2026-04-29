<!--
	MembraneSurface — The warping membrane background layer.

	A full-bleed CSS conic-gradient mesh wrapped in a layer that has an
	SVG `<feTurbulence>` + `<feDisplacementMap>` filter applied via CSS
	`filter: url(#id)`. The filter's baseFrequency is animated through a
	short loop via SMIL `<animate>` so the surface ripples like a fluid
	film. Three palette presets switch the gradient stops.

	A single floating focal dot drifts along a Lissajous curve overlaid
	above the membrane — gives the eye a wandering anchor.

	prefers-reduced-motion: turbulence animation paused (frozen seed),
	Lissajous drift paused (dot rests at its starting position).
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import {
		paletteToFilterStops,
		lissajous,
		isReducedMotion,
		type MembranePalette
	} from './types';

	interface Props {
		palette?: MembranePalette;
		/** Show the focal Lissajous dot. */
		showDot?: boolean;
		/** Stable id suffix so multiple instances don't collide on filter id. */
		uid?: string;
	}

	let { palette = 'aurora', showDot = true, uid = 'mh' }: Props = $props();

	const stops = $derived(paletteToFilterStops(palette));
	const filterId = $derived(`${uid}-displace`);

	let reduced = $state(false);
	let dotX = $state(0);
	let dotY = $state(0);
	let raf: number | null = null;
	let mountedAt = 0;

	onMount(() => {
		reduced = isReducedMotion();

		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onChange = (e: MediaQueryListEvent) => {
			reduced = e.matches;
		};
		mq.addEventListener('change', onChange);

		mountedAt = performance.now();
		const tick = (now: number) => {
			if (reduced) {
				raf = null;
				return;
			}
			const t = (now - mountedAt) / 1000;
			const p = lissajous(t * 0.18, 3, 2, 0.32, 0.22, Math.PI / 4);
			dotX = p.x;
			dotY = p.y;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			mq.removeEventListener('change', onChange);
			if (raf !== null) cancelAnimationFrame(raf);
		};
	});
</script>

<div class="mh-surface" aria-hidden="true">
	<svg class="mh-defs" width="0" height="0" focusable="false">
		<defs>
			<filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
				<feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="7">
					{#if !reduced}
						<animate
							attributeName="baseFrequency"
							dur="14s"
							values="0.012;0.024;0.012"
							repeatCount="indefinite"
						/>
					{/if}
				</feTurbulence>
				<feDisplacementMap in="SourceGraphic" scale="38" />
			</filter>
		</defs>
	</svg>

	<div
		class="mh-mesh"
		style:--mh-from={stops.from}
		style:--mh-via={stops.via}
		style:--mh-to={stops.to}
		style:filter="url(#{filterId})"
	></div>

	<div class="mh-veil"></div>

	{#if showDot}
		<div
			class="mh-dot"
			class:mh-dot-paused={reduced}
			style:--mh-accent={stops.accent}
			style:transform="translate3d(calc(50vw + {dotX * 38}vw), calc(50vh + {dotY * 30}vh), 0)"
		></div>
	{/if}
</div>

<style>
	.mh-surface {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
		pointer-events: none;
	}

	.mh-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}

	.mh-mesh {
		position: absolute;
		inset: -10%;
		background:
			conic-gradient(from 220deg at 30% 40%, var(--mh-from), var(--mh-via), var(--mh-to), var(--mh-from)),
			radial-gradient(ellipse at 70% 60%, var(--mh-via) 0%, transparent 60%),
			radial-gradient(ellipse at 20% 80%, var(--mh-to) 0%, transparent 65%);
		background-blend-mode: screen, screen, normal;
		opacity: 0.92;
		will-change: filter;
	}

	.mh-veil {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.18) 60%, rgba(0, 0, 0, 0.45) 100%),
			linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, transparent 30%, rgba(0, 0, 0, 0.25) 100%);
		mix-blend-mode: multiply;
	}

	.mh-dot {
		position: absolute;
		top: 0;
		left: 0;
		width: 18px;
		height: 18px;
		margin: -9px 0 0 -9px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--mh-accent) 0%, transparent 70%);
		opacity: 0.85;
		filter: blur(1px);
		animation: mh-dot-pulse 3.6s ease-in-out infinite;
		will-change: transform, opacity;
	}

	.mh-dot-paused {
		animation: none;
	}

	@keyframes mh-dot-pulse {
		0%,
		100% {
			opacity: 0.5;
			transform-origin: center;
		}
		50% {
			opacity: 0.95;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mh-dot {
			animation: none;
			opacity: 0.7;
		}
	}
</style>
