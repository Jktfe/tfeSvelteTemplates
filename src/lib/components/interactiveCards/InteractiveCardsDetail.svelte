<!--
	============================================================
	InteractiveCardsDetail — detail panel (sizes, materials, cart)
	============================================================

	🎯 WHAT IT DOES
	The side (desktop) / bottom (mobile) panel that appears when a card is
	opened. Shows the medium, title, artist, price, description, size pills,
	material pills, a quantity stepper, the add-to-cart button, and the
	testimonial quote.

	The component is presentational: all state (selected project, selected
	size/material, quantity) is owned by the parent and passed down; the panel
	just fires callbacks.

	📋 PROPS
	| Prop              | Type                      | Description                            |
	|-------------------|---------------------------|----------------------------------------|
	| project           | InteractiveCardsProject   | Selected card's data                   |
	| open              | boolean                   | Visibility toggle                      |
	| selectedSize      | string                    | Currently picked size                  |
	| selectedMaterial  | string                    | Currently picked material              |
	| quantity          | number                    | Cart quantity (min 1)                  |
	| onSelectSize      | (size) => void            | Size pill clicked                      |
	| onSelectMaterial  | (material) => void        | Material pill clicked                  |
	| onQuantityChange  | (q: number) => void       | Quantity stepper changed               |
	| onAddToCart       | () => void                | Add to cart clicked                    |
	| onClose           | () => void                | Back button clicked                    |
	============================================================
-->

<script lang="ts">
	import type { InteractiveCardsProject } from '$lib/types';

	interface Props {
		project: InteractiveCardsProject | null;
		open: boolean;
		selectedSize: string;
		selectedMaterial: string;
		quantity: number;
		onSelectSize?: (size: string) => void;
		onSelectMaterial?: (material: string) => void;
		onQuantityChange?: (q: number) => void;
		onAddToCart?: () => void;
		onClose?: () => void;
	}

	let {
		project,
		open,
		selectedSize,
		selectedMaterial,
		quantity,
		onSelectSize,
		onSelectMaterial,
		onQuantityChange,
		onAddToCart,
		onClose
	}: Props = $props();
</script>

