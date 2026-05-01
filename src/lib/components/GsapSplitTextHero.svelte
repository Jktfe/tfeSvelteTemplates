<!--
	============================================================
	GsapSplitTextHero - Interactive SplitText Hero Component
	============================================================

	[CR] WHAT IT DOES
	Uses GSAP SplitText to animate a hero headline by characters, words, or
	lines, then exposes mode controls as a reusable Svelte demo primitive.

	[NTL] THE SIMPLE VERSION
	This is the flashy headline block: visitors can choose whether the title
	animates by letters, words, or lines.

	============================================================

	FEATURES:
	- Character, word, and line animation modes
	- SplitText auto-split configuration helpers
	- Light and dark art-directed themes
	- Replay on mode change
	- SSR-safe dynamic plugin loading
	- Reduced-motion support

	PERFECT FOR:
	- GSAP suite hero sections
	- Landing-page headline demos
	- Showing agents how to wire SplitText in Svelte 5

	NOT IDEAL FOR:
	- Long body copy
	- Static documentation headings that should not reflow

	DEPENDENCIES:
	- gsap
	- gsap/SplitText
	- $lib/gsapMotion for SSR-safe loading and reduced-motion helpers

	ACCESSIBILITY:
	- Headline remains an h2 element
	- Controls are native buttons with aria-pressed state
	- Reduced-motion users receive the final text state without animation

	WARNINGS:
	- SplitText mutates the headline DOM while active, so always revert old
	  splits before creating a new one.

	============================================================
-->

