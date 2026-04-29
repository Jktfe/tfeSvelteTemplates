<!--
	============================================================
	MembraneHero — Warped-fluid-mesh full-bleed editorial hero
	============================================================

	A statement-piece full-bleed hero. A CSS conic + radial gradient
	mesh sits behind everything, displaced by inline-SVG `<feTurbulence>`
	+ `<feDisplacementMap>` so the surface ripples like a fluid film.
	A focal dot drifts along a Lissajous curve overlaid above the
	membrane to give the eye a wandering anchor. On top of that sits
	an editorial layout: eyebrow tag pill, large display `<h1>`,
	single-line subhead, and two CTA buttons (primary fill + secondary
	ghost). On mount, the typography deals in glyph-by-glyph with a
	short stagger.

	M1 SCOPE
	- Warped membrane background via SVG displacement filter
	- Three palette presets: 'aurora' / 'sunset' / 'polar'
	- Lissajous-drift focal dot (aria-hidden)
	- Per-glyph fade-up deal-in for the headline
	- Eyebrow pill + subhead + 2 CTA buttons (slot or default)
	- prefers-reduced-motion: turbulence baseFrequency animation paused
	  (frozen seed), Lissajous drift paused, deal-in still fires once
	- Asset-free (no external images, no font CDN)

	M2/M3 (NOT IN THIS COMPONENT YET)
	- Custom palette via { from, via, to, accent } prop instead of named
	- Mouse-parallax on the membrane (cursor pushes the surface)
	- Theme switcher (dark default, optional light variant)
	- Scroll-progress-bound turbulence intensity

	USAGE
		<MembraneHero
			palette="aurora"
			eyebrow="Now in beta"
			headline="A new kind of canvas"
			subhead="Hand-crafted primitives, zero runtime cost."
			primaryCta="Start building"
			secondaryCta="See the docs" />

	PROPS
	| Prop          | Type                                | Default                     |
	|---------------|-------------------------------------|-----------------------------|
	| palette       | 'aurora' \| 'sunset' \| 'polar'     | 'aurora'                    |
	| eyebrow       | string                              | 'Now in beta'               |
	| headline      | string                              | 'A new kind of canvas'      |
	| subhead       | string                              | 'Hand-crafted …'            |
	| primaryCta    | string                              | 'Start building'            |
	| secondaryCta  | string                              | 'See the docs'              |
	| primaryHref   | string                              | '#'                         |
	| secondaryHref | string                              | '#'                         |
	| showDot       | boolean                             | true                        |
	| class         | string                              | ''                          |

	ACCESSIBILITY
	- Real <h1> for the headline so screen readers see it in outline
	- Membrane SVG + focal dot are aria-hidden (decorative)
	- CTA buttons are real <a> tags with descriptive labels
	- Eyebrow pill carries aria-label so the badge tag is announced
	- prefers-reduced-motion freezes the turbulence animation + dot
	  drift; deal-in still fires once

	DEPENDENCIES
	- Subcomponents: MembraneSurface
	- Types/helpers: types.ts
	- Zero external runtime dependencies
	============================================================
-->
<script lang="ts">
	import MembraneSurface from './MembraneSurface.svelte';
	import type { MembranePalette } from './types';

	interface Props {
		palette?: MembranePalette;
		eyebrow?: string;
		headline?: string;
		subhead?: string;
		primaryCta?: string;
		secondaryCta?: string;
		primaryHref?: string;
		secondaryHref?: string;
		showDot?: boolean;
		class?: string;
	}

	let {
		palette = 'aurora',
		eyebrow = 'Now in beta',
		headline = 'A new kind of canvas',
		subhead = 'Hand-crafted primitives, zero runtime cost.',
		primaryCta = 'Start building',
		secondaryCta = 'See the docs',
		primaryHref = '#',
		secondaryHref = '#',
		showDot = true,
		class: extraClass = ''
	}: Props = $props();

	const headlineWords = $derived(splitWords(headline));

	/**
	 * Split a headline into a flat array of words and explicit spaces.
	 * Words become inline-block clusters with white-space:nowrap so the
	 * browser can only break the line at the space tokens between them.
	 * Without this, each per-glyph <span> would be a valid break point
	 * and long words wrap mid-letter.
	 */
	function splitWords(text: string): Array<{ kind: 'word' | 'space'; chars: string[] }> {
		const out: Array<{ kind: 'word' | 'space'; chars: string[] }> = [];
		let buf: string[] = [];
		for (const c of Array.from(text)) {
			if (c === ' ') {
				if (buf.length) {
					out.push({ kind: 'word', chars: buf });
					buf = [];
				}
				out.push({ kind: 'space', chars: [c] });
			} else {
				buf.push(c);
			}
		}
		if (buf.length) out.push({ kind: 'word', chars: buf });
		return out;
	}
</script>

