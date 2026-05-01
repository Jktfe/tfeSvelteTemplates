<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { FALLBACK_COMMAND_PALETTE_ITEMS } from '$lib/constants';
	import type { CommandPaletteItem } from '$lib/types';

	const shell = catalogShellPropsForSlug('/commandpalette')!;

	let paletteOpen = $state(false);
	let selectedLog = $state<string[]>([]);

	function handleSelect(item: CommandPaletteItem) {
		selectedLog = [`Selected: ${item.icon ?? ''} ${item.label}`, ...selectedLog.slice(0, 9)];
	}

	const items = FALLBACK_COMMAND_PALETTE_ITEMS;

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
				<h3>Try it</h3>
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
</style>
