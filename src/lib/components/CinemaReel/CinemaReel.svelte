<!--
	===========================================================
	CINEMA REEL
	===========================================================
	WHAT
	A vertical scroll-driven reel of cinematic stills. Each still
	becomes the active frame as it crosses the centre of the viewport,
	with horizontal letterbox masks closing in on inactive slides.

	WHY
	Editorial portfolio sections, "scenes from the project" features,
	tribute pages, kinetic about pages — anywhere you want the user's
	scroll to feel like winding through a film roll.

	FEATURES
	- IntersectionObserver picks the active frame as it scrolls past centre
	- GSAP `gsap.to` drives the eased state changes — filter, scale, mask height,
	  caption opacity all transition through `power2.out` / `power3.inOut`
	- Letterbox masks close in on inactive frames, retract on the active one
	- Honours prefers-reduced-motion (no GSAP tween, snaps via static class)
	- Mobile-first: stills stack with reduced letterboxing

	ACCESSIBILITY
	- Each frame is a <figure> with <figcaption> for screen readers
	- aria-current="true" on the active frame
	- Decorative SVG layers carry aria-hidden

	DEPENDENCIES
	`gsap` (already a project dep) — GSAP core only, no business plugins. The
	IntersectionObserver picks the active frame; gsap drives the easing.

	USAGE
	<CinemaReel stills={frames} />

	PROPS
	See `CinemaReelProps` in `$lib/types`.
	===========================================================
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, type Gsap } from '$lib/gsapMotion';
	import type { CinemaReelProps } from '$lib/types';

	let {
		stills,
		letterboxRatio = 0.18,
		activeThreshold = 0.55,
		ariaLabel = 'Cinema reel',
		class: className = ''
	}: CinemaReelProps = $props();

	let activeId = $state<string | null>(null);
	let lastActiveId: string | null = null;
	// Plain Map is intentional: only the IntersectionObserver setup reads this,
	// no Svelte reactivity is needed on the keys/values.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const frameRefs: Map<string, HTMLElement> = new Map();
	let prefersReduced = $state(false);
	let gsapInstance: Gsap | null = null;

	function registerFrame(node: HTMLElement, id: string) {
		frameRefs.set(id, node);
		return {
			destroy() {
				frameRefs.delete(id);
			}
		};
	}

	function animateFrame(id: string, kind: 'enter' | 'leave') {
		const frame = frameRefs.get(id);
		if (!frame || !gsapInstance) return;
		const image = frame.querySelector<HTMLElement>('.cr-image');
		const masks = frame.querySelectorAll<HTMLElement>('.cr-mask');
		const caption = frame.querySelector<HTMLElement>('.cr-caption');
		const baseLetterbox = `${Math.max(0, Math.min(0.45, letterboxRatio)) * 100}%`;
		const targetLetterbox = `calc(${baseLetterbox} * 0.55)`;
		if (kind === 'enter') {
			if (image) {
				gsapInstance.to(image, {
					filter: 'saturate(1.05) contrast(1) brightness(0.95)',
					scale: 1,
					duration: 0.7,
					ease: 'power2.out'
				});
			}
			gsapInstance.to(masks, { height: targetLetterbox, duration: 0.55, ease: 'power3.out' });
			if (caption) gsapInstance.to(caption, { opacity: 1, duration: 0.45, ease: 'power2.out' });
		} else {
			if (image) {
				gsapInstance.to(image, {
					filter: 'saturate(0.85) contrast(1.05) brightness(0.78)',
					scale: 1.02,
					duration: 0.5,
					ease: 'power2.inOut'
				});
			}
			gsapInstance.to(masks, { height: baseLetterbox, duration: 0.45, ease: 'power3.inOut' });
			if (caption) gsapInstance.to(caption, { opacity: 0.65, duration: 0.4, ease: 'power2.inOut' });
		}
	}

	$effect(() => {
		const next = activeId;
		if (!gsapInstance || prefersReduced || next === lastActiveId) return;
		if (lastActiveId && frameRefs.has(lastActiveId)) animateFrame(lastActiveId, 'leave');
		if (next && frameRefs.has(next)) animateFrame(next, 'enter');
		lastActiveId = next;
	});

	onMount(() => {
		prefersReduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		(async () => {
			gsapInstance = await loadGsap();
			// Re-paint current active frame so the gsap-driven state reflects the IO pick.
			if (activeId && !prefersReduced) animateFrame(activeId, 'enter');
		})();

		if (typeof IntersectionObserver === 'undefined') {
			activeId = stills[0]?.id ?? null;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting && e.intersectionRatio >= activeThreshold)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
				if (visible[0]) {
					activeId = visible[0].target.getAttribute('data-still-id');
				}
			},
			{ threshold: [activeThreshold, 0.75, 1] }
		);

		for (const node of frameRefs.values()) observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<section
	class="cinema-reel {className}"
	aria-label={ariaLabel}
	style="--letterbox: {Math.max(0, Math.min(0.45, letterboxRatio)) * 100}%;"
