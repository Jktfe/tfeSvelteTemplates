<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import ToastNotification from '$lib/components/ToastNotification.svelte';
	import { addToast } from '$lib/toast.svelte';
	import type { ToastSeverity, ToastPosition } from '$lib/types';

	const shell = catalogShellPropsForSlug('/toastnotification')!;

	// ----------------------------------------------------------------------
	// Live playground state — every control on the page rebinds straight into
	// the single ToastNotification mount at the bottom. Severity buttons drop
	// a fresh toast into the stack so users can see how the configured
	// position, max stack, and offsets behave with multiple visible items.
	// ----------------------------------------------------------------------
	let livePosition = $state<ToastPosition>('top-right');
	let liveMax = $state(5);
	let liveOffsetY = $state(5);
	let liveOffsetX = $state(1);

	const positionOptions: { id: ToastPosition; label: string }[] = [
		{ id: 'top-left', label: 'Top left' },
		{ id: 'top-right', label: 'Top right' },
		{ id: 'bottom-left', label: 'Bottom left' },
		{ id: 'bottom-right', label: 'Bottom right' }
	];

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

	function fillStack() {
		// Fire a small flurry so the maxVisible slider has something to clamp.
		const severities: ToastSeverity[] = ['info', 'success', 'warning', 'error', 'info', 'success'];
		severities.forEach((s, i) => {
			setTimeout(() => triggerToast(s), i * 120);
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
			<p class="tn-note">Click any button — toasts dismiss automatically (except Persistent).</p>

			<!-- Interactive playground.
			     The single ToastNotification mount below reads every value live,
			     so changes apply immediately to the next toast that appears. -->
			<section class="tn-playground">
				<header class="tn-playground__head">
					<h3>Live playground</h3>
					<p>Tweak the props below — they bind straight into the live container.</p>
				</header>

				<div class="tn-controls">
					<div class="tn-control">
						<span class="tn-control__label">Position</span>
						<div class="tn-buttons">
							{#each positionOptions as opt (opt.id)}
								<button
									type="button"
									class="tn-pill"
									class:tn-pill--active={livePosition === opt.id}
									onclick={() => (livePosition = opt.id)}
								>{opt.label}</button>
							{/each}
						</div>
					</div>

					<div class="tn-control">
						<span class="tn-control__label">Max visible <strong>{liveMax}</strong></span>
						<input type="range" min="1" max="8" step="1" bind:value={liveMax} aria-label="Max visible" />
					</div>

					<div class="tn-control">
						<span class="tn-control__label">Offset Y <strong>{liveOffsetY}rem</strong></span>
						<input type="range" min="0" max="8" step="0.5" bind:value={liveOffsetY} aria-label="Vertical offset" />
					</div>

					<div class="tn-control">
						<span class="tn-control__label">Offset X <strong>{liveOffsetX}rem</strong></span>
						<input type="range" min="0" max="6" step="0.5" bind:value={liveOffsetX} aria-label="Horizontal offset" />
					</div>
				</div>

				<div class="tn-playground__actions">
					<button class="tn-btn tn-btn--info" type="button" onclick={() => triggerToast('info')}>Fire one</button>
					<button class="tn-btn tn-btn--neutral" type="button" onclick={fillStack}>Fill the stack</button>
				</div>
			</section>

			<!-- In-context surface.
			     Demonstrates how a real product surface (here, a settings card)
			     can sit alongside the toast container without colliding. -->
			<section class="tn-surface">
				<header class="tn-surface__head">
					<h3>In context — settings panel</h3>
					<p>Saving from a form is the canonical toast trigger. Click Save to see the success toast appear without taking focus away.</p>
				</header>
				<div class="tn-card">
					<div class="tn-row">
						<label for="tn-email">Email</label>
						<input id="tn-email" type="email" placeholder="you@example.com" />
					</div>
					<div class="tn-row">
						<label for="tn-name">Display name</label>
						<input id="tn-name" type="text" placeholder="Ada Lovelace" />
					</div>
					<div class="tn-row tn-row--actions">
						<button class="tn-btn tn-btn--ghost" type="button">Cancel</button>
						<button class="tn-btn tn-btn--success" type="button" onclick={() => triggerToast('success')}>Save changes</button>
					</div>
				</div>
			</section>
		</div>
		<ToastNotification
			position={livePosition}
			maxVisible={liveMax}
			offsetY={`${liveOffsetY}rem`}
			offsetX={`${liveOffsetX}rem`}
		/>
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

	.tn-playground,
	.tn-surface {
		display: grid;
		gap: 14px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.tn-playground__head h3,
	.tn-surface__head h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.tn-playground__head p,
	.tn-surface__head p {
		margin: 0;
		color: var(--fg-2);
		font-size: 13px;
		line-height: 1.5;
	}
	.tn-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
	}
	.tn-control {
		display: grid;
		gap: 8px;
	}
	.tn-control__label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.tn-control__label strong {
		color: var(--fg-1);
		font-weight: 600;
		text-transform: none;
		letter-spacing: 0;
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.tn-control input[type='range'] {
		width: 100%;
	}
	.tn-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tn-pill {
		padding: 6px 10px;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-2);
		border-radius: var(--r-1);
		font: 500 12px var(--font-sans);
		cursor: pointer;
	}
	.tn-pill:hover {
		color: var(--fg-1);
		border-color: var(--accent);
	}
	.tn-pill--active {
		background: var(--accent);
		color: var(--accent-on, #fff);
		border-color: var(--accent);
	}
	.tn-playground__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tn-card {
		display: grid;
		gap: 12px;
		padding: 16px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.tn-row {
		display: grid;
		gap: 4px;
	}
	.tn-row label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.tn-row input {
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: var(--r-1);
		background: var(--surface);
		color: var(--fg-1);
		font: 14px var(--font-sans);
	}
	.tn-row input:focus {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.tn-row--actions {
		grid-auto-flow: column;
		justify-content: end;
		gap: 8px;
	}
</style>
