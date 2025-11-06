<!--
	ExpandingCard Component

	An interactive card that expands between two layout states with smooth crossfade transitions.
	Click the card to toggle between compact (vertical) and expanded (horizontal) layouts.

	Features:
	- Smooth crossfade transitions using Svelte's built-in animation
	- Two distinct layouts: compact and expanded
	- Click to toggle between states
	- Maintains visual continuity with shared element transitions
	- Fully responsive design
	- Customisable content (image, heading, description)

	Usage:
	<ExpandingCard
		imageSrc="https://example.com/image.jpg"
		imageAlt="Description"
		heading="Title"
		compactText="Short description"
		expandedText="Longer description with more details"
	/>
-->

<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import type { ExpandingCardProps } from '$lib/types';

	/**
	 * Props for ExpandingCard component
	 */
	let {
		imageSrc = 'https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg',
		imageAlt = 'Card Image',
		heading = 'Card Title',
		compactText = 'Hello Devs, welcome to our Website',
		expandedText = 'Yoo devs, How you doing?',
		bgColor = 'bg-lime-100'
	}: ExpandingCardProps = $props();

	/**
	 * Track current layout state
	 * 'compact' = vertical layout with image on top
	 * 'expanded' = horizontal layout with image on left
	 */
	let layout: 'compact' | 'expanded' = $state('compact');

	/**
	 * Crossfade transition configuration
	 * Creates smooth element transitions between layouts
	 */
	let [send, receive] = crossfade({
		duration: 400
	});

	/**
	 * Toggle between layouts on click
	 */
	function toggleLayout() {
		layout = layout === 'compact' ? 'expanded' : 'compact';
	}
</script>

<div class="flex h-full w-full items-center justify-center flex-col md:my-44">
	{#if layout === 'compact'}
		<!-- Compact Layout: Vertical stack with image on top -->
		<button
			onclick={toggleLayout}
			class="{bgColor} layouta h-fit w-fit cursor-pointer overflow-hidden rounded-3xl p-4"
			in:receive={{ key: 'layouta' }}
			out:send={{ key: 'layouta' }}
			aria-label="Expand card"
		>
			<!-- Image element with crossfade -->
			<div class="imgTag" in:receive={{ key: 'imgTag' }} out:send={{ key: 'imgTag' }}>
				<img src={imageSrc} alt={imageAlt} class="h-56 w-56 rounded-2xl" />
			</div>

			<!-- Content area -->
			<div class="mt-2 flex flex-col px-2">
				<h1
					class="heading text-lg font-bold text-gray-900 md:text-lg"
					in:receive={{ key: 'heading' }}
					out:send={{ key: 'heading' }}
				>
					{heading}
				</h1>
				<p
					class="para w-52 text-xs text-gray-700 sm:text-sm"
					in:receive={{ key: 'para' }}
					out:send={{ key: 'para' }}
				>
					{compactText}
				</p>
			</div>
		</button>
	{:else}
		<!-- Expanded Layout: Horizontal with image on left -->
		<button
			onclick={toggleLayout}
			class="{bgColor} layouta flex h-fit w-fit cursor-pointer gap-1 overflow-hidden rounded-3xl p-2.5 md:gap-3 md:p-4"
			in:receive={{ key: 'layouta' }}
			out:send={{ key: 'layouta' }}
			aria-label="Collapse card"
		>
			<!-- Image element with crossfade -->
			<div class="imgTag" in:receive={{ key: 'imgTag' }} out:send={{ key: 'imgTag' }}>
				<img src={imageSrc} alt={imageAlt} class="h-32 w-36 rounded-2xl md:h-64 md:w-64" />
			</div>

			<!-- Content area -->
			<div class="mt-2 flex flex-col px-1 md:px-2">
				<h1
					class="heading text-lg font-bold text-gray-900 md:text-2xl"
					in:receive={{ key: 'heading' }}
					out:send={{ key: 'heading' }}
				>
					{heading}
				</h1>
				<p
					class="para w-full text-xs text-gray-700 md:text-sm"
					in:receive={{ key: 'para' }}
					out:send={{ key: 'para' }}
				>
					{expandedText}
				</p>
			</div>
		</button>
	{/if}
</div>

<style>
	/**
	 * Absolute positioning for smooth layout transitions
	 * The crossfade creates a seamless morph between positions
	 */
	.layouta {
		position: absolute;
	}
</style>
