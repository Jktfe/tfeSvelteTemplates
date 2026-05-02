<!--
	RippleGrid Demo Page (TFE shell)
-->

<script lang="ts">
	import RippleGrid from '$lib/components/RippleGrid.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/ripplegrid')!;

	let lastEvent = $state<{ row: number; col: number } | null>(null);

	const usageSnippet = `<script>
  import RippleGrid from '$lib/components/RippleGrid.svelte';
</${'script'}>

<RippleGrid
  rows={12}
  cols={20}
  cellSize={28}
  colour="#6366f1"
  onRipple={({ row, col }) => console.log(row, col)}
/>`;

	const codeExplanation =
		'RippleGrid renders a grid of cells that fire one-shot CSS keyframes when clicked. Each cell\'s arrival delay is its grid distance from the click — Manhattan, Chebyshev, or Euclidean — so the wave shape is configurable. Multiple ripples compose using mix-blend-mode: screen, and a maxConcurrent cap keeps DOM cost bounded under rapid clicking.';
</script>

<svelte:head>
	<title>RippleGrid — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Interactive grid where clicks become animated waves. Configurable wavefront, density, and palette."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Click', 'CSS-only', 'Keyboard-accessible']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="rg-demo">
			<section class="rg-section">
				<h3>Default — 20×12 indigo, euclidean</h3>
				<div class="rg-stage">
					<RippleGrid />
				</div>
			</section>

			<section class="rg-section">
				<h3>Hex variant — manhattan, emerald</h3>
				<div class="rg-stage">
					<RippleGrid
						rows={10}
						cols={14}
						cellSize={28}
						gap={3}
						variant="hex"
						distanceMode="manhattan"
						colour="#10b981"
					/>
				</div>
			</section>

			<section class="rg-section">
				<h3>Big-cell — click-to-log readout</h3>
				<div class="rg-stage rg-stage--col">
					<RippleGrid
						rows={6}
						cols={8}
						cellSize={64}
						gap={4}
						colour="#ec4899"
						onRipple={(e) => (lastEvent = e)}
					/>
					<div class="rg-readout">
						{#if lastEvent}
							Last fire: <code>row {lastEvent.row}, col {lastEvent.col}</code>
						{:else}
							Click any cell to see the coordinates here.
						{/if}
					</div>
				</div>
			</section>

			<section class="rg-section">
				<h3>Chebyshev wavefront — slow &amp; ceremonial</h3>
				<div class="rg-stage">
					<RippleGrid
						rows={12}
						cols={20}
						cellSize={28}
						gap={3}
						distanceMode="chebyshev"
						rippleSpeed={6}
						rippleDuration={900}
						maxConcurrent={2}
						colour="#a855f7"
					/>
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
					<td><code>rows</code> / <code>cols</code></td>
					<td><code>number</code></td>
					<td><code>12</code> / <code>20</code></td>
					<td>Grid dimensions.</td>
				</tr>
				<tr>
					<td><code>cellSize</code> / <code>gap</code></td>
					<td><code>number</code></td>
					<td><code>24</code> / <code>2</code></td>
					<td>Cell size and inter-cell gap in pixels.</td>
				</tr>
				<tr>
					<td><code>colour</code></td>
					<td><code>string</code></td>
					<td><code>'#6366f1'</code></td>
					<td>Cell pulse colour.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'rect' | 'hex'</code></td>
					<td><code>'rect'</code></td>
					<td>Hex offsets odd rows by half a cell.</td>
				</tr>
				<tr>
					<td><code>distanceMode</code></td>
					<td><code>'manhattan' | 'chebyshev' | 'euclidean'</code></td>
					<td><code>'euclidean'</code></td>
					<td>Wavefront shape.</td>
				</tr>
				<tr>
					<td><code>rippleSpeed</code></td>
					<td><code>number</code></td>
					<td><code>12</code></td>
					<td>Wavefront propagation speed.</td>
				</tr>
				<tr>
					<td><code>rippleDuration</code></td>
					<td><code>number</code></td>
					<td><code>700</code></td>
					<td>Per-cell pulse duration in ms.</td>
				</tr>
				<tr>
					<td><code>maxConcurrent</code></td>
					<td><code>number</code></td>
					<td><code>3</code></td>
					<td>Hard cap on simultaneous live ripples.</td>
				</tr>
				<tr>
					<td><code>onRipple</code></td>
					<td><code>(e) =&gt; void</code></td>
					<td>—</td>
					<td>Fires with <code>{`{ row, col }`}</code> on each ripple.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rg-demo {
		display: grid;
		gap: 24px;
	}
	.rg-section {
		display: grid;
		gap: 10px;
	}
	.rg-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.rg-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 32px 24px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.rg-stage--col {
		flex-direction: column;
		gap: 12px;
	}
	.rg-readout {
		font-size: 13px;
		color: var(--fg-2);
	}
	.rg-readout code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 2px 6px;
		border-radius: 4px;
	}
</style>
