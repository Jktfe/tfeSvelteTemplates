<!--
	============================================================
	GsapRevealSequence - Scoped Staggered Reveal Primitive
	============================================================

	[CR] WHAT IT DOES
	Runs a scoped GSAP reveal animation over selected child elements, with
	configurable axis, distance, delay, stagger, duration, and easing.

	[NTL] THE SIMPLE VERSION
	Drop content inside this wrapper and its children can fade and slide in
	one after another without writing a new animation each time.

	============================================================

	FEATURES:
	- Selector-based targeting with child fallback
	- X or Y reveal direction
	- Configurable distance, delay, stagger, duration, and ease
	- Scoped GSAP context cleanup on unmount
	- Reduced-motion support
	- Exported helper functions for tests

	PERFECT FOR:
	- Hero copy and control rows
	- Component demo sections
	- Lists where a subtle sequence improves scan rhythm

	NOT IDEAL FOR:
	- Long virtualized lists
	- Layout-changing choreography that needs Flip instead

	DEPENDENCIES:
	- gsap via $lib/gsapMotion
	- Svelte snippet children

	ACCESSIBILITY:
	- Content remains normal DOM content
	- Reduced-motion users receive the final visible state immediately

	WARNINGS:
	- Keep selectors scoped to children inside the component root.

	============================================================
-->

<script lang="ts" module>
	export type RevealAxis = 'x' | 'y';

	export function resolveRevealTargets(root: HTMLElement, selector: string): HTMLElement[] {
		const selected = Array.from(root.querySelectorAll<HTMLElement>(selector));
		if (selected.length > 0) return selected;
		return Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
	}

	export function revealOffset(axis: RevealAxis, distance: number) {
		const amount = Number.isFinite(distance) ? distance : 0;
		return axis === 'x' ? { x: amount, y: 0 } : { x: 0, y: amount };
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { loadGsap, prefersReducedMotion } from '$lib/gsapMotion';

	interface Props {
		children?: Snippet;
		class?: string;
		selector?: string;
		axis?: RevealAxis;
		distance?: number;
		duration?: number;
		delay?: number;
		stagger?: number;
		ease?: string;
	}

	let {
		children,
		class: className = '',
		selector = '[data-gsap-item]',
		axis = 'y',
		distance = 28,
		duration = 0.7,
		delay = 0,
		stagger = 0.08,
		ease = 'power3.out'
	}: Props = $props();

	let root: HTMLDivElement | null = null;

	onMount(() => {
		let cancelled = false;
		let cleanup: (() => void) | null = null;

		void (async () => {
			if (!root) return;
			const gsap = await loadGsap();
			if (cancelled || !root) return;

			const targets = resolveRevealTargets(root, selector);
			if (targets.length === 0) return;

			if (prefersReducedMotion()) {
				gsap.set(targets, { opacity: 1, x: 0, y: 0, clearProps: 'transform,opacity' });
				return;
			}

			const offset = revealOffset(axis, distance);
			const context = gsap.context(() => {
				gsap.fromTo(
					targets,
					{ autoAlpha: 0, ...offset },
					{
						autoAlpha: 1,
						x: 0,
						y: 0,
						delay,
						duration,
						stagger,
						ease,
						clearProps: 'transform,opacity,visibility'
					}
				);
			}, root);

			cleanup = () => context.revert();
		})();

		return () => {
			cancelled = true;
			cleanup?.();
		};
	});
</script>

<div bind:this={root} class={`gsap-reveal-sequence ${className}`}>
	{@render children?.()}
</div>

<style>
	.gsap-reveal-sequence {
		display: contents;
	}
</style>
