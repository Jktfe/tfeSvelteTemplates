<!--
	Authentication Demo Page

	This page demonstrates Clerk authentication integration with SvelteKit.
	It showcases all available Clerk components and serves as both a functional
	demo and educational resource for developers.

	Features:
	- Tab-based navigation between auth components
	- Live demos of SignIn, SignUp, and UserProfile
	- Code examples for each component
	- Works in demo mode when Clerk is not configured
	- Follows project styling conventions

	Usage:
		Navigate to /auth to view the demo

	@component
-->
<script lang="ts">
	import { SignIn, SignUp, SignedIn, SignedOut, UserButton, UserProfile } from 'svelte-clerk';
	import AuthStatus from '$lib/components/AuthStatus.svelte';

	let { data } = $props();

	// Tab state for component showcase
	let activeTab = $state<'sign-in' | 'sign-up' | 'profile'>('sign-in');

	// Check if Clerk is configured (has publishable key)
	const isConfigured = $derived(data.isConfigured ?? false);
</script>

<svelte:head>
	<title>Authentication Demo | TFE Svelte Templates</title>
	<meta
		name="description"
		content="Clerk authentication integration demo with sign-in, sign-up, and user management for SvelteKit"
	/>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">🔐 Authentication with Clerk</h1>
		<p class="page-description">
			Complete authentication integration using <strong>Clerk</strong> for user management,
			sign-in flows, and protected routes. This template demonstrates production-ready auth patterns
			with graceful fallback when not configured.
		</p>
		<AuthStatus {isConfigured} />
	</header>

	<!-- Current Auth State -->
	<section class="demo-section">
		<h2 class="section-title">Current Auth State</h2>
		<div class="auth-state-demo">
			{#if isConfigured}
				<SignedOut>
					<div class="state-card signed-out">
						<span class="state-icon">🔓</span>
						<div class="state-info">
							<h3>Not Signed In</h3>
							<p>Click the "Sign In" button in the navbar or use the components below.</p>
						</div>
					</div>
				</SignedOut>
				<SignedIn>
					<div class="state-card signed-in">
						<span class="state-icon">✅</span>
						<div class="state-info">
							<h3>Signed In</h3>
							<p>You're authenticated! Try visiting the protected Dashboard or Profile pages.</p>
						</div>
						<UserButton />
					</div>
				</SignedIn>
			{:else}
				<div class="state-card demo-mode">
					<span class="state-icon">🔓</span>
					<div class="state-info">
						<h3>Demo Mode</h3>
						<p>Clerk is not configured. Add your API keys to enable authentication.</p>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- Component Showcase -->
	<section class="demo-section">
		<h2 class="section-title">Clerk Components</h2>
		<p class="section-description">
			Explore the pre-built authentication components. These are fully customisable and handle all
			auth flows automatically.
		</p>

		<!-- Tab Navigation -->
		<div class="tabs">
			<button
				class="tab"
				class:active={activeTab === 'sign-in'}
				onclick={() => (activeTab = 'sign-in')}
			>
				SignIn
			</button>
			<button
				class="tab"
				class:active={activeTab === 'sign-up'}
				onclick={() => (activeTab = 'sign-up')}
			>
				SignUp
			</button>
			<button
				class="tab"
				class:active={activeTab === 'profile'}
				onclick={() => (activeTab = 'profile')}
			>
				UserProfile
			</button>
		</div>

		<!-- Component Demo Area -->
		<div class="component-demo">
			{#if isConfigured}
				{#if activeTab === 'sign-in'}
					<SignedOut>
						<div class="demo-wrapper">
							<SignIn signUpUrl="/auth/sign-up" />
						</div>
					</SignedOut>
					<SignedIn>
						<div class="already-signed-in-notice">
							<span class="notice-icon">✅</span>
							<p>You're already signed in! Sign out to see the SignIn component.</p>
						</div>
					</SignedIn>
				{:else if activeTab === 'sign-up'}
					<SignedOut>
						<div class="demo-wrapper">
							<SignUp signInUrl="/auth/sign-in" />
						</div>
					</SignedOut>
					<SignedIn>
						<div class="already-signed-in-notice">
							<span class="notice-icon">✅</span>
							<p>You're already signed in! Sign out to see the SignUp component.</p>
						</div>
					</SignedIn>
				{:else if activeTab === 'profile'}
					<SignedIn>
						<div class="demo-wrapper">
							<UserProfile />
						</div>
					</SignedIn>
					<SignedOut>
						<div class="not-signed-in-notice">
							<span class="notice-icon">ℹ️</span>
							<p>Sign in to view your profile.</p>
						</div>
					</SignedOut>
				{/if}
			{:else}
				<div class="not-configured">
					<div class="warning-icon">⚠️</div>
					<h3>Clerk Not Configured</h3>
					<p>Add your Clerk API keys to <code>.env</code> to enable authentication:</p>
					<pre class="code-block">PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...</pre>
					<p class="help-text">
						Get your keys from the
						<a href="https://dashboard.clerk.com" target="_blank" rel="noopener">Clerk Dashboard</a>
					</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Protected Routes Info -->
	<section class="demo-section">
		<h2 class="section-title">Protected Routes</h2>
		<p class="section-description">
			This template includes protected demo pages that require authentication. Try visiting them to
			see route protection in action.
		</p>

		<div class="protected-routes-grid">
			<a href="/dashboard" class="route-card">
				<span class="route-icon">📊</span>
				<div class="route-info">
					<h3>Dashboard</h3>
					<p>A protected dashboard page showing user information.</p>
				</div>
				<span class="route-badge">Protected</span>
			</a>
			<a href="/profile" class="route-card">
				<span class="route-icon">👤</span>
				<div class="route-info">
					<h3>Profile</h3>
					<p>User profile management with Clerk's UserProfile component.</p>
				</div>
				<span class="route-badge">Protected</span>
			</a>
		</div>
	</section>

	<!-- Implementation Guide -->
	<section class="demo-section">
		<h2 class="section-title">Quick Implementation Guide</h2>

		<div class="guide-steps">
			<div class="guide-step">
				<span class="step-number">1</span>
				<div class="step-content">
					<h4>Install Package</h4>
					<pre class="code-block">npm install svelte-clerk</pre>
				</div>
			</div>

			<div class="guide-step">
				<span class="step-number">2</span>
				<div class="step-content">
					<h4>Add Environment Variables</h4>
					<pre class="code-block">PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...</pre>
				</div>
			</div>

			<div class="guide-step">
				<span class="step-number">3</span>
				<div class="step-content">
					<h4>Create hooks.server.ts</h4>
					<pre class="code-block">import {'{'} withClerkHandler {'}'} from 'svelte-clerk/server';
export const handle = withClerkHandler();</pre>
				</div>
			</div>

			<div class="guide-step">
				<span class="step-number">4</span>
				<div class="step-content">
					<h4>Wrap Layout with ClerkProvider</h4>
					<pre class="code-block">&lt;ClerkProvider&gt;
  &lt;!-- Your app content --&gt;
&lt;/ClerkProvider&gt;</pre>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #1a202c;
	}

	.page-description {
		font-size: 1.125rem;
		color: #4a5568;
		max-width: 700px;
		margin: 0 auto 1.5rem;
		line-height: 1.7;
	}

	.demo-section {
		margin-bottom: 3rem;
		padding: 2rem;
		background: #ffffff;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: #1a202c;
	}

	.section-description {
		color: #4a5568;
		margin: 0 0 1.5rem;
	}

	/* Auth State Demo */
	.auth-state-demo {
		display: flex;
		justify-content: center;
	}

	.state-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem 2rem;
		border-radius: 0.75rem;
		max-width: 500px;
		width: 100%;
	}

	.state-card.signed-out {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
	}

	.state-card.signed-in {
		background: #f0fff4;
		border: 1px solid #9ae6b4;
	}

	.state-card.demo-mode {
		background: #fffbeb;
		border: 1px solid #fcd34d;
	}

	.state-icon {
		font-size: 2rem;
	}

	.state-info h3 {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.state-info p {
		margin: 0;
		color: #4a5568;
		font-size: 0.875rem;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		background: none;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4a5568;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tab:hover {
		background: #f7fafc;
		color: #1a202c;
	}

	.tab.active {
		background: #007aff;
		color: white;
	}

	/* Component Demo */
	.component-demo {
		display: flex;
		justify-content: center;
		padding: 2rem;
		background: #f7fafc;
		border-radius: 0.75rem;
		min-height: 400px;
	}

	.demo-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.not-configured {
		text-align: center;
		padding: 2rem;
		max-width: 400px;
	}

	.not-configured .warning-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.not-configured h3 {
		margin: 0 0 1rem;
		color: #c53030;
	}

	.not-configured p {
		color: #4a5568;
		margin: 0 0 1rem;
	}

	.code-block {
		background: #1a202c;
		color: #e2e8f0;
		padding: 1rem;
		border-radius: 0.5rem;
		font-family: 'Fira Code', 'Monaco', monospace;
		font-size: 0.875rem;
		overflow-x: auto;
		text-align: left;
		white-space: pre;
	}

	.help-text {
		font-size: 0.875rem;
	}

	.help-text a {
		color: #007aff;
		text-decoration: none;
	}

	.help-text a:hover {
		text-decoration: underline;
	}

	.not-signed-in-notice,
	.already-signed-in-notice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 0.5rem;
	}

	.not-signed-in-notice {
		background: #ebf8ff;
	}

	.already-signed-in-notice {
		background: #f0fff4;
	}

	.notice-icon {
		font-size: 1.25rem;
	}

	.not-signed-in-notice p {
		margin: 0;
		color: #2b6cb0;
	}

	.already-signed-in-notice p {
		margin: 0;
		color: #276749;
	}

	/* Protected Routes Grid */
	.protected-routes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.route-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
	}

	.route-card:hover {
		border-color: #007aff;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
		transform: translateY(-2px);
	}

	.route-icon {
		font-size: 2rem;
	}

	.route-info {
		flex: 1;
	}

	.route-info h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.route-info p {
		margin: 0;
		font-size: 0.875rem;
		color: #4a5568;
	}

	.route-badge {
		padding: 0.25rem 0.75rem;
		background: #fed7d7;
		color: #c53030;
		font-size: 0.75rem;
		font-weight: 600;
		border-radius: 9999px;
	}

	/* Guide Steps */
	.guide-steps {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.guide-step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: #007aff;
		color: white;
		font-weight: 600;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.step-content {
		flex: 1;
	}

	.step-content h4 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.step-content .code-block {
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

		.demo-section {
			padding: 1.5rem;
		}

		.tabs {
			flex-wrap: wrap;
		}

		.state-card {
			flex-direction: column;
			text-align: center;
		}

		.guide-step {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
