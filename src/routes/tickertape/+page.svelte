<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TickerTape from '$lib/components/TickerTape.svelte';
	import type { TickerItem } from '$lib/components/TickerTape.svelte';

	const shell = catalogShellPropsForSlug('/tickertape')!;

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

	const news: TickerItem[] = [
		{ label: 'BREAKING', value: 'Bank of England holds rates steady at 4.5%', trend: 'flat' },
		{
			label: 'TECH',
			value: 'OpenAI launches new model with multimodal reasoning',
			trend: 'up'
		},
		{ label: 'MARKETS', value: 'FTSE 100 closes at record high', trend: 'up' },
		{
			label: 'WORLD',
			value: 'EU summit reaches consensus on energy strategy',
			trend: 'flat'
		},
		{ label: 'WEATHER', value: 'Storm warning issued for Scotland', trend: 'down' },
		{ label: 'SPORT', value: 'England wins Six Nations opener 24-17', trend: 'up' },
		{
			label: 'CULTURE',
			value: 'Tate Modern announces 2026 retrospective programme',
			trend: 'flat'
		}
	];

	const brands: TickerItem[] = [
		{ label: 'Trusted by', value: 'ACME', trend: 'flat' },
		{ label: 'Trusted by', value: 'GLOBEX', trend: 'flat' },
		{ label: 'Trusted by', value: 'INITECH', trend: 'flat' },
		{ label: 'Trusted by', value: 'UMBRELLA', trend: 'flat' },
		{ label: 'Trusted by', value: 'WAYNE', trend: 'flat' },
		{ label: 'Trusted by', value: 'STARK', trend: 'flat' },
		{ label: 'Trusted by', value: 'PIED PIPER', trend: 'flat' },
		{ label: 'Trusted by', value: 'MASSIVE DYN.', trend: 'flat' }
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
	<title>TickerTape — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Horizontal infinite-scroll display of structured data points — Bloomberg / airport-info energy as a portable Svelte 5 primitive."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Marquee', 'Theme-aware', 'A11y']}
	codeExplanation="TickerTape doubles its content and runs a single CSS keyframe scroll. Trend chevrons are inferred from the delta sign or set explicitly. Pause-on-hover is animation-play-state, so there is zero JS handler in the steady state. prefers-reduced-motion: reduce stops the animation but leaves the strip readable as a static row."
>
	{#snippet demo()}
		<div class="tt-demo">
			<p class="tt-demo__lede">
				A single CSS keyframe scrolls a doubled-up content track. Each row below mounts a different
				<code>variant</code>, <code>direction</code>, or <code>pauseOnHover</code> setting. Hover any
				strip with <code>pauseOnHover</code> on to freeze it.
			</p>

			<section class="tt-block">
				<div class="tt-head">
					<h4>Finance · stock prices with deltas · variant="finance"</h4>
					<p>
						Trend chevrons inferred from the delta sign — green up, red down, grey flat. Tabular
						numerals keep alignment crisp as the strip scrolls.
					</p>
				</div>
				<TickerTape items={stocks} variant="finance" speed={70} aria-label="Live stock prices" />
			</section>

			<section class="tt-block">
				<div class="tt-head">
					<h4>News · headlines with category labels · variant="default"</h4>
					<p>
						Long-form values work fine — the keyframe is duration-relative so longer items just
						mean a slower visual cycle. Category labels stay short and uppercase.
					</p>
				</div>
				<TickerTape items={news} variant="default" speed={50} aria-label="News headlines" />
			</section>

			<section class="tt-block">
				<div class="tt-head">
					<h4>Brand logos · text-only mark wall · variant="minimal"</h4>
					<p>
						Brand identity strips don't need deltas. The minimal variant uses a transparent
						background and hairline borders so it sits naturally inside marketing layouts.
					</p>
				</div>
				<TickerTape
					items={brands}
					variant="minimal"
					speed={40}
					separator="◆"
					aria-label="Customer brands"
				/>
			</section>

			<section class="tt-block">
				<div class="tt-head">
					<h4>Reverse direction · direction="right" · variant="finance"</h4>
					<p>
						Same finance data, scrolling the other way. Useful for parallel rows where opposing
						motion creates depth — pair it with a faster forward strip above.
					</p>
				</div>
				<TickerTape
					items={stocks}
					variant="finance"
					direction="right"
					speed={120}
					aria-label="Reverse stock ticker"
				/>
			</section>

			<section class="tt-block">
				<div class="tt-head">
					<h4>Minimal dashboard · pauseOnHover false · always scrolling</h4>
					<p>
						<code>pauseOnHover=false</code> keeps the strip moving even when the cursor is over it
						— useful for purely decorative rows that shouldn't react to interaction above.
					</p>
				</div>
				<TickerTape
					items={minimal}
					variant="minimal"
					speed={50}
					pauseOnHover={false}
					aria-label="Live key metrics, always scrolling"
				/>
			</section>

			<section class="tt-block">
				<div class="tt-head">
					<h4>Slow scroll · variant="default" · speed 30 · pauseOnHover true</h4>
					<p>
						A relaxed pace for editorial copy or status feeds. Hovering pauses via
						<code>animation-play-state</code> — no JS handler runs in the steady state.
					</p>
				</div>
				<TickerTape
					items={news}
					variant="default"
					speed={30}
					aria-label="Slow news ticker, hover to pause"
				/>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>items</code></td><td><code>TickerItem[]</code></td><td>required</td><td>Tuples of {`{ label, value, delta?, trend?, href? }`}.</td></tr>
				<tr><td><code>variant</code></td><td><code>"default" | "finance" | "sports" | "minimal"</code></td><td><code>"default"</code></td><td>Colour palette and weight preset.</td></tr>
				<tr><td><code>speed</code></td><td><code>number</code></td><td><code>60</code></td><td>Scroll speed in px/s, clamped 1–1000.</td></tr>
				<tr><td><code>direction</code></td><td><code>"left" | "right"</code></td><td><code>"left"</code></td><td>Scroll direction.</td></tr>
				<tr><td><code>pauseOnHover</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Pauses via animation-play-state.</td></tr>
				<tr><td><code>separator</code></td><td><code>string</code></td><td><code>"•"</code></td><td>Glyph between items.</td></tr>
				<tr><td><code>aria-label</code></td><td><code>string</code></td><td><code>'Ticker tape'</code></td><td>Accessible label for the scrolling region.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tt-demo {
		display: grid;
		gap: 2rem;
	}
	.tt-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.tt-demo__lede code,
	.tt-head p code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.tt-block {
		display: grid;
		gap: 0.75rem;
	}
	.tt-head h4 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.tt-head p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
</style>
