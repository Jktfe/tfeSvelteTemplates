<!--
  ============================================================
  Accordion — Collapsible content sections
  ============================================================

  WHAT IT DOES
  A stack of expandable panels — click a header to reveal or hide its
  content. Use it for FAQs, settings groups, "what's in the box" lists,
  or anywhere dense info would overwhelm the page if shown all at once.

  FEATURES
  - Single (default) or multiple-open mode
  - Optional "always one open" rule (preventCollapseLast) for settings UIs
  - defaultOpen: initial expanded items by id
  - Smooth expand/collapse via grid-template-rows 0fr↔1fr (no max-height jank,
    works for any content height with zero JS measurement)
  - Chevron rotates 180° on open
  - Two sizes (sm / md) and optional bordered variant
  - Honours prefers-reduced-motion (no transitions)
  - Pure Svelte 5 runes, zero dependencies

  ACCESSIBILITY
  - Each header is a real <button> with aria-expanded and aria-controls
  - Each panel is role="region" with aria-labelledby pointing to its header
  - Keyboard: Tab to header, Enter or Space toggles (browser handles natively)
  - Disabled items use the disabled attribute (not aria-disabled)
  - Chevron icons are decorative (aria-hidden)

  USAGE
  Single (default) — FAQ-style:
      <Accordion items={faqs} />

  Multiple open at once:
      <Accordion items={faqs} multiple />

  Always-one-open (settings panel pattern):
      <Accordion items={settings} preventCollapseLast defaultOpen={['general']} />

  PROPS
  | Prop                | Type                                  | Default      | Description |
  |---------------------|---------------------------------------|--------------|-------------|
  | items               | { id, title, content, disabled? }[]   | required     | Panels to render |
  | multiple            | boolean                               | false        | Allow multiple open at once |
  | defaultOpen         | string[]                              | []           | Initially open item ids |
  | preventCollapseLast | boolean                               | false        | In single mode, prevent closing the last open panel |
  | size                | 'sm' \| 'md'                          | 'md'         | Header padding + font scale |
  | bordered            | boolean                               | true         | Show borders around each item |
  | ariaLabel           | string                                | 'Accordion'  | aria-label on the wrapper |
  | onToggle            | (id, isOpen) => void                  | —            | Fires after a header is clicked |
  | class               | string                                | ''           | Extra classes on the wrapper |
  ============================================================
-->

<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	export type AccordionItem = {
		id: string;
		title: string;
		content: string;
		disabled?: boolean;
	};

	export type AccordionSize = 'sm' | 'md';

	interface Props {
		items: AccordionItem[];
		multiple?: boolean;
		defaultOpen?: string[];
		preventCollapseLast?: boolean;
		size?: AccordionSize;
		bordered?: boolean;
		ariaLabel?: string;
		onToggle?: (id: string, isOpen: boolean) => void;
		class?: string;
	}

	let {
		items,
		multiple = false,
		defaultOpen = [],
		preventCollapseLast = false,
		size = 'md',
		bordered = true,
		ariaLabel = 'Accordion',
		onToggle,
		class: extraClass = ''
	}: Props = $props();

	// SvelteSet gives O(1) has/add/delete and is reactive — Svelte 5
	// tracks reads/writes for fine-grained updates without full reassignment.
	// untrack: defaultOpen seeds initial state only; user clicks own state after that.
	const openIds = new SvelteSet<string>(untrack(() => defaultOpen));

	function isOpen(id: string): boolean {
		return openIds.has(id);
	}

	function toggle(id: string): void {
		const item = items.find((i) => i.id === id);
		if (item?.disabled) return;

		const wasOpen = openIds.has(id);

		if (wasOpen) {
			// In single mode with preventCollapseLast, the last open stays open
			if (!multiple && preventCollapseLast && openIds.size === 1) return;
			openIds.delete(id);
		} else {
			// Single mode: close everything else first
			if (!multiple) openIds.clear();
			openIds.add(id);
		}

		onToggle?.(id, !wasOpen);
	}
</script>

<div
	class="accordion accordion-{size} {bordered ? 'accordion-bordered' : ''} {extraClass}"
	aria-label={ariaLabel}
>
	{#each items as item (item.id)}
		{@const open = isOpen(item.id)}
		<div class="accordion-item" class:open class:disabled={item.disabled}>
			<h3 class="accordion-heading">
				<button
					type="button"
					class="accordion-trigger"
					aria-expanded={open}
					aria-controls={`panel-${item.id}`}
					id={`trigger-${item.id}`}
					disabled={item.disabled}
					onclick={() => toggle(item.id)}
				>
					<span class="accordion-title">{item.title}</span>
					<svg
						class="accordion-chevron"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M4 6L8 10L12 6"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</h3>
			<div
				class="accordion-panel"
				role="region"
				id={`panel-${item.id}`}
				aria-labelledby={`trigger-${item.id}`}
				aria-hidden={!open}
			>
				<div class="accordion-content">
					{item.content}
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.accordion {
		display: flex;
		flex-direction: column;
		font-family: inherit;
	}

	.accordion-item {
		background: #ffffff;
	}

	.accordion-bordered .accordion-item {
		border: 1px solid #e5e7eb;
		border-bottom-width: 0;
	}

	.accordion-bordered .accordion-item:first-child {
		border-top-left-radius: 0.5rem;
		border-top-right-radius: 0.5rem;
	}

	.accordion-bordered .accordion-item:last-child {
		border-bottom-width: 1px;
		border-bottom-left-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
	}

	.accordion-heading {
		margin: 0;
		font: inherit;
		font-weight: inherit;
	}

	.accordion-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: transparent;
		border: 0;
		font: inherit;
		font-weight: 500;
		color: #111827;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.accordion-sm .accordion-trigger {
		padding: 0.625rem 0.875rem;
		font-size: 0.875rem;
	}

	.accordion-trigger:hover:not(:disabled) {
		background: #f9fafb;
	}

	.accordion-trigger:focus-visible {
		outline: 2px solid #146ef5;
		outline-offset: -2px;
	}

	.accordion-trigger:disabled {
		cursor: not-allowed;
		color: #9ca3af;
	}

	.accordion-title {
		flex: 1;
		min-width: 0;
	}

	.accordion-chevron {
		flex-shrink: 0;
		color: #6b7280;
		transition: transform 0.2s ease;
	}

	.accordion-item.open .accordion-chevron {
		transform: rotate(180deg);
	}

	/*
	  The clever bit: grid-template-rows + min-height: 0 lets us animate
	  from height 0 to "auto" without measuring anything in JS. The browser
	  interpolates the implicit row height for free, so this works for any
	  content size — short paragraphs, long lists, nested components.
	*/
	.accordion-panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.2s ease;
	}

	.accordion-item.open .accordion-panel {
		grid-template-rows: 1fr;
	}

	.accordion-content {
		min-height: 0;
		overflow: hidden;
		padding: 0 1rem 0.875rem 1rem;
		color: #4b5563;
		line-height: 1.6;
	}

	.accordion-sm .accordion-content {
		padding: 0 0.875rem 0.625rem 0.875rem;
		font-size: 0.875rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.accordion-panel,
		.accordion-chevron,
		.accordion-trigger {
			transition: none;
		}
	}
</style>
