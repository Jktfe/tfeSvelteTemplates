<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import StatCard from '$lib/components/StatCard.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';

	const shell = catalogShellPropsForSlug('/statcard')!;
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'KPI', 'Dashboard', 'A11y']}
	codeExplanation="StatCard renders a single KPI with auto-coloured trend semantics. By default a positive delta is green and a negative one is red — but for 'lower is better' metrics (page load time, error rate, churn) you set positiveDirection='down' and the colour logic flips. ↑ / ↓ / — glyphs guarantee colour is never the only signal, so colour-blind users still parse the trend correctly. Three sizes scale the whole card without re-typing styles."
>
	{#snippet demo()}
		<div class="sc-stack">
			<section class="sc-section">
				<h3 class="sc-h3">Dashboard row · up = good</h3>
				<div class="sc-grid">
					<StatCard title="Revenue" value="£12,450" delta={8.2} deltaSuffix="%" deltaLabel="vs last week" />
					<StatCard title="New signups" value={342} delta={12.4} deltaSuffix="%" deltaLabel="vs last week" />
					<StatCard title="Conversion" value="4.7%" delta={0.6} deltaSuffix="pts" deltaLabel="vs last week" />
					<StatCard title="Active users" value={4271} delta={0} deltaLabel="no change" />
				</div>
			</section>

			<section class="sc-section">
				<h3 class="sc-h3">Lower-is-better metrics</h3>
				<div class="sc-grid">
					<StatCard title="Page load time" value="1.4s" delta={-12} deltaSuffix="%" deltaLabel="vs last week" positiveDirection="down" />
					<StatCard title="Errors per hour" value={47} delta={-23} deltaSuffix="%" deltaLabel="vs last week" positiveDirection="down" />
					<StatCard title="Churn rate" value="2.1%" delta={0.4} deltaSuffix="pts" deltaLabel="vs last month" positiveDirection="down" />
					<StatCard title="Support tickets" value={89} delta={5} deltaLabel="vs last week" positiveDirection="down" />
				</div>
			</section>

			<section class="sc-section">
				<h3 class="sc-h3">Sizes</h3>
				<div class="sc-grid sc-grid--3">
					<StatCard title="Small" value="£1,200" delta={3.4} deltaSuffix="%" size="sm" />
					<StatCard title="Medium (default)" value="£12,450" delta={8.2} deltaSuffix="%" size="md" />
					<StatCard title="Large hero" value="£124,500" delta={14.7} deltaSuffix="%" size="lg" />
				</div>
			</section>

			<section class="sc-section">
				<h3 class="sc-h3">Composing with BadgePill</h3>
				<div class="sc-grid sc-grid--2">
					<div class="sc-frame">
						<div class="sc-frame-head">
							<span class="sc-frame-eyebrow">Followers</span>
							<BadgePill label="Live" tone="success" dot size="sm" />
						</div>
						<StatCard title="" value={1840} delta={3.1} deltaSuffix="%" deltaLabel="vs last week" class="sc-composed" />
					</div>
					<div class="sc-frame">
						<div class="sc-frame-head">
							<span class="sc-frame-eyebrow">Open issues</span>
							<BadgePill label="3 critical" tone="danger" size="sm" />
						</div>
						<StatCard title="" value={47} delta={-12} deltaSuffix="%" deltaLabel="vs last week" positiveDirection="down" class="sc-composed" />
					</div>
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
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Caption above the metric value.</td>
				</tr>
				<tr>
					<td><code>value</code></td>
					<td><code>string | number</code></td>
					<td>—</td>
					<td>Primary metric — pass a string to keep formatting (£, %).</td>
				</tr>
				<tr>
					<td><code>delta</code></td>
					<td><code>number</code></td>
					<td>—</td>
					<td>Trend value — drives the up/down/flat indicator and colour.</td>
				</tr>
				<tr>
					<td><code>deltaSuffix</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Suffix appended to the delta (e.g. %, pts).</td>
				</tr>
				<tr>
					<td><code>deltaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Caption next to the delta (e.g. 'vs last week').</td>
				</tr>
				<tr>
					<td><code>positiveDirection</code></td>
					<td><code>"up" | "down"</code></td>
					<td><code>"up"</code></td>
					<td>Which direction is good — flips the colour logic for inverted metrics.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>Padding and font scale.</td>
				</tr>
				<tr>
					<td><code>icon</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Optional icon slot rendered alongside the title.</td>
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
	.sc-stack { display: grid; gap: 16px; }
	.sc-section { display: grid; gap: 10px; }
	.sc-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.sc-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}
	.sc-grid--3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
	.sc-grid--2 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
	.sc-frame {
		display: grid;
		gap: 10px;
		padding: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sc-frame-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sc-frame-eyebrow {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	:global(.sc-composed) {
		padding: 0 !important;
		border: 0 !important;
		background: transparent !important;
	}
	:global(.sc-composed:hover) { box-shadow: none !important; }
</style>
