<!--
  ===========================================================
  SearchBar
  ===========================================================
  WHAT — A rounded search input with a magnifier icon and a clear
         button, bound to a string value.
  WHY  — Site infrastructure: it powers the component filter on the
         home page. It isn't a catalogued template, but it's small and
         dependency-free, so feel free to lift it into your own app.

  FEATURES
  • bind:value two-way binding
  • Clear button appears only when there is text; refocuses the input
  • Escape clears a non-empty query
  • Hides the browser's own search "×" so there's only one clear control
  • Inline SVG icons — no icon library
  • Themeable via --fg-1 / --fg-2 / --surface / --surface-2 / --border / --accent

  ACCESSIBILITY
  • Native <input type="search"> with a configurable aria-label
  • Clear button is a real <button> with aria-label="Clear search"
  • Visible focus ring on the input and the clear button
  • prefers-reduced-motion: border / shadow / hover transitions are removed

  DEPENDENCIES
  Zero.

  PERFORMANCE
  One input handler that copies the DOM value into the bound prop.
  Debounce in the parent if each keystroke triggers expensive work.

  USAGE
  <script lang="ts">
    import SearchBar from '$lib/components/SearchBar.svelte';
    let query = $state('');
  </script>
  <SearchBar bind:value={query} placeholder="Search recipes…" ariaLabel="Search recipes" />

  PROPS
  | Prop        | Type               | Default               | Description                       |
  |-------------|--------------------|-----------------------|-----------------------------------|
  | value       | string (bindable)  | ''                    | Current query                     |
  | placeholder | string             | 'Search components…'  | Placeholder text                  |
  | ariaLabel   | string             | 'Search components'   | Accessible name of the input      |
  | class       | string             | ''                    | Extra classes on the wrapper      |
  ===========================================================
-->
<script lang="ts" module>
	export interface SearchBarProps {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = 'Search components…',
		ariaLabel = 'Search components',
		class: className = ''
	}: SearchBarProps = $props();

	let inputEl: HTMLInputElement | undefined = $state();
	let clearVisible = $derived(value.length > 0);

	function handleInput() {
		value = inputEl?.value ?? '';
	}

	function clear() {
		value = '';
		if (inputEl) inputEl.value = '';
		inputEl?.focus();
	}

	// Escape is the conventional "never mind" key for a search field. Only
	// swallow it when there is something to clear, so an empty field lets
	// Escape bubble up to close whatever dialog or panel it lives in.
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && value.length > 0) {
			event.preventDefault();
			clear();
		}
	}
</script>

<div class="search-bar {className}">
	<svg class="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
	<input
		bind:this={inputEl}
		type="search"
		class="search-bar__input"
		{placeholder}
		aria-label={ariaLabel}
		{value}
		oninput={handleInput}
		onkeydown={handleKeydown}
		autocomplete="off"
		spellcheck="false"
	/>
	{#if clearVisible}
		<button type="button" class="search-bar__clear" onclick={clear} aria-label="Clear search">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 320px;
	}

	.search-bar__icon {
		position: absolute;
		left: 12px;
		width: 16px;
		height: 16px;
		color: var(--fg-2, #6b7280);
		pointer-events: none;
	}

	.search-bar__input {
		width: 100%;
		padding: 10px 36px 10px 38px;
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.25;
		color: var(--fg-1, #111827);
		background: var(--surface, #fff);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 999px;
		outline: none;
		transition: border-color 150ms ease, box-shadow 150ms ease;
	}

	/* We render our own clear button, so hide the browser's built-in one. */
	.search-bar__input::-webkit-search-cancel-button,
	.search-bar__input::-webkit-search-decoration {
		appearance: none;
		-webkit-appearance: none;
	}

	.search-bar__input::placeholder {
		color: var(--fg-2, #9ca3af);
	}

	.search-bar__input:focus {
		border-color: var(--accent, #6366f1);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 20%, transparent);
	}

	.search-bar__clear {
		position: absolute;
		right: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--fg-2, #9ca3af);
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease;
	}

	.search-bar__clear:hover {
		background: var(--surface-2, #f3f4f6);
		color: var(--fg-1, #111827);
	}

	.search-bar__clear:focus-visible {
		outline: 2px solid var(--accent, #6366f1);
		outline-offset: 1px;
	}

	.search-bar__clear svg {
		width: 14px;
		height: 14px;
	}

	@media (prefers-reduced-motion: reduce) {
		.search-bar__input,
		.search-bar__clear {
			transition: none;
		}
	}
</style>
