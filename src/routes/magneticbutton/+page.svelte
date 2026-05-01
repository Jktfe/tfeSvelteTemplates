<!--
	MagneticButton Demo Page (TFE shell)
-->

<script lang="ts">
	import MagneticButton from '$lib/components/MagneticButton.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/magneticbutton')!;

	const usageSnippet = `<script>
  import MagneticButton from '$lib/components/MagneticButton.svelte';
<\/script>

<MagneticButton strength={0.3} radius={120}>
  <button type="button">Hover me</button>
</MagneticButton>`;

	const codeExplanation =
		'MagneticButton wraps any focusable element and pulls it toward the cursor when the pointer enters its radius. The translation is interpolated each frame using a critically-damped easing (the damping prop), so motion stays smooth even when the cursor changes direction sharply. Touch and reduced-motion users see a static control — the wrapper short-circuits before binding listeners.';
</script>

<svelte:head>
	<title>MagneticButton — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Wrap any button or link in a subtle magnetic pull toward the cursor. Reduced-motion safe."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Hover', 'Reduced-motion safe', 'Zero deps']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="mb-grid">
			<article class="mb-cell">
				<h3>Default</h3>
				<p class="mb-cell__hint">strength 0.3 · radius 100 · damping 0.1</p>
				<div class="mb-stage">
					<MagneticButton>
						<button class="mb-cta mb-cta--primary" type="button">Hover me</button>
					</MagneticButton>
				</div>
			</article>

			<article class="mb-cell">
				<h3>Strong &amp; wide</h3>
				<p class="mb-cell__hint">strength 0.6 · radius 180</p>
				<div class="mb-stage">
					<MagneticButton strength={0.6} radius={180}>
						<button class="mb-cta mb-cta--secondary" type="button">Pulls harder</button>
					</MagneticButton>
				</div>
			</article>

			<article class="mb-cell">
				<h3>Subtle &amp; quick</h3>
				<p class="mb-cell__hint">strength 0.15 · damping 0.05</p>
				<div class="mb-stage">
					<MagneticButton strength={0.15} damping={0.05}>
						<button class="mb-cta mb-cta--ghost" type="button">Barely moves</button>
					</MagneticButton>
				</div>
			</article>

			<article class="mb-cell">
				<h3>Wraps a link</h3>
				<p class="mb-cell__hint">Any element works — semantics stay on the child.</p>
				<div class="mb-stage">
					<MagneticButton>
						<a class="mb-cta mb-cta--link" href="#docs">Docs &amp; API ↗</a>
					</MagneticButton>
				</div>
			</article>
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
					<td><code>strength</code></td>
					<td><code>number</code></td>
					<td><code>0.3</code></td>
					<td>Fraction of cursor-to-centre distance to travel. Higher = stronger pull.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>number</code></td>
					<td><code>100</code></td>
					<td>Trigger radius in pixels around the wrapped element.</td>
				</tr>
				<tr>
					<td><code>damping</code></td>
					<td><code>number</code></td>
					<td><code>0.1</code></td>
					<td>0–1. Lower values smooth the motion across more frames.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mb-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 16px;
	}
	.mb-cell {
		display: grid;
		gap: 8px;
		padding: 16px;
		border-radius: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.mb-cell h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.mb-cell__hint {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		color: var(--fg-3);
		text-transform: uppercase;
	}
	.mb-stage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 120px;
		padding: 18px;
		border-radius: 10px;
		background: var(--surface-2);
	}

	.mb-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 12px 22px;
		border-radius: 999px;
		border: 1px solid transparent;
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
	}
	.mb-cta--primary {
		background: var(--accent);
		color: var(--accent-on);
	}
	.mb-cta--primary:hover {
		background: var(--accent-strong);
	}
	.mb-cta--secondary {
		background: var(--fg-1);
		color: var(--bg);
	}
	.mb-cta--ghost {
		background: transparent;
		color: var(--fg-1);
		border-color: var(--border-strong);
	}
	.mb-cta--ghost:hover {
		background: var(--surface);
	}
	.mb-cta--link {
		background: var(--surface);
		color: var(--accent);
		border-color: var(--border-strong);
	}
</style>
