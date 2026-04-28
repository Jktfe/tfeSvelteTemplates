<script lang="ts">
	import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';

	let loading = $state(true);

	const fakeOrders = [
		{ id: 'O-1042', customer: 'Aria Johnson', total: '£82.50', status: 'Shipped' },
		{ id: 'O-1043', customer: 'Bilal Khan', total: '£128.00', status: 'Processing' },
		{ id: 'O-1044', customer: 'Carmen Diaz', total: '£44.95', status: 'Delivered' }
	];

	function refresh() {
		loading = true;
		setTimeout(() => (loading = false), 1500);
	}

	$effect(() => {
		const t = setTimeout(() => (loading = false), 1500);
		return () => clearTimeout(t);
	});
</script>

<svelte:head>
	<title>SkeletonLoader | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">SkeletonLoader</h1>
			<p class="text-xl text-muted-foreground">
				Tiny three-shape primitive for content placeholders. Compose to pre-figure any layout.
			</p>
		</header>

		<!-- Shapes -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Shapes</h2>
			<p class="text-sm text-neutral-500">
				Three primitives — pick the one that matches the real content.
			</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
					<h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Text</h3>
					<SkeletonLoader />
					<SkeletonLoader width="80%" />
					<SkeletonLoader width="60%" />
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-3">
					<SkeletonLoader shape="circle" width="48px" height="48px" />
					<div class="flex-1 space-y-2">
						<SkeletonLoader width="60%" />
						<SkeletonLoader width="40%" />
					</div>
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
					<h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Rect</h3>
					<SkeletonLoader shape="rect" height="120px" />
				</div>
			</div>
		</section>

		<!-- Animations -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Animation styles</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
					<h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Pulse</h3>
					<SkeletonLoader animation="pulse" />
					<SkeletonLoader animation="pulse" width="70%" />
					<SkeletonLoader animation="pulse" width="50%" />
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
					<h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Shimmer</h3>
					<SkeletonLoader animation="shimmer" />
					<SkeletonLoader animation="shimmer" width="70%" />
					<SkeletonLoader animation="shimmer" width="50%" />
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-2">
					<h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-500">None</h3>
					<SkeletonLoader animation="none" />
					<SkeletonLoader animation="none" width="70%" />
					<SkeletonLoader animation="none" width="50%" />
				</div>
			</div>
		</section>

		<!-- Composed live demo -->
		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-semibold">Composed: orders list</h2>
				<button
					onclick={refresh}
					class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
				>
					Reload (simulate fetch)
				</button>
			</div>
			<p class="text-sm text-neutral-500">
				Click reload to flip back to skeletons for ~1.5s. Pre-figured layout means no jump when real
				rows arrive.
			</p>

			<div class="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100" aria-busy={loading}>
				{#if loading}
					{#each Array(3), i (i)}
						<div class="flex items-center gap-4 p-4">
							<SkeletonLoader shape="circle" width="40px" height="40px" animation="shimmer" />
							<div class="flex-1 space-y-2">
								<SkeletonLoader width="40%" animation="shimmer" />
								<SkeletonLoader width="65%" animation="shimmer" />
							</div>
							<SkeletonLoader shape="rect" width="80px" height="32px" animation="shimmer" />
						</div>
					{/each}
				{:else}
					{#each fakeOrders as order (order.id)}
						<div class="flex items-center gap-4 p-4">
							<div
								class="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm"
							>
								{order.customer
									.split(' ')
									.map((p) => p[0])
									.join('')}
							</div>
							<div class="flex-1">
								<div class="font-semibold text-neutral-900">{order.customer}</div>
								<div class="text-sm text-neutral-500">{order.id} • {order.status}</div>
							</div>
							<div class="font-semibold text-neutral-900">{order.total}</div>
						</div>
					{/each}
				{/if}
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Three shape primitives (text / circle / rect)</li>
					<li>Two animations (pulse / shimmer) plus <code>none</code></li>
					<li>Sensible defaults per shape — circles round automatically</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
					<li><code>aria-hidden="true"</code> — pair with parent <code>aria-busy</code></li>
					<li>Pure CSS, zero dependencies</li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre
					class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';
</${''}script>

<!-- Card placeholder -->
<section aria-busy={loading}>
  <SkeletonLoader shape="rect" height="160px" />
  <SkeletonLoader width="70%" />
  <SkeletonLoader width="40%" />
</section>`}</code></pre>
			</div>
		</section>
	</div>
</div>
