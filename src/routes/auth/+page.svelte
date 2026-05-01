<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import AuthStatus from '$lib/components/AuthStatus.svelte';
	import { authClient } from '$lib/auth-client';

	let { data } = $props();

	const isConfigured = $derived(data.isConfigured ?? false);
	const authUser = $derived(data.authUser);
	const demoCredentials = $derived(data.demoCredentials);

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		await goto('/auth/sign-in');
	}
</script>

<svelte:head>
	<title>Authentication | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Better Auth integration for SvelteKit sign-in, sign-up, and protected routes"
	/>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">Authentication with Better Auth</h1>
		<p class="page-description">
			Email/password authentication backed by the project database, with protected routes and
			server-side session checks.
		</p>
		<AuthStatus {isConfigured} />
	</header>

	<section class="demo-section">
		<h2 class="section-title">Current Session</h2>

		{#if isConfigured}
			{#if authUser}
				<div class="state-card signed-in">
					<span class="state-icon">✅</span>
					<div class="state-info">
						<h3>Signed in</h3>
						<p>{authUser.name || authUser.email}</p>
					</div>
					<button type="button" class="button secondary" onclick={signOut}>Sign out</button>
				</div>
			{:else}
				<div class="state-card signed-out">
					<span class="state-icon">🔓</span>
					<div class="state-info">
						<h3>Not signed in</h3>
						<p>Use the Better Auth forms to start a session.</p>
					</div>
						<div class="actions">
							<a class="button" href="/auth/sign-in">Sign in</a>
							<a class="button secondary" href="/auth/sign-up">Sign up</a>
						</div>
					</div>
					{#if demoCredentials}
						<div class="state-card demo-account">
							<span class="state-icon">🔐</span>
							<div class="state-info">
								<h3>Public demo account</h3>
								<p>{demoCredentials.email} / {demoCredentials.password}</p>
							</div>
							<a class="button secondary" href="/auth/sign-in">Try demo</a>
						</div>
					{/if}
				{/if}
		{:else}
			<div class="state-card demo-mode">
				<span class="state-icon">🔓</span>
				<div class="state-info">
					<h3>Auth offline</h3>
					<p>Set <code>DATABASE_URL</code>, <code>BETTER_AUTH_SECRET</code>, and <code>BETTER_AUTH_URL</code> to enable Better Auth.</p>
				</div>
			</div>
		{/if}
	</section>

	<section class="demo-section">
		<h2 class="section-title">Protected Routes</h2>
		<div class="protected-routes-grid">
			<a href="/dashboard" class="route-card">
				<span class="route-icon">📊</span>
				<div class="route-info">
					<h3>Dashboard</h3>
					<p>Server-protected route using Better Auth session data.</p>
				</div>
				<span class="route-badge">Protected</span>
			</a>
			<a href="/profile" class="route-card">
				<span class="route-icon">👤</span>
				<div class="route-info">
					<h3>Profile</h3>
					<p>Authenticated account summary and session actions.</p>
				</div>
				<span class="route-badge">Protected</span>
			</a>
		</div>
	</section>

	<section class="demo-section">
		<h2 class="section-title">Implementation Notes</h2>
		<div class="guide-grid">
			<div class="guide-card">
				<h3>Server Hook</h3>
				<p><code>svelteKitHandler</code> handles Better Auth routes and the hook populates <code>event.locals.user</code>.</p>
			</div>
			<div class="guide-card">
				<h3>Database</h3>
				<p>Auth requires the same Postgres connection used by the component demos.</p>
			</div>
			<div class="guide-card">
				<h3>Cookies</h3>
				<p><code>sveltekitCookies</code> is configured so server actions/client calls set auth cookies correctly.</p>
			</div>
		</div>
	</section>
</div>

<style>
	.page-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #111827;
	}

	.page-description {
		font-size: 1.125rem;
		color: #4b5563;
		max-width: 720px;
		margin: 0 auto 1.5rem;
		line-height: 1.7;
	}

	.demo-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.section-title {
		font-size: 1.375rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #111827;
	}

	.state-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		border-radius: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.signed-in {
		background: #f0fdf4;
		border-color: #86efac;
	}

	.signed-out,
	.demo-mode,
	.demo-account {
		background: #f9fafb;
	}

	.state-icon,
	.route-icon {
		font-size: 1.75rem;
	}

	.state-info {
		flex: 1;
	}

	.state-info h3,
	.state-info p,
	.route-info h3,
	.route-info p {
		margin: 0;
	}

	.state-info p,
	.route-info p {
		color: #4b5563;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		background: #007aff;
		color: #ffffff;
		border: 1px solid #007aff;
		text-decoration: none;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.button.secondary {
		background: #ffffff;
		color: #374151;
		border-color: #d1d5db;
	}

	.protected-routes-grid,
	.guide-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.route-card,
	.guide-card {
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		background: #f9fafb;
	}

	.route-card {
		display: grid;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
	}

	.route-badge {
		justify-self: start;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #991b1b;
		font-size: 0.75rem;
		font-weight: 700;
	}

	code {
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: #f3f4f6;
	}

	@media (max-width: 640px) {
		.page-container {
			padding: 1rem;
		}

		.page-title {
			font-size: 2rem;
		}

		.demo-section {
			padding: 1rem;
		}

		.state-card {
			align-items: flex-start;
			flex-direction: column;
		}

		.actions,
		.button {
			width: 100%;
		}
	}

	@media (prefers-color-scheme: dark) {
		.page-title,
		.section-title,
		.state-info h3,
		.route-info h3,
		.guide-card h3 {
			color: #f8fafc;
		}

		.page-description,
		.state-info p,
		.route-info p,
		.guide-card p {
			color: #cbd5e1;
		}

		.demo-section,
		.route-card,
		.guide-card {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
		}

		.signed-out,
		.demo-mode,
		.demo-account {
			background: #0f172a;
		}

		.signed-in {
			background: rgba(22, 101, 52, 0.22);
			border-color: rgba(74, 222, 128, 0.45);
		}

		.button.secondary {
			background: #0f172a;
			color: #e2e8f0;
			border-color: #334155;
		}

		.route-badge {
			background: rgba(153, 27, 27, 0.32);
			color: #fecaca;
		}

		code {
			background: #1e293b;
			color: #bfdbfe;
		}
	}
</style>
