<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ScrambledText from '$lib/components/ScrambledText.svelte';

	const shell = catalogShellPropsForSlug('/scrambledtext')!;
</script>

<svelte:head>
	<title>ScrambledText — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Glyph-shuffle reveal that resolves into readable copy. Pure JS state machine on requestAnimationFrame, zero dependencies, prefers-reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Typography', 'Hover', 'A11y']}
	codeExplanation="ScrambledText computes a per-character settle time once at start, then runs a single requestAnimationFrame loop that swaps in random glyphs from the pool until each character's settle time elapses. When prefers-reduced-motion is on, the rAF loop never spins up — the final text renders immediately."
>
	{#snippet demo()}
		<div class="sc-demo">
			<p class="sc-demo__lede">
				Each section below mounts a different combination of <code>order</code>, <code>pool</code>,
				and <code>replayOnHover</code>. The auto-start variants run on mount; the hover one waits
				for your cursor.
			</p>

			<section class="sc-section">
				<h4>Default · order="left-to-right"</h4>
				<p class="sc-section__hint">
					Letters resolve in reading order, which feels deliberate — like a teleprinter or
					decoding sequence revealing one position at a time.
				</p>
				<div class="sc-card sc-card--centered">
					<span class="sc-display-2">
						<ScrambledText text="LEFT TO RIGHT" duration={1800} order="left-to-right" />
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Random order · order="random"</h4>
				<p class="sc-section__hint">
					Each character picks its own settle time uniformly across the duration window. The reveal
					feels organic and Bourne-Identity-ish.
				</p>
				<div class="sc-card sc-card--centered">
					<span class="sc-display-2">
						<ScrambledText text="RANDOM ORDER" duration={1800} order="random" />
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Long copy · sentence with random order</h4>
				<p class="sc-section__hint">
					Spaces are preserved during scramble so word boundaries form before the letters do.
					Useful for hero headlines.
				</p>
				<div class="sc-card sc-card--centered">
					<span class="sc-headline">
						<ScrambledText
							text="We engineer outcomes, not features."
							duration={2400}
							order="random"
						/>
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Replay on hover · order="random" · pool="!@#$%01"</h4>
				<p class="sc-section__hint">
					Hovers re-trigger the scramble. Custom pool of symbols + digits gives a terminal-grade
					"access granted" feel.
				</p>
				<div class="sc-card sc-card--centered sc-card--terminal">
					<span class="sc-mono">
						<span class="sc-prompt">$</span>
						<ScrambledText
							text="ACCESS GRANTED"
							duration={1400}
							pool="!@#$%01"
							order="random"
							replayOnHover
							class="sc-terminal-out"
						/>
					</span>
					<span class="sc-hint-inline">hover to rescramble</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Numeric pool · order="random" · pool="0123456789"</h4>
				<p class="sc-section__hint">
					Restricting the pool to digits creates a slot-machine effect — perfect for scoreboards,
					stats, or pricing reveals.
				</p>
				<div class="sc-card sc-card--centered">
					<span class="sc-display-2">
						<ScrambledText text="2026" duration={1500} pool="0123456789" order="random" />
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Katakana pool · order="random"</h4>
				<p class="sc-section__hint">
					Pulling glyphs from a Katakana pool gives the cipher a Matrix-rain texture before the
					Latin letters land.
				</p>
				<div class="sc-card sc-card--centered sc-card--dark">
					<span class="sc-display-1 sc-light">
						<ScrambledText
							text="STATUS NOMINAL"
							duration={2400}
							order="random"
							pool="アイウエオカキクケコサシスセソタチツテト"
						/>
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Staggered countdown · loop=false (auto) · staged delays</h4>
				<p class="sc-section__hint">
					Three left-to-right scrambles each with their own start delay, simulating a manual
					sequence reveal.
				</p>
				<div class="sc-card sc-card--centered sc-staged">
					<span class="sc-display-2"><ScrambledText text="Ready." duration={900} /></span>
					<span class="sc-display-2">
						<ScrambledText text="Set." duration={900} delay={500} />
					</span>
					<span class="sc-display-2">
						<ScrambledText text="Go." duration={900} delay={1000} />
					</span>
				</div>
			</section>

			<section class="sc-section">
				<h4>Badge · short live indicator</h4>
				<p class="sc-section__hint">
					A pill-shaped badge with a fast scramble and a punctuation pool — readable instantly.
				</p>
				<div class="sc-card sc-card--centered">
					<span class="sc-badge">
						<ScrambledText text="LIVE" duration={900} pool="!*•–=+" />
					</span>
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
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>Final string to resolve to.</td></tr>
				<tr><td><code>duration</code></td><td><code>number</code></td><td><code>1500</code></td><td>Total settle time in ms.</td></tr>
				<tr><td><code>pool</code></td><td><code>string</code></td><td>A–Z 0–9</td><td>Pool of glyphs to shuffle through.</td></tr>
				<tr><td><code>order</code></td><td><code>"left-to-right" | "random"</code></td><td><code>"left-to-right"</code></td><td>Settle order.</td></tr>
				<tr><td><code>autoStart</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Run on mount.</td></tr>
				<tr><td><code>delay</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay before starting, ms.</td></tr>
				<tr><td><code>replayOnHover</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Rescramble on pointer enter.</td></tr>
				<tr><td><code>class</code></td><td><code>string</code></td><td><code>""</code></td><td>Extra class for the wrapper span.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sc-demo {
		display: grid;
		gap: 24px;
	}
	.sc-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.sc-demo__lede code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.sc-section {
		display: grid;
		gap: 0.625rem;
	}
	.sc-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.sc-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.sc-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.sc-card--centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		min-height: 160px;
		text-align: center;
	}
	.sc-staged {
		gap: 0.5rem;
	}
	.sc-card--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.sc-card--terminal {
		background: #020617;
		border-color: #0f172a;
	}
	.sc-card--terminal .sc-mono {
		font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
		font-size: 1.5rem;
		font-weight: 600;
		color: #22d3ee;
	}
	.sc-card--terminal .sc-prompt {
		color: #fbbf24;
		margin-right: 0.6rem;
	}
	.sc-card--terminal :global(.sc-terminal-out) {
		color: #34d399;
	}
	.sc-headline {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.35;
	}
	.sc-display-1 {
		font-size: 2.5rem;
		font-weight: 700;
	}
	.sc-light {
		color: #f1f5f9;
	}
	.sc-display-2 {
		font-size: 2rem;
		font-weight: 700;
	}
	.sc-badge {
		display: inline-block;
		padding: 0.5rem 1.25rem;
		background: #fef3c7;
		color: #b45309;
		border-radius: 9999px;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.18em;
	}
	.sc-hint-inline {
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
</style>
