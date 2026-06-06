<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	const shell = catalogShellPropsForSlug('richtexteditor')!;

	// Variant 1 — blank editor; show the sanitised output live.
	let blankHtml = $state('');

	// Variant 2 — seeded with formatting so the toolbar shows active state.
	let seededHtml = $state(
		'<h2>Release notes</h2><p>We shipped <strong>three</strong> fixes and one <em>shiny</em> feature. See the <a href="https://example.com">changelog</a>.</p><ul><li>Faster cold start</li><li>Dark-mode polish</li></ul>'
	);

	// Variant 3 — read-only / disabled.
	const lockedHtml =
		'<h2>Locked draft</h2><p>This editor is <strong>disabled</strong> — useful for read-only previews.</p>';

	const codeExplanation =
		'The editor is a single contenteditable region driven by document.execCommand for formatting (deprecated but still universally implemented). On every edit it parses its own innerHTML inside a detached, inert document, walks the tree against a strict tag allowlist — keeping b/i/u/strong/em/a[href]/h2/ul/ol/li/p/br, unwrapping everything else, and rejecting unsafe link schemes — then emits the cleaned HTML through a bindable value and an onChange callback.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-dependency', 'Sanitised HTML']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="rte-demo">
			<section class="rte-demo-block">
				<h3>Blank editor with live output</h3>
				<p class="rte-demo-hint">
					Type, then format with the toolbar. The sanitised HTML the component emits appears below.
				</p>
				<RichTextEditor bind:value={blankHtml} placeholder="Write something brilliant…" />
				<div class="rte-demo-state">
					<span class="rte-demo-label">Sanitised output</span>
					<pre class="rte-demo-code">{blankHtml || '(empty)'}</pre>
				</div>
			</section>

			<section class="rte-demo-block">
				<h3>Seeded content</h3>
				<p class="rte-demo-hint">
					Pre-filled with a heading, bold/italic runs, a link and a bullet list. Place the caret
					inside formatted text to see the toolbar reflect the active state.
				</p>
				<RichTextEditor bind:value={seededHtml} />
			</section>

			<section class="rte-demo-block">
				<h3>Disabled (read-only)</h3>
				<p class="rte-demo-hint">
					With <code>disabled</code> the surface is greyed, the toolbar is inert and the region is
					no longer editable.
				</p>
				<RichTextEditor value={lockedHtml} disabled />
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
					<td><code>string</code> (bindable)</td>
					<td><code>''</code></td>
					<td>Sanitised HTML content. Reading gives clean HTML; setting it (while unfocused) replaces the editor body.</td>
				</tr>
				<tr>
					<td><code>placeholder</code></td>
					<td><code>string</code></td>
					<td><code>'Start writing…'</code></td>
					<td>Shown when the editor has no meaningful content.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(html: string) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Fires with the sanitised HTML after each edit that changes the content.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Rich text editor'</code></td>
					<td>Accessible name for the editable region.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disables editing and the toolbar; greys the surface.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.rte-demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.rte-demo-block h3 {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 700;
	}

	.rte-demo-hint {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
		opacity: 0.75;
		max-width: 60ch;
	}

	.rte-demo-state {
		margin-top: 0.75rem;
	}

	.rte-demo-label {
		display: block;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.6;
		margin-bottom: 0.3rem;
	}

	.rte-demo-code {
		margin: 0;
		padding: 0.6rem 0.75rem;
		border-radius: 0.5rem;
		background: light-dark(#f3f4f6, #1c1f26);
		border: 1px solid light-dark(#e2e5ea, #2c313a);
		font-size: 0.82rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
		overflow-x: auto;
	}

	@media (max-width: 640px) {
		.rte-demo {
			gap: 1.5rem;
		}
	}
</style>
