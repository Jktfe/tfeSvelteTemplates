<!--
	LinkImageHover Component

	A link component that displays an image preview on hover above the link text.
	The image appears with a smooth blur transition when you hover over the link.

	Features:
	- Image preview appears on hover
	- Smooth blur transition effect
	- Positioned above the link text
	- Customisable link and image details
	- Zero external dependencies
	- Fully accessible with proper alt text

	Usage:
	<LinkImageHover
		href="https://example.com"
		text="Link Text"
		imageSrc="https://example.com/image.jpg"
		imageAlt="Image description"
	/>
-->

<script lang="ts">
	import { blur } from 'svelte/transition';
	import type { LinkImageHoverProps } from '$lib/types';

	/**
	 * Props for LinkImageHover component
	 */
	let {
		href = 'https://example.com',
		text = 'Link Text',
		imageSrc = 'https://i.pinimg.com/736x/7e/61/74/7e6174c858a5aa169de033f55fc3050c.jpg',
		imageAlt = 'Preview Image',
		imageWidth = 'h-44 w-44',
		target = '_blank'
	}: LinkImageHoverProps = $props();

	/**
	 * Track hover state to show/hide image
	 */
	let isHover = $state(false);

	/**
	 * Action to handle mouse enter/leave events
	 * Toggles the image visibility based on hover state
	 */
	function linkEffect(node: HTMLElement) {
		node.addEventListener('mouseenter', () => {
			isHover = true;
		});
		node.addEventListener('mouseleave', () => {
			isHover = false;
		});

		// Cleanup event listeners when component is destroyed
		return {
			destroy() {
				node.removeEventListener('mouseenter', () => {
					isHover = true;
				});
				node.removeEventListener('mouseleave', () => {
					isHover = false;
				});
			}
		};
	}
</script>

<div class="relative z-50 flex w-full items-center justify-center">
	<!-- Image preview that appears on hover -->
	{#if isHover}
		<img
			in:blur={{ duration: 300 }}
			style="position:absolute; bottom:40px;"
			src={imageSrc}
			alt={imageAlt}
			class="{imageWidth} z-50 rounded-lg shadow-lg"
		/>
	{/if}

	<!-- The link element with hover detection -->
	<a
		use:linkEffect
		{href}
		{target}
		class="z-50 cursor-pointer text-md underline"
		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
	>
		{text}
	</a>
</div>

<style>
	/**
	 * Uses Tailwind utility classes and inline styles for positioning
	 * Image is absolutely positioned above the link
	 */
</style>
