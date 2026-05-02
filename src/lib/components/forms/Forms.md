# Forms — Technical Logic Explainer

## What Does It Do? (Plain English)

A suite of 13 typed form-field components built around one shared wrapper called `FormField`. Each field — text, textarea, number, select, radio group, checkbox, checkbox group, range, date, time, switch, colour, plus the bare `FormField` itself for custom inputs — exposes a consistent prop surface (`name`, `label`, `value`, `error`, `touched`, `helpText`, `required`, `disabled`, `readonly`) so swapping one input for another is a one-line change. Every field uses the same "show errors only after touched" UX pattern, the same ARIA wiring for label / help / error association, and the same focus / disabled / responsive styling.

Think of it as a typewriter with interchangeable typeballs — the carriage, ribbon, and paper feed (the FormField wrapper) stay constant, and you swap the typeball (the input element) for the type of character you need to enter. You learn the carriage once and every typeball Just Works.

## How It Works (Pseudo-Code)

```
SHARED WRAPPER (FormField):
  state:
    fieldId  = `field-${name}`
    helpId   = `${name}-help`
    errorId  = `${name}-error`

  derive visibleError:
    touched && error    // only show error after user interaction

  render:
    <div class:has-error={visibleError}>
      <label for={fieldId}>
        {label}
        {#if required} <span aria-label="required">*</span> {/if}
      </label>
      {#if helpText} <p id={helpId}>{helpText}</p> {/if}
      <div>
        {@render children()}    ← the actual input element goes here
      </div>
      {#if visibleError}
        <span id={errorId} role="alert">{error}</span>
      {/if}
    </div>

INDIVIDUAL FIELD (e.g. TextField):
  takes the same base props plus type-specific ones (type, maxlength, pattern…)
  passes name/label/required/error/touched/helpText through to FormField
  renders the actual <input> with bind:value, aria-required, aria-invalid,
    aria-describedby={helpId}, aria-errormessage={errorId}

CONSUMER:
  let value = $state('')
  let touched = $state(false)
  let error = $derived(/* ... */)

  <TextField
    name="email"
    label="Email"
    type="email"
    bind:value
    {error}
    {touched}
    onblur={() => touched = true}
  />
```

The reactive contract is uniform: pass `value` (or `checked` for boolean fields, or `values[]` for `CheckboxGroup`) and `bind:` it for two-way sync. Pass `error` and `touched` separately so the parent owns the validation logic — the field never invents an error.

## The Core Concept: One Wrapper, 13 Inputs

The naïve approach is to give each input type its own labelling, ID-generation, and error-display code. That produces 13 nearly-identical implementations with subtly different bugs — one forgets `aria-describedby`, another forgets `role="alert"`, a third generates IDs differently and crashes server-side rendering with hydration mismatches.

The wrapper pattern centralises that into one place:

```
TextField    →  <FormField {props}> <input type="text" /> </FormField>
NumberField  →  <FormField {props}> <input type="number" /> </FormField>
DateField    →  <FormField {props}> <input type="date" /> </FormField>
SelectField  →  <FormField {props}> <select>{options}</select> </FormField>
RadioGroup   →  <FormField {props}> {options.map(o => <input type="radio">)} </FormField>
... etc.
```

Every wrapper produces the *exact same DOM scaffold* — same label structure, same error position, same ID scheme, same focus ring on `:focus-visible`, same red border + pink background when `has-error`. The only thing that varies is what's inside the `field-input` slot.

This is `composition over inheritance` for components: rather than have 13 classes inheriting from a base class with override hooks, you have 13 components that wrap one shared component and pass the right innards through a snippet.

## The "Touched" Pattern

A central UX rule across the suite: **errors only appear after the user has interacted with the field**. The wrapper computes:

```
let visibleError = $derived(touched && error);
```

So even if `error` is non-empty (because validation says "name is required" the moment the form mounts), nothing shows until `touched` is true. The parent flips `touched` in two situations:

1. **On blur**: the user has tried, failed, and moved on — the right time to show the error.
2. **On submit**: bulk-flip every field's touched flag, so all errors appear at once when the user attempts to submit an invalid form.

This avoids the "yelling at me before I've typed" anti-pattern that plagues server-side-validation-style forms. The pattern is documented in the code with a literal comment: `// This is the "don't yell at me before I've even tried" logic!`

## Field Shape Pattern

Every field component follows the same prop shape (with type-specific extensions):

