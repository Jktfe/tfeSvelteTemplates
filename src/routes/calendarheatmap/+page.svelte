<!--
	============================================================
	CalendarHeatmap Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { PageData } from './$types';

	const shell = catalogShellPropsForSlug('/calendarheatmap')!;

	let { data }: { data: PageData } = $props();

	const colorSchemes = {
		github: { low: '#ebedf0', high: '#216e39', name: 'GitHub Green' },
		fire: { low: '#fff5f0', high: '#de2d26', name: 'Fire Red' },
		ocean: { low: '#f0f9ff', high: '#0369a1', name: 'Ocean Blue' },
		sunset: { low: '#fef3c7', high: '#d97706', name: 'Sunset Orange' }
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('github');
	let selectedDate = $state<string | null>(null);

	const dateRangePresets = {
		'30': { label: '30 Days', days: 30 },
		'90': { label: '90 Days', days: 90 },
		'180': { label: '180 Days', days: 180 },
		'365': { label: '1 Year', days: 365 }
	};

	let selectedRange = $state<keyof typeof dateRangePresets>('90');

	const filteredData = $derived.by(() => {
		const days = dateRangePresets[selectedRange].days;
		const startDate = new SvelteDate();
		startDate.setDate(startDate.getDate() - days);
		return data.calendarData.filter((d) => new SvelteDate(d.date) >= startDate);
	});

	const rangeStartDate = $derived.by(() => {
		const days = dateRangePresets[selectedRange].days;
		const date = new SvelteDate();
		date.setDate(date.getDate() - days);
		return date;
	});

	function handleCellClick(date: string, value: number) {
		selectedDate = `${date}: ${value} contributions`;
	}

	const usageSnippet = `<script>
  import CalendarHeatmap from '$lib/components/CalendarHeatmap.svelte';

  const activityData = [
    { date: '2024-01-15', value: 12 },
    { date: '2024-01-16', value: 8 }
  ];
<\/script>

<CalendarHeatmap
  data={activityData}
  colorLow="#ebedf0"
  colorHigh="#216e39"
  onCellClick={(date, value) => console.log(date, value)}
/>`;

	const codeExplanation =
		'CalendarHeatmap renders a 52×7 SVG grid spanning the date range, with each cell coloured by quantised activity level (default 5 levels). Data lookups use a Map for O(1) access, so the component handles a year of cells without re-render churn. Keyboard navigation (arrows + Enter), ARIA labels, and viewBox-based scaling come for free.';
</script>

<svelte:head>
	<title>CalendarHeatmap — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="GitHub-style contribution calendar heatmap with tooltips, keyboard navigation and customisable colours."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'SVG', 'Zero deps', 'A11y', 'Time-series']}
>
	{#snippet demo()}
		<div class="cal-demo">
			{#if data.stats}
				<div class="cal-demo__stats">
					<div class="cal-stat">
						<div class="cal-stat__value">{data.stats.totalActivity.toLocaleString()}</div>
						<div class="cal-stat__label">Total contributions</div>
					</div>
					<div class="cal-stat">
						<div class="cal-stat__value">{data.stats.totalDays}</div>
						<div class="cal-stat__label">Active days</div>
					</div>
					<div class="cal-stat">
						<div class="cal-stat__value">{data.stats.avgActivity.toFixed(1)}</div>
						<div class="cal-stat__label">Average per day</div>
					</div>
					<div class="cal-stat">
						<div class="cal-stat__value">{data.stats.maxActivity}</div>
						<div class="cal-stat__label">Best day</div>
					</div>
				</div>
			{/if}

			<section class="cal-demo__block">
				<h3>Default · 365 days</h3>
				<div class="cal-demo__stage">
					<CalendarHeatmap data={data.calendarData} onCellClick={handleCellClick} />
				</div>
				{#if selectedDate}
					<p class="cal-demo__status"><strong>Selected:</strong> {selectedDate}</p>
				{/if}
			</section>

			<section class="cal-demo__block">
				<h3>Colour schemes</h3>
				<div class="cal-demo__chips">
					{#each Object.entries(colorSchemes) as [key, scheme] (key)}
						<button
							type="button"
							class="cal-chip"
							class:cal-chip--active={selectedScheme === key}
							onclick={() => (selectedScheme = key as keyof typeof colorSchemes)}
						>
							{scheme.name}
						</button>
					{/each}
				</div>
				<div class="cal-demo__stage">
					<CalendarHeatmap
						data={data.calendarData}
						colorLow={colorSchemes[selectedScheme].low}
						colorHigh={colorSchemes[selectedScheme].high}
					/>
				</div>
			</section>

			<section class="cal-demo__block">
				<h3>Custom date range</h3>
				<div class="cal-demo__chips">
					{#each Object.entries(dateRangePresets) as [key, preset] (key)}
						<button
							type="button"
							class="cal-chip"
							class:cal-chip--active={selectedRange === key}
							onclick={() => (selectedRange = key as keyof typeof dateRangePresets)}
						>
							{preset.label}
						</button>
					{/each}
				</div>
				<div class="cal-demo__stage">
					<CalendarHeatmap data={filteredData} startDate={rangeStartDate} endDate={new SvelteDate()} />
				</div>
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
					<td><code>data</code></td>
					<td><code>{`{ date: string, value: number }[]`}</code></td>
					<td>required</td>
					<td>Activity points keyed by ISO date.</td>
				</tr>
				<tr>
					<td><code>startDate</code> / <code>endDate</code></td>
					<td><code>Date</code></td>
					<td>365 days ago / today</td>
					<td>Inclusive date range to render.</td>
				</tr>
				<tr>
					<td><code>colorLow</code> / <code>colorHigh</code></td>
					<td><code>string</code></td>
					<td><code>'#ebedf0'</code> / <code>'#216e39'</code></td>
					<td>Endpoints for the level gradient.</td>
				</tr>
				<tr>
					<td><code>cellSize</code> / <code>cellGap</code></td>
					<td><code>number</code></td>
					<td><code>12</code> / <code>3</code></td>
					<td>Cell pixel size and inter-cell gap.</td>
				</tr>
				<tr>
					<td><code>showWeekLabels</code> / <code>showMonthLabels</code> / <code>showLegend</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Toggle calendar chrome.</td>
				</tr>
				<tr>
					<td><code>levels</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Number of discrete colour buckets.</td>
				</tr>
				<tr>
					<td><code>onCellClick</code></td>
					<td><code>(date, value) =&gt; void</code></td>
					<td>—</td>
					<td>Click handler. Cells are also keyboard-focusable.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cal-demo {
		display: grid;
		gap: 24px;
	}
	.cal-demo__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 12px;
	}
	.cal-stat {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 16px;
		text-align: center;
	}
	.cal-stat__value {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 400;
		color: var(--fg-1);
	}
	.cal-stat__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-top: 4px;
	}
	.cal-demo__block {
		display: grid;
		gap: 12px;
	}
	.cal-demo__block h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1);
	}
	.cal-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		overflow-x: auto;
	}
	.cal-demo__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.cal-chip {
		padding: 6px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--r-pill);
		background: var(--surface);
		color: var(--fg-2);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all var(--dur-fast);
	}
	.cal-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.cal-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.cal-demo__status {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
</style>
