<!--
	============================================================
	BubblePacking Demo Page (TFE shell)
	============================================================
-->

<script lang="ts">
	import BubblePacking from '$lib/components/BubblePacking.svelte';
	import { FALLBACK_BUBBLE_DATA, BUBBLE_COLOR_SCHEME } from '$lib/constants';
	import type { BubbleItem } from '$lib/types';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/bubblepacking')!;

	let selectedBubble = $state<BubbleItem | null>(null);

	const colorSchemes = {
		default: { colors: BUBBLE_COLOR_SCHEME, name: 'Tableau' },
		pastel: {
			colors: ['#a8dadc', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653'],
			name: 'Pastel'
		},
		vibrant: {
			colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#ff6b6b'],
			name: 'Vibrant'
		},
		monochrome: {
			colors: ['#1a365d', '#2a4a7f', '#3d5a9f', '#5a7abf', '#7a9adf', '#9abafe'],
			name: 'Blue Mono'
		}
	};

	let selectedScheme = $state<keyof typeof colorSchemes>('default');

	const smallDataset: BubbleItem[] = [
		{ id: 'react', label: 'React', value: 85, group: 'Frameworks' },
		{ id: 'vue', label: 'Vue', value: 55, group: 'Frameworks' },
		{ id: 'svelte', label: 'Svelte', value: 40, group: 'Frameworks' },
		{ id: 'angular', label: 'Angular', value: 65, group: 'Frameworks' },
		{ id: 'typescript', label: 'TypeScript', value: 70, group: 'Languages' },
		{ id: 'javascript', label: 'JavaScript', value: 95, group: 'Languages' },
		{ id: 'python', label: 'Python', value: 80, group: 'Languages' }
	];

	const stats = $derived.by(() => {
		if (FALLBACK_BUBBLE_DATA.length === 0) {
			return {
				totalValue: 0,
				count: 0,
				groups: 0,
				largestBubble: { id: '', label: 'N/A', value: 0 }
			};
		}
		const totalValue = FALLBACK_BUBBLE_DATA.reduce((sum, b) => sum + b.value, 0);
		const groups = new Set(FALLBACK_BUBBLE_DATA.map((b) => b.group)).size;
		const largestBubble = FALLBACK_BUBBLE_DATA.reduce(
			(max, b) => (b.value > max.value ? b : max),
			FALLBACK_BUBBLE_DATA[0]
		);
		return { totalValue, count: FALLBACK_BUBBLE_DATA.length, groups, largestBubble };
	});

	function handleBubbleClick(bubble: BubbleItem) {
		selectedBubble = bubble;
	}

	const usageSnippet = `<script>
  import BubblePacking from '$lib/components/BubblePacking.svelte';

  const bubbleData = [
    { id: 'aws', label: 'AWS', value: 80, group: 'Cloud' },
    { id: 'azure', label: 'Azure', value: 65, group: 'Cloud' }
  ];
</${'script'}>

<BubblePacking
  data={bubbleData}
  width={700}
  height={500}
  onBubbleClick={(bubble) => console.log(bubble)}
/>`;

	const codeExplanation =
		'BubblePacking lays bubbles out with iterative collision resolution: bubbles are pulled toward the centre while colliding pairs are pushed apart. Sizes use square-root scaling so bubble area (not radius) is proportional to value. Disable force simulation via useForce={false} for instant placement when you have a small dataset and need a static layout.';
</script>

<svelte:head>
	<title>BubblePacking — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Force-directed circle packing visualisation with group colouring, tooltips and click-through."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'SVG', 'Zero deps', 'Force simulation', 'A11y']}
>
	{#snippet demo()}
		<div class="bp-demo">
			<div class="bp-demo__stats">
				<div class="bp-stat">
					<div class="bp-stat__value">{stats.count}</div>
					<div class="bp-stat__label">Bubbles</div>
				</div>
				<div class="bp-stat">
					<div class="bp-stat__value">{stats.groups}</div>
					<div class="bp-stat__label">Groups</div>
				</div>
				<div class="bp-stat">
					<div class="bp-stat__value">{stats.totalValue.toLocaleString()}</div>
					<div class="bp-stat__label">Total value</div>
				</div>
				<div class="bp-stat">
					<div class="bp-stat__value">{stats.largestBubble.label}</div>
					<div class="bp-stat__label">Largest</div>
				</div>
			</div>

			<section class="bp-demo__block">
				<h3>Technology market overview</h3>
				<div class="bp-demo__stage">
					<BubblePacking
						data={FALLBACK_BUBBLE_DATA}
						width={700}
						height={500}
						onBubbleClick={handleBubbleClick}
					/>
				</div>
				{#if selectedBubble}
					<p class="bp-demo__status">
						<strong>Selected:</strong> {selectedBubble.label} ({selectedBubble.group}) — £{selectedBubble.value}B
					</p>
				{/if}
			</section>

			<section class="bp-demo__block">
				<h3>Colour schemes</h3>
				<div class="bp-demo__chips">
					{#each Object.entries(colorSchemes) as [key, scheme] (key)}
						<button
							type="button"
							class="bp-chip"
							class:bp-chip--active={selectedScheme === key}
							onclick={() => (selectedScheme = key as keyof typeof colorSchemes)}
						>
							{scheme.name}
						</button>
					{/each}
				</div>
				<div class="bp-demo__stage">
					<BubblePacking
						data={smallDataset}
						width={500}
						height={400}
						colorScheme={colorSchemes[selectedScheme].colors}
					/>
				</div>
			</section>

			<section class="bp-demo__block">
				<h3>Static placement (force simulation off)</h3>
				<div class="bp-demo__stage">
					<BubblePacking data={smallDataset} width={500} height={400} useForce={false} />
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
					<td><code>BubbleItem[]</code></td>
					<td>required</td>
					<td>Bubbles with id, label, value and optional group/color.</td>
				</tr>
				<tr>
					<td><code>width</code> / <code>height</code></td>
					<td><code>number</code></td>
					<td><code>600</code></td>
					<td>SVG dimensions in pixels.</td>
				</tr>
				<tr>
					<td><code>padding</code></td>
					<td><code>number</code></td>
					<td><code>3</code></td>
					<td>Gap between bubbles.</td>
				</tr>
				<tr>
					<td><code>colorScheme</code></td>
					<td><code>string[]</code></td>
					<td>Tableau10</td>
					<td>Hex palette mapped per group.</td>
				</tr>
				<tr>
					<td><code>showLabels</code> / <code>labelThreshold</code></td>
					<td><code>boolean</code> / <code>number</code></td>
					<td><code>true</code> / <code>20</code></td>
					<td>Hide labels on bubbles smaller than the threshold radius.</td>
				</tr>
				<tr>
					<td><code>useForce</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Disable to use the static initial placement.</td>
				</tr>
				<tr>
					<td><code>onBubbleClick</code> / <code>onBubbleHover</code></td>
					<td><code>(b) =&gt; void</code></td>
					<td>—</td>
					<td>Interaction callbacks.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.bp-demo {
		display: grid;
		gap: 24px;
	}
	.bp-demo__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 12px;
	}
	.bp-stat {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 14px;
		text-align: center;
	}
	.bp-stat__value {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 400;
		color: var(--fg-1);
	}
	.bp-stat__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
		margin-top: 4px;
	}
	.bp-demo__block {
		display: grid;
		gap: 12px;
	}
	.bp-demo__block h3 {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--fg-1);
	}
	.bp-demo__stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 18px;
		display: flex;
		justify-content: center;
	}
	.bp-demo__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.bp-chip {
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
	.bp-chip:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.bp-chip--active {
		background: var(--accent);
		color: var(--fg-on-dark, #f6f5f1);
		border-color: var(--accent);
	}
	.bp-demo__status {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}
</style>
