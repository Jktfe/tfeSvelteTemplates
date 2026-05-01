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
			<div class="st-card st-card--centered">
				<span class="st-display-1"><ShinyText text="Premium" /></span>
			</div>

			<div class="st-card st-card--centered">
				<button class="st-cta" type="button">
					<ShinyText text="Get Started →" baseColor="#ffffff" shineColor="#fbbf24" duration={2.5} />
				</button>
			</div>

			<div class="st-card st-card--row">
				<div class="st-direction-cell">
					<span class="st-hint-label">lr</span>
					<span class="st-display-2">
						<ShinyText text="→" baseColor="#cbd5e1" shineColor="#0ea5e9" duration={1.6} direction="lr" />
					</span>
				</div>
				<div class="st-direction-cell">
					<span class="st-hint-label">rl</span>
					<span class="st-display-2">
						<ShinyText text="←" baseColor="#cbd5e1" shineColor="#0ea5e9" duration={1.6} direction="rl" />
					</span>
				</div>
			</div>

			<div class="st-card st-card--centered">
				<h3 class="st-headline">
					Build something
					<ShinyText text="extraordinary" baseColor="#1e293b" shineColor="#a78bfa" duration={3.5} />
				</h3>
			</div>

			<div class="st-card st-card--centered st-staged">
				<span class="st-display-2">
					<ShinyText text="Ready." baseColor="#1e293b" shineColor="#22d3ee" loop={false} duration={1.4} />
				</span>
				<span class="st-display-2">
					<ShinyText text="Set." baseColor="#1e293b" shineColor="#a78bfa" loop={false} duration={1.4} delay={0.4} />
				</span>
				<span class="st-display-2">
					<ShinyText text="Go." baseColor="#1e293b" shineColor="#fbbf24" loop={false} duration={1.4} delay={0.8} />
				</span>
			</div>
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
		gap: 16px;
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
	.st-headline {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.2;
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
