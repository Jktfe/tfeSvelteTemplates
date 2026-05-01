<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import KbdShortcut from '$lib/components/KbdShortcut.svelte';

	const shell = catalogShellPropsForSlug('/kbdshortcut')!;

	const codeExplanation =
		'KbdShortcut renders each key as a real <kbd> element so screen readers know it represents keyboard input. The component auto-detects Mac vs Windows from navigator.platform (default to Mac on the server so SSR content matches the most common laptop locale, then corrects on hydration) and substitutes Cmd → ⌘, Ctrl → ⌃ on Mac, leaving readable text on Windows. The default aria-label spells the keys as words ("Cmd plus K") so screen readers say words, not glyphs.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Keyboard', 'CSS-only', 'Theme-aware']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="kbd-demo">
			<section>
				<h3>Single keys</h3>
				<div class="row">
					<KbdShortcut keys="Esc" />
					<KbdShortcut keys="Tab" />
					<KbdShortcut keys="Enter" />
					<KbdShortcut keys="Space" />
					<KbdShortcut keys="Backspace" />
				</div>
			</section>

			<section>
				<h3>Mac combos (forced)</h3>
				<p class="note">
					<code>{'mac={true}'}</code> renders Mac glyphs: ⌘ ⌃ ⌥ ⇧ ⏎ ⇥ ⌫.
				</p>
				<div class="row">
					<KbdShortcut keys={['Cmd', 'K']} mac={true} />
					<KbdShortcut keys={['Cmd', 'Shift', 'P']} mac={true} />
					<KbdShortcut keys={['Cmd', 'Alt', 'I']} mac={true} />
					<KbdShortcut keys={['Cmd', 'Shift', 'Enter']} mac={true} />
				</div>
			</section>

			<section>
				<h3>Windows combos (forced)</h3>
				<p class="note">
					<code>{'mac={false}'}</code> renders readable text: Ctrl, Shift, Alt, Win.
				</p>
				<div class="row">
					<KbdShortcut keys={['Ctrl', 'K']} mac={false} />
					<KbdShortcut keys={['Ctrl', 'Shift', 'P']} mac={false} />
					<KbdShortcut keys={['Ctrl', 'Alt', 'Delete']} mac={false} />
					<KbdShortcut keys={['Win', 'L']} mac={false} />
				</div>
			</section>

			<section>
				<h3>Auto-detect</h3>
				<p class="note">
					Omit <code>mac</code> and the component picks the right glyph for your platform.
				</p>
				<div class="row">
					<KbdShortcut keys={['Cmd', 'K']} />
					<KbdShortcut keys={['Cmd', 'Shift', 'P']} />
					<KbdShortcut keys={['Cmd', 'B']} />
				</div>
			</section>

			<section>
				<h3>Sizes</h3>
				<div class="row">
					<KbdShortcut keys={['Cmd', 'K']} size="sm" />
					<KbdShortcut keys={['Cmd', 'K']} size="md" />
					<KbdShortcut keys={['Cmd', 'K']} size="lg" />
				</div>
			</section>

			<section>
				<h3>Sequential combos</h3>
				<p class="note">
					Use a custom separator like <code>" → "</code> to indicate "press <em>g</em>, then <em>s</em>".
				</p>
				<div class="row">
					<KbdShortcut keys={['G', 'S']} separator=" → " />
					<KbdShortcut keys={['G', 'I']} separator=" → " />
					<KbdShortcut keys={['Y', 'Y']} separator=" → " />
				</div>
			</section>

			<section>
				<h3>In context</h3>
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
						<span>Go to inbox</span>
						<KbdShortcut keys={['G', 'I']} separator=" → " size="sm" />
					</li>
				</ul>
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
					<td><code>keys</code></td>
					<td><code>string | string[]</code></td>
					<td>—</td>
					<td>Required. A single key or an array forming a combo.</td>
				</tr>
				<tr>
					<td><code>mac</code></td>
					<td><code>boolean</code></td>
					<td>auto-detected</td>
					<td>Force Mac glyphs (true) or readable text (false). Auto-detect when omitted.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>'sm' | 'md' | 'lg'</code></td>
					<td><code>'md'</code></td>
					<td>Cap font and padding.</td>
				</tr>
				<tr>
					<td><code>separator</code></td>
					<td><code>string</code></td>
					<td><code>'+'</code></td>
					<td>Text rendered between keys. Use " → " for sequential combos.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td>auto-generated</td>
					<td>Override the auto "Cmd plus K" style aria label.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.kbd-demo {
		display: grid;
		gap: 2rem;
	}

	.kbd-demo h3 {
		font-size: 0.95rem;
		margin: 0 0 0.5rem;
		color: var(--fg-1);
	}

	.note {
		margin: 0 0 0.75rem;
		color: var(--fg-2);
		font-size: 0.88rem;
		line-height: 1.55;
	}

	.note code {
		background: var(--surface-2, var(--surface));
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
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--surface);
	}

	.context-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.context-list li:last-child {
		border-bottom: none;
	}

	.context-list span {
		color: var(--fg-1);
	}
</style>