```typescript
interface BaseFieldProps {
  name: string;            // required — drives ID generation
  label: string;            // required — visible label + ARIA name
  value?: T;                // bindable — the field's value
  placeholder?: string;
  helpText?: string;        // explanatory copy under the label
  required?: boolean;       // shows * indicator + aria-required
  disabled?: boolean;       // greys out, blocks interaction
  readonly?: boolean;       // looks like disabled but semantic difference
  error?: string;           // current validation message
  touched?: boolean;        // gate for error visibility
  onblur?: () => void;
  oninput?: (value: T) => void;
}
```

The `T` for `value` varies by field type:

- `TextField`, `TextareaField`, `DateField`, `TimeField`, `ColorField`, `SelectField` — `string`
- `NumberField`, `RangeField` — `number`
- `CheckboxField`, `SwitchField` — `boolean` (uses `checked` instead of `value`)
- `RadioGroup` — `string` (the value of the chosen radio)
- `CheckboxGroup` — `string[]` (uses `values` instead of `value`)

Type-specific fields add their own props: `TextField` adds `type | maxlength | pattern | autocomplete`, `NumberField` adds `min | max | step`, `SelectField` adds `options[]`, `RangeField` adds `showValue | showMinMax`, `CheckboxGroup` adds `minSelected | maxSelected`, etc. The base contract stays uniform; the extensions are additive.

## Composition: Multi-Step Forms, Conditional Fields, Dynamic Generation

Because every field exposes the same base props, three common patterns are trivially expressible:

**Multi-step forms.** Render different field sets per step; track validity per step:

```svelte
{#if step === 1}
  <TextField name="firstName" bind:value={form.firstName} />
  <TextField name="email" type="email" bind:value={form.email} />
{:else if step === 2}
  <CheckboxGroup name="interests" bind:values={form.interests} options={…} />
{/if}
```

**Conditional fields.** Show/hide based on prior answers:

```svelte
<CheckboxField name="hasCompany" label="I have a company" bind:checked={hasCompany} />
{#if hasCompany}
  <TextField name="companyName" required={hasCompany} bind:value={companyName} />
{/if}
```

**Dynamic generation.** Drive the form from a config array — useful for survey tools or admin builders:

```svelte
{#each fields as field}
  {#if field.type === 'text' || field.type === 'email'}
    <TextField name={field.name} type={field.type} bind:value={data[field.name]} />
  {:else if field.type === 'number'}
    <NumberField name={field.name} bind:value={data[field.name]} />
  {/if}
{/each}
```

The shared base prop shape makes the dispatch table small.

## State Flow Diagram

```
   PARENT FORM:
     formData      = $state({ name: '', email: '', age: null })
     touched       = $state({ name: false, email: false, age: false })
     errors        = $derived({ name: ..., email: ..., age: ... })
     isValid       = $derived(every error empty)

     ┌─────────────────────────────────────┐
     │  user types into a field            │
     │  → bind:value updates formData[k]   │
     │  → errors derives, possibly changes │
     │  → field re-renders, but touched    │
     │     is still false — no visible     │
     │     error yet                       │
     └────────────┬────────────────────────┘
                  │
                  │ user blurs the field
                  ▼
     ┌─────────────────────────────────────┐
     │  onblur → touched[k] = true         │
     │  → FormField recomputes visibleError│
     │  → if error: render the alert region│
     └────────────┬────────────────────────┘
                  │
                  │ user submits
                  ▼
     ┌─────────────────────────────────────┐
     │  bulk-flip every touched flag → true│
     │  → all errors now visible           │
     │  → if !isValid: bail (focus the     │
     │     first invalid field)            │
     │  → else: submit the data            │
     └─────────────────────────────────────┘

   PER FIELD (FormField wrapper):
     [render label] → [render help if helpText]
                     → [render the input via children snippet]
                     → if (touched && error): [render alert]
```

## Props Reference

