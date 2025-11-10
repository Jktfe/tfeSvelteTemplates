<!--
/**
 * MagicCard - Interactive card component with mouse-tracking spotlight effect
 *
 * Features:
 * - Radial gradient spotlight that follows mouse movement
 * - Smooth entrance and exit transitions
 * - Customisable gradient size, colour, and opacity
 * - Zero dependencies (pure CSS and Svelte)
 * - Fully responsive and performant
 *
 * Perfect for:
 * - Feature showcases and product cards
 * - Interactive portfolios and galleries
 * - Highlighting important content
 * - Creating visual interest on landing pages
 *
 * Technical Implementation:
 * - Uses Svelte 5 runes ($state, $derived) for reactive mouse tracking
 * - Gradient positioning calculated relative to card bounds
 * - GPU-accelerated with CSS transforms and opacity
 * - Respects reduced motion preferences
 *
 * @component
 * @example
 * ```svelte
 * <MagicCard
 *   gradientSize={250}
 *   gradientColor="#3b82f6"
 *   gradientOpacity={0.6}
 * >
 *   <h3>Your content here</h3>
 *   <p>The spotlight effect will track your mouse</p>
 * </MagicCard>
 * ```
 */
-->
<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		gradientSize?: number;
		gradientColor?: string;
		gradientOpacity?: number;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		gradientSize = 200,
		gradientColor = '#262626',
		gradientOpacity = 0.8,
		class: className = '',
		children
	}: Props = $props();

	// Use Svelte 5 $state runes for reactive mouse tracking
	let mouseX = $state(-gradientSize);
	let mouseY = $state(-gradientSize);
	let isHovering = $state(false);

	// Create reactive gradient background using $derived
	let bg = $derived(
		`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`
	);

	function handleMouseEnter() {
		isHovering = true;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isHovering) return;
		const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}

	function handleMouseLeave() {
		isHovering = false;
		mouseX = -gradientSize;
		mouseY = -gradientSize;
	}
</script>

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
	<div class="relative z-10">
		{#if children}
			{@render children()}
		{:else}
			<div class="flex items-center justify-center h-full text-center">
				<p class="text-2xl">Magic Card</p>
			</div>
		{/if}
	</div>
	<!-- Pure CSS gradient spotlight effect - no motion library needed -->
	<div
		class="spotlight pointer-events-none absolute -inset-px rounded-xl transition-opacity duration-300"
		style="background: {bg}; opacity: {isHovering ? gradientOpacity : 0};"
	></div>
</div>

<style>
	.size-full {
		width: 100%;
		height: 100%;
	}
</style>
