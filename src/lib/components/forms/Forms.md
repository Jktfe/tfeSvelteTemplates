# Form Components - Complete Guide

## Overview

The TFE Svelte Templates form system provides a complete set of **13 accessible, type-safe form components** built with Svelte 5. Every component wraps FormField for consistent styling, validation display, and accessibility features.

**Think of it like:** A well-organized toolbox where every tool (input type) fits into the same handle (FormField wrapper), so they all feel familiar and work together seamlessly.

---

## Architecture

### The FormField Wrapper Pattern

All form components use FormField as their base wrapper. This ensures:

- **Consistent Visual Design**: Labels, help text, and errors appear the same everywhere
- **Accessibility**: Automatic ID generation and ARIA associations
- **UX Best Practices**: "Touched" state prevents error messages before user interaction
- **Zero Repetition**: Common functionality lives in one place

```
┌─────────────────────────────────────┐
│ FormField (Base Wrapper)            │
│ ┌─────────────────────────────────┐ │
│ │ Label + Required Indicator (*)  │ │
│ │ Help Text                       │ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ Actual Input Element      │   │ │  ← TextField, SelectField, etc.
│ │ └───────────────────────────┘   │ │
│ │ Error Message (if touched)      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

###Common Patterns Across All Form Components

Every form field component shares these features:

| Feature | Implementation |
|---------|----------------|
| **Two-way binding** | Uses `$bindable()` rune for reactive value updates |
| **Validation** | Shows errors only after field is "touched" (better UX) |
| **Accessibility** | ARIA labels, describedby, errormessage, required attributes |
| **Disabled state** | Visual opacity + `cursor: not-allowed` + prevents interaction |
| **Readonly state** | Looks like disabled but semantic difference (data is final) |
| **Focus styling** | Blue ring (`box-shadow`) for keyboard navigation |
| **Error styling** | Red border + pink background for invalid fields |
| **Responsive** | Smaller font and padding on mobile devices |

---

## Base Props (Inherited by All Components)

```typescript
interface BaseFieldProps {
  name: string;           // Field identifier (required)
  label: string;          // Display label (required)
  value?: any;            // Current value (bindable)
  placeholder?: string;   // Placeholder text
  helpText?: string;      // Explanatory text below label
  required?: boolean;     // Shows * indicator
  disabled?: boolean;     // Greys out and prevents interaction
  readonly?: boolean;     // Prevents editing but looks "final" not "disabled"
  error?: string;         // Validation error message
  touched?: boolean;      // Has user interacted? (controls error visibility)
  onblur?: () => void;    // Called when field loses focus
  oninput?: (value) => void; // Called on every change
}
```

---

## Components Reference

### 1. FormField (Base Wrapper)

**Purpose**: Wraps all other form components to provide consistent structure.

**Use directly when**: You need a custom input type not covered by the other components.

```svelte
<FormField name="custom" label="Custom Field" required={true}>
  <input type="range" min="0" max="100" />
</FormField>
```

**What it provides**:
- Label with required indicator (*)
- Optional help text
- Error message display (only when touched)
- Automatic ID generation for ARIA associations

---

### 2. TextField

**What it does**: Text-based input supporting multiple types (text, email, url, tel, password, search).

**Additional props**:
```typescript
{
  type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
  maxlength?: number;
  pattern?: string;        // Regex pattern for validation
  autocomplete?: string;   // Browser autocomplete hint
}
```

**Usage examples**:

```svelte
<script>
  let email = $state('');
  let hasError = $derived(!email.includes('@'));
</script>

<!-- Basic email input -->
<TextField
  name="email"
  label="Email Address"
  type="email"
  bind:value={email}
  required={true}
  error={hasError ? 'Valid email required' : ''}
  helpText="We'll never share your email"
/>

<!-- Password with pattern validation -->
<TextField
  name="password"
  label="Password"
  type="password"
  bind:value={password}
  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
  error={passwordError}
  helpText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
/>

<!-- Search field with autocomplete -->
<TextField
  name="search"
  label="Search"
  type="search"
  placeholder="Type to search..."
  autocomplete="off"
