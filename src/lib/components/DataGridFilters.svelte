<!--
/**
 * DataGridFilters Component - Advanced filtering interface for DataGrid
 *
 * Provides a comprehensive filtering UI with:
 * - Department multi-select
 * - Status multi-select
 * - Salary range slider
 * - Hire date range picker
 * - Active filter count badge
 * - Clear all filters button
 * - Collapsible panel
 *
 * This component demonstrates:
 * - Complex state management with Svelte 5 runes
 * - Derived reactive computations
 * - Form control accessibility
 * - Responsive design patterns
 *
 * @component DataGridFilters
 * @example
 * ```svelte
 * <DataGridFilters
 *   departments={['Engineering', 'Sales', 'Marketing']}
 *   statuses={['active', 'on-leave', 'inactive']}
 *   salaryRange={{ min: 30000, max: 150000 }}
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 * ```
 */
-->

<script lang="ts">
	import type { DataGridFilterValues } from '$lib/types';

	/**
	 * Component Props
	 */
	interface Props {
		/** Available department options */
		departments?: string[];
		/** Available status options */
		statuses?: string[];
		/** Salary range boundaries */
		salaryRange?: { min: number; max: number };
		/** Initial expanded state */
		initiallyExpanded?: boolean;
		/** Callback when filters change */
		onFiltersChange?: (filters: DataGridFilterValues) => void;
	}

	let {
		departments = [],
		statuses = [],
		salaryRange = { min: 30000, max: 150000 },
		initiallyExpanded = false,
		onFiltersChange
	}: Props = $props();

	/**
	 * Filter state
	 * Tracks all active filter values
	 */
	let filters = $state<DataGridFilterValues>({
		departments: [],
		statuses: [],
		salaryMin: salaryRange.min,
		salaryMax: salaryRange.max,
		hireDateFrom: '',
		hireDateTo: ''
	});

	/**
	 * UI state
	 */
	let isExpanded = $state(initiallyExpanded);

	/**
	 * Count active filters for badge display
	 * A filter is "active" if it differs from the default/empty state
	 */
	let activeFilterCount = $derived(() => {
		let count = 0;
		if (filters.departments.length > 0) count++;
		if (filters.statuses.length > 0) count++;
		if (filters.salaryMin !== salaryRange.min || filters.salaryMax !== salaryRange.max) count++;
		if (filters.hireDateFrom || filters.hireDateTo) count++;
		return count;
	});

	/**
	 * Notify parent component when filters change
	 */
	$effect(() => {
		const _ = JSON.stringify(filters);
		if (onFiltersChange) {
			onFiltersChange(filters);
		}
	});

	/**
	 * Toggle department filter
	 * @param dept - Department to toggle
	 */
	function toggleDepartment(dept: string) {
		const index = filters.departments.indexOf(dept);
		if (index === -1) {
			filters.departments = [...filters.departments, dept];
		} else {
			filters.departments = filters.departments.filter((d) => d !== dept);
		}
	}

	/**
	 * Toggle status filter
	 * @param status - Status to toggle
	 */
	function toggleStatus(status: string) {
		const index = filters.statuses.indexOf(status);
		if (index === -1) {
			filters.statuses = [...filters.statuses, status];
		} else {
			filters.statuses = filters.statuses.filter((s) => s !== status);
		}
	}

	/**
	 * Clear all filters and reset to defaults
	 */
	function clearAllFilters() {
		filters = {
			departments: [],
			statuses: [],
			salaryMin: salaryRange.min,
			salaryMax: salaryRange.max,
			hireDateFrom: '',
			hireDateTo: ''
		};
	}

	/**
	 * Format salary for display (with commas and £)
	 */
	function formatSalary(value: number): string {
		return `£${value.toLocaleString('en-GB')}`;
	}
</script>

