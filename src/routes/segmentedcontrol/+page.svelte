<script lang="ts">
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	let view = $state<'list' | 'grid' | 'cards'>('list');
	let range = $state<'1d' | '1w' | '1m' | '1y'>('1w');
	let theme = $state<'auto' | 'light' | 'dark'>('auto');
	let plan = $state<'starter' | 'pro' | 'team'>('pro');

	const viewOptions = [
		{ value: 'list', label: 'List', icon: '☰' },
		{ value: 'grid', label: 'Grid', icon: '▦' },
		{ value: 'cards', label: 'Cards', icon: '🃏' }
	];

	const rangeOptions = [
		{ value: '1d', label: '1D' },
		{ value: '1w', label: '1W' },
		{ value: '1m', label: '1M' },
		{ value: '1y', label: '1Y' }
	];

	const themeOptions = [
		{ value: 'auto', label: 'Auto' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	const planOptions = [
		{ value: 'starter', label: 'Starter' },
		{ value: 'pro', label: 'Pro' },
		{ value: 'team', label: 'Team' }
	];

	// Mock list to demonstrate the view switcher.
	const items = [
		{ id: 1, title: 'A modest case for monochrome UI', tag: 'design' },
		{ id: 2, title: 'Owning your design tokens', tag: 'engineering' },
		{ id: 3, title: 'Why we picked SvelteKit over Next', tag: 'engineering' },
		{ id: 4, title: 'Listening better in user interviews', tag: 'research' }
	];
</script>

<svelte:head>
	<title>SegmentedControl | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">SegmentedControl</h1>
			<p class="text-xl text-muted-foreground">
				iOS-style joined picker for mutually-exclusive options. Native radio semantics, sliding
				indicator, two sizes, and custom palettes.
			</p>
		</header>

		<!-- View switcher with live render -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">View mode switcher</h2>
			<p class="text-sm text-neutral-500">
				A classic use case — toggle between list/grid/card layouts. The list below re-renders.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
				<SegmentedControl
					options={viewOptions}
					bind:value={view}
					ariaLabel="View mode"
				/>

				{#if view === 'list'}
					<ul class="divide-y divide-neutral-100">
						{#each items as item (item.id)}
							<li class="py-3 flex items-center justify-between gap-4">
								<span class="text-sm text-neutral-800">{item.title}</span>
								<span class="text-xs text-neutral-400">{item.tag}</span>
							</li>
						{/each}
					</ul>
				{:else if view === 'grid'}
					<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
						{#each items as item (item.id)}
							<div class="border border-neutral-200 rounded-lg p-3 space-y-2">
								<div class="text-xs uppercase text-neutral-400">{item.tag}</div>
								<div class="text-sm font-medium text-neutral-800">{item.title}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each items as item (item.id)}
							<div
								class="border border-neutral-200 rounded-xl p-4 bg-neutral-50 space-y-2 shadow-sm"
							>
								<div class="text-xs uppercase tracking-wide text-neutral-500">{item.tag}</div>
								<div class="text-base font-semibold text-neutral-900">{item.title}</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>

		<!-- Time range -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Time range</h2>
			<p class="text-sm text-neutral-500">
				Short labels work nicely at <code>size="sm"</code>.
			</p>
			<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
				<SegmentedControl
					options={rangeOptions}
					bind:value={range}
					size="sm"
					ariaLabel="Time range"
				/>
				<div class="text-sm text-neutral-500">
					Showing data for: <strong>{range.toUpperCase()}</strong>
				</div>
			</div>
		</section>

		<!-- Custom palette + content width -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Custom palette &amp; content width</h2>
			<div class="grid md:grid-cols-2 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
						Brand purple
					</div>
					<SegmentedControl
						options={themeOptions}
						bind:value={theme}
						activeBg="#7c3aed"
						activeText="#ffffff"
						ariaLabel="Theme preference"
					/>
					<div class="text-sm text-neutral-500">
						Theme: <strong>{theme}</strong>
					</div>
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
					<div class="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
						Content width (equalWidth=false)
					</div>
					<SegmentedControl
						options={planOptions}
						bind:value={plan}
						equalWidth={false}
						ariaLabel="Plan tier"
					/>
					<div class="text-sm text-neutral-500">
						Plan: <strong>{plan}</strong>
					</div>
				</div>
			</div>
		</section>

		<!-- Features + usage -->
		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Single-select only (joined look implies "pick one")</li>
					<li>Sliding indicator with smooth transition</li>
					<li>Equal-width or content-fit segments</li>
					<li>Two sizes: <code>sm</code> / <code>md</code></li>
					<li>Custom active palette via CSS vars</li>
					<li>Optional icons per segment</li>
					<li>Native <code>&lt;input type="radio"&gt;</code> — keyboard arrows for free</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li>Zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import SegmentedControl from '$lib/components/SegmentedControl.svelte';
  let view = $state('list');
  const options = [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' }
  ];
</${''}script>

<SegmentedControl
  {options}
  bind:value={view}
  ariaLabel="View mode"
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>
