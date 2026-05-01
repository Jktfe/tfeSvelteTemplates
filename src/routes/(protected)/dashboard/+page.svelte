<script lang="ts">
	let { data } = $props();

	const user = $derived(data.authUser);
	const displayName = $derived(user?.name || user?.email || 'User');
	const isDemoUser = $derived(data.isDemoUser ?? false);
</script>

<svelte:head>
	<title>Dashboard | TFE Svelte Templates</title>
	<meta name="description" content="Your protected dashboard" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">Dashboard</h1>
		<p class="page-description">
			This route is protected by Better Auth on the server before the page renders.
		</p>
			<div class="protected-badge">
				<span class="badge-icon">🔒</span>
				<span>Protected Route</span>
			</div>
			{#if isDemoUser}
				<div class="demo-badge">
					<span class="badge-icon">🔐</span>
					<span>Read-only Demo</span>
				</div>
			{/if}
		</header>

	<section class="dashboard-section">
		<div class="welcome-card">
			<div class="avatar" aria-hidden="true">{displayName[0]}</div>
			<div class="welcome-content">
				<h2>Welcome back, {displayName}</h2>
				{#if user?.email}
					<p>{user.email}</p>
				{/if}
			</div>
		</div>
	</section>

	<section class="dashboard-section">
		<h2 class="section-title">Quick Actions</h2>
		<div class="actions-grid">
			<a href="/profile" class="action-card">
				<span class="action-icon">👤</span>
				<div class="action-info">
					<h3>Your Profile</h3>
					<p>View account details and session actions.</p>
				</div>
			</a>
			<a href="/auth" class="action-card">
				<span class="action-icon">🔐</span>
				<div class="action-info">
					<h3>Auth Overview</h3>
					<p>Review the Better Auth integration.</p>
				</div>
			</a>
			<a href="/" class="action-card">
				<span class="action-icon">🏠</span>
				<div class="action-info">
					<h3>Home</h3>
					<p>Return to the component catalogue.</p>
				</div>
			</a>
		</div>
	</section>

	<section class="dashboard-section">
		<div class="info-card">
			<h3>How This Works</h3>
			<p>
				The <code>(protected)</code> route group calls <code>requireAuth(event)</code> in
				<code>+layout.server.ts</code>. Unauthenticated requests redirect to
				<code>/auth/sign-in</code> with a return URL.
			</p>
		</div>
	</section>
</div>

<style>
	.page-container {
		max-width: 1000px;
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
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.page-description {
		font-size: 1.125rem;
		color: #4b5563;
		margin: 0 0 1rem;
	}

		.protected-badge {
			display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 9999px;
		font-size: 0.875rem;
			font-weight: 700;
		}

		.demo-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			margin-left: 0.5rem;
			padding: 0.5rem 1rem;
			background: #dbeafe;
			color: #1e40af;
			border-radius: 9999px;
			font-size: 0.875rem;
			font-weight: 700;
		}

	.dashboard-section {
		margin-bottom: 2rem;
	}

	.welcome-card,
	.info-card,
	.action-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.welcome-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
		background: #111827;
		color: #ffffff;
		font-weight: 800;
		text-transform: uppercase;
	}

	.welcome-content h2,
	.welcome-content p,
	.action-info h3,
	.action-info p {
		margin: 0;
	}

	.welcome-content p,
	.action-info p,
	.info-card p {
		color: #4b5563;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #111827;
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
		color: inherit;
		text-decoration: none;
	}

	.action-icon {
		font-size: 1.5rem;
	}

	.info-card {
		padding: 1.5rem;
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
		.info-card h3 {
			color: #f8fafc;
		}

		.page-description,
		.welcome-content p,
		.action-info p,
		.info-card p {
			color: #cbd5e1;
		}

		.welcome-card,
		.info-card,
		.action-card {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
		}

		.avatar {
			background: #e2e8f0;
			color: #0f172a;
		}

		code {
			background: #1e293b;
			color: #bfdbfe;
		}
	}
</style>
