<!--
  ============================================================
  RatingStars - Interactive Star Rating
  ============================================================

  WHAT IT DOES
  Renders a row of stars users can click to rate something. Supports
  read-only display, hover-to-preview, and arbitrary scales (default 1-5).
  Each star is a real radio input under the hood, so keyboard users get
  proper arrow-key navigation and screen readers announce "3 of 5 stars".

  FEATURES
  - Click to rate, hover to preview the new value
  - Configurable max (default 5) and starting value
  - Read-only mode for displaying ratings (e.g. on a product card)
  - Configurable size (px)
  - ARIA radiogroup with arrow-key navigation
  - Honours prefers-reduced-motion
  - Honours prefers-color-scheme (dark flip via CSS custom properties)

  ACCESSIBILITY
  - Real input type=radio elements (visually hidden) — full a11y for free
  - role=radiogroup with aria-label
  - Each star has aria-label="N stars"
  - Keyboard: Left/Right moves between stars, Space/Enter selects
  - Read-only mode uses role=img with aria-label="Rated 4 out of 5"

  DEPENDENCIES
  Zero external dependencies. Inline SVG stars + scoped CSS.

  THEMING
  Three dark-aware tokens on .rating-stars, light defaults inline,
  flipped automatically under @media (prefers-color-scheme: dark).
  The filled-star colour is treated as a brand colour (gold) and
  stays vivid on both schemes — only chrome (empty + focus ring)
  flips dark.
  - --rating-star-filled  filled star fill (light + dark: #fbbf24, gold-brand)
  - --rating-star-empty   empty star fill (light: #e5e7eb / dark: #374151)
  - --rating-focus-ring   focus-visible ring (light: #3b82f6 / dark: #60a5fa)
  Override the chrome tokens by targeting .rating-stars directly with
  at least 2-class specificity — required to overcome the (0,2,0)
  specificity of the component's scoped internal styles. Svelte appends
  a hash class to every selector, so the component's own
  .rating-stars.svelte-HASH rule declares the default directly on the
  .rating-stars element. An ancestor :root or body rule sets a value
  that descendants would inherit, but that inherited value is shadowed
  by the component's own declaration on the same element — declared
  values always win over inherited values on the element where they're
  declared, regardless of the ancestor rule's specificity. The override
  therefore needs to declare on the same element with ≥(0,2,0)
  specificity. See docs/THEMING.md for the full mechanism. The
  doubled-class trick is the cheapest unconditional override:
      body .rating-stars.rating-stars { --rating-star-filled: #ef4444; --rating-star-empty: #fee2e2; }
  The legacy filledColor / emptyColor props are still accepted and,
  when passed, take precedence by injecting an inline-style override
  on the wrapper.

  USAGE
  RatingStars value={3} onChange={(v) => rating = v}        (interactive)
  RatingStars value={4.5} readonly                          (display)
  RatingStars value={2} max={10}                            (custom scale)

  PROPS
  | Prop          | Type                       | Default     | Description |
  |---------------|----------------------------|-------------|-------------|
  | value         | number                     | 0           | Current rating (0..max) |
  | max           | number                     | 5           | Number of stars |
  | readonly      | boolean                    | false       | Disable interaction |
  | size          | number                     | 28          | Star size in px |
  | name          | string                     | auto        | Radio group name (auto-generated if not given) |
  | filledColor   | string                     | undefined   | Filled star colour override (CSS var if omitted) |
  | emptyColor    | string                     | undefined   | Empty star colour override (CSS var if omitted) |
  | ariaLabel     | string                     | 'Rating'    | Group label for SR |
  | onChange      | (v: number) => void        | undefined   | Fired when user picks a value |
  | class         | string                     | ''          | Extra classes |

  ============================================================
-->

<script lang="ts">
	interface Props {
		value?: number;
		max?: number;
		readonly?: boolean;
		size?: number;
		name?: string;
		filledColor?: string;
		emptyColor?: string;
		ariaLabel?: string;
		onChange?: (value: number) => void;
		class?: string;
	}

	let {
		value = 0,
		max = 5,
		readonly = false,
		size = 28,
		name,
		filledColor,
		emptyColor,
		ariaLabel = 'Rating',
		onChange,
		class: extraClass = ''
	}: Props = $props();

	// Auto-generate a stable group name so multiple RatingStars on a page don't collide.
	let groupName = $derived(name ?? `rating-${Math.random().toString(36).slice(2, 9)}`);

	// Hover preview: when the user is hovering, show that count instead of the real value.
	let hoverValue = $state<number | null>(null);

	// What we actually paint: hover wins if set, otherwise the real value.
	let displayValue = $derived(hoverValue ?? value);

	// Inline style on the wrapper — sets --star-size always, and conditionally
	// overrides the colour CSS vars only when the consumer explicitly passed
	// filledColor / emptyColor props. Defaults flow from the stylesheet so the
	// dark @media block can flip them when no prop is set.
	let wrapStyle = $derived.by(() => {
		const parts = [`--star-size:${size}px`];
		if (filledColor) parts.push(`--rating-star-filled:${filledColor}`);
		if (emptyColor) parts.push(`--rating-star-empty:${emptyColor}`);
		return parts.join(';');
	});

	function selectValue(v: number) {
		if (readonly) return;
		onChange?.(v);
	}

	function handleHover(v: number | null) {
		if (readonly) return;
		hoverValue = v;
	}

	// Each star fills 0% / 50% / 100% based on the display value, allowing half-stars
	// when a fractional value is passed (read-only mode only).
	function fillFor(index: number): number {
		const diff = displayValue - index;
		if (diff >= 1) return 100;
		if (diff > 0) return Math.round(diff * 100);
		return 0;
	}
</script>

{#if readonly}
	<span
		class="rating-stars rating-readonly {extraClass}"
		role="img"
		aria-label="Rated {value} out of {max}"
		style={wrapStyle}
	>
		{#each [...Array(max).keys()] as i (i)}
			{@const fill = fillFor(i)}
			<span class="star-wrap" aria-hidden="true">
				<svg viewBox="0 0 24 24" width={size} height={size}>
					<defs>
						<linearGradient id="grad-{groupName}-{i}" x1="0" x2="100%" y1="0" y2="0">
							<stop offset="{fill}%" class="grad-stop-filled" />
							<stop offset="{fill}%" class="grad-stop-empty" />
						</linearGradient>
					</defs>
					<path
						class="star-path"
						d="M12 2l2.95 6.18 6.79.99-4.91 4.79 1.16 6.76L12 17.77l-6.07 3.19 1.16-6.76L2.18 9.4l6.79-.99L12 2z"
						fill="url(#grad-{groupName}-{i})"
					/>
				</svg>
			</span>
		{/each}
	</span>
{:else}
	<div
		class="rating-stars rating-interactive {extraClass}"
		role="radiogroup"
		tabindex="-1"
		aria-label={ariaLabel}
		style={wrapStyle}
		onmouseleave={() => handleHover(null)}
	>
		{#each [...Array(max).keys()] as i (i)}
			{@const starValue = i + 1}
			{@const filled = displayValue >= starValue}
			<label
				class="star-label"
				onmouseenter={() => handleHover(starValue)}
				onfocusin={() => handleHover(starValue)}
				onfocusout={() => handleHover(null)}
			>
				<input
					type="radio"
					name={groupName}
					value={starValue}
					checked={value === starValue}
					onchange={() => selectValue(starValue)}
					aria-label="{starValue} {starValue === 1 ? 'star' : 'stars'}"
				/>
				<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
					<path
						class="star-path {filled ? 'star-filled' : 'star-empty'}"
						d="M12 2l2.95 6.18 6.79.99-4.91 4.79 1.16 6.76L12 17.77l-6.07 3.19 1.16-6.76L2.18 9.4l6.79-.99L12 2z"
					/>
				</svg>
			</label>
		{/each}
	</div>
{/if}

<style>
	.rating-stars {
		/*
		 * Theming tokens — light defaults here, dark flip in the media block
		 * at the bottom of this stylesheet. Filled-star is treated as a brand
		 * colour (gold) and stays vivid on both schemes; only chrome flips.
		 * To retheme, target .rating-stars with ≥2-class specificity —
		 * required to overcome this rule's (0,2,0) scoped specificity. An
		 * ancestor :root or body rule sets a value that descendants would
		 * inherit, but that inherited value is shadowed by this rule's own
		 * declaration on the .rating-stars element — declared values always
		 * win over inherited values on the element where they're declared.
		 * See docs/THEMING.md for the full mechanism. The filledColor /
		 * emptyColor props are still accepted as inline-style overrides on
		 * the wrapper.
		 */
		--rating-star-filled: #fbbf24;
		--rating-star-empty: #e5e7eb;
		--rating-focus-ring: #3b82f6;

		display: inline-flex;
		gap: 2px;
		align-items: center;
		line-height: 0;
	}

	/* Star colour bound to CSS vars so the dark @media block can flip empty
	 * without flipping the gold filled star (Pattern: chrome flips, brand stays). */
	.star-filled {
		fill: var(--rating-star-filled);
	}

	.star-empty {
		fill: var(--rating-star-empty);
	}

	/* Read-only half-star gradient stops use stop-color from CSS so var() works. */
	.grad-stop-filled {
		stop-color: var(--rating-star-filled);
	}

	.grad-stop-empty {
		stop-color: var(--rating-star-empty);
	}

	.star-path {
		transition: fill 0.15s ease;
	}

	.rating-readonly {
		display: inline-flex;
	}

	.star-wrap {
		display: inline-block;
		line-height: 0;
	}

	.star-label {
		display: inline-flex;
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.star-label:hover svg,
	.star-label:focus-within svg {
		transform: scale(1.1);
	}

	.star-label svg {
		transition: transform 0.15s ease;
	}

	.star-label input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
		white-space: nowrap;
	}

	/* Visible focus ring for keyboard users — applied to the SVG when the input is focused. */
	.star-label input:focus-visible + svg {
		outline: 2px solid var(--rating-focus-ring);
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.star-label,
		.star-label svg,
		.star-path {
			transition: none;
		}
		.star-label:hover svg,
		.star-label:focus-within svg {
			transform: none;
		}
	}

	/*
	 * Dark mode — flip the empty-star chrome and focus-ring tint so the
	 * stars stay readable on dark surfaces. The filled gold (#fbbf24) is
	 * deliberately NOT flipped: gold reads fine on both schemes, and a
	 * star rating system relies on a constant brand-coloured "filled"
	 * signal so users can compare ratings at a glance. Consumer overrides
	 * that reach ≥2-class specificity (e.g. body .rating-stars.rating-stars)
	 * still win in dark mode — they clear the component's scoped (0,2,0)
	 * baseline and cascade after this block. See docs/THEMING.md for the
	 * full arithmetic.
	 */
	@media (prefers-color-scheme: dark) {
		.rating-stars {
			--rating-star-empty: #374151;
			--rating-focus-ring: #60a5fa;
		}
	}
</style>