<script lang="ts" module>
	export type SplitTextMode = 'chars' | 'words' | 'lines';
	export type SplitTextHeroTheme = 'light' | 'dark';

	export interface SplitTextModeOption {
		id: SplitTextMode;
		label: string;
	}

	export interface SplitTextModeConfig {
		type: string;
		target: SplitTextMode;
		autoSplit: boolean;
		mask?: SplitTextMode;
	}

	export const splitTextModeOptions: SplitTextModeOption[] = [
		{ id: 'chars', label: 'Characters' },
		{ id: 'words', label: 'Words' },
		{ id: 'lines', label: 'Lines' }
	];

	export function normalizeSplitTextMode(value: string): SplitTextMode {
		return splitTextModeOptions.some((option) => option.id === value)
			? (value as SplitTextMode)
			: 'chars';
	}

	export function splitTextModeConfig(mode: SplitTextMode): SplitTextModeConfig {
		if (mode === 'words') {
			return { type: 'words', target: 'words', autoSplit: false };
		}

		if (mode === 'lines') {
			return { type: 'lines,words', target: 'lines', autoSplit: true, mask: 'lines' };
		}

		return { type: 'chars,words', target: 'chars', autoSplit: false };
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { loadGsap, prefersReducedMotion, type Gsap } from '$lib/gsapMotion';
	import type { SplitText as SplitTextPlugin } from 'gsap/SplitText';

	type SplitTextInstance = InstanceType<typeof SplitTextPlugin>;
	type SplitTextAnimation = ReturnType<Gsap['from']> | ReturnType<Gsap['timeline']>;

	interface Props {
		headline?: string;
		eyebrow?: string;
		copy?: string;
		initialMode?: SplitTextMode;
		theme?: SplitTextHeroTheme;
		class?: string;
	}

	let {
		headline = 'Motion primitives with manners',
		eyebrow = 'GSAP suite',
		copy = 'SplitText, scoped timelines, canvas motion, and deck choreography packaged as reusable Svelte components.',
		initialMode = 'chars',
		theme = 'light',
		class: className = ''
	}: Props = $props();

	let root: HTMLElement | null = null;
	let headlineElement: HTMLHeadingElement | null = null;
	let gsapInstance: Gsap | null = null;
	let SplitText: typeof SplitTextPlugin | null = null;
	let split: SplitTextInstance | null = null;
	let animation: SplitTextAnimation | null = null;
	// svelte-ignore state_referenced_locally
	let selectedMode = $state<SplitTextMode>(normalizeSplitTextMode(initialMode));

	function splitTargets(currentSplit: SplitTextInstance, mode: SplitTextMode): Element[] {
		const target = splitTextModeConfig(mode).target;
		if (target === 'words') return [...currentSplit.words];
		if (target === 'lines') return [...currentSplit.lines];
		return [...currentSplit.chars];
	}

	function resetSplit() {
		animation?.kill();
		animation = null;
		split?.revert();
		split = null;
	}

	function animateTargets(targets: Element[], mode: SplitTextMode): SplitTextAnimation | null {
		if (!gsapInstance || targets.length === 0) return null;

		if (mode === 'words') {
			return gsapInstance.from(targets, {
				y: -92,
				autoAlpha: 0,
				rotation: 'random(-18, 18)',
				duration: 0.78,
				ease: 'back.out(1.6)',
				stagger: 0.11
			});
		}

		if (mode === 'lines') {
			return gsapInstance.from(targets, {
				rotationX: -92,
				yPercent: 24,
				transformOrigin: '50% 50% -160px',
				autoAlpha: 0,
				duration: 0.86,
				ease: 'power3.out',
				stagger: 0.18
			});
		}

		return gsapInstance.from(targets, {
			x: 120,
			y: 'random(-10, 10)',
			autoAlpha: 0,
			duration: 0.72,
			ease: 'power4.out',
			stagger: 0.027
		});
	}

	function runMode(mode: SplitTextMode) {
		if (!headlineElement || !gsapInstance || !SplitText) return;
		resetSplit();

		if (prefersReducedMotion()) {
			gsapInstance.set(headlineElement, { clearProps: 'all', autoAlpha: 1 });
			return;
		}

		const config = splitTextModeConfig(mode);
		split = SplitText.create(headlineElement, {
			type: config.type,
			tag: 'span',
			aria: 'auto',
			autoSplit: config.autoSplit,
			mask: config.mask,
			charsClass: 'gsap-split-char++',
			wordsClass: 'gsap-split-word++',
			linesClass: 'gsap-split-line++',
			onSplit: (currentSplit) => {
				const tween = animateTargets(splitTargets(currentSplit, mode), mode);
				if (tween) animation = tween;
				return tween;
			}
		});
	}

	function selectMode(mode: SplitTextMode) {
		selectedMode = mode;
		runMode(mode);
	}

	onMount(() => {
		let cancelled = false;

		void (async () => {
			const [gsap, splitTextModule] = await Promise.all([loadGsap(), import('gsap/SplitText')]);
			if (cancelled) return;

			gsap.registerPlugin(splitTextModule.SplitText);
			gsapInstance = gsap;
			SplitText = splitTextModule.SplitText;

			await document.fonts?.ready?.catch(() => undefined);
			if (!cancelled) runMode(selectedMode);
		})();

		return () => {
			cancelled = true;
			resetSplit();
		};
	});
</script>

<section
	bind:this={root}
	class={`split-text-hero ${className}`}
	class:is-dark={theme === 'dark'}
	aria-labelledby="gsap-suite-title"
>
	<div class="hero-copy">
		<p class="eyebrow">{eyebrow}</p>
		<h1 id="gsap-suite-title" bind:this={headlineElement} class="headline">{headline}</h1>
		<p class="lede">{copy}</p>
	</div>

	<div class="mode-switch" aria-label="SplitText animation mode">
		{#each splitTextModeOptions as option (option.id)}
			<button
				type="button"
				class:is-active={selectedMode === option.id}
				aria-pressed={selectedMode === option.id}
				onclick={() => selectMode(option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>
</section>

<style>
	.split-text-hero {
		--split-surface: #fffdf8;
		--split-surface-end: #f0fdfa;
		--split-grid-line: rgba(15, 23, 42, 0.06);
		--split-border: rgba(15, 23, 42, 0.14);
		--split-fg: #111827;
		--split-muted: #475569;
		--split-eyebrow: #0f766e;
		--split-control-bg: rgba(255, 255, 255, 0.82);
		--split-control-bg-active: #111827;
		--split-control-border: rgba(15, 23, 42, 0.18);
		--split-control-fg: #1f2937;
		--split-control-active-fg: #f8fafc;
		position: relative;
		isolation: isolate;
		width: min(1120px, 100%);
		margin: 0 auto;
		padding: clamp(2.5rem, 7vw, 6.5rem) clamp(1rem, 4vw, 3rem);
		overflow: hidden;
		border: 1px solid var(--split-border);
		border-radius: 8px;
		background:
			linear-gradient(135deg, var(--split-surface), var(--split-surface-end)),
			repeating-linear-gradient(
				90deg,
				var(--split-grid-line) 0,
				var(--split-grid-line) 1px,
				transparent 1px,
				transparent 72px
			);
		color: var(--split-fg);
		box-shadow: 0 28px 80px rgba(15, 23, 42, 0.22);
		text-align: center;
	}

	.split-text-hero.is-dark {
		--split-surface: rgba(13, 17, 23, 0.98);
		--split-surface-end: rgba(24, 31, 42, 0.98);
		--split-grid-line: rgba(255, 255, 255, 0.04);
		--split-border: rgba(255, 255, 255, 0.12);
		--split-fg: #f8fafc;
		--split-muted: #cbd5e1;
		--split-eyebrow: #5eead4;
		--split-control-bg: rgba(15, 23, 42, 0.7);
		--split-control-bg-active: #f8fafc;
		--split-control-border: rgba(203, 213, 225, 0.26);
		--split-control-fg: #e2e8f0;
		--split-control-active-fg: #111827;
	}

	.split-text-hero::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(90deg, rgba(45, 212, 191, 0.16), transparent 31%),
			linear-gradient(270deg, rgba(251, 191, 36, 0.14), transparent 32%),
			linear-gradient(180deg, transparent 48%, rgba(244, 114, 182, 0.16));
	}

	.hero-copy {
		display: grid;
		justify-items: center;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0;
		color: var(--split-eyebrow);
		font-size: 0.78rem;
		font-weight: 850;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.headline {
		width: min(960px, 100%);
		margin: 0 auto;
		color: var(--split-fg);
		font-size: clamp(2.35rem, 8vw, 6.6rem);
		font-weight: 900;
		letter-spacing: 0;
		line-height: 0.94;
		overflow-wrap: anywhere;
		perspective: 600px;
		text-wrap: balance;
	}

	.lede {
		width: min(730px, 100%);
		margin: 0;
		color: var(--split-muted);
		font-size: clamp(1.02rem, 2vw, 1.25rem);
		line-height: 1.6;
		text-wrap: balance;
	}

	.mode-switch {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.65rem;
		margin-top: 2rem;
	}

	.mode-switch button {
		min-width: 8.6rem;
		min-height: 2.75rem;
		padding: 0.72rem 1.1rem;
		border: 1px solid var(--split-control-border);
		border-radius: 8px;
		background: var(--split-control-bg);
		color: var(--split-control-fg);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 800;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease;
	}

	.mode-switch button:hover,
	.mode-switch button:focus-visible {
		border-color: #5eead4;
		color: #ffffff;
		outline: none;
		transform: translateY(-1px);
	}

	.mode-switch button.is-active {
		border-color: transparent;
		background: var(--split-control-bg-active);
		color: var(--split-control-active-fg);
	}

	:global(.gsap-split-char),
	:global(.gsap-split-word),
	:global(.gsap-split-line) {
		display: inline-block;
		will-change: transform, opacity;
	}

	:global(.gsap-split-line) {
		display: block;
	}

	@media (prefers-reduced-motion: reduce) {
		.mode-switch button {
			transition: none;
		}

		.mode-switch button:hover,
		.mode-switch button:focus-visible {
			transform: none;
		}
	}

	@media (max-width: 760px) {
		.split-text-hero {
			padding: 2.25rem 1rem;
		}

		.headline {
			font-size: clamp(2.25rem, 14vw, 4.25rem);
			line-height: 0.98;
		}

		.mode-switch button {
			flex: 1 1 8rem;
			min-width: 0;
		}
	}
</style>
