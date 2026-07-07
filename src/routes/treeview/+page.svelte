<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TreeView, { type TreeNode } from '$lib/components/TreeView.svelte';

	const shell = catalogShellPropsForSlug('/treeview')!;

	// A small file-system style tree used across the demos.
	const fileTree: TreeNode[] = [
		{
			id: 'src',
			label: 'src',
			children: [
				{
					id: 'lib',
					label: 'lib',
					children: [
						{ id: 'utils.ts', label: 'utils.ts' },
						{ id: 'types.ts', label: 'types.ts' }
					]
				},
				{
					id: 'routes',
					label: 'routes',
					children: [
						{ id: 'page', label: '+page.svelte' },
						{ id: 'layout', label: '+layout.svelte' }
					]
				},
				{ id: 'app.html', label: 'app.html' }
			]
		},
		{
			id: 'static',
			label: 'static',
			children: [
				{ id: 'favicon', label: 'favicon.png' },
				{ id: 'robots', label: 'robots.txt' }
			]
		},
		{ id: 'readme', label: 'README.md' },
		{ id: 'pkg', label: 'package.json' }
	];

	// Taxonomy used for the checkbox demo.
	const categories: TreeNode[] = [
		{
			id: 'fruit',
			label: 'Fruit',
			children: [
				{ id: 'apple', label: 'Apple' },
				{ id: 'pear', label: 'Pear' },
				{ id: 'mango', label: 'Mango' }
			]
		},
		{
			id: 'veg',
			label: 'Vegetables',
			children: [
				{ id: 'carrot', label: 'Carrot' },
				{ id: 'leek', label: 'Leek' }
			]
		}
	];

	// Bindable selection for the checkbox demo + a live readout strip.
	let selected = $state(new Set<string>(['apple']));
	const selectedList = $derived([...selected].sort().join(', ') || '—');

	let lastEvent = $state('—');
	function logSelect(id: string, state: boolean) {
		lastEvent = `${id} → ${state ? 'on' : 'off'}`;
	}

	const codeExplanation =
		'TreeView follows the WAI-ARIA tree pattern: a role=tree container, role=treeitem rows, and role=group child lists, with a single roving tabindex so the whole widget is one Tab stop. Rendering is a self-referencing Svelte 5 snippet, so arbitrary depth needs no child component. The keyboard model walks a derived "visible order" flattening (depth-first, skipping collapsed subtrees) so Up/Down are a single index step. Tri-state checkboxes store only checked leaf ids; every branch state — checked, unchecked, indeterminate — is derived from its descendants, so parent and child can never drift apart.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Keyboard', 'WAI-ARIA tree']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="tv-demo">
			<section>
				<h3>File explorer</h3>
				<p class="note">
					A plain tree. Click a folder to toggle it, or focus a row and use the arrow keys:
					Right opens / descends, Left collapses / ascends, Up/Down move, Home/End jump.
				</p>
				<div class="tv-stage">
					<TreeView nodes={fileTree} label="Project files" />
				</div>
			</section>

			<section>
				<h3>Fully expanded on mount</h3>
				<p class="note">
					Pass <code>defaultExpandAll</code> to open every branch on first render.
				</p>
				<div class="tv-stage">
					<TreeView nodes={fileTree} defaultExpandAll label="Project files, expanded" />
				</div>
			</section>

			<section>
				<h3>Tri-state checkboxes</h3>
				<p class="note">
					With <code>checkboxes</code>, ticking a branch checks every leaf beneath it; ticking
					some children leaves the parent indeterminate. Selected leaves:
					<code>{selectedList}</code> · Last event: <code>{lastEvent}</code>
				</p>
				<div class="tv-stage">
					<TreeView
						nodes={categories}
						checkboxes
						bind:selected
						defaultExpandAll
						onselect={logSelect}
						label="Categories"
					/>
				</div>
			</section>
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
					<td><code>nodes</code></td>
					<td><code>TreeNode[]</code></td>
					<td><code>[]</code></td>
					<td>Hierarchical data. Each node is <code>{'{ id, label, children? }'}</code>.</td>
				</tr>
				<tr>
					<td><code>checkboxes</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Show tri-state checkboxes that cascade down and bubble up.</td>
				</tr>
				<tr>
					<td><code>expanded</code></td>
					<td><code>Set&lt;string&gt;</code> (bindable)</td>
					<td><code>new Set()</code></td>
					<td>IDs of currently open branches.</td>
				</tr>
				<tr>
					<td><code>selected</code></td>
					<td><code>Set&lt;string&gt;</code> (bindable)</td>
					<td><code>new Set()</code></td>
					<td>IDs of checked <strong>leaf</strong> nodes; parent state is derived.</td>
				</tr>
				<tr>
					<td><code>defaultExpandAll</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Expand every branch on first render.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Tree'</code></td>
					<td>Accessible name (<code>aria-label</code>) for the tree.</td>
				</tr>
				<tr>
					<td><code>onselect</code></td>
					<td><code>(id, state) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when a node is activated (toggle or check).</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tv-demo {
		display: grid;
		gap: 2rem;
	}

	.tv-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.45rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.85rem;
		color: var(--fg-2);
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.note code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.tv-stage {
		border: 1px solid var(--border, rgba(128, 128, 128, 0.25));
		border-radius: 0.6rem;
		padding: 0.6rem;
		max-width: 22rem;
		background: var(--surface-2, var(--surface));
	}
</style>
