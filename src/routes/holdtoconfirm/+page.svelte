<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import HoldToConfirm from '$lib/components/HoldToConfirm.svelte';

	const shell = catalogShellPropsForSlug('/holdtoconfirm')!;

	let lastFired = $state<string | null>(null);
	let confirmCount = $state(0);
	let cancelCount = $state(0);

	function onConfirmRing() {
		lastFired = 'ring';
		confirmCount += 1;
	}
	function onConfirmBar() {
		lastFired = 'bar';
		confirmCount += 1;
	}
	function onConfirmGlow() {
		lastFired = 'glow';
		confirmCount += 1;
	}
	function onCancel() {
		cancelCount += 1;
	}

	const codeExplanation =
		'HoldToConfirm uses pointer capture (setPointerCapture on pointerdown) so the gesture stays alive even if the user drags outside the button — release anywhere cancels. Keyboard parity is intentional: Enter and Space start a programmatic hold cycle, repeat events are filtered, and releasing the key before completion cancels exactly like releasing the pointer. Visual progress is pure CSS (stroke-dashoffset for ring, width for bar, opacity+scale for glow); JavaScript only fires the setTimeout that calls onConfirm.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Pointer', 'Keyboard', 'A11y', 'Destructive']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="hold-demo">
			<section>
				<h3>The three variants</h3>
				<p class="note">
					Same gesture, three visual rhythms. Pick the one that fits the surrounding UI density.
				</p>
				<div class="variant-grid">
					<div class="variant-card">
						<h4>ring</h4>
						<p>SVG <code>stroke-dashoffset</code> sweep around a circular gauge.</p>
						<HoldToConfirm
							variant="ring"
							label="Hold to delete"
							duration={1500}
							onConfirm={onConfirmRing}
							{onCancel}
						/>
					</div>
					<div class="variant-card">
						<h4>bar</h4>
						<p>Linear horizontal fill expanding behind the label.</p>
						<HoldToConfirm
							variant="bar"
							label="Hold to send"
							duration={1500}
							onConfirm={onConfirmBar}
							{onCancel}
						/>
					</div>
					<div class="variant-card">
						<h4>glow</h4>
						<p>Radial pulse blooming from the centre of the button.</p>
						<HoldToConfirm
							variant="glow"
							label="Hold to leave"
							duration={1500}
							onConfirm={onConfirmGlow}
							{onCancel}
						/>
					</div>
				</div>
				<div class="readout">
					<span>
						<strong>{confirmCount}</strong>
						confirm{confirmCount === 1 ? '' : 's'} ·
						<strong>{cancelCount}</strong>
						cancel{cancelCount === 1 ? '' : 's'}
					</span>
					{#if lastFired}
						<span>last fired: <code>{lastFired}</code></span>
					{/if}
				</div>
			</section>

			<section>
				<h3>Duration sweep</h3>
				<p class="note">
					<code>duration</code> is clamped to <code>[200, 10000]</code>ms. Use longer durations for higher-stakes confirms.
				</p>
				<div class="duration-grid">
					<div class="duration-card">
						<HoldToConfirm
							variant="ring"
							duration={500}
							label="0.5s"
							onConfirm={onConfirmRing}
							{onCancel}
						/>
						<p>Fast — accidental holds possible.</p>
					</div>
					<div class="duration-card">
						<HoldToConfirm
							variant="ring"
							duration={1500}
							label="1.5s · default"
							onConfirm={onConfirmRing}
							{onCancel}
						/>
						<p>Default — feels deliberate.</p>
					</div>
					<div class="duration-card">
						<HoldToConfirm
							variant="ring"
							duration={3000}
							label="3s · destructive"
							onConfirm={onConfirmRing}
							{onCancel}
						/>
						<p>High-stakes — actively uncomfortable.</p>
					</div>
				</div>
			</section>

			<section>
				<h3>Disabled state</h3>
				<p class="note">
					<code>disabled</code> ignores pointer and keyboard input.
				</p>
				<div class="single-row">
					<HoldToConfirm disabled label="Saving — please wait" />
				</div>
			</section>

			<section>
				<h3>Keyboard parity</h3>
				<p class="note">
					Tab to the button, then press and hold <kbd>Enter</kbd> (or <kbd>Space</kbd>) for the full duration. Release before completion cancels.
				</p>
				<div class="single-row">
					<HoldToConfirm
						variant="bar"
						label="Tab here, then hold Enter"
						duration={1500}
						onConfirm={onConfirmBar}
						{onCancel}
					/>
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
					<td><code>duration</code></td>
					<td><code>number</code></td>
					<td><code>1500</code></td>
					<td>Hold duration in ms. Clamped to <code>[200, 10000]</code>.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'ring' | 'bar' | 'glow'</code></td>
					<td><code>'ring'</code></td>
					<td>Visual progress style.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Hold to confirm'</code></td>
					<td>Visible button text.</td>
				</tr>
				<tr>
					<td><code>onConfirm</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Fires once the hold completes.</td>
				</tr>
				<tr>
					<td><code>onCancel</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Fires when the gesture is released before completion.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Block all input paths.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Override the button's accessible name.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.hold-demo {
		display: grid;
		gap: 2.25rem;
	}

	.hold-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.45rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.85rem;
		color: var(--fg-2);
		font-size: 0.88rem;
		line-height: 1.55;
	}

	.note code,
	.variant-card code,
	.readout code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.note kbd {
		font-family: 'Fira Code', monospace;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		padding: 0.1em 0.45em;
		border-radius: 4px;
		font-size: 0.85em;
	}

	.variant-grid,
	.duration-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.variant-card,
	.duration-card,
	.single-row {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
	}

	.single-row {
		flex-direction: row;
		justify-content: center;
	}

	.variant-card h4 {
		margin: 0;
		font-family: 'Fira Code', monospace;
		font-size: 0.92rem;
		color: var(--fg-1);
	}

	.variant-card p,
	.duration-card p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--fg-2);
		line-height: 1.5;
	}

	.readout {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		font-size: 0.9rem;
		color: var(--fg-2);
	}
</style>
