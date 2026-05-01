<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TextField from '$lib/components/forms/TextField.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import CheckboxField from '$lib/components/forms/CheckboxField.svelte';

	const shell = catalogShellPropsForSlug('/forms')!;

	// Compose two of the field primitives so the demo shows the suite without
	// re-rendering the entire kitchen-sink form.
	let formData = $state({
		name: '',
		country: '',
		terms: false
	});

	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	function validateName(value: string) {
		if (!value) return 'Name is required';
		if (value.length < 2) return 'Name must be at least 2 characters';
		return '';
	}

	function validateCountry(value: string) {
		return value ? '' : 'Country is required';
	}

	function validateTerms(checked: boolean) {
		return checked ? '' : 'You must accept the terms';
	}

	const countryOptions = [
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'us', label: 'United States' },
		{ value: 'ca', label: 'Canada' },
		{ value: 'au', label: 'Australia' }
	];

	const codeExplanation =
		'The Forms suite is a set of small, opinion-light field components that all share the same FormField wrapper for label, error, and help-text rendering. Each field owns its own input element so native validation, keyboard handling, and screen-reader semantics come for free; you compose the ones you need rather than configuring one mega component.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Forms', 'Validation', 'A11y', 'Composable']}
	{codeExplanation}
>
	{#snippet demo()}
		<form class="forms-demo" onsubmit={(e) => e.preventDefault()}>
			<TextField
				name="name"
				label="Full Name"
				bind:value={formData.name}
				error={errors.name}
				touched={touched.name}
				required
				placeholder="Enter your full name"
				helpText="Your first and last name"
				oninput={(val) => {
					formData.name = val;
					errors.name = validateName(val);
				}}
				onblur={() => {
					touched.name = true;
				}}
			/>

			<SelectField
				name="country"
				label="Country"
				bind:value={formData.country}
				options={countryOptions}
				error={errors.country}
				touched={touched.country}
				required
				placeholder="Select your country"
				helpText="Choose your country of residence"
				oninput={(val) => {
					formData.country = val;
					errors.country = validateCountry(val);
				}}
				onblur={() => {
					touched.country = true;
				}}
			/>

			<CheckboxField
				name="terms"
				label="I accept the terms and conditions"
				bind:checked={formData.terms}
				error={errors.terms}
				touched={touched.terms}
				required
				helpText="Please read our terms before accepting"
				oninput={(val) => {
					formData.terms = val;
					errors.terms = validateTerms(val);
				}}
				onblur={() => {
					touched.terms = true;
				}}
			/>

			<button
				type="button"
				class="forms-submit"
				onclick={() => {
					touched = { name: true, country: true, terms: true };
					errors = {
						name: validateName(formData.name),
						country: validateCountry(formData.country),
						terms: validateTerms(formData.terms)
					};
				}}
			>
				Validate
			</button>
		</form>
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
					<td><code>name</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Required. Used for the input id, error id, and form submission key.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Visible label rendered above the input.</td>
				</tr>
				<tr>
					<td><code>value</code> / <code>checked</code></td>
					<td><code>string | number | boolean</code></td>
					<td><code>''</code></td>
					<td>Bindable two-way value. Use <code>checked</code> for boolean fields.</td>
				</tr>
				<tr>
					<td><code>required</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Adds the asterisk and the native required attribute.</td>
				</tr>
				<tr>
					<td><code>error</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Error message shown when the field is touched.</td>
				</tr>
				<tr>
					<td><code>touched</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Has the user interacted with the field — gates error display.</td>
				</tr>
				<tr>
					<td><code>helpText</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Subtle helper text below the input.</td>
				</tr>
				<tr>
					<td><code>oninput</code></td>
					<td><code>(value) =&gt; void</code></td>
					<td>—</td>
					<td>Called on every change with the latest value.</td>
				</tr>
				<tr>
					<td><code>onblur</code></td>
					<td><code>() =&gt; void</code></td>
					<td>—</td>
					<td>Called when focus leaves the input.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.forms-demo {
		display: grid;
		gap: 1.25rem;
		max-width: 28rem;
	}

	.forms-submit {
		justify-self: start;
		padding: 0.6rem 1.25rem;
		font-size: 0.95rem;
		font-weight: 500;
		border-radius: 0.5rem;
		border: none;
		background: var(--brand, #146ef5);
		color: #fff;
		cursor: pointer;
	}

	.forms-submit:hover {
		filter: brightness(0.95);
	}
</style>
