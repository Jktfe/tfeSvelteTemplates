<script lang="ts">
	import Pendulum from '$lib/components/Pendulum.svelte';
	import DatabaseStatus from '$lib/components/DatabaseStatus.svelte';

	let bellRef = $state<{ swing: () => void; stop: () => void } | null>(null);
	let demoAmplitude = $state(20);
	let demoFrequency = $state(1.2);
	let demoDecay = $state(1.4);
	let demoPivotY = $state(-40);
	let liveRef = $state<{ swing: () => void; stop: () => void } | null>(null);
	let revealKey = $state(0);

	const staggered = [
		{ icon: '🔔', label: 'Mount' },
		{ icon: '🪀', label: 'Yo-yo' },
		{ icon: '🗝️', label: 'Key' },
		{ icon: '🎐', label: 'Wind chime' },
		{ icon: '⏰', label: 'Clock' },
		{ icon: '🪞', label: 'Mirror' }
	];

	const usageExample =
		String.raw`<` +
		String.raw`script lang="ts">
  import Pendulum from '$lib/components/Pendulum.svelte';
</` +
		String.raw`script>

<Pendulum trigger="viewport" amplitude={18} pivotOffset={{ x: 0, y: -40 }}>
  <img src="/shop-sign.png" alt="The Crown Tavern" />
</Pendulum>`;

	function rerunStagger() {
		revealKey++;
	}
</script>

