<!--
	ShineBorder Component - Animated Border with Shine Effect

	Creates a wrapper with an animated shining border effect that continuously
	moves across the border edges, creating an eye-catching visual element.

	FEATURES:
	- Smooth horizontal shine animation
	- Customisable colour, duration, width, and radius
	- Uses CSS custom properties for easy theming
	- Minimal performance impact with optimised animations

	USAGE:
	<ShineBorder color="#146ef5" duration={4} borderWidth={2} borderRadius={16}>
		<div>Your content here</div>
	</ShineBorder>

	PROPS:
	- color: Border shine colour (default: '#146ef5')
	- duration: Animation duration in seconds (default: 3)
	- borderWidth: Width of the border in pixels (default: 2)
	- borderRadius: Border radius in pixels (default: 8)
	- children: Svelte snippet for content
-->

<script lang="ts">
	import type { ShineBorderProps } from '$lib/types';

	interface Props extends ShineBorderProps {
		children?: import('svelte').Snippet;
	}

	let {
		color = '#146ef5',
		duration = 3,
		borderWidth = 2,
		borderRadius = 8,
		children
	}: Props = $props();
</script>

<div
	class="shine-border-wrapper"
	style="
    --shine-color: {color};
    --shine-duration: {duration}s;
    --border-width: {borderWidth}px;
    --border-radius: {borderRadius}px;
  "
>
	<div class="shine-border-content">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.shine-border-wrapper {
		position: relative;
		border-radius: var(--border-radius);
		padding: var(--border-width);
		background: linear-gradient(90deg, transparent, var(--shine-color), transparent);
		background-size: 200% 100%;
		animation: shine-border-animation var(--shine-duration) linear infinite;
		will-change: background-position;
	}

	@keyframes shine-border-animation {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.shine-border-content {
		background: #ffffff;
		border-radius: calc(var(--border-radius) - var(--border-width));
		height: 100%;
		width: 100%;
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
