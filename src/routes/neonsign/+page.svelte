<script lang="ts">
	import NeonSign from '$lib/components/NeonSign.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/neonsign')!;

	let powered = $state(true);
	let intensity = $state(1.2);

	const usageSnippet = `<script>
  import NeonSign from '$lib/components/NeonSign.svelte';
<\/script>

<NeonSign value="OPEN" colour="pink" size="lg" intensity={1.4} />
<NeonSign value="NO VACANCY" colour="red" broken={[0, 1]} flicker="broken" />`;

	const codeExplanation =
		'NeonSign builds a five-stop text-shadow stack on a single span: a hard white core, two saturated palette stops at 4px and 8px, and two soft halo stops at 16px and 32px. All radii scale with intensity. The flicker animation dips opacity at deterministic per-seed beats; broken indices drop characters out of the stack and into the palette dim shade. prefers-reduced-motion disables the flicker keyframe — the steady glow remains.';
</script>

<svelte:head>
	<title>NeonSign — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Glowing neon-tube text. Five-stop text-shadow stack, six palettes, deterministic flicker, per-character burnt-out mode, on/off power state."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Neon', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ns-stack">
			<!-- Brick wall is intentional demo content — neon signs are designed to live on dark walls. -->
			<div class="ns-brick">
				<NeonSign value="OPEN" colour="pink" size="lg" intensity={1.4} />
			</div>

			<div class="ns-brick ns-brick--palette">
				<NeonSign value="PINK" colour="pink" flicker="none" />
				<NeonSign value="CYAN" colour="cyan" flicker="none" />
				<NeonSign value="GOLD" colour="yellow" flicker="none" />
				<NeonSign value="MINT" colour="green" flicker="none" />
				<NeonSign value="HEAT" colour="red" flicker="none" />
				<NeonSign value="DUSK" colour="purple" flicker="none" />
			</div>

			<div class="ns-brick">
				<NeonSign
					value="NO VACANCY"
					colour="red"
					size="lg"
					intensity={1.2}
					broken={[0, 1]}
					flicker="broken"
					seed={31}
				/>
			</div>

			<div class="ns-brick">
				<button class="ns-power" type="button" onclick={() => (powered = !powered)}>
					<NeonSign value="ON AIR" colour="cyan" size="lg" on={powered} flicker="subtle" seed={9} />
				</button>
				<p class="ns-state">{powered ? 'POWERED' : 'OFF'}</p>
			</div>

			<div class="ns-brick ns-brick--stacked">
				<NeonSign value="GLOW" colour="green" size="lg" intensity={intensity} flicker="none" />
				<label class="ns-slider">
					<span>intensity</span>
					<input type="range" min="0" max="2.5" step="0.1" bind:value={intensity} />
					<span class="ns-slider__value">{intensity.toFixed(1)}×</span>
				</label>
			</div>
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
					<td>—</td>
					<td>The text to render in neon.</td>
				</tr>
				<tr>
					<td><code>colour</code></td>
					<td><code>'pink' | 'cyan' | 'yellow' | 'green' | 'red' | 'purple'</code></td>
					<td><code>'pink'</code></td>
					<td>Named palette preset.</td>
				</tr>
				<tr>
					<td><code>intensity</code></td>
					<td><code>number</code></td>
					<td><code>1</code></td>
					<td>Multiplier on the shadow blur radii.</td>
				</tr>
				<tr>
					<td><code>flicker</code></td>
					<td><code>'none' | 'subtle' | 'broken'</code></td>
					<td><code>'subtle'</code></td>
					<td>Deterministic per-seed flicker profile.</td>
				</tr>
				<tr>
					<td><code>broken</code></td>
					<td><code>number[]</code></td>
					<td><code>[]</code></td>
					<td>Character indices to render as burnt-out tubes.</td>
				</tr>
				<tr>
					<td><code>on</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Power state. False collapses the glow stack.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Type-size preset.</td>
				</tr>
				<tr>
					<td><code>seed</code></td>
					<td><code>number</code></td>
					<td><code>7</code></td>
					<td>Seed for the deterministic flicker LCG.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ns-stack {
		display: grid;
		gap: 1rem;
	}
	/* Brick walls are deliberate demo content — neon signs only read on dark walls. */
	.ns-brick {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 2.5rem 1.5rem;
		background:
			radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.8) 0%, #050409 70%),
			repeating-linear-gradient(
				0deg,
				#1a1622 0,
				#1a1622 32px,
				#231d2d 32px,
				#231d2d 33px
			);
		border-radius: var(--r-2);
		border: 1px solid rgba(255, 255, 255, 0.04);
	}
	.ns-brick--palette {
		gap: 1.25rem 2rem;
	}
	.ns-brick--stacked {
		flex-direction: column;
	}
	.ns-power {
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		font: inherit;
	}
	.ns-power:focus-visible {
		outline: 2px solid #38bdf8;
		outline-offset: 6px;
		border-radius: 0.5rem;
	}
	.ns-state {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: #64748b;
		margin: 0;
	}
	.ns-slider {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.8rem;
		color: #cbd5e1;
	}
	.ns-slider input[type='range'] {
		width: 200px;
	}
	.ns-slider__value {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		min-width: 3em;
		color: #38bdf8;
	}
</style>
