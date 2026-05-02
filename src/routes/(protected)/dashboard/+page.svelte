<script lang="ts">
	import StatCard from '$lib/components/StatCard.svelte';
	import AvatarStack from '$lib/components/AvatarStack.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';
	import AlertBanner from '$lib/components/AlertBanner.svelte';
	import KbdShortcut from '$lib/components/KbdShortcut.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { invalidateAll, goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data } = $props();

	const user = $derived(data.authUser);
	const displayName = $derived(user?.name || user?.email || 'User');
	const isDemoUser = $derived(data.isDemoUser ?? false);

	// Fake "last sign in" — formatted on the client so SSR + CSR agree.
	const lastSignIn = 'Today at 09:42';

	let signingOut = $state(false);

	async function handleSignOut() {
		signingOut = true;
		try {
			await authClient.signOut();
			await invalidateAll();
			await goto('/auth/sign-in');
		} finally {
			signingOut = false;
		}
	}

	// Fabricated activity feed — purely illustrative. In a real app these would
	// come from a `recent_events` table or an audit log API. We compute via
	// $derived so the entries that reference displayName stay in sync if the
	// session refreshes mid-page.
	const activity = $derived([
		{
			id: 'a1',
			actor: { name: displayName },
			tone: 'success' as const,
			label: 'Signed in',
			detail: 'Authenticated with email + password',
			time: '2 minutes ago'
		},
		{
			id: 'a2',
			actor: { name: 'Ada Lovelace' },
			tone: 'info' as const,
			label: 'Invited',
			detail: 'Invited you to the "Templates" workspace',
			time: '3 hours ago'
		},
		{
			id: 'a3',
			actor: { name: 'Grace Hopper' },
			tone: 'brand' as const,
			label: 'Commented',
			detail: 'Replied to your draft on Editor.svelte',
			time: 'Yesterday, 17:04'
		},
		{
			id: 'a4',
			actor: { name: displayName },
			tone: 'warning' as const,
			label: 'Failed write',
			detail: 'Demo account blocked from POST /editor/api',
			time: 'Yesterday, 12:18'
		},
		{
			id: 'a5',
			actor: { name: 'Margaret Hamilton' },
			tone: 'neutral' as const,
			label: 'Updated',
			detail: 'Bumped Better Auth to latest minor',
			time: '2 days ago'
		}
	]);

	const teammates = [
		{ name: 'Ada Lovelace' },
		{ name: 'Grace Hopper' },
		{ name: 'Margaret Hamilton' },
		{ name: 'Katherine Johnson' },
		{ name: 'Hedy Lamarr' },
		{ name: 'Joan Clarke' }
	];
</script>

