<!--
	============================================================
	Typewriter Component - Animated Text Typing Effect
	============================================================

	🎯 WHAT IT DOES
	Progressively reveals text character-by-character with a blinking cursor,
	cycling through multiple phrases with a delete-then-retype transition.
	Perfect for hero sections, landing pages, and attention-grabbing headings.

	✨ FEATURES
	• Character-by-character typing animation with configurable speed
	• Blinking cursor with pure CSS animation
	• Cycles through an array of strings with delete-then-retype
	• Loop or stop-after-one-pass modes
	• Configurable type speed, delete speed, and pause duration
	• Start delay option

	♿ ACCESSIBILITY
	• Screen readers: aria-label shows the full current phrase (not partial text)
	• Motion: Respects prefers-reduced-motion (shows full text instantly)
	• Semantic: Uses one labelled wrapper with animated text hidden from assistive tech

	📦 DEPENDENCIES
	Zero external dependencies — $effect-based interval management + CSS cursor

	⚡ PERFORMANCE
	• Single $effect manages the entire animation state machine
	• No requestAnimationFrame or external timer libraries
	• Minimal DOM: one span for text, one for cursor

	🎨 USAGE
	<Typewriter phrases={['Hello World', 'Welcome Home', 'Start Building']} />

	📋 PROPS
	| Prop          | Type     | Default | Description                          |
	|---------------|----------|---------|--------------------------------------|
	| phrases       | string[] | required| Strings to cycle through             |
	| typeSpeed     | number   | 80      | Ms per character typing              |
	| deleteSpeed   | number   | 50      | Ms per character deleting            |
	| pauseDuration | number   | 2000    | Ms pause after typing a phrase       |
	| loop          | boolean  | true    | Loop or stop after one pass          |
	| showCursor    | boolean  | true    | Show blinking cursor                 |
	| cursorChar    | string   | '|'     | Cursor character                     |
	| startDelay    | number   | 0       | Ms delay before starting             |
	| class         | string   | ''      | Additional CSS classes               |

	============================================================
-->
<script lang="ts">
	import type { TypewriterProps } from '$lib/types';

	let {
		phrases,
		typeSpeed = 80,
		deleteSpeed = 50,
		pauseDuration = 2000,
		loop = true,
		showCursor = true,
		cursorChar = '|',
		startDelay = 0,
		class: className = ''
	}: TypewriterProps = $props();

	// -- Animation state machine --
	// The typewriter cycles through 4 phases:
	//   1. 'typing'   — adding characters one at a time
	//   2. 'pausing'  — holding the complete phrase for a moment
	//   3. 'deleting' — removing characters one at a time
	//   4. 'waiting'  — brief pause before starting the next phrase
	type Phase = 'typing' | 'pausing' | 'deleting' | 'waiting';

	let displayText = $state('');
	let phraseIndex = $state(0);
	let charIndex = $state(0);
	let phase = $state<Phase>('typing');
	let shouldDelay = $derived(startDelay > 0);
	let started = $state(false);

	// Initialize started based on startDelay
	$effect(() => {
		if (!shouldDelay) started = true;
	});

	// The full current phrase for screen readers
	let currentPhrase = $derived(phrases[phraseIndex] ?? '');

	// Handle start delay
	$effect(() => {
		if (startDelay > 0 && !started) {
			const timer = setTimeout(() => { started = true; }, startDelay);
			return () => clearTimeout(timer);
		}
	});

	// Check reduced motion preference
	let prefersReducedMotion = $state(false);
	$effect(() => {
		if (typeof window !== 'undefined') {
			prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		}
	});

	// Main animation loop — a single $effect that drives the state machine.
	// Each phase sets a timeout for the next step, and the cleanup function
	// cancels it if the component unmounts or dependencies change.
	$effect(() => {
		if (!started || phrases.length === 0) return;

		// For reduced motion: just show the full phrase, no animation
		if (prefersReducedMotion) {
			displayText = currentPhrase;
			return;
		}

		let timer: ReturnType<typeof setTimeout>;

		switch (phase) {
			case 'typing': {
				if (charIndex < currentPhrase.length) {
					timer = setTimeout(() => {
						charIndex++;
						displayText = currentPhrase.slice(0, charIndex);
					}, typeSpeed);
				} else {
					// Finished typing — pause before deleting
					if (!loop && phraseIndex === phrases.length - 1) {
						// Last phrase in non-loop mode: stay put
						return;
					}
					timer = setTimeout(() => { phase = 'pausing'; }, pauseDuration);
				}
				break;
			}
			case 'pausing': {
				timer = setTimeout(() => { phase = 'deleting'; }, 0);
				break;
			}
			case 'deleting': {
				if (charIndex > 0) {
					timer = setTimeout(() => {
						charIndex--;
						displayText = currentPhrase.slice(0, charIndex);
					}, deleteSpeed);
				} else {
					// Finished deleting — move to next phrase
					timer = setTimeout(() => { phase = 'waiting'; }, 200);
				}
				break;
			}
			case 'waiting': {
				const nextIndex = (phraseIndex + 1) % phrases.length;
				timer = setTimeout(() => {
					phraseIndex = nextIndex;
					charIndex = 0;
					displayText = '';
					phase = 'typing';
				}, 0);
				break;
			}
		}

		return () => clearTimeout(timer);
	});
</script>

<span
	class="typewriter {className}"
	aria-label={currentPhrase}
>
	<span class="typewriter-text" aria-hidden="true">{displayText}</span>{#if showCursor}<span
		class="typewriter-cursor"
		aria-hidden="true"
	>{cursorChar}</span>{/if}
</span>

<style>
	.typewriter {
		display: inline;
	}

	.typewriter-text {
		/* Ensure consistent layout even when text is empty */
		white-space: pre-wrap;
	}

	.typewriter-cursor {
		display: inline;
		animation: blink 1s step-end infinite;
		font-weight: 100;
		opacity: 1;
		margin-left: 1px;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	/* Reduced motion: no blinking cursor, just show static text */
	@media (prefers-reduced-motion: reduce) {
		.typewriter-cursor {
			animation: none;
			opacity: 1;
		}
	}
</style>
