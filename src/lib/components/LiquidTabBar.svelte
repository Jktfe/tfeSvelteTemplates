<!--
  ============================================================
  LiquidTabBar - Gooey Active-Tab Indicator
  ============================================================

  🎯 WHAT IT DOES
  A pill-style tab bar where the active indicator "melts" between tabs using
  an inline SVG gooey filter. The pill morphs as it travels — so picking a
  tab feels organic rather than mechanical.

  ✨ FEATURES
  • Inline SVG gooey filter (zero external assets)
  • CSS-transform-only motion (no layout thrashing)
  • Bindable activeTab so parents can read/write the selection
  • Pure Svelte 5 runes, no animation libs

  ♿ ACCESSIBILITY
  • Container uses role="tablist"; each button uses role="tab"
  • Keyboard: ←/→ cycle tabs (wraps), Home/End jump to first/last
  • aria-selected reflects the active tab so screen readers track focus
  • Respects prefers-reduced-motion (snaps the pill instead of gliding)

  📦 DEPENDENCIES
  Zero external dependencies (Svelte 5 + Tailwind utility classes only)

  ⚡ PERFORMANCE
  • Pill position computed from offsetWidth/offsetLeft after render
  • Single transform animation per change — cheap on the GPU

  🎨 USAGE
  <script lang="ts">
    import LiquidTabBar from '$lib/components/LiquidTabBar.svelte';
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'settings', label: 'Settings' }
    ];
    let activeTab = $state('overview');
  </script>
  <LiquidTabBar {tabs} bind:activeTab />

  📋 PROPS
  | Prop      | Type                                | Default          | Description |
  |-----------|-------------------------------------|------------------|-------------|
  | tabs      | Array<{ id: string; label: string }>| []               | Tabs to render, in order |
  | activeTab | string (bindable)                   | first tab id     | Currently selected tab id |
  | class     | string                              | ''               | Extra classes for the container |

  ============================================================
-->

<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		class?: string;
	}

	let {
		tabs = [],
		activeTab = $bindable(tabs[0]?.id ?? ''),
		class: className = ''
	}: Props = $props();

	// Each entry corresponds to the tab at the same index. `bind:this` populates them.
	let tabEls = $state<(HTMLButtonElement | null)[]>([]);
	let pillWidth = $state(0);
	let pillOffset = $state(0);
	let prefersReducedMotion = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;
		const handler = (e: MediaQueryListEvent) => (prefersReducedMotion = e.matches);
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	// When activeTab or layout changes, recompute pill geometry.
	$effect(() => {
		const activeIndex = tabs.findIndex((t) => t.id === activeTab);
		const el = tabEls[activeIndex];
		if (el) {
			pillWidth = el.offsetWidth;
			pillOffset = el.offsetLeft;
		}
	});

	function focusTab(index: number) {
		const wrapped = ((index % tabs.length) + tabs.length) % tabs.length;
		const target = tabs[wrapped];
		if (!target) return;
		activeTab = target.id;
		tabEls[wrapped]?.focus();
	}

	function handleKeydown(event: KeyboardEvent, currentIndex: number) {
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				focusTab(currentIndex + 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				focusTab(currentIndex - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusTab(0);
				break;
			case 'End':
				event.preventDefault();
				focusTab(tabs.length - 1);
				break;
		}
	}
</script>

<div
	role="tablist"
	aria-label="Tabs"
	class={cn('relative inline-flex items-center rounded-full bg-neutral-900 p-2', className)}
>
	<!--
		Inline SVG filter so the component travels without external assets.
		The colour matrix sharpens the blurred pill back into a hard shape so
		the edges look glossy instead of fuzzy.
	-->
	<svg width="0" height="0" class="absolute pointer-events-none" aria-hidden="true">
		<defs>
			<filter id="gooey-filter">
				<feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="
						1 0 0 0 0
						0 1 0 0 0
						0 0 1 0 0
						0 0 0 18 -7"
					result="gooey"
				/>
				<feComposite in="SourceGraphic" in2="gooey" operator="atop" />
			</filter>
		</defs>
	</svg>

	<!-- The moving pill lives inside the gooey-filtered layer so its motion looks fluid. -->
	<div class="absolute inset-0 pointer-events-none" style="filter: url(#gooey-filter);">
		<div
			class={cn(
				'absolute bg-white rounded-full top-2 bottom-2',
				prefersReducedMotion ? 'transition-none' : 'transition-all duration-500'
			)}
			style="width: {pillWidth}px; transform: translateX({pillOffset}px);"
		></div>
	</div>

	{#each tabs as tab, i (tab.id)}
		<button
			bind:this={tabEls[i]}
			type="button"
			role="tab"
			aria-selected={activeTab === tab.id}
			tabindex={activeTab === tab.id ? 0 : -1}
			class={cn(
				'relative z-10 px-4 py-1.5 text-sm font-medium rounded-full',
				prefersReducedMotion ? '' : 'transition-colors duration-300',
				activeTab === tab.id ? 'text-black' : 'text-neutral-400 hover:text-white'
			)}
			onclick={() => (activeTab = tab.id)}
			onkeydown={(event) => handleKeydown(event, i)}
		>
			{tab.label}
		</button>
	{/each}
</div>
