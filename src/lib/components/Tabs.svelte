<script lang="ts">
	/*
	 * Tabs
	 *
	 * Classic tabbed content switcher with full WAI-ARIA tablist semantics:
	 *
	 *   - <div role="tablist"> wraps a row of <button role="tab">
	 *   - exactly one tab is tabindex=0 at a time (roving tabindex)
	 *   - aria-selected on the active tab; aria-controls -> panel id
	 *   - <div role="tabpanel"> with aria-labelledby pointing back at its tab
	 *   - keyboard: ArrowLeft/Right (or Up/Down vertical) moves focus, wraps;
	 *     Home -> first, End -> last, Enter/Space activates focused tab.
	 *
	 * Theming: dual light / dark. Chrome tokens (--tabs-fg, --tabs-border,
	 * --tabs-tab-fg, --tabs-hover-bg, --tabs-pill-*) flip under
	 * prefers-color-scheme: dark. --tabs-accent (underline + focus ring) is
	 * brand and stays put. See docs/THEMING.md.
	 *
	 * Panels are rendered via the `panel` Snippet which receives the active id,
	 * letting consumers branch on id without coupling to a panels prop shape.
	 */

	type Orientation = 'horizontal' | 'vertical';
	type Variant = 'underline' | 'pill';

	export type TabItem = {
		id: string;
		label: string;
		icon?: string;
		disabled?: boolean;
	};

	type Props = {
		tabs: TabItem[];
		active?: string;
		orientation?: Orientation;
		variant?: Variant;
		ariaLabel?: string;
		class?: string;
		panel?: import('svelte').Snippet<[string]>;
	};

	let {
		tabs,
		active = $bindable(tabs[0]?.id ?? ''),
		orientation = 'horizontal',
		variant = 'underline',
		ariaLabel = 'Tabs',
		class: className = '',
		panel
	}: Props = $props();

	let buttons: HTMLButtonElement[] = $state([]);

	function indexOfId(id: string) {
		return tabs.findIndex((t) => t.id === id);
	}

	function focusTab(idx: number) {
		const total = tabs.length;
		if (total === 0) return;
		let i = ((idx % total) + total) % total;
		let tries = 0;
		while (tabs[i].disabled && tries < total) {
			i = (i + 1) % total;
			tries += 1;
		}
		buttons[i]?.focus();
	}

	function activate(id: string) {
		const t = tabs.find((x) => x.id === id);
		if (!t || t.disabled) return;
		active = id;
	}

	function onKeydown(e: KeyboardEvent) {
		const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
		const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
		const current = indexOfId(active);
		if (e.key === next) {
			e.preventDefault();
			focusTab(current + 1);
		} else if (e.key === prev) {
			e.preventDefault();
			focusTab(current - 1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			focusTab(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			focusTab(tabs.length - 1);
		} else if (e.key === 'Enter' || e.key === ' ') {
			const focused = document.activeElement as HTMLElement | null;
			if (focused && buttons.includes(focused as HTMLButtonElement)) {
				e.preventDefault();
				const idx = buttons.indexOf(focused as HTMLButtonElement);
				if (idx >= 0) activate(tabs[idx].id);
			}
		}
	}
</script>

<div class="tabs tabs-{orientation} tabs-{variant} {className}">
	<div
		class="tablist"
		role="tablist"
		aria-label={ariaLabel}
		aria-orientation={orientation}
		tabindex={-1}
		onkeydown={onKeydown}
	>
		{#each tabs as tab, i (tab.id)}
			<button
				bind:this={buttons[i]}
				type="button"
				role="tab"
				id="tab-{tab.id}"
				class="tab"
				class:active={tab.id === active}
				aria-selected={tab.id === active}
				aria-controls="panel-{tab.id}"
				tabindex={tab.id === active ? 0 : -1}
				disabled={tab.disabled}
				onclick={() => activate(tab.id)}
			>
				{#if tab.icon}<span class="icon" aria-hidden="true">{tab.icon}</span>{/if}
				<span class="label">{tab.label}</span>
			</button>
		{/each}
	</div>
	<div
		class="panel"
		role="tabpanel"
		id="panel-{active}"
		aria-labelledby="tab-{active}"
		tabindex="0"
	>
		{#if panel}{@render panel(active)}{/if}
	</div>
</div>

<style>
	/* Theme tokens — light defaults; chrome flips in the dark block at the
	   end of this stylesheet. See docs/THEMING.md. */
	.tabs {
		--tabs-fg: #0f172a;
		--tabs-border: #e2e8f0;
		--tabs-tab-fg: #475569;
		--tabs-hover-bg: #f8fafc;
		--tabs-pill-track: #f1f5f9;
		--tabs-pill-active-bg: #fff;
		--tabs-accent: #2563eb;
	}

	.tabs {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: var(--tabs-fg);
	}

	.tabs-vertical {
		display: flex;
		gap: 1.25rem;
	}

	.tablist {
		display: flex;
		align-items: stretch;
		gap: 0.25rem;
	}

	.tabs-horizontal.tabs-underline .tablist {
		border-bottom: 1px solid var(--tabs-border);
	}

	.tabs-vertical .tablist {
		flex-direction: column;
		border-right: 1px solid var(--tabs-border);
		min-width: 10rem;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.625rem 0.875rem;
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--tabs-tab-fg);
		background: transparent;
		border: 0;
		cursor: pointer;
		border-radius: 0.375rem;
		transition:
			color 120ms ease,
			background-color 120ms ease;
		position: relative;
	}

	.tab .icon {
		font-size: 1rem;
		line-height: 1;
	}

	.tab:hover:not(:disabled):not(.active) {
		color: var(--tabs-fg);
		background: var(--tabs-hover-bg);
	}

	.tab:focus-visible {
		outline: 2px solid var(--tabs-accent);
		outline-offset: 2px;
	}

	.tab:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* Underline variant — animated underline under active tab */
	.tabs-underline .tab {
		border-radius: 0;
	}

	.tabs-horizontal.tabs-underline .tab {
		margin-bottom: -1px;
		border-bottom: 2px solid transparent;
	}

	.tabs-horizontal.tabs-underline .tab.active {
		color: var(--tabs-fg);
		border-bottom-color: var(--tabs-accent);
	}

	.tabs-vertical.tabs-underline .tab {
		margin-right: -1px;
		border-right: 2px solid transparent;
		justify-content: flex-start;
	}

	.tabs-vertical.tabs-underline .tab.active {
		color: var(--tabs-fg);
		border-right-color: var(--tabs-accent);
	}

	/* Pill variant — rounded background on active */
	.tabs-pill .tablist {
		gap: 0.375rem;
		padding: 0.25rem;
		background: var(--tabs-pill-track);
		border-radius: 0.625rem;
		display: inline-flex;
	}

	.tabs-pill.tabs-vertical .tablist {
		flex-direction: column;
		border-right: 0;
		min-width: 0;
	}

	.tabs-pill .tab {
		border-radius: 0.5rem;
		padding: 0.5rem 0.875rem;
	}

	.tabs-pill .tab.active {
		background: var(--tabs-pill-active-bg);
		color: var(--tabs-fg);
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
	}

	@media (prefers-reduced-motion: reduce) {
		.tab {
			transition: none;
		}
	}

	/* Panel */
	.panel {
		padding: 1rem 0;
	}

	.tabs-vertical .panel {
		flex: 1;
		min-width: 0;
		padding: 0;
	}

	.panel:focus-visible {
		outline: 2px solid var(--tabs-accent);
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	/*
	 * Dark scheme — chrome only. --tabs-accent is brand and is not flipped;
	 * blue-600 keeps enough contrast against a dark surface for the underline
	 * and focus ring.
	 */
	@media (prefers-color-scheme: dark) {
		.tabs {
			--tabs-fg: #f1f5f9;
			--tabs-border: #334155;
			--tabs-tab-fg: #94a3b8;
			--tabs-hover-bg: #273449;
			--tabs-pill-track: #1e293b;
			--tabs-pill-active-bg: #334155;
		}
		.tabs-pill .tab.active {
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
		}
	}
</style>
