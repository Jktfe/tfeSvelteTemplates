<!--
  ===========================================================
  COMBOBOX
  ===========================================================
  WHAT — A typeahead select that filters an options list as you type, with full
         keyboard navigation and an optional multi-select chip mode.

  FEATURES
    • Single and multiple selection modes (controlled via a bindable `value`)
    • Type-to-filter with case-insensitive substring matching
    • Full keyboard nav: ArrowDown/ArrowUp to move, Enter to select,
      Escape to close, Home/End to jump, Backspace to remove last chip
    • Multi mode renders removable chips; Backspace on an empty field pops the last
    • Empty-state message when nothing matches the query
    • Closes on outside click / blur

  ACCESSIBILITY
    • role="combobox" with aria-expanded, aria-controls and aria-activedescendant
    • Listbox popup with role="listbox"; each row role="option" + aria-selected
    • Visible :focus-visible ring; honours prefers-reduced-motion
    • Chips expose an aria-label "Remove <label>" on their delete control

  DEPENDENCIES
    Zero external dependencies — pure Svelte 5 runes, scoped CSS and inline SVG.

  USAGE
    <script lang="ts">
      import Combobox from '$lib/components/Combobox.svelte';
      let value = $state<string | null>(null);
      const options = [
        { value: 'gb', label: 'United Kingdom' },
        { value: 'fr', label: 'France' }
      ];
    </script>
    <Combobox {options} bind:value placeholder="Search a country…" />

  PROPS
    | Prop          | Type                                 | Default        | Description                                   |
    | ------------- | ------------------------------------ | -------------- | --------------------------------------------- |
    | options       | ComboOption[]                        | []             | Selectable items, each { value, label }.      |
    | value         | string \| null \| string[] (bindable)| null / []      | Selected value(s); array when multiple.       |
    | multiple      | boolean                              | false          | Enable multi-select chip mode.                |
    | placeholder   | string                               | 'Search…'      | Input placeholder text.                       |
    | emptyMessage  | string                               | 'No matches'   | Shown when the filter yields no options.      |
    | disabled      | boolean                              | false          | Disable the whole control.                    |
    | id            | string                               | auto           | Base id used for ARIA wiring.                 |
    | label         | string                               | 'Combobox'     | Accessible name for the control.              |
  ===========================================================
