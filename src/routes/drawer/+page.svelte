<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Drawer from '$lib/components/Drawer.svelte';

	const shell = catalogShellPropsForSlug('/drawer')!;

	let basicOpen = $state(false);
	let leftOpen = $state(false);
	let rightOpen = $state(false);
	let topOpen = $state(false);
	let bottomOpen = $state(false);
	let bottomSheetOpen = $state(false);
	let formOpen = $state(false);
	let formName = $state('');
	let formNotes = $state('');
	let persistentOpen = $state(false);
	let restoreOpen = $state(false);

	function openRestoreDemo() {
		restoreOpen = true;
		setTimeout(() => {
			restoreOpen = false;
		}, 1500);
	}

	const codeExplanation =
		'Drawer mounts a fixed-position panel that slides from any of four edges. On open it snapshots the active element, locks body scroll, and runs a manual focus trap so Tab and Shift+Tab cycle inside the dialog. On close it restores focus and unlocks scroll. Backdrop click and Escape both dismiss unless persistent is set; reduced-motion swaps the slide for a calm opacity fade.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Focus trap', 'Modal']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="dr-demo">
			<section class="dr-section">
				<h4>Basic — right edge</h4>
				<p>
					Default 320px panel sliding from the right. Press <kbd>Esc</kbd> or click the backdrop
					to close — focus snaps back to the trigger.
				</p>
				<button type="button" class="dr-btn dr-btn--primary" onclick={() => (basicOpen = true)}>
					Open right drawer
				</button>
			</section>

			<section class="dr-section">
				<h4>All four edges</h4>
				<div class="dr-row">
					<button type="button" class="dr-btn" onclick={() => (leftOpen = true)}>← Left</button>
					<button type="button" class="dr-btn" onclick={() => (rightOpen = true)}>Right →</button>
					<button type="button" class="dr-btn" onclick={() => (topOpen = true)}>↑ Top</button>
					<button type="button" class="dr-btn" onclick={() => (bottomOpen = true)}>↓ Bottom</button>
				</div>
			</section>

			<section class="dr-section">
				<h4>Custom size — 70vh bottom sheet</h4>
				<button
					type="button"
					class="dr-btn dr-btn--primary"
					onclick={() => (bottomSheetOpen = true)}
				>
					Open bottom sheet
				</button>
			</section>

			<section class="dr-section">
				<h4>With a form (focus-trap proof)</h4>
				<button type="button" class="dr-btn dr-btn--primary" onclick={() => (formOpen = true)}>
					Open form drawer
				</button>
			</section>

			<section class="dr-section">
				<h4>Persistent — no Esc / backdrop dismiss</h4>
				<button
					type="button"
					class="dr-btn dr-btn--primary"
					onclick={() => (persistentOpen = true)}
				>
					Open persistent drawer
				</button>
			</section>

			<section class="dr-section">
				<h4>Focus restore on auto-close</h4>
				<button type="button" class="dr-btn dr-btn--primary" onclick={openRestoreDemo}>
					Open & auto-close in 1.5s
				</button>
			</section>
		</div>

		<Drawer bind:open={basicOpen} ariaLabel="Basic drawer demo">
			<div class="dr-content">
				<h3>Hello from the drawer</h3>
				<p>
					Tab cycles inside this dialog and never escapes back to the page. Background scroll is
					locked. Press <kbd>Esc</kbd> or click the backdrop to close.
				</p>
				<button type="button" class="dr-btn" onclick={() => (basicOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={leftOpen} position="left" ariaLabel="Left drawer">
			<div class="dr-content">
				<h3>Left edge</h3>
				<p>Common pattern for mobile navigation menus.</p>
				<button type="button" class="dr-btn" onclick={() => (leftOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={rightOpen} position="right" ariaLabel="Right drawer">
			<div class="dr-content">
				<h3>Right edge</h3>
				<p>The default. Good for filters, details panels, and inspectors.</p>
				<button type="button" class="dr-btn" onclick={() => (rightOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={topOpen} position="top" ariaLabel="Top drawer">
			<div class="dr-content">
				<h3>Top edge</h3>
				<p>Useful for site-wide notifications or activity panels.</p>
				<button type="button" class="dr-btn" onclick={() => (topOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={bottomOpen} position="bottom" ariaLabel="Bottom drawer">
			<div class="dr-content">
				<h3>Bottom edge</h3>
				<p>The mobile-first "bottom sheet" pattern.</p>
				<button type="button" class="dr-btn" onclick={() => (bottomOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={bottomSheetOpen} position="bottom" size="70vh" ariaLabel="Bottom sheet demo">
			<div class="dr-content">
				<h3>Tall bottom sheet</h3>
				<p>
					70% viewport height. Try Tab — focus stays inside. Try scrolling behind the dimmed
					backdrop — page scroll is locked.
				</p>
				<button type="button" class="dr-btn" onclick={() => (bottomSheetOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={formOpen} size={420} ariaLabel="New note form">
			<div class="dr-content">
				<h3>New note</h3>
				<label class="dr-field">
					<span>Name</span>
					<input type="text" bind:value={formName} placeholder="Project Aurora" />
				</label>
				<label class="dr-field">
					<span>Notes</span>
					<textarea bind:value={formNotes} rows="4" placeholder="Anything worth remembering…"></textarea>
				</label>
				<div class="dr-form-actions">
					<button type="button" class="dr-btn" onclick={() => (formOpen = false)}>Cancel</button>
					<button
						type="button"
						class="dr-btn dr-btn--primary"
						onclick={() => {
							formOpen = false;
							formName = '';
							formNotes = '';
						}}
					>
						Save
					</button>
				</div>
			</div>
		</Drawer>

		<Drawer bind:open={persistentOpen} persistent ariaLabel="Persistent confirmation">
			<div class="dr-content">
				<h3>Sticky drawer</h3>
				<p>
					Backdrop and Escape are no-ops. You must use one of the buttons below to leave.
				</p>
				<div class="dr-form-actions">
					<button type="button" class="dr-btn" onclick={() => (persistentOpen = false)}>
						Cancel
					</button>
					<button type="button" class="dr-btn dr-btn--primary" onclick={() => (persistentOpen = false)}>
						Confirm
					</button>
				</div>
			</div>
		</Drawer>

		<Drawer bind:open={restoreOpen} ariaLabel="Auto-closing drawer">
			<div class="dr-content">
				<h3>Watch closely…</h3>
				<p>
					This drawer closes itself in a moment. When it does, focus returns to the button that
					opened it.
				</p>
			</div>
		</Drawer>
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
					<td><code>open</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable open/closed state.</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'left' | 'right' | 'top' | 'bottom'</code></td>
					<td><code>'right'</code></td>
					<td>Edge the drawer slides from.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number | string</code></td>
					<td><code>undefined</code></td>
					<td>Numeric (px) or any CSS length string (<code>'70vh'</code>).</td>
				</tr>
				<tr>
					<td><code>persistent</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>When true, backdrop click and Escape no longer dismiss.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Drawer'</code></td>
					<td>Accessible name when no labelled element is provided.</td>
				</tr>
				<tr>
					<td><code>ariaLabelledBy</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>ID of an element that labels the drawer.</td>
				</tr>
				<tr>
					<td><code>onClose</code></td>
					<td><code>() =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Callback fired whenever the drawer closes.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Drawer body content.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the panel.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dr-demo {
		display: grid;
		gap: 22px;
	}
	.dr-section h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.dr-section p {
		margin: 0 0 10px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.dr-section kbd {
		display: inline-block;
		padding: 0.05rem 0.4rem;
		font-size: 0.8em;
		font-family: var(--font-mono);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.dr-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.dr-btn {
		padding: 0.55rem 1.1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 14px;
		font-weight: 500;
		color: var(--fg-1);
		cursor: pointer;
		transition: background var(--dur-fast);
	}
	.dr-btn:hover {
		background: var(--surface-2);
	}
	.dr-btn--primary {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.dr-btn--primary:hover {
		background: var(--accent-strong, var(--accent));
	}
	.dr-content {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 22px;
	}
	.dr-content h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 20px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.dr-content p {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.55;
	}
	.dr-content kbd {
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--surface-2);
		border: 1px solid var(--border);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.dr-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.dr-field span {
		font-size: 13px;
		font-weight: 500;
		color: var(--fg-2);
	}
	.dr-field input,
	.dr-field textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		font-size: 14px;
		font-family: inherit;
		background: var(--surface);
		color: var(--fg-1);
	}
	.dr-field input:focus,
	.dr-field textarea:focus {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
		border-color: var(--accent);
	}
	.dr-field textarea {
		resize: vertical;
		min-height: 5rem;
	}
	.dr-form-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		margin-top: 4px;
	}
</style>
