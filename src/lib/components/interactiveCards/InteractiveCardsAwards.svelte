<!--
	============================================================
	InteractiveCardsAwards — awards & testimonials slider
	============================================================

	🎯 WHAT IT DOES
	Four stacked slides positioned top-right (desktop) / top-inset (mobile).
	Slide 0 is a laurel-wrapped awards panel, slides 1–3 are scroll-driven
	testimonial quotes with a per-character reveal on enter.

	Visibility is driven by the parent: `visible` controls fade-in after the
	fan has fully transitioned, and `slideIdx` picks the active slide. When
	`slideIdx === -1` every slide hides.

	📋 PROPS
	| Prop         | Type                            | Description                        |
	|--------------|---------------------------------|------------------------------------|
	| testimonials | InteractiveCardsTestimonial[]   | Up to 3 quote slides               |
	| slideIdx     | number                          | -1 hidden, 0 awards, 1..3 quotes   |
	| visible      | boolean                         | Global visibility gate             |

	============================================================
-->

<script lang="ts">
	import type { InteractiveCardsTestimonial } from '$lib/types';

	interface Props {
		testimonials: InteractiveCardsTestimonial[];
		slideIdx: number;
		visible: boolean;
	}

	let { testimonials, slideIdx, visible }: Props = $props();

	// Pre-split quote strings into characters so each letter gets its own staggered
	// fade-in. Split on whitespace first to keep word boundaries intact, then split
	// each word into its constituent characters.
	function splitQuote(q: string): Array<{ type: 'word'; chars: string[] } | { type: 'space' }> {
		const parts: Array<{ type: 'word'; chars: string[] } | { type: 'space' }> = [];
		const words = q.split(/(\s+)/);
		for (const w of words) {
			if (!w) continue;
			if (/^\s+$/.test(w)) parts.push({ type: 'space' });
			else parts.push({ type: 'word', chars: [...w] });
		}
		return parts;
	}

	// Rating strip on the awards slide — kept local so the slider stays self-contained.
	const ratings = [
		{ label: 'Saatchi Art', score: '4.9' },
		{ label: 'Artfinder', score: 'Top Seller' },
		{ label: 'Singulart', score: 'Featured' },
		{ label: 'Artsy', score: 'Rising' }
	];
</script>

