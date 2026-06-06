<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Combobox from '$lib/components/Combobox.svelte';

	const shell = catalogShellPropsForSlug('/combobox')!;

	const countries = [
		{ value: 'gb', label: 'United Kingdom' },
		{ value: 'fr', label: 'France' },
		{ value: 'de', label: 'Germany' },
		{ value: 'es', label: 'Spain' },
		{ value: 'it', label: 'Italy' },
		{ value: 'nl', label: 'Netherlands' },
		{ value: 'pt', label: 'Portugal' },
		{ value: 'ie', label: 'Ireland' }
	];

	const fruit = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'mango', label: 'Mango' },
		{ value: 'peach', label: 'Peach' },
		{ value: 'pear', label: 'Pear' }
	];

	// Single-select selection lives here and is shown in the live-state strip.
	let single = $state<string | null>('gb');
	// Multi-select selection — an array of values.
	let many = $state<string[]>(['apple', 'mango']);

	const singleLabel = $derived(
		single != null ? (countries.find((c) => c.value === single)?.label ?? single) : '—'
	);
	const manyLabels = $derived(
		many.map((v) => fruit.find((f) => f.value === v)?.label ?? v).join(', ') || '—'
	);

	const codeExplanation =
		'Combobox fuses a text input with a filtered dropdown. Type to substring-match option labels; drive it entirely from the keyboard with ArrowUp/Down, Home/End, Enter and Escape. The selection lives in a bindable value prop — a string | null in single mode, a string[] in multiple mode where each pick becomes a removable chip and Backspace on an empty field pops the last one. role="combobox" with aria-activedescendant keeps focus on the input while screen readers announce the active option.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-deps', 'Typeahead']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="cb-demo-section">
			<h3>Single select</h3>
			<p class="cb-demo-hint">
				Type to filter, then click or press Enter. The chosen label stays in the field.
			</p>
			<Combobox
				options={countries}
				bind:value={single}
				placeholder="Search a country…"
				label="Country"
			/>
			<p class="cb-demo-state">Selected: <code>{singleLabel}</code></p>
		</section>

		<section class="cb-demo-section">
			<h3>Multiple select (chips)</h3>
			<p class="cb-demo-hint">
				Each pick becomes a removable chip; already-chosen rows disappear from the list. Backspace
				on an empty field pops the last chip.
			</p>
			<Combobox
				options={fruit}
				bind:value={many}
				multiple
				placeholder="Add some fruit…"
				label="Fruit"
			/>
			<p class="cb-demo-state">Selected: <code>{manyLabels}</code></p>
		</section>

		<section class="cb-demo-section">
			<h3>Empty state &amp; disabled</h3>
			<p class="cb-demo-hint">
				A custom empty message appears when nothing matches; the second control is disabled.
			</p>
			<Combobox
				options={countries}
				value={null}
				emptyMessage="No country found"
				placeholder="Try typing “zzz”…"
				label="Country (empty-state demo)"
			/>
			<div class="cb-demo-gap"></div>
			<Combobox options={countries} value="fr" disabled label="Country (disabled)" />
		</section>
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
					<td><code>options</code></td>
					<td><code>ComboOption[]</code></td>
					<td><code>[]</code></td>
					<td>Selectable items, each <code>{'{ value, label }'}</code>.</td>
				</tr>
				<tr>
					<td><code>value</code></td>
					<td><code>string | null | string[]</code> (bindable)</td>
					<td><code>null</code> / <code>[]</code></td>
					<td>Selected value(s); a <code>string[]</code> when <code>multiple</code>, else a single
						<code>string</code> or <code>null</code>.</td>
				</tr>
				<tr>
					<td><code>multiple</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Enables multi-select chip mode.</td>
				</tr>
				<tr>
					<td><code>placeholder</code></td>
					<td><code>string</code></td>
					<td><code>'Search…'</code></td>
					<td>Placeholder text for the input.</td>
				</tr>
				<tr>
					<td><code>emptyMessage</code></td>
					<td><code>string</code></td>
					<td><code>'No matches'</code></td>
					<td>Shown in the popup when the filter yields nothing.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disables the input and chip-remove buttons.</td>
				</tr>
				<tr>
					<td><code>id</code></td>
					<td><code>string</code></td>
					<td>auto</td>
					<td>Base id used to wire the ARIA relationships.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Combobox'</code></td>
					<td>Accessible name (visually hidden) for the control and listbox.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.cb-demo-section {
		margin-bottom: 2rem;
	}

	.cb-demo-section h3 {
		margin: 0 0 0.35rem;
		font-size: 1.05rem;
	}

	.cb-demo-hint {
		margin: 0 0 0.85rem;
		color: var(--cp-muted, #6b7280);
		font-size: 0.9rem;
		max-width: 32rem;
	}

	.cb-demo-state {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
	}

	.cb-demo-state code {
		padding: 0.1rem 0.4rem;
		border-radius: 0.35rem;
		background: rgba(127, 127, 127, 0.16);
	}

	.cb-demo-gap {
		height: 0.85rem;
	}
</style>