<div class="filters-container">
	<!-- Filter Header -->
	<div class="filters-header">
		<button
			class="expand-button"
			onclick={() => isExpanded = !isExpanded}
			aria-expanded={isExpanded}
			aria-controls="filter-panel"
		>
			<span class="expand-icon" aria-hidden="true">
				{isExpanded ? '▼' : '▶'}
			</span>
			<span class="filter-title">
				Filters
				{#if activeFilterCount() > 0}
					<span class="filter-badge" aria-label="{activeFilterCount()} active filters">
						{activeFilterCount()}
					</span>
				{/if}
			</span>
		</button>

		{#if activeFilterCount() > 0}
			<button
				class="clear-button"
				onclick={clearAllFilters}
				aria-label="Clear all filters"
			>
				Clear All
			</button>
		{/if}
	</div>

	<!-- Filter Panel (Collapsible) -->
	{#if isExpanded}
		<div class="filters-panel" id="filter-panel">
			<!-- Department Filter -->
			{#if departments.length > 0}
				<div class="filter-group">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<!-- This label is a group heading, not associated with a single control. ARIA labels on children provide accessibility. -->
					<label class="filter-label">Department</label>
					<div class="checkbox-group" role="group" aria-label="Department filters">
						{#each departments as dept}
							<label class="checkbox-label">
								<input
									type="checkbox"
									checked={filters.departments.includes(dept)}
									onchange={() => toggleDepartment(dept)}
								/>
								<span>{dept}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Status Filter -->
			{#if statuses.length > 0}
				<div class="filter-group">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<!-- This label is a group heading, not associated with a single control. ARIA labels on children provide accessibility. -->
					<label class="filter-label">Status</label>
					<div class="checkbox-group" role="group" aria-label="Status filters">
						{#each statuses as status}
							<label class="checkbox-label">
								<input
									type="checkbox"
									checked={filters.statuses.includes(status)}
									onchange={() => toggleStatus(status)}
								/>
								<span class="status-text">{status}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Salary Range Filter -->
			<div class="filter-group">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<!-- This label is a group heading for salary range inputs. Individual controls have their own labels. -->
				<label class="filter-label">
					Salary Range: {formatSalary(filters.salaryMin)} - {formatSalary(filters.salaryMax)}
				</label>
				<div class="range-inputs">
					<div class="range-input-wrapper">
						<label for="salary-min" class="range-label">Min</label>
						<input
							id="salary-min"
							type="range"
							min={salaryRange.min}
							max={salaryRange.max}
							step="5000"
							bind:value={filters.salaryMin}
							aria-label="Minimum salary"
						/>
						<span class="range-value">{formatSalary(filters.salaryMin)}</span>
					</div>
					<div class="range-input-wrapper">
						<label for="salary-max" class="range-label">Max</label>
						<input
							id="salary-max"
							type="range"
							min={salaryRange.min}
							max={salaryRange.max}
							step="5000"
							bind:value={filters.salaryMax}
							aria-label="Maximum salary"
						/>
						<span class="range-value">{formatSalary(filters.salaryMax)}</span>
					</div>
				</div>
			</div>

			<!-- Hire Date Range Filter -->
			<div class="filter-group">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<!-- This label is a group heading for date range inputs. Individual controls have their own labels. -->
				<label class="filter-label">Hire Date Range</label>
				<div class="date-inputs">
					<div class="date-input-wrapper">
						<label for="date-from" class="date-label">From</label>
						<input
							id="date-from"
							type="date"
							bind:value={filters.hireDateFrom}
							aria-label="Hire date from"
						/>
					</div>
					<div class="date-input-wrapper">
						<label for="date-to" class="date-label">To</label>
						<input
							id="date-to"
							type="date"
							bind:value={filters.hireDateTo}
							aria-label="Hire date to"
						/>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/**
	 * Filter Container Styles
	 */
	.filters-container {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		overflow: hidden;
	}

	/* Filter Header */
	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.expand-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: none;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
	}

	.expand-button:hover {
		color: #146ef5;
	}

	.expand-icon {
		font-size: 0.75rem;
		transition: transform 0.2s;
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
		background: #146ef5;
		color: white;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.clear-button {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-button:hover {
		background: #e5e7eb;
		border-color: #9ca3af;
	}

	/* Filter Panel */
	.filters-panel {
		padding: 1.5rem 1.25rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Filter Group */
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	/* Checkbox Group */
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
		color: #4b5563;
		cursor: pointer;
		transition: color 0.2s;
	}

	.checkbox-label:hover {
		color: #1f2937;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		border: 2px solid #d1d5db;
		border-radius: 4px;
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox']:checked {
		accent-color: #146ef5;
	}

	.status-text {
		text-transform: capitalize;
	}

	/* Range Inputs */
	.range-inputs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.range-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.range-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #6b7280;
	}

	input[type='range'] {
		width: 100%;
		height: 6px;
		background: #e5e7eb;
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		background: #146ef5;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}

	input[type='range']::-webkit-slider-thumb:hover {
		background: #0f5fd4;
	}

	input[type='range']::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: #146ef5;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s;
	}

	input[type='range']::-moz-range-thumb:hover {
		background: #0f5fd4;
	}

	.range-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #146ef5;
	}

	/* Date Inputs */
	.date-inputs {
		display: flex;
		gap: 1rem;
	}

	.date-input-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.date-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #6b7280;
	}

	input[type='date'] {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #374151;
		transition: border-color 0.2s;
	}

	input[type='date']:focus {
		outline: none;
		border-color: #146ef5;
		box-shadow: 0 0 0 3px rgba(20, 110, 245, 0.1);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.filters-panel {
			grid-template-columns: 1fr;
		}

		.date-inputs {
			flex-direction: column;
		}
	}
</style>
