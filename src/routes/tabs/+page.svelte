<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Tabs from '$lib/components/Tabs.svelte';

	const shell = catalogShellPropsForSlug('/tabs')!;

	const settingsTabs = [
		{ id: 'account', label: 'Account' },
		{ id: 'notifications', label: 'Notifications' },
		{ id: 'privacy', label: 'Privacy' },
		{ id: 'billing', label: 'Billing' }
	];
	let settingsActive = $state('account');

	const bugTabs = [
		{ id: 'open', label: 'Open' },
		{ id: 'in-progress', label: 'In progress' },
		{ id: 'closed', label: 'Closed' }
	];
	let bugActive = $state('open');

	const docsTabs = [
		{ id: 'getting-started', label: 'Getting started' },
		{ id: 'components', label: 'Components' },
		{ id: 'theming', label: 'Theming' },
		{ id: 'api', label: 'API reference' }
	];
	let docsActive = $state('getting-started');

	const iconTabs = [
		{ id: 'home', label: 'Home', icon: '🏠' },
		{ id: 'analytics', label: 'Analytics', icon: '📊' },
		{ id: 'team', label: 'Team', icon: '👥' },
		{ id: 'soon', label: 'Coming soon', icon: '🔒', disabled: true }
	];
	let iconActive = $state('home');

	// Sidebar-style nav: vertical orientation + pill variant. Useful for
	// settings or admin shells where the rail lives next to the content.
	const sidebarTabs = [
		{ id: 'profile', label: 'Profile', icon: '👤' },
		{ id: 'security', label: 'Security', icon: '🔐' },
		{ id: 'integrations', label: 'Integrations', icon: '🔌' },
		{ id: 'archived', label: 'Archived', icon: '📦', disabled: true }
	];
	let sidebarActive = $state('profile');

	// Plan tabs with a single disabled option to show the keyboard handler skipping
	// it during arrow navigation.
	const planTabs = [
		{ id: 'free', label: 'Free' },
		{ id: 'pro', label: 'Pro' },
		{ id: 'team', label: 'Team' },
		{ id: 'enterprise', label: 'Enterprise', disabled: true }
	];
	let planActive = $state('free');

	const codeExplanation =
		'Tabs implements the WAI-ARIA tablist pattern: each trigger is a button with role="tab", the panels carry role="tabpanel", and a roving tabindex keeps only the active trigger reachable by Tab. Arrow keys (←/→ or ↑/↓ depending on orientation) move between tabs, Home/End jump to the ends, and Enter activates. Disabled tabs are skipped automatically by the keyboard handler.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Keyboard', 'WAI-ARIA', 'Disclosure']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="tabs-demo">
			<section>
				<h3>Underline (default)</h3>
				<div class="frame">
					<Tabs tabs={settingsTabs} bind:active={settingsActive} ariaLabel="Settings sections">
						{#snippet panel(id)}
							{#if id === 'account'}
								<h4>Account settings</h4>
								<p>Manage your username, email and avatar.</p>
							{:else if id === 'notifications'}
								<h4>Notification preferences</h4>
								<p>Choose which alerts you want to receive and how.</p>
							{:else if id === 'privacy'}
								<h4>Privacy controls</h4>
								<p>Decide what's visible to other users and to search engines.</p>
							{:else if id === 'billing'}
								<h4>Billing &amp; plan</h4>
								<p>View invoices, update card details, change plan.</p>
							{/if}
						{/snippet}
					</Tabs>
				</div>
			</section>

			<section>
				<h3>Pill variant</h3>
				<div class="frame">
					<Tabs tabs={bugTabs} bind:active={bugActive} variant="pill" ariaLabel="Bug status">
						{#snippet panel(id)}
							{#if id === 'open'}
								<ul class="bug-list">
									<li>#421 — Login form rejects valid emails</li>
									<li>#418 — Sidebar collapses on iOS Safari</li>
									<li>#412 — Slow query on /admin/users</li>
								</ul>
							{:else if id === 'in-progress'}
								<ul class="bug-list">
									<li>#403 — Drag-drop reorder broken in Firefox</li>
									<li>#399 — Notification badge shows wrong count</li>
								</ul>
							{:else}
								<ul class="bug-list muted">
									<li>#391 — Memory leak in poll loop</li>
									<li>#387 — A11y: missing landmarks</li>
								</ul>
							{/if}
						{/snippet}
					</Tabs>
				</div>
			</section>

			<section>
				<h3>Vertical orientation</h3>
				<div class="frame">
					<Tabs
						tabs={docsTabs}
						bind:active={docsActive}
						orientation="vertical"
						ariaLabel="Docs sections"
					>
						{#snippet panel(id)}
							{#if id === 'getting-started'}
								<h4>Getting started</h4>
								<p>Install via <code>bun add @tfe/svelte</code>, import what you need, ship.</p>
							{:else if id === 'components'}
								<h4>Components</h4>
								<p>Browse the catalogue at <code>/</code> — every component has a live demo.</p>
							{:else if id === 'theming'}
								<h4>Theming</h4>
								<p>Override the CSS custom properties on <code>:root</code> to retheme.</p>
							{:else if id === 'api'}
								<h4>API reference</h4>
								<p>Full prop tables live alongside each component's <code>.md</code>.</p>
							{/if}
						{/snippet}
					</Tabs>
				</div>
			</section>

			<section>
				<h3>Icons + disabled state</h3>
				<div class="frame">
					<Tabs tabs={iconTabs} bind:active={iconActive} variant="pill" ariaLabel="Workspace">
						{#snippet panel(id)}
							{#if id === 'home'}
								<p>👋 Welcome back. You have 3 unread messages.</p>
							{:else if id === 'analytics'}
								<p>📈 Last 7 days: 12.4k pageviews (+8.2% week-on-week).</p>
							{:else if id === 'team'}
								<p>👥 8 members online. Last sync: 2 minutes ago.</p>
							{/if}
						{/snippet}
					</Tabs>
				</div>
			</section>

			<section>
				<h3>Vertical pill · sidebar nav</h3>
				<p class="hint">Combine <code>orientation=&quot;vertical&quot;</code> with <code>variant=&quot;pill&quot;</code> for a settings-style rail. Arrow keys move ↑/↓; the disabled item is skipped automatically.</p>
				<div class="frame">
					<Tabs
						tabs={sidebarTabs}
						bind:active={sidebarActive}
						orientation="vertical"
						variant="pill"
						ariaLabel="Account settings"
					>
						{#snippet panel(id)}
							{#if id === 'profile'}
								<h4>Profile</h4>
								<p>Avatar, display name, public bio. Public to everyone in your workspace.</p>
							{:else if id === 'security'}
								<h4>Security</h4>
								<p>Two-factor authentication, recovery codes, active sessions.</p>
							{:else if id === 'integrations'}
								<h4>Integrations</h4>
								<p>GitHub, Slack, Linear and 24 other connectors. Manage scopes here.</p>
							{/if}
						{/snippet}
					</Tabs>
				</div>
			</section>

			<section>
				<h3>Disabled tab item</h3>
				<p class="hint">
					Active tab: <strong>{planActive}</strong>. Try arrow-keying onto the Enterprise tab — the keyboard handler will jump over it because <code>disabled: true</code> removes it from the rotation.
				</p>
				<div class="frame">
					<Tabs tabs={planTabs} bind:active={planActive} variant="pill" ariaLabel="Plan tier">
						{#snippet panel(id)}
							{#if id === 'free'}
								<h4>Free</h4>
								<p>Up to 3 projects, 5 GB storage. Community support.</p>
							{:else if id === 'pro'}
								<h4>Pro</h4>
								<p>Unlimited projects, 100 GB storage. Email support.</p>
							{:else if id === 'team'}
								<h4>Team</h4>
								<p>Roles, audit log, SSO. Priority support.</p>
							{/if}
						{/snippet}
					</Tabs>
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
					<td><code>tabs</code></td>
					<td><code>TabItem[]</code></td>
					<td>—</td>
					<td>Required. Each item: <code>id</code>, <code>label</code>, optional <code>icon</code> + <code>disabled</code>.</td>
				</tr>
				<tr>
					<td><code>active</code></td>
					<td><code>string</code></td>
					<td>First tab's id</td>
					<td>Bindable id of the active tab.</td>
				</tr>
				<tr>
					<td><code>orientation</code></td>
					<td><code>'horizontal' | 'vertical'</code></td>
					<td><code>'horizontal'</code></td>
					<td>Layout direction; arrow-key axis follows.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'underline' | 'pill'</code></td>
					<td><code>'underline'</code></td>
					<td>Visual treatment for the active indicator.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Tabs'</code></td>
					<td>Tablist label for assistive tech.</td>
				</tr>
				<tr>
					<td><code>panel</code></td>
					<td><code>Snippet&lt;[string]&gt;</code></td>
					<td>—</td>
					<td>Snippet receiving the active tab id; render the matching panel content.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tabs-demo {
		display: grid;
		gap: 2rem;
	}

	.tabs-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.frame {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.frame h4 {
		margin: 0 0 0.4rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--fg-1);
	}

	.frame p {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.55;
	}

	.frame code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.bug-list {
		margin: 0;
		padding: 0 0 0 1.125rem;
		color: var(--fg-2);
		font-size: 0.9rem;
		line-height: 1.7;
	}

	.bug-list.muted {
		text-decoration: line-through;
		opacity: 0.7;
	}

	.hint {
		margin: 0 0 0.6rem;
		font-size: 0.85rem;
		color: var(--fg-2);
	}

	.hint code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
