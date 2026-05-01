<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import AvatarStack from '$lib/components/AvatarStack.svelte';

	const shell = catalogShellPropsForSlug('/avatarstack')!;

	const teamWithImages = [
		{ name: 'Ada Lovelace', src: 'https://i.pravatar.cc/96?img=1' },
		{ name: 'Grace Hopper', src: 'https://i.pravatar.cc/96?img=2' },
		{ name: 'Margaret Hamilton', src: 'https://i.pravatar.cc/96?img=3' },
		{ name: 'Katherine Johnson', src: 'https://i.pravatar.cc/96?img=4' },
		{ name: 'Hedy Lamarr', src: 'https://i.pravatar.cc/96?img=5' },
		{ name: 'Joan Clarke', src: 'https://i.pravatar.cc/96?img=6' },
		{ name: 'Annie Easley', src: 'https://i.pravatar.cc/96?img=7' }
	];

	const initialsOnly = [
		{ name: 'Ada Lovelace' },
		{ name: 'Grace Hopper' },
		{ name: 'Margaret Hamilton' },
		{ name: 'Katherine Johnson' }
	];

	const reactions = [
		{ name: 'Alex' }, { name: 'Bethany' }, { name: 'Camille' }, { name: 'Dylan' },
		{ name: 'Erin' }, { name: 'Felipe' }, { name: 'Gabi' }, { name: 'Hugo' },
		{ name: 'Ivy' }, { name: 'Jordan' }, { name: 'Kira' }, { name: 'Leo' }
	];

	const broken = [
		{ name: 'Broken Image User', src: 'https://invalid-host-404/never.jpg' },
		{ name: 'Working Image User', src: 'https://i.pravatar.cc/96?img=12' },
		{ name: 'Initials Only User' }
	];
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'Identity', 'Overflow', 'A11y']}
	codeExplanation="AvatarStack overlaps avatars using negative margins (no transforms, no z-index gymnastics) and only renders max + 1 nodes regardless of how many people you pass — keeping the DOM tiny. Each avatar is a button with aria-label set to the full name, and the optional '+N' overflow tile carries a tooltip for the next hidden person. The fallback chain is image → explicit initials → derived initials → deterministic colour, so a 404 never shows broken art."
>
	{#snippet demo()}
		<div class="as-stack">
			<section class="as-card">
				<h3 class="as-h3">Team with images (max 4 of 7)</h3>
				<div class="as-cell"><AvatarStack people={teamWithImages} max={4} /></div>
			</section>

			<section class="as-card">
				<h3 class="as-h3">Initials only — deterministic colours</h3>
				<div class="as-cell"><AvatarStack people={initialsOnly} max={4} size={44} /></div>
			</section>

			<section class="as-card">
				<h3 class="as-h3">Reaction summary (max 5 of 12, tighter overlap)</h3>
				<div class="as-cell"><AvatarStack people={reactions} max={5} size={28} overlap={10} /></div>
			</section>

			<section class="as-card">
				<h3 class="as-h3">Graceful failure: broken URL → initials swap</h3>
				<div class="as-cell"><AvatarStack people={broken} max={5} size={48} /></div>
				<p class="as-note">The first avatar's image URL 404s; it auto-falls back to initials.</p>
			</section>

			<section class="as-card">
				<h3 class="as-h3">Hide the overflow tile</h3>
				<div class="as-cell"><AvatarStack people={teamWithImages} max={3} showOverflow={false} /></div>
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
					<td><code>people</code></td>
					<td><code>AvatarStackPerson[]</code></td>
					<td><code>[]</code></td>
					<td>Array of {'{ name, src?, initials? }'} objects.</td>
				</tr>
				<tr>
					<td><code>max</code></td>
					<td><code>number</code></td>
					<td><code>4</code></td>
					<td>Avatars rendered before the +N overflow tile.</td>
				</tr>
				<tr>
					<td><code>size</code></td>
					<td><code>number</code></td>
					<td><code>36</code></td>
					<td>Diameter in pixels for each avatar.</td>
				</tr>
				<tr>
					<td><code>overlap</code></td>
					<td><code>number</code></td>
					<td><code>12</code></td>
					<td>Pixels each avatar overlaps the one before it.</td>
				</tr>
				<tr>
					<td><code>borderColor</code></td>
					<td><code>string</code></td>
					<td><code>"white"</code></td>
					<td>Ring colour separating avatars.</td>
				</tr>
				<tr>
					<td><code>showOverflow</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Render the +N tile when people.length &gt; max.</td>
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
	.as-stack { display: grid; gap: 16px; }
	.as-card {
		display: grid;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		background: var(--surface);
	}
	.as-h3 {
		margin: 0;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.as-cell {
		padding: 14px;
		background: var(--surface-2);
		border-radius: var(--r-2);
		display: flex;
		justify-content: center;
	}
	.as-note {
		margin: 0;
		font: 12px var(--font-mono);
		color: var(--fg-3);
	}
</style>
