<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';

	const shell = catalogShellPropsForSlug('/liquidtabbar')!;

	const demoTabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'integrations', label: 'Integrations' },
		{ id: 'settings', label: 'Settings' }
	];

	const billingTabs = [
		{ id: 'monthly', label: 'Monthly' },
		{ id: 'annually', label: 'Annually (-20%)' }
	];

	const productTabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'specs', label: 'Specifications' },
		{ id: 'reviews', label: 'Reviews & Ratings' },
		{ id: 'faq', label: 'FAQ' },
		{ id: 'support', label: 'Support' }
	];

	const filterTabs = [
		{ id: 'all', label: 'All' },
		{ id: 'open', label: 'Open' },
		{ id: 'progress', label: 'In progress' },
		{ id: 'done', label: 'Done' }
	];

	const compactTabs = [
		{ id: 'on', label: 'On' },
		{ id: 'off', label: 'Off' }
	];

	let activeTab1 = $state('overview');
	let activeTab2 = $state('annually');
	let activeTab3 = $state('reviews');
	let activeTab4 = $state('progress');
	let activeTab5 = $state('on');
	let activeTab6 = $state('overview');

	const codeExplanation =
		'LiquidTabBar uses an SVG goo filter so the active "pill" appears to flow between tabs as it transitions. Each tab button is measured with bind:this and offsetWidth/offsetLeft, then the pill width and translateX are animated. Arrow keys, Home, and End move focus along the row; reduced-motion users get an instant snap rather than the gooey transition.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'SVG filter', 'Animation']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="ltb-demo">
			<div class="ltb-demo__row">
				<h4>Standard navigation</h4>
				<LiquidTabBar tabs={demoTabs} bind:activeTab={activeTab1} />
				<p class="ltb-demo__active">Active: <code>{activeTab1}</code></p>
			</div>

			<div class="ltb-demo__row">
				<h4>Two-option pill — equal-width labels</h4>
				<LiquidTabBar tabs={billingTabs} bind:activeTab={activeTab2} />
				<p class="ltb-demo__active">Active: <code>{activeTab2}</code></p>
			</div>

			<div class="ltb-demo__row">
				<h4>Five tabs — uneven widths</h4>
				<LiquidTabBar tabs={productTabs} bind:activeTab={activeTab3} />
				<p class="ltb-demo__active">
					Active: <code>{activeTab3}</code> · the pill width animates as labels change length
				</p>
			</div>

			<div class="ltb-demo__row">
				<h4>Filter chips — brand purple</h4>
				<LiquidTabBar
					tabs={filterTabs}
					bind:activeTab={activeTab4}
					bg="#5b21b6"
					pillColor="#ffffff"
					activeText="#5b21b6"
					inactiveText="rgba(255, 255, 255, 0.7)"
					inactiveHoverText="#ffffff"
				/>
				<p class="ltb-demo__active">Active: <code>{activeTab4}</code></p>
			</div>

			<div class="ltb-demo__row">
				<h4>Light theme — paper background, ink pill</h4>
				<LiquidTabBar
					tabs={demoTabs}
					bind:activeTab={activeTab6}
					bg="#f3f3ee"
					pillColor="#111315"
					activeText="#f3f3ee"
					inactiveText="#4b5563"
					inactiveHoverText="#111315"
				/>
				<p class="ltb-demo__active">Active: <code>{activeTab6}</code></p>
			</div>

			<div class="ltb-demo__row">
				<h4>Compact toggle — accent green</h4>
				<LiquidTabBar
					tabs={compactTabs}
					bind:activeTab={activeTab5}
					bg="#064e3b"
					pillColor="#10b981"
					activeText="#022c22"
					inactiveText="rgba(255, 255, 255, 0.65)"
					inactiveHoverText="#ffffff"
				/>
				<p class="ltb-demo__active">Active: <code>{activeTab5}</code></p>
			</div>

			<div class="ltb-demo__hint">
				<strong>Try it:</strong> click between tabs and watch the pill stretch and snap between
				widths. Use the keyboard — <kbd>Tab</kbd> to focus, <kbd>←</kbd> <kbd>→</kbd> to move
				along, <kbd>Home</kbd> / <kbd>End</kbd> to jump to first/last.
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
					<td><code>tabs</code></td>
					<td><code>{`{ id: string; label: string }[]`}</code></td>
					<td><code>[]</code></td>
					<td>Tab definitions, rendered in order.</td>
				</tr>
				<tr>
					<td><code>activeTab</code></td>
					<td><code>string</code></td>
					<td><code>tabs[0]?.id</code></td>
					<td>Bindable id of the active tab.</td>
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
	.ltb-demo {
		display: grid;
		gap: 28px;
		padding: 28px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.ltb-demo__row {
		display: grid;
		gap: 10px;
		justify-items: center;
		text-align: center;
	}
	.ltb-demo__row h4 {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.ltb-demo__active {
		margin: 4px 0 0;
		font-size: 12px;
		color: var(--fg-3);
	}
	.ltb-demo__active code {
		font-family: var(--font-mono);
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: var(--r-1);
		color: var(--fg-1);
	}
	.ltb-demo__hint {
		text-align: center;
		font-size: 13px;
		color: var(--fg-2);
		line-height: 1.5;
	}
	.ltb-demo__hint strong {
		color: var(--fg-1);
	}
	.ltb-demo__hint kbd {
		display: inline-block;
		padding: 1px 5px;
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		border-radius: 4px;
		color: var(--fg-1);
	}
</style>
