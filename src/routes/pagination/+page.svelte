<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Pagination from '$lib/components/Pagination.svelte';

	const shell = catalogShellPropsForSlug('/pagination')!;

	let basicPage = $state(1);
	let longPage = $state(1);
	let siblingsPage = $state(10);
	let smallPage = $state(3);

	const fakeRows = Array.from({ length: 200 }, (_, i) => ({
		id: i + 1,
		name: `Row ${i + 1}`,
		email: `user${i + 1}@example.com`
	}));
	const rowsPerPage = 10;
	let tablePage = $state(1);
	let tableSlice = $derived(
		fakeRows.slice((tablePage - 1) * rowsPerPage, tablePage * rowsPerPage)
	);
	let tableTotalPages = $derived(Math.ceil(fakeRows.length / rowsPerPage));

	const codeExplanation =
		'Pagination computes a list of page tokens — numbers and ellipsis sentinels — based on current page, total pages, and the siblings count. The first and last pages are always shown; siblings expands the window around current. Prev/Next buttons use the real disabled attribute at the edges, and the active page button carries aria-current="page" so assistive tech announces position correctly.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Zero-deps', 'Bindable']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pg-demo">
			<div class="pg-row">
				<h4>Basic — 5 pages</h4>
				<Pagination bind:page={basicPage} totalPages={5} />
				<p class="pg-note">Current page: <code>{basicPage}</code></p>
			</div>

			<div class="pg-row">
				<h4>Long — 20 pages with ellipsis</h4>
				<Pagination bind:page={longPage} totalPages={20} />
				<p class="pg-note">
					Current page: <code>{longPage}</code> · Watch the ellipses adapt as you navigate
				</p>
			</div>

			<div class="pg-row">
				<h4>Wider middle — siblings=2</h4>
				<Pagination bind:page={siblingsPage} totalPages={20} siblings={2} />
				<p class="pg-note">Two pages either side of current → 7 numbers in the middle.</p>
			</div>

			<div class="pg-row">
				<h4>Compact — size="sm"</h4>
				<Pagination bind:page={smallPage} totalPages={42} size="sm" />
			</div>

			<div class="pg-row pg-row--table">
				<h4>In context — paginated table</h4>
				<div class="pg-table-wrap">
					<table class="pg-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Email</th>
							</tr>
						</thead>
						<tbody>
							{#each tableSlice as row (row.id)}
								<tr>
									<td>{row.id}</td>
									<td>{row.name}</td>
									<td>{row.email}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="pg-table-footer">
					<p class="pg-note">
						Showing {(tablePage - 1) * rowsPerPage + 1}–{Math.min(
							tablePage * rowsPerPage,
							fakeRows.length
						)} of {fakeRows.length}
					</p>
					<Pagination bind:page={tablePage} totalPages={tableTotalPages} size="sm" />
				</div>
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
					<td><code>page</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Bindable current page (1-based).</td>
				</tr>
				<tr>
					<td><code>totalPages</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Total pages available.</td>
				</tr>
				<tr>
					<td><code>siblings</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Pages shown either side of current before ellipsing.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md'</code></td>
					<td><code>'md'</code></td>
					<td>Visual density.</td>
				</tr>
				<tr>
					<td><code>prevLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Prev'</code></td>
					<td>Label for the previous-page button (i18n hook).</td>
				</tr>
				<tr>
					<td><code>nextLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Next'</code></td>
					<td>Label for the next-page button.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Pagination'</code></td>
					<td>Accessible name on the wrapping <code>nav</code>.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(page: number) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Optional callback fired when page changes.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pg-demo {
		display: grid;
		gap: 22px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.pg-row {
		display: grid;
		gap: 10px;
		justify-items: center;
		text-align: center;
		padding-bottom: 22px;
		border-bottom: 1px solid var(--border);
	}
	.pg-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.pg-row--table {
		justify-items: stretch;
		text-align: left;
	}
	.pg-row h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.pg-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.pg-note code {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.pg-table-wrap {
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
	}
	.pg-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}
	.pg-table thead {
		background: var(--surface-2);
	}
	.pg-table th,
	.pg-table td {
		padding: 8px 12px;
		text-align: left;
		border-bottom: 1px solid var(--border);
	}
	.pg-table th {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.pg-table td {
		color: var(--fg-1);
	}
	.pg-table tbody tr:last-child td {
		border-bottom: none;
	}
	.pg-table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 4px;
	}
</style>