/>
```

---

### 3. TextareaField

**What it does**: Multi-line text input with optional character counter.

**Additional props**:
```typescript
{
  rows?: number;          // Visible rows (default: 4)
  maxlength?: number;     // Maximum characters
  showCharCount?: boolean; // Show "X / Y characters" below textarea
}
```

**Usage examples**:

```svelte
<!-- Basic textarea -->
<TextareaField
  name="bio"
  label="Biography"
  bind:value={bio}
  rows={6}
  placeholder="Tell us about yourself..."
/>

<!-- With character limit -->
<TextareaField
  name="tweet"
  label="Tweet"
  bind:value={tweet}
  maxlength={280}
  showCharCount={true}
  helpText="Keep it concise!"
/>
```

---

### 4. NumberField

**What it does**: Numeric input with optional min/max/step controls.

**Additional props**:
```typescript
{
  min?: number;
  max?: number;
  step?: number;  // Increment/decrement step (default: 1)
}
```

**Usage examples**:

```svelte
<!-- Age input with constraints -->
<NumberField
  name="age"
  label="Age"
  bind:value={age}
  min={18}
  max={120}
  required={true}
  error={age < 18 ? 'Must be 18 or older' : ''}
/>

<!-- Price with decimal steps -->
<NumberField
  name="price"
  label="Price (£)"
  bind:value={price}
  min={0}
  step={0.01}
  placeholder="0.00"
/>

<!-- Quantity with integer steps -->
<NumberField
  name="quantity"
  label="Quantity"
  bind:value={quantity}
  min={1}
  max={99}
  step={1}
