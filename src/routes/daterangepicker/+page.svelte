<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import DateRangePicker from '$lib/components/DateRangePicker.svelte';

	const shell = catalogShellPropsForSlug('/daterangepicker')!;

	// Default playground range.
	let range = $state<{ start: string | null; end: string | null }>({
		start: null,
		end: null
	});

	// A pre-filled range to demonstrate a committed selection.
	let prefilled = $state<{ start: string | null; end: string | null }>({
		start: '2026-03-08',
		end: '2026-03-19'
	});

	// A bounded range — only days within a fixed window are selectable.
	let bounded = $state<{ start: string | null; end: string | null }>({
		start: null,
		end: null
	});

	const nights = $derived.by(() => {
		if (!range.start || !range.end) return null;
		const a = new Date(range.start).getTime();
		const b = new Date(range.end).getTime();
		return Math.round((b - a) / 86_400_000);
	});

	const codeExplanation =
		'The picker keeps the start and end as a single bindable { start, end } object of ISO strings. The first click sets the start, the second sets the end, and a click before the current start quietly restarts the selection. While only the start is committed, the day under the pointer (or keyboard focus) feeds a derived preview span so the in-range band updates live before you commit the second endpoint.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Calendar', 'Zero-dep']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="drp-demo">
			<section class="drp-demo-section">
				<h3>Interactive playground</h3>
				<p class="drp-demo-hint">
					Click a start day, then an end day. Hover (or arrow-key focus) between clicks to
					preview the band.
				</p>
				<div class="drp-demo-stage">
					<DateRangePicker bind:value={range} />
				</div>
				<p class="drp-demo-state">
					Start: <code>{range.start ?? '—'}</code> · End: <code>{range.end ?? '—'}</code>
					{#if nights !== null}
						· <strong>{nights}</strong> night{nights === 1 ? '' : 's'}
					{/if}
				</p>
			</section>

			<section class="drp-demo-section">
				<h3>Pre-filled range</h3>
				<p class="drp-demo-hint">
					Opens with a committed selection — useful for editing an existing booking.
				</p>
				<div class="drp-demo-stage">
					<DateRangePicker bind:value={prefilled} initialMonth="2026-03-01" />
				</div>
				<p class="drp-demo-state">
					Start: <code>{prefilled.start ?? '—'}</code> · End: <code>{prefilled.end ?? '—'}</code>
				</p>
			</section>

			<section class="drp-demo-section">
				<h3>Bounded (min / max)</h3>
				<p class="drp-demo-hint">
					Only days inside the 5th–25th March window are selectable; everything else is disabled.
				</p>
				<div class="drp-demo-stage">
					<DateRangePicker
						bind:value={bounded}
						initialMonth="2026-03-01"
						min="2026-03-05"
						max="2026-03-25"
						weekStartsOn={0}
					/>
				</div>
				<p class="drp-demo-state">
					Start: <code>{bounded.start ?? '—'}</code> · End: <code>{bounded.end ?? '—'}</code>
				</p>
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
					<td><code>value</code></td>
					<td><code>{'{ start: string | null; end: string | null }'}</code></td>
					<td><code>{'{ start: null, end: null }'}</code></td>
					<td>Bindable selected range as ISO yyyy-mm-dd strings (or null).</td>
				</tr>
				<tr>
					<td><code>min</code></td>
					<td><code>string | null</code></td>
					<td><code>null</code></td>
					<td>Earliest selectable ISO date (inclusive). Earlier days are disabled.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>string | null</code></td>
					<td><code>null</code></td>
					<td>Latest selectable ISO date (inclusive). Later days are disabled.</td>
				</tr>
				<tr>
					<td><code>initialMonth</code></td>
					<td><code>string | null</code></td>
					<td><code>null</code></td>
					<td>ISO date whose month opens on the left panel (falls back to value.start, then today).</td>
				</tr>
				<tr>
					<td><code>weekStartsOn</code></td>
					<td><code>0 | 1</code></td>
					<td><code>1</code></td>
					<td>First column of the week: 0 = Sunday, 1 = Monday.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.drp-demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.drp-demo-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	.drp-demo-hint {
		margin: 0 0 0.85rem;
		font-size: 0.85rem;
		opacity: 0.7;
	}

	.drp-demo-stage {
		display: flex;
		justify-content: center;
	}

	.drp-demo-state {
		margin: 0.85rem 0 0;
		font-size: 0.85rem;
		text-align: center;
	}

	.drp-demo-state code {
		padding: 0.1rem 0.4rem;
		border-radius: 6px;
		background: rgba(127, 127, 127, 0.16);
		font-size: 0.8rem;
	}
</style>
