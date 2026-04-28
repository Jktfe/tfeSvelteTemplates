<script lang="ts">
	import Tabs from '$lib/components/Tabs.svelte';

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

	const liveTabs = [
		{ id: 't1', label: 'Tab 1' },
		{ id: 't2', label: 'Tab 2' },
		{ id: 't3', label: 'Tab 3' }
	];
	let liveActive = $state('t1');
</script>

<div class="page">
	<header class="page-header">
		<h1>Tabs</h1>
		<p class="lede">
			Classic tabbed content switcher with full WAI-ARIA tablist semantics, roving tabindex,
			two visual variants, and full keyboard navigation (←/→, Home/End, Enter to activate).
		</p>
	</header>

	<section class="demo">
		<h2>Underline (default)</h2>
		<p class="hint">Animated underline under the active tab — the most common desktop pattern.</p>
		<div class="card">
			<Tabs tabs={settingsTabs} bind:active={settingsActive} ariaLabel="Settings sections">
				{#snippet panel(id)}
					{#if id === 'account'}
						<h3>Account settings</h3>
						<p>Manage your username, email and avatar.</p>
					{:else if id === 'notifications'}
						<h3>Notification preferences</h3>
						<p>Choose which alerts you want to receive and how.</p>
					{:else if id === 'privacy'}
						<h3>Privacy controls</h3>
						<p>Decide what's visible to other users and to search engines.</p>
					{:else if id === 'billing'}
						<h3>Billing &amp; plan</h3>
						<p>View invoices, update card details, change plan.</p>
					{/if}
				{/snippet}
			</Tabs>
		</div>
	</section>

	<section class="demo">
		<h2>Pill variant</h2>
		<p class="hint">Rounded pills on a tray — works well as a filter UI.</p>
		<div class="card">
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
							<li>#391 — Memory leak in poll loop (closed)</li>
							<li>#387 — A11y: missing landmarks (closed)</li>
							<li>#382 — 404 on /press/v2 redirect (closed)</li>
						</ul>
					{/if}
				{/snippet}
			</Tabs>
		</div>
	</section>

	<section class="demo">
		<h2>Vertical orientation</h2>
		<p class="hint">For docs sidebars and side-rail navigation. Up/Down arrow keys move between tabs.</p>
		<div class="card">
			<Tabs
				tabs={docsTabs}
				bind:active={docsActive}
				orientation="vertical"
				ariaLabel="Docs sections"
			>
				{#snippet panel(id)}
					{#if id === 'getting-started'}
						<h3>Getting started</h3>
						<p>Install via <code>bun add @tfe/svelte</code>, import the components you need, and ship.</p>
					{:else if id === 'components'}
						<h3>Components</h3>
						<p>Browse the catalogue at <code>/</code> — every component has a live demo.</p>
					{:else if id === 'theming'}
						<h3>Theming</h3>
						<p>Override the CSS custom properties on <code>:root</code> to retheme the lot.</p>
					{:else if id === 'api'}
						<h3>API reference</h3>
						<p>Full prop tables and slot signatures live alongside each component's <code>.md</code>.</p>
					{/if}
				{/snippet}
			</Tabs>
		</div>
	</section>

	<section class="demo">
		<h2>With icons + disabled state</h2>
		<p class="hint">Icons + labels; disabled tabs are skipped by both click and keyboard nav.</p>
		<div class="card">
			<Tabs tabs={iconTabs} bind:active={iconActive} variant="pill" ariaLabel="Workspace">
				{#snippet panel(id)}
					{#if id === 'home'}
						<p>👋 Welcome back. You have 3 unread messages and 1 task due today.</p>
					{:else if id === 'analytics'}
						<p>📈 Last 7 days: 12.4k pageviews (+8.2% week-on-week).</p>
					{:else if id === 'team'}
						<p>👥 8 members online. Last sync: 2 minutes ago.</p>
					{/if}
				{/snippet}
			</Tabs>
		</div>
	</section>

	<section class="demo">
		<h2>Live two-way binding</h2>
		<p class="hint">External state updates the tabs and vice versa via <code>bind:active</code>.</p>
		<div class="card">
			<div class="external-controls">
				<span class="external-label">External: <code>{liveActive}</code></span>
				<button onclick={() => (liveActive = 't1')}>Set t1</button>
				<button onclick={() => (liveActive = 't2')}>Set t2</button>
				<button onclick={() => (liveActive = 't3')}>Set t3</button>
			</div>
			<Tabs tabs={liveTabs} bind:active={liveActive} ariaLabel="Live demo">
				{#snippet panel(id)}
					<p>Panel for <strong>{id}</strong>. Click a tab or use the buttons above — both
						update the same bound state.</p>
				{/snippet}
			</Tabs>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: #0f172a;
	}

	.page-header h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}
	.lede {
		margin: 0 0 2rem;
		color: #475569;
		line-height: 1.6;
	}

	.demo {
		margin: 0 0 2.5rem;
	}
	.demo h2 {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}
	.hint {
		margin: 0 0 0.875rem;
		color: #64748b;
		font-size: 0.875rem;
	}
	.hint code,
	.demo code {
		background: #f1f5f9;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8125rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.card h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}
	.card p {
		margin: 0;
		color: #475569;
		line-height: 1.6;
	}

	.bug-list {
		margin: 0;
		padding: 0 0 0 1.125rem;
		color: #475569;
		font-size: 0.9375rem;
		line-height: 1.7;
	}
	.bug-list.muted {
		color: #94a3b8;
		text-decoration: line-through;
	}

	.external-controls {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-wrap: wrap;
		margin-bottom: 0.875rem;
		padding-bottom: 0.875rem;
		border-bottom: 1px dashed #e2e8f0;
	}
	.external-label {
		font-size: 0.875rem;
		color: #475569;
		margin-right: 0.5rem;
	}
	.external-controls button {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1px solid #e2e8f0;
		background: #fff;
		border-radius: 0.375rem;
		cursor: pointer;
	}
	.external-controls button:hover {
		background: #f8fafc;
	}
</style>
