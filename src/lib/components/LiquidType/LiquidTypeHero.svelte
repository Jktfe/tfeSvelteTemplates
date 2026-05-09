<!--
	===========================================================
	LIQUID TYPE HERO
	===========================================================
	WHAT
	A variable-font hero where individual characters inflate (font-weight
	+ scale) under the pointer with damped-spring physics. Click anywhere
	to fire a shockwave that radiates a peak through every glyph. While
	idle a slow breathing wave moves left-to-right at low amplitude.

	WHY
	Marketing landing pages and editorial heroes that need a single
	arresting interaction without taking over the page. Reads as
	"this site is alive" without the bloat of a full WebGL scene.

	FEATURES
	- Per-character damped spring on weight + scale
	- Cursor proximity drives the local peak
	- Click → shockwave (radiating peak from click point)
	- Idle breathing wave (gentle left-to-right pulse)
	- prefers-reduced-motion: static heavy weight, no animation
	- Falls back gracefully on non-variable fonts (scale-only effect)

	ACCESSIBILITY
	- Words rendered as real text (split visually into char spans);
	  screen readers see the original word string via sr-only copy
	- Wrapper carries role="region" + aria-label
	- prefers-reduced-motion gates the rAF loop entirely

	DEPENDENCIES
	`gsap` core (already a project dep) for the per-glyph staggered entrance reveal.
	Native rAF for the per-character spring physics that runs continuously, and
	CSS custom properties (`--lt-weight`, `--lt-scale`) for the actual paint.

	USAGE
	<LiquidTypeHero words={['Words','have','weight']} />

	PROPS
	See `LiquidTypeHeroProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap } from '$lib/gsapMotion';
	import type { LiquidTypeHeroProps } from '$lib/types';

	let {
		words = ['Words', 'have', 'weight'],
		baseWeight = 300,
		peakWeight = 850,
		baseScale = 1,
		peakScale = 1.18,
		influenceRadius = 160,
		ariaLabel = 'Liquid Type hero',
		class: className = ''
	}: LiquidTypeHeroProps = $props();

	type Glyph = {
		char: string;
		spaceAfter: boolean;
		x: number;
		y: number;
		weight: number;
		weightV: number;
		scale: number;
		scaleV: number;
	};

	let wrapperEl: HTMLDivElement | undefined = $state();
	let glyphRefs: HTMLSpanElement[] = $state([]);
	let prefersReduced = $state(false);
	let rafId = 0;
	let pointer = { x: -9999, y: -9999, active: false };
	let shockwave = { x: 0, y: 0, t: -1, life: 1.2 };
	let glyphs: Glyph[] = [];
	let mounted = $state(false);

	const flatChars = $derived.by(() => {
		const out: { char: string; word: string; charIdx: number; lastInWord: boolean }[] = [];
		words.forEach((word) => {
			const chars = [...word];
			chars.forEach((ch, i) => {
				out.push({ char: ch, word, charIdx: i, lastInWord: i === chars.length - 1 });
			});
		});
		return out;
	});

	function updateGlyphPositions() {
		if (!wrapperEl) return;
		const wrapperRect = wrapperEl.getBoundingClientRect();
		glyphs = glyphRefs.map((el, i) => {
			const r = el.getBoundingClientRect();
			const cx = r.left - wrapperRect.left + r.width / 2;
			const cy = r.top - wrapperRect.top + r.height / 2;
			const prev = glyphs[i];
			return {
				char: el.textContent ?? '',
				spaceAfter: el.hasAttribute('data-space-after'),
				x: cx,
				y: cy,
				weight: prev?.weight ?? baseWeight,
				weightV: prev?.weightV ?? 0,
				scale: prev?.scale ?? baseScale,
				scaleV: prev?.scaleV ?? 0
			};
		});
	}

	function tick(now: number) {
		if (!wrapperEl || glyphs.length === 0) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		const seconds = now / 1000;
		const breath = 0.18 + 0.18 * Math.sin(seconds * 0.6);
		const wavePhase = seconds * 0.45;

		for (let i = 0; i < glyphs.length; i += 1) {
			const g = glyphs[i];
			const dxPointer = g.x - pointer.x;
			const dyPointer = g.y - pointer.y;
			const distPointer = Math.sqrt(dxPointer * dxPointer + dyPointer * dyPointer);
			const pointerInfluence = pointer.active
				? Math.max(0, 1 - distPointer / influenceRadius)
				: 0;

			let shockInfluence = 0;
			if (shockwave.t >= 0) {
				const elapsed = seconds - shockwave.t;
				if (elapsed < shockwave.life) {
					const ringR = elapsed * 480;
					const dxs = g.x - shockwave.x;
					const dys = g.y - shockwave.y;
					const distShock = Math.sqrt(dxs * dxs + dys * dys);
					const ringWidth = 90;
					const distFromRing = Math.abs(distShock - ringR);
					if (distFromRing < ringWidth) {
						shockInfluence = (1 - distFromRing / ringWidth) * (1 - elapsed / shockwave.life);
					}
				} else {
					shockwave.t = -1;
				}
			}

			const idleWave = Math.max(0, Math.sin(wavePhase - i * 0.32)) * breath * 0.32;
			const targetIntensity = Math.max(pointerInfluence, shockInfluence, idleWave);
			const targetWeight = baseWeight + (peakWeight - baseWeight) * targetIntensity;
			const targetScale = baseScale + (peakScale - baseScale) * targetIntensity;

			g.weightV = (g.weightV + (targetWeight - g.weight) * 0.18) * 0.74;
			g.scaleV = (g.scaleV + (targetScale - g.scale) * 0.2) * 0.72;
			g.weight += g.weightV;
			g.scale += g.scaleV;

			const el = glyphRefs[i];
			if (el) {
				el.style.setProperty('--lt-weight', g.weight.toFixed(0));
				el.style.setProperty('--lt-scale', g.scale.toFixed(3));
			}
		}

		rafId = requestAnimationFrame(tick);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		pointer.x = event.clientX - rect.left;
		pointer.y = event.clientY - rect.top;
		pointer.active = true;
	}

	function handlePointerLeave() {
		pointer.active = false;
		pointer.x = -9999;
		pointer.y = -9999;
	}

	function handleClick(event: MouseEvent) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		shockwave.x = event.clientX - rect.left;
		shockwave.y = event.clientY - rect.top;
		shockwave.t = performance.now() / 1000;
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		mounted = true;
		queueMicrotask(updateGlyphPositions);

		const observer = new ResizeObserver(updateGlyphPositions);
		if (wrapperEl) observer.observe(wrapperEl);

		if (!prefersReduced) {
			rafId = requestAnimationFrame(tick);
		}

		(async () => {
			const gsap = await loadGsap();
			if (prefersReduced || !wrapperEl) return;
			// Per-glyph entrance: stagger fade + tiny lift via gsap.from. The rAF
			// physics loop takes over once the entrance lands.
			const glyphs = wrapperEl.querySelectorAll('.lt-glyph');
			if (glyphs.length > 0) {
				gsap.from(glyphs, {
					y: 12,
					opacity: 0,
					duration: 0.7,
					ease: 'power3.out',
					stagger: { each: 0.018, from: 'start' }
				});
			}
			const hint = wrapperEl.querySelector('.lt-hint');
			if (hint) gsap.fromTo(hint, { opacity: 0 }, { opacity: 1, delay: 0.5, duration: 0.4 });
		})();

		return () => {
			observer.disconnect();
			if (rafId) cancelAnimationFrame(rafId);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- The hero is a decorative + interactive surface (pointer + click drive
     the type physics). The word strings are rendered as real text inside
     visually-hidden spans so screen readers and search engines see the
     prose unchanged; the per-glyph spans are aria-hidden. The click is
     a non-essential effect (shockwave) so no keyboard alternative is needed. -->
<div
	bind:this={wrapperEl}
	class="liquid-type-hero {className}"
	class:liquid-type-hero--reduced={prefersReduced}
	role="region"
	aria-label={ariaLabel}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onclick={handleClick}
>
	<p class="lt-words" aria-hidden="true">
		{#each flatChars as glyph, i (i)}
			{@const flat = flatChars[i]}
			<span
				class="lt-glyph"
				bind:this={glyphRefs[i]}
				data-space-after={flat.lastInWord ? '' : null}
				style="--lt-weight: {baseWeight}; --lt-scale: {baseScale};"
			>{glyph.char}</span>
			{#if flat.lastInWord && i < flatChars.length - 1}<span class="lt-space" aria-hidden="true"
				> </span
			>{/if}
		{/each}
	</p>
	<span class="lt-sr-only">{words.join(' ')}</span>
	{#if mounted}<span class="lt-hint" aria-hidden="true">Move + click</span>{/if}
</div>

<style>
	.liquid-type-hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: clamp(220px, 32vh, 360px);
		padding: clamp(1.5rem, 4vw, 3rem);
		border-radius: 12px;
		background: radial-gradient(ellipse at 50% 100%, #1e1b4b 0%, #07050f 70%);
		color: #f8fafc;
		overflow: hidden;
		cursor: crosshair;
		isolation: isolate;
	}

	.lt-words {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.18em;
		justify-content: center;
		font-family: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
		font-size: clamp(2rem, 7vw, 4.5rem);
		line-height: 1;
		letter-spacing: -0.02em;
		text-align: center;
		max-width: 100%;
	}

	.lt-glyph {
		display: inline-block;
		font-variation-settings: 'wght' var(--lt-weight, 300);
		font-weight: var(--lt-weight, 300);
		transform: scale(var(--lt-scale, 1));
		transform-origin: center bottom;
		will-change: transform, font-weight;
	}

	.lt-space {
		display: inline-block;
		width: 0.18em;
	}

	.lt-sr-only {
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

	.lt-hint {
		position: absolute;
		bottom: 0.75rem;
		right: 1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(248, 250, 252, 0.5);
		pointer-events: none;
	}

	.liquid-type-hero--reduced .lt-glyph {
		font-variation-settings: 'wght' 600;
		font-weight: 600;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.lt-glyph {
			transition: none !important;
		}
	}
</style>
