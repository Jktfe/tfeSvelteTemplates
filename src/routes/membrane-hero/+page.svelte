<script lang="ts">
	import MembraneHero from '$lib/components/MembraneHero/MembraneHero.svelte';
	import type { MembranePalette } from '$lib/components/MembraneHero/types';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/membrane-hero')!;

	const palettes: MembranePalette[] = ['aurora', 'sunset', 'polar'];
	const moods: Record<MembranePalette, string> = {
		aurora: 'teal → violet → amber',
		sunset: 'rose → amber → indigo',
		polar: 'slate → sky → cyan'
	};

	const usageSnippet = `<script>
  import MembraneHero from '$lib/components/MembraneHero/MembraneHero.svelte';
<\/script>

<MembraneHero
  palette="aurora"
  eyebrow="Now in beta"
  headline="A new kind of canvas"
  subhead="Hand-crafted Svelte 5 primitives. Zero runtime cost."
  primaryCta="Start building"
  secondaryCta="See the docs"
/>`;

	const codeExplanation =
		'MembraneHero stacks a CSS conic-gradient base under an inline SVG <feTurbulence> + <feDisplacementMap> filter. SMIL animates the turbulence baseFrequency so the surface ripples like a fluid film. A Lissajous focal dot, per-glyph headline deal-in, and three palette presets layer on top. Reduced motion freezes the turbulence, drops the dot loop, and disables the deal-in.';
</script>

<svelte:head>
	<title>MembraneHero — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Warped-fluid-mesh full-bleed editorial hero with SVG displacement, Lissajous focal dot, per-glyph deal-in, and three palette presets."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'SVG filter', 'Editorial', 'Reduced-motion safe']}
	{usageSnippet}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="mh-stack">
			{#each palettes as p (p)}
				<div class="mh-frame">
					<div class="mh-label">
						<span class="mh-label__name">{p}</span>
						<span class="mh-label__mood">{moods[p]}</span>
					</div>
					{#if p === 'aurora'}
						<MembraneHero
							palette={p}
							eyebrow="Now in beta"
							headline="A new kind of canvas"
							subhead="Hand-crafted Svelte 5 primitives. Zero runtime cost. Every animation respects prefers-reduced-motion."
							primaryCta="Start building"
							secondaryCta="See the docs"
						/>
					{:else if p === 'sunset'}
						<MembraneHero
							palette={p}
							eyebrow="Launch week"
							headline="Ship a story, not a stack"
							subhead="Editorial layouts for product launches, season campaigns, and announcement pages."
							primaryCta="Read the launch"
							secondaryCta="Browse archives"
						/>
					{:else}
						<MembraneHero
							palette={p}
							eyebrow="Field notes"
							headline="Quiet light, deep focus"
							subhead="A composition palette for documentation sites, technical journals, and quiet brand pages."
							primaryCta="Read the journal"
							secondaryCta="Subscribe"
						/>
					{/if}
				</div>
			{/each}
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
					<td><code>palette</code></td>
					<td><code>'aurora' | 'sunset' | 'polar'</code></td>
					<td><code>'aurora'</code></td>
					<td>Named gradient + accent preset.</td>
				</tr>
				<tr>
					<td><code>eyebrow</code></td>
					<td><code>string</code></td>
					<td><code>'Now in beta'</code></td>
					<td>Small uppercased pill above the headline.</td>
				</tr>
				<tr>
					<td><code>headline</code></td>
					<td><code>string</code></td>
					<td><code>'A new kind of canvas'</code></td>
					<td>Hero headline, animated per-glyph.</td>
				</tr>
				<tr>
					<td><code>subhead</code></td>
					<td><code>string</code></td>
					<td><code>'Hand-crafted primitives, zero runtime cost.'</code></td>
					<td>Supporting copy under the headline.</td>
				</tr>
				<tr>
					<td><code>primaryCta</code> / <code>secondaryCta</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Anchor labels for the two CTAs.</td>
				</tr>
				<tr>
					<td><code>primaryHref</code> / <code>secondaryHref</code></td>
					<td><code>string</code></td>
					<td><code>'#'</code></td>
					<td>Anchor targets.</td>
				</tr>
				<tr>
					<td><code>showDot</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show or hide the Lissajous focal dot.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.mh-stack {
		display: grid;
		gap: 1.5rem;
	}
	.mh-frame {
		border-radius: var(--r-2);
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.mh-label {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		padding: 0.6rem 1rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-2);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.mh-label__name {
		font-weight: 700;
		color: var(--fg-1);
	}
	.mh-label__mood {
		text-transform: none;
		letter-spacing: 0;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
	}
</style>
