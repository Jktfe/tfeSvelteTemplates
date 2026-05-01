<!--
	InteractiveCards Template Demo Page

	Scroll-driven paintings portfolio with ecommerce, ported from a GSAP +
	ScrollTrigger React reference spec to pure Svelte 5 runes. Pin the page
	and scroll slowly to see the three phases: fan → conveyor → (click a
	card) detail view.
-->

<script lang="ts">
	import InteractiveCards from '$lib/components/InteractiveCards.svelte';
</script>

<svelte:head>
	<title>InteractiveCards Component - Svelte 5 Templates</title>
	<meta
		name="description"
		content="Scroll-driven paintings portfolio with fan-to-conveyor card animation, detail view and add-to-cart for Svelte 5"
	/>
</svelte:head>

<!-- The component is pinned internally; we just let it fill the route. -->
<InteractiveCards />

<!-- Post-scroll explainer — visible once the pinned region exits -->
<section class="post">
	<div class="wrap">
		<h2>About this template</h2>
		<p>
			A Svelte 5 port of a scroll-driven paintings gallery. Cards rise from
			below, fan into a parabolic arc under the hero headline, then travel
			along a curved diagonal conveyor as the user scrolls. Click any card
			to open a detail view with an ornate frame, size/material pills and a
			paint-swatch Add&nbsp;to&nbsp;Cart button.
		</p>
		<ul>
			<li>Scroll-pinned layout using native <code>position: sticky</code> — no GSAP required</li>
			<li>Per-frame spring interpolation via <code>requestAnimationFrame</code></li>
			<li>Fan → diagonal conveyor transition with seamless modulo wrapping</li>
			<li>Painter room mockup cycles through paintings as you scroll</li>
			<li>Awards &amp; testimonials slider with per-character reveal</li>
			<li>Full keyboard + ARIA support; respects <code>prefers-reduced-motion</code></li>
		</ul>
	</div>
</section>

<style>
	.post {
		padding: 4rem 1.25rem;
		background: var(--background, #fff);
		color: var(--foreground, #111);
	}

	.wrap {
		max-width: 720px;
		margin: 0 auto;
	}

	h2 {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: clamp(22px, 3vw, 36px);
		margin: 0 0 1rem;
	}

	p {
		line-height: 1.6;
		opacity: 0.85;
	}

	ul {
		margin: 1rem 0 0;
		padding-left: 1.25rem;
		line-height: 1.7;
	}

	code {
		background: color-mix(in srgb, var(--foreground, #111) 8%, transparent);
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.92em;
	}
</style>
