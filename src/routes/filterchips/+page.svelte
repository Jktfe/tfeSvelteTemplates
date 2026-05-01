<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import FilterChips from '$lib/components/FilterChips.svelte';

	const shell = catalogShellPropsForSlug('/filterchips')!;

	const tagOptions = [
		{ value: 'design', label: 'Design', count: 24 },
		{ value: 'engineering', label: 'Engineering', count: 18 },
		{ value: 'product', label: 'Product', count: 12 },
		{ value: 'marketing', label: 'Marketing', count: 9 },
		{ value: 'research', label: 'Research', count: 6 }
	];

	const sortOptions = [
		{ value: 'newest', label: 'Newest first' },
		{ value: 'popular', label: 'Most popular' },
		{ value: 'oldest', label: 'Oldest first' }
	];

	const facets = [
		{ value: 'free', label: 'Free' },
		{ value: 'subscription', label: 'Subscription' },
		{ value: 'one-off', label: 'One-off' }
	];

	let multi = $state<string[]>(['design', 'engineering']);
	let single = $state<string[]>(['newest']);
	let removable = $state<string[]>(['design', 'product', 'marketing']);
	let custom = $state<string[]>(['subscription']);

	const articles = [
		{ tags: ['design'], title: 'A modest case for monochrome UI' },
		{ tags: ['engineering', 'design'], title: 'Owning your design tokens' },
		{ tags: ['engineering'], title: 'Why we picked SvelteKit over Next' },
		{ tags: ['product', 'research'], title: 'Listening better in user interviews' },
		{ tags: ['marketing'], title: 'When less brand guidelines actually help' }
	];

	const filtered = $derived(
		multi.length === 0 ? articles : articles.filter((a) => a.tags.some((t) => multi.includes(t)))
	);

	const codeExplanation =
		'Each chip is a real <button> with aria-pressed, so the toggle state is announced correctly and Tab/Space/Enter all work without extra plumbing. Multi-select keeps the selected array in sync with bind:selected; single-select replaces the array on every click. Removable chips show an × control and emit onRemove so you can double-bind to a parent "active filters" row.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Filtering', 'A11y', 'Multi-select', 'Keyboard']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="chips-demo">
			<section>
				<h3>Multi-select with live filtering</h3>
				<FilterChips options={tagOptions} bind:selected={multi} showAll ariaLabel="Article tags" />
				<ul class="list">
					{#each filtered as article (article.title)}
						<li>
							<span>{article.title}</span>
							<span class="tag">{article.tags.join(', ')}</span>
						</li>
					{:else}
						<li class="empty">No articles match the current filters.</li>
					{/each}
				</ul>
			</section>

			<section>
				<h3>Single-select</h3>
				<FilterChips
					options={sortOptions}
					mode="single"
					bind:selected={single}
					ariaLabel="Sort order"
				/>
				<p class="note">Active sort: <strong>{single[0] ?? 'none'}</strong></p>
			</section>

			<section>
				<h3>Removable chips</h3>
				<FilterChips
					options={tagOptions}
					removable
					bind:selected={removable}
					ariaLabel="Active filters"
				/>
				<p class="note">
					Active: {removable.length === 0 ? '(none)' : removable.join(', ')}
				</p>
			</section>

			<section>
				<h3>Custom palette &amp; sizes</h3>
				<FilterChips
					options={facets}
					bind:selected={custom}
					mode="single"
					activeBg="#7c3aed"
					activeText="#ffffff"
				/>
				<div class="size-stack">
					<FilterChips options={facets.slice(0, 2)} size="sm" selected={['free']} />
					<FilterChips options={facets.slice(0, 2)} size="md" selected={['free']} />
					<FilterChips options={facets.slice(0, 2)} size="lg" selected={['free']} />
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
					<td><code>options</code></td>
					<td><code>{'Array<{ value, label, count? }>'}</code></td>
					<td>—</td>
					<td>Required. Chips to render.</td>
				</tr>
				<tr>
					<td><code>selected</code></td>
					<td><code>string[]</code></td>
					<td><code>[]</code></td>
					<td>Bindable list of selected values.</td>
				</tr>
				<tr>
					<td><code>mode</code></td>
					<td><code>'multi' | 'single'</code></td>
					<td><code>'multi'</code></td>
					<td>Selection model.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Chip height and padding.</td>
				</tr>
				<tr>
					<td><code>removable</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render an × handle on active chips.</td>
				</tr>
				<tr>
					<td><code>showAll</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Prepend an "All" reset chip.</td>
				</tr>
				<tr>
					<td><code>allLabel</code></td>
					<td><code>string</code></td>
					<td><code>'All'</code></td>
					<td>Override the reset chip label.</td>
				</tr>
				<tr>
					<td><code>activeBg</code> / <code>activeText</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Custom palette for selected chips.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(selected) =&gt; void</code></td>
					<td>—</td>
					<td>Fires whenever the selected list changes.</td>
				</tr>
				<tr>
					<td><code>onRemove</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when a removable chip's × is clicked.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.chips-demo {
		display: grid;
		gap: 2rem;
	}

	.chips-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.65rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0.6rem 0 0;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.list {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		border-top: 1px solid var(--border);
	}

	.list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.9rem;
		color: var(--fg-1);
	}

	.list .empty {
		justify-content: center;
		color: var(--fg-2);
	}

	.tag {
		font-size: 0.72rem;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.size-stack {
		display: grid;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
