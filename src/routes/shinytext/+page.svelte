<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ShinyText from '$lib/components/ShinyText.svelte';

	const shell = catalogShellPropsForSlug('/shinytext')!;
</script>

<svelte:head>
	<title>ShinyText — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Pure-CSS shimmer band that sweeps across text. GPU-composited, prefers-reduced-motion safe, zero JavaScript at runtime."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Theme-aware', 'A11y']}
	codeExplanation="ShinyText paints a CSS gradient over the text, then animates a brighter highlight band sweeping across the gradient using a single keyframe block. There is zero JavaScript at runtime — the animation is GPU-composited and is suppressed automatically when prefers-reduced-motion: reduce is set."
>
	{#snippet demo()}
		<div class="st-demo">
			<p class="st-demo__lede">
				A single CSS keyframe slides a brighter band across each text element. Each section
				pairs a different colour and duration — the captions list the exact
				<code>baseColor</code> and <code>shineColor</code> so you can copy them directly.
			</p>

			<section class="st-section">
				<h4>Premium · silver shine on charcoal</h4>
				<p class="st-section__hint">
					The default look — a neutral grey resting state with a near-white sweep. Works on any
					light or dark surface.
				</p>
				<div class="st-card st-card--centered">
					<span class="st-display-1">
						<ShinyText text="Premium" />
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#94a3b8"</code> · <code>shineColor="#ffffff"</code> · <code>duration=3</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Gold on charcoal · luxury CTA</h4>
				<p class="st-section__hint">
					Warm gold sweeping over a near-white base sat inside a deep gradient button. Faster
					duration (2.5s) keeps the eye anchored on the call-to-action.
				</p>
				<div class="st-card st-card--centered">
					<button class="st-cta" type="button">
						<ShinyText
							text="Get Started →"
							baseColor="#ffffff"
							shineColor="#fbbf24"
							duration={2.5}
						/>
					</button>
				</div>
				<div class="st-meta">
					<code>baseColor="#ffffff"</code> · <code>shineColor="#fbbf24"</code> ·
					<code>duration=2.5</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Brand blue · sky shine on slate</h4>
				<p class="st-section__hint">
					A cool brand-leaning combination. The slate base reads as static type until the cyan band
					passes through.
				</p>
				<div class="st-card st-card--centered">
					<span class="st-display-1">
						<ShinyText
							text="Build with us"
							baseColor="#475569"
							shineColor="#0ea5e9"
							duration={3}
						/>
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#475569"</code> · <code>shineColor="#0ea5e9"</code> ·
					<code>duration=3</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Success green · status badge</h4>
				<p class="st-section__hint">
					Emerald shine on a darker green base — perfect for "live" or "operational" indicators.
				</p>
				<div class="st-card st-card--centered">
					<span class="st-display-2">
						<ShinyText
							text="ALL SYSTEMS GO"
							baseColor="#065f46"
							shineColor="#34d399"
							duration={2.2}
						/>
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#065f46"</code> · <code>shineColor="#34d399"</code> ·
					<code>duration=2.2</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Danger red · attention copy</h4>
				<p class="st-section__hint">
					Bright crimson shine over a maroon base. Fast duration (1.6s) creates urgency without
					feeling aggressive.
				</p>
				<div class="st-card st-card--centered">
					<span class="st-display-2">
						<ShinyText
							text="LIMITED TIME"
							baseColor="#7f1d1d"
							shineColor="#f87171"
							duration={1.6}
						/>
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#7f1d1d"</code> · <code>shineColor="#f87171"</code> ·
					<code>duration=1.6</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Dark mode · light sweep on midnight</h4>
				<p class="st-section__hint">
					On dark surfaces, an off-white base with a pure-white shine reads beautifully. Slower
					duration (5s) feels meditative.
				</p>
				<div class="st-card st-card--centered st-card--dark">
					<span class="st-display-1">
						<ShinyText
							text="extraordinary"
							baseColor="#cbd5e1"
							shineColor="#ffffff"
							duration={5}
						/>
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#cbd5e1"</code> · <code>shineColor="#ffffff"</code> ·
					<code>duration=5</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Mono purple · fast loop · 1.5s</h4>
				<p class="st-section__hint">
					A high-energy violet shine over slate. The shorter duration suits hero animations where
					attention is the goal.
				</p>
				<div class="st-card st-card--centered">
					<span class="st-display-1">
						<ShinyText text="Move fast." baseColor="#1e293b" shineColor="#a78bfa" duration={1.5} />
					</span>
				</div>
				<div class="st-meta">
					<code>baseColor="#1e293b"</code> · <code>shineColor="#a78bfa"</code> ·
					<code>duration=1.5</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Direction · lr vs rl · same colours, mirrored sweep</h4>
				<p class="st-section__hint">
					Toggling <code>direction</code> between <code>lr</code> and <code>rl</code> reverses the
					sweep without altering the gradient — useful for arrow indicators.
				</p>
				<div class="st-card st-card--row">
					<div class="st-direction-cell">
						<span class="st-hint-label">lr</span>
						<span class="st-display-2">
							<ShinyText
								text="→"
								baseColor="#cbd5e1"
								shineColor="#0ea5e9"
								duration={1.6}
								direction="lr"
							/>
						</span>
					</div>
					<div class="st-direction-cell">
						<span class="st-hint-label">rl</span>
						<span class="st-display-2">
							<ShinyText
								text="←"
								baseColor="#cbd5e1"
								shineColor="#0ea5e9"
								duration={1.6}
								direction="rl"
							/>
						</span>
					</div>
				</div>
				<div class="st-meta">
					<code>direction="lr"</code> · <code>direction="rl"</code>
				</div>
			</section>

			<section class="st-section">
				<h4>Staged delays · loop=false · run once in sequence</h4>
				<p class="st-section__hint">
					Three separate ShinyText instances with staggered <code>delay</code> and
					<code>loop=false</code>. Each plays exactly one shine then settles.
				</p>
				<div class="st-card st-card--centered st-staged">
					<span class="st-display-2">
						<ShinyText
							text="Ready."
							baseColor="#1e293b"
							shineColor="#22d3ee"
							loop={false}
							duration={1.4}
						/>
					</span>
					<span class="st-display-2">
						<ShinyText
							text="Set."
							baseColor="#1e293b"
							shineColor="#a78bfa"
							loop={false}
							duration={1.4}
							delay={0.4}
						/>
					</span>
					<span class="st-display-2">
						<ShinyText
							text="Go."
							baseColor="#1e293b"
							shineColor="#fbbf24"
							loop={false}
							duration={1.4}
							delay={0.8}
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
				<tr><td><code>text</code></td><td><code>string</code></td><td>required</td><td>Text to render with the shine sweep.</td></tr>
				<tr><td><code>baseColor</code></td><td><code>string</code></td><td><code>"#94a3b8"</code></td><td>Resting colour of the text.</td></tr>
				<tr><td><code>shineColor</code></td><td><code>string</code></td><td><code>"#ffffff"</code></td><td>Colour of the highlight band.</td></tr>
				<tr><td><code>duration</code></td><td><code>number</code></td><td><code>3</code></td><td>Sweep duration in seconds.</td></tr>
				<tr><td><code>direction</code></td><td><code>"lr" | "rl"</code></td><td><code>"lr"</code></td><td>Sweep direction.</td></tr>
				<tr><td><code>loop</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Loop continuously or run once.</td></tr>
				<tr><td><code>delay</code></td><td><code>number</code></td><td><code>0</code></td><td>Delay before the first sweep, seconds.</td></tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.st-demo {
		display: grid;
		gap: 24px;
	}
	.st-demo__lede {
		margin: 0;
		font-size: 0.95rem;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.st-demo__lede code,
	.st-meta code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 2px 6px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.st-section {
		display: grid;
		gap: 0.625rem;
	}
	.st-section h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}
	.st-section__hint {
		margin: 0;
		font-size: 0.875rem;
		color: var(--fg-2);
		line-height: 1.5;
		max-width: 70ch;
	}
	.st-section__hint code {
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.825em;
		padding: 1px 5px;
		background: color-mix(in srgb, var(--fg-1) 8%, var(--surface));
		border-radius: 4px;
	}
	.st-meta {
		font-size: 0.8rem;
		color: var(--fg-2);
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
	}
	.st-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 2.5rem 1.5rem;
		color: var(--fg-1);
	}
	.st-card--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
	}
	.st-card--dark {
		background: #0f172a;
		border-color: #1e293b;
	}
	.st-card--row {
		display: flex;
		gap: 2rem;
		align-items: center;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}
	.st-staged {
		flex-direction: column;
		gap: 0.5rem;
	}
	.st-direction-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.st-hint-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--fg-2);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.st-display-1 {
		font-size: 3rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.st-display-2 {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.st-cta {
		padding: 1rem 1.75rem;
		font-size: 1.125rem;
		font-weight: 600;
		border-radius: 0.5rem;
		border: none;
		background: linear-gradient(135deg, #4338ca 0%, #1e293b 100%);
		color: #fff;
		cursor: pointer;
		box-shadow: 0 8px 24px rgba(67, 56, 202, 0.35);
	}
</style>
