<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Avatar from '$lib/components/Avatar.svelte';
	import BadgePill from '$lib/components/BadgePill.svelte';
	import AlertBanner from '$lib/components/AlertBanner.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import KbdShortcut from '$lib/components/KbdShortcut.svelte';
	import Drawer from '$lib/components/Drawer.svelte';

	let { data } = $props();

	const user = $derived(data.authUser);
	const displayName = $derived(user?.name || user?.email || 'User');
	const isDemoUser = $derived(data.isDemoUser ?? false);

	// Editable profile fields. We seed from the server-loaded user; consumer code
	// in a real app would call authClient.updateUser to persist these.
	let editingProfile = $state(false);
	let nameInput = $state('');
	let emailInput = $state('');
	let saving = $state(false);
	let saveMessage = $state<{ tone: 'info' | 'success' | 'warning' | 'error'; text: string } | null>(
		null
	);

	// Sync editable state to user when the load function refreshes.
	$effect(() => {
		nameInput = user?.name ?? '';
		emailInput = user?.email ?? '';
	});

	function startEdit() {
		nameInput = user?.name ?? '';
		emailInput = user?.email ?? '';
		editingProfile = true;
		saveMessage = null;
	}

	function cancelEdit() {
		editingProfile = false;
		saveMessage = null;
	}

	async function saveProfile() {
		saving = true;
		saveMessage = null;
		try {
			if (isDemoUser) {
				// Faked failure mirrors what requireAuthAPI would return for a real write.
				await new Promise((resolve) => setTimeout(resolve, 400));
				saveMessage = {
					tone: 'warning',
					text: 'Demo account is read-only — changes were not saved (a real call would 403).'
				};
				return;
			}
			// In a real wired implementation:
			//   await authClient.updateUser({ name: nameInput });
			// Email changes would go through a verification flow.
			await new Promise((resolve) => setTimeout(resolve, 400));
			saveMessage = { tone: 'success', text: 'Profile saved.' };
			editingProfile = false;
		} catch {
			saveMessage = { tone: 'error', text: 'Could not save changes. Please try again.' };
		} finally {
			saving = false;
		}
	}

	let signingOut = $state(false);

	async function signOut() {
		signingOut = true;
		try {
			await authClient.signOut();
			await invalidateAll();
			await goto('/auth/sign-in');
		} finally {
			signingOut = false;
		}
	}

	let resetSending = $state(false);
	let resetMessage = $state<string | null>(null);

	async function sendPasswordReset() {
		resetSending = true;
		resetMessage = null;
		try {
			// Faked — when a real email service is wired this becomes:
			//   await authClient.requestPasswordReset({ email: user?.email })
			await new Promise((resolve) => setTimeout(resolve, 500));
			resetMessage = isDemoUser
				? 'Demo mode — no email actually sent.'
				: `Reset link sent to ${user?.email ?? 'your inbox'}.`;
		} finally {
			resetSending = false;
		}
	}

	// Imaginary device sessions — what `authClient.listSessions()` would return.
	type DeviceSession = {
		id: string;
		device: string;
		os: string;
		browser: string;
		location: string;
		lastActive: string;
		current?: boolean;
	};

	let sessions = $state<DeviceSession[]>([
		{
			id: 'sess_current',
			device: 'MacBook Pro',
			os: 'macOS 14.4',
			browser: 'Chrome 124',
			location: 'London, UK',
			lastActive: 'Active now',
			current: true
		},
		{
			id: 'sess_iphone',
			device: 'iPhone 15',
			os: 'iOS 17.4',
			browser: 'Safari',
			location: 'London, UK',
			lastActive: '2 hours ago'
		},
		{
			id: 'sess_windows',
			device: 'ThinkPad X1',
			os: 'Windows 11',
			browser: 'Firefox 125',
			location: 'Manchester, UK',
			lastActive: 'Yesterday, 18:22'
		}
	]);

	let revokingId = $state<string | null>(null);

	async function revokeSession(id: string) {
		revokingId = id;
		try {
			// Faked. In production: authClient.revokeSession({ token: id })
			await new Promise((resolve) => setTimeout(resolve, 350));
			sessions = sessions.filter((s) => s.id !== id);
		} finally {
			revokingId = null;
		}
	}

	let signingOutEverywhere = $state(false);

	async function signOutEverywhere() {
		signingOutEverywhere = true;
		try {
			// Faked. In production: authClient.revokeOtherSessions()
			await new Promise((resolve) => setTimeout(resolve, 500));
			sessions = sessions.filter((s) => s.current);
		} finally {
			signingOutEverywhere = false;
		}
	}

	// Danger-zone confirmation drawer — never actually deletes the account.
	let confirmDrawerOpen = $state(false);
	let confirmText = $state('');
	let deleteRequested = $state(false);

	function openDeleteConfirm() {
		confirmText = '';
		deleteRequested = false;
		confirmDrawerOpen = true;
	}

	function pretendDelete() {
		// Don't actually delete in the demo — just acknowledge the request.
		deleteRequested = true;
	}

	const expectedConfirm = 'DELETE';
