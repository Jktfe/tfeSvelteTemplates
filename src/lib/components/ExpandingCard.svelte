<!--
	============================================================
	ExpandingCard - Interactive Layout Transition Card
	============================================================

	[CR] WHAT IT DOES
	Card component with two distinct layouts (compact/expanded) that
	seamlessly transitions between them using Svelte's built-in crossfade.
	Clicking anywhere on the card toggles the layout state.

	[NTL] THE SIMPLE VERSION
	It's like a business card that can unfold! Click it once to see
	more details, click again to fold it back up. The magic is in how
	smoothly everything moves to its new position.

	============================================================

	FEATURES:
	- Smooth crossfade transitions between layouts
	- Compact: Vertical layout (image top, text below)
	- Expanded: Horizontal layout (image left, text right)
	- Click anywhere to toggle
	- Shared element transitions maintain visual continuity
	- Responsive design with mobile optimisations
	- Accessible with keyboard and ARIA labels

	PERFECT FOR:
	- Team member profiles / bios
	- Feature showcases with expandable details
	- Product highlights
	- Portfolio items
	- FAQ sections with visual emphasis

	DEPENDENCIES:
	- svelte/transition (crossfade) - built into Svelte
	- $lib/types (ExpandingCardProps)
	- Scoped CSS for responsive sizing and theme-safe backgrounds

	ACCESSIBILITY:
	- Full button semantics (clickable, focusable)
	- ARIA labels indicating action (Expand/Collapse)
	- Keyboard accessible (Enter/Space to toggle)

	WARNINGS:
	- None expected

	============================================================
-->

<script lang="ts">
	// [CR] Svelte's built-in crossfade creates shared element transitions between layouts
	// [NTL] This is what makes elements "fly" from their old position to their new one!
	import { crossfade } from 'svelte/transition';
	import type { ExpandingCardProps } from '$lib/types';

	// [CR] Props with sensible defaults - each controls a visual aspect of the card
	// [NTL] These are all the things you can customise when using this card
	let {
		imageSrc = 'https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg', // [NTL] The picture shown on the card
		imageAlt = 'Card Image',                                                             // [NTL] Description for screen readers
		heading = 'Card Title',                                                              // [NTL] The big bold title
		compactText = 'Hello Devs, welcome to our Website',                                  // [NTL] Short text when card is small
		expandedText = 'Yoo devs, How you doing?',                                           // [NTL] Longer text when card opens up
		bgColor = 'bg-lime-100'                                                              // [NTL] TailwindCSS background colour class
	}: ExpandingCardProps = $props();

	const BG_CLASS_COLORS: Record<string, string> = {
		'bg-lime-100': '#ecfccb',
		'bg-green-100': '#dcfce7',
		'bg-orange-100': '#ffedd5',
		'bg-cyan-100': '#cffafe',
		'bg-purple-100': '#f3e8ff',
		'bg-sky-100': '#e0f2fe',
		'bg-pink-100': '#fce7f3',
		'bg-yellow-100': '#fef9c3',
		'bg-stone-100': '#f5f5f4',
		'bg-blue-200': '#bfdbfe'
	};

	const cardBackground = $derived(BG_CLASS_COLORS[bgColor] ?? BG_CLASS_COLORS['bg-lime-100']);

	// [CR] Layout state machine - simple two-state toggle
	// [NTL] This is the "open/closed" switch - compact = folded up, expanded = opened out
	let layout: 'compact' | 'expanded' = $state('compact');

	// [CR] Crossfade returns two transition functions: send (outgoing) and receive (incoming)
	// [CR] Elements with matching keys animate smoothly from old to new position
	// [NTL] Think of it like magic teleportation - the image "flies" from one spot to another!
	let [send, receive] = crossfade({
		duration: 400 // [NTL] Animation takes 400ms (0.4 seconds) - fast but smooth
	});

	// [CR] Toggle function - click handler for the entire card
	// [NTL] Flip the switch: if it's compact, expand it. If it's expanded, compact it.
	function toggleLayout() {
		layout = layout === 'compact' ? 'expanded' : 'compact';
	}
</script>

