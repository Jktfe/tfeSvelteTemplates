<!--
	ShineBorder Demo Page (TFE shell)
-->

<script lang="ts">
	import ShineBorder from '$lib/components/ShineBorder.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/shineborder')!;

	const palette = [
		{ color: '#146ef5', label: 'Blue' },
		{ color: '#10b981', label: 'Green' },
		{ color: '#8b5cf6', label: 'Purple' },
		{ color: '#f59e0b', label: 'Orange' }
	];

	const usageSnippet = `<script>
  import ShineBorder from '$lib/components/ShineBorder.svelte';
<\/script>

<ShineBorder color="#146ef5" duration={3} borderWidth={2} borderRadius={8}>
  <div class="card">
    Featured content
  </div>
</ShineBorder>`;

	const codeExplanation =
		'ShineBorder paints a conic-gradient sweep onto a pseudo-element that masks the wrapped content. The animation runs purely in CSS (no rAF, no JS state), so it stays cheap regardless of how many borders are on the page. Colour, duration, width, and radius are all standalone props — change one without touching the others.';
</script>

<svelte:head>
	<title>ShineBorder — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Animated border with a sweeping shine. Pure CSS, configurable colour, speed, width, and radius."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'CSS-only', 'Animated', 'Theme-aware']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="sb-demo">
			<ShineBorder color="#146ef5" duration={3} borderWidth={2} borderRadius={12}>
				<div class="sb-card">
					<h3>Featured content</h3>
					<p>
						The default ShineBorder draws attention with a slow, even sweep. Hover to inspect the
						animation; it never pauses, so layout doesn't reflow.
					</p>
				</div>
			</ShineBorder>

			<div class="sb-grid">
				{#each palette as p (p.color)}
					<ShineBorder color={p.color} duration={3} borderRadius={10}>
						<div class="sb-swatch">
							<span class="sb-swatch__chip" style:background={p.color} aria-hidden="true"></span>
							<strong>{p.label}</strong>
							<code>{p.color}</code>
						</div>
					</ShineBorder>
				{/each}
			</div>

			<div class="sb-grid sb-grid--speed">
				<ShineBorder color="#146ef5" duration={1.5} borderRadius={10}>
					<div class="sb-swatch">
						<strong>Fast</strong>
						<code>duration=1.5</code>
					</div>
				</ShineBorder>
				<ShineBorder color="#146ef5" duration={3} borderRadius={10}>
					<div class="sb-swatch">
						<strong>Medium</strong>
						<code>duration=3</code>
					</div>
				</ShineBorder>
				<ShineBorder color="#146ef5" duration={6} borderRadius={10}>
					<div class="sb-swatch">
						<strong>Slow</strong>
						<code>duration=6</code>
					</div>
				</ShineBorder>
			</div>
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
					<td><code>color</code></td>
					<td><code>string</code></td>
					<td><code>'#146ef5'</code></td>
					<td>Any CSS colour value. Drives the animated shine.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>3</code></td>
					<td>Sweep duration in seconds. Lower is faster.</td>
				</tr>
				<tr>
					<td><code>borderWidth</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Border thickness in pixels.</td>
				</tr>
				<tr>
					<td><code>borderRadius</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Corner radius in pixels.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sb-demo {
		display: grid;
		gap: 24px;
	}

	.sb-card {
		padding: 24px;
		border-radius: 12px;
		background: var(--surface);
		color: var(--fg-1);
		max-width: 540px;
	}
	.sb-card h3 {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 22px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.sb-card p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--fg-2);
	}

	.sb-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 12px;
	}
	.sb-grid--speed {
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	}
	.sb-swatch {
		display: grid;
		gap: 8px;
		padding: 18px;
		border-radius: 10px;
		background: var(--surface);
		text-align: center;
		color: var(--fg-1);
		font-size: 13px;
	}
	.sb-swatch__chip {
		display: block;
		width: 36px;
		height: 36px;
		margin: 0 auto;
		border-radius: 8px;
	}
	.sb-swatch code {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--fg-3);
	}
</style>
