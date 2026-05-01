<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Avatar from '$lib/components/Avatar.svelte';

	const shell = catalogShellPropsForSlug('/avatar')!;

	let broken = $state(false);
	let liveSrc = $derived(broken ? 'https://broken.example/nope.png' : 'https://i.pravatar.cc/150?img=12');
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Identity', 'A11y', 'Theme-aware']}
	codeExplanation="Avatar is the smallest identity primitive — pass src and you get an image; pass only name and you get its initials on a deterministically-coloured background derived from the name. The same person therefore always lands on the same colour, everywhere in your product. If src 404s the native onerror handler quietly flips to the initials fallback. Three sizes, three shapes (circle / rounded / square), and an optional status dot in four states cover almost any presence pattern."
>
	{#snippet demo()}
		<div class="av-stack">
			<section class="av-card">
				<h3 class="av-h3">Photo avatars</h3>
				<div class="av-row">
					<Avatar src="https://i.pravatar.cc/150?img=1" name="Ada Lovelace" />
					<Avatar src="https://i.pravatar.cc/150?img=5" name="Grace Hopper" />
					<Avatar src="https://i.pravatar.cc/150?img=9" name="Margaret Hamilton" />
					<Avatar src="https://i.pravatar.cc/150?img=15" name="Katherine Johnson" />
					<Avatar src="https://i.pravatar.cc/150?img=20" name="Karen Spärck Jones" />
				</div>
			</section>

			<section class="av-card">
				<h3 class="av-h3">Initials fallback (deterministic colour)</h3>
				<div class="av-row">
					<Avatar name="Ada Lovelace" />
					<Avatar name="Grace Hopper" />
					<Avatar name="Margaret Hamilton" />
					<Avatar name="Katherine Johnson" />
					<Avatar name="Karen Spärck Jones" />
					<Avatar name="Linus Torvalds" />
					<Avatar name="Tim Berners-Lee" />
				</div>
			</section>

			<section class="av-card">
				<h3 class="av-h3">Sizes &amp; shapes</h3>
				<div class="av-row av-row--baseline">
					<Avatar name="Ada Lovelace" size="sm" />
					<Avatar name="Ada Lovelace" size="md" />
					<Avatar name="Ada Lovelace" size="lg" />
				</div>
				<div class="av-row">
					<Avatar name="Ada Lovelace" shape="circle" size="lg" />
					<Avatar name="Ada Lovelace" shape="rounded" size="lg" />
					<Avatar name="Ada Lovelace" shape="square" size="lg" />
				</div>
			</section>

			<section class="av-card">
				<h3 class="av-h3">Status dot</h3>
				<div class="av-row">
					<div class="av-labelled"><Avatar name="Ada Lovelace" status="online" size="lg" /><small>online</small></div>
					<div class="av-labelled"><Avatar name="Grace Hopper" status="away" size="lg" /><small>away</small></div>
					<div class="av-labelled"><Avatar name="Margaret Hamilton" status="busy" size="lg" /><small>busy</small></div>
					<div class="av-labelled"><Avatar name="Katherine Johnson" status="offline" size="lg" /><small>offline</small></div>
				</div>
			</section>

			<section class="av-card">
				<h3 class="av-h3">Live broken-src auto-fallback</h3>
				<div class="av-row">
					<Avatar src={liveSrc} name="Ada Lovelace" size="lg" />
					<button class="av-btn" onclick={() => (broken = !broken)}>{broken ? 'Restore image' : 'Break image'}</button>
					<code class="av-src">{liveSrc}</code>
				</div>
			</section>
		</div>
	{/snippet}

	{#snippet api()}
		<table>
			<thead>
				<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>src</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Image URL. If it fails to load the avatar swaps to initials.</td>
				</tr>
				<tr>
					<td><code>name</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Used to derive initials and the deterministic background colour.</td>
				</tr>
				<tr>
					<td><code>alt</code></td>
					<td><code>string</code></td>
					<td>derived from name</td>
					<td>Image alt text — falls back to the name when omitted.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>"sm" | "md" | "lg"</code></td>
					<td><code>"md"</code></td>
					<td>32px / 48px / 72px diameter.</td>
				</tr>
				<tr>
					<td><code>shape</code></td>
					<td><code>"circle" | "rounded" | "square"</code></td>
					<td><code>"circle"</code></td>
					<td>Corner treatment.</td>
				</tr>
				<tr>
					<td><code>status</code></td>
					<td><code>"online" | "away" | "busy" | "offline"</code></td>
					<td>—</td>
					<td>Optional bottom-right status dot.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>""</code></td>
					<td>Extra class names forwarded to the root.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.av-stack { display: grid; gap: 16px; }
	.av-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.av-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.av-row {
		display: flex;
		gap: 14px;
		align-items: center;
		flex-wrap: wrap;
	}
	.av-row--baseline { align-items: baseline; }
	.av-labelled {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.av-labelled small {
		font: 11px var(--font-mono);
		color: var(--fg-3);
	}
	.av-btn {
		padding: 6px 12px;
		font: 500 13px var(--font-sans);
		background: var(--surface-2);
		color: var(--fg-1);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		cursor: pointer;
	}
	.av-btn:hover { background: var(--surface); }
	.av-src {
		font: 12px var(--font-mono);
		color: var(--fg-3);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
