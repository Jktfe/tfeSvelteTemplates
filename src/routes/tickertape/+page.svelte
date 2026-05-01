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
			<div class="tt-block">
				<div class="tt-head">
					<h3>Finance · stock prices with deltas</h3>
					<p>Trend chevrons inferred from the delta sign. Tabular numerals keep the alignment crisp as the strip scrolls.</p>
				</div>
				<TickerTape items={stocks} variant="finance" speed={70} aria-label="Live stock prices" />
			</div>

			<div class="tt-block">
				<div class="tt-head">
					<h3>Sports · scoreboard with explicit trends</h3>
					<p>0-delta draws still register as flat thanks to explicit trend per item.</p>
				</div>
				<TickerTape items={scores} variant="sports" speed={55} aria-label="Live rugby scores" />
			</div>

			<div class="tt-block">
				<div class="tt-head">
					<h3>Status · system health feed</h3>
					<p>Categorical states drive the trend explicitly without numeric deltas.</p>
				</div>
				<TickerTape items={status} variant="default" speed={45} aria-label="System status" />
			</div>

			<div class="tt-block">
				<div class="tt-head">
					<h3>Minimal · light dashboard strip</h3>
					<p>Hairline-bordered, transparent background — quiet enough for a hero embed.</p>
				</div>
				<TickerTape items={minimal} variant="minimal" speed={50} aria-label="Key metrics" />
			</div>

			<div class="tt-block">
				<div class="tt-head">
					<h3>Direction · right-to-left, faster</h3>
					<p>direction="right" with a 120 px/s scroll for variety alongside another row.</p>
				</div>
				<TickerTape items={stocks} variant="finance" direction="right" speed={120} />
			</div>
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
				<tr><td><code>separator</code></td><td><code>string</code></td><td><code>"·"</code></td><td>Glyph between items.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tt-demo {
		display: grid;
		gap: 2rem;
	}
	.tt-block {
		display: grid;
		gap: 0.75rem;
	}
	.tt-head h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.tt-head p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
</style>
