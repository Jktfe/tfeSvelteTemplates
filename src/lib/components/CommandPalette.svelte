<!--
	============================================================
	CommandPalette Component - CMD+K Searchable Command Interface
	============================================================

	🎯 WHAT IT DOES
	A keyboard-driven command palette overlay (like VS Code's CMD+K or Linear's
	command menu) that lets users quickly search and execute actions, navigate
	pages, or find recent items through a single search interface.

	✨ FEATURES
	• Global keyboard shortcut (CMD/Ctrl+K) to open
	• Fuzzy search with highlighted matches
	• Grouped results with section headers
	• Arrow key navigation with visual focus indicator
	• Keyboard shortcut hints on commands
	• Smooth open/close transitions
	• Click-outside to dismiss

	♿ ACCESSIBILITY
	• Keyboard: CMD/Ctrl+K to open, Escape to close, Arrow Up/Down to navigate, Enter to select
	• Screen readers: role="dialog", aria-modal, aria-label, live region for result count
	• Focus: Trapped inside palette when open, returns to trigger on close
	• Motion: Respects prefers-reduced-motion for transitions

	📦 DEPENDENCIES
	Zero external dependencies — pure Svelte 5 runes + scoped CSS

	⚡ PERFORMANCE
	• Fuzzy search runs client-side on each keystroke (fine for up to ~500 items)
	• Results are capped by maxResults prop to keep DOM lean

	🎨 USAGE
	<CommandPalette items={commands} />

	📋 PROPS
	| Prop         | Type                  | Default                       | Description                    |
	|--------------|-----------------------|-------------------------------|--------------------------------|
	| items        | CommandPaletteItem[]  | required                      | Available commands/actions      |
	| placeholder  | string                | 'Type a command or search...' | Search input placeholder        |
	| emptyMessage | string                | 'No results found.'           | Message when no results match   |
	| shortcutKey  | string                | 'k'                           | Key to open with ⌘/Ctrl        |
	| maxResults   | number                | 10                            | Maximum results to show         |
	| isOpen       | boolean               | false                         | Bindable open/closed state      |
	| onSelect     | (item) => void        | undefined                     | Callback when command selected  |
	| onClose      | () => void            | undefined                     | Callback when palette closes    |

	============================================================
