<script lang="ts">
	import MorphingDialog from '$lib/components/MorphingDialog.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/morphingdialog')!;

	const usageSnippet = `<script>
  import MorphingDialog from '$lib/components/MorphingDialog.svelte';
<\/script>

<MorphingDialog>
  {#snippet trigger(props)}
    <button class="card" {...props}>
      <h3>Project Update</h3>
      <p>Click to expand...</p>
    </button>
  {/snippet}

  <div class="content">
    <h2>Full Details</h2>
    <p>Expanded content here...</p>
  </div>
</MorphingDialog>`;

	const codeExplanation =
		'MorphingDialog measures the trigger\'s bounding rect, then transitions a clone from that rect to the centred dialog rect. Closing reverses the morph. Focus is trapped while open, Escape and overlay clicks close it, and prefers-reduced-motion skips the morph entirely while keeping all interaction.';
</script>

<svelte:head>
	<title>MorphingDialog — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Shared-element transition dialog that morphs from trigger to full modal for Svelte 5."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Modal', 'Shared element', 'Focus trap', 'A11y']}
>
	{#snippet demo()}
		<div class="md-grid">
			<section class="md-card">
				<h3>Card trigger</h3>
				<p>Click the card to morph it into a full dialog.</p>
				<MorphingDialog>
					{#snippet trigger(props)}
						<button class="md-trigger md-trigger--card" {...props}>
							<svg viewBox="0 0 400 200" width="100%" height="120" aria-hidden="true">
								<defs>
									<linearGradient id="md-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
										<stop offset="0%" stop-color="#667eea" />
										<stop offset="100%" stop-color="#764ba2" />
									</linearGradient>
								</defs>
								<rect width="400" height="200" fill="url(#md-grad-1)" />
								<text x="200" y="105" text-anchor="middle" fill="white" font-size="20" font-family="system-ui">Click to expand</text>
							</svg>
							<div class="md-trigger__body">
								<h4>Project Update</h4>
								<p>Q4 performance metrics and roadmap changes.</p>
							</div>
						</button>
					{/snippet}

					<div class="md-dialog">
						<h2>Project Update — Q4 2025</h2>
						<p>This is the expanded dialog content that morphed from the card.</p>
						<h3>Key metrics</h3>
						<ul>
							<li>Revenue: <strong>£2.4M</strong> (+18% QoQ)</li>
							<li>Active users: <strong>45,200</strong> (+12% QoQ)</li>
							<li>Retention: <strong>94.2%</strong></li>
							<li>NPS: <strong>72</strong> (+5)</li>
						</ul>
					</div>
				</MorphingDialog>
			</section>

			<section class="md-card">
				<h3>Confirmation button</h3>
				<p>Risky action morphing into a confirm dialog.</p>
				<MorphingDialog dialogWidth="420px" borderRadius="12px">
					{#snippet trigger(props)}
						<button class="md-trigger md-trigger--danger" {...props}>Delete account</button>
					{/snippet}

					<div class="md-dialog md-dialog--centered">
						<div class="md-confirm-icon">⚠️</div>
						<h2>Delete your account?</h2>
						<p>This action is permanent and cannot be undone.</p>
						<div class="md-actions">
							<button class="md-btn md-btn--secondary">Cancel</button>
							<button class="md-btn md-btn--danger">Yes, delete</button>
						</div>
					</div>
				</MorphingDialog>
			</section>

			<section class="md-card">
				<h3>Custom configuration</h3>
				<p>Slow morph with springy easing and heavier overlay blur.</p>
				<MorphingDialog
					duration={600}
					easing="cubic-bezier(0.34, 1.56, 0.64, 1)"
					overlayColor="rgba(30, 41, 59, 0.7)"
					overlayBlur={12}
					dialogWidth="480px"
					borderRadius="24px"
				>
					{#snippet trigger(props)}
						<button class="md-trigger md-trigger--fancy" {...props}>
							<span aria-hidden="true">✨</span>
							<span>Slow & springy</span>
						</button>
					{/snippet}

					<div class="md-dialog md-dialog--centered">
						<div class="md-success">🎉</div>
						<h2>Custom animation</h2>
						<p>
							This dialog uses a slower 600&nbsp;ms duration with a springy easing curve, a darker
							overlay and rounder corners.
						</p>
					</div>
				</MorphingDialog>
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
					<td><code>open</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable open state.</td>
				</tr>
				<tr>
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>400</code></td>
					<td>Morph duration in milliseconds.</td>
				</tr>
				<tr>
					<td><code>easing</code></td>
					<td><code>string</code></td>
					<td><code>cubic-bezier(0.4, 0, 0.2, 1)</code></td>
					<td>CSS transition easing.</td>
				</tr>
				<tr>
					<td><code>overlayColor</code></td>
					<td><code>string</code></td>
					<td><code>rgba(0, 0, 0, 0.5)</code></td>
					<td>Overlay background colour.</td>
				</tr>
				<tr>
					<td><code>overlayBlur</code></td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Backdrop blur in pixels.</td>
				</tr>
				<tr>
					<td><code>dialogWidth</code></td>
					<td><code>string</code></td>
					<td><code>'560px'</code></td>
					<td>Maximum dialog width.</td>
				</tr>
				<tr>
					<td><code>borderRadius</code></td>
					<td><code>string</code></td>
					<td><code>'16px'</code></td>
					<td>Dialog corner radius.</td>
				</tr>
				<tr>
					<td><code>closeOnOverlay</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Close when the overlay is clicked.</td>
				</tr>
				<tr>
					<td><code>closeOnEscape</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Close when Escape is pressed.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.md-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 16px;
	}
	.md-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
	.md-card h3 {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	.md-card > p {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
		line-height: 1.5;
	}

	.md-trigger {
		font: inherit;
		cursor: pointer;
	}
	.md-trigger--card {
		display: block;
		width: 100%;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		overflow: hidden;
		background: var(--surface);
		text-align: left;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}
	.md-trigger--card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}
	.md-trigger__body {
		padding: 12px 16px;
	}
	.md-trigger__body h4 {
		margin: 0 0 4px;
		color: var(--fg-1);
		font-size: 15px;
	}
	.md-trigger__body p {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
	}

	.md-trigger--danger {
		padding: 10px 18px;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: var(--r-1);
		font-weight: 600;
	}
	.md-trigger--danger:hover {
		background: #dc2626;
	}

	.md-trigger--fancy {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		padding: 10px 18px;
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border: none;
		border-radius: var(--r-2);
		font-weight: 600;
	}
	.md-trigger--fancy:hover {
		transform: scale(1.02);
		box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
	}

	.md-dialog h2 {
		margin: 0 0 12px;
		color: var(--fg-1);
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 24px;
		text-transform: uppercase;
		letter-spacing: 0.01em;
	}
	.md-dialog h3 {
		margin: 16px 0 8px;
		color: var(--fg-1);
	}
	.md-dialog p {
		margin: 0 0 8px;
		color: var(--fg-2);
		line-height: 1.6;
	}
	.md-dialog ul {
		margin: 0;
		padding-left: 18px;
		color: var(--fg-2);
		line-height: 1.8;
	}
	.md-dialog--centered {
		text-align: center;
	}
	.md-confirm-icon,
	.md-success {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}
	.md-actions {
		display: flex;
		gap: 8px;
		justify-content: center;
		margin-top: 12px;
	}
	.md-btn {
		padding: 8px 16px;
		border: none;
		border-radius: var(--r-1);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	.md-btn--secondary {
		background: var(--surface-2);
		color: var(--fg-1);
	}
	.md-btn--danger {
		background: #ef4444;
		color: white;
	}
</style>
