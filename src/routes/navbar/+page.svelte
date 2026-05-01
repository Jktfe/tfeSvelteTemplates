<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import type { MenuCategory } from '$lib/types';

	const shell = catalogShellPropsForSlug('/navbar')!;

	// The Navbar mounted on the page demo is the actual one in the layout —
	// click the hamburger top-left to see categories, focus trap, and panel motion.
	const demoCategories: MenuCategory[] = [
		{
			name: 'Home',
			icon: '🏠',
			items: [{ label: 'Home', href: '/', icon: '🏠', active: false }]
		},
		{
			name: 'Cards & Layouts',
			icon: '🃏',
			items: [
				{ label: 'CardStack', href: '/cardstack', icon: '🃏', active: false },
				{ label: 'ExpandingCard', href: '/expandingcard', icon: '🎴', active: false },
				{ label: 'MagicCard', href: '/magiccard', icon: '✨', active: false }
			]
		},
		{
			name: 'Navigation',
			icon: '☰',
			items: [{ label: 'Navbar', href: '/navbar', icon: '☰', active: true }]
		}
	];

	const codeExplanation =
		'Navbar renders a sticky logo + hamburger trigger that opens a left-sliding panel. Categories collapse/expand independently; the category containing the active route auto-expands on mount. Body scroll locks while the panel is open, focus is trapped inside it, and Escape or backdrop click closes it. Better Auth integration is opt-in via isAuthConfigured.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Focus trap', 'Responsive']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="nav-demo">
			<p class="nav-demo__lede">
				The navbar at the top of every page <em>is</em> this component. Click the hamburger
				(<span aria-hidden="true">☰</span>) in the top-left to see the categorised panel, the
				expand/collapse animations, and active-page highlighting.
			</p>

			<div class="nav-demo__grid">
				<div class="nav-demo__card">
					<h4>Categorised navigation</h4>
					<p>
						Pass <code>menuCategories</code> instead of a flat list. Multi-item categories render
						as expandable groups; single-item categories collapse into a direct link.
					</p>
				</div>
				<div class="nav-demo__card">
					<h4>Auto-expand active</h4>
					<p>
						Whichever category contains the page you're on opens on mount, so the user lands with
						context already visible.
					</p>
				</div>
				<div class="nav-demo__card">
					<h4>Better Auth slot</h4>
					<p>
						Set <code>isAuthConfigured</code> + <code>authUser</code> to render sign-in / sign-out
						controls inline. Leave them off and the slot stays clean.
					</p>
				</div>
			</div>

			<details class="nav-demo__details">
				<summary>Demo categories used by this page</summary>
				<pre><code>{JSON.stringify(demoCategories, null, 2)}</code></pre>
			</details>
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
					<td><code>menuCategories</code></td>
					<td><code>MenuCategory[]</code></td>
					<td><code>[]</code></td>
					<td>Categorised navigation items (preferred).</td>
				</tr>
				<tr>
					<td><code>menuItems</code></td>
					<td><code>MenuItem[]</code></td>
					<td><code>[]</code></td>
					<td>Legacy flat list (kept for backwards compatibility).</td>
				</tr>
				<tr>
					<td><code>currentPageTitle</code></td>
					<td><code>string</code></td>
					<td><code>'Home'</code></td>
					<td>Title announced for the current route.</td>
				</tr>
				<tr>
					<td><code>logoIcon</code></td>
					<td><code>string</code></td>
					<td><code>'⚡'</code></td>
					<td>Emoji or single character shown beside the logo text.</td>
				</tr>
				<tr>
					<td><code>logoSrc</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Optional image source — when set, replaces the emoji with an <code>&lt;img&gt;</code>.</td>
				</tr>
				<tr>
					<td><code>logoAlt</code></td>
					<td><code>string</code></td>
					<td><code>logoText</code></td>
					<td>Alt text for <code>logoSrc</code>.</td>
				</tr>
				<tr>
					<td><code>logoText</code></td>
					<td><code>string</code></td>
					<td><code>'Svelte Templates'</code></td>
					<td>Wordmark beside the icon.</td>
				</tr>
				<tr>
					<td><code>logoHref</code></td>
					<td><code>string</code></td>
					<td><code>'/'</code></td>
					<td>Where the logo link points.</td>
				</tr>
				<tr>
					<td><code>isAuthConfigured</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Show Better Auth controls or the offline badge.</td>
				</tr>
				<tr>
					<td><code>authUser</code></td>
					<td><code>AuthUser | null</code></td>
					<td><code>null</code></td>
					<td>Currently signed-in user, when supplied by the root layout.</td>
				</tr>
				<tr>
					<td><code>githubUrl</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>When provided, renders a GitHub icon button on the right side.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.nav-demo {
		display: grid;
		gap: 20px;
	}
	.nav-demo__lede {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.nav-demo__lede em {
		font-style: italic;
		color: var(--fg-1);
	}
	.nav-demo__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
	}
	.nav-demo__card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 16px 18px;
	}
	.nav-demo__card h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.nav-demo__card p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.nav-demo__card code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
	.nav-demo__details {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 12px 16px;
	}
	.nav-demo__details summary {
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.nav-demo__details pre {
		margin: 12px 0 0;
		padding: 12px;
		background: var(--tfe-ink);
		color: var(--fg-on-dark, #f6f5f1);
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.5;
		border-radius: var(--r-2);
		overflow-x: auto;
	}
</style>
