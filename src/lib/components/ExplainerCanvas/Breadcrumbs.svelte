<script lang="ts">
	/**
	 * Breadcrumbs Component
	 *
	 * Navigation path showing the current location in nested canvases.
	 * Clickable to navigate back to previous levels.
	 *
	 * @component
	 */

	interface BreadcrumbItem {
		id: string;
		title: string;
	}

	interface Props {
		path: BreadcrumbItem[];
		canvasTitle: string;
		onNavigate?: (id: string | null) => void;
	}

	let { path, canvasTitle, onNavigate }: Props = $props();

	/**
	 * Handle breadcrumb click
	 * Navigate to the clicked level
	 */
	function handleClick(id: string | null) {
		onNavigate?.(id);
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeydown(e: KeyboardEvent, id: string | null) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(id);
		}
	}
</script>

<nav class="breadcrumbs" aria-label="Canvas navigation">
	<ol class="breadcrumb-list">
		<!-- Root/Home -->
		<li class="breadcrumb-item">
			{#if path.length > 0}
				<button
					type="button"
					class="breadcrumb-link"
					onclick={() => handleClick(null)}
					onkeydown={(e) => handleKeydown(e, null)}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					<span class="breadcrumb-text">{canvasTitle}</span>
				</button>
			{:else}
				<span class="breadcrumb-current">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					<span class="breadcrumb-text">{canvasTitle}</span>
				</span>
			{/if}
		</li>

		<!-- Path items -->
		{#each path as item, index (item.id)}
			<li class="breadcrumb-item">
				<span class="breadcrumb-separator" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</span>
				{#if index < path.length - 1}
					<button
						type="button"
						class="breadcrumb-link"
						onclick={() => handleClick(item.id)}
						onkeydown={(e) => handleKeydown(e, item.id)}
					>
						<span class="breadcrumb-text">{item.title}</span>
					</button>
				{:else}
					<span class="breadcrumb-current" aria-current="page">
						<span class="breadcrumb-text">{item.title}</span>
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumbs {
		display: flex;
		align-items: center;
	}

	.breadcrumb-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		flex-wrap: wrap;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.breadcrumb-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--ec-text-muted, #666);
		background: transparent;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.breadcrumb-link:hover {
		color: var(--ec-primary, #3b82f6);
		background: rgba(59, 130, 246, 0.1);
	}

	.breadcrumb-link:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
	}

	.breadcrumb-current {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--ec-text, #1a1a1a);
	}

	.breadcrumb-separator {
		display: flex;
		align-items: center;
		color: var(--ec-text-muted, #999);
		opacity: 0.5;
	}

	.breadcrumb-text {
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Responsive: hide text on very small screens */
	@media (max-width: 480px) {
		.breadcrumb-text {
			max-width: 80px;
		}
	}
</style>
