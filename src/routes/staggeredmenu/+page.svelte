<script lang="ts">
	import ComponentPageShell from '$lib/components/ComponentPageShell.svelte';
	import { catalogShellPropsForSlug } from '$lib/componentCatalog';
	import StaggeredMenu from '$lib/components/StaggeredMenu.svelte';
	import type { MenuItem } from '$lib/types';

	const shell = catalogShellPropsForSlug('/staggeredmenu')!;

	type Orientation = 'auto' | 'horizontal' | 'vertical';

	// Demo links point at in-page hashes and the click handler below swallows
	// them, so exploring the demo never navigates away from this page.
	const baseItems: Omit<MenuItem, 'active'>[] = [
		{ href: '#home', label: 'Home', icon: '🏠' },
		{ href: '#work', label: 'Work', icon: '💼' },
		{ href: '#journal', label: 'Journal', icon: '📓' },
		{ href: '#about', label: 'About', icon: '👋' },
		{ href: '#contact', label: 'Contact', icon: '✉️' }
	];

	let playgroundOpen = $state(true);
	let staggerMs = $state(50);
	let durationMs = $state(300);
	let orientation = $state<Orientation>('horizontal');
	let showIcons = $state(true);
	let activeHref = $state('#home');
	let replayKey = $state(0);

	let sidebarOpen = $state(true);
	let dropdownOpen = $state(false);

	const orientationOptions: Array<{ id: Orientation; label: string }> = [
		{ id: 'horizontal', label: 'Horizontal' },
		{ id: 'vertical', label: 'Vertical' },
		{ id: 'auto', label: 'Auto (responsive)' }
	];

	function withActive(list: Omit<MenuItem, 'active'>[], icons = true): MenuItem[] {
		return list.map((item) => ({
			...item,
			icon: icons ? item.icon : undefined,
			active: item.href === activeHref
		}));
	}

	const playgroundItems = $derived(withActive(baseItems, showIcons));
	const headerItems = $derived(withActive(baseItems.slice(0, 4), false));
	const sidebarItems = $derived(withActive(baseItems));
	const dropdownItems = $derived(withActive(baseItems.slice(1), true));

	const settleMs = $derived((playgroundItems.length - 1) * staggerMs + durationMs);

	// Event delegation: one listener catches every demo link click, records
	// which one was chosen, and stops the browser following the hash.
	function captureNav(event: MouseEvent) {
		const link = (event.target as HTMLElement | null)?.closest('a');
		if (!link) return;
		event.preventDefault();
		activeHref = link.getAttribute('href') ?? activeHref;
	}

	const codeExplanation =
		'StaggeredMenu renders its links inside {#if isOpen}, so every open remounts the list and replays the cascade. Each <li> gets --stagger-delay = index × staggerMs and a single CSS keyframe animates opacity and transform from there — no JavaScript timers and no Svelte transitions. Under prefers-reduced-motion the keyframe is switched off and the links are simply visible.';
</script>

<svelte:head>
	<title>{shell.item.name} — TFE / Svelte Templates</title>
	<meta name="description" content={shell.item.description} />
</svelte:head>

<ComponentPageShell
	{...shell.props}
	tags={['Svelte 5', 'A11y', 'CSS animation', 'Zero-deps', 'Reduced motion']}
	{codeExplanation}
