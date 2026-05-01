<!--
	============================================================
	InteractiveCardItem — single painting card
	============================================================

	🎯 WHAT IT DOES
	Renders one card in the InteractiveCards gallery: the painting image,
	the paint-brush badge, the inset vignette, and the ornate frame overlay
	revealed in detail view. Positioning is driven entirely by the parent
	(transform handed down as numeric props) so this file stays purely
	presentational.

	📋 PROPS
	| Prop        | Type                        | Description                                    |
	|-------------|-----------------------------|------------------------------------------------|
	| project     | InteractiveCardsProject     | Painting data: image, badge colour etc.        |
	| index       | number                      | Card index (seeds the badge rotation)          |
	| frameImage  | string                      | URL for the ornate frame PNG                   |
	| frameOpacity| number                      | 0 hidden, 1 fully revealed in detail view      |
	| onSelect    | (index: number) => void     | Fired when the card is clicked                 |
	| onHover     | (index: number) => void     | Mouseenter — parent lifts the card 28px        |
	| onUnhover   | (index: number) => void     | Mouseleave                                     |

	============================================================
-->

<script lang="ts">
	import type { InteractiveCardsProject } from '$lib/types';
	import { hash } from './geometry';

	interface Props {
		project: InteractiveCardsProject;
		index: number;
		frameImage: string;
		frameOpacity?: number;
		badgeVisible?: boolean;
		onSelect?: (index: number) => void;
		onHover?: (index: number) => void;
		onUnhover?: (index: number) => void;
	}

	let {
		project,
		index,
		frameImage,
		frameOpacity = 0,
		badgeVisible = true,
		onSelect,
		onHover,
		onUnhover
	}: Props = $props();

	// Badge gets a small deterministic rotation so every card feels hand-placed
	// rather than mechanically stamped. `$derived` keeps it reactive if the
	// parent swaps the underlying index at runtime (e.g. data reshuffle).
	let badgeRotation = $derived((hash(index * 13 + 5) - 0.5) * 4);
</script>

<button
	type="button"
	class="card-item"
	data-card
	aria-label={`View ${project.title} by ${project.artist}`}
	onclick={(e) => {
		e.stopPropagation();
		onSelect?.(index);
	}}
	onmouseenter={() => onHover?.(index)}
	onmouseleave={() => onUnhover?.(index)}
	onfocus={() => onHover?.(index)}
	onblur={() => onUnhover?.(index)}
>
	<div class="card-inner">
		<!-- Paint-brush badge. Pure inline SVG keeps this component zero-dep. -->
		<div
			class="badge"
			style:opacity={badgeVisible ? 1 : 0}
			style:transform={`rotate(${badgeRotation}deg)`}
			style:filter={`drop-shadow(0 2px 6px ${project.badgeColor}55)`}
		>
			<svg class="badge-svg" viewBox="0 0 200 42" preserveAspectRatio="none" aria-hidden="true">
				<path
					d="M8 6 C2 8 0 14 1 21 C2 28 4 34 10 36 C16 38 28 39 50 38 C72 37 100 36 130 37 C160 38 178 37 188 34 C198 31 200 24 199 18 C198 12 195 7 188 5 C181 3 160 2 130 3 C100 4 72 5 50 4 C28 3 14 4 8 6Z"
					fill={project.badgeColor}
				/>
			</svg>
			<span class="badge-label">{project.badgeLabel}</span>
		</div>

		<!-- Painting image + inset vignette shadow. -->
		<div class="image-wrap">
			<img
				src={project.image}
				alt={`${project.title} by ${project.artist}`}
				loading="lazy"
				draggable="false"
			/>
			<div class="vignette" aria-hidden="true"></div>
		</div>

		<!-- Ornate frame overlay. Fades in when the card enters detail view. -->
		<div class="frame" style:opacity={frameOpacity} aria-hidden="true">
			<img src={frameImage} alt="" draggable="false" />
		</div>
	</div>
</button>

<style>
	.card-item {
		position: absolute;
		left: 0;
		top: 0;
		width: clamp(126px, 18vw, 252px);
		aspect-ratio: 3 / 4;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		/* The parent feeds x/y/rotation via inline transform — our transform-origin
		   has to match so the spring math is stable around the card centre. */
		transform-origin: center center;
		will-change: transform, opacity;
		-webkit-tap-highlight-color: transparent;
	}

	.card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.45);
		transform-style: preserve-3d;
	}

	.badge {
		position: absolute;
		top: -14px;
		left: 50%;
		transform: translateX(-50%);
		width: 72%;
		height: 34px;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		transition: opacity 0.25s ease;
	}

	.badge-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.badge-label {
		position: relative;
		font-family: var(--font-playfair, 'Playfair Display', serif);
		color: white;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 600;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
	}

	.image-wrap {
		position: absolute;
		inset: 0;
		border-radius: 16px;
		overflow: hidden;
		background: #1a1a1a;
	}

	.image-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Inset vignette lends every print a gallery-lit depth. */
	.vignette {
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 40px 10px rgba(0, 0, 0, 0.3);
		border-radius: 16px;
		pointer-events: none;
	}

	.frame {
		position: absolute;
		inset: -8%;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.frame img {
		width: 100%;
		height: 100%;
		object-fit: fill;
	}

	.card-item:focus-visible .card-inner {
		outline: 2px solid var(--foreground, #111);
		outline-offset: 4px;
	}
</style>