<div class="expanding-card-shell">
	{#if layout === 'compact'}
		<!-- Compact Layout: Vertical stack with image on top -->
		<button
			type="button"
			onclick={toggleLayout}
			class="{bgColor} layouta expanding-card expanding-card--compact cursor-pointer overflow-hidden rounded-3xl"
			in:receive={{ key: 'layouta' }}
			out:send={{ key: 'layouta' }}
			aria-label="Expand card"
			aria-expanded="false"
			style="--ec-bg: {cardBackground};"
		>
			<!-- Image element with crossfade -->
			<div class="imgTag expanding-card__media" in:receive={{ key: 'imgTag' }} out:send={{ key: 'imgTag' }}>
				<img src={imageSrc} alt={imageAlt} />
			</div>

			<!-- Content area -->
			<div class="expanding-card__copy expanding-card__copy--compact">
				<h1
					class="heading"
					in:receive={{ key: 'heading' }}
					out:send={{ key: 'heading' }}
				>
					{heading}
				</h1>
				<p
					class="para"
					in:receive={{ key: 'para' }}
					out:send={{ key: 'para' }}
				>
					{compactText}
				</p>
			</div>
		</button>
	{:else}
		<!-- Expanded Layout: Horizontal with image on left -->
		<button
			type="button"
			onclick={toggleLayout}
			class="{bgColor} layouta expanding-card expanding-card--expanded cursor-pointer overflow-hidden rounded-3xl"
			in:receive={{ key: 'layouta' }}
			out:send={{ key: 'layouta' }}
			aria-label="Collapse card"
			aria-expanded="true"
			style="--ec-bg: {cardBackground};"
		>
			<!-- Image element with crossfade -->
			<div class="imgTag expanding-card__media" in:receive={{ key: 'imgTag' }} out:send={{ key: 'imgTag' }}>
				<img src={imageSrc} alt={imageAlt} />
			</div>

			<!-- Content area -->
			<div class="expanding-card__copy expanding-card__copy--expanded">
				<h1
					class="heading"
					in:receive={{ key: 'heading' }}
					out:send={{ key: 'heading' }}
				>
					{heading}
				</h1>
				<p
					class="para"
					in:receive={{ key: 'para' }}
					out:send={{ key: 'para' }}
				>
					{expandedText}
				</p>
			</div>
		</button>
	{/if}
</div>

<style>
	.expanding-card-shell {
		display: grid;
		place-items: center;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		padding: clamp(0.5rem, 2vw, 1rem);
	}

	.layouta {
		position: relative;
		border: 1px solid color-mix(in srgb, #111827 10%, transparent);
		background: var(--ec-bg, #ecfccb);
		color: #111827;
		box-shadow:
			0 24px 50px -30px rgba(15, 23, 42, 0.45),
			0 1px 0 rgba(255, 255, 255, 0.65) inset;
		outline: none;
		transition:
			transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 220ms ease,
			border-color 220ms ease;
	}

	.layouta:hover {
		transform: translateY(-2px);
		box-shadow:
			0 34px 64px -32px rgba(15, 23, 42, 0.5),
			0 1px 0 rgba(255, 255, 255, 0.7) inset;
	}

	.layouta:focus-visible {
		outline: 3px solid color-mix(in srgb, #146ef5 80%, white);
		outline-offset: 4px;
	}

	.expanding-card {
		display: grid;
		min-width: 0;
		text-align: left;
	}

	.expanding-card--compact {
		width: min(100%, 17.5rem);
		gap: 0.9rem;
		padding: 1rem;
	}

	.expanding-card--expanded {
		width: min(100%, 40rem);
		grid-template-columns: minmax(8.5rem, 13rem) minmax(0, 1fr);
		align-items: center;
		gap: clamp(0.85rem, 2vw, 1.35rem);
		padding: clamp(0.85rem, 2.5vw, 1.15rem);
	}

	.imgTag {
		overflow: hidden;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.35);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.65) inset,
			0 18px 32px -26px rgba(15, 23, 42, 0.6);
	}

	.expanding-card--compact .imgTag {
		width: 100%;
		aspect-ratio: 1;
	}

	.expanding-card--expanded .imgTag {
		width: 100%;
		aspect-ratio: 1;
	}

	.imgTag img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.expanding-card__copy {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.heading {
		margin: 0;
		font-family: var(--font-display, ui-sans-serif), system-ui, sans-serif;
		font-size: clamp(1.05rem, 2.4vw, 1.45rem);
		font-weight: 400;
		line-height: 1.05;
		letter-spacing: 0;
		text-transform: uppercase;
		color: #111827;
	}

	.para {
		margin: 0;
		max-width: 34rem;
		color: rgba(17, 24, 39, 0.72);
		font-size: clamp(0.83rem, 1.8vw, 0.95rem);
		line-height: 1.55;
		overflow-wrap: break-word;
	}

	.expanding-card__copy--compact .para {
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (max-width: 560px) {
		.expanding-card--expanded {
			width: min(100%, 19rem);
			grid-template-columns: 1fr;
		}

		.expanding-card--expanded .imgTag {
			aspect-ratio: 16 / 10;
		}
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->
<!-- Signed off: 26.12.25 -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