-->
<script lang="ts">
	interface ComboOption {
		value: string;
		label: string;
	}

	interface Props {
		options?: ComboOption[];
		value?: string | null | string[];
		multiple?: boolean;
		placeholder?: string;
		emptyMessage?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		class?: string;
	}

	let {
		options = [],
		value = $bindable(),
		multiple = false,
		placeholder = 'Search…',
		emptyMessage = 'No matches',
		disabled = false,
		id = `combobox-${Math.random().toString(36).slice(2, 9)}`,
		label = 'Combobox',
		class: className = ''
	}: Props = $props();

	// Local UI state. The selection itself lives in the bindable `value` prop.
	let query = $state('');
	let open = $state(false);
	let activeIndex = $state(-1);
	let inputEl = $state<HTMLInputElement | null>(null);
	let rootEl = $state<HTMLDivElement | null>(null);

	// Normalise the selection into an array so both modes share one code path.
	const selectedValues = $derived(
		multiple
			? Array.isArray(value)
				? value
				: []
			: value == null || value === ''
				? []
				: [value as string]
	);

	// Fast lookup from value -> label for rendering chips and the single-select display.
	const labelByValue = $derived(new Map(options.map((o) => [o.value, o.label])));

	// In single mode the input shows the chosen label until the user starts typing.
	const filterText = $derived.by(() => {
		if (multiple) return query;
		if (open) return query;
		const only = selectedValues[0];
		return only != null ? (labelByValue.get(only) ?? only) : '';
	});

	// Filter the options by the current query. In multi mode we hide already-chosen rows.
	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return options.filter((o) => {
			if (multiple && selectedValues.includes(o.value)) return false;
			return q === '' ? true : o.label.toLowerCase().includes(q);
		});
	});

	const activeDescendantId = $derived(
		open && activeIndex >= 0 && activeIndex < filtered.length
			? `${id}-opt-${activeIndex}`
			: undefined
	);

	function openList() {
		if (disabled) return;
		open = true;
	}

	function closeList() {
		open = false;
		activeIndex = -1;
		// In single mode, drop any half-typed query so the chosen label reappears.
		if (!multiple) query = '';
	}

	function commit(option: ComboOption) {
		if (multiple) {
			const current = Array.isArray(value) ? value : [];
			if (!current.includes(option.value)) value = [...current, option.value];
			query = '';
			activeIndex = 0;
			inputEl?.focus();
		} else {
			value = option.value;
			query = '';
			closeList();
		}
	}

	function removeAt(val: string) {
		if (!multiple) return;
		const current = Array.isArray(value) ? value : [];
		value = current.filter((v) => v !== val);
		inputEl?.focus();
	}

	function onInput(event: Event) {
		query = (event.target as HTMLInputElement).value;
		open = true;
		activeIndex = filtered.length > 0 ? 0 : -1;
	}

	function onKeydown(event: KeyboardEvent) {
		if (disabled) return;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				if (!open) {
					openList();
					return;
				}
				if (filtered.length > 0) activeIndex = (activeIndex + 1) % filtered.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (!open) {
					openList();
					return;
				}
				if (filtered.length > 0)
					activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
				break;
			case 'Home':
				if (open && filtered.length > 0) {
					event.preventDefault();
					activeIndex = 0;
				}
				break;
			case 'End':
				if (open && filtered.length > 0) {
					event.preventDefault();
					activeIndex = filtered.length - 1;
				}
				break;
			case 'Enter':
				if (open && activeIndex >= 0 && activeIndex < filtered.length) {
					event.preventDefault();
					commit(filtered[activeIndex]);
				}
				break;
			case 'Escape':
				if (open) {
					event.preventDefault();
					closeList();
				}
				break;
			case 'Backspace':
				// Empty query + chips present -> pop the most recent chip.
				if (multiple && query === '' && selectedValues.length > 0) {
					event.preventDefault();
					removeAt(selectedValues[selectedValues.length - 1]);
				}
				break;
		}
	}

	// Close when focus or a click leaves the component entirely.
	function onFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && rootEl?.contains(next)) return;
		closeList();
	}

	$effect(() => {
		if (!open) return;
		function onDocPointer(event: PointerEvent) {
			if (rootEl && !rootEl.contains(event.target as Node)) closeList();
		}
		document.addEventListener('pointerdown', onDocPointer);
		return () => document.removeEventListener('pointerdown', onDocPointer);
	});
</script>

<div
	bind:this={rootEl}
	class="combobox {className}"
	class:is-disabled={disabled}
	onfocusout={onFocusOut}
