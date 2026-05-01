<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import SkeletonLoader from '$lib/components/SkeletonLoader.svelte';

	const shell = catalogShellPropsForSlug('/skeletonloader')!;
	const skeletonRows = [0, 1, 2];

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
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Loading', 'CSS-only', 'A11y']}
	codeExplanation="SkeletonLoader is a tiny three-shape primitive (text, circle, rect) that you compose to pre-figure any layout. By matching the rough size of the real content you stop layout jumps when the data lands. Two animations (pulse and shimmer) plus a 'none' opt-out, all powered by CSS keyframes — and they switch off automatically under prefers-reduced-motion. Each skeleton is aria-hidden so the parent's aria-busy attribute carries the announcement."
>
	{#snippet demo()}
		<div class="sk-stack">
			<div class="sk-grid">
				<div class="sk-card">
					<h3 class="sk-h3">Text</h3>
					<SkeletonLoader />
					<SkeletonLoader width="80%" />
					<SkeletonLoader width="60%" />
				</div>
				<div class="sk-card sk-row">
					<SkeletonLoader shape="circle" width="48px" height="48px" />
					<div class="sk-col">
						<SkeletonLoader width="60%" />
						<SkeletonLoader width="40%" />
					</div>
				</div>
				<div class="sk-card">
					<h3 class="sk-h3">Rect</h3>
					<SkeletonLoader shape="rect" height="120px" />
				</div>
			</div>

			<div class="sk-anims">
				<div class="sk-card">
					<h3 class="sk-h3">Pulse</h3>
					<SkeletonLoader animation="pulse" />
					<SkeletonLoader animation="pulse" width="70%" />
				</div>
				<div class="sk-card">
					<h3 class="sk-h3">Shimmer</h3>
					<SkeletonLoader animation="shimmer" />
					<SkeletonLoader animation="shimmer" width="70%" />
				</div>
				<div class="sk-card">
					<h3 class="sk-h3">None</h3>
					<SkeletonLoader animation="none" />
					<SkeletonLoader animation="none" width="70%" />
				</div>
			</div>

			<div class="sk-live">
				<div class="sk-live-head">
					<strong>Composed: orders list</strong>
					<button class="sk-btn" onclick={refresh}>Reload (simulate fetch)</button>
				</div>
				<div class="sk-table" aria-busy={loading}>
					{#if loading}
						{#each skeletonRows as row (row)}
							<div class="sk-tr">
								<SkeletonLoader shape="circle" width="40px" height="40px" animation="shimmer" />
								<div class="sk-col">
									<SkeletonLoader width="40%" animation="shimmer" />
									<SkeletonLoader width="65%" animation="shimmer" />
								</div>
								<SkeletonLoader shape="rect" width="80px" height="32px" animation="shimmer" />
							</div>
						{/each}
					{:else}
						{#each fakeOrders as order (order.id)}
							<div class="sk-tr">
								<div class="sk-avatar">{order.customer.split(' ').map((p) => p[0]).join('')}</div>
								<div class="sk-col">
									<div class="sk-name">{order.customer}</div>
									<div class="sk-meta">{order.id} • {order.status}</div>
								</div>
								<div class="sk-total">{order.total}</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>shape</code></td>
					<td><code>"text" | "circle" | "rect"</code></td>
					<td><code>"text"</code></td>
					<td>Primitive shape — circles round automatically.</td>
				</tr>
				<tr>
					<td><code>width</code></td>
					<td><code>string</code></td>
					<td>per-shape default</td>
					<td>Any CSS length (px, %, rem).</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>string</code></td>
					<td>per-shape default</td>
					<td>Any CSS length. Required for rect; circles default to width.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>string</code></td>
					<td>per-shape default</td>
					<td>Override the corner radius — useful for tiles or pills.</td>
				</tr>
				<tr>
					<td><code>animation</code></td>
					<td><code>"pulse" | "shimmer" | "none"</code></td>
					<td><code>"pulse"</code></td>
					<td>Animation style; auto-disabled under prefers-reduced-motion.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sk-stack {
		display: grid;
		gap: 18px;
	}
	.sk-grid, .sk-anims {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 12px;
	}
	.sk-card {
		display: grid;
		gap: 10px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.sk-row {
		grid-auto-flow: column;
		grid-template-columns: auto 1fr;
		align-items: center;
	}
	.sk-col { display: grid; gap: 8px; }
	.sk-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.sk-live {
		display: grid;
		gap: 12px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.sk-live-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.sk-btn {
		padding: 6px 12px;
		font: 500 13px var(--font-sans);
		background: var(--accent);
		color: #fff;
		border: 0;
		border-radius: var(--r-2);
		cursor: pointer;
	}
	.sk-table {
		display: grid;
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.sk-tr {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 12px;
		align-items: center;
		padding: 12px 14px;
		background: var(--surface);
	}
	.sk-tr + .sk-tr { border-top: 1px solid var(--border); }
	.sk-avatar {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--accent);
		font: 600 13px var(--font-sans);
	}
	.sk-name { font: 600 14px var(--font-sans); color: var(--fg-1); }
	.sk-meta { font-size: 12px; color: var(--fg-3); }
	.sk-total { font: 600 14px var(--font-sans); color: var(--fg-1); }
</style>
