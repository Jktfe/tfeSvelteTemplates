<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Slider from '$lib/components/Slider.svelte';

	const shell = catalogShellPropsForSlug('/slider')!;

	let basic = $state(50);
	let withBubble = $state(70);

	let smValue = $state(25);
	let mdValue = $state(50);
	let lgValue = $state(75);

	let opacity = $state(0.6);
	let price = $state(45);

	let volume = $state(60);
	let brightness = $state(80);
	let opacityFx = $state(0.9);
	const totalIntensity = $derived(
		Math.round(((volume / 100 + brightness / 100 + opacityFx) / 3) * 100)
	);

	const codeExplanation =
		'Slider wraps a native <input type="range">, so <code>role="slider"</code>, full keyboard navigation, and form participation are inherited from the platform. The custom track and thumb are drawn entirely with CSS variables and a CSS background gradient that follows the bound value, leaving the input itself transparent on top to capture pointer and key events. <code>formatValue</code> is rendered into an optional bubble for currency, percentages, or any unit.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Range', 'A11y', 'Keyboard', 'Theme-aware']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="slider-demo">
			<section>
				<h3>Basic</h3>
				<Slider bind:value={basic} ariaLabel="Basic slider" />
				<p class="note">Value: <code>{basic}</code> · range 0–100, step 1.</p>
			</section>

			<section>
				<h3>With value bubble</h3>
				<Slider bind:value={withBubble} label="Volume" showValue />
			</section>

			<section>
				<h3>Three sizes</h3>
				<Slider bind:value={smValue} label="Small" size="sm" showValue />
				<Slider bind:value={mdValue} label="Medium" size="md" showValue />
				<Slider bind:value={lgValue} label="Large" size="lg" showValue />
			</section>

			<section>
				<h3>Custom step + formatter</h3>
				<Slider
					bind:value={opacity}
					label="Opacity"
					min={0}
					max={1}
					step={0.05}
					showValue
					formatValue={(v) => `${Math.round(v * 100)}%`}
				/>
				<Slider
					bind:value={price}
					label="Max price"
					min={0}
					max={500}
					step={5}
					showValue
					formatValue={(v) => `£${v}`}
					variant="success"
				/>
			</section>

			<section>
				<h3>Live composition</h3>
				<Slider bind:value={volume} label="Volume" showValue />
				<Slider bind:value={brightness} label="Brightness" showValue variant="success" />
				<Slider
					bind:value={opacityFx}
					label="Opacity"
					min={0}
					max={1}
					step={0.05}
					showValue
					formatValue={(v) => `${Math.round(v * 100)}%`}
				/>
				<div class="total-row">
					<span>Avg intensity</span>
					<strong>{totalIntensity}%</strong>
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
					<td><code>value</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Bindable current value.</td>
				</tr>
				<tr>
					<td><code>min</code> / <code>max</code></td>
					<td><code>number</code></td>
					<td><code>0</code> / <code>100</code></td>
					<td>Inclusive range.</td>
				</tr>
				<tr>
					<td><code>step</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Granularity. Use fractional values for floats.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Visible label rendered above the track.</td>
				</tr>
				<tr>
					<td><code>showValue</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Show a value bubble that tracks the thumb.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Track 4 / 6 / 8 px; thumb 14 / 18 / 22 px.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'default' | 'success' | 'danger'</code></td>
					<td><code>'default'</code></td>
					<td>Fill colour token.</td>
				</tr>
				<tr>
					<td><code>formatValue</code></td>
					<td><code>(v) =&gt; string</code></td>
					<td>—</td>
					<td>Custom formatter for the value bubble.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Native <code>disabled</code> attribute.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Accessible label for the range input when no visible <code>label</code> is set.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires after each value change.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.slider-demo {
		display: grid;
		gap: 2rem;
	}

	.slider-demo section {
		display: grid;
		gap: 0.85rem;
	}

	.slider-demo h3 {
		font-size: 0.95rem;
		margin: 0;
		color: var(--fg-1);
	}

	.note {
		margin: 0;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.total-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.75rem;
		border-top: 1px dashed var(--border);
	}

	.total-row strong {
		font-size: 1.5rem;
		color: var(--brand, #146ef5);
		font-variant-numeric: tabular-nums;
	}
</style>
