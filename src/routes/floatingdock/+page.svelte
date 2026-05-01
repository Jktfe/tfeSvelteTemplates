<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import FloatingDock from '$lib/components/FloatingDock.svelte';
	import type { FloatingDockItem } from '$lib/types';

	const shell = catalogShellPropsForSlug('/floatingdock')!;

	const customItems: FloatingDockItem[] = [
		{ id: 'f1', title: 'Folder', icon: '📁' },
		{ id: 'f2', title: 'Calendar', icon: '📅', href: '/calendarheatmap' },
		{ id: 'f3', title: 'Music', icon: '🎵' },
		{ id: 'f4', title: 'Photos', icon: '📸' },
		{ id: 'f5', title: 'Maps', icon: '🗺️', href: '/maps' },
		{ id: 'f6', title: 'Terminal', icon: '💻' }
	];

	const codeExplanation =
		'FloatingDock listens to mousemove relative to the dock element and feeds each icon a distance. A cosine-based scaling function spreads magnification across neighbouring icons so the result feels like a smooth wave rather than a binary hover. Below 768px the dock falls back to a simple horizontal scrollable bar — magnification only kicks in on pointer-friendly devices.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Hover', 'CSS transforms', 'Responsive']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="fd-demo">
			<p class="fd-demo__lede">
				The dock at the bottom of the viewport is the live component. Move your cursor across it
				slowly to watch the cosine-based magnification ripple between neighbouring icons. The
				<code>Calendar</code> and <code>Maps</code> icons link out to their respective demos.
			</p>

			<div class="fd-demo__grid">
				<div class="fd-demo__card">
					<h4>Magnification</h4>
					<p>
						<code>magnification</code> is the maximum scale factor. Each icon's actual scale is
						interpolated by its distance to the cursor, so the effect feels analogue.
					</p>
				</div>
				<div class="fd-demo__card">
					<h4>Distance</h4>
					<p>
						<code>distance</code> sets the influence radius in px. A larger value spreads the
						wave further; a smaller one keeps it tight to the hovered icon.
					</p>
				</div>
				<div class="fd-demo__card">
					<h4>Mobile fallback</h4>
					<p>
						Below 768px the dock renders as a flat scrollable row. Magnification is a desktop
						affordance — touch targets stay full-size on small screens.
					</p>
				</div>
			</div>

			<FloatingDock items={customItems} />
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
					<td><code>items</code></td>
					<td><code>FloatingDockItem[]</code></td>
					<td>required</td>
					<td>Dock entries (id, title, icon, optional href).</td>
				</tr>
				<tr>
					<td><code>magnification</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Maximum scale factor when an icon is directly hovered.</td>
				</tr>
				<tr>
					<td><code>distance</code></td>
					<td><code>number</code></td>
					<td><code>140</code></td>
					<td>Influence radius in px — beyond this, scale is 1.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the dock wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.fd-demo {
		display: grid;
		gap: 24px;
	}
	.fd-demo__lede {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.fd-demo__lede code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.fd-demo__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.fd-demo__card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 16px 18px;
	}
	.fd-demo__card h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.fd-demo__card p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.fd-demo__card code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
</style>
