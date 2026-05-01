<!--
	ConfettiBurst Demo Page (TFE shell)
-->

<script lang="ts">
	import ConfettiBurst, {
		type ConfettiOrigin,
		DEFAULT_PALETTE
	} from '$lib/components/ConfettiBurst.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/confettiburst')!;

	let defaultBurst = $state<ConfettiBurst | null>(null);
	let wideBurst = $state<ConfettiBurst | null>(null);
	let coneBurst = $state<ConfettiBurst | null>(null);
	let cursorBurst = $state<ConfettiBurst | null>(null);
	let themedBurst = $state<ConfettiBurst | null>(null);

	let lastBurst = $state<string | null>(null);

	function record(id: string) {
		lastBurst = id;
	}

	function fireFromClick(
		event: MouseEvent,
		burstRef: ConfettiBurst | null,
		palette?: readonly string[]
	) {
		const origin: ConfettiOrigin = { x: event.clientX, y: event.clientY };
		burstRef?.fire(palette ? { origin, palette } : { origin });
	}

	const successPalette = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
	const fieryPalette = ['#f97316', '#ef4444', '#fbbf24', '#fde047'];
	const oceanPalette = ['#0ea5e9', '#38bdf8', '#22d3ee', '#a5f3fc'];

	let activePalette = $state<'rainbow' | 'success' | 'fiery' | 'ocean'>('rainbow');

	const palettes: Record<typeof activePalette, readonly string[]> = {
		rainbow: DEFAULT_PALETTE,
		success: successPalette,
		fiery: fieryPalette,
		ocean: oceanPalette
	};

	const usageSnippet = `<script>
  import ConfettiBurst from '$lib/components/ConfettiBurst.svelte';

  let burst = $state<ConfettiBurst | null>(null);
</${'script'}>

<button onclick={() => burst?.fire()}>Celebrate</button>
<ConfettiBurst bind:this={burst} />`;

	const codeExplanation =
		'ConfettiBurst is an imperative wrapper. Mount once, call fire() when something deserves a celebration. The canvas only mounts during a burst; idle DOM cost is zero. Per-shot opts can override origin and palette without remounting, and prefers-reduced-motion bypasses the canvas while still firing onComplete so consumer logic still runs.';
</script>

