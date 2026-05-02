<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TrueFocus from '$lib/components/TrueFocus.svelte';

	const shell = catalogShellPropsForSlug('/truefocus')!;
</script>

<svelte:head>
	<title>TrueFocus — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Word-by-word phrase focus with a single morphing frame. Hover-pause, click-to-pin, ResizeObserver-aware."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Typography', 'Hover', 'A11y']}
	codeExplanation="TrueFocus measures every word's bounding rect once, then animates a single absolutely-positioned frame between them. ResizeObserver re-measures on layout change. Click or Enter pins a word; hover pauses the cycle. prefers-reduced-motion disables the morph transition entirely."
>
	{#snippet demo()}
		<div class="tf-demo">
			<p class="tf-demo__lede">
				Each section below mounts TrueFocus with a different combination of <code>cycleDuration</code>,
				<code>pauseOnHover</code>, padding, and <code>glow</code>. Click any word to pin focus —
				click again (or click another) to release.
			</p>

			<section class="tf-section">
				<h4>Default · cycleDuration 1500 · pauseOnHover true</h4>
				<p class="tf-section__hint">
					The default — slow read, frame slides every 1.5s. Hover pauses the cycle so users can
					read at their own pace.
				</p>
				<div class="tf-card tf-card--centered">
					<h3 class="tf-headline">
						<TrueFocus text="True focus on the present" />
					</h3>
				</div>
			</section>

			<section class="tf-section">
				<h4>Fast cycle · cycleDuration 800 · sharp pace</h4>
				<p class="tf-section__hint">
					Halving the cycle duration creates an urgent, kinetic read. Useful for kinetic-typography
					hero blocks where you want the frame to dance.
				</p>
				<div class="tf-card tf-card--centered">
					<span class="tf-display-2">
						<TrueFocus
							text="Move fast and ship often"
							cycleDuration={800}
							color="#a855f7"
							glow={true}
						/>
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>Slow cycle · cycleDuration 2400 · meditative pace</h4>
				<p class="tf-section__hint">
					A longer hold per word feels deliberate — useful for poetry, manifestos, or anything you
					want the reader to actually read.
				</p>
				<div class="tf-card tf-card--centered">
					<span class="tf-display-2">
						<TrueFocus
							text="Less, but better"
							cycleDuration={2400}
							color="#0ea5e9"
							glow={true}
						/>
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>pauseOnHover false · cycle never stops</h4>
				<p class="tf-section__hint">
					When set to <code>false</code>, the cycle ignores the cursor entirely — useful for
					purely decorative motion that shouldn't react to hovering UI elements above it.
				</p>
				<div class="tf-card tf-card--centered">
					<span class="tf-display-2">
						<TrueFocus
							text="Always cycling, never resting"
							cycleDuration={1200}
							pauseOnHover={false}
							color="#f59e0b"
						/>
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>Pin via autoStart=false · click any word to lock</h4>
				<p class="tf-section__hint">
					With <code>autoStart=false</code> the cycle never begins — the first word stays pinned
					until you click another. Perfect for "select a value" interactions.
				</p>
				<div class="tf-card tf-card--centered">
					<span class="tf-display-2">
						<TrueFocus text="Pin a word with click or Enter" autoStart={false} color="#0ea5e9" />
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>Generous padding · paddingX 18 · paddingY 10 · soft frame</h4>
				<p class="tf-section__hint">
					Bigger padding plus a glow renders the frame as a soft halo rather than a tight outline
					— closest analogue the component offers to a "blur" effect.
				</p>
				<div class="tf-card tf-card--centered">
					<span class="tf-display-2">
						<TrueFocus
							text="Soft halo around the active word"
							cycleDuration={1600}
							color="#16a34a"
							glow={true}
							paddingX={18}
							paddingY={10}
						/>
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>Random order · cycleDuration 1200 · poetic feel</h4>
				<p class="tf-section__hint">
					<code>order="random"</code> jumps the focus to non-adjacent words — adds a stochastic
					feel suited to dark or maximalist designs.
				</p>
				<div class="tf-card tf-card--centered tf-card--dark">
					<span class="tf-display-1 tf-light">
						<TrueFocus
							text="The mind moves in many directions"
							order="random"
							cycleDuration={1200}
							color="#fbbf24"
						/>
					</span>
				</div>
			</section>

			<section class="tf-section">
				<h4>Long sentence · multi-line wrap · paddingX 6 paddingY 3</h4>
				<p class="tf-section__hint">
					A long sentence demonstrates the ResizeObserver-driven re-measure: the frame tracks
					words across line breaks. Tight padding keeps the indicator snug at small line heights.
				</p>
				<div class="tf-card tf-card--centered tf-card--poem">
					<span class="tf-display-2">
						<TrueFocus
							text="Two roads diverged in a yellow wood and sorry I could not travel both"
							cycleDuration={900}
							color="#16a34a"
							paddingX={6}
							paddingY={3}
						/>
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
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>Phrase to highlight word-by-word.</td></tr>
				<tr><td><code>cycleDuration</code></td><td><code>number</code></td><td><code>1500</code></td><td>Hold time per word, ms.</td></tr>
				<tr><td><code>order</code></td><td><code>"sequential" | "random"</code></td><td><code>"sequential"</code></td><td>Cycle order.</td></tr>
				<tr><td><code>autoStart</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Start cycling on mount.</td></tr>
				<tr><td><code>pauseOnHover</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Pause the cycle while pointer is over.</td></tr>
				<tr><td><code>color</code></td><td><code>string</code></td><td><code>"#4338ca"</code></td><td>Frame border and glow colour.</td></tr>
				<tr><td><code>glow</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Render a soft glow around the frame.</td></tr>
				<tr><td><code>paddingX</code></td><td><code>number</code></td><td><code>4</code></td><td>Horizontal padding around each word, px.</td></tr>
				<tr><td><code>paddingY</code></td><td><code>number</code></td><td><code>2</code></td><td>Vertical padding around each word, px.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tf-demo {
		display: grid;
		gap: 24px;
	}
	.tf-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.tf-demo__lede code,
	.tf-section__hint code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.tf-section {
		display: grid;
		gap: 0.625rem;
	}
	.tf-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.tf-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.tf-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.tf-card--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
		text-align: center;
	}
	.tf-card--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.tf-card--poem {
		min-height: 220px;
		padding: 3rem 2.5rem;
		line-height: 1.8;
	}
	.tf-headline {
		margin: 0;
		font-size: 1.85rem;
		font-weight: 700;
		line-height: 1.45;
	}
	.tf-display-1 {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.5;
	}
	.tf-light {
		color: #f1f5f9;
	}
	.tf-display-2 {
		font-size: 1.65rem;
		font-weight: 700;
		line-height: 1.6;
	}
</style>
