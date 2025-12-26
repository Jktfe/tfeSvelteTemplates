<!--
	============================================================
	LinkImageHover - Link with Floating Image Preview
	============================================================

	[CR] WHAT IT DOES
	Interactive link that shows a floating image preview on hover (desktop)
	or tap (mobile). Uses Svelte's built-in blur transition for smooth
	appearance, and handles touch vs pointer devices appropriately.

	[NTL] THE SIMPLE VERSION
	A link that shows a sneak peek image when you hover over it! On phones,
	you tap once to see the preview, then tap the preview to follow the link.
	It's like a tooltip, but with pictures!

	============================================================

	FEATURES:
	- Desktop: Hover to preview, click to navigate
	- Mobile: Tap to preview, tap preview to navigate
	- Smooth blur transition on image appearance
	- Absolute positioning above link text
	- Click-outside to dismiss on mobile
	- Security attributes for external links

	PERFECT FOR:
	- Documentation with visual references
	- Resource lists with preview images
	- Product links in content
	- Portfolio or project references

	DEPENDENCIES:
	- svelte/transition (blur effect - built into Svelte)
	- $lib/types (LinkImageHoverProps)
	- Zero external dependencies

	ACCESSIBILITY:
	- Alt text on preview images
	- ARIA label on mobile button
	- Standard link accessibility

	WARNINGS: None expected

	============================================================
-->

<script lang="ts">
	// [CR] Svelte's built-in blur transition for smooth image appearance
	import { blur } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { LinkImageHoverProps } from '$lib/types';

	// [CR] Props interface imported from types
	// [NTL] These are the "knobs and dials" for customising the link preview!
	let {
		href = 'https://example.com',        // [NTL] Where does the link go?
		text = 'Link Text',                   // [NTL] What text does the link show?
		imageSrc = 'https://i.pinimg.com/736x/7e/61/74/7e6174c858a5aa169de033f55fc3050c.jpg',  // [NTL] Preview image URL
		imageAlt = 'Preview Image',           // [NTL] Alt text for screen readers
		imageWidth = 'h-44 w-44',             // [NTL] Tailwind classes for image size
		target = '_blank'                     // [NTL] Open in new tab by default
	}: LinkImageHoverProps = $props();

	// [CR] ============================================================
	// [CR] STATE MANAGEMENT
	// [NTL] These variables keep track of what's happening
	// [CR] ============================================================

	// [CR] Track hover state for desktop (mouse) interaction
	let isHover = $state(false);

	// [CR] Track tap state for mobile (touch) interaction
	// [NTL] On mobile, we need to track this separately since there's no hover!
	let showPreviewMobile = $state(false);

	// [CR] Detect if device uses touch as primary input
	let isTouchDevice = $state(false);

	// [CR] Reference to container for click-outside detection
	let containerRef: HTMLDivElement;

	// [CR] ============================================================
	// [CR] LIFECYCLE
	// [NTL] When the component first appears, we detect what device you're on
	// [CR] ============================================================

	onMount(() => {
		// [CR] Use pointer media query for reliable touch detection
		// [NTL] This tells us if you're using a finger (coarse) or mouse (fine)
		isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
	});

	// [CR] ============================================================
	// [CR] CLICK-OUTSIDE DETECTION (Mobile only)
	// [NTL] On mobile, tapping outside the preview dismisses it
	// [CR] ============================================================

	$effect(() => {
		if (isTouchDevice && showPreviewMobile) {
			const handleClickOutside = (event: MouseEvent) => {
				// [CR] Check if click was outside our component
				if (containerRef && !containerRef.contains(event.target as Node)) {
					showPreviewMobile = false;
				}
			};

			// [CR] Small delay to prevent immediate closure from same tap
			const timeoutId = setTimeout(() => {
				document.addEventListener('click', handleClickOutside);
			}, 10);

			// [CR] Cleanup listener when effect re-runs or component unmounts
			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});

	// [CR] ============================================================
	// [CR] EVENT HANDLERS
	// [NTL] Different behavior for touch screens vs mouse devices
	// [CR] ============================================================

	// [CR] Handle link click - different behaviour for touch vs mouse devices
	// [NTL] On phone: tap once = show preview, tap again = go to link
	// [NTL] On computer: just click = go to link immediately
	function handleLinkClick(event: MouseEvent) {
		// [CR] Only intercept clicks on touch devices
		if (isTouchDevice) {
			// [CR] If preview not shown yet, prevent navigation and show it
			if (!showPreviewMobile) {
				event.preventDefault();
				showPreviewMobile = true;
			}
			// [CR] If preview is already shown, allow navigation (link will follow href)
		}
		// [CR] On desktop, always allow navigation immediately
	}

	// [CR] Handle preview image click on mobile
	// [NTL] Tapping the preview image follows the link
	function handlePreviewClick(event: MouseEvent) {
		event.stopPropagation(); // [CR] Prevent triggering link click
		showPreviewMobile = false; // [CR] Hide preview
		window.open(href, target); // [CR] Follow the link
	}

	// [CR] Svelte action to handle mouse enter/leave events for desktop hover
	// [NTL] This is the "magic" that shows the image when you hover!
	function linkEffect(node: HTMLElement) {
		const handleMouseEnter = () => {
			isHover = true;
		};

		const handleMouseLeave = () => {
			isHover = false;
		};

		// [CR] Add hover listeners for desktop
		node.addEventListener('mouseenter', handleMouseEnter);
		node.addEventListener('mouseleave', handleMouseLeave);

		// [CR] Cleanup event listeners when component is destroyed
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

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->
