<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Tooltip from '$lib/components/Tooltip.svelte';

	const shell = catalogShellPropsForSlug('/tooltip')!;

	const codeExplanation =
		'Tooltip wraps any focusable trigger and links the tooltip surface via aria-describedby, so screen readers announce the tip alongside the trigger\'s own label rather than replacing it. It listens for both pointer and focus events (so keyboard users see the tip when tabbing in) and dismisses on Escape while a tip is visible. Pass plain text via the text prop, or a tip snippet for rich content like keyboard hints.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Hover', 'Focus', 'Theme-aware']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="tip-demo">
			<section>
				<h3>Four placements</h3>
				<div class="placement-grid">
					<Tooltip text="Save your changes" placement="top">
						<button class="demo-btn">Top</button>
					</Tooltip>
					<Tooltip text="Open settings" placement="right">
						<button class="demo-btn">Right</button>
					</Tooltip>
					<Tooltip text="Permanent action" placement="bottom">
						<button class="demo-btn">Bottom</button>
					</Tooltip>
					<Tooltip text="Cancel and close" placement="left">
						<button class="demo-btn">Left</button>
					</Tooltip>
				</div>
			</section>

			<section>
				<h3>Keyboard accessible</h3>
				<p class="note">
					Tab to focus the button — the tooltip appears. Press <kbd>Esc</kbd> to dismiss while focused.
				</p>
				<Tooltip text="Triggered by hover OR keyboard focus">
					<button class="demo-btn">Try Tab + Esc</button>
				</Tooltip>
			</section>

			<section>
				<h3>Custom delays</h3>
				<div class="row">
					<Tooltip text="Instant" showDelay={0}>
						<button class="demo-btn">0ms</button>
					</Tooltip>
					<Tooltip text="Default — 200ms">
						<button class="demo-btn">200ms</button>
					</Tooltip>
					<Tooltip text="Slow — 800ms reveal" showDelay={800}>
						<button class="demo-btn">800ms</button>
					</Tooltip>
				</div>
			</section>

			<section>
				<h3>On an icon button</h3>
				<Tooltip text="Add to favourites">
					<button class="icon-btn" aria-label="Favourite">
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
						</svg>
					</button>
				</Tooltip>
			</section>

			<section>
				<h3>Rich content via snippet</h3>
				<Tooltip>
					{#snippet tip()}
						<strong style="display:block;margin-bottom:2px">Pro tip</strong>
						<span style="opacity:0.8">Press <kbd>Cmd+S</kbd> instead</span>
					{/snippet}
					<button class="demo-btn">Hover for richer tip</button>
				</Tooltip>
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
					<td><code>text</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Plain-text tooltip body. Ignored if <code>tip</code> snippet is provided.</td>
				</tr>
				<tr>
					<td><code>placement</code></td>
					<td><code>'top' | 'right' | 'bottom' | 'left'</code></td>
					<td><code>'top'</code></td>
					<td>Where the tooltip appears relative to the trigger.</td>
				</tr>
				<tr>
					<td><code>showDelay</code></td>
					<td><code>number</code></td>
					<td><code>200</code></td>
					<td>Delay before the tooltip appears (ms).</td>
				</tr>
				<tr>
					<td><code>hideDelay</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Delay before the tooltip hides on blur/leave.</td>
				</tr>
				<tr>
					<td><code>id</code></td>
					<td><code>string</code></td>
					<td>auto</td>
					<td>Override the generated id used in <code>aria-describedby</code>.</td>
				</tr>
				<tr>
					<td><code>tip</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>Render rich tooltip content instead of plain text.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td>—</td>
					<td>The trigger element to wrap.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tip-demo {
		display: grid;
		gap: 2.25rem;
	}

	.tip-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.5rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.85rem;
		color: var(--fg-2);
		font-size: 0.88rem;
	}

	.note kbd {
		display: inline-block;
		padding: 0 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 3px;
	}

	.placement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 2rem;
		padding: 2rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		justify-items: center;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.demo-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--fg-1);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
	}

	.demo-btn:hover,
	.demo-btn:focus-visible {
		filter: brightness(0.97);
		outline: none;
	}

	.demo-btn:focus-visible {
		box-shadow: 0 0 0 2px var(--brand, #3b82f6);
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		color: var(--brand, #f9a8d4);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		cursor: pointer;
	}

	.icon-btn:hover,
	.icon-btn:focus-visible {
		filter: brightness(0.97);
		outline: none;
	}
</style>
