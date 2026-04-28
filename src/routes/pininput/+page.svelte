<script lang="ts">
	import PinInput from '$lib/components/PinInput.svelte';

	let code4 = $state('');
	let code6 = $state('');
	let pin = $state('');
	let invite = $state('');

	let mfaCode = $state('');
	let mfaStatus = $state<'idle' | 'verifying' | 'success' | 'error'>('idle');

	async function verifyMfa(value: string) {
		mfaStatus = 'verifying';
		// Simulate a network call. The "correct" code in this demo is 123456.
		await new Promise((resolve) => setTimeout(resolve, 700));
		mfaStatus = value === '123456' ? 'success' : 'error';
	}

	function resetMfa() {
		mfaCode = '';
		mfaStatus = 'idle';
	}
</script>

<svelte:head>
	<title>PinInput · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>🔢 PinInput</h1>
		<p>
			Segmented N-cell input for one-time codes. Auto-advance on type, Backspace-back on empty,
			paste a full code to distribute across cells. Optional native masking via
			<code>type="password"</code>. <code>autocomplete="one-time-code"</code> lets iOS / Android
			suggest the SMS-delivered code.
		</p>
	</header>

	<section class="demo">
		<h2>4-digit OTP (default)</h2>
		<p class="demo-note">
			The classic SMS one-time code shape. Type any digits — focus advances automatically.
			Backspace on an empty cell jumps back.
		</p>
		<PinInput bind:value={code4} ariaLabel="4-digit code" />
		<p class="value-readout">Current value: <code>{code4 || '(empty)'}</code></p>
	</section>

	<section class="demo">
		<h2>6-digit MFA code</h2>
		<p class="demo-note">Common shape for authenticator apps and longer SMS codes.</p>
		<PinInput length={6} bind:value={code6} ariaLabel="6-digit code" />
		<p class="value-readout">Current value: <code>{code6 || '(empty)'}</code></p>
	</section>

	<section class="demo">
		<h2>Masked PIN</h2>
		<p class="demo-note">
			Use <code>mask</code> for security PINs. The browser renders bullets (via
			<code>type="password"</code>) but the actual value is preserved internally.
		</p>
		<PinInput length={4} mask bind:value={pin} ariaLabel="PIN" />
		<p class="value-readout">Current value: <code>{pin || '(empty)'}</code></p>
	</section>

	<section class="demo">
		<h2>Alphanumeric invite code</h2>
		<p class="demo-note">
			Set <code>type="alphanumeric"</code> to accept letters and digits. Useful for invite or
			referral codes.
		</p>
		<PinInput length={6} type="alphanumeric" bind:value={invite} ariaLabel="Invite code" />
		<p class="value-readout">Current value: <code>{invite || '(empty)'}</code></p>
	</section>

	<section class="demo">
		<h2>Sizes</h2>
		<p class="demo-note">
			Three cap sizes — <code>sm</code> (32×36px), <code>md</code> (44×52px, default),
			<code>lg</code> (56×64px).
		</p>
		<div class="row">
			<div class="row-label">sm</div>
			<PinInput length={4} size="sm" />
		</div>
		<div class="row">
			<div class="row-label">md</div>
			<PinInput length={4} size="md" />
		</div>
		<div class="row">
			<div class="row-label">lg</div>
			<PinInput length={4} size="lg" />
		</div>
	</section>

	<section class="demo">
		<h2>Disabled</h2>
		<p class="demo-note">
			<code>disabled</code> blocks input and focus at the platform level (real
			<code>disabled</code> attribute, not just CSS).
		</p>
		<PinInput length={4} disabled value="1234" />
	</section>

	<section class="demo demo-mfa">
		<h2>Live MFA flow</h2>
		<p class="demo-note">
			Wires <code>onComplete</code> to a fake "verify" call. Try <code>123456</code> for success,
			anything else fails. Notice how filling the last cell automatically triggers verification.
		</p>
		<PinInput length={6} bind:value={mfaCode} onComplete={verifyMfa} ariaLabel="MFA code" />
		<div class="mfa-status">
			{#if mfaStatus === 'idle'}
				<p class="status status-idle">Enter your 6-digit code</p>
			{:else if mfaStatus === 'verifying'}
				<p class="status status-verifying">⏳ Verifying…</p>
			{:else if mfaStatus === 'success'}
				<p class="status status-success">✅ Code verified successfully</p>
				<button class="reset-btn" onclick={resetMfa}>Try another</button>
			{:else}
				<p class="status status-error">
					❌ Invalid code. Try <code>123456</code>.
				</p>
				<button class="reset-btn" onclick={resetMfa}>Reset</button>
			{/if}
		</div>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>✅ Auto-advance on type, Backspace-back on empty</li>
			<li>✅ Paste a full code → cells distribute automatically</li>
			<li>✅ Numeric or alphanumeric, mobile keypad via <code>inputmode</code></li>
			<li>✅ Optional <code>mask</code> renders bullets via <code>type="password"</code></li>
			<li>✅ Three sizes (<code>sm</code> / <code>md</code> / <code>lg</code>)</li>
			<li>✅ Two-way <code>bind:value</code> exposes joined string</li>
			<li>✅ <code>onComplete(value)</code> fires when filled</li>
			<li>✅ <code>autocomplete="one-time-code"</code> for iOS / Android SMS</li>
			<li>✅ Disabled state at the input level</li>
			<li>✅ Zero dependencies, fully copy-paste portable</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import PinInput from '$lib/components/PinInput.svelte';

  let code = $state('');

  function verify(value: string) {
    console.log('Verify code:', value);
  }
</`+`script>

<!-- 4-digit OTP -->
<PinInput bind:value={code} onComplete={verify} />

<!-- 6-digit MFA -->
<PinInput length={6} bind:value={code} />

<!-- Masked PIN -->
<PinInput length={4} mask bind:value={pin} />

<!-- Alphanumeric invite code -->
<PinInput length={6} type="alphanumeric" bind:value={code} />`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.25rem;
		margin: 0 0 0.5rem;
	}

	.page-header p {
		color: #4b5563;
		max-width: 42rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2,
	.features h2,
	.usage h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.demo-note {
		color: #6b7280;
		font-size: 0.95rem;
		margin: 0 0 1.25rem;
		max-width: 42rem;
	}

	.demo-note code,
	.features code,
	.value-readout code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.value-readout {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.row-label {
		width: 3rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.demo-mfa {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.mfa-status {
		margin-top: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status {
		margin: 0;
		font-size: 0.95rem;
	}

	.status-idle {
		color: #6b7280;
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
		font-size: 0.875rem;
		background: #ffffff;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		color: #374151;
	}

	.reset-btn:hover {
		background: #f3f4f6;
	}

	.features ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 0.5rem 1.25rem;
		color: #374151;
	}

	.features li {
		line-height: 1.6;
	}

	.usage pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