<div class="awards" class:visible aria-hidden={!visible}>
	<!-- Slide 0 — Awards -->
	<div class="slide" class:active={slideIdx === 0}>
		<div class="awards-head">
			<!-- Laurel left + right — inline SVG so theme invert works cleanly. -->
			<svg class="laurel" viewBox="0 0 24 40" aria-hidden="true">
				<path
					d="M20 4 C14 6 10 12 9 20 C10 28 14 34 20 36"
					stroke="currentColor"
					stroke-width="1.2"
					fill="none"
					stroke-linecap="round"
				/>
				<path
					d="M16 10 C12 11 10 14 9 20 C10 26 12 29 16 30"
					stroke="currentColor"
					stroke-width="1"
					fill="none"
					stroke-linecap="round"
				/>
			</svg>
			<div class="awards-title">
				<div class="awards-label">Collector's Choice</div>
				<div class="awards-stars" aria-hidden="true">
					{#each { length: 5 } as _, i (i)}
						<svg viewBox="0 0 24 24" class="star">
							<path d="M12 2 L15 9 L22 9 L16.5 13.5 L18.5 21 L12 17 L5.5 21 L7.5 13.5 L2 9 L9 9 Z" />
						</svg>
					{/each}
				</div>
			</div>
			<svg class="laurel flipped" viewBox="0 0 24 40" aria-hidden="true">
				<path
					d="M20 4 C14 6 10 12 9 20 C10 28 14 34 20 36"
					stroke="currentColor"
					stroke-width="1.2"
					fill="none"
					stroke-linecap="round"
				/>
				<path
					d="M16 10 C12 11 10 14 9 20 C10 26 12 29 16 30"
					stroke="currentColor"
					stroke-width="1"
					fill="none"
					stroke-linecap="round"
				/>
			</svg>
		</div>

		<ul class="ratings">
			{#each ratings as r (r.label)}
				<li>
					<span class="r-label">{r.label}</span>
					<span class="r-dot" aria-hidden="true"></span>
					<span class="r-score">{r.score}</span>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Slides 1..3 — testimonial quotes -->
	{#each testimonials as t, i (i)}
		{@const slideIndex = i + 1}
		<div class="slide quote-slide" class:active={slideIdx === slideIndex}>
			<div class="author">
				<img class="photo" src={t.photo} alt="" loading="lazy" />
				<div>
					<div class="author-name">{t.author}</div>
					<div class="author-title">{t.title}</div>
				</div>
			</div>
			<blockquote class="quote" aria-label={t.quote}>
				{#each splitQuote(t.quote) as part, pi (pi)}
					{#if part.type === 'space'}
						<span class="space"> </span>
					{:else}
						<span class="word">
							{#each part.chars as ch, ci (ci)}
								<span class="letter" data-quote-letter>{ch}</span>
							{/each}
						</span>
					{/if}
				{/each}
			</blockquote>
		</div>
	{/each}
</div>

<style>
	.awards {
		position: absolute;
		top: 100px;
		right: 0;
		width: 100%;
		max-width: 440px;
		padding: 0 1.25rem;
		z-index: 5;
		opacity: 0;
		transform: translateY(-20px);
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
		pointer-events: none;
		color: var(--foreground, #111);
	}

	.awards.visible {
		opacity: 1;
		transform: translateY(0);
	}

	@media (min-width: 768px) {
		.awards {
			top: -20px;
			padding: 2rem 1.5rem;
			width: clamp(280px, 30vw, 440px);
		}

		.awards.visible {
			transform: translateY(0);
		}
	}

	.slide {
		position: absolute;
		inset: 0;
		padding: 1.5rem;
		opacity: 0;
		transform: scale(0.92) translateY(20px);
		filter: blur(8px);
		transition:
			opacity 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
			transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
			filter 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
		pointer-events: none;
	}

	.slide.active {
		opacity: 1;
		transform: scale(1) translateY(0);
		filter: blur(0);
	}

	/* Awards slide */
	.awards-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
	}

	.laurel {
		width: 28px;
		height: 44px;
		color: color-mix(in srgb, var(--foreground, #111) 35%, transparent);
	}

	.laurel.flipped {
		transform: scaleX(-1);
	}

	.awards-title {
		text-align: center;
	}

	.awards-label {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: 13px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.awards-stars {
		display: flex;
		justify-content: center;
		gap: 2px;
		margin-top: 4px;
	}

	.star {
		width: 12px;
		height: 12px;
		fill: color-mix(in srgb, var(--foreground, #111) 30%, transparent);
	}

	.ratings {
		list-style: none;
		padding: 0.75rem 0 0;
		margin: 0;
	}

	.ratings li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-top: 1px solid color-mix(in srgb, var(--foreground, #111) 8%, transparent);
		font-size: 12px;
	}

	.ratings li:first-child {
		border-top: none;
	}

	.r-label {
		font-family: var(--font-sans, system-ui, sans-serif);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 10px;
		opacity: 0.75;
	}

	.r-dot {
		flex: 1;
		margin: 0 0.5rem;
		height: 1px;
		background: color-mix(in srgb, var(--foreground, #111) 10%, transparent);
	}

	.r-score {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-weight: 600;
		font-size: 13px;
	}

	/* Quote slide */
	.author {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.photo {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid color-mix(in srgb, var(--foreground, #111) 20%, transparent);
	}

	.author-name {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-weight: 700;
		font-size: 15px;
	}

	.author-title {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.7;
	}

	.quote {
		margin: 0;
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: clamp(17px, 1.5vw, 24px);
		line-height: 1.35;
	}

	.word {
		display: inline-block;
		white-space: nowrap;
	}

	/* The active slide kicks a per-letter blur reveal. The delay stagger is
	   computed purely with CSS nth-child: fast enough, no JS timers needed. */
	.slide.active .letter {
		animation: letter-in 0.25s cubic-bezier(0.2, 0.7, 0.2, 1) both;
	}

	.letter {
		display: inline-block;
		opacity: 0;
		transform: scale(1.4);
		filter: blur(6px);
	}

	.slide.active .letter:nth-child(1) {
		animation-delay: 0.2s;
	}
	.slide.active .letter:nth-child(2) {
		animation-delay: 0.208s;
	}
	.slide.active .letter:nth-child(3) {
		animation-delay: 0.216s;
	}
	.slide.active .letter:nth-child(4) {
		animation-delay: 0.224s;
	}
	.slide.active .letter:nth-child(5) {
		animation-delay: 0.232s;
	}
	.slide.active .letter:nth-child(6) {
		animation-delay: 0.24s;
	}
	.slide.active .letter:nth-child(7) {
		animation-delay: 0.248s;
	}
	.slide.active .letter:nth-child(8) {
		animation-delay: 0.256s;
	}
	.slide.active .letter:nth-child(9) {
		animation-delay: 0.264s;
	}
	.slide.active .letter:nth-child(n + 10) {
		animation-delay: 0.28s;
	}

	@keyframes letter-in {
		to {
			opacity: 1;
			transform: scale(1);
			filter: blur(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide,
		.letter {
			transition: opacity 0.2s linear;
			animation: none;
			transform: none;
			filter: none;
		}

		.slide.active .letter {
			opacity: 1;
		}
	}
</style>
