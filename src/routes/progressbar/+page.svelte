<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	const shell = catalogShellPropsForSlug('/progressbar')!;

	let liveValue = $state(20);

	$effect(() => {
		const id = setInterval(() => {
			liveValue = liveValue >= 100 ? 0 : liveValue + 5;
		}, 600);
		return () => clearInterval(id);
	});
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Progress', 'A11y', 'Zero deps']}
	codeExplanation="ProgressBar pairs a styled track with a hidden native progress element so screen readers announce the percent without any extra ARIA wiring. Pass value 0–100 for determinate; pass null when you don't know — an animated stripe slides across the track instead. Three sizes, four semantic variants, and optional value labels (above/inline/none) cover most real product use cases. The animation falls back to a calm fade under prefers-reduced-motion."
>
	{#snippet demo()}
		<div class="pb-stack">
			<section class="pb-card">
				<h3 class="pb-h3">Determinate</h3>
				{#each [0, 25, 50, 75, 100] as v (v)}
					<div class="pb-row">
						<span class="pb-label">{v}%</span>
						<ProgressBar value={v} ariaLabel={`${v} percent progress`} />
					</div>
				{/each}
			</section>

			<section class="pb-card">
				<h3 class="pb-h3">Variants</h3>
				<div class="pb-row"><span class="pb-label">default</span><ProgressBar value={70} variant="default" ariaLabel="Default" /></div>
				<div class="pb-row"><span class="pb-label">success</span><ProgressBar value={70} variant="success" ariaLabel="Success" /></div>
				<div class="pb-row"><span class="pb-label">warning</span><ProgressBar value={70} variant="warning" ariaLabel="Warning" /></div>
				<div class="pb-row"><span class="pb-label">danger</span><ProgressBar value={70} variant="danger" ariaLabel="Danger" /></div>
			</section>

			<section class="pb-card">
				<h3 class="pb-h3">Sizes &amp; indeterminate</h3>
				<div class="pb-row"><span class="pb-label">sm</span><ProgressBar value={60} size="sm" ariaLabel="Small" /></div>
				<div class="pb-row"><span class="pb-label">md</span><ProgressBar value={60} size="md" ariaLabel="Medium" /></div>
				<div class="pb-row"><span class="pb-label">lg</span><ProgressBar value={60} size="lg" ariaLabel="Large" /></div>
				<div class="pb-row"><span class="pb-label">loading</span><ProgressBar value={null} ariaLabel="Loading" /></div>
				<div class="pb-row"><span class="pb-label">saving</span><ProgressBar value={null} variant="success" ariaLabel="Saving" /></div>
			</section>

			<section class="pb-card">
				<h3 class="pb-h3">Labels</h3>
				<div class="pb-row"><span class="pb-label">inline</span><ProgressBar value={45} showValue="inline" ariaLabel="Inline label" /></div>
				<div class="pb-stack-row">
					<ProgressBar
						value={3}
						max={5}
						showValue="above"
						ariaLabel="Onboarding"
						format={(v, m) => `${v} of ${m} steps`}
						size="lg"
					/>
				</div>
				<div class="pb-stack-row">
					<ProgressBar value={liveValue} showValue="above" ariaLabel="Live demo" size="md" />
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>value</code></td>
					<td><code>number | null</code></td>
					<td><code>0</code></td>
					<td>Progress 0–max. Pass null for indeterminate animated mode.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>100</code></td>
					<td>Upper bound — useful for step counters (e.g. max=5).</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>Track height: 4px, 8px, or 12px.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>"default" | "success" | "warning" | "danger"</code></td>
					<td><code>"default"</code></td>
					<td>Semantic colour token for the fill.</td>
				</tr>
				<tr>
					<td><code>showValue</code></td>
					<td><code>"none" | "above" | "inline"</code></td>
					<td><code>"none"</code></td>
					<td>Where to render the value label, if at all.</td>
				</tr>
				<tr>
					<td><code>format</code></td>
					<td><code>(value, max) =&gt; string</code></td>
					<td>percent</td>
					<td>Custom formatter for the displayed label.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Accessible name forwarded to the hidden progress element.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pb-stack { display: grid; gap: 16px; }
	.pb-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.pb-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.pb-row {
		display: grid;
		grid-template-columns: 80px 1fr;
		align-items: center;
		gap: 14px;
	}
	.pb-label {
		font: 12px var(--font-mono);
		color: var(--fg-3);
	}
	.pb-stack-row { display: grid; gap: 6px; }
</style>
