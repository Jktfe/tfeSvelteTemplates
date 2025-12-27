<!--
/**
 * DatabaseStatus - Visual indicator for database connection state
 *
 * Features:
 * - Clear visual distinction between connected and fallback states
 * - Emoji icons for quick recognition (🟢 connected, 🟡 fallback)
 * - Semantic colour coding (green for connected, yellow for fallback)
 * - Accessible with ARIA live region for status updates
 * - Responsive sizing for mobile and desktop
 * - Pill-shaped badge design
 * - Zero dependencies
 *
 * Perfect for:
 * - Demo applications showing graceful degradation
 * - Development environments with optional database
 * - Showing users which data source is active
 * - Template projects with fallback patterns
 * - Educational examples of resilient architecture
 *
 * Technical Implementation:
 * - Svelte 5 $derived rune for reactive status computation
 * - ARIA live region (role="status") for accessibility
 * - CSS transitions for smooth state changes
 * - Responsive design with mobile-optimised sizing
 * - Scoped CSS with no external dependencies
 *
 * States:
 * - Connected: Green badge with 🟢 icon - Database is active
 * - Fallback: Yellow badge with 🟡 icon - Using constants from code
 *
 * @component
 * @example
 * ```svelte
 * <script>
 *   // In +page.server.ts
 *   export const load = async () => {
 *     const usingDatabase = !!process.env.DATABASE_URL;
 *     return { usingDatabase };
 *   };
 * </script>
 *
 * <script>
 *   let { data } = $props();
 * </script>
 *
 * <DatabaseStatus usingDatabase={data.usingDatabase} />
 * ```
 */
-->
<script lang="ts">
	interface Props {
		usingDatabase: boolean;
		class?: string;
	}

	let { usingDatabase, class: className = '' }: Props = $props();

	const status = $derived(usingDatabase ? 'connected' : 'fallback');
	const icon = $derived(usingDatabase ? '🟢' : '🟡');
	const label = $derived(usingDatabase ? 'Database Connected' : 'Using Fallback Data');
</script>

<div class="database-status {status} {className}" role="status" aria-live="polite">
	<span class="status-icon" aria-hidden="true">{icon}</span>
	<span class="status-label">{label}</span>
</div>

<style>
	.database-status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid;
		transition: all 0.3s ease;
	}

	.database-status.connected {
		background: #f0fdf4;
		border-color: #86efac;
		color: #166534;
	}

	.database-status.fallback {
		background: #fefce8;
		border-color: #fde047;
		color: #854d0e;
	}

	.status-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.status-label {
		line-height: 1;
	}

	/* Responsive: Smaller on mobile */
	@media (max-width: 640px) {
		.database-status {
			font-size: 0.75rem;
			padding: 0.375rem 0.75rem;
		}

		.status-icon {
			font-size: 0.875rem;
		}
	}
</style>

<!-- Claude is happy that this file is mint. Signed off 19.11.25. -->

<!-- RFO Review: 27.12.25 - No optimisation opportunities identified, component optimal -->
