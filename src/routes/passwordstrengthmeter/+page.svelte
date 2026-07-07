<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import PasswordStrengthMeter from '$lib/components/PasswordStrengthMeter.svelte';

	const shell = catalogShellPropsForSlug('/passwordstrengthmeter')!;

	// Interactive playground — a real input drives the meter.
	let password = $state('');

	// Custom rule set for the second variant: a shorter, product-specific policy.
	const custard = [
		{ id: 'length', label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
		{ id: 'mixed', label: 'Upper and lowercase', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
		{ id: 'number', label: 'A number', test: (v: string) => /\d/.test(v) }
	];

	const codeExplanation =
		'PasswordStrengthMeter is a pure function of its `value`: it runs each rule’s predicate, counts the passes, and maps the fraction onto four buckets (Weak/Fair/Good/Strong). It renders a segmented bar, a concise aria-live status line — which never contains the password itself — and an optional tick/cross checklist whose state is also carried in visually-hidden text. It deliberately does NOT own the input; consumers bind their own field and pass the value in, keeping the meter portable and side-effect free.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Zero-deps', 'Forms']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="psm-demo">
			<section class="psm-section">
				<h4>Interactive playground — type to score</h4>
				<div class="psm-field">
					<label class="psm-field-label" for="psm-play">Password</label>
					<input
						id="psm-play"
						class="psm-input"
						type="text"
						autocomplete="off"
						placeholder="Try: Abcdef1!"
						bind:value={password}
					/>
				</div>
				<PasswordStrengthMeter value={password} />
				<p class="psm-note">
					The input is yours — the meter just reads <code>value</code>. Nothing is stored or announced
					aloud except the strength word.
				</p>
			</section>

			<section class="psm-section">
				<h4>Bar only — checklist hidden</h4>
				<PasswordStrengthMeter value={password} showChecklist={false} />
				<p class="psm-note">
					<code>showChecklist=&#123;false&#125;</code> — a compact inline indicator sharing the same
					typed value.
				</p>
			</section>

			<section class="psm-section">
				<h4>Pre-filled strong password + custom rules</h4>
				<PasswordStrengthMeter value="Tr0ub4dour&3xtra" rules={custard} />
				<p class="psm-note">
					A three-rule policy (12 chars · mixed case · a number). Fraction-based scoring still lands
					cleanly on Strong.
				</p>
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
					<td>The password to score. Read-only — the meter does not own the input.</td>
				</tr>
				<tr>
					<td><code>rules</code></td>
					<td><code>PasswordRule[]</code></td>
					<td><code>5 default rules</code></td>
					<td>Override the rule set. Any length; scoring adapts to the total.</td>
				</tr>
				<tr>
					<td><code>showChecklist</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the per-rule pass/fail list.</td>
				</tr>
				<tr>
					<td><code>showLabel</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show the Weak/Fair/Good/Strong aria-live status line.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.psm-demo {
		display: grid;
		gap: 22px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.psm-section {
		display: grid;
		gap: 12px;
		padding-bottom: 22px;
		border-bottom: 1px solid var(--border);
	}
	.psm-section:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.psm-section h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.psm-field {
		display: grid;
		gap: 6px;
		max-width: 340px;
	}
	.psm-field-label {
		font-size: 12px;
		color: var(--fg-3);
	}
	.psm-input {
		width: 100%;
		padding: 8px 12px;
		font-size: 14px;
		font-family: var(--font-mono);
		color: var(--fg-1);
		background: var(--surface-2, transparent);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.psm-input:focus-visible {
		outline: 2px solid var(--accent, #3b82f6);
		outline-offset: 1px;
	}
	.psm-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.psm-note code {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
</style>
