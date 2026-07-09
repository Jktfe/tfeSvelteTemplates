<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import DatePicker from '$lib/components/DatePicker.svelte';

	const shell = catalogShellPropsForSlug('/datepicker')!;

	const codeExplanation =
		'DatePicker is a zero-dependency, accessible single-date picker. A trigger button opens a role="grid" month popover with a roving tabindex: arrow keys move by day, PageUp/PageDown change month, Home/End jump to week edges, Enter/Space select, Escape closes. The value is a bindable ISO yyyy-mm-dd string, min/max disable out-of-range days, and Intl.DateTimeFormat drives the locale-aware labels and first day of week. "Today" is passed in as an ISO string rather than read from the clock, keeping it deterministic and SSR-safe.';

	// Pinned today for stable, deterministic demos.
	const today = '2026-06-06';

	// Default variant — bindable so we can echo the live value.
	let basicDate = $state('2026-06-15');

	// Bounded variant — only this quarter is selectable.
	let boundedDate = $state('2026-06-20');

	// Locale variant — US English starts the week on Sunday.
	let usDate = $state('2026-07-04');
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Keyboard', 'Intl', 'Zero-dep']}
	{codeExplanation}
>
	{#snippet demo()}
		<section class="dp-demo-section">
			<h3>Default picker</h3>
			<p class="dp-demo-hint">
				Click to open, then drive it from the keyboard: arrows move by day, PageUp/PageDown
				change month, Enter or Space selects.
			</p>
			<div class="dp-demo-stage">
				<DatePicker bind:value={basicDate} {today} label="Choose a date" />
			</div>
			<p class="dp-demo-state">Selected: <code>{basicDate || '(none)'}</code></p>
		</section>

		<section class="dp-demo-section">
			<h3>Bounded range</h3>
			<p class="dp-demo-hint">
				<code>min</code> and <code>max</code> grey out and disable days outside the second
				quarter of 2026.
			</p>
			<div class="dp-demo-stage">
				<DatePicker
					bind:value={boundedDate}
					{today}
					min="2026-04-01"
					max="2026-06-30"
					label="Choose a date in Q2"
				/>
			</div>
			<p class="dp-demo-state">Selected: <code>{boundedDate || '(none)'}</code></p>
		</section>

		<section class="dp-demo-section">
			<h3>US English locale</h3>
			<p class="dp-demo-hint">
				A different <code>locale</code> changes the labels and starts the week on Sunday — the
				grid layout follows the locale's first day of week.
			</p>
			<div class="dp-demo-stage">
				<DatePicker bind:value={usDate} {today} locale="en-US" label="Choose a date" />
			</div>
			<p class="dp-demo-state">Selected: <code>{usDate || '(none)'}</code></p>
		</section>

		<section class="dp-demo-section">
			<h3>Empty &amp; disabled states</h3>
			<p class="dp-demo-hint">
				With no value the trigger shows the <code>placeholder</code>; the disabled picker
				cannot open.
			</p>
			<div class="dp-demo-stage dp-demo-stage--row">
				<DatePicker {today} placeholder="Pick a date…" label="Empty picker" />
				<DatePicker value="2026-06-15" {today} disabled label="Disabled picker" />
			</div>
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
					<td><code>value</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Bindable selected date as an ISO <code>yyyy-mm-dd</code> string.</td>
				</tr>
				<tr>
					<td><code>min</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Earliest selectable ISO date (inclusive).</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Latest selectable ISO date (inclusive).</td>
				</tr>
				<tr>
					<td><code>today</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>ISO date highlighted as today — passed in, not read from the clock.</td>
				</tr>
				<tr>
					<td><code>locale</code></td>
					<td><code>string</code></td>
					<td><code>'en-GB'</code></td>
					<td>BCP-47 locale for month/weekday labels and first day of week.</td>
				</tr>
				<tr>
					<td><code>placeholder</code></td>
					<td><code>string</code></td>
					<td><code>'Select date'</code></td>
					<td>Trigger text shown when no date is selected.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Choose date'</code></td>
					<td>Accessible name (<code>aria-label</code>) for the trigger button.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disables the trigger; the popover cannot open.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dp-demo-section {
		margin-bottom: 2rem;
	}

	.dp-demo-section h3 {
		margin: 0 0 0.35rem;
		font-size: 1.05rem;
		font-weight: 600;
	}

	.dp-demo-hint {
		margin: 0 0 0.85rem;
		font-size: 0.9rem;
		opacity: 0.75;
		max-width: 46ch;
	}

	.dp-demo-stage {
		display: flex;
		align-items: flex-start;
	}

	.dp-demo-stage--row {
		flex-wrap: wrap;
		gap: 1rem;
	}

	.dp-demo-state {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
	}

	.dp-demo-state code,
	.dp-demo-hint code {
		padding: 0.1rem 0.35rem;
		border-radius: 0.3rem;
		background: rgba(127, 127, 160, 0.16);
		font-size: 0.85em;
	}
</style>
