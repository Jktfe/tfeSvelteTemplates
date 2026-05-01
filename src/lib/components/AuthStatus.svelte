<!--
	AuthStatus Component

	Visual indicator for Better Auth configuration status.
	Follows the DatabaseStatus component pattern for consistency.

	Features:
	- Clear visual distinction between configured and demo mode
	- Emoji icons for quick recognition (🔐 configured, 🔓 demo)
	- Semantic colour coding (green for configured, grey for demo)
	- Accessible with ARIA live region for status updates
	- Reduced motion support
	- Zero dependencies

	Usage:
		<AuthStatus isConfigured={data.isConfigured} />

	Props:
	- isConfigured: boolean - Whether Better Auth is configured
	- class: string - Additional CSS classes (optional)

	@component
-->
<script lang="ts">
	import type { AuthStatusProps } from '$lib/types';

	let { isConfigured, class: className = '' }: AuthStatusProps = $props();

	const status = $derived(isConfigured ? 'configured' : 'demo-mode');
	const icon = $derived(isConfigured ? '🔐' : '🔓');
	const label = $derived(isConfigured ? 'Auth Enabled' : 'Auth Offline');
	const description = $derived(
		isConfigured
			? 'Better Auth is configured and active'
			: 'Set DATABASE_URL and BETTER_AUTH_SECRET to enable authentication'
	);
</script>

<div
	class="auth-status {status} {className}"
	role="status"
	aria-live="polite"
	title={description}
>
	<span class="status-icon" aria-hidden="true">{icon}</span>
	<span class="status-label">{label}</span>
</div>

<style>
	.auth-status {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid;
		transition: all 0.3s ease;
		cursor: help;
	}

	.auth-status.configured {
		background: #f0fdf4;
		border-color: #86efac;
		color: #166534;
	}

	.auth-status.demo-mode {
		background: #f3f4f6;
		border-color: #d1d5db;
		color: #6b7280;
	}

	.status-icon {
		font-size: 1rem;
		line-height: 1;
	}

	.status-label {
		line-height: 1;
	}

	/* Hover states for better accessibility */
	.auth-status:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.auth-status.configured:hover {
		background: #dcfce7;
	}

	.auth-status.demo-mode:hover {
		background: #e5e7eb;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.auth-status {
			font-size: 0.75rem;
			padding: 0.375rem 0.75rem;
		}

		.status-icon {
			font-size: 0.875rem;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.auth-status {
			transition: none;
		}

		.auth-status:hover {
			transform: none;
		}
	}

	/* Dark mode: keep semantic colour cues, dial brightness down so the pill
	 * sits comfortably on the dark navbar/page chrome instead of glaring. */
	@media (prefers-color-scheme: dark) {
		.auth-status.configured {
			background: rgba(34, 197, 94, 0.16);
			border-color: rgba(134, 239, 172, 0.4);
			color: #86efac;
		}

		.auth-status.demo-mode {
			background: rgba(148, 163, 184, 0.12);
			border-color: rgba(148, 163, 184, 0.3);
			color: #cbd5e1;
		}

		.auth-status.configured:hover {
			background: rgba(34, 197, 94, 0.24);
		}

		.auth-status.demo-mode:hover {
			background: rgba(148, 163, 184, 0.2);
		}
	}
</style>
