<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const shell = catalogShellPropsForSlug('/breadcrumbs')!;

	const shortTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Components', href: '/components' },
		{ label: 'Breadcrumbs' }
	];

	const fullTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Components', href: '/components' },
		{ label: 'Navigation', href: '/components/navigation' },
		{ label: 'Breadcrumbs' }
	];

	const longTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Workspace', href: '/workspace' },
		{ label: 'Projects', href: '/workspace/projects' },
		{ label: 'Q2 Initiatives', href: '/workspace/projects/q2' },
		{ label: 'Mobile App Redesign', href: '/workspace/projects/q2/mobile-redesign' },
		{ label: 'Design Reviews', href: '/workspace/projects/q2/mobile-redesign/reviews' },
		{ label: 'Round 3 — Onboarding flow' }
	];

	const ecommerceTrail = [
		{ label: 'Home', href: '/' },
		{ label: 'Men', href: '/men' },
		{ label: 'Outerwear', href: '/men/outerwear' },
		{ label: 'Down jackets', href: '/men/outerwear/down' },
		{ label: 'Patagonia Down Sweater Hoody — Black' }
	];

	const codeExplanation =
		'Breadcrumbs render as a real nav > ol > li tree. Separators are aria-hidden so screen readers only hear the labels; the final crumb gets aria-current="page". When maxVisible is hit, the middle crumbs are replaced by an ellipsis token while the first and last crumbs survive — the "where I started" and "where I am" anchors that matter most to the user.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Zero-deps', 'Semantic HTML']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="bc-demo">
			<div class="bc-row">
				<h4>Short trail · default separator</h4>
				<Breadcrumbs items={shortTrail} />
			</div>
			<div class="bc-row">
				<h4>Four levels · chevron separator</h4>
				<Breadcrumbs items={fullTrail} separator="›" />
			</div>
			<div class="bc-row">
				<h4>Long trail · full path (7 levels)</h4>
				<Breadcrumbs items={longTrail} separator="/" />
				<p class="bc-note">Long names truncate to 18ch with ellipsis to keep the row tidy.</p>
			</div>
			<div class="bc-row">
				<h4>Long trail · collapsed (maxVisible=4)</h4>
				<Breadcrumbs items={longTrail} separator="/" maxVisible={4} />
				<p class="bc-note">First + … + last (maxVisible − 2). Always preserves the anchors.</p>
			</div>
			<div class="bc-row">
				<h4>E-commerce · arrow separator</h4>
				<Breadcrumbs items={ecommerceTrail} separator="→" />
			</div>
			<div class="bc-row">
				<h4>Custom aria-label</h4>
				<Breadcrumbs items={fullTrail} ariaLabel="You are here" />
				<p class="bc-note">i18n-friendly — assistive tech reads "You are here".</p>
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
					<td><code>items</code></td>
					<td><code>Crumb[]</code></td>
					<td>required</td>
					<td>Array of <code>{`{ label, href? }`}</code> — last item is treated as current page.</td>
				</tr>
				<tr>
					<td><code>separator</code></td>
					<td><code>string</code></td>
					<td><code>'/'</code></td>
					<td>Character or short string drawn between crumbs.</td>
				</tr>
				<tr>
					<td><code>maxVisible</code></td>
					<td><code>number</code></td>
					<td><code>0</code></td>
					<td>0 = show all; otherwise collapses middle items to an ellipsis.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Breadcrumb'</code></td>
					<td>Accessible name on the wrapping <code>nav</code>.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the wrapper.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.bc-demo {
		display: grid;
		gap: 22px;
		padding: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.bc-row {
		display: grid;
		gap: 8px;
		padding-bottom: 22px;
		border-bottom: 1px solid var(--border);
	}
	.bc-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
	.bc-row h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.bc-note {
		margin: 4px 0 0;
		font-size: 12px;
		color: var(--fg-3);
	}
</style>