/>
```

---

### 5. SelectField

**What it does**: Dropdown select with custom styled arrow.

**Additional props**:
```typescript
{
  options: SelectOption[];  // Array of { value, label, disabled? }
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

**Usage examples**:

```svelte
<script>
  const countries = [
    { value: 'uk', label: 'United Kingdom' },
    { value: 'us', label: 'United States' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany', disabled: true }
  ];
</script>

<!-- Basic select -->
<SelectField
  name="country"
  label="Country"
  bind:value={country}
  options={countries}
  placeholder="Choose a country..."
  required={true}
/>

<!-- With dynamic error -->
<SelectField
  name="size"
  label="T-Shirt Size"
  bind:value={size}
  options={sizes}
  error={!size ? 'Please select a size' : ''}
  touched={formSubmitted}
/>
```

---

### 6. RadioGroup

**What it does**: Radio button group with horizontal or vertical layout.

**Additional props**:
```typescript
{
  options: SelectOption[];
  orientation?: 'horizontal' | 'vertical';  // Default: 'vertical'
}
```

**Usage examples**:

```svelte
<script>
  const plans = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro (£9/mo)' },
    { value: 'enterprise', label: 'Enterprise' }
  ];
</script>

<!-- Vertical layout (default) -->
<RadioGroup
  name="plan"
  label="Choose a plan"
  bind:value={selectedPlan}
  options={plans}
  required={true}
/>

<!-- Horizontal layout -->
<RadioGroup
  name="gender"
  label="Gender"
  bind:value={gender}
  options={genderOptions}
  orientation="horizontal"
/>
```

---

### 7. CheckboxField

**What it does**: Single checkbox for boolean values.

**Props** (note: uses `checked` instead of `value`):
```typescript
{
  checked?: boolean;  // Bindable checked state
  // ...all other BaseFieldProps except value
}
```

**Usage examples**:

```svelte
<!-- Basic checkbox -->
<CheckboxField
  name="terms"
  label="I agree to the terms and conditions"
  bind:checked={agreedToTerms}
  required={true}
  error={!agreedToTerms ? 'You must agree to continue' : ''}
/>

<!-- Newsletter opt-in -->
<CheckboxField
  name="newsletter"
  label="Send me marketing emails"
  bind:checked={wantsNewsletter}
  helpText="You can unsubscribe at any time"
/>
```

---

### 8. CheckboxGroup

**What it does**: Multiple checkboxes for selecting multiple values from a list.

**Additional props**:
```typescript
{
  options: SelectOption[];
  values?: string[];           // Array of selected values (bindable)
  orientation?: 'horizontal' | 'vertical';
  minSelected?: number;        // Minimum selections required
  maxSelected?: number;        // Maximum selections allowed
}
```

**Usage examples**:

```svelte
<script>
  const interests = [
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'reading', label: 'Reading' },
    { value: 'travel', label: 'Travel' }
  ];

  let selected = $state([]);
  let error = $derived(selected.length < 1 ? 'Select at least one' : '');
</script>

<!-- Multiple selection with validation -->
<CheckboxGroup
  name="interests"
  label="Your Interests"
  bind:values={selected}
  options={interests}
  minSelected={1}
  maxSelected={3}
  error={error}
  helpText="Choose 1-3 interests"
/>

<!-- Horizontal layout -->
<CheckboxGroup
  name="days"
  label="Available Days"
  bind:values={availableDays}
  options={weekdays}
  orientation="horizontal"
/>
```

---

### 9. RangeField

**What it does**: Slider input with optional value display and min/max labels.

**Additional props**:
```typescript
{
  min: number;             // Minimum value (required)
  max: number;             // Maximum value (required)
  step?: number;           // Increment step (default: 1)
  showValue?: boolean;     // Display current value above slider
  showMinMax?: boolean;    // Display min/max labels below slider
}
```

**Usage examples**:

```svelte
<!-- Volume slider -->
<RangeField
  name="volume"
  label="Volume"
  bind:value={volume}
  min={0}
  max={100}
  step={5}
  showValue={true}
/>

<!-- Price range with labels -->
<RangeField
  name="price-range"
  label="Maximum Price"
  bind:value={maxPrice}
  min={0}
  max={1000}
  step={50}
  showValue={true}
  showMinMax={true}
/>

<!-- Rating slider -->
<RangeField
  name="rating"
  label="How would you rate this?"
  bind:value={rating}
  min={1}
  max={5}
  step={1}
  showValue={true}
  helpText="1 = Poor, 5 = Excellent"
/>
```

---

### 10. DateField

**What it does**: Date picker input with optional min/max constraints.

**Additional props**:
```typescript
{
  min?: string;  // Minimum date (YYYY-MM-DD)
  max?: string;  // Maximum date (YYYY-MM-DD)
}
```

**Usage examples**:

```svelte
<!-- Basic date picker -->
<DateField
  name="birthdate"
  label="Date of Birth"
  bind:value={birthdate}
  required={true}
  max={new Date().toISOString().split('T')[0]}
/>

<!-- Date range constraint -->
<DateField
  name="appointment"
  label="Appointment Date"
  bind:value={appointmentDate}
  min="2025-01-01"
  max="2025-12-31"
  helpText="Available dates in 2025"
/>
```

---

### 11. TimeField

**What it does**: Time picker input (24-hour format) with optional constraints.

**Additional props**:
```typescript
{
  min?: string;  // Minimum time (HH:MM)
  max?: string;  // Maximum time (HH:MM)
}
```

**Usage examples**:

```svelte
<!-- Basic time picker -->
<TimeField
  name="meeting-time"
  label="Meeting Time"
  bind:value={meetingTime}
/>

<!-- Working hours constraint -->
<TimeField
  name="start-time"
  label="Start Time"
  bind:value={startTime}
  min="09:00"
  max="17:00"
  helpText="Business hours: 9am - 5pm"
/>
```

---

### 12. SwitchField

**What it does**: Toggle switch for boolean values (more modern than checkbox).

**Props** (uses `checked` instead of `value`):
```typescript
{
  checked?: boolean;  // Bindable checked state
  size?: 'sm' | 'md' | 'lg';  // Switch size
}
```

**Usage examples**:

```svelte
<!-- Basic toggle -->
<SwitchField
  name="notifications"
  label="Enable Notifications"
  bind:checked={notificationsEnabled}
/>

<!-- Larger toggle with help text -->
<SwitchField
  name="dark-mode"
  label="Dark Mode"
  bind:checked={darkMode}
  size="lg"
  helpText="Toggle dark/light theme"
/>

<!-- Disabled toggle (showing current state) -->
<SwitchField
  name="premium"
  label="Premium Features"
  checked={true}
  disabled={true}
  helpText="Upgrade to unlock"
/>
```

---

### 13. ColorField

**What it does**: Colour picker with preview swatch.

**Props**: Uses standard BaseFieldProps (value is hex colour string).

**Usage examples**:

```svelte
<!-- Basic colour picker -->
<ColorField
  name="theme-colour"
  label="Theme Colour"
  bind:value={themeColour}
/>

<!-- With default value -->
<ColorField
  name="background"
  label="Background Colour"
  bind:value={bgColour}
  helpText="Choose your preferred background"
/>

<!-- Brand colour with validation -->
<script>
  let brandColour = $state('#146ef5');
  let colourError = $derived(
    !brandColour.match(/^#[0-9A-Fa-f]{6}$/)
      ? 'Must be a valid hex colour'
      : ''
  );
</script>

<ColorField
  name="brand"
  label="Brand Colour"
  bind:value={brandColour}
  error={colourError}
  required={true}
/>
```

---

## Validation System

### The "Touched" Pattern

The form system uses a UX-friendly validation pattern:

```typescript
// Only show errors AFTER user has interacted with the field
let visibleError = $derived(touched && error);
```

**Why this matters**: Users hate seeing "This field is required" before they've even started typing. The "touched" state ensures errors only appear after:
- User clicks into the field and then clicks away (blur event)
- Form submission is attempted
- Parent component explicitly marks field as touched

### Example Validation Flow

```svelte
<script>
  let email = $state('');
  let emailTouched = $state(false);

  // Validate email format
  let emailError = $derived(() => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    return '';
  });

  function handleBlur() {
    emailTouched = true;  // Now errors will show
  }
</script>

<TextField
  name="email"
  label="Email"
  type="email"
  bind:value={email}
  error={emailError}
  touched={emailTouched}
  onblur={handleBlur}
/>
```

### Form-Level Validation

```svelte
<script>
  let formData = $state({
    name: '',
    email: '',
    age: null
  });

  let touched = $state({
    name: false,
    email: false,
    age: false
  });

  let errors = $derived({
    name: !formData.name ? 'Name required' : '',
    email: !formData.email.includes('@') ? 'Invalid email' : '',
    age: formData.age < 18 ? 'Must be 18+' : ''
  });

  let isValid = $derived(
    Object.values(errors).every(err => !err)
  );

  function handleSubmit() {
    // Mark all fields as touched to show errors
    touched = {
      name: true,
      email: true,
      age: true
    };

    if (!isValid) {
      console.log('Form has errors');
      return;
    }

    // Submit the form
    submitToAPI(formData);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <TextField
    name="name"
    label="Name"
    bind:value={formData.name}
    error={errors.name}
    touched={touched.name}
    onblur={() => touched.name = true}
  />

  <TextField
    name="email"
    label="Email"
    type="email"
    bind:value={formData.email}
    error={errors.email}
    touched={touched.email}
    onblur={() => touched.email = true}
  />

  <NumberField
    name="age"
    label="Age"
    bind:value={formData.age}
    min={18}
    error={errors.age}
    touched={touched.age}
    onblur={() => touched.age = true}
  />

  <button type="submit" disabled={!isValid}>
    Submit
  </button>
</form>
```

---

## Accessibility Features

Every form component implements these accessibility features:

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Label association** | `<label for={fieldId}>` | Links label to input for clickability |
| **Required indicator** | `aria-required={true}` + visual `*` | Screen readers announce requirement |
| **Help text** | `aria-describedby={helpId}` | Associates help text with input |
| **Error messages** | `aria-errormessage={errorId}` | Associates errors with input |
| **Invalid state** | `aria-invalid={hasError}` | Announces validation state |
| **Live region** | `role="alert"` on errors | Screen reader announces errors immediately |
| **Focus indicators** | Blue ring on `:focus` | Keyboard navigation visibility |
| **Disabled state** | `aria-disabled` + visual styling | Clear unavailability signal |

### Keyboard Navigation

All components support standard keyboard interactions:

- **Tab**: Move between fields
- **Shift + Tab**: Move backwards
- **Enter**: Submit form (on most inputs)
- **Space**: Toggle checkboxes/switches, activate buttons
- **Arrow keys**: Adjust number/range/date/time fields
- **Arrow keys**: Navigate radio groups and select dropdowns

---

## Styling & Theming

### Design Tokens

All form components use consistent design tokens:

```css
/* Colours */
--primary: #146ef5;           /* Focus border */
--error: #dc2626;             /* Error state */
--text-primary: #1a202c;      /* Main text */
--text-secondary: #6b7280;    /* Help text */
--border: #cbd5e0;            /* Default border */
--bg-input: #ffffff;          /* Input background */
--bg-disabled: #f7fafc;       /* Disabled background */

/* Sizing */
--input-padding: 0.625rem 0.875rem;
--input-font-size: 0.9375rem;
--input-border-radius: 0.375rem;
--label-font-size: 0.875rem;

/* Transitions */
--input-transition: all 0.15s ease-in-out;
```

### Customising Styles

Since all styles are scoped, you can override them using:

1. **CSS Custom Properties** (if component uses them)
2. **Global styles** with `:global()` selector
3. **Wrapper classes** via the optional `class` prop

```svelte
<!-- Add custom class via wrapper -->
<TextField
  name="custom"
  label="Custom Styled"
  class="my-custom-input"
/>

<style>
  :global(.my-custom-input input) {
    border-color: purple;
    border-radius: 999px;
  }
</style>
```

---

## Testing

All 13 form components are comprehensively tested in [`forms/Forms.test.ts`](./Forms.test.ts).

**Test coverage includes**:
- ✅ Render without crashing (69 tests total)
- ✅ Props apply correctly (labels, values, states)
- ✅ Validation error display works
- ✅ Accessibility features (ARIA, roles, labels)
- ✅ Disabled/readonly states behave correctly
- ✅ User interactions (typing, clicking, toggling)
- ✅ Two-way binding updates correctly

### Running Tests

```bash
# Run all form tests
bun run test forms/Forms.test.ts

# Watch mode
bun run test:watch forms/Forms.test.ts

# Visual interface
bun run test:ui
```

---

## Common Patterns & Recipes

### Dynamic Form Generation

```svelte
<script>
  const fields = [
    { type: 'text', name: 'firstName', label: 'First Name' },
    { type: 'email', name: 'email', label: 'Email' },
    { type: 'number', name: 'age', label: 'Age', min: 18 }
  ];

  let formData = $state({});
</script>

{#each fields as field}
  {#if field.type === 'text' || field.type === 'email'}
    <TextField
      name={field.name}
      label={field.label}
      type={field.type}
      bind:value={formData[field.name]}
    />
  {:else if field.type === 'number'}
    <NumberField
      name={field.name}
      label={field.label}
      min={field.min}
      bind:value={formData[field.name]}
    />
  {/if}
{/each}
```

### Multi-Step Form

```svelte
<script>
  let step = $state(1);
  let formData = $state({ /* ... */ });
</script>

{#if step === 1}
  <!-- Step 1: Personal Info -->
  <TextField name="name" bind:value={formData.name} />
  <TextField name="email" bind:value={formData.email} />
  <button onclick={() => step = 2}>Next</button>
{:else if step === 2}
  <!-- Step 2: Preferences -->
  <CheckboxGroup name="interests" bind:values={formData.interests} />
  <button onclick={() => step = 1}>Back</button>
  <button onclick={submit}>Submit</button>
{/if}
```

### Conditional Fields

```svelte
<script>
  let hasCompany = $state(false);
  let companyName = $state('');
</script>

<CheckboxField
  name="has-company"
  label="I have a company"
  bind:checked={hasCompany}
/>

{#if hasCompany}
  <TextField
    name="company"
    label="Company Name"
    bind:value={companyName}
    required={hasCompany}
  />
{/if}
```

---

## Dependencies

**Zero external dependencies.**

All form components use only:
- Svelte 5 runes (`$state`, `$derived`, `$bindable`, `$props`)
- Standard HTML form elements
- Scoped CSS
- Inline SVG for custom icons (checkmarks, arrows)

---

## Browser Compatibility

| Feature | Support |
|---------|---------|
| Base functionality | All modern browsers (Chrome, Firefox, Safari, Edge) |
| CSS `:focus-visible` | All modern browsers |
| Input types (email, url, tel, etc.) | All modern browsers (graceful degradation) |
| Date/time pickers | Chrome, Edge (native), Safari (native), Firefox (native since v57) |
| Colour picker | All modern browsers |

---

*Documentation last updated: 3 January 2026*