</script>

<svelte:head>
	<title>Profile | TFE Svelte Templates</title>
	<meta name="description" content="Manage your account settings and profile" />
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div class="header-top">
			<div>
				<h1 class="page-title">Your profile</h1>
				<p class="page-description">
					Account details, sessions, and security actions for the active Better Auth session.
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

	{#if isDemoUser}
		<section class="profile-section">
			<AlertBanner
				variant="info"
				title="Demo account — writes will fail"
				message="The public demo user is read-only. Save / reset / revoke actions on this page simulate the request and show a 403-style warning where a real call would be rejected by requireAuthAPI."
			/>
		</section>
	{/if}

	<!-- Top card: avatar + editable name/email + save action. -->
	<section class="profile-section">
		<article class="card identity-card">
			<div class="identity-row">
				<Avatar name={displayName} size="lg" />
				<div class="identity-info">
					{#if editingProfile}
						<form
							class="edit-form"
							onsubmit={(e) => {
								e.preventDefault();
								saveProfile();
							}}
						>
							<label class="field">
								<span class="field-label">Name</span>
								<input
									type="text"
									bind:value={nameInput}
									required
									minlength="1"
									autocomplete="name"
								/>
							</label>
							<label class="field">
								<span class="field-label">Email</span>
								<input
									type="email"
									bind:value={emailInput}
									required
									autocomplete="email"
									disabled
								/>
								<span class="field-hint">
									Email changes go through a verification flow — not editable inline.
								</span>
							</label>
							<div class="edit-actions">
								<button type="submit" class="btn btn-primary" disabled={saving}>
									{#if saving}<Spinner size="sm" />{/if}
									{saving ? 'Saving…' : 'Save changes'}
								</button>
								<button type="button" class="btn" onclick={cancelEdit} disabled={saving}>
									Cancel
								</button>
							</div>
						</form>
					{:else}
						<h2 class="identity-name">{displayName}</h2>
						{#if user?.email}
							<p class="identity-email">{user.email}</p>
						{/if}
						<button type="button" class="btn btn-link" onclick={startEdit}>
							Edit name
						</button>
					{/if}
				</div>
			</div>

			{#if saveMessage}
				<div class="save-message">
					<AlertBanner variant={saveMessage.tone} message={saveMessage.text} />
				</div>
			{/if}
		</article>
	</section>

	<!-- Account info — read-only audit fields. -->
	<section class="profile-section">
		<article class="card">
			<header class="card-header">
				<h2 class="card-title">Account information</h2>
			</header>
			<dl class="info-grid">
				<div class="info-row">
					<dt>User ID</dt>
					<dd class="mono">{user?.id ?? '—'}</dd>
				</div>
				<div class="info-row">
					<dt>Created</dt>
					<dd>April 2024</dd>
				</div>
				<div class="info-row">
					<dt>Last sign-in</dt>
					<dd>Today at 09:42</dd>
				</div>
				<div class="info-row">
					<dt>Auth provider</dt>
					<dd>Email + password (Better Auth)</dd>
				</div>
			</dl>
		</article>
	</section>

	<!-- Password reset — calls authClient.requestPasswordReset in production. -->
	<section class="profile-section">
		<article class="card">
			<header class="card-header">
				<h2 class="card-title">Password</h2>
			</header>
			<p class="card-body">
				We don't show or accept your current password here — for security, password changes go
				through an email link.
			</p>
			<div class="card-actions">
				<button
					type="button"
					class="btn btn-primary"
					onclick={sendPasswordReset}
					disabled={resetSending}
				>
					{#if resetSending}<Spinner size="sm" />{/if}
					{resetSending ? 'Sending…' : 'Send password reset email'}
				</button>
				{#if resetMessage}
					<span class="reset-message">{resetMessage}</span>
				{/if}
			</div>
		</article>
	</section>

	<!-- Sessions — list of devices currently signed in. -->
	<section class="profile-section">
		<article class="card">
			<header class="card-header">
				<h2 class="card-title">Active sessions</h2>
				<BadgePill
					label={`${sessions.length} device${sessions.length === 1 ? '' : 's'}`}
					tone="neutral"
					variant="outline"
					size="sm"
				/>
			</header>
			<p class="card-body">
				Devices that currently have a valid session. Sign out of one or all at once.
			</p>
			<ul class="session-list">
				{#each sessions as session (session.id)}
					<li class="session-item">
						<div class="session-icon" aria-hidden="true">
							{#if session.os.startsWith('iOS')}📱
							{:else if session.os.startsWith('Windows')}🪟
							{:else}💻{/if}
						</div>
						<div class="session-body">
							<div class="session-line">
								<strong>{session.device}</strong>
								{#if session.current}
									<BadgePill
										label="This device"
										tone="success"
										variant="soft"
										size="sm"
										dot
									/>
								{/if}
							</div>
							<p class="session-meta">
								{session.browser} · {session.os} · {session.location}
							</p>
							<span class="session-time">{session.lastActive}</span>
						</div>
						<div class="session-actions">
							{#if !session.current}
								<button
									type="button"
									class="btn btn-sm"
									onclick={() => revokeSession(session.id)}
									disabled={revokingId === session.id}
								>
									{#if revokingId === session.id}<Spinner size="sm" />{/if}
									{revokingId === session.id ? 'Signing out…' : 'Sign out'}
								</button>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<div class="card-actions card-actions-end">
				<button
					type="button"
					class="btn"
					onclick={signOutEverywhere}
					disabled={signingOutEverywhere || sessions.length <= 1}
				>
					{#if signingOutEverywhere}<Spinner size="sm" />{/if}
					{signingOutEverywhere ? 'Signing out…' : 'Sign out everywhere else'}
				</button>
				<button type="button" class="btn btn-primary" onclick={signOut} disabled={signingOut}>
					{#if signingOut}<Spinner size="sm" />{/if}
					{signingOut ? 'Signing out…' : 'Sign out this device'}
				</button>
			</div>
		</article>
	</section>

	<!-- Danger zone — destructive actions kept visually distinct. -->
	<section class="profile-section">
		<article class="card danger-card">
			<header class="card-header">
				<h2 class="card-title danger-title">Danger zone</h2>
				<BadgePill label="Irreversible" tone="danger" variant="soft" size="sm" />
			</header>
			<div class="danger-row">
				<div>
					<h3 class="danger-action-title">Delete account</h3>
					<p class="danger-action-body">
						Permanently delete your account and all associated data. This cannot be undone.
					</p>
				</div>
				<button type="button" class="btn btn-danger" onclick={openDeleteConfirm}>
					Delete account…
				</button>
			</div>
		</article>
	</section>

	<!-- Quick links to other authed pages. -->
	<section class="profile-section">
		<div class="nav-links">
			<a href="/dashboard" class="nav-link">
				<span aria-hidden="true">📊</span>
				<span>Dashboard</span>
			</a>
			<a href="/auth" class="nav-link">
				<span aria-hidden="true">🔐</span>
				<span>Auth overview</span>
			</a>
			<a href="/" class="nav-link">
				<span aria-hidden="true">🏠</span>
				<span>Home</span>
			</a>
			<div class="nav-shortcut">
				<span>Search</span>
				<KbdShortcut keys={['Cmd', 'K']} size="sm" />
			</div>
		</div>
	</section>
</div>

<!-- Confirmation drawer for delete. The "DELETE" gate is intentional friction. -->
<Drawer bind:open={confirmDrawerOpen} position="right" size={420} ariaLabel="Confirm account deletion">
	<div class="drawer-inner">
		<h2 class="drawer-title">Delete your account?</h2>
		<p class="drawer-body">
			This is a demo — no account will actually be deleted. In a real app this would call
			<code>authClient.deleteUser()</code> after the verification step below.
		</p>

		<AlertBanner
			variant="warning"
			title="Type DELETE to confirm"
			message="We require an explicit phrase so this can't be triggered by accident."
		/>

		<label class="field drawer-field">
			<span class="field-label">Confirmation</span>
			<input
				type="text"
				bind:value={confirmText}
				placeholder="Type DELETE"
				autocomplete="off"
			/>
		</label>

		{#if deleteRequested}
			<AlertBanner
				variant="success"
				title="Demo only"
				message="In production this would have permanently deleted your account."
			/>
		{/if}

		<div class="drawer-actions">
			<button type="button" class="btn" onclick={() => (confirmDrawerOpen = false)}>
				Cancel
			</button>
			<button
				type="button"
				class="btn btn-danger"
				onclick={pretendDelete}
				disabled={confirmText !== expectedConfirm || deleteRequested}
			>
				{deleteRequested ? 'Request acknowledged' : 'Delete account'}
			</button>
		</div>
	</div>
</Drawer>

<style>
	.page-container {
		max-width: 1000px;
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

	.badge-row {
		display: inline-flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		flex-shrink: 0;
		padding-top: 0.25rem;
	}

	.profile-section {
		margin-bottom: 1.5rem;
	}

	.card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.card-title {
		margin: 0;
		font-size: 1.0625rem;
		font-weight: 700;
		color: #111827;
	}

	.card-body {
		margin: 0 0 1rem;
		color: #4b5563;
		font-size: 0.9375rem;
	}

	.card-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.card-actions-end {
		justify-content: flex-end;
		margin-top: 1rem;
	}

	/* Identity card */
	.identity-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.identity-row {
		display: flex;
		gap: 1.25rem;
		align-items: center;
	}

	.identity-info {
		flex: 1;
		min-width: 0;
	}

	.identity-name {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		color: #111827;
	}

	.identity-email {
		margin: 0 0 0.5rem;
		color: #4b5563;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: #ffffff;
		color: #111827;
		font: inherit;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.btn:hover:not(:disabled) {
		background: #f8fafc;
		border-color: #cbd5e1;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-sm {
		padding: 0.375rem 0.625rem;
		font-size: 0.8125rem;
	}

	.btn-primary {
		background: #111827;
		border-color: #111827;
		color: #ffffff;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1f2937;
		border-color: #1f2937;
	}

	.btn-danger {
		background: #fee2e2;
		border-color: #fecaca;
		color: #991b1b;
	}

	.btn-danger:hover:not(:disabled) {
		background: #fecaca;
		border-color: #fca5a5;
	}

	.btn-link {
		background: transparent;
		border-color: transparent;
		color: #2563eb;
		padding: 0.25rem 0;
	}

	.btn-link:hover:not(:disabled) {
		background: transparent;
		text-decoration: underline;
	}

	/* Edit form */
	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #374151;
	}

	.field-hint {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.field input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font: inherit;
		font-size: 0.9375rem;
		background: #ffffff;
		color: #111827;
	}

	.field input:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}

	.field input:disabled {
		background: #f8fafc;
		color: #6b7280;
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.save-message {
		margin-top: 0.5rem;
	}

	/* Account info grid */
	.info-grid {
		display: grid;
		grid-template-columns: 1fr;
		margin: 0;
		gap: 0.5rem;
	}

	.info-row {
		display: grid;
		grid-template-columns: 180px 1fr;
		align-items: baseline;
		gap: 1rem;
		padding: 0.5rem 0;
		border-top: 1px solid #f1f5f9;
	}

	.info-row:first-child {
		border-top: 0;
	}

	.info-row dt {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.info-row dd {
		margin: 0;
		color: #111827;
		font-size: 0.9375rem;
		word-break: break-all;
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.8125rem;
	}

	/* Password reset feedback */
	.reset-message {
		font-size: 0.875rem;
		color: #15803d;
	}

	/* Sessions */
	.session-list {
		list-style: none;
		margin: 0 0 0.5rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.session-item {
		display: flex;
		gap: 0.875rem;
		padding: 0.875rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.625rem;
		background: #f8fafc;
		align-items: center;
	}

	.session-icon {
		font-size: 1.5rem;
		width: 2.5rem;
		text-align: center;
		flex-shrink: 0;
	}

	.session-body {
		flex: 1;
		min-width: 0;
	}

	.session-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.session-line strong {
		color: #111827;
	}

	.session-meta {
		margin: 0.125rem 0 0;
		font-size: 0.8125rem;
		color: #4b5563;
	}

	.session-time {
		display: block;
		margin-top: 0.125rem;
		font-size: 0.75rem;
		color: #94a3b8;
	}

	.session-actions {
		flex-shrink: 0;
	}

	/* Danger zone */
	.danger-card {
		border-color: #fecaca;
		background: linear-gradient(180deg, #fff7f7 0%, #ffffff 60%);
	}

	.danger-title {
		color: #991b1b;
	}

	.danger-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.danger-action-title {
		margin: 0 0 0.25rem;
		font-size: 0.9375rem;
		color: #111827;
	}

	.danger-action-body {
		margin: 0;
		font-size: 0.875rem;
		color: #4b5563;
		max-width: 38rem;
	}

	/* Nav links */
	.nav-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.875rem;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		color: #111827;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.nav-link:hover {
		border-color: #cbd5e1;
	}

	.nav-shortcut {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	/* Drawer content */
	.drawer-inner {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
	}

	.drawer-title {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.drawer-body {
		margin: 0;
		color: #4b5563;
		font-size: 0.9375rem;
	}

	.drawer-field input {
		padding: 0.625rem 0.75rem;
	}

	.drawer-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: auto;
		padding-top: 0.5rem;
	}

	.drawer-inner code {
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: #f3f4f6;
		font-size: 0.875em;
	}

	@media (max-width: 640px) {
		.page-container {
			padding: 1rem;
		}

		.identity-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.info-row {
			grid-template-columns: 1fr;
			gap: 0.125rem;
		}

		.danger-row {
			align-items: flex-start;
		}

		.session-item {
			flex-wrap: wrap;
		}

		.nav-shortcut {
			margin-left: 0;
		}
	}

	@media (prefers-color-scheme: dark) {
		.page-title,
		.card-title,
		.identity-name,
		.session-line strong,
		.info-row dd,
		.danger-action-title,
		.drawer-title {
			color: #f8fafc;
		}

		.page-description,
		.identity-email,
		.card-body,
		.session-meta,
		.danger-action-body,
		.drawer-body,
		.field-label,
		.info-row dt,
		.field-hint {
			color: #cbd5e1;
		}

		.card,
		.nav-link {
			background: #111827;
			border-color: #334155;
			box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05);
		}

		.session-item {
			background: #0f172a;
			border-color: #334155;
		}

		.info-row {
			border-top-color: #1e293b;
		}

		.btn {
			background: #0f172a;
			border-color: #334155;
			color: #e2e8f0;
		}

		.btn:hover:not(:disabled) {
			background: #1e293b;
			border-color: #475569;
		}

		.btn-primary {
			background: #f8fafc;
			border-color: #f8fafc;
			color: #0f172a;
		}

		.btn-primary:hover:not(:disabled) {
			background: #e2e8f0;
			border-color: #e2e8f0;
		}

		.btn-danger {
			background: #450a0a;
			border-color: #7f1d1d;
			color: #fecaca;
		}

		.btn-danger:hover:not(:disabled) {
			background: #7f1d1d;
		}

		.btn-link {
			background: transparent;
			border-color: transparent;
			color: #60a5fa;
		}

		.field input {
			background: #0f172a;
			border-color: #334155;
			color: #e2e8f0;
		}

		.field input:disabled {
			background: #111827;
			color: #94a3b8;
		}

		.danger-card {
			background: linear-gradient(180deg, #1f0f10 0%, #111827 70%);
			border-color: #7f1d1d;
		}

		.danger-title {
			color: #fca5a5;
		}

		.session-time {
			color: #64748b;
		}

		.reset-message {
			color: #4ade80;
		}

		.drawer-inner code {
			background: #1e293b;
			color: #bfdbfe;
		}
	}
</style>
