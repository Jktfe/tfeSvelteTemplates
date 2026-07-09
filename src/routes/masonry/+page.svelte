<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Masonry from '$lib/components/Masonry.svelte';

	const shell = catalogShellPropsForSlug('/masonry')!;

	// --- Tile gallery (varying heights via CSS gradients) -------------------
	const gradients = [
		'linear-gradient(135deg,#6366f1,#8b5cf6)',
		'linear-gradient(135deg,#0ea5e9,#22d3ee)',
		'linear-gradient(135deg,#f59e0b,#ef4444)',
		'linear-gradient(135deg,#10b981,#84cc16)',
		'linear-gradient(135deg,#ec4899,#f43f5e)',
		'linear-gradient(135deg,#8b5cf6,#6366f1)',
		'linear-gradient(135deg,#14b8a6,#0ea5e9)',
		'linear-gradient(135deg,#f97316,#eab308)'
	];
	const tiles = Array.from({ length: 12 }, (_, i) => ({
		id: i,
		height: 90 + ((i * 47) % 150),
		bg: gradients[i % gradients.length]
	}));

	// --- Card gallery (varying text length) --------------------------------
	const notes = [
		{ id: 1, title: 'Shortest-column-first', body: 'Every item lands in whichever column is currently shortest.' },
		{ id: 2, title: 'Source order kept', body: 'Within a column, items read top-to-bottom in source order — no shuffling.' },
		{ id: 3, title: 'Responsive columns', body: 'Pass a map like { base: 1, sm: 2, lg: 3 } and the column count follows the container width.' },
		{ id: 4, title: 'ResizeObserver', body: 'Balances on container resize and on late-loading content, then disconnects on unmount.' },
		{ id: 5, title: 'Zero deps', body: 'Svelte 5 runes plus the native ResizeObserver. Nothing to install.' },
		{ id: 6, title: 'Reduced motion', body: 'The gentle mount fade is suppressed for prefers-reduced-motion.' },
		{ id: 7, title: 'Generic', body: 'items is T[] — render anything through the item snippet.' }
	];

	const codeExplanation =
		'Masonry measures each item’s pixel height with a ResizeObserver, then packs items into equal-width flex columns by always feeding the shortest column. Because every column shares the same width, an item’s height is independent of its column, so the balance converges in a single pass and stays in source order down each column. The columns prop resolves either a fixed number or a responsive breakpoint map against the measured container width.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Layout', 'Zero-deps', 'Responsive', 'Generic']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ms-demo">
			<section class="ms-section">
				<h4>Fixed 3 columns — image tiles</h4>
				<p class="ms-note">Tiles of differing heights pack into three balanced columns.</p>
				<div class="ms-stage">
					<Masonry items={tiles} columns={3} gap={12}>
						{#snippet item(tile)}
							<div
								class="ms-tile"
								style={`height:${tile.height}px;background:${tile.bg}`}
							>
								#{tile.id + 1}
							</div>
						{/snippet}
					</Masonry>
				</div>
			</section>

			<section class="ms-section">
				<h4>Responsive — {'{ base: 1, sm: 2, lg: 3 }'}</h4>
				<p class="ms-note">Resize the window: 1 column on narrow, 2 at ≥640px, 3 at ≥1024px.</p>
				<div class="ms-stage">
					<Masonry items={notes} columns={{ base: 1, sm: 2, lg: 3 }} gap={14}>
						{#snippet item(note)}
							<article class="ms-card">
								<h5>{note.title}</h5>
								<p>{note.body}</p>
							</article>
						{/snippet}
					</Masonry>
				</div>
			</section>

			<section class="ms-section">
				<h4>Dense 4 columns — small gap</h4>
				<p class="ms-note">A tighter grid for thumbnail walls.</p>
				<div class="ms-stage">
					<Masonry items={tiles} columns={4} gap={8}>
						{#snippet item(tile)}
							<div
								class="ms-tile ms-tile--sm"
								style={`height:${tile.height * 0.7}px;background:${tile.bg}`}
							></div>
						{/snippet}
					</Masonry>
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
					<td><code>items</code></td>
					<td><code>T[]</code></td>
					<td><code>[]</code></td>
					<td>Items to distribute across columns (generic over <code>T</code>).</td>
				</tr>
				<tr>
					<td><code>item</code></td>
					<td><code>Snippet&lt;[T, number]&gt;</code></td>
					<td><code>—</code></td>
					<td>Renders one item; receives the item and its source index.</td>
				</tr>
				<tr>
					<td><code>columns</code></td>
					<td><code>number | Partial&lt;Record&lt;Breakpoint, number&gt;&gt;</code></td>
					<td><code>3</code></td>
					<td>Fixed column count, or a responsive map like <code>{'{ base: 1, sm: 2, lg: 3 }'}</code>.</td>
				</tr>
				<tr>
					<td><code>gap</code></td>
					<td><code>number</code></td>
					<td><code>16</code></td>
					<td>Gap in px between columns and stacked items.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the container.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ms-demo {
		display: grid;
		gap: 28px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ms-section {
		display: grid;
		gap: 10px;
		padding-bottom: 26px;
		border-bottom: 1px solid var(--border);
	}
	.ms-section:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.ms-section h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.ms-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.ms-stage {
		margin-top: 4px;
	}
	.ms-tile {
		display: flex;
		align-items: flex-end;
		padding: 8px 10px;
		border-radius: var(--r-2);
		color: #fff;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
	}
	.ms-tile--sm {
		border-radius: var(--r-1);
	}
	.ms-card {
		display: grid;
		gap: 6px;
		padding: 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ms-card h5 {
		margin: 0;
		font-size: 14px;
		color: var(--fg-1);
	}
	.ms-card p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
</style>
