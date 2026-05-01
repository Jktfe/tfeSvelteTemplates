<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Stepper from '$lib/components/Stepper.svelte';

	const shell = catalogShellPropsForSlug('/stepper')!;

	const checkout = ['Cart', 'Shipping', 'Payment', 'Review'];
	const onboarding = ['Account', 'Verify email', 'Profile', 'Preferences', 'Done'];

	let step = $state(1);

	function next() {
		step = Math.min(checkout.length - 1, step + 1);
	}
	function prev() {
		step = Math.max(0, step - 1);
	}

	const codeExplanation =
		'Stepper derives done / current / pending states from a single currentStep index, so parent state stays trivially small. The checkmark on completed steps is inline SVG (no icon font) and the orientation prop simply swaps the connector axis between row and column. With clickable enabled, completed and current steps become buttons that call onSelect, while pending steps stay locked so users can\'t skip ahead.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Progress', 'A11y', 'Wizards']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="stepper-demo">
			<section>
				<h3>Read-only horizontal</h3>
				<div class="frame">
					<Stepper steps={checkout} currentStep={2} />
				</div>
			</section>

			<section>
				<div class="row-between">
					<h3>Interactive (clickable + buttons)</h3>
					<div class="actions">
						<button onclick={prev} disabled={step === 0} class="btn-ghost">← Back</button>
						<button onclick={next} disabled={step === checkout.length - 1} class="btn-primary">
							{step === checkout.length - 1 ? 'Submit' : 'Next →'}
						</button>
					</div>
				</div>
				<div class="frame">
					<Stepper steps={checkout} currentStep={step} clickable onSelect={(i) => (step = i)} />
				</div>
				<p class="note">
					Current step index: <code>{step}</code> ({checkout[step]})
				</p>
			</section>

			<section>
				<h3>Vertical orientation</h3>
				<div class="frame frame-narrow">
					<Stepper steps={onboarding} currentStep={2} orientation="vertical" />
				</div>
			</section>

			<section>
				<h3>Custom palette</h3>
				<div class="frame">
					<Stepper
						steps={['Plan', 'Build', 'Ship']}
						currentStep={1}
						activeColor="#a855f7"
						doneColor="#7c3aed"
						pendingColor="#e9d5ff"
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
					<td><code>steps</code></td>
					<td><code>string[]</code></td>
					<td><code>[]</code></td>
					<td>Required. Step labels in order.</td>
				</tr>
				<tr>
					<td><code>currentStep</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>Index of the active step (zero-based).</td>
				</tr>
				<tr>
					<td><code>orientation</code></td>
					<td><code>'horizontal' | 'vertical'</code></td>
					<td><code>'horizontal'</code></td>
					<td>Layout direction.</td>
				</tr>
				<tr>
					<td><code>clickable</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Allow jumping back to completed steps.</td>
				</tr>
				<tr>
					<td><code>onSelect</code></td>
					<td><code>(index) =&gt; void</code></td>
					<td>—</td>
					<td>Fires when a clickable step is activated.</td>
				</tr>
				<tr>
					<td><code>activeColor</code> / <code>doneColor</code> / <code>pendingColor</code></td>
					<td><code>string</code></td>
					<td>Brand defaults</td>
					<td>Custom palette per state.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.stepper-demo {
		display: grid;
		gap: 2rem;
	}

	.stepper-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.frame {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.frame-narrow {
		max-width: 22rem;
	}

	.row-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.6rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-ghost,
	.btn-primary {
		padding: 0.4rem 0.85rem;
		font-size: 0.85rem;
		font-weight: 500;
		border-radius: 0.4rem;
		cursor: pointer;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--fg-1);
	}

	.btn-primary {
		border: none;
		background: var(--brand, #146ef5);
		color: #fff;
	}

	.btn-ghost:disabled,
	.btn-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.note {
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		color: var(--fg-2);
	}
</style>
