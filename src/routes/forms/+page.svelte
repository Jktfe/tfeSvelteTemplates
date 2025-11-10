<script lang="ts">
	/**
	 * Forms Demo Page
	 *
	 * Comprehensive demonstration of all form field components.
	 * Shows each component with validation, accessibility, and various configurations.
	 */

	import TextField from '$lib/components/forms/TextField.svelte';
	import TextareaField from '$lib/components/forms/TextareaField.svelte';
	import NumberField from '$lib/components/forms/NumberField.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import RadioGroup from '$lib/components/forms/RadioGroup.svelte';
	import CheckboxField from '$lib/components/forms/CheckboxField.svelte';
	import CheckboxGroup from '$lib/components/forms/CheckboxGroup.svelte';
	import RangeField from '$lib/components/forms/RangeField.svelte';
	import DateField from '$lib/components/forms/DateField.svelte';
	import TimeField from '$lib/components/forms/TimeField.svelte';
	import SwitchField from '$lib/components/forms/SwitchField.svelte';
	import ColorField from '$lib/components/forms/ColorField.svelte';

	// Form state
	let formData = $state({
		// Text inputs
		name: '',
		email: '',
		website: '',
		bio: '',

		// Number input
		age: 0,

		// Select
		country: '',

		// Radio
		paymentMethod: '',

		// Checkboxes
		terms: false,
		interests: [] as string[],

		// Range
		satisfaction: 50,

		// Date & Time
		birthdate: '',
		appointmentTime: '',

		// Switch
		notifications: false,

		// Colour
		brandColor: '#146ef5'
	});

	// Form errors
	let errors = $state<Record<string, string>>({});

	// Touched fields
	let touched = $state<Record<string, boolean>>({});

	// Validation functions
	function validateName(value: string): string {
		if (!value) return 'Name is required';
		if (value.length < 2) return 'Name must be at least 2 characters';
		return '';
	}

	function validateEmail(value: string): string {
		if (!value) return 'Email is required';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
		return '';
	}

	function validateWebsite(value: string): string {
		if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid URL (http:// or https://)';
		return '';
	}

	function validateBio(value: string): string {
		if (!value) return 'Bio is required';
		if (value.length < 10) return 'Bio must be at least 10 characters';
		if (value.length > 500) return 'Bio must not exceed 500 characters';
		return '';
	}

	function validateAge(value: number): string {
		if (value < 18) return 'Must be at least 18 years old';
		if (value > 120) return 'Please enter a valid age';
		return '';
	}

	function validateCountry(value: string): string {
		if (!value) return 'Country is required';
		return '';
	}

	function validatePayment(value: string): string {
		if (!value) return 'Payment method is required';
		return '';
	}

	function validateTerms(checked: boolean): string {
		if (!checked) return 'You must accept the terms and conditions';
		return '';
	}

	function validateInterests(values: string[]): string {
		if (values.length < 2) return 'Select at least 2 interests';
		if (values.length > 4) return 'Select at most 4 interests';
		return '';
	}

	function validateBirthdate(value: string): string {
		if (!value) return 'Birthdate is required';
		const date = new Date(value);
		const today = new Date();
		if (date > today) return 'Birthdate cannot be in the future';
		return '';
	}

	function validateAppointment(value: string): string {
		if (!value) return 'Appointment time is required';
		const [hours] = value.split(':').map(Number);
		if (hours < 9 || hours >= 17) return 'Must be between 9 AM and 5 PM';
		return '';
	}

	// Options for selects, radios, checkboxes
	const countryOptions = [
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'us', label: 'United States' },
		{ value: 'ca', label: 'Canada' },
		{ value: 'au', label: 'Australia' },
		{ value: 'de', label: 'Germany' },
		{ value: 'fr', label: 'France' }
	];

	const paymentOptions = [
		{ value: 'card', label: 'Credit Card' },
		{ value: 'paypal', label: 'PayPal' },
		{ value: 'bank', label: 'Bank Transfer' }
	];

	const interestOptions = [
		{ value: 'sports', label: 'Sports' },
		{ value: 'music', label: 'Music' },
		{ value: 'tech', label: 'Technology' },
		{ value: 'art', label: 'Art' },
		{ value: 'cooking', label: 'Cooking' },
		{ value: 'travel', label: 'Travel' }
	];

	const colorPresets = ['#146ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

	// Handle form submission
	function handleSubmit(e: Event) {
		e.preventDefault();

		// Mark all fields as touched
		touched = {
			name: true,
			email: true,
			website: true,
			bio: true,
			age: true,
			country: true,
			paymentMethod: true,
			terms: true,
			interests: true,
			satisfaction: true,
			birthdate: true,
			appointmentTime: true,
			notifications: true,
			brandColor: true
		};

		// Validate all fields
		errors = {
			name: validateName(formData.name),
			email: validateEmail(formData.email),
			website: validateWebsite(formData.website),
			bio: validateBio(formData.bio),
			age: validateAge(formData.age),
			country: validateCountry(formData.country),
			paymentMethod: validatePayment(formData.paymentMethod),
			terms: validateTerms(formData.terms),
			interests: validateInterests(formData.interests),
			birthdate: validateBirthdate(formData.birthdate),
			appointmentTime: validateAppointment(formData.appointmentTime)
		};

		// Check if form is valid
		const isValid = Object.values(errors).every((error) => !error);

		if (isValid) {
			alert('Form submitted successfully!\n\nCheck console for form data.');
			console.log('Form Data:', formData);
		} else {
			alert('Please fix the errors in the form before submitting.');
		}
	}
</script>

<div class="forms-page">
	<div class="container">
		<!-- Header -->
		<header class="header">
			<h1 class="title">Form Components</h1>
			<p class="description">
				Comprehensive collection of reusable form field components with validation, accessibility,
				and consistent styling. All components are fully typed, self-contained, and copy-paste
				ready.
			</p>
		</header>

		<!-- Demo Form -->
		<div class="demo-section">
			<h2 class="section-title">Interactive Demo</h2>
			<p class="section-description">
				Fill out this form to test all field components. Validation errors appear after you
				interact with each field.
			</p>

			<form class="demo-form" onsubmit={handleSubmit}>
				<!-- Text Fields Section -->
				<div class="form-section">
					<h3 class="subsection-title">Text Inputs</h3>

					<TextField
						name="name"
						label="Full Name"
						bind:value={formData.name}
						error={errors.name}
						touched={touched.name}
						required={true}
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

					<TextField
						name="email"
						label="Email Address"
						type="email"
						bind:value={formData.email}
						error={errors.email}
						touched={touched.email}
						required={true}
						placeholder="you@example.com"
						helpText="We'll never share your email"
						oninput={(val) => {
							formData.email = val;
							errors.email = validateEmail(val);
						}}
						onblur={() => {
							touched.email = true;
						}}
					/>

					<TextField
						name="website"
						label="Website"
						type="url"
						bind:value={formData.website}
						error={errors.website}
						touched={touched.website}
						placeholder="https://example.com"
						helpText="Optional - your personal or company website"
						oninput={(val) => {
							formData.website = val;
							errors.website = validateWebsite(val);
						}}
						onblur={() => {
							touched.website = true;
						}}
					/>

					<TextareaField
						name="bio"
						label="Biography"
						bind:value={formData.bio}
						error={errors.bio}
						touched={touched.bio}
						required={true}
						rows={4}
						maxlength={500}
						showCharCount={true}
						placeholder="Tell us about yourself..."
						helpText="Write a brief description (10-500 characters)"
						oninput={(val) => {
							formData.bio = val;
							errors.bio = validateBio(val);
						}}
						onblur={() => {
							touched.bio = true;
						}}
					/>
				</div>

				<!-- Number & Range Section -->
				<div class="form-section">
					<h3 class="subsection-title">Numeric Inputs</h3>

					<NumberField
						name="age"
						label="Age"
						bind:value={formData.age}
						error={errors.age}
						touched={touched.age}
						required={true}
						min={18}
						max={120}
						step={1}
						placeholder="Enter your age"
						helpText="Must be at least 18 years old"
						oninput={(val) => {
							formData.age = val;
							errors.age = validateAge(val);
						}}
						onblur={() => {
							touched.age = true;
						}}
					/>

					<RangeField
						name="satisfaction"
						label="Satisfaction Level"
						bind:value={formData.satisfaction}
						min={0}
						max={100}
						step={5}
						showValue={true}
						showMinMax={true}
						helpText="How satisfied are you with our service?"
					/>
				</div>

				<!-- Selection Fields Section -->
				<div class="form-section">
					<h3 class="subsection-title">Selection Fields</h3>

					<SelectField
						name="country"
						label="Country"
						bind:value={formData.country}
						options={countryOptions}
						error={errors.country}
						touched={touched.country}
						required={true}
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

					<RadioGroup
						name="payment"
						label="Payment Method"
						bind:value={formData.paymentMethod}
						options={paymentOptions}
						error={errors.paymentMethod}
						touched={touched.paymentMethod}
						required={true}
						orientation="horizontal"
						helpText="Select your preferred payment method"
						oninput={(val) => {
							formData.paymentMethod = val;
							errors.paymentMethod = validatePayment(val);
						}}
						onblur={() => {
							touched.paymentMethod = true;
						}}
					/>
				</div>

				<!-- Checkbox Section -->
				<div class="form-section">
					<h3 class="subsection-title">Checkboxes</h3>

					<CheckboxField
						name="terms"
						label="I accept the terms and conditions"
						bind:checked={formData.terms}
						error={errors.terms}
						touched={touched.terms}
						required={true}
						helpText="Please read our terms before accepting"
						oninput={(val) => {
							formData.terms = val;
							errors.terms = validateTerms(val);
						}}
						onblur={() => {
							touched.terms = true;
						}}
					/>

					<CheckboxGroup
						name="interests"
						label="Your Interests"
						bind:values={formData.interests}
						options={interestOptions}
						error={errors.interests}
						touched={touched.interests}
						required={true}
						minSelected={2}
						maxSelected={4}
						orientation="horizontal"
						helpText="Choose 2-4 interests"
						oninput={(vals) => {
							formData.interests = vals;
							errors.interests = validateInterests(vals);
						}}
						onblur={() => {
							touched.interests = true;
						}}
					/>
				</div>

				<!-- Date & Time Section -->
				<div class="form-section">
					<h3 class="subsection-title">Date & Time</h3>

					<DateField
						name="birthdate"
						label="Date of Birth"
						bind:value={formData.birthdate}
						error={errors.birthdate}
						touched={touched.birthdate}
						required={true}
						max={new Date().toISOString().split('T')[0]}
						helpText="Enter your date of birth"
						oninput={(val) => {
							formData.birthdate = val;
							errors.birthdate = validateBirthdate(val);
						}}
						onblur={() => {
							touched.birthdate = true;
						}}
					/>

					<TimeField
						name="appointment"
						label="Appointment Time"
						bind:value={formData.appointmentTime}
						error={errors.appointmentTime}
						touched={touched.appointmentTime}
						required={true}
						min="09:00"
						max="17:00"
						helpText="Select a time between 9 AM and 5 PM"
						oninput={(val) => {
							formData.appointmentTime = val;
							errors.appointmentTime = validateAppointment(val);
						}}
						onblur={() => {
							touched.appointmentTime = true;
						}}
					/>
				</div>

				<!-- Switch & Colour Section -->
				<div class="form-section">
					<h3 class="subsection-title">Other Fields</h3>

					<SwitchField
						name="notifications"
						label="Enable Notifications"
						bind:checked={formData.notifications}
						labelPosition="right"
						helpText="Receive updates about your account"
					/>

					<ColorField
						name="brand"
						label="Brand Colour"
						bind:value={formData.brandColor}
						required={true}
						presetColors={colorPresets}
						showPresets={true}
						helpText="Choose your brand colour"
					/>
				</div>

				<!-- Submit Button -->
				<div class="form-actions">
					<button type="submit" class="submit-btn">Submit Form</button>
					<button type="button" class="reset-btn" onclick={() => location.reload()}>
						Reset Form
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

<style>
	.forms-page {
		min-height: 100vh;
		padding: 2rem 0;
		background-color: #f7fafc;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	/* Header */
	.header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a202c;
		margin: 0 0 1rem 0;
	}

	.description {
		font-size: 1.125rem;
		color: #4a5568;
		max-width: 700px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Demo Section */
	.demo-section {
		background-color: #ffffff;
		border-radius: 0.75rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		padding: 2.5rem;
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.875rem;
		font-weight: 600;
		color: #1a202c;
		margin: 0 0 0.75rem 0;
	}

	.section-description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	/* Form Sections */
	.demo-form {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.form-section:last-of-type {
		border-bottom: none;
		padding-bottom: 0;
	}

	.subsection-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0 0 0.5rem 0;
	}

	/* Form Actions */
	.form-actions {
		display: flex;
		gap: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.submit-btn,
	.reset-btn {
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 500;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.submit-btn {
		background-color: #146ef5;
		color: #ffffff;
		flex: 1;
	}

	.submit-btn:hover {
		background-color: #0c5dd6;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(20, 110, 245, 0.3);
	}

	.submit-btn:active {
		transform: translateY(0);
	}

	.reset-btn {
		background-color: #f7fafc;
		color: #4a5568;
		border: 1px solid #cbd5e0;
	}

	.reset-btn:hover {
		background-color: #edf2f7;
		border-color: #a0aec0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.container {
			padding: 0 1rem;
		}

		.title {
			font-size: 2rem;
		}

		.description {
			font-size: 1rem;
		}

		.demo-section {
			padding: 1.5rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
