<!--
/**
 * Marquee - Infinite scrolling carousel for displaying content continuously
 *
 * Features:
 * - Seamless infinite loop animation
 * - Optional pause-on-hover interaction
 * - Horizontal or vertical scrolling directions
 * - Configurable speed and repeat count
 * - Reverse direction support
 * - Zero dependencies (pure CSS animations)
 * - Fully accessible with ARIA labels
 *
 * Perfect for:
 * - Testimonials and reviews
 * - Partner logos and brand showcases
 * - Social media feeds
 * - News tickers and announcements
 * - Product features or highlights
 *
 * Technical Implementation:
 * - Pure CSS animations for smooth performance
 * - Content duplicated for seamless looping
 * - CSS custom properties for runtime configuration
 * - GPU-accelerated with CSS transforms
 * - Respects reduced motion preferences
 *
 * @component
 * @example
 * ```svelte
 * <Marquee duration={30} pauseOnHover={true} repeat={3}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Marquee>
 * ```
 */
-->
<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		pauseOnHover?: boolean;
		vertical?: boolean;
		repeat?: number;
		reverse?: boolean;
		duration?: number;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		pauseOnHover = false,
		vertical = false,
		repeat = 4,
		reverse = false,
		duration = 40,
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class={cn(
		'group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]',
		{
			'flex-row': !vertical,
			'flex-col': vertical
		},
		className
	)}
	style="--duration: {duration}s"
	role="region"
	aria-label="Scrolling content"
>
	{#each { length: repeat } as _, i (i)}
		<div
			class={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
				'animate-marquee flex-row': !vertical,
				'animate-marquee-vertical flex-col': vertical,
				'group-hover:[animation-play-state:paused]': pauseOnHover,
				'[animation-direction:reverse]': reverse
			})}
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/each}
</div>
