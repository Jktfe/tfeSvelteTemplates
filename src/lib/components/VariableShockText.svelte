<script lang="ts" module>
	export interface ShockGlyph {
		id: string;
		value: string;
		isSpace: boolean;
	}

	export function splitTextForShock(text: string): ShockGlyph[] {
		return Array.from(text).map((value, index) => ({
			id: `${value}-${index}`,
			value,
			isSpace: value.trim().length === 0
		}));
	}

	export function distanceFromOrigin(index: number, origin: number): number {
		return Math.abs(index - origin);
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion, type Gsap } from '$lib/gsapMotion';

	interface Props {
		text: string;
		class?: string;
		ariaLabel?: string;
		idle?: boolean;
		intensity?: number;
	}

	let {
		text,
		class: className = '',
		ariaLabel = text,
		idle = true,
		intensity = 1
	}: Props = $props();

	let root: HTMLButtonElement | null = null;
	let gsapInstance: Gsap | null = null;
	let idleTween: ReturnType<Gsap['to']> | null = null;
	const glyphs = $derived(splitTextForShock(text));

	function getGlyphNodes() {
		return root ? Array.from(root.querySelectorAll<HTMLElement>('[data-shock-char]')) : [];
	}

	function startIdleMotion() {
		if (!gsapInstance || prefersReducedMotion() || !idle) return;
		const chars = getGlyphNodes();
		if (chars.length === 0) return;

		idleTween = gsapInstance.to(chars, {
			'--shock-wght': 720,
			y: -2,
			duration: 1.35,
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut',
			stagger: { each: 0.035, from: 'center' }
		});
	}

	function triggerShock(origin = Math.floor(glyphs.length / 2)) {
		if (!gsapInstance || prefersReducedMotion()) return;
		const chars = getGlyphNodes();
		if (chars.length === 0) return;

		idleTween?.pause();
		gsapInstance.killTweensOf(chars);

		const safeIntensity = Math.max(0.25, Math.min(2.5, intensity));
		gsapInstance
			.timeline({
				onComplete: () => {
					idleTween = null;
					startIdleMotion();
				}
			})
			.to(chars, {
				'--shock-wght': 900,
				'--shock-wdth': 122,
				y: (index) => -Math.max(4, 18 - distanceFromOrigin(index, origin) * 2) * safeIntensity,
				rotation: (index) => (index < origin ? -1 : 1) * Math.max(2, 10 - distanceFromOrigin(index, origin)),
				duration: 0.22,
				ease: 'power2.out',
				stagger: { each: 0.018, from: origin }
			})
			.to(chars, {
				'--shock-wght': 520,
				'--shock-wdth': 100,
				y: 0,
				rotation: 0,
				duration: 0.7,
				ease: 'elastic.out(1, 0.45)',
				stagger: { each: 0.014, from: origin }
			});
	}

	function handlePointer(event: PointerEvent) {
		const chars = getGlyphNodes();
		const origin = chars.findIndex((char) => char === event.target);
		triggerShock(origin >= 0 ? origin : Math.floor(chars.length / 2));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		triggerShock();
	}

	onMount(() => {
		let cancelled = false;

		void (async () => {
			const gsap = await loadGsap();
			if (cancelled) return;
			gsapInstance = gsap;
			startIdleMotion();
		})();

		return () => {
			cancelled = true;
			idleTween?.kill();
			const chars = getGlyphNodes();
			gsapInstance?.killTweensOf(chars);
		};
	});
</script>

<button
	bind:this={root}
	type="button"
	class={`variable-shock-text ${className}`}
	aria-label={ariaLabel}
	onpointerdown={handlePointer}
	onkeydown={handleKeydown}
>
	{#each glyphs as glyph, index (glyph.id)}
		<span
			data-shock-char
			class:space={glyph.isSpace}
			style="--shock-index: {index};"
			aria-hidden="true"
		>
			{glyph.isSpace ? '\u00a0' : glyph.value}
		</span>
	{/each}
</button>

<style>
	.variable-shock-text {
		--shock-wght: 520;
		--shock-wdth: 100;
		display: inline-flex;
		max-width: 100%;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.01em;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-variation-settings:
			'wght' var(--shock-wght),
			'wdth' var(--shock-wdth);
		line-height: inherit;
		overflow-wrap: anywhere;
		cursor: pointer;
	}

	.variable-shock-text span {
		display: inline-block;
		max-width: 100%;
		transform-origin: 50% 80%;
		will-change: transform, font-variation-settings;
	}

	.variable-shock-text .space {
		width: 0.32em;
	}

	.variable-shock-text:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 0.2em;
		border-radius: 0.2em;
	}

	@media (prefers-reduced-motion: reduce) {
		.variable-shock-text span {
			transform: none !important;
		}
	}
</style>
