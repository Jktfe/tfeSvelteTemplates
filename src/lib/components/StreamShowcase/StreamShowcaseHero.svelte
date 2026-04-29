<!--
	StreamShowcaseHero — top half of the showcase section.

	Renders the small "Now browsing" eyebrow pill above a two-line
	brush-script title. The title is split per-letter into <span>s so
	we can stagger their entrance (opacity + translateY + rotate)
	while the underlying DOM remains a real <h1> for screen readers.

	Reduced-motion: the entrance is skipped — letters render in place
	at full opacity, no transform.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		eyebrow?: string;
		topLine?: string;
		bottomLine?: string;
		/** When true, skips the staggered entrance (used for reduced-motion). */
		instant?: boolean;
	}

	let {
		eyebrow = 'Now browsing',
		topLine = 'Queue up.',
		bottomLine = 'Level up.',
		instant = false
	}: Props = $props();

	let mounted = $state(false);
	let prefersReducedMotion = $state(false);

	const showInstant = $derived(instant || prefersReducedMotion);

	const topLetters = $derived([...topLine]);
	const bottomLetters = $derived([...bottomLine]);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const onMq = () => (prefersReducedMotion = mq.matches);
		mq.addEventListener('change', onMq);
		// Trigger the entrance one frame after mount so the from-state
		// gets a chance to paint before transitioning to the to-state.
		requestAnimationFrame(() => {
			mounted = true;
		});
		return () => mq.removeEventListener('change', onMq);
	});

	function letterDelay(i: number, base = 0): string {
		return `${(base + i * 30).toString()}ms`;
	}
</script>

<header class="ssh-hero" class:ssh-instant={showInstant} class:ssh-mounted={mounted}>
	<span class="ssh-eyebrow" aria-hidden="true">
		<span class="ssh-eyebrow-dot"></span>
		{eyebrow}
	</span>

	<h1 class="ssh-title">
		<span class="ssh-line" aria-hidden="true">
			{#each topLetters as ch, i (i)}
				<span
					class="ssh-letter"
					class:ssh-space={ch === ' '}
					style="--ssh-delay: {letterDelay(i, 200)}"
				>{ch === ' ' ? '\u00A0' : ch}</span>
			{/each}
		</span>
		<span class="ssh-line ssh-line-bottom" aria-hidden="true">
			{#each bottomLetters as ch, i (i)}
				<span
					class="ssh-letter"
					class:ssh-space={ch === ' '}
					style="--ssh-delay: {letterDelay(i, 200 + topLetters.length * 30 + 60)}"
				>{ch === ' ' ? '\u00A0' : ch}</span>
			{/each}
		</span>
		<span class="ssh-sr-only">{topLine} {bottomLine}</span>
	</h1>
</header>

<style>
	.ssh-hero {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 1.25rem;
		padding: 3rem 1.5rem 2rem;
		text-align: center;
		min-height: 50vh;
		color: inherit;
	}

	.ssh-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.95rem;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		color: color-mix(in srgb, currentColor 75%, transparent);
		background: color-mix(in srgb, currentColor 6%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 9999px;
		font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
		opacity: 0;
		transform: translateY(8px);
		transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: 80ms;
	}
	.ssh-mounted .ssh-eyebrow,
	.ssh-instant .ssh-eyebrow {
		opacity: 1;
		transform: translateY(0);
	}

	.ssh-eyebrow-dot {
		display: inline-block;
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background: currentColor;
		opacity: 0.6;
		animation: ssh-dot-pulse 2.4s ease-in-out infinite;
	}
	.ssh-instant .ssh-eyebrow-dot {
		animation: none;
	}
	@keyframes ssh-dot-pulse {
		0%, 100% { opacity: 0.4; transform: scale(0.85); }
		50% { opacity: 0.85; transform: scale(1.1); }
	}
	.ssh-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		margin: 0;
		font-family: 'Caveat Brush', 'Caveat', 'Brush Script MT', 'Lucida Handwriting', cursive;
		font-weight: 400;
		font-size: clamp(3rem, 11vw, 8rem);
		line-height: 0.95;
		letter-spacing: -0.01em;
	}

	.ssh-line {
		display: inline-flex;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 100%;
	}
	.ssh-line-bottom {
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.ssh-letter {
		display: inline-block;
		opacity: 0;
		filter: blur(12px);
		transform: translateY(28px) rotate(-4deg);
		transition: opacity 0.85s cubic-bezier(0.34, 1.56, 0.64, 1),
			filter 0.85s cubic-bezier(0.22, 1, 0.36, 1),
			transform 0.95s cubic-bezier(0.34, 1.56, 0.64, 1);
		transition-delay: var(--ssh-delay, 0ms);
	}
	.ssh-mounted .ssh-letter {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0) rotate(0);
	}
	.ssh-space {
		min-width: 0.3em;
	}

	.ssh-instant .ssh-letter {
		opacity: 1;
		filter: blur(0);
		transform: none;
		transition: none;
	}

	.ssh-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.ssh-letter {
			transition: none !important;
			opacity: 1 !important;
			filter: blur(0) !important;
			transform: none !important;
		}
		.ssh-eyebrow-dot {
			animation: none !important;
		}
	}
</style>
