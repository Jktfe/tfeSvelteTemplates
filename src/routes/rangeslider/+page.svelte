<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import RangeSlider from '$lib/components/RangeSlider.svelte';

	const shell = catalogShellPropsForSlug('rangeslider')!;

	// Basic range
	let basic = $state({ min: 20, max: 80 });

	// Price filter with a currency formatter and a 5-unit step
	let price = $state({ min: 250, max: 750 });
	const gbp = (n: number) => `£${n.toLocaleString('en-GB')}`;

	// Year window with a coarse step + large step
	let years = $state({ min: 2005, max: 2018 });

	// Disabled, read-only band
	const fixed = { min: 30, max: 60 };

	const codeExplanation =
		'Two role="slider" thumbs share one track. Their positions are derived percentages fed straight into style:left, and the coloured fill spans the gap between them. setThumb clamps each thumb against the other thumb’s current value (not the track bound), so they can never cross — the same live values feed aria-valuemin/aria-valuemax so screen readers always hear the true range.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Pointer Events', 'Form control']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="rs-demo-section">
			<h3>Basic range (0–100, step 1)</h3>
			<p class="rs-demo-hint">Drag a thumb or focus it and use the Arrow keys.</p>
			<RangeSlider bind:value={basic} min={0} max={100} step={1} label="Basic range" />
			<p class="rs-demo-state">
				Selected: <code>{basic.min}</code> – <code>{basic.max}</code>
			</p>
		</section>

		<section class="rs-demo-section">
			<h3>Price filter (£0–£1,000, formatted)</h3>
			<p class="rs-demo-hint">A custom <code>format</code> renders currency in the bubbles and to screen readers.</p>
			<RangeSlider bind:value={price} min={0} max={1000} step={50} label="Price" format={gbp} />
			<p class="rs-demo-state">
				Budget: <code>{gbp(price.min)}</code> – <code>{gbp(price.max)}</code>
			</p>
		</section>

		<section class="rs-demo-section">
			<h3>Year window (large step via Shift+Arrow)</h3>
			<p class="rs-demo-hint">Step is 1 year; <kbd>Shift</kbd>+<kbd>Arrow</kbd> jumps 5 years.</p>
			<RangeSlider bind:value={years} min={2000} max={2025} step={1} largeStep={5} label="Years" />
			<p class="rs-demo-state">
				Window: <code>{years.min}</code> – <code>{years.max}</code>
			</p>
		</section>

		<section class="rs-demo-section">
			<h3>Disabled</h3>
			<p class="rs-demo-hint">Interaction is blocked and the thumbs leave the tab order.</p>
			<RangeSlider value={fixed} min={0} max={100} disabled label="Fixed band" />
		</section>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>value</code></td>
					<td><code>{'{ min: number; max: number }'}</code></td>
					<td><code>{'{ min: 20, max: 80 }'}</code></td>
					<td>Bindable selected range. Use <code>bind:value</code>.</td>
				</tr>
				<tr>
					<td><code>min</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Lowest selectable value.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>100</code></td>
					<td>Highest selectable value.</td>
				</tr>
				<tr>
					<td><code>step</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Arrow-key / drag granularity.</td>
				</tr>
				<tr>
					<td><code>largeStep</code></td>
					<td><code>number</code></td>
					<td><code>step * 10</code></td>
					<td>Shift+Arrow and PageUp/PageDown granularity.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Range'</code></td>
					<td>Group label; each thumb's aria-label derives from it.</td>
				</tr>
				<tr>
					<td><code>format</code></td>
					<td><code>(value: number) =&gt; string</code></td>
					<td><code>String(value)</code></td>
					<td>Formats bubble text and <code>aria-valuetext</code>.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disables interaction; removes thumbs from tab order.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra classes for the root element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rs-demo-section {
		margin-bottom: 2.5rem;
	}

	.rs-demo-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.rs-demo-hint {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.rs-demo-state {
		margin: 1rem 0 0;
		font-size: 0.9rem;
	}

	.rs-demo-state code,
	.rs-demo-hint code {
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
		background: rgb(127 127 127 / 0.16);
		font-size: 0.85em;
	}

	kbd {
		padding: 0.1rem 0.4rem;
		border-radius: 0.3rem;
		border: 1px solid rgb(127 127 127 / 0.4);
		background: rgb(127 127 127 / 0.1);
		font-size: 0.78em;
		font-family: inherit;
	}
</style>
