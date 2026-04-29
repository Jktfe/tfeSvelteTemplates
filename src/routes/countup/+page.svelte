<script lang="ts">
	import CountUp from '$lib/components/CountUp.svelte';

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
	<title>CountUp · Svelte 5 Templates</title>
	<meta
		name="description"
		content="Number-animation primitive — eases a value from start → end on viewport entry, mount, or manual trigger. Five easings, locale-aware Intl.NumberFormat, prefix/suffix, decimals, optional flash-on-complete. Asset-free, prefers-reduced-motion safe."
	/>
</svelte:head>

<main class="page">
	<header class="intro">
		<a class="back" href="/">← All components</a>
		<h1>CountUp</h1>
		<p class="lede">
			Animate a number from <code>start</code> → <code>end</code> over a duration when it
			enters the viewport (or on manual trigger). Five easings, locale-aware
			<code>Intl.NumberFormat</code>, prefix/suffix, decimal precision, optional flash-on-complete.
			Composes well with <a href="/scrollreveal">ScrollReveal</a> for stat-grid reveals. Pure rAF +
			IntersectionObserver, zero dependencies.
		</p>
	</header>

	<section class="demo-block">
		<div class="block-label">
			<h2>KPI grid — viewport-triggered</h2>
			<p class="block-help">
				Four stats, each on its own viewport-trigger · quart easing · 1.8 s
			</p>
		</div>
		<div class="brick">
			<div class="kpi-grid">
				<div class="kpi">
					<CountUp end={42857} prefix="" suffix="" size="lg" />
					<span class="kpi-label">Active users</span>
				</div>
				<div class="kpi">
					<CountUp end={1500000} prefix="£" size="lg" flash />
					<span class="kpi-label">Revenue</span>
				</div>
				<div class="kpi">
					<CountUp end={99.9} decimals={1} suffix="%" size="lg" />
					<span class="kpi-label">Uptime</span>
				</div>
				<div class="kpi">
					<CountUp end={4.8} decimals={1} suffix="★" size="lg" easing="cubic" />
					<span class="kpi-label">Avg. rating</span>
				</div>
			</div>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Hero stat — expo, flash</h2>
			<p class="block-help">
				Single big number · <code>easing="expo"</code> · 2.4 s · flash-on-complete
			</p>
		</div>
		<div class="brick">
			<div class="hero">
				<span class="hero-prefix">Funded</span>
				<CountUp end={250000000} prefix="$" duration={2400} easing="expo" size="xl" flash />
				<span class="hero-suffix">across our portfolio</span>
			</div>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Locale ticker — German formatting</h2>
			<p class="block-help">
				<code>locale="de-DE"</code> swaps separators · same value, different glyphs
			</p>
		</div>
		<div class="brick stacked">
			<div class="locale-row">
				<span class="locale-tag">en-GB</span>
				<CountUp end={1234567.89} decimals={2} prefix="€" locale="en-GB" size="md" />
			</div>
			<div class="locale-row">
				<span class="locale-tag">de-DE</span>
				<CountUp end={1234567.89} decimals={2} prefix="€" locale="de-DE" size="md" />
			</div>
			<div class="locale-row">
				<span class="locale-tag">fr-FR</span>
				<CountUp end={1234567.89} decimals={2} prefix="€" locale="fr-FR" size="md" />
			</div>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Count-down — direction-agnostic</h2>
			<p class="block-help">
				<code>start={60}</code> → <code>end={0}</code> · linear · 6 s · seconds suffix
			</p>
		</div>
		<div class="brick">
			<div class="countdown">
				<span class="countdown-label">Doors open in</span>
				{#key runToken}
					<CountUp start={60} end={0} duration={6000} easing="linear" suffix="s" size="xl" />
				{/key}
				<button class="countdown-btn" onclick={() => (runToken += 1)}>Restart</button>
			</div>
		</div>
	</section>

	<section class="demo-block">
		<div class="block-label">
			<h2>Live controls — manual trigger</h2>
			<p class="block-help">
				All props bound to inputs · <code>trigger="manual"</code> · re-run with the button
			</p>
		</div>
		<div class="brick">
			<div class="live">
				<div class="live-display">
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
				<div class="live-controls">
					<label>
						Target
						<input type="number" bind:value={liveTarget} step="1000" />
					</label>
					<label>
						Duration (ms)
						<input type="range" min="200" max="6000" step="100" bind:value={liveDuration} />
						<span>{liveDuration} ms</span>
					</label>
					<label>
						Decimals
						<input type="range" min="0" max="4" step="1" bind:value={liveDecimals} />
						<span>{liveDecimals}</span>
					</label>
					<label>
						Easing
						<select bind:value={liveEasing}>
							<option value="linear">linear</option>
							<option value="quad">quad</option>
							<option value="cubic">cubic</option>
							<option value="quart">quart</option>
							<option value="expo">expo</option>
						</select>
					</label>
					<label class="row">
						Prefix
						<input type="text" bind:value={livePrefix} maxlength="3" />
					</label>
					<label class="row">
						Suffix
						<input type="text" bind:value={liveSuffix} maxlength="3" />
					</label>
					<label class="checkbox">
						<input type="checkbox" bind:checked={liveFlash} />
						Flash on complete
					</label>
					<button class="live-btn" onclick={() => manualRef?.run()}>Run again</button>
				</div>
			</div>
		</div>
	</section>

	<section class="meta-grid">
		<div class="meta-card">
			<h2>How it animates</h2>
			<p>
				<code>requestAnimationFrame</code> drives the tick loop. Each frame computes a normalised
				progress <code>t = elapsed / duration</code>, runs it through the chosen easing, and sets
				the displayed value via <code>start + (end - start) * eased(t)</code>. No interval timers,
				no setTimeout chains.
			</p>
		</div>
		<div class="meta-card">
			<h2>Five easings</h2>
			<p>
				All exported from the module-script: <code>linear</code> for clocks/tickers,
				<code>quad</code> / <code>cubic</code> for subtle entrances, <code>quart</code> (default)
				for marketing-stat punch, <code>expo</code> for big-impact fast-then-stop. Each is a pure
				numeric function — directly unit-testable.
			</p>
		</div>
		<div class="meta-card">
			<h2>Three triggers</h2>
			<p>
				<code>viewport</code> uses IntersectionObserver and disconnects after first intersection
				(throwaway observer, no steady-state cost). <code>mount</code> kicks off immediately on
				client-side mount. <code>manual</code> exposes <code>run()</code> /
				<code>reset()</code> via <code>bind:this</code> for parent-controlled timing.
			</p>
		</div>
		<div class="meta-card">
			<h2>Locale-aware formatting</h2>
			<p>
				<code>Intl.NumberFormat</code> handles thousand-grouping, decimal separators, and digit
				glyphs per locale. Pass <code>useGrouping=&#123;false&#125;</code> for raw digits, or set a
				specific <code>locale</code> for cross-region demos. Decimals clamp to <code>[0, 20]</code>
				and integerise on negative input.
			</p>
		</div>
		<div class="meta-card">
			<h2>Direction-agnostic</h2>
			<p>
				<code>start &gt; end</code> counts down with the same easing curve. Useful for countdown
				timers, score-decay animations, and "X days remaining" displays. <code>clampValue</code>
				guards the final tick against rAF timestamp drift in either direction.
			</p>
		</div>
		<div class="meta-card">
			<h2>Accessible</h2>
			<p>
				The visible ticking value is <code>aria-hidden</code>; a sibling visually-hidden span
				holds the destination value, so screen readers announce the end-state once instead of
				every frame. <code>prefers-reduced-motion: reduce</code> short-circuits straight to the
				end value with no rAF loop spawned.
			</p>
		</div>
	</section>
</main>

<style>
	.page {
		min-height: 100vh;
		background: #050409;
		color: #f8fafc;
	}
	.intro {
		max-width: 900px;
		margin: 0 auto;
		padding: 3rem 1.5rem 2rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
		color: #94a3b8;
		text-decoration: none;
	}
	.back:hover {
		color: #f1f5f9;
	}
	.intro h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0;
		max-width: 64ch;
		line-height: 1.6;
		color: #cbd5e1;
	}
	.lede a {
		color: #7dd3fc;
		text-decoration: none;
	}
	.lede a:hover {
		text-decoration: underline;
	}

	.demo-block {
		max-width: 1100px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}
	.block-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}
	.block-label h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #e2e8f0;
	}
	.block-help {
		margin: 0;
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.brick {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 2.5rem 1.5rem;
		background: radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.8) 0%, #050409 70%);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.04);
		box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
	}
	.brick.stacked {
		flex-direction: column;
		gap: 1rem;
		align-items: stretch;
		max-width: 32rem;
		margin: 0 auto;
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 1.5rem;
		width: 100%;
		max-width: 56rem;
	}
	.kpi {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 1rem;
		background: rgba(15, 23, 42, 0.5);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.kpi-label {
		font-size: 0.8rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
		padding: 1rem 0;
	}
	.hero-prefix {
		font-size: 0.85rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}
	.hero-suffix {
		font-size: 0.95rem;
		color: #cbd5e1;
		margin-top: 0.25rem;
	}

	.locale-row {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(15, 23, 42, 0.4);
		border-radius: 0.5rem;
	}
	.locale-tag {
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.8rem;
		color: #7dd3fc;
		min-width: 4rem;
	}

	.countdown {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	.countdown-label {
		font-size: 0.85rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
	.countdown-btn {
		margin-top: 0.5rem;
		padding: 0.5rem 1.25rem;
		background: #1e293b;
		color: #e2e8f0;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.countdown-btn:hover {
		background: #334155;
	}

	.live {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 2rem;
		width: 100%;
		max-width: 56rem;
		align-items: center;
	}
	.live-display {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 8rem;
	}
	.live-controls {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.live-controls label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.live-controls label.row {
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
	}
	.live-controls label.checkbox {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	.live-controls input[type='range'] {
		width: 100%;
	}
	.live-controls input[type='number'],
	.live-controls input[type='text'],
	.live-controls select {
		padding: 0.4rem 0.6rem;
		background: #0f172a;
		color: #e2e8f0;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.4rem;
		font-size: 0.95rem;
		font-family: inherit;
	}
	.live-controls span {
		font-size: 0.85rem;
		color: #cbd5e1;
		text-transform: none;
		letter-spacing: 0;
	}
	.live-btn {
		margin-top: 0.5rem;
		padding: 0.6rem 1rem;
		background: linear-gradient(135deg, #6366f1, #ec4899);
		color: #fff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
	}
	.live-btn:hover {
		filter: brightness(1.1);
	}

	@media (max-width: 720px) {
		.live {
			grid-template-columns: 1fr;
		}
	}

	.meta-grid {
		max-width: 1100px;
		margin: 3rem auto 4rem;
		padding: 0 1.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: 1.25rem;
	}
	.meta-card {
		padding: 1.5rem;
		background: rgba(15, 23, 42, 0.5);
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}
	.meta-card h2 {
		margin: 0 0 0.6rem;
		font-size: 0.85rem;
		font-weight: 700;
		color: #f1f5f9;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.meta-card p {
		margin: 0;
		color: #cbd5e1;
		font-size: 0.92rem;
		line-height: 1.55;
	}
	code {
		font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.85em;
		color: #f0abfc;
	}
</style>
