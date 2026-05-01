<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ContextMenu, { type ContextMenuItem } from '$lib/components/ContextMenu.svelte';

	const shell = catalogShellPropsForSlug('/contextmenu')!;

	let lastSelected = $state<string | null>(null);
	let selectionLog = $state<Array<{ id: string; at: string }>>([]);

	function record(id: string) {
		lastSelected = id;
		const at = new Date().toLocaleTimeString();
		selectionLog = [{ id, at }, ...selectionLog].slice(0, 5);
	}

	const fileItems: ContextMenuItem[] = [
		{ id: 'open', label: 'Open', shortcut: '⌘O' },
		{ id: 'rename', label: 'Rename', shortcut: '⏎' },
		{ id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
		{ type: 'divider' },
		{ id: 'share', label: 'Share…', shortcut: '⇧⌘S' },
		{ id: 'export', label: 'Export', disabled: true },
		{ type: 'divider' },
		{ id: 'delete', label: 'Move to Trash', shortcut: '⌫', danger: true }
	];

	const minimalItems: ContextMenuItem[] = [
		{ id: 'cut', label: 'Cut' },
		{ id: 'copy', label: 'Copy' },
		{ id: 'paste', label: 'Paste' }
	];

	const dangerItems: ContextMenuItem[] = [
		{ id: 'restore', label: 'Restore from Trash' },
		{ id: 'preview', label: 'Preview' },
		{ type: 'divider' },
		{ id: 'permadelete', label: 'Delete Permanently', danger: true }
	];

	const codeExplanation =
		'ContextMenu intercepts the contextmenu event on its trigger and renders the menu only while open, so when closed there is zero DOM cost beyond the wrapper. Right-click opens at the click point; Shift+F10 and the dedicated menu key open anchored to the trigger. ↑/↓ navigate (skipping dividers and disabled items), Home/End jump to the ends, Enter activates, Esc closes — full WAI-ARIA menu pattern. clampToViewport flips the menu after mount when it would overflow, with an 8px safety padding.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Keyboard', 'A11y', 'Pointer', 'WAI-ARIA']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ctx-demo">
			<section>
				<h3>Right-click a file row</h3>
				<p class="note">
					Right-click on the row, or focus it and press <kbd>Shift</kbd>+<kbd>F10</kbd>. Use
					<kbd>↑</kbd>/<kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select, <kbd>Esc</kbd> to close.
				</p>
				<div class="surface">
					<ContextMenu items={fileItems} onSelect={record} ariaLabel="File actions">
						<div class="file-row">
							<span class="file-icon">📄</span>
							<span class="file-name">Quarterly-Report.pdf</span>
							<span class="file-meta">2.4 MB · 2 days ago</span>
						</div>
					</ContextMenu>
				</div>
			</section>

			<section>
				<h3>Minimal menu</h3>
				<p class="note">Three items, no dividers, no shortcuts.</p>
				<div class="surface">
					<ContextMenu items={minimalItems} onSelect={record} ariaLabel="Edit actions">
						<div class="text-block">
							Right-click anywhere in this paragraph to open a minimal three-item menu. The default
							browser menu is suppressed so you only see the custom one.
						</div>
					</ContextMenu>
				</div>
			</section>

			<section>
				<h3>Danger styling</h3>
				<p class="note">
					Items with <code>danger: true</code> render in red so destructive choices read at a glance.
				</p>
				<div class="surface">
					<ContextMenu items={dangerItems} onSelect={record} ariaLabel="Trash actions">
						<div class="trash-row">
							<span class="file-icon">🗑️</span>
							<span class="file-name">old-design-draft.fig</span>
							<span class="file-meta">Trashed 5 days ago</span>
						</div>
					</ContextMenu>
				</div>
			</section>

			<div class="readout">
				{#if lastSelected}
					<span>Last selected: <code>{lastSelected}</code></span>
				{:else}
					<span>Right-click any of the targets above to start.</span>
				{/if}
				{#if selectionLog.length > 0}
					<ul class="log">
						{#each selectionLog as entry (entry.at + entry.id)}
							<li>
								<code>{entry.id}</code>
								<span class="log-time">@ {entry.at}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
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
					<td><code>ContextMenuItem[]</code></td>
					<td>—</td>
					<td>Required. Either <code>{'{ id, label, shortcut?, disabled?, danger? }'}</code> or <code>{'{ type: "divider" }'}</code>.</td>
				</tr>
				<tr>
					<td><code>onSelect</code></td>
					<td><code>(id) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when an item is activated.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Context menu'</code></td>
					<td>Menu label for assistive tech.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Ignore right-click and keyboard activators on the trigger.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>The trigger element(s) to wrap.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ctx-demo {
		display: grid;
		gap: 2rem;
	}

	.ctx-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.45rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.85rem;
		color: var(--fg-2);
		font-size: 0.88rem;
		line-height: 1.55;
	}

	.note code,
	.readout code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.note kbd {
		font-family: 'Fira Code', monospace;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.surface {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		justify-content: center;
	}

	.file-row,
	.trash-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 8px;
		min-width: 320px;
		cursor: context-menu;
	}

	.file-icon {
		font-size: 1.4rem;
	}

	.file-name {
		font-weight: 500;
		color: var(--fg-1);
	}

	.file-meta {
		flex: 1;
		text-align: right;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.text-block {
		max-width: 520px;
		padding: 1rem 1.25rem;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 8px;
		color: var(--fg-1);
		line-height: 1.55;
		font-size: 0.95rem;
		cursor: context-menu;
	}

	.readout {
		padding: 1rem 1.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.9rem;
		color: var(--fg-2);
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.log-time {
		color: var(--fg-2);
		font-size: 0.85em;
		margin-left: 0.5rem;
	}
</style>
