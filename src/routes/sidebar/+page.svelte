<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Sidebar from '$lib/components/Sidebar.svelte';

	const shell = catalogShellPropsForSlug('/sidebar')!;

	const items = [
		{ label: 'Dashboard', href: '/dashboard', icon: '▤' },
		{ label: 'Reports', href: '/reports', icon: '📊' },
		{ label: 'Customers', href: '/customers', icon: '👥' },
		{
			label: 'Settings',
			icon: '⚙️',
			children: [
				{ label: 'Profile', href: '/settings/profile', icon: '🙂' },
				{ label: 'Billing', href: '/settings/billing', icon: '💳' },
				{ label: 'Security', href: '/settings/security', icon: '🔒' }
			]
		},
		{ label: 'Help', href: '/help', icon: '❓' }
	];

	// Each demo instance gets its own collapsed state + storage key.
	let expandedCollapsed = $state(false);
	let preCollapsed = $state(true);

	const codeExplanation =
		'Sidebar is the left rail of an app shell. On the desktop it toggles between a labelled expanded state and an icon-only collapsed state (with hover tooltips), persisting the choice to localStorage. Nested groups expand inline and the active route is highlighted with aria-current="page". Below 640px it becomes an off-canvas drawer: a hamburger opens it, a backdrop or Escape closes it, and focus is trapped while open then restored to the trigger. It uses position:absolute so it stays inside its positioned wrapper rather than the viewport.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-deps', 'Navigation']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="sb-demo-section">
			<h3>Expanded rail with an active item</h3>
			<p class="sb-demo-hint">
				Full labels and icons. The collapse chevron in the header shrinks it to icon-only — try it.
			</p>
			<div class="sb-stage">
				<Sidebar
					{items}
					activeHref="/reports"
					title="Acme"
					bind:collapsed={expandedCollapsed}
					storageKey="tfe-sidebar-demo-a"
					ariaLabel="Demo navigation A"
				/>
				<div class="sb-stage-content">
					<p>App content sits beside the rail. Collapsed: <code>{expandedCollapsed}</code></p>
				</div>
			</div>
		</section>

		<section class="sb-demo-section">
			<h3>Starts collapsed — icon-only with tooltips</h3>
			<p class="sb-demo-hint">
				Hover or keyboard-focus an icon to reveal its label. Expand it from the header chevron.
			</p>
			<div class="sb-stage">
				<Sidebar
					{items}
					activeHref="/customers"
					title="Acme"
					bind:collapsed={preCollapsed}
					storageKey="tfe-sidebar-demo-b"
					ariaLabel="Demo navigation B"
				/>
				<div class="sb-stage-content">
					<p>The active item keeps its accent bar even when collapsed.</p>
				</div>
			</div>
		</section>

		<section class="sb-demo-section">
			<h3>Mobile drawer mode</h3>
			<p class="sb-demo-hint">
				Narrow this stage (it emulates a phone width) — the rail hides behind a hamburger and opens
				as an off-canvas drawer with a backdrop. Escape or a backdrop tap closes it.
			</p>
			<div class="sb-stage sb-stage--phone">
				<Sidebar
					{items}
					activeHref="/settings/billing"
					title="Acme"
					storageKey=""
					ariaLabel="Demo navigation C"
				/>
				<div class="sb-stage-content">
					<p>Tap the hamburger (top-left) to slide the drawer in.</p>
				</div>
			</div>
		</section>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>items</code></td>
					<td><code>SidebarItem[]</code></td>
					<td><code>[]</code></td>
					<td>Navigation tree; each item is <code>{'{ label, href?, icon?, children? }'}</code>.</td>
				</tr>
				<tr>
					<td><code>activeHref</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>href of the current page — drives the highlight and <code>aria-current</code>.</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td><code>'Menu'</code></td>
					<td>Heading at the top of the rail; hidden when collapsed.</td>
				</tr>
				<tr>
					<td><code>collapsed</code></td>
					<td><code>boolean</code> (bindable)</td>
					<td><code>false</code></td>
					<td>Icon-only mode; overridden on mount by any stored preference.</td>
				</tr>
				<tr>
					<td><code>storageKey</code></td>
					<td><code>string</code></td>
					<td><code>'tfe-sidebar-collapsed'</code></td>
					<td>localStorage key for persistence; empty string disables it.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Main navigation'</code></td>
					<td>Accessible name for the nav landmark and drawer dialog.</td>
				</tr>
				<tr>
					<td><code>mobileOpen</code></td>
					<td><code>boolean</code> (bindable)</td>
					<td><code>false</code></td>
					<td>True while the mobile drawer is open.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sb-demo-section {
		margin-bottom: 2.5rem;
	}
	.sb-demo-hint {
		color: var(--cp-muted, #6b7280);
		font-size: 0.9rem;
		margin: 0.25rem 0 0.9rem;
	}
	/* Containing-block stage: position:relative + contain so the rail's
	   absolute mobile drawer + tooltips resolve to the stage, not the page. */
	.sb-stage {
		position: relative;
		contain: layout paint;
		transform: translateZ(0);
		display: flex;
		height: 340px;
		border: 1px solid var(--cp-border, #e6e8ec);
		border-radius: 12px;
		overflow: hidden;
		background: var(--cp-surface, #fafbfc);
	}
	.sb-stage--phone {
		max-width: 380px;
	}
	.sb-stage-content {
		flex: 1;
		padding: 1.25rem;
		font-size: 0.9rem;
		color: var(--cp-muted, #6b7280);
	}
	.sb-stage-content code {
		font-size: 0.85em;
	}
	@media (prefers-color-scheme: dark) {
		.sb-stage {
			--cp-border: #262a33;
			--cp-surface: #0f1117;
			--cp-muted: #98a2b3;
		}
	}
</style>
