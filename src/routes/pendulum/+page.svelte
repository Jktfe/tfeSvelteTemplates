<!--
	Pendulum Demo Page (TFE shell)
-->

<script lang="ts">
	import Pendulum from '$lib/components/Pendulum.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/pendulum')!;

	let bellRef = $state<{ swing: () => void; stop: () => void } | null>(null);
	let liveRef = $state<{ swing: () => void; stop: () => void } | null>(null);
	let demoAmplitude = $state(20);
	let demoFrequency = $state(1.2);
	let demoDecay = $state(1.4);
	let demoPivotY = $state(-40);
	let revealKey = $state(0);

	const staggered = [
		{ icon: '🔔', label: 'Mount' },
		{ icon: '🪀', label: 'Yo-yo' },
		{ icon: '🗝️', label: 'Key' },
		{ icon: '🎐', label: 'Wind chime' },
		{ icon: '⏰', label: 'Clock' },
		{ icon: '🪞', label: 'Mirror' }
	];

	function rerunStagger() {
		revealKey++;
	}

	const usageSnippet = `<script>
  import Pendulum from '$lib/components/Pendulum.svelte';
</${'script'}>

<Pendulum trigger="viewport" amplitude={18} pivotOffset={{ x: 0, y: -40 }}>
  <img src="/shop-sign.png" alt="The Crown Tavern" />
</Pendulum>`;

	const codeExplanation =
		'Pendulum wraps any element and animates a damped harmonic swing about a configurable pivot. The motion is driven by a single rAF loop that ticks an analytic damped sine — no animation library, no spring solver. Triggers cover mount, viewport entry, click, and an imperative swing()/stop() API for parent-controlled choreography.';
</script>

