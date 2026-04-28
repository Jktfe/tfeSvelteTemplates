<script lang="ts">
	/*
	 * Divider
	 *
	 * Structural section separator. Two render paths:
	 *
	 *   1. No label, horizontal — plain native <hr>. Browsers expose
	 *      role="separator" for free; screen readers announce "separator".
	 *
	 *   2. With label OR vertical — <div role="separator"> wrapping spans.
	 *      Two flanking spans (flex: 1) frame an optional centre label;
	 *      vertical mode uses border-left on a self-stretching div.
	 *
	 * Decorative dividers (purely visual, no semantic value) can pass
	 * decorative={true} to add aria-hidden — the separator is then
	 * skipped entirely by assistive tech.
	 */

	type Orientation = 'horizontal' | 'vertical';
	type Thickness = 'thin' | 'medium' | 'thick';
	type LineStyle = 'solid' | 'dashed' | 'dotted';
	type LabelPos = 'left' | 'center' | 'right';

	type Props = {
		orientation?: Orientation;
		thickness?: Thickness;
		lineStyle?: LineStyle;
		label?: string;
		labelPosition?: LabelPos;
		colour?: string;
		decorative?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	};

	let {
		orientation = 'horizontal',
		thickness = 'thin',
		lineStyle = 'solid',
		label = '',
		labelPosition = 'center',
		colour,
		decorative = false,
		class: className = '',
		children
	}: Props = $props();

	const hasLabel = $derived(Boolean(label || children));
	const customStyle = $derived(colour ? `--divider-colour: ${colour};` : '');
</script>

{#if orientation === 'horizontal' && !hasLabel}
	<hr
		class="divider divider-h divider-{thickness} divider-{lineStyle} {className}"
		style={customStyle}
		aria-hidden={decorative || undefined}
	/>
{:else if orientation === 'horizontal'}
	<div
		class="divider divider-h divider-with-label divider-label-{labelPosition} {className}"
		role={decorative ? undefined : 'separator'}
		aria-hidden={decorative || undefined}
		style={customStyle}
	>
		<span class="divider-line divider-{thickness} divider-{lineStyle} divider-line-start"></span>
		<span class="divider-label">
			{#if children}{@render children()}{:else}{label}{/if}
		</span>
		<span class="divider-line divider-{thickness} divider-{lineStyle} divider-line-end"></span>
	</div>
{:else}
	<div
		class="divider divider-v divider-{thickness} divider-{lineStyle} {className}"
		role={decorative ? undefined : 'separator'}
		aria-orientation="vertical"
		aria-hidden={decorative || undefined}
		style={customStyle}
	></div>
{/if}

<style>
	:global(:root) {
		--divider-colour: #e2e8f0;
	}

	/* Plain horizontal <hr> */
	hr.divider {
		border: 0;
		margin: 0;
		width: 100%;
		background-color: transparent;
	}

	hr.divider-thin {
		border-top: 1px solid var(--divider-colour);
	}
	hr.divider-medium {
		border-top: 2px solid var(--divider-colour);
	}
	hr.divider-thick {
		border-top: 4px solid var(--divider-colour);
	}

	hr.divider-dashed {
		border-top-style: dashed;
	}
	hr.divider-dotted {
		border-top-style: dotted;
	}

	/* Horizontal with label */
	.divider-with-label {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		width: 100%;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.divider-line {
		flex: 1;
		min-width: 0;
		display: block;
	}

	.divider-line.divider-thin {
		border-top: 1px solid var(--divider-colour);
	}
	.divider-line.divider-medium {
		border-top: 2px solid var(--divider-colour);
	}
	.divider-line.divider-thick {
		border-top: 4px solid var(--divider-colour);
	}

	.divider-line.divider-dashed {
		border-top-style: dashed;
	}
	.divider-line.divider-dotted {
		border-top-style: dotted;
	}

	.divider-label {
		flex-shrink: 0;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #475569;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* Label alignment — adjust line widths */
	.divider-label-left .divider-line-start {
		flex: 0 0 1.5rem;
	}
	.divider-label-right .divider-line-end {
		flex: 0 0 1.5rem;
	}

	/* Vertical */
	.divider-v {
		display: inline-block;
		align-self: stretch;
		min-height: 1rem;
	}

	.divider-v.divider-thin {
		border-left: 1px solid var(--divider-colour);
	}
	.divider-v.divider-medium {
		border-left: 2px solid var(--divider-colour);
	}
	.divider-v.divider-thick {
		border-left: 4px solid var(--divider-colour);
	}

	.divider-v.divider-dashed {
		border-left-style: dashed;
	}
	.divider-v.divider-dotted {
		border-left-style: dotted;
	}
</style>
