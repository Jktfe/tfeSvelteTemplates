<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import TextField from '$lib/components/forms/TextField.svelte';
	import NumberField from '$lib/components/forms/NumberField.svelte';
	import RangeField from '$lib/components/forms/RangeField.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import CheckboxField from '$lib/components/forms/CheckboxField.svelte';
	import RadioGroup from '$lib/components/forms/RadioGroup.svelte';
	import Stepper from '$lib/components/Stepper.svelte';

	const shell = catalogShellPropsForSlug('/forms')!;

	// ----------------------------------------------------------------------
	// Multi-step form playground.
	// Step state lives in a single $state so the Stepper at the top *and* the
	// bottom action buttons share the same source of truth. Validation is
	// per-field, gated by a "touched" flag so users don't see errors until
	// they've actually interacted with a field.
	// ----------------------------------------------------------------------

	const steps = ['Basics', 'Preferences', 'Review'];
	let currentStep = $state(0);

	// Step 1: Basics
	let formData = $state({
		// Step 1 — basic types
		name: '',
		age: 25,
		experienceYears: 3,
		// Step 2 — selection types
		country: 'uk',
		channel: 'email',
		newsletter: false,
		marketingOptIn: true,
		// (we deliberately leave consent off so step 3 can flag it)
		consent: false
	});

	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	// Validators — pure functions returning '' for "valid" and a message for invalid.
	function validateName(v: string) {
		if (!v) return 'Name is required';
		if (v.length < 2) return 'Name must be at least 2 characters';
		return '';
	}
	function validateAge(v: number) {
		if (v < 13) return 'Must be 13 or older';
		if (v > 120) return 'That seems unlikely';
		return '';
	}
	function validateExperience(v: number) {
		if (v < 0) return 'Cannot be negative';
		return '';
	}
	function validateCountry(v: string) {
		return v ? '' : 'Country is required';
	}
	function validateChannel(v: string) {
		return v ? '' : 'Pick a contact preference';
	}
	function validateConsent(v: boolean) {
		return v ? '' : 'You must accept to submit';
	}

	// Re-run every validator on demand. We do this when the user tries to
	// advance, and again on submit, so step-spanning errors don't slip through.
	function validateStep(step: number) {
		const next: Record<string, string> = { ...errors };
		if (step === 0) {
			next.name = validateName(formData.name);
			next.age = validateAge(formData.age);
			next.experienceYears = validateExperience(formData.experienceYears);
		} else if (step === 1) {
			next.country = validateCountry(formData.country);
			next.channel = validateChannel(formData.channel);
		} else if (step === 2) {
			next.consent = validateConsent(formData.consent);
		}
		errors = next;
		return Object.entries(next)
			.filter(([key, value]) => fieldsForStep(step).includes(key) && value)
			.map(([key]) => key);
	}

	function fieldsForStep(step: number): string[] {
		if (step === 0) return ['name', 'age', 'experienceYears'];
		if (step === 1) return ['country', 'channel'];
		return ['consent'];
	}

	function markTouched(step: number) {
		const next = { ...touched };
		for (const key of fieldsForStep(step)) next[key] = true;
		touched = next;
	}

	function goNext() {
		markTouched(currentStep);
		const failed = validateStep(currentStep);
		if (failed.length === 0) {
			currentStep = Math.min(steps.length, currentStep + 1);
		}
	}

	function goBack() {
		currentStep = Math.max(0, currentStep - 1);
	}

	function jumpTo(index: number) {
		// Guard: only allow jumping to steps that are already completed (the
		// Stepper enforces this too, but belt-and-braces).
		if (index <= currentStep) currentStep = index;
	}

	let submitted = $state(false);
	function submit() {
		markTouched(2);
		const failed = validateStep(2);
		if (failed.length === 0) {
			submitted = true;
		}
	}

	function resetForm() {
		formData = {
			name: '',
			age: 25,
			experienceYears: 3,
			country: 'uk',
			channel: 'email',
			newsletter: false,
			marketingOptIn: true,
			consent: false
		};
		errors = {};
		touched = {};
		currentStep = 0;
		submitted = false;
	}

	// Option lists used by the selection-type fields in step 2.
	const countryOptions = [
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'us', label: 'United States' },
		{ value: 'ca', label: 'Canada' },
		{ value: 'au', label: 'Australia' },
		{ value: 'de', label: 'Germany' },
		{ value: 'fr', label: 'France' }
	];

	const channelOptions = [
		{ value: 'email', label: 'Email' },
		{ value: 'sms', label: 'SMS' },
		{ value: 'push', label: 'Push notification' },
		{ value: 'none', label: 'No contact, please' }
	];

	const codeExplanation =
		'The Forms suite is a set of small field components that share a FormField wrapper for label, error, and help-text rendering. Each field owns its own input element so native validation, keyboard handling, and screen-reader semantics come for free; you compose the ones you need rather than configuring one mega component. Here we hook three steps to a Stepper so a single currentStep index drives both navigation and progress.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Forms', 'Validation', 'A11y', 'Composable', 'Multi-step']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="forms-demo">
			<p class="forms-demo__lede">
				A three-step wizard built from the field primitives. The Stepper at the top mirrors the
				active step; click a completed step to jump back. Each &ldquo;Next&rdquo; runs validation
				before letting you advance.
			</p>

			<div class="forms-stepper">
				<Stepper
					steps={[...steps, 'Done']}
					currentStep={submitted ? steps.length : currentStep}
					clickable
					onSelect={jumpTo}
				/>
			</div>

			{#if !submitted}
				<form class="forms-card" onsubmit={(e) => e.preventDefault()}>
					{#if currentStep === 0}
						<section class="step-section" aria-labelledby="step-1-heading">
							<header>
								<h3 id="step-1-heading">Step 1 · Basics</h3>
								<p>TextField, NumberField, and RangeField — the core scalar inputs.</p>
							</header>

							<TextField
								name="name"
								label="Full name"
								bind:value={formData.name}
								error={errors.name}
								touched={touched.name}
								required
								placeholder="Ada Lovelace"
								helpText="First and last name."
								oninput={(val) => {
									formData.name = val;
									errors.name = validateName(val);
								}}
								onblur={() => (touched.name = true)}
							/>

							<NumberField
								name="age"
								label="Age"
								bind:value={formData.age}
								error={errors.age}
								touched={touched.age}
								min={0}
								max={120}
								step={1}
								required
								helpText="Whole years, please."
								oninput={(val) => {
									formData.age = val;
									errors.age = validateAge(val);
								}}
								onblur={() => (touched.age = true)}
							/>

							<RangeField
								name="experienceYears"
								label="Years of experience"
								bind:value={formData.experienceYears}
								min={0}
								max={30}
								step={1}
								showValue
								showMinMax
								helpText="Slide to set."
								oninput={(val) => {
									formData.experienceYears = val;
								}}
							/>
						</section>
					{:else if currentStep === 1}
						<section class="step-section" aria-labelledby="step-2-heading">
							<header>
								<h3 id="step-2-heading">Step 2 · Preferences</h3>
								<p>SelectField, RadioGroup, and CheckboxField — selection-type inputs.</p>
							</header>

							<SelectField
								name="country"
								label="Country"
								bind:value={formData.country}
								options={countryOptions}
								error={errors.country}
								touched={touched.country}
								required
								placeholder="Choose a country"
								oninput={(val) => {
									formData.country = val;
									errors.country = validateCountry(val);
								}}
								onblur={() => (touched.country = true)}
							/>

							<RadioGroup
								name="channel"
								label="Preferred contact channel"
								bind:value={formData.channel}
								options={channelOptions}
								orientation="vertical"
								error={errors.channel}
								touched={touched.channel}
								required
								oninput={(val) => {
									formData.channel = val;
									errors.channel = validateChannel(val);
								}}
							/>

							<div class="checkbox-stack">
								<CheckboxField
									name="newsletter"
									label="Subscribe to weekly newsletter"
									bind:checked={formData.newsletter}
									helpText="One email a week, no spam."
								/>
								<CheckboxField
									name="marketingOptIn"
									label="Receive product updates"
									bind:checked={formData.marketingOptIn}
									helpText="Occasional release notes and tips."
								/>
							</div>
						</section>
					{:else}
						<section class="step-section" aria-labelledby="step-3-heading">
							<header>
								<h3 id="step-3-heading">Step 3 · Review &amp; submit</h3>
								<p>Read-only summary. Everything you entered is shown below.</p>
							</header>

							<dl class="review-grid">
								<dt>Name</dt>
								<dd>{formData.name || '—'}</dd>
								<dt>Age</dt>
								<dd>{formData.age}</dd>
								<dt>Experience</dt>
								<dd>{formData.experienceYears} year{formData.experienceYears === 1 ? '' : 's'}</dd>
								<dt>Country</dt>
								<dd>
									{countryOptions.find((c) => c.value === formData.country)?.label ?? formData.country}
								</dd>
								<dt>Contact via</dt>
								<dd>
									{channelOptions.find((c) => c.value === formData.channel)?.label ?? formData.channel}
								</dd>
								<dt>Newsletter</dt>
								<dd>{formData.newsletter ? 'Yes' : 'No'}</dd>
								<dt>Marketing</dt>
								<dd>{formData.marketingOptIn ? 'Yes' : 'No'}</dd>
							</dl>

							<CheckboxField
								name="consent"
								label="I confirm the details above are accurate"
								bind:checked={formData.consent}
								error={errors.consent}
								touched={touched.consent}
								required
								oninput={(val) => {
									formData.consent = val;
									errors.consent = validateConsent(val);
								}}
								onblur={() => (touched.consent = true)}
							/>
						</section>
					{/if}

					<footer class="step-actions">
						<button
							type="button"
							class="btn-ghost"
							onclick={goBack}
							disabled={currentStep === 0}
						>
							← Back
						</button>
						{#if currentStep < steps.length - 1}
							<button type="button" class="btn-primary" onclick={goNext}>Next →</button>
						{:else}
							<button type="button" class="btn-primary" onclick={submit}>Submit</button>
						{/if}
					</footer>
				</form>
			{:else}
				<div class="forms-card success-card" role="status">
					<div class="success-icon" aria-hidden="true">✓</div>
					<h3>Form submitted</h3>
					<p>
						Thanks, <strong>{formData.name}</strong>. We&rsquo;ll reach out via
						<strong>{channelOptions.find((c) => c.value === formData.channel)?.label}</strong>.
					</p>
					<button type="button" class="btn-ghost" onclick={resetForm}>Reset playground</button>
				</div>
			{/if}

			<aside class="forms-demo__state" aria-label="Live form state">
				<div class="state-row">
					<span class="state-label">Step</span>
					<code>{submitted ? `${steps.length} (done)` : `${currentStep} (${steps[currentStep]})`}</code>
				</div>
				<div class="state-row">
					<span class="state-label">Errors</span>
					<code
						>{Object.values(errors).filter(Boolean).length} active{Object.values(errors).filter(
							Boolean
						).length === 0
							? ''
							: ` (${Object.keys(errors)
									.filter((k) => errors[k])
									.join(', ')})`}</code
					>
				</div>
			</aside>
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
				<tr>
					<td><code>options</code> (Select / Radio)</td>
					<td><code>{'{ value, label }[]'}</code></td>
					<td>—</td>
					<td>List of choices for selection-type fields.</td>
				</tr>
				<tr>
					<td><code>min</code> / <code>max</code> / <code>step</code></td>
					<td><code>number</code></td>
					<td>—</td>
					<td>Number and Range fields use the native HTML constraints.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.forms-demo {
		display: grid;
		gap: 1.5rem;
	}

	.forms-demo__lede {
		margin: 0;
		color: var(--fg-2);
		font-size: 0.92rem;
		line-height: 1.55;
	}

	.forms-stepper {
		padding: 0.85rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
	}

	.forms-card {
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
	}

	.step-section {
		display: grid;
		gap: 1.1rem;
	}

	.step-section header h3 {
		margin: 0;
		font-size: 1.05rem;
		color: var(--fg-1);
	}

	.step-section header p {
		margin: 0.25rem 0 0;
		color: var(--fg-2);
		font-size: 0.88rem;
	}

	.checkbox-stack {
		display: grid;
		gap: 0.6rem;
	}

	.review-grid {
		display: grid;
		grid-template-columns: minmax(0, 9rem) minmax(0, 1fr);
		gap: 0.45rem 1rem;
		margin: 0;
		padding: 0.85rem 1rem;
		background: var(--surface-2, var(--surface));
		border: 1px solid var(--border);
		border-radius: 0.6rem;
		font-size: 0.9rem;
	}

	.review-grid dt {
		color: var(--fg-2);
		font-weight: 500;
	}

	.review-grid dd {
		margin: 0;
		color: var(--fg-1);
	}

	.step-actions {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--border);
	}

	.btn-ghost,
	.btn-primary {
		padding: 0.55rem 1.1rem;
		font-size: 0.92rem;
		font-weight: 500;
		border-radius: 0.5rem;
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

	.btn-ghost:not(:disabled):hover,
	.btn-primary:not(:disabled):hover {
		filter: brightness(0.96);
	}

	.success-card {
		text-align: center;
		gap: 0.6rem;
	}

	.success-card h3 {
		margin: 0;
		color: var(--fg-1);
	}

	.success-card p {
		margin: 0;
		color: var(--fg-2);
	}

	.success-icon {
		width: 3rem;
		height: 3rem;
		margin: 0 auto;
		display: grid;
		place-items: center;
		font-size: 1.6rem;
		color: #fff;
		background: #22c55e;
		border-radius: 50%;
	}

	.success-card .btn-ghost {
		justify-self: center;
		margin-top: 0.5rem;
	}

	.forms-demo__state {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.5rem;
		padding: 0.7rem 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		font-size: 0.82rem;
		color: var(--fg-2);
	}

	.state-row {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.state-label {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.7rem;
	}

	.state-row code {
		background: var(--surface-2, var(--surface));
		padding: 0.1rem 0.45rem;
		border-radius: 0.25rem;
		color: var(--fg-1);
	}
</style>