<svelte:head>
	<title>Pendulum — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Damped swing wrapper with mount, viewport, click, and imperative triggers."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'rAF', 'Imperative API', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pd-demo">
			<section class="pd-section">
				<h3>Hanging shop sign — viewport trigger</h3>
				<div class="pd-stage pd-stage--sky">
					<div class="pd-rope"></div>
					<Pendulum
						trigger="viewport"
						amplitude={12}
						frequency={0.6}
						decay={0.8}
						pivotOffset={{ x: 0, y: -50 }}
						duration={6000}
					>
						<div class="pd-sign">
							<div class="pd-sign__name">The Crown</div>
							<div class="pd-sign__est">EST. 1742</div>
						</div>
					</Pendulum>
				</div>
			</section>

			<section class="pd-section">
				<h3>Notification bell — click trigger</h3>
				<div class="pd-stage">
					<Pendulum trigger="click" amplitude={28} frequency={2.2} decay={3} pivotOffset={{ x: 0, y: -32 }}>
						<span class="pd-bell">🔔</span>
					</Pendulum>
					<p class="pd-hint">↑ Tap or focus + Enter</p>
				</div>
			</section>

			<section class="pd-section">
				<h3>Imperative swing() — manual trigger</h3>
				<div class="pd-stage">
					<Pendulum
						bind:this={bellRef}
						trigger="manual"
						amplitude={22}
						frequency={1.8}
						decay={2.2}
						pivotOffset={{ x: 0, y: -32 }}
					>
						<span class="pd-bell pd-bell--blue">🔔</span>
					</Pendulum>
				</div>
				<div class="pd-actions">
					<button class="pd-btn pd-btn--primary" onclick={() => bellRef?.swing()}>Ring it</button>
					<button class="pd-btn pd-btn--ghost" onclick={() => bellRef?.stop()}>Stop</button>
				</div>
			</section>

			<section class="pd-section">
				<h3>Staggered viewport reveal — autoStartDelay</h3>
				<div class="pd-stage pd-stage--row">
					{#key revealKey}
						{#each staggered as item, i (item.label)}
							<div class="pd-cell">
								<div class="pd-rope pd-rope--short"></div>
								<Pendulum
									trigger="mount"
									amplitude={18}
									frequency={1.2}
									decay={1.4}
									pivotOffset={{ x: 0, y: -36 }}
									autoStartDelay={i * 200}
								>
									<div class="pd-tile">
										<div class="pd-tile__icon">{item.icon}</div>
										<div class="pd-tile__label">{item.label}</div>
									</div>
								</Pendulum>
							</div>
						{/each}
					{/key}
				</div>
				<div class="pd-actions">
					<button class="pd-btn pd-btn--primary" onclick={rerunStagger}>Replay stagger</button>
				</div>
			</section>

			<section class="pd-section">
				<h3>Live controls</h3>
				<div class="pd-controls">
					<label>Amplitude <strong>{demoAmplitude}°</strong>
						<input type="range" min="2" max="60" bind:value={demoAmplitude} />
					</label>
					<label>Frequency <strong>{demoFrequency.toFixed(1)} Hz</strong>
						<input type="range" min="0.2" max="4" step="0.1" bind:value={demoFrequency} />
					</label>
					<label>Decay <strong>{demoDecay.toFixed(2)} /s</strong>
						<input type="range" min="0.05" max="5" step="0.05" bind:value={demoDecay} />
					</label>
					<label>Pivot Y <strong>{demoPivotY}px</strong>
						<input type="range" min="-120" max="0" step="2" bind:value={demoPivotY} />
					</label>
				</div>
				<div class="pd-stage">
					<div class="pd-rope" style="height: {Math.abs(demoPivotY)}px"></div>
					<Pendulum
						bind:this={liveRef}
						trigger="manual"
						amplitude={demoAmplitude}
						frequency={demoFrequency}
						decay={demoDecay}
						pivotOffset={{ x: 0, y: demoPivotY }}
						duration={10000}
					>
						<div class="pd-live-card">
							<div class="pd-live-card__glyph">🪞</div>
							<div class="pd-live-card__label">Live</div>
						</div>
					</Pendulum>
				</div>
				<div class="pd-actions">
					<button class="pd-btn pd-btn--primary" onclick={() => liveRef?.swing()}>Swing</button>
					<button class="pd-btn pd-btn--ghost" onclick={() => liveRef?.stop()}>Stop</button>
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
					<td><code>trigger</code></td>
					<td><code>'mount' | 'viewport' | 'click' | 'manual'</code></td>
					<td><code>'mount'</code></td>
					<td>What kicks off the swing.</td>
				</tr>
				<tr>
					<td><code>amplitude</code></td>
					<td><code>number</code></td>
					<td><code>18</code></td>
					<td>Maximum swing angle in degrees.</td>
				</tr>
				<tr>
					<td><code>frequency</code></td>
					<td><code>number</code></td>
					<td><code>1.2</code></td>
					<td>Oscillation frequency in Hz.</td>
				</tr>
				<tr>
					<td><code>decay</code></td>
					<td><code>number</code></td>
					<td><code>1.4</code></td>
					<td>Damping rate per second. Higher = faster settle.</td>
				</tr>
				<tr>
					<td><code>pivotOffset</code></td>
					<td><code>{`{ x: number; y: number }`}</code></td>
					<td><code>{`{ x: 0, y: -20 }`}</code></td>
					<td>Pivot point relative to the wrapped element centre.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>4000</code></td>
					<td>Hard cap on swing duration in ms.</td>
				</tr>
				<tr>
					<td><code>autoStartDelay</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Delay before auto-triggers fire (ms).</td>
				</tr>
				<tr>
					<td><code>threshold</code></td>
					<td><code>number</code></td>
					<td><code>0.4</code></td>
					<td>IntersectionObserver visibility ratio for the <code>'viewport'</code> trigger.</td>
				</tr>
				<tr>
					<td><code>swing()</code> / <code>stop()</code></td>
					<td><code>method</code></td>
					<td>—</td>
					<td>Imperative controls available via <code>bind:this</code>.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pd-demo {
		display: grid;
		gap: 24px;
	}
	.pd-section {
		display: grid;
		gap: 10px;
	}
	.pd-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.pd-stage {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 12px;
		min-height: 240px;
		padding: 32px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
	}
	.pd-stage--sky {
		background: linear-gradient(180deg, #c7d2fe 0%, #e0e7ff 100%);
		min-height: 280px;
	}
	.pd-stage--row {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 24px;
	}

	.pd-rope {
		width: 2px;
		height: 50px;
		background: #94a3b8;
	}
	.pd-rope--short {
		height: 36px;
	}

	.pd-sign {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 14px 22px;
		background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
		border: 2px solid #92400e;
		border-radius: 6px;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
		font-family: 'Georgia', serif;
		min-width: 160px;
	}
	.pd-sign__name {
		font-size: 22px;
		font-weight: 700;
		color: #78350f;
		letter-spacing: 0.02em;
	}
	.pd-sign__est {
		font-size: 11px;
		color: #92400e;
		letter-spacing: 0.2em;
		margin-top: 4px;
	}

	.pd-bell {
		display: inline-block;
		font-size: 56px;
		line-height: 1;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}
	.pd-bell--blue {
		filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.5));
	}
	.pd-hint {
		margin: 0;
		font-size: 13px;
		color: var(--fg-2);
	}

	.pd-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.pd-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 90px;
		padding: 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	.pd-tile__icon {
		font-size: 26px;
	}
	.pd-tile__label {
		font-size: 11px;
		color: var(--fg-3);
		margin-top: 4px;
		font-weight: 600;
	}

	.pd-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.pd-controls label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 12px;
		color: var(--fg-2);
	}
	.pd-controls input[type='range'] {
		width: 100%;
	}

	.pd-live-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 130px;
		height: 130px;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 14px;
	}
	.pd-live-card__glyph {
		font-size: 36px;
	}
	.pd-live-card__label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		margin-top: 6px;
	}

	.pd-actions {
		display: flex;
		gap: 10px;
		justify-content: center;
	}
	.pd-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 9px 18px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 14px;
		border: 1px solid transparent;
		cursor: pointer;
	}
	.pd-btn--primary {
		background: var(--accent);
		color: var(--accent-on);
	}
	.pd-btn--ghost {
		background: var(--surface);
		color: var(--fg-2);
		border-color: var(--border-strong);
	}
</style>
