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
