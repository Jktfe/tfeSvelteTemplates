<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ScrollProgressBar from '$lib/components/ScrollProgressBar.svelte';

	const shell = catalogShellPropsForSlug('/scrollprogressbar')!;

	let activeVariant = $state<'thin' | 'bold' | 'gradient' | 'pulse'>('gradient');
	let activePosition = $state<'top' | 'bottom'>('top');
	let activeColor = $state('#6366f1');

	const variantOptions: Array<{ id: 'thin' | 'bold' | 'gradient' | 'pulse'; label: string }> = [
		{ id: 'thin', label: 'Thin (2px)' },
		{ id: 'bold', label: 'Bold (6px)' },
		{ id: 'gradient', label: 'Gradient flow' },
		{ id: 'pulse', label: 'Pulse glow' }
	];

	const positionOptions: Array<{ id: 'top' | 'bottom'; label: string }> = [
		{ id: 'top', label: 'Top edge' },
		{ id: 'bottom', label: 'Bottom edge' }
	];

	const colorPresets = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

	const codeExplanation =
		'ScrollProgressBar attaches a single passive scroll listener and updates a CSS custom property per requestAnimationFrame tick. The fill itself is a CSS width transition (80ms linear) so the bar smooths between rAF samples without visible jitter. The wrapper has pointer-events: none so it never intercepts clicks. role="progressbar" + aria-valuenow keeps screen-reader users informed regardless of variant.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ScrollProgressBar variant={activeVariant} position={activePosition} color={activeColor} />

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'rAF', 'Long-form']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="spb-demo">
			<p class="spb-lede">
				Scroll this page to see the live bar at the {activePosition} of the viewport. All controls
				below update the same instance — try each variant and colour preset.
			</p>

			<div class="spb-controls">
				<div class="spb-control">
					<span class="spb-control__label">Variant</span>
					<div class="spb-buttons">
						{#each variantOptions as opt (opt.id)}
							<button
								class="spb-btn"
								class:spb-btn--active={activeVariant === opt.id}
								onclick={() => (activeVariant = opt.id)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="spb-control">
					<span class="spb-control__label">Position</span>
					<div class="spb-buttons">
						{#each positionOptions as opt (opt.id)}
							<button
								class="spb-btn"
								class:spb-btn--active={activePosition === opt.id}
								onclick={() => (activePosition = opt.id)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<div class="spb-control">
					<span class="spb-control__label">Colour</span>
					<div class="spb-buttons">
						{#each colorPresets as preset (preset)}
							<button
								class="spb-swatch"
								class:spb-swatch--active={activeColor === preset}
								style:--swatch={preset}
								onclick={() => (activeColor = preset)}
								aria-label="Use colour {preset}"
							></button>
						{/each}
					</div>
				</div>
			</div>

			<div class="spb-variants">
				<div class="spb-variant">
					<h4>thin</h4>
					<div class="spb-static">
						<div
							class="spb-static__bar spb-static__bar--thin"
							style:--demo-color={activeColor}
						></div>
					</div>
				</div>
				<div class="spb-variant">
					<h4>bold</h4>
					<div class="spb-static">
						<div
							class="spb-static__bar spb-static__bar--bold"
							style:--demo-color={activeColor}
						></div>
					</div>
				</div>
				<div class="spb-variant">
					<h4>gradient</h4>
					<div class="spb-static">
						<div
							class="spb-static__bar spb-static__bar--gradient"
							style:--demo-color={activeColor}
						></div>
					</div>
				</div>
				<div class="spb-variant">
					<h4>pulse</h4>
					<div class="spb-static">
						<div
							class="spb-static__bar spb-static__bar--pulse"
							style:--demo-color={activeColor}
						></div>
					</div>
				</div>
			</div>

			<div class="spb-filler">
				{#each Array.from({ length: 6 }, (_, i) => i) as i (i)}
					<article>
						<h4>Section {i + 1}</h4>
						<p>
							Continuous viewport-scroll feedback is one of those primitives that quietly
							improves reading UX on long-form pages. The bar is purposefully thin so it doesn't
							compete with the content for attention.
						</p>
						<p>
							Implementation: one passive scroll listener, one rAF tick per scroll event, one CSS
							custom property update per tick. The fill animates with
							<code>transition: width 80ms linear</code> so it smooths between rAF samples.
						</p>
					</article>
				{/each}
			</div>
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
					<td><code>target</code></td>
					<td><code>'window' | string</code></td>
					<td><code>'window'</code></td>
					<td>Scroll source — window or a CSS selector for a scroll container.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'thin' | 'bold' | 'gradient' | 'pulse'</code></td>
					<td><code>'thin'</code></td>
					<td>Visual style.</td>
				</tr>
				<tr>
					<td><code>position</code></td>
					<td><code>'top' | 'bottom'</code></td>
					<td><code>'top'</code></td>
					<td>Viewport edge anchor.</td>
				</tr>
				<tr>
					<td><code>color</code></td>
					<td><code>string</code></td>
					<td><code>'#6366f1'</code></td>
					<td>CSS colour — solid fill or gradient seed.</td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><code>number</code></td>
					<td><code>0 (auto)</code></td>
					<td>Bar height in px (clamped 1–20). 0 picks a sensible per-variant default.</td>
				</tr>
				<tr>
					<td><code>aria-label</code></td>
					<td><code>string</code></td>
					<td><code>'Reading progress'</code></td>
					<td>Screen reader announcement.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra wrapper classes.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.spb-demo {
		display: grid;
		gap: 24px;
	}
	.spb-lede {
		margin: 0;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.spb-controls {
		display: grid;
		gap: 14px;
		padding: 18px 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.spb-control {
		display: grid;
		gap: 8px;
	}
	.spb-control__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.spb-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.spb-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--surface);
		padding: 7px 12px;
		border-radius: var(--r-1);
		font-size: 13px;
		cursor: pointer;
		color: var(--fg-1);
		transition: all var(--dur-fast);
	}
	.spb-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.spb-btn--active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.spb-swatch {
		width: 32px;
		height: 32px;
		padding: 0;
		background: var(--swatch);
		border: 1px solid transparent;
		border-radius: var(--r-1);
		cursor: pointer;
	}
	.spb-swatch--active {
		outline: 2px solid var(--fg-1);
		outline-offset: 2px;
	}
	.spb-variants {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}
	.spb-variant {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		padding: 14px;
	}
	.spb-variant h4 {
		margin: 0 0 8px;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--fg-3);
		text-transform: uppercase;
	}
	.spb-static {
		background: var(--surface-2);
		border-radius: var(--r-1);
		padding: 20px 12px;
		position: relative;
		overflow: hidden;
	}
	.spb-static__bar {
		height: var(--demo-height, 4px);
		width: 70%;
		background: var(--demo-color, #6366f1);
		border-radius: 2px;
	}
	.spb-static__bar--thin {
		--demo-height: 2px;
	}
	.spb-static__bar--bold {
		--demo-height: 6px;
	}
	.spb-static__bar--gradient {
		--demo-height: 4px;
		background: linear-gradient(
			90deg,
			var(--demo-color, #6366f1),
			#ec4899,
			#f59e0b,
			#06b6d4,
			var(--demo-color, #6366f1)
		);
		background-size: 200% 100%;
		animation: spb-flow 8s linear infinite;
	}
	.spb-static__bar--pulse {
		--demo-height: 4px;
		box-shadow:
			0 0 6px var(--demo-color, #6366f1),
			0 0 12px var(--demo-color, #6366f1);
	}
	@keyframes spb-flow {
		from {
			background-position: 0% 0%;
		}
		to {
			background-position: 200% 0%;
		}
	}
	.spb-filler {
		display: grid;
		gap: 16px;
	}
	.spb-filler article {
		padding: 14px 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.spb-filler h4 {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.spb-filler p {
		margin: 0 0 8px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--fg-2);
	}
	.spb-filler code {
		font-family: var(--font-mono);
		font-size: 12px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
	}
</style>