-->
<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import type { CommandPaletteItem, CommandPaletteProps } from '$lib/types';

	let {
		items,
		placeholder = 'Type a command or search...',
		emptyMessage = 'No results found.',
		shortcutKey = 'k',
		maxResults = 10,
		isOpen = $bindable(false),
		onSelect,
		onClose,
		class: className = ''
	}: CommandPaletteProps = $props();

	// -- Internal state --
	let query = $state('');
	let activeIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();
	let listEl: HTMLDivElement | undefined = $state();

	// -- Fuzzy search scoring --
	// Here's the heart of the search! We score each item based on how well
	// the query matches its label, description, and keywords. Earlier matches
	// and consecutive character matches score higher — so typing "sav" will
	// rank "Save" above "Search Archives".
	function fuzzyScore(text: string, search: string): number {
		const lower = text.toLowerCase();
		const searchLower = search.toLowerCase();

		// Exact substring match scores highest
		if (lower.includes(searchLower)) {
			// Bonus for matching at the start of the string
			const startBonus = lower.startsWith(searchLower) ? 50 : 0;
			return 100 + startBonus - lower.indexOf(searchLower);
		}

		// Character-by-character fuzzy matching
		let score = 0;
		let searchIdx = 0;
		let consecutive = 0;

		for (let i = 0; i < lower.length && searchIdx < searchLower.length; i++) {
			if (lower[i] === searchLower[searchIdx]) {
				score += 10 + consecutive * 5;
				consecutive++;
				searchIdx++;
			} else {
				consecutive = 0;
			}
		}

		// All characters must be found for a valid match
		return searchIdx === searchLower.length ? score : 0;
	}

	function scoreItem(item: CommandPaletteItem, search: string): number {
		if (!search) return 1; // Show all items when no query

		let best = 0;
		// Label is most important
		best = Math.max(best, fuzzyScore(item.label, search) * 2);
		// Description gets a moderate weight
		if (item.description) {
			best = Math.max(best, fuzzyScore(item.description, search));
		}
		// Keywords provide hidden searchability
		if (item.keywords) {
			for (const kw of item.keywords) {
				best = Math.max(best, fuzzyScore(kw, search) * 1.5);
			}
		}
		return best;
	}

	// -- Filtered and grouped results --
	// We compute filtered results reactively. Every keystroke re-derives this
	// list, scored and sorted by relevance, then sliced to maxResults.
	let filteredItems = $derived.by(() => {
		const scored = items
			.filter((item) => !item.disabled)
			.map((item) => ({ item, score: scoreItem(item, query) }))
			.filter(({ score }) => score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, maxResults)
			.map(({ item }) => item);
		return scored;
	});

	// Group the filtered items by their group property for section headers
	let groupedItems = $derived.by(() => {
		const groups: { name: string; items: CommandPaletteItem[] }[] = [];
		const seen = new SvelteMap<string, CommandPaletteItem[]>();

		for (const item of filteredItems) {
			const groupName = item.group || 'Commands';
			if (!seen.has(groupName)) {
				const arr: CommandPaletteItem[] = [];
				seen.set(groupName, arr);
				groups.push({ name: groupName, items: arr });
			}
			seen.get(groupName)!.push(item);
		}

		return groups;
	});

	// Flat list for keyboard navigation indexing
	let flatItems = $derived(groupedItems.flatMap((g) => g.items));

	// -- Highlight matching text (XSS-safe) --
	// Returns an array of segments: plain text and match spans. No @html needed —
	// we render these segments with {#each} so user-supplied text is always escaped.
	interface TextSegment {
		text: string;
		highlight: boolean;
	}

	function getSegments(text: string, search: string): TextSegment[] {
		if (!search) return [{ text, highlight: false }];
		const idx = text.toLowerCase().indexOf(search.toLowerCase());
		if (idx === -1) return [{ text, highlight: false }];
		const segments: TextSegment[] = [];
		if (idx > 0) segments.push({ text: text.slice(0, idx), highlight: false });
		segments.push({ text: text.slice(idx, idx + search.length), highlight: true });
		if (idx + search.length < text.length) {
			segments.push({ text: text.slice(idx + search.length), highlight: false });
		}
		return segments;
	}

	// -- Focus management --
	// Track what was focused before we opened so we can return focus on close
	let previouslyFocused: HTMLElement | null = null;
	let dialogEl: HTMLDivElement | undefined = $state();

	// -- Open / Close helpers --
	function open() {
		previouslyFocused = document.activeElement as HTMLElement | null;
		isOpen = true;
		query = '';
		activeIndex = 0;
		requestAnimationFrame(() => inputEl?.focus());
	}

	function close() {
		isOpen = false;
		query = '';
		// Return focus to the element that was focused before we opened
		requestAnimationFrame(() => previouslyFocused?.focus());
		previouslyFocused = null;
		onClose?.();
	}

	// Focus trap: keep Tab cycling within the palette while open
	function handleFocusTrap(e: KeyboardEvent) {
		if (e.key !== 'Tab' || !dialogEl) return;
		const focusable = dialogEl.querySelectorAll<HTMLElement>(
			'input, button, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function selectItem(item: CommandPaletteItem) {
		if (item.disabled) return;
		item.onSelect?.();
		onSelect?.(item);
		if (item.href && typeof window !== 'undefined') {
			window.location.href = item.href;
		}
		close();
	}

	// -- Keyboard handlers --
	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		// Focus trap handles Tab key
		handleFocusTrap(e);

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = (activeIndex + 1) % Math.max(flatItems.length, 1);
				scrollActiveIntoView();
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = (activeIndex - 1 + flatItems.length) % Math.max(flatItems.length, 1);
				scrollActiveIntoView();
				break;
			case 'Enter':
				e.preventDefault();
				if (flatItems[activeIndex]) {
					selectItem(flatItems[activeIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				close();
				break;
		}
	}

	function scrollActiveIntoView() {
		requestAnimationFrame(() => {
			const activeEl = listEl?.querySelector('[data-active="true"]');
			activeEl?.scrollIntoView({ block: 'nearest' });
		});
	}

	// Global keyboard shortcut: CMD/Ctrl + K to open the palette
	$effect(() => {
		function handleGlobalKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === shortcutKey) {
				e.preventDefault();
				if (isOpen) {
					close();
				} else {
					open();
				}
			}
		}

		window.addEventListener('keydown', handleGlobalKeydown);
		return () => window.removeEventListener('keydown', handleGlobalKeydown);
	});

	// Click-outside handler
	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="command-palette-backdrop {className}"
		onmousedown={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div
			bind:this={dialogEl}
			class="command-palette"
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
		>
			<!-- Search input -->
			<div class="command-palette-header">
				<svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					class="command-palette-input"
					{placeholder}
					autocomplete="off"
					spellcheck="false"
					role="combobox"
						aria-expanded="true"
						aria-controls="command-palette-list"
						aria-activedescendant={flatItems[activeIndex] ? `cmd-${flatItems[activeIndex].id}` : undefined}
						oninput={() => (activeIndex = 0)}
					/>
				<kbd class="shortcut-badge">ESC</kbd>
			</div>

			<!-- Results list -->
			<div class="command-palette-body" bind:this={listEl} id="command-palette-list" role="listbox">
				{#if flatItems.length === 0}
					<div class="command-palette-empty">{emptyMessage}</div>
				{:else}
					{#each groupedItems as group (group.name)}
						<div class="command-palette-group">
							<div class="group-header" role="presentation">{group.name}</div>
							{#each group.items as item (item.id)}
								{@const itemIndex = flatItems.indexOf(item)}
								{@const isActive = itemIndex === activeIndex}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									id="cmd-{item.id}"
									class="command-palette-item"
									class:active={isActive}
									data-active={isActive}
									role="option"
									tabindex="-1"
									aria-selected={isActive}
									onmouseenter={() => (activeIndex = itemIndex)}
									onclick={() => selectItem(item)}
								>
									{#if item.icon}
										<span class="item-icon">{item.icon}</span>
									{/if}
									<div class="item-content">
										<span class="item-label">
												{#each getSegments(item.label, query) as seg, i (`${i}-${seg.text}-${seg.highlight}`)}{#if seg.highlight}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
										</span>
										{#if item.description}
											<span class="item-description">
													{#each getSegments(item.description, query) as seg, i (`${i}-${seg.text}-${seg.highlight}`)}{#if seg.highlight}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
											</span>
										{/if}
									</div>
									{#if item.shortcut}
										<kbd class="item-shortcut">{item.shortcut}</kbd>
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Footer with result count -->
			<div class="command-palette-footer">
				<span class="sr-only" aria-live="polite">
					{flatItems.length} result{flatItems.length !== 1 ? 's' : ''} available
				</span>
				<span class="footer-hint">
					<kbd>↑↓</kbd> navigate
					<kbd>↵</kbd> select
					<kbd>esc</kbd> close
				</span>
				<span class="footer-count">
					{flatItems.length} result{flatItems.length !== 1 ? 's' : ''}
				</span>
			</div>
		</div>
	</div>
{/if}

<style>
	/* -- Backdrop overlay -- */
	.command-palette-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 20vh;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		animation: backdrop-fade-in 0.15s ease-out;
	}

	/* -- Main palette container -- */
	.command-palette {
		width: 100%;
		max-width: 560px;
		margin: 0 1rem;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		animation: palette-slide-in 0.15s ease-out;
	}

	/* -- Header with search input -- */
	.command-palette-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.search-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: #94a3b8;
		flex-shrink: 0;
	}

	.command-palette-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		line-height: 1.5;
		color: #1e293b;
		background: transparent;
		font-family: inherit;
	}

	.command-palette-input::placeholder {
		color: #94a3b8;
	}

	.shortcut-badge {
		flex-shrink: 0;
		padding: 0.125rem 0.5rem;
		font-size: 0.75rem;
		font-family: inherit;
		color: #64748b;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
	}

	/* -- Results body -- */
	.command-palette-body {
		max-height: 320px;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.command-palette-empty {
		padding: 2rem 1rem;
		text-align: center;
		color: #94a3b8;
		font-size: 0.875rem;
	}

	/* -- Grouped results -- */
	.command-palette-group {
		padding: 0.25rem 0;
	}

	.group-header {
		padding: 0.5rem 1rem 0.25rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
	}

	/* -- Individual result item -- */
	.command-palette-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.command-palette-item.active {
		background: #f1f5f9;
	}

	.item-icon {
		flex-shrink: 0;
		width: 1.5rem;
		text-align: center;
		font-size: 1rem;
	}

	.item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.item-label {
		font-size: 0.875rem;
		color: #1e293b;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* The highlighted match text — a subtle bold+colour to draw the eye */
	.item-label mark,
	.item-description mark {
		background: transparent;
		color: #2563eb;
		font-weight: 600;
	}

	.item-description {
		font-size: 0.75rem;
		color: #94a3b8;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-shortcut {
		flex-shrink: 0;
		padding: 0.125rem 0.375rem;
		font-size: 0.6875rem;
		font-family: inherit;
		color: #94a3b8;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
	}

	/* -- Footer -- */
	.command-palette-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		border-top: 1px solid #e2e8f0;
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.footer-hint {
		display: flex;
		gap: 0.5rem;
	}

	.footer-hint kbd {
		padding: 0 0.25rem;
		font-family: inherit;
		font-size: 0.6875rem;
		color: #64748b;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 3px;
	}

	/* -- Screen reader only -- */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* -- Animations -- */
	@keyframes backdrop-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes palette-slide-in {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Respect reduced motion preference */
	@media (prefers-reduced-motion: reduce) {
		.command-palette-backdrop {
			animation: none;
		}
		.command-palette {
			animation: none;
		}
	}

	/* -- Scrollbar styling -- */
	.command-palette-body::-webkit-scrollbar {
		width: 6px;
	}

	.command-palette-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.command-palette-body::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	.command-palette-body::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
