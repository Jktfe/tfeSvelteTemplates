<!--
	============================================================
	MagicCard - Mouse-Tracking Spotlight Effect Card
	============================================================

	[CR] WHAT IT DOES
	An interactive card component with a radial gradient spotlight that
	follows the mouse cursor. Uses Svelte 5 runes for reactive state and
	pure CSS for the gradient effect. No animation libraries required.

	[NTL] THE SIMPLE VERSION
	Imagine shining a torch on a dark wall - wherever you point, there's
	a bright circle of light. This card works the same way! Move your
	mouse and a glowing spotlight follows it around, making your content
	feel magical and interactive.

	============================================================

	FEATURES:
	- Radial gradient spotlight that follows mouse movement
	- Smooth entrance and exit transitions
	- Customisable gradient size, colour, and opacity
	- Dark/light mode support
	- Fully responsive and performant

	DEPENDENCIES:
	- $lib/utils (cn helper function)
	- TailwindCSS (for utility classes)
	- Zero animation libraries - pure CSS + Svelte reactivity

	ACCESSIBILITY:
	- Uses role="region" for semantic grouping
	- Effect is purely decorative (doesn't affect content accessibility)
	- Gradient fades smoothly (no jarring transitions)

	USAGE:
	<MagicCard gradientSize={250} gradientColor="#3b82f6" gradientOpacity={0.6}>
		<h3>Your content here</h3>
	</MagicCard>

	PROPS:
	| Prop            | Type    | Default   | Description                      |
	|-----------------|---------|-----------|----------------------------------|
	| gradientSize    | number  | 200       | Spotlight radius in pixels       |
	| gradientColor   | string  | '#262626' | Spotlight colour                 |
	| gradientOpacity | number  | 0.8       | Spotlight opacity (0-1)          |
	| class           | string  | ''        | Additional CSS classes           |
	| children        | Snippet | -         | Content to render inside         |

	WARNINGS:
	- state_referenced_locally: Expected - initial position uses prop value
	- a11y_no_static_element_interactions: Expected - decorative mouse tracking

	============================================================
-->
<script lang="ts">
	// [CR] Import utility for merging Tailwind classes safely
	import { cn } from '$lib/utils';

	// [CR] Local props interface - defines customisation options
	// [NTL] These are the "dials" you can turn to adjust the spotlight effect!
	interface Props {
		gradientSize?: number; // [NTL] How big is the spotlight circle?
		gradientColor?: string; // [NTL] What colour is the glow?
		gradientOpacity?: number; // [NTL] How visible is the spotlight? (0 = invisible, 1 = full)
		class?: string;
		children?: import('svelte').Snippet;
	}

	// [CR] Destructure props with sensible defaults
	let {
		gradientSize = 200, // [NTL] 200px radius is a nice medium-sized spotlight
		gradientColor = '#262626', // [NTL] Dark grey - subtle but visible
		gradientOpacity = 0.8, // [NTL] 80% opacity - noticeable but not overwhelming
		class: className = '',
		children
	}: Props = $props();

	// [CR] Mouse position state - starts off-screen so spotlight isn't visible initially
	// [NTL] We hide the spotlight outside the card until the mouse enters!
	/* svelte-ignore state_referenced_locally */
	let mouseX = $state(-gradientSize);
	/* svelte-ignore state_referenced_locally */
	let mouseY = $state(-gradientSize);
	let isHovering = $state(false); // [NTL] Is the mouse inside the card right now?

	// [CR] Derived reactive value - recalculates whenever mouseX/mouseY change
	// [NTL] This builds the CSS gradient string - it's like giving the browser
	// instructions: "draw a circle at X,Y with this colour"
	let bg = $derived(
		`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`
	);

	// [CR] Mouse event handlers for spotlight tracking
	// [NTL] These are the "ears" that listen for your mouse movements!

	function handleMouseEnter() {
		// [NTL] Mouse just entered the card - start tracking!
		isHovering = true;
	}

	function handleMouseMove(e: MouseEvent) {
		// [CR] Only track if we're hovering (optimization)
		if (!isHovering) return;
		// [CR] Get card position on screen, calculate mouse position relative to card
		// [NTL] We need to know where the mouse is INSIDE the card, not on the whole page
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		mouseX = e.clientX - rect.left; // [NTL] Distance from card's left edge
		mouseY = e.clientY - rect.top; // [NTL] Distance from card's top edge
	}

	function handleMouseLeave() {
		// [CR] Reset state when mouse leaves
		// [NTL] Mouse left - hide the spotlight by moving it off-screen!
		isHovering = false;
		mouseX = -gradientSize;
		mouseY = -gradientSize;
	}
</script>

<!-- [CR] Main card container with mouse event listeners -->
<!-- [NTL] This div is like a stage - it watches where your mouse goes and tells the spotlight! -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	onmouseenter={handleMouseEnter}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	class={cn(
		'magic-card-container relative flex size-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border text-black dark:text-white justify-center py-4',
		className
	)}
	role="region"
>
	<!-- [CR] Content layer - z-10 ensures it sits above the spotlight -->
	<!-- [NTL] Your actual content goes here - it floats above the spotlight effect -->
	<div class="relative z-10">
		{#if children}
			{@render children()}
		{:else}
			<!-- [NTL] Default content if you don't provide any -->
			<div class="flex items-center justify-center h-full text-center">
				<p class="text-2xl">Magic Card</p>
			</div>
		{/if}
	</div>

	<!-- [CR] Spotlight layer - positioned behind content, tracks mouse via reactive bg variable -->
	<!-- [NTL] This invisible layer creates the glowing circle - it follows your mouse around! -->
	<div
		class="spotlight pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300"
		style="background: {bg}; opacity: {isHovering ? gradientOpacity : 0};"
	></div>
</div>

<style>
	/*
	 * [CR] Utility class for full width/height - Tailwind's size-full equivalent
	 * [NTL] Makes sure the card fills its container completely
	 */
	.size-full {
		width: 100%;
		height: 100%;
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->
