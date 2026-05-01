<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data } = $props();

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	const isConfigured = $derived(data.isConfigured ?? false);
	const redirectUrl = $derived(data.redirectUrl ?? '/dashboard');
	const demoCredentials = $derived(data.demoCredentials);

	async function signIn(signInEmail = email, signInPassword = password) {
		errorMessage = '';
		isSubmitting = true;

		const result = await authClient.signIn.email({
			email: signInEmail,
			password: signInPassword
		});

		isSubmitting = false;

		if (result.error) {
			errorMessage = result.error.message || 'Sign in failed';
			return;
		}

		await invalidateAll();
		await goto(redirectUrl);
	}

	async function signInWithDemo() {
		if (!demoCredentials) return;

		email = demoCredentials.email;
		password = demoCredentials.password;
		await signIn(demoCredentials.email, demoCredentials.password);
	}
</script>

<svelte:head>
	<title>Sign In | TFE Svelte Templates</title>
	<meta name="description" content="Sign in to access your account" />
</svelte:head>

<div class="auth-page">
	<section class="auth-card">
		<h1>Sign in</h1>

			{#if isConfigured}
				{#if demoCredentials}
					<div class="demo-card">
						<div>
							<h2>Public demo</h2>
							<p>{demoCredentials.email} / {demoCredentials.password}</p>
						</div>
						<button type="button" class="demo-button" disabled={isSubmitting} onclick={signInWithDemo}>
							Try demo
						</button>
					</div>
				{/if}

				<form onsubmit={(event) => { event.preventDefault(); void signIn(); }}>
					<label>
						<span>Email</span>
					<input bind:value={email} type="email" autocomplete="email" required />
				</label>

				<label>
					<span>Password</span>
					<input bind:value={password} type="password" autocomplete="current-password" required />
				</label>

				{#if errorMessage}
					<p class="error" role="alert">{errorMessage}</p>
				{/if}

				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Signing in...' : 'Sign in'}
				</button>
			</form>

			<p class="switch-link">
				Need an account? <a href="/auth/sign-up?redirect_url={encodeURIComponent(redirectUrl)}">Sign up</a>
			</p>
		{:else}
			<div class="not-configured">
					<p>Better Auth needs <code>DATABASE_URL</code>, <code>BETTER_AUTH_SECRET</code>, and <code>BETTER_AUTH_URL</code> before sign-in is available.</p>
					<a href="/auth">Back to auth overview</a>
				</div>
		{/if}
	</section>
</div>

<style>
	.auth-page {
		min-height: calc(100vh - 200px);
		display: grid;
		place-items: center;
		padding: 2rem;
		background: #f7fafc;
	}

	.auth-card {
		width: min(100%, 28rem);
		padding: 2rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
	}

	h1 {
		margin: 0 0 1.5rem;
		font-size: 1.75rem;
		color: #111827;
	}

		form {
			display: grid;
			gap: 1rem;
		}

		.demo-card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			padding: 1rem;
			margin-bottom: 1rem;
			border: 1px solid #bfdbfe;
			border-radius: 0.5rem;
			background: #eff6ff;
		}

		.demo-card h2,
		.demo-card p {
			margin: 0;
		}

		.demo-card h2 {
			font-size: 0.9375rem;
			color: #1e3a8a;
		}

		.demo-card p {
			margin-top: 0.25rem;
			color: #1d4ed8;
			font-size: 0.875rem;
		}

	label {
		display: grid;
		gap: 0.375rem;
		font-weight: 600;
		color: #374151;
	}

	input {
		width: 100%;
		padding: 0.75rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font: inherit;
	}

	input:focus {
		outline: 2px solid #007aff;
		outline-offset: 2px;
	}

	button {
		padding: 0.75rem 1rem;
		border: 0;
		border-radius: 0.5rem;
		background: #007aff;
		color: #ffffff;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

		button:disabled {
			opacity: 0.65;
			cursor: not-allowed;
		}

		.demo-button {
			flex-shrink: 0;
			background: #1d4ed8;
		}

	.error {
		margin: 0;
		color: #b91c1c;
		font-size: 0.875rem;
	}

	.switch-link,
	.not-configured {
		margin: 1rem 0 0;
		color: #4b5563;
	}

	.switch-link a,
	.not-configured a {
		color: #007aff;
		font-weight: 700;
	}

	@media (max-width: 520px) {
		.auth-page {
			padding: 1rem;
			place-items: start center;
		}

		.auth-card {
			padding: 1.25rem;
		}

		.demo-card {
			align-items: stretch;
			flex-direction: column;
		}
	}

	@media (prefers-color-scheme: dark) {
		.auth-page {
			background: #0f172a;
		}

		.auth-card {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
		}

		h1,
		label {
			color: #f8fafc;
		}

		input {
			background: #0f172a;
			border-color: #334155;
			color: #f8fafc;
		}

		.demo-card {
			background: rgba(37, 99, 235, 0.18);
			border-color: rgba(96, 165, 250, 0.35);
		}

		.demo-card h2 {
			color: #bfdbfe;
		}

		.demo-card p,
		.switch-link,
		.not-configured {
			color: #cbd5e1;
		}

		code {
			color: #bfdbfe;
		}
	}
</style>
