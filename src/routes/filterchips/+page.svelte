<script lang="ts">
	import FilterChips from '$lib/components/FilterChips.svelte';

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
		multi.length === 0
			? articles
			: articles.filter((a) => a.tags.some((t) => multi.includes(t)))
	);
</script>

<svelte:head>
	<title>FilterChips | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">FilterChips</h1>
			<p class="text-xl text-muted-foreground">
				A toggleable chip row for filtering content. Real buttons under the hood — keyboard
				accessible by default.
			</p>
		</header>

		<!-- Multi-select with live filtered list -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Multi-select with live filtering</h2>
			<p class="text-sm text-neutral-500">
				Toggle chips on and off. The article list below updates from the selected tags.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
				<FilterChips
					options={tagOptions}
					bind:selected={multi}
					showAll
					ariaLabel="Article tags"
				/>
				<ul class="divide-y divide-neutral-100">
					{#each filtered as article (article.title)}
						<li class="py-3 flex items-center justify-between gap-4">
							<span class="text-sm text-neutral-800">{article.title}</span>
							<span class="text-xs text-neutral-400">{article.tags.join(', ')}</span>
						</li>
					{:else}
						<li class="py-6 text-sm text-neutral-500 text-center">No articles match the current filters.</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- Single-select -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Single-select</h2>
			<p class="text-sm text-neutral-500">
				With <code>mode="single"</code> only one chip is active at a time. Click the active chip
				again to clear.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
				<FilterChips
					options={sortOptions}
					mode="single"
					bind:selected={single}
					ariaLabel="Sort order"
				/>
				<div class="text-sm text-neutral-500">
					Active sort:
					<strong>{single[0] ?? 'none'}</strong>
				</div>
			</div>
		</section>

		<!-- Removable -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Removable</h2>
			<p class="text-sm text-neutral-500">
				Active chips show an <code>×</code> handle. Click it to remove the filter — perfect for an
				"active filters" row.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
				<FilterChips
					options={tagOptions}
					removable
					bind:selected={removable}
					ariaLabel="Active filters"
				/>
				<div class="text-sm text-neutral-500">
					Active: {removable.length === 0 ? '(none)' : removable.join(', ')}
				</div>
			</div>
		</section>

		<!-- Custom palette + sizes -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Custom palette &amp; sizes</h2>
			<div class="grid md:grid-cols-2 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Brand purple</div>
					<FilterChips
						options={facets}
						bind:selected={custom}
						mode="single"
						activeBg="#7c3aed"
						activeText="#ffffff"
					/>
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Sizes</div>
					<div class="space-y-2">
						<FilterChips options={facets.slice(0, 2)} size="sm" selected={['free']} />
						<FilterChips options={facets.slice(0, 2)} size="md" selected={['free']} />
						<FilterChips options={facets.slice(0, 2)} size="lg" selected={['free']} />
					</div>
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Multi-select (default) or single-select</li>
					<li>Optional 'All' reset chip</li>
					<li>Optional removable mode with × per active chip</li>
					<li>Optional count badges next to labels</li>
					<li>Three sizes: <code>sm</code> / <code>md</code> / <code>lg</code></li>
					<li>Custom active palette</li>
					<li>Real <code>&lt;button&gt;</code> with <code>aria-pressed</code></li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import FilterChips from '$lib/components/FilterChips.svelte';
  let selected = $state<string[]>([]);
  const options = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' }
  ];
</${''}script>

<FilterChips
  {options}
  bind:selected
  showAll
  removable
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>
