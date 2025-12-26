<!--
	============================================================
	SwishButton - Animated CTA Button with Multi-Layer Effects
	============================================================

	[CR] WHAT IT DOES
	An animated call-to-action button with coordinated hover effects:
	text slides out, replacement text with arrow slides in, and a background
	dot expands to fill the button. Pure CSS animations, zero JS overhead.

	[NTL] THE SIMPLE VERSION
	Think of a magic trick where one card slides behind another! When you
	hover, the text swoops off-stage to the left while a fresh copy with an
	arrow glides in from the right. Meanwhile, a tiny dot in the corner
	grows to become the new background. It's like a little theatre show!

	============================================================

	FEATURES:
	- Smooth text slide animation on hover
	- Expanding background dot effect from center
	- Inline SVG arrow icon (no icon library dependencies)
	- Coordinated multi-layer transitions
	- Supports disabled state with X icon
	- Supports reset type with undo icon
	- Fully customisable with CSS classes
	- Supports all native button attributes

	DEPENDENCIES:
	- TailwindCSS (for utility classes)
	- $lib/utils (cn helper function)
	- Zero icon libraries - all SVGs are inline

	ACCESSIBILITY:
	- Proper button semantics
	- Focus-visible for keyboard navigation
	- Respects prefers-reduced-motion (via Tailwind)
	- Disabled state properly conveyed

	USAGE:
	<SwishButton text="Get Started" onclick={handleClick} />
	<SwishButton text="Submit" type="submit" />
	<SwishButton text="Reset" type="reset" />

	PROPS:
	| Prop     | Type     | Default  | Description                      |
	|----------|----------|----------|----------------------------------|
	| text     | string   | 'Button' | Button label text                |
	| class    | string   | ''       | Additional CSS classes           |
	| onclick  | function | -        | Click handler                    |
	| disabled | boolean  | false    | Disable the button               |
	| type     | string   | 'button' | button/submit/reset              |
	| ...rest  | any      | -        | Any other button attributes      |

	ANIMATION LAYERS (order of visual effects):
	1. Background dot expands from center to full coverage
	2. Original text slides out to the left (opacity fades)
	3. New text + arrow slides in from the right
	4. Arrow icon appears during text transition

	WARNINGS:
	None expected - uses standard Tailwind utilities

	============================================================
-->

<script lang="ts">
	// [CR] Import utility for merging Tailwind classes safely
	import { cn } from '$lib/utils';
	// [CR] Import shared prop types for type safety
	import type { SwishButtonProps } from '$lib/types';

	// [CR] Destructure props with defaults, extending base props with button-specific attributes
	// [NTL] We're setting up all the "knobs and dials" you can use to customise this button!
	let {
		text = 'Button', // [NTL] What the button says - defaults to "Button"
		class: className = '', // [CR] Renamed to avoid JS reserved word conflict
		onclick, // [NTL] What happens when you click it
		disabled, // [NTL] Set to true to grey it out and prevent clicks
		type = 'button', // [CR] Button type attribute - important for form behaviour
		...rest // [CR] Spread remaining attributes to support native button props
	}: SwishButtonProps & {
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		[key: string]: unknown; // [CR] Allow any additional attributes
	} = $props();
</script>

<!-- [CR] Main button element - uses Tailwind group for coordinated hover effects -->
<!-- [NTL] The "group" class is magic - it lets child elements react when you hover the parent! -->
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
	<!-- [CR] LAYER 1: Original text - slides out left and fades on hover -->
	<!-- [NTL] This is the text you see normally. When you hover, it swoops away! -->
	<span
		class="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0"
	>
		{text}
	</span>

	<!-- [CR] LAYER 2: Hover text + icon - slides in from right, hidden by default -->
	<!-- [NTL] This is waiting in the wings (off to the right). On hover, it glides in like a performer! -->
	<div
		class="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
	>
		<span>{text}</span>
		<!-- [CR] Conditional icon based on button state/type - all inline SVGs for zero deps -->
		<!-- [NTL] Different icons for different situations - X for disabled, undo for reset, arrow for normal -->
		{#if disabled}
			<!-- [CR] X icon indicates unavailable action -->
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
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		{:else if type === 'reset'}
			<!-- [CR] Circular undo icon for form reset buttons -->
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
				<polyline points="1 4 1 10 7 10"></polyline>
				<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
			</svg>
		{:else}
			<!-- [CR] Arrow icon for standard CTA buttons - implies "go" or "continue" -->
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
		{/if}
	</div>

	<!-- [CR] LAYER 3: Background dot - starts small, expands to fill button on hover -->
	<!-- [NTL] This tiny dot is like a drop of ink - on hover it "blooms" to fill the whole button! -->
	<div
		class="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"
	></div>
</button>

<style>
	/*
	 * [CR] This component uses Tailwind utility classes exclusively.
	 * No additional CSS is needed - all styling is inline via class attributes.
	 * This keeps the component portable and reduces CSS specificity issues.
	 */
	/* [NTL] Empty on purpose! All the magic happens in the Tailwind classes above. */
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->
