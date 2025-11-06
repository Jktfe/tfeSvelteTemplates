<!--
	SwishButton Component

	An animated button with a swishing text transition and background fill effect.
	When hovered, the button text slides out while a new instance slides in with an arrow,
	and the background fills from a small dot to cover the entire button.

	Features:
	- Smooth text slide animation on hover
	- Expanding background dot effect
	- Arrow icon that appears on hover
	- Zero external dependencies (no icon libraries)
	- Fully customisable with CSS classes
	- Supports all native button attributes via $$restProps

	Usage:
	<SwishButton text="Click me" class="custom-class" on:click={handleClick} />
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SwishButtonProps } from '$lib/types';

	/**
	 * Props for SwishButton component
	 * Additional HTML button attributes can be passed directly
	 */
	let {
		text = 'Button',
		class: className = '',
		onclick,
		disabled,
		type = 'button',
		...rest
	}: SwishButtonProps & {
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		[key: string]: unknown;
	} = $props();
</script>

<button
	class={cn(
		'group relative w-32 cursor-pointer overflow-hidden rounded-full border bg-background p-2 text-center font-semibold',
		className
	)}
	{onclick}
	{disabled}
	{type}
	{...rest}
>
	<!-- Original text that slides out on hover -->
	<span
		class="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0"
	>
		{text}
	</span>

	<!-- Hover state: Text + Arrow that slides in from the right -->
	<div
		class="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
	>
		<span>{text}</span>
		<!-- Inline SVG arrow icon - zero dependencies -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="5" y1="12" x2="19" y2="12"></line>
			<polyline points="12 5 19 12 12 19"></polyline>
		</svg>
	</div>

	<!-- Expanding background dot that grows to fill button on hover -->
	<div
		class="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"
	></div>
</button>

<style>
	/**
	 * Uses Tailwind utility classes for all styling
	 * No additional CSS needed - component is fully self-contained
	 */
</style>
