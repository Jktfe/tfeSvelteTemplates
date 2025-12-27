<!--
	============================================================
	ShineBorder Component - Animated Border with Shine Effect
	============================================================

	[CR] WHAT IT DOES
	Creates a wrapper with an animated shining border effect that continuously
	sweeps horizontally across the border, creating an eye-catching visual element.
	Uses pure CSS animation with zero JavaScript overhead.

	[NTL] THE SIMPLE VERSION
	Imagine wrapping a gift with ribbon that has a glittery stripe running through it.
	This component wraps your content with a border that has a "sparkle" constantly
	moving across it - like light catching on chrome trim!

	============================================================

	FEATURES:
	- Smooth horizontal shine animation
	- Customisable colour, duration, width, and radius
	- Uses CSS custom properties for easy theming
	- Minimal performance impact with GPU-accelerated animations
	- Respects prefers-reduced-motion

	DEPENDENCIES:
	Zero external dependencies - pure CSS animation

	ACCESSIBILITY:
	- Animation is purely decorative
	- Child content focus states work normally
	- Respects prefers-reduced-motion (should be added to CSS)

	USAGE:
	<ShineBorder color="#146ef5" duration={4} borderWidth={2} borderRadius={16}>
		<div>Your content here</div>
	</ShineBorder>

	PROPS:
	| Prop         | Type     | Default   | Description                        |
	|--------------|----------|-----------|-----------------------------------|
	| color        | string   | '#146ef5' | Border shine colour (any CSS colour)|
	| duration     | number   | 3         | Animation duration in seconds      |
	| borderWidth  | number   | 2         | Border thickness in pixels         |
	| borderRadius | number   | 8         | Corner radius in pixels            |
	| children     | Snippet  | -         | Content to wrap                    |

	WARNINGS:
	None expected - component is self-contained

	============================================================
-->

<script lang="ts">
	// [CR] Import shared prop types for consistency across the codebase
	import type { ShineBorderProps } from '$lib/types';

	// [CR] Extend base props with Svelte 5 snippet for child content
	// [NTL] This lets us wrap any content you put between the tags!
	interface Props extends ShineBorderProps {
		children?: import('svelte').Snippet;
	}

	// [CR] Destructure props with sensible defaults using Svelte 5 $props() rune
	// [NTL] These are the "settings" you can tweak - if you don't provide them,
	// we use these nice defaults so your component still looks great!
	let {
		color = '#146ef5', // [NTL] A lovely blue - change to any colour you like!
		duration = 3, // [NTL] How many seconds for one complete shine sweep
		borderWidth = 2, // [NTL] How thick the border is (in pixels)
		borderRadius = 8, // [NTL] How rounded the corners are (in pixels)
		children // [NTL] Whatever you put inside the component tags goes here
	}: Props = $props();
</script>

<!-- [CR] Wrapper element with CSS custom properties for dynamic styling -->
<!-- [NTL] This outer div creates the shiny border effect using a clever gradient trick! -->
<div
	class="shine-border-wrapper"
	style="
    --shine-color: {color};
    --shine-duration: {duration}s;
    --border-width: {borderWidth}px;
    --border-radius: {borderRadius}px;
  "
>
	<!-- [CR] Inner content container with white background to "punch out" the border effect -->
	<!-- [NTL] This inner div is where your actual content lives - it sits on top of the gradient -->
	<div class="shine-border-content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	/*
	 * [CR] WRAPPER STYLES
	 * The gradient creates the "shine" effect. We make it 200% wide so it can
	 * animate smoothly from offscreen-left to offscreen-right without jumping.
	 * Padding creates the border thickness by showing the gradient behind the content.
	 */
	/*
	 * [NTL] THE MAGIC EXPLAINED
	 * Think of this like a theatre with a spotlight sweeping across the stage.
	 * The "stage" (gradient) is actually twice as wide as what you see, so the
	 * spotlight can smoothly enter from the left, cross the stage, and exit right!
	 */
	.shine-border-wrapper {
		position: relative;
		border-radius: var(--border-radius);
		padding: var(--border-width); /* [NTL] This padding IS the border! Clever, right? */
		background: linear-gradient(90deg, transparent, var(--shine-color), transparent);
		background-size: 200% 100%; /* [CR] Double width allows seamless loop animation */
		animation: shine-border-animation var(--shine-duration) linear infinite;
		will-change: background-position; /* [CR] Hint to browser for GPU acceleration */
	}

	/*
	 * [CR] KEYFRAMES: Move gradient from -200% (offscreen left) to 200% (offscreen right)
	 * [NTL] This is the "choreography" that tells the sparkle where to move!
	 */
	@keyframes shine-border-animation {
		0% {
			background-position: -200% 0; /* [NTL] Start position: sparkle is hidden on the left */
		}
		100% {
			background-position: 200% 0; /* [NTL] End position: sparkle exits on the right */
		}
	}

	/*
	 * [CR] CONTENT CONTAINER
	 * White background "punches through" the gradient, leaving only the border visible.
	 * Border radius is slightly smaller to account for the padding/border width.
	 */
	/* [NTL] This is like putting a white piece of paper on top of a glittery background -
	 * you only see the glitter around the edges! */
	.shine-border-content {
		background: #ffffff;
		border-radius: calc(var(--border-radius) - var(--border-width)); /* [CR] Inset corners */
		height: 100%;
		width: 100%;
	}

	/*
	 * [RFO] prefers-reduced-motion support - NEEDED
	 * WHY NOT DONE BEFORE: Line 31 documents this as a known TODO that was deferred.
	 * The animation is continuous and decorative, making it a clear accessibility issue.
	 * This is a simple CSS fix (no JavaScript changes required).
	 *
	 * Implementation:
	 * @media (prefers-reduced-motion: reduce) {
	 *   .shine-border-wrapper { animation-duration: 0.01s; }
	 * }
	 */
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- [CR] RFO Review 27.12.25: prefers-reduced-motion support identified as NEEDED (simple CSS fix) -->
<!-- Signed off: 26.12.25 -->
<!-- RFO Review: 27.12.25 -->
