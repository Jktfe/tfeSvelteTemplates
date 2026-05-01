<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data } = $props();

	const user = $derived(data.authUser);
	const displayName = $derived(user?.name || user?.email || 'User');
	const isDemoUser = $derived(data.isDemoUser ?? false);

	async function signOut() {
		await authClient.signOut();
		await invalidateAll();
		await goto('/auth/sign-in');
	}
</script>

<svelte:head>
	<title>Profile | TFE Svelte Templates</title>
	<meta name="description" content="Manage your account settings and profile" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div class="header-content">
			<div class="header-text">
				<h1 class="page-title">Your Profile</h1>
				<p class="page-description">Account details from the active Better Auth session.</p>
			</div>
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
			</div>
		</header>

	<section class="profile-section">
		<div class="user-summary">
			<div class="avatar" aria-hidden="true">{displayName[0]}</div>
			<div class="user-info">
				<h2>{displayName}</h2>
				{#if user?.email}
					<p>{user.email}</p>
				{/if}
				<p class="user-id">User ID: {user?.id}</p>
			</div>
			<button type="button" onclick={signOut}>Sign out</button>
		</div>
	</section>

	<section class="profile-section">
		<div class="nav-links">
			<a href="/dashboard" class="nav-link">
				<span class="nav-icon">📊</span>
				<span>Back to Dashboard</span>
			</a>
			<a href="/auth" class="nav-link">
				<span class="nav-icon">🔐</span>
				<span>Auth Overview</span>
			</a>
			<a href="/" class="nav-link">
				<span class="nav-icon">🏠</span>
				<span>Home</span>
			</a>
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
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.page-description {
		font-size: 1rem;
		color: #4b5563;
		margin: 0;
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
			flex-shrink: 0;
		}

		.demo-badge {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			padding: 0.5rem 1rem;
			background: #dbeafe;
			color: #1e40af;
			border-radius: 9999px;
			font-size: 0.875rem;
			font-weight: 700;
			flex-shrink: 0;
		}

	.profile-section {
		margin-bottom: 2rem;
	}

	.user-summary {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
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

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-info h2,
	.user-info p {
		margin: 0;
	}

	.user-info p {
		color: #4b5563;
	}

	.user-id {
		font-size: 0.8125rem;
		word-break: break-all;
	}

	button {
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: #ffffff;
		color: #374151;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #111827;
		text-decoration: none;
		font-weight: 700;
	}

	@media (max-width: 640px) {
		.page-container {
			padding: 1rem;
		}

		.user-summary {
			align-items: flex-start;
			flex-direction: column;
		}

		button,
		.nav-link {
			width: 100%;
			justify-content: center;
		}
	}

	@media (prefers-color-scheme: dark) {
		.page-title,
		.user-info h2 {
			color: #f8fafc;
		}

		.page-description,
		.user-info p {
			color: #cbd5e1;
		}

		.user-summary,
		.nav-link {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
		}

		.avatar {
			background: #e2e8f0;
			color: #0f172a;
		}

		button,
		.nav-link {
			color: #e2e8f0;
		}

		button {
			background: #0f172a;
			border-color: #334155;
		}
	}
</style>
