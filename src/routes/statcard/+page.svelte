<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';
</script>

<svelte:head>
	<title>StatCard | TFE Svelte Templates</title>
</svelte:head>

<div class="container mx-auto py-12 px-4">
	<div class="max-w-5xl mx-auto space-y-12">
		<header class="text-center space-y-4">
			<h1 class="text-4xl font-bold tracking-tight">StatCard</h1>
			<p class="text-xl text-muted-foreground">
				Single-metric KPI card with auto-coloured trend. Knows the difference between "up = good" and "down = good".
			</p>
		</header>

		<!-- Standard dashboard row -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Dashboard row</h2>
			<p class="text-sm text-neutral-500">Up = good for these metrics. Positive trend → green.</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard title="Revenue" value="£12,450" delta={8.2} deltaSuffix="%" deltaLabel="vs last week" />
				<StatCard title="New signups" value={342} delta={12.4} deltaSuffix="%" deltaLabel="vs last week" />
				<StatCard title="Conversion" value="4.7%" delta={0.6} deltaSuffix="pts" deltaLabel="vs last week" />
				<StatCard title="Active users" value={4271} delta={0} deltaLabel="no change" />
			</div>
		</section>

		<!-- Inverted sentiment -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">"Lower is better" metrics</h2>
			<p class="text-sm text-neutral-500">
				These metrics prefer downward trends — set <code>positiveDirection="down"</code> so a falling
				value reads green.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Page load time"
					value="1.4s"
					delta={-12}
					deltaSuffix="%"
					deltaLabel="vs last week"
					positiveDirection="down"
				/>
				<StatCard
					title="Errors per hour"
					value={47}
					delta={-23}
					deltaSuffix="%"
					deltaLabel="vs last week"
					positiveDirection="down"
				/>
				<StatCard
					title="Churn rate"
					value="2.1%"
					delta={0.4}
					deltaSuffix="pts"
					deltaLabel="vs last month"
					positiveDirection="down"
				/>
				<StatCard
					title="Support tickets"
					value={89}
					delta={5}
					deltaLabel="vs last week"
					positiveDirection="down"
				/>
			</div>
		</section>

		<!-- Sizes -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Sizes</h2>
			<div class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<StatCard title="Small" value="£1,200" delta={3.4} deltaSuffix="%" size="sm" />
					<StatCard title="Medium (default)" value="£12,450" delta={8.2} deltaSuffix="%" size="md" />
					<StatCard title="Large hero" value="£124,500" delta={14.7} deltaSuffix="%" size="lg" />
				</div>
			</div>
		</section>

		<!-- With icon and badge composition -->
		<section class="space-y-3">
			<h2 class="text-2xl font-semibold">Composing with BadgePill</h2>
			<p class="text-sm text-neutral-500">
				StatCard and BadgePill are independent primitives — combine them via your own layout.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Followers</span>
						<BadgePill label="Live" tone="success" dot size="sm" />
					</div>
					<StatCard title="" value={1840} delta={3.1} deltaSuffix="%" deltaLabel="vs last week" class="composed-card" />
				</div>
				<div class="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Open issues</span>
						<BadgePill label="3 critical" tone="danger" size="sm" />
					</div>
					<StatCard title="" value={47} delta={-12} deltaSuffix="%" deltaLabel="vs last week" positiveDirection="down" class="composed-card" />
				</div>
			</div>
		</section>

		<section class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Features</h2>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					<li>Auto-coloured trend (green / red / grey)</li>
					<li><code>positiveDirection</code> for "lower-is-better" metrics</li>
					<li>↑ / ↓ / — glyphs ensure colour is never the only signal</li>
					<li>Three sizes (sm / md / lg)</li>
					<li>Optional icon snippet</li>
					<li>Tabular numerals — clean number alignment</li>
					<li>Honours <code>prefers-reduced-motion</code></li>
				</ul>
			</div>

			<div class="space-y-4">
				<h2 class="text-2xl font-semibold">Usage</h2>
				<pre class="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm border border-neutral-800"><code>{`<script lang="ts">
  import StatCard from '$lib/components/StatCard.svelte';
</${''}script>

<StatCard
  title="Revenue"
  value="£12,450"
  delta={8.2}
  deltaSuffix="%"
  deltaLabel="vs last week"
/>

<StatCard
  title="Page load"
  value="1.4s"
  delta={-12}
  deltaSuffix="%"
  positiveDirection="down"
/>`}</code></pre>
			</div>
		</section>
	</div>
</div>

<style>
	:global(.composed-card) {
		padding: 0 !important;
		border: 0 !important;
	}
	:global(.composed-card:hover) {
		box-shadow: none !important;
	}
</style>