<section class="mh-root mh-{palette} {extraClass}" aria-label={eyebrow}>
	<MembraneSurface {palette} {showDot} />

	<div class="mh-content">
		<span class="mh-eyebrow" aria-label="Tag: {eyebrow}">
			<span class="mh-eyebrow-dot" aria-hidden="true"></span>
			{eyebrow}
		</span>

		<h1 class="mh-headline">
			<span class="mh-sr-only">{headline}</span>
			{#snippet glyphSpan(char: string, delayIdx: number)}
				<span class="mh-glyph" style:--mh-glyph-delay="{delayIdx * 0.024}s" aria-hidden="true"
					>{char}</span
				>
			{/snippet}
			{#each headlineWords as token, wi (wi)}
				{#if token.kind === 'space'}
					<span class="mh-space" aria-hidden="true">&nbsp;</span>
				{:else}
					<span class="mh-word">
						{#each token.chars as ch, ci (ci)}
							{@render glyphSpan(ch, headlineWords
									.slice(0, wi)
									.reduce((acc, t) => acc + t.chars.length, 0) + ci)}
						{/each}
					</span>
				{/if}
			{/each}
		</h1>

		<p class="mh-subhead">{subhead}</p>

		<div class="mh-ctas">
			<a class="mh-cta mh-cta-primary" href={primaryHref}>{primaryCta}</a>
			<a class="mh-cta mh-cta-secondary" href={secondaryHref}>{secondaryCta}</a>
		</div>
	</div>
</section>

<style>
	.mh-root {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		overflow: hidden;
		isolation: isolate;
		color: #f5f5f4;
	}

	.mh-aurora {
		background: radial-gradient(ellipse at 50% 30%, #0f172a 0%, #020617 70%);
	}
	.mh-sunset {
		background: radial-gradient(ellipse at 50% 30%, #1f1115 0%, #0c0407 70%);
	}
	.mh-polar {
		background: radial-gradient(ellipse at 50% 30%, #0a1628 0%, #020617 70%);
	}

	.mh-content {
		position: relative;
		z-index: 1;
		max-width: 880px;
		padding: 5rem 1.5rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.4rem;
	}

	.mh-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #f5f5f4;
		opacity: 0;
		animation: mh-fade-down 0.7s ease-out 0.05s forwards;
	}
	.mh-eyebrow-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		animation: mh-pulse 2.4s ease-in-out infinite;
	}

	.mh-headline {
		margin: 0;
		font-family:
			ui-sans-serif,
			-apple-system,
			BlinkMacSystemFont,
			'Inter',
			'Segoe UI',
			sans-serif;
		font-size: clamp(2.6rem, 8vw, 5.8rem);
		font-weight: 800;
		line-height: 1.04;
		letter-spacing: -0.025em;
		color: #fafaf9;
		text-shadow: 0 6px 32px rgba(0, 0, 0, 0.28);
	}
	.mh-sr-only {
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
	.mh-word {
		display: inline-block;
		white-space: nowrap;
	}
	.mh-glyph {
		display: inline-block;
		opacity: 0;
		transform: translateY(0.4em);
		animation: mh-glyph-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
		animation-delay: var(--mh-glyph-delay);
	}
	.mh-space {
		display: inline-block;
		width: 0.28em;
	}

	.mh-subhead {
		margin: 0;
		max-width: 56ch;
		font-size: clamp(1rem, 1.6vw, 1.2rem);
		line-height: 1.55;
		color: rgba(245, 245, 244, 0.78);
		opacity: 0;
		animation: mh-fade-up 0.7s ease-out 0.55s forwards;
	}

	.mh-ctas {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		opacity: 0;
		animation: mh-fade-up 0.7s ease-out 0.7s forwards;
	}
	.mh-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.6rem;
		border-radius: 0.6rem;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		letter-spacing: 0.005em;
		transition:
			transform 0.18s ease,
			background-color 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}
	.mh-cta-primary {
		background: linear-gradient(180deg, #fafaf9 0%, #e7e5e4 100%);
		color: #1c1917;
		box-shadow:
			0 12px 28px -8px rgba(250, 250, 249, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.7);
	}
	.mh-cta-primary:hover,
	.mh-cta-primary:focus-visible {
		transform: translateY(-1px);
		box-shadow:
			0 18px 36px -8px rgba(250, 250, 249, 0.55),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}
	.mh-cta-secondary {
		background: rgba(255, 255, 255, 0.06);
		color: #fafaf9;
		border: 1px solid rgba(255, 255, 255, 0.22);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}
	.mh-cta-secondary:hover,
	.mh-cta-secondary:focus-visible {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.36);
		transform: translateY(-1px);
	}

	@keyframes mh-glyph-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes mh-fade-up {
		from {
			opacity: 0;
			transform: translateY(0.4rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes mh-fade-down {
		from {
			opacity: 0;
			transform: translateY(-0.3rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes mh-pulse {
		0%,
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.4);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mh-glyph,
		.mh-eyebrow,
		.mh-subhead,
		.mh-ctas {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.mh-eyebrow-dot {
			animation: none;
		}
	}
</style>
