<!--
  ===========================================================
  StaggeredMenu
  ===========================================================
  WHAT — A navigation list whose links cascade in one after another
         every time the menu opens.
  WHY  — Reach for it when a menu appears on demand (mobile nav,
         dropdown panels, sidebars) and you want the reveal to feel
         deliberate rather than a sudden pop.

  FEATURES
  • Per-item stagger driven by a single CSS custom property
  • Replays on every open — items remount inside {#if isOpen}
  • Horizontal, vertical, or responsive ('auto') layouts
  • Active link highlight with aria-current="page"
  • Optional emoji / glyph icon per item
  • Bindable isOpen for external toggles
  • Light + dark chrome via CSS custom properties

  ACCESSIBILITY
  • <nav> landmark with a configurable aria-label
  • Real <a href> links — Tab / Shift+Tab / Enter work natively
  • Visible :focus-visible ring on every link
  • Icons are aria-hidden so screen readers read the label once
  • prefers-reduced-motion: items appear instantly, no slide

  DEPENDENCIES
  Zero. Pure CSS keyframes — no Svelte transitions or JS timers.

  PERFORMANCE
  Only transform + opacity animate, so the cascade runs on the
  compositor. Each item costs one keyframe run on open; nothing
  ticks while the menu sits idle.

  USAGE
  <script lang="ts">
    import StaggeredMenu from '$lib/components/StaggeredMenu.svelte';
    let open = $state(true);
    const items = [
      { href: '/', label: 'Home', active: true },
      { href: '/about', label: 'About' }
    ];
  </script>
  <StaggeredMenu {items} bind:isOpen={open} />

  PROPS
  | Prop        | Type                                  | Default           | Description                         |
  |-------------|---------------------------------------|-------------------|-------------------------------------|
  | items       | MenuItem[]                            | required          | Links to render                     |
  | isOpen      | boolean (bindable)                    | true              | Whether the list is mounted         |
  | staggerMs   | number                                | 50                | Delay between each item (ms)        |
  | durationMs  | number                                | 300               | Length of each item's entrance (ms) |
  | orientation | 'auto' | 'horizontal' | 'vertical'    | 'auto'            | Layout; auto stacks below 769px     |
  | ariaLabel   | string                                | 'Main navigation' | Accessible name of the <nav>        |
  | id          | string                                | undefined         | id on <nav> (for aria-controls)     |
  | class       | string                                | ''                | Extra classes on the <nav>          |
  ===========================================================
-->
<script lang="ts">
	import type { StaggeredMenuProps } from '$lib/types';

	let {
		items,
		isOpen = $bindable(true),
		staggerMs = 50,
		durationMs = 300,
		orientation = 'auto',
		ariaLabel = 'Main navigation',
		id,
		class: className = ''
	}: StaggeredMenuProps = $props();

	// Negative or NaN timings would make the keyframes behave oddly (a
	// negative delay skips part of the animation), so clamp at the edge.
	const safeStagger = $derived(Number.isFinite(staggerMs) ? Math.max(0, staggerMs) : 50);
	const safeDuration = $derived(Number.isFinite(durationMs) ? Math.max(0, durationMs) : 300);
</script>

<nav
	{id}
	class="staggered-menu staggered-menu--{orientation} {className}"
	aria-label={ariaLabel}
	style:--staggered-menu-duration="{safeDuration}ms"
>
	{#if isOpen}
		<ul class="menu-list">
			{#each items as item, index (item.href)}
				<!-- The delay lives on each <li> so the cascade is pure CSS: the
				     browser schedules every item up-front and nothing re-renders. -->
				<li class="menu-item" style:--stagger-delay="{index * safeStagger}ms">
					<a
						href={item.href}
						class="menu-link"
						class:active={item.active}
						aria-current={item.active ? 'page' : undefined}
					>
						{#if item.icon}
							<span class="menu-icon" aria-hidden="true">{item.icon}</span>
						{/if}
						<span class="menu-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.staggered-menu {
		/* Chrome tokens flip for dark mode; the accent is brand and stays put. */
		--staggered-menu-fg: #4a5568;
		--staggered-menu-hover-bg: rgba(20, 110, 245, 0.06);
		--staggered-menu-accent: #146ef5;
		--staggered-menu-accent-2: #667eea;
		width: 100%;
	}

	@media (prefers-color-scheme: dark) {
		.staggered-menu {
			--staggered-menu-fg: #cbd5e1;
			--staggered-menu-hover-bg: rgba(96, 165, 250, 0.12);
		}
	}

	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.menu-item {
		opacity: 0;
		animation: staggered-menu-in var(--staggered-menu-duration, 300ms) ease-out forwards;
		animation-delay: var(--stagger-delay, 0ms);
	}

	@keyframes staggered-menu-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.menu-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		text-decoration: none;
		color: var(--staggered-menu-fg);
		font-weight: 500;
		font-size: 0.95rem;
		border-radius: 0.5rem;
		transition:
			color 0.2s ease,
			background-color 0.2s ease,
			transform 0.2s ease;
		position: relative;
	}

	.menu-link:hover {
		color: var(--staggered-menu-accent);
		background-color: var(--staggered-menu-hover-bg);
		transform: translateY(-1px);
	}

	.menu-link:focus-visible {
		outline: 2px solid var(--staggered-menu-accent);
		outline-offset: 2px;
	}

	.menu-link.active {
		color: var(--staggered-menu-accent);
		font-weight: 600;
	}

	.menu-link.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 1.25rem;
		right: 1.25rem;
		height: 2px;
		background: linear-gradient(90deg, var(--staggered-menu-accent), var(--staggered-menu-accent-2));
		border-radius: 2px;
	}

	.menu-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.menu-label {
		line-height: 1;
	}

	/* Explicit orientations ignore the viewport entirely. */
	.staggered-menu--horizontal .menu-list {
		flex-direction: row;
		flex-wrap: wrap;
	}

	.staggered-menu--vertical .menu-list {
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
	}

	/* 'auto' keeps the original behaviour: a row on desktop, a stack on mobile. */
	@media (max-width: 768px) {
		.staggered-menu--auto .menu-list {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.staggered-menu--auto .menu-link {
			padding: 1rem 1.5rem;
		}
	}

	/* Motion is decoration here — the links must be usable without it. */
	@media (prefers-reduced-motion: reduce) {
		.menu-item {
			animation: none;
			opacity: 1;
			transform: none;
		}

		.menu-link,
		.menu-link:hover {
			transition: none;
			transform: none;
		}
	}
</style>
