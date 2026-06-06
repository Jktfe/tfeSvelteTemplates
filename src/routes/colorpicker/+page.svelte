<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ColorPicker from '$lib/components/ColorPicker.svelte';

	const shell = catalogShellPropsForSlug('/colorpicker')!;

	// Each variant binds its own value so the live state strips update independently.
	let brand = $state('#3b82f6');
	let minimal = $state('#22c55e');
	let brandColours = $state('#ec4899');

	const brandSwatches = [
		'#0f172a',
		'#1e293b',
		'#3b82f6',
		'#22c55e',
		'#f97316',
		'#ec4899'
	];

	const codeExplanation =
		'ColorPicker keeps HSV (hue, saturation, value) as its source of truth and derives the hex string on the way out, so dragging brightness or saturation to an extreme never loses the hue. The square plane sets saturation (left→right) and brightness (bottom→top), the vertical bar spins the hue, and both are role="slider" with arrow-key control. A live hex field, preset swatches, and a feature-detected native EyeDropper round it out. The chosen colour flows back through bind:value as a 6-digit hex.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cp-demo">
			<section class="cp-demo-section">
				<h3>Full picker</h3>
				<p class="cp-demo-hint">
					Plane, hue slider, hex input, eyedropper (where supported) and preset swatches.
				</p>
				<div class="cp-demo-stage">
					<ColorPicker bind:value={brand} swatches={brandSwatches} label="Brand colour" />
				</div>
				<p class="cp-demo-state">
					Active: <code style="color: {brand};">{brand}</code>
				</p>
			</section>

			<section class="cp-demo-section">
				<h3>Minimal · no swatches</h3>
				<p class="cp-demo-hint">
					Pass <code>swatches=&lbrace;[]&rbrace;</code> to drop the preset row for a leaner control.
				</p>
				<div class="cp-demo-stage">
					<ColorPicker bind:value={minimal} swatches={[]} label="Accent colour" />
				</div>
				<p class="cp-demo-state">
					Active: <code style="color: {minimal};">{minimal}</code>
				</p>
			</section>

			<section class="cp-demo-section">
				<h3>Plane only · hex hidden</h3>
				<p class="cp-demo-hint">
					Hide the hex field with <code>showHex=&lbrace;false&rbrace;</code> when the visual surface is
					enough.
				</p>
				<div class="cp-demo-stage">
					<ColorPicker bind:value={brandColours} showHex={false} label="Highlight colour" />
				</div>
				<p class="cp-demo-state">
					Active: <code style="color: {brandColours};">{brandColours}</code>
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
					<td><code>string</code></td>
					<td><code>'#3b82f6'</code></td>
					<td>Bindable selected colour as a 6-digit hex string. Accepts <code>#rgb</code> or <code>#rrggbb</code> on input.</td>
				</tr>
				<tr>
					<td><code>swatches</code></td>
					<td><code>string[]</code></td>
					<td>curated 12-colour palette</td>
					<td>Preset hex swatches shown beneath the picker. Pass <code>[]</code> to hide the row.</td>
				</tr>
				<tr>
					<td><code>showHex</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the editable hex text input.</td>
				</tr>
				<tr>
					<td><code>showEyeDropper</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Offer the native EyeDropper button — only renders when the browser supports the API.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Colour picker'</code></td>
					<td>ARIA label for the overall picker group.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cp-demo {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.cp-demo-section {
		flex: 1 1 16rem;
		min-width: 0;
	}

	.cp-demo-section h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
	}

	.cp-demo-hint {
		margin: 0 0 0.75rem;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.cp-demo-stage {
		display: flex;
		justify-content: flex-start;
	}

	.cp-demo-state {
		margin: 0.75rem 0 0;
		font-size: 0.85rem;
	}

	.cp-demo-state code {
		font-weight: 700;
	}
</style>
