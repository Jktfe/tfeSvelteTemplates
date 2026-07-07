<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Popover from '$lib/components/Popover.svelte';

	const shell = catalogShellPropsForSlug('/popover')!;

	// Bindable open states for the live-state strips.
	let menuOpen = $state(false);
	let formOpen = $state(false);

	// A tiny form-in-popover demo.
	let email = $state('');
	let saved = $state('');

	function saveEmail() {
		saved = email.trim() || '(empty)';
		formOpen = false;
	}

	const codeExplanation =
		'Popover measures the trigger and the panel with getBoundingClientRect the moment it opens, then flips to the opposite side only when the preferred side lacks room and the opposite side has strictly more space. The panel is centred on the trigger cross-axis and clamped so it never spills off-screen. It is role="dialog" aria-modal="false": clicking away or pressing Escape closes it, Escape also returns focus to the trigger, and on open focus moves to the first focusable child. The entrance transition is gated on prefers-reduced-motion.';
</script>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Zero-deps', 'Bindable']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="pop-demo">
			<div class="pop-row">
				<h4>Bottom menu — the default</h4>
				<Popover bind:open={menuOpen} placement="bottom" ariaLabel="Actions menu">
					{#snippet trigger(props)}
						<button class="pop-btn" {...props}>Actions ▾</button>
					{/snippet}
					<ul class="pop-menu">
						<li><button class="pop-menu-item" onclick={() => (menuOpen = false)}>Edit</button></li>
						<li><button class="pop-menu-item" onclick={() => (menuOpen = false)}>Duplicate</button></li>
						<li><button class="pop-menu-item pop-menu-item--danger" onclick={() => (menuOpen = false)}>Delete</button></li>
					</ul>
				</Popover>
				<p class="pop-note">Open: <code>{menuOpen}</code> · click away or press Escape to close.</p>
			</div>

			<div class="pop-row">
				<h4>Four placements — flips near the edges</h4>
				<div class="pop-stage pop-stage--grid">
					{#each ['top', 'bottom', 'left', 'right'] as const as side (side)}
						<Popover placement={side} ariaLabel={`${side} popover`}>
							{#snippet trigger(props)}
								<button class="pop-btn pop-btn--sm" {...props}>{side}</button>
							{/snippet}
							<div class="pop-info">
								<strong>placement="{side}"</strong>
								<p>Anchored to the {side}. Near a viewport edge it flips to the side with more room.</p>
							</div>
						</Popover>
					{/each}
				</div>
				<p class="pop-note">Each button opens independently — try scrolling so a button nears an edge.</p>
			</div>

			<div class="pop-row">
				<h4>Form in a popover — real focusable content</h4>
				<Popover bind:open={formOpen} placement="bottom" ariaLabel="Update email">
					{#snippet trigger(props)}
						<button class="pop-btn" {...props}>Update email ▾</button>
					{/snippet}
					<form class="pop-form" onsubmit={(e) => { e.preventDefault(); saveEmail(); }}>
						<label class="pop-label" for="pop-email">New email</label>
						<input
							id="pop-email"
							class="pop-input"
							type="email"
							placeholder="you@example.com"
							bind:value={email}
						/>
						<div class="pop-form-actions">
							<button type="button" class="pop-btn pop-btn--ghost" onclick={() => (formOpen = false)}>Cancel</button>
							<button type="submit" class="pop-btn">Save</button>
						</div>
					</form>
				</Popover>
				<p class="pop-note">
					On open, focus jumps into the input. Saved: <code>{saved || '—'}</code>
				</p>
			</div>
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
					<td><code>open</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable open state; set it to open/close programmatically.</td>
				</tr>
				<tr>
					<td><code>placement</code></td>
					<td><code>'top' | 'bottom' | 'left' | 'right'</code></td>
					<td><code>'bottom'</code></td>
					<td>Preferred side to anchor on; flips automatically on overflow.</td>
				</tr>
				<tr>
					<td><code>offset</code></td>
					<td><code>number</code></td>
					<td><code>8</code></td>
					<td>Gap in pixels between the trigger and the panel.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Popover'</code></td>
					<td>Accessible name announced for the dialog.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class applied to the panel element.</td>
				</tr>
				<tr>
					<td><code>trigger</code></td>
					<td><code>Snippet&lt;[triggerProps]&gt;</code></td>
					<td><code>—</code></td>
					<td>Renders the trigger; spread the received props onto your button.</td>
				</tr>
				<tr>
					<td><code>children</code></td>
					<td><code>Snippet</code></td>
					<td><code>—</code></td>
					<td>The panel content.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.pop-demo {
		display: grid;
		gap: 22px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.pop-row {
		display: grid;
		gap: 12px;
		justify-items: center;
		text-align: center;
		padding-bottom: 22px;
		border-bottom: 1px solid var(--border);
	}
	.pop-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.pop-row h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.pop-stage {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
	}
	.pop-stage--grid {
		max-width: 320px;
	}
	.pop-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.pop-note code {
		font-family: var(--font-mono);
		font-size: 11px;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}

	/* Trigger button */
	.pop-btn {
		font: inherit;
		font-size: 13px;
		font-weight: 500;
		padding: 8px 14px;
		border-radius: var(--r-1);
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--fg-1);
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}
	.pop-btn:hover {
		background: var(--surface);
		border-color: var(--fg-3);
	}
	.pop-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	.pop-btn--sm {
		padding: 6px 12px;
		min-width: 72px;
	}
	.pop-btn--ghost {
		background: transparent;
	}

	/* Menu content */
	.pop-menu {
		list-style: none;
		margin: 0;
		padding: 0;
		min-width: 160px;
	}
	.pop-menu-item {
		display: block;
		width: 100%;
		text-align: left;
		font: inherit;
		font-size: 13px;
		padding: 8px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.pop-menu-item:hover,
	.pop-menu-item:focus-visible {
		background: rgba(0, 0, 0, 0.06);
		outline: none;
	}
	.pop-menu-item--danger {
		color: #dc2626;
	}

	/* Info card */
	.pop-info strong {
		display: block;
		font-family: var(--font-mono);
		font-size: 12px;
		margin-bottom: 6px;
	}
	.pop-info p {
		margin: 0;
		font-size: 13px;
		line-height: 1.45;
	}

	/* Form */
	.pop-form {
		display: grid;
		gap: 8px;
		min-width: 220px;
		text-align: left;
	}
	.pop-label {
		font-size: 12px;
		font-weight: 500;
	}
	.pop-input {
		font: inherit;
		font-size: 13px;
		padding: 8px 10px;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		background: transparent;
		color: inherit;
	}
	.pop-input:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}
	.pop-form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 4px;
	}
</style>
