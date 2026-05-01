<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import PinInput from '$lib/components/PinInput.svelte';

	const shell = catalogShellPropsForSlug('/pininput')!;

	let code4 = $state('');
	let code6 = $state('');
	let pin = $state('');
	let invite = $state('');

	let mfaCode = $state('');
	let mfaStatus = $state<'idle' | 'verifying' | 'success' | 'error'>('idle');

	async function verifyMfa(value: string) {
		mfaStatus = 'verifying';
		await new Promise((resolve) => setTimeout(resolve, 700));
		mfaStatus = value === '123456' ? 'success' : 'error';
	}

	function resetMfa() {
		mfaCode = '';
		mfaStatus = 'idle';
	}

	const codeExplanation =
		'Each cell is a real input, so keyboard, paste, and autofill semantics come from the platform. Typing advances focus, Backspace on an empty cell jumps back, and a multi-character paste fans out across the cells in one operation. Setting type="numeric" pairs with inputmode and autocomplete="one-time-code" so iOS and Android offer SMS-delivered codes automatically.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'OTP', 'A11y', 'Mobile', 'Zero deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pin-demo">
			<section>
				<h3>4-digit OTP</h3>
				<p class="note">
					The classic SMS one-time-code shape. Type any digits — focus advances automatically.
				</p>
				<PinInput bind:value={code4} ariaLabel="4-digit code" />
				<p class="readout">Value: <code>{code4 || '(empty)'}</code></p>
			</section>

			<section>
				<h3>6-digit MFA</h3>
				<p class="note">Common shape for authenticator apps and longer SMS codes.</p>
				<PinInput length={6} bind:value={code6} ariaLabel="6-digit code" />
				<p class="readout">Value: <code>{code6 || '(empty)'}</code></p>
			</section>

			<section>
				<h3>Masked PIN</h3>
				<p class="note">
					<code>mask</code> renders bullets via <code>type="password"</code>. The internal value is preserved.
				</p>
				<PinInput length={4} mask bind:value={pin} ariaLabel="PIN" />
				<p class="readout">Value: <code>{pin || '(empty)'}</code></p>
			</section>

			<section>
				<h3>Alphanumeric invite</h3>
				<p class="note">Set <code>type="alphanumeric"</code> to accept letters and digits.</p>
				<PinInput length={6} type="alphanumeric" bind:value={invite} ariaLabel="Invite code" />
				<p class="readout">Value: <code>{invite || '(empty)'}</code></p>
			</section>

			<section>
				<h3>Sizes</h3>
				<p class="note"><code>sm</code>, <code>md</code> (default), <code>lg</code>.</p>
				<div class="row"><span class="row-label">sm</span><PinInput length={4} size="sm" /></div>
				<div class="row"><span class="row-label">md</span><PinInput length={4} size="md" /></div>
				<div class="row"><span class="row-label">lg</span><PinInput length={4} size="lg" /></div>
			</section>

			<section class="mfa-card">
				<h3>Live MFA flow</h3>
				<p class="note">
					Wires <code>onComplete</code> to a fake "verify" call. Try <code>123456</code> for success.
				</p>
				<PinInput length={6} bind:value={mfaCode} onComplete={verifyMfa} ariaLabel="MFA code" />
				<div class="mfa-status">
					{#if mfaStatus === 'idle'}
						<p class="status status-idle">Enter your 6-digit code</p>
					{:else if mfaStatus === 'verifying'}
						<p class="status status-verifying">⏳ Verifying…</p>
					{:else if mfaStatus === 'success'}
						<p class="status status-success">✅ Code verified</p>
						<button class="reset-btn" onclick={resetMfa}>Try another</button>
					{:else}
						<p class="status status-error">❌ Invalid code. Try <code>123456</code>.</p>
						<button class="reset-btn" onclick={resetMfa}>Reset</button>
					{/if}
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr>
					<th>Prop</th>
					<th>Type</th>
					<th>Default</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>value</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Bindable joined value of all cells.</td>
				</tr>
				<tr>
					<td><code>length</code></td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Number of cells (commonly 4, 6, or 8).</td>
				</tr>
				<tr>
					<td><code>type</code></td>
					<td><code>'numeric' | 'alphanumeric'</code></td>
					<td><code>'numeric'</code></td>
					<td>Allowed character class. Sets <code>inputmode</code> and pattern.</td>
				</tr>
				<tr>
					<td><code>mask</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render bullets via <code>type="password"</code>.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Cell size — 32, 44, or 56px wide respectively.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Block input and focus at the platform level.</td>
				</tr>
				<tr>
					<td><code>autoFocus</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Focus the first cell on mount.</td>
				</tr>
				<tr>
					<td><code>onComplete</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires once every cell is filled.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Verification code'</code></td>
					<td>Label used by the wrapper for screen readers.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pin-demo {
		display: grid;
		gap: 1.75rem;
	}

	.pin-demo h3 {
		font-size: 1rem;
		margin: 0 0 0.4rem;
		color: var(--fg-1);
	}

	.note {
		color: var(--fg-2);
		font-size: 0.9rem;
		margin: 0 0 0.85rem;
		max-width: 42rem;
		line-height: 1.55;
	}

	.note code,
	.readout code,
	.status code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.readout {
		margin-top: 0.6rem;
		font-size: 0.85rem;
		color: var(--fg-2);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.row-label {
		width: 2.5rem;
		font-size: 0.85rem;
		color: var(--fg-2);
		font-weight: 500;
	}

	.mfa-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.mfa-status {
		margin-top: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status {
		margin: 0;
		font-size: 0.95rem;
	}

	.status-idle {
		color: var(--fg-2);
	}

	.status-verifying {
		color: #2563eb;
	}

	.status-success {
		color: #059669;
		font-weight: 600;
	}

	.status-error {
		color: #dc2626;
	}

	.reset-btn {
		padding: 0.4rem 0.85rem;
		font-size: 0.85rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		color: var(--fg-1);
	}

	.reset-btn:hover {
		filter: brightness(0.97);
	}
</style>
