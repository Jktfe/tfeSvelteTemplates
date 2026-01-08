<!--
	Protected Profile Page

	User profile management page using Clerk's UserProfile component.
	This page is protected and only accessible to authenticated users.

	Features:
	- Full Clerk UserProfile component
	- Account management (email, password, 2FA)
	- Connected accounts management
	- Session management
	- Protected route example

	@component
-->
<script lang="ts">
	import { SignedIn, UserProfile, UserButton } from 'svelte-clerk';
	import { useClerkContext } from 'svelte-clerk/client';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { data } = $props();

	// Access Clerk context for user information
	const ctx = useClerkContext();
	const user = $derived(ctx.user);
	const fullName = $derived(
		user?.firstName && user?.lastName
			? `${user.firstName} ${user.lastName}`
			: user?.firstName ?? 'User'
	);
</script>

<svelte:head>
	<title>Profile | TFE Svelte Templates</title>
	<meta name="description" content="Manage your account settings and profile" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div class="header-content">
			<div class="header-text">
				<h1 class="page-title">👤 Your Profile</h1>
				<p class="page-description">
					Manage your account settings, security preferences, and connected accounts.
				</p>
			</div>
			<div class="protected-badge">
				<span class="badge-icon">🔒</span>
				<span>Protected Route</span>
			</div>
		</div>
	</header>

	<SignedIn>
		<!-- User Info Summary -->
		<section class="profile-section">
			<div class="user-summary">
				<div class="user-info">
					<h2>Welcome, {fullName}</h2>
					<p>Use the panel below to manage your account settings.</p>
				</div>
				<UserButton />
			</div>
		</section>

		<!-- UserProfile Component -->
		<section class="profile-section">
			<div class="profile-wrapper">
				<UserProfile />
			</div>
		</section>

		<!-- Navigation -->
		<section class="profile-section">
			<div class="nav-links">
				<a href="/dashboard" class="nav-link">
					<span class="nav-icon">📊</span>
					<span>Back to Dashboard</span>
				</a>
				<a href="/auth" class="nav-link">
					<span class="nav-icon">🔐</span>
					<span>Auth Demo</span>
				</a>
				<a href="/" class="nav-link">
					<span class="nav-icon">🏠</span>
					<span>Home</span>
				</a>
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
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.header-text {
		flex: 1;
		min-width: 250px;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: #1a202c;
	}

	.page-description {
		font-size: 1rem;
		color: #4a5568;
		margin: 0;
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
		flex-shrink: 0;
	}

	.badge-icon {
		font-size: 1rem;
	}

	.profile-section {
		margin-bottom: 2rem;
	}

	/* User Summary */
	.user-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
	}

	.user-info h2 {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.user-info p {
		margin: 0;
		color: #4a5568;
		font-size: 0.875rem;
	}

	/* Profile Wrapper */
	.profile-wrapper {
		display: flex;
		justify-content: center;
		padding: 2rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
	}

	/* Navigation Links */
	.nav-links {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #4a5568;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.nav-link:hover {
		background: #edf2f7;
		border-color: #cbd5e0;
		color: #1a202c;
	}

	.nav-icon {
		font-size: 1.125rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
		}

		.header-content {
			flex-direction: column;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.user-summary {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}

		.profile-wrapper {
			padding: 1rem;
		}

		.nav-links {
			flex-direction: column;
		}
	}
</style>