<svelte:head>
	<title>ConfettiBurst — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Imperative canvas celebration burst with per-shot origin and palette overrides."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Canvas', 'Imperative API', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cb-demo">
			<section class="cb-section">
				<h3>1. Default celebration</h3>
				<div class="cb-stage">
					<button
						class="cb-btn"
						type="button"
						onclick={() => {
							defaultBurst?.fire();
							record('default');
						}}
					>
						🎉 Celebrate
					</button>
				</div>
			</section>

			<section class="cb-section">
				<h3>2. Wide-spread launch</h3>
				<div class="cb-stage">
					<button
						class="cb-btn cb-btn--launch"
						type="button"
						onclick={() => {
							wideBurst?.fire();
							record('wide');
						}}
					>
						🚀 Launch
					</button>
				</div>
			</section>

			<section class="cb-section">
				<h3>3. Narrow cone firework</h3>
				<div class="cb-stage">
					<button
						class="cb-btn cb-btn--cone"
						type="button"
						onclick={() => {
							coneBurst?.fire();
							record('cone');
						}}
					>
						🎆 Firework
					</button>
				</div>
			</section>

			<section class="cb-section">
				<h3>4. Burst from click point</h3>
				<div class="cb-stage">
					<button
						class="cb-btn cb-btn--cursor"
						type="button"
						onclick={(e) => {
							fireFromClick(e, cursorBurst);
							record('cursor');
						}}
					>
						💥 Burst here
					</button>
				</div>
			</section>

			<section class="cb-section">
				<h3>5. Themed palettes</h3>
				<div class="cb-themes">
					{#each (['rainbow', 'success', 'fiery', 'ocean'] as const) as p (p)}
						<button
							type="button"
							class="cb-chip"
							class:active={activePalette === p}
							onclick={() => (activePalette = p)}
						>
							{p}
						</button>
					{/each}
				</div>
				<div class="cb-stage">
					<button
						class="cb-btn cb-btn--themed"
						type="button"
						onclick={() => {
							themedBurst?.fire({ palette: palettes[activePalette] });
							record(`themed:${activePalette}`);
						}}
					>
						🎨 Burst with {activePalette}
					</button>
				</div>
			</section>

			{#if lastBurst}
				<p class="cb-readout">
					Last burst: <code>{lastBurst}</code>
				</p>
			{/if}
		</div>

		<ConfettiBurst bind:this={defaultBurst} />
		<ConfettiBurst bind:this={wideBurst} count={200} spread={180} duration={2500} velocity={900} />
		<ConfettiBurst bind:this={coneBurst} count={60} spread={15} velocity={1400} gravity={400} />
		<ConfettiBurst bind:this={cursorBurst} count={50} spread={50} duration={1200} />
		<ConfettiBurst bind:this={themedBurst} count={120} spread={90} duration={2000} />
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
					<td><code>count</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Particles per burst.</td>
				</tr>
				<tr>
					<td><code>spread</code></td>
					<td><code>number</code></td>
					<td><code>70</code></td>
					<td>Cone spread in degrees (180 = full circle).</td>
				</tr>
				<tr>
					<td><code>velocity</code></td>
					<td><code>number</code></td>
					<td><code>700</code></td>
					<td>Initial particle speed in px/s.</td>
				</tr>
				<tr>
					<td><code>gravity</code></td>
					<td><code>number</code></td>
					<td><code>1600</code></td>
					<td>Downward acceleration in px/s².</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>1800</code></td>
					<td>Burst lifetime in ms.</td>
				</tr>
				<tr>
					<td><code>palette</code></td>
					<td><code>readonly string[]</code></td>
					<td><code>DEFAULT_PALETTE</code></td>
					<td>Default colours. Override per call via <code>fire({`{ palette }`})</code>.</td>
				</tr>
				<tr>
					<td><code>fire(opts?)</code></td>
					<td><code>method</code></td>
					<td>—</td>
					<td>Imperative trigger. Accepts <code>origin</code> and <code>palette</code> overrides.</td>
				</tr>
				<tr>
					<td><code>onComplete</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Always fires — even under reduced motion when the canvas is skipped.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cb-demo {
		display: grid;
		gap: 20px;
	}
	.cb-section {
		display: grid;
		gap: 10px;
	}
	.cb-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.cb-stage {
		display: flex;
		justify-content: center;
		padding: 28px 16px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.cb-btn {
		appearance: none;
		border: 0;
		font: inherit;
		font-size: 16px;
		font-weight: 600;
		padding: 12px 24px;
		border-radius: 999px;
		color: white;
		cursor: pointer;
		background: linear-gradient(135deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6);
		background-size: 200% 200%;
		background-position: 0% 0%;
		transition: transform 120ms ease, background-position 220ms ease;
		box-shadow: 0 8px 24px -8px rgba(247, 113, 113, 0.4);
	}
	.cb-btn:hover {
		background-position: 100% 100%;
	}
	.cb-btn--launch {
		background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399);
	}
	.cb-btn--cone {
		background: linear-gradient(135deg, #f97316, #ef4444);
	}
	.cb-btn--cursor {
		background: linear-gradient(135deg, #ec4899, #d946ef);
	}
	.cb-btn--themed {
		background: linear-gradient(135deg, #1f1f3a, #2a2a4e);
		border: 1px solid #3a3a5e;
		box-shadow: none;
	}

	.cb-themes {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.cb-chip {
		appearance: none;
		font: inherit;
		font-size: 13px;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--surface);
		color: var(--fg-2);
		cursor: pointer;
	}
	.cb-chip.active {
		background: var(--accent);
		color: var(--accent-on);
		border-color: var(--accent-strong);
	}

	.cb-readout {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
		text-align: center;
	}
	.cb-readout code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 2px 6px;
		border-radius: 4px;
	}
</style>
