<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Spinner from '$lib/components/Spinner.svelte';

	const shell = catalogShellPropsForSlug('/spinner')!;

	let submitState = $state<'idle' | 'loading' | 'success'>('idle');
	function fakeSubmit() {
		if (submitState !== 'idle') return;
		submitState = 'loading';
		setTimeout(() => {
			submitState = 'success';
			setTimeout(() => (submitState = 'idle'), 1200);
		}, 1500);
	}

	let overlayVisible = $state(false);
	function showOverlay() {
		overlayVisible = true;
		setTimeout(() => (overlayVisible = false), 2200);
	}
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Loading', 'CSS-only', 'Theme-aware']}
	codeExplanation="Spinner ships four pure-CSS variants — ring, dots, bars, and pulse — driven by @keyframes only. By default it inherits currentColor, so dropping it inside any coloured parent just works. The optional label prop renders a visible caption and is reused as aria-label so screen readers don't double-announce. role='status' + aria-live='polite' tells assistive tech to mention the change without interrupting. Under prefers-reduced-motion the animation softens to a calm fade."
>
	{#snippet demo()}
		<div class="sp-stack">
			<section class="sp-card">
				<h3 class="sp-h3">Variants</h3>
				<div class="sp-grid">
					<div class="sp-cell"><Spinner variant="ring" size="lg" /><span class="sp-cap">ring</span></div>
					<div class="sp-cell"><Spinner variant="dots" size="lg" /><span class="sp-cap">dots</span></div>
					<div class="sp-cell"><Spinner variant="bars" size="lg" /><span class="sp-cap">bars</span></div>
					<div class="sp-cell"><Spinner variant="pulse" size="lg" /><span class="sp-cap">pulse</span></div>
				</div>
			</section>

			<section class="sp-card">
				<h3 class="sp-h3">Sizes &amp; labels</h3>
				<div class="sp-row">
					<Spinner size="sm" />
					<Spinner size="md" />
					<Spinner size="lg" />
				</div>
				<div class="sp-row sp-row--col">
					<Spinner label="Loading data" />
					<Spinner variant="dots" label="Saving changes" />
					<Spinner variant="bars" label="Processing audio" />
				</div>
			</section>

			<section class="sp-card">
				<h3 class="sp-h3">Custom colour</h3>
				<div class="sp-row">
					<Spinner size="lg" color="#10b981" />
					<Spinner size="lg" color="#3b82f6" variant="dots" />
					<Spinner size="lg" color="#f59e0b" variant="bars" />
					<Spinner size="lg" color="#ef4444" variant="pulse" />
				</div>
			</section>

			<section class="sp-card">
				<h3 class="sp-h3">Inside a button</h3>
				<button
					class="sp-submit"
					class:loading={submitState === 'loading'}
					class:success={submitState === 'success'}
					disabled={submitState !== 'idle'}
					onclick={fakeSubmit}
				>
					{#if submitState === 'loading'}
						<Spinner size="sm" /> <span>Submitting…</span>
					{:else if submitState === 'success'}
						<span>✓ Saved</span>
					{:else}
						<span>Submit form</span>
					{/if}
				</button>

				<button class="sp-ghost" onclick={showOverlay}>Show full-page overlay (2.2s)</button>
				{#if overlayVisible}
					<div class="sp-overlay" role="presentation">
						<Spinner variant="ring" size="lg" label="Loading dashboard" />
					</div>
				{/if}
			</section>
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
					<td><code>"ring" | "dots" | "bars" | "pulse"</code></td>
					<td><code>"ring"</code></td>
					<td>Visual style of the spinner animation.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>16px / 24px / 36px. Sized in em so labels scale too.</td>
				</tr>
				<tr>
					<td><code>color</code></td>
					<td><code>string</code></td>
					<td><code>currentColor</code></td>
					<td>Override the inherited colour with any CSS colour.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Visible caption rendered alongside the spinner.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>derived from label</td>
					<td>Accessible name when label is empty.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sp-stack { display: grid; gap: 16px; }
	.sp-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.sp-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.sp-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 14px;
	}
	.sp-cell {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 18px 12px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		color: var(--accent);
	}
	.sp-cap {
		font: 12px var(--font-mono);
		color: var(--fg-3);
	}
	.sp-row {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		align-items: center;
	}
	.sp-row--col {
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	}
	.sp-submit {
		align-self: start;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		background: var(--accent);
		color: #fff;
		border: 0;
		border-radius: var(--r-2);
		font: 500 14px var(--font-sans);
		cursor: pointer;
		min-width: 11rem;
		justify-content: center;
	}
	.sp-submit:disabled { cursor: progress; opacity: 0.85; }
	.sp-submit.success { background: #059669; }
	.sp-ghost {
		align-self: start;
		padding: 8px 14px;
		background: var(--surface-2);
		color: var(--fg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font: 500 13px var(--font-sans);
		cursor: pointer;
	}
	.sp-overlay {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.55);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		z-index: 100;
	}
</style>
