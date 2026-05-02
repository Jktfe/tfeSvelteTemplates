<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import CountUp from '$lib/components/CountUp.svelte';

	const shell = catalogShellPropsForSlug('/countup')!;

	let manualRef = $state<{ run: () => void; reset: () => void } | null>(null);
	let liveDuration = $state(1800);
	let liveDecimals = $state(0);
	let liveEasing = $state<'linear' | 'quad' | 'cubic' | 'quart' | 'expo'>('quart');
	let liveFlash = $state(true);
	let livePrefix = $state('£');
	let liveSuffix = $state('');
	let liveTarget = $state(1500000);
	let runToken = $state(0);
</script>

<svelte:head>
	<title>CountUp — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Number-animation primitive — eases a value from start → end on viewport entry, mount, or manual trigger. Locale-aware Intl.NumberFormat, prefix/suffix, decimals."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Numbers', 'A11y', 'Zero deps']}
	codeExplanation="CountUp drives a single requestAnimationFrame loop. Each frame computes normalised progress (elapsed / duration), runs it through the chosen easing, and sets the displayed value. Three triggers — viewport, mount, manual — share the same core. The live value is aria-hidden; a sibling visually-hidden span carries the destination value so screen readers announce the end-state once."
>
	{#snippet demo()}
		<div class="cu-demo">
			<section class="cu-block">
				<header class="cu-head">
					<h3>KPI grid · viewport-triggered</h3>
					<p>Four stats · quart easing · 1.8 s</p>
				</header>
				<div class="cu-stage cu-stage--dark">
					<div class="cu-kpi-grid">
						<div class="cu-kpi">
							<CountUp end={42857} size="lg" />
							<span class="cu-kpi-label">Active users</span>
						</div>
						<div class="cu-kpi">
							<CountUp end={1500000} prefix="£" size="lg" flash />
							<span class="cu-kpi-label">Revenue</span>
						</div>
						<div class="cu-kpi">
							<CountUp end={99.9} decimals={1} suffix="%" size="lg" />
							<span class="cu-kpi-label">Uptime</span>
						</div>
						<div class="cu-kpi">
							<CountUp end={4.8} decimals={1} suffix="★" size="lg" easing="cubic" />
							<span class="cu-kpi-label">Avg. rating</span>
						</div>
					</div>
				</div>
			</section>

			<section class="cu-block">
				<header class="cu-head">
					<h3>Hero stat · expo, flash</h3>
					<p>Single big number · expo easing · 2.4 s · flash on complete</p>
				</header>
				<div class="cu-stage cu-stage--dark">
					<div class="cu-hero">
						<span class="cu-hero-prefix">Funded</span>
						<CountUp end={250000000} prefix="$" duration={2400} easing="expo" size="xl" flash />
						<span class="cu-hero-suffix">across our portfolio</span>
					</div>
				</div>
			</section>

			<section class="cu-block">
				<header class="cu-head">
					<h3>Locale-aware formatting</h3>
					<p>Same value, different glyphs.</p>
				</header>
				<div class="cu-stage">
					<div class="cu-locale-row">
						<span class="cu-locale-tag">en-GB</span>
						<CountUp end={1234567.89} decimals={2} prefix="€" locale="en-GB" size="md" />
					</div>
					<div class="cu-locale-row">
						<span class="cu-locale-tag">de-DE</span>
						<CountUp end={1234567.89} decimals={2} prefix="€" locale="de-DE" size="md" />
					</div>
					<div class="cu-locale-row">
						<span class="cu-locale-tag">fr-FR</span>
						<CountUp end={1234567.89} decimals={2} prefix="€" locale="fr-FR" size="md" />
					</div>
				</div>
			</section>

			<section class="cu-block">
				<header class="cu-head">
					<h3>Count-down · direction-agnostic</h3>
					<p>start=60 → end=0 · linear · 6 s</p>
				</header>
				<div class="cu-stage">
					<div class="cu-countdown">
						<span class="cu-countdown-label">Doors open in</span>
						{#key runToken}
							<CountUp start={60} end={0} duration={6000} easing="linear" suffix="s" size="xl" />
						{/key}
						<button class="cu-btn" type="button" onclick={() => (runToken += 1)}>Restart</button>
					</div>
				</div>
			</section>

			<section class="cu-block">
				<header class="cu-head">
					<h3>Live controls · manual trigger</h3>
					<p>All props bound to inputs · re-run with the button</p>
				</header>
				<div class="cu-stage">
					<div class="cu-live">
						<div class="cu-live-display">
							{#key liveDuration + liveDecimals + liveEasing + livePrefix + liveSuffix + liveTarget + (liveFlash ? 1 : 0)}
								<CountUp
									bind:this={manualRef}
									end={liveTarget}
									duration={liveDuration}
									easing={liveEasing}
									decimals={liveDecimals}
									prefix={livePrefix}
									suffix={liveSuffix}
									flash={liveFlash}
									size="xl"
									trigger="mount"
								/>
							{/key}
						</div>
						<div class="cu-live-controls">
							<label>
								<span>Target</span>
								<input type="number" bind:value={liveTarget} step="1000" />
							</label>
							<label>
								<span>Duration ({liveDuration} ms)</span>
								<input type="range" min="200" max="6000" step="100" bind:value={liveDuration} />
							</label>
							<label>
								<span>Decimals ({liveDecimals})</span>
								<input type="range" min="0" max="4" step="1" bind:value={liveDecimals} />
							</label>
							<label>
								<span>Easing</span>
								<select bind:value={liveEasing}>
									<option value="linear">linear</option>
									<option value="quad">quad</option>
									<option value="cubic">cubic</option>
									<option value="quart">quart</option>
									<option value="expo">expo</option>
								</select>
							</label>
							<label>
								<span>Prefix</span>
								<input type="text" bind:value={livePrefix} maxlength="3" />
							</label>
							<label>
								<span>Suffix</span>
								<input type="text" bind:value={liveSuffix} maxlength="3" />
							</label>
							<label class="cu-checkbox">
								<input type="checkbox" bind:checked={liveFlash} />
								<span>Flash on complete</span>
							</label>
							<button class="cu-btn cu-btn--primary" type="button" onclick={() => manualRef?.run()}>Run again</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>end</code></td><td><code>number</code></td><td>required</td><td>Final value to settle on.</td></tr>
				<tr><td><code>start</code></td><td><code>number</code></td><td><code>0</code></td><td>Starting value (>end counts down).</td></tr>
				<tr><td><code>duration</code></td><td><code>number</code></td><td><code>1800</code></td><td>Animation duration in ms.</td></tr>
				<tr><td><code>easing</code></td><td><code>"linear" | "quad" | "cubic" | "quart" | "expo"</code></td><td><code>"quart"</code></td><td>Easing curve.</td></tr>
				<tr><td><code>trigger</code></td><td><code>"viewport" | "mount" | "manual"</code></td><td><code>"viewport"</code></td><td>When the run starts.</td></tr>
				<tr><td><code>threshold</code></td><td><code>number</code></td><td><code>0.4</code></td><td>IntersectionObserver visibility ratio for the <code>'viewport'</code> trigger.</td></tr>
				<tr><td><code>decimals</code></td><td><code>number</code></td><td><code>0</code></td><td>Decimal places (0–20).</td></tr>
				<tr><td><code>prefix</code> / <code>suffix</code></td><td><code>string</code></td><td><code>""</code></td><td>Wraps the formatted number.</td></tr>
				<tr><td><code>locale</code></td><td><code>string</code></td><td>browser default</td><td>Intl.NumberFormat locale.</td></tr>
				<tr><td><code>useGrouping</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Thousand-grouping separators.</td></tr>
				<tr><td><code>flash</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Brief highlight on complete.</td></tr>
				<tr><td><code>size</code></td><td><code>"sm" | "md" | "lg" | "xl"</code></td><td><code>"md"</code></td><td>Type size preset.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cu-demo {
		display: grid;
		gap: 1.5rem;
	}
	.cu-block {
		display: grid;
		gap: 0.75rem;
	}
	.cu-head h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.cu-head p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
	.cu-stage {
		padding: 2rem 1.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: var(--fg-1);
	}
	.cu-stage--dark {
		background: radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.85) 0%, #050409 70%);
		color: #f1f5f9;
		border-color: rgba(255, 255, 255, 0.05);
	}
	.cu-kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 1.5rem;
	}
	.cu-kpi {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 1rem;
		background: rgba(15, 23, 42, 0.5);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.cu-kpi-label {
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.cu-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
	}
	.cu-hero-prefix {
		font-size: 0.85rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}
	.cu-hero-suffix {
		font-size: 0.95rem;
		color: #cbd5e1;
	}
	.cu-locale-row {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.65rem 1rem;
		background: var(--bg-1);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
	}
	.cu-locale-tag {
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8rem;
		color: var(--accent);
		min-width: 4rem;
	}
	.cu-countdown {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	.cu-countdown-label {
		font-size: 0.85rem;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
	.cu-btn {
		padding: 0.5rem 1.25rem;
		background: var(--bg-1);
		color: var(--fg-1);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.cu-btn:hover {
		background: var(--surface);
	}
	.cu-btn--primary {
		background: linear-gradient(135deg, #6366f1, #ec4899);
		color: #fff;
		border: none;
		font-weight: 600;
	}
	.cu-live {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 2rem;
		align-items: center;
	}
	@media (max-width: 720px) {
		.cu-live {
			grid-template-columns: 1fr;
		}
	}
	.cu-live-display {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 6rem;
	}
	.cu-live-controls {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.cu-live-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.cu-live-controls input[type='number'],
	.cu-live-controls input[type='text'],
	.cu-live-controls select {
		padding: 0.4rem 0.6rem;
		background: var(--bg-1);
		color: var(--fg-1);
		border: 1px solid var(--border);
		border-radius: 0.4rem;
		font-size: 0.95rem;
		font-family: inherit;
	}
	.cu-checkbox {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
</style>
