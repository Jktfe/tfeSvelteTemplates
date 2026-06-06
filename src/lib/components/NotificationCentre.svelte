<!--
  ===========================================================
  NOTIFICATION CENTRE
  ===========================================================
  WHAT — A bell trigger that opens a dropdown inbox of notifications,
         grouped by recency, with an unread-count badge and mark-as-read.
  WHY  — Reach for this when an app needs an at-a-glance "what changed"
         surface that lives in the header without a full route.
  FEATURES — unread badge, Today / Earlier grouping, per-item mark-as-read,
             mark-all-as-read, optional dismiss, empty state, relative
             timestamps, full keyboard navigation.
  ACCESSIBILITY — bell exposes aria-expanded + an aria-live count summary;
                  the panel is a labelled menu; Arrow keys move between
                  items, Enter/Space activates, Escape closes and restores
                  focus to the bell. Honours prefers-reduced-motion.
  DEPENDENCIES — zero. Inline SVG icons, Intl.RelativeTimeFormat for time.
  PERFORMANCE — grouping + relative time are $derived, recomputed only when
                the list or the `now` prop changes. Suited to short inboxes
                (tens of items); virtualise for hundreds.
  USAGE —
    <script lang="ts">
      let items = $state([
        { id: '1', title: 'New comment', body: 'Ada replied to your note',
          timestamp: '2026-06-06T09:30:00Z', read: false, icon: '💬' }
      ]);
    </script>
    <NotificationCentre bind:notifications={items} now="2026-06-06T10:00:00Z" />

  PROPS —
    | Prop          | Type                          | Default      | Description |
    | notifications | NotificationItem[] (bindable) | []           | The inbox list |
    | now           | string (ISO)                  | required     | Reference time for relative timestamps |
    | label         | string                        | Notifications| Accessible label for the trigger |
    | allowDismiss  | boolean                       | true         | Show a dismiss (×) button per item |
    | onChange      | (items) => void               | undefined    | Fired after any read/dismiss mutation |
  ===========================================================
