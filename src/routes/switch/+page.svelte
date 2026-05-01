<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Switch from '$lib/components/Switch.svelte';

	const shell = catalogShellPropsForSlug('/switch')!;

	let basicOn = $state(false);
	let darkMode = $state(false);
	let publicProfile = $state(true);

	let smOn = $state(false);
	let mdOn = $state(true);
	let lgOn = $state(false);

	let defaultOn = $state(true);
	let successOn = $state(true);
	let dangerOn = $state(true);

	const codeExplanation =
		'Switch is a button with role="switch" and aria-checked, so assistive tech announces it correctly without re-implementing focus or activation. Click or Space toggles the bound checked value; the optional <label for> binding means clicking the label flips the switch too. Sizes and variants are pure CSS classes — no inline styles, no animation libraries.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Toggle', 'CSS-only']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="switch-demo">
			<section>
				<h3>Basic toggle</h3>
				<Switch bind:checked={basicOn} ariaLabel="Toggle" />
				<p class="note">State: <code>{basicOn ? 'on' : 'off'}</code></p>
			</section>

			<section>
				<h3>With label — left or right</h3>
				<div class="row">
					<Switch bind:checked={darkMode} label="Dark mode" />
					<Switch bind:checked={publicProfile} label="Public profile" labelPosition="left" />
				</div>
			</section>

			<section>
				<h3>Three sizes</h3>
				<div class="row">
					<Switch bind:checked={smOn} size="sm" label="Small" />
					<Switch bind:checked={mdOn} size="md" label="Medium" />
					<Switch bind:checked={lgOn} size="lg" label="Large" />
				</div>
			</section>

			<section>
				<h3>Three variants</h3>
				<div class="row">
					<Switch bind:checked={defaultOn} label="Default" variant="default" />
					<Switch bind:checked={successOn} label="Success" variant="success" />
					<Switch bind:checked={dangerOn} label="Danger" variant="danger" />
				</div>
			</section>

			<section>
				<h3>Disabled state</h3>
				<div class="row">
					<Switch checked={true} label="Account verified" disabled />
					<Switch checked={false} label="Beta features" disabled />
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
					<td><code>checked</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable on/off state.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Optional visible label rendered as a real <code>&lt;label for&gt;</code>.</td>
				</tr>
				<tr>
					<td><code>labelPosition</code></td>
					<td><code>'left' | 'right'</code></td>
					<td><code>'right'</code></td>
					<td>Where the label sits relative to the track.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Track widths 32 / 44 / 56 px.</td>
				</tr>
				<tr>
					<td><code>variant</code></td>
					<td><code>'default' | 'success' | 'danger'</code></td>
					<td><code>'default'</code></td>
					<td>On-state colour token.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Real <code>disabled</code> attribute — focus is also blocked.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Required when no visible label is supplied.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(checked) =&gt; void</code></td>
					<td>—</td>
					<td>Fires after toggling.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.switch-demo {
		display: grid;
		gap: 1.75rem;
	}

	.switch-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0.6rem 0 0;
		color: var(--fg-2);
		font-size: 0.85rem;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
	}
</style>
