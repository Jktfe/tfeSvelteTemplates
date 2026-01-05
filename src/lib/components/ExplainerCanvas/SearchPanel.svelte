<script lang="ts">
	/**
	 * Search Panel Component
	 *
	 * Fuzzy search interface for finding cards across all nesting levels.
	 * Shows results with match context and path information.
	 *
	 * @component
	 */

	import type { ExplainerSearchResult } from '$lib/types';

	interface Props {
		isOpen?: boolean;
		results?: ExplainerSearchResult[];
		query?: string;
		onQueryChange?: (query: string) => void;
		onResultSelect?: (result: ExplainerSearchResult) => void;
		onClose?: () => void;
	}

	let {
		isOpen = false,
		results = [],
		query = '',
		onQueryChange,
		onResultSelect,
		onClose
	}: Props = $props();

	let inputRef: HTMLInputElement | undefined = $state();
	let selectedIndex = $state(-1);

	// Focus input when panel opens
	$effect(() => {
		if (isOpen && inputRef) {
			inputRef.focus();
			selectedIndex = -1;
		}
	});

	// Reset selection when results change
	$effect(() => {
		if (results.length > 0) {
			selectedIndex = -1;
		}
	});

	/**
	 * Handle input change
	 */
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onQueryChange?.(target.value);
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				onClose?.();
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (results.length > 0) {
					selectedIndex = (selectedIndex + 1) % results.length;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (results.length > 0) {
					selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < results.length) {
					onResultSelect?.(results[selectedIndex]);
				}
				break;
		}
	}

	/**
	 * Handle result click
	 */
	function handleResultClick(result: ExplainerSearchResult) {
		onResultSelect?.(result);
	}

	/**
	 * Format path for display
	 */
	function formatPath(path: string[]): string {
		if (path.length <= 1) return '';
		return path.slice(0, -1).join(' → ');
	}
</script>

{#if isOpen}
	<div class="search-panel" role="dialog" aria-label="Search cards">
		<!-- Search input -->
		<div class="search-input-wrapper">
			<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				bind:this={inputRef}
				type="text"
				class="search-input"
				placeholder="Search cards..."
				value={query}
				oninput={handleInput}
				onkeydown={handleKeydown}
				role="combobox"
				aria-label="Search cards"
				aria-autocomplete="list"
				aria-controls="search-results"
				aria-expanded={results.length > 0}
			/>
			<button
				type="button"
				class="search-close"
				onclick={() => onClose?.()}
				aria-label="Close search"
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<!-- Search results -->
		{#if query.length >= 2}
			<ul
				id="search-results"
				class="search-results"
				role="listbox"
				aria-label="Search results"
			>
				{#if results.length === 0}
					<li class="search-empty">
						No cards found matching "{query}"
					</li>
				{:else}
					{#each results as result, index (result.card.id)}
						<li
							class="search-result"
							class:selected={index === selectedIndex}
							role="option"
							aria-selected={index === selectedIndex}
							onclick={() => handleResultClick(result)}
						>
							<div class="result-content">
								<div class="result-title">{result.card.title}</div>
								<div class="result-summary">{result.card.summary}</div>
								{#if result.path.length > 1}
									<div class="result-path">{formatPath(result.path)}</div>
								{/if}
							</div>
							<div class="result-match-indicator" title="Matched in {result.matchField}">
								{#if result.matchField === 'title'}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M4 7V4h16v3M9 20h6M12 4v16" />
									</svg>
								{:else if result.matchField === 'summary'}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<line x1="17" y1="10" x2="3" y2="10" />
										<line x1="21" y1="6" x2="3" y2="6" />
										<line x1="21" y1="14" x2="3" y2="14" />
										<line x1="17" y1="18" x2="3" y2="18" />
									</svg>
								{:else}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
										<polyline points="14 2 14 8 20 8" />
										<line x1="16" y1="13" x2="8" y2="13" />
										<line x1="16" y1="17" x2="8" y2="17" />
										<polyline points="10 9 9 9 8 9" />
									</svg>
								{/if}
							</div>
						</li>
					{/each}
				{/if}
			</ul>
		{/if}

		<!-- Keyboard hints -->
		<div class="search-hints">
			<span class="hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
			<span class="hint"><kbd>Enter</kbd> Select</span>
			<span class="hint"><kbd>Esc</kbd> Close</span>
		</div>
	</div>
{/if}

<style>
	.search-panel {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: var(--ec-bg-card, #ffffff);
		border-bottom: 1px solid var(--ec-border, #e0e0e0);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 100;
		display: flex;
		flex-direction: column;
		max-height: 400px;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--ec-border, #e8e8e8);
	}

	.search-icon {
		color: var(--ec-text-muted, #999);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		padding: 0.5rem 0;
		font-size: 1rem;
		color: var(--ec-text, #1a1a1a);
		background: transparent;
		border: none;
		outline: none;
	}

	.search-input::placeholder {
		color: var(--ec-text-muted, #999);
	}

	.search-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		color: var(--ec-text-muted, #666);
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.search-close:hover {
		color: var(--ec-text, #1a1a1a);
		background: var(--ec-bg, #f5f5f5);
	}

	.search-results {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.search-empty {
		padding: 1.5rem 1rem;
		text-align: center;
		color: var(--ec-text-muted, #666);
		font-size: 0.875rem;
	}

	.search-result {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background 0.15s ease;
		border-bottom: 1px solid var(--ec-border, #f0f0f0);
	}

	.search-result:hover,
	.search-result.selected {
		background: var(--ec-bg, #f5f5f5);
	}

	.search-result.selected {
		background: rgba(59, 130, 246, 0.1);
	}

	.result-content {
		flex: 1;
		min-width: 0;
	}

	.result-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
		margin-bottom: 0.25rem;
	}

	.result-summary {
		font-size: 0.8125rem;
		color: var(--ec-text-muted, #666);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.result-path {
		font-size: 0.75rem;
		color: var(--ec-text-muted, #999);
		margin-top: 0.375rem;
	}

	.result-match-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: var(--ec-text-muted, #999);
		opacity: 0.6;
	}

	.search-hints {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 0.5rem 1rem;
		background: var(--ec-bg, #fafafa);
		border-top: 1px solid var(--ec-border, #e8e8e8);
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--ec-text-muted, #666);
	}

	.hint kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 0.375rem;
		font-size: 0.6875rem;
		font-family: inherit;
		color: var(--ec-text-muted, #666);
		background: var(--ec-bg-card, #ffffff);
		border: 1px solid var(--ec-border, #ddd);
		border-radius: 4px;
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
	}
</style>

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
