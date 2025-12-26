<!--
	============================================================
	ExpandingCard - Interactive Layout Transition Card
	============================================================

	[CR] WHAT IT DOES
	Card component with two distinct layouts (compact/expanded) that
	seamlessly transitions between them using Svelte's built-in crossfade.
	Clicking anywhere on the card toggles the layout state.

	[NTL] THE SIMPLE VERSION
	It's like a business card that can unfold! Click it once to see
	more details, click again to fold it back up. The magic is in how
	smoothly everything moves to its new position.

	============================================================

	FEATURES:
	- Smooth crossfade transitions between layouts
	- Compact: Vertical layout (image top, text below)
	- Expanded: Horizontal layout (image left, text right)
	- Click anywhere to toggle
	- Shared element transitions maintain visual continuity
	- Responsive design with mobile optimisations
	- Accessible with keyboard and ARIA labels

	PERFECT FOR:
	- Team member profiles / bios
	- Feature showcases with expandable details
	- Product highlights
	- Portfolio items
	- FAQ sections with visual emphasis

	DEPENDENCIES:
	- svelte/transition (crossfade) - built into Svelte
	- $lib/types (ExpandingCardProps)
	- TailwindCSS for styling

	ACCESSIBILITY:
	- Full button semantics (clickable, focusable)
	- ARIA labels indicating action (Expand/Collapse)
	- Keyboard accessible (Enter/Space to toggle)

	WARNINGS:
	- None expected

	============================================================
-->

<script lang="ts">
	// [CR] Svelte's built-in crossfade creates shared element transitions between layouts
	// [NTL] This is what makes elements "fly" from their old position to their new one!
	import { crossfade } from 'svelte/transition';
	import type { ExpandingCardProps } from '$lib/types';

	// [CR] Props with sensible defaults - each controls a visual aspect of the card
	// [NTL] These are all the things you can customise when using this card
	let {
		imageSrc = 'https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg', // [NTL] The picture shown on the card
		imageAlt = 'Card Image',                                                             // [NTL] Description for screen readers
		heading = 'Card Title',                                                              // [NTL] The big bold title
		compactText = 'Hello Devs, welcome to our Website',                                  // [NTL] Short text when card is small
		expandedText = 'Yoo devs, How you doing?',                                           // [NTL] Longer text when card opens up
		bgColor = 'bg-lime-100'                                                              // [NTL] TailwindCSS background colour class
	}: ExpandingCardProps = $props();

	// [CR] Layout state machine - simple two-state toggle
	// [NTL] This is the "open/closed" switch - compact = folded up, expanded = opened out
	let layout: 'compact' | 'expanded' = $state('compact');

	// [CR] Crossfade returns two transition functions: send (outgoing) and receive (incoming)
	// [CR] Elements with matching keys animate smoothly from old to new position
	// [NTL] Think of it like magic teleportation - the image "flies" from one spot to another!
	let [send, receive] = crossfade({
		duration: 400 // [NTL] Animation takes 400ms (0.4 seconds) - fast but smooth
	});

	// [CR] Toggle function - click handler for the entire card
	// [NTL] Flip the switch: if it's compact, expand it. If it's expanded, compact it.
	function toggleLayout() {
		layout = layout === 'compact' ? 'expanded' : 'compact';
	}
</script>

<div class="flex h-full w-full items-center justify-center flex-col my-0 md:my-44">
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
				<img src={imageSrc} alt={imageAlt} class="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl" />
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
				<img src={imageSrc} alt={imageAlt} class="h-28 w-28 sm:h-32 sm:w-36 md:h-56 md:w-56 rounded-2xl" />
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
	/* [CR] Absolute positioning is essential for crossfade to work correctly
	   The elements need to be able to animate to their new positions without
	   affecting document flow during the transition */
	/* [NTL] Without this, the card would "jump" instead of smoothly flying! */
	.layouta {
		position: absolute;
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->
