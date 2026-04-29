<script lang="ts">
	import Drawer from '$lib/components/Drawer.svelte';

	// Each demo gets its own `open` state so they can coexist on one page.
	let basicOpen = $state(false);

	// Edges demo — one drawer per edge, each toggled independently.
	let leftOpen = $state(false);
	let rightOpen = $state(false);
	let topOpen = $state(false);
	let bottomOpen = $state(false);

	// Custom-size demo — bottom sheet at 70vh.
	let bottomSheetOpen = $state(false);

	// Form-inside demo — proves focus trap by handing real inputs / buttons
	// to the user. Tab cycles through the form, Shift+Tab reverses, neither
	// escapes back to the page.
	let formOpen = $state(false);
	let formName = $state('');
	let formNotes = $state('');

	// Persistent demo — backdrop click + Escape do nothing. The user must use
	// an explicit Cancel / Save action.
	let persistentOpen = $state(false);

	// Focus restore demo — open via the button, drawer auto-closes after 1.5s,
	// focus snaps back to the original trigger.
	let restoreOpen = $state(false);
	function openRestoreDemo() {
		restoreOpen = true;
		setTimeout(() => {
			restoreOpen = false;
		}, 1500);
	}
</script>

<svelte:head>
	<title>Drawer · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>📥 Drawer</h1>
		<p>
			Slide-in modal panel from any of the four screen edges. Built-in keyboard focus trap, body
			scroll lock, focus restore on close, Escape and backdrop dismissal, and a respectful
			<code>prefers-reduced-motion</code> fallback. Use it for mobile navigation, side-panel
			filters / settings, and full bottom-sheet forms.
		</p>
	</header>

	<section class="demo">
		<h2>Basic drawer (right edge)</h2>
		<p class="demo-note">
			The default — a 320px panel that slides in from the right. Click the backdrop or press
			<kbd>Esc</kbd> to dismiss. Watch the focus indicator: when the drawer opens, focus jumps
			inside; when it closes, focus returns to the button you pressed.
		</p>
		<button type="button" class="primary-btn" onclick={() => (basicOpen = true)}>
			Open right drawer
		</button>

		<Drawer bind:open={basicOpen} ariaLabel="Basic drawer demo">
			<div class="drawer-content">
				<h3>Hello from the drawer</h3>
				<p>
					Tab cycles inside this dialog and never escapes back to the page. Background scroll is
					locked. Press <kbd>Esc</kbd> or click the dimmed backdrop to close.
				</p>
				<button type="button" class="ghost-btn" onclick={() => (basicOpen = false)}>Close</button>
			</div>
		</Drawer>
	</section>

	<section class="demo">
		<h2>All four edges</h2>
		<p class="demo-note">
			Use <code>position</code> to pick which edge the drawer slides from. Each edge has its own
			translate animation; reduced-motion replaces the slide with a calm opacity fade.
		</p>
		<div class="row">
			<button type="button" class="ghost-btn" onclick={() => (leftOpen = true)}>← Left</button>
			<button type="button" class="ghost-btn" onclick={() => (rightOpen = true)}>Right →</button>
			<button type="button" class="ghost-btn" onclick={() => (topOpen = true)}>↑ Top</button>
			<button type="button" class="ghost-btn" onclick={() => (bottomOpen = true)}>↓ Bottom</button>
		</div>

		<Drawer bind:open={leftOpen} position="left" ariaLabel="Left drawer">
			<div class="drawer-content">
				<h3>Left edge</h3>
				<p>Common pattern for mobile navigation menus.</p>
				<button type="button" class="ghost-btn" onclick={() => (leftOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={rightOpen} position="right" ariaLabel="Right drawer">
			<div class="drawer-content">
				<h3>Right edge</h3>
				<p>Right is the default. Good for filters, details panels, and inspectors.</p>
				<button type="button" class="ghost-btn" onclick={() => (rightOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={topOpen} position="top" ariaLabel="Top drawer">
			<div class="drawer-content">
				<h3>Top edge</h3>
				<p>Useful for site-wide notifications or activity panels.</p>
				<button type="button" class="ghost-btn" onclick={() => (topOpen = false)}>Close</button>
			</div>
		</Drawer>

		<Drawer bind:open={bottomOpen} position="bottom" ariaLabel="Bottom drawer">
			<div class="drawer-content">
				<h3>Bottom edge</h3>
				<p>The mobile-first "bottom sheet" pattern. Great for action menus on touch devices.</p>
				<button type="button" class="ghost-btn" onclick={() => (bottomOpen = false)}>Close</button>
			</div>
		</Drawer>
	</section>

	<section class="demo">
		<h2>Custom size — CSS length</h2>
		<p class="demo-note">
			<code>size</code> takes a number (interpreted as pixels) <em>or</em> any CSS length string like
			<code>'70vh'</code> or <code>'24rem'</code>. Below, a bottom sheet at 70% of the viewport
			height.
		</p>
		<button type="button" class="primary-btn" onclick={() => (bottomSheetOpen = true)}>
			Open 70vh bottom sheet
		</button>

		<Drawer
			bind:open={bottomSheetOpen}
			position="bottom"
			size="70vh"
			ariaLabel="Bottom sheet demo"
		>
			<div class="drawer-content">
				<h3>Tall bottom sheet</h3>
				<p>
					The drawer takes 70% of the viewport height. On a small screen this is the typical
					"bottom sheet" pattern for menus and quick actions.
				</p>
				<p>
					Try Tab — focus stays inside the drawer. Try scrolling the page behind the dimmed
					backdrop — page scroll is locked.
				</p>
				<button type="button" class="ghost-btn" onclick={() => (bottomSheetOpen = false)}>
					Close
				</button>
			</div>
		</Drawer>
	</section>

	<section class="demo">
		<h2>Drawer with a form (focus trap proof)</h2>
		<p class="demo-note">
			This drawer has multiple tabbable elements. Open it, then keep pressing
			<kbd>Tab</kbd> — focus cycles through the inputs, the buttons, then back to the first input.
			<kbd>Shift</kbd>+<kbd>Tab</kbd> reverses direction. Focus never leaks to the page behind.
		</p>
		<button type="button" class="primary-btn" onclick={() => (formOpen = true)}>
			Open form drawer
		</button>

		<Drawer bind:open={formOpen} size={420} ariaLabel="New note form">
			<div class="drawer-content">
				<h3>New note</h3>
				<label class="field">
					<span>Name</span>
					<input
						type="text"
						bind:value={formName}
						placeholder="Project Aurora"
					/>
				</label>
				<label class="field">
					<span>Notes</span>
					<textarea
						bind:value={formNotes}
						rows="4"
						placeholder="Anything worth remembering…"
					></textarea>
				</label>
				<div class="form-actions">
					<button type="button" class="ghost-btn" onclick={() => (formOpen = false)}>
						Cancel
					</button>
					<button
						type="button"
						class="primary-btn"
						onclick={() => {
							formOpen = false;
							formName = '';
							formNotes = '';
						}}
					>
						Save
					</button>
				</div>
			</div>
		</Drawer>
	</section>

	<section class="demo">
		<h2>Persistent (no backdrop / Escape dismiss)</h2>
		<p class="demo-note">
			Set <code>persistent</code> when the user must explicitly accept or cancel — common for
			multi-step forms, destructive confirmations, and onboarding. Backdrop click and Escape
			become no-ops.
		</p>
		<button type="button" class="primary-btn" onclick={() => (persistentOpen = true)}>
			Open persistent drawer
		</button>

		<Drawer
			bind:open={persistentOpen}
			persistent
			ariaLabel="Persistent confirmation"
		>
			<div class="drawer-content">
				<h3>Sticky drawer</h3>
				<p>
					Try clicking the backdrop or pressing <kbd>Esc</kbd> — nothing happens. You must use
					one of the buttons below to leave.
				</p>
				<div class="form-actions">
					<button type="button" class="ghost-btn" onclick={() => (persistentOpen = false)}>
						Cancel
					</button>
					<button type="button" class="primary-btn" onclick={() => (persistentOpen = false)}>
						Confirm
					</button>
				</div>
			</div>
		</Drawer>
	</section>

	<section class="demo">
		<h2>Focus restore on close</h2>
		<p class="demo-note">
			When the drawer closes, focus returns to whatever was focused when it opened — even if the
			drawer is closed programmatically (not by the user). Click the button below and watch the
			focus ring snap back to it after 1.5s.
		</p>
		<button type="button" class="primary-btn" onclick={openRestoreDemo}>
			Open & auto-close in 1.5s
		</button>

		<Drawer bind:open={restoreOpen} ariaLabel="Auto-closing drawer">
			<div class="drawer-content">
				<h3>Watch closely…</h3>
				<p>
					This drawer will close itself in a moment. When it does, focus jumps back to the
					button that opened it — which is exactly what assistive tech users expect after a
					modal layer disappears.
				</p>
			</div>
		</Drawer>
	</section>

	<section class="features">
		<h2>What you get</h2>
		<ul>
			<li>Four edge positions — <code>left / right / top / bottom</code></li>
			<li>Numeric size (px) or any CSS length string (<code>'70vh'</code>, <code>'24rem'</code>)</li>
			<li>Backdrop click-to-close (disable with <code>persistent</code>)</li>
			<li>Escape-to-close (disabled when <code>persistent</code>)</li>
			<li>Manual focus trap — Tab and Shift+Tab cycle, neither escapes</li>
			<li>Body scroll lock — preserves prior <code>overflow</code>, restores on close</li>
			<li>Focus restore — re-focuses the element that opened the drawer</li>
			<li>CSS slide animation per edge, opacity-fade fallback for reduced motion</li>
			<li>Two-way <code>bind:open</code> + <code>onClose</code> callback</li>
			<li>Zero dependencies, fully copy-paste portable</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import Drawer from '$lib/components/Drawer.svelte';
  let drawerOpen = $state(false);
</`+`script>

<button onclick={() => (drawerOpen = true)}>Settings</button>

<Drawer bind:open={drawerOpen} position="right" size={400} ariaLabel="Settings panel">
  <h2>Settings</h2>
  <p>Drawer content goes here.</p>
  <button onclick={() => (drawerOpen = false)}>Close</button>
</Drawer>`}</code></pre>
	</section>
</div>

<style>
	.page {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1rem 4rem;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-header h1 {
		font-size: 2.25rem;
		margin: 0 0 0.5rem;
	}

	.page-header p {
		color: #4b5563;
		max-width: 42rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	.demo {
		margin-bottom: 3rem;
	}

	.demo h2,
	.features h2,
	.usage h2 {
		font-size: 1.25rem;
		margin: 0 0 0.5rem;
		color: #111827;
	}

	.demo-note {
		color: #6b7280;
		font-size: 0.95rem;
		margin: 0 0 1.25rem;
		max-width: 42rem;
		line-height: 1.55;
	}

	.demo-note code,
	.features code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	kbd {
		display: inline-block;
		padding: 0.05rem 0.4rem;
		font-size: 0.8em;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
		border-bottom-width: 2px;
		border-radius: 0.3rem;
		color: #374151;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.primary-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: #4f46e5;
		color: #ffffff;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 150ms ease;
	}

	.primary-btn:hover {
		background: #4338ca;
	}

	.ghost-btn {
		padding: 0.625rem 1.25rem;
		background: #ffffff;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		color: #374151;
		cursor: pointer;
	}

	.ghost-btn:hover {
		background: #f3f4f6;
	}

	.drawer-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
	}

	.drawer-content h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.drawer-content p {
		margin: 0;
		color: #4b5563;
		line-height: 1.6;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field span {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.field input,
	.field textarea {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.95rem;
		font-family: inherit;
	}

	.field input:focus,
	.field textarea:focus {
		outline: 2px solid #6366f1;
		outline-offset: 1px;
		border-color: #6366f1;
	}

	.field textarea {
		resize: vertical;
		min-height: 5rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}

	.features ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 0.5rem 1.25rem;
		color: #374151;
	}

	.features li {
		line-height: 1.6;
	}

	.usage pre {
		background: #0f172a;
		color: #e2e8f0;
		padding: 1rem 1.25rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
