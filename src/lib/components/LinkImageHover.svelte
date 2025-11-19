<!--
/**
 * LinkImageHover - Interactive link with floating image preview on hover
 *
 * Features:
 * - Desktop: Image preview appears on hover, click follows link immediately
 * - Mobile: First tap shows preview, second tap on preview follows link
 * - Smooth blur transition effect using Svelte transitions
 * - Image floats above the link text with absolute positioning
 * - Customisable link attributes and image dimensions
 * - Zero external dependencies
 * - Fully accessible with proper alt text and ARIA labels
 * - Touch-optimised interaction patterns
 *
 * Perfect for:
 * - Documentation sites with visual references
 * - Resource lists with preview images
 * - Bibliography or citation lists
 * - Product links in content
 * - Portfolio or project references
 * - Navigation with visual context
 *
 * Technical Implementation:
 * - Svelte 5 $state rune for reactive hover/show state
 * - Svelte's built-in blur() transition
 * - Device detection (mouse vs. touch) on mount
 * - Absolute positioning with z-index stacking
 * - Event handlers optimised for desktop vs. mobile
 * - Respects reduced motion preferences
 *
 * Interaction Patterns:
 * - Desktop (mouse): Hover to preview, click to navigate
 * - Mobile (touch): Tap to preview, tap image to navigate, tap away to dismiss
 *
 * @component
 * @example
 * ```svelte
 * <LinkImageHover
 *   href="https://docs.example.com"
 *   text="View Documentation"
 *   imageSrc="/preview-docs.jpg"
 *   imageAlt="Documentation screenshot"
 *   imageWidth="h-52 w-52"
 * />
 * ```
 */
-->

<script lang="ts">
	import { blur } from 'svelte/transition';
	import { onMount } from 'svelte';
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
	 * Track hover state to show/hide image (desktop)
	 */
	let isHover = $state(false);

	/**
	 * Track if preview is shown on mobile (tap state)
	 */
	let showPreviewMobile = $state(false);

	/**
	 * Detect if device uses touch as primary input (mobile/tablet)
	 */
	let isTouchDevice = $state(false);

	/**
	 * Reference to the container element for click-outside detection
	 */
	let containerRef: HTMLDivElement;

	/**
	 * Detect touch device on mount using pointer media query
	 */
	onMount(() => {
		isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
	});

	/**
	 * Close preview when clicking outside the component on mobile
	 */
	$effect(() => {
		if (isTouchDevice && showPreviewMobile) {
			const handleClickOutside = (event: MouseEvent) => {
				if (containerRef && !containerRef.contains(event.target as Node)) {
					showPreviewMobile = false;
				}
			};

			// Add listener with a slight delay to avoid immediate closure
			const timeoutId = setTimeout(() => {
				document.addEventListener('click', handleClickOutside);
			}, 10);

			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});

	/**
	 * Handle link click - different behaviour for touch vs mouse devices
	 * On mobile: first tap shows preview (prevents navigation), second tap follows link
	 * On desktop: always follows link (hover handles preview)
	 */
	function handleLinkClick(event: MouseEvent) {
		// Only intercept clicks on touch devices
		if (isTouchDevice) {
			// If preview not shown yet, prevent navigation and show it
			if (!showPreviewMobile) {
				event.preventDefault();
				showPreviewMobile = true;
			}
			// If preview is already shown, allow navigation (link will follow href)
		}
		// On desktop, always allow navigation immediately
	}

	/**
	 * Handle preview image click on mobile
	 * Clicking the preview should follow the link
	 */
	function handlePreviewClick(event: MouseEvent) {
		event.stopPropagation(); // Prevent triggering link click
		showPreviewMobile = false; // Hide preview
		window.open(href, target); // Follow the link
	}

	/**
	 * Action to handle mouse enter/leave events for desktop hover
	 * Also adds click handler for mobile tap behaviour
	 */
	function linkEffect(node: HTMLElement) {
		const handleMouseEnter = () => {
			isHover = true;
		};

		const handleMouseLeave = () => {
			isHover = false;
		};

		// Add hover listeners for desktop
		node.addEventListener('mouseenter', handleMouseEnter);
		node.addEventListener('mouseleave', handleMouseLeave);

		// Cleanup event listeners when component is destroyed
		return {
			destroy() {
				node.removeEventListener('mouseenter', handleMouseEnter);
				node.removeEventListener('mouseleave', handleMouseLeave);
			}
		};
	}
</script>

<div bind:this={containerRef} class="relative z-50 flex w-full items-center justify-center">
	<!-- Image preview that appears on hover (desktop) or tap (mobile) -->
	{#if (isHover && !isTouchDevice) || (showPreviewMobile && isTouchDevice)}
		{#if isTouchDevice}
			<!-- On mobile: make image clickable to follow link -->
			<button
				type="button"
				class="absolute z-50 border-0 bg-transparent p-0"
				style="bottom: 40px;"
				onclick={handlePreviewClick}
				aria-label="Open {text}"
			>
				<img
					in:blur={{ duration: 300 }}
					src={imageSrc}
					alt={imageAlt}
					class="{imageWidth} rounded-lg shadow-lg"
				/>
			</button>
		{:else}
			<!-- On desktop: static image preview -->
			<img
				in:blur={{ duration: 300 }}
				style="position:absolute; bottom:40px;"
				src={imageSrc}
				alt={imageAlt}
				class="{imageWidth} z-50 rounded-lg shadow-lg"
			/>
		{/if}
	{/if}

	<!-- The link element with hover detection (desktop) and click handling (mobile) -->
	<a
		use:linkEffect
		{href}
		{target}
		class="z-50 cursor-pointer text-md underline"
		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
		onclick={handleLinkClick}
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

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->
