<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import AlertBanner from '$lib/components/AlertBanner.svelte';

	const shell = catalogShellPropsForSlug('/alertbanner')!;

	let errorVisible = $state(true);
	let warningVisible = $state(true);
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Inline', 'A11y', 'Zero deps']}
	codeExplanation="AlertBanner is an inline status banner — it lives in the page flow, not in a toast layer. Each variant ships its own colour palette and inline SVG icon. The component picks the right ARIA role automatically (assertive role='alert' for warning/error, polite role='status' for info/success), so screen readers announce critical issues immediately and informational notes politely. Pass dismissable to add an × button, and a children snippet to nest links or buttons inside the banner."
>
	{#snippet demo()}
		<div class="ab-stack">
			<AlertBanner variant="info" title="Heads up" message="A scheduled maintenance window starts at 02:00 GMT." />
			<AlertBanner variant="success" title="Saved!" message="Your changes are live." />
			<AlertBanner variant="warning" title="Trial ending" message="Your trial ends in 3 days. Upgrade to keep your data." />
			<AlertBanner variant="error" title="Save failed" message="We couldn't reach the server. Please try again." />

			{#if errorVisible}
				<AlertBanner
					variant="error"
					title="Connection lost"
					message="We've stopped syncing your changes."
					dismissable
					onDismiss={() => (errorVisible = false)}
				/>
			{:else}
				<button class="ab-restore" type="button" onclick={() => (errorVisible = true)}>Restore the error banner</button>
			{/if}

			{#if warningVisible}
				<AlertBanner
					variant="warning"
					message="You're about to delete 3 items. This cannot be undone."
					dismissable
					onDismiss={() => (warningVisible = false)}
				/>
			{:else}
				<button class="ab-restore" type="button" onclick={() => (warningVisible = true)}>Restore the warning banner</button>
			{/if}

			<AlertBanner variant="info" title="A new version is available">
				<a class="ab-link ab-link--bold" href="#refresh">Refresh now</a>
				<a class="ab-link" href="#changelog">See what's new</a>
			</AlertBanner>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>variant</code></td>
					<td><code>"info" | "success" | "warning" | "error"</code></td>
					<td><code>"info"</code></td>
					<td>Tone — drives the colour palette, icon, and ARIA role.</td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Optional bold heading rendered above the message.</td>
				</tr>
				<tr>
					<td><code>message</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Body copy of the banner. Optional if you supply a children snippet.</td>
				</tr>
				<tr>
					<td><code>dismissable</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Render a trailing × button that calls onDismiss.</td>
				</tr>
				<tr>
					<td><code>onDismiss</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Callback fired when the dismiss button is pressed.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Optional inline content (links, buttons) rendered inside the banner.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ab-stack {
		display: grid;
		gap: 12px;
	}
	.ab-restore {
		justify-self: start;
		padding: 6px 10px;
		font: 500 13px var(--font-sans);
		color: var(--accent);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		cursor: pointer;
	}
	.ab-restore:hover {
		background: var(--surface-2);
	}
	.ab-link {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: 13px;
	}
	.ab-link--bold { font-weight: 600; }
</style>