{#if project}
	<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
	<section
		class="panel"
		class:open
		data-panel
		aria-label="Print details"
		aria-hidden={!open}
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="false"
	>
		<div class="medium">{project.medium}</div>
		<h2 class="title">{project.title}</h2>
		<div class="artist">{project.artist}</div>

		<div class="price-row">
			<span class="price">{project.price}</span>
			<span class="edition">{project.edition}</span>
		</div>

		<p class="description">{project.description}</p>

		<!-- Size pills. Keyboard-navigable as a radiogroup so screen readers
		     announce the selection correctly. -->
		<fieldset class="pills" aria-label="Print size">
			<legend>Size</legend>
			<div class="pills-row" role="radiogroup">
				{#each project.sizes as size (size)}
					<button
						type="button"
						class="pill"
						role="radio"
						aria-checked={selectedSize === size}
						class:active={selectedSize === size}
						onclick={() => onSelectSize?.(size)}
					>
						{size}
					</button>
				{/each}
			</div>
		</fieldset>

		<fieldset class="pills" aria-label="Material">
			<legend>Material</legend>
			<div class="pills-row" role="radiogroup">
				{#each project.materials as material (material)}
					<button
						type="button"
						class="pill"
						role="radio"
						aria-checked={selectedMaterial === material}
						class:active={selectedMaterial === material}
						onclick={() => onSelectMaterial?.(material)}
					>
						{material}
					</button>
				{/each}
			</div>
		</fieldset>

		<!-- Quantity stepper -->
		<div class="qty-row">
			<span class="qty-label">Quantity</span>
			<div class="stepper" role="group" aria-label="Quantity">
				<button
					type="button"
					class="step"
					onclick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
					aria-label="Decrease quantity"
				>
					−
				</button>
				<span class="qty-value" aria-live="polite">{quantity}</span>
				<button
					type="button"
					class="step"
					onclick={() => onQuantityChange?.(quantity + 1)}
					aria-label="Increase quantity"
				>
					+
				</button>
			</div>
		</div>

		<!-- Paint-swatch add-to-cart button. Accent colour is set inline so
		     every painting keeps its own chromatic signature. -->
		<button
			type="button"
			class="cart-btn"
			style:background-color={project.accent}
			onclick={() => onAddToCart?.()}
		>
			Add to Cart
		</button>
		<button type="button" class="back-btn" onclick={() => onClose?.()}>Back to collection</button>

		<blockquote class="quote">
			<p>{project.testimonial}</p>
			<cite>{project.testimonialAuthor}</cite>
		</blockquote>
	</section>
{/if}

<style>
	.panel {
		position: absolute;
		top: 48%;
		left: 50%;
		transform: translate(-50%, 0);
		width: 90vw;
		max-height: 50vh;
		overflow-y: auto;
		padding: 1.5rem;
		border-radius: 16px;
		background: color-mix(in srgb, var(--background, #fff) 92%, transparent);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		color: var(--foreground, #111);
		box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.35);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.4s ease;
		z-index: 20;
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	.panel.open {
		opacity: 1;
		pointer-events: auto;
	}

	@media (min-width: 768px) {
		.panel {
			top: 50%;
			left: 52%;
			right: auto;
			transform: translateY(-50%);
			width: min(420px, 38vw);
			max-height: 78vh;
		}
	}

	.medium {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		opacity: 0.6;
	}

	.title {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: clamp(22px, 2.4vw, 36px);
		line-height: 1.08;
		margin: 0.25rem 0 0.25rem;
	}

	.artist {
		font-style: italic;
		opacity: 0.75;
		margin-bottom: 1rem;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.price {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-weight: 700;
		font-size: 22px;
	}

	.edition {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.55;
	}

	.description {
		font-size: 14px;
		line-height: 1.55;
		margin: 0 0 1rem;
	}

	.pills {
		border: none;
		padding: 0;
		margin: 0 0 0.75rem;
	}

	.pills legend {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.6;
		margin-bottom: 0.35rem;
	}

	.pills-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.pill {
		padding: 0.4rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--foreground, #111) 20%, transparent);
		border-radius: 999px;
		background: transparent;
		color: inherit;
		font-size: 12px;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.pill.active {
		background: var(--foreground, #111);
		color: var(--background, #fff);
		border-color: var(--foreground, #111);
	}

	.qty-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0.75rem 0 0.5rem;
	}

	.qty-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		opacity: 0.6;
	}

	.stepper {
		display: inline-flex;
		border: 1px solid color-mix(in srgb, var(--foreground, #111) 20%, transparent);
		border-radius: 6px;
		overflow: hidden;
	}

	.step {
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font-size: 16px;
	}

	.step:hover {
		background: color-mix(in srgb, var(--foreground, #111) 8%, transparent);
	}

	.qty-value {
		min-width: 32px;
		display: grid;
		place-items: center;
		font-variant-numeric: tabular-nums;
	}

	/* Paint-swatch add-to-cart button with an asymmetric radius for the
	   hand-made feel called out in the spec. Colour is overridden inline. */
	.cart-btn {
		width: 100%;
		padding: 0.85rem 1rem;
		color: white;
		border: none;
		background-color: #8b5e3c;
		border-radius: 2px 8px 2px 6px;
		box-shadow:
			0 3px 12px rgba(139, 94, 60, 0.3),
			0 1px 3px rgba(0, 0, 0, 0.15);
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		cursor: pointer;
		transition: transform 0.1s ease;
	}

	.cart-btn:active {
		transform: translateY(1px);
	}

	.back-btn {
		margin-top: 0.6rem;
		width: 100%;
		padding: 0.6rem;
		border: 1px solid color-mix(in srgb, var(--foreground, #111) 20%, transparent);
		background: transparent;
		color: inherit;
		border-radius: 6px;
		cursor: pointer;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.quote {
		margin: 1rem 0 0;
		padding: 0.75rem 1rem;
		border-left: 3px solid color-mix(in srgb, var(--foreground, #111) 25%, transparent);
		background: color-mix(in srgb, var(--foreground, #111) 4%, transparent);
		border-radius: 0 8px 8px 0;
	}

	.quote p {
		font-family: var(--font-playfair, 'Playfair Display', serif);
		font-style: italic;
		margin: 0 0 0.35rem;
		font-size: 14px;
	}

	.quote cite {
		font-size: 11px;
		opacity: 0.65;
		font-style: normal;
	}
</style>