>
	<span id="{id}-label" class="cb-visually-hidden">{label}</span>

	<div class="cb-field" class:is-open={open}>
		{#if multiple}
			{#each selectedValues as val (val)}
				<span class="cb-chip">
					<span class="cb-chip-label">{labelByValue.get(val) ?? val}</span>
					<button
						type="button"
						class="cb-chip-remove"
						aria-label="Remove {labelByValue.get(val) ?? val}"
						{disabled}
						onclick={() => removeAt(val)}
					>
						<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
							<path
								d="M3 3l10 10M13 3L3 13"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</span>
			{/each}
		{/if}

		<span class="cb-search-icon" aria-hidden="true">
			<svg viewBox="0 0 20 20" width="16" height="16">
				<circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2" />
				<path
					d="M13.5 13.5L18 18"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</span>

		<input
			bind:this={inputEl}
			class="cb-input"
			type="text"
			role="combobox"
			aria-expanded={open}
			aria-controls="{id}-listbox"
			aria-activedescendant={activeDescendantId}
			aria-labelledby="{id}-label"
			aria-autocomplete="list"
			autocomplete="off"
			{placeholder}
			{disabled}
			value={filterText}
			oninput={onInput}
			onkeydown={onKeydown}
			onfocus={openList}
		/>
	</div>

	{#if open}
		<ul class="cb-listbox" id="{id}-listbox" role="listbox" aria-label={label}>
			{#if filtered.length === 0}
				<li class="cb-empty" role="presentation">{emptyMessage}</li>
			{:else}
				{#each filtered as option, i (option.value)}
					<li
						id="{id}-opt-{i}"
						class="cb-option"
						class:is-active={i === activeIndex}
						role="option"
						aria-selected={selectedValues.includes(option.value)}
						onpointerdown={(e) => {
							e.preventDefault();
							commit(option);
						}}
						onpointermove={() => (activeIndex = i)}
					>
						<span class="cb-option-label">{option.label}</span>
						{#if selectedValues.includes(option.value)}
							<svg
								class="cb-tick"
								viewBox="0 0 16 16"
								width="14"
								height="14"
								aria-hidden="true"
							>
								<path
									d="M3 8.5l3.5 3.5L13 4"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
					</li>
				{/each}
			{/if}
		</ul>
	{/if}
</div>

<style>
	/* Light defaults live on the root; the dark block below only flips chrome tokens. */
	.combobox {
		--cb-bg: #ffffff;
		--cb-border: #d4d8e0;
		--cb-border-focus: #4338ca;
		--cb-text: #1f2333;
		--cb-muted: #6b7280;
		--cb-chip-bg: #e0e7ff;
		--cb-chip-text: #3730a3;
		--cb-option-active: #eef2ff;
		--cb-option-active-text: #312e81;
		--cb-popup-bg: #ffffff;
		--cb-popup-shadow: 0 12px 28px rgba(17, 24, 39, 0.16);
		--cb-ring: rgba(67, 56, 202, 0.35);

		position: relative;
		display: block;
		width: 100%;
		max-width: 28rem;
		font-family:
			'IBM Plex Sans',
			system-ui,
			-apple-system,
			sans-serif;
		color: var(--cb-text);
	}

	.cb-visually-hidden {
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

	.cb-field {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		padding: 0.4rem 0.6rem;
		background: var(--cb-bg);
		border: 1.5px solid var(--cb-border);
		border-radius: 0.625rem;
		transition: border-color 160ms ease;
	}

	.cb-field:focus-within {
		border-color: var(--cb-border-focus);
		box-shadow: 0 0 0 3px var(--cb-ring);
	}

	.cb-field.is-open {
		border-color: var(--cb-border-focus);
	}

	.is-disabled .cb-field {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.cb-search-icon {
		display: inline-flex;
		color: var(--cb-muted);
		flex: 0 0 auto;
	}

	.cb-input {
		flex: 1 1 8rem;
		min-width: 6rem;
		border: none;
		outline: none;
		background: transparent;
		font: inherit;
		color: inherit;
		padding: 0.2rem 0;
	}

	.cb-input::placeholder {
		color: var(--cb-muted);
	}

	.cb-input:disabled {
		cursor: not-allowed;
	}

	/* Removable chips for multi-select mode. */
	.cb-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.15rem 0.2rem 0.15rem 0.55rem;
		background: var(--cb-chip-bg);
		color: var(--cb-chip-text);
		border-radius: 0.5rem;
		font-size: 0.85rem;
		line-height: 1.3;
		font-weight: 600;
	}

	.cb-chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.1rem;
		height: 1.1rem;
		padding: 0;
		border: none;
		border-radius: 0.35rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.cb-chip-remove:hover:not(:disabled) {
		background: rgba(55, 48, 163, 0.15);
	}

	.cb-chip-remove:focus-visible {
		outline: 2px solid var(--cb-border-focus);
		outline-offset: 1px;
	}

	/* Popup listbox. */
	.cb-listbox {
		position: absolute;
		z-index: 30;
		top: calc(100% + 0.35rem);
		left: 0;
		right: 0;
		margin: 0;
		padding: 0.3rem;
		list-style: none;
		max-height: 16rem;
		overflow-y: auto;
		background: var(--cb-popup-bg);
		border: 1px solid var(--cb-border);
		border-radius: 0.625rem;
		box-shadow: var(--cb-popup-shadow);
	}

	.cb-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.65rem;
		border-radius: 0.45rem;
		cursor: pointer;
		font-size: 0.95rem;
		color: var(--cb-text);
	}

	.cb-option.is-active {
		background: var(--cb-option-active);
		color: var(--cb-option-active-text);
	}

	.cb-tick {
		color: var(--cb-border-focus);
		flex: 0 0 auto;
	}

	.cb-empty {
		padding: 0.65rem;
		text-align: center;
		color: var(--cb-muted);
		font-size: 0.9rem;
	}

	@media (prefers-color-scheme: dark) {
		.combobox {
			--cb-bg: #1a1d29;
			--cb-border: #3a3f52;
			--cb-border-focus: #8b8ff5;
			--cb-text: #e7e9f2;
			--cb-muted: #9aa0b4;
			--cb-chip-bg: #2e2a55;
			--cb-chip-text: #c7c9ff;
			--cb-option-active: #2a2f50;
			--cb-option-active-text: #d3d6ff;
			--cb-popup-bg: #1a1d29;
			--cb-popup-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
			--cb-ring: rgba(139, 143, 245, 0.4);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cb-field {
			transition: none;
		}
	}
</style>
