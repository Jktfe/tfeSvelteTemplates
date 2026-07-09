<!--
	============================================================
	ExpandingCard - Interactive Layout Transition Card
	============================================================

	[CR] WHAT IT DOES
	Card component with two distinct layouts (compact/expanded) that
	seamlessly transitions between them using CSS transitions.
	Clicking anywhere on the card toggles the layout state.

	[NTL] THE SIMPLE VERSION
	It's like a business card that can unfold! Click it once to see
	more details, click again to fold it back up. The magic is in how
	smoothly the card reshapes via CSS transitions.

	============================================================

	FEATURES:
	- Smooth CSS transitions between layouts
	- Compact: Vertical layout (image top, text below)
	- Expanded: Horizontal layout (image left, text right)
	- Click anywhere to toggle
	- Single DOM element — no snap/recreate on toggle
	- Responsive design with mobile optimisations
	- Accessible with keyboard and ARIA labels

	PERFECT FOR:
	- Team member profiles / bios
	- Feature showcases with expandable details
	- Product highlights
	- Portfolio items
	- FAQ sections with visual emphasis

	DEPENDENCIES:
	- $lib/types (ExpandingCardProps)
	- Scoped CSS transitions for smooth layout changes

	ACCESSIBILITY:
	- Full button semantics (clickable, focusable)
	- ARIA labels indicating action (Expand/Collapse)
	- Keyboard accessible (Enter/Space to toggle)

	WARNINGS:
	- None expected

	============================================================
-->

<script lang="ts">
	import type { ExpandingCardProps } from '$lib/types';

	let {
		imageSrc = 'https://i.pinimg.com/564x/b3/7c/fa/b37cfa52ac8e142ffe42772712f6e33d.jpg',
		imageAlt = 'Card Image',
		heading = 'Card Title',
		compactText = 'Hello Devs, welcome to our Website',
		expandedText = 'Yoo devs, How you doing?',
		bgColor = 'bg-lime-100'
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

	let layout: 'compact' | 'expanded' = $state('compact');

	// Single button with CSS transitions — no DOM destruction on toggle.
	function toggleLayout() {
		layout = layout === 'compact' ? 'expanded' : 'compact';
	}
</script>

<div class="expanding-card-shell">
	<!-- Single button: layout class toggles, CSS transitions handle the rest -->
	<button
		type="button"
		onclick={toggleLayout}
		class="{bgColor} layouta expanding-card {layout === 'compact' ? 'expanding-card--compact' : 'expanding-card--expanded'} cursor-pointer overflow-hidden rounded-3xl"
		aria-label={layout === 'compact' ? 'Expand card' : 'Collapse card'}
		aria-expanded={layout === 'expanded'}
		style="--ec-bg: {cardBackground};"
	>
		<div class="imgTag expanding-card__media">
			<img src={imageSrc} alt={imageAlt} />
		</div>

		<div class="expanding-card__copy {layout === 'compact' ? 'expanding-card__copy--compact' : 'expanding-card__copy--expanded'}">
			<h1 class="heading">{heading}</h1>
			<p class="para">{layout === 'compact' ? compactText : expandedText}</p>
		</div>
	</button>
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
		align-items: center;
		transition:
			width 350ms cubic-bezier(0.22, 1, 0.36, 1),
			gap 350ms cubic-bezier(0.22, 1, 0.36, 1),
			padding 350ms cubic-bezier(0.22, 1, 0.36, 1),
			grid-template-columns 350ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.expanding-card--compact {
		width: min(100%, 17.5rem);
		gap: 0.9rem;
		padding: 1rem;
		grid-template-columns: 1fr;
	}

	.expanding-card--expanded {
		width: min(100%, 40rem);
		grid-template-columns: minmax(8.5rem, 13rem) minmax(0, 1fr);
		gap: clamp(0.85rem, 2vw, 1.35rem);
		padding: clamp(0.85rem, 2.5vw, 1.15rem);
	}

	.imgTag {
		overflow: hidden;
		border-radius: 1rem;
		width: 100%;
		height: 12rem;
		background: rgba(255, 255, 255, 0.35);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.65) inset,
			0 18px 32px -26px rgba(15, 23, 42, 0.6);
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
			height: 10rem;
		}
	}
</style>

<!-- [CR] Component reviewed and documented. Gold Standard Pipeline: Steps 1-8 complete. -->

