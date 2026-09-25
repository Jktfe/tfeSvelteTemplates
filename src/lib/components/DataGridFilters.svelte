<!--
	============================================================
	DataGridFilters
	============================================================
	WHAT — A collapsible filter panel (department + status checkboxes, a salary
	       range and a hire-date range) that reports a plain filter object to
	       its parent.
	WHY  — Global search answers "find me Alice"; structured filters answer
	       "show me active engineers hired this year". The panel owns the UI
	       state only — the parent decides how to apply the filters, so it
	       pairs with DataGridBasic, DataGridAdvanced or a server query alike.

	FEATURES
	- Multi-select department and status checkboxes
	- Min / max salary sliders that can never cross each other
	- From / to hire-date inputs
	- Active-filter count badge and a one-click "Clear all"
	- Collapsible panel (collapsed by default) with a gentle reveal
	- Emits a *snapshot* (plain object), never the live reactive proxy

	ACCESSIBILITY
	- Toggle button exposes aria-expanded + aria-controls
	- Each group is a <fieldset> with a <legend>, so screen readers announce context
	- Every control has a visible label; ids are unique per instance ($props.id)
	- Reveal animation is dropped under prefers-reduced-motion

	DEPENDENCIES
	- Zero external packages. $lib/types is a type-only import.

	PERFORMANCE
	- One $effect emits on any change; the parent's filter pass is the only
	  real work. Debounce in the parent if that pass is expensive.

	THEMING (docs/THEMING.md)
	- Chrome (surface, borders, text, inputs) flips under prefers-color-scheme: dark.
	- Brand --dgf-accent (badge, slider thumb, checkbox tint, focus) stays constant.

	USAGE
	<DataGridFilters
		departments={['Engineering', 'Sales']}
		statuses={['active', 'on-leave']}
		salaryRange={{ min: 30000, max: 150000 }}
		onFiltersChange={(f) => (filters = f)}
	/>

	PROPS
	| Prop              | Type                                   | Default                        | Description                          |
	|-------------------|----------------------------------------|--------------------------------|--------------------------------------|
	| departments       | string[]                               | []                             | Department checkbox options.         |
	| statuses          | string[]                               | []                             | Status checkbox options.             |
	| salaryRange       | { min: number; max: number }           | { min: 30000, max: 150000 }    | Slider bounds (also the "no filter" state). |
	| salaryStep        | number                                 | 5000                           | Slider step.                         |
	| initiallyExpanded | boolean                                | false                          | Start with the panel open.           |
	| onFiltersChange   | (filters: DataGridFilterValues) => void | —                             | Fires on mount and on every change.  |
	============================================================
-->

<script lang="ts">
	import type { DataGridFilterValues } from '$lib/types';

	interface Props {
		/** Department checkbox options */
		departments?: string[];
		/** Status checkbox options */
		statuses?: string[];
		/** Slider bounds — also what "no salary filter" means */
		salaryRange?: { min: number; max: number };
		/** Slider step size */
		salaryStep?: number;
		/** Start with the panel open */
		initiallyExpanded?: boolean;
		/** Receives a plain snapshot of the filters on mount and on every change */
		onFiltersChange?: (filters: DataGridFilterValues) => void;
	}

	let {
		departments = [],
		statuses = [],
		salaryRange = { min: 30000, max: 150000 },
		salaryStep = 5000,
		initiallyExpanded = false,
		onFiltersChange
	}: Props = $props();

	// Unique per instance, so two panels on one page never share ids.
	const uid = $props.id();
	const panelId = `${uid}-panel`;

	function emptyFilters(): DataGridFilterValues {
		return {
			departments: [],
			statuses: [],
			salaryMin: salaryRange.min,
			salaryMax: salaryRange.max,
			hireDateFrom: '',
			hireDateTo: ''
		};
	}

	// Seeded once from the props; after that the panel owns its own state.
	let filters = $state<DataGridFilterValues>(emptyFilters());

	/* svelte-ignore state_referenced_locally */
	let isExpanded = $state(initiallyExpanded);

	/** A filter counts as "active" when it differs from the empty state. */
	const activeFilterCount = $derived.by(() => {
		let count = 0;
		if (filters.departments.length > 0) count++;
		if (filters.statuses.length > 0) count++;
		if (filters.salaryMin !== salaryRange.min || filters.salaryMax !== salaryRange.max) count++;
		if (filters.hireDateFrom || filters.hireDateTo) count++;
		return count;
	});

	// $state.snapshot both tracks every nested field and hands the parent a
	// plain object — so the parent can't accidentally mutate our state.
	$effect(() => {
		const snapshot = $state.snapshot(filters);
		onFiltersChange?.(snapshot);
	});

	function toggleValue(list: string[], value: string): string[] {
		return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
	}

	// Keep min ≤ max: whichever thumb the user drags pushes the other along.
	function setSalaryMin(value: number) {
		filters.salaryMin = value;
		if (value > filters.salaryMax) filters.salaryMax = value;
	}

	function setSalaryMax(value: number) {
		filters.salaryMax = value;
		if (value < filters.salaryMin) filters.salaryMin = value;
	}

	function clearAllFilters() {
		filters = emptyFilters();
	}

	function formatSalary(value: number): string {
		return `£${value.toLocaleString('en-GB')}`;
	}
