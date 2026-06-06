<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Sparkline from '$lib/components/Sparkline.svelte';

	// catalogShellPropsForSlug returns undefined until the parent registers the
	// slug — the non-null assertion is expected during the build-out phase.
	const shell = catalogShellPropsForSlug('/sparkline')!;

	// A few representative series for the gallery.
	const rising = [3, 5, 4, 8, 7, 12, 11, 16];
	const falling = [18, 14, 15, 9, 11, 6, 7, 3];
	const volatile = [8, 2, 14, 5, 17, 4, 12, 6, 15];
	const flat = [9, 9, 9, 9, 9, 9];

	// A tiny stat-table to show sparklines in their natural habitat: table cells.
	const metrics = [
		{ name: 'Sessions', value: '48.2k', series: [12, 15, 13, 19, 22, 21, 27], stroke: '#16a34a' },
		{ name: 'Bounce rate', value: '32%', series: [44, 41, 43, 38, 35, 34, 32], stroke: '#dc2626' },
		{ name: 'Avg. order', value: '£64', series: [58, 60, 59, 61, 60, 63, 64], stroke: '#2563eb' },
		{ name: 'Refunds', value: '£1.2k', series: [3, 1, 4, 2, 5, 1, 2], stroke: '#d97706' }
	];

	const codeExplanation =
		'Sparkline maps a numeric series onto a tiny SVG box. It auto-scales to the data range — the smallest value sits at the bottom edge, the largest at the top — using t = (v - lo) / (hi - lo) and inverting for SVG\'s downward y-axis. A single point is pinned to the left edge and drawn as a dot; a flat series rests on the centre line. Optional area fill and a last-point dot are extra SVG nodes layered over the polyline. A computed aria-label summarises the trend (direction and percentage change) for screen readers.';
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
		<section class="spark-section">
			<h3>Trend directions</h3>
			<p class="spark-hint">
				Each line auto-scales to its own range — rising, falling, and volatile series read at a
				glance, no axes required.
			</p>
			<div class="spark-stage spark-stage--cards">
				<div class="spark-card">
					<span class="spark-card__label">Rising</span>
					<div class="spark-box"><Sparkline data={rising} stroke="#16a34a" label="Rising" /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">Falling</span>
					<div class="spark-box"><Sparkline data={falling} stroke="#dc2626" label="Falling" /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">Volatile</span>
					<div class="spark-box">
						<Sparkline data={volatile} stroke="#7c3aed" label="Volatile" />
					</div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">Flat</span>
					<div class="spark-box"><Sparkline data={flat} stroke="#64748b" label="Flat" /></div>
				</div>
			</div>
		</section>

		<section class="spark-section">
			<h3>Area fill and last-point dot</h3>
			<p class="spark-hint">
				<code>fill</code> washes a soft area under the curve; <code>last</code> marks the final
				reading with a ringed dot — useful for &ldquo;where are we now?&rdquo; emphasis.
			</p>
			<div class="spark-stage spark-stage--cards">
				<div class="spark-card">
					<span class="spark-card__label">Line only</span>
					<div class="spark-box"><Sparkline data={rising} stroke="#2563eb" /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">fill</span>
					<div class="spark-box"><Sparkline data={rising} stroke="#2563eb" fill /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">fill + last</span>
					<div class="spark-box"><Sparkline data={rising} stroke="#2563eb" fill last /></div>
				</div>
			</div>
		</section>

		<section class="spark-section">
			<h3>In a stat table</h3>
			<p class="spark-hint">
				The home turf for sparklines: a trend column beside each metric. Set
				<code>width</code>/<code>height</code> to fit the cell.
			</p>
			<div class="spark-stage">
				<table class="spark-table">
					<thead>
						<tr>
							<th>Metric</th>
							<th>Now</th>
							<th>Last 7 days</th>
						</tr>
					</thead>
					<tbody>
						{#each metrics as m (m.name)}
							<tr>
								<td>{m.name}</td>
								<td class="spark-table__value">{m.value}</td>
								<td class="spark-table__trend">
									<Sparkline
										data={m.series}
										stroke={m.stroke}
										width={90}
										height={24}
										last
										label={m.name}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="spark-section">
			<h3>Edge cases</h3>
			<p class="spark-hint">
				Empty and single-value series stay the right size and announce themselves sensibly to
				assistive tech rather than breaking the row.
			</p>
			<div class="spark-stage spark-stage--cards">
				<div class="spark-card">
					<span class="spark-card__label">Empty</span>
					<div class="spark-box"><Sparkline data={[]} stroke="#0ea5e9" /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">Single value</span>
					<div class="spark-box"><Sparkline data={[7]} stroke="#0ea5e9" /></div>
				</div>
				<div class="spark-card">
					<span class="spark-card__label">Pinned min/max (0–20)</span>
					<div class="spark-box">
						<Sparkline data={rising} stroke="#0ea5e9" min={0} max={20} />
					</div>
				</div>
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
					<td><code>number[]</code></td>
					<td><code>[]</code></td>
					<td>The series to plot, left to right; non-finite entries are dropped.</td>
				</tr>
				<tr>
					<td><code>width</code></td>
					<td><code>number</code></td>
					<td><code>120</code></td>
					<td>SVG viewBox width in user units.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>32</code></td>
					<td>SVG viewBox height in user units.</td>
				</tr>
				<tr>
					<td><code>stroke</code></td>
					<td><code>string</code></td>
					<td><code>'currentColor'</code></td>
					<td>Line and dot colour; accepts any CSS colour.</td>
				</tr>
				<tr>
					<td><code>fill</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Draw a soft translucent area beneath the line.</td>
				</tr>
				<tr>
					<td><code>last</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render a dot on the final data point.</td>
				</tr>
				<tr>
					<td><code>min</code></td>
					<td><code>number | undefined</code></td>
					<td><code>undefined</code></td>
					<td>Override the scale minimum to pin the baseline across charts.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number | undefined</code></td>
					<td><code>undefined</code></td>
					<td>Override the scale maximum to pin the ceiling across charts.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Prefix for the computed <code>aria-label</code> (e.g. the metric name).</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.spark-section {
		margin-block: 1.5rem;
	}

	.spark-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.spark-hint {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: var(--text-muted, #64748b);
		max-width: 60ch;
	}

	.spark-hint code {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.85em;
	}

	.spark-stage {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.spark-stage--cards {
		align-items: stretch;
	}

	.spark-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1 1 160px;
		min-width: 140px;
		padding: 0.85rem;
		border: 1px solid var(--border-color, #e2e8f0);
		border-radius: 0.6rem;
		background: var(--surface, #ffffff);
	}

	.spark-card__label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-muted, #64748b);
	}

	/* Sparkline fills 100% of its box, so the box defines the size on this page. */
	.spark-box {
		width: 100%;
		height: 40px;
	}

	.spark-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	.spark-table th,
	.spark-table td {
		padding: 0.6rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--border-color, #e2e8f0);
	}

	.spark-table th {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted, #64748b);
	}

	.spark-table__value {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}

	.spark-table__trend {
		width: 90px;
		height: 24px;
	}

	@media (prefers-color-scheme: dark) {
		.spark-card {
			--border-color: #1e293b;
			--surface: #0f172a;
			--text-muted: #94a3b8;
		}

		.spark-table th,
		.spark-table td {
			--border-color: #1e293b;
			--text-muted: #94a3b8;
		}
	}
</style>
