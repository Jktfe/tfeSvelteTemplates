<!--
  ============================================================
  FilterChips - Toggleable filter pills
  ============================================================

  🎯 WHAT IT DOES
  Renders a horizontal row of small "chips" that users can toggle to
  filter content (e.g. blog tags, product categories, search facets).
  Multi-select by default — each chip toggles independently. Switch
  to single-select for radio-style behaviour.

  ✨ FEATURES
  • Multi-select (default) or single-select mode
  • Active (filled) vs inactive (outlined) styling
  • Optional removable mode — each chip gets a × to dismiss
  • Optional "All" reset chip that clears the selection
  • Configurable size (sm/md/lg)
  • Custom active palette (background + text colours)
  • Wraps onto multiple rows on narrow screens

  ♿ ACCESSIBILITY
  • role="group" with aria-label
  • Each chip is a real <button> with aria-pressed for selection state
  • Remove button has its own aria-label "Remove [chip label]"
  • Keyboard: Tab between chips, Space/Enter to toggle, Tab to reach × then Space to remove
  • Honours prefers-reduced-motion

  📦 DEPENDENCIES
  Zero dependencies. Inline × SVG + scoped CSS.

  🎨 USAGE
  let selected = $state<string[]>(['design']);
  const options = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' }
  ];
  <FilterChips {options} bind:selected />

  📋 PROPS
  | Prop          | Type                          | Default     | Description |
  |---------------|-------------------------------|-------------|-------------|
  | options       | { value, label, count? }[]    | required    | Chip data |
  | selected      | string[]                      | []          | Selected values (bindable) |
  | mode          | 'multi' \| 'single'           | 'multi'     | Selection behaviour |
  | size          | 'sm' \| 'md' \| 'lg'          | 'md'        | Chip size |
  | removable     | boolean                       | false       | Show × on each chip |
  | onRemove      | (value: string) => void       | -           | Fired when × clicked |
  | showAll       | boolean                       | false       | Show 'All' reset chip |
  | allLabel      | string                        | 'All'       | Label for the reset chip |
  | activeBg      | string                        | '#1f2937'   | Active chip background |
  | activeText    | string                        | '#ffffff'   | Active chip text colour |
  | ariaLabel     | string                        | 'Filters'   | Group label |
  | onChange      | (selected: string[]) => void  | -           | Selection changed |
  | class         | string                        | ''          | Extra classes |

  ============================================================
-->

<script lang="ts">
	interface Option {
		value: string;
		label: string;
		count?: number;
	}

	interface Props {
		options: Option[];
		selected?: string[];
		mode?: 'multi' | 'single';
		size?: 'sm' | 'md' | 'lg';
		removable?: boolean;
		onRemove?: (value: string) => void;
		showAll?: boolean;
		allLabel?: string;
		activeBg?: string;
		activeText?: string;
		ariaLabel?: string;
		onChange?: (selected: string[]) => void;
		class?: string;
	}

	let {
		options,
		selected = $bindable([]),
		mode = 'multi',
		size = 'md',
		removable = false,
		onRemove,
		showAll = false,
		allLabel = 'All',
		activeBg = '#1f2937',
		activeText = '#ffffff',
		ariaLabel = 'Filters',
		onChange,
		class: extraClass = ''
	}: Props = $props();

	function isSelected(value: string): boolean {
		return selected.includes(value);
	}

	// Multi: toggle in/out. Single: replace selection with this value, or clear if same.
	function toggle(value: string) {
		if (mode === 'single') {
			selected = isSelected(value) ? [] : [value];
		} else {
			selected = isSelected(value)
				? selected.filter((v) => v !== value)
				: [...selected, value];
		}
		onChange?.(selected);
	}

	function clearAll() {
		selected = [];
		onChange?.(selected);
	}

	function remove(value: string, event: Event) {
		// Stop the click bubbling to the chip's own toggle handler.
		event.stopPropagation();
		selected = selected.filter((v) => v !== value);
		onRemove?.(value);
		onChange?.(selected);
	}
</script>

<div
	class="filter-chips chips-{size} {extraClass}"
	role="group"
	aria-label={ariaLabel}
>
	{#if showAll}
		<button
			type="button"
			class="chip chip-all"
			class:chip-active={selected.length === 0}
			aria-pressed={selected.length === 0}
			onclick={clearAll}
			style:--active-bg={activeBg}
			style:--active-text={activeText}
		>
			{allLabel}
		</button>
	{/if}

	{#each options as option (option.value)}
		{@const active = isSelected(option.value)}
		<button
			type="button"
			class="chip"
			class:chip-active={active}
			aria-pressed={active}
			onclick={() => toggle(option.value)}
			style:--active-bg={activeBg}
			style:--active-text={activeText}
		>
			<span class="chip-label">{option.label}</span>
			{#if option.count !== undefined}
				<span class="chip-count">{option.count}</span>
			{/if}
			{#if removable && active}
				<!--
					Inner remove button — wrapped in a <span> so the click handler can
					stopPropagation without firing the chip's own toggle.
				-->
				<span
					class="chip-remove"
					role="button"
					tabindex="0"
					aria-label="Remove {option.label}"
					onclick={(e) => remove(option.value, e)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							remove(option.value, e);
						}
					}}
				>
					<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		background: #ffffff;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 9999px;
		font: inherit;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease,
			transform 0.15s ease;
	}

	.chip:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.chip:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.chip-active {
		background: var(--active-bg);
		color: var(--active-text);
		border-color: var(--active-bg);
	}

	.chip-active:hover {
		background: var(--active-bg);
		border-color: var(--active-bg);
		filter: brightness(0.95);
	}

	.chip-count {
		font-size: 0.8em;
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		margin-left: 0.125rem;
		margin-right: -0.25rem;
		border-radius: 9999px;
		opacity: 0.85;
		cursor: pointer;
		transition: opacity 0.15s ease, background 0.15s ease;
	}

	.chip-remove:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.25);
	}

	.chip-remove:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 1px;
	}

	/* Sizes */
	.chips-sm .chip {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
	}
	.chips-md .chip {
		padding: 0.375rem 0.875rem;
		font-size: 0.875rem;
	}
	.chips-lg .chip {
		padding: 0.5rem 1.125rem;
		font-size: 1rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.chip,
		.chip-remove {
			transition: none;
		}
	}
</style>
