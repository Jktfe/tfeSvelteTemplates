<!--
	ClickSpark Demo Page (TFE shell)
-->

<script lang="ts">
	import ClickSpark from '$lib/components/ClickSpark.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/clickspark')!;

	let primaryClicks = $state(0);
	let likeCount = $state(48);
	let liked = $state(false);

	function handleLike() {
		liked = !liked;
		likeCount += liked ? 1 : -1;
	}

	const usageSnippet = `<script>
  import ClickSpark from '$lib/components/ClickSpark.svelte';
<\/script>

<ClickSpark sparkColor="#fbbf24" sparkCount={12} shape="star">
  <button>Try the demo</button>
</ClickSpark>`;

	const codeExplanation =
		'ClickSpark is a wrap-anything decoration. Each click spawns an independent burst of CSS-keyframed particles that origin from the actual click point — never the wrapper centre — so the burst feels tied to the gesture. Bursts self-clean on animation end, and reduced-motion users get the click semantics with no particles at all.';
</script>

<svelte:head>
	<title>ClickSpark — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Wrap any element to spray a configurable particle burst on click. Pure CSS, four shapes."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Click', 'CSS-only', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="cs-demo">
			<section class="cs-section">
				<h3>Default — try it</h3>
				<div class="cs-stage cs-stage--centered">
					<ClickSpark>
						<button class="cs-cta cs-cta--primary" onclick={() => primaryClicks++}>
							Click me · {primaryClicks}
						</button>
					</ClickSpark>
				</div>
			</section>

			<section class="cs-section">
				<h3>Four spark shapes</h3>
				<div class="cs-stage cs-stage--row">
					<ClickSpark sparkColor="#ffffff" shape="dot">
						<button class="cs-cta cs-cta--dark">dot</button>
					</ClickSpark>
					<ClickSpark sparkColor="#22d3ee" shape="plus" sparkCount={10}>
						<button class="cs-cta cs-cta--dark">plus</button>
					</ClickSpark>
					<ClickSpark sparkColor="#f97316" shape="line" sparkCount={12} sparkSize={14}>
						<button class="cs-cta cs-cta--dark">line</button>
					</ClickSpark>
					<ClickSpark sparkColor="#fbbf24" shape="star" sparkCount={6} sparkSize={14}>
						<button class="cs-cta cs-cta--dark">star</button>
					</ClickSpark>
				</div>
			</section>

			<section class="cs-section">
				<h3>Like — composes with stateful UI</h3>
				<div class="cs-stage cs-stage--centered">
					<ClickSpark
						sparkColor="#f43f5e"
						shape="star"
						sparkCount={10}
						spreadRadius={70}
						duration={650}
					>
						<button class="cs-like" class:liked onclick={handleLike} aria-pressed={liked}>
							<span class="cs-like__heart" aria-hidden="true">{liked ? '♥' : '♡'}</span>
							<span>{likeCount}</span>
						</button>
					</ClickSpark>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>sparkColor</code></td>
					<td><code>string</code></td>
					<td><code>'#ffffff'</code></td>
					<td>Hex / RGB colour for each particle.</td>
				</tr>
				<tr>
					<td><code>shape</code></td>
					<td><code>'dot' | 'plus' | 'line' | 'star'</code></td>
					<td><code>'dot'</code></td>
					<td>Particle shape rendered via pure CSS.</td>
				</tr>
				<tr>
					<td><code>sparkCount</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Number of particles per burst.</td>
				</tr>
				<tr>
					<td><code>sparkSize</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Base particle size in pixels.</td>
				</tr>
				<tr>
					<td><code>spreadRadius</code></td>
					<td><code>number</code></td>
					<td><code>60</code></td>
					<td>Distance particles travel from origin.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>500</code></td>
					<td>Burst lifetime in milliseconds.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cs-demo {
		display: grid;
		gap: 20px;
	}
	.cs-section {
		display: grid;
		gap: 10px;
	}
	.cs-section h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.cs-stage {
		padding: 24px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.cs-stage--centered {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 120px;
	}
	.cs-stage--row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
		align-items: center;
		min-height: 120px;
	}

	.cs-cta {
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		border: 1px solid transparent;
		transition: transform 120ms ease, background 120ms ease;
	}
	.cs-cta:active {
		transform: scale(0.97);
	}
	.cs-cta--primary {
		background: var(--accent);
		color: var(--accent-on);
		border-color: var(--accent-strong);
	}
	.cs-cta--primary:hover {
		background: var(--accent-strong);
	}
	.cs-cta--dark {
		background: #1e293b;
		color: white;
		border-color: #0f172a;
		min-width: 80px;
	}
	.cs-cta--dark:hover {
		background: #0f172a;
	}

	.cs-like {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		font-size: 16px;
		font-weight: 500;
		background: var(--surface-2);
		color: var(--fg-2);
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		cursor: pointer;
		transition: color 200ms ease, background 200ms ease, border-color 200ms ease;
	}
	.cs-like__heart {
		font-size: 20px;
		line-height: 1;
	}
	.cs-like:hover {
		color: #f43f5e;
		border-color: #fecdd3;
	}
	.cs-like.liked {
		color: #f43f5e;
		background: #fff1f2;
		border-color: #fecdd3;
	}
</style>
