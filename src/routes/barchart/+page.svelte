<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import BarChart from '$lib/components/BarChart.svelte';

	const shell = catalogShellPropsForSlug('/barchart')!;

	const codeExplanation =
		'BarChart turns a list of categories and a list of series into a responsive SVG chart. It computes a tidy Y axis on its own (rounding tick steps to 1/2/5 × 10ⁿ), lays bars out grouped or stacked, animates them up from the baseline, and mirrors every value in a hidden data table for screen readers.';

	// Quarterly revenue by channel — the canonical two-series example.
	const revenue = [
		{ label: 'Q1', values: [120, 80] },
		{ label: 'Q2', values: [150, 110] },
		{ label: 'Q3', values: [140, 130] },
		{ label: 'Q4', values: [190, 160] }
	];
	const channels = [
		{ name: 'Online', colour: '#6366f1' },
		{ name: 'Retail', colour: '#10b981' }
	];

	// Three-series traffic mix for the stacked example.
	const traffic = [
		{ label: 'Jan', values: [3200, 1800, 900] },
		{ label: 'Feb', values: [4100, 2200, 1100] },
		{ label: 'Mar', values: [3800, 2600, 1500] }
	];
	const sources = [
		{ name: 'Direct', colour: '#0ea5e9' },
		{ name: 'Search', colour: '#f59e0b' },
		{ name: 'Social', colour: '#ec4899' }
	];

	const gbp = (n: number) => `£${n}k`;
	const compact = (n: number) => new Intl.NumberFormat('en-GB', { notation: 'compact' }).format(n);
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'SVG', 'Zero-dependency']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="bc-section">
			<h3>Grouped with value labels</h3>
			<p class="bc-hint">Two series side-by-side per quarter, formatted in £k above each bar.</p>
			<BarChart
				categories={revenue}
				series={channels}
				mode="grouped"
				showValueLabels
				valueFormat={gbp}
				title="Quarterly revenue by channel"
			/>
		</section>

		<section class="bc-section">
			<h3>Stacked, three series</h3>
			<p class="bc-hint">Each bar's height is the category total; compact axis formatting.</p>
			<BarChart
				categories={traffic}
				series={sources}
				mode="stacked"
				valueFormat={compact}
				title="Monthly traffic by source"
			/>
		</section>

		<section class="bc-section">
			<h3>Minimal: no legend, single series</h3>
			<p class="bc-hint">Legend hidden, taller canvas — a quick single-metric sparkbar.</p>
			<BarChart
				categories={[
					{ label: 'Mon', values: [42] },
					{ label: 'Tue', values: [58] },
					{ label: 'Wed', values: [37] },
					{ label: 'Thu', values: [64] },
					{ label: 'Fri', values: [49] }
				]}
				series={[{ name: 'Tickets', colour: '#8b5cf6' }]}
				showLegend={false}
				height={260}
				title="Tickets closed this week"
			/>
		</section>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>categories</code></td>
					<td><code>BarCategory[]</code></td>
					<td><code>[]</code></td>
					<td>Each X-axis group: <code>label</code> plus one <code>values</code> entry per series.</td>
				</tr>
				<tr>
					<td><code>series</code></td>
					<td><code>BarSeries[]</code></td>
					<td><code>[]</code></td>
					<td>Series metadata: <code>name</code> and <code>colour</code>.</td>
				</tr>
				<tr>
					<td><code>mode</code></td>
					<td><code>'grouped' | 'stacked'</code></td>
					<td><code>'grouped'</code></td>
					<td>Bars side-by-side, or summed vertically.</td>
				</tr>
				<tr>
					<td><code>showValueLabels</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Draw the formatted value above / inside each bar.</td>
				</tr>
				<tr>
					<td><code>showLegend</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the swatch + name legend above the plot.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>320</code></td>
					<td>SVG height in px; width is responsive.</td>
				</tr>
				<tr>
					<td><code>yTickCount</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Target number of Y gridlines.</td>
				</tr>
				<tr>
					<td><code>valueFormat</code></td>
					<td><code>(n: number) =&gt; string</code></td>
					<td><code>String</code></td>
					<td>Formatter for axis labels, value labels and tooltip.</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>'Bar chart'</code></td>
					<td>Accessible name and hidden data-table caption.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.bc-section {
		margin-bottom: 2.5rem;
	}
	.bc-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
	}
	.bc-hint {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		opacity: 0.7;
	}
</style>
