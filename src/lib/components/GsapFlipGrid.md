---
title: GsapFlipGrid
description: CSS Grid layout-transition primitive powered by GSAP Flip.
category: Motion Primitives
author: TFE
---

# GsapFlipGrid

`GsapFlipGrid` is the non-deck alternative to `CardStack`: use it when the content is a real grid, gallery, component directory, or catalogue and the user needs filtering, sorting, or promotion without layout jumps.

## Usage

```svelte
<script lang="ts">
	import GsapFlipGrid, { type GsapFlipGridItem } from '$lib/components/GsapFlipGrid.svelte';

	const items: GsapFlipGridItem[] = [
		{
			id: 'split-text',
			title: 'SplitText Hero',
			description: 'Character, word, or line reveal for display copy.',
			filter: 'hero',
			category: 'Hero',
			accent: '#ff6a3d'
		}
	];
</script>

<GsapFlipGrid
	{items}
	filters={[{ id: 'hero', label: 'Hero' }]}
	initialFeaturedId="split-text"
/>
```

## Success Points

- Uses GSAP Flip for real CSS Grid position changes instead of absolute-card illusions.
- Keeps all GSAP loading client-only via `$lib/gsap/context`.
- Supports reduced motion by applying the state change without animation.
- Works in light and dark mode through `gsap-tokens.css`.
- Uses links for navigable catalog cards and buttons for filter/sort/density controls.

## Tests

- `normalizeFlipGridItems` drops untitled rows and creates stable fallback IDs.
- `filterFlipGridItems` accepts explicit `filter`, display `category`, or `tags`.
- `orderFlipGridItems` keeps the promoted card first after sorting.
- Browser audit should cover `/gsap-suite` and the homepage at desktop and mobile in light and dark mode.

## Provenance

Inspired by the GreenSock "Animate CSS Grid Positions" demo. The implementation follows the documented GSAP Flip pattern: capture state, mutate DOM/layout, then animate from the captured state.
