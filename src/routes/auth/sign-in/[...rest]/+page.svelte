<!--
	Clerk Sign In Page

	Dedicated route for the SignIn component with URL-based routing.
	The [...rest] pattern allows Clerk to handle sub-routes internally
	for multi-step sign-in flows (MFA, email verification, etc.).

	Features:
	- Full-page sign-in form
	- Automatic redirect after sign-in
	- Link to sign-up page
	- Handles all Clerk authentication methods
	- Graceful fallback when Clerk not configured

	@component
-->
<script lang="ts">
	import { SignIn } from 'svelte-clerk';

	let { data } = $props();

	const isConfigured = $derived(data.isConfigured ?? false);
</script>

<svelte:head>
	<title>Sign In | TFE Svelte Templates</title>
	<meta name="description" content="Sign in to access your account" />
</svelte:head>

<div class="auth-page">
	<div class="auth-container">
		{#if isConfigured}
			<SignIn routing="path" path="/auth/sign-in" signUpUrl="/auth/sign-up" />
		{:else}
			<div class="not-configured">
				<div class="warning-icon">🔐</div>
				<h2>Authentication Not Configured</h2>
				<p>Clerk authentication is not set up.</p>
				<p>Add your API keys to <code>.env</code> to enable sign-in:</p>
				<pre class="code-block">PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...</pre>
				<a href="/auth" class="back-link">Back to Auth Demo</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		min-height: calc(100vh - 200px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
	}

	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.not-configured {
		text-align: center;
		padding: 3rem;
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		max-width: 400px;
	}

	.warning-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.not-configured h2 {
		margin: 0 0 1rem;
		color: #1a202c;
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
		font-size: 0.75rem;
		text-align: left;
		white-space: pre;
		margin-bottom: 1.5rem;
	}

	.back-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #007aff;
		color: white;
		text-decoration: none;
		border-radius: 0.5rem;
		font-weight: 500;
		transition: background 0.2s ease;
	}

	.back-link:hover {
		background: #0056b3;
	}
</style>
