<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import SplitPane from '$lib/components/SplitPane.svelte';

	const shell = catalogShellPropsForSlug('/splitpane')!;

	let horizontalSize = $state(45);
	let verticalSize = $state(35);
	let editorSize = $state(55);

	// A tiny bit of fake source + preview for the code-editor variant.
	const sourceCode = `<h1>Hello, world</h1>
<p>Edit the markup on the left —
   the preview keeps pace on the right.</p>
<button>Ship it</button>`;

	const codeExplanation =
		'SplitPane is a flexbox with a draggable divider between two panes. The first pane gets flex-basis:{size}% while the second pane flexes to fill the rest, so the divider position is a single bound percentage. Pointer drags use setPointerCapture — every pointermove keeps flowing to the divider even when the cursor outruns it — and each move maps the pointer onto the container box to recompute the percentage. The divider is role="separator" with tabindex 0 and live aria-valuenow/min/max, so Arrow keys nudge the size along the split axis and Home/End jump to the clamps. Every write funnels through one clamp, so the size can never escape [min, max].';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Zero-deps', 'Bindable', 'Layout']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="sp-demo">
			<section class="sp-block">
				<h4>Horizontal — side-by-side</h4>
				<p class="sp-note">
					Drag the vertical bar or focus it and press <kbd>←</kbd> / <kbd>→</kbd>.
					Current: <code>{Math.round(horizontalSize)}%</code>
				</p>
				<div class="sp-stage sp-stage--h">
					<SplitPane direction="horizontal" bind:size={horizontalSize} min={20} max={80}>
						{#snippet start()}
							<div class="sp-fill sp-fill--a">
								<strong>Pane A</strong>
								<span>{Math.round(horizontalSize)}%</span>
							</div>
						{/snippet}
						{#snippet end()}
							<div class="sp-fill sp-fill--b">
								<strong>Pane B</strong>
								<span>{Math.round(100 - horizontalSize)}%</span>
							</div>
						{/snippet}
					</SplitPane>
				</div>
			</section>

			<section class="sp-block">
				<h4>Vertical — stacked</h4>
				<p class="sp-note">
					Divider slides up/down. Focus it and use <kbd>↑</kbd> / <kbd>↓</kbd>,
					or <kbd>Home</kbd> / <kbd>End</kbd> to jump to the clamps.
					Current: <code>{Math.round(verticalSize)}%</code>
				</p>
				<div class="sp-stage sp-stage--v">
					<SplitPane direction="vertical" bind:size={verticalSize} min={15} max={85}>
						{#snippet start()}
							<div class="sp-fill sp-fill--a">
								<strong>Top</strong>
								<span>{Math.round(verticalSize)}%</span>
							</div>
						{/snippet}
						{#snippet end()}
							<div class="sp-fill sp-fill--b">
								<strong>Bottom</strong>
								<span>{Math.round(100 - verticalSize)}%</span>
							</div>
						{/snippet}
					</SplitPane>
				</div>
			</section>

			<section class="sp-block">
				<h4>In context — editor + live preview</h4>
				<p class="sp-note">
					The everyday use: source on the left, rendered output on the right.
				</p>
				<div class="sp-stage sp-stage--h">
					<SplitPane direction="horizontal" bind:size={editorSize} min={25} max={75} initial={55}>
						{#snippet start()}
							<div class="sp-editor">
								<div class="sp-editor-bar">index.html</div>
								<pre class="sp-editor-code">{sourceCode}</pre>
							</div>
						{/snippet}
						{#snippet end()}
							<div class="sp-preview">
								<div class="sp-preview-bar">Preview</div>
								<div class="sp-preview-body">
									<h1>Hello, world</h1>
									<p>Edit the markup on the left — the preview keeps pace on the right.</p>
									<button type="button">Ship it</button>
								</div>
							</div>
						{/snippet}
					</SplitPane>
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
					<td><code>direction</code></td>
					<td><code>'horizontal' | 'vertical'</code></td>
					<td><code>'horizontal'</code></td>
					<td>Side-by-side (horizontal) or stacked (vertical) layout.</td>
				</tr>
				<tr>
					<td><code>initial</code></td>
					<td><code>number</code></td>
					<td><code>50</code></td>
					<td>Starting size of the first pane, as a percentage.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number</code></td>
					<td><code>initial</code></td>
					<td>Bindable current size of the first pane (%).</td>
				</tr>
				<tr>
					<td><code>min</code></td>
					<td><code>number</code></td>
					<td><code>10</code></td>
					<td>Lowest the first pane may shrink to (%).</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>90</code></td>
					<td>Largest the first pane may grow to (%).</td>
				</tr>
				<tr>
					<td><code>step</code></td>
					<td><code>number</code></td>
					<td><code>2</code></td>
					<td>Percent moved per Arrow-key press.</td>
				</tr>
				<tr>
					<td><code>start</code></td>
					<td><code>Snippet</code></td>
					<td><code>—</code></td>
					<td>Content rendered in the first pane.</td>
				</tr>
				<tr>
					<td><code>end</code></td>
					<td><code>Snippet</code></td>
					<td><code>—</code></td>
					<td>Content rendered in the second pane.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Resize panes'</code></td>
					<td>Accessible name announced for the divider.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra classes on the root element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sp-demo {
		display: grid;
		gap: 28px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sp-block {
		display: grid;
		gap: 10px;
	}
	.sp-block h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.sp-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.sp-note code {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.sp-note kbd {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		padding: 0 5px;
	}

	/* The stages give each SplitPane a concrete box to fill. */
	.sp-stage {
		border-radius: var(--r-2);
		overflow: hidden;
	}
	.sp-stage--h {
		height: 220px;
	}
	.sp-stage--v {
		height: 300px;
	}

	/* Filler panes for the two abstract demos. */
	.sp-fill {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-size: 13px;
	}
	.sp-fill strong {
		font-size: 14px;
		color: var(--fg-1);
	}
	.sp-fill span {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--fg-3);
	}
	.sp-fill--a {
		background: color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
	}
	.sp-fill--b {
		background: var(--surface-2);
	}

	/* Editor + preview variant. */
	.sp-editor,
	.sp-preview {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.sp-editor-bar,
	.sp-preview-bar {
		flex: 0 0 auto;
		padding: 6px 12px;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
	}
	.sp-editor-code {
		flex: 1 1 auto;
		margin: 0;
		padding: 12px;
		overflow: auto;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.6;
		color: var(--fg-1);
		white-space: pre-wrap;
	}
	.sp-preview-body {
		flex: 1 1 auto;
		padding: 16px;
		overflow: auto;
	}
	.sp-preview-body h1 {
		margin: 0 0 8px;
		font-size: 20px;
		color: var(--fg-1);
	}
	.sp-preview-body p {
		margin: 0 0 12px;
		font-size: 13px;
		color: var(--fg-2);
	}
	.sp-preview-body button {
		font-size: 13px;
		padding: 6px 14px;
		border-radius: var(--r-1);
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-1);
		cursor: pointer;
	}
</style>