The base contract — present on every field component:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | required | Field identifier; drives ID generation for ARIA wiring. |
| `label` | `string` | required | Visible label + ARIA name. |
| `value` | `string \| number \| boolean \| string[]` | varies | Bindable value. `CheckboxField`/`SwitchField` use `checked`; `CheckboxGroup` uses `values`. |
| `placeholder` | `string` | — | Hint text in empty inputs (where supported). |
| `helpText` | `string` | — | Explanatory copy under the label, wired via `aria-describedby`. |
| `required` | `boolean` | `false` | Shows `*` indicator and sets `aria-required`. |
| `disabled` | `boolean` | `false` | Sets the real `disabled` attribute. |
| `readonly` | `boolean` | `false` | Sets `readonly` (not `disabled`) — value is final, not unavailable. |
| `error` | `string` | `''` | Current validation message. Hidden until `touched`. |
| `touched` | `boolean` | `false` | Gate for error visibility. |
| `onblur` | `() => void` | — | Standard blur handler, typically used to flip `touched`. |
| `oninput` | `(value: T) => void` | — | Fires on every value change. |

Field-specific extensions:

- **TextField** — `type: 'text'|'email'|'url'|'tel'|'password'|'search'`, `maxlength`, `pattern`, `autocomplete`.
- **TextareaField** — `rows`, `maxlength`, `showCharCount`.
- **NumberField** — `min`, `max`, `step`.
- **SelectField** — `options: { value, label, disabled? }[]`.
- **RadioGroup** — `options[]`, `orientation: 'horizontal'|'vertical'`.
- **CheckboxField** — `checked` instead of `value`.
- **CheckboxGroup** — `values[]` instead of `value`, `options[]`, `orientation`, `minSelected`, `maxSelected`.
- **RangeField** — `min` (required), `max` (required), `step`, `showValue`, `showMinMax`.
- **DateField** / **TimeField** — `min`, `max` as ISO strings (`YYYY-MM-DD` or `HH:MM`).
- **SwitchField** — `checked`, `size: 'sm'|'md'|'lg'`.
- **ColorField** — value is a hex string.

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| `touched=false` but `error` is non-empty | Error stays hidden. The form looks valid even though it isn't — by design, until the user interacts. |
| `touched=true` but `error` is empty | No alert renders. `has-error` class is not applied. The label stays the default colour. |
| `disabled=true` and `readonly=true` together | Both `disabled` and `readonly` attributes apply. Browsers prefer `disabled` — the field is greyed out and not submitted with the form. |
| `required` + empty value at submit | The `required` attribute triggers the browser's native invalid-form state on submit. Pair with the touched-pattern for immediate inline feedback. |
| `aria-describedby` references both `helpId` and `errorId` | When `helpText` and a visible error are both present, both IDs are referenced; AT reads help text and the error in sequence. |
| Two forms on one page sharing field names (`name='email'`) | Both fields would generate `id="field-email"` — duplicate IDs, broken label-for. Scope names per form (`signup-email` vs `login-email`). |
| User submits without ever touching a field | Parent should bulk-flip `touched` before validating; otherwise the form's invalid state is hidden. The pattern is documented in the suite. |
| Rendering a custom input via `<FormField>` directly | Pass children as a `Snippet`; the wrapper's structure stays the same. Useful for date-range pickers, tag inputs, etc. |
| `error` text contains HTML | Rendered as text, not HTML. No injection risk; the text shows literally. |

## Dependencies

- **Svelte 5.x** — `$state`, `$derived`, `$bindable`, `$props`, snippets. The whole suite is runes-only.
- Zero external dependencies. Native form elements, scoped CSS, inline SVG for custom icons (checkmarks, dropdown arrows).

## File Structure

```
src/lib/components/forms/FormField.svelte         # base wrapper (label + help + error scaffold)
src/lib/components/forms/TextField.svelte         # text / email / url / tel / password / search
src/lib/components/forms/TextareaField.svelte     # multi-line text + char counter
src/lib/components/forms/NumberField.svelte       # number + min/max/step
src/lib/components/forms/SelectField.svelte       # select + custom arrow
src/lib/components/forms/RadioGroup.svelte        # radio button group
src/lib/components/forms/CheckboxField.svelte     # single checkbox
src/lib/components/forms/CheckboxGroup.svelte     # multi-select checkbox group
src/lib/components/forms/RangeField.svelte        # range slider with optional value display
src/lib/components/forms/DateField.svelte         # native date picker
src/lib/components/forms/TimeField.svelte         # native time picker
src/lib/components/forms/SwitchField.svelte       # toggle switch wrapper
src/lib/components/forms/ColorField.svelte        # colour picker with preview swatch
src/lib/components/forms/Forms.md                 # this file
src/lib/components/forms/Forms.test.ts            # vitest unit tests for all 13 fields
src/routes/forms/+page.svelte                     # demo page
```
