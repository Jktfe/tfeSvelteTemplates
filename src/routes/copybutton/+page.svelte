<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import CopyButton from '$lib/components/CopyButton.svelte';

	const shell = catalogShellPropsForSlug('/copybutton')!;

	const apiKey = 'tfe_demo_4f8ab4d2e9c3401a9fd2b1c8e7d5a3f0';
	const inviteUrl = 'https://tfe-templates.example.com/invite/g7n2-x9k4';
	const sampleSnippet = `import CopyButton from '$lib/components/CopyButton.svelte';

<CopyButton value={apiKey} variant="icon" />`;

	let lastCopied = $state<string | null>(null);

	const codeExplanation =
		'CopyButton wraps navigator.clipboard.writeText, then flips a copied state for copiedDuration ms (default 2000). The success message lives in an aria-live region so screen readers announce it without moving focus. Variants control whether you see the icon, the label, or both — useful when packing a copy action into tight inline contexts like API key rows.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Clipboard', 'A11y', 'Live region', 'Zero deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="copy-demo">
			<section>
				<h3>Default — icon + text</h3>
				<CopyButton value="Hello, world" />
			</section>

			<section>
				<h3>Variants</h3>
				<div class="row">
					<CopyButton value="text variant" variant="text" label="Copy text" />
					<CopyButton value="both variant" variant="both" />
					<CopyButton value="icon variant" variant="icon" ariaLabel="Copy icon-only" />
				</div>
			</section>

			<section>
				<h3>Sizes</h3>
				<div class="row">
					<CopyButton value="sm" size="sm" label="Small" />
					<CopyButton value="md" size="md" label="Medium" />
					<CopyButton value="lg" size="lg" label="Large" />
				</div>
			</section>

			<section>
				<h3>In context — API key row</h3>
				<div class="key-row">
					<code>{apiKey}</code>
					<CopyButton value={apiKey} variant="icon" size="sm" ariaLabel="Copy API key" />
				</div>
				<p class="note">Click the icon to copy the API key.</p>
			</section>

			<section>
				<h3>With <code>onCopy</code> callback</h3>
				<CopyButton
					value={inviteUrl}
					label="Copy invite link"
					onCopy={(v) => (lastCopied = v)}
				/>
				{#if lastCopied}
					<p class="note">Last copied: <code>{lastCopied}</code></p>
				{/if}
			</section>

			<section>
				<h3>Custom labels &amp; faster reset</h3>
				<CopyButton
					value={sampleSnippet}
					label="Copy snippet"
					copiedLabel="Snippet copied"
					copiedDuration={1200}
				/>
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
					<td>—</td>
					<td>Required. The string written to the clipboard.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Copy'</code></td>
					<td>Idle button label.</td>
				</tr>
				<tr>
					<td><code>copiedLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Copied!'</code></td>
					<td>Label shown briefly after a successful copy.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'text' | 'icon' | 'both'</code></td>
					<td><code>'both'</code></td>
					<td>What to render in the button.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Padding and icon size.</td>
				</tr>
				<tr>
					<td><code>copiedDuration</code></td>
					<td><code>number</code></td>
					<td><code>2000</code></td>
					<td>How long the copied state holds (ms).</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Required when variant is icon-only.</td>
				</tr>
				<tr>
					<td><code>onCopy</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Fires after a successful copy.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.copy-demo {
		display: grid;
		gap: 2rem;
	}

	.copy-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.key-row {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-family: 'SF Mono', SFMono-Regular, Menlo, monospace;
		font-size: 0.85rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0.6rem 0 0;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.note code,
	.copy-demo h3 code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
