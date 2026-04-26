<script lang="ts">
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';
	import { FALLBACK_COMMAND_PALETTE_ITEMS } from '$lib/constants';
	import type { CommandPaletteItem } from '$lib/types';

	let paletteOpen = $state(false);
	let selectedLog = $state<string[]>([]);

	function handleSelect(item: CommandPaletteItem) {
		selectedLog = [`Selected: ${item.icon ?? ''} ${item.label}`, ...selectedLog.slice(0, 9)];
	}

	// Custom items list — use the fallback data as our demo commands
	const items = FALLBACK_COMMAND_PALETTE_ITEMS;
	const usageExample = `<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import type { CommandPaletteItem } from '$lib/types';

  const commands: CommandPaletteItem[] = [
    {
      id: 'save',
      label: 'Save',
      description: 'Save current document',
      icon: '💾',
      group: 'Actions',
      shortcut: '⌘S',
      onSelect: () => console.log('Saving...')
    },
    {
      id: 'home',
      label: 'Go Home',
      icon: '🏠',
      group: 'Navigation',
      href: '/'
    }
  ];
</${'script'}>

<CommandPalette items={commands} />`;
</script>

<svelte:head>
	<title>Command Palette | TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Command Palette</h1>
		<p class="subtitle">
			A CMD+K style searchable command interface — keyboard-driven, grouped results, fuzzy search.
			Zero external dependencies.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</header>

	<!-- Trigger buttons -->
	<section class="demo-section">
		<h2>Try It</h2>
		<p class="hint">
			Press <kbd>⌘K</kbd> (Mac) or <kbd>Ctrl+K</kbd> (Windows/Linux) anywhere on this page,
			or click the button below.
		</p>
		<button class="open-button" onclick={() => (paletteOpen = true)}>
			<svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon" aria-hidden="true">
				<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
			</svg>
			Open Command Palette
			<kbd class="btn-shortcut">⌘K</kbd>
		</button>
	</section>

	<!-- Selection log -->
	{#if selectedLog.length > 0}
		<section class="demo-section">
			<h2>Selection Log</h2>
			<div class="log-list">
				{#each selectedLog as entry, i (i)}
					<div class="log-entry">{entry}</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Features -->
	<section class="demo-section">
		<h2>Features</h2>
		<div class="features-grid">
			<div class="feature-card">
				<span class="feature-icon">⌨️</span>
				<h3>Keyboard-First</h3>
				<p>CMD/Ctrl+K to open, arrow keys to navigate, Enter to select, Escape to close.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">🔍</span>
				<h3>Fuzzy Search</h3>
				<p>Smart scoring matches labels, descriptions, and hidden keywords with highlighted results.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">📂</span>
				<h3>Grouped Results</h3>
				<p>Commands are organised into sections (Actions, Navigation, Recent) with clear headers.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">♿</span>
				<h3>Accessible</h3>
				<p>Full ARIA support, focus trapping, screen reader announcements, and reduced motion respect.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">📦</span>
				<h3>Zero Dependencies</h3>
				<p>Pure Svelte 5 runes and scoped CSS. Copy-paste ready into any project.</p>
			</div>
			<div class="feature-card">
				<span class="feature-icon">⚡</span>
				<h3>Lightweight</h3>
				<p>No virtual DOM overhead. Results scored and filtered reactively with $derived.</p>
			</div>
		</div>
	</section>

	<!-- Usage example -->
	<section class="demo-section">
		<h2>Usage</h2>
		<pre class="code-block"><code>{usageExample}</code></pre>
	</section>
</div>

<!-- The palette itself — rendered as a portal overlay -->
<CommandPalette
	{items}
	bind:isOpen={paletteOpen}
	onSelect={handleSelect}
/>

<style>
	.page-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #64748b;
		font-size: 1.05rem;
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.demo-section {
		margin-bottom: 2.5rem;
	}

	.demo-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.75rem;
	}

	.hint {
		color: #64748b;
		margin: 0 0 1rem;
		font-size: 0.9rem;
	}

	.hint kbd {
		padding: 0.125rem 0.5rem;
		font-size: 0.8rem;
		font-family: inherit;
		color: #1e293b;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
	}

	.open-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.9rem;
		font-family: inherit;
		color: #475569;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		cursor: pointer;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		transition: all 0.15s ease;
	}

	.open-button:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
		color: #94a3b8;
	}

	.btn-shortcut {
		padding: 0.125rem 0.375rem;
		font-size: 0.75rem;
		font-family: inherit;
		color: #94a3b8;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		margin-left: 0.25rem;
	}

	/* Log */
	.log-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.log-entry {
		padding: 0.375rem 0.75rem;
		font-size: 0.8rem;
		color: #475569;
		background: #f8fafc;
		border: 1px solid #f1f5f9;
		border-radius: 6px;
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}

	/* Features grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
	}

	.feature-card {
		padding: 1.25rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
	}

	.feature-icon {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.feature-card h3 {
		font-size: 0.9rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem;
	}

	.feature-card p {
		font-size: 0.8rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	/* Code block */
	.code-block {
		padding: 1.25rem;
		background: #1e293b;
		color: #e2e8f0;
		border-radius: 10px;
		overflow-x: auto;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.code-block code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
	}
</style>
