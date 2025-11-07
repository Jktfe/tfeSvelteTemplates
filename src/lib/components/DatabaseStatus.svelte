<!--
	DatabaseStatus Component

	A simple indicator showing whether the app is connected to Neon database or using fallback data.
	Used to demonstrate the graceful fallback pattern in the demo app.

	Props:
	- usingDatabase: boolean - Whether database connection is active
	- class: string (optional) - Additional CSS classes
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
