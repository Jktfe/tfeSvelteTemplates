<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import DonutChart from '$lib/components/DonutChart.svelte';

	const shell = catalogShellPropsForSlug('/donutchart')!;

	// Sample datasets for the variant gallery.
	const traffic = [
		{ label: 'Direct', value: 42, colour: '#6366f1' },
		{ label: 'Organic search', value: 31, colour: '#22c55e' },
		{ label: 'Social', value: 18, colour: '#f97316' },
		{ label: 'Referral', value: 9, colour: '#06b6d4' }
	];

	const languages = [
		{ label: 'TypeScript', value: 58, colour: '#3178c6' },
		{ label: 'Svelte', value: 22, colour: '#ff3e00' },
		{ label: 'CSS', value: 12, colour: '#2965f1' },
		{ label: 'Other', value: 8, colour: '#9ca3af' }
	];

	const budget = [
		{ label: 'Engineering', value: 120, colour: '#8b5cf6' },
		{ label: 'Design', value: 45, colour: '#ec4899' },
		{ label: 'Marketing', value: 60, colour: '#14b8a6' },
		{ label: 'Operations', value: 35, colour: '#f59e0b' }
	];

	// Interactive playground state.
	let thickness = $state(26);
	let gap = $state(1.5);
	const trafficTotal = traffic.reduce((s, d) => s + d.value, 0);

	const codeExplanation =
		'DonutChart stacks N identical SVG <circle> elements that share a centre and radius, then uses stroke-dasharray to reveal only each slice’s share of the circumference and stroke-dashoffset to rotate it into place. No path trigonometry is involved, so a percentage becomes a single multiply. Donut versus pie is one continuous knob: thickness maps to the SVG stroke-width, and a stroke as thick as the radius fills the hole to make a solid pie.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'SVG', 'Zero-dep']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="dc-section">
			<h3>Donut with centre total</h3>
			<p class="dc-hint">
				The default look: a thin ring leaves a hole for a headline figure. Hover or tab a
				wedge to raise it.
			</p>
			<div class="dc-stage">
				<DonutChart
					data={traffic}
					thickness={26}
					centreLabel={String(trafficTotal)}
					centreSub="visits (k)"
				/>
			</div>
		</section>

		<section class="dc-section">
			<h3>Solid pie</h3>
			<p class="dc-hint">
				Same component, no flag — pushing <code>thickness</code> up to the radius collapses the
				hole into a classic pie.
			</p>
			<div class="dc-stage">
				<DonutChart data={languages} size={220} thickness={110} />
			</div>
		</section>

		<section class="dc-section">
			<h3>Interactive playground</h3>
			<p class="dc-hint">
				Drag the sliders to morph between donut and pie and to widen the slice gaps in real
				time.
			</p>
			<div class="dc-controls">
				<label>
					Thickness: <strong>{thickness}px</strong>
					<input type="range" min="8" max="110" bind:value={thickness} />
				</label>
				<label>
					Gap: <strong>{gap}%</strong>
					<input type="range" min="0" max="6" step="0.5" bind:value={gap} />
				</label>
			</div>
			<div class="dc-stage">
				<DonutChart
					data={budget}
					{thickness}
					{gap}
					centreLabel="£260k"
					centreSub="annual"
				/>
			</div>
		</section>

		<section class="dc-section">
			<h3>Empty state</h3>
			<p class="dc-hint">
				With no data the chart degrades to a faint track ring and suppresses the legend.
			</p>
			<div class="dc-stage">
				<DonutChart data={[]} thickness={26} centreLabel="—" centreSub="no data" />
			</div>
		</section>
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
					<td><code>data</code></td>
					<td><code>DonutSlice[]</code></td>
					<td><code>[]</code></td>
					<td>Slices, each <code>{'{ label, value, colour }'}</code>.</td>
				</tr>
				<tr>
					<td><code>thickness</code></td>
					<td><code>number</code></td>
					<td><code>26</code></td>
					<td>Ring thickness in px; <code>&gt;= size / 2</code> renders a solid pie.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number</code></td>
					<td><code>220</code></td>
					<td>Chart width and height in px.</td>
				</tr>
				<tr>
					<td><code>centreLabel</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Headline shown in the donut hole; ignored in pie mode.</td>
				</tr>
				<tr>
					<td><code>centreSub</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Smaller caption beneath the centre label.</td>
				</tr>
				<tr>
					<td><code>showLegend</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Render the legend with values and percentages.</td>
				</tr>
				<tr>
					<td><code>gap</code></td>
					<td><code>number</code></td>
					<td><code>1.5</code></td>
					<td>Gap between slices, as a percent of the circumference.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><em>auto</em></td>
					<td>Override the figure's <code>aria-label</code>; defaults to a slice summary.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dc-section {
		margin-bottom: 2.5rem;
	}

	.dc-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
	}

	.dc-hint {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		opacity: 0.75;
		max-width: 48ch;
	}

	.dc-stage {
		display: flex;
		justify-content: center;
		padding: 1.5rem;
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: 0.75rem;
		background: color-mix(in srgb, currentColor 3%, transparent);
	}

	.dc-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		margin-bottom: 1rem;
	}

	.dc-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
	}

	.dc-controls input[type='range'] {
		width: 12rem;
		max-width: 100%;
		accent-color: #6366f1;
	}

	@media (max-width: 540px) {
		.dc-stage {
			padding: 1rem 0.5rem;
		}
	}
</style>
