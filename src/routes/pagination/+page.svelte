<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';

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
</script>

<svelte:head>
	<title>Pagination | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-4xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">Pagination</h1>
			<p class="text-xl text-muted-foreground">
				Page-number navigation with smart ellipsis, ARIA-correct buttons, and two-way page binding.
			</p>
		</header>

		<section class="bg-white rounded-2xl p-12 border border-neutral-200 shadow-xl space-y-12">
			<div class="flex flex-col items-center space-y-4">
				<h3 class="text-sm font-medium text-neutral-500">Basic — 5 pages</h3>
				<Pagination bind:page={basicPage} totalPages={5} />
				<p class="text-xs text-neutral-500">
					Current page: <code>{basicPage}</code>
				</p>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Long — 20 pages with ellipsis</h3>
				<Pagination bind:page={longPage} totalPages={20} />
				<p class="text-xs text-neutral-500">
					Current page: <code>{longPage}</code> · Watch the ellipses adapt as you navigate
				</p>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Wider middle — siblings=2</h3>
				<Pagination bind:page={siblingsPage} totalPages={20} siblings={2} />
				<p class="text-xs text-neutral-500">
					Two pages either side of current → 7 numbers in the middle
				</p>
			</div>

			<div class="flex flex-col items-center space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500">Compact — size="sm"</h3>
				<Pagination bind:page={smallPage} totalPages={42} size="sm" />
			</div>

			<div class="space-y-4 pt-8 border-t border-neutral-200">
				<h3 class="text-sm font-medium text-neutral-500 text-center">In context — paginated table</h3>
				<div class="overflow-hidden border border-neutral-200 rounded-lg">
					<table class="w-full text-sm">
						<thead class="bg-neutral-50">
							<tr>
								<th class="text-left px-4 py-2 font-medium text-neutral-700">ID</th>
								<th class="text-left px-4 py-2 font-medium text-neutral-700">Name</th>
								<th class="text-left px-4 py-2 font-medium text-neutral-700">Email</th>
							</tr>
						</thead>
						<tbody>
							{#each tableSlice as row (row.id)}
								<tr class="border-t border-neutral-100">
									<td class="px-4 py-2 text-neutral-600">{row.id}</td>
									<td class="px-4 py-2 text-neutral-800">{row.name}</td>
									<td class="px-4 py-2 text-neutral-600">{row.email}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="flex items-center justify-between pt-2">
					<p class="text-xs text-neutral-500">
						Showing {(tablePage - 1) * rowsPerPage + 1}–{Math.min(tablePage * rowsPerPage, fakeRows.length)} of {fakeRows.length}
					</p>
					<Pagination bind:page={tablePage} totalPages={tableTotalPages} size="sm" />
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Smart ellipsis — first, last, current, and configurable siblings</li>
					<li>Two-way <code>bind:page</code> or <code>onChange</code> callback</li>
					<li>Disabled Prev/Next at the edges (real <code>disabled</code> attribute)</li>
					<li><code>aria-current="page"</code> on active button</li>
					<li>Two sizes — <code>sm</code>, <code>md</code></li>
					<li>i18n friendly — custom <code>prevLabel</code> / <code>nextLabel</code></li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">When to use</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Search results lists, table rows, gallery pages</li>
					<li>Any time you'd otherwise need infinite scroll but want shareable URLs</li>
					<li>Admin dashboards where users jump to specific page numbers</li>
				</ul>
			</div>
		</section>
	</div>
</div>
