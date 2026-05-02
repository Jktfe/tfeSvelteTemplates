<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { FALLBACK_COMMAND_PALETTE_ITEMS } from '$lib/constants';
	import type { CommandPaletteItem } from '$lib/types';

	const shell = catalogShellPropsForSlug('/commandpalette')!;

	let paletteOpen = $state(false);
	let controlledOpen = $state(false);
	let groupedOpen = $state(false);
	let selectedLog = $state<string[]>([]);
	let lastGroupedSelection = $state<CommandPaletteItem | null>(null);

	function handleSelect(item: CommandPaletteItem) {
		selectedLog = [`Selected: ${item.icon ?? ''} ${item.label}`, ...selectedLog.slice(0, 9)];
	}

	function handleGroupedSelect(item: CommandPaletteItem) {
		lastGroupedSelection = item;
	}

	const items = FALLBACK_COMMAND_PALETTE_ITEMS;

	// A richer item list with four groups and lots of keyword aliases. The fuzzy
	// matcher weighs label > keyword > description, so typing a keyword still
	// surfaces the right item even when it's nowhere in the visible label.
	const groupedItems: CommandPaletteItem[] = [
		// File group
		{
			id: 'file-new',
			label: 'New File',
			description: 'Start a fresh document',
			icon: '📄',
			group: 'File',
			shortcut: '⌘N',
			keywords: ['create', 'add', 'blank']
		},
		{
			id: 'file-open',
			label: 'Open…',
			description: 'Open a recent file',
			icon: '📂',
			group: 'File',
			shortcut: '⌘O',
			keywords: ['load', 'browse', 'recent']
		},
		{
			id: 'file-save',
			label: 'Save',
			description: 'Persist current document',
			icon: '💾',
			group: 'File',
			shortcut: '⌘S',
			keywords: ['store', 'write', 'commit']
		},
		// Edit group
		{
			id: 'edit-undo',
			label: 'Undo',
			description: 'Reverse last change',
			icon: '↶',
			group: 'Edit',
			shortcut: '⌘Z',
			keywords: ['back', 'revert', 'rewind']
		},
		{
			id: 'edit-redo',
			label: 'Redo',
			description: 'Replay last reversed change',
			icon: '↷',
			group: 'Edit',
			shortcut: '⇧⌘Z',
			keywords: ['forward', 'repeat']
		},
		{
			id: 'edit-find',
			label: 'Find in File',
			description: 'Search the current document',
			icon: '🔍',
			group: 'Edit',
			shortcut: '⌘F',
			keywords: ['search', 'locate', 'grep']
		},
		// View group
		{
			id: 'view-zoom-in',
			label: 'Zoom In',
			description: 'Increase viewport scale',
			icon: '🔎',
			group: 'View',
			shortcut: '⌘=',
			keywords: ['enlarge', 'bigger', 'magnify']
		},
		{
			id: 'view-toggle-sidebar',
			label: 'Toggle Sidebar',
			description: 'Hide or show the file tree',
			icon: '📐',
			group: 'View',
			shortcut: '⌘B',
			keywords: ['panel', 'rail', 'navigation']
		},
		{
			id: 'view-settings',
			label: 'Settings',
			description: 'Open editor preferences',
			icon: '⚙️',
			group: 'View',
			shortcut: '⌘,',
			// Try typing "preferences" or "config" — the keyword alias matches
			// even though neither word is in the visible label.
			keywords: ['preferences', 'config', 'options', 'gear']
		},
		// Help group
		{
			id: 'help-docs',
			label: 'Documentation',
			description: 'Open the docs site',
			icon: '📚',
			group: 'Help',
			keywords: ['manual', 'guide', 'reference', 'help']
		},
		{
			id: 'help-shortcuts',
			label: 'Keyboard Shortcuts',
			description: 'View all keybindings',
			icon: '⌨️',
			group: 'Help',
			shortcut: '⌘/',
			keywords: ['hotkeys', 'bindings', 'keys']
		},
		{
			id: 'help-feedback',
			label: 'Send Feedback',
			description: 'Tell us what you think',
			icon: '💬',
			group: 'Help',
			keywords: ['contact', 'support', 'bug', 'report']
		}
	];

	const codeExplanation =
		'CommandPalette wires CMD/Ctrl+K to a global keydown listener and traps focus inside the dialog while open. Each result is scored against the query (label > description > hidden keywords) using a tiny in-file fuzzy ranker that exits early once enough matches are found, so even hundreds of items stay snappy. Up/Down arrows roll over, Enter activates, Escape closes — the underlying state is a single bindable isOpen so parents can open the palette programmatically.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Keyboard', 'A11y', 'Search', 'CMD-K']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cmd-demo">
			<section>
				<h3>Default · keyboard or click</h3>
				<p class="note">
					Press <kbd>⌘K</kbd> (Mac) or <kbd>Ctrl+K</kbd> (Windows/Linux), or click the button below.
				</p>
				<button class="open-btn" onclick={() => (paletteOpen = true)}>
					<svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon" aria-hidden="true">
						<path
							fill-rule="evenodd"
							d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
							clip-rule="evenodd"
						/>
					</svg>
					Open Command Palette
					<kbd class="btn-shortcut">⌘K</kbd>
				</button>
			</section>

			<section>
				<h3>Controlled state · <code>bind:isOpen</code></h3>
				<p class="note">
					The bound boolean below is the single source of truth. Toggle it from anywhere and the palette obeys.
				</p>
				<div class="controls-row">
					<button class="open-btn" onclick={() => (controlledOpen = !controlledOpen)}>
						{controlledOpen ? 'Close palette' : 'Open palette'}
					</button>
					<div class="state-badge" class:state-on={controlledOpen}>
						isOpen = <code>{controlledOpen}</code>
					</div>
				</div>
			</section>

			<section>
				<h3>Grouped + keyword fuzzy-match</h3>
				<p class="note">
					Four groups (File / Edit / View / Help) with keyword aliases. Try typing
					<kbd>preferences</kbd> — &ldquo;Settings&rdquo; matches via its hidden keyword. Or try
					<kbd>hotkeys</kbd>, <kbd>magnify</kbd>, or <kbd>grep</kbd>.
				</p>
				<button class="open-btn" onclick={() => (groupedOpen = true)}>
					<span aria-hidden="true">🗂️</span>
					Open grouped palette
				</button>
				{#if lastGroupedSelection}
					<p class="note last-pick">
						Last pick:
						<strong>
							{lastGroupedSelection.icon ?? ''}
							{lastGroupedSelection.label}
						</strong>
						<span class="muted">in {lastGroupedSelection.group}</span>
					</p>
				{/if}
			</section>

			{#if selectedLog.length > 0}
				<section>
					<h3>Selection log</h3>
					<div class="log-list">
						{#each selectedLog as entry, i (i)}
							<div class="log-entry">{entry}</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<CommandPalette {items} bind:isOpen={paletteOpen} onSelect={handleSelect} />
		<!-- Controlled palette: parent fully owns isOpen and there is no shortcutKey conflict
		     because we use a unique key here. -->
		<CommandPalette
			{items}
			bind:isOpen={controlledOpen}
			shortcutKey="j"
			onSelect={handleSelect}
		/>
		<!-- Grouped palette: distinct shortcut so opening one doesn't trip the others. -->
		<CommandPalette
			items={groupedItems}
			bind:isOpen={groupedOpen}
			shortcutKey="g"
			placeholder="Search commands or try a keyword (preferences, magnify, grep)…"
			onSelect={handleGroupedSelect}
		/>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>items</code></td>
					<td><code>CommandPaletteItem[]</code></td>
					<td>—</td>
					<td>Required. Each item: <code>id</code>, <code>label</code>, optional <code>description</code>, <code>icon</code>, <code>group</code>, <code>shortcut</code>, <code>keywords</code>, <code>onSelect</code>, <code>href</code>.</td>
				</tr>
				<tr>
					<td><code>isOpen</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable open state.</td>
				</tr>
				<tr>
					<td><code>placeholder</code></td>
					<td><code>string</code></td>
					<td><code>'Type a command or search…'</code></td>
					<td>Search input placeholder.</td>
				</tr>
				<tr>
					<td><code>emptyMessage</code></td>
					<td><code>string</code></td>
					<td><code>'No results found.'</code></td>
					<td>Shown when nothing matches the query.</td>
				</tr>
				<tr>
					<td><code>shortcutKey</code></td>
					<td><code>string</code></td>
					<td><code>'k'</code></td>
					<td>Key to combine with ⌘/Ctrl to open globally.</td>
				</tr>
				<tr>
					<td><code>maxResults</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Cap on visible results per render.</td>
				</tr>
				<tr>
					<td><code>onSelect</code></td>
					<td><code>(item) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when an item is activated.</td>
				</tr>
				<tr>
					<td><code>onClose</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the palette closes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cmd-demo {
		display: grid;
		gap: 2rem;
	}

	.cmd-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 1rem;
		color: var(--fg-2);
		font-size: 0.9rem;
	}

	.note kbd {
		padding: 0.125rem 0.5rem;
		font-size: 0.8rem;
		color: var(--fg-1);
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.open-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.1rem;
		font-size: 0.9rem;
		color: var(--fg-1);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
	}

	.open-btn:hover {
		filter: brightness(0.97);
	}

	.btn-icon {
		width: 1rem;
		height: 1rem;
		color: var(--fg-2);
	}

	.btn-shortcut {
		padding: 0.125rem 0.375rem;
		font-size: 0.75rem;
		color: var(--fg-2);
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 4px;
	}

	.log-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.log-entry {
		padding: 0.4rem 0.75rem;
		font-size: 0.8rem;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}

	.controls-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.state-badge {
		padding: 0.45rem 0.85rem;
		font-size: 0.85rem;
		color: var(--fg-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 999px;
	}

	.state-badge.state-on {
		color: #166534;
		background: #dcfce7;
		border-color: #86efac;
	}

	.state-badge code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}

	.last-pick strong {
		color: var(--fg-1);
	}

	.last-pick .muted {
		color: var(--fg-2);
		font-size: 0.85em;
		margin-left: 0.35rem;
	}
</style>
