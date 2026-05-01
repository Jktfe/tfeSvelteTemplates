<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import SpeedDial from '$lib/components/SpeedDial.svelte';
	import type { SpeedDialAction } from '$lib/types';

	const shell = catalogShellPropsForSlug('/speeddial')!;

	let lastAction = $state('');

	const basicActions: SpeedDialAction[] = [
		{ id: 'add', label: 'Add Item', icon: '➕', onclick: () => (lastAction = 'Add Item clicked') },
		{ id: 'edit', label: 'Edit', icon: '✏️', onclick: () => (lastAction = 'Edit clicked') },
		{ id: 'delete', label: 'Delete', icon: '🗑️', onclick: () => (lastAction = 'Delete clicked') }
	];

	const circularActions: SpeedDialAction[] = [
		{ id: 'home', label: 'Home', icon: '🏠', onclick: () => (lastAction = 'Home') },
		{ id: 'search', label: 'Search', icon: '🔍', onclick: () => (lastAction = 'Search') },
		{ id: 'bookmark', label: 'Bookmark', icon: '⭐', onclick: () => (lastAction = 'Bookmark') },
		{ id: 'share', label: 'Share', icon: '🔗', onclick: () => (lastAction = 'Share') },
		{ id: 'settings', label: 'Settings', icon: '⚙️', onclick: () => (lastAction = 'Settings') },
		{ id: 'help', label: 'Help', icon: '❓', onclick: () => (lastAction = 'Help') }
	];

	const codeExplanation =
		'SpeedDial wraps a primary FAB with a list of actions that animate out around it. The type prop chooses the geometry — linear (a row), circle (full 360°), semi-circle (180°), or quarter-circle (90° corner). Each action is staggered by transitionDelay; tooltips auto-position relative to the trigger so labels never collide with screen edges. Press Esc or click outside to close — focus returns to the trigger.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'Animation', 'Zero-deps']}
	{codeExplanation}
>
	{#snippet demo()}
		<div class="sd-demo">
			{#if lastAction}
				<div class="sd-toast" role="status" aria-live="polite">
					<span>Last action:</span> {lastAction}
				</div>
			{/if}

			<div class="sd-section">
				<h4>Linear · four directions</h4>
				<div class="sd-row">
					<div class="sd-stage">
						<SpeedDial actions={basicActions} direction="up" />
						<span class="sd-caption">up</span>
					</div>
					<div class="sd-stage">
						<SpeedDial actions={basicActions} direction="down" />
						<span class="sd-caption">down</span>
					</div>
					<div class="sd-stage">
						<SpeedDial actions={basicActions} direction="left" />
						<span class="sd-caption">left</span>
					</div>
					<div class="sd-stage">
						<SpeedDial actions={basicActions} direction="right" />
						<span class="sd-caption">right</span>
					</div>
				</div>
			</div>

			<div class="sd-section">
				<h4>Circle · 360° fan-out</h4>
				<div class="sd-row">
					<div class="sd-stage sd-stage--lg">
						<SpeedDial actions={circularActions} type="circle" direction="up" radius={90} />
						<span class="sd-caption">type="circle"</span>
					</div>
				</div>
			</div>

			<div class="sd-section">
				<h4>Semi-circle · 180° edge fan</h4>
				<div class="sd-row">
					<div class="sd-stage sd-stage--md">
						<SpeedDial actions={circularActions.slice(0, 5)} type="semi-circle" direction="up" radius={80} />
						<span class="sd-caption">up</span>
					</div>
					<div class="sd-stage sd-stage--md">
						<SpeedDial actions={circularActions.slice(0, 5)} type="semi-circle" direction="left" radius={80} />
						<span class="sd-caption">left</span>
					</div>
				</div>
			</div>

			<div class="sd-section">
				<h4>With modal mask</h4>
				<div class="sd-row">
					<div class="sd-stage">
						<SpeedDial actions={basicActions} direction="up" mask={true} />
						<span class="sd-caption">mask=true</span>
					</div>
				</div>
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
					<td><code>actions</code></td>
					<td><code>SpeedDialAction[]</code></td>
					<td><code>[]</code></td>
					<td>Action items shown when the dial opens.</td>
				</tr>
				<tr>
					<td><code>direction</code></td>
					<td><code>'up' | 'down' | 'left' | 'right'</code></td>
					<td><code>'up'</code></td>
					<td>Linear direction or start angle for circular layouts.</td>
				</tr>
				<tr>
					<td><code>type</code></td>
					<td><code>'linear' | 'circle' | 'semi-circle' | 'quarter-circle'</code></td>
					<td><code>'linear'</code></td>
					<td>Layout geometry of the action items.</td>
				</tr>
				<tr>
					<td><code>radius</code></td>
					<td><code>number</code></td>
					<td><code>80</code></td>
					<td>Distance in px from centre for circular layouts.</td>
				</tr>
				<tr>
					<td><code>transitionDelay</code></td>
					<td><code>number</code></td>
					<td><code>30</code></td>
					<td>Stagger between item animations (ms).</td>
				</tr>
				<tr>
					<td><code>showTooltip</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Show label tooltips on hover/focus.</td>
				</tr>
				<tr>
					<td><code>tooltipPosition</code></td>
					<td><code>'auto' | 'left' | 'right' | 'top' | 'bottom'</code></td>
					<td><code>'auto'</code></td>
					<td>Tooltip placement relative to each action.</td>
				</tr>
				<tr>
					<td><code>mask</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Show a modal backdrop when open.</td>
				</tr>
				<tr>
					<td><code>disabled</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Disable the entire dial.</td>
				</tr>
				<tr>
					<td><code>buttonIcon</code></td>
					<td><code>string</code></td>
					<td><code>'+' SVG</code></td>
					<td>Custom emoji, HTML, or SVG for the trigger.</td>
				</tr>
				<tr>
					<td><code>buttonLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Open menu'</code></td>
					<td>Accessible label for the trigger.</td>
				</tr>
				<tr>
					<td><code>isOpen</code></td>
					<td><code>boolean</code></td>
					<td><code>false</code></td>
					<td>Bindable open/closed state.</td>
				</tr>
				<tr>
					<td><code>class</code></td>
					<td><code>string</code></td>
					<td><code>''</code></td>
					<td>Extra CSS class on the container.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sd-demo {
		display: grid;
		gap: 28px;
	}
	.sd-section h4 {
		margin: 0 0 12px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sd-row {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		justify-content: center;
		align-items: center;
		padding: 28px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sd-stage {
		position: relative;
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.sd-stage--md {
		width: 220px;
		height: 220px;
	}
	.sd-stage--lg {
		width: 260px;
		height: 260px;
	}
	.sd-caption {
		position: absolute;
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.06em;
		color: var(--fg-3);
	}
	.sd-toast {
		padding: 10px 14px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
		font-size: 13px;
		color: var(--fg-1);
	}
	.sd-toast span {
		color: var(--fg-3);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-right: 6px;
	}
</style>