<svelte:head>
	<title>Dashboard | TFE Svelte Templates</title>
	<meta name="description" content="Your protected dashboard" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div class="header-top">
			<div>
				<h1 class="page-title">Dashboard</h1>
				<p class="page-description">
					A protected route gated by Better Auth on the server before the page renders.
				</p>
			</div>
			<div class="badge-row">
				<BadgePill label="Protected" tone="danger" variant="soft" dot />
				{#if isDemoUser}
					<BadgePill label="Read-only demo" tone="info" variant="soft" />
				{/if}
			</div>
		</div>
	</header>

	<!-- Welcome strip — greets the user with role + last sign-in context. -->
	<section class="dashboard-section">
		<div class="welcome-card">
			<div class="avatar" aria-hidden="true">{displayName[0]}</div>
			<div class="welcome-content">
				<h2>Welcome back, {displayName}</h2>
				<div class="meta-row">
					{#if user?.email}
						<span class="meta-item">{user.email}</span>
					{/if}
					<span class="meta-sep" aria-hidden="true">·</span>
					<span class="meta-item">Last sign-in: {lastSignIn}</span>
				</div>
			</div>
			<div class="welcome-aside">
				<BadgePill
					label={isDemoUser ? 'Demo user' : 'Member'}
					tone={isDemoUser ? 'info' : 'success'}
					variant="solid"
					size="sm"
				/>
			</div>
		</div>
	</section>

	<!-- 4 stat cards — fabricated metrics demonstrating StatCard's tone + trend props. -->
	<section class="dashboard-section">
		<h2 class="section-title">At a glance</h2>
		<div class="stats-grid">
			<StatCard
				title="API calls today"
				value="12,438"
				delta={8.2}
				deltaSuffix="%"
				deltaLabel="vs yesterday"
			/>
			<StatCard
				title="Open issues"
				value={3}
				delta={-2}
				deltaLabel="vs last week"
				positiveDirection="down"
			/>
			<StatCard
				title="Team size"
				value={teammates.length + 1}
				delta={1}
				deltaLabel="this month"
			/>
			<StatCard
				title="Storage used"
				value="2.4 GB"
				delta={3.1}
				deltaSuffix="%"
				deltaLabel="of 10 GB plan"
			/>
		</div>
	</section>

	<!-- Two-column row: activity feed + team overview. -->
	<section class="dashboard-section split-row">
		<article class="panel">
			<header class="panel-header">
				<h2 class="section-title">Recent activity</h2>
				<BadgePill label="Live" tone="success" variant="soft" dot size="sm" />
			</header>
			<ul class="activity-feed">
				{#each activity as event (event.id)}
					<li class="activity-item">
						<div class="activity-icon" aria-hidden="true">
							{event.actor.name[0]}
						</div>
						<div class="activity-body">
							<div class="activity-line">
								<strong>{event.actor.name}</strong>
								<BadgePill label={event.label} tone={event.tone} variant="soft" size="sm" />
							</div>
							<p class="activity-detail">{event.detail}</p>
							<time class="activity-time">{event.time}</time>
						</div>
					</li>
				{/each}
			</ul>
		</article>

		<article class="panel">
			<header class="panel-header">
				<h2 class="section-title">Your team</h2>
				<BadgePill
					label={`${teammates.length + 1} members`}
					tone="neutral"
					variant="outline"
					size="sm"
				/>
			</header>
			<div class="team-stack">
				<AvatarStack
					people={[{ name: displayName }, ...teammates]}
					max={5}
					size={44}
				/>
			</div>
			<p class="panel-note">
				Click any avatar to see member details. The "+N" tile shows everyone who didn't fit.
			</p>
			<div class="shortcut-row">
				<span>Open command palette</span>
				<KbdShortcut keys={['Cmd', 'K']} size="sm" />
			</div>
		</article>
	</section>

	<!-- Quick-action button cards — common destinations for an authed user. -->
	<section class="dashboard-section">
		<h2 class="section-title">Quick actions</h2>
		<div class="actions-grid">
			<a href="/profile" class="action-card">
				<span class="action-icon" aria-hidden="true">👤</span>
				<div class="action-info">
					<h3>Account settings</h3>
					<p>Edit your name, manage sessions, change password.</p>
				</div>
			</a>
			<a href="/auth" class="action-card">
				<span class="action-icon" aria-hidden="true">🔐</span>
				<div class="action-info">
					<h3>Auth overview</h3>
					<p>See every Better Auth component in one place.</p>
				</div>
			</a>
			<a href="/" class="action-card">
				<span class="action-icon" aria-hidden="true">🧩</span>
				<div class="action-info">
					<h3>Component catalogue</h3>
					<p>Browse all gold-standard templates.</p>
				</div>
			</a>
			<button
				type="button"
				class="action-card action-card-button"
				onclick={handleSignOut}
				disabled={signingOut}
			>
				<span class="action-icon" aria-hidden="true">
					{#if signingOut}
						<Spinner size="sm" />
					{:else}
						🚪
					{/if}
				</span>
				<div class="action-info">
					<h3>{signingOut ? 'Signing out…' : 'Sign out'}</h3>
					<p>End this session and return to the sign-in page.</p>
				</div>
			</button>
		</div>
	</section>

	<!-- Demo-mode notice — explains the read-only behaviour for the public demo user. -->
	{#if isDemoUser}
		<section class="dashboard-section">
			<AlertBanner
				variant="info"
				title="You're signed in as the public demo user"
				message="Reads work everywhere. POST/PUT/DELETE requests to protected APIs will return 403 — that's enforced by requireAuthAPI in $lib/server/auth.ts."
			>
				<a href="/auth">Read the auth integration notes →</a>
			</AlertBanner>
		</section>
	{/if}

	<!-- "How this works" — the original explainer, expanded to show the full integration surface. -->
	<section class="dashboard-section">
		<article class="info-card">
			<h3>How this protected route works</h3>
			<p>
				The <code>(protected)</code> route group calls <code>requireAuth(event)</code> in
				<code>+layout.server.ts</code>. Unauthenticated requests get a 303 redirect to
				<code>/auth/sign-in</code> with the original URL preserved as <code>?redirect_url</code>.
			</p>
			<ul class="info-list">
				<li>
					<strong>Server gate:</strong>
					<code>requireAuth</code> in <code>$lib/server/auth.ts</code> reads
					<code>event.locals.user</code> populated by Better Auth's hook.
				</li>
				<li>
					<strong>API gate:</strong>
					<code>requireAuthAPI</code> returns 401 for anonymous requests, and 403 when the public
					demo user (<code>PUBLIC_DEMO_AUTH=true</code> + matching email) tries to write.
				</li>
				<li>
					<strong>Demo seed:</strong>
					Run <code>bun run seed:demo-user</code> to create the read-only account against your
					Neon database.
				</li>
				<li>
					<strong>Client session:</strong>
					Use <code>authClient.useSession()</code> from <code>$lib/auth-client</code> for reactive
					auth state in client components.
				</li>
			</ul>
		</article>
	</section>
</div>

<style>
	.page-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.header-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.page-description {
		font-size: 1.0625rem;
		color: #4b5563;
		margin: 0;
	}

	.badge-row {
		display: inline-flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		flex-shrink: 0;
		padding-top: 0.25rem;
	}

	.dashboard-section {
		margin-bottom: 2rem;
	}

	.welcome-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border-radius: 9999px;
		background: #111827;
		color: #ffffff;
		font-weight: 800;
		font-size: 1.25rem;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.welcome-content {
		flex: 1;
		min-width: 0;
	}

	.welcome-content h2 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		color: #111827;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.meta-sep {
		color: #cbd5e1;
	}

	.welcome-aside {
		flex-shrink: 0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #111827;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.split-row {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 1.25rem;
	}

	.panel {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.panel-header .section-title {
		margin: 0;
	}

	.activity-feed {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.activity-item {
		display: flex;
		gap: 0.875rem;
		align-items: flex-start;
	}

	.activity-icon {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 9999px;
		background: #e2e8f0;
		color: #0f172a;
		font-weight: 700;
		font-size: 0.875rem;
		flex-shrink: 0;
		text-transform: uppercase;
	}

	.activity-body {
		flex: 1;
		min-width: 0;
	}

	.activity-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 0.125rem;
	}

	.activity-line strong {
		color: #111827;
	}

	.activity-detail {
		margin: 0;
		color: #4b5563;
		font-size: 0.9375rem;
	}

	.activity-time {
		display: block;
		margin-top: 0.125rem;
		font-size: 0.8125rem;
		color: #94a3b8;
	}

	.team-stack {
		padding: 0.5rem 0 1rem;
	}

	.panel-note {
		margin: 0 0 1rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding-top: 0.875rem;
		border-top: 1px solid #e5e7eb;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		gap: 1rem;
		padding: 1.25rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
		color: inherit;
		text-decoration: none;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
	}

	.action-card:hover {
		transform: translateY(-1px);
		border-color: #cbd5e1;
		box-shadow: 0 4px 8px rgba(15, 23, 42, 0.06);
	}

	.action-card-button {
		font: inherit;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.action-card-button:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.action-icon {
		font-size: 1.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
	}

	.action-info h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		color: #111827;
	}

	.action-info p {
		margin: 0;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.info-card {
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.info-card h3 {
		margin: 0 0 0.75rem;
		font-size: 1.0625rem;
		color: #111827;
	}

	.info-card p {
		margin: 0 0 0.75rem;
		color: #4b5563;
	}

	.info-list {
		margin: 0;
		padding-left: 1.25rem;
		color: #4b5563;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-list strong {
		color: #111827;
	}

	code {
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: #f3f4f6;
		font-size: 0.875em;
		color: #0f172a;
	}

	@media (max-width: 860px) {
		.split-row {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.page-container {
			padding: 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.welcome-card {
			align-items: flex-start;
			flex-direction: column;
		}
	}

	@media (prefers-color-scheme: dark) {
		.page-title,
		.section-title,
		.welcome-content h2,
		.action-info h3,
		.info-card h3,
		.activity-line strong,
		.info-list strong {
			color: #f8fafc;
		}

		.page-description,
		.action-info p,
		.info-card p,
		.info-list,
		.meta-row,
		.activity-detail,
		.panel-note,
		.shortcut-row {
			color: #cbd5e1;
		}

		.welcome-card {
			background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
			border-color: #334155;
		}

		.panel,
		.action-card,
		.info-card {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
		}

		.action-card:hover {
			border-color: #475569;
		}

		.avatar {
			background: #e2e8f0;
			color: #0f172a;
		}

		.activity-icon {
			background: #1e293b;
			color: #e2e8f0;
		}

		.shortcut-row {
			border-top-color: #334155;
		}

		.meta-sep {
			color: #475569;
		}

		.activity-time {
			color: #64748b;
		}

		code {
			background: #1e293b;
			color: #bfdbfe;
		}
	}
</style>
