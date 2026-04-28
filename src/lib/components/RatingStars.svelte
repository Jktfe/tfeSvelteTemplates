<!--
  ============================================================
  RatingStars - Interactive Star Rating
  ============================================================

  🎯 WHAT IT DOES
  Renders a row of stars users can click to rate something. Supports
  read-only display, hover-to-preview, and arbitrary scales (default 1–5).
  Each star is a real radio input under the hood, so keyboard users get
  proper arrow-key navigation and screen readers announce "3 of 5 stars".

  ✨ FEATURES
  • Click to rate, hover to preview the new value
  • Configurable max (default 5) and starting value
  • Read-only mode for displaying ratings (e.g. on a product card)
  • Custom colours for filled and empty stars
  • Configurable size (px)
  • ARIA radiogroup with arrow-key navigation
  • Honours prefers-reduced-motion

  ♿ ACCESSIBILITY
  • Real <input type="radio"> elements (visually hidden) — full a11y for free
  • role="radiogroup" with aria-label
  • Each star has aria-label="N stars"
  • Keyboard: ←/→ moves between stars, Space/Enter selects
  • Read-only mode uses role="img" with aria-label="Rated 4 out of 5"

  📦 DEPENDENCIES
  Zero external dependencies. Inline SVG stars + scoped CSS.

  🎨 USAGE
  <RatingStars value={3} onChange={(v) => rating = v} />        (interactive)
  <RatingStars value={4.5} readonly />                          (display)
  <RatingStars value={2} max={10} />                            (custom scale)

  📋 PROPS
  | Prop          | Type                       | Default     | Description |
  |---------------|----------------------------|-------------|-------------|
  | value         | number                     | 0           | Current rating (0..max) |
  | max           | number                     | 5           | Number of stars |
  | readonly      | boolean                    | false       | Disable interaction |
  | size          | number                     | 28          | Star size in px |
  | name          | string                     | auto        | Radio group name (auto-generated if not given) |
  | filledColor   | string                     | '#fbbf24'   | Filled star colour |
  | emptyColor    | string                     | '#e5e7eb'   | Empty star colour |
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
		filledColor = '#fbbf24',
		emptyColor = '#e5e7eb',
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
		style:--star-size="{size}px"
	>
		{#each [...Array(max).keys()] as i (i)}
			{@const fill = fillFor(i)}
			<span class="star-wrap" aria-hidden="true">
				<svg viewBox="0 0 24 24" width={size} height={size}>
					<defs>
						<linearGradient id="grad-{groupName}-{i}" x1="0" x2="100%" y1="0" y2="0">
							<stop offset="{fill}%" stop-color={filledColor} />
							<stop offset="{fill}%" stop-color={emptyColor} />
						</linearGradient>
					</defs>
					<path
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
		style:--star-size="{size}px"
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
						d="M12 2l2.95 6.18 6.79.99-4.91 4.79 1.16 6.76L12 17.77l-6.07 3.19 1.16-6.76L2.18 9.4l6.79-.99L12 2z"
						fill={filled ? filledColor : emptyColor}
					/>
				</svg>
			</label>
		{/each}
	</div>
{/if}

<style>
	.rating-stars {
		display: inline-flex;
		gap: 2px;
		align-items: center;
		line-height: 0;
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
		transition:
			fill 0.15s ease,
			transform 0.15s ease;
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
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.star-label,
		.star-label svg {
			transition: none;
		}
		.star-label:hover svg,
		.star-label:focus-within svg {
			transform: none;
		}
	}
</style>
