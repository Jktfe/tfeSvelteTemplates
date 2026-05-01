<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Countdown from '$lib/components/Countdown.svelte';

	const shell = catalogShellPropsForSlug('/countdown')!;

	const now = new Date();
	const currentYear = now.getFullYear();
	const newYearDate = new Date(`${currentYear + 1}-01-01T00:00:00`);
	const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
	const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
	const pastDate = new Date('2020-01-01T00:00:00');
</script>

<svelte:head>
	<title>Countdown — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated countdown timer with cards, labels, and compact formats. Configurable units, completion callback, accessible."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Time', 'A11y', 'Zero deps']}
	codeExplanation="Countdown ticks once a second, recomputing the time remaining and slicing it into the requested unit list. Three formats — cards, labels, compact — share the same numeric core. ARIA live regions announce the changing values politely, and prefers-reduced-motion suppresses the digit-flip animation."
>
	{#snippet demo()}
		<div class="cd-demo">
			<section class="cd-block">
				<header class="cd-head">
					<h3>Cards format</h3>
					<p>Default — each unit in its own card.</p>
				</header>
				<div class="cd-stage cd-stage--dark">
					<Countdown targetDate={newYearDate} format="cards" />
				</div>
			</section>

			<section class="cd-block">
				<header class="cd-head">
					<h3>Labels format</h3>
					<p>Large numbers with small labels — quieter than cards.</p>
				</header>
				<div class="cd-stage">
					<Countdown targetDate={newYearDate} format="labels" />
				</div>
			</section>

			<section class="cd-block">
				<header class="cd-head">
					<h3>Compact format</h3>
					<p>Single-line clock display.</p>
				</header>
				<div class="cd-stage">
					<Countdown targetDate={threeDaysFromNow} format="compact" padZeros={true} />
				</div>
			</section>

			<section class="cd-block">
				<header class="cd-head">
					<h3>Custom units</h3>
					<p>Pick which time units appear.</p>
				</header>
				<div class="cd-grid">
					<div class="cd-stage">
						<h4>Days only</h4>
						<Countdown targetDate={newYearDate} format="cards" units={['days']} />
					</div>
					<div class="cd-stage">
						<h4>Hours &amp; minutes</h4>
						<Countdown targetDate={threeDaysFromNow} format="cards" units={['hours', 'minutes']} />
					</div>
					<div class="cd-stage">
						<h4>Minutes &amp; seconds</h4>
						<Countdown targetDate={fiveMinutesFromNow} format="cards" units={['minutes', 'seconds']} />
					</div>
				</div>
			</section>

			<section class="cd-block">
				<header class="cd-head">
					<h3>Completion message</h3>
					<p>Past date renders the completedMessage.</p>
				</header>
				<div class="cd-stage">
					<Countdown targetDate={pastDate} format="labels" completedMessage="🎉 This event has already happened!" />
				</div>
			</section>

			<section class="cd-block">
				<header class="cd-head">
					<h3>Custom separators (compact)</h3>
					<p>colon · dot · dash</p>
				</header>
				<div class="cd-grid">
					<div class="cd-stage">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator=":" />
					</div>
					<div class="cd-stage">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator="." />
					</div>
					<div class="cd-stage">
						<Countdown targetDate={threeDaysFromNow} format="compact" separator=" - " />
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
				<tr><td><code>targetDate</code></td><td><code>Date | number | string</code></td><td>required</td><td>When to count down to.</td></tr>
				<tr><td><code>units</code></td><td><code>CountdownUnit[]</code></td><td>days/hours/min/sec</td><td>Which units appear.</td></tr>
				<tr><td><code>format</code></td><td><code>"cards" | "labels" | "compact"</code></td><td><code>"cards"</code></td><td>Display preset.</td></tr>
				<tr><td><code>showLabels</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show unit labels.</td></tr>
				<tr><td><code>separator</code></td><td><code>string</code></td><td><code>":"</code></td><td>Separator for compact format.</td></tr>
				<tr><td><code>padZeros</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Pad single digits with zeros.</td></tr>
				<tr><td><code>completedMessage</code></td><td><code>string</code></td><td><code>"Time's up!"</code></td><td>Message at completion.</td></tr>
				<tr><td><code>onComplete</code></td><td><code>() => void</code></td><td><code>undefined</code></td><td>Callback fired once when reaching zero.</td></tr>
				<tr><td><code>hideOnComplete</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Hide entirely when complete.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cd-demo {
		display: grid;
		gap: 1.5rem;
	}
	.cd-block {
		display: grid;
		gap: 0.75rem;
	}
	.cd-head h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.cd-head p {
		margin: 0;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
	.cd-stage {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		padding: 2.5rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		color: var(--fg-1);
	}
	.cd-stage h4 {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.cd-stage--dark {
		background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
		border-color: #1e293b;
		color: #f1f5f9;
	}
	.cd-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}
</style>