>
	{#snippet demo()}
		<!-- Clicks and Enter presses on the links both arrive here as click
		     events, so the delegated handler is keyboard-accessible. -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="sm-demo" onclick={captureNav}>
			<section class="sm-section">
				<h4>Playground · one live instance</h4>
				<p class="sm-hint">Tune the timing and layout, then replay or toggle to watch the cascade.</p>

				<div class="sm-controls">
					<div class="sm-control">
						<span class="sm-control__label">Visibility</span>
						<div class="sm-buttons">
							<button
								type="button"
								class="sm-btn"
								class:sm-btn--active={playgroundOpen}
								aria-expanded={playgroundOpen}
								aria-controls="sm-playground-nav"
								onclick={() => (playgroundOpen = !playgroundOpen)}
							>
								{playgroundOpen ? 'Close menu' : 'Open menu'}
							</button>
							<button type="button" class="sm-btn" onclick={() => replayKey++}>Replay</button>
							<button
								type="button"
								class="sm-btn"
								class:sm-btn--active={showIcons}
								aria-pressed={showIcons}
								onclick={() => (showIcons = !showIcons)}
							>
								Icons
							</button>
						</div>
					</div>

					<div class="sm-control">
						<span class="sm-control__label">Orientation</span>
						<div class="sm-buttons">
							{#each orientationOptions as opt (opt.id)}
								<button
									type="button"
									class="sm-btn"
									class:sm-btn--active={orientation === opt.id}
									aria-pressed={orientation === opt.id}
									onclick={() => (orientation = opt.id)}
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>

					<div class="sm-control sm-control--sliders">
						<label class="sm-slider">
							<span class="sm-control__label">Stagger · {staggerMs}ms</span>
							<input type="range" min="0" max="200" step="10" bind:value={staggerMs} />
						</label>
						<label class="sm-slider">
							<span class="sm-control__label">Duration · {durationMs}ms</span>
							<input type="range" min="100" max="900" step="50" bind:value={durationMs} />
						</label>
					</div>
				</div>

				<div class="sm-stage sm-stage--playground">
					{#key replayKey}
						<StaggeredMenu
							id="sm-playground-nav"
							items={playgroundItems}
							bind:isOpen={playgroundOpen}
							{staggerMs}
							{durationMs}
							{orientation}
							ariaLabel="Playground navigation"
						/>
					{/key}
				</div>

				<p class="sm-state" role="status" aria-live="polite">
					Open: <code>{playgroundOpen}</code> · Active: <code>{activeHref}</code> · Settles in
					<code>{settleMs}ms</code>
				</p>
			</section>

			<section class="sm-section">
				<h4>Header bar · text-only row</h4>
				<p class="sm-hint">
					The classic desktop header: horizontal, no icons, the active link underlined.
				</p>
				<div class="sm-stage sm-stage--header">
					<span class="sm-logo">Studio&nbsp;North</span>
					<StaggeredMenu items={headerItems} orientation="horizontal" ariaLabel="Header navigation" />
				</div>
			</section>

			<div class="sm-grid">
				<section class="sm-section">
					<h4>Sidebar · slow vertical cascade</h4>
					<p class="sm-hint">A 90ms stagger reads as a deliberate reveal in a tall panel.</p>
					<div class="sm-stage sm-stage--sidebar">
						<button
							type="button"
							class="sm-btn"
							aria-expanded={sidebarOpen}
							aria-controls="sm-sidebar-nav"
							onclick={() => (sidebarOpen = !sidebarOpen)}
						>
							{sidebarOpen ? 'Collapse' : 'Expand'} sidebar
						</button>
						<StaggeredMenu
							id="sm-sidebar-nav"
							items={sidebarItems}
							bind:isOpen={sidebarOpen}
							orientation="vertical"
							staggerMs={90}
							ariaLabel="Sidebar navigation"
						/>
					</div>
				</section>

				<section class="sm-section">
					<h4>Dropdown · themed accent</h4>
					<p class="sm-hint">
						Starts closed; the accent is overridden with one CSS custom property.
					</p>
					<div class="sm-stage sm-stage--dropdown">
						<button
							type="button"
							class="sm-btn"
							class:sm-btn--active={dropdownOpen}
							aria-expanded={dropdownOpen}
							aria-controls="sm-dropdown-nav"
							onclick={() => (dropdownOpen = !dropdownOpen)}
						>
							Menu {dropdownOpen ? '▴' : '▾'}
						</button>
						<div class="sm-dropdown-panel" class:sm-dropdown-panel--open={dropdownOpen}>
							<StaggeredMenu
								id="sm-dropdown-nav"
								items={dropdownItems}
								bind:isOpen={dropdownOpen}
								orientation="vertical"
								staggerMs={35}
								durationMs={220}
								ariaLabel="Dropdown navigation"
							/>
						</div>
					</div>
				</section>
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
					<td><code>MenuItem[]</code></td>
					<td>required</td>
					<td>Links to render: <code>{'{ href, label, icon?, active? }'}</code>. <code>href</code> must be unique.</td>
				</tr>
				<tr>
					<td><code>isOpen</code></td>
					<td><code>boolean</code></td>
					<td><code>true</code></td>
					<td>Bindable. Unmounts the list when false; reopening replays the cascade.</td>
				</tr>
				<tr>
					<td><code>staggerMs</code></td>
					<td><code>number</code></td>
					<td><code>50</code></td>
					<td>Delay between consecutive items (ms). Negative values clamp to 0.</td>
				</tr>
				<tr>
					<td><code>durationMs</code></td>
					<td><code>number</code></td>
					<td><code>300</code></td>
					<td>Length of each item's entrance (ms).</td>
				</tr>
				<tr>
					<td><code>orientation</code></td>
					<td><code>'auto' | 'horizontal' | 'vertical'</code></td>
					<td><code>'auto'</code></td>
					<td>Layout. <code>auto</code> is a row above 768px and a stack below.</td>
				</tr>
				<tr>
					<td><code>ariaLabel</code></td>
					<td><code>string</code></td>
					<td><code>'Main navigation'</code></td>
					<td>Accessible name for the <code>&lt;nav&gt;</code> landmark.</td>
				</tr>
				<tr>
					<td><code>id</code></td>
					<td><code>string</code></td>
					<td>—</td>
					<td>Set on the <code>&lt;nav&gt;</code> so a toggle can point at it with <code>aria-controls</code>.</td>
				</tr>
			</tbody>
		</table>
	{/snippet}
</ComponentPageShell>

<style>
	.sm-demo {
		display: grid;
		gap: 28px;
	}
	.sm-section h4 {
		margin: 0 0 4px;
		font-family: var(--font-display);
		font-weight: 400;
		font-size: 18px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sm-hint {
		margin: 0 0 12px;
		color: var(--fg-2);
		font-size: 14px;
		line-height: 1.5;
	}
	.sm-controls {
		display: grid;
		gap: 14px;
		padding: 18px 20px;
		margin-bottom: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sm-control {
		display: grid;
		gap: 8px;
	}
	.sm-control--sliders {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}
	.sm-control__label {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
		font-weight: 500;
	}
	.sm-slider {
		display: grid;
		gap: 6px;
	}
	.sm-slider input {
		width: 100%;
		accent-color: var(--accent);
	}
	.sm-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.sm-btn {
		appearance: none;
		border: 1px solid var(--border);
		background: var(--surface);
		padding: 7px 12px;
		border-radius: var(--r-1);
		font-size: 13px;
		cursor: pointer;
		color: var(--fg-1);
		transition:
			border-color var(--dur-fast),
			color var(--dur-fast),
			background var(--dur-fast);
	}
	.sm-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.sm-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.sm-btn--active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--fg-on-dark, #ffffff);
	}
	.sm-btn--active:hover {
		color: var(--fg-on-dark, #ffffff);
	}
	.sm-stage {
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-2);
	}
	.sm-stage--playground {
		min-height: 120px;
		display: flex;
		align-items: center;
	}
	.sm-stage--header {
		display: flex;
		align-items: center;
		gap: 24px;
		flex-wrap: wrap;
	}
	.sm-logo {
		font-family: var(--font-display);
		font-size: 20px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--fg-1);
	}
	.sm-stage--header :global(.staggered-menu) {
		width: auto;
		flex: 1;
	}
	.sm-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 24px;
	}
	.sm-stage--sidebar,
	.sm-stage--dropdown {
		display: grid;
		align-content: start;
		gap: 12px;
		min-height: 340px;
	}
	.sm-stage--sidebar .sm-btn,
	.sm-stage--dropdown .sm-btn {
		justify-self: start;
	}
	.sm-dropdown-panel {
		/* Theming is a single custom property away. */
		--staggered-menu-accent: #db2777;
		--staggered-menu-accent-2: #f472b6;
		--staggered-menu-hover-bg: rgba(219, 39, 119, 0.08);
		padding: 6px;
		border: 1px solid transparent;
		border-radius: var(--r-2);
	}
	.sm-dropdown-panel--open {
		background: var(--surface-2);
		border-color: var(--border);
		box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
	}
	.sm-state {
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--fg-2);
	}
	.sm-state code {
		font-family: var(--font-mono);
		color: var(--fg-1);
	}
</style>
