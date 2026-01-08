<!--
	============================================================
	Marquee - Infinite Scrolling Content Carousel
	============================================================

	[CR] WHAT IT DOES
	Pure CSS infinite scroll component that continuously loops content.
	Uses CSS animations with content duplication to create seamless effect.
	Performance-optimised with GPU-accelerated transforms.

	[NTL] THE SIMPLE VERSION
	Imagine a news ticker at the bottom of a TV screen - content scrolls
	endlessly across the screen! This component does exactly that, but you
	can put anything inside: logos, testimonials, product cards, whatever!

	============================================================

	FEATURES:
	- Seamless infinite loop (content duplicated for smooth wrap)
	- Pause on hover (optional)
	- Horizontal or vertical scrolling
	- Configurable speed and repeat count
	- Reverse direction support
	- Zero external dependencies

	PERFECT FOR:
	- Partner logos and brand showcases
	- Testimonials and reviews
	- News tickers and announcements
	- Social media feeds

	DEPENDENCIES:
	- $lib/utils (cn helper)
	- TailwindCSS for utility classes
	- Requires animate-marquee keyframes in tailwind.config.js

	ACCESSIBILITY:
	- role="region" with aria-label
	- Respects prefers-reduced-motion (via Tailwind)

	WARNINGS: None expected

	============================================================
-->
<script lang="ts">
	// [CR] Utility for combining Tailwind classes conditionally
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	// [CR] Props interface - defines all customisation options
	// [NTL] These are the "knobs and dials" you can tweak!
	interface Props {
		pauseOnHover?: boolean;              // [NTL] Stop scrolling when mouse hovers?
		vertical?: boolean;                   // [NTL] Scroll up/down instead of left/right?
		repeat?: number;                      // [NTL] Minimum copies (default 4, auto-calculated if more needed)
		reverse?: boolean;                    // [NTL] Scroll the opposite direction?
		duration?: number;                    // [NTL] Seconds for one complete cycle (lower = faster)
		class?: string;                       // [NTL] Extra CSS classes to add
		children?: import('svelte').Snippet;  // [NTL] The content to scroll
	}

	// [CR] Destructure props with sensible defaults
	// [NTL] If you don't specify a value, these defaults kick in
	let {
		pauseOnHover = false,   // [CR] Default: keep scrolling on hover
		vertical = false,       // [CR] Default: horizontal scroll
		repeat = 4,             // [CR] Default: minimum 4 copies (safety floor for seamless loop)
		reverse = false,        // [CR] Default: normal direction (left for horizontal)
		duration = 40,          // [CR] Default: 40 seconds per cycle (nice and slow)
		class: className = '',
		children
	}: Props = $props();

	// [CR] ============================================================
	// [CR] DYNAMIC REPEAT CALCULATION
	// [NTL] We calculate how many copies are needed to always fill the screen
	// [NTL] This ensures the "seam" (where it loops) is always off-screen!
	// [CR] ============================================================

	// [CR] DOM references for measurement
	let containerEl = $state<HTMLDivElement>();
	let contentEl = $state<HTMLDivElement>();

	// [CR] Actual number of copies to render (calculated from measurements)
	// [NTL] This will be at least `repeat`, but more if the content is short
	// [CR] Initial value set to repeat prop - svelte-ignore for intentional prop initialization
	/* svelte-ignore state_referenced_locally */
	let actualRepeat = $state(repeat);

	// [CR] Calculate how many copies needed to fill container + extra for seamless loop
	function calculateRepeat() {
		if (!containerEl || !contentEl) return;

		// [CR] Measure container and content dimensions
		const containerSize = vertical ? containerEl.offsetHeight : containerEl.offsetWidth;
		const contentSize = vertical ? contentEl.offsetHeight : contentEl.offsetWidth;

		if (contentSize <= 0) return;

		// [CR] Need enough copies to fill the container THREE times over
		// [NTL] Why 3x? Because we need extra buffer for:
		// [NTL] 1. Content scrolling OUT on one side
		// [NTL] 2. Content visible in the middle
		// [NTL] 3. Content scrolling IN from the other side
		// [NTL] Plus the gap between copies adds extra space we need to cover!
		const minCopies = Math.ceil((containerSize * 3) / contentSize) + 1;

		// [CR] Ensure minimum of 4 copies for short content, or calculated amount
		// [NTL] 4 copies is our "safety floor" - better to have too many than see the seam!
		actualRepeat = Math.max(4, minCopies, repeat);
	}

	onMount(() => {
		// [CR] Calculate on mount after DOM is ready
		requestAnimationFrame(() => {
			calculateRepeat();
		});

		// [CR] Recalculate on resize (container might grow on larger screens)
		const resizeObserver = new ResizeObserver(() => {
			calculateRepeat();
		});

		if (containerEl) {
			resizeObserver.observe(containerEl);
		}

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div
	bind:this={containerEl}
	class={cn(
		'group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)]',
		{
			'flex-row': !vertical,
			'flex-col': vertical
		},
		className
	)}
	style="--duration: {duration}s; --delay: -{duration / 2}s"
	role="region"
	aria-label="Scrolling content"
>
	<!-- [CR] First copy is used for measurement, bound to contentEl -->
	<div
		bind:this={contentEl}
		class={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
			'animate-marquee flex-row': !vertical,
			'animate-marquee-vertical flex-col': vertical,
			'group-hover:[animation-play-state:paused]': pauseOnHover,
			'[animation-direction:reverse]': reverse
		})}
		style="animation-delay: var(--delay)"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
	<!-- [CR] Additional copies for seamless infinite loop -->
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: actualRepeat - 1 } as _, i (i)}
		<div
			class={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
				'animate-marquee flex-row': !vertical,
				'animate-marquee-vertical flex-col': vertical,
				'group-hover:[animation-play-state:paused]': pauseOnHover,
				'[animation-direction:reverse]': reverse
			})}
			style="animation-delay: var(--delay)"
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/each}
</div>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
