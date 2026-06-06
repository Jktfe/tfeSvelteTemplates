<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import LineChart from '$lib/components/LineChart.svelte';

	const shell = catalogShellPropsForSlug('/linechart')!;

	// Quarterly figures (£m) across two years — the canonical multi-series demo.
	const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];
	const revenuePts = [12, 19, 17, 24, 28, 26, 33, 39];
	const costsPts = [9, 11, 12, 14, 16, 17, 19, 22];

	const financeSeries = [
		{
			name: 'Revenue',
			colour: '#4f7cff',
			points: revenuePts.map((y, i) => ({ x: i + 1, y }))
		},
		{
			name: 'Costs',
			colour: '#ff6b6b',
			points: costsPts.map((y, i) => ({ x: i + 1, y }))
		}
	];

	// Single series with a gap and negative values — exercises the nice-scale.
	const tempSeries = [
		{
			name: 'Anomaly °C',
			colour: '#2bb673',
			points: [
				{ x: 2020, y: -0.3 },
				{ x: 2021, y: 0.1 },
				{ x: 2022, y: 0.6 },
				{ x: 2023, y: 0.4 },
				{ x: 2024, y: 1.1 },
				{ x: 2025, y: 1.4 }
			]
		}
	];

	// Three series, large numbers — shows the compact "k" Y formatter.
	const trafficSeries = [
		{
			name: 'Organic',
			colour: '#7c5cff',
			points: [1200, 1800, 2400, 2100, 3200, 4100].map((y, i) => ({ x: i + 1, y }))
		},
		{
			name: 'Paid',
			colour: '#ff9f43',
			points: [800, 950, 1100, 1600, 1400, 1900].map((y, i) => ({ x: i + 1, y }))
		},
		{
			name: 'Referral',
			colour: '#22a6b3',
			points: [300, 420, 380, 510, 640, 720].map((y, i) => ({ x: i + 1, y }))
		}
	];

	const codeExplanation =
		'The chart derives a "nice" Y scale by rounding the data extent out to a tidy step (1/2/5 × 10ⁿ), then maps each point to pixels inside a responsive viewBox whose width is tracked by a ResizeObserver. Hovering or arrowing snaps a crosshair to the nearest x-value and reads every series value into an HTML tooltip overlay; the same numbers are mirrored in a visually-hidden table so screen-reader users get the full dataset.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'SVG', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="lcd">
			<section class="lcd-section">
				<h3>Two series — revenue vs costs</h3>
				<p class="lcd-hint">
					Hover the plot (or focus it and press the arrow keys) to move the crosshair and read
					values at each quarter.
				</p>
				<LineChart series={financeSeries} xLabel="Quarter" yLabel="£m" formatX={(x) => quarters[x - 1] ?? String(x)} />
			</section>

			<section class="lcd-section">
				<h3>Single series — negatives &amp; nice-scale</h3>
				<p class="lcd-hint">
					Temperature anomaly with negative values; the auto scale keeps a tidy zero-crossing
					baseline.
				</p>
				<LineChart series={tempSeries} xLabel="Year" yLabel="°C" yTicks={6} formatY={(y) => `${y}°`} />
			</section>

			<section class="lcd-section">
				<h3>Three series — large numbers, no dots</h3>
				<p class="lcd-hint">
					Sessions by channel. The compact Y formatter renders thousands as <code>k</code>, and
					dots are switched off for a cleaner trend read.
				</p>
				<LineChart series={trafficSeries} xLabel="Month" yLabel="Sessions" showDots={false} />
			</section>
		</div>
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
					<td><code>series</code></td>
					<td><code>LineSeries[]</code></td>
					<td><code>[]</code></td>
					<td>Array of <code>{'{ name, colour, points: { x, y }[] }'}</code>.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>320</code></td>
					<td>Plot height in px; width is responsive to the container.</td>
				</tr>
				<tr>
					<td><code>xLabel</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Title beneath the X axis (also the table's X header).</td>
				</tr>
				<tr>
					<td><code>yLabel</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Title rotated beside the Y axis.</td>
				</tr>
				<tr>
					<td><code>yTicks</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Target number of Y gridlines (nice-scaled).</td>
				</tr>
				<tr>
					<td><code>showDots</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Draw a marker at each data point.</td>
				</tr>
				<tr>
					<td><code>showLegend</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the colour-swatch legend below the chart.</td>
				</tr>
				<tr>
					<td><code>formatX</code></td>
					<td><code>(x: number) =&gt; string</code></td>
					<td><code>String</code></td>
					<td>Formats X tick + tooltip labels.</td>
				</tr>
				<tr>
					<td><code>formatY</code></td>
					<td><code>(y: number) =&gt; string</code></td>
					<td>compact (<code>12k</code>)</td>
					<td>Formats Y tick + tooltip values.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>auto-generated</td>
					<td>Accessible name for the chart image + table caption.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.lcd {
		display: grid;
		gap: 28px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.lcd-section {
		display: grid;
		gap: 8px;
		padding-bottom: 28px;
		border-bottom: 1px solid var(--border);
	}
	.lcd-section:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.lcd-section h3 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.lcd-hint {
		margin: 0 0 6px;
		font-size: 12px;
		color: var(--fg-3);
		max-width: 60ch;
	}
	.lcd-hint code {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
</style>
