<!--
  Test harness: one complete form using every field in the forms family.
  instanceIds.test.ts mounts it twice to prove that identical field names in
  two forms never produce duplicate ids or cross-wired ARIA references.
  Every field is touched with an error and help text so the help, error and
  character-count elements (and the ids pointing at them) are all rendered.
-->
<script lang="ts">
	import CheckboxField from './CheckboxField.svelte';
	import CheckboxGroup from './CheckboxGroup.svelte';
	import ColorField from './ColorField.svelte';
	import DateField from './DateField.svelte';
	import NumberField from './NumberField.svelte';
	import RadioGroup from './RadioGroup.svelte';
	import RangeField from './RangeField.svelte';
	import SelectField from './SelectField.svelte';
	import SwitchField from './SwitchField.svelte';
	import TextareaField from './TextareaField.svelte';
	import TextField from './TextField.svelte';
	import TimeField from './TimeField.svelte';

	const options = [
		{ value: 'a', label: 'Alpha' },
		{ value: 'b', label: 'Beta' }
	];
	const common = { helpText: 'Help', error: 'Error', touched: true };
</script>

<form>
	<TextField name="email" label="Email" {...common} />
	<TextareaField name="bio" label="Bio" maxlength={100} showCharCount {...common} />
	<NumberField name="age" label="Age" {...common} />
	<SelectField name="country" label="Country" {options} {...common} />
	<RadioGroup name="plan" label="Plan" {options} {...common} />
	<CheckboxField name="terms" label="Terms" {...common} />
	<CheckboxGroup name="topics" label="Topics" {options} minSelected={1} {...common} />
	<RangeField name="volume" label="Volume" min={0} max={10} {...common} />
	<DateField name="start" label="Start date" {...common} />
	<TimeField name="at" label="Time" {...common} />
	<SwitchField name="alerts" label="Alerts" {...common} />
	<ColorField name="accent" label="Accent" {...common} />
</form>
