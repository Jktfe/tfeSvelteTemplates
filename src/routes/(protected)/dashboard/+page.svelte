<!--
	Protected Dashboard Page

	A simple demonstration of a protected route. This page is only
	accessible to authenticated users. Unauthenticated visitors
	are automatically redirected to the sign-in page.

	Features:
	- Protected route example
	- Displays user information
	- Quick links to other protected pages
	- Shows authentication status

	@component
-->
<script lang="ts">
	import { SignedIn, UserButton } from 'svelte-clerk';
	import { useClerkContext } from 'svelte-clerk/client';

	let { data } = $props();

	// Access Clerk context for user information
	// Note: Do not destructure to maintain reactivity
	const ctx = useClerkContext();

	// Derive user info from context
	const user = $derived(ctx.user);
	const firstName = $derived(user?.firstName ?? 'User');
	const email = $derived(user?.primaryEmailAddress?.emailAddress ?? '');
</script>

<svelte:head>
	<title>Dashboard | TFE Svelte Templates</title>
	<meta name="description" content="Your protected dashboard" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">📊 Dashboard</h1>
		<p class="page-description">
			Welcome to your protected dashboard! This page demonstrates a route that requires
			authentication.
		</p>
		<div class="protected-badge">
			<span class="badge-icon">🔒</span>
			<span>Protected Route</span>
		</div>
	</header>

	<SignedIn>
		<!-- Welcome Card -->
		<section class="dashboard-section">
			<div class="welcome-card">
				<div class="welcome-content">
					<h2>Welcome back, {firstName}! 👋</h2>
					<p>You're signed in as <strong>{email}</strong></p>
				</div>
				<UserButton />
			</div>
		</section>

		<!-- Quick Actions -->
		<section class="dashboard-section">
			<h2 class="section-title">Quick Actions</h2>
			<div class="actions-grid">
				<a href="/profile" class="action-card">
					<span class="action-icon">👤</span>
					<div class="action-info">
						<h3>Your Profile</h3>
						<p>Manage your account settings and preferences</p>
					</div>
				</a>
				<a href="/auth" class="action-card">
					<span class="action-icon">🔐</span>
					<div class="action-info">
						<h3>Auth Demo</h3>
						<p>Explore authentication components and features</p>
					</div>
				</a>
				<a href="/" class="action-card">
					<span class="action-icon">🏠</span>
					<div class="action-info">
						<h3>Home</h3>
						<p>Return to the main component showcase</p>
					</div>
				</a>
			</div>
		</section>

		<!-- Info Card -->
		<section class="dashboard-section">
			<div class="info-card">
				<h3>🛡️ How This Works</h3>
				<p>
					This page is protected using a <code>(protected)</code> route group with a
					<code>+layout.server.ts</code> file that checks authentication status. If you weren't signed
					in, you would have been redirected to the sign-in page.
				</p>
				<pre class="code-block">// src/routes/(protected)/+layout.server.ts
export const load = async ({'{'} locals, url {'}'}) => {'{'}
  const auth = locals.auth();
  if (!auth?.userId) {'{'}
    throw redirect(303, `/auth/sign-in?redirect_url=${'{'}url.pathname{'}'}`);
  {'}'}
  return {'{'} userId: auth.userId {'}'};
{'}'}</pre>
			</div>
		</section>
	</SignedIn>
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
		color: #1a202c;
	}

	.page-description {
		font-size: 1.125rem;
		color: #4a5568;
		margin: 0 0 1rem;
	}

	.protected-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #fed7d7;
		color: #c53030;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.badge-icon {
		font-size: 1rem;
	}

	.dashboard-section {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 1rem;
		color: #1a202c;
	}

	/* Welcome Card */
	.welcome-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 1rem;
		color: white;
	}

	.welcome-content h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
	}

	.welcome-content p {
		margin: 0;
		opacity: 0.9;
	}

	/* Actions Grid */
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.action-card:hover {
		border-color: #007aff;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 2rem;
	}

	.action-info h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.action-info p {
		margin: 0;
		font-size: 0.875rem;
		color: #4a5568;
	}

	/* Info Card */
	.info-card {
		padding: 1.5rem;
		background: #ebf8ff;
		border: 1px solid #bee3f8;
		border-radius: 0.75rem;
	}

	.info-card h3 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
		color: #2b6cb0;
	}

	.info-card p {
		margin: 0 0 1rem;
		color: #2c5282;
		line-height: 1.6;
	}

	.info-card code {
		background: rgba(0, 0, 0, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	.code-block {
		background: #1a202c;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 0.5rem;
		font-family: 'Fira Code', 'Monaco', monospace;
		font-size: 0.8rem;
		overflow-x: auto;
		white-space: pre;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
		}

		.page-title {
			font-size: 1.75rem;
		}

		.welcome-card {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}
	}
</style>
