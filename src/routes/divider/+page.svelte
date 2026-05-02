<script lang="ts">
	import Divider from '$lib/components/Divider.svelte';
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';

	const shell = catalogShellPropsForSlug('/divider')!;

	const usageSnippet = `<script>
  import Divider from '$lib/components/Divider.svelte';
</${'script'}>

<Divider />
<Divider label="OR" />
<Divider label="Recently active" labelPosition="left" />
<Divider thickness="thick" lineStyle="dashed" colour="#146ef5" />
<Divider orientation="vertical" />`;

	const codeExplanation =
		'Divider is a structural separator. With no label it renders a native <hr> for free role="separator". With a label it becomes a div[role="separator"] flanked by two lines, and switches to a vertical bar with aria-orientation when orientation="vertical".';
</script>

<svelte:head>
	<title>Divider — TFE / Svelte Templates</title>
	<meta
		name="description"
		content="Section separator with optional label, horizontal and vertical orientation, three thicknesses and three line styles."
	/>
</svelte:head>

<ComponentPageShell
	{...shell.props}
	{usageSnippet}
	{codeExplanation}
	tags={['Svelte 5', 'Layout', 'A11y', 'Zero deps']}
>
	{#snippet demo()}
		<div class="dv-grid">
			<section class="dv-card">
				<h3>Plain horizontal</h3>
				<p>Content above the divider.</p>
				<Divider />
				<p>Content below the divider.</p>
			</section>

			<section class="dv-card dv-login">
				<h3>With centred label</h3>
				<button class="dv-auth">Continue with Google</button>
				<button class="dv-auth">Continue with GitHub</button>
				<Divider label="OR" />
				<input type="email" placeholder="you@example.com" class="dv-email" />
				<button class="dv-auth dv-auth--primary">Send magic link</button>
			</section>

			<section class="dv-card">
				<h3>Left-aligned section header</h3>
				<Divider label="Recently active" labelPosition="left" />
				<ul class="dv-list">
					<li>Alex Morgan — 2 min ago</li>
					<li>Jamie Chen — 14 min ago</li>
				</ul>
				<Divider label="Last week" labelPosition="left" />
				<ul class="dv-list">
					<li>Sam O'Brien — 3 days ago</li>
					<li>Riley Fox — 6 days ago</li>
				</ul>
			</section>

			<section class="dv-card">
				<h3>Thicknesses & line styles</h3>
				<small>thin</small>
				<Divider thickness="thin" />
				<small>medium dashed</small>
				<Divider thickness="medium" lineStyle="dashed" />
				<small>thick dotted</small>
				<Divider thickness="thick" lineStyle="dotted" />
				<small>brand colour</small>
				<Divider thickness="thick" lineStyle="dashed" colour="#146ef5" />
			</section>

			<section class="dv-card">
				<h3>Vertical between toolbar groups</h3>
				<div class="dv-toolbar">
					<button class="dv-tool">Bold</button>
					<button class="dv-tool">Italic</button>
					<button class="dv-tool">Underline</button>
					<Divider orientation="vertical" />
					<button class="dv-tool">Link</button>
					<button class="dv-tool">Code</button>
					<Divider orientation="vertical" thickness="medium" colour="#94a3b8" />
					<button class="dv-tool">Image</button>
					<button class="dv-tool">Video</button>
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
					<td><code>orientation</code></td>
					<td><code>'horizontal' | 'vertical'</code></td>
					<td><code>'horizontal'</code></td>
					<td>Direction of the line.</td>
				</tr>
				<tr>
					<td><code>thickness</code></td>
					<td><code>'thin' | 'medium' | 'thick'</code></td>
					<td><code>'thin'</code></td>
					<td>Line weight (1 px / 2 px / 4 px).</td>
				</tr>
				<tr>
					<td><code>lineStyle</code></td>
					<td><code>'solid' | 'dashed' | 'dotted'</code></td>
					<td><code>'solid'</code></td>
					<td>Border line style.</td>
				</tr>
				<tr>
					<td><code>label</code></td>
					<td><code>string</code></td>
					<td><code>undefined</code></td>
					<td>Optional label rendered between two flanking lines.</td>
				</tr>
				<tr>
					<td><code>labelPosition</code></td>
					<td><code>'left' | 'center' | 'right'</code></td>
					<td><code>'center'</code></td>
					<td>Where the label sits along the divider.</td>
				</tr>
				<tr>
					<td><code>colour</code></td>
					<td><code>string</code></td>
					<td>theme</td>
					<td>Override the line colour with any CSS colour value.</td>
				</tr>
				<tr>
					<td><code>decorative</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Hide from assistive tech with <code>role="presentation"</code>.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.dv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 16px;
	}
	.dv-card {
		display: grid;
		gap: 8px;
		padding: 18px;
		border-radius: var(--r-2);
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--fg-1);
	}
	.dv-card h3 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.dv-card p {
		margin: 0;
		color: var(--fg-2);
		font-size: 14px;
	}
	.dv-card small {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-3);
	}

	.dv-login {
		display: grid;
		gap: 8px;
	}
	.dv-auth {
		padding: 10px 14px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--fg-1);
		border-radius: var(--r-1);
		font: inherit;
		cursor: pointer;
	}
	.dv-auth--primary {
		background: var(--tfe-ink, #0f172a);
		color: var(--fg-on-dark, #fff);
		border-color: transparent;
	}
	.dv-email {
		padding: 10px 12px;
		border: 1px solid var(--border-strong);
		border-radius: var(--r-1);
		background: var(--surface);
		color: var(--fg-1);
		font: inherit;
	}

	.dv-list {
		margin: 0;
		padding-left: 18px;
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.7;
	}
	.dv-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.dv-tool {
		padding: 6px 12px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--fg-1);
		border-radius: var(--r-1);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}
</style>