-->
<script lang="ts">
	interface NotificationItem {
		/** Stable unique id — used as the keyed-each key. */
		id: string;
		title: string;
		body?: string;
		/** ISO 8601 string. Compared against `now` for relative formatting. */
		timestamp: string;
		read: boolean;
		/** Optional leading glyph (emoji or short string). */
		icon?: string;
	}

	interface Props {
		notifications?: NotificationItem[];
		/** ISO string driving relative time. Passed in so we never read the
		    system clock at module load (keeps SSR + tests deterministic). */
		now: string;
		label?: string;
		allowDismiss?: boolean;
		onChange?: (items: NotificationItem[]) => void;
	}

	let {
		notifications = $bindable([]),
		now,
		label = 'Notifications',
		allowDismiss = true,
		onChange
	}: Props = $props();

	let open = $state(false);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	const unreadCount = $derived(notifications.filter((n) => !n.read).length);

	// One formatter instance, recreated only if the locale changes (it won't here).
	const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

	function relativeTime(iso: string): string {
		const then = new Date(iso).getTime();
		const ref = new Date(now).getTime();
		if (Number.isNaN(then) || Number.isNaN(ref)) return '';
		const diffSec = Math.round((then - ref) / 1000);
		const abs = Math.abs(diffSec);
		if (abs < 60) return rtf.format(Math.round(diffSec), 'second');
		if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
		if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
		if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), 'day');
		return rtf.format(Math.round(diffSec / 604800), 'week');
	}

	/** True when `iso` falls on the same calendar day as `now`. */
	function isToday(iso: string): boolean {
		const d = new Date(iso);
		const n = new Date(now);
		return (
			d.getFullYear() === n.getFullYear() &&
			d.getMonth() === n.getMonth() &&
			d.getDate() === n.getDate()
		);
	}

	// Split into Today / Earlier, newest first within each group.
	const groups = $derived.by(() => {
		const sorted = [...notifications].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
		const today = sorted.filter((n) => isToday(n.timestamp));
		const earlier = sorted.filter((n) => !isToday(n.timestamp));
		const out: { key: string; heading: string; items: NotificationItem[] }[] = [];
		if (today.length) out.push({ key: 'today', heading: 'Today', items: today });
		if (earlier.length) out.push({ key: 'earlier', heading: 'Earlier', items: earlier });
		return out;
	});

	// Flat order for Arrow-key navigation (mirrors visual order).
	const flatOrder = $derived(groups.flatMap((g) => g.items.map((i) => i.id)));

	function emit() {
		onChange?.(notifications);
	}

	function markRead(id: string) {
		notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
		emit();
	}

	function markAllRead() {
		notifications = notifications.map((n) => (n.read ? n : { ...n, read: true }));
		emit();
	}

	function dismiss(id: string) {
		notifications = notifications.filter((n) => n.id !== id);
		emit();
	}

	function toggle() {
		open = !open;
		if (open) {
			// Focus the first item once the panel is in the DOM.
			queueMicrotask(() => focusItem(0));
		}
	}

	function close(restoreFocus = true) {
		open = false;
		if (restoreFocus) triggerEl?.focus();
	}

	function focusItem(index: number) {
		if (!panelEl) return;
		const els = panelEl.querySelectorAll<HTMLElement>('[data-nc-item]');
		if (!els.length) return;
		const clamped = (index + els.length) % els.length;
		els[clamped]?.focus();
	}

	function currentIndex(): number {
		if (!panelEl) return -1;
		const els = Array.from(panelEl.querySelectorAll<HTMLElement>('[data-nc-item]'));
		return els.findIndex((el) => el === document.activeElement);
	}

	function onPanelKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusItem(currentIndex() + 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusItem(currentIndex() - 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			focusItem(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			focusItem(flatOrder.length - 1);
		}
	}

	function onWindowPointer(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node;
		if (triggerEl?.contains(target) || panelEl?.contains(target)) return;
		close(false);
	}
</script>

<svelte:window onclick={onWindowPointer} />

<div class="nc">
	<button
		bind:this={triggerEl}
		type="button"
		class="nc-trigger"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={unreadCount > 0
			? `${label}, ${unreadCount} unread`
			: `${label}, no unread`}
		onclick={toggle}
	>
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none">
			<path
				d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M13.7 21a2 2 0 0 1-3.4 0"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		{#if unreadCount > 0}
			<span class="nc-badge" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>
		{/if}
	</button>

	<!-- Polite live region announces count changes without stealing focus. -->
	<span class="nc-sr-only" aria-live="polite">
		{unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
	</span>

	{#if open}
		<div
			bind:this={panelEl}
			class="nc-panel"
			role="menu"
			aria-label={label}
			tabindex="-1"
			onkeydown={onPanelKeydown}
		>
			<div class="nc-head">
				<span class="nc-title">{label}</span>
				<button
					type="button"
					class="nc-mark-all"
					onclick={markAllRead}
					disabled={unreadCount === 0}
				>
					Mark all as read
				</button>
			</div>

			{#if notifications.length === 0}
				<div class="nc-empty">
					<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" fill="none">
						<path
							d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<p>You're all caught up</p>
				</div>
			{:else}
				{#each groups as group (group.key)}
					<div class="nc-group" role="group" aria-label={group.heading}>
						<div class="nc-group-head">{group.heading}</div>
						{#each group.items as item (item.id)}
							<div class="nc-item" class:nc-unread={!item.read}>
								<button
									type="button"
									class="nc-item-main"
									data-nc-item
									role="menuitem"
									aria-label={`${item.title}${item.read ? '' : ', unread'}`}
									onclick={() => markRead(item.id)}
								>
									<span class="nc-dot" aria-hidden="true"></span>
									{#if item.icon}
										<span class="nc-icon" aria-hidden="true">{item.icon}</span>
									{/if}
									<span class="nc-body">
										<span class="nc-item-title">{item.title}</span>
										{#if item.body}
											<span class="nc-item-text">{item.body}</span>
										{/if}
										<span class="nc-time">{relativeTime(item.timestamp)}</span>
									</span>
								</button>
								{#if allowDismiss}
									<button
										type="button"
										class="nc-dismiss"
										aria-label={`Dismiss ${item.title}`}
										onclick={() => dismiss(item.id)}
									>
										<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
											<path
												d="M6 6l12 12M18 6 6 18"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
											/>
										</svg>
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.nc {
		position: relative;
		display: inline-block;
		/* Theme tokens — both schemes covered below. */
		--nc-bg: #ffffff;
		--nc-fg: #1a1a1a;
		--nc-muted: #6b7280;
		--nc-border: #e5e7eb;
		--nc-hover: #f3f4f6;
		--nc-accent: #2563eb;
		--nc-badge: #dc2626;
		--nc-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
	}

	@media (prefers-color-scheme: dark) {
		.nc {
			--nc-bg: #1c1c22;
			--nc-fg: #f4f4f5;
			--nc-muted: #9ca3af;
			--nc-border: #34343c;
			--nc-hover: #2a2a32;
			--nc-accent: #60a5fa;
			--nc-badge: #f87171;
			--nc-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		}
	}

	.nc-trigger {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		border: 1px solid var(--nc-border);
		background: var(--nc-bg);
		color: var(--nc-fg);
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.nc-trigger:hover {
		background: var(--nc-hover);
	}
	.nc-trigger:focus-visible {
		outline: 2px solid var(--nc-accent);
		outline-offset: 2px;
	}

	.nc-badge {
		position: absolute;
		top: -2px;
		right: -2px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: 9px;
		background: var(--nc-badge);
		color: #fff;
		font-size: 0.68rem;
		font-weight: 700;
		line-height: 18px;
		text-align: center;
		box-sizing: border-box;
	}

	.nc-panel {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: min(340px, 88vw);
		max-height: 420px;
		overflow-y: auto;
		background: var(--nc-bg);
		color: var(--nc-fg);
		border: 1px solid var(--nc-border);
		border-radius: 12px;
		box-shadow: var(--nc-shadow);
		z-index: 50;
		animation: nc-in 0.16s ease;
	}

	@keyframes nc-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.nc-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 14px;
		border-bottom: 1px solid var(--nc-border);
		position: sticky;
		top: 0;
		background: var(--nc-bg);
	}
	.nc-title {
		font-weight: 700;
		font-size: 0.95rem;
	}
	.nc-mark-all {
		border: none;
		background: none;
		color: var(--nc-accent);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		padding: 4px 6px;
		border-radius: 6px;
	}
	.nc-mark-all:hover:not(:disabled) {
		background: var(--nc-hover);
	}
	.nc-mark-all:disabled {
		color: var(--nc-muted);
		cursor: default;
	}
	.nc-mark-all:focus-visible {
		outline: 2px solid var(--nc-accent);
		outline-offset: 1px;
	}

	.nc-group-head {
		padding: 8px 14px 4px;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--nc-muted);
	}

	.nc-item {
		display: flex;
		align-items: stretch;
	}
	.nc-item:hover {
		background: var(--nc-hover);
	}

	.nc-item-main {
		flex: 1;
		display: flex;
		gap: 10px;
		align-items: flex-start;
		padding: 10px 8px 10px 14px;
		border: none;
		background: none;
		color: inherit;
		text-align: left;
		cursor: pointer;
		font: inherit;
	}
	.nc-item-main:focus-visible {
		outline: 2px solid var(--nc-accent);
		outline-offset: -2px;
		border-radius: 6px;
	}

	.nc-dot {
		flex: 0 0 auto;
		width: 8px;
		height: 8px;
		margin-top: 6px;
		border-radius: 50%;
		background: transparent;
	}
	.nc-unread .nc-dot {
		background: var(--nc-accent);
	}

	.nc-icon {
		flex: 0 0 auto;
		font-size: 1.05rem;
		line-height: 1.3;
	}

	.nc-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.nc-item-title {
		font-size: 0.88rem;
		font-weight: 600;
	}
	.nc-unread .nc-item-title {
		font-weight: 700;
	}
	.nc-item-text {
		font-size: 0.82rem;
		color: var(--nc-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.nc-time {
		font-size: 0.72rem;
		color: var(--nc-muted);
		margin-top: 2px;
	}

	.nc-dismiss {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		margin: 8px 8px 8px 0;
		border: none;
		background: none;
		color: var(--nc-muted);
		border-radius: 6px;
		cursor: pointer;
	}
	.nc-dismiss:hover {
		background: var(--nc-border);
		color: var(--nc-fg);
	}
	.nc-dismiss:focus-visible {
		outline: 2px solid var(--nc-accent);
		outline-offset: 1px;
	}

	.nc-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 36px 16px;
		color: var(--nc-muted);
	}
	.nc-empty p {
		margin: 0;
		font-size: 0.88rem;
	}

	.nc-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.nc-panel {
			animation: none;
		}
		.nc-trigger {
			transition: none;
		}
	}
</style>
