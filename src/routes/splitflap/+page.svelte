<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import SplitFlap from '$lib/components/SplitFlap.svelte';
	import { onMount } from 'svelte';

	const shell = catalogShellPropsForSlug('/splitflap')!;

	let clockValue = $state('12:34:56');
	let counterValue = $state('00000');
	let destinationIdx = $state(0);
	const destinations = ['LONDON', 'PARIS  ', 'TOKYO  ', 'NEW YORK', 'SYDNEY '];
	let destination = $derived(destinations[destinationIdx % destinations.length]);

	function pad(n: number, w = 2): string {
		return String(n).padStart(w, '0');
	}

	function tickClock() {
		const now = new Date();
		clockValue = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
	}

	function bumpCounter() {
		const next = (parseInt(counterValue, 10) + 1) % 100000;
		counterValue = pad(next, 5);
	}

	function rotateDestination() {
		destinationIdx = (destinationIdx + 1) % destinations.length;
	}

	onMount(() => {
		tickClock();
		const clock = setInterval(tickClock, 1000);
		const dest = setInterval(rotateDestination, 4500);
		return () => {
			clearInterval(clock);
			clearInterval(dest);
		};
	});
</script>

<svelte:head>
	<title>SplitFlap — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Mechanical Solari-board character flip — 3D top-half drops down through intermediate charset positions, bottom catches the new glyph, per-character stagger creates a left-to-right cascade."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', '3D CSS', 'A11y', 'Zero deps']}
	codeExplanation="Each cell is a 3D card. On a value change the top half rotates down through intermediate charset positions while the bottom catches the new glyph — the same mechanic Solari split-flap boards use. Per-character stagger creates a left-to-right cascade. The component renders the target value statically on first paint and only kicks the cascade off after onMount, so server HTML matches post-cascade — no hydration mismatch."
>
	{#snippet demo()}
		<div class="sf-demo">
			<div class="sf-block">
				<div class="sf-label">
					<h3>Departures board</h3>
					<p class="sf-help">Solari charset · forward · auto-rotates every 4.5 s</p>
					<p class="sf-help sf-help-aside">Editorial dark surface — Solari boards are dark by design, so this panel stays dark in either page theme.</p>
				</div>
				<div class="sf-board" data-theme="dark">
					<div class="sf-board-row">
						<span class="sf-eyebrow">Now boarding</span>
						<SplitFlap value={destination} charset="solari" size="lg" stagger={70} flipDuration={320} />
					</div>
					<div class="sf-board-row sf-board-meta">
						<span class="sf-meta-label">Gate</span>
						<SplitFlap value="A14" charset="alnum" size="md" stagger={50} flipDuration={260} />
						<span class="sf-meta-label">Status</span>
						<SplitFlap value="ON TIME" charset="alpha" size="md" stagger={45} flipDuration={250} />
					</div>
				</div>
			</div>

			<div class="sf-block">
				<div class="sf-label">
					<h3>Live clock</h3>
					<p class="sf-help">Solari charset · ticks every second</p>
				</div>
				<div class="sf-centred">
					<SplitFlap value={clockValue} charset="solari" size="lg" stagger={40} flipDuration={240} />
				</div>
			</div>

			<div class="sf-block">
				<div class="sf-label">
					<h3>Counter — shortest path</h3>
					<p class="sf-help">Digits only · click to bump</p>
				</div>
				<div class="sf-centred">
					<button class="sf-counter-btn" type="button" onclick={bumpCounter}>
						<SplitFlap
							value={counterValue}
							charset="digits"
							size="lg"
							direction="shortest"
							stagger={50}
							flipDuration={260}
						/>
						<span class="sf-counter-hint">+1</span>
					</button>
				</div>
			</div>

			<div class="sf-block">
				<div class="sf-label">
					<h3>Cascade intensity</h3>
					<p class="sf-help">Same value, three intensities</p>
				</div>
				<div class="sf-grid-3">
					<div class="sf-cell">
						<span class="sf-cell-tag">0.5×</span>
						<SplitFlap value="HELLO" charset="alpha" size="md" intensity={0.5} stagger={80} />
					</div>
					<div class="sf-cell">
						<span class="sf-cell-tag">1.0×</span>
						<SplitFlap value="HELLO" charset="alpha" size="md" intensity={1} stagger={80} />
					</div>
					<div class="sf-cell">
						<span class="sf-cell-tag">1.6×</span>
						<SplitFlap value="HELLO" charset="alpha" size="md" intensity={1.6} stagger={80} />
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr><td><code>value</code></td><td><code>string</code></td><td>required</td><td>Target string. Bind to a reactive source for live updates.</td></tr>
				<tr><td><code>charset</code></td><td><code>"alnum" | "alpha" | "digits" | "solari"</code></td><td><code>"alnum"</code></td><td>Glyph set traversed during the flip.</td></tr>
				<tr><td><code>stagger</code></td><td><code>number</code></td><td><code>60</code></td><td>Per-cell start delay in ms.</td></tr>
				<tr><td><code>flipDuration</code></td><td><code>number</code></td><td><code>320</code></td><td>Time per single flip in ms.</td></tr>
				<tr><td><code>intensity</code></td><td><code>number</code></td><td><code>1</code></td><td>Multiplies stagger; 0.5 snappier, 1.6 luxurious.</td></tr>
				<tr><td><code>direction</code></td><td><code>"forward" | "shortest"</code></td><td><code>"forward"</code></td><td>forward traverses charset; shortest picks min flips per cell.</td></tr>
				<tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>Cell size preset.</td></tr>
				<tr><td><code>class</code></td><td><code>string</code></td><td><code>""</code></td><td>Extra class on the wrapper.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sf-demo {
		display: grid;
		gap: 1.5rem;
	}
	.sf-block {
		display: grid;
		gap: 1rem;
	}
	.sf-label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.sf-label h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-1);
	}
	.sf-help {
		margin: 0;
		font-size: 0.85rem;
		color: var(--fg-2);
	}
	.sf-help-aside {
		flex-basis: 100%;
		font-style: italic;
		opacity: 0.85;
	}
	.sf-board {
		/* Editorial dark surface — Solari boards are dark in the real world,
		   so this panel deliberately stays dark in either page theme. The
		   color-scheme + data-theme hooks make that intent explicit so any
		   descendants resolving CSS custom properties pick dark tokens. */
		color-scheme: dark;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: clamp(1rem, 4vw, 2rem);
		background: linear-gradient(180deg, #18223a 0%, #0a1020 100%);
		border-radius: 1rem;
		box-shadow:
			0 30px 60px -30px rgba(15, 23, 42, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}
	.sf-board-row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}
	.sf-eyebrow {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #94a3b8;
	}
	.sf-board-meta {
		gap: 1rem;
	}
	.sf-meta-label {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #64748b;
	}
	.sf-centred {
		display: flex;
		justify-content: center;
		padding: 1.5rem;
		background: var(--surface);
		border-radius: var(--r-2);
		border: 1px solid var(--border);
	}
	.sf-counter-btn {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: transparent;
		border: 0;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}
	.sf-counter-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 4px;
		border-radius: 0.5rem;
	}
	.sf-counter-hint {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--accent);
	}
	.sf-grid-3 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}
	.sf-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sf-cell-tag {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.75rem;
		color: var(--fg-2);
		letter-spacing: 0.08em;
	}
</style>
