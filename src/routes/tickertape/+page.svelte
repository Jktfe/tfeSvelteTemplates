<script lang="ts">
	import TickerTape from '$lib/components/TickerTape.svelte';
	import type { TickerItem } from '$lib/components/TickerTape.svelte';

	const stocks: TickerItem[] = [
		{ label: 'AAPL', value: '$187.42', delta: 1.24, href: '#aapl' },
		{ label: 'MSFT', value: '$418.05', delta: -0.43 },
		{ label: 'GOOGL', value: '$142.66', delta: 0.87 },
		{ label: 'AMZN', value: '$178.30', delta: 3.12 },
		{ label: 'NVDA', value: '$889.11', delta: -1.65 },
		{ label: 'TSLA', value: '$184.76', delta: 2.04 },
		{ label: 'META', value: '$502.85', delta: 0.55 },
		{ label: 'BRK.B', value: '$406.25', delta: -0.18 },
		{ label: 'V', value: '$272.94', delta: 0.92 },
		{ label: 'JPM', value: '$197.50', delta: 1.41 }
	];

	const scores: TickerItem[] = [
		{ label: 'TIGERS', value: '24', delta: 7, trend: 'up' },
		{ label: 'SARACENS', value: '17', delta: 0, trend: 'flat' },
		{ label: 'HARLEQUINS', value: '31', delta: 14, trend: 'up' },
		{ label: 'CHIEFS', value: '12', delta: -3, trend: 'down' },
		{ label: 'BATH', value: '28', delta: 5, trend: 'up' },
		{ label: 'BRISTOL', value: '21', delta: -7, trend: 'down' },
		{ label: 'NORTHAMPTON', value: '19', delta: 2, trend: 'up' },
		{ label: 'GLOUCESTER', value: '14', delta: -10, trend: 'down' }
	];

	const status: TickerItem[] = [
		{ label: 'API', value: 'Operational', trend: 'flat' },
		{ label: 'Auth', value: 'Operational', trend: 'flat' },
		{ label: 'Database', value: 'Degraded', trend: 'down' },
		{ label: 'CDN', value: 'Operational', trend: 'flat' },
		{ label: 'Webhooks', value: 'Operational', trend: 'flat' },
		{ label: 'Search', value: 'Restored', trend: 'up' },
		{ label: 'Email', value: 'Operational', trend: 'flat' }
	];

	const minimal: TickerItem[] = [
		{ label: 'Users', value: '12,847', delta: 2.3 },
		{ label: 'Revenue', value: '£284k', delta: 5.7 },
		{ label: 'MRR', value: '£94k', delta: 1.2 },
		{ label: 'Churn', value: '2.1%', delta: -0.4 },
		{ label: 'NPS', value: '64', delta: 0.0 },
		{ label: 'Uptime', value: '99.94%', delta: 0.02 }
	];
</script>

<svelte:head>
	<title>TickerTape — TFE Svelte Templates</title>
</svelte:head>

