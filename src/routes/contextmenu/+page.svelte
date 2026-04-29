<script lang="ts">
	import ContextMenu, { type ContextMenuItem } from '$lib/components/ContextMenu.svelte';

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
</script>

<svelte:head>
	<title>ContextMenu · TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<h1>ContextMenu</h1>
		<p>
			Right-click / long-press menu primitive. Wraps any trigger; right-click suppresses the
			native browser menu and opens a custom one at the click position. Items are passed
			declaratively as a prop array — the consumer never has to wire keyboard navigation,
			viewport clamping, or focus management themselves. Pointer + keyboard parity from line one.
			<code>prefers-reduced-motion</code> skips the entrance animation; the action contract is
			preserved.
		</p>
	</header>

	<section class="demo">
		<h2>1. Right-click a file row</h2>
		<p class="caption">
			Eight items, two dividers, one disabled (<code>Export</code>), one danger (<code
				>Move to Trash</code
			>). Right-click on the row, or focus it and press <kbd>Shift</kbd>+<kbd>F10</kbd>. Use
			<kbd>↑</kbd>/<kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select, <kbd>Esc</kbd> to close.
		</p>
		<div class="surface">
			<ContextMenu items={fileItems} onSelect={record} ariaLabel="File actions">
				<div class="file-row">
					<span class="file-icon">📄</span>
					<span class="file-name">Quarterly-Report.pdf</span>
					<span class="file-meta">2.4 MB · Modified 2 days ago</span>
				</div>
			</ContextMenu>
		</div>
	</section>

	<section class="demo">
		<h2>2. Minimal — three items, no dividers</h2>
		<p class="caption">
			The simplest possible menu. Useful for inline content where users only need the basic
			edit-clipboard actions. No shortcuts, no danger, no dividers.
		</p>
		<div class="surface">
			<ContextMenu items={minimalItems} onSelect={record} ariaLabel="Edit actions">
				<div class="text-block">
					Right-click anywhere in this paragraph to open a minimal three-item menu. The default
					browser menu is suppressed so you only see the custom one — no double-menu collision.
				</div>
			</ContextMenu>
		</div>
	</section>

	<section class="demo">
		<h2>3. Danger styling — red destructive items</h2>
		<p class="caption">
			Items with <code>danger: true</code> render in red so destructive choices read at a glance.
			Pair with <code>HoldToConfirm</code> for the actual commit gesture.
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

	<section class="demo">
		<h2>4. Disabled trigger</h2>
		<p class="caption">
			With <code>disabled</code> the trigger ignores right-click and keyboard activators;
			<code>aria-disabled</code> reflects the state. Use this while a parent action is in flight.
		</p>
		<div class="surface">
			<ContextMenu items={minimalItems} onSelect={record} disabled>
				<div class="text-block disabled-block">
					This trigger is disabled — right-click does nothing.
				</div>
			</ContextMenu>
		</div>
	</section>

	<section class="readout">
		{#if lastSelected}
			<span>
				Last selected: <code>{lastSelected}</code>
			</span>
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
	</section>

	<section class="meta">
		<div class="meta-grid">
			<div class="meta-card">
				<h3>Pointer + keyboard parity</h3>
				<p>
					Right-click opens at the click point. <kbd>Shift</kbd>+<kbd>F10</kbd> and the dedicated
					<kbd>ContextMenu</kbd> key open anchored to the trigger's bottom-left. <kbd>↑</kbd>/<kbd
						>↓</kbd
					>
					navigate (skipping dividers and disabled), <kbd>Home</kbd>/<kbd>End</kbd> jump to the first /
					last enabled item, <kbd>Enter</kbd>/<kbd>Space</kbd> activate, <kbd>Esc</kbd>/<kbd>Tab</kbd
					>
					close. No 2-step click fakery — the keyboard contract matches WAI-ARIA's menu pattern.
				</p>
			</div>
			<div class="meta-card">
				<h3>Auto-positioning</h3>
				<p>
					<code>clampToViewport</code> flips the menu when it would overflow the right or bottom edge,
					with an 8 px safety padding so the menu never sits flush against the viewport edge. The flip
					happens after the menu mounts and measures, so the helper sees real dimensions, not a guess.
				</p>
			</div>
			<div class="meta-card">
				<h3>Native menu suppression</h3>
				<p>
					<code>event.preventDefault()</code> on the trigger's <code>contextmenu</code> event so the
					page never shows two menus at once. The default browser menu still works on the rest of the
					page — only the wrapped target is intercepted.
				</p>
			</div>
			<div class="meta-card">
				<h3>Declarative items</h3>
				<p>
					Items are a single prop array of <code>{'{ id, label, shortcut?, disabled?, danger? }'}</code
					>
					or <code>{'{ type: "divider" }'}</code>. <code>normalizeItems</code> strips invalid entries,
					dedupes by id, and coerces optional fields to safe defaults — so untrusted input from a
					feature flag or remote config can't crash the menu.
				</p>
			</div>
			<div class="meta-card">
				<h3>Reduced-motion bypass</h3>
				<p>
					<code>prefers-reduced-motion: reduce</code> skips the entrance animation. The contract —
					open, navigate, select, close — is preserved; only the visual transition is removed.
				</p>
			</div>
			<div class="meta-card">
				<h3>Mount-on-open</h3>
				<p>
					The menu is only mounted while open, so when closed there is zero DOM cost beyond the
					trigger wrapper. No <code>requestAnimationFrame</code>, no <code>ResizeObserver</code>.
					Position is computed once on open and held until close.
				</p>
			</div>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		color: #e6e6e6;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin: 0 0 0.5rem;
		background: linear-gradient(135deg, #ffffff, #c9c9d1, #6d6d7a);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hero p {
		font-size: 1.125rem;
		line-height: 1.6;
		max-width: 720px;
		color: #a8a8b8;
	}

	.hero code,
	.caption code,
	.meta-card code {
		background: #1a1a2e;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		font-size: 0.9em;
		color: #c9c9d1;
	}

	kbd {
		font-family: 'Fira Code', monospace;
		background: #1a1a2e;
		border: 1px solid #2a2a3e;
		border-bottom-width: 2px;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		font-size: 0.85em;
		color: #c9c9d1;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem;
		color: #fff;
	}

	.caption {
		color: #8c8c9c;
		font-size: 0.95rem;
		margin: 0 0 1.5rem;
		line-height: 1.6;
	}

	.surface {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		justify-content: center;
	}

	.file-row,
	.trash-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #1a1a2e;
		border-radius: 8px;
		min-width: 360px;
		cursor: context-menu;
	}

	.file-icon {
		font-size: 1.5rem;
	}

	.file-name {
		flex: 0 0 auto;
		color: #e6e6e6;
		font-weight: 500;
	}

	.file-meta {
		flex: 1 1 auto;
		text-align: right;
		color: #8c8c9c;
		font-size: 0.85rem;
	}

	.text-block {
		max-width: 520px;
		padding: 1rem 1.25rem;
		background: #1a1a2e;
		border-radius: 8px;
		color: #c9c9d1;
		line-height: 1.6;
		font-size: 0.95rem;
		cursor: context-menu;
	}

	.disabled-block {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.readout {
		margin: 0 0 4rem;
		padding: 1.25rem 1.5rem;
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: #a8a8b8;
	}

	.readout code {
		background: #1a1a2e;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		color: #38bdf8;
		font-family: 'Fira Code', monospace;
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.log-time {
		color: #6d6d7a;
		font-size: 0.85em;
		margin-left: 0.5rem;
	}

	.meta {
		margin-top: 4rem;
		border-top: 1px solid #1f1f3a;
		padding-top: 3rem;
	}

	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1.5rem;
	}

	.meta-card {
		background: #0d0d1a;
		border: 1px solid #1f1f3a;
		border-radius: 12px;
		padding: 1.25rem;
	}

	.meta-card h3 {
		font-size: 1rem;
		margin: 0 0 0.5rem;
		color: #c9c9d1;
	}

	.meta-card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #a8a8b8;
	}
</style>