</script>

<div class="filters-container">
	<div class="filters-header">
		<button
			type="button"
			class="expand-button"
			onclick={() => (isExpanded = !isExpanded)}
			aria-expanded={isExpanded}
			aria-controls={panelId}
		>
			<svg class="expand-icon" class:expanded={isExpanded} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
				<path d="M4 2.5L7.5 6 4 9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span class="filter-title">
				Filters
				{#if activeFilterCount > 0}
					<span class="filter-badge" aria-label="{activeFilterCount} active filters">
						{activeFilterCount}
					</span>
				{/if}
			</span>
		</button>

		{#if activeFilterCount > 0}
			<button type="button" class="clear-button" onclick={clearAllFilters} aria-label="Clear all filters">
				Clear all
			</button>
		{/if}
	</div>

	{#if isExpanded}
		<div class="filters-panel" id={panelId}>
			{#if departments.length > 0}
				<fieldset class="filter-group">
					<legend class="filter-label">Department</legend>
					<div class="checkbox-group">
						{#each departments as dept (dept)}
							<label class="checkbox-label">
								<input
									type="checkbox"
									checked={filters.departments.includes(dept)}
									onchange={() => (filters.departments = toggleValue(filters.departments, dept))}
								/>
								<span>{dept}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{/if}

			{#if statuses.length > 0}
				<fieldset class="filter-group">
					<legend class="filter-label">Status</legend>
					<div class="checkbox-group">
						{#each statuses as status (status)}
							<label class="checkbox-label">
								<input
									type="checkbox"
									checked={filters.statuses.includes(status)}
									onchange={() => (filters.statuses = toggleValue(filters.statuses, status))}
								/>
								<span class="status-text">{status}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			{/if}

			<fieldset class="filter-group">
				<legend class="filter-label">
					Salary range: {formatSalary(filters.salaryMin)} – {formatSalary(filters.salaryMax)}
				</legend>
				<div class="range-inputs">
					<div class="range-input-wrapper">
						<label for="{uid}-salary-min" class="range-label">Minimum salary</label>
						<input
							id="{uid}-salary-min"
							type="range"
							min={salaryRange.min}
							max={salaryRange.max}
							step={salaryStep}
							value={filters.salaryMin}
							oninput={(e) => setSalaryMin(Number(e.currentTarget.value))}
							aria-valuetext={formatSalary(filters.salaryMin)}
						/>
						<span class="range-value">{formatSalary(filters.salaryMin)}</span>
					</div>
					<div class="range-input-wrapper">
						<label for="{uid}-salary-max" class="range-label">Maximum salary</label>
						<input
							id="{uid}-salary-max"
							type="range"
							min={salaryRange.min}
							max={salaryRange.max}
							step={salaryStep}
							value={filters.salaryMax}
							oninput={(e) => setSalaryMax(Number(e.currentTarget.value))}
							aria-valuetext={formatSalary(filters.salaryMax)}
						/>
						<span class="range-value">{formatSalary(filters.salaryMax)}</span>
					</div>
				</div>
			</fieldset>

			<fieldset class="filter-group">
				<legend class="filter-label">Hire date range</legend>
				<div class="date-inputs">
					<div class="date-input-wrapper">
						<label for="{uid}-date-from" class="date-label">Hired from</label>
						<input
							id="{uid}-date-from"
							type="date"
							bind:value={filters.hireDateFrom}
							max={filters.hireDateTo || undefined}
						/>
					</div>
					<div class="date-input-wrapper">
						<label for="{uid}-date-to" class="date-label">Hired to</label>
						<input
							id="{uid}-date-to"
							type="date"
							bind:value={filters.hireDateTo}
							min={filters.hireDateFrom || undefined}
						/>
					</div>
				</div>
			</fieldset>
		</div>
	{/if}
</div>

<style>
	.filters-container {
		/* Chrome */
		--dgf-surface: #ffffff;
		--dgf-border: #e5e7eb;
		--dgf-fg: #1f2937;
		--dgf-label-fg: #374151;
		--dgf-body-fg: #4b5563;
		--dgf-muted-fg: #6b7280;
		--dgf-input-bg: #ffffff;
		--dgf-input-border: #d1d5db;
		--dgf-track: #e5e7eb;
		--dgf-button-bg: #f3f4f6;
		--dgf-button-hover-bg: #e5e7eb;
		--dgf-button-hover-border: #9ca3af;

		/* Brand (not flipped) */
		--dgf-accent: #146ef5;
		--dgf-accent-hover: #0f5fd4;
		--dgf-on-accent: #ffffff;
		--dgf-focus-ring: rgba(20, 110, 245, 0.2);

		background: var(--dgf-surface);
		border: 1px solid var(--dgf-border);
		border-radius: 8px;
		overflow: hidden;
		color: var(--dgf-fg);
	}

	@media (prefers-color-scheme: dark) {
		.filters-container {
			--dgf-surface: #1f2937;
			--dgf-border: #374151;
			--dgf-fg: #f9fafb;
			--dgf-label-fg: #e5e7eb;
			--dgf-body-fg: #d1d5db;
			--dgf-muted-fg: #9ca3af;
			--dgf-input-bg: #111827;
			--dgf-input-border: #4b5563;
			--dgf-track: #374151;
			--dgf-button-bg: #374151;
			--dgf-button-hover-bg: #4b5563;
			--dgf-button-hover-border: #6b7280;
		}
	}

	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}

	.filters-header:has(+ .filters-panel) {
		border-bottom: 1px solid var(--dgf-border);
	}

	.expand-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: none;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		color: var(--dgf-fg);
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
	}

	.expand-button:hover {
		color: var(--dgf-accent);
	}

	.expand-button:focus-visible,
	.clear-button:focus-visible {
		outline: 2px solid var(--dgf-accent);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.expand-icon {
		transition: transform 0.2s;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.filter-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0 0.5rem;
		background: var(--dgf-accent);
		color: var(--dgf-on-accent);
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.clear-button {
		padding: 0.5rem 1rem;
		background: var(--dgf-button-bg);
		border: 1px solid var(--dgf-input-border);
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--dgf-label-fg);
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.clear-button:hover {
		background: var(--dgf-button-hover-bg);
		border-color: var(--dgf-button-hover-border);
	}

	.filters-panel {
		padding: 1.5rem 1.25rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		animation: dgf-slide-down 0.2s ease-out;
	}

	@keyframes dgf-slide-down {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Fieldsets come with browser chrome we don't want. */
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		border: none;
		min-width: 0;
	}

	.filter-label {
		padding: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--dgf-label-fg);
		margin-bottom: 0.75rem;
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--dgf-body-fg);
		cursor: pointer;
		transition: color 0.2s;
	}

	.checkbox-label:hover {
		color: var(--dgf-fg);
	}

	.checkbox-label input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
		accent-color: var(--dgf-accent);
	}

	.status-text {
		text-transform: capitalize;
	}

	.range-inputs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.range-input-wrapper,
	.date-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.range-label,
	.date-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--dgf-muted-fg);
	}

	input[type='range'] {
		width: 100%;
		height: 6px;
		background: var(--dgf-track);
		border-radius: 3px;
		cursor: pointer;
		accent-color: var(--dgf-accent);
	}

	input[type='range']:focus-visible {
		outline: 2px solid var(--dgf-accent);
		outline-offset: 4px;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		background: var(--dgf-accent);
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		background: var(--dgf-accent-hover);
	}

	input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: var(--dgf-accent);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}

	input[type='range']::-moz-range-thumb:hover {
		background: var(--dgf-accent-hover);
	}

	.range-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--dgf-accent);
	}

	.date-inputs {
		display: flex;
		gap: 1rem;
	}

	.date-input-wrapper {
		flex: 1;
	}

	input[type='date'] {
		padding: 0.5rem;
		background: var(--dgf-input-bg);
		border: 1px solid var(--dgf-input-border);
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--dgf-label-fg);
		color-scheme: light dark;
		transition: border-color 0.2s;
	}

	input[type='date']:focus-visible {
		outline: none;
		border-color: var(--dgf-accent);
		box-shadow: 0 0 0 3px var(--dgf-focus-ring);
	}

	@media (max-width: 768px) {
		.filters-panel {
			grid-template-columns: 1fr;
		}

		.date-inputs {
			flex-direction: column;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.filters-panel {
			animation: none;
		}

		.expand-icon,
		.expand-button,
		.clear-button,
		.checkbox-label,
		input[type='date'] {
			transition: none;
		}
	}
</style>