<main class="page">
	<header class="hero">
		<span class="badge">Helpful UX</span>
		<h1>📈 TickerTape</h1>
		<p>
			A horizontal infinite-scroll display of <strong>structured</strong> data points. Each item
			is a tuple of <code>{`{label, value, delta, trend}`}</code> rather than arbitrary content
			— Bloomberg / airport-info-board energy, but as a portable Svelte 5 primitive.
			Pure CSS keyframe scroll, hover-to-pause, four variants, zero dependencies.
		</p>
	</header>

	<section class="demo">
		<div class="demo__head">
			<h2>Finance — stock prices with deltas</h2>
			<p>
				The flagship demo: 10 stock tickers with signed percent deltas. Trend chevrons
				inferred from delta sign — green ▲ up, red ▼ down. Tabular numerals keep the
				alignment crisp as the strip scrolls.
			</p>
		</div>
		<TickerTape items={stocks} variant="finance" speed={70} aria-label="Live stock prices" />
		<pre class="code">{`<TickerTape items={stocks} variant="finance" speed={70} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Sports — scoreboard with explicit trends</h2>
			<p>
				Live rugby scores. <code>trend</code> is set explicitly per item (so 0-delta
				draws still register as flat rather than blank). The sports variant uses
				deeper green/teal palette and bolder weight to read at distance.
			</p>
		</div>
		<TickerTape items={scores} variant="sports" speed={55} aria-label="Live rugby scores" />
		<pre class="code">{`<TickerTape items={scores} variant="sports" speed={55} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Status — system health feed</h2>
			<p>
				Default variant on a status page. Categorical states (Operational / Degraded
				/ Restored) drive the trend explicitly without numeric deltas — chevron
				appears, percent string does not.
			</p>
		</div>
		<TickerTape items={status} variant="default" speed={45} aria-label="System status" />
		<pre class="code">{`<TickerTape items={status} variant="default" speed={45} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Minimal — light-mode metrics strip</h2>
			<p>
				The <code>minimal</code> variant is hairline-bordered, transparent-background,
				designed for embedding inside a light-mode dashboard hero. Same data
				grammar — just quieter typography and lighter chrome.
			</p>
		</div>
		<TickerTape items={minimal} variant="minimal" speed={50} aria-label="Key metrics" />
		<pre class="code">{`<TickerTape items={minimal} variant="minimal" speed={50} />`}</pre>
	</section>

	<section class="demo">
		<div class="demo__head">
			<h2>Direction — right-to-left, faster</h2>
			<p>
				Scroll direction reversed via <code>direction="right"</code>; speed bumped to
				120 px/s. Useful when the ticker sits next to RTL text or when you want
				visual variety alongside another left-scrolling row.
			</p>
		</div>
		<TickerTape items={stocks} variant="finance" direction="right" speed={120} />
		<pre class="code">{`<TickerTape items={stocks} variant="finance" direction="right" speed={120} />`}</pre>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>
				4 named variants — <code>default</code>, <code>finance</code>,
				<code>sports</code>, <code>minimal</code> — each with its own colour
				grammar and typography weight.
			</li>
			<li>
				Trend inferred from <code>delta</code> sign or set explicitly via
				<code>trend</code>. Chevrons: green ▲ up, red ▼ down, grey ▬ flat.
			</li>
			<li>
				Pure CSS keyframe scroll — single GPU compositor effect. Pause-on-hover
				via <code>animation-play-state</code>, zero JS handler.
			</li>
			<li>
				Configurable speed (px/s, clamped 1–1000) and direction (left / right).
				Edge fades via <code>mask-image</code> so items slide in/out softly.
			</li>
			<li>
				Optional <code>href</code> per item wraps it as a focus-visible link.
			</li>
			<li>
				<code>prefers-reduced-motion: reduce</code> → animation off, strip stays
				readable as a static row.
			</li>
			<li>Zero external dependencies. Pure helpers exported for testing.</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<p class="usage__intro">
			Import the component, hand it an array of <code>TickerItem</code> tuples, pick a
			variant. That's the whole API.
		</p>
		<pre class="code">{`<!-- Default mono variant -->
<TickerTape items={prices} />

<!-- Finance variant, faster, no pause-on-hover -->
<TickerTape
  items={prices}
  variant="finance"
  speed={120}
  pauseOnHover={false} />

<!-- Custom separator, right-to-left -->
<TickerTape
  items={prices}
  variant="minimal"
  direction="right"
  separator="·" />`}</pre>
		<p class="usage__intro">
			See <code>src/lib/components/TickerTape.md</code> for the full <code>TickerItem</code>
			shape, helper exports, accessibility notes and recipes.
		</p>
	</section>
</main>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.hero {
		margin-bottom: 3rem;
	}

	.badge {
		display: inline-block;
		background: #ecfeff;
		color: #0e7490;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}

	.hero h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem;
	}

	.hero p {
		font-size: 1.0625rem;
		color: #475569;
		line-height: 1.65;
		margin: 0;
		max-width: 720px;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo__head {
		margin-bottom: 1rem;
	}

	.demo__head h2 {
		font-size: 1.375rem;
		margin: 0 0 0.5rem;
	}

	.demo__head p {
		color: #64748b;
		margin: 0;
		line-height: 1.55;
		max-width: 720px;
	}

	code {
		background: #f1f5f9;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-size: 0.85em;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}

	.code {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		overflow-x: auto;
		margin: 1rem 0 0;
		line-height: 1.5;
	}

	.features,
	.usage {
		margin-top: 3.5rem;
	}

	.features h2,
	.usage h2 {
		font-size: 1.5rem;
		margin: 0 0 1rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features li {
		padding: 0.625rem 0 0.625rem 1.5rem;
		position: relative;
		color: #334155;
		line-height: 1.55;
		border-bottom: 1px solid #f1f5f9;
	}

	.features li::before {
		content: '▸';
		position: absolute;
		left: 0;
		color: #06b6d4;
	}
</style>
