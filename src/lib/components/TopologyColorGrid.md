---
title: TopologyColorGrid
category: Ambient Surfaces
---

# TopologyColorGrid

Full-bleed 3D colour-system scene inspired by Aura's Interactive 3D Topology Color Grid:
https://www.aura.build/component/95909

The TFE version uses Svelte state, client-only Three.js wireframe rendering, GSAP entry
reveals, keyboard-focusable colour cards, a reduced-motion fallback, and explicit
light/dark themes.

```svelte
<TopologyColorGrid
	title="Chromatic Substrate Topology"
	subtitle="Spatial Z-Index Mapping"
	extruded={true}
	theme="light"
/>
```

## Multiple instances

The `<section>` is labelled by its `<h1>` through `aria-labelledby`. The heading id is built
from `$props.id()`, so several grids can share a page (the demo route mounts four) without
duplicate ids — each section always points at its own title.
