<script lang="ts" module>
	export interface SearchBarProps {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		class?: string;
	}
</script>

<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search components…',
		ariaLabel = 'Search components',
		class: className = ''
	}: Props = $props();

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

	.search-bar__clear svg {
		width: 14px;
		height: 14px;
	}
</style>
