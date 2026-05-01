<!--
/**
 * DatabaseStatus - Visual indicator for database connection state
 *
 * Features:
 * - Clear visual distinction between database, fixture, static, and error states
 * - Emoji icons for quick recognition
 * - Semantic colour coding (green for connected, yellow for fixtures, red for errors)
 * - Accessible with ARIA live region for status updates
 * - Responsive sizing for mobile and desktop
 * - Pill-shaped badge design
 * - Zero dependencies
 *
 * Perfect for:
 * - Demo applications showing graceful degradation
 * - Development environments with optional database
 * - Showing users which data source is active
 * - Template projects with optional database-backed demos
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
 * - Database: Green badge with 🟢 icon - Database is active
 * - Fixture: Yellow badge with 🟡 icon - Using demo constants from code
 * - Error: Red badge with 🔴 icon - DB was configured but query failed
 * - Static: Grey badge with ⚪ icon - Route intentionally uses static demo data
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
	type DataSourceStatus = 'database' | 'fallback' | 'error' | 'static';

	interface Props {
		usingDatabase: boolean;
		source?: DataSourceStatus;
		message?: string;
		class?: string;
	}

	let { usingDatabase, source, message = '', class: className = '' }: Props = $props();

	const status = $derived(source ?? (usingDatabase ? 'database' : 'fallback'));
	const statusClass = $derived(status === 'database' ? 'connected' : status);
	const icon = $derived(
		status === 'database' ? '🟢' : status === 'error' ? '🔴' : status === 'static' ? '⚪' : '🟡'
	);
	const label = $derived(
		status === 'database'
			? 'Database Connected'
			: status === 'error'
				? 'Database Error - Demo Fixtures'
				: status === 'static'
					? 'Static Demo Data'
					: 'Demo Fixture Data'
	);
</script>

<div class="database-status {statusClass} {className}" role="status" aria-live="polite" title={message}>
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

	.database-status.error {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #991b1b;
	}

	.database-status.static {
		background: #f8fafc;
		border-color: #cbd5e1;
		color: #475569;
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
