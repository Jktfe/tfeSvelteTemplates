<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ToastNotification from '$lib/components/ToastNotification.svelte';
	import { addToast } from '$lib/toast.svelte';
	import type { ToastSeverity } from '$lib/types';

	const shell = catalogShellPropsForSlug('/toastnotification')!;

	function triggerToast(severity: ToastSeverity) {
		const messages: Record<ToastSeverity, string> = {
			success: 'Successfully updated profile!',
			error: 'Failed to connect to the server.',
			warning: 'Storage is almost full (92%).',
			info: 'A new version of the app is available.'
		};
		addToast({ message: messages[severity], severity, duration: 5000 });
	}

	function triggerActionToast() {
		addToast({
			message: 'Message deleted.',
			severity: 'info',
			duration: 10000,
			action: { label: 'Undo', onclick: () => alert('Undo action triggered!') }
		});
	}

	function triggerPersistentToast() {
		addToast({
			message: 'This notification will stay until dismissed.',
			severity: 'warning',
			duration: 0
		});
	}
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Notifications', 'A11y', 'Zero deps']}
	codeExplanation="ToastNotification renders the on-screen container; toast state lives in a Svelte 5 module-script rune singleton. Anywhere in your app, call addToast(...) to push a new entry — the component subscribes reactively, ARIA-live announces it politely (or assertively for errors), and a setTimeout removes it after the configured duration. Errors and persistent toasts (duration: 0) stay until dismissed."
>
	{#snippet demo()}
		<div class="tn-demo">
			<div class="tn-grid">
				<button class="tn-btn tn-btn--success" onclick={() => triggerToast('success')}>Success</button>
				<button class="tn-btn tn-btn--error" onclick={() => triggerToast('error')}>Error</button>
				<button class="tn-btn tn-btn--warning" onclick={() => triggerToast('warning')}>Warning</button>
				<button class="tn-btn tn-btn--info" onclick={() => triggerToast('info')}>Info</button>
				<button class="tn-btn tn-btn--neutral" onclick={triggerActionToast}>With action</button>
				<button class="tn-btn tn-btn--ghost" onclick={triggerPersistentToast}>Persistent</button>
			</div>
			<p class="tn-note">Click any button — toasts appear top-right and dismiss automatically (except Persistent).</p>
		</div>
		<ToastNotification position="top-right" offsetY="5rem" />
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>position</code></td>
					<td><code>ToastPosition</code></td>
					<td><code>"top-right"</code></td>
					<td>Screen anchor: top-left, top-right, top-center, bottom-left, bottom-right, bottom-center.</td>
				</tr>
				<tr>
					<td><code>maxVisible</code></td>
					<td><code>number</code></td>
					<td><code>5</code></td>
					<td>Maximum toasts displayed simultaneously. Older entries are kept in state but hidden.</td>
				</tr>
				<tr>
					<td><code>offsetY</code></td>
					<td><code>string</code></td>
					<td><code>"1rem"</code></td>
					<td>Distance from the top/bottom edge — handy to clear a sticky navbar.</td>
				</tr>
				<tr>
					<td><code>offsetX</code></td>
					<td><code>string</code></td>
					<td><code>"1rem"</code></td>
					<td>Distance from the left/right edge.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the container element.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.tn-demo {
		display: grid;
		gap: 16px;
	}
	.tn-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 10px;
	}
	.tn-btn {
		padding: 10px 14px;
		border-radius: var(--r-2);
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--fg-1);
		font: 500 13px var(--font-sans);
		cursor: pointer;
		transition: transform var(--dur-fast), background var(--dur-fast);
	}
	.tn-btn:hover { transform: translateY(-1px); }
	.tn-btn--success { background: #10b981; color: #fff; border-color: #059669; }
	.tn-btn--error { background: #ef4444; color: #fff; border-color: #dc2626; }
	.tn-btn--warning { background: #f59e0b; color: #fff; border-color: #d97706; }
	.tn-btn--info { background: #3b82f6; color: #fff; border-color: #2563eb; }
	.tn-btn--neutral { background: var(--tfe-ink, #111); color: #fff; border-color: var(--tfe-ink, #111); }
	.tn-btn--ghost { background: var(--surface-2); }
	.tn-note {
		margin: 0;
		color: var(--fg-3);
		font-size: 13px;
		line-height: 1.5;
	}
</style>