>
	{#each stills as still (still.id)}
		<figure
			class="cr-frame"
			class:cr-frame--active={activeId === still.id}
			class:cr-frame--reduced={prefersReduced}
			data-still-id={still.id}
			use:registerFrame={still.id}
			aria-current={activeId === still.id ? 'true' : undefined}
			style={still.color ? `--cr-tint: ${still.color};` : ''}
		>
			<div class="cr-stage">
				{#if still.image}
					<img class="cr-image" src={still.image} alt={still.alt ?? still.title ?? ''} />
				{:else}
					<div class="cr-image cr-image--gradient" aria-hidden="true"></div>
				{/if}
				<div class="cr-mask cr-mask--top" aria-hidden="true"></div>
				<div class="cr-mask cr-mask--bottom" aria-hidden="true"></div>
			</div>
			{#if still.title || still.caption}
				<figcaption class="cr-caption">
					{#if still.scene}<span class="cr-scene">Scene {still.scene}</span>{/if}
					{#if still.title}<h3 class="cr-title">{still.title}</h3>{/if}
					{#if still.caption}<p class="cr-text">{still.caption}</p>{/if}
				</figcaption>
			{/if}
		</figure>
	{/each}
</section>

<style>
	.cinema-reel {
		display: flex;
		flex-direction: column;
		gap: 4rem;
		padding: 2rem 0;
	}

	.cr-frame {
		margin: 0;
		display: grid;
		gap: 1rem;
		justify-items: center;
		text-align: center;
	}

	.cr-stage {
		position: relative;
		width: 100%;
		max-width: 960px;
		aspect-ratio: 21 / 9;
		overflow: hidden;
		border-radius: 4px;
		background: #050507;
		isolation: isolate;
	}

	/* Note: image filter/scale, mask height, and caption opacity are all driven
	   by GSAP (gsap.to in animateFrame) — the inline styles below are the
	   resting state for SSR + the prefers-reduced-motion fallback. CSS
	   transitions intentionally absent so they don't fight gsap.to easing. */
	.cr-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.85) contrast(1.05) brightness(0.78);
		transform: scale(1.02);
	}

	.cr-image--gradient {
		background: linear-gradient(
			135deg,
			var(--cr-tint, #1f2937) 0%,
			color-mix(in srgb, var(--cr-tint, #1f2937) 60%, #000) 100%
		);
	}

	.cr-mask {
		position: absolute;
		left: 0;
		right: 0;
		height: var(--letterbox, 18%);
		background: #000;
		z-index: 2;
	}

	.cr-mask--top {
		top: 0;
	}

	.cr-mask--bottom {
		bottom: 0;
	}

	.cr-caption {
		display: grid;
		gap: 0.5rem;
		max-width: 720px;
		opacity: 0.65;
	}

	/* prefers-reduced-motion fallback: render the active state statically (no
	   gsap easing). Class-based override so the static look matches the
	   gsap end-state when motion is off. */
	.cr-frame--reduced.cr-frame--active .cr-image {
		filter: saturate(1.05) contrast(1) brightness(0.95);
		transform: scale(1);
	}

	.cr-frame--reduced.cr-frame--active .cr-mask {
		height: calc(var(--letterbox, 18%) * 0.55);
	}

	.cr-frame--reduced.cr-frame--active .cr-caption {
		opacity: 1;
	}

	.cr-scene {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.6875rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--cr-scene-fg, #94a3b8);
	}

	.cr-title {
		margin: 0;
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--cr-title-fg, #0f172a);
	}

	.cr-text {
		margin: 0;
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--cr-text-fg, #475569);
	}

	@media (prefers-color-scheme: dark) {
		.cinema-reel {
			--cr-title-fg: #f1f5f9;
			--cr-text-fg: #cbd5e1;
			--cr-scene-fg: #94a3b8;
		}
	}

	:global(.dark) .cinema-reel {
		--cr-title-fg: #f1f5f9;
		--cr-text-fg: #cbd5e1;
		--cr-scene-fg: #94a3b8;
	}

	@media (prefers-reduced-motion: reduce) {
		.cr-image,
		.cr-mask,
		.cr-caption {
			transition: none !important;
		}
	}

	.cr-frame--reduced .cr-image {
		transform: none;
	}
</style>
