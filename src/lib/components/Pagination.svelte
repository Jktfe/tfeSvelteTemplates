<!--
  ============================================================
  Pagination - Page Number Navigation
  ============================================================

  WHAT IT DOES
  Navigates a paginated list (search results, table rows, gallery pages)
  by showing a Prev / page-numbers / Next control. Collapses long ranges
  with an ellipsis so the row stays compact regardless of how many pages
  exist (e.g. 1 ... 4 5 6 ... 20).

  FEATURES
  - Smart ellipsis: always shows first, last, current and its siblings
  - Two sizes (sm / md)
  - Configurable sibling count (pages either side of current)
  - bind:page two-way sync OR onChange callback
  - Disabled Prev/Next at the edges
  - Custom labels for Prev/Next (i18n friendly)
  - Honours prefers-reduced-motion (no transitions)
  - Pure Svelte 5 runes, zero dependencies

  ACCESSIBILITY
  - Wrapper is a real nav element with aria-label="Pagination"
  - Each page is a real button with aria-label="Go to page N"
  - Active page has aria-current="page" and is announced as the current page
  - Disabled Prev/Next get the disabled attribute (not aria-disabled)
  - Ellipsis is decorative (aria-hidden="true")

  USAGE
  Two-way binding (recommended):
      Pagination bind:page totalPages={42}

  Controlled with callback:
      Pagination page={5} totalPages={42} onChange={(p) => goTo(p)}

  Smaller sibling count, compact size:
      Pagination bind:page totalPages={42} siblings={0} size="sm"

  PROPS
  | Prop         | Type                       | Default | Description |
  |--------------|----------------------------|---------|-------------|
  | page         | number                     | 1       | Current page (1-indexed). Use bind:page for two-way sync. |
  | totalPages   | number                     | 1       | Total page count |
  | siblings     | number                     | 1       | Pages either side of current to render |
  | size         | 'sm' | 'md'                | 'md'    | Padding + font scale |
  | prevLabel    | string                     | 'Prev'  | Label for the previous-page button |
  | nextLabel    | string                     | 'Next'  | Label for the next-page button |
  | ariaLabel    | string                     | 'Pagination' | aria-label on the wrapper nav |
  | onChange     | (page: number) => void     | undef   | Fires after a navigation click |
  | class        | string                     | ''      | Extra classes on the nav |

  ============================================================
-->

<script lang="ts">
	export type PaginationSize = 'sm' | 'md';

	interface Props {
		page?: number;
		totalPages?: number;
		siblings?: number;
		size?: PaginationSize;
		prevLabel?: string;
		nextLabel?: string;
		ariaLabel?: string;
		onChange?: (page: number) => void;
		class?: string;
	}

	let {
		page = $bindable(1),
		totalPages = 1,
		siblings = 1,
		size = 'md',
		prevLabel = 'Prev',
		nextLabel = 'Next',
		ariaLabel = 'Pagination',
		onChange,
		class: extraClass = ''
	}: Props = $props();

	type Item = number | 'ellipsis-left' | 'ellipsis-right';

	function buildItems(current: number, total: number, sib: number): Item[] {
		if (total <= 1) return [1];

		const totalVisible = sib * 2 + 5;

		if (total <= totalVisible) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const leftSib = Math.max(current - sib, 1);
		const rightSib = Math.min(current + sib, total);
		const showLeftDots = leftSib > 2;
		const showRightDots = rightSib < total - 1;

		if (!showLeftDots && showRightDots) {
			const leftCount = 3 + 2 * sib;
			const left = Array.from({ length: leftCount }, (_, i) => i + 1);
			return [...left, 'ellipsis-right', total];
		}

		if (showLeftDots && !showRightDots) {
			const rightCount = 3 + 2 * sib;
			const right = Array.from({ length: rightCount }, (_, i) => total - rightCount + 1 + i);
			return [1, 'ellipsis-left', ...right];
		}

		const middle = Array.from({ length: rightSib - leftSib + 1 }, (_, i) => leftSib + i);
		return [1, 'ellipsis-left', ...middle, 'ellipsis-right', total];
	}

	let items = $derived(buildItems(page, totalPages, siblings));
	let isFirst = $derived(page <= 1);
	let isLast = $derived(page >= totalPages);

	function goTo(target: number) {
		const clamped = Math.max(1, Math.min(totalPages, target));
		if (clamped === page) return;
		page = clamped;
		onChange?.(clamped);
	}
</script>

<nav class="pagination pagination-{size} {extraClass}" aria-label={ariaLabel}>
	<button
		type="button"
		class="page-btn page-prev"
		disabled={isFirst}
		aria-label="Go to previous page"
		onclick={() => goTo(page - 1)}
	>
		<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
		<span>{prevLabel}</span>
	</button>

	{#each items as item, i (i + '-' + item)}
		{#if item === 'ellipsis-left' || item === 'ellipsis-right'}
			<span class="page-ellipsis" aria-hidden="true">…</span>
		{:else}
			<button
				type="button"
				class="page-btn page-num"
				class:active={item === page}
				aria-label="Go to page {item}"
				aria-current={item === page ? 'page' : undefined}
				onclick={() => goTo(item)}
			>
				{item}
			</button>
		{/if}
	{/each}

	<button
		type="button"
		class="page-btn page-next"
		disabled={isLast}
		aria-label="Go to next page"
		onclick={() => goTo(page + 1)}
	>
		<span>{nextLabel}</span>
		<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>
</nav>

<style>
	.pagination {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
	}

	.page-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-width: 2.25rem;
		padding: 0.375rem 0.625rem;
		font: inherit;
		font-weight: 500;
		color: #1f2937;
		background-color: #ffffff;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.page-btn:hover:not(:disabled) {
		background-color: #f3f4f6;
		border-color: #9ca3af;
	}

	.page-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.page-btn:disabled {
		color: #9ca3af;
		background-color: #f9fafb;
		cursor: not-allowed;
	}

	.page-btn.active {
		color: #ffffff;
		background-color: #2563eb;
		border-color: #2563eb;
	}

	.page-btn.active:hover {
		background-color: #1d4ed8;
		border-color: #1d4ed8;
	}

	.page-ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.5rem;
		padding: 0 0.25rem;
		color: #6b7280;
		user-select: none;
	}

	.pagination-sm .page-btn {
		min-width: 1.875rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.8125rem;
	}

	.pagination-md .page-btn {
		font-size: 0.875rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.page-btn {
			transition: none;
		}
	}
</style>
