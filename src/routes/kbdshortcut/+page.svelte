<script lang="ts">
	import KbdShortcut from '$lib/components/KbdShortcut.svelte';
</script>

<svelte:head>
	<title>KbdShortcut · TFE Svelte Templates</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>⌨️ KbdShortcut</h1>
		<p>
			Display keyboard shortcuts as styled key caps. Pass a single key or an array
			to show a combo. Auto-detects Mac vs Windows and substitutes
			<code>⌘</code> / <code>Ctrl</code> as appropriate.
		</p>
	</header>

	<section class="demo">
		<h2>Single keys</h2>
		<p class="demo-note">Pass a string for a single key cap.</p>
		<div class="row">
			<KbdShortcut keys="Esc" />
			<KbdShortcut keys="Tab" />
			<KbdShortcut keys="Enter" />
			<KbdShortcut keys="Space" />
			<KbdShortcut keys="Backspace" />
		</div>
	</section>

	<section class="demo">
		<h2>Mac combos (forced)</h2>
		<p class="demo-note">
			<code>{'mac={true}'}</code> renders Mac glyphs: ⌘ ⌃ ⌥ ⇧ ⏎ ⇥ ⌫.
		</p>
		<div class="row">
			<KbdShortcut keys={['Cmd', 'K']} mac={true} />
			<KbdShortcut keys={['Cmd', 'Shift', 'P']} mac={true} />
			<KbdShortcut keys={['Cmd', 'Alt', 'I']} mac={true} />
			<KbdShortcut keys={['Ctrl', 'C']} mac={true} />
			<KbdShortcut keys={['Cmd', 'Shift', 'Enter']} mac={true} />
		</div>
	</section>

	<section class="demo">
		<h2>Windows combos (forced)</h2>
		<p class="demo-note">
			<code>{'mac={false}'}</code> renders readable text: Ctrl, Shift, Alt, Win.
		</p>
		<div class="row">
			<KbdShortcut keys={['Ctrl', 'K']} mac={false} />
			<KbdShortcut keys={['Ctrl', 'Shift', 'P']} mac={false} />
			<KbdShortcut keys={['Ctrl', 'Alt', 'Delete']} mac={false} />
			<KbdShortcut keys={['Win', 'L']} mac={false} />
		</div>
	</section>

	<section class="demo">
		<h2>Auto-detect</h2>
		<p class="demo-note">
			Omit <code>mac</code> and the component picks the right glyph for your platform.
		</p>
		<div class="row">
			<KbdShortcut keys={['Cmd', 'K']} />
			<KbdShortcut keys={['Cmd', 'Shift', 'P']} />
			<KbdShortcut keys={['Cmd', 'B']} />
		</div>
	</section>

	<section class="demo">
		<h2>Sizes</h2>
		<p class="demo-note">
			Three sizes: <code>sm</code>, <code>md</code> (default), <code>lg</code>.
		</p>
		<div class="row">
			<KbdShortcut keys={['Cmd', 'K']} size="sm" />
			<KbdShortcut keys={['Cmd', 'K']} size="md" />
			<KbdShortcut keys={['Cmd', 'K']} size="lg" />
		</div>
	</section>

	<section class="demo">
		<h2>Sequential combos</h2>
		<p class="demo-note">
			Use a custom separator like <code>" → "</code> to indicate "press <em>g</em>, then <em>s</em>".
		</p>
		<div class="row">
			<KbdShortcut keys={['G', 'S']} separator=" → " />
			<KbdShortcut keys={['G', 'I']} separator=" → " />
			<KbdShortcut keys={['Y', 'Y']} separator=" → " />
		</div>
	</section>

	<section class="demo">
		<h2>In context</h2>
		<p class="demo-note">Common patterns where keyboard hints sit alongside UI.</p>
		<ul class="context-list">
			<li>
				<span>Open command palette</span>
				<KbdShortcut keys={['Cmd', 'K']} size="sm" />
			</li>
			<li>
				<span>Save changes</span>
				<KbdShortcut keys={['Cmd', 'S']} size="sm" />
			</li>
			<li>
				<span>Toggle sidebar</span>
				<KbdShortcut keys={['Cmd', 'B']} size="sm" />
			</li>
			<li>
				<span>Close window</span>
				<KbdShortcut keys={['Cmd', 'W']} size="sm" />
			</li>
			<li>
				<span>Go to inbox</span>
				<KbdShortcut keys={['G', 'I']} separator=" → " size="sm" />
			</li>
		</ul>
	</section>

	<section class="features">
		<h2>Features</h2>
		<ul>
			<li>✅ Single key or combo array</li>
			<li>✅ Auto Mac/Windows detection with manual override</li>
			<li>✅ Three sizes (<code>sm</code> / <code>md</code> / <code>lg</code>)</li>
			<li>✅ Custom separator (+, →, or any string)</li>
			<li>✅ Native <code>&lt;kbd&gt;</code> element for SR semantics</li>
			<li>✅ aria-label spells keys as words ("Cmd plus K")</li>
			<li>✅ Pure CSS key-cap bevel (no images)</li>
			<li>✅ Zero dependencies</li>
		</ul>
	</section>

	<section class="usage">
		<h2>Usage</h2>
		<pre><code>{`<script lang="ts">
  import KbdShortcut from '$lib/components/KbdShortcut.svelte';
</`+`script>

<!-- Single key -->
<KbdShortcut keys="Esc" />

<!-- Mac combo (⌘ on Mac, Win on Windows) -->
<KbdShortcut keys={['Cmd', 'K']} />

<!-- Force Windows -->
<KbdShortcut keys={['Ctrl', 'Shift', 'P']} mac={false} />

<!-- Sequential -->
<KbdShortcut keys={['G', 'S']} separator=" → " />`}</code></pre>
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
	}

	.demo-note code,
	.features code {
		background: #f3f4f6;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.context-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: #ffffff;
	}

	.context-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.context-list li:last-child {
		border-bottom: none;
	}

	.context-list span {
		color: #374151;
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
