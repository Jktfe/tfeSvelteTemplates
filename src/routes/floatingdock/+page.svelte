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

	const macItems: FloatingDockItem[] = [
		{ id: 'm1', title: 'Finder', icon: '🗂️' },
		{ id: 'm2', title: 'Mail', icon: '✉️' },
		{ id: 'm3', title: 'Safari', icon: '🧭' },
		{ id: 'm4', title: 'Notes', icon: '📝' },
		{ id: 'm5', title: 'Photos', icon: '🖼️' }
	];

	const denseItems: FloatingDockItem[] = [
		{ id: 'd1', title: 'Home', icon: '🏠' },
		{ id: 'd2', title: 'Search', icon: '🔍' },
		{ id: 'd3', title: 'Inbox', icon: '📥' },
		{ id: 'd4', title: 'Calendar', icon: '📅' },
		{ id: 'd5', title: 'Tasks', icon: '✅' },
		{ id: 'd6', title: 'Drafts', icon: '✏️' },
		{ id: 'd7', title: 'Files', icon: '📂' },
		{ id: 'd8', title: 'Settings', icon: '⚙️' }
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
				Three mounted instances below — each in its own contained "shelf" so the
				<code>position: fixed</code> dock anchors to the wrapper instead of the viewport. Hover or
				touch any of them to feel the cosine-curve magnification. The live system-wide dock at the
				bottom of the page uses these same defaults.
			</p>

			<section class="fd-section">
				<h4>Default · magnification 2 · radius 140px</h4>
				<p class="fd-section__hint">
					The standard. A five-icon dock with the documented defaults — wide influence, gentle
					peak.
				</p>
				<div class="fd-stage">
					<FloatingDock items={macItems} />
				</div>
			</section>

			<section class="fd-section">
				<h4>Punchy · magnification 3 · radius 80px</h4>
				<p class="fd-section__hint">
					Higher peak, narrower influence. Hovered icon almost triples in size; only the icons
					directly beside it feel the wave.
				</p>
				<div class="fd-stage">
					<FloatingDock items={macItems} magnification={3} distance={80} />
				</div>
			</section>

			<section class="fd-section">
				<h4>Subtle · magnification 1.4 · radius 220px</h4>
				<p class="fd-section__hint">
					Lower peak, wider influence. The whole dock breathes together rather than spotlighting
					one icon — useful for productivity tools where punch would be distracting.
				</p>
				<div class="fd-stage">
					<FloatingDock items={macItems} magnification={1.4} distance={220} />
				</div>
			</section>

			<section class="fd-section">
				<h4>Dense · 8 items, default magnification</h4>
				<p class="fd-section__hint">
					More items make the falloff visible — neighbours scale less than the centre because
					they're proportionally further along the influence radius.
				</p>
				<div class="fd-stage">
					<FloatingDock items={denseItems} />
				</div>
			</section>

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

			<p class="fd-demo__footnote">
				A live, viewport-anchored dock also runs at the bottom of this page — that's the default
				usage pattern. The shelves above are scoped previews: each <code>.fd-stage</code> wrapper
				uses <code>contain: layout paint</code> + <code>transform: translateZ(0)</code> to create
				a containing block so the dock's <code>position: fixed</code> resolves to the wrapper
				rather than the page viewport.
			</p>

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
	.fd-demo__lede code,
	.fd-demo__footnote code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.fd-demo__footnote {
		margin: 0;
		color: var(--fg-3);
		font-size: 13px;
		line-height: 1.55;
		padding: 14px 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}

	/* Scoped variant section. h4 / hint / stage. */
	.fd-section {
		display: grid;
		gap: 10px;
		padding: 18px 0 0;
		border-top: 1px solid var(--border);
	}
	.fd-section h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.fd-section__hint {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}

	/* The scoping trick — `contain: layout paint` + `transform: translateZ(0)`
	   creates a new containing block, so descendant `position: fixed`
	   resolves to the wrapper (not the viewport). The dock then sits at the
	   bottom of THIS box rather than the bottom of the page. */
	.fd-stage {
		position: relative;
		min-height: 180px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
		contain: layout paint;
		transform: translateZ(0);
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
