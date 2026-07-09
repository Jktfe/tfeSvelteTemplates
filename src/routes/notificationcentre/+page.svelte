<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import NotificationCentre from '$lib/components/NotificationCentre.svelte';

	const shell = catalogShellPropsForSlug('/notificationcentre')!;

	// Fixed reference time so relative timestamps are deterministic in the demo.
	const NOW = '2026-06-06T12:00:00Z';

	interface DemoNotification {
		id: string;
		title: string;
		body?: string;
		timestamp: string;
		read: boolean;
		icon?: string;
	}

	function seed(): DemoNotification[] {
		return [
			{
				id: '1',
				title: 'Ada commented on your draft',
				body: '"Love this direction — can we ship by Friday?"',
				timestamp: '2026-06-06T11:42:00Z',
				read: false,
				icon: '💬'
			},
			{
				id: '2',
				title: 'Deploy succeeded',
				body: 'main → production in 48s',
				timestamp: '2026-06-06T09:10:00Z',
				read: false,
				icon: '🚀'
			},
			{
				id: '3',
				title: 'Weekly summary ready',
				body: '12 merged PRs, 3 open reviews',
				timestamp: '2026-06-03T08:00:00Z',
				read: true,
				icon: '📊'
			},
			{
				id: '4',
				title: 'New follower',
				timestamp: '2026-06-01T16:30:00Z',
				read: true,
				icon: '⭐'
			}
		];
	}

	let live = $state<DemoNotification[]>(seed());
	let lastEvent = $state('');

	const liveUnread = $derived(live.filter((n) => !n.read).length);

	let empty = $state<DemoNotification[]>([]);

	const codeExplanation =
		'NotificationCentre is a bell trigger with a dropdown inbox. The unread badge tracks how many items have read=false; the panel groups them into Today / Earlier by comparing each timestamp against a provided now prop (so relative time stays deterministic across SSR and tests). Clicking a row marks it read, "Mark all as read" clears every dot, and an optional × dismisses a row. notifications is bindable and onChange fires after each mutation for persistence.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Theme-aware', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ncd">
			<section class="ncd-section">
				<h3>Bindable inbox with live state</h3>
				<p class="ncd-hint">
					Click the bell, then click items to mark them read or × to dismiss. The strip below
					reflects the bound array.
				</p>
				<div class="ncd-bar">
					<NotificationCentre
						bind:notifications={live}
						now={NOW}
						onChange={() => (lastEvent = `Updated · ${live.length} items, ${liveUnread} unread`)}
					/>
					<button type="button" class="ncd-reset" onclick={() => { live = seed(); lastEvent = ''; }}>
						Reset demo
					</button>
				</div>
				<p class="ncd-state" role="status" aria-live="polite">
					Unread: <code>{liveUnread}</code> · Total: <code>{live.length}</code>
					{#if lastEvent}<span class="ncd-event"> — {lastEvent}</span>{/if}
				</p>
			</section>

			<section class="ncd-section">
				<h3>Empty state</h3>
				<p class="ncd-hint">With no notifications the panel shows an "all caught up" message.</p>
				<div class="ncd-bar">
					<NotificationCentre bind:notifications={empty} now={NOW} label="Alerts" />
				</div>
			</section>

			<section class="ncd-section">
				<h3>Dismiss disabled (read-only feed)</h3>
				<p class="ncd-hint">
					Set <code>allowDismiss=&#123;false&#125;</code> for feeds where items should only be marked
					read, never removed.
				</p>
				<div class="ncd-bar">
					<NotificationCentre notifications={seed()} now={NOW} allowDismiss={false} />
				</div>
			</section>
		</div>
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
					<td><code>notifications</code></td>
					<td><code>NotificationItem[]</code> (bindable)</td>
					<td><code>[]</code></td>
					<td>The inbox list: <code>&#123; id, title, body?, timestamp, read, icon? &#125;</code>.</td>
				</tr>
				<tr>
					<td><code>now</code></td>
					<td><code>string</code> (ISO 8601)</td>
					<td>— (required)</td>
					<td>Reference time for relative timestamps and Today/Earlier grouping.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>'Notifications'</code></td>
					<td>Accessible name for the trigger and panel.</td>
				</tr>
				<tr>
					<td><code>allowDismiss</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show a × button to remove each item from the list.</td>
				</tr>
				<tr>
					<td><code>onChange</code></td>
					<td><code>(items) =&gt; void</code></td>
					<td><code>undefined</code></td>
					<td>Called after any read/dismiss mutation with the new array.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.ncd {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.ncd-section {
		padding: 1.25rem;
		border: 1px solid var(--cp-border, #e5e7eb);
		border-radius: 12px;
	}
	.ncd-section h3 {
		margin: 0 0 0.35rem;
		font-size: 1rem;
	}
	.ncd-hint {
		margin: 0 0 1rem;
		font-size: 0.85rem;
		opacity: 0.75;
	}
	.ncd-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 48px;
	}
	.ncd-reset {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--cp-border, #e5e7eb);
		border-radius: 8px;
		background: transparent;
		color: inherit;
		font-size: 0.82rem;
		cursor: pointer;
	}
	.ncd-reset:hover {
		background: rgba(127, 127, 127, 0.12);
	}
	.ncd-reset:focus-visible {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}
	.ncd-state {
		margin: 1rem 0 0;
		font-size: 0.85rem;
	}
	.ncd-state code {
		padding: 0.1rem 0.35rem;
		border-radius: 5px;
		background: rgba(127, 127, 127, 0.15);
		font-size: 0.8rem;
	}
	.ncd-event {
		opacity: 0.7;
	}
</style>