<svelte:head>
	<title>Pendulum | TFE Svelte Templates</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>Pendulum</h1>
		<p class="subtitle">
			Wrap any element to make it swing on a damped harmonic curve from a configurable offset
			pivot. Mount-trigger, viewport-trigger, click-to-swing, or imperative <code>swing()</code> —
			pure rAF + CSS transform-origin, zero animation libraries.
		</p>
		<DatabaseStatus usingDatabase={false} />
	</header>

	<!-- Demo 1: Hanging shop sign -->
	<section class="demo-section">
		<h2>Hanging shop sign — viewport trigger</h2>
		<p class="demo-caption">
			A pub-sign feel: low frequency, gentle decay, pivot 40px above the centre. The swing
			fires once when the section scrolls into view.
		</p>
		<div class="demo-stage demo-stage--sky">
			<div class="sign-rope"></div>
			<Pendulum
				trigger="viewport"
				amplitude={12}
				frequency={0.6}
				decay={0.8}
				pivotOffset={{ x: 0, y: -50 }}
				duration={6000}
			>
				<div class="shop-sign">
					<div class="shop-sign-name">The Crown</div>
					<div class="shop-sign-est">EST. 1742</div>
				</div>
			</Pendulum>
		</div>
	</section>

	<!-- Demo 2: Click-to-swing notification bell -->
	<section class="demo-section">
		<h2>Notification bell — click trigger</h2>
		<p class="demo-caption">
			Tap the bell to ring it. Click trigger sets <code>role="button"</code> and Enter/Space
			activation on the inner element automatically.
		</p>
		<div class="demo-stage">
			<Pendulum trigger="click" amplitude={28} frequency={2.2} decay={3} pivotOffset={{ x: 0, y: -32 }}>
				<span class="bell">🔔</span>
			</Pendulum>
			<p class="demo-hint">↑ Tap or focus + Enter</p>
		</div>
	</section>

	<!-- Demo 3: Mantel-clock pendulum -->
	<section class="demo-section">
		<h2>Mantel-clock pendulum — slow decay</h2>
		<p class="demo-caption">
			Decay 0.05, frequency 0.5Hz, 60-second duration cap. The kind of thing that should sit
			in the corner of an "About" page and tick.
		</p>
		<div class="demo-stage demo-stage--clock">
			<div class="clock-mount"></div>
			<Pendulum
				trigger="mount"
				amplitude={20}
				frequency={0.5}
				decay={0.05}
				pivotOffset={{ x: 0, y: -90 }}
				duration={60000}
			>
				<div class="weight">
					<div class="weight-rod"></div>
					<div class="weight-disc">⚖</div>
				</div>
			</Pendulum>
		</div>
	</section>

	<!-- Demo 4: Imperative API -->
	<section class="demo-section">
		<h2>Imperative <code>swing()</code> — manual trigger</h2>
		<p class="demo-caption">
			With <code>trigger="manual"</code>, the pendulum doesn't auto-start. Bind via
			<code>bind:this</code> and call <code>swing()</code> from a parent button.
		</p>
		<div class="demo-stage">
			<Pendulum
				bind:this={bellRef}
				trigger="manual"
				amplitude={22}
				frequency={1.8}
				decay={2.2}
				pivotOffset={{ x: 0, y: -32 }}
			>
				<span class="bell bell--blue">🔔</span>
			</Pendulum>
		</div>
		<div class="action-row">
			<button class="primary-btn" onclick={() => bellRef?.swing()}>Ring it</button>
			<button class="secondary-btn" onclick={() => bellRef?.stop()}>Stop</button>
		</div>
	</section>

	<!-- Demo 5: Staggered viewport reveal -->
	<section class="demo-section">
		<h2>Staggered viewport reveal — autoStartDelay</h2>
		<p class="demo-caption">
			Six Pendulum instances with sibling-by-sibling 200ms <code>autoStartDelay</code> values,
			each on the <code>mount</code> trigger. Reset to replay.
		</p>
		<div class="demo-stage demo-stage--row">
			{#key revealKey}
				{#each staggered as item, i (item.label)}
					<div class="stagger-cell">
						<div class="stagger-rope"></div>
						<Pendulum
							trigger="mount"
							amplitude={18}
							frequency={1.2}
							decay={1.4}
							pivotOffset={{ x: 0, y: -36 }}
							autoStartDelay={i * 200}
						>
							<div class="stagger-tile">
								<div class="stagger-icon">{item.icon}</div>
								<div class="stagger-label">{item.label}</div>
							</div>
						</Pendulum>
					</div>
				{/each}
			{/key}
		</div>
		<div class="action-row">
			<button class="primary-btn" onclick={rerunStagger}>Replay stagger</button>
		</div>
	</section>

	<!-- Demo 6: Live controls -->
	<section class="demo-section">
		<h2>Live controls</h2>
		<p class="demo-caption">Adjust amplitude, frequency, decay, and pivot height — then press swing.</p>
		<div class="controls-grid">
			<label class="control">
				<span>Amplitude: <strong>{demoAmplitude}°</strong></span>
				<input type="range" min="2" max="60" bind:value={demoAmplitude} />
			</label>
			<label class="control">
				<span>Frequency: <strong>{demoFrequency.toFixed(1)} Hz</strong></span>
				<input type="range" min="0.2" max="4" step="0.1" bind:value={demoFrequency} />
			</label>
			<label class="control">
				<span>Decay: <strong>{demoDecay.toFixed(2)} /s</strong></span>
				<input type="range" min="0.05" max="5" step="0.05" bind:value={demoDecay} />
			</label>
			<label class="control">
				<span>Pivot Y offset: <strong>{demoPivotY}px</strong></span>
				<input type="range" min="-120" max="0" step="2" bind:value={demoPivotY} />
			</label>
		</div>
		<div class="demo-stage demo-stage--live">
			<div class="sign-rope sign-rope--tall" style="height: {Math.abs(demoPivotY)}px"></div>
			<Pendulum
				bind:this={liveRef}
				trigger="manual"
				amplitude={demoAmplitude}
				frequency={demoFrequency}
				decay={demoDecay}
				pivotOffset={{ x: 0, y: demoPivotY }}
				duration={10000}
			>
				<div class="live-card">
					<div class="live-card-glyph">🪞</div>
					<div class="live-card-label">Live</div>
				</div>
			</Pendulum>
		</div>
		<div class="action-row">
			<button class="primary-btn" onclick={() => liveRef?.swing()}>Swing</button>
			<button class="secondary-btn" onclick={() => liveRef?.stop()}>Stop</button>
		</div>
	</section>

	<!-- Usage example -->
	<section class="demo-section demo-section--code">
		<h2>Usage</h2>
		<pre class="code-block"><code>{usageExample}</code></pre>
	</section>
</div>

<style>
	.page-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
	}

	.page-header {
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: 800;
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
		color: #0f172a;
	}

	.subtitle {
		font-size: 1.125rem;
		color: #475569;
		max-width: 760px;
		line-height: 1.6;
		margin: 0 0 1rem;
	}

	.subtitle code,
	.demo-caption code {
		background: #f1f5f9;
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.92em;
		color: #334155;
	}

	.demo-section {
		margin-top: 3.5rem;
	}

	.demo-section h2 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: #0f172a;
	}

	.demo-section h2 code {
		font-size: 0.95em;
		background: #f1f5f9;
		padding: 0.1em 0.4em;
		border-radius: 4px;
	}

	.demo-caption {
		color: #64748b;
		margin: 0 0 1.5rem;
		max-width: 720px;
		line-height: 1.55;
	}

	.demo-stage {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;
		min-height: 240px;
		padding: 2.5rem;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: 16px;
		border: 1px solid #e2e8f0;
		position: relative;
	}

	.demo-stage--sky {
		background: linear-gradient(180deg, #c7d2fe 0%, #e0e7ff 100%);
		min-height: 280px;
	}

	.demo-stage--clock {
		background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
		min-height: 280px;
		flex-direction: column;
	}

	.demo-stage--row {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 2rem;
		min-height: 220px;
		padding: 3rem 1.5rem 2rem;
	}

	.demo-stage--live {
		flex-direction: column;
	}

	.demo-hint {
		color: #475569;
		font-size: 0.9rem;
		margin: 0;
	}

	/* Demo 1: shop sign */
	.sign-rope {
		width: 2px;
		height: 50px;
		background: #4338ca;
		opacity: 0.6;
		margin-bottom: 0;
	}

	.sign-rope--tall {
		background: #94a3b8;
	}

	.shop-sign {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem 1.75rem;
		background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
		border: 2px solid #92400e;
		border-radius: 6px;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
		font-family: 'Georgia', serif;
		min-width: 160px;
	}

	.shop-sign-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #78350f;
		letter-spacing: 0.02em;
	}

	.shop-sign-est {
		font-size: 0.75rem;
		color: #92400e;
		letter-spacing: 0.2em;
		margin-top: 0.25rem;
	}

	/* Demo 2 & 4: bell */
	.bell {
		display: inline-block;
		font-size: 4rem;
		line-height: 1;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}

	.bell--blue {
		filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.5));
	}

	/* Demo 3: clock */
	.clock-mount {
		width: 100px;
		height: 8px;
		background: #fbbf24;
		border-radius: 4px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
	}

	.weight {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.weight-rod {
		width: 3px;
		height: 80px;
		background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
		border-radius: 2px;
	}

	.weight-disc {
		font-size: 2.5rem;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
		margin-top: -4px;
	}

	/* Demo 5: stagger */
	.stagger-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.stagger-rope {
		width: 2px;
		height: 36px;
		background: #94a3b8;
	}

	.stagger-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 90px;
		padding: 0.75rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
	}

	.stagger-icon {
		font-size: 1.75rem;
	}

	.stagger-label {
		font-size: 0.7rem;
		color: #64748b;
		margin-top: 0.25rem;
		font-weight: 600;
	}

	/* Demo 6: live */
	.live-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 130px;
		height: 130px;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 14px;
		box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
	}

	.live-card-glyph {
		font-size: 2.75rem;
	}

	.live-card-label {
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		margin-top: 0.5rem;
	}

	/* Live controls */
	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.control {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	}

	.control span {
		color: #475569;
		font-size: 0.875rem;
	}

	.control strong {
		color: #0f172a;
		font-weight: 700;
	}

	.control input[type='range'] {
		accent-color: #6366f1;
	}

	/* Action buttons */
	.action-row {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1.25rem;
	}

	.primary-btn,
	.secondary-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.65rem 1.4rem;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.95rem;
		border: 0;
		cursor: pointer;
		transition: transform 0.12s ease, box-shadow 0.12s ease;
	}

	.primary-btn {
		background: #6366f1;
		color: white;
	}

	.primary-btn:hover {
		background: #4f46e5;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
		transform: translateY(-1px);
	}

	.secondary-btn {
		background: white;
		color: #475569;
		border: 1px solid #cbd5e1;
	}

	.secondary-btn:hover {
		background: #f1f5f9;
	}

	/* Code block */
	.demo-section--code {
		margin-top: 4rem;
	}

	.code-block {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 10px;
		overflow-x: auto;
		font-family: 'JetBrains Mono', 'Menlo', monospace;
		font-size: 0.85rem;
		line-height: 1.6;
		margin: 0;
	}

	.code-block code {
		font-family: inherit;
		background: transparent;
		padding: 0;
	}
</style>
